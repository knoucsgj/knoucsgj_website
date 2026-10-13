import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ChevronRight, Clock } from 'lucide-react';
import type { AcademicEvent } from '../../lib/types';
import { getDDay, formatEventPeriod } from '../../lib/dateUtils';

interface UpcomingEventsSectionProps {
  events: AcademicEvent[];
  loading?: boolean;
}

export const UpcomingEventsSection: React.FC<UpcomingEventsSectionProps> = ({ events, loading }) => {
  // Sort events by date and filter future/current ones
  const upcomingEvents = [...events]
    .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
    .slice(0, 4);

  const getDDayBadgeStyle = (dday: { label: string; diffDays: number; isPast: boolean; isToday: boolean }) => {
    if (dday.isToday) {
      return 'bg-rose-500 text-white animate-pulse font-bold';
    }
    if (!dday.isPast && dday.diffDays <= 7) {
      return 'bg-amber-500 text-white font-bold';
    }
    if (!dday.isPast && dday.diffDays <= 30) {
      return 'bg-blue-600 text-white font-semibold';
    }
    if (dday.isPast) {
      return 'bg-slate-200 text-slate-600';
    }
    return 'bg-slate-700 text-white';
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">주요 학사일정</h2>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">놓치기 쉬운 과제 및 시험 일정</p>
            </div>
          </div>
          <Link
            to="/calendar"
            className="text-xs sm:text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 hover:underline"
          >
            캘린더 전체보기
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Events List */}
        {loading ? (
          <div className="py-12 text-center text-slate-500 text-base">
            학사일정을 불러오는 중입니다...
          </div>
        ) : upcomingEvents.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-base">
            예정된 학사일정이 없습니다.
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingEvents.map((evt) => {
              const dday = getDDay(evt.start_date);
              return (
                <div
                  key={evt.id}
                  className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-indigo-50/40 hover:border-indigo-100 transition-all"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-md ${getDDayBadgeStyle(dday)}`}>
                        {dday.label}
                      </span>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-white border border-slate-200 text-slate-800">
                        {evt.category}
                      </span>
                      {evt.target_grades && (
                        <span className="text-xs text-slate-600 font-medium">
                          대상: {evt.target_grades}
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                    {evt.title}
                  </h3>

                  <div className="flex items-center gap-2 mt-2 text-xs sm:text-sm text-slate-600 font-medium">
                    <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{formatEventPeriod(evt.start_date, evt.end_date)}</span>
                  </div>

                  {evt.description && (
                    <p className="text-xs sm:text-sm text-slate-600 mt-1.5 line-clamp-1">
                      {evt.description}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-slate-100 mt-4">
        <Link
          to="/calendar"
          className="w-full py-2.5 px-4 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-indigo-200"
        >
          학사일정 캘린더 확인하기
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
