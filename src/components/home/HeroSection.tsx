import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, Calendar, ChevronRight, Scale, Package, Users, CheckCircle } from 'lucide-react';
import { getDDay } from '../../lib/dateUtils';
import { ASSETS } from '../../lib/assets';

export const HeroSection: React.FC = () => {
  // Urgent upcoming deadline: 2학기 중간과제물 제출
  const assignmentDDay = getDDay('2026-10-15');

  return (
    <section className="relative overflow-hidden rounded-3xl bg-slate-950 text-white border border-slate-800 shadow-xl mb-12">
      {/* Background subtle architectural grid */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.2) 1px, transparent 0)`,
          backgroundSize: '24px 24px'
        }}
      />

      <div className="relative z-10 p-8 sm:p-12 lg:p-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Slogan & Mission */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
              <span>한국방송통신대학교 광주전남지역대학 컴퓨터과학과 제43대 학생회</span>
            </div>

            <h1 className="font-knou text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
              일과 학업의 병행, <br className="hidden sm:inline" />
              <span className="text-blue-400">끝까지 완주할 수 있도록</span> 함께합니다.
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl font-normal">
              출석수업 및 과제 가이드, 100% 투명한 학생회비 결산, 실습 교재 및 비품 대여, 동료 학우들과 함께하는 스터디까지 학생회가 든든한 동반자가 되겠습니다.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to="/notices"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm transition-all shadow-md active:scale-95"
              >
                <Bell className="w-4 h-4" />
                공지사항 바로가기
              </Link>
              <Link
                to="/calendar"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs sm:text-sm transition-all border border-slate-700 active:scale-95"
              >
                <Calendar className="w-4 h-4 text-blue-400" />
                학사일정 캘린더
              </Link>
              <Link
                to="/governance"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 font-medium text-xs sm:text-sm transition-all border border-slate-800"
              >
                <Scale className="w-4 h-4 text-emerald-400" />
                투명 재정 보고
              </Link>
            </div>
          </div>

          {/* Right Column: Urgent Academic Card */}
          <div className="lg:col-span-5 space-y-3">
            {/* Mascot Greeting Callout */}
            <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-800 rounded-2xl p-3 px-4 shadow-sm">
              <img
                src={ASSETS.characters.practice}
                alt="방송대 실습 마스코트"
                className="w-11 h-11 object-contain shrink-0"
              />
              <div className="text-xs">
                <span className="font-bold text-white block">함께 공부하는 컴퓨터과학과</span>
                <span className="text-slate-400 text-[11px]">선배·동료 학우가 곁에서 끝까지 응원합니다!</span>
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-5 relative overflow-hidden">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">
                  학사 마감 알림 (D-Day)
                </span>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  {assignmentDDay.label}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white mb-1.5">
                  2026학년도 2학기 중간과제물 정규 제출
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  컴퓨터과학과 전공 과제물 온라인 접수가 진행 중입니다. 마감일 시스템 접속 폭주에 대비하여 미리 제출해 주세요.
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 text-xs space-y-1.5 text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-500">제출 기간</span>
                  <span className="font-semibold text-slate-200">2026.10.15(목) ~ 10.25(일) 18:00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">제출 방법</span>
                  <span className="font-semibold text-blue-400">U-KNOU 온라인 직접 제출</span>
                </div>
              </div>

              <div className="pt-1 flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  표절 검사는 중앙도서관 카피킬러 권장
                </span>
                <Link
                  to="/calendar"
                  className="font-bold text-blue-400 hover:text-blue-300 flex items-center gap-0.5 transition-colors"
                >
                  전체 일정 보기
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Pillar Highlights Grid */}
        <div className="mt-10 pt-8 border-t border-slate-800 grid grid-cols-2 lg:grid-cols-4 gap-4 text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-blue-400 shrink-0">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">100% 공개 회계</div>
              <div className="text-[11px] text-slate-400">분기별 결산 및 장부</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400 shrink-0">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">비품·실습서 대여</div>
              <div className="text-[11px] text-slate-400">실습교재·계산기 상시 대여</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-purple-400 shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">학술 스터디 지원</div>
              <div className="text-[11px] text-slate-400">온·오프라인 학습 소그룹</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-400 shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">학사일정 D-Day</div>
              <div className="text-[11px] text-slate-400">출석수업·과제·기말시험</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
