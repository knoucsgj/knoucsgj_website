import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, BookCheck, Users, CalendarDays, DollarSign, Package, FileText, ChevronRight } from 'lucide-react';

export const QuickLinks: React.FC = () => {
  const cards = [
    {
      title: '투명 재정 보고',
      desc: '분기별 학생회비 결산표 및 영수증 장부',
      icon: DollarSign,
      to: '/governance',
      badge: '재정 공개'
    },
    {
      title: '비품·교재 대여',
      desc: '실습 교재, 계산기, 우산, 충전기 현황',
      icon: Package,
      to: '/welfare',
      badge: '학생 복지'
    },
    {
      title: '학사일정 캘린더',
      desc: '출석수업, 과제 마감, 기말시험 D-Day',
      icon: CalendarDays,
      to: '/calendar',
      badge: '학사 지원'
    },
    {
      title: 'U-KNOU 수강포털',
      desc: '이러닝 원격강의 수강 및 학습 진도율',
      icon: BookCheck,
      href: 'https://ucampus.knou.ac.kr',
      isExternal: true,
      badge: '원격 강의'
    },
    {
      title: '학술 & 스터디',
      desc: '전공 과목 및 자격증 준비 소그룹',
      icon: Users,
      to: '/community',
      badge: '소그룹 모임'
    },
    {
      title: '학생 자치 회의록',
      desc: '정기 임원회의 및 총회 의결문 아카이브',
      icon: FileText,
      to: '/governance',
      badge: '의결 기구'
    }
  ];

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            주요 학생회 서비스 바로가기
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            학우들의 학업과 대학 생활에 자주 필요한 핵심 서비스 모음입니다.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          const cardContent = (
            <div className="h-full bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 hover:border-blue-600 hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-3.5">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-700 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-700 transition-colors">
                    {card.badge}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors flex items-center gap-1">
                  {card.title}
                  {card.isExternal && <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-blue-500" />}
                </h3>

                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed line-clamp-2">
                  {card.desc}
                </p>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center text-[11px] font-semibold text-slate-400 group-hover:text-blue-600 transition-colors">
                <span>자세히 보기</span>
                <ChevronRight className="w-3 h-3 ml-auto group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          );

          if (card.isExternal) {
            return (
              <a
                key={idx}
                href={card.href}
                target="_blank"
                rel="noopener noreferrer"
                className="block h-full"
              >
                {cardContent}
              </a>
            );
          }

          return (
            <Link key={idx} to={card.to!} className="block h-full">
              {cardContent}
            </Link>
          );
        })}
      </div>
    </section>
  );
};
