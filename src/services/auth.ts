import { useSyncExternalStore } from 'react';

const ADMIN_FLAG_KEY = 'knoucs_admin_session'; // UI hint only. The server session cookie is the source of truth.

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
    return !!state.member;
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot(): AuthState {
    return state;
  },

  /** Sync UI state with the server session (call once on app start). */
  async refresh(): Promise<void> {
    try {
      const data = await call<{ member: MemberProfile | null; admin: boolean }>('me', 'GET');
      setState({ member: data.member, isAdmin: data.admin, loaded: true });
    } catch {
      setState({ loaded: true });
    }
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
    setState({ member: data.member });
    return data.member;
  },
  async login(username: string, password: string): Promise<MemberProfile> {
    const data = await call<{ member: MemberProfile }>('login', 'POST', { username, password });
    setState({ member: data.member });
    return data.member;
  },
  async logout(): Promise<void> {
    try {
      await call('logout');
    } finally {
      setState({ member: null });
    }
  },
  async withdraw(password: string): Promise<void> {
    await call('withdraw', 'POST', { password });
    setState({ member: null });
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
  async adminLogin(usernameOrPw: string, pw?: string): Promise<boolean> {
    const username = pw !== undefined ? usernameOrPw : 'admin';
    const password = pw !== undefined ? pw : usernameOrPw;
    try {
      await call('admin-login', 'POST', { username, password });
      setState({ isAdmin: true });
      return true;
    } catch (e: any) {
      throw e;
    }
  },
  async adminLogout(): Promise<void> {
    try {
      await call('admin-logout');
    } finally {
      setState({ isAdmin: false });
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

export function useAuth(): AuthState {
  return useSyncExternalStore(auth.subscribe, auth.getSnapshot);
}
