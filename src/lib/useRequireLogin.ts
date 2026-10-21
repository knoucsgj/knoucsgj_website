import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { auth } from '../services/auth';

/**
 * 글쓰기·자료 등록·스터디 신청 전에 호출합니다.
 * 로그인되어 있으면 true, 아니면 로그인 페이지로 이동시키고 false를 반환합니다.
 */
export function useRequireLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  return useCallback((): boolean => {
    if (auth.isLoggedIn()) return true;
    alert('회원 전용 기능입니다. 로그인 후 이용해 주세요.');
    navigate(`/login?next=${encodeURIComponent(location.pathname + location.search)}`);
    return false;
  }, [navigate, location]);
}
