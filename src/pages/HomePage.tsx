import React, { useEffect, useState } from 'react';
import { CampusLifeCarousel } from '../components/home/CampusLifeCarousel';
import { RecentNoticesSection } from '../components/home/RecentNoticesSection';
import { UpcomingEventsSection } from '../components/home/UpcomingEventsSection';
import { GlobalPopupModal } from '../components/common/GlobalPopupModal';
import { api } from '../services/api';
import type { Notice, AcademicEvent, ActivityReport } from '../lib/types';

export const HomePage: React.FC = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [events, setEvents] = useState<AcademicEvent[]>([]);
  const [activities, setActivities] = useState<ActivityReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [noticesData, eventsData, activitiesData] = await Promise.all([
          api.getNotices(),
          api.getEvents(),
          api.getActivities(),
        ]);
        setNotices(noticesData);
        setEvents(eventsData);
        setActivities(activitiesData);
      } catch (err) {
        console.error('Failed to load home data', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <>
      <GlobalPopupModal />
      <div className="rounded-3xl bg-slate-950 text-white border border-slate-800 shadow-2xl overflow-hidden divide-y divide-slate-800/80">
      
      {/* ======================================================== */}
      {/* 1. 최상단: 우리들의 생생한 학과 캠퍼스 라이프 (자동 롤링)  */}
      {/* ======================================================== */}
      <section className="p-6 sm:p-9 lg:p-11 bg-slate-950">
        <CampusLifeCarousel activities={activities} loading={loading} />
      </section>

      {/* ======================================================== */}
      {/* 2. 중간: 공지사항 & 주요 학사일정 (같은 다크 톤으로 일체화) */}
      {/* ======================================================== */}
      <section className="p-6 sm:p-9 lg:p-11 bg-slate-950/70">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          <div className="lg:col-span-7">
            <RecentNoticesSection notices={notices} loading={loading} variant="dark" />
          </div>
          <div className="lg:col-span-5">
            <UpcomingEventsSection events={events} loading={loading} variant="dark" />
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. 하단: 일과 학업의 병행 슬로건 & 미션 비전             */}
      {/* ======================================================== */}
      <section className="p-6 sm:p-9 lg:p-11 bg-slate-950">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs sm:text-sm font-semibold">
            <span className="w-2 h-2 rounded-full bg-blue-400"></span>
            <span>한국방송통신대학교 광주전남지역대학 컴퓨터과학과 학생회</span>
          </div>

          <h2 className="font-knou text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-white leading-snug">
            일과 학업의 병행, <br className="hidden sm:inline" />
            <span className="text-blue-400">끝까지 완주할 수 있도록</span> 함께합니다.
          </h2>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl font-normal">
            출석수업 및 과제 가이드, 100% 투명한 학생회비 결산, 학술 스터디 지원, 생생한 학과 활동까지 학생회가 든든한 동반자가 되겠습니다.
          </p>
        </div>
      </section>

    </div>
    </>
  );
};
