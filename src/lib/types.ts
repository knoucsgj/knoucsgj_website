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

export interface PastCouncilMember {
  id: string;
  generation: string; // 기수 (예: '제42대')
  period: string;     // 임기 (예: '2025년')
  role: string;       // 직책명 (예: '학생회장', '부학생회장', '총무부장')
  name: string;       // 성명
  photo_url?: string | null; // 사진 URL or Data URL
  sort_order?: number;
  created_at?: string;
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
  author_id?: string | null;
  approval?: 'approved' | 'pending' | 'rejected';
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

export interface EditHistoryItem {
  edited_at: string;
  edited_by: string;
  reason: string;
}

export interface MinuteAttachment {
  name: string;
  url: string;
  size?: string;
  type?: 'image' | 'file';
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
  receipt_url?: string; // 영수증/증빙 파일 필수 첨부 (Base64 or URL)
  receipt_name?: string;
  created_by?: string;
  created_at?: string;
  edit_history?: EditHistoryItem[];
  is_deleted?: boolean;
  deleted_reason?: string;
  deleted_at?: string;
  deleted_by?: string;
}

export interface MeetingMinute {
  id: string;
  title: string;
  meeting_type: '정기임원회의' | '개강총회' | '종강총회' | '임시회의' | '운영위원회';
  meeting_date: string;
  location?: string;
  attendees: string;
  agenda: string;
  content: string;
  decisions: string;
  chairperson?: string;
  recorder?: string;
  attachments?: MinuteAttachment[];
  created_by?: string;
  created_at?: string;
  edit_history?: EditHistoryItem[];
  is_deleted?: boolean;
  deleted_reason?: string;
  deleted_at?: string;
  deleted_by?: string;
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

export interface ConstitutionArticle {
  number: number | string;
  title: string;
  section?: string | null;
  content: string;
}

export interface ConstitutionChapter {
  chapter: number | string;
  title: string;
  articles: ConstitutionArticle[];
}

export interface ConstitutionDocument {
  id: 'constitution' | 'election' | 'bylaws';
  title: string;
  short_title: string;
  revision_date: string;
  preamble?: string;
  chapters: ConstitutionChapter[];
}

export interface ConstitutionVersion {
  id: string;
  title: string;
  revision_date: string;
  is_current: boolean;
  description: string;
  documents: ConstitutionDocument[];
  created_at: string;
  updated_at: string;
}

// 학우 소통 및 건의사항 게시판 모델
export interface FeedbackReply {
  id: string;
  author_id?: string | null;
  author: string; // 예: 학생회장, 총무부 등
  content: string;
  created_at: string;
}

export interface FeedbackItem {
  id: string;
  title: string;
  content: string;
  category: '학사/수업' | '행사/스터디' | '학생회운영' | '기타';
  author: string;
  created_at: string;
  status: '접수완료' | '답변완료';
  author_id?: string | null;
  replies: FeedbackReply[];
}

// 자유게시판 모델
export interface FreePostReply {
  id: string;
  author_id?: string | null;
  author: string;
  content: string;
  created_at: string;
}

export interface FreePost {
  id: string;
  title: string;
  content: string;
  category: '자유' | '질문' | '취업·이직' | '정보공유';
  author: string;
  created_at: string;
  author_id?: string | null;
  views: number;
  replies: FreePostReply[];
}

// 학습자료 및 기타자료 모델
export interface AcademicMaterial {
  id: string;
  grade: 1 | 2 | 3 | 4; // 학년 (1~4학년)
  semester: 1 | 2;     // 1학기 | 2학기
  course_name: string; // 전공 교과목명 (예: C프로그래밍, 자료구조 등)
  title: string;
  description: string;
  category: '기출문제/해설' | '출석수업요약' | '과제물참고자료' | '강의노트' | '기타자료';
  author: string;
  created_at: string;
  downloads: number;
  file_name?: string;
  file_size?: string;
  file_url?: string;
  author_id?: string | null;
  has_file?: boolean; // 목록 조회 시 첨부 파일 존재 여부 (파일 데이터는 다운로드 시 개별 조회)
}

// 관리자 회원 관리용 (개인정보 포함, 관리자 세션에서만 조회 가능)
export interface AdminMember {
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
  consent_version: string;
  consented_at: string;
  created_at: string;
}

// 활동보고 (사진 및 영상 게시판 모델)
export interface ActivityReport {
  id: string;
  title: string;
  category: '대회' | '행사' | '스터디' | '임원회의' | '기타';
  description: string;
  activity_date: string; // YYYY-MM-DD
  media_type: 'image' | 'video';
  media_url: string;     // 이미지 URL/DataURL 또는 동영상/유튜브 URL
  thumbnail_url?: string; // 동영상 썸네일
  youtube_id?: string;   // 유튜브 영상 ID
  author?: string;
  created_by?: string;
  created_at: string;
  views?: number;
  is_pinned?: boolean;
  is_deleted?: boolean;
  deleted_reason?: string;
  deleted_at?: string;
  deleted_by?: string;
}

