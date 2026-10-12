import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ExternalLink, Calendar, Bell, Users, BookOpen, GraduationCap, ChevronRight } from 'lucide-react';
import { isSupabaseConfigured } from '../../lib/supabase';

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: '홈', path: '/', icon: GraduationCap },
    { name: '학과·학생회 소개', path: '/about', icon: Users },
    { name: '공지사항', path: '/notices', icon: Bell },
    { name: '학사일정', path: '/calendar', icon: Calendar },
    { name: '스터디·커뮤니티', path: '/community', icon: BookOpen },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 transition-all shadow-xs">
      {/* Top Banner Notice/Subtle Status */}
      <div className="bg-slate-900 text-slate-200 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-medium text-slate-300">
              한국방송통신대학교 광주전남지역대학 컴퓨터과학과
            </span>
            <span className="hidden sm:inline text-slate-500">|</span>
            <span className="hidden sm:inline text-slate-400">제43대 학생회 공식 홈페이지</span>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
              isSupabaseConfigured ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}>
              {isSupabaseConfigured ? 'Supabase 연동됨' : '로컬 모드 (Cloudflare 지원)'}
            </span>
            <a
              href="https://www.knou.ac.kr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-white transition-colors flex items-center gap-1 text-[11px] hidden md:flex"
            >
              방송대 본교 바로가기
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo & Department Branding */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 flex items-center justify-center text-white shadow-md shadow-blue-900/20 group-hover:scale-105 transition-transform">
              <span className="font-extrabold text-base tracking-tighter text-blue-100">KNOU</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-semibold tracking-wider text-blue-700 uppercase">
                광주전남지역대학
              </span>
              <span className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-1.5 group-hover:text-blue-700 transition-colors">
                컴퓨터과학과 <span className="font-normal text-slate-500 text-sm">학생회</span>
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((item) => {
              const active = isActive(item.path);
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                    active
                      ? 'text-blue-700 bg-blue-50/80'
                      : 'text-slate-700 hover:text-blue-600 hover:bg-slate-100/70'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-blue-700' : 'text-slate-400'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Action: School Portal Shortcut */}
          <div className="hidden lg:flex items-center gap-2">
            <a
              href="https://ucampus.knou.ac.kr"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-sm shadow-blue-500/25 active:scale-95"
            >
              U-KNOU 포털 로그인
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-hidden"
              aria-label="메뉴 열기"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white shadow-xl animate-in slide-in-from-top-2 duration-150">
          <div className="px-4 pt-3 pb-6 space-y-1">
            {navLinks.map((item) => {
              const active = isActive(item.path);
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-base font-medium transition-colors ${
                    active
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-blue-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${active ? 'text-blue-600' : 'text-slate-400'}`} />
                    <span>{item.name}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </Link>
              );
            })}

            <div className="pt-4 border-t border-slate-100 mt-2">
              <a
                href="https://ucampus.knou.ac.kr"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-blue-600 text-white font-medium text-sm shadow-sm"
              >
                U-KNOU 포털 바로가기
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
