import { useSyncExternalStore } from 'react';
import type { MemberCustomPermissions } from '../lib/types';

const ADMIN_FLAG_KEY = 'knoucs_admin_session'; // UI hint only. The server session cookie is the source of truth.

export type MemberRole = 'president' | 'officer' | 'regular' | 'associate';

export interface MemberProfile {
  id: string;
  username: string;
  nickname: string;
  name: string;
  phone: string;
  address: string;
  student_no: string;
  regional_college: string;
  department: string;
  learning_center?: string;
  role: MemberRole;
  permissions?: string | MemberCustomPermissions | null;
  created_at: string;
}

export interface RegisterPayload {
  username: string;
  password: string;
  nickname: string;
  name: string;
  phone: string;
  address: string;
  student_no: string;
  regional_college: string;
  department: string;
  learning_center?: string;
  consent_privacy: boolean;
  consent_terms: boolean;
}

export const REGIONAL_COLLEGES = [
  '서울', '인천', '경기', '강원', '충북', '대전충남', '세종', '전북', '광주전남',
  '대구', '경북', '부산', '울산', '경남', '제주', '해외',
];

interface AuthState {
  member: MemberProfile | null;
  isAdmin: boolean;
  loaded: boolean;
}

let state: AuthState = {
  member: null,
  isAdmin: localStorage.getItem(ADMIN_FLAG_KEY) === 'true',
  loaded: false,
};
const listeners = new Set<() => void>();

function setState(patch: Partial<AuthState>) {
  state = { ...state, ...patch };
  if (patch.isAdmin !== undefined) {
    if (patch.isAdmin) localStorage.setItem(ADMIN_FLAG_KEY, 'true');
    else localStorage.removeItem(ADMIN_FLAG_KEY);
  }
  listeners.forEach((l) => l());
}

async function call<T = any>(action: string, method: 'GET' | 'POST' = 'POST', body?: unknown): Promise<T> {
  const res = await fetch(`/api?resource=auth&action=${action}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  let data: any = null;
  try {
    data = await res.json();
  } catch {
    /* non-JSON (e.g. API not reachable) */
  }
  if (!res.ok) throw new Error((data && data.error) || '서버와 통신할 수 없습니다. 잠시 후 다시 시도해 주세요.');
  if (data === null) throw new Error('서버와 통신할 수 없습니다. 잠시 후 다시 시도해 주세요.');
  return data as T;
}

export const auth = {
  // ---- state access
  isAdmin(): boolean {
    return state.isAdmin;
  },
  getMember(): MemberProfile | null {
    return state.member;
  },
  isLoggedIn(): boolean {
    return !!state.member || state.isAdmin;
  },
  getRole(): 'admin' | MemberRole | 'guest' {
    if (state.isAdmin) return 'admin';
    if (state.member) return state.member.role || 'associate';
    return 'guest';
  },
  isMasterAdmin(): boolean {
    return state.isAdmin;
  },
  isPresident(): boolean {
    return state.member?.role === 'president';
  },
  isOfficer(): boolean {
    return state.member?.role === 'officer';
  },
  isCouncil(): boolean {
    if (state.member && (state.member.role === 'associate' || state.member.role === 'regular')) {
      return false; // 일반 회원/준회원 계정으로 접속 중일 때는 일반 사용자 시각 유지
    }
    return state.isAdmin || state.member?.role === 'president' || state.member?.role === 'officer';
  },
  isRegularOrAbove(): boolean {
    // 준회원(associate)은 어떠한 경우에도 글쓰기/다운로드 권한 불가
    if (state.member && state.member.role === 'associate') return false;
    if (!state.member && state.isAdmin) return true;
    return !!state.member && state.member.role !== 'associate';
  },
  canAccessAdmin(): boolean {
    return state.isAdmin || state.member?.role === 'president' || state.member?.role === 'officer';
  },
  canManageMembers(): boolean {
    return state.isAdmin || state.member?.role === 'president';
  },
  canDeleteNotice(category?: string): boolean {
    if (state.member && (state.member.role === 'associate' || state.member.role === 'regular')) {
      return false;
    }
    if (category === '결산' || category === '회의록') return state.isAdmin;
    return state.isAdmin || state.member?.role === 'president' || state.member?.role === 'officer';
  },
  canAnswerFeedback(): boolean {
    if (state.member && (state.member.role === 'associate' || state.member.role === 'regular')) {
      return false; // 준회원 또는 일반 정회원은 건의함 답변 댓글 작성 불가
    }
    return state.isAdmin || state.member?.role === 'president' || state.member?.role === 'officer';
  },
  canDownloadMaterials(): boolean {
    return this.isRegularOrAbove();
  },
  canWriteFreePost(): boolean {
    return this.isRegularOrAbove();
  },
  canCreateFeedback(): boolean {
    return this.isRegularOrAbove();
  },
  canUploadMaterials(): boolean {
    return this.isRegularOrAbove();
  },
  canCreateStudy(): boolean {
    return this.isRegularOrAbove();
  },

  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot(): AuthState {
    return state;
  },

  /** Sync UI state with the server session (call on app start or event). */
  async refresh(): Promise<void> {
    try {
      const data = await call<{ member: MemberProfile | null; admin: boolean }>('me', 'GET');
      setState({ member: data.member, isAdmin: data.admin, loaded: true });
    } catch {
      setState({ loaded: true });
    }
  },

  /** Notify all browser tabs that auth/role state changed */
  notifySync() {
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('knoucs_auth_channel');
        bc.postMessage({ type: 'AUTH_SYNC', time: Date.now() });
        bc.close();
      }
    } catch {}
    try {
      localStorage.setItem('knoucs_auth_sync_event', String(Date.now()));
    } catch {}
    this.refresh();
  },

  // ---- member accounts
  async sendEmailCode(email: string, type: 'register' | 'reset-password' = 'register'): Promise<{ success: boolean; message: string; devCode?: string }> {
    return await call<{ success: boolean; message: string; devCode?: string }>('send-email-code', 'POST', { email, type });
  },
  async verifyEmailCode(email: string, code: string): Promise<{ success: boolean; message: string }> {
    return await call<{ success: boolean; message: string }>('verify-email-code', 'POST', { email, code });
  },
  async register(payload: RegisterPayload): Promise<MemberProfile> {
    const data = await call<{ member: MemberProfile }>('register', 'POST', payload);
    setState({ member: data.member, isAdmin: false });
    this.notifySync();
    return data.member;
  },
  async login(username: string, password: string): Promise<MemberProfile> {
    const data = await call<{ member: MemberProfile; admin?: boolean }>('login', 'POST', { username, password });
    setState({ member: data.member, isAdmin: !!data.admin });
    this.notifySync();
    return data.member;
  },
  async logout(): Promise<void> {
    try {
      await call('logout');
    } finally {
      setState({ member: null, isAdmin: false });
      this.notifySync();
    }
  },
  async withdraw(password: string): Promise<void> {
    await call('withdraw', 'POST', { password });
    setState({ member: null, isAdmin: false });
    this.notifySync();
  },
  async changeMemberPassword(oldPw: string, newPw: string): Promise<void> {
    await call('change-password', 'POST', { old_password: oldPw, new_password: newPw });
  },
  async resetPassword(payload: {
    username: string;
    name: string;
    student_no: string;
    phone?: string;
    new_password: string;
  }): Promise<{ success: boolean; message: string }> {
    return await call<{ success: boolean; message: string }>('reset-password', 'POST', payload);
  },

  // ---- admin (student council) session
  async adminLogin(usernameOrPw: string, pw?: string): Promise<{ success: boolean; role?: string }> {
    const username = pw !== undefined ? usernameOrPw : 'admin';
    const password = pw !== undefined ? pw : usernameOrPw;
    try {
      const res = await call<{ success: boolean; role?: string; member?: MemberProfile }>('admin-login', 'POST', { username, password });
      if (res.role === 'admin') {
        setState({ isAdmin: true });
      } else if (res.member) {
        setState({ member: res.member, isAdmin: false });
      } else {
        setState({ isAdmin: true });
      }
      this.notifySync();
      return res;
    } catch (e: any) {
      throw e;
    }
  },
  async adminLogout(): Promise<void> {
    try {
      await call('admin-logout');
    } finally {
      setState({ isAdmin: false });
      this.notifySync();
    }
  },
  async adminChangePassword(oldPw: string, newPw: string): Promise<{ success: boolean; message: string }> {
    try {
      await call('admin-change-password', 'POST', { old_password: oldPw, new_password: newPw });
      return { success: true, message: '관리자 비밀번호가 성공적으로 변경되었습니다.' };
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  },
};

// Global cross-tab and real-time auto-synchronization
if (typeof window !== 'undefined') {
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      const bc = new BroadcastChannel('knoucs_auth_channel');
      bc.onmessage = () => {
        auth.refresh();
      };
    }
  } catch {}

  window.addEventListener('storage', (e) => {
    if (e.key === 'knoucs_auth_sync_event') {
      auth.refresh();
    }
  });

  window.addEventListener('focus', () => {
    auth.refresh();
  });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      auth.refresh();
    }
  });

  setInterval(() => {
    if (document.visibilityState === 'visible') {
      auth.refresh();
    }
  }, 8000);
}

export function useAuth(): AuthState {
  return useSyncExternalStore(auth.subscribe, auth.getSnapshot);
}
