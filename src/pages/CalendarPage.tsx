import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { AcademicEvent, EventCategory } from '../lib/types';
import { getDDay, formatEventPeriod } from '../lib/dateUtils';
import { ASSETS } from '../lib/assets';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  LayoutGrid,
  List
} from 'lucide-react';

export const CalendarPage: React.FC = () => {
  const [events, setEvents] = useState<AcademicEvent[]>([]);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');

  // Calendar Date State (Default: 2026 October based on system context)
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date(2026, 9, 1)); // 9 = October
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);

  useEffect(() => {
    async function loadEvents() {
      try {
        const data = await api.getEvents();
        setEvents(data);
      } catch (e) {
        console.error(e);
      }
    }
    loadEvents();
  }, []);

  const categories = ['전체', '출석수업', '시험', '과제', '등록/수강', '행사'];

  const filteredEvents = events.filter((evt) => {
    if (selectedCategory !== '전체' && evt.category !== selectedCategory) {
      return false;
    }
    return true;
  });

  // Calendar calculation
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDateStr(null);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDateStr(null);
  };

  const setTodayMonth = () => {
    setCurrentDate(new Date(2026, 9, 1)); // October 2026
    setSelectedDateStr('2026-10-12');
  };

  const getCategoryColor = (category: EventCategory) => {
    switch (category) {
      case '과제':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case '출석수업':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case '시험':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case '등록/수강':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case '행사':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  // Helper to find events on a specific day
  const getEventsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return filteredEvents.filter((evt) => {
      return dateStr >= evt.start_date && dateStr <= evt.end_date;
    });
  };

  // Events on the currently selected date (if any)
  const selectedDateEvents = selectedDateStr
    ? filteredEvents.filter((evt) => selectedDateStr >= evt.start_date && selectedDateStr <= evt.end_date)
    : [];

  return (
    <div className="space-y-8">
      {/* Clean Editorial Page Header */}
      <div className="border-b border-slate-200 pb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-start sm:items-center gap-5">
          <img
            src={ASSETS.characters.exam}
            alt="시험 마스코트"
            className="w-16 h-16 sm:w-20 sm:h-20 object-contain shrink-0 hidden sm:block"
          />
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-blue-700 tracking-wider uppercase mb-2">
              <span>Academic Schedule & D-Day</span>
            </div>
            <h1 className="font-knou text-3xl sm:text-4xl font-bold text-slate-950 tracking-tight mb-2">
              학사일정 캘린더
            </h1>
            <p className="text-slate-600 text-sm sm:text-base max-w-xl leading-relaxed font-normal">
              광주전남지역대학 컴퓨터과학과의 출석수업, 온라인평가, 과제물 마감일 등 중요 일정을 한눈에 확인하세요.
            </p>
          </div>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-xl border border-slate-200 shrink-0 self-start sm:self-auto">
          <button
            onClick={() => setViewMode('calendar')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'calendar'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            월별 달력
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'list'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            목록 뷰
          </button>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        <span className="text-xs font-semibold text-slate-500 pl-2 shrink-0">구분:</span>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* View Mode 1: Calendar Grid */}
      {viewMode === 'calendar' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
            {/* Month Header Controller */}
            <div className="flex items-center justify-between pb-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                  {year}년 {month + 1}월
                </h2>
                <button
                  onClick={setTodayMonth}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                >
                  오늘 (2026.10)
                </button>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={prevMonth}
                  className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                  aria-label="이전 달"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextMonth}
                  className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                  aria-label="다음 달"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Day of Week Header */}
            <div className="grid grid-cols-7 text-center py-3 text-xs font-bold text-slate-400 border-b border-slate-100">
              <span className="text-rose-500">일</span>
              <span>월</span>
              <span>화</span>
              <span>수</span>
              <span>목</span>
              <span>금</span>
              <span className="text-blue-600">토</span>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-px bg-slate-100 border border-slate-100 rounded-2xl overflow-hidden mt-2">
              {/* Previous month filler cells */}
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} className="bg-slate-50/60 min-h-[90px] sm:min-h-[110px] p-2" />
              ))}

              {/* Current month day cells */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const dayEvents = getEventsForDay(day);
                const isSelected = selectedDateStr === dateStr;
                const isToday = dateStr === '2026-10-12';
                const dayOfWeek = (firstDayOfMonth + i) % 7;

                return (
                  <div
                    key={day}
                    onClick={() => setSelectedDateStr(dateStr)}
                    className={`min-h-[90px] sm:min-h-[110px] p-2 transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-blue-50/90 ring-2 ring-blue-600 z-10'
                        : isToday
                        ? 'bg-amber-50/60'
                        : 'bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-bold inline-flex items-center justify-center w-6 h-6 rounded-full ${
                          isToday
                            ? 'bg-amber-400 text-slate-950'
                            : dayOfWeek === 0
                            ? 'text-rose-500'
                            : dayOfWeek === 6
                            ? 'text-blue-600'
                            : 'text-slate-700'
                        }`}
                      >
                        {day}
                      </span>
                      {isToday && (
                        <span className="text-[10px] font-bold text-amber-700 hidden sm:inline">
                          오늘
                        </span>
                      )}
                    </div>

                    {/* Event labels in cell */}
                    <div className="mt-1 space-y-1">
                      {dayEvents.slice(0, 2).map((ev) => (
                        <div
                          key={ev.id}
                          className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md truncate border ${getCategoryColor(
                            ev.category
                          )}`}
                          title={ev.title}
                        >
                          {ev.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-[9px] text-slate-400 font-medium pl-1">
                          +{dayEvents.length - 2}개 더보기
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Date Detail Card */}
          {selectedDateStr && (
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-blue-200 bg-blue-50/20 shadow-xs animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-blue-100 mb-4">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-slate-900 text-base">
                    {selectedDateStr} 일정 상세
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedDateStr(null)}
                  className="text-xs text-slate-500 hover:text-slate-800"
                >
                  선택 해제
                </button>
              </div>

              {selectedDateEvents.length === 0 ? (
                <p className="text-xs text-slate-500 py-3">
                  선택하신 날짜({selectedDateStr})에 등록된 일정이 없습니다.
                </p>
              ) : (
                <div className="space-y-3">
                  {selectedDateEvents.map((evt) => {
                    const dday = getDDay(evt.start_date);
                    return (
                      <div
                        key={evt.id}
                        className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${getCategoryColor(evt.category)}`}>
                              {evt.category}
                            </span>
                            <span className="text-xs font-bold text-blue-700">{dday.label}</span>
                            <span className="text-xs text-slate-400">대상: {evt.target_grades}</span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-900">{evt.title}</h4>
                          <p className="text-xs text-slate-600">{evt.description}</p>
                        </div>
                        <div className="text-xs text-slate-500 font-medium shrink-0">
                          {formatEventPeriod(evt.start_date, evt.end_date)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* View Mode 2: Full List Timeline */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
          <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">학사일정 전체 목록</h2>
            <span className="text-xs text-slate-500">총 {filteredEvents.length}개 일정</span>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredEvents.map((evt) => {
              const dday = getDDay(evt.start_date);
              return (
                <div key={evt.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                        dday.isToday
                          ? 'bg-rose-500 text-white'
                          : !dday.isPast && dday.diffDays <= 7
                          ? 'bg-amber-500 text-white'
                          : 'bg-blue-600 text-white'
                      }`}>
                        {dday.label}
                      </span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-md border ${getCategoryColor(evt.category)}`}>
                        {evt.category}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        대상: {evt.target_grades}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900">
                      {evt.title}
                    </h3>

                    <p className="text-xs text-slate-600">
                      {evt.description}
                    </p>
                  </div>

                  <div className="text-xs text-slate-500 flex items-center gap-1.5 shrink-0 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{formatEventPeriod(evt.start_date, evt.end_date)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
