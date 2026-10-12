import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Notice, AcademicEvent, CouncilMember, StudyGroup } from '../lib/types';
import { initialNotices } from '../data/mockNotices';
import { initialEvents } from '../data/mockEvents';
import {
  councilMembers as mockCouncilMembers,
  councilIntro as mockCouncilIntro,
  mockStudies as mockInitialStudies
} from '../data/mockCouncil';

const NOTICES_STORAGE_KEY = 'knoucs_local_notices';
const EVENTS_STORAGE_KEY = 'knoucs_local_events';
const COUNCIL_MEMBERS_KEY = 'knoucs_local_council_members';
const COUNCIL_INTRO_KEY = 'knoucs_local_council_intro';
const STUDIES_STORAGE_KEY = 'knoucs_local_studies';

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
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('notices')
          .select('*')
          .eq('id', id)
          .single();

        if (!error && data) {
          return data as Notice;
        }
      } catch (e) {
        console.warn('Supabase fetch single notice failed', e);
      }
    }
    const notices = getLocalItem<Notice[]>(NOTICES_STORAGE_KEY, initialNotices);
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
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('notices')
          .update(updatedFields)
          .eq('id', id)
          .select()
          .single();

        if (!error && data) {
          return data as Notice;
        }
      } catch (e) {
        console.error('Supabase update notice failed', e);
      }
    }

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
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('notices').delete().eq('id', id);
      } catch (e) {
        console.error('Supabase delete notice failed', e);
      }
    }

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

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('academic_events')
          .insert([newEvent])
          .select()
          .single();

        if (!error && data) {
          return data as AcademicEvent;
        }
      } catch (e) {
        console.error('Supabase event insert error:', e);
      }
    }

    const current = getLocalItem<AcademicEvent[]>(EVENTS_STORAGE_KEY, initialEvents);
    const updated = [...current, newEvent].sort(
      (a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
    );
    setLocalItem(EVENTS_STORAGE_KEY, updated);
    return newEvent;
  },

  async updateEvent(id: string, updatedFields: Partial<AcademicEvent>): Promise<AcademicEvent | null> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('academic_events')
          .update(updatedFields)
          .eq('id', id)
          .select()
          .single();

        if (!error && data) {
          return data as AcademicEvent;
        }
      } catch (e) {
        console.error('Supabase update event failed', e);
      }
    }

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
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('academic_events').delete().eq('id', id);
      } catch (e) {
        console.error('Supabase delete event failed', e);
      }
    }

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
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('council_members')
          .select('*')
          .order('sort_order', { ascending: true });

        if (!error && data && data.length > 0) {
          return data as CouncilMember[];
        }
      } catch (e) {
        console.warn('Supabase council fetch failed', e);
      }
    }
    return getLocalItem<CouncilMember[]>(COUNCIL_MEMBERS_KEY, mockCouncilMembers);
  },

  async createCouncilMember(member: Omit<CouncilMember, 'id'>): Promise<CouncilMember> {
    const newMember: CouncilMember = {
      ...member,
      id: `cm-${Date.now()}`,
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('council_members')
          .insert([newMember])
          .select()
          .single();

        if (!error && data) {
          return data as CouncilMember;
        }
      } catch (e) {
        console.error('Supabase council insert failed', e);
      }
    }

    const current = getLocalItem<CouncilMember[]>(COUNCIL_MEMBERS_KEY, mockCouncilMembers);
    const updated = [...current, newMember];
    setLocalItem(COUNCIL_MEMBERS_KEY, updated);
    return newMember;
  },

  async updateCouncilMember(id: string, updatedFields: Partial<CouncilMember>): Promise<CouncilMember | null> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('council_members')
          .update(updatedFields)
          .eq('id', id)
          .select()
          .single();

        if (!error && data) {
          return data as CouncilMember;
        }
      } catch (e) {
        console.error('Supabase council update failed', e);
      }
    }

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
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('council_members').delete().eq('id', id);
      } catch (e) {
        console.error('Supabase council delete failed', e);
      }
    }

    const current = getLocalItem<CouncilMember[]>(COUNCIL_MEMBERS_KEY, mockCouncilMembers);
    const next = current.filter((m) => m.id !== id);
    setLocalItem(COUNCIL_MEMBERS_KEY, next);
    return true;
  },

  // ==========================================
  // 4. 스터디 (Studies) CRUD
  // ==========================================
  async getStudies(): Promise<StudyGroup[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('study_groups')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          return data as StudyGroup[];
        }
      } catch (e) {
        console.warn('Supabase studies fetch failed, using local studies', e);
      }
    }
    return getLocalItem<StudyGroup[]>(STUDIES_STORAGE_KEY, mockInitialStudies);
  },

  async createStudy(study: Omit<StudyGroup, 'id' | 'created_at'>): Promise<StudyGroup> {
    const newStudy: StudyGroup = {
      ...study,
      id: `study-${Date.now()}`,
      created_at: new Date().toISOString().split('T')[0],
      members_count: study.members_count || 1,
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('study_groups')
          .insert([newStudy])
          .select()
          .single();

        if (!error && data) {
          return data as StudyGroup;
        }
      } catch (e) {
        console.error('Supabase study insert error:', e);
      }
    }

    const current = getLocalItem<StudyGroup[]>(STUDIES_STORAGE_KEY, mockInitialStudies);
    const updated = [newStudy, ...current];
    setLocalItem(STUDIES_STORAGE_KEY, updated);
    return newStudy;
  },

  async updateStudy(id: string, updatedFields: Partial<StudyGroup>): Promise<StudyGroup | null> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('study_groups')
          .update(updatedFields)
          .eq('id', id)
          .select()
          .single();

        if (!error && data) {
          return data as StudyGroup;
        }
      } catch (e) {
        console.error('Supabase study update error', e);
      }
    }

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
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('study_groups').delete().eq('id', id);
      } catch (e) {
        console.error('Supabase study delete error', e);
      }
    }

    const current = getLocalItem<StudyGroup[]>(STUDIES_STORAGE_KEY, mockInitialStudies);
    const next = current.filter((s) => s.id !== id);
    setLocalItem(STUDIES_STORAGE_KEY, next);
    return true;
  },

  // ==========================================
  // 5. 전체 데이터 백업 및 복원 (Export / Import)
  // ==========================================
  async exportAllData(): Promise<string> {
    const notices = await this.getNotices();
    const events = await this.getEvents();
    const intro = await this.getCouncilIntro();
    const members = await this.getCouncilMembers();
    const studies = await this.getStudies();

    const backupData = {
      version: '1.0',
      exported_at: new Date().toISOString(),
      organization: '한국방송통신대학교 광주전남지역대학 컴퓨터과학과 제43대 학생회',
      data: {
        notices,
        events,
        intro,
        members,
        studies
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

      if (Array.isArray(parsed.data.notices)) {
        setLocalItem(NOTICES_STORAGE_KEY, parsed.data.notices);
      }
      if (Array.isArray(parsed.data.events)) {
        setLocalItem(EVENTS_STORAGE_KEY, parsed.data.events);
      }
      if (parsed.data.intro) {
        setLocalItem(COUNCIL_INTRO_KEY, parsed.data.intro);
      }
      if (Array.isArray(parsed.data.members)) {
        setLocalItem(COUNCIL_MEMBERS_KEY, parsed.data.members);
      }
      if (Array.isArray(parsed.data.studies)) {
        setLocalItem(STUDIES_STORAGE_KEY, parsed.data.studies);
      }

      return { success: true, message: '모든 데이터가 성공적으로 복원되었습니다!' };
    } catch (e: any) {
      return { success: false, message: `JSON 파싱 오류: ${e.message}` };
    }
  },

  // 초기 샘플 데이터로 초기화
  async resetToDefaults(): Promise<void> {
    localStorage.removeItem(NOTICES_STORAGE_KEY);
    localStorage.removeItem(EVENTS_STORAGE_KEY);
    localStorage.removeItem(COUNCIL_MEMBERS_KEY);
    localStorage.removeItem(COUNCIL_INTRO_KEY);
    localStorage.removeItem(STUDIES_STORAGE_KEY);
  }
};
