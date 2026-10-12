import type { AcademicEvent } from '../lib/types';

export const initialEvents: AcademicEvent[] = [
  {
    id: 'event-1',
    title: '2학기 중간과제물 정규 제출',
    start_date: '2026-10-15',
    end_date: '2026-10-25',
    category: '과제',
    description: '과제물 부과 교과목 U-KNOU 온라인 제출 (마감일 18:00)',
    target_grades: '전학년',
    is_important: true
  },
  {
    id: 'event-2',
    title: '1학년 출석수업 (C프로그래밍, 파이썬)',
    start_date: '2026-10-24',
    end_date: '2026-10-25',
    category: '출석수업',
    description: '광주전남지역대학 본관 전산실습실 302호 진행',
    target_grades: '1학년',
    is_important: false
  },
  {
    id: 'event-3',
    title: '2학기 중간과제물 추가 제출 (감점 적용)',
    start_date: '2026-10-26',
    end_date: '2026-10-28',
    category: '과제',
    description: '1~2점 감점 적용 후 추가 제출 가능 (마감일 18:00)',
    target_grades: '전학년',
    is_important: false
  },
  {
    id: 'event-4',
    title: '2학년 출석수업 (자료구조, 컴퓨터구조)',
    start_date: '2026-10-31',
    end_date: '2026-11-01',
    category: '출석수업',
    description: '광주전남지역대학 본관 전산실습실 진행',
    target_grades: '2학년',
    is_important: false
  },
  {
    id: 'event-5',
    title: '광주전남 컴퓨터과학과 가을 IT 특강 & 네트워킹 데이',
    start_date: '2026-11-07',
    end_date: '2026-11-07',
    category: '행사',
    description: 'AI 실무 특강 및 선후배 네트워킹 (광주지역대학 4층 대강당)',
    target_grades: '전학년',
    is_important: true
  },
  {
    id: 'event-6',
    title: '3·4학년 출석수업 (데이터베이스, 소프트웨어공학)',
    start_date: '2026-11-14',
    end_date: '2026-11-15',
    category: '출석수업',
    description: '광주전남지역대학 본관 및 온라인 실시간 화상 병행',
    target_grades: '3, 4학년',
    is_important: false
  },
  {
    id: 'event-7',
    title: '2학기 기말시험 (출석 온라인시험) 응시일정 신청',
    start_date: '2026-11-20',
    end_date: '2026-11-25',
    category: '시험',
    description: 'U-KNOU 포털에서 원하는 시험 일자 및 교시 선착순 신청',
    target_grades: '전학년',
    is_important: true
  },
  {
    id: 'event-8',
    title: '2026학년도 2학기 기말평가 (출석 온라인시험)',
    start_date: '2026-12-05',
    end_date: '2026-12-13',
    category: '시험',
    description: '광주지역대학 본관 지정 CBT 시험실에서 과목별 응시',
    target_grades: '전학년',
    is_important: true
  },
  {
    id: 'event-9',
    title: '2학기 종강총회 & 학술 프로젝트 발표회',
    start_date: '2026-12-19',
    end_date: '2026-12-19',
    category: '행사',
    description: '한 학기 성과 공유 및 스터디 결과물 발표, 학우 친목 교류',
    target_grades: '전학년',
    is_important: false
  },
  {
    id: 'event-10',
    title: '2학기 성적 열람 및 이의신청 기간',
    start_date: '2026-12-28',
    end_date: '2027-01-08',
    category: '등록/수강',
    description: '최종 성적 조회 및 성적 정정 신청',
    target_grades: '전학년',
    is_important: false
  },
  {
    id: 'event-11',
    title: '2027학년도 1학기 재학생 수강신청',
    start_date: '2027-01-20',
    end_date: '2027-01-26',
    category: '등록/수강',
    description: '2027-1학기 개설교과목 수강신청',
    target_grades: '전학년',
    is_important: true
  }
];
