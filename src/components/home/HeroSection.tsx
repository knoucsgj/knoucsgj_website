import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, Calendar, ChevronRight, Scale, Camera, Users } from 'lucide-react';
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
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs sm:text-sm font-semibold">
              <span className="w-2 h-2 rounded-full bg-blue-400"></span>
              <span>한국방송통신대학교 광주전남지역대학 컴퓨터과학과 학생회</span>
            </div>

            <h1 className="font-knou text-2xl sm:text-3xl lg:text-[2.35rem] font-bold tracking-tight text-white leading-snug">
              일과 학업의 병행, <br className="hidden sm:inline" />
              <span className="text-blue-400">끝까지 완주할 수 있도록</span> 함께합니다.
            </h1>

            <p className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-xl font-normal">
              출석수업 및 과제 가이드, 100% 투명한 학생회비 결산, 학술 스터디 지원, 생생한 학과 활동까지 학생회가 든든한 동반자가 되겠습니다.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to="/notices"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm sm:text-base transition-all shadow-md active:scale-95"
              >
                <Bell className="w-4 h-4" />
                공지사항 바로가기
              </Link>
              <Link
                to="/calendar"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-sm sm:text-base transition-all border border-slate-700 active:scale-95"
              >
                <Calendar className="w-4 h-4 text-blue-400" />
                학사일정 캘린더
              </Link>
              <Link
                to="/governance"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 font-semibold text-sm sm:text-base transition-all border border-slate-700"
              >
                <Scale className="w-4 h-4 text-emerald-400" />
                투명 재정 보고
              </Link>
            </div>
          </div>

          {/* Right Column: Dynamic Department Showcase with Real Photos & D-Day */}
          <div className="lg:col-span-5 space-y-4">
            {/* Real Activity Photo Showcase Card */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-2xl relative overflow-hidden group">
              {/* Photo Frame */}
              <div className="relative aspect-16/10 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-inner">
                <img
                  src={ASSETS.pictures.competition2}
                  alt="광주전남 컴퓨터과학과 활동 현장"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                
                {/* Photo Tag */}
                <div className="absolute top-3 left-3 bg-blue-600/90 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1.5 border border-blue-400/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  우리 학과 활동 현장
                </div>

                {/* Photo Caption Bottom */}
                <div className="absolute bottom-3 left-3 right-3 text-left">
                  <p className="text-xs text-blue-300 font-semibold mb-0.5">제18회 총장배 S/W 경진대회 본선</p>
                  <h4 className="text-base sm:text-lg font-bold text-white leading-snug drop-shadow-md">
                    광주·전남 지역대학 출전팀 단체
                  </h4>
                </div>
              </div>

              {/* Mini Photo Strip */}
              <div className="grid grid-cols-3 gap-2.5 mt-3">
                <div className="relative rounded-xl overflow-hidden aspect-4/3 border border-slate-800 bg-slate-950">
                  <img
                    src={ASSETS.pictures.studyActivity}
                    alt="CODE AI 스터디"
                    className="w-full h-full object-cover opacity-85 hover:opacity-100 transition-opacity"
                  />
                  <span className="absolute bottom-1 left-1.5 right-1.5 text-[10px] font-bold text-white bg-black/60 px-1 py-0.5 rounded text-center truncate">
                    스터디 실습
                  </span>
                </div>
                <div className="relative rounded-xl overflow-hidden aspect-4/3 border border-slate-800 bg-slate-950">
                  <img
                    src={ASSETS.pictures.competition1}
                    alt="경진대회 부스"
                    className="w-full h-full object-cover opacity-85 hover:opacity-100 transition-opacity"
                  />
                  <span className="absolute bottom-1 left-1.5 right-1.5 text-[10px] font-bold text-white bg-black/60 px-1 py-0.5 rounded text-center truncate">
                    경진대회 부스
                  </span>
                </div>
                <div className="relative rounded-xl overflow-hidden aspect-4/3 border border-slate-800 bg-slate-950">
                  <img
                    src={ASSETS.pictures.councilMeeting}
                    alt="정기 임원 회의"
                    className="w-full h-full object-cover opacity-85 hover:opacity-100 transition-opacity"
                  />
                  <span className="absolute bottom-1 left-1.5 right-1.5 text-[10px] font-bold text-white bg-black/60 px-1 py-0.5 rounded text-center truncate">
                    임원 회의
                  </span>
                </div>
              </div>

              {/* Urgent D-Day Mini Notice Strip */}
              <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30 text-xs">
                    {assignmentDDay.label}
                  </span>
                  <span className="text-slate-200 font-medium truncate max-w-[190px] sm:max-w-xs">
                    2학기 중간과제물 제출 마감 임박
                  </span>
                </div>
                <Link
                  to="/calendar"
                  className="text-blue-400 hover:text-blue-300 font-bold flex items-center shrink-0 ml-2"
                >
                  일정 확인
                  <ChevronRight className="w-4 h-4" />
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
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">생생한 학과 현장</div>
              <div className="text-[11px] text-slate-400">경진대회·스터디 모임</div>
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
