import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, BookCheck, Users, CalendarDays, DollarSign, FileText, ChevronRight } from 'lucide-react';

export const QuickLinks: React.FC = () => {
  const cards = [
    {
      title: '공지사항 & 결산보고',
      desc: '학사 공지, 학생회비 결산, 정기 회의록',
      icon: DollarSign,
      to: '/notices',
      badge: '공지·결산'
    },
    {
      title: '주요일정 캘린더',
      desc: '출석수업, 과제 마감, 기말시험 D-Day',
      icon: CalendarDays,
      to: '/calendar',
      badge: '학사 지원'
    },
    {
      title: '학술·스터디 & 자료실',
      desc: '학년·학기별 전공과목 학습자료 및 스터디 소그룹',
      icon: Users,
      to: '/studies',
      badge: '전공·스터디'
    },
    {
      title: '커뮤니티 & 열린 건의함',
      desc: '자유게시판, 학생회 소통 및 열린 건의 게시판',
      icon: FileText,
      to: '/community',
      badge: '열린 소통'
    },
    {
      title: '학생회 소개 & 회칙',
      desc: '임원진 소개, 학생회칙 및 지역대학 시설',
      icon: FileText,
      to: '/about',
      badge: '학생회'
    },
    {
      title: 'U-KNOU 수강포털',
      desc: '이러닝 원격강의 수강 및 학습 진도율',
      icon: BookCheck,
      href: 'https://ucampus.knou.ac.kr',
      isExternal: true,
      badge: '원격 강의'
    }
  ];

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            주요 학생회 서비스 바로가기
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-1">
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
                  <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-700 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 group-hover:bg-blue-50 group-hover:text-blue-700 transition-colors">
                    {card.badge}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-blue-700 transition-colors flex items-center gap-1.5 leading-snug">
                  {card.title}
                  {card.isExternal && <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500" />}
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed line-clamp-2 font-medium">
                  {card.desc}
                </p>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center text-xs sm:text-sm font-semibold text-slate-500 group-hover:text-blue-600 transition-colors">
                <span>자세히 보기</span>
                <ChevronRight className="w-4 h-4 ml-auto group-hover:translate-x-0.5 transition-transform" />
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
