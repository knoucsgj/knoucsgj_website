import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, Calendar, Sparkles, ChevronRight, BookOpen, Clock, ShieldCheck, Laptop } from 'lucide-react';
import { getDDay } from '../../lib/dateUtils';

export const HeroSection: React.FC = () => {
  // Urgent upcoming deadline: 중간과제물 제출
  const assignmentDDay = getDDay('2026-10-15');

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 text-white shadow-2xl border border-blue-900/40 p-6 sm:p-10 lg:p-12 mb-12">
      {/* Decorative Glow Elements */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-4xl">
        {/* Top Tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5 text-blue-300 animate-pulse" />
          <span>KNOU 한국방송통신대학교 광주전남지역대학 컴퓨터과학과</span>
        </div>

        {/* Headline */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight mb-4">
          배움에는 나이가 없습니다.{' '}
          <span className="bg-gradient-to-r from-blue-300 via-sky-200 to-indigo-200 bg-clip-text text-transparent block sm:inline">
            함께이기에 완주할 수 있습니다.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-slate-300 mb-8 max-w-2xl leading-relaxed font-normal">
          생업과 학업을 병행하는 광주전남 컴퓨터과학과 학우 여러분을 위한 공식 소통 공간입니다. 
          출석수업, 시험, 중간과제물 일정과 멘토링 스터디를 학생회가 곁에서 함께 챙겨드립니다.
        </p>

        {/* Live Urgent Alert Pill */}
        <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3 max-w-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-400 text-slate-950">
                  {assignmentDDay.label}
                </span>
                <span className="text-sm font-semibold text-white">2학기 중간과제물 정규 제출</span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                제출기간: 2026.10.15 ~ 10.25 (U-KNOU 포털 온라인 접수)
              </p>
            </div>
          </div>
          <Link
            to="/calendar"
            className="text-xs font-semibold text-sky-300 hover:text-white flex items-center gap-1 shrink-0 self-start sm:self-center"
          >
            학사일정 확인
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/notices"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all shadow-lg shadow-blue-600/30 active:scale-95"
          >
            <Bell className="w-4 h-4" />
            최신 공지사항
          </Link>
          <Link
            to="/calendar"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm transition-all border border-white/15 active:scale-95"
          >
            <Calendar className="w-4 h-4 text-sky-300" />
            학사일정 캘린더
          </Link>
          <Link
            to="/about"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-transparent hover:bg-white/10 text-slate-300 hover:text-white font-medium text-sm transition-all"
          >
            <BookOpen className="w-4 h-4" />
            학생회 소개
          </Link>
        </div>
      </div>

      {/* Highlights Bar */}
      <div className="mt-10 pt-8 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-300">
            <Laptop className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-white">전산실습실</div>
            <div className="text-xs text-slate-400">광주지역대학 302호</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-300">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-white">스터디 & 튜터링</div>
            <div className="text-xs text-slate-400">온·오프라인 병행</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-300">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-white">투명한 회계</div>
            <div className="text-xs text-slate-400">학생회비 사용 공개</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-sky-500/10 text-sky-300">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-white">학사일정 알림</div>
            <div className="text-xs text-slate-400">과제/시험 D-Day</div>
          </div>
        </div>
      </div>
    </section>
  );
};
