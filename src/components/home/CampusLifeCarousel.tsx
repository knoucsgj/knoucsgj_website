import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Play, Image as ImageIcon, Video, Calendar, Eye, X, ExternalLink } from 'lucide-react';
import type { ActivityReport } from '../../lib/types';

interface Props {
  activities: ActivityReport[];
  loading?: boolean;
}

export const CampusLifeCarousel: React.FC<Props> = ({ activities, loading }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransition, setIsTransition] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<ActivityReport | null>(null);
  const [selectedPhotoIdx, setSelectedPhotoIdx] = useState(0);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartXRef = useRef<number | null>(null);

  // 현재 날짜 기준 1년 이내 자료만 메인 화면에 노출
  const recentActivities = useMemo(() => {
    const now = new Date();
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    const pad = (n: number) => String(n).padStart(2, '0');
    const cutoffStr = `${oneYearAgo.getFullYear()}-${pad(oneYearAgo.getMonth() + 1)}-${pad(oneYearAgo.getDate())}`;

    return activities.filter((act) => {
      const dateStr = (act.activity_date || '').slice(0, 10);
      return dateStr >= cutoffStr;
    });
  }, [activities]);

  const total = recentActivities.length;

  // 끊김 없는 무한 롤링(Seamless Infinite Loop)을 위해 마지막에 첫 번째 슬라이드 1개를 복제 연결
  const displayList = total > 1 ? [...recentActivities, recentActivities[0]] : recentActivities;

  // 다음 슬라이드로 이동
  const handleNext = () => {
    if (total <= 1) return;
    setIsTransition(true);
    setCurrentIndex((prev) => prev + 1);
  };

  // 이전 슬라이드로 이동
  const handlePrev = () => {
    if (total <= 1) return;
    if (currentIndex <= 0) {
      setIsTransition(false);
      setCurrentIndex(total);
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
      resetTimerRef.current = setTimeout(() => {
        setIsTransition(true);
        setCurrentIndex(total - 1);
      }, 40);
    } else {
      setIsTransition(true);
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // 슬라이드 애니메이션 완료 시점에 복제된 첫 번째 슬라이드에 도달하면 0번 인덱스로 무음 이동
  const handleTransitionEnd = () => {
    if (total > 1 && currentIndex >= total) {
      setIsTransition(false);
      setCurrentIndex(0);
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
      resetTimerRef.current = setTimeout(() => {
        setIsTransition(true);
      }, 50);
    }
  };

  // 4.5초마다 자동으로 다음 큰 이미지로 스크롤
  useEffect(() => {
    if (total <= 1 || isPaused || selectedActivity) return;

    const timer = setInterval(() => {
      handleNext();
    }, 4500);

    return () => clearInterval(timer);
  }, [total, isPaused, selectedActivity, currentIndex]);

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    };
  }, []);

  // 모바일 터치 스와이프 지원
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    setIsPaused(true);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current !== null && total > 1) {
      const diff = touchStartXRef.current - e.changedTouches[0].clientX;
      if (diff > 45) {
        handleNext();
      } else if (diff < -45) {
        handlePrev();
      }
    }
    touchStartXRef.current = null;
    setIsPaused(false);
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

  const translateX = -(currentIndex * 100);
  const activeDotIndex = total > 0 ? currentIndex % total : 0;

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
            CODE:AI 스터디 모임부터 학과 행사와 출석수업 현장까지, 광주전남 컴퓨터과학과 학우들이 함께 만들어가는 소중한 기록입니다.
          </p>
        </div>

        {/* Controls: 활동보고 갤러리 전체보기 & 이전/다음 버튼 */}
        <div className="flex items-center gap-3 shrink-0 self-start sm:self-end">
          <Link
            to="/notices?tab=activities"
            className="text-xs sm:text-sm font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors hover:underline mr-2"
          >
            활동보고 갤러리 전체보기
            <ChevronRight className="w-4 h-4" />
          </Link>

          {total > 1 && (
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

      {/* Large 1-Slide Showcase Carousel */}
      <div
        className="relative overflow-hidden rounded-3xl border border-slate-800/90 bg-slate-900 shadow-2xl"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {loading ? (
          <div className="h-[280px] sm:h-[400px] md:h-[480px] lg:h-[540px] flex items-center justify-center text-slate-400 text-sm">
            생생한 캠퍼스 활동자료를 불러오는 중입니다...
          </div>
        ) : recentActivities.length === 0 ? (
          <div className="h-[240px] sm:h-[320px] flex items-center justify-center text-slate-400 text-sm bg-slate-900/60">
            최근 1년 이내에 등록된 활동보고 자료가 없습니다.
          </div>
        ) : (
          <>
            <div
              className="flex"
              onTransitionEnd={handleTransitionEnd}
              style={{
                transform: `translateX(${translateX}%)`,
                transition: isTransition ? 'transform 650ms cubic-bezier(0.25, 1, 0.5, 1)' : 'none',
                willChange: 'transform',
              }}
            >
              {displayList.map((act, index) => {
                const isVideo = act.media_type === 'video';
                const displayImg = isVideo ? act.thumbnail_url : act.media_url;

                return (
                  <div
                    key={`${act.id}-${index}`}
                    onClick={() => {
                      setSelectedPhotoIdx(0);
                      setSelectedActivity(act);
                    }}
                    className="w-full shrink-0 relative h-[280px] sm:h-[400px] md:h-[480px] lg:h-[540px] bg-slate-950 group cursor-pointer overflow-hidden"
                  >
                    {displayImg ? (
                      <img
                        src={displayImg}
                        alt={act.title}
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700 ease-out"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-slate-900 via-blue-950/60 to-slate-950 flex items-center justify-center">
                        <Video className="w-16 h-16 text-slate-700" />
                      </div>
                    )}

                    {/* Top Badges */}
                    <div className="absolute top-4 left-4 sm:top-6 sm:left-6 flex items-center gap-2 z-10">
                      {isVideo ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-600/95 text-white text-xs sm:text-sm font-bold shadow-lg backdrop-blur-xs">
                          <Video className="w-3.5 h-3.5" />
                          영상
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-950/80 text-white text-xs sm:text-sm font-bold shadow-lg backdrop-blur-xs border border-white/20">
                          <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
                          {act.media_urls && act.media_urls.length > 1 ? `사진 ${act.media_urls.length}장` : '사진'}
                        </span>
                      )}
                      <span className="px-3 py-1 rounded-lg bg-black/65 text-slate-100 text-xs sm:text-sm font-semibold backdrop-blur-xs border border-white/10">
                        {act.category}
                      </span>
                    </div>

                    {/* Top Right Counter */}
                    {total > 1 && (
                      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-xs font-bold text-slate-200 tabular-nums">
                        {activeDotIndex + 1} / {total}
                      </div>
                    )}

                    {/* Video Center Play Button */}
                    {isVideo && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/25 group-hover:bg-black/10 transition-colors z-10">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-rose-600/95 text-white flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform animate-pulse">
                          <Play className="w-8 h-8 sm:w-9 sm:h-9 ml-1 fill-white" />
                        </div>
                      </div>
                    )}

                    {/* Bottom Gradient Overlay Info */}
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent p-5 sm:p-8 lg:p-10 pt-20 sm:pt-28 z-10">
                      <div className="max-w-4xl space-y-2">
                        <h3 className="text-lg sm:text-2xl lg:text-3xl font-bold text-white group-hover:text-blue-300 transition-colors line-clamp-1 leading-snug">
                          {act.title}
                        </h3>
                        {act.description && (
                          <p className="text-xs sm:text-sm lg:text-base text-slate-200 line-clamp-2 leading-relaxed max-w-3xl">
                            {act.description}
                          </p>
                        )}
                        <div className="pt-2 flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-300 font-medium">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-blue-400" />
                            {act.activity_date}
                          </span>
                          <span>• {act.author || '학생회'}</span>
                          {act.views && (
                            <span className="flex items-center gap-1">
                              <Eye className="w-3.5 h-3.5 text-slate-400" />
                              {act.views}
                            </span>
                          )}
                          <span className="text-blue-400 font-bold group-hover:underline ml-auto">
                            크게 보기 →
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Overlay Left / Right Scroll Arrows */}
            {total > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrev();
                  }}
                  className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-slate-950/70 hover:bg-blue-600/90 text-white backdrop-blur-md border border-white/15 items-center justify-center transition-all cursor-pointer shadow-lg active:scale-95"
                  aria-label="이전 이미지"
                  title="이전 사진/영상"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                  className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-slate-950/70 hover:bg-blue-600/90 text-white backdrop-blur-md border border-white/15 items-center justify-center transition-all cursor-pointer shadow-lg active:scale-95"
                  aria-label="다음 이미지"
                  title="다음 사진/영상"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </>
        )}
      </div>

      {/* Indicator Dots (현재 콘텐츠 위치 표시 및 클릭 이동) */}
      {total > 1 && (
        <div className="flex justify-center items-center gap-2 pt-1">
          {recentActivities.map((act, idx) => (
            <button
              key={act.id || idx}
              onClick={() => {
                setIsTransition(true);
                setCurrentIndex(idx);
              }}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                activeDotIndex === idx ? 'w-8 bg-blue-500' : 'w-2.5 bg-slate-700 hover:bg-slate-500'
              }`}
              title={`${idx + 1}. ${act.title}`}
              aria-label={`슬라이드 ${idx + 1}`}
            />
          ))}
        </div>
      )}

      {/* ======================================================== */}
      {/* Modal: 사진 확대 뷰어 & 영상 플레이어                     */}
      {/* ======================================================== */}
      {selectedActivity && (() => {
        const galleryImages = selectedActivity.media_type === 'video'
          ? []
          : (selectedActivity.media_urls && selectedActivity.media_urls.length > 0
              ? selectedActivity.media_urls
              : [selectedActivity.media_url]);
        const safeIdx = Math.min(selectedPhotoIdx, Math.max(0, galleryImages.length - 1));
        const activePhotoUrl = galleryImages[safeIdx] || selectedActivity.media_url;

        return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl text-white my-auto">
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
                <>
                  <img
                    src={activePhotoUrl}
                    alt={`${selectedActivity.title} (${safeIdx + 1}/${galleryImages.length})`}
                    className="w-full h-full object-contain"
                  />
                  {galleryImages.length > 1 && (
                    <>
                      <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/65 text-white text-xs font-bold backdrop-blur-xs border border-white/15">
                        {safeIdx + 1} / {galleryImages.length}
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedPhotoIdx((safeIdx - 1 + galleryImages.length) % galleryImages.length)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-blue-600 text-white flex items-center justify-center transition-colors cursor-pointer border border-white/15"
                        aria-label="이전 사진"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedPhotoIdx((safeIdx + 1) % galleryImages.length)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-blue-600 text-white flex items-center justify-center transition-colors cursor-pointer border border-white/15"
                        aria-label="다음 사진"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </>
              )}
            </div>

            {/* Thumbnail Strip */}
            {galleryImages.length > 1 && (
              <div className="px-6 py-3 bg-slate-950 flex items-center gap-2 overflow-x-auto border-t border-slate-800">
                {galleryImages.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedPhotoIdx(idx)}
                    className={`relative w-16 h-12 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                      idx === safeIdx ? 'border-blue-500 ring-2 ring-blue-500/40' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={imgUrl} alt={`썸네일 ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

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
        );
      })()}
    </div>
  );
};
