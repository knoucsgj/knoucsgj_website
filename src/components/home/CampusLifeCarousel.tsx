import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Play, Image as ImageIcon, Video, Calendar, Eye, X, ExternalLink } from 'lucide-react';
import type { ActivityReport } from '../../lib/types';

interface Props {
  activities: ActivityReport[];
  loading?: boolean;
}

export const CampusLifeCarousel: React.FC<Props> = ({ activities, loading }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<ActivityReport | null>(null);

  // 화면 크기에 따라 한 화면에 보여줄 카드 수 (모바일: 1~2개, 태블릿: 3개, 데스크톱: 4개)
  const itemsPerPage = 4;
  const totalItems = activities.length;
  const maxIndex = Math.max(0, totalItems - itemsPerPage);

  // 일정 시간(4.5초)마다 왼쪽 방향으로 자동 슬라이드 넘어감
  useEffect(() => {
    if (totalItems <= itemsPerPage || isPaused || selectedActivity) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 4500);

    return () => clearInterval(timer);
  }, [totalItems, maxIndex, isPaused, selectedActivity]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const getYoutubeEmbedUrl = (act: ActivityReport) => {
    if (act.youtube_id) {
      return `https://www.youtube.com/embed/${act.youtube_id}?autoplay=1`;
    }
    if (act.media_url.includes('youtube.com/watch?v=')) {
      const id = act.media_url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${id}?autoplay=1`;
    }
    if (act.media_url.includes('youtu.be/')) {
      const id = act.media_url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${id}?autoplay=1`;
    }
    return act.media_url;
  };

  return (
    <div
      className="space-y-6"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs sm:text-sm font-semibold mb-2.5 border border-blue-400/20">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
            <span>우리들의 생생한 학과 캠퍼스 라이프</span>
          </div>
          <h2 className="font-knou text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-tight">
            일터에서 캠퍼스로, 함께 도전하고 성장합니다
          </h2>
          <p className="text-slate-300 text-sm sm:text-base mt-1.5 font-normal max-w-2xl">
            소프트웨어 경진대회 본선 현장부터 CODE & AI 실습 스터디, 정기 임원회의까지 광주전남 컴퓨터과학과의 따뜻한 열정이 담긴 사진과 영상입니다.
          </p>
        </div>

        {/* Controls: 이전/다음 버튼 & 공지사항 활동보고 바로가기 */}
        <div className="flex items-center gap-3 shrink-0 self-start sm:self-end">
          <Link
            to="/notices?tab=activities"
            className="text-xs sm:text-sm font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors hover:underline mr-2"
          >
            활동보고 갤러리 전체보기
            <ChevronRight className="w-4 h-4" />
          </Link>

          {totalItems > itemsPerPage && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={handlePrev}
                className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-95"
                title="이전 사진/영상"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNext}
                className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-95"
                title="다음 사진/영상"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Carousel Track Container */}
      <div className="relative overflow-hidden rounded-2xl">
        {loading ? (
          <div className="py-20 text-center text-slate-400 text-sm">
            생생한 캠퍼스 활동자료를 불러오는 중입니다...
          </div>
        ) : activities.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm bg-slate-900/60 rounded-2xl border border-slate-800">
            등록된 활동보고 자료가 없습니다.
          </div>
        ) : (
          <div
            className="flex transition-transform duration-700 ease-in-out gap-4"
            style={{
              transform: `translateX(-${currentIndex * (100 / (totalItems > itemsPerPage ? itemsPerPage : totalItems))}%)`,
              width: totalItems > itemsPerPage ? `${(totalItems / itemsPerPage) * 100}%` : '100%',
            }}
          >
            {activities.map((act) => {
              const isVideo = act.media_type === 'video';
              const displayImg = isVideo
                ? (act.thumbnail_url || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80')
                : act.media_url;

              return (
                <div
                  key={act.id}
                  onClick={() => setSelectedActivity(act)}
                  className="w-full sm:w-1/2 lg:w-1/4 shrink-0 rounded-2xl overflow-hidden border border-slate-800/90 bg-slate-900 group shadow-md hover:border-blue-500/60 hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div className="relative aspect-4/3 overflow-hidden bg-slate-950">
                    <img
                      src={displayImg}
                      alt={act.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                    
                    {/* Media Type Badge */}
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                      {isVideo ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-rose-600/90 text-white text-[11px] font-bold shadow-md backdrop-blur-xs">
                          <Video className="w-3 h-3" />
                          영상
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-slate-900/80 text-white text-[11px] font-bold shadow-md backdrop-blur-xs border border-white/20">
                          <ImageIcon className="w-3 h-3 text-blue-400" />
                          사진
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded-md bg-black/60 text-slate-200 text-[10px] font-semibold backdrop-blur-xs">
                        {act.category}
                      </span>
                    </div>

                    {/* Video Center Play Button (깜빡임/펄스 효과 적용) */}
                    {isVideo && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/10 transition-colors">
                        <div className="w-12 h-12 rounded-full bg-rose-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform animate-pulse">
                          <Play className="w-6 h-6 ml-0.5 fill-white" />
                        </div>
                      </div>
                    )}

                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent p-2.5 pt-6 text-[11px] text-slate-400 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {act.activity_date}
                      </span>
                      {act.views && (
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3 text-slate-400" />
                          {act.views}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Bottom Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-xs font-bold text-blue-400">{act.category}</span>
                      <h3 className="text-sm sm:text-base font-bold text-white mt-1 group-hover:text-blue-300 transition-colors line-clamp-1 leading-snug">
                        {act.title}
                      </h3>
                      {act.description && (
                        <p className="text-xs text-slate-400 mt-1 line-clamp-1 leading-relaxed">
                          {act.description}
                        </p>
                      )}
                    </div>

                    <div className="pt-2.5 mt-2.5 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                      <span>{act.author || '학생회'}</span>
                      <span className="text-blue-400 group-hover:underline">상세보기</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Indicator Dots */}
      {totalItems > itemsPerPage && (
        <div className="flex justify-center items-center gap-1.5 pt-2">
          {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                currentIndex === idx ? 'w-6 bg-blue-500' : 'w-2 bg-slate-700 hover:bg-slate-600'
              }`}
              title={`슬라이드 ${idx + 1}`}
            />
          ))}
        </div>
      )}

      {/* ======================================================== */}
      {/* Modal: 사진 확대 뷰어 & 영상 플레이어                     */}
      {/* ======================================================== */}
      {selectedActivity && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl text-white">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-400/30">
                  {selectedActivity.category}
                </span>
                <span className="text-xs text-slate-400">활동일: {selectedActivity.activity_date}</span>
              </div>
              <button
                onClick={() => setSelectedActivity(null)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="닫기"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Media Player / Image Viewer */}
            <div className="bg-black relative aspect-16/9 flex items-center justify-center overflow-hidden">
              {selectedActivity.media_type === 'video' ? (
                <iframe
                  src={getYoutubeEmbedUrl(selectedActivity)}
                  title={selectedActivity.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <img
                  src={selectedActivity.media_url}
                  alt={selectedActivity.title}
                  className="w-full h-full object-contain"
                />
              )}
            </div>

            {/* Description Info */}
            <div className="p-6 space-y-3">
              <h3 className="text-lg sm:text-xl font-bold text-white leading-snug">
                {selectedActivity.title}
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                {selectedActivity.description || '등록된 상세 설명이 없습니다.'}
              </p>

              <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                <span>작성자: {selectedActivity.author || '학생회'} • 조회수 {selectedActivity.views || 1}</span>
                <Link
                  to="/notices?tab=activities"
                  className="text-blue-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  활동보고 게시판으로 이동
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
