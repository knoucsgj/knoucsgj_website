export const defaultCurriculumCourses: { grade: number; semester: number; type: string; name: string }[] = [
  // 1학년 1학기
  { grade: 1, semester: 1, type: '교양', name: '컴퓨터의이해' },
  { grade: 1, semester: 1, type: '교양', name: '세계의정치와경제' },
  { grade: 1, semester: 1, type: '전공', name: '파이썬프로그래밍기초' },
  { grade: 1, semester: 1, type: '일반선택', name: '사진의이해' },
  { grade: 1, semester: 1, type: '전공', name: '유비쿼터스컴퓨팅개론' },
  { grade: 1, semester: 1, type: '일반선택', name: '데이터정보처리입문' },
  // 1학년 2학기
  { grade: 1, semester: 2, type: '교양', name: '원격대학교육의이해' },
  { grade: 1, semester: 2, type: '전공', name: 'AI리터러시' },
  { grade: 1, semester: 2, type: '전공', name: 'C프로그래밍' },
  { grade: 1, semester: 2, type: '일반선택', name: '대중영화의이해' },
  { grade: 1, semester: 2, type: '전공', name: '컴퓨터과학개론' },
  { grade: 1, semester: 2, type: '교양', name: '심리학에게묻다' },
  { grade: 1, semester: 2, type: '교양', name: '대학영어' },
  // 2학년 1학기
  { grade: 2, semester: 1, type: '전공', name: '이산수학' },
  { grade: 2, semester: 1, type: '교양', name: '환경과건강' },
  { grade: 2, semester: 1, type: '교양', name: '테마가있는음악여행' },
  { grade: 2, semester: 1, type: '전공', name: 'HTML5웹프로그래밍' },
  { grade: 2, semester: 1, type: '전공', name: 'Java프로그래밍' },
  { grade: 2, semester: 1, type: '교양', name: '한국사의이해' },
  // 2학년 2학기
  { grade: 2, semester: 2, type: '교양', name: '원격대학교육의이해' },
  { grade: 2, semester: 2, type: '전공', name: '오픈소스기반데이터분석' },
  { grade: 2, semester: 2, type: '교양', name: '경제학의이해' },
  { grade: 2, semester: 2, type: '전공', name: '프로그래밍언어론' },
  { grade: 2, semester: 2, type: '전공', name: '선형대수' },
  { grade: 2, semester: 2, type: '전공', name: '자료구조' },
  { grade: 2, semester: 2, type: '교양', name: '대학수학의이해' },
  // 3학년 1학기
  { grade: 3, semester: 1, type: '전공', name: '인공지능' },
  { grade: 3, semester: 1, type: '일반선택', name: '그래픽커뮤니케이션' },
  { grade: 3, semester: 1, type: '전공', name: '데이터베이스시스템' },
  { grade: 3, semester: 1, type: '전공', name: '디지털논리회로' },
  { grade: 3, semester: 1, type: '전공', name: '운영체제' },
  { grade: 3, semester: 1, type: '전공', name: '알고리즘' },
  // 3학년 2학기
  { grade: 3, semester: 2, type: '교양', name: '원격대학교육의이해' },
  { grade: 3, semester: 2, type: '전공', name: '컴퓨터구조' },
  { grade: 3, semester: 2, type: '전공', name: 'UNIX시스템' },
  { grade: 3, semester: 2, type: '전공', name: '시뮬레이션' },
  { grade: 3, semester: 2, type: '교양', name: '생활법률' },
  { grade: 3, semester: 2, type: '전공', name: '머신러닝' },
  { grade: 3, semester: 2, type: '전공', name: 'JSP프로그래밍' },
  { grade: 3, semester: 2, type: '교양', name: 'AI네이티브가되기위한기초소양' },
  // 4학년 1학기
  { grade: 4, semester: 1, type: '전공', name: '소프트웨어공학' },
  { grade: 4, semester: 1, type: '전공', name: '컴퓨터보안' },
  { grade: 4, semester: 1, type: '전공', name: '정보통신망' },
  { grade: 4, semester: 1, type: '전공', name: '컴퓨터그래픽스' },
  { grade: 4, semester: 1, type: '전공', name: '모바일앱프로그래밍' },
  { grade: 4, semester: 1, type: '교양', name: '생활과건강' },
  // 4학년 2학기
  { grade: 4, semester: 2, type: '일반선택', name: '경영전략론' },
  { grade: 4, semester: 2, type: '교양', name: '원격대학교육의이해' },
  { grade: 4, semester: 2, type: '전공', name: '컴파일러구성' },
  { grade: 4, semester: 2, type: '전공', name: '클라우드컴퓨팅' },
  { grade: 4, semester: 2, type: '일반선택', name: '빅데이터의이해와활용' },
  { grade: 4, semester: 2, type: '교양', name: '성,사랑,사회' },
  { grade: 4, semester: 2, type: '전공', name: '딥러닝' },
];

// Idempotent schema bootstrap. Runs once per Worker isolate before the first API call, so no manual
// D1 console work is required. Safe to run repeatedly (CREATE IF NOT EXISTS + guarded ALTERs).
import { initialNotices } from '../src/data/mockNotices';
import { initialEvents } from '../src/data/mockEvents';
import { councilMembers as initialCouncilMembers, councilIntro as initialCouncilIntro, initialPastCouncilMembers } from '../src/data/mockCouncil';
import { initialMeetingMinutes } from '../src/data/mockGovernance';
import { officialConstitutionDocuments } from '../src/data/officialConstitution';
import { initialBudgetReports } from '../src/data/mockFinance';
import { initialRentalItems } from '../src/data/mockWelfare';
import { initialActivities } from '../src/data/mockActivities';

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
  `CREATE TABLE IF NOT EXISTS budget_reports (
    id TEXT PRIMARY KEY, title TEXT NOT NULL, period TEXT NOT NULL,
    income_total INTEGER NOT NULL DEFAULT 0, expense_total INTEGER NOT NULL DEFAULT 0, balance INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT '감사완료', published_date TEXT NOT NULL, items_json TEXT NOT NULL DEFAULT '[]')`,
  `CREATE INDEX IF NOT EXISTS idx_budget_published ON budget_reports (published_date)`,
    `CREATE TABLE IF NOT EXISTS activity_reports (
    id TEXT PRIMARY KEY, title TEXT NOT NULL, category TEXT NOT NULL DEFAULT '행사',
    description TEXT, activity_date TEXT NOT NULL,
    media_type TEXT NOT NULL DEFAULT 'image' CHECK (media_type IN ('image', 'video')),
    media_url TEXT NOT NULL, thumbnail_url TEXT, youtube_id TEXT,
    author TEXT NOT NULL DEFAULT '학생회', created_by TEXT, views INTEGER NOT NULL DEFAULT 1,
    is_pinned INTEGER NOT NULL DEFAULT 0, is_deleted INTEGER NOT NULL DEFAULT 0,
    deleted_reason TEXT, deleted_at TEXT, deleted_by TEXT, created_at TEXT NOT NULL)`,
  `CREATE INDEX IF NOT EXISTS idx_activity_date ON activity_reports (activity_date DESC, created_at DESC)`,
  `CREATE TABLE IF NOT EXISTS rental_items (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, category TEXT NOT NULL,
    total_qty INTEGER NOT NULL DEFAULT 1, available_qty INTEGER NOT NULL DEFAULT 1,
    location TEXT NOT NULL, status TEXT NOT NULL DEFAULT '대여가능', desc TEXT)`,
  `CREATE TABLE IF NOT EXISTS curriculum_courses (
    id TEXT PRIMARY KEY, grade INTEGER NOT NULL, semester INTEGER NOT NULL,
    course_type TEXT NOT NULL, course_name TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL, updated_at TEXT)`,
  `CREATE INDEX IF NOT EXISTS idx_courses_grade_sem ON curriculum_courses (grade, semester, sort_order)`,
  `CREATE TABLE IF NOT EXISTS r2_files (
    key TEXT PRIMARY KEY, file_name TEXT NOT NULL, size INTEGER NOT NULL,
    category TEXT NOT NULL DEFAULT 'general', uploaded_by TEXT, uploaded_at TEXT NOT NULL)`,
  `CREATE INDEX IF NOT EXISTS idx_r2_files_uploaded ON r2_files (uploaded_at DESC)`,
  `CREATE INDEX IF NOT EXISTS idx_r2_files_category ON r2_files (category)`,
  `CREATE TABLE IF NOT EXISTS market_posts (
    id TEXT PRIMARY KEY, title TEXT NOT NULL, content TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT '팝니다', price TEXT NOT NULL DEFAULT '협의',
    status TEXT NOT NULL DEFAULT '거래가능', author TEXT NOT NULL, author_id TEXT,
    created_at TEXT NOT NULL, views INTEGER NOT NULL DEFAULT 1)`,
  `CREATE INDEX IF NOT EXISTS idx_market_created ON market_posts (created_at DESC)`,
  `CREATE TABLE IF NOT EXISTS market_post_replies (
    id TEXT PRIMARY KEY, post_id TEXT NOT NULL, author TEXT NOT NULL, author_id TEXT,
    content TEXT NOT NULL, created_at TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS qna_posts (
    id TEXT PRIMARY KEY, title TEXT NOT NULL, content TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT '전공/학습', status TEXT NOT NULL DEFAULT '답변대기',
    author TEXT NOT NULL, author_id TEXT, created_at TEXT NOT NULL, views INTEGER NOT NULL DEFAULT 1)`,
  `CREATE INDEX IF NOT EXISTS idx_qna_created ON qna_posts (created_at DESC)`,
  `CREATE TABLE IF NOT EXISTS qna_post_replies (
    id TEXT PRIMARY KEY, post_id TEXT NOT NULL, author TEXT NOT NULL, author_id TEXT,
    content TEXT NOT NULL, created_at TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS popups (
    id TEXT PRIMARY KEY, title TEXT NOT NULL, content TEXT NOT NULL,
    target_type TEXT NOT NULL DEFAULT 'notice', target_id TEXT,
    target_url TEXT NOT NULL, link_text TEXT NOT NULL DEFAULT '자세히 보기',
    image_url TEXT, is_active INTEGER NOT NULL DEFAULT 1,
    start_date TEXT, end_date TEXT, created_by TEXT,
    created_at TEXT NOT NULL, updated_at TEXT NOT NULL)`,
  `CREATE INDEX IF NOT EXISTS idx_popups_active ON popups (is_active, start_date, end_date)`,
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
  ['members', 'learning_center', "TEXT DEFAULT '광주전남지역대학'"],
  ['budget_reports', 'receipt_url', 'TEXT'],
  ['budget_reports', 'receipt_name', 'TEXT'],
  ['budget_reports', 'created_by', 'TEXT'],
  ['budget_reports', 'created_at', 'TEXT'],
  ['budget_reports', 'is_deleted', 'INTEGER NOT NULL DEFAULT 0'],
  ['budget_reports', 'deleted_reason', 'TEXT'],
  ['budget_reports', 'deleted_at', 'TEXT'],
  ['budget_reports', 'deleted_by', 'TEXT'],
  ['budget_reports', 'edit_history', "TEXT NOT NULL DEFAULT '[]'"],
  ['meeting_minutes', 'location', 'TEXT'],
  ['meeting_minutes', 'chairperson', 'TEXT'],
  ['meeting_minutes', 'recorder', 'TEXT'],
  ['meeting_minutes', 'attachments_json', "TEXT NOT NULL DEFAULT '[]'"],
  ['meeting_minutes', 'created_by', 'TEXT'],
  ['meeting_minutes', 'created_at', 'TEXT'],
  ['meeting_minutes', 'is_deleted', 'INTEGER NOT NULL DEFAULT 0'],
  ['meeting_minutes', 'deleted_reason', 'TEXT'],
  ['meeting_minutes', 'deleted_at', 'TEXT'],
  ['meeting_minutes', 'deleted_by', 'TEXT'],
  ['meeting_minutes', 'edit_history', "TEXT NOT NULL DEFAULT '[]'"],
  ['activity_reports', 'created_by', 'TEXT'],
  ['notices', 'created_by', 'TEXT'],
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

  // Clean out any legacy mock community posts (flea market, qna, free posts, feedbacks)
  const cleanedCommunity = await db.prepare("SELECT value FROM settings WHERE key = 'cleaned_community_mocks_v3'").first();
  if (!cleanedCommunity) {
    try {
      await db.batch([
        db.prepare("DELETE FROM market_post_replies WHERE post_id IN ('mk-1', 'mk-2', 'mk-3')"),
        db.prepare("DELETE FROM market_posts WHERE id IN ('mk-1', 'mk-2', 'mk-3')"),
        db.prepare("DELETE FROM qna_post_replies WHERE post_id IN ('qna-1', 'qna-2', 'qna-3') OR id IN ('qna-r-1', 'qna-r-2', 'qna-r-3')"),
        db.prepare("DELETE FROM qna_posts WHERE id IN ('qna-1', 'qna-2', 'qna-3')"),
        db.prepare("DELETE FROM free_post_replies WHERE post_id IN ('fp-1', 'fp-2', 'fp-3') OR id IN ('fpr-1', 'fpr-2', 'fpr-3', 'fpr-4')"),
        db.prepare("DELETE FROM free_posts WHERE id IN ('fp-1', 'fp-2', 'fp-3')"),
        db.prepare("DELETE FROM feedback_replies WHERE feedback_id IN ('fb-1', 'fb-2', 'fb-3')"),
        db.prepare("DELETE FROM feedbacks WHERE id IN ('fb-1', 'fb-2', 'fb-3')"),
        db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('cleaned_community_mocks_v3', '1')"),
      ]);
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

  // Seed budget reports and rental items (v5)
  const seededV5 = await db.prepare("SELECT value FROM settings WHERE key = 'seeded_v5'").first();
  if (!seededV5) {
    const stmtsV5: any[] = [];
    for (const b of initialBudgetReports) {
      stmtsV5.push(
        db
          .prepare(
            'INSERT OR IGNORE INTO budget_reports (id, title, period, income_total, expense_total, balance, status, published_date, items_json) VALUES (?,?,?,?,?,?,?,?,?)'
          )
          .bind(
            b.id,
            b.title,
            b.period,
            b.income_total,
            b.expense_total,
            b.balance,
            b.status,
            b.published_date,
            JSON.stringify(b.items || [])
          )
      );
    }
    for (const r of initialRentalItems) {
      stmtsV5.push(
        db
          .prepare(
            'INSERT OR IGNORE INTO rental_items (id, name, category, total_qty, available_qty, location, status, desc) VALUES (?,?,?,?,?,?,?,?)'
          )
          .bind(
            r.id,
            r.name,
            r.category,
            r.total_qty,
            r.available_qty,
            r.location,
            r.status,
            r.desc
          )
      );
    }
    stmtsV5.push(db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('seeded_v5', '1')"));
    await db.batch(stmtsV5);
  }


  // Seed activity reports (v6)
  const seededV6 = await db.prepare("SELECT value FROM settings WHERE key = 'seeded_v6'").first();
  if (!seededV6) {
    const stmtsV6: any[] = [];
    for (const a of initialActivities) {
      stmtsV6.push(
        db
          .prepare(
            'INSERT OR IGNORE INTO activity_reports (id, title, category, description, activity_date, media_type, media_url, thumbnail_url, youtube_id, author, views, is_pinned, is_deleted, created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)'
          )
          .bind(
            a.id,
            a.title,
            a.category,
            a.description,
            a.activity_date,
            a.media_type,
            a.media_url,
            a.thumbnail_url || null,
            a.youtube_id || null,
            a.author || '학생회',
            Number(a.views) || 1,
            a.is_pinned ? 1 : 0,
            0,
            a.created_at
          )
      );
    }
    stmtsV6.push(db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('seeded_v6', '1')"));
    await db.batch(stmtsV6);
  }

  // Seed curriculum courses (v7)
  const seededV7 = await db.prepare("SELECT value FROM settings WHERE key = 'seeded_v7'").first();
  if (!seededV7) {
    const stmtsV7: any[] = [];
    const now = new Date().toISOString();
    defaultCurriculumCourses.forEach((c, idx) => {
      const id = `crs-${c.grade}-${c.semester}-${String(idx + 1).padStart(2, '0')}`;
      stmtsV7.push(
        db
          .prepare(
            'INSERT OR IGNORE INTO curriculum_courses (id, grade, semester, course_type, course_name, sort_order, created_at) VALUES (?,?,?,?,?,?,?)'
          )
          .bind(id, c.grade, c.semester, c.type, c.name, idx + 1, now)
      );
    });
    stmtsV7.push(db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('seeded_v7', '1')"));
    await db.batch(stmtsV7);
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
