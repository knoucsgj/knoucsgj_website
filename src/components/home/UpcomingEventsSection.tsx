import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ChevronRight, ChevronUp, ChevronDown, Clock } from 'lucide-react';
import type { AcademicEvent } from '../../lib/types';
import { getDDay, formatEventPeriod } from '../../lib/dateUtils';

interface UpcomingEventsSectionProps {
  events: AcademicEvent[];
  loading?: boolean;
  variant?: 'light' | 'dark';
}

export const UpcomingEventsSection: React.FC<UpcomingEventsSectionProps> = ({
  events,
  loading,
  variant = 'light'
}) => {
  const isDark = variant === 'dark';
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransition, setIsTransition] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const upcomingEvents = useMemo(() => {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    // 종료되지 않은(현재 진행 중이거나 앞으로 예정된) 일정 우선 필터링
    const activeEvents = events.filter(
      (evt) => (evt.end_date || evt.start_date) >= todayStr
    );

    // 예정된 일정이 있으면 이를 우선 표시하고, 없으면 등록된 전체 일정을 시작일 순으로 표시
    return (activeEvents.length > 0 ? activeEvents : [...events]).sort(
      (a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
    );
  }, [events]);

  const total = upcomingEvents.length;
  const displayList = total > 1 ? [...upcomingEvents, upcomingEvents[0]] : upcomingEvents;

  useEffect(() => {
    setCurrentIndex(0);
    setIsTransition(true);
  }, [total]);

  useEffect(() => {
    if (total <= 1 || isPaused) return;
    const timer = setInterval(() => {
      setIsTransition(true);
      setCurrentIndex((prev) => (prev >= total ? total : prev + 1));
    }, 3500);
    return () => clearInterval(timer);
  }, [total, isPaused]);

  useEffect(() => {
    if (total <= 1) return;
    if (currentIndex === total) {
      resetTimerRef.current = setTimeout(() => {
        setIsTransition(false);
        setCurrentIndex(0);
      }, 500);
      return () => {
        if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
      };
    }
  }, [currentIndex, total]);

  const handleNext = () => {
    if (total <= 1) return;
    setIsTransition(true);
    setCurrentIndex((prev) => (prev >= total ? 1 : prev + 1));
  };

  const handlePrev = () => {
    if (total <= 1) return;
    if (currentIndex === 0) {
      setIsTransition(false);
      setCurrentIndex(total);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsTransition(true);
          setCurrentIndex(total - 1);
        });
      });
    } else {
      setIsTransition(true);
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const activeIdx = total > 0 ? currentIndex % total : 0;

  const getDDayBadgeStyle = (dday: { label: string; diffDays: number; isPast: boolean; isToday: boolean }) => {
    if (dday.isToday) {
      return 'bg-rose-500 text-white animate-pulse font-bold';
    }
    if (!dday.isPast && dday.diffDays <= 7) {
      return isDark ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold' : 'bg-amber-500 text-white font-bold';
    }
    if (!dday.isPast && dday.diffDays <= 30) {
      return isDark ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 font-semibold' : 'bg-blue-600 text-white font-semibold';
    }
    if (dday.isPast) {
      return isDark ? 'bg-slate-800 text-slate-400 border border-slate-700' : 'bg-slate-200 text-slate-600';
    }
    return isDark ? 'bg-slate-800 text-slate-300 border border-slate-700' : 'bg-slate-700 text-white';
  };

  return (
    <div
      className={`rounded-3xl p-6 sm:p-7 border flex flex-col justify-between h-full transition-all ${
        isDark
          ? 'bg-slate-900/90 border-slate-800 text-white shadow-xl'
          : 'bg-white border-slate-200/80 text-slate-800 shadow-xs'
      }`}
    >
      <div>
        {/* Header */}
        <div
          className={`flex items-center justify-between pb-4 border-b mb-4 ${
            isDark ? 'border-slate-800' : 'border-slate-100'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2.5 rounded-xl ${
                isDark
                  ? 'bg-indigo-950/80 text-indigo-400 border border-indigo-800/60'
                  : 'bg-indigo-50 text-indigo-600'
              }`}
            >
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2
                className={`text-xl font-bold tracking-tight ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                주요 학사일정
              </h2>
              <p
                className={`text-xs sm:text-sm font-medium ${
                  isDark ? 'text-slate-400' : 'text-slate-600'
                }`}
              >
                놓치기 쉬운 과제 및 시험 일정
              </p>
            </div>
          </div>
          <Link
            to="/calendar"
            className={`text-xs sm:text-sm font-bold flex items-center gap-1 hover:underline ${
              isDark ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-700'
            }`}
          >
            캘린더 전체보기
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Events List */}
        {loading ? (
          <div
            className={`py-12 text-center text-base ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            학사일정을 불러오는 중입니다...
          </div>
        ) : upcomingEvents.length === 0 ? (
          <div
            className={`py-12 text-center text-base ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            예정된 학사일정이 없습니다.
          </div>
        ) : (
          <div
            className="space-y-3"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* 1개씩 위로 스크롤되는 뷰포트 */}
            <div className="h-[220px] sm:h-[235px] overflow-hidden relative">
              <div
                className="h-full flex flex-col"
                style={{
                  transform: `translateY(-${currentIndex * 100}%)`,
                  transition: isTransition ? 'transform 500ms cubic-bezier(0.22, 1, 0.36, 1)' : 'none'
                }}
              >
                {displayList.map((evt, idx) => {
                  const dday = getDDay(evt.start_date);
                  return (
                    <div key={`${evt.id}-${idx}`} className="h-full shrink-0 py-0.5">
                      <div
                        className={`h-full p-4 sm:p-5 rounded-2xl border flex flex-col justify-between transition-colors ${
                          isDark
                            ? 'bg-slate-950/70 border-slate-800/90 hover:bg-slate-800/50 hover:border-slate-700'
                            : 'bg-slate-50/50 border-slate-200/80 hover:bg-indigo-50/40 hover:border-indigo-100'
                        }`}
                      >
                        <div className="min-h-0 flex-1 flex flex-col">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-md ${getDDayBadgeStyle(dday)}`}>
                                {dday.label}
                              </span>
                              <span
                                className={`text-xs font-bold px-2.5 py-0.5 rounded-md border ${
                                  isDark
                                    ? 'bg-slate-800 border-slate-700 text-slate-200'
                                    : 'bg-white border-slate-200 text-slate-800'
                                }`}
                              >
                                {evt.category}
                              </span>
                              {evt.target_grades && (
                                <span
                                  className={`text-xs font-medium ${
                                    isDark ? 'text-slate-400' : 'text-slate-600'
                                  }`}
                                >
                                  대상: {evt.target_grades}
                                </span>
                              )}
                            </div>
                          </div>

                          <h3
                            className={`text-base sm:text-lg font-bold leading-snug line-clamp-1 ${
                              isDark ? 'text-white' : 'text-slate-900'
                            }`}
                          >
                            {evt.title}
                          </h3>

                          <div
                            className={`flex items-center gap-2 mt-2 text-xs sm:text-sm font-medium shrink-0 ${
                              isDark ? 'text-slate-400' : 'text-slate-600'
                            }`}
                          >
                            <Clock
                              className={`w-4 h-4 shrink-0 ${
                                isDark ? 'text-slate-500' : 'text-slate-400'
                              }`}
                            />
                            <span>{formatEventPeriod(evt.start_date, evt.end_date)}</span>
                          </div>

                          {evt.description && (
                            <p
                              className={`text-xs sm:text-sm mt-2 whitespace-pre-wrap overflow-y-auto pr-1 ${
                                isDark ? 'text-slate-400' : 'text-slate-600'
                              }`}
                            >
                              {evt.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 스크롤 컨트롤 & 현재 순번 */}
            {total > 1 && (
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-1.5">
                  {upcomingEvents.map((evt, idx) => (
                    <button
                      key={evt.id}
                      onClick={() => {
                        setIsTransition(true);
                        setCurrentIndex(idx);
                      }}
                      className={`h-1.5 rounded-full transition-all cursor-pointer ${
                        activeIdx === idx
                          ? isDark
                            ? 'w-5 bg-indigo-400'
                            : 'w-5 bg-indigo-600'
                          : isDark
                          ? 'w-1.5 bg-slate-700 hover:bg-slate-600'
                          : 'w-1.5 bg-slate-300 hover:bg-slate-400'
                      }`}
                      aria-label={`${idx + 1}번째 학사일정 보기`}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-1">
                  <span className={`text-xs font-semibold mr-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {activeIdx + 1} / {total}
                  </span>
                  <button
                    onClick={handlePrev}
                    className={`p-1 rounded-lg border transition-colors cursor-pointer ${
                      isDark
                        ? 'border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                        : 'border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                    aria-label="이전 일정"
                    title="이전 일정"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleNext}
                    className={`p-1 rounded-lg border transition-colors cursor-pointer ${
                      isDark
                        ? 'border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                        : 'border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                    aria-label="다음 일정"
                    title="다음 일정"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div
        className={`pt-4 border-t mt-4 ${
          isDark ? 'border-slate-800' : 'border-slate-100'
        }`}
      >
        <Link
          to="/calendar"
          className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border ${
            isDark
              ? 'bg-slate-950/70 hover:bg-slate-800 text-slate-300 border-slate-800 hover:text-white'
              : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200'
          }`}
        >
          학사일정 캘린더 확인하기
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
