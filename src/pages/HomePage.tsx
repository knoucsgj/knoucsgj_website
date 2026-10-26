import React, { useEffect, useState } from 'react';
import { HeroSection } from '../components/home/HeroSection';
import { RecentNoticesSection } from '../components/home/RecentNoticesSection';
import { UpcomingEventsSection } from '../components/home/UpcomingEventsSection';
import { api } from '../services/api';
import type { Notice, AcademicEvent } from '../lib/types';
import { ASSETS } from '../lib/assets';

export const HomePage: React.FC = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [events, setEvents] = useState<AcademicEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [noticesData, eventsData] = await Promise.all([
          api.getNotices(),
          api.getEvents(),
        ]);
        setNotices(noticesData);
        setEvents(eventsData);
      } catch (err) {
        console.error('Failed to load home data', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-12">
      {/* 1. Hero Banner */}
      <HeroSection />

      {/* 2. Real Campus Life Decorative Showcase (히어로 바로 아래 '여기'로 재배치) */}
      <section className="rounded-3xl bg-linear-to-b from-slate-900 to-slate-950 text-white p-7 sm:p-9 lg:p-10 shadow-xl border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs sm:text-sm font-semibold mb-2.5 border border-blue-400/20">
              <span className="w-2 h-2 rounded-full bg-blue-400"></span>
              <span>우리들의 생생한 학과 캠퍼스 라이프</span>
            </div>
            <h2 className="font-knou text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-tight">
              일터에서 캠퍼스로, 함께 도전하고 성장합니다
            </h2>
            <p className="text-slate-300 text-sm sm:text-base mt-1.5 font-normal max-w-2xl">
              소프트웨어 경진대회 본선 현장부터 CODE & AI 실습 스터디, 정기 임원회의까지 광주전남 컴퓨터과학과의 따뜻한 열정이 함께합니다.
            </p>
          </div>
          <div className="text-xs sm:text-sm text-slate-400 font-medium shrink-0">
            광주전남지역대학 컴퓨터과학과
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 group shadow-md hover:border-slate-700 transition-all">
            <div className="aspect-4/3 overflow-hidden bg-slate-950">
              <img
                src={ASSETS.pictures.competition1}
                alt="총장배 경진대회 본선 부스"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-4">
              <span className="text-xs font-bold text-blue-400">제18회 총장배 S/W 경진대회</span>
              <p className="text-sm font-bold text-white mt-0.5">열정 가득한 본선 전시대 부스</p>
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 group shadow-md hover:border-slate-700 transition-all">
            <div className="aspect-4/3 overflow-hidden bg-slate-950">
              <img
                src={ASSETS.pictures.competition2}
                alt="총장배 경진대회 광주전남 출전팀"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-4">
              <span className="text-xs font-bold text-emerald-400">광주·전남 출전팀</span>
              <p className="text-sm font-bold text-white mt-0.5">본선 진출 학우들의 단체 기념</p>
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 group shadow-md hover:border-slate-700 transition-all">
            <div className="aspect-4/3 overflow-hidden bg-slate-950">
              <img
                src={ASSETS.pictures.studyActivity}
                alt="CODE AI 스터디 활동"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-4">
              <span className="text-xs font-bold text-amber-400">전산실습실 스터디</span>
              <p className="text-sm font-bold text-white mt-0.5">CODE & AI 함께하는 코딩 모임</p>
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 group shadow-md hover:border-slate-700 transition-all">
            <div className="aspect-4/3 overflow-hidden bg-slate-950">
              <img
                src={ASSETS.pictures.councilMeeting}
                alt="학생회 임원회의"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-4">
              <span className="text-xs font-bold text-purple-400">본관 405호 학생회</span>
              <p className="text-sm font-bold text-white mt-0.5">학우들을 위한 정기 임원 회의</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Notice & Academic Events Grid (캠퍼스 라이프 하단에 배치) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        <div className="lg:col-span-7">
          <RecentNoticesSection notices={notices} loading={loading} />
        </div>
        <div className="lg:col-span-5">
          <UpcomingEventsSection events={events} loading={loading} />
        </div>
      </section>
    </div>
  );
};
