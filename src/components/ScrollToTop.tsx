import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * 페이지 이동(Route 변경) 시 화면 스크롤을 항상 최상단(Y=0)으로 초기화하는 컴포넌트입니다.
 * SPA 환경에서 이전 페이지의 스크롤 위치가 유지되는 현상을 방지합니다.
 */
export const ScrollToTop = () => {
  const { pathname, search } = useLocation();

  useEffect(() => {
    // 윈도우 스크롤을 즉시 화면 맨 위로 이동
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    });
  }, [pathname, search]);

  return null;
};
