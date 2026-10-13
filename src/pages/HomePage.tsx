import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { HeroSection } from '../components/home/HeroSection';
import { QuickLinks } from '../components/home/QuickLinks';
import { RecentNoticesSection } from '../components/home/RecentNoticesSection';
import { UpcomingEventsSection } from '../components/home/UpcomingEventsSection';
import { api } from '../services/api';
import type { Notice, AcademicEvent } from '../lib/types';
import { Users, MapPin } from 'lucide-react';
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

      {/* Recent Activities Photo Showcase Banner */}
      <section className="rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-8 lg:p-10 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs sm:text-sm font-semibold mb-2 border border-blue-100">
              <span>학과 현장 스케치</span>
            </div>
            <h2 className="font-knou text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              함께 배우고 성장하는 우리 학과 활동
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-1">
              소프트웨어 경진대회 본선, CODE & AI 학술 스터디, 학생회 자치 회의 등 생생한 학과 현장입니다.
            </p>
          </div>
          <Link
            to="/welfare"
            className="inline-flex items-center gap-1.5 text-sm sm:text-base font-bold text-blue-600 hover:text-blue-800 shrink-0"
          >
            활동 갤러리 전체보기 →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 group shadow-xs">
            <div className="aspect-4/3 overflow-hidden bg-slate-100">
              <img
                src={ASSETS.pictures.competition1}
                alt="총장배 경진대회 본선 부스"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-3.5">
              <span className="text-xs font-bold text-blue-600">본교 경진대회</span>
              <p className="text-sm font-bold text-slate-900 mt-0.5 line-clamp-1">총장배 S/W 경진대회 본선</p>
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 group shadow-xs">
            <div className="aspect-4/3 overflow-hidden bg-slate-100">
              <img
                src={ASSETS.pictures.competition2}
                alt="총장배 경진대회 광주전남 출전팀"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-3.5">
              <span className="text-xs font-bold text-emerald-600">출전팀 단체</span>
              <p className="text-sm font-bold text-slate-900 mt-0.5 line-clamp-1">광주전남 출전팀 기념</p>
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 group shadow-xs">
            <div className="aspect-4/3 overflow-hidden bg-slate-100">
              <img
                src={ASSETS.pictures.studyActivity}
                alt="CODE AI 스터디 활동"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-3.5">
              <span className="text-xs font-bold text-amber-600">학술 스터디</span>
              <p className="text-sm font-bold text-slate-900 mt-0.5 line-clamp-1">CODE & AI 전산실습</p>
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 group shadow-xs">
            <div className="aspect-4/3 overflow-hidden bg-slate-100">
              <img
                src={ASSETS.pictures.councilMeeting}
                alt="학생회 임원회의"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-3.5">
              <span className="text-xs font-bold text-indigo-600">학생회 자치</span>
              <p className="text-sm font-bold text-slate-900 mt-0.5 line-clamp-1">정기 임원회의 진행</p>
            </div>
          </div>
        </div>
      </section>

      {/* Student Council Academic Support Banner */}
      <section className="rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-8 lg:p-10 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-start sm:items-center gap-5">
          <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-2xl bg-blue-50/80 border border-blue-100 p-2 shrink-0 flex items-center justify-center shadow-xs">
            <img
              src={ASSETS.characters.study}
              alt="방송대 토론 마스코트"
              className="w-full h-full object-contain drop-shadow-xs"
            />
          </div>
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs sm:text-sm font-semibold mb-2 border border-blue-100">
              <span>컴퓨터과학과 학생회 소통 창구</span>
            </div>
            <h2 className="font-knou text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-2">
              수업이나 과제, 혼자 고민하지 마세요
            </h2>
            <p className="text-slate-700 text-sm sm:text-base leading-relaxed font-normal">
              방송대 컴퓨터과학과는 다양한 세대와 분야의 학우들이 서로 가르쳐주고 배우는 따뜻한 커뮤니티입니다. 
              스터디 그룹 참여를 희망하시거나 학교 생활에 궁금한 점이 있다면 언제든 학생회와 함께하세요.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link
            to="/community"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 text-white font-bold text-sm sm:text-base hover:bg-blue-700 transition-colors shadow-xs"
          >
            <Users className="w-5 h-5" />
            스터디 그룹 둘러보기
          </Link>
          <Link
            to="/about"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm sm:text-base transition-colors border border-slate-200"
          >
            <MapPin className="w-5 h-5 text-slate-600" />
            지역대학 시설 안내
          </Link>
        </div>
      </section>
    </div>
  );
};
