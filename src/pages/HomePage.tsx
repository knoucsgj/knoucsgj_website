import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { HeroSection } from '../components/home/HeroSection';
import { QuickLinks } from '../components/home/QuickLinks';
import { RecentNoticesSection } from '../components/home/RecentNoticesSection';
import { UpcomingEventsSection } from '../components/home/UpcomingEventsSection';
import { api } from '../services/api';
import type { Notice, AcademicEvent } from '../lib/types';
import { Users, Sparkles, MapPin } from 'lucide-react';

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
      {/* Hero Banner */}
      <HeroSection />

      {/* Quick Navigation Cards */}
      <QuickLinks />

      {/* Notice & Academic Events Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        <div className="lg:col-span-7">
          <RecentNoticesSection notices={notices} loading={loading} />
        </div>
        <div className="lg:col-span-5">
          <UpcomingEventsSection events={events} loading={loading} />
        </div>
      </section>

      {/* Student Council Warm Encouragement Banner */}
      <section className="rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-8 sm:p-10 shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>제43대 컴퓨터과학과 학생회 소통 창구</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-3 leading-snug">
            수업이나 과제, 혼자 고민하지 마세요!
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6 font-normal">
            방송대 컴퓨터과학과는 다양한 세대와 분야의 학우들이 서로 가르쳐주고 배우는 따뜻한 커뮤니티입니다. 
            스터디 그룹 참여를 희망하시거나 학교 생활에 궁금한 점이 있다면 언제든 학생회에 연락해 주세요.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/community"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-blue-900 font-bold text-xs sm:text-sm hover:bg-blue-50 transition-colors shadow-sm"
            >
              <Users className="w-4 h-4 text-blue-600" />
              스터디 그룹 둘러보기
            </Link>
            <Link
              to="/about"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs sm:text-sm transition-colors border border-white/20"
            >
              <MapPin className="w-4 h-4 text-sky-300" />
              지역대학 찾아오는 길
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
