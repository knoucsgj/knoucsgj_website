import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, BookCheck, Users, CalendarDays, DollarSign, Package, FileText } from 'lucide-react';

export const QuickLinks: React.FC = () => {
  const cards = [
    {
      title: '투명 재정 보고',
      desc: '분기별 학생회비 결산 및 영수증 장부',
      icon: DollarSign,
      to: '/governance',
      isExternal: false,
      color: 'from-emerald-600 to-teal-700',
      badge: '100% 공개'
    },
    {
      title: '비품·교재 대여',
      desc: '실습 교재, 계산기, 우산, 충전기',
      icon: Package,
      to: '/welfare',
      isExternal: false,
      color: 'from-blue-600 to-indigo-600',
      badge: '학생복지'
    },
    {
      title: '학사일정 D-Day',
      desc: '출석수업, 과제 마감, 기말시험 일정',
      icon: CalendarDays,
      to: '/calendar',
      isExternal: false,
      color: 'from-sky-500 to-blue-600',
      badge: 'D-Day'
    },
    {
      title: 'U-KNOU 수강',
      desc: '방송대 이러닝 강의 및 진도율 체크',
      icon: BookCheck,
      href: 'https://ucampus.knou.ac.kr',
      isExternal: true,
      color: 'from-slate-700 to-slate-900',
      badge: '원격강의'
    },
    {
      title: '학술 & 스터디',
      desc: '동료 학우들과 함께 공부하는 소그룹',
      icon: Users,
      to: '/community',
      isExternal: false,
      color: 'from-indigo-500 to-purple-600',
      badge: '자율소그룹'
    },
    {
      title: '총회·임원 회의록',
      desc: '개강총회, 종강총회, 임원회의 의결서',
      icon: FileText,
      to: '/governance',
      isExternal: false,
      color: 'from-amber-600 to-orange-600',
      badge: '학생자치'
    }
  ];

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            자주 찾는 바로가기
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            학습과 학교 생활에 자주 필요한 주요 서비스 링크입니다.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          const content = (
            <div className="h-full bg-white rounded-2xl p-4 border border-slate-200/80 hover:border-blue-400 hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-700 transition-colors">
                    {card.badge}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors flex items-center gap-1">
                  {card.title}
                  {card.isExternal && <ExternalLink className="w-3 h-3 text-slate-400" />}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {card.desc}
                </p>
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
                {content}
              </a>
            );
          }

          return (
            <Link key={idx} to={card.to!} className="block h-full">
              {content}
            </Link>
          );
        })}
      </div>
    </section>
  );
};
