import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ArrowRight, ChevronLeft, ChevronRight, Bell, Calendar } from 'lucide-react';
import { api } from '../../services/api';
import type { PopupItem } from '../../lib/types';

const getCategoryLabel = (type: PopupItem['target_type']) => {
  switch (type) {
    case 'notice':
      return '공지사항';
    case 'activity':
      return '활동보고';
    case 'event':
      return '학사일정';
    case 'material':
      return '학습자료';
    case 'free':
      return '자유게시판';
    case 'feedback':
      return '학생회에 바란다';
    case 'market':
      return '벼룩시장';
    case 'qna':
      return 'Q&A 코너';
    case 'direct':
    default:
      return '학생회 안내';
  }
};

const getCategoryBadgeStyle = (type: PopupItem['target_type']) => {
  switch (type) {
    case 'notice':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'activity':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'event':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'material':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'qna':
      return 'bg-violet-50 text-violet-700 border-violet-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

export const GlobalPopupModal: React.FC = () => {
  const [popups, setPopups] = useState<PopupItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadPopups() {
      try {
        const activeList = await api.getActivePopups();
        if (!activeList || activeList.length === 0) return;

        // Filter out popups dismissed today
        const todayStr = new Date().toISOString().split('T')[0];
        const visiblePopups = activeList.filter((p) => {
          const dismissedDate = localStorage.getItem(`knou_popup_dismissed_${p.id}`);
          return dismissedDate !== todayStr;
        });

        if (visiblePopups.length > 0) {
          setPopups(visiblePopups);
          setCurrentIndex(0);
          setIsOpen(true);
        }
      } catch (err) {
        console.error('Failed to load active popups', err);
      }
    }
    loadPopups();
  }, []);

  if (!isOpen || popups.length === 0) return null;

  const currentPopup = popups[currentIndex];
  if (!currentPopup) return null;

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleDismissToday = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    localStorage.setItem(`knou_popup_dismissed_${currentPopup.id}`, todayStr);

    // If there are other popups, remove current and show next
    const remaining = popups.filter((_, idx) => idx !== currentIndex);
    if (remaining.length > 0) {
      setPopups(remaining);
      setCurrentIndex((prev) => (prev >= remaining.length ? 0 : prev));
    } else {
      setIsOpen(false);
    }
  };

  const handleNavigateDetail = () => {
    setIsOpen(false);
    const url = currentPopup.target_url;
    if (url.startsWith('http://') || url.startsWith('https://')) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      navigate(url);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header Bar */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
            <h3 className="font-bold text-sm sm:text-base flex items-center gap-1.5 text-slate-100">
              <Bell className="w-4 h-4 text-amber-400" />
              컴퓨터과학과 알림
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {popups.length > 1 && (
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {currentIndex + 1} / {popups.length}
              </span>
            )}
            <button
              onClick={handleClose}
              className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              aria-label="팝업 닫기"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Category Badge & Dates */}
          <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
            <span
              className={`font-bold px-3 py-1 rounded-full border ${getCategoryBadgeStyle(
                currentPopup.target_type
              )}`}
            >
              {getCategoryLabel(currentPopup.target_type)}
            </span>

            {currentPopup.end_date && (
              <span className="text-slate-500 font-medium flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                ~ {currentPopup.end_date}까지
              </span>
            )}
          </div>

          {/* Title */}
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
            {currentPopup.title}
          </h2>

          {/* Optional Image */}
          {currentPopup.image_url && (
            <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 max-h-60 sm:max-h-72">
              <img
                src={currentPopup.image_url}
                alt={currentPopup.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
          )}

          {/* Content Body */}
          <div className="text-sm sm:text-base text-slate-700 whitespace-pre-wrap leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
            {currentPopup.content}
          </div>

          {/* 자세히 보기 Button */}
          <div className="pt-2">
            <button
              onClick={handleNavigateDetail}
              className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm sm:text-base shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{currentPopup.link_text || '자세히 보기'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-3.5 bg-slate-100/90 border-t border-slate-200 flex items-center justify-between text-xs sm:text-sm text-slate-600">
          <div className="flex items-center gap-3">
            {/* Multiple Popups Carousel Arrows */}
            {popups.length > 1 && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() =>
                    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : popups.length - 1))
                  }
                  className="p-1 rounded-lg hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                  title="이전 팝업"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() =>
                    setCurrentIndex((prev) => (prev < popups.length - 1 ? prev + 1 : 0))
                  }
                  className="p-1 rounded-lg hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                  title="다음 팝업"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            <button
              onClick={handleDismissToday}
              className="text-slate-600 hover:text-slate-900 font-medium hover:underline cursor-pointer"
            >
              오늘 하루 보지 않기
            </button>
          </div>

          <button
            onClick={handleClose}
            className="px-4 py-1.5 rounded-xl bg-white border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
