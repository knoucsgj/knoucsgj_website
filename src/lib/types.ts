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
