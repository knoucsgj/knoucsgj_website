import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, BookCheck, Users, MapPin, CalendarDays, MessageCircle } from 'lucide-react';

export const QuickLinks: React.FC = () => {
  const cards = [
    {
      title: 'U-KNOU 원격수강',
      desc: '강의 수강 및 학습 진도율 체크',
      icon: BookCheck,
      href: 'https://ucampus.knou.ac.kr',
      isExternal: true,
      color: 'from-blue-600 to-indigo-600',
      badge: '포털'
    },
    {
      title: '2학기 학사일정',
      desc: '출석수업, 기말시험, 과제 마감일',
      icon: CalendarDays,
      to: '/calendar',
      isExternal: false,
      color: 'from-sky-500 to-blue-600',
      badge: 'D-Day'
    },
    {
      title: '스터디 & 멘토링',
      desc: '동료 학우들과 함께 공부하는 소그룹',
      icon: Users,
      to: '/community',
      isExternal: false,
      color: 'from-emerald-500 to-teal-600',
      badge: '모집중'
    },
    {
      title: '지역대학 전산실습실',
      desc: '본관 302호 실습실 & 스터디룸',
      icon: MapPin,
      to: '/about',
      isExternal: false,
      color: 'from-purple-500 to-indigo-600',
      badge: '광주'
    },
    {
      title: '학과 본부 홈페이지',
      desc: '컴퓨터과학과 교수진 및 공식 커리큘럼',
      icon: ExternalLink,
      href: 'https://cs.knou.ac.kr',
      isExternal: true,
      color: 'from-slate-600 to-slate-800',
      badge: '본교'
    },
    {
      title: '학생회 소통 채널',
      desc: '오픈채팅방 및 학우 질문 창구',
      icon: MessageCircle,
      to: '/about',
      isExternal: false,
      color: 'from-amber-500 to-orange-600',
      badge: '소통'
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
