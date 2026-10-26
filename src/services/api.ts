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
  AdminMember,
  ConstitutionVersion,
  ActivityReport
} from '../lib/types';
import { initialNotices } from '../data/mockNotices';
import { initialEvents } from '../data/mockEvents';
import {
  councilMembers as mockCouncilMembers,
  councilIntro as mockCouncilIntro,
  mockStudies as mockInitialStudies
} from '../data/mockCouncil';
import { initialBudgetReports } from '../data/mockFinance';
import { initialActivities } from '../data/mockActivities';
import { initialMeetingMinutes, councilRules as mockCouncilRules } from '../data/mockGovernance';
import {
  officialConstitutionDocuments,
  type ConstitutionDocument
} from '../data/officialConstitution';
import { initialRentalItems, initialPartnerships, initialGalleryPhotos } from '../data/mockWelfare';
import { initialFeedbacks } from '../data/mockFeedback';
import { initialFreePosts } from '../data/mockFreePosts';
import { initialMaterials } from '../data/mockMaterials';

// Cloudflare D1 API Request Helper (모든 사용자가 동일한 서버 데이터를 조회합니다)
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
  } catch {
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
  // 1. 공지사항 (Notices) CRUD - D1 전용
  // ==========================================
  async getNotices(): Promise<Notice[]> {
    const cloudData = await fetchD1<Notice[]>('notices');
    if (Array.isArray(cloudData)) {
      return cloudData;
    }
    return initialNotices;
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
  // 2. 학사일정 (Academic Events) CRUD - D1 전용
  // ==========================================
  async getEvents(): Promise<AcademicEvent[]> {
    const cloudEvents = await fetchD1<AcademicEvent[]>('events');
    if (Array.isArray(cloudEvents)) {
      return cloudEvents;
    }
    return initialEvents;
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
  // 3. 학생회 인사말 & 임원진 (Council) CRUD - D1 전용
  // ==========================================
  async getCouncilIntro(): Promise<typeof mockCouncilIntro> {
    const cloud = await fetchD1<typeof mockCouncilIntro>('council-intro');
    if (cloud && cloud.title) {
      return cloud;
    }
    return mockCouncilIntro;
  },

  async updateCouncilIntro(intro: typeof mockCouncilIntro): Promise<typeof mockCouncilIntro> {
    return await fetchStrict<typeof mockCouncilIntro>('council-intro', {
      method: 'PUT',
      body: JSON.stringify(intro),
    });
  },

  async getCouncilMembers(): Promise<CouncilMember[]> {
    const cloud = await fetchD1<CouncilMember[]>('council-members');
    if (Array.isArray(cloud) && cloud.length > 0) {
      return cloud;
    }
    return mockCouncilMembers;
  },

  async createCouncilMember(member: Omit<CouncilMember, 'id'>): Promise<CouncilMember> {
    return await fetchStrict<CouncilMember>('council-members', {
      method: 'POST',
      body: JSON.stringify(member),
    });
  },

  async updateCouncilMember(id: string, updatedFields: Partial<CouncilMember>): Promise<CouncilMember | null> {
    await fetchStrict<any>(`council-members&id=${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(updatedFields),
    });
    return { id, ...updatedFields } as CouncilMember;
  },

  async deleteCouncilMember(id: string): Promise<boolean> {
    await fetchStrict<any>(`council-members&id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    return true;
  },

  // ==========================================
  // 3-1. 역대 학생회 임원진 (Past Council Members) - D1 전용
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
  // 4. 스터디 그룹 (Studies) CRUD - D1 전용
  // ==========================================
  async getStudies(): Promise<StudyGroup[]> {
    const cloudStudies = await fetchD1<StudyGroup[]>('studies');
    if (Array.isArray(cloudStudies)) {
      return cloudStudies;
    }
    return mockInitialStudies;
  },

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
  // 5. 학생회비 결산보고 (Budget Reports) CRUD - D1 전용
  // ==========================================
  async getBudgetReports(): Promise<BudgetReport[]> {
    const cloud = await fetchD1<BudgetReport[]>('budget-reports');
    if (Array.isArray(cloud) && cloud.length > 0) {
      return cloud;
    }
    return initialBudgetReports;
  },

  async createBudgetReport(report: Omit<BudgetReport, 'id' | 'published_date'>): Promise<BudgetReport> {
    const newReport: BudgetReport = {
      ...report,
      id: `budget-${Date.now()}`,
      published_date: new Date().toISOString().split('T')[0],
    };
    return await fetchStrict<BudgetReport>('budget-reports', {
      method: 'POST',
      body: JSON.stringify(newReport),
    });
  },

    async updateBudgetReport(id: string, updatedFields: Partial<BudgetReport>, editReason: string): Promise<BudgetReport | null> {
    await fetchStrict<any>(`budget-reports&id=${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify({ ...updatedFields, edit_reason: editReason }),
    });
    return { id, ...updatedFields } as BudgetReport;
  },

  async deleteBudgetReport(id: string, deletedReason: string): Promise<boolean> {
    await fetchStrict<any>(`budget-reports&id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
      body: JSON.stringify({ deleted_reason: deletedReason }),
    });
    return true;
  },


  // ==========================================
  // 학과 활동보고 (사진 및 영상 갤러리) - D1 연동
  // ==========================================
  async getActivities(): Promise<ActivityReport[]> {
    const cloud = await fetchD1<ActivityReport[]>('activities');
    if (Array.isArray(cloud) && cloud.length > 0) {
      return cloud;
    }
    return initialActivities;
  },

  async createActivity(activity: Omit<ActivityReport, 'id' | 'created_at'>): Promise<ActivityReport> {
    return await fetchStrict<ActivityReport>('activities', {
      method: 'POST',
      body: JSON.stringify(activity),
    });
  },

  async updateActivity(id: string, updatedFields: Partial<ActivityReport>): Promise<boolean> {
    await fetchStrict<any>(`activities&id=${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(updatedFields),
    });
    return true;
  },

  async deleteActivity(id: string, reason?: string): Promise<boolean> {
    await fetchStrict<any>(`activities&id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
      body: JSON.stringify({ reason }),
    });
    return true;
  },

  async incrementActivityViews(id: string): Promise<void> {
    try {
      await fetchD1<any>(`activities&id=${encodeURIComponent(id)}&tail=views`, {
        method: 'POST',
      });
    } catch {
      /* ignore */
    }
  },

  // ==========================================
  // 6. 회의록 (Meeting Minutes) CRUD - D1 전용
  // ==========================================
  async getMeetingMinutes(): Promise<MeetingMinute[]> {
    const cloud = await fetchD1<MeetingMinute[]>('minutes');
    if (Array.isArray(cloud) && cloud.length > 0) {
      return cloud;
    }
    return initialMeetingMinutes;
  },

  async createMeetingMinute(minute: Omit<MeetingMinute, 'id'>): Promise<MeetingMinute> {
    return await fetchStrict<MeetingMinute>('minutes', {
      method: 'POST',
      body: JSON.stringify(minute),
    });
  },

  async updateMeetingMinute(id: string, updatedFields: Partial<MeetingMinute>, editReason: string): Promise<MeetingMinute | null> {
    await fetchStrict<any>(`minutes&id=${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify({ ...updatedFields, edit_reason: editReason }),
    });
    return { id, ...updatedFields } as MeetingMinute;
  },

  async deleteMeetingMinute(id: string, deletedReason: string): Promise<boolean> {
    await fetchStrict<any>(`minutes&id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
      body: JSON.stringify({ deleted_reason: deletedReason }),
    });
    return true;
  },

  // 총괄관리자(admin) 전용: 투명성 보존 감사 로그 (소프트 삭제된 결산/회의록 이력)
  async getAdminAudits(): Promise<{ budgets: BudgetReport[]; minutes: MeetingMinute[] }> {
    return await fetchStrict<{ budgets: BudgetReport[]; minutes: MeetingMinute[] }>('admin-audits');
  },

  // ==========================================
  // 7. 학과 학생회칙 및 세칙 - 공식 문서 & D1 버전 관리
  // ==========================================
  async getCouncilRules(): Promise<CouncilRuleChapter[]> {
    return mockCouncilRules;
  },

  async getConstitutionDocuments(): Promise<ConstitutionDocument[]> {
    return officialConstitutionDocuments;
  },

  // 학과 학생회칙 및 세칙 버전 관리 (Constitution Versions) - D1 실시간 조회/수정
  async getConstitutionVersions(): Promise<ConstitutionVersion[]> {
    const cloud = await fetchD1<ConstitutionVersion[]>('constitution-versions');
    if (Array.isArray(cloud) && cloud.length > 0) {
      return cloud;
    }
    return [
      {
        id: 'ver-20180402-11',
        title: '제11차 개정 학생회칙 (2018. 04. 02)',
        revision_date: '2018. 04. 02',
        is_current: true,
        description: '2018년 4월 2일 제11차 개정 학생회칙, 간부선거세칙 및 시행세칙 전문',
        documents: officialConstitutionDocuments,
        created_at: '2018-04-02T00:00:00.000Z',
        updated_at: '2018-04-02T00:00:00.000Z'
      }
    ];
  },

  async createConstitutionVersion(version: Omit<ConstitutionVersion, 'id' | 'created_at' | 'updated_at'>): Promise<ConstitutionVersion> {
    return await fetchStrict<ConstitutionVersion>('constitution-versions', {
      method: 'POST',
      body: JSON.stringify(version)
    });
  },

  async updateConstitutionVersion(id: string, updatedFields: Partial<ConstitutionVersion>): Promise<ConstitutionVersion> {
    return await fetchStrict<ConstitutionVersion>(`constitution-versions&id=${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(updatedFields)
    });
  },

  async deleteConstitutionVersion(id: string): Promise<boolean> {
    await fetchStrict<any>(`constitution-versions&id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    return true;
  },

  // ==========================================
  // 8. 학생 복지 & 비품 (Welfare) - D1 전용
  // ==========================================
  async getRentalItems(): Promise<RentalItem[]> {
    const cloud = await fetchD1<RentalItem[]>('rentals');
    if (Array.isArray(cloud) && cloud.length > 0) {
      return cloud;
    }
    return initialRentalItems;
  },

  async createRentalItem(item: Omit<RentalItem, 'id'>): Promise<RentalItem> {
    return await fetchStrict<RentalItem>('rentals', {
      method: 'POST',
      body: JSON.stringify(item),
    });
  },

  async updateRentalItem(id: string, updatedFields: Partial<RentalItem>): Promise<RentalItem | null> {
    await fetchStrict<any>(`rentals&id=${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(updatedFields),
    });
    return { id, ...updatedFields } as RentalItem;
  },

  async deleteRentalItem(id: string): Promise<boolean> {
    await fetchStrict<any>(`rentals&id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    return true;
  },

  async getPartnerships(): Promise<PartnershipItem[]> {
    return initialPartnerships;
  },

  async getGalleryPhotos() {
    return initialGalleryPhotos;
  },

  // ==========================================
  // 9. 학우 소통 및 열린 건의함 (Feedbacks) CRUD - D1 전용
  // ==========================================
  async getFeedbacks(): Promise<FeedbackItem[]> {
    const cloudFeedbacks = await fetchD1<FeedbackItem[]>('feedbacks');
    if (Array.isArray(cloudFeedbacks)) {
      return cloudFeedbacks;
    }
    return initialFeedbacks;
  },

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
  // 10. 커뮤니티 자유게시판 (Free Posts) CRUD - D1 전용
  // ==========================================
  async getFreePosts(): Promise<FreePost[]> {
    const cloudPosts = await fetchD1<FreePost[]>('freeposts');
    if (Array.isArray(cloudPosts)) {
      return cloudPosts;
    }
    return initialFreePosts;
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
  // 11. 학습자료 및 기타자료 (Academic Materials) CRUD - D1 전용
  // ==========================================
  async getMaterials(): Promise<AcademicMaterial[]> {
    const cloudMaterials = await fetchD1<AcademicMaterial[]>('materials');
    if (Array.isArray(cloudMaterials)) {
      return cloudMaterials;
    }
    return initialMaterials;
  },

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
  // 12. 전체 데이터 백업 및 복원 (D1 서버 데이터 기반)
  // ==========================================
  async exportAllData(): Promise<string> {
    const notices = await this.getNotices();
    const events = await this.getEvents();
    const intro = await this.getCouncilIntro();
    const members = await this.getCouncilMembers();
    const pastMembers = await this.getPastCouncilMembers();
    const studies = await this.getStudies();
    const budgets = await this.getBudgetReports();
    const minutes = await this.getMeetingMinutes();
    const rentals = await this.getRentalItems();
    const feedbacks = await this.getFeedbacks();
    const freeposts = await this.getFreePosts();
    const materials = await this.getMaterials();

    const backupData = {
      version: '3.0',
      exported_at: new Date().toISOString(),
      organization: '한국방송통신대학교 광주전남지역대학 컴퓨터과학과 학생회',
      data: {
        notices,
        events,
        intro,
        members,
        pastMembers,
        studies,
        budgets,
        minutes,
        rentals,
        feedbacks,
        freeposts,
        materials,
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

      // 서버 D1 데이터베이스에 항목별로 동기화 반영
      let restoredCount = 0;
      if (Array.isArray(parsed.data.notices)) {
        for (const n of parsed.data.notices) {
          try {
            await fetchStrict('notices', { method: 'POST', body: JSON.stringify(n) });
            restoredCount++;
          } catch { /* duplicate or error */ }
        }
      }
      if (Array.isArray(parsed.data.events)) {
        for (const e of parsed.data.events) {
          try {
            await fetchStrict('events', { method: 'POST', body: JSON.stringify(e) });
            restoredCount++;
          } catch { /* duplicate or error */ }
        }
      }
      if (parsed.data.intro) {
        try {
          await this.updateCouncilIntro(parsed.data.intro);
          restoredCount++;
        } catch { /* ignore */ }
      }
      if (Array.isArray(parsed.data.budgets)) {
        for (const b of parsed.data.budgets) {
          try {
            await fetchStrict('budget-reports', { method: 'POST', body: JSON.stringify(b) });
            restoredCount++;
          } catch { /* ignore */ }
        }
      }
      if (Array.isArray(parsed.data.rentals)) {
        for (const r of parsed.data.rentals) {
          try {
            await fetchStrict('rentals', { method: 'POST', body: JSON.stringify(r) });
            restoredCount++;
          } catch { /* ignore */ }
        }
      }

      // 이전 브라우저 로컬스토리지 잔여 캐시가 있다면 청소
      this.clearLegacyBrowserStorage();

      return { success: true, message: `서버 데이터베이스에 총 ${restoredCount}건의 데이터가 성공적으로 복원되었습니다.` };
    } catch (e: any) {
      return { success: false, message: `복원 처리 오류: ${e.message}` };
    }
  },

  // 구버전에서 브라우저 로컬에 남겨졌을 수 있는 잔여 캐시 키들을 완전히 정리하는 유틸리티
  clearLegacyBrowserStorage(): void {
    const legacyKeys = [
      'knoucs_local_notices',
      'knoucs_local_events',
      'knoucs_local_council_members',
      'knoucs_local_past_council_members',
      'knoucs_local_council_intro',
      'knoucs_local_studies',
      'knoucs_local_budgets',
      'knoucs_local_minutes',
      'knoucs_local_rentals',
      'knoucs_local_feedbacks',
      'knoucs_local_freeposts',
      'knoucs_local_materials'
    ];
    legacyKeys.forEach((k) => {
      try {
        localStorage.removeItem(k);
      } catch {
        /* ignore */
      }
    });
  },

  async resetToDefaults(): Promise<void> {
    // 브라우저에 남아있던 과거 잔여 로컬스토리지 캐시를 전면 정리
    this.clearLegacyBrowserStorage();
  },

  // ==========================================
  // 13. 이메일 발송 설정 (Admin) - D1/Worker 전용
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
