// Idempotent schema bootstrap. Runs once per Worker isolate before the first API call, so no manual
// D1 console work is required. Safe to run repeatedly (CREATE IF NOT EXISTS + guarded ALTERs).
import { initialNotices } from '../src/data/mockNotices';
import { initialEvents } from '../src/data/mockEvents';
import { councilMembers as initialCouncilMembers, councilIntro as initialCouncilIntro, initialPastCouncilMembers } from '../src/data/mockCouncil';
import { initialMeetingMinutes } from '../src/data/mockGovernance';
import { officialConstitutionDocuments } from '../src/data/officialConstitution';

type D1 = any;

const CREATE_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS notices (
    id TEXT PRIMARY KEY, title TEXT NOT NULL, content TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('필독', '학생회', '학사', '행사', '결산', '회의록')),
    author TEXT NOT NULL DEFAULT '학생회', created_at TEXT NOT NULL, views INTEGER NOT NULL DEFAULT 1,
    is_pinned INTEGER NOT NULL DEFAULT 0, file_name TEXT, file_url TEXT)`,
  `CREATE TABLE IF NOT EXISTS academic_events (
    id TEXT PRIMARY KEY, title TEXT NOT NULL, start_date TEXT NOT NULL, end_date TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('출석수업', '시험', '과제', '등록/수강', '행사')),
    description TEXT, target_grades TEXT NOT NULL DEFAULT '전학년', is_important INTEGER NOT NULL DEFAULT 0)`,
  `CREATE TABLE IF NOT EXISTS academic_materials (
    id TEXT PRIMARY KEY, grade INTEGER NOT NULL CHECK (grade IN (1, 2, 3, 4)),
    semester INTEGER NOT NULL CHECK (semester IN (1, 2)), course_name TEXT NOT NULL, title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN ('기출문제/해설', '출석수업요약', '과제물참고자료', '강의노트', '기타자료')),
    author TEXT NOT NULL DEFAULT '학우', created_at TEXT NOT NULL, downloads INTEGER NOT NULL DEFAULT 0,
    file_name TEXT, file_size TEXT, file_url TEXT)`,
  `CREATE TABLE IF NOT EXISTS free_posts (
    id TEXT PRIMARY KEY, title TEXT NOT NULL, content TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('자유', '질문', '취업·이직', '정보공유')),
    author TEXT NOT NULL, created_at TEXT NOT NULL, views INTEGER NOT NULL DEFAULT 1)`,
  `CREATE TABLE IF NOT EXISTS free_post_replies (
    id TEXT PRIMARY KEY, post_id TEXT NOT NULL, author TEXT NOT NULL, content TEXT NOT NULL, created_at TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS feedbacks (
    id TEXT PRIMARY KEY, title TEXT NOT NULL, content TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('학사/수업', '행사/스터디', '학생회운영', '기타')),
    author TEXT NOT NULL, created_at TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT '접수완료' CHECK (status IN ('접수완료', '답변완료')))`,
  `CREATE TABLE IF NOT EXISTS feedback_replies (
    id TEXT PRIMARY KEY, feedback_id TEXT NOT NULL, author TEXT NOT NULL, content TEXT NOT NULL, created_at TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS studies (
    id TEXT PRIMARY KEY, title TEXT NOT NULL, subject TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('모집중', '진행중', '마감', '종료')),
    members_count INTEGER NOT NULL DEFAULT 1, max_members INTEGER NOT NULL DEFAULT 8,
    target_grade TEXT NOT NULL DEFAULT '전학년', meeting_type TEXT NOT NULL, leader TEXT NOT NULL,
    leader_contact TEXT, description TEXT, created_at TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS council_members (
    id TEXT PRIMARY KEY, role TEXT NOT NULL, name TEXT NOT NULL, grade_info TEXT, message TEXT, email TEXT)`,
  `CREATE TABLE IF NOT EXISTS meeting_minutes (
    id TEXT PRIMARY KEY, title TEXT NOT NULL, meeting_type TEXT NOT NULL, meeting_date TEXT NOT NULL,
    attendees TEXT, agenda TEXT, content TEXT, decisions TEXT)`,
  `CREATE TABLE IF NOT EXISTS past_council_members (
    id TEXT PRIMARY KEY, generation TEXT NOT NULL, period TEXT NOT NULL,
    role TEXT NOT NULL, name TEXT NOT NULL, photo_url TEXT, sort_order INTEGER DEFAULT 0, created_at TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS email_verifications (
    email TEXT PRIMARY KEY, code TEXT NOT NULL, expires_at INTEGER NOT NULL,
    verified INTEGER NOT NULL DEFAULT 0, updated_at INTEGER NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS members (
    id TEXT PRIMARY KEY, username TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL, password_salt TEXT NOT NULL,
    nickname TEXT NOT NULL, name TEXT NOT NULL, phone TEXT NOT NULL, address TEXT NOT NULL, student_no TEXT NOT NULL,
    regional_college TEXT NOT NULL, department TEXT NOT NULL, consent_version TEXT NOT NULL,
    consented_at TEXT NOT NULL, created_at TEXT NOT NULL)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS idx_members_nickname ON members (nickname COLLATE NOCASE)`,
  `CREATE TABLE IF NOT EXISTS sessions (
    token_hash TEXT PRIMARY KEY, kind TEXT NOT NULL CHECK (kind IN ('member', 'admin')),
    member_id TEXT, expires_at INTEGER NOT NULL)`,
  `CREATE INDEX IF NOT EXISTS idx_sessions_member ON sessions (member_id)`,
  `CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS login_attempts (k TEXT PRIMARY KEY, count INTEGER NOT NULL, first_at INTEGER NOT NULL)`,
  `CREATE INDEX IF NOT EXISTS idx_notices_pinned ON notices (is_pinned, created_at)`,
  `CREATE INDEX IF NOT EXISTS idx_materials_lookup ON academic_materials (grade, semester, course_name)`,
  `CREATE INDEX IF NOT EXISTS idx_freeposts_created ON free_posts (created_at)`,
  `CREATE INDEX IF NOT EXISTS idx_feedbacks_created ON feedbacks (created_at)`,
  `CREATE TABLE IF NOT EXISTS constitution_versions (
    id TEXT PRIMARY KEY, title TEXT NOT NULL, revision_date TEXT NOT NULL,
    is_current INTEGER NOT NULL DEFAULT 0, description TEXT,
    content_json TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)`,
  `CREATE INDEX IF NOT EXISTS idx_constitution_current ON constitution_versions (is_current, revision_date)`,
];

// Columns added after the first release (ownership + study approval)
const ADD_COLUMNS: [string, string, string][] = [
  ['free_posts', 'author_id', 'TEXT'],
  ['free_post_replies', 'author_id', 'TEXT'],
  ['feedbacks', 'author_id', 'TEXT'],
  ['feedback_replies', 'author_id', 'TEXT'],
  ['academic_materials', 'author_id', 'TEXT'],
  ['studies', 'author_id', 'TEXT'],
  ['studies', 'approval', "TEXT NOT NULL DEFAULT 'approved'"],
  ['members', 'role', "TEXT NOT NULL DEFAULT 'associate'"],
];

let ready: Promise<void> | null = null;

export function ensureSchema(db: D1): Promise<void> {
  if (!ready) {
    ready = run(db).catch((e) => {
      ready = null; // retry on next request
      throw e;
    });
  }
  return ready;
}

async function run(db: D1) {
  await db.batch(CREATE_STATEMENTS.map((s) => db.prepare(s)));

  for (const [table, column, type] of ADD_COLUMNS) {
    const { results } = await db.prepare(`PRAGMA table_info(${table})`).all();
    if (!results.some((r: any) => r.name === column)) {
      await db.prepare(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`).run();
    }
  }

  // One-time: copy the bundled default notices/events so existing content stays visible.
  const seeded = await db.prepare("SELECT value FROM settings WHERE key = 'seeded_v1'").first();
  if (!seeded) {
    const stmts: any[] = [];
    for (const n of initialNotices) {
      const att = n.attachments && n.attachments[0];
      stmts.push(
        db
          .prepare(
            'INSERT OR IGNORE INTO notices (id, title, content, category, author, created_at, views, is_pinned, file_name, file_url) VALUES (?,?,?,?,?,?,?,?,?,?)'
          )
          .bind(n.id, n.title, n.content, n.category, n.author, n.created_at, Number(n.views) || 1,
            n.is_pinned ? 1 : 0, att ? att.name : null, att ? att.url : null)
      );
    }
    for (const e of initialEvents) {
      stmts.push(
        db
          .prepare(
            'INSERT OR IGNORE INTO academic_events (id, title, start_date, end_date, category, description, target_grades, is_important) VALUES (?,?,?,?,?,?,?,?)'
          )
          .bind(e.id, e.title, e.start_date, e.end_date, e.category, e.description, e.target_grades, e.is_important ? 1 : 0)
      );
    }
    stmts.push(db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('seeded_v1', '1')"));
    await db.batch(stmts);
  }

  // Seed council intro, members, and minutes (v2)
  const seededV2 = await db.prepare("SELECT value FROM settings WHERE key = 'seeded_v2'").first();
  if (!seededV2) {
    const stmtsV2: any[] = [];
    stmtsV2.push(
      db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('council_intro', ?)").bind(JSON.stringify(initialCouncilIntro))
    );
    for (const cm of initialCouncilMembers) {
      stmtsV2.push(
        db.prepare('INSERT OR IGNORE INTO council_members (id, role, name, grade_info, message, email) VALUES (?,?,?,?,?,?)')
          .bind(cm.id, cm.role, cm.name, cm.grade_info, cm.message, cm.email || null)
      );
    }
    for (const mm of initialMeetingMinutes) {
      stmtsV2.push(
        db.prepare('INSERT OR IGNORE INTO meeting_minutes (id, title, meeting_type, meeting_date, attendees, agenda, content, decisions) VALUES (?,?,?,?,?,?,?,?)')
          .bind(mm.id, mm.title, mm.meeting_type, mm.meeting_date, mm.attendees, mm.agenda, mm.content, mm.decisions)
      );
    }
    stmtsV2.push(db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('seeded_v2', '1')"));
    await db.batch(stmtsV2);
  }

  // Clean out any legacy mock past council members so only real records entered by admin exist
  const cleanedMocks = await db.prepare("SELECT value FROM settings WHERE key = 'cleaned_past_mocks_v1'").first();
  if (!cleanedMocks) {
    try {
      await db.prepare("DELETE FROM past_council_members WHERE id LIKE 'pcm-%'").run();
      await db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('cleaned_past_mocks_v1', '1')").run();
    } catch {
      /* ignore */
    }
  }

  // Seed constitution versions (v4)
  const seededV4 = await db.prepare("SELECT value FROM settings WHERE key = 'seeded_v4'").first();
  if (!seededV4) {
    const { results } = await db.prepare('SELECT id FROM constitution_versions LIMIT 1').all();
    if (!results || results.length === 0) {
      await db
        .prepare(
          'INSERT INTO constitution_versions (id, title, revision_date, is_current, description, content_json, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?)'
        )
        .bind(
          'ver-20180402-11',
          '제11차 개정 학생회칙 (2018. 04. 02)',
          '2018. 04. 02',
          1,
          '2018년 4월 2일 제11차 개정 학생회칙, 간부선거세칙 및 시행세칙 전문',
          JSON.stringify(officialConstitutionDocuments),
          '2018-04-02T00:00:00.000Z',
          new Date().toISOString()
        )
        .run();
    }
    await db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('seeded_v4', '1')").run();
  }

  // Role auto-migration for existing members
  const migratedRoles = await db.prepare("SELECT value FROM settings WHERE key = 'migrated_roles_v1'").first();
  if (!migratedRoles) {
    try {
      await db.prepare(
        "UPDATE members SET role = 'regular' WHERE regional_college = '광주전남' AND (department LIKE '%컴퓨터과학%' OR department = '컴퓨터과학과')"
      ).run();
      await db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('migrated_roles_v1', '1')").run();
    } catch {
      /* ignore */
    }
  }

  // Ensure master admin emails always have president/council role
  try {
    await db.prepare(
      "UPDATE members SET role = 'president' WHERE username IN ('knoucsgj@gmail.com', 'knoucsgj@daum.net', 'knoucsgj@hanmail.net', 'knoucsgj@kakao.com')"
    ).run();
  } catch {
    /* ignore */
  }
}
