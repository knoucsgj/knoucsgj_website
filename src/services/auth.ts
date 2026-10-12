const ADMIN_SESSION_KEY = 'knoucs_admin_session';
const ADMIN_PASSWORD_KEY = 'knoucs_custom_admin_pw';
const DEFAULT_PASSWORD = 'knoucs2026!';

export const auth = {
  // Check if admin is currently logged in
  isAdmin(): boolean {
    return localStorage.getItem(ADMIN_SESSION_KEY) === 'true';
  },

  // Admin login check
  login(password: string): boolean {
    const currentPassword = localStorage.getItem(ADMIN_PASSWORD_KEY) || DEFAULT_PASSWORD;
    if (password === currentPassword) {
      localStorage.setItem(ADMIN_SESSION_KEY, 'true');
      return true;
    }
    return false;
  },

  // Admin logout
  logout(): void {
    localStorage.removeItem(ADMIN_SESSION_KEY);
  },

  // Change admin password
  changePassword(oldPw: string, newPw: string): { success: boolean; message: string } {
    const currentPassword = localStorage.getItem(ADMIN_PASSWORD_KEY) || DEFAULT_PASSWORD;
    if (oldPw !== currentPassword) {
      return { success: false, message: '기존 비밀번호가 일치하지 않습니다.' };
    }
    if (!newPw || newPw.length < 4) {
      return { success: false, message: '새 비밀번호는 4자 이상이어야 합니다.' };
    }
    localStorage.setItem(ADMIN_PASSWORD_KEY, newPw);
    return { success: true, message: '관리자 비밀번호가 성공적으로 변경되었습니다.' };
  },

  // Get default password hint for easy handover
  getDefaultPasswordHint(): string {
    return DEFAULT_PASSWORD;
  }
};
