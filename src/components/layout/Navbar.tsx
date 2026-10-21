import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ExternalLink, ChevronRight, Shield, ZoomIn } from 'lucide-react';
import { auth, useAuth } from '../../services/auth';
import { ASSETS } from '../../lib/assets';

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLargeText, setIsLargeText] = useState(() => {
    return localStorage.getItem('knou_large_text') === 'true';
  });
  const location = useLocation();
  const { member, isAdmin } = useAuth();

  useEffect(() => {
    if (isLargeText) {
      document.documentElement.classList.add('large-text');
    } else {
      document.documentElement.classList.remove('large-text');
    }
  }, [isLargeText]);

  const toggleLargeText = () => {
    const next = !isLargeText;
    setIsLargeText(next);
    localStorage.setItem('knou_large_text', String(next));
  };

  const navLinks = [
    { name: '홈', path: '/' },
    { name: '학생회 소개', path: '/about' },
    { name: '공지사항', path: '/notices' },
    { name: '주요일정', path: '/calendar' },
    { name: '학술·스터디', path: '/studies' },
    { name: '커뮤니티', path: '/community' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 transition-all">
      {/* Top Utility Bar */}
      <div className="bg-slate-900 text-slate-300 text-xs sm:text-sm py-2 px-4 hidden sm:block">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 text-slate-300 font-medium">
            <span>한국방송통신대학교 광주전남지역대학</span>
            <span className="text-slate-600">/</span>
            <span className="text-white font-semibold">컴퓨터과학과 학생회</span>
          </div>

          <div className="flex items-center gap-4 text-xs sm:text-sm">
            {/* Senior Accessibility: Font size toggle */}
            <button
              onClick={toggleLargeText}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
              title="어르신 및 큰 글씨가 필요하신 분을 위한 글자 확대 기능"
            >
              <ZoomIn className="w-3.5 h-3.5 text-blue-400" />
              <span>글자 크기</span>
              <span className={`px-1.5 py-0.2 rounded text-[11px] font-bold ${isLargeText ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
                {isLargeText ? '크게' : '보통'}
              </span>
            </button>

            <span className="text-slate-700">|</span>
            <a
              href="https://m.knou.ac.kr/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-300 hover:text-white transition-colors font-semibold"
            >
              MyKNOU 학사정보
            </a>
            <span className="text-slate-700">|</span>
            <a
              href="https://wgwangju.knou.ac.kr/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-300 hover:text-white transition-colors"
            >
              광주전남지역대학
            </a>
            <span className="text-slate-700">|</span>
            <a
              href="https://cs.knou.ac.kr/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-300 hover:text-white transition-colors"
            >
              컴퓨터과학과
            </a>
            <span className="text-slate-700">|</span>
            {member ? (
              <>
                <Link to="/account" className="text-blue-300 hover:text-white font-semibold transition-colors">
                  {member.nickname} 님
                </Link>
                <button onClick={() => auth.logout()} className="text-slate-300 hover:text-white transition-colors">
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-slate-300 hover:text-white transition-colors font-semibold">
                  로그인
                </Link>
                <Link to="/register" className="text-emerald-300 hover:text-white transition-colors font-semibold">
                  회원가입
                </Link>
              </>
            )}
            <span className="text-slate-700">|</span>
            <Link
              to="/admin"
              className={`flex items-center gap-1 transition-colors ${
                isAdmin ? 'text-amber-400 font-bold' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>{isAdmin ? '관리자 모드' : '학생회 관리'}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Official Emblem (BS16 엠블럼 C) & 2-Line Perfectly Justified Identity */}
          <Link to="/" className="flex items-center gap-3.5 sm:gap-4 group shrink-0 py-1">
            <img
              src={ASSETS.UI.emblemC}
              alt="한국방송통신대학교 엠블럼"
              className="h-14 sm:h-15 md:h-16 w-auto object-contain shrink-0 drop-shadow-xs transition-transform group-hover:scale-105"
            />
            <div className="flex flex-col justify-center select-none w-fit">
              {/* 윗줄: 광주전남지역대학 - 방송대 전용색상 KNOU Dark Blue (#0054a6) */}
              <div className="font-knou font-extrabold text-[#0054a6] text-[18px] sm:text-[19.5px] leading-tight tracking-tight group-hover:text-[#003875] transition-colors">
                광주전남지역대학
              </div>
              {/* 아랫줄: 컴퓨터과학과 학생회 - 더 진한 굵기(font-black)와 좁은 자간(tracking-tighter) */}
              <div className="font-knou font-black text-[#003d80] text-[17.5px] sm:text-[19px] leading-tight tracking-tighter mt-0.5 group-hover:text-[#002855] transition-colors">
                컴퓨터과학과 학생회
              </div>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((item) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative px-3 xl:px-4 py-2 text-sm xl:text-base font-semibold transition-colors ${
                    active
                      ? 'text-blue-700 after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:bg-blue-600'
                      : 'text-slate-700 hover:text-slate-950'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Action: Academic & Learning Portals */}
          <div className="hidden sm:flex items-center gap-2">
            <a
              href="https://m.knou.ac.kr/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-xs"
            >
              MyKNOU 학사정보
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <a
              href="https://ucampus.knou.ac.kr"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-bold rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-xs"
            >
              U-KNOU 원격수강
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 focus:outline-hidden"
              aria-label="메뉴 열기"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white shadow-xl animate-in slide-in-from-top-2 duration-150">
          <div className="px-4 pt-3 pb-6 space-y-1">
            {/* Mobile Font Size Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100 mb-2">
              <span className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <ZoomIn className="w-4 h-4 text-blue-600" />
                화면 글자 크기
              </span>
              <button
                onClick={toggleLargeText}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  isLargeText
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-slate-700 border border-slate-300'
                }`}
              >
                {isLargeText ? '큰 글씨 적용 중' : '큰 글씨로 확대'}
              </button>
            </div>

            {navLinks.map((item) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center justify-between px-3 py-3.5 rounded-xl text-base font-semibold transition-colors ${
                    active
                      ? 'bg-blue-50 text-blue-700 font-bold'
                      : 'text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <span>{item.name}</span>
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </Link>
              );
            })}

            <div className="pt-4 border-t border-slate-100 mt-2 space-y-2">
              {member ? (
                <div className="flex gap-2">
                  <Link
                    to="/account"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 text-center py-3 px-4 rounded-xl bg-blue-50 text-blue-800 font-bold text-sm"
                  >
                    {member.nickname} 님 · 내 정보
                  </Link>
                  <button
                    onClick={() => { auth.logout(); setIsOpen(false); }}
                    className="py-3 px-4 rounded-xl bg-slate-100 text-slate-700 font-semibold text-sm"
                  >
                    로그아웃
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 text-center py-3 px-4 rounded-xl bg-blue-600 text-white font-bold text-sm"
                  >
                    로그인
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 text-center py-3 px-4 rounded-xl bg-emerald-600 text-white font-bold text-sm"
                  >
                    회원가입
                  </Link>
                </div>
              )}
              <a
                href="https://m.knou.ac.kr/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 text-white font-bold text-sm shadow-xs"
              >
                MyKNOU 학사정보 바로가기
                <ExternalLink className="w-4 h-4" />
              </a>
              <a
                href="https://ucampus.knou.ac.kr"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-900 text-white font-bold text-sm shadow-xs"
              >
                U-KNOU 원격수강 바로가기
                <ExternalLink className="w-4 h-4" />
              </a>
              <Link
                to="/admin"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-100 text-slate-700 font-semibold text-sm hover:bg-slate-200"
              >
                <Shield className="w-4 h-4 text-slate-500" />
                학생회 관리자 센터
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
