import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, ChevronRight, Pin, Calendar, Eye } from 'lucide-react';
import type { Notice } from '../../lib/types';
import { formatDate } from '../../lib/dateUtils';

interface RecentNoticesSectionProps {
  notices: Notice[];
  loading?: boolean;
}

export const RecentNoticesSection: React.FC<RecentNoticesSectionProps> = ({ notices, loading }) => {
  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case '필독':
        return 'bg-rose-100 text-rose-700 border-rose-200';
      case '학생회':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case '학사':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case '행사':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const displayedNotices = notices.slice(0, 5);

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">공지사항</h2>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">학생회 및 학과의 주요 알림</p>
            </div>
          </div>
          <Link
            to="/notices"
            className="text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline"
          >
            전체보기
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Notices List */}
        {loading ? (
          <div className="py-12 text-center text-slate-500 text-base">
            공지사항을 불러오는 중입니다...
          </div>
        ) : displayedNotices.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-base">
            등록된 공지사항이 없습니다.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {displayedNotices.map((notice) => (
              <Link
                key={notice.id}
                to={`/notices?id=${notice.id}`}
                className="group py-4 block transition-colors hover:bg-slate-50/70 -mx-3 px-3 rounded-xl"
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
                  <span className="text-xs sm:text-sm text-slate-500 flex items-center gap-1 ml-auto font-medium">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(notice.created_at)}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1 leading-snug">
                  {notice.title}
                </h3>

                <div className="flex items-center gap-3 mt-2 text-xs sm:text-sm text-slate-600 font-medium">
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

      <div className="pt-4 border-t border-slate-100 mt-4">
        <Link
          to="/notices"
          className="w-full py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-slate-200"
        >
          공지사항 게시판 바로가기
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
