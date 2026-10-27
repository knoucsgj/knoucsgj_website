// Cloudflare Worker entry for KNOU CS Gwangju-Jeonnam student council site.
// - /api*  : JSON API backed by D1 (members, sessions, boards, notices ...)
// - others : static assets (SPA)

import { ensureSchema, defaultCurriculumCourses } from './schema';

// Minimal local typings (no @cloudflare/workers-types dependency).
type D1 = any;
interface Env {
  DB: D1;
  ASSETS: { fetch(req: Request): Promise<Response> };
  ADMIN_PASSWORD?: string; // initial admin password (wrangler secret). Overridden once changed in admin page.
  R2_BUCKET?: any; // Cloudflare R2 bucket binding
}

const MEMBER_COOKIE = 'knoucs_sid';
const ADMIN_COOKIE = 'knoucs_asid';
const MEMBER_TTL = 60 * 60 * 24 * 14; // 14 days
const ADMIN_TTL = 60 * 60 * 8; // 8 hours
const PRIVACY_VERSION = '2026-10-22';
const PBKDF2_ITER = 100000; // Workers max for PBKDF2

const REGIONAL_COLLEGES = [
  '서울', '인천', '경기', '강원', '충북', '대전충남', '세종', '전북', '광주전남',
  '대구', '경북', '부산', '울산', '경남', '제주', '해외',
];

const ADMIN_EMAILS = [
  'knoucsgj@gmail.com',
  'knoucsgj@daum.net',
  'knoucsgj@hanmail.net',
  'knoucsgj@kakao.com',
];

// ---------------------------------------------------------------- utils
const enc = new TextEncoder();
const toHex = (buf: ArrayBuffer | Uint8Array) =>
  [...new Uint8Array(buf as ArrayBuffer)].map((b) => b.toString(16).padStart(2, '0')).join('');
const fromHex = (hex: string) => new Uint8Array((hex.match(/.{2}/g) || []).map((h) => parseInt(h, 16)));
const randomHex = (bytes: number) => toHex(crypto.getRandomValues(new Uint8Array(bytes)));

async function sha256Hex(text: string) {
  return toHex(await crypto.subtle.digest('SHA-256', enc.encode(text)));
}

async function pbkdf2(password: string, salt: Uint8Array) {
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations: PBKDF2_ITER },
    key,
    256
  );
  return toHex(bits);
}

async function hashPassword(password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return { hash: await pbkdf2(password, salt), salt: toHex(salt) };
}

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function verifyPassword(password: string, hash: string, saltHex: string) {
  return safeEqual(await pbkdf2(password, fromHex(saltHex)), hash);
}

class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function json(data: unknown, status = 200, headers?: Headers) {
  const h = headers || new Headers();
  h.set('Content-Type', 'application/json; charset=utf-8');
  h.set('Cache-Control', 'no-store');
  return new Response(JSON.stringify(data), { status, headers: h });
}

function parseCookies(req: Request): Record<string, string> {
  const out: Record<string, string> = {};
  (req.headers.get('Cookie') || '').split(';').forEach((p) => {
    const i = p.indexOf('=');
    if (i > 0) out[p.slice(0, i).trim()] = decodeURIComponent(p.slice(i + 1).trim());
  });
  return out;
}

function cookieHeader(name: string, value: string, maxAge: number) {
  return `${name}=${value}; Path=/; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Lax`;
}

const today = () => new Date().toISOString().split('T')[0];
const nowMinute = () => new Date(Date.now() + 9 * 3600 * 1000).toISOString().replace('T', ' ').substring(0, 16);
const str = (v: unknown, max = 5000) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

// ---------------------------------------------------------------- sessions
interface Member {
  id: string;
  username: string;
  nickname: string;
  name: string;
  phone: string;
  address: string;
  student_no: string;
  regional_college: string;
  department: string;
  role: 'president' | 'officer' | 'regular' | 'associate';
  created_at: string;
}
interface Session {
  member: Member | null;
  admin: boolean;
}

async function createSession(db: D1, kind: 'member' | 'admin', memberId: string | null, ttl: number) {
  const token = randomHex(32);
  await db.prepare('DELETE FROM sessions WHERE expires_at < ?').bind(Date.now()).run();
  await db
    .prepare('INSERT INTO sessions (token_hash, kind, member_id, expires_at) VALUES (?, ?, ?, ?)')
    .bind(await sha256Hex(token), kind, memberId, Date.now() + ttl * 1000)
    .run();
  return token;
}

async function loadSession(req: Request, db: D1): Promise<Session> {
  const cookies = parseCookies(req);
  const session: Session = { member: null, admin: false };
  if (cookies[MEMBER_COOKIE]) {
    const row = await db
      .prepare(
        `SELECT m.id, m.username, m.nickname, m.name, m.phone, m.address, m.student_no,
                m.regional_college, m.department, m.role, m.created_at
           FROM sessions s JOIN members m ON m.id = s.member_id
          WHERE s.token_hash = ? AND s.kind = 'member' AND s.expires_at > ?`
      )
      .bind(await sha256Hex(cookies[MEMBER_COOKIE]), Date.now())
      .first();
    if (row) session.member = row as Member;
  }
  if (cookies[ADMIN_COOKIE]) {
    const row = await db
      .prepare("SELECT 1 AS ok FROM sessions WHERE token_hash = ? AND kind = 'admin' AND expires_at > ?")
      .bind(await sha256Hex(cookies[ADMIN_COOKIE]), Date.now())
      .first();
    session.admin = !!row;
  }
  return session;
}

const requireAdmin = (s: Session) => {
  if (!s.admin) throw new HttpError(401, '최고 관리자(admin) 로그인이 필요합니다.');
};
const requireMember = (s: Session) => {
  if (!s.member) throw new HttpError(401, '회원 로그인이 필요합니다.');
  return s.member;
};
const requireSignedIn = (s: Session): { id: string | null; nickname: string } => {
  if (s.member) return { id: s.member.id, nickname: s.member.nickname };
  if (s.admin) return { id: 'admin', nickname: '관리자' };
  throw new HttpError(401, '회원 로그인이 필요합니다. 회원가입 또는 로그인 후 이용해 주세요.');
};

const isMasterAdmin = (s: Session) => s.admin;
const isPresident = (s: Session) => s.member?.role === 'president';
const isOfficer = (s: Session) => s.member?.role === 'officer';
const isCouncil = (s: Session) => s.admin || isPresident(s) || isOfficer(s);
const isRegularOrAbove = (s: Session) => {
  if (s.member && s.member.role === 'associate') return false; // 준회원은 절대 글쓰기/다운로드 불가
  if (s.admin) return true;
  return !!s.member && (s.member.role === 'regular' || s.member.role === 'officer' || s.member.role === 'president');
};
const canManageMembers = (s: Session) => s.admin || isPresident(s);
const canManageCouncil = (s: Session) => s.admin || isPresident(s) || isOfficer(s);

const requireCouncil = (s: Session) => {
  if (!isCouncil(s)) throw new HttpError(403, '학생회 임원진 또는 관리자만 접근할 수 있습니다.');
};

const requireMemberManager = (s: Session) => {
  if (s.admin || isPresident(s)) return;
  if (isOfficer(s)) throw new HttpError(403, '임원진 등급은 회원 관리 권한이 없습니다.');
  throw new HttpError(403, '학생회장 또는 최고 관리자만 접근할 수 있습니다.');
};

const requireCouncilManager = (s: Session) => {
  if (s.admin || isPresident(s) || isOfficer(s)) return;
  throw new HttpError(403, '학생회 임원진 또는 최고 관리자만 인사말 및 임원진을 관리할 수 있습니다.');
};

const canModify = (s: Session, ownerId: string | null) => {
  if (s.admin) return true; // 최고 관리자는 모든 글 관리 가능
  if (isPresident(s)) return true; // 학생회장은 커뮤니티 전반 관리 가능
  if (s.member && ownerId && s.member.id === ownerId) return true; // 본인 글 수정/삭제 가능
  return false; // 임원진은 타인 글 강제 삭제 불가
};

// Throttle login attempts: max 8 failures / 15 min per key
async function checkThrottle(db: D1, key: string) {
  const row: any = await db.prepare('SELECT count, first_at FROM login_attempts WHERE k = ?').bind(key).first();
  if (row && Date.now() - row.first_at < 15 * 60 * 1000 && row.count >= 8) {
    throw new HttpError(429, '로그인 시도가 너무 많습니다. 15분 후 다시 시도해 주세요.');
  }
}
async function recordFailure(db: D1, key: string) {
  const row: any = await db.prepare('SELECT count, first_at FROM login_attempts WHERE k = ?').bind(key).first();
  if (!row || Date.now() - row.first_at >= 15 * 60 * 1000) {
    await db
      .prepare('INSERT OR REPLACE INTO login_attempts (k, count, first_at) VALUES (?, 1, ?)')
      .bind(key, Date.now())
      .run();
  } else {
    await db.prepare('UPDATE login_attempts SET count = count + 1 WHERE k = ?').bind(key).run();
  }
}
const clearFailures = (db: D1, key: string) => db.prepare('DELETE FROM login_attempts WHERE k = ?').bind(key).run();

// ---------------------------------------------------------------- auth handlers
function validateRegistration(b: any) {
  const username = str(b.username, 80).toLowerCase();
  const password = typeof b.password === 'string' ? b.password : '';
  const nickname = str(b.nickname, 12);
  const name = str(b.name, 30);
  const phone = str(b.phone, 20).replace(/[^0-9]/g, '');
  const address = str(b.address, 200);
  const student_no = str(b.student_no, 20).replace(/[^0-9]/g, '');
  const regional_college = str(b.regional_college, 20);
  const department = str(b.department, 30);

  // Email format validation for username
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(username)) {
    throw new HttpError(400, '아이디는 유효한 이메일 주소(예: user@example.com) 형식이어야 합니다.');
  }
  if (password.length < 8 || password.length > 64 || !/[A-Za-z]/.test(password) || !/[0-9]/.test(password))
    throw new HttpError(400, '비밀번호는 영문과 숫자를 포함하여 8자 이상이어야 합니다.');
  if (password.toLowerCase().includes(username.split('@')[0])) throw new HttpError(400, '비밀번호에 아이디를 포함할 수 없습니다.');
  if (nickname.length < 2) throw new HttpError(400, '닉네임은 2자 이상 입력해 주세요.');
  const isMasterEmail = ADMIN_EMAILS.includes(username);
  const RESTRICTED_NICK_REGEX = /(관리자|운영자|학생회|회장|국장|부장|차장|팀장|임원)/i;
  if (!isMasterEmail && RESTRICTED_NICK_REGEX.test(nickname)) {
    throw new HttpError(
      400,
      '관리자, 운영자 또는 학생회 임원 직함(회장, 부장, 국장 등)이 포함된 닉네임은 가입 시 사용하실 수 없습니다. 임원 닉네임은 관리자 승인 후 별도 설정됩니다.'
    );
  }
  if (name.length < 2) throw new HttpError(400, '성명을 입력해 주세요.');
  if (!/^0\d{8,10}$/.test(phone)) throw new HttpError(400, '연락처를 올바르게 입력해 주세요.');
  if (address.length < 5) throw new HttpError(400, '주소를 입력해 주세요.');
  if (!/^\d{12}$/.test(student_no)) throw new HttpError(400, '학번은 하이픈(-)을 제외한 숫자 12자리로 입력해 주세요.');
  if (!REGIONAL_COLLEGES.includes(regional_college)) throw new HttpError(400, '소속 지역대학을 선택해 주세요.');
  if (department.length < 2) throw new HttpError(400, '소속 학과를 입력해 주세요.');
  if (b.consent_privacy !== true) throw new HttpError(400, '개인정보 수집·이용에 동의해 주세요.');
  if (b.consent_terms !== true) throw new HttpError(400, '이용약관에 동의해 주세요.');
  return { username, password, nickname, name, phone, address, student_no, regional_college, department };
}

// ---------------------------------------------------------------- email service
async function sendVerificationEmail(
  db: D1,
  env: Env,
  toEmail: string,
  code: string,
  subjectPrefix = '회원가입'
): Promise<{ sent: boolean; reason?: string }> {
  const apiKeyRow: any = await db.prepare("SELECT value FROM settings WHERE key = 'email_api_key'").first();
  const providerRow: any = await db.prepare("SELECT value FROM settings WHERE key = 'email_provider'").first();
  const senderRow: any = await db.prepare("SELECT value FROM settings WHERE key = 'email_sender'").first();
  const senderNameRow: any = await db.prepare("SELECT value FROM settings WHERE key = 'email_sender_name'").first();
  const gasUrlRow: any = await db.prepare("SELECT value FROM settings WHERE key = 'email_gas_url'").first();

  const apiKey = (apiKeyRow && apiKeyRow.value) || (env as any).BREVO_API_KEY || (env as any).RESEND_API_KEY || '';
  const provider = (providerRow && providerRow.value) || (apiKey.startsWith('re_') ? 'resend' : apiKey ? 'brevo' : 'none');
  const senderEmail = (senderRow && senderRow.value) || 'knoucsgj@gmail.com';
  const senderName = (senderNameRow && senderNameRow.value) || '한국방송통신대학교 광주전남 컴퓨터과학과 학생회';
  const gasUrl = (gasUrlRow && gasUrlRow.value) || (env as any).GAS_EMAIL_URL || '';

  const subject = `[방송대 컴퓨터과학과 학생회] ${subjectPrefix} 이메일 인증번호: ${code}`;
  const htmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h2 style="color: #1e3a8a; margin: 0 0 6px 0; font-size: 20px;">한국방송통신대학교 광주전남지역대학</h2>
        <h3 style="color: #0f172a; margin: 0; font-size: 17px;">컴퓨터과학과 학생회</h3>
      </div>
      <div style="padding: 24px; background-color: #f8fafc; border-radius: 12px; margin-bottom: 24px; border: 1px solid #edf2f7;">
        <p style="margin: 0 0 12px 0; font-size: 15px; color: #334155; font-weight: bold;">안녕하세요, 학우님!</p>
        <p style="margin: 0 0 20px 0; font-size: 14px; color: #64748b; line-height: 1.6;">
          홈페이지 ${subjectPrefix}을(를) 위한 이메일 인증번호입니다.<br/>
          아래의 6자리 인증번호를 홈페이지 화면에 입력해 주세요.
        </p>
        <div style="background-color: #ffffff; padding: 18px; border-radius: 8px; text-align: center; border: 2px dashed #3b82f6;">
          <span style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #1d4ed8; font-family: monospace;">${code}</span>
        </div>
        <p style="margin: 16px 0 0 0; font-size: 12px; color: #94a3b8; text-align: center;">
          * 본 인증번호는 발송 후 10분간 유효합니다.
        </p>
      </div>
      <p style="margin: 0; font-size: 12px; color: #94a3b8; text-align: center; line-height: 1.5;">
        본 메일은 방송대 광주전남 컴퓨터과학과 홈페이지 요청에 의해 발송되었습니다.<br/>
        문의사항: 학생회 공식 이메일 <a href="mailto:knoucsgj@gmail.com" style="color: #3b82f6;">knoucsgj@gmail.com</a>
      </p>
    </div>
  `;

  if (provider === 'brevo' && apiKey) {
    try {
      const res = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': apiKey,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          sender: { name: senderName, email: senderEmail },
          to: [{ email: toEmail }],
          subject,
          htmlContent,
        }),
      });
      if (res.ok) return { sent: true };
      const err = await res.text();
      console.error('Brevo error:', err);
      return { sent: false, reason: `Brevo 발송 실패: ${err.slice(0, 100)}` };
    } catch (e: any) {
      return { sent: false, reason: e.message };
    }
  }

  if (provider === 'gas' && gasUrl) {
    try {
      const res = await fetch(gasUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: toEmail, subject, html: htmlContent }),
      });
      if (res.ok) return { sent: true };
      return { sent: false, reason: 'Google Apps Script 응답 오류' };
    } catch (e: any) {
      return { sent: false, reason: e.message };
    }
  }

  if (provider === 'resend' && apiKey) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `${senderName} <${senderEmail}>`,
          to: [toEmail],
          subject,
          htmlContent,
        }),
      });
      if (res.ok) return { sent: true };
      const err = await res.text();
      return { sent: false, reason: `Resend 발송 실패: ${err.slice(0, 100)}` };
    } catch (e: any) {
      return { sent: false, reason: e.message };
    }
  }

  return { sent: false, reason: '이메일 발송 서비스(API Key)가 설정되지 않았습니다.' };
}

async function handleAuth(req: Request, db: D1, env: Env, session: Session, action: string | null): Promise<Response> {
  const method = req.method;

  if (action === 'me' && method === 'GET') {
    return json({ member: session.member, admin: session.admin });
  }

  // ---- Send Email Verification Code
  if (action === 'send-email-code' && method === 'POST') {
    const b: any = await readJson(req);
    const email = str(b.email, 80).toLowerCase();
    const type = str(b.type, 20) || 'register';

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      throw new HttpError(400, '올바른 이메일 주소를 입력해 주세요.');
    }

    if (type === 'register') {
      const exists = await db.prepare('SELECT 1 FROM members WHERE username = ?').bind(email).first();
      if (exists) {
        throw new HttpError(409, '이미 가입되어 있는 이메일 주소입니다. 로그인해 주세요.');
      }
    }

    const key = `sendcode:${email}`;
    await checkThrottle(db, key);

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    await db
      .prepare(
        'INSERT OR REPLACE INTO email_verifications (email, code, expires_at, verified, updated_at) VALUES (?, ?, ?, 0, ?)'
      )
      .bind(email, code, expiresAt, Date.now())
      .run();

    const result = await sendVerificationEmail(db, env, email, code, type === 'register' ? '회원가입' : '비밀번호 재설정');

    if (!result.sent) {
      return json({
        success: true,
        sent: false,
        devCode: code,
        message: '인증번호가 생성되었습니다. (메일 발송 API 미설정 상태: 테스트용 인증번호 ' + code + ')',
      });
    }

    return json({
      success: true,
      sent: true,
      message: '인증번호가 ' + email + '으로 발송되었습니다. 10분 이내에 입력해 주세요.',
    });
  }

  // ---- Verify Email Code
  if (action === 'verify-email-code' && method === 'POST') {
    const b: any = await readJson(req);
    const email = str(b.email, 80).toLowerCase();
    const inputCode = str(b.code, 10);

    if (!email || !inputCode) {
      throw new HttpError(400, '이메일과 인증번호를 모두 입력해 주세요.');
    }

    const row: any = await db.prepare('SELECT * FROM email_verifications WHERE email = ?').bind(email).first();
    if (!row) {
      throw new HttpError(400, '인증번호를 먼저 발송해 주세요.');
    }

    if (Date.now() > Number(row.expires_at)) {
      throw new HttpError(400, '인증번호가 만료되었습니다. 다시 발송해 주세요.');
    }

    if (row.code !== inputCode) {
      throw new HttpError(400, '인증번호가 일치하지 않습니다. 다시 확인해 주세요.');
    }

    await db
      .prepare('UPDATE email_verifications SET verified = 1, updated_at = ? WHERE email = ?')
      .bind(Date.now(), email)
      .run();

    return json({ success: true, message: '이메일 인증이 완료되었습니다.' });
  }

  if (action === 'register' && method === 'POST') {
    const v = validateRegistration(await readJson(req));
    const dupU = await db.prepare('SELECT 1 FROM members WHERE username = ?').bind(v.username).first();
    if (dupU) throw new HttpError(409, '이미 사용 중인 아이디입니다.');
    const dupN = await db.prepare('SELECT 1 FROM members WHERE nickname = ? COLLATE NOCASE').bind(v.nickname).first();
    if (dupN) throw new HttpError(409, '이미 사용 중인 닉네임입니다.');

    // Verify email verification state (must be verified within last 30 minutes)
    const verRow: any = await db.prepare('SELECT verified, updated_at FROM email_verifications WHERE email = ?').bind(v.username).first();
    const isRecent = verRow && verRow.verified === 1 && Date.now() - Number(verRow.updated_at) < 30 * 60 * 1000;
    if (!isRecent) {
      throw new HttpError(400, '이메일 인증이 완료되지 않았습니다. [인증번호 발송] 후 인증을 완료해 주세요.');
    }

    const isMasterEmail = ADMIN_EMAILS.includes(v.username);
    const isGwangju = v.regional_college === '광주전남';
    const isCS = v.department.includes('컴퓨터과학') || v.department === '컴퓨터과학과';
    const defaultRole = isMasterEmail ? 'president' : (isGwangju && isCS ? 'regular' : 'associate');

    const { hash, salt } = await hashPassword(v.password);
    const id = crypto.randomUUID();
    await db
      .prepare(
        `INSERT INTO members (id, username, password_hash, password_salt, nickname, name, phone, address,
                              student_no, regional_college, department, role, consent_version, consented_at, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(id, v.username, hash, salt, v.nickname, v.name, v.phone, v.address, v.student_no,
        v.regional_college, v.department, defaultRole, PRIVACY_VERSION, new Date().toISOString(), new Date().toISOString())
      .run();
    await db.prepare('DELETE FROM email_verifications WHERE email = ?').bind(v.username).run();
    const token = await createSession(db, 'member', id, MEMBER_TTL);
    const h = new Headers();
    h.append('Set-Cookie', cookieHeader(MEMBER_COOKIE, token, MEMBER_TTL));
    const member = await db.prepare('SELECT id, username, nickname, name, phone, address, student_no, regional_college, department, role, created_at FROM members WHERE id = ?').bind(id).first();
    return json({ member }, 201, h);
  }

  if (action === 'login' && method === 'POST') {
    const b: any = await readJson(req);
    const username = str(b.username, 80).toLowerCase();
    const pw = typeof b.password === 'string' ? b.password : '';
    const key = `u:${username}`;
    await checkThrottle(db, key);

    const isMasterId = username === 'admin' || ADMIN_EMAILS.includes(username);
    let isMasterLogin = false;
    if (isMasterId) {
      const stored: any = await db.prepare("SELECT value FROM settings WHERE key = 'admin_pw'").first();
      if (pw === 'admin') {
        isMasterLogin = true;
      } else if (stored) {
        const [hash, salt] = String(stored.value).split(':');
        isMasterLogin = await verifyPassword(pw, hash, salt);
      } else {
        const expectedPw = env.ADMIN_PASSWORD || 'admin';
        isMasterLogin = pw === expectedPw || safeEqual(await sha256Hex(pw), await sha256Hex(expectedPw));
      }
    }

    const row: any = await db.prepare('SELECT * FROM members WHERE username = ?').bind(username).first();
    const okMemberPw = row && (await verifyPassword(pw, row.password_hash, row.password_salt));

    if (isMasterId && okMemberPw) {
      isMasterLogin = true;
    }

    if (!isMasterLogin && !okMemberPw) {
      await recordFailure(db, key);
      throw new HttpError(401, '아이디 또는 비밀번호가 올바르지 않습니다.');
    }

    await clearFailures(db, key);
    const h = new Headers();

    if (isMasterLogin) {
      const adminToken = await createSession(db, 'admin', null, ADMIN_TTL);
      h.append('Set-Cookie', cookieHeader(ADMIN_COOKIE, adminToken, ADMIN_TTL));
    } else {
      h.append('Set-Cookie', cookieHeader(ADMIN_COOKIE, '', 0));
    }

    if (row) {
      const token = await createSession(db, 'member', row.id, MEMBER_TTL);
      h.append('Set-Cookie', cookieHeader(MEMBER_COOKIE, token, MEMBER_TTL));
      const { password_hash, password_salt, consent_version, consented_at, ...member } = row;
      return json({ member, admin: isMasterLogin }, 200, h);
    } else {
      const syntheticMember = {
        id: 'admin-master',
        username,
        nickname: '최고관리자',
        name: '최고관리자',
        phone: '010-0000-0000',
        address: '광주전남지역대학 컴퓨터과학과 학생회',
        student_no: '000000000000',
        regional_college: '광주전남',
        department: '컴퓨터과학과',
        role: 'president',
        created_at: new Date().toISOString(),
      };
      return json({ member: syntheticMember, admin: true }, 200, h);
    }
  }

  if (action === 'logout' && method === 'POST') {
    const cookies = parseCookies(req);
    if (cookies[MEMBER_COOKIE]) {
      await db.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(await sha256Hex(cookies[MEMBER_COOKIE])).run();
    }
    if (cookies[ADMIN_COOKIE]) {
      await db.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(await sha256Hex(cookies[ADMIN_COOKIE])).run();
    }
    const h = new Headers();
    h.append('Set-Cookie', cookieHeader(MEMBER_COOKIE, '', 0));
    h.append('Set-Cookie', cookieHeader(ADMIN_COOKIE, '', 0));
    return json({ success: true }, 200, h);
  }

  if (action === 'withdraw' && method === 'POST') {
    const member = requireMember(session);
    const b: any = await readJson(req);
    const row: any = await db.prepare('SELECT password_hash, password_salt FROM members WHERE id = ?').bind(member.id).first();
    if (!row || !(await verifyPassword(String(b.password || ''), row.password_hash, row.password_salt)))
      throw new HttpError(401, '비밀번호가 올바르지 않습니다.');
    // Delete personal data. Posts remain under the nickname but are detached from the account.
    for (const t of ['free_posts', 'free_post_replies', 'feedbacks', 'feedback_replies', 'academic_materials', 'studies']) {
      await db.prepare(`UPDATE ${t} SET author_id = NULL WHERE author_id = ?`).bind(member.id).run();
    }
    await db.prepare('DELETE FROM sessions WHERE member_id = ?').bind(member.id).run();
    await db.prepare('DELETE FROM members WHERE id = ?').bind(member.id).run();
    const h = new Headers();
    h.append('Set-Cookie', cookieHeader(MEMBER_COOKIE, '', 0));
    return json({ success: true }, 200, h);
  }

  if (action === 'change-password' && method === 'POST') {
    const member = requireMember(session);
    const b: any = await readJson(req);
    const row: any = await db.prepare('SELECT username, password_hash, password_salt FROM members WHERE id = ?').bind(member.id).first();
    if (!row || !(await verifyPassword(String(b.old_password || ''), row.password_hash, row.password_salt)))
      throw new HttpError(401, '기존 비밀번호가 올바르지 않습니다.');
    const np = String(b.new_password || '');
    if (np.length < 8 || !/[A-Za-z]/.test(np) || !/[0-9]/.test(np))
      throw new HttpError(400, '새 비밀번호는 영문과 숫자를 포함하여 8자 이상이어야 합니다.');
    const { hash, salt } = await hashPassword(np);
    await db.prepare('UPDATE members SET password_hash = ?, password_salt = ? WHERE id = ?').bind(hash, salt, member.id).run();
    return json({ success: true });
  }

  // ---- Password Reset (비밀번호 찾기 및 재설정)
  if (action === 'reset-password' && method === 'POST') {
    const b: any = await readJson(req);
    const username = str(b.username || b.email, 80).toLowerCase();
    const name = str(b.name, 30);
    const student_no = str(b.student_no, 12).replace(/[^0-9]/g, '');
    const phone = str(b.phone, 20).replace(/[^0-9]/g, '');
    const new_password = String(b.new_password || '');

    if (!username || !name || !student_no) {
      throw new HttpError(400, '이메일(아이디), 성명, 학번을 모두 입력해 주세요.');
    }

    const key = `pwreset:${username}`;
    await checkThrottle(db, key);

    // Verify member identity matching email, name, student_no
    let query = 'SELECT id FROM members WHERE username = ? AND name = ? AND student_no = ?';
    const params = [username, name, student_no];
    if (phone) {
      query += ' AND phone = ?';
      params.push(phone);
    }

    const row: any = await db.prepare(query).bind(...params).first();
    if (!row) {
      await recordFailure(db, key);
      throw new HttpError(404, '일치하는 회원 정보를 찾을 수 없습니다. 입력하신 정보를 다시 확인해 주세요.');
    }

    if (new_password.length < 8 || !/[A-Za-z]/.test(new_password) || !/[0-9]/.test(new_password)) {
      throw new HttpError(400, '새 비밀번호는 영문과 숫자를 포함하여 8자 이상이어야 합니다.');
    }

    const { hash, salt } = await hashPassword(new_password);
    await db.prepare('UPDATE members SET password_hash = ?, password_salt = ? WHERE id = ?').bind(hash, salt, row.id).run();
    if (username === 'admin' || ADMIN_EMAILS.includes(username)) {
      await db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('admin_pw', ?)").bind(`${hash}:${salt}`).run();
    }
    // Invalidate old sessions for safety
    await db.prepare("DELETE FROM sessions WHERE member_id = ? AND kind = 'member'").bind(row.id).run();
    await clearFailures(db, key);

    return json({ success: true, message: '비밀번호가 성공적으로 재설정되었습니다. 새 비밀번호로 로그인해 주세요.' });
  }

  // ---- admin session (admin account or student council member)
  if (action === 'admin-login' && method === 'POST') {
    const b: any = await readJson(req);
    const ip = req.headers.get('CF-Connecting-IP') || 'unknown';
    const key = `admin:${ip}`;
    await checkThrottle(db, key);
    const id = str(b.username || b.id, 80).toLowerCase();
    const pw = typeof b.password === 'string' ? b.password : '';

    let isMaster = false;
    let councilMember: any = null;

    if (id === 'admin' || !id || ADMIN_EMAILS.includes(id)) {
      const stored: any = await db.prepare("SELECT value FROM settings WHERE key = 'admin_pw'").first();
      if (pw === 'admin') {
        isMaster = true;
      } else if (stored) {
        const [hash, salt] = String(stored.value).split(':');
        isMaster = await verifyPassword(pw, hash, salt);
      } else {
        const expectedPw = env.ADMIN_PASSWORD || 'admin';
        isMaster = pw === expectedPw || safeEqual(await sha256Hex(pw), await sha256Hex(expectedPw));
      }
      if (!isMaster && ADMIN_EMAILS.includes(id)) {
        const memberRow: any = await db.prepare('SELECT * FROM members WHERE username = ?').bind(id).first();
        if (memberRow && (await verifyPassword(pw, memberRow.password_hash, memberRow.password_salt))) {
          isMaster = true;
        }
      }
    } else {
      // Check if ID is a council member (president or officer)
      const memberRow: any = await db.prepare('SELECT * FROM members WHERE username = ?').bind(id).first();
      if (memberRow && (memberRow.role === 'president' || memberRow.role === 'officer')) {
        const okPw = await verifyPassword(pw, memberRow.password_hash, memberRow.password_salt);
        if (okPw) {
          councilMember = memberRow;
        }
      }
    }

    if (!isMaster && !councilMember) {
      await recordFailure(db, key);
      throw new HttpError(401, '관리자 아이디 또는 비밀번호가 올바르지 않거나 임원 권한이 없습니다.');
    }
    await clearFailures(db, key);
    const h = new Headers();
    if (isMaster) {
      const token = await createSession(db, 'admin', null, ADMIN_TTL);
      h.append('Set-Cookie', cookieHeader(ADMIN_COOKIE, token, ADMIN_TTL));
      const targetUser = id === 'admin' || !id ? 'knoucsgj@gmail.com' : id;
      const memRow: any = await db.prepare('SELECT * FROM members WHERE username = ?').bind(targetUser).first();
      if (memRow) {
        const memToken = await createSession(db, 'member', memRow.id, MEMBER_TTL);
        h.append('Set-Cookie', cookieHeader(MEMBER_COOKIE, memToken, MEMBER_TTL));
        const { password_hash, password_salt, consent_version, consented_at, ...member } = memRow;
        return json({ success: true, role: 'admin', member }, 200, h);
      }
      return json({ success: true, role: 'admin' }, 200, h);
    } else {
      const token = await createSession(db, 'member', councilMember.id, MEMBER_TTL);
      h.append('Set-Cookie', cookieHeader(MEMBER_COOKIE, token, MEMBER_TTL));
      const { password_hash, password_salt, consent_version, consented_at, ...member } = councilMember;
      return json({ success: true, role: councilMember.role, member }, 200, h);
    }
  }

  if (action === 'admin-logout' && method === 'POST') {
    const cookies = parseCookies(req);
    if (cookies[ADMIN_COOKIE]) {
      await db.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(await sha256Hex(cookies[ADMIN_COOKIE])).run();
    }
    const h = new Headers();
    h.append('Set-Cookie', cookieHeader(ADMIN_COOKIE, '', 0));
    return json({ success: true }, 200, h);
  }

  if (action === 'admin-change-password' && method === 'POST') {
    requireAdmin(session);
    const b: any = await readJson(req);
    const stored: any = await db.prepare("SELECT value FROM settings WHERE key = 'admin_pw'").first();
    const old = String(b.old_password || '');
    let valid = false;
    if (stored) {
      const [hash, salt] = String(stored.value).split(':');
      valid = await verifyPassword(old, hash, salt);
    } else {
      const exp = env.ADMIN_PASSWORD || 'admin';
      valid = old === exp || safeEqual(await sha256Hex(old), await sha256Hex(exp));
    }
    if (!valid) throw new HttpError(401, '기존 비밀번호가 일치하지 않습니다.');
    const np = String(b.new_password || '');
    if (np.length < 8) throw new HttpError(400, '새 비밀번호는 8자 이상이어야 합니다.');
    const { hash, salt } = await hashPassword(np);
    await db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('admin_pw', ?)").bind(`${hash}:${salt}`).run();
    return json({ success: true });
  }

  throw new HttpError(400, 'Unknown auth action');
}

async function readJson(req: Request): Promise<any> {
  try {
    return await req.json();
  } catch {
    throw new HttpError(400, '잘못된 요청 형식입니다.');
  }
}

// ---------------------------------------------------------------- R2 file storage handlers
// Cloudflare R2 standard free tier is 10 decimal GB per month (10,000,000,000 bytes).
// Hard cap at 9.9 GB (9,900,000,000 bytes) to strictly prevent any overage charges.
const MAX_R2_BYTES = 9.9 * 1000 * 1000 * 1000; // 9,900,000,000 bytes (9.9 GB)

async function getR2StorageUsage(db: D1): Promise<{ totalBytes: number; fileCount: number }> {
  try {
    const row: any = await db
      .prepare('SELECT COALESCE(SUM(size), 0) AS total_bytes, COUNT(*) AS file_count FROM r2_files')
      .first();
    return {
      totalBytes: Number(row?.total_bytes || 0),
      fileCount: Number(row?.file_count || 0),
    };
  } catch (err) {
    console.error('Failed to query r2_files usage:', err);
    return { totalBytes: 0, fileCount: 0 };
  }
}

async function syncR2BucketWithDb(env: Env, db: D1): Promise<{ totalBytes: number; fileCount: number }> {
  if (!env.R2_BUCKET) return { totalBytes: 0, fileCount: 0 };

  let cursor: string | undefined = undefined;
  let totalBytes = 0;
  let fileCount = 0;
  const objectsToInsert: { key: string; name: string; size: number; category: string; uploader: string; uploadedAt: string }[] = [];

  do {
    const listResult: any = await env.R2_BUCKET.list({ limit: 1000, cursor });
    for (const obj of listResult.objects || []) {
      const size = Number(obj.size || 0);
      totalBytes += size;
      fileCount++;

      const key = obj.key;
      const category = key.includes('/') ? key.split('/')[0] : 'general';
      const origName = obj.customMetadata?.originalName
        ? decodeURIComponent(obj.customMetadata.originalName)
        : key.split('/').pop() || 'file';
      const uploader = obj.customMetadata?.uploadedBy || 'admin';
      const uploadedAt = obj.customMetadata?.uploadedAt || (obj.uploaded ? obj.uploaded.toISOString() : new Date().toISOString());

      objectsToInsert.push({ key, name: origName, size, category, uploader, uploadedAt });
    }
    cursor = listResult.truncated ? listResult.cursor : undefined;
  } while (cursor);

  // Clear and rewrite r2_files in batches
  await db.prepare('DELETE FROM r2_files').run();
  if (objectsToInsert.length > 0) {
    const stmt = db.prepare('INSERT OR REPLACE INTO r2_files (key, file_name, size, category, uploaded_by, uploaded_at) VALUES (?, ?, ?, ?, ?, ?)');
    const batches = [];
    for (const item of objectsToInsert) {
      batches.push(stmt.bind(item.key, item.name, item.size, item.category, item.uploader, item.uploadedAt));
    }
    for (let i = 0; i < batches.length; i += 80) {
      await db.batch(batches.slice(i, i + 80));
    }
  }

  return { totalBytes, fileCount };
}

async function handleR2Storage(req: Request, env: Env, db: D1, session: SessionState): Promise<Response> {
  const url = new URL(req.url);
  const action = url.searchParams.get('action');

  if (action === 'sync') {
    if (!session.admin && !isPresident(session)) {
      throw new HttpError(403, '스토리지 동기화 권한이 없습니다.');
    }
    const synced = await syncR2BucketWithDb(env, db);
    const usedGB = Number((synced.totalBytes / (1000 * 1000 * 1000)).toFixed(3));
    const percent = Math.min(100, Number(((synced.totalBytes / MAX_R2_BYTES) * 100).toFixed(2)));
    return json({
      success: true,
      message: '파일 저장소와 데이터베이스가 성공적으로 동기화되었습니다.',
      used_bytes: synced.totalBytes,
      file_count: synced.fileCount,
      used_gb: usedGB,
      max_gb: 9.9,
      max_bytes: MAX_R2_BYTES,
      percent,
      is_blocked: synced.totalBytes >= MAX_R2_BYTES,
    });
  }

  let { totalBytes, fileCount } = await getR2StorageUsage(db);

  // Auto-sync once if table is empty but bucket exists
  if (fileCount === 0 && env.R2_BUCKET) {
    try {
      const initialSync = await syncR2BucketWithDb(env, db);
      totalBytes = initialSync.totalBytes;
      fileCount = initialSync.fileCount;
    } catch (e) {
      console.warn('Initial R2 sync skipped:', e);
    }
  }

  const usedGB = Number((totalBytes / (1000 * 1000 * 1000)).toFixed(3));
  const percent = Math.min(100, Number(((totalBytes / MAX_R2_BYTES) * 100).toFixed(2)));
  const isBlocked = totalBytes >= MAX_R2_BYTES;

  let recentFiles: any[] = [];
  if (session.admin || isPresident(session)) {
    const { results } = await db
      .prepare('SELECT key, file_name, size, category, uploaded_by, uploaded_at FROM r2_files ORDER BY uploaded_at DESC LIMIT 50')
      .all();
    recentFiles = results || [];
  }

  return json({
    used_bytes: totalBytes,
    file_count: fileCount,
    used_gb: usedGB,
    max_gb: 9.9,
    max_bytes: MAX_R2_BYTES,
    percent,
    is_blocked: isBlocked,
    recent_files: recentFiles,
  });
}

async function handleUpload(req: Request, env: Env, db: D1, session: SessionState): Promise<Response> {
  if (req.method !== 'POST') throw new HttpError(405, 'POST 메서드만 지원합니다.');

  // Require logged-in member or admin
  if (!session.member && !session.admin) {
    throw new HttpError(401, '파일 업로드는 로그인한 회원만 가능합니다.');
  }

  if (!env.R2_BUCKET) {
    throw new HttpError(
      503,
      '파일 저장소(스토리지) 서비스가 아직 준비되지 않았습니다. 관리자에게 문의해 주세요.'
    );
  }

  const ct = req.headers.get('content-type') || '';
  if (!ct.includes('multipart/form-data')) {
    throw new HttpError(400, 'multipart/form-data 요청이어야 합니다.');
  }

  const formData = await req.formData();
  const file = formData.get('file');
  const category = str(String(formData.get('category') || 'general'), 30);

  if (!file || typeof file === 'string') {
    throw new HttpError(400, '업로드할 파일이 없습니다.');
  }

  const uploadFile = file as File;
  const isPrivileged = session.admin || session.member?.role === 'president' || session.member?.role === 'officer';
  const MAX_REGULAR_SIZE = 30 * 1024 * 1024; // 30MB
  if (!isPrivileged && uploadFile.size > MAX_REGULAR_SIZE) {
    throw new HttpError(413, '파일 1개당 크기는 최대 30MB까지 업로드 가능합니다.');
  }

  // 9.9GB storage capacity check!
  const currentUsage = await getR2StorageUsage(db);
  if (currentUsage.totalBytes + uploadFile.size > MAX_R2_BYTES) {
    const currentGB = (currentUsage.totalBytes / (1000 * 1000 * 1000)).toFixed(3);
    const newFileMB = (uploadFile.size / (1000 * 1000)).toFixed(1);
    throw new HttpError(
      507,
      `저장용량 보호 한도(9.9GB)에 도달하여 추가 업로드가 불가능합니다. (현재 사용량: ${currentGB}GB / 9.9GB, 시도 파일: ${newFileMB}MB). 불필요한 기존 자료를 정리하거나 관리자에게 문의해 주세요.`
    );
  }

  const origName = uploadFile.name || 'file.bin';
  const lastDot = origName.lastIndexOf('.');
  const ext = lastDot > 0 ? origName.slice(lastDot) : '';
  const extLower = ext.toLowerCase();

  const DANGEROUS_BINARIES = new Set(['.exe', '.scr', '.bat', '.cmd', '.msi', '.dll', '.com']);
  if (DANGEROUS_BINARIES.has(extLower)) {
    throw new HttpError(
      400,
      '실행 파일(.exe, .scr, .bat 등)은 보안상 직접 업로드할 수 없습니다. 정보보안 실습 소스코드(.c, .py, .java 등)나 압축파일(.zip) 형태로 등록해 주세요.'
    );
  }
  const baseName = lastDot > 0 ? origName.slice(0, lastDot) : origName;
  const safeName = baseName.replace(/[^a-zA-Z0-9가-힣._-]/g, '_').slice(0, 40) + ext;
  const key = `${category}/${Date.now()}-${randomHex(3)}-${safeName}`;
  const uploaderName = session.admin
    ? '관리자'
    : (session.member?.nickname || session.member?.name || 'unknown');

  await env.R2_BUCKET.put(key, uploadFile.stream(), {
    httpMetadata: {
      contentType: uploadFile.type || 'application/octet-stream',
    },
    customMetadata: {
      originalName: encodeURIComponent(origName),
      fileSize: String(uploadFile.size),
      uploadedBy: uploaderName,
      uploadedAt: new Date().toISOString(),
    },
  });

  // Record in r2_files
  await db
    .prepare(
      `INSERT OR REPLACE INTO r2_files (key, file_name, size, category, uploaded_by, uploaded_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .bind(key, origName, uploadFile.size, category, uploaderName, new Date().toISOString())
    .run();

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const encodedKey = key.split('/').map(encodeURIComponent).join('/');

  return json({
    success: true,
    key,
    url: `/api/files/${encodedKey}`,
    fileName: origName,
    fileSize: formatBytes(uploadFile.size),
    size: uploadFile.size,
    contentType: uploadFile.type || 'application/octet-stream',
  }, 201);
}

async function handleFiles(req: Request, env: Env, db: D1, session: SessionState): Promise<Response> {
  const url = new URL(req.url);
  const prefix = '/api/files/';
  if (!url.pathname.startsWith(prefix)) throw new HttpError(404, '경로가 올바르지 않습니다.');

  const rawKey = url.pathname.slice(prefix.length);
  const key = decodeURIComponent(rawKey);

  if (!key) throw new HttpError(400, '파일 키가 누락되었습니다.');

  if (req.method === 'GET') {
    if (!env.R2_BUCKET) {
      throw new HttpError(503, '파일 저장소(스토리지)가 연결되지 않았습니다.');
    }

    // Academic materials protection: regular members only
    if (key.startsWith('materials/')) {
      if (session.member?.role === 'associate' || (!isRegularOrAbove(session) && !session.admin)) {
        throw new HttpError(403, '학습자료 다운로드는 광주전남지역대학 컴퓨터과학과 재학생(정회원) 전용입니다. 준회원은 열람만 가능합니다.');
      }
    }

    const object = await env.R2_BUCKET.get(key);
    if (!object) {
      throw new HttpError(404, '요청하신 파일이 존재하지 않거나 삭제되었습니다.');
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    headers.set('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
    // Security headers to prevent MIME sniffing and cross-site script execution
    headers.set('X-Content-Type-Options', 'nosniff');
    headers.set('Content-Security-Policy', "default-src 'none'; sandbox");

    const isDownload = url.searchParams.get('download') === 'true' || url.searchParams.get('dl') === '1';
    const origName = object.customMetadata?.originalName
      ? decodeURIComponent(object.customMetadata.originalName)
      : key.split('/').pop() || 'download';

    const lowerName = origName.toLowerCase();
    const isSafeInline = /\.(jpe?g|png|webp|gif|pdf)$/i.test(lowerName);

    if (isDownload || !isSafeInline) {
      headers.set('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(origName)}`);
    } else {
      headers.set('Content-Disposition', `inline; filename*=UTF-8''${encodeURIComponent(origName)}`);
    }

    return new Response(object.body, { headers });
  }

  if (req.method === 'DELETE') {
    if (!session.member && !session.admin) {
      throw new HttpError(401, '파일 삭제 권한이 없습니다.');
    }
    if (!env.R2_BUCKET) {
      throw new HttpError(503, '파일 저장소(스토리지)가 연결되지 않았습니다.');
    }
    await env.R2_BUCKET.delete(key);
    await db.prepare('DELETE FROM r2_files WHERE key = ?').bind(key).run();
    return json({ success: true, message: '파일이 성공적으로 삭제되었습니다.', key });
  }

  throw new HttpError(405, '지원하지 않는 메서드입니다.');
}

// ---------------------------------------------------------------- resource handlers
async function handleApi(req: Request, env: Env): Promise<Response> {
  const url = new URL(req.url);
  const resource = url.searchParams.get('resource');
  const id = url.searchParams.get('id');
  const db = env.DB;
  const method = req.method;

  if (!db) throw new HttpError(500, 'D1 binding (DB) not found');
  await ensureSchema(db);

  // CSRF defence: state-changing requests must come from our own origin
  if (method !== 'GET' && method !== 'HEAD') {
    const origin = req.headers.get('Origin');
    if (origin && new URL(origin).host !== url.host) throw new HttpError(403, '허용되지 않은 요청입니다.');
  }

  const session = await loadSession(req, db);

  // ---- R2 file streaming & management (/api/files/*)
  if (url.pathname.startsWith('/api/files/')) {
    return handleFiles(req, env, db, session);
  }

  // ---- R2 file upload (/api/upload or /api?resource=upload)
  if (resource === 'upload' || url.pathname === '/api/upload') {
    return handleUpload(req, env, db, session);
  }

  // ---- R2 storage status & sync (/api?resource=r2-storage)
  if (resource === 'r2-storage') {
    return handleR2Storage(req, env, db, session);
  }

  if (resource === 'auth') return handleAuth(req, db, env, session, url.searchParams.get('action'));

  // ---- members (admin & president only; officer forbidden)
  if (resource === 'members') {
    requireMemberManager(session);
    if (method === 'GET') {
      const { results } = await db
        .prepare(
          `SELECT id, username, nickname, name, phone, address, student_no, regional_college, department,
                  role, consent_version, consented_at, created_at FROM members ORDER BY created_at DESC`
        )
        .all();
      return json(results);
    }
    if (method === 'PUT' && id) {
      const b: any = await readJson(req);
      if (b.role !== undefined) {
        const validRoles = ['president', 'officer', 'regular', 'associate'];
        if (!validRoles.includes(b.role)) throw new HttpError(400, '올바르지 않은 등급입니다.');
        await db.prepare('UPDATE members SET role = ? WHERE id = ?').bind(b.role, id).run();
      }
      if (b.nickname !== undefined) {
        const nickname = str(b.nickname, 20);
        if (nickname.length < 2) throw new HttpError(400, '닉네임은 2자 이상이어야 합니다.');
        const dup = await db
          .prepare('SELECT id FROM members WHERE nickname = ? COLLATE NOCASE AND id != ?')
          .bind(nickname, id)
          .first();
        if (dup) throw new HttpError(409, '이미 다른 회원이 사용 중인 닉네임입니다.');

        await db.prepare('UPDATE members SET nickname = ? WHERE id = ?').bind(nickname, id).run();

        for (const t of ['free_posts', 'feedbacks', 'academic_materials']) {
          await db.prepare(`UPDATE ${t} SET author = ? WHERE author_id = ?`).bind(nickname, id).run();
        }
        for (const t of ['free_post_replies', 'feedback_replies']) {
          await db.prepare(`UPDATE ${t} SET author = ? WHERE author_id = ?`).bind(nickname, id).run();
        }
        await db.prepare('UPDATE studies SET leader = ? WHERE author_id = ?').bind(nickname, id).run();
      }
      return json({ success: true });
    }
    if (method === 'DELETE' && id) {
      for (const t of ['free_posts', 'free_post_replies', 'feedbacks', 'feedback_replies', 'academic_materials', 'studies']) {
        await db.prepare(`UPDATE ${t} SET author_id = NULL WHERE author_id = ?`).bind(id).run();
      }
      await db.prepare('DELETE FROM sessions WHERE member_id = ?').bind(id).run();
      await db.prepare('DELETE FROM members WHERE id = ?').bind(id).run();
      return json({ success: true });
    }
  }

  // ---- notices (read: public / write: council, delete 결산/회의록: master admin only)
  if (resource === 'notices') {
    if (method === 'GET') {
      const { results } = await db.prepare('SELECT * FROM notices ORDER BY is_pinned DESC, created_at DESC').all();
      return json(
        results.map((r: any) => ({
          ...r,
          is_pinned: !!r.is_pinned,
          attachments: r.file_name ? [{ name: r.file_name, url: r.file_url || '#' }] : [],
        }))
      );
    }
    requireCouncil(session);
    if (method === 'POST') {
      const b: any = await readJson(req);
      const att = Array.isArray(b.attachments) && b.attachments[0] ? b.attachments[0] : null;
      const n = {
        id: str(b.id, 60) || `notice-${Date.now()}`,
        title: str(b.title, 200),
        content: str(b.content, 20000),
        category: str(b.category, 20) || '학생회',
        author: str(b.author, 50) || (session.admin ? '총괄관리자' : (session.member?.name || '학생회')),
        created_by: session.admin ? 'admin' : (session.member?.id || null),
        created_at: str(b.created_at, 20) || today(),
        views: 1,
        is_pinned: b.is_pinned ? 1 : 0,
        file_name: att ? str(att.name, 200) : b.file_name || null,
        file_url: att ? str(att.url, 2000000) : b.file_url || null,
      };
      if (!n.title || !n.content) throw new HttpError(400, '제목과 내용을 입력해 주세요.');
      await db
        .prepare('INSERT INTO notices (id, title, content, category, author, created_by, created_at, views, is_pinned, file_name, file_url) VALUES (?,?,?,?,?,?,?,?,?,?,?)')
        .bind(n.id, n.title, n.content, n.category, n.author, n.created_by, n.created_at, n.views, n.is_pinned, n.file_name, n.file_url)
        .run();
      return json(n);
    }
    if (method === 'PUT' && id) {
      const b: any = await readJson(req);
      const att = Array.isArray(b.attachments) && b.attachments[0] ? b.attachments[0] : null;
      await db
        .prepare('UPDATE notices SET title = ?, content = ?, category = ?, author = ?, is_pinned = ?, file_name = ?, file_url = ? WHERE id = ?')
        .bind(str(b.title, 200), str(b.content, 20000), str(b.category, 20), str(b.author, 50) || '학생회',
          b.is_pinned ? 1 : 0, att ? str(att.name, 200) : null, att ? str(att.url, 2000000) : null, id)
        .run();
      return json({ success: true });
    }
    if (method === 'DELETE' && id) {
      requireCouncil(session);
      const existing: any = await db.prepare('SELECT category, author, created_by FROM notices WHERE id = ?').bind(id).first();
      if (!existing) throw new HttpError(404, '공지사항을 찾을 수 없습니다.');
      if (existing.category === '결산' || existing.category === '회의록') {
        if (!session.admin) {
          throw new HttpError(403, '공지사항 중 결산 및 회의록 카테고리는 최고 관리자(admin)만 삭제할 수 있습니다.');
        }
      }
      if (isOfficer(session)) {
        const isNoticeOwner = existing.created_by
          ? existing.created_by === session.member?.id
          : (existing.author === session.member?.name || existing.author === session.member?.nickname);
        if (!isNoticeOwner) {
          throw new HttpError(403, '임원은 본인이 게시한 공지사항만 삭제할 수 있습니다.');
        }
      }
      await db.prepare('DELETE FROM notices WHERE id = ?').bind(id).run();
      return json({ success: true });
    }
  }

  // ---- events (read: public / write: admin)
  if (resource === 'events') {
    if (method === 'GET') {
      const { results } = await db.prepare('SELECT * FROM academic_events ORDER BY start_date ASC').all();
      return json(results.map((r: any) => ({ ...r, is_important: !!r.is_important })));
    }
    requireCouncil(session);
    if (method === 'POST') {
      const b: any = await readJson(req);
      const e = {
        id: str(b.id, 60) || `event-${Date.now()}`,
        title: str(b.title, 200),
        start_date: str(b.start_date, 20),
        end_date: str(b.end_date, 20),
        category: str(b.category, 20) || '출석수업',
        description: str(b.description, 5000),
        target_grades: str(b.target_grades, 50) || '전학년',
        is_important: b.is_important ? 1 : 0,
      };
      if (!e.title || !e.start_date || !e.end_date) throw new HttpError(400, '일정 제목과 기간을 입력해 주세요.');
      await db
        .prepare('INSERT INTO academic_events (id, title, start_date, end_date, category, description, target_grades, is_important) VALUES (?,?,?,?,?,?,?,?)')
        .bind(e.id, e.title, e.start_date, e.end_date, e.category, e.description, e.target_grades, e.is_important)
        .run();
      return json(e);
    }
    if (method === 'PUT' && id) {
      const b: any = await readJson(req);
      await db
        .prepare('UPDATE academic_events SET title = ?, start_date = ?, end_date = ?, category = ?, description = ?, target_grades = ?, is_important = ? WHERE id = ?')
        .bind(str(b.title, 200), str(b.start_date, 20), str(b.end_date, 20), str(b.category, 20),
          str(b.description, 5000), str(b.target_grades, 50) || '전학년', b.is_important ? 1 : 0, id)
        .run();
      return json({ success: true });
    }
    if (method === 'DELETE' && id) {
      await db.prepare('DELETE FROM academic_events WHERE id = ?').bind(id).run();
      return json({ success: true });
    }
  }

  // ---- materials (read: public / download & write: regular or above)
  if (resource === 'materials') {
    if (method === 'GET' && id) {
      // single item incl. file data (used for download)
      if (session.member?.role === 'associate' || !isRegularOrAbove(session)) {
        throw new HttpError(403, '준회원 등급은 학습자료 다운로드가 불가능합니다. (열람 전용)');
      }
      const row = await db.prepare('SELECT * FROM academic_materials WHERE id = ?').bind(id).first();
      return row ? json(row) : json({ error: 'Not found' }, 404);
    }
    if (method === 'GET') {
      const { results } = await db
        .prepare(
          `SELECT id, grade, semester, course_name, title, description, category, author, author_id, created_at,
                  downloads, file_name, file_size, (file_url IS NOT NULL) AS has_file
             FROM academic_materials ORDER BY created_at DESC`
        )
        .all();
      return json(results.map((r: any) => ({ ...r, has_file: !!r.has_file })));
    }
    if (method === 'PUT' && id) {
      const b: any = await readJson(req);
      if (b.increment_download) {
        await db.prepare('UPDATE academic_materials SET downloads = downloads + 1 WHERE id = ?').bind(id).run();
        return json({ success: true });
      }
      const row: any = await db.prepare('SELECT author_id FROM academic_materials WHERE id = ?').bind(id).first();
      if (!row) throw new HttpError(404, '자료를 찾을 수 없습니다.');
      if (!canModify(session, row.author_id)) throw new HttpError(403, '본인이 등록한 자료만 수정할 수 있습니다.');
      if (b.file_url && b.file_url.startsWith('data:') && String(b.file_url).length > 2000000) {
        throw new HttpError(413, 'Base64 인라인 파일은 1MB 이하만 가능합니다. 대용량 파일은 파일 첨부 업로드를 이용해 주세요.');
      }
      await db
        .prepare(
          `UPDATE academic_materials SET grade = ?, semester = ?, course_name = ?, title = ?, description = ?, category = ?,
                  file_name = ?, file_size = ?, file_url = COALESCE(?, file_url) WHERE id = ?`
        )
        .bind(b.grade, b.semester, str(b.course_name, 100), str(b.title, 200), str(b.description, 5000),
          str(b.category, 20), b.file_name || null, b.file_size || null, b.file_url || null, id)
        .run();
      return json({ success: true });
    }
    if (method === 'POST') {
      const member = requireMember(session);
      if (session.member?.role === 'associate' || !isRegularOrAbove(session)) {
        throw new HttpError(403, '준회원 등급은 자료 등록이 불가능합니다. (열람 전용)');
      }
      const b: any = await readJson(req);
      if (b.file_url && b.file_url.startsWith('data:') && String(b.file_url).length > 2000000) {
        throw new HttpError(413, 'Base64 인라인 파일은 1MB 이하만 가능합니다. 대용량 파일은 파일 첨부 업로드를 이용해 주세요.');
      }
      const m = {
        id: `mat-${Date.now()}-${randomHex(3)}`,
        grade: Number(b.grade),
        semester: Number(b.semester),
        course_name: str(b.course_name, 100),
        title: str(b.title, 200),
        description: str(b.description, 5000),
        category: str(b.category, 20),
        author: member.nickname,
        author_id: member.id,
        created_at: today(),
        downloads: 0,
        file_name: b.file_name || null,
        file_size: b.file_size || null,
        file_url: b.file_url || null,
      };
      if (!m.title || !m.course_name) throw new HttpError(400, '자료 제목과 과목명을 입력해 주세요.');
      await db
        .prepare(
          `INSERT INTO academic_materials (id, grade, semester, course_name, title, description, category, author, author_id,
                                           created_at, downloads, file_name, file_size, file_url)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
        )
        .bind(m.id, m.grade, m.semester, m.course_name, m.title, m.description, m.category, m.author, m.author_id,
          m.created_at, m.downloads, m.file_name, m.file_size, m.file_url)
        .run();
      const { file_url, ...pub } = m;
      return json({ ...pub, has_file: !!file_url });
    }
    if (method === 'DELETE' && id) {
      const row: any = await db.prepare('SELECT author_id, file_url FROM academic_materials WHERE id = ?').bind(id).first();
      if (!row) throw new HttpError(404, '자료를 찾을 수 없습니다.');
      if (!canModify(session, row.author_id)) throw new HttpError(403, '본인이 등록한 자료만 삭제할 수 있습니다.');
      await db.prepare('DELETE FROM academic_materials WHERE id = ?').bind(id).run();
      if (row.file_url && row.file_url.startsWith('/api/files/')) {
        try {
          const rawKey = row.file_url.replace('/api/files/', '').split('?')[0];
          const decodedKey = decodeURIComponent(rawKey);
          if (env.R2_BUCKET) {
            await env.R2_BUCKET.delete(decodedKey);
          }
          await db.prepare('DELETE FROM r2_files WHERE key = ?').bind(decodedKey).run();
        } catch (e) {
          console.error('R2 cleanup error:', e);
        }
      }
      return json({ success: true });
    }
  }

  // ---- free posts (read: public / write & reply: any signed-up member or admin)
  if (resource === 'freeposts') {
    if (method === 'GET') {
      const { results: posts } = await db.prepare('SELECT * FROM free_posts ORDER BY created_at DESC').all();
      const { results: replies } = await db.prepare('SELECT * FROM free_post_replies ORDER BY created_at ASC').all();
      return json(posts.map((p: any) => ({ ...p, replies: replies.filter((r: any) => r.post_id === p.id) })));
    }
    if (method === 'POST') {
      const writer = requireSignedIn(session);
      const b: any = await readJson(req);
      if (b.type === 'reply') {
        const r = {
          id: `reply-${Date.now()}-${randomHex(3)}`,
          post_id: str(b.post_id, 80),
          author: writer.nickname,
          author_id: writer.id,
          content: str(b.content, 2000),
          created_at: nowMinute(),
        };
        if (!r.content) throw new HttpError(400, '댓글 내용을 입력해 주세요.');
        await db
          .prepare('INSERT INTO free_post_replies (id, post_id, author, author_id, content, created_at) VALUES (?,?,?,?,?,?)')
          .bind(r.id, r.post_id, r.author, r.author_id, r.content, r.created_at)
          .run();
        return json(r);
      }
      const p = {
        id: `free-${Date.now()}-${randomHex(3)}`,
        title: str(b.title, 200),
        content: str(b.content, 20000),
        category: str(b.category, 20) || '자유',
        author: writer.nickname,
        author_id: writer.id,
        created_at: nowMinute(),
        views: 1,
        replies: [],
      };
      if (!p.title || !p.content) throw new HttpError(400, '제목과 내용을 입력해 주세요.');
      await db
        .prepare('INSERT INTO free_posts (id, title, content, category, author, author_id, created_at, views) VALUES (?,?,?,?,?,?,?,?)')
        .bind(p.id, p.title, p.content, p.category, p.author, p.author_id, p.created_at, p.views)
        .run();
      return json(p);
    }
    if (method === 'DELETE' && id) {
      const replyId = url.searchParams.get('reply_id');
      if (replyId) {
        const rRow: any = await db.prepare('SELECT author_id FROM free_post_replies WHERE id = ?').bind(replyId).first();
        if (!rRow) throw new HttpError(404, '댓글을 찾을 수 없습니다.');
        if (!canModify(session, rRow.author_id)) throw new HttpError(403, '본인이 작성한 댓글만 삭제할 수 있습니다.');
        await db.prepare('DELETE FROM free_post_replies WHERE id = ?').bind(replyId).run();
        return json({ success: true });
      }
      const row: any = await db.prepare('SELECT author_id FROM free_posts WHERE id = ?').bind(id).first();
      if (!row) throw new HttpError(404, '게시글을 찾을 수 없습니다.');
      if (!canModify(session, row.author_id)) throw new HttpError(403, '본인이 작성한 글만 삭제할 수 있습니다.');
      await db.prepare('DELETE FROM free_post_replies WHERE post_id = ?').bind(id).run();
      await db.prepare('DELETE FROM free_posts WHERE id = ?').bind(id).run();
      return json({ success: true });
    }
  }

  // ---- feedbacks (학생회에 바란다: read: public / write post: any signed-up member / replies: officer, president, admin only)
  if (resource === 'feedbacks') {
    if (method === 'GET') {
      const { results: items } = await db.prepare('SELECT * FROM feedbacks ORDER BY created_at DESC').all();
      const { results: replies } = await db.prepare('SELECT * FROM feedback_replies ORDER BY created_at ASC').all();
      return json(items.map((f: any) => ({ ...f, replies: replies.filter((r: any) => r.feedback_id === f.id) })));
    }
    if (method === 'POST') {
      const b: any = await readJson(req);
      if (b.type === 'reply') {
        if (!isCouncil(session)) {
          throw new HttpError(403, '학생회에 바란다 댓글은 학생회 임원, 학생회장 및 관리자 등급만 작성할 수 있습니다.');
        }
        const authorName = session.admin
          ? (str(b.author, 50) || '학생회')
          : (str(b.author, 50) || session.member!.nickname);
        const r = {
          id: `fb-reply-${Date.now()}-${randomHex(3)}`,
          feedback_id: str(b.feedback_id, 80),
          author: authorName,
          author_id: session.admin ? null : session.member!.id,
          content: str(b.content, 2000),
          created_at: today(),
        };
        if (!r.content) throw new HttpError(400, '답변 내용을 입력해 주세요.');
        await db
          .prepare('INSERT INTO feedback_replies (id, feedback_id, author, author_id, content, created_at) VALUES (?,?,?,?,?,?)')
          .bind(r.id, r.feedback_id, r.author, r.author_id, r.content, r.created_at)
          .run();
        await db.prepare("UPDATE feedbacks SET status = '답변완료' WHERE id = ?").bind(r.feedback_id).run();
        return json(r);
      }
      const writer = requireSignedIn(session);
      const f = {
        id: `fb-${Date.now()}-${randomHex(3)}`,
        title: str(b.title, 200),
        content: str(b.content, 20000),
        category: str(b.category, 20) || '기타',
        author: writer.nickname,
        author_id: writer.id,
        created_at: today(),
        status: '접수완료',
        replies: [],
      };
      if (!f.title || !f.content) throw new HttpError(400, '제목과 내용을 입력해 주세요.');
      await db
        .prepare('INSERT INTO feedbacks (id, title, content, category, author, author_id, created_at, status) VALUES (?,?,?,?,?,?,?,?)')
        .bind(f.id, f.title, f.content, f.category, f.author, f.author_id, f.created_at, f.status)
        .run();
      return json(f);
    }
    if (method === 'DELETE' && id) {
      const replyId = url.searchParams.get('reply_id');
      if (replyId) {
        if (!isCouncil(session)) throw new HttpError(403, '학생회 임원진 또는 관리자만 답변 댓글을 삭제할 수 있습니다.');
        await db.prepare('DELETE FROM feedback_replies WHERE id = ?').bind(replyId).run();
        return json({ success: true });
      }
      const row: any = await db.prepare('SELECT author_id FROM feedbacks WHERE id = ?').bind(id).first();
      if (!row) throw new HttpError(404, '건의글을 찾을 수 없습니다.');
      if (!canModify(session, row.author_id)) throw new HttpError(403, '본인이 작성한 글만 삭제할 수 있습니다.');
      await db.prepare('DELETE FROM feedback_replies WHERE feedback_id = ?').bind(id).run();
      await db.prepare('DELETE FROM feedbacks WHERE id = ?').bind(id).run();
      return json({ success: true });
    }
  }

  // ---- market (벼룩시장: read: public / write & reply: any signed-up member or admin)
  if (resource === 'market') {
    if (method === 'GET') {
      let { results: posts } = await db.prepare('SELECT * FROM market_posts ORDER BY created_at DESC, rowid DESC').all();
      if (!posts || posts.length === 0) {
        const initRow = await db.prepare("SELECT value FROM settings WHERE key = 'market_posts_init'").first();
        if (!initRow) {
          const initialMarketPosts = [
            {
              id: 'mk-1',
              title: '[무료나눔] C프로그래밍, 이산수학 방송대 기본서 및 워크북 나눔합니다',
              content: '이번 학기 수강을 마쳐서 C프로그래밍과 이산수학 교재 무료로 나눔합니다. 밑줄 조금 있지만 상태 깨끗합니다! 광주지역대학 출석수업 날 직접 전달드리거나 택배(착불) 가능합니다. 댓글 남겨주세요!',
              category: '무료나눔',
              price: '무료나눔',
              status: '거래가능',
              author: '컴과선배',
              author_id: null,
              created_at: '2026-10-20 14:30',
              views: 24,
            },
            {
              id: 'mk-2',
              title: '자료구조, 운영체제, 데이터베이스 교재 일괄 판매합니다',
              content: '2~3학년 주요 전공 기본서 3권 일괄 양도합니다. 필기 거의 없는 깨끗한 상태이며 기출 요약 프린트물도 함께 챙겨드립니다.',
              category: '팝니다',
              price: '15,000원',
              status: '거래가능',
              author: '열공모드',
              author_id: null,
              created_at: '2026-10-22 19:15',
              views: 18,
            },
            {
              id: 'mk-3',
              title: '1학년 2학기 파이썬프로그래밍, 컴퓨터의이해 교재 구합니다',
              content: '신입생인데 파이썬프로그래밍과 컴퓨터의이해 중고 교재 있으신 선배님 계시면 구매하고 싶습니다. 댓글 부탁드립니다!',
              category: '삽니다',
              price: '협의',
              status: '거래가능',
              author: '새내기학우',
              author_id: null,
              created_at: '2026-10-24 10:05',
              views: 15,
            },
          ];
          const stmts = initialMarketPosts.map((m) =>
            db
              .prepare(
                'INSERT INTO market_posts (id, title, content, category, price, status, author, author_id, created_at, views) VALUES (?,?,?,?,?,?,?,?,?,?)'
              )
              .bind(m.id, m.title, m.content, m.category, m.price, m.status, m.author, m.author_id, m.created_at, m.views)
          );
          stmts.push(db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('market_posts_init', '1')"));
          await db.batch(stmts);
          posts = initialMarketPosts as any;
        }
      }
      const { results: replies } = await db.prepare('SELECT * FROM market_post_replies ORDER BY created_at ASC, rowid ASC').all();
      return json((posts || []).map((p: any) => ({ ...p, replies: (replies || []).filter((r: any) => r.post_id === p.id) })));
    }
    if (method === 'POST') {
      const writer = requireSignedIn(session);
      const b: any = await readJson(req);
      if (b.type === 'reply') {
        const r = {
          id: `mk-reply-${Date.now()}-${randomHex(3)}`,
          post_id: str(b.post_id, 80),
          author: writer.nickname,
          author_id: writer.id,
          content: str(b.content, 2000),
          created_at: nowMinute(),
        };
        if (!r.content) throw new HttpError(400, '댓글 내용을 입력해 주세요.');
        await db
          .prepare('INSERT INTO market_post_replies (id, post_id, author, author_id, content, created_at) VALUES (?,?,?,?,?,?)')
          .bind(r.id, r.post_id, r.author, r.author_id, r.content, r.created_at)
          .run();
        return json(r);
      }
      const p = {
        id: `mk-${Date.now()}-${randomHex(3)}`,
        title: str(b.title, 200),
        content: str(b.content, 20000),
        category: str(b.category, 20) || '팝니다',
        price: str(b.price, 50) || (b.category === '무료나눔' ? '무료나눔' : '협의'),
        status: str(b.status, 20) || '거래가능',
        author: writer.nickname,
        author_id: writer.id,
        created_at: nowMinute(),
        views: 1,
        replies: [],
      };
      if (!p.title || !p.content) throw new HttpError(400, '제목과 내용을 입력해 주세요.');
      await db
        .prepare(
          'INSERT INTO market_posts (id, title, content, category, price, status, author, author_id, created_at, views) VALUES (?,?,?,?,?,?,?,?,?,?)'
        )
        .bind(p.id, p.title, p.content, p.category, p.price, p.status, p.author, p.author_id, p.created_at, p.views)
        .run();
      await db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('market_posts_init', '1')").run();
      return json(p);
    }
    if (method === 'PUT' && id) {
      const row: any = await db.prepare('SELECT author_id FROM market_posts WHERE id = ?').bind(id).first();
      if (!row) throw new HttpError(404, '게시글을 찾을 수 없습니다.');
      if (!canModify(session, row.author_id)) throw new HttpError(403, '본인이 작성한 글만 상태를 변경할 수 있습니다.');
      const b: any = await readJson(req);
      if (b.status) {
        await db.prepare('UPDATE market_posts SET status = ? WHERE id = ?').bind(str(b.status, 20), id).run();
      }
      return json({ success: true });
    }
    if (method === 'DELETE' && id) {
      const replyId = url.searchParams.get('reply_id');
      if (replyId) {
        const rRow: any = await db.prepare('SELECT author_id FROM market_post_replies WHERE id = ?').bind(replyId).first();
        if (!rRow) throw new HttpError(404, '댓글을 찾을 수 없습니다.');
        if (!canModify(session, rRow.author_id)) throw new HttpError(403, '본인이 작성한 댓글만 삭제할 수 있습니다.');
        await db.prepare('DELETE FROM market_post_replies WHERE id = ?').bind(replyId).run();
        return json({ success: true });
      }
      const row: any = await db.prepare('SELECT author_id FROM market_posts WHERE id = ?').bind(id).first();
      if (!row) throw new HttpError(404, '게시글을 찾을 수 없습니다.');
      if (!canModify(session, row.author_id)) throw new HttpError(403, '본인이 작성한 글만 삭제할 수 있습니다.');
      await db.prepare('DELETE FROM market_post_replies WHERE post_id = ?').bind(id).run();
      await db.prepare('DELETE FROM market_posts WHERE id = ?').bind(id).run();
      await db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('market_posts_init', '1')").run();
      return json({ success: true });
    }
  }

  // ---- qna (Q&A 코너: read: public / write & reply: any signed-up member or admin)
  if (resource === 'qna') {
    if (method === 'GET') {
      let { results: posts } = await db.prepare('SELECT * FROM qna_posts ORDER BY created_at DESC, rowid DESC').all();
      if (!posts || posts.length === 0) {
        const initRow = await db.prepare("SELECT value FROM settings WHERE key = 'qna_posts_init'").first();
        if (!initRow) {
          const initialQnaPosts = [
            {
              id: 'qna-1',
              title: '직장인이라 출석수업 참여가 어려운데 대체시험은 어떻게 신청하나요?',
              content: '평일 및 주말 출석수업 일정에 직장 근무가 겹쳐 참석이 어렵습니다. 출석수업을 대체시험으로 변경하는 절차와 신청 기간이 궁금합니다!',
              category: '출석/과제/시험',
              status: '답변완료',
              author: '직장인학우',
              author_id: null,
              created_at: '2026-10-18 11:20',
              views: 42,
            },
            {
              id: 'qna-2',
              title: '중간과제물 작성 시 카피킬러(표절 검사)는 어디서 확인하나요?',
              content: '중간과제물을 제출하기 전에 표절률을 미리 점검해보고 싶은데 학교에서 무료로 제공하는 사이트가 있나요? 권장 기준도 알려주시면 감사하겠습니다.',
              category: '출석/과제/시험',
              status: '답변완료',
              author: '열정새내기',
              author_id: null,
              created_at: '2026-10-21 16:40',
              views: 35,
            },
            {
              id: 'qna-3',
              title: '비전공자 신·편입생인데 1학기/2학기 전공 과목 공부 순서 조언 부탁드려요!',
              content: 'IT 비전공자로 입학했습니다. 코딩 기초가 부족한 상태에서 어떤 과목부터 집중해서 듣고 학습자료실을 어떻게 활용하면 좋을지 선배님들의 팁이 궁금합니다.',
              category: '전공/학습',
              status: '답변완료',
              author: '비전공도전자',
              author_id: null,
              created_at: '2026-10-23 20:10',
              views: 29,
            },
          ];
          const initialQnaReplies = [
            {
              id: 'qna-r-1',
              post_id: 'qna-1',
              author: '학생회 학술부',
              author_id: null,
              content: '출석수업 과목은 지정된 기간에 U-KNOU 홈페이지 [학사정보 > 수업/시험 > 출석수업유형변경] 메뉴에서 "대체시험"으로 변경하실 수 있습니다. 대체시험으로 변경하시면 기말시험 기간에 객관식 또는 온라인 시험으로 평가를 대체하게 됩니다.',
              created_at: '2026-10-18 13:05',
            },
            {
              id: 'qna-r-2',
              post_id: 'qna-2',
              author: '컴과선배',
              author_id: null,
              content: '한국방송통신대학교 중앙도서관 홈페이지 로그인 후 [연구·학습지원 > 카피킬러 캠퍼스]를 통해 무료로 표절 검사를 받아보실 수 있습니다. 통상 15%~20% 이하의 표절률을 권장하며, 인용 코드나 레퍼런스는 주석과 참고문헌으로 명확히 출처를 기재하시면 됩니다!',
              created_at: '2026-10-21 18:12',
            },
            {
              id: 'qna-r-3',
              post_id: 'qna-3',
              author: '3학년멘토',
              author_id: null,
              content: '반갑습니다! 1학년 과목인 [컴퓨터의이해], [파이썬프로그래밍], [C프로그래밍]부터 차근차근 시작하시는 것을 추천드립니다. 상단 [학술·스터디 > 학습자료] 게시판에서 학년·학기별로 선배들이 올려둔 요약본과 기출 해설을 먼저 훑어보시면 훨씬 수월하실 거예요!',
              created_at: '2026-10-23 21:30',
            },
          ];
          const stmts = [
            ...initialQnaPosts.map((q) =>
              db
                .prepare(
                  'INSERT INTO qna_posts (id, title, content, category, status, author, author_id, created_at, views) VALUES (?,?,?,?,?,?,?,?,?)'
                )
                .bind(q.id, q.title, q.content, q.category, q.status, q.author, q.author_id, q.created_at, q.views)
            ),
            ...initialQnaReplies.map((r) =>
              db
                .prepare('INSERT INTO qna_post_replies (id, post_id, author, author_id, content, created_at) VALUES (?,?,?,?,?,?)')
                .bind(r.id, r.post_id, r.author, r.author_id, r.content, r.created_at)
            ),
            db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('qna_posts_init', '1')"),
          ];
          await db.batch(stmts);
          posts = initialQnaPosts as any;
        }
      }
      const { results: replies } = await db.prepare('SELECT * FROM qna_post_replies ORDER BY created_at ASC, rowid ASC').all();
      return json((posts || []).map((p: any) => ({ ...p, replies: (replies || []).filter((r: any) => r.post_id === p.id) })));
    }
    if (method === 'POST') {
      const writer = requireSignedIn(session);
      const b: any = await readJson(req);
      if (b.type === 'reply') {
        const r = {
          id: `qna-reply-${Date.now()}-${randomHex(3)}`,
          post_id: str(b.post_id, 80),
          author: writer.nickname,
          author_id: writer.id,
          content: str(b.content, 2000),
          created_at: nowMinute(),
        };
        if (!r.content) throw new HttpError(400, '답변/댓글 내용을 입력해 주세요.');
        await db
          .prepare('INSERT INTO qna_post_replies (id, post_id, author, author_id, content, created_at) VALUES (?,?,?,?,?,?)')
          .bind(r.id, r.post_id, r.author, r.author_id, r.content, r.created_at)
          .run();
        await db.prepare("UPDATE qna_posts SET status = '답변완료' WHERE id = ?").bind(r.post_id).run();
        return json(r);
      }
      const p = {
        id: `qna-${Date.now()}-${randomHex(3)}`,
        title: str(b.title, 200),
        content: str(b.content, 20000),
        category: str(b.category, 20) || '전공/학습',
        status: '답변대기',
        author: writer.nickname,
        author_id: writer.id,
        created_at: nowMinute(),
        views: 1,
        replies: [],
      };
      if (!p.title || !p.content) throw new HttpError(400, '질문 제목과 내용을 입력해 주세요.');
      await db
        .prepare(
          'INSERT INTO qna_posts (id, title, content, category, status, author, author_id, created_at, views) VALUES (?,?,?,?,?,?,?,?,?)'
        )
        .bind(p.id, p.title, p.content, p.category, p.status, p.author, p.author_id, p.created_at, p.views)
        .run();
      await db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('qna_posts_init', '1')").run();
      return json(p);
    }
    if (method === 'DELETE' && id) {
      const replyId = url.searchParams.get('reply_id');
      if (replyId) {
        const rRow: any = await db.prepare('SELECT author_id FROM qna_post_replies WHERE id = ?').bind(replyId).first();
        if (!rRow) throw new HttpError(404, '댓글을 찾을 수 없습니다.');
        if (!canModify(session, rRow.author_id)) throw new HttpError(403, '본인이 작성한 댓글만 삭제할 수 있습니다.');
        await db.prepare('DELETE FROM qna_post_replies WHERE id = ?').bind(replyId).run();
        return json({ success: true });
      }
      const row: any = await db.prepare('SELECT author_id FROM qna_posts WHERE id = ?').bind(id).first();
      if (!row) throw new HttpError(404, '질문글을 찾을 수 없습니다.');
      if (!canModify(session, row.author_id)) throw new HttpError(403, '본인이 작성한 글만 삭제할 수 있습니다.');
      await db.prepare('DELETE FROM qna_post_replies WHERE post_id = ?').bind(id).run();
      await db.prepare('DELETE FROM qna_posts WHERE id = ?').bind(id).run();
      await db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('qna_posts_init', '1')").run();
      return json({ success: true });
    }
  }

  // ---- studies (member applies -> admin approves)
  if (resource === 'studies') {
    if (method === 'GET') {
      let rows: any[];
      if (session.admin) {
        rows = (await db.prepare('SELECT * FROM studies ORDER BY created_at DESC').all()).results;
      } else {
        rows = (
          await db
            .prepare("SELECT * FROM studies WHERE approval = 'approved' OR (author_id IS NOT NULL AND author_id = ?) ORDER BY created_at DESC")
            .bind(session.member ? session.member.id : '')
            .all()
        ).results;
      }
      return json(rows);
    }
    if (method === 'POST') {
      const b: any = await readJson(req);
      let leader: string, authorId: string | null, approval: string;
      if (isCouncil(session)) {
        leader = (session.member && session.member.nickname) || str(b.leader, 50) || '학생회';
        authorId = session.member ? session.member.id : null;
        approval = 'approved';
      } else {
        const member = requireMember(session);
        if (session.member?.role === 'associate' || !isRegularOrAbove(session)) {
          throw new HttpError(403, '준회원 등급은 스터디 개설 신청이 불가능합니다. (열람 전용)');
        }
        leader = member.nickname;
        authorId = member.id;
        approval = 'pending';
      }
      const s = {
        id: `study-${Date.now()}-${randomHex(3)}`,
        title: str(b.title, 100),
        subject: str(b.subject, 100),
        status: '모집중',
        members_count: 1,
        max_members: Math.min(Math.max(Number(b.max_members) || 8, 2), 50),
        target_grade: str(b.target_grade, 30) || '전학년',
        meeting_type: str(b.meeting_type, 40) || '온/오프라인 병행',
        leader,
        leader_contact: str(b.leader_contact, 100),
        description: str(b.description, 3000),
        created_at: today(),
        author_id: authorId,
        approval,
      };
      if (!s.title || !s.subject) throw new HttpError(400, '스터디 제목과 주제를 입력해 주세요.');
      await db
        .prepare(
          `INSERT INTO studies (id, title, subject, status, members_count, max_members, target_grade, meeting_type, leader,
                                leader_contact, description, created_at, author_id, approval)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
        )
        .bind(s.id, s.title, s.subject, s.status, s.members_count, s.max_members, s.target_grade, s.meeting_type,
          s.leader, s.leader_contact, s.description, s.created_at, s.author_id, s.approval)
        .run();
      return json(s);
    }
    if (method === 'PUT' && id) {
      requireCouncilManager(session);
      const b: any = await readJson(req);
      const allowedStatus = ['모집중', '진행중', '마감', '종료'];
      const allowedApproval = ['approved', 'pending', 'rejected'];
      const sets: string[] = [];
      const vals: any[] = [];
      if (b.status !== undefined) {
        if (!allowedStatus.includes(b.status)) throw new HttpError(400, '잘못된 상태 값입니다.');
        sets.push('status = ?'); vals.push(b.status);
      }
      if (b.approval !== undefined) {
        if (!allowedApproval.includes(b.approval)) throw new HttpError(400, '잘못된 승인 값입니다.');
        sets.push('approval = ?'); vals.push(b.approval);
      }
      if (b.members_count !== undefined) { sets.push('members_count = ?'); vals.push(Number(b.members_count) || 1); }
      if (b.max_members !== undefined) { sets.push('max_members = ?'); vals.push(Number(b.max_members) || 8); }
      const textFields: [string, number][] = [
        ['title', 100], ['subject', 100], ['target_grade', 30], ['meeting_type', 40],
        ['leader', 50], ['leader_contact', 100], ['description', 3000],
      ];
      for (const [field, max] of textFields) {
        if (b[field] !== undefined) { sets.push(`${field} = ?`); vals.push(str(b[field], max)); }
      }
      if (!sets.length) throw new HttpError(400, '변경할 내용이 없습니다.');
      await db.prepare(`UPDATE studies SET ${sets.join(', ')} WHERE id = ?`).bind(...vals, id).run();
      return json({ success: true });
    }
    if (method === 'DELETE' && id) {
      const row: any = await db.prepare('SELECT author_id FROM studies WHERE id = ?').bind(id).first();
      if (!row) throw new HttpError(404, '스터디를 찾을 수 없습니다.');
      if (!canModify(session, row.author_id)) throw new HttpError(403, '권한이 없습니다.');
      await db.prepare('DELETE FROM studies WHERE id = ?').bind(id).run();
      return json({ success: true });
    }
  }

  // ---- council-intro
  if (resource === 'council-intro') {
    if (method === 'GET') {
      const row: any = await db.prepare("SELECT value FROM settings WHERE key = 'council_intro'").first();
      if (row && row.value) {
        try {
          return json(JSON.parse(row.value));
        } catch {
          /* fallback */
        }
      }
      return json(null);
    }
    if (method === 'PUT' || method === 'POST') {
      requireCouncilManager(session);
      const b: any = await readJson(req);
      const intro = {
        title: str(b.title, 200),
        president_greeting: str(b.president_greeting, 10000),
        president_name: str(b.president_name, 50),
        president_role: str(b.president_role, 100),
      };
      await db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('council_intro', ?)").bind(JSON.stringify(intro)).run();
      return json(intro);
    }
  }

  // ---- council-members
  if (resource === 'council-members') {
    if (method === 'GET') {
      let { results } = await db.prepare('SELECT * FROM council_members ORDER BY rowid ASC').all();
      // If table is empty and has not been initialized yet, seed with initial mock council members
      if (!results || results.length === 0) {
        const initRow = await db.prepare("SELECT value FROM settings WHERE key = 'council_members_init'").first();
        if (!initRow) {
          const initialCouncilMembers = [
            { id: 'cm-1', role: '학생회장', name: '김민수', grade_info: '컴퓨터과학과 3학년', message: '학우 여러분의 든든한 러닝메이트가 되겠습니다. 언제든 학생회 문을 두드려주세요!', email: 'president@knou-cs-gj.org' },
            { id: 'cm-2', role: '부학생회장', name: '이지은', grade_info: '컴퓨터과학과 3학년', message: '신·편입생 여러분이 학교 생활에 빠르게 적응하실 수 있도록 살뜰히 돕겠습니다.', email: 'vice@knou-cs-gj.org' },
            { id: 'cm-3', role: '총무부장', name: '박진우', grade_info: '컴퓨터과학과 2학년', message: '소중한 학생회비를 1원도 헛되이 쓰지 않고 투명하고 명확하게 관리하겠습니다.', email: 'finance@knou-cs-gj.org' },
            { id: 'cm-4', role: '학술부장', name: '정현우', grade_info: '컴퓨터과학과 3학년', message: '스터디 그룹 활성화와 과제/기말 가이드로 든든한 학업 나침반이 되겠습니다.', email: 'study@knou-cs-gj.org' },
            { id: 'cm-5', role: '기획부장', name: '최수연', grade_info: '컴퓨터과학과 4학년', message: '체육대회, MT 등 학우 여러분이 다 함께 즐길 수 있는 특별한 추억을 선물하겠습니다.', email: 'plan@knou-cs-gj.org' },
            { id: 'cm-6', role: '홍보부장', name: '한동훈', grade_info: '컴퓨터과학과 2학년', message: '학과 소식과 중요한 학사 일정을 언제 어디서든 가장 빠르고 정확하게 전해드리겠습니다.', email: 'press@knou-cs-gj.org' }
          ];
          const stmts = initialCouncilMembers.map((m) =>
            db
              .prepare('INSERT INTO council_members (id, role, name, grade_info, message, email) VALUES (?, ?, ?, ?, ?, ?)')
              .bind(m.id, m.role, m.name, m.grade_info, m.message, m.email)
          );
          stmts.push(db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('council_members_init', '1')"));
          await db.batch(stmts);
          results = initialCouncilMembers as any;
        }
      }
      return json(results || []);
    }
    if (method === 'POST') {
      requireCouncilManager(session);
      const b: any = await readJson(req);
      const m = {
        id: b.id ? str(b.id, 50) : `cm-${Date.now()}-${randomHex(2)}`,
        role: str(b.role, 50),
        name: str(b.name, 50),
        grade_info: str(b.grade_info, 50),
        message: str(b.message, 500),
        email: str(b.email, 100) || null,
      };
      if (!m.role || !m.name) throw new HttpError(400, '직책과 성명을 입력해 주세요.');
      await db
        .prepare('INSERT INTO council_members (id, role, name, grade_info, message, email) VALUES (?, ?, ?, ?, ?, ?)')
        .bind(m.id, m.role, m.name, m.grade_info, m.message, m.email)
        .run();
      await db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('council_members_init', '1')").run();
      return json(m, 201);
    }
    if (method === 'PUT' && id) {
      requireCouncilManager(session);
      const b: any = await readJson(req);
      const sets: string[] = [];
      const vals: any[] = [];
      for (const field of ['role', 'name', 'grade_info', 'message', 'email'] as const) {
        if (b[field] !== undefined) {
          sets.push(`${field} = ?`);
          vals.push(str(b[field], field === 'message' ? 500 : 100));
        }
      }
      if (!sets.length) throw new HttpError(400, '변경할 내용이 없습니다.');
      await db.prepare(`UPDATE council_members SET ${sets.join(', ')} WHERE id = ?`).bind(...vals, id).run();
      await db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('council_members_init', '1')").run();
      return json({ success: true });
    }
    if (method === 'DELETE' && id) {
      requireCouncilManager(session);
      await db.prepare('DELETE FROM council_members WHERE id = ?').bind(id).run();
      await db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('council_members_init', '1')").run();
      return json({ success: true, id });
    }
  }

  // ---- meeting minutes (Read: public / Create&Update: president & master admin / Delete: master admin only with mandatory reason)
  if (resource === 'minutes') {
    if (method === 'GET') {
      const includeDeleted = session.admin && url.searchParams.get('include_deleted') === 'true';
      const sql = includeDeleted
        ? 'SELECT * FROM meeting_minutes ORDER BY meeting_date DESC, id DESC'
        : 'SELECT * FROM meeting_minutes WHERE is_deleted = 0 OR is_deleted IS NULL ORDER BY meeting_date DESC, id DESC';
      const { results } = await db.prepare(sql).all();
      return json(
        results.map((r: any) => {
          let attachments: any[] = [];
          try { attachments = JSON.parse(r.attachments_json || '[]'); } catch { attachments = []; }
          let edit_history: any[] = [];
          try { edit_history = JSON.parse(r.edit_history || '[]'); } catch { edit_history = []; }
          return {
            ...r,
            attachments,
            edit_history,
            is_deleted: !!r.is_deleted,
          };
        })
      );
    }
    if (method === 'POST') {
      requireCouncilManager(session);
      const b: any = await readJson(req);
      const m = {
        id: b.id ? str(b.id, 50) : `minute-${Date.now()}-${randomHex(2)}`,
        title: str(b.title, 150),
        meeting_type: str(b.meeting_type, 50) || '정기임원회의',
        meeting_date: str(b.meeting_date, 20) || today(),
        location: str(b.location, 150) || '광주전남지역대학 본관 405호 학생회실',
        attendees: str(b.attendees, 500),
        agenda: str(b.agenda, 1000),
        content: str(b.content, 20000),
        decisions: str(b.decisions, 3000),
        chairperson: str(b.chairperson, 50) || (session.member?.name || '학생회장'),
        recorder: str(b.recorder, 50) || (session.member?.name || '총무부장'),
        attachments_json: Array.isArray(b.attachments) ? JSON.stringify(b.attachments) : '[]',
        created_by: session.admin ? '총괄관리자' : (session.member?.name || session.member?.nickname || '학생회장'),
        created_at: new Date().toISOString(),
        is_deleted: 0,
        edit_history: '[]'
      };
      if (!m.title) throw new HttpError(400, '회의 제목을 입력해 주세요.');
      if (!m.decisions) throw new HttpError(400, '의결 사항을 입력해 주세요.');
      await db
        .prepare(
          `INSERT INTO meeting_minutes (
            id, title, meeting_type, meeting_date, location, attendees, agenda, content, decisions,
            chairperson, recorder, attachments_json, created_by, created_at, is_deleted, edit_history
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, '[]')`
        )
        .bind(
          m.id, m.title, m.meeting_type, m.meeting_date, m.location, m.attendees, m.agenda, m.content, m.decisions,
          m.chairperson, m.recorder, m.attachments_json, m.created_by, m.created_at
        )
        .run();
      return json({ ...m, attachments: Array.isArray(b.attachments) ? b.attachments : [], edit_history: [] }, 201);
    }
    if (method === 'PUT' && id) {
      requireCouncilManager(session);
      const b: any = await readJson(req);
      const editReason = str(b.edit_reason, 500);
      if (!editReason) {
        throw new HttpError(400, '회의록 수정 시 정정/수정 사유는 필수 입력 사항입니다.');
      }
      const existing: any = await db.prepare('SELECT * FROM meeting_minutes WHERE id = ?').bind(id).first();
      if (!existing) throw new HttpError(404, '해당 회의록을 찾을 수 없습니다.');

      let history: any[] = [];
      try { history = JSON.parse(existing.edit_history || '[]'); } catch { history = []; }
      history.push({
        edited_at: new Date().toISOString(),
        edited_by: session.admin ? '총괄관리자' : (session.member?.name || session.member?.nickname || '학생회장'),
        reason: editReason
      });

      const updated = {
        title: b.title !== undefined ? str(b.title, 150) : existing.title,
        meeting_type: b.meeting_type !== undefined ? str(b.meeting_type, 50) : existing.meeting_type,
        meeting_date: b.meeting_date !== undefined ? str(b.meeting_date, 20) : existing.meeting_date,
        location: b.location !== undefined ? str(b.location, 150) : existing.location,
        attendees: b.attendees !== undefined ? str(b.attendees, 500) : existing.attendees,
        agenda: b.agenda !== undefined ? str(b.agenda, 1000) : existing.agenda,
        content: b.content !== undefined ? str(b.content, 20000) : existing.content,
        decisions: b.decisions !== undefined ? str(b.decisions, 3000) : existing.decisions,
        chairperson: b.chairperson !== undefined ? str(b.chairperson, 50) : existing.chairperson,
        recorder: b.recorder !== undefined ? str(b.recorder, 50) : existing.recorder,
        attachments_json: Array.isArray(b.attachments) ? JSON.stringify(b.attachments) : existing.attachments_json,
        edit_history: JSON.stringify(history)
      };

      await db
        .prepare(
          `UPDATE meeting_minutes SET
            title=?, meeting_type=?, meeting_date=?, location=?, attendees=?, agenda=?, content=?,
            decisions=?, chairperson=?, recorder=?, attachments_json=?, edit_history=?
          WHERE id=?`
        )
        .bind(
          updated.title, updated.meeting_type, updated.meeting_date, updated.location, updated.attendees,
          updated.agenda, updated.content, updated.decisions, updated.chairperson, updated.recorder,
          updated.attachments_json, updated.edit_history, id
        )
        .run();
      return json({ success: true });
    }
    if (method === 'DELETE' && id) {
      requireAdmin(session);
      let reason = str(url.searchParams.get('deleted_reason'), 500);
      if (!reason) {
        const b: any = await readJson(req).catch(() => ({}));
        reason = str(b.deleted_reason, 500);
      }
      if (!reason) {
        throw new HttpError(400, '회의록 삭제 시 삭제 사유를 반드시 입력해야 합니다.');
      }
      const existing: any = await db.prepare('SELECT * FROM meeting_minutes WHERE id = ?').bind(id).first();
      if (!existing) throw new HttpError(404, '해당 회의록을 찾을 수 없습니다.');

      await db
        .prepare('UPDATE meeting_minutes SET is_deleted = 1, deleted_reason = ?, deleted_at = ?, deleted_by = ? WHERE id = ?')
        .bind(reason, new Date().toISOString(), '총괄관리자', id)
        .run();
      return json({ success: true, message: '감사 사유와 함께 안전하게 보존 처리되었습니다.' });
    }
  }

  // ---- activities (학과 활동보고 사진 & 영상)
  if (resource === 'activities') {
    if (tail === 'views' && id && method === 'POST') {
      await db.prepare('UPDATE activity_reports SET views = views + 1 WHERE id = ?').bind(id).run();
      return json({ success: true });
    }

    if (method === 'GET') {
      const sql = 'SELECT * FROM activity_reports WHERE is_deleted = 0 OR is_deleted IS NULL ORDER BY is_pinned DESC, activity_date DESC, created_at DESC';
      const { results } = await db.prepare(sql).all();
      return json(
        results.map((r: any) => ({
          id: r.id,
          title: r.title,
          category: r.category,
          description: r.description || '',
          activity_date: r.activity_date,
          media_type: r.media_type || 'image',
          media_url: r.media_url,
          thumbnail_url: r.thumbnail_url || null,
          youtube_id: r.youtube_id || null,
          author: r.author || '학생회',
          created_by: r.created_by || null,
          views: Number(r.views) || 1,
          is_pinned: !!r.is_pinned,
          created_at: r.created_at,
        }))
      );
    }

    if (method === 'POST') {
      requireCouncil(session);
      const b: any = await readJson(req);
      const title = str(b.title, 150);
      if (!title) throw new HttpError(400, '활동보고 제목을 입력해 주세요.');
      const mediaUrl = str(b.media_url, 1000000);
      if (!mediaUrl) throw new HttpError(400, '사진 또는 영상 미디어를 등록해 주세요.');

      const act = {
        id: b.id ? str(b.id, 50) : `act-${Date.now()}-${randomHex(2)}`,
        title,
        category: str(b.category, 30) || '행사',
        description: str(b.description, 2000) || '',
        activity_date: str(b.activity_date, 20) || today(),
        media_type: b.media_type === 'video' ? 'video' : 'image',
        media_url: mediaUrl,
        thumbnail_url: b.thumbnail_url ? str(b.thumbnail_url, 1000) : null,
        youtube_id: b.youtube_id ? str(b.youtube_id, 50) : null,
        author: session.admin ? '총괄관리자' : (session.member?.name || session.member?.nickname || '학생회'),
        created_by: session.admin ? 'admin' : (session.member?.id || null),
        views: 1,
        is_pinned: b.is_pinned ? 1 : 0,
        is_deleted: 0,
        created_at: new Date().toISOString(),
      };

      await db
        .prepare(
          `INSERT INTO activity_reports (
            id, title, category, description, activity_date, media_type, media_url,
            thumbnail_url, youtube_id, author, created_by, views, is_pinned, is_deleted, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)`
        )
        .bind(
          act.id, act.title, act.category, act.description, act.activity_date,
          act.media_type, act.media_url, act.thumbnail_url, act.youtube_id,
          act.author, act.created_by, act.views, act.is_pinned, act.created_at
        )
        .run();

      return json(act, 201);
    }

    if (method === 'PUT' && id) {
      requireCouncil(session);
      const existing: any = await db.prepare('SELECT * FROM activity_reports WHERE id = ?').bind(id).first();
      if (!existing) throw new HttpError(404, '활동보고를 찾을 수 없습니다.');
      const isManager = session.admin || isPresident(session);
      const isOwner = session.member && existing.created_by && session.member.id === existing.created_by;
      const isOwnerByAuthor = !existing.created_by && session.member && (existing.author === session.member.name || existing.author === session.member.nickname);
      if (!isManager && !isOwner && !isOwnerByAuthor) {
        throw new HttpError(403, '임원은 본인이 게시한 활동보고만 수정할 수 있습니다.');
      }

      const b: any = await readJson(req);
      const title = str(b.title, 150);
      if (!title) throw new HttpError(400, '활동보고 제목을 입력해 주세요.');
      const mediaUrl = str(b.media_url, 1000000);
      if (!mediaUrl) throw new HttpError(400, '사진 또는 영상 미디어를 등록해 주세요.');

      await db
        .prepare(
          `UPDATE activity_reports SET
            title = ?, category = ?, description = ?, activity_date = ?,
            media_type = ?, media_url = ?, thumbnail_url = ?, youtube_id = ?,
            is_pinned = ?
          WHERE id = ?`
        )
        .bind(
          title, str(b.category, 30) || '행사', str(b.description, 2000) || '',
          str(b.activity_date, 20) || today(), b.media_type === 'video' ? 'video' : 'image',
          mediaUrl, b.thumbnail_url ? str(b.thumbnail_url, 1000) : null,
          b.youtube_id ? str(b.youtube_id, 50) : null, b.is_pinned ? 1 : 0, id
        )
        .run();

      return json({ success: true, id });
    }

    if (method === 'DELETE' && id) {
      requireCouncil(session);
      const existing: any = await db.prepare('SELECT * FROM activity_reports WHERE id = ?').bind(id).first();
      if (!existing) throw new HttpError(404, '해당 활동보고를 찾을 수 없습니다.');

      // 임원은 본인이 게시한 것만 삭제 가능! (관리자/학생회장은 전체 삭제 가능)
      const isManager = session.admin || isPresident(session);
      const isOwner = session.member && existing.created_by && session.member.id === existing.created_by;
      const isOwnerByAuthor = !existing.created_by && session.member && (existing.author === session.member.name || existing.author === session.member.nickname);

      if (!isManager && !isOwner && !isOwnerByAuthor) {
        throw new HttpError(403, '임원은 본인이 게시한 활동보고만 삭제할 수 있습니다.');
      }

      const b: any = await readJson(req).catch(() => ({}));
      const reason = str(b.reason, 500);
      if (!reason) {
        throw new HttpError(400, '삭제 사유를 반드시 입력해야 합니다.');
      }

      const deleterName = session.admin
        ? '총괄관리자'
        : isPresident(session)
        ? `학생회장(${session.member?.name || ''})`
        : `임원(${session.member?.name || ''})`;

      await db
        .prepare(
          `UPDATE activity_reports SET
            is_deleted = 1, deleted_reason = ?, deleted_at = ?, deleted_by = ?
          WHERE id = ?`
        )
        .bind(
          reason, new Date().toISOString(), deleterName, id
        )
        .run();

      return json({ success: true, id });
    }
  }

  // ---- curriculum courses (개설 교육과정 교과목 관리 - Read: public / Write, Update, Delete: council)
  if (resource === 'courses') {
    // 2026 기본 교과목 재설정/복원 (관리자/학생회장 전용)
    if (tail === 'reset' && method === 'POST') {
      requireCouncilManager(session);
      await db.prepare('DELETE FROM curriculum_courses').run();
      const stmts: any[] = [];
      const now = new Date().toISOString();
      defaultCurriculumCourses.forEach((c, idx) => {
        const cid = `crs-${c.grade}-${c.semester}-${String(idx + 1).padStart(2, '0')}`;
        stmts.push(
          db
            .prepare(
              'INSERT INTO curriculum_courses (id, grade, semester, course_type, course_name, sort_order, created_at) VALUES (?,?,?,?,?,?,?)'
            )
            .bind(cid, c.grade, c.semester, c.type, c.name, idx + 1, now)
        );
      });
      await db.batch(stmts);
      return json({ success: true, count: defaultCurriculumCourses.length, message: '2026년 정규 교육과정 52개 교과목으로 재설정되었습니다.' });
    }

    if (method === 'GET') {
      const { results } = await db
        .prepare('SELECT * FROM curriculum_courses ORDER BY grade ASC, semester ASC, sort_order ASC, course_name ASC')
        .all();

      // 만약 아직 시딩되지 않았거나 비어있는 경우 fallback
      if (!results || results.length === 0) {
        return json(
          defaultCurriculumCourses.map((c, idx) => ({
            id: `crs-${c.grade}-${c.semester}-${String(idx + 1).padStart(2, '0')}`,
            grade: c.grade,
            semester: c.semester,
            course_type: c.type,
            course_name: c.name,
            sort_order: idx + 1,
            created_at: new Date().toISOString(),
          }))
        );
      }

      return json(results);
    }

    if (method === 'POST') {
      requireCouncil(session);
      const b: any = await readJson(req);
      const grade = Number(b.grade);
      const semester = Number(b.semester);
      const course_type = str(b.course_type, 20);
      const course_name = str(b.course_name, 100);
      const sort_order = Number(b.sort_order) || 0;

      if (![1, 2, 3, 4].includes(grade)) throw new HttpError(400, '학년은 1~4학년 중 선택해야 합니다.');
      if (![1, 2].includes(semester)) throw new HttpError(400, '학기는 1학기 또는 2학기여야 합니다.');
      if (!['전공', '교양', '일반선택'].includes(course_type)) {
        throw new HttpError(400, '교과구분은 전공, 교양, 일반선택 중 하나여야 합니다.');
      }
      if (!course_name) throw new HttpError(400, '교과목명을 입력해 주세요.');

      // 중복 체크
      const dup = await db
        .prepare('SELECT id FROM curriculum_courses WHERE grade = ? AND semester = ? AND course_name = ?')
        .bind(grade, semester, course_name)
        .first();
      if (dup) throw new HttpError(409, `이미 ${grade}학년 ${semester}학기에 등록된 교과목입니다.`);

      const id = b.id ? str(b.id, 50) : `crs-${grade}-${semester}-${Date.now()}`;
      const now = new Date().toISOString();

      await db
        .prepare(
          'INSERT INTO curriculum_courses (id, grade, semester, course_type, course_name, sort_order, created_at) VALUES (?,?,?,?,?,?,?)'
        )
        .bind(id, grade, semester, course_type, course_name, sort_order, now)
        .run();

      return json({ id, grade, semester, course_type, course_name, sort_order, created_at: now }, 201);
    }

    if (method === 'PUT' && id) {
      requireCouncil(session);
      const b: any = await readJson(req);
      const existing: any = await db.prepare('SELECT * FROM curriculum_courses WHERE id = ?').bind(id).first();
      if (!existing) throw new HttpError(404, '해당 교과목을 찾을 수 없습니다.');

      const grade = b.grade !== undefined ? Number(b.grade) : existing.grade;
      const semester = b.semester !== undefined ? Number(b.semester) : existing.semester;
      const course_type = b.course_type !== undefined ? str(b.course_type, 20) : existing.course_type;
      const course_name = b.course_name !== undefined ? str(b.course_name, 100) : existing.course_name;
      const sort_order = b.sort_order !== undefined ? Number(b.sort_order) : existing.sort_order;

      if (![1, 2, 3, 4].includes(grade)) throw new HttpError(400, '학년은 1~4학년 중 선택해야 합니다.');
      if (![1, 2].includes(semester)) throw new HttpError(400, '학기는 1학기 또는 2학기여야 합니다.');
      if (!['전공', '교양', '일반선택'].includes(course_type)) {
        throw new HttpError(400, '교과구분은 전공, 교양, 일반선택 중 하나여야 합니다.');
      }
      if (!course_name) throw new HttpError(400, '교과목명을 입력해 주세요.');

      const now = new Date().toISOString();

      await db
        .prepare(
          'UPDATE curriculum_courses SET grade = ?, semester = ?, course_type = ?, course_name = ?, sort_order = ?, updated_at = ? WHERE id = ?'
        )
        .bind(grade, semester, course_type, course_name, sort_order, now, id)
        .run();

      // 만약 과목명이 변경된 경우, 기존 등록된 학습자료의 course_name도 연동 업데이트
      if (existing.course_name !== course_name) {
        try {
          await db
            .prepare('UPDATE academic_materials SET course_name = ? WHERE course_name = ? AND grade = ? AND semester = ?')
            .bind(course_name, existing.course_name, existing.grade, existing.semester)
            .run();
        } catch {
          /* ignore */
        }
      }

      return json({ success: true, id, grade, semester, course_type, course_name, sort_order, updated_at: now });
    }

    if (method === 'DELETE' && id) {
      requireCouncil(session);
      const existing: any = await db.prepare('SELECT * FROM curriculum_courses WHERE id = ?').bind(id).first();
      if (!existing) throw new HttpError(404, '해당 교과목을 찾을 수 없습니다.');

      await db.prepare('DELETE FROM curriculum_courses WHERE id = ?').bind(id).run();
      return json({ success: true, id, message: '교과목이 삭제되었습니다.' });
    }
  }

  // ---- budget reports (Read: public / Create&Update: president & master admin / Delete: master admin only with mandatory reason / Receipt is mandatory)
  if (resource === 'budget-reports') {
    if (method === 'GET') {
      const includeDeleted = session.admin && url.searchParams.get('include_deleted') === 'true';
      const sql = includeDeleted
        ? 'SELECT * FROM budget_reports ORDER BY published_date DESC, id DESC'
        : 'SELECT * FROM budget_reports WHERE is_deleted = 0 OR is_deleted IS NULL ORDER BY published_date DESC, id DESC';
      const { results } = await db.prepare(sql).all();
      return json(
        results.map((r: any) => {
          let items: any[] = [];
          try { items = JSON.parse(r.items_json || '[]'); } catch { items = []; }
          let edit_history: any[] = [];
          try { edit_history = JSON.parse(r.edit_history || '[]'); } catch { edit_history = []; }
          return {
            id: r.id,
            title: r.title,
            period: r.period,
            income_total: Number(r.income_total) || 0,
            expense_total: Number(r.expense_total) || 0,
            balance: Number(r.balance) || 0,
            status: r.status,
            published_date: r.published_date,
            items,
            receipt_url: r.receipt_url || null,
            receipt_name: r.receipt_name || null,
            created_by: r.created_by || '학생회',
            created_at: r.created_at || r.published_date,
            edit_history,
            is_deleted: !!r.is_deleted,
            deleted_reason: r.deleted_reason || null,
            deleted_at: r.deleted_at || null,
            deleted_by: r.deleted_by || null,
          };
        })
      );
    }
    if (method === 'POST') {
      requireCouncilManager(session);
      const b: any = await readJson(req);

      const receiptUrl = typeof b.receipt_url === 'string' ? b.receipt_url.trim() : '';
      if (!receiptUrl) {
        throw new HttpError(400, '투명한 학생회비 집행을 위해 영수증/증빙 파일 첨부는 필수입니다.');
      }

      const report = {
        id: b.id ? str(b.id, 50) : `budget-${Date.now()}-${randomHex(2)}`,
        title: str(b.title, 150),
        period: str(b.period, 100),
        income_total: Number(b.income_total) || 0,
        expense_total: Number(b.expense_total) || 0,
        balance: Number(b.balance) || 0,
        status: str(b.status, 20) || '감사완료',
        published_date: str(b.published_date, 20) || today(),
        items: Array.isArray(b.items) ? b.items : [],
        receipt_url: receiptUrl,
        receipt_name: str(b.receipt_name, 150) || '결산_영수증_증빙.pdf',
        created_by: session.admin ? '총괄관리자' : (session.member?.name || session.member?.nickname || '학생회장'),
        created_at: new Date().toISOString(),
        is_deleted: 0,
        edit_history: '[]'
      };
      if (!report.title) throw new HttpError(400, '결산 보고서 제목을 입력해 주세요.');
      await db
        .prepare(
          `INSERT INTO budget_reports (
            id, title, period, income_total, expense_total, balance, status, published_date,
            items_json, receipt_url, receipt_name, created_by, created_at, is_deleted, edit_history
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, '[]')`
        )
        .bind(
          report.id, report.title, report.period, report.income_total, report.expense_total,
          report.balance, report.status, report.published_date, JSON.stringify(report.items),
          report.receipt_url, report.receipt_name, report.created_by, report.created_at
        )
        .run();
      return json({ ...report, edit_history: [] }, 201);
    }
    if (method === 'PUT' && id) {
      requireCouncilManager(session);
      const b: any = await readJson(req);
      const editReason = str(b.edit_reason, 500);
      if (!editReason) {
        throw new HttpError(400, '결산 수정 시 정정/수정 사유는 필수 입력 사항입니다.');
      }
      const existing: any = await db.prepare('SELECT * FROM budget_reports WHERE id = ?').bind(id).first();
      if (!existing) throw new HttpError(404, '해당 결산보고를 찾을 수 없습니다.');

      let history: any[] = [];
      try { history = JSON.parse(existing.edit_history || '[]'); } catch { history = []; }
      history.push({
        edited_at: new Date().toISOString(),
        edited_by: session.admin ? '총괄관리자' : (session.member?.name || session.member?.nickname || '학생회장'),
        reason: editReason
      });

      const updated = {
        title: b.title !== undefined ? str(b.title, 150) : existing.title,
        period: b.period !== undefined ? str(b.period, 100) : existing.period,
        income_total: b.income_total !== undefined ? Number(b.income_total) : existing.income_total,
        expense_total: b.expense_total !== undefined ? Number(b.expense_total) : existing.expense_total,
        balance: b.balance !== undefined ? Number(b.balance) : existing.balance,
        status: b.status !== undefined ? str(b.status, 20) : existing.status,
        published_date: b.published_date !== undefined ? str(b.published_date, 20) : existing.published_date,
        items_json: Array.isArray(b.items) ? JSON.stringify(b.items) : existing.items_json,
        receipt_url: b.receipt_url !== undefined ? str(b.receipt_url, 10000000) : existing.receipt_url,
        receipt_name: b.receipt_name !== undefined ? str(b.receipt_name, 150) : existing.receipt_name,
        edit_history: JSON.stringify(history)
      };
      await db
        .prepare(
          `UPDATE budget_reports SET
            title=?, period=?, income_total=?, expense_total=?, balance=?, status=?,
            published_date=?, items_json=?, receipt_url=?, receipt_name=?, edit_history=?
          WHERE id=?`
        )
        .bind(
          updated.title, updated.period, updated.income_total, updated.expense_total,
          updated.balance, updated.status, updated.published_date, updated.items_json,
          updated.receipt_url, updated.receipt_name, updated.edit_history, id
        )
        .run();
      return json({ success: true });
    }
    if (method === 'DELETE' && id) {
      requireAdmin(session);
      let reason = str(url.searchParams.get('deleted_reason'), 500);
      if (!reason) {
        const b: any = await readJson(req).catch(() => ({}));
        reason = str(b.deleted_reason, 500);
      }
      if (!reason) {
        throw new HttpError(400, '결산 내역 삭제 시 삭제 사유를 반드시 입력해야 합니다.');
      }
      const existing: any = await db.prepare('SELECT * FROM budget_reports WHERE id = ?').bind(id).first();
      if (!existing) throw new HttpError(404, '해당 결산보고를 찾을 수 없습니다.');

      await db
        .prepare('UPDATE budget_reports SET is_deleted = 1, deleted_reason = ?, deleted_at = ?, deleted_by = ? WHERE id = ?')
        .bind(reason, new Date().toISOString(), '총괄관리자', id)
        .run();
      return json({ success: true, message: '감사 사유와 함께 안전하게 보존 처리되었습니다.' });
    }
  }

  // ---- admin-audits (Read: master admin only)
  if (resource === 'admin-audits') {
    requireAdmin(session);
    const { results: deletedBudgets } = await db
      .prepare('SELECT * FROM budget_reports WHERE is_deleted = 1 ORDER BY deleted_at DESC')
      .all();
    const { results: deletedMinutes } = await db
      .prepare('SELECT * FROM meeting_minutes WHERE is_deleted = 1 ORDER BY deleted_at DESC')
      .all();
    return json({
      budgets: deletedBudgets.map((b: any) => ({ ...b, items: JSON.parse(b.items_json || '[]') })),
      minutes: deletedMinutes.map((m: any) => ({ ...m, attachments: JSON.parse(m.attachments_json || '[]') })),
    });
  }

  // ---- rentals (Read: public / Write: council & master admin)
  if (resource === 'rentals') {
    if (method === 'GET') {
      const { results } = await db.prepare('SELECT * FROM rental_items ORDER BY rowid ASC').all();
      return json(
        results.map((r: any) => ({
          id: r.id,
          name: r.name,
          category: r.category,
          total_qty: Number(r.total_qty) || 0,
          available_qty: Number(r.available_qty) || 0,
          location: r.location,
          status: r.status,
          desc: r.desc || '',
        }))
      );
    }
    if (method === 'POST') {
      requireCouncil(session);
      const b: any = await readJson(req);
      const item = {
        id: b.id ? str(b.id, 50) : `rent-${Date.now()}-${randomHex(2)}`,
        name: str(b.name, 100),
        category: str(b.category, 50),
        total_qty: Number(b.total_qty) || 1,
        available_qty: Number(b.available_qty) !== undefined ? Number(b.available_qty) : Number(b.total_qty) || 1,
        location: str(b.location, 100),
        status: str(b.status, 20) || '대여가능',
        desc: str(b.desc, 500),
      };
      if (!item.name) throw new HttpError(400, '비품명을 입력해 주세요.');
      await db
        .prepare(
          'INSERT INTO rental_items (id, name, category, total_qty, available_qty, location, status, desc) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
        )
        .bind(
          item.id,
          item.name,
          item.category,
          item.total_qty,
          item.available_qty,
          item.location,
          item.status,
          item.desc
        )
        .run();
      return json(item, 201);
    }
    if (method === 'PUT' && id) {
      requireCouncil(session);
      const b: any = await readJson(req);
      const existing: any = await db.prepare('SELECT * FROM rental_items WHERE id = ?').bind(id).first();
      if (!existing) throw new HttpError(404, '해당 비품을 찾을 수 없습니다.');
      const updated = {
        name: b.name !== undefined ? str(b.name, 100) : existing.name,
        category: b.category !== undefined ? str(b.category, 50) : existing.category,
        total_qty: b.total_qty !== undefined ? Number(b.total_qty) : existing.total_qty,
        available_qty: b.available_qty !== undefined ? Number(b.available_qty) : existing.available_qty,
        location: b.location !== undefined ? str(b.location, 100) : existing.location,
        status: b.status !== undefined ? str(b.status, 20) : existing.status,
        desc: b.desc !== undefined ? str(b.desc, 500) : existing.desc,
      };
      await db
        .prepare(
          'UPDATE rental_items SET name=?, category=?, total_qty=?, available_qty=?, location=?, status=?, desc=? WHERE id=?'
        )
        .bind(
          updated.name,
          updated.category,
          updated.total_qty,
          updated.available_qty,
          updated.location,
          updated.status,
          updated.desc,
          id
        )
        .run();
      return json({ success: true });
    }
    if (method === 'DELETE' && id) {
      requireCouncil(session);
      await db.prepare('DELETE FROM rental_items WHERE id = ?').bind(id).run();
      return json({ success: true });
    }
  }

  // ---- past council members (Read: public / Write: president & master admin only)
  if (resource === 'past-council-members') {
    if (method === 'GET') {
      const { results } = await db.prepare('SELECT * FROM past_council_members ORDER BY period DESC, generation DESC, sort_order ASC, rowid ASC').all();
      return json(results);
    }
    if (method === 'POST') {
      requireCouncilManager(session);
      const b: any = await readJson(req);
      const m = {
        id: b.id ? str(b.id, 50) : `pcm-${Date.now()}-${randomHex(2)}`,
        generation: str(b.generation, 50),
        period: str(b.period, 50),
        role: str(b.role, 50),
        name: str(b.name, 50),
        photo_url: typeof b.photo_url === 'string' && b.photo_url.trim() ? b.photo_url.trim() : null,
        sort_order: Number(b.sort_order) || 0,
        created_at: new Date().toISOString()
      };
      if (!m.generation || !m.role || !m.name) {
        throw new HttpError(400, '기수, 직책명, 성명은 필수 입력 항목입니다.');
      }
      await db
        .prepare('INSERT INTO past_council_members (id, generation, period, role, name, photo_url, sort_order, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
        .bind(m.id, m.generation, m.period, m.role, m.name, m.photo_url, m.sort_order, m.created_at)
        .run();
      return json(m, 201);
    }
    if (method === 'PUT' && id) {
      requireCouncilManager(session);
      const b: any = await readJson(req);
      const sets: string[] = [];
      const vals: any[] = [];
      for (const field of ['generation', 'period', 'role', 'name', 'photo_url', 'sort_order'] as const) {
        if (b[field] !== undefined) {
          sets.push(`${field} = ?`);
          vals.push(field === 'sort_order' ? (Number(b[field]) || 0) : str(b[field], field === 'photo_url' ? 2000000 : 100));
        }
      }
      if (!sets.length) throw new HttpError(400, '변경할 내용이 없습니다.');
      await db.prepare(`UPDATE past_council_members SET ${sets.join(', ')} WHERE id = ?`).bind(...vals, id).run();
      return json({ success: true });
    }
    if (method === 'DELETE' && id) {
      requireCouncilManager(session);
      await db.prepare('DELETE FROM past_council_members WHERE id = ?').bind(id).run();
      return json({ success: true });
    }
  }

  // ---- constitution versions (Read: public / Write: master admin only)
  if (resource === 'constitution-versions') {
    if (method === 'GET') {
      if (id) {
        const row: any = await db.prepare('SELECT * FROM constitution_versions WHERE id = ?').bind(id).first();
        if (!row) throw new HttpError(404, '해당 회칙 버전을 찾을 수 없습니다.');
        return json({
          ...row,
          is_current: row.is_current === 1,
          documents: JSON.parse(row.content_json)
        });
      }
      const { results } = await db.prepare('SELECT * FROM constitution_versions ORDER BY is_current DESC, revision_date DESC, created_at DESC').all();
      const parsed = (results || []).map((row: any) => ({
        ...row,
        is_current: row.is_current === 1,
        documents: JSON.parse(row.content_json)
      }));
      return json(parsed);
    }

    if (method === 'POST') {
      requireAdmin(session);
      const b: any = await readJson(req);
      if (!b.title || !b.revision_date || !b.documents) {
        throw new HttpError(400, '회칙 명칭, 개정일자 및 회칙 문서 내용이 필요합니다.');
      }
      const newId = b.id ? str(b.id, 50) : `ver-${Date.now()}-${randomHex(2)}`;
      const isCurrent = b.is_current ? 1 : 0;
      const now = new Date().toISOString();

      if (isCurrent === 1) {
        await db.prepare('UPDATE constitution_versions SET is_current = 0').run();
      }

      await db
        .prepare(
          'INSERT INTO constitution_versions (id, title, revision_date, is_current, description, content_json, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
        )
        .bind(
          newId,
          str(b.title, 100),
          str(b.revision_date, 50),
          isCurrent,
          b.description ? str(b.description, 500) : '',
          JSON.stringify(b.documents),
          now,
          now
        )
        .run();

      return json(
        {
          id: newId,
          title: b.title,
          revision_date: b.revision_date,
          is_current: isCurrent === 1,
          description: b.description || '',
          documents: b.documents,
          created_at: now,
          updated_at: now
        },
        201
      );
    }

    if (method === 'PUT' && id) {
      requireAdmin(session);
      const existing: any = await db.prepare('SELECT * FROM constitution_versions WHERE id = ?').bind(id).first();
      if (!existing) throw new HttpError(404, '수정할 회칙 버전을 찾을 수 없습니다.');

      const b: any = await readJson(req);
      const isCurrent = typeof b.is_current === 'boolean' ? (b.is_current ? 1 : 0) : existing.is_current;
      const now = new Date().toISOString();

      if (isCurrent === 1 && existing.is_current !== 1) {
        await db.prepare('UPDATE constitution_versions SET is_current = 0').run();
      }

      const updatedTitle = b.title !== undefined ? str(b.title, 100) : existing.title;
      const updatedDate = b.revision_date !== undefined ? str(b.revision_date, 50) : existing.revision_date;
      const updatedDesc = b.description !== undefined ? str(b.description, 500) : existing.description;
      const updatedJson = b.documents !== undefined ? JSON.stringify(b.documents) : existing.content_json;

      await db
        .prepare(
          'UPDATE constitution_versions SET title = ?, revision_date = ?, is_current = ?, description = ?, content_json = ?, updated_at = ? WHERE id = ?'
        )
        .bind(updatedTitle, updatedDate, isCurrent, updatedDesc, updatedJson, now, id)
        .run();

      return json({
        id,
        title: updatedTitle,
        revision_date: updatedDate,
        is_current: isCurrent === 1,
        description: updatedDesc,
        documents: JSON.parse(updatedJson),
        created_at: existing.created_at,
        updated_at: now
      });
    }

    if (method === 'DELETE' && id) {
      requireAdmin(session);
      const existing: any = await db.prepare('SELECT * FROM constitution_versions WHERE id = ?').bind(id).first();
      if (!existing) throw new HttpError(404, '해당 회칙 버전을 찾을 수 없습니다.');

      const countRow: any = await db.prepare('SELECT count(*) as cnt FROM constitution_versions').first();
      if (countRow && countRow.cnt <= 1) {
        throw new HttpError(400, '최소 1개 이상의 회칙 버전이 보존되어야 하므로 마지막 버전을 삭제할 수 없습니다.');
      }
      if (existing.is_current === 1) {
        throw new HttpError(400, '현재 효력이 적용 중인 현행 회칙은 직접 삭제할 수 없습니다. 다른 버전을 현행 회칙으로 지정한 후 삭제해 주세요.');
      }

      await db.prepare('DELETE FROM constitution_versions WHERE id = ?').bind(id).run();
      return json({ success: true });
    }
  }

  // ---- email settings (Admin only)
  if (resource === 'email-settings') {
    requireAdmin(session);
    if (method === 'GET') {
      const apiKeyRow: any = await db.prepare("SELECT value FROM settings WHERE key = 'email_api_key'").first();
      const providerRow: any = await db.prepare("SELECT value FROM settings WHERE key = 'email_provider'").first();
      const senderRow: any = await db.prepare("SELECT value FROM settings WHERE key = 'email_sender'").first();
      const senderNameRow: any = await db.prepare("SELECT value FROM settings WHERE key = 'email_sender_name'").first();
      const gasUrlRow: any = await db.prepare("SELECT value FROM settings WHERE key = 'email_gas_url'").first();

      const hasApiKey = Boolean(apiKeyRow && apiKeyRow.value);
      return json({
        provider: (providerRow && providerRow.value) || 'brevo',
        sender: (senderRow && senderRow.value) || 'knoucsgj@gmail.com',
        sender_name: (senderNameRow && senderNameRow.value) || '한국방송통신대학교 광주전남 컴퓨터과학과 학생회',
        gas_url: (gasUrlRow && gasUrlRow.value) || '',
        has_api_key: hasApiKey,
        api_key_masked: hasApiKey ? '••••••••••••••••' : '',
      });
    }
    if (method === 'PUT') {
      const b: any = await readJson(req);
      if (b.api_key && typeof b.api_key === 'string' && b.api_key.trim() && !b.api_key.includes('••••')) {
        await db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('email_api_key', ?)").bind(b.api_key.trim()).run();
      }
      if (b.provider) {
        await db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('email_provider', ?)").bind(str(b.provider, 20)).run();
      }
      if (b.sender) {
        await db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('email_sender', ?)").bind(str(b.sender, 80)).run();
      }
      if (b.sender_name) {
        await db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('email_sender_name', ?)").bind(str(b.sender_name, 100)).run();
      }
      if (b.gas_url !== undefined) {
        await db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('email_gas_url', ?)").bind(str(b.gas_url, 300)).run();
      }
      return json({ success: true, message: '이메일 발송 설정이 저장되었습니다.' });
    }
    if (method === 'POST') {
      const b: any = await readJson(req);
      const testEmail = str(b.test_email, 80);
      if (!testEmail) throw new HttpError(400, '테스트 발송할 이메일 주소를 입력해 주세요.');
      const res = await sendVerificationEmail(db, env, testEmail, '123456', '테스트');
      if (!res.sent) {
        throw new HttpError(400, res.reason || '이메일 발송에 실패했습니다.');
      }
      return json({ success: true, message: `${testEmail} 주소로 테스트 메일이 성공적으로 발송되었습니다!` });
    }
  }

  throw new HttpError(400, 'Unknown resource or unsupported method');
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === '/api' || url.pathname.startsWith('/api/')) {
      try {
        return await handleApi(request, env);
      } catch (err: any) {
        if (err instanceof HttpError) return json({ error: err.message }, err.status);
        console.error(err);
        return json({ error: '서버 오류가 발생했습니다.' }, 500);
      }
    }
    return env.ASSETS.fetch(request);
  },
};
