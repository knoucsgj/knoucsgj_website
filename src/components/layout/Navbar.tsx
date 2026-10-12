import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ExternalLink, ChevronRight, Shield } from 'lucide-react';
import { auth } from '../../services/auth';
import { ASSETS } from '../../lib/assets';

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const isAdmin = auth.isAdmin();

  const navLinks = [
    { name: '홈', path: '/' },
    { name: '학과·학생회', path: '/about' },
    { name: '공지사항', path: '/notices' },
    { name: '학사일정', path: '/calendar' },
    { name: '투명재정·자치', path: '/governance' },
    { name: '학생복지·소통', path: '/welfare' },
    { name: '학술·스터디', path: '/community' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 transition-all">
      {/* Top Utility Bar */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 hidden sm:block">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 text-slate-300 font-medium">
            <span>한국방송통신대학교 광주전남지역대학</span>
            <span className="text-slate-600">/</span>
            <span className="text-slate-400">컴퓨터과학과 제43대 학생회</span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <a
              href="https://gj.knou.ac.kr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-white transition-colors"
            >
              광주전남지역대학
            </a>
            <span className="text-slate-700">|</span>
            <a
              href="https://cs.knou.ac.kr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-white transition-colors"
            >
              학과본부
            </a>
            <span className="text-slate-700">|</span>
            <Link
              to="/admin"
              className={`flex items-center gap-1 transition-colors ${
                isAdmin ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Shield className="w-3 h-3" />
              <span>{isAdmin ? '관리자 모드' : '학생회 관리'}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 sm:h-24">
          {/* Official Emblem & Wordmark */}
          <Link to="/" className="flex items-center gap-3 sm:gap-4 group shrink-0">
            <img
              src={ASSETS.UI.gwangjuJeonnam}
              alt="한국방송통신대학교 광주전남지역대학"
              className="h-11 sm:h-13 md:h-14 lg:h-15 w-auto object-contain shrink-0 drop-shadow-xs"
            />
            <div className="hidden sm:block h-9 w-px bg-slate-200" />
            <div className="flex flex-col justify-center">
              <span className="text-[10px] sm:text-[11px] font-semibold text-blue-700 tracking-wider">
                제43대 학생회
              </span>
              <span className="font-knou text-sm sm:text-base md:text-lg font-bold text-slate-900 group-hover:text-blue-700 transition-colors leading-tight">
                컴퓨터과학과
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1.5">
            {navLinks.map((item) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative px-2.5 xl:px-3.5 py-2 text-xs xl:text-sm font-semibold transition-colors ${
                    active
                      ? 'text-blue-700 after:absolute after:bottom-0 after:left-2.5 after:right-2.5 after:h-0.5 after:bg-blue-600'
                      : 'text-slate-600 hover:text-slate-950'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Action: U-KNOU Portal */}
          <div className="hidden sm:flex items-center gap-3">
            <a
              href="https://ucampus.knou.ac.kr"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-xs"
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
            {navLinks.map((item) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center justify-between px-3 py-3 rounded-xl text-base font-medium transition-colors ${
                    active
                      ? 'bg-blue-50 text-blue-700 font-bold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>{item.name}</span>
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </Link>
              );
            })}

            <div className="pt-4 border-t border-slate-100 mt-2 space-y-2">
              <a
                href="https://ucampus.knou.ac.kr"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-900 text-white font-semibold text-sm shadow-xs"
              >
                U-KNOU 원격수강 바로가기
                <ExternalLink className="w-4 h-4" />
              </a>
              <Link
                to="/admin"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-100 text-slate-700 font-medium text-xs hover:bg-slate-200"
              >
                <Shield className="w-3.5 h-3.5 text-slate-500" />
                학생회 관리자 센터
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
