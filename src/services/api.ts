import type {
  Notice,
  AcademicEvent,
  CouncilMember,
  PastCouncilMember,
  StudyGroup,
  BudgetReport,
  MeetingMinute,
  RentalItem,
  PartnershipItem,
  CouncilRuleChapter,
  FeedbackItem,
  FeedbackReply,
  FreePost,
  FreePostReply,
  AcademicMaterial,
  AdminMember
} from '../lib/types';
import { initialNotices } from '../data/mockNotices';
import { initialEvents } from '../data/mockEvents';
import {
  councilMembers as mockCouncilMembers,
  councilIntro as mockCouncilIntro,
  mockStudies as mockInitialStudies
} from '../data/mockCouncil';
import { initialBudgetReports } from '../data/mockFinance';
import { initialMeetingMinutes, councilRules as mockCouncilRules } from '../data/mockGovernance';
import {
  officialConstitutionDocuments,
  type ConstitutionDocument
} from '../data/officialConstitution';
import { initialRentalItems, initialPartnerships, initialGalleryPhotos } from '../data/mockWelfare';
import { initialFeedbacks } from '../data/mockFeedback';
import { initialFreePosts } from '../data/mockFreePosts';
import { initialMaterials } from '../data/mockMaterials';

const NOTICES_STORAGE_KEY = 'knoucs_local_notices';
const EVENTS_STORAGE_KEY = 'knoucs_local_events';
const COUNCIL_MEMBERS_KEY = 'knoucs_local_council_members';
const COUNCIL_INTRO_KEY = 'knoucs_local_council_intro';
const STUDIES_STORAGE_KEY = 'knoucs_local_studies';
const BUDGET_REPORTS_KEY = 'knoucs_local_budgets';
const MINUTES_STORAGE_KEY = 'knoucs_local_minutes';
const RENTALS_STORAGE_KEY = 'knoucs_local_rentals';
const FEEDBACKS_STORAGE_KEY = 'knoucs_local_feedbacks';
const FREEPOSTS_STORAGE_KEY = 'knoucs_local_freeposts';
const MATERIALS_STORAGE_KEY = 'knoucs_local_materials';

function getLocalItem<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setLocalItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Failed to save to localStorage', e);
  }
}

// Cloudflare D1 API Request Helper
async function fetchD1<T>(resource: string, options: RequestInit = {}): Promise<T | null> {
  try {
    const res = await fetch(`/api?resource=${resource}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch (e) {
    return null;
  }
}

// Strict request: throws an Error carrying the server's message (used for writes that need auth).
async function fetchStrict<T>(query: string, options: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`/api?resource=${query}`, {
      credentials: 'same-origin',
      ...options,
      headers: { 'Content-Type': 'application/json', ...options.headers },
    });
  } catch {
    throw new Error('서버에 연결할 수 없습니다. 네트워크 상태를 확인해 주세요.');
  }
  let data: any = null;
  try {
    data = await res.json();
  } catch {
    /* ignore */
  }
  if (!res.ok || data === null) {
    throw new Error((data && data.error) || '요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.');
  }
  return data as T;
}

export const api = {
  // ==========================================
  // 1. 공지사항 (Notices) CRUD
  // ==========================================
  async getNotices(): Promise<Notice[]> {
    const cloudData = await fetchD1<Notice[]>('notices');
    if (Array.isArray(cloudData)) {
      return cloudData;
    }
    return getLocalItem<Notice[]>(NOTICES_STORAGE_KEY, initialNotices);
  },

  async getNoticeById(id: string): Promise<Notice | undefined> {
    const notices = await this.getNotices();
    return notices.find((n) => n.id === id);
  },

  async createNotice(notice: Omit<Notice, 'id' | 'created_at' | 'views'>): Promise<Notice> {
    const newNotice: Notice = {
      ...notice,
      id: `notice-${Date.now()}`,
      created_at: new Date().toISOString().split('T')[0],
      views: 1,
    };

    const cloudSaved = await fetchStrict<Notice>('notices', {
      method: 'POST',
      body: JSON.stringify(newNotice),
    });
    return { ...newNotice, ...cloudSaved, is_pinned: !!cloudSaved.is_pinned, attachments: newNotice.attachments };
  },

  async updateNotice(id: string, updatedFields: Partial<Notice>): Promise<Notice | null> {
    const current = await this.getNotices();
    const existing = current.find((n) => n.id === id);
    if (!existing) return null;
    const merged: Notice = { ...existing, ...updatedFields };
    await fetchStrict<any>(`notices&id=${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(merged),
    });
    return merged;
  },

  async deleteNotice(id: string): Promise<boolean> {
    await fetchStrict<any>(`notices&id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    return true;
  },

  // ==========================================
  // 2. 학사일정 (Academic Events) CRUD
  // ==========================================
  async getEvents(): Promise<AcademicEvent[]> {
    const cloudEvents = await fetchD1<AcademicEvent[]>('events');
    if (Array.isArray(cloudEvents)) {
      return cloudEvents;
    }
    return getLocalItem<AcademicEvent[]>(EVENTS_STORAGE_KEY, initialEvents);
  },

  async createEvent(event: Omit<AcademicEvent, 'id'>): Promise<AcademicEvent> {
    const newEvent: AcademicEvent = {
      ...event,
      id: `event-${Date.now()}`,
    };
    await fetchStrict<AcademicEvent>('events', {
      method: 'POST',
      body: JSON.stringify(newEvent),
    });
    return newEvent;
  },

  async updateEvent(id: string, updatedFields: Partial<AcademicEvent>): Promise<AcademicEvent | null> {
    const current = await this.getEvents();
    const existing = current.find((ev) => ev.id === id);
    if (!existing) return null;
    const merged: AcademicEvent = { ...existing, ...updatedFields };
    await fetchStrict<any>(`events&id=${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(merged),
    });
    return merged;
  },

  async deleteEvent(id: string): Promise<boolean> {
    await fetchStrict<any>(`events&id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    return true;
  },

  // ==========================================
  // 3. 학생회 인사말 & 임원진 (Council) CRUD
  // ==========================================
  async getCouncilIntro(): Promise<typeof mockCouncilIntro> {
    const cloud = await fetchD1<typeof mockCouncilIntro>('council-intro');
    if (cloud && cloud.title) {
      setLocalItem(COUNCIL_INTRO_KEY, cloud);
      return cloud;
    }
    return getLocalItem<typeof mockCouncilIntro>(COUNCIL_INTRO_KEY, mockCouncilIntro);
  },

  async updateCouncilIntro(intro: typeof mockCouncilIntro): Promise<typeof mockCouncilIntro> {
    const saved = await fetchStrict<typeof mockCouncilIntro>('council-intro', {
      method: 'PUT',
      body: JSON.stringify(intro),
    });
    setLocalItem(COUNCIL_INTRO_KEY, saved);
    return saved;
  },

  async getCouncilMembers(): Promise<CouncilMember[]> {
    const cloud = await fetchD1<CouncilMember[]>('council-members');
    if (Array.isArray(cloud) && cloud.length > 0) {
      setLocalItem(COUNCIL_MEMBERS_KEY, cloud);
      return cloud;
    }
    return getLocalItem<CouncilMember[]>(COUNCIL_MEMBERS_KEY, mockCouncilMembers);
  },

  async createCouncilMember(member: Omit<CouncilMember, 'id'>): Promise<CouncilMember> {
    const saved = await fetchStrict<CouncilMember>('council-members', {
      method: 'POST',
      body: JSON.stringify(member),
    });
    const current = getLocalItem<CouncilMember[]>(COUNCIL_MEMBERS_KEY, mockCouncilMembers);
    setLocalItem(COUNCIL_MEMBERS_KEY, [...current, saved]);
    return saved;
  },

  async updateCouncilMember(id: string, updatedFields: Partial<CouncilMember>): Promise<CouncilMember | null> {
    await fetchStrict<any>(`council-members&id=${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(updatedFields),
    });
    const current = getLocalItem<CouncilMember[]>(COUNCIL_MEMBERS_KEY, mockCouncilMembers);
    let updatedMember: CouncilMember | null = null;
    const next = current.map((m) => {
      if (m.id === id) {
        updatedMember = { ...m, ...updatedFields };
        return updatedMember;
      }
      return m;
    });
    setLocalItem(COUNCIL_MEMBERS_KEY, next);
    return updatedMember;
  },

  async deleteCouncilMember(id: string): Promise<boolean> {
    await fetchStrict<any>(`council-members&id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    const current = getLocalItem<CouncilMember[]>(COUNCIL_MEMBERS_KEY, mockCouncilMembers);
    const next = current.filter((m) => m.id !== id);
    setLocalItem(COUNCIL_MEMBERS_KEY, next);
    return true;
  },

  // ==========================================
  // 3-1. 역대 학생회 임원진 (Past Council Members)
  // 브라우저 저장방식(localStorage)을 일절 사용하지 않고 오직 서버 DB에서만 조회/반영합니다.
  // ==========================================
  async getPastCouncilMembers(): Promise<PastCouncilMember[]> {
    const cloud = await fetchD1<PastCouncilMember[]>('past-council-members');
    if (Array.isArray(cloud)) {
      return cloud;
    }
    return [];
  },

  async createPastCouncilMember(member: Omit<PastCouncilMember, 'id'>): Promise<PastCouncilMember> {
    return await fetchStrict<PastCouncilMember>('past-council-members', {
      method: 'POST',
      body: JSON.stringify(member),
    });
  },

  async updatePastCouncilMember(id: string, updatedFields: Partial<PastCouncilMember>): Promise<PastCouncilMember | null> {
    await fetchStrict<any>(`past-council-members&id=${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(updatedFields),
    });
    return { id, ...updatedFields } as PastCouncilMember;
  },

  async deletePastCouncilMember(id: string): Promise<boolean> {
    await fetchStrict<any>(`past-council-members&id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    return true;
  },

  // ==========================================
  // 4. 스터디 그룹 (Studies) CRUD
  // ==========================================
  async getStudies(): Promise<StudyGroup[]> {
    const cloudStudies = await fetchD1<StudyGroup[]>('studies');
    if (Array.isArray(cloudStudies)) {
      return cloudStudies;
    }
    return getLocalItem<StudyGroup[]>(STUDIES_STORAGE_KEY, mockInitialStudies);
  },

  // 회원: 승인 대기 상태로 신청 / 관리자: 즉시 등록. 개설자(leader)는 서버가 로그인 정보로 결정합니다.
  async createStudy(study: Omit<StudyGroup, 'id' | 'created_at' | 'approval' | 'author_id'>): Promise<StudyGroup> {
    return fetchStrict<StudyGroup>('studies', {
      method: 'POST',
      body: JSON.stringify(study),
    });
  },

  async updateStudy(id: string, updatedFields: Partial<StudyGroup>): Promise<StudyGroup | null> {
    await fetchStrict<any>(`studies&id=${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(updatedFields),
    });
    const all = await this.getStudies();
    return all.find((s) => s.id === id) || null;
  },

  async deleteStudy(id: string): Promise<boolean> {
    await fetchStrict<any>(`studies&id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    return true;
  },

  // ==========================================
  // 5. 학생회비 결산보고 (Budget Reports) CRUD
  // ==========================================
  async getBudgetReports(): Promise<BudgetReport[]> {
    return getLocalItem<BudgetReport[]>(BUDGET_REPORTS_KEY, initialBudgetReports);
  },

  async createBudgetReport(report: Omit<BudgetReport, 'id' | 'published_date'>): Promise<BudgetReport> {
    const newReport: BudgetReport = {
      ...report,
      id: `budget-${Date.now()}`,
      published_date: new Date().toISOString().split('T')[0],
    };
    const current = getLocalItem<BudgetReport[]>(BUDGET_REPORTS_KEY, initialBudgetReports);
    const updated = [newReport, ...current];
    setLocalItem(BUDGET_REPORTS_KEY, updated);
    return newReport;
  },

  // ==========================================
  // 6. 회의록 (Meeting Minutes) CRUD
  // ==========================================
  async getMeetingMinutes(): Promise<MeetingMinute[]> {
    const cloud = await fetchD1<MeetingMinute[]>('minutes');
    if (Array.isArray(cloud) && cloud.length > 0) {
      setLocalItem(MINUTES_STORAGE_KEY, cloud);
      return cloud;
    }
    return getLocalItem<MeetingMinute[]>(MINUTES_STORAGE_KEY, initialMeetingMinutes);
  },

  async createMeetingMinute(minute: Omit<MeetingMinute, 'id'>): Promise<MeetingMinute> {
    const saved = await fetchStrict<MeetingMinute>('minutes', {
      method: 'POST',
      body: JSON.stringify(minute),
    });
    const current = getLocalItem<MeetingMinute[]>(MINUTES_STORAGE_KEY, initialMeetingMinutes);
    const updated = [saved, ...current];
    setLocalItem(MINUTES_STORAGE_KEY, updated);
    return saved;
  },

  async deleteMeetingMinute(id: string): Promise<boolean> {
    await fetchStrict<any>(`minutes&id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    const current = getLocalItem<MeetingMinute[]>(MINUTES_STORAGE_KEY, initialMeetingMinutes);
    const next = current.filter((m) => m.id !== id);
    setLocalItem(MINUTES_STORAGE_KEY, next);
    return true;
  },

  // ==========================================
  // 7. 학과 학생회칙 및 세칙
  // ==========================================
  async getCouncilRules(): Promise<CouncilRuleChapter[]> {
    return mockCouncilRules;
  },

  async getConstitutionDocuments(): Promise<ConstitutionDocument[]> {
    return officialConstitutionDocuments;
  },

  // ==========================================
  // 8. 학생 복지 & 비품 (Welfare)
  // ==========================================
  async getRentalItems(): Promise<RentalItem[]> {
    return getLocalItem<RentalItem[]>(RENTALS_STORAGE_KEY, initialRentalItems);
  },

  async getPartnerships(): Promise<PartnershipItem[]> {
    return initialPartnerships;
  },

  async getGalleryPhotos() {
    return initialGalleryPhotos;
  },

  // ==========================================
  // 9. 학우 소통 및 열린 건의함 (Feedbacks) CRUD
  // ==========================================
  async getFeedbacks(): Promise<FeedbackItem[]> {
    const cloudFeedbacks = await fetchD1<FeedbackItem[]>('feedbacks');
    if (Array.isArray(cloudFeedbacks)) {
      return cloudFeedbacks;
    }
    return getLocalItem<FeedbackItem[]>(FEEDBACKS_STORAGE_KEY, initialFeedbacks);
  },

  // 작성자는 서버가 로그인한 회원의 닉네임으로 기록합니다.
  async createFeedback(feedback: Omit<FeedbackItem, 'id' | 'created_at' | 'status' | 'replies' | 'author' | 'author_id'>): Promise<FeedbackItem> {
    return fetchStrict<FeedbackItem>('feedbacks', {
      method: 'POST',
      body: JSON.stringify(feedback),
    });
  },

  async addFeedbackReply(feedbackId: string, reply: Omit<FeedbackReply, 'id' | 'created_at' | 'author_id'>): Promise<void> {
    await fetchStrict<any>('feedbacks', {
      method: 'POST',
      body: JSON.stringify({ type: 'reply', feedback_id: feedbackId, ...reply }),
    });
  },

  async deleteFeedback(id: string): Promise<boolean> {
    await fetchStrict<any>(`feedbacks&id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    return true;
  },

  // ==========================================
  // 10. 커뮤니티 자유게시판 (Free Posts) CRUD
  // ==========================================
  async getFreePosts(): Promise<FreePost[]> {
    const cloudPosts = await fetchD1<FreePost[]>('freeposts');
    if (Array.isArray(cloudPosts)) {
      return cloudPosts;
    }
    return getLocalItem<FreePost[]>(FREEPOSTS_STORAGE_KEY, initialFreePosts);
  },

  async createFreePost(post: Omit<FreePost, 'id' | 'created_at' | 'views' | 'replies' | 'author' | 'author_id'>): Promise<FreePost> {
    return fetchStrict<FreePost>('freeposts', {
      method: 'POST',
      body: JSON.stringify(post),
    });
  },

  async addFreePostReply(postId: string, reply: Pick<FreePostReply, 'content'>): Promise<void> {
    await fetchStrict<any>('freeposts', {
      method: 'POST',
      body: JSON.stringify({ type: 'reply', post_id: postId, ...reply }),
    });
  },

  async deleteFreePost(id: string): Promise<boolean> {
    await fetchStrict<any>(`freeposts&id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    return true;
  },

  // ==========================================
  // 11. 학습자료 및 기타자료 (Academic Materials) CRUD
  // ==========================================
  async getMaterials(): Promise<AcademicMaterial[]> {
    const cloudMaterials = await fetchD1<AcademicMaterial[]>('materials');
    if (Array.isArray(cloudMaterials)) {
      return cloudMaterials;
    }
    return getLocalItem<AcademicMaterial[]>(MATERIALS_STORAGE_KEY, initialMaterials);
  },

  // 목록에는 첨부 파일 데이터가 포함되지 않으므로 다운로드 시 개별 조회합니다.
  async getMaterialFile(id: string): Promise<string | null> {
    const item = await fetchD1<{ file_url?: string }>(`materials&id=${encodeURIComponent(id)}`);
    return item?.file_url || null;
  },

  async createMaterial(material: Omit<AcademicMaterial, 'id' | 'created_at' | 'downloads' | 'author' | 'author_id' | 'has_file'>): Promise<AcademicMaterial> {
    return fetchStrict<AcademicMaterial>('materials', {
      method: 'POST',
      body: JSON.stringify(material),
    });
  },

  async incrementMaterialDownload(id: string): Promise<void> {
    await fetchD1<any>(`materials&id=${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify({ increment_download: true }),
    });
  },

  async updateMaterial(id: string, updatedFields: Partial<AcademicMaterial>): Promise<void> {
    await fetchStrict<any>(`materials&id=${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(updatedFields),
    });
  },

  async deleteMaterial(id: string): Promise<boolean> {
    await fetchStrict<any>(`materials&id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    return true;
  },

  // ==========================================
  // 11-1. 회원 관리 (관리자 전용)
  // ==========================================
  async getMembers(): Promise<AdminMember[]> {
    return fetchStrict<AdminMember[]>('members');
  },

  async updateMemberNickname(id: string, nickname: string): Promise<boolean> {
    await fetchStrict<any>(`members&id=${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify({ nickname }),
    });
    return true;
  },

  async updateMemberRole(id: string, role: AdminMember['role']): Promise<boolean> {
    await fetchStrict<any>(`members&id=${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
    return true;
  },

  async deleteMember(id: string): Promise<boolean> {
    await fetchStrict<any>(`members&id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    return true;
  },

  // ==========================================
  // 12. 전체 데이터 백업 및 복원 (Export / Import)
  // ==========================================
  async exportAllData(): Promise<string> {
    const notices = await this.getNotices();
    const events = await this.getEvents();
    const intro = await this.getCouncilIntro();
    const members = await this.getCouncilMembers();
    const studies = await this.getStudies();
    const budgets = await this.getBudgetReports();
    const minutes = await this.getMeetingMinutes();
    const rentals = await this.getRentalItems();

    const backupData = {
      version: '2.0',
      exported_at: new Date().toISOString(),
      organization: '한국방송통신대학교 광주전남지역대학 컴퓨터과학과 학생회',
      data: {
        notices,
        events,
        intro,
        members,
        studies,
        budgets,
        minutes,
        rentals
      }
    };

    return JSON.stringify(backupData, null, 2);
  },

  async importAllData(jsonString: string): Promise<{ success: boolean; message: string }> {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.data) {
        return { success: false, message: '올바른 백업 파일 형식이 아닙니다 (data 필드 부재).' };
      }

      if (Array.isArray(parsed.data.notices)) setLocalItem(NOTICES_STORAGE_KEY, parsed.data.notices);
      if (Array.isArray(parsed.data.events)) setLocalItem(EVENTS_STORAGE_KEY, parsed.data.events);
      if (parsed.data.intro) setLocalItem(COUNCIL_INTRO_KEY, parsed.data.intro);
      if (Array.isArray(parsed.data.members)) setLocalItem(COUNCIL_MEMBERS_KEY, parsed.data.members);
      if (Array.isArray(parsed.data.studies)) setLocalItem(STUDIES_STORAGE_KEY, parsed.data.studies);
      if (Array.isArray(parsed.data.budgets)) setLocalItem(BUDGET_REPORTS_KEY, parsed.data.budgets);
      if (Array.isArray(parsed.data.minutes)) setLocalItem(MINUTES_STORAGE_KEY, parsed.data.minutes);
      if (Array.isArray(parsed.data.rentals)) setLocalItem(RENTALS_STORAGE_KEY, parsed.data.rentals);

      return { success: true, message: '모든 학생회 데이터가 성공적으로 복원되었습니다!' };
    } catch (e: any) {
      return { success: false, message: `JSON 파싱 오류: ${e.message}` };
    }
  },

  async resetToDefaults(): Promise<void> {
    localStorage.removeItem(NOTICES_STORAGE_KEY);
    localStorage.removeItem(EVENTS_STORAGE_KEY);
    localStorage.removeItem(COUNCIL_MEMBERS_KEY);
    localStorage.removeItem(COUNCIL_INTRO_KEY);
    localStorage.removeItem(STUDIES_STORAGE_KEY);
    localStorage.removeItem(BUDGET_REPORTS_KEY);
    localStorage.removeItem(MINUTES_STORAGE_KEY);
    localStorage.removeItem(RENTALS_STORAGE_KEY);
  },

  // ==========================================
  // 12. 이메일 발송 설정 (Admin)
  // ==========================================
  async getEmailSettings() {
    return await fetchStrict<{
      provider: 'brevo' | 'resend' | 'gas';
      sender: string;
      sender_name: string;
      gas_url?: string;
      has_api_key: boolean;
      api_key_masked?: string;
    }>('email-settings');
  },

  async updateEmailSettings(payload: {
    provider?: string;
    api_key?: string;
    sender?: string;
    sender_name?: string;
    gas_url?: string;
  }) {
    return await fetchStrict<{ success: boolean; message: string }>('email-settings', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  async sendTestEmail(testEmail: string) {
    return await fetchStrict<{ success: boolean; message: string }>('email-settings', {
      method: 'POST',
      body: JSON.stringify({ test_email: testEmail }),
    });
  }
};
