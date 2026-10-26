# Cloudflare D1 Database Schema for KNOU CS Gwangju-Jeonnam Student Council
# 한국방송통신대학교 광주전남지역대학 컴퓨터과학과 학생회 Cloudflare D1 테이블 정의

-- 1. 공지사항 테이블 (학사공지, 학생회비 결산, 정기 회의록 등)
CREATE TABLE IF NOT EXISTS notices (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('필독', '학생회', '학사', '행사', '결산', '회의록')),
  author TEXT NOT NULL DEFAULT '학생회',
  created_at TEXT NOT NULL,
  views INTEGER NOT NULL DEFAULT 1,
  is_pinned INTEGER NOT NULL DEFAULT 0,
  file_name TEXT,
  file_url TEXT
);

-- 2. 학사일정 테이블 (출석수업, 과제물, 기말시험, 수강신청 등)
CREATE TABLE IF NOT EXISTS academic_events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('출석수업', '시험', '과제', '등록/수강', '행사')),
  description TEXT,
  target_grades TEXT NOT NULL DEFAULT '전학년',
  is_important INTEGER NOT NULL DEFAULT 0
);

-- 3. 학술 및 기타 학습자료실 테이블 (D1 메타데이터 + R2 파일 스토리지 연동)
CREATE TABLE IF NOT EXISTS academic_materials (
  id TEXT PRIMARY KEY,
  grade INTEGER NOT NULL CHECK (grade IN (1, 2, 3, 4)),
  semester INTEGER NOT NULL CHECK (semester IN (1, 2)),
  course_name TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('기출문제/해설', '출석수업요약', '과제물참고자료', '강의노트', '기타자료')),
  author TEXT NOT NULL DEFAULT '학우',
  created_at TEXT NOT NULL,
  downloads INTEGER NOT NULL DEFAULT 0,
  file_name TEXT,
  file_size TEXT,
  file_url TEXT
);

-- 4. 자유게시판 테이블
CREATE TABLE IF NOT EXISTS free_posts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('자유', '질문', '취업·이직', '정보공유')),
  author TEXT NOT NULL,
  created_at TEXT NOT NULL,
  views INTEGER NOT NULL DEFAULT 1
);

-- 5. 자유게시판 댓글 테이블
CREATE TABLE IF NOT EXISTS free_post_replies (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL,
  author TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (post_id) REFERENCES free_posts (id) ON DELETE CASCADE
);

-- 6. 학우 소통 및 열린 건의함 테이블
CREATE TABLE IF NOT EXISTS feedbacks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('학사/수업', '행사/스터디', '학생회운영', '기타')),
  author TEXT NOT NULL,
  created_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT '접수완료' CHECK (status IN ('접수완료', '답변완료'))
);

-- 7. 건의함 답변 테이블
CREATE TABLE IF NOT EXISTS feedback_replies (
  id TEXT PRIMARY KEY,
  feedback_id TEXT NOT NULL,
  author TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (feedback_id) REFERENCES feedbacks (id) ON DELETE CASCADE
);

-- 8. 스터디 소그룹 테이블
CREATE TABLE IF NOT EXISTS studies (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('모집중', '진행중', '마감', '종료')),
  members_count INTEGER NOT NULL DEFAULT 1,
  max_members INTEGER NOT NULL DEFAULT 8,
  target_grade TEXT NOT NULL DEFAULT '전학년',
  meeting_type TEXT NOT NULL,
  leader TEXT NOT NULL,
  leader_contact TEXT,
  description TEXT,
  created_at TEXT NOT NULL
);

-- 9. 학생회 임원진 테이블
CREATE TABLE IF NOT EXISTS council_members (
  id TEXT PRIMARY KEY,
  role TEXT NOT NULL,
  name TEXT NOT NULL,
  grade_info TEXT,
  message TEXT,
  email TEXT
);

-- 인덱스 생성 (조회 성능 최적화)
-- 10. 학생회비 결산보고 테이블
CREATE TABLE IF NOT EXISTS budget_reports (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  period TEXT NOT NULL,
  income_total INTEGER NOT NULL DEFAULT 0,
  expense_total INTEGER NOT NULL DEFAULT 0,
  balance INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT '감사완료' CHECK (status IN ('감사완료', '집행중')),
  published_date TEXT NOT NULL,
  items_json TEXT NOT NULL DEFAULT '[]',
  receipt_url TEXT,
  receipt_name TEXT,
  created_by TEXT,
  created_at TEXT,
  is_deleted INTEGER NOT NULL DEFAULT 0,
  deleted_reason TEXT,
  deleted_at TEXT,
  deleted_by TEXT,
  edit_history TEXT NOT NULL DEFAULT '[]'
);

-- 11. 학생 복지 및 비품 대여 테이블
CREATE TABLE IF NOT EXISTS rental_items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('전산실습 교재', 'IT 기기/소모품', '생활복지')),
  total_qty INTEGER NOT NULL DEFAULT 1,
  available_qty INTEGER NOT NULL DEFAULT 1,
  location TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT '대여가능' CHECK (status IN ('대여가능', '대여불가')),
  desc TEXT
);

-- 12. 회의록 테이블
CREATE TABLE IF NOT EXISTS meeting_minutes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  meeting_type TEXT NOT NULL,
  meeting_date TEXT NOT NULL,
  attendees TEXT,
  agenda TEXT,
  content TEXT,
  decisions TEXT,
  location TEXT,
  chairperson TEXT,
  recorder TEXT,
  attachments_json TEXT NOT NULL DEFAULT '[]',
  created_by TEXT,
  created_at TEXT,
  is_deleted INTEGER NOT NULL DEFAULT 0,
  deleted_reason TEXT,
  deleted_at TEXT,
  deleted_by TEXT,
  edit_history TEXT NOT NULL DEFAULT '[]'
);

-- 13. 역대 학생회 임원진 테이블
CREATE TABLE IF NOT EXISTS past_council_members (
  id TEXT PRIMARY KEY,
  generation TEXT NOT NULL,
  period TEXT NOT NULL,
  role TEXT NOT NULL,
  name TEXT NOT NULL,
  photo_url TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TEXT NOT NULL
);

-- 14. 학생회칙 버전 관리 테이블
CREATE TABLE IF NOT EXISTS constitution_versions (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  revision_date TEXT NOT NULL,
  is_current INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  content_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- 14. 학과 활동보고 (사진 및 영상 게시판) 테이블
CREATE TABLE IF NOT EXISTS activity_reports (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT '행사',
  description TEXT,
  activity_date TEXT NOT NULL,
  media_type TEXT NOT NULL DEFAULT 'image' CHECK (media_type IN ('image', 'video')),
  media_url TEXT NOT NULL,
  thumbnail_url TEXT,
  youtube_id TEXT,
  author TEXT NOT NULL DEFAULT '학생회',
  created_by TEXT,
  views INTEGER NOT NULL DEFAULT 1,
  is_pinned INTEGER NOT NULL DEFAULT 0,
  is_deleted INTEGER NOT NULL DEFAULT 0,
  deleted_reason TEXT,
  deleted_at TEXT,
  deleted_by TEXT,
  created_at TEXT NOT NULL
);

-- 인덱스 생성 (조회 성능 최적화)
CREATE INDEX IF NOT EXISTS idx_activity_date ON activity_reports (activity_date DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notices_pinned ON notices (is_pinned, created_at);
CREATE INDEX IF NOT EXISTS idx_materials_lookup ON academic_materials (grade, semester, course_name);
CREATE INDEX IF NOT EXISTS idx_freeposts_created ON free_posts (created_at);
CREATE INDEX IF NOT EXISTS idx_feedbacks_created ON feedbacks (created_at);
CREATE INDEX IF NOT EXISTS idx_budget_published ON budget_reports (published_date);
CREATE INDEX IF NOT EXISTS idx_constitution_current ON constitution_versions (is_current, revision_date);
CREATE INDEX IF NOT EXISTS idx_notices_pinned ON notices (is_pinned, created_at);
CREATE INDEX IF NOT EXISTS idx_materials_lookup ON academic_materials (grade, semester, course_name);
CREATE INDEX IF NOT EXISTS idx_freeposts_created ON free_posts (created_at);
CREATE INDEX IF NOT EXISTS idx_feedbacks_created ON feedbacks (created_at);
