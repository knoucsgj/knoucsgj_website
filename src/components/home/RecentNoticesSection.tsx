import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, ChevronRight, Pin, Calendar, Eye } from 'lucide-react';
import type { Notice } from '../../lib/types';
import { formatDate } from '../../lib/dateUtils';

interface RecentNoticesSectionProps {
  notices: Notice[];
  loading?: boolean;
  variant?: 'light' | 'dark';
}

export const RecentNoticesSection: React.FC<RecentNoticesSectionProps> = ({
  notices,
  loading,
  variant = 'light'
}) => {
  const isDark = variant === 'dark';

  const getCategoryBadgeClass = (category: string) => {
    if (isDark) {
      switch (category) {
        case '필독':
          return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
        case '학생회':
          return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
        case '학사':
          return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
        case '행사':
          return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
        case '결산':
          return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
        case '회의록':
          return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
        default:
          return 'bg-slate-800 text-slate-300 border-slate-700';
      }
    }

    switch (category) {
      case '필독':
        return 'bg-rose-100 text-rose-700 border-rose-200';
      case '학생회':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case '학사':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case '행사':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case '결산':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case '회의록':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const displayedNotices = notices.slice(0, 5);

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
                  ? 'bg-blue-950/80 text-blue-400 border border-blue-800/60'
                  : 'bg-blue-50 text-blue-600'
              }`}
            >
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2
                className={`text-xl font-bold tracking-tight ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                공지사항
              </h2>
              <p
                className={`text-xs sm:text-sm font-medium ${
                  isDark ? 'text-slate-400' : 'text-slate-600'
                }`}
              >
                학생회 및 학과의 주요 알림
              </p>
            </div>
          </div>
          <Link
            to="/notices"
            className={`text-xs sm:text-sm font-bold flex items-center gap-1 hover:underline ${
              isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
            }`}
          >
            전체보기
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Notices List */}
        {loading ? (
          <div
            className={`py-12 text-center text-base ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            공지사항을 불러오는 중입니다...
          </div>
        ) : displayedNotices.length === 0 ? (
          <div
            className={`py-12 text-center text-base ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            등록된 공지사항이 없습니다.
          </div>
        ) : (
          <div className={`divide-y ${isDark ? 'divide-slate-800/80' : 'divide-slate-100'}`}>
            {displayedNotices.map((notice) => (
              <Link
                key={notice.id}
                to={`/notices?id=${notice.id}`}
                className={`group py-4 block transition-colors -mx-3 px-3 rounded-xl ${
                  isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50/70'
                }`}
              >
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  {notice.is_pinned && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-md bg-rose-600 text-white">
                      <Pin className="w-3.5 h-3.5" />
                      고정
                    </span>
                  )}
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-md border ${getCategoryBadgeClass(
                      notice.category
                    )}`}
                  >
                    {notice.category}
                  </span>
                  <span
                    className={`text-xs sm:text-sm flex items-center gap-1 ml-auto font-medium ${
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(notice.created_at)}
                  </span>
                </div>

                <h3
                  className={`text-base sm:text-lg font-bold transition-colors line-clamp-1 leading-snug ${
                    isDark
                      ? 'text-white group-hover:text-blue-400'
                      : 'text-slate-900 group-hover:text-blue-600'
                  }`}
                >
                  {notice.title}
                </h3>

                <div
                  className={`flex items-center gap-3 mt-2 text-xs sm:text-sm font-medium ${
                    isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}
                >
                  <span>작성자: {notice.author}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    조회 {notice.views}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div
        className={`pt-4 border-t mt-4 ${
          isDark ? 'border-slate-800' : 'border-slate-100'
        }`}
      >
        <Link
          to="/notices"
          className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border ${
            isDark
              ? 'bg-slate-950/70 hover:bg-slate-800 text-slate-300 border-slate-800 hover:text-white'
              : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
          }`}
        >
          공지사항 게시판 바로가기
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
