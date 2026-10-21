import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type {
  Notice,
  AcademicEvent,
  CouncilMember,
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
  AcademicMaterial
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

export const api = {
  // ==========================================
  // 1. 공지사항 (Notices) CRUD
  // ==========================================
  async getNotices(): Promise<Notice[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('notices')
          .select('*')
          .order('is_pinned', { ascending: false })
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          return data as Notice[];
        }
      } catch (e) {
        console.warn('Supabase fetch failed, falling back to local data', e);
      }
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

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('notices')
          .insert([newNotice])
          .select()
          .single();

        if (!error && data) {
          return data as Notice;
        }
      } catch (e) {
        console.error('Supabase notice insert error:', e);
      }
    }

    const current = getLocalItem<Notice[]>(NOTICES_STORAGE_KEY, initialNotices);
    const updated = [newNotice, ...current];
    setLocalItem(NOTICES_STORAGE_KEY, updated);
    return newNotice;
  },

  async updateNotice(id: string, updatedFields: Partial<Notice>): Promise<Notice | null> {
    const current = getLocalItem<Notice[]>(NOTICES_STORAGE_KEY, initialNotices);
    let updatedNotice: Notice | null = null;
    const next = current.map((n) => {
      if (n.id === id) {
        updatedNotice = { ...n, ...updatedFields };
        return updatedNotice;
      }
      return n;
    });
    setLocalItem(NOTICES_STORAGE_KEY, next);
    return updatedNotice;
  },

  async deleteNotice(id: string): Promise<boolean> {
    const current = getLocalItem<Notice[]>(NOTICES_STORAGE_KEY, initialNotices);
    const next = current.filter((n) => n.id !== id);
    setLocalItem(NOTICES_STORAGE_KEY, next);
    return true;
  },

  // ==========================================
  // 2. 학사일정 (Academic Events) CRUD
  // ==========================================
  async getEvents(): Promise<AcademicEvent[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('academic_events')
          .select('*')
          .order('start_date', { ascending: true });

        if (!error && data && data.length > 0) {
          return data as AcademicEvent[];
        }
      } catch (e) {
        console.warn('Supabase events fetch failed, using local events', e);
      }
    }
    return getLocalItem<AcademicEvent[]>(EVENTS_STORAGE_KEY, initialEvents);
  },

  async createEvent(event: Omit<AcademicEvent, 'id'>): Promise<AcademicEvent> {
    const newEvent: AcademicEvent = {
      ...event,
      id: `event-${Date.now()}`,
    };
    const current = getLocalItem<AcademicEvent[]>(EVENTS_STORAGE_KEY, initialEvents);
    const updated = [...current, newEvent].sort(
      (a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
    );
    setLocalItem(EVENTS_STORAGE_KEY, updated);
    return newEvent;
  },

  async updateEvent(id: string, updatedFields: Partial<AcademicEvent>): Promise<AcademicEvent | null> {
    const current = getLocalItem<AcademicEvent[]>(EVENTS_STORAGE_KEY, initialEvents);
    let updatedEvent: AcademicEvent | null = null;
    const next = current.map((ev) => {
      if (ev.id === id) {
        updatedEvent = { ...ev, ...updatedFields };
        return updatedEvent;
      }
      return ev;
    });
    setLocalItem(EVENTS_STORAGE_KEY, next);
    return updatedEvent;
  },

  async deleteEvent(id: string): Promise<boolean> {
    const current = getLocalItem<AcademicEvent[]>(EVENTS_STORAGE_KEY, initialEvents);
    const next = current.filter((ev) => ev.id !== id);
    setLocalItem(EVENTS_STORAGE_KEY, next);
    return true;
  },

  // ==========================================
  // 3. 학생회 인사말 & 임원진 (Council) CRUD
  // ==========================================
  async getCouncilIntro(): Promise<typeof mockCouncilIntro> {
    return getLocalItem<typeof mockCouncilIntro>(COUNCIL_INTRO_KEY, mockCouncilIntro);
  },

  async updateCouncilIntro(intro: typeof mockCouncilIntro): Promise<typeof mockCouncilIntro> {
    setLocalItem(COUNCIL_INTRO_KEY, intro);
    return intro;
  },

  async getCouncilMembers(): Promise<CouncilMember[]> {
    return getLocalItem<CouncilMember[]>(COUNCIL_MEMBERS_KEY, mockCouncilMembers);
  },

  async createCouncilMember(member: Omit<CouncilMember, 'id'>): Promise<CouncilMember> {
    const newMember: CouncilMember = {
      ...member,
      id: `cm-${Date.now()}`,
    };
    const current = getLocalItem<CouncilMember[]>(COUNCIL_MEMBERS_KEY, mockCouncilMembers);
    const updated = [...current, newMember];
    setLocalItem(COUNCIL_MEMBERS_KEY, updated);
    return newMember;
  },

  async updateCouncilMember(id: string, updatedFields: Partial<CouncilMember>): Promise<CouncilMember | null> {
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
    const current = getLocalItem<CouncilMember[]>(COUNCIL_MEMBERS_KEY, mockCouncilMembers);
    const next = current.filter((m) => m.id !== id);
    setLocalItem(COUNCIL_MEMBERS_KEY, next);
    return true;
  },

  // ==========================================
  // 4. 스터디 그룹 (Studies) CRUD
  // ==========================================
  async getStudies(): Promise<StudyGroup[]> {
    return getLocalItem<StudyGroup[]>(STUDIES_STORAGE_KEY, mockInitialStudies);
  },

  async createStudy(study: Omit<StudyGroup, 'id' | 'created_at'>): Promise<StudyGroup> {
    const newStudy: StudyGroup = {
      ...study,
      id: `study-${Date.now()}`,
      created_at: new Date().toISOString().split('T')[0],
      members_count: study.members_count || 1,
    };
    const current = getLocalItem<StudyGroup[]>(STUDIES_STORAGE_KEY, mockInitialStudies);
    const updated = [newStudy, ...current];
    setLocalItem(STUDIES_STORAGE_KEY, updated);
    return newStudy;
  },

  async updateStudy(id: string, updatedFields: Partial<StudyGroup>): Promise<StudyGroup | null> {
    const current = getLocalItem<StudyGroup[]>(STUDIES_STORAGE_KEY, mockInitialStudies);
    let updatedStudy: StudyGroup | null = null;
    const next = current.map((s) => {
      if (s.id === id) {
        updatedStudy = { ...s, ...updatedFields };
        return updatedStudy;
      }
      return s;
    });
    setLocalItem(STUDIES_STORAGE_KEY, next);
    return updatedStudy;
  },

  async deleteStudy(id: string): Promise<boolean> {
    const current = getLocalItem<StudyGroup[]>(STUDIES_STORAGE_KEY, mockInitialStudies);
    const next = current.filter((s) => s.id !== id);
    setLocalItem(STUDIES_STORAGE_KEY, next);
    return true;
  },

  // ==========================================
  // 5. 투명 재정 (Budget & Finance) CRUD
  // ==========================================
  async getBudgetReports(): Promise<BudgetReport[]> {
    return getLocalItem<BudgetReport[]>(BUDGET_REPORTS_KEY, initialBudgetReports);
  },

  async createBudgetReport(report: Omit<BudgetReport, 'id' | 'published_date'>): Promise<BudgetReport> {
    const newReport: BudgetReport = {
      ...report,
      id: `budget-${Date.now()}`,
      published_date: new Date().toISOString().split('T')[0]
    };
    const current = getLocalItem<BudgetReport[]>(BUDGET_REPORTS_KEY, initialBudgetReports);
    const updated = [newReport, ...current];
    setLocalItem(BUDGET_REPORTS_KEY, updated);
    return newReport;
  },

  async deleteBudgetReport(id: string): Promise<boolean> {
    const current = getLocalItem<BudgetReport[]>(BUDGET_REPORTS_KEY, initialBudgetReports);
    const next = current.filter((r) => r.id !== id);
    setLocalItem(BUDGET_REPORTS_KEY, next);
    return true;
  },

  // ==========================================
  // 6. 의결기구 회의록 (Meeting Minutes) CRUD
  // ==========================================
  async getMeetingMinutes(): Promise<MeetingMinute[]> {
    return getLocalItem<MeetingMinute[]>(MINUTES_STORAGE_KEY, initialMeetingMinutes);
  },

  async createMeetingMinute(minute: Omit<MeetingMinute, 'id'>): Promise<MeetingMinute> {
    const newMinute: MeetingMinute = {
      ...minute,
      id: `min-${Date.now()}`
    };
    const current = getLocalItem<MeetingMinute[]>(MINUTES_STORAGE_KEY, initialMeetingMinutes);
    const updated = [newMinute, ...current];
    setLocalItem(MINUTES_STORAGE_KEY, updated);
    return newMinute;
  },

  async deleteMeetingMinute(id: string): Promise<boolean> {
    const current = getLocalItem<MeetingMinute[]>(MINUTES_STORAGE_KEY, initialMeetingMinutes);
    const next = current.filter((m) => m.id !== id);
    setLocalItem(MINUTES_STORAGE_KEY, next);
    return true;
  },

  // ==========================================
  // 7. 학과 학생회칙 (Council Rules)
  // ==========================================
  async getCouncilRules(): Promise<CouncilRuleChapter[]> {
    return mockCouncilRules;
  },

  // ==========================================
  // 8. 학생 복지 대여사업 & 제휴 (Welfare & Rentals)
  // ==========================================
  async getRentalItems(): Promise<RentalItem[]> {
    return getLocalItem<RentalItem[]>(RENTALS_STORAGE_KEY, initialRentalItems);
  },

  async updateRentalItem(id: string, updatedFields: Partial<RentalItem>): Promise<RentalItem | null> {
    const current = getLocalItem<RentalItem[]>(RENTALS_STORAGE_KEY, initialRentalItems);
    let updated: RentalItem | null = null;
    const next = current.map((item) => {
      if (item.id === id) {
        updated = { ...item, ...updatedFields };
        return updated;
      }
      return item;
    });
    setLocalItem(RENTALS_STORAGE_KEY, next);
    return updated;
  },

  async getPartnerships(): Promise<PartnershipItem[]> {
    return initialPartnerships;
  },

  async getGalleryPhotos(): Promise<typeof initialGalleryPhotos> {
    return initialGalleryPhotos;
  },

  // ==========================================
  // 9. 학우 소통 & 건의함 (Feedbacks) CRUD
  // ==========================================
  async getFeedbacks(): Promise<FeedbackItem[]> {
    return getLocalItem<FeedbackItem[]>(FEEDBACKS_STORAGE_KEY, initialFeedbacks);
  },

  async createFeedback(item: Omit<FeedbackItem, 'id' | 'created_at' | 'status' | 'replies'>): Promise<FeedbackItem> {
    const newItem: FeedbackItem = {
      ...item,
      id: `fb-${Date.now()}`,
      created_at: new Date().toISOString().split('T')[0],
      status: '접수완료',
      replies: []
    };
    const current = getLocalItem<FeedbackItem[]>(FEEDBACKS_STORAGE_KEY, initialFeedbacks);
    const updated = [newItem, ...current];
    setLocalItem(FEEDBACKS_STORAGE_KEY, updated);
    return newItem;
  },

  async addFeedbackReply(feedbackId: string, reply: Omit<FeedbackReply, 'id' | 'created_at'>): Promise<FeedbackItem | null> {
    const current = getLocalItem<FeedbackItem[]>(FEEDBACKS_STORAGE_KEY, initialFeedbacks);
    let updatedItem: FeedbackItem | null = null;
    const next = current.map((fb) => {
      if (fb.id === feedbackId) {
        const newReply: FeedbackReply = {
          ...reply,
          id: `reply-${Date.now()}`,
          created_at: new Date().toISOString().split('T')[0]
        };
        updatedItem = {
          ...fb,
          status: '답변완료',
          replies: [...fb.replies, newReply]
        };
        return updatedItem;
      }
      return fb;
    });
    setLocalItem(FEEDBACKS_STORAGE_KEY, next);
    return updatedItem;
  },

  async deleteFeedback(id: string): Promise<boolean> {
    const current = getLocalItem<FeedbackItem[]>(FEEDBACKS_STORAGE_KEY, initialFeedbacks);
    const next = current.filter((fb) => fb.id !== id);
    setLocalItem(FEEDBACKS_STORAGE_KEY, next);
    return true;
  },

  // ==========================================
  // 10. 자유게시판 (Free Posts) CRUD
  // ==========================================
  async getFreePosts(): Promise<FreePost[]> {
    return getLocalItem<FreePost[]>(FREEPOSTS_STORAGE_KEY, initialFreePosts);
  },

  async createFreePost(post: Omit<FreePost, 'id' | 'created_at' | 'views' | 'replies'>): Promise<FreePost> {
    const newPost: FreePost = {
      ...post,
      id: `fp-${Date.now()}`,
      created_at: new Date().toISOString().split('T')[0],
      views: 1,
      replies: []
    };
    const current = getLocalItem<FreePost[]>(FREEPOSTS_STORAGE_KEY, initialFreePosts);
    const updated = [newPost, ...current];
    setLocalItem(FREEPOSTS_STORAGE_KEY, updated);
    return newPost;
  },

  async addFreePostReply(postId: string, reply: Omit<FreePostReply, 'id' | 'created_at'>): Promise<FreePost | null> {
    const current = getLocalItem<FreePost[]>(FREEPOSTS_STORAGE_KEY, initialFreePosts);
    let updatedItem: FreePost | null = null;
    const next = current.map((p) => {
      if (p.id === postId) {
        const newReply: FreePostReply = {
          ...reply,
          id: `fpr-${Date.now()}`,
          created_at: new Date().toISOString().split('T')[0]
        };
        updatedItem = {
          ...p,
          replies: [...p.replies, newReply]
        };
        return updatedItem;
      }
      return p;
    });
    setLocalItem(FREEPOSTS_STORAGE_KEY, next);
    return updatedItem;
  },

  async deleteFreePost(id: string): Promise<boolean> {
    const current = getLocalItem<FreePost[]>(FREEPOSTS_STORAGE_KEY, initialFreePosts);
    const next = current.filter((p) => p.id !== id);
    setLocalItem(FREEPOSTS_STORAGE_KEY, next);
    return true;
  },

  // ==========================================
  // 11. 학습자료 및 기타자료 (Academic Materials) CRUD
  // ==========================================
  async getMaterials(): Promise<AcademicMaterial[]> {
    return getLocalItem<AcademicMaterial[]>(MATERIALS_STORAGE_KEY, initialMaterials);
  },

  async createMaterial(material: Omit<AcademicMaterial, 'id' | 'created_at' | 'downloads'>): Promise<AcademicMaterial> {
    const newMat: AcademicMaterial = {
      ...material,
      id: `mat-${Date.now()}`,
      created_at: new Date().toISOString().split('T')[0],
      downloads: 0
    };
    const current = getLocalItem<AcademicMaterial[]>(MATERIALS_STORAGE_KEY, initialMaterials);
    const updated = [newMat, ...current];
    setLocalItem(MATERIALS_STORAGE_KEY, updated);
    return newMat;
  },

  async incrementMaterialDownload(id: string): Promise<void> {
    const current = getLocalItem<AcademicMaterial[]>(MATERIALS_STORAGE_KEY, initialMaterials);
    const next = current.map((m) => {
      if (m.id === id) {
        return { ...m, downloads: m.downloads + 1 };
      }
      return m;
    });
    setLocalItem(MATERIALS_STORAGE_KEY, next);
  },

  async updateMaterial(id: string, updatedFields: Partial<AcademicMaterial>): Promise<AcademicMaterial | null> {
    const current = getLocalItem<AcademicMaterial[]>(MATERIALS_STORAGE_KEY, initialMaterials);
    let updatedMat: AcademicMaterial | null = null;
    const next = current.map((m) => {
      if (m.id === id) {
        updatedMat = { ...m, ...updatedFields };
        return updatedMat;
      }
      return m;
    });
    setLocalItem(MATERIALS_STORAGE_KEY, next);
    return updatedMat;
  },

  async deleteMaterial(id: string): Promise<boolean> {
    const current = getLocalItem<AcademicMaterial[]>(MATERIALS_STORAGE_KEY, initialMaterials);
    const next = current.filter((m) => m.id !== id);
    setLocalItem(MATERIALS_STORAGE_KEY, next);
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
  }
};
