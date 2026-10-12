import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Notice, AcademicEvent, CouncilMember, StudyGroup } from '../lib/types';
import { initialNotices } from '../data/mockNotices';
import { initialEvents } from '../data/mockEvents';
import { councilMembers as mockCouncilMembers, mockStudies as mockInitialStudies } from '../data/mockCouncil';

const NOTICES_STORAGE_KEY = 'knoucs_local_notices';
const EVENTS_STORAGE_KEY = 'knoucs_local_events';

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
  // 공지사항 조회
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

  // 특정 공지사항 상세 조회
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

  // 학사일정 조회
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

  // 학생회 임원진 조회
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
    return mockCouncilMembers;
  },

  // 스터디 목록 조회
  async getStudies(): Promise<StudyGroup[]> {
    return mockInitialStudies;
  },

  // 공지사항 등록 (관리자 또는 데모용)
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
  }
};
