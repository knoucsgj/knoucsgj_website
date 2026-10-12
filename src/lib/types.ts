export type NoticeCategory = '전체' | '필독' | '학생회' | '학사' | '행사';

export interface Attachment {
  name: string;
  url: string;
  size?: string;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  category: '필독' | '학생회' | '학사' | '행사';
  author: string;
  created_at: string;
  views: number;
  is_pinned?: boolean;
  attachments?: Attachment[];
}

export type EventCategory = '출석수업' | '시험' | '과제' | '등록/수강' | '행사';

export interface AcademicEvent {
  id: string;
  title: string;
  start_date: string; // YYYY-MM-DD
  end_date: string;   // YYYY-MM-DD
  category: EventCategory;
  description: string;
  target_grades: string; // e.g. '전학년', '1, 2학년', '3, 4학년'
  is_important?: boolean;
}

export interface CouncilMember {
  id: string;
  role: string;
  name: string;
  grade_info: string;
  message: string;
  email?: string;
}

export type StudyStatus = '모집중' | '진행중' | '마감' | '종료';

export interface StudyGroup {
  id: string;
  title: string;
  subject: string;
  status: StudyStatus;
  members_count: number;
  max_members: number;
  target_grade: string;
  meeting_type: '온라인 (Zoom/Discord)' | '오프라인 (광주지역대학)' | '온/오프라인 병행';
  leader: string;
  leader_contact?: string;
  description?: string;
  created_at: string;
}

// 벤치마크 분석 기반 학생회 핵심 모델 (투명 재정, 회의록, 복지 대여, 회칙, 제휴)
export interface BudgetItem {
  id: string;
  date: string;
  type: '수입' | '지출';
  category: string;
  description: string;
  amount: number;
  note?: string;
}

export interface BudgetReport {
  id: string;
  title: string;
  period: string; // 예: 2026학년도 2학기 3분기
  income_total: number;
  expense_total: number;
  balance: number;
  status: '감사완료' | '집행중';
  published_date: string;
  items: BudgetItem[];
}

export interface MeetingMinute {
  id: string;
  title: string;
  meeting_type: '정기임원회의' | '개강총회' | '종강총회' | '임시회의';
  meeting_date: string;
  attendees: string;
  agenda: string;
  content: string;
  decisions: string;
}

export interface RentalItem {
  id: string;
  name: string;
  category: '전산실습 교재' | 'IT 기기/소모품' | '생활복지';
  total_qty: number;
  available_qty: number;
  location: string;
  status: '대여가능' | '대여중';
  desc: string;
}

export interface PartnershipItem {
  id: string;
  partner_name: string;
  category: 'IT 교육/인강' | '도서/출판' | '생활/복지';
  benefit: string;
  period: string;
  instructions: string;
  link?: string;
}

export interface CouncilRuleArticle {
  number: number;
  title: string;
  content: string;
}

export interface CouncilRuleChapter {
  chapter: number;
  title: string;
  articles: CouncilRuleArticle[];
}
