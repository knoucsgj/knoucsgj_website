import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { getDDay } from '../../lib/dateUtils';
import { ASSETS } from '../../lib/assets';
import type { AcademicEvent } from '../../lib/types';
import { api } from '../../services/api';

interface HeroSectionProps {
  events?: AcademicEvent[];
}

export const HeroSection: React.FC<HeroSectionProps> = ({ events: propEvents }) => {
  const [events, setEvents] = useState<AcademicEvent[]>(propEvents || []);

  useEffect(() => {
    if (propEvents && propEvents.length > 0) {
      setEvents(propEvents);
    } else {
      api.getEvents().then(data => {
        if (data && data.length > 0) {
          setEvents(data);
        }
      }).catch(err => console.error(err));
    }
  }, [propEvents]);

  // 오늘 날짜 계산 (YYYY-MM-DD)
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  // 종료일이 오늘 이후이거나 오늘인(진행 중이거나 다가오는) 유효 일정만 필터링
  const upcomingEvents = events.filter(evt => {
    const end = evt.end_date || evt.start_date;
    return end >= todayStr;
  });

  // 시작일 및 종료일 순으로 정렬
  upcomingEvents.sort((a, b) => {
    if (a.start_date !== b.start_date) {
      return a.start_date.localeCompare(b.start_date);
    }
    return (a.end_date || a.start_date).localeCompare(b.end_date || b.start_date);
  });

  // 가장 가까운 대표 일정 1건 선정
  const nearestEvent = upcomingEvents[0];

  let ddayInfo: { label: string; isOngoing: boolean; isImminent: boolean } | null = null;
  if (nearestEvent) {
    const isOngoing = nearestEvent.start_date <= todayStr && todayStr <= (nearestEvent.end_date || nearestEvent.start_date);
    if (isOngoing) {
      ddayInfo = { label: '진행중', isOngoing: true, isImminent: false };
    } else {
      const dday = getDDay(nearestEvent.start_date);
      ddayInfo = { label: dday.label, isOngoing: false, isImminent: dday.diffDays <= 7 };
    }
  }

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

              {/* Urgent D-Day Mini Notice Strip: 실제 유효한 다가오는 일정이 있을 때만 동적으로 노출 */}
              {nearestEvent && ddayInfo && (
                <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex items-center justify-between text-xs sm:text-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold border text-xs shrink-0 ${
                        ddayInfo.isOngoing
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : ddayInfo.isImminent
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                      }`}
                    >
                      {ddayInfo.label}
                    </span>
                    <span className="text-slate-200 font-medium truncate max-w-[190px] sm:max-w-xs">
                      {nearestEvent.title}
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
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
