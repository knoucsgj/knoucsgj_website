-- ==============================================================================
-- 한국방송통신대학교 광주전남지역대학 컴퓨터과학과 학생회 홈페이지 DB 스키마
-- Supabase SQL Editor에 복사하여 실행하시면 바로 테이블과 초기 데이터가 생성됩니다.
-- ==============================================================================

-- 1. 공지사항 테이블 (notices)
CREATE TABLE IF NOT EXISTS public.notices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('필독', '학생회', '학사', '행사')),
    author TEXT NOT NULL DEFAULT '학생회',
    views INTEGER NOT NULL DEFAULT 0,
    is_pinned BOOLEAN NOT NULL DEFAULT false,
    attachments JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. 학사일정 테이블 (academic_events)
CREATE TABLE IF NOT EXISTS public.academic_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('출석수업', '시험', '과제', '등록/수강', '행사')),
    description TEXT,
    target_grades TEXT DEFAULT '전학년',
    is_important BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. 학생회 임원진 테이블 (council_members)
CREATE TABLE IF NOT EXISTS public.council_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role TEXT NOT NULL,
    name TEXT NOT NULL,
    grade_info TEXT NOT NULL,
    message TEXT,
    email TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. 스터디 그룹 테이블 (study_groups)
CREATE TABLE IF NOT EXISTS public.study_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    subject TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT '모집중' CHECK (status IN ('모집중', '진행중', '마감', '종료')),
    members_count INTEGER NOT NULL DEFAULT 1,
    max_members INTEGER NOT NULL DEFAULT 8,
    target_grade TEXT DEFAULT '전학년',
    meeting_type TEXT DEFAULT '온/오프라인 병행',
    leader TEXT NOT NULL,
    leader_contact TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- Row Level Security (RLS) 보안 정책
-- 누구나 조회 가능 (SELECT), 수정/추가는 로그인된 관리자만 가능
-- ==============================================================================

ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.council_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_groups ENABLE ROW LEVEL SECURITY;

-- 읽기 권한: 전체 공개 (익명 사용자 포함)
CREATE POLICY "Public Read Notices" ON public.notices FOR SELECT USING (true);
CREATE POLICY "Public Read Events" ON public.academic_events FOR SELECT USING (true);
CREATE POLICY "Public Read Council" ON public.council_members FOR SELECT USING (true);
CREATE POLICY "Public Read Studies" ON public.study_groups FOR SELECT USING (true);

-- 쓰기 권한: 인증된 사용자만 가능 (추후 관리자 로그인 연동)
CREATE POLICY "Auth Insert Notices" ON public.notices FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth Update Notices" ON public.notices FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth Delete Notices" ON public.notices FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Auth Insert Events" ON public.academic_events FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth Update Events" ON public.academic_events FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth Delete Events" ON public.academic_events FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Auth Insert Studies" ON public.study_groups FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth Update Studies" ON public.study_groups FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth Delete Studies" ON public.study_groups FOR DELETE USING (auth.role() = 'authenticated');

-- ==============================================================================
-- 초기 샘플 데이터 입력
-- ==============================================================================

INSERT INTO public.notices (title, content, category, author, views, is_pinned)
VALUES 
  ('[필독] 2026학년도 2학기 중간과제물 제출 기한 및 작성 유의사항 안내', '2학기 중간과제물 제출 기간 안내: 2026. 10. 15 ~ 10. 25. 온라인 제출 필수', '필독', '학생회 학술부', 412, true),
  ('[학생회] 2026년도 광주전남 컴퓨터과학과 가을 IT 특강 및 네트워킹 데이 안내', '2026년 11월 7일(토) 14:00 지역대학 4층 대강당에서 IT 특강 및 네트워킹 데이를 진행합니다.', '학생회', '학생회 기획부', 289, true),
  ('[학사] 2026학년도 2학기 출석수업 일정 배정 및 전산실습실 이용 수칙', '광주전남지역대학 302호 전산실습실 출석수업 일정 배정표 안내입니다.', '학사', '학과 사무실', 350, false);

INSERT INTO public.academic_events (title, start_date, end_date, category, description, target_grades, is_important)
VALUES
  ('2학기 중간과제물 정규 제출', '2026-10-15', '2026-10-25', '과제', '과제물 부과 교과목 U-KNOU 온라인 제출 (18:00 마감)', '전학년', true),
  ('1학년 출석수업 (C프로그래밍, 파이썬)', '2026-10-24', '2026-10-25', '출석수업', '광주전남지역대학 본관 전산실습실 302호 진행', '1학년', false),
  ('광주전남 컴퓨터과학과 가을 IT 특강 & 네트워킹 데이', '2026-11-07', '2026-11-07', '행사', 'AI 실무 특강 및 선후배 네트워킹 (대강당)', '전학년', true),
  ('2학기 기말시험 (출석 온라인시험) 응시일정 신청', '2026-11-20', '2026-11-25', '시험', 'U-KNOU 포털에서 원하는 시험 일자 및 교시 선착순 신청', '전학년', true),
  ('2026학년도 2학기 기말평가 (출석 온라인시험)', '2026-12-05', '2026-12-13', '시험', '광주지역대학 본관 지정 CBT 시험실에서 과목별 응시', '전학년', true);

INSERT INTO public.study_groups (title, subject, status, members_count, max_members, target_grade, meeting_type, leader)
VALUES
  ('2026-2학기 자료구조 & 알고리즘 집중 스터디', '자료구조 / C++ / 백준 문제풀이', '모집중', 5, 8, '2~3학년', '온/오프라인 병행', '정현우 (4학년)'),
  ('신·편입생을 위한 파이썬 기초 프로그래밍 멘토링', '파이썬프로그래밍 기초 및 중간과제 코칭', '모집중', 6, 10, '1학년 및 편입생', '온라인 (Zoom/Discord)', '김민수 (3학년)'),
  ('웹 풀스택 실무 프로젝트 스터디 (React + Supabase)', '학과 프로젝트 및 포트폴리오 웹 제작', '진행중', 6, 6, '전학년', '온/오프라인 병행', '강태석 (3학년)'),
  ('2027년 1회 정보처리기사 필기 스터디반', '소프트웨어설계, DB, 프로그래밍 언어 활용', '모집중', 4, 8, '3~4학년', '온라인 (Zoom/Discord)', '이지은 (3학년)');
