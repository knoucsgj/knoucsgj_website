import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { regionalInfo, councilIntro as defaultCouncilIntro } from '../data/mockCouncil';
import { api } from '../services/api';
import type { CouncilMember, CouncilRuleChapter } from '../lib/types';
import { ASSETS } from '../lib/assets';
import {
  Users,
  MapPin,
  Phone,
  Printer,
  Clock,
  Building,
  Info,
  Mail,
  Shield,
  Heart,
  ExternalLink,
  Laptop,
  BookOpen,
  Sparkles,
  Navigation,
  Scale,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  const [members, setMembers] = useState<CouncilMember[]>([]);
  const [councilIntro, setCouncilIntro] = useState(defaultCouncilIntro);
  const [rules, setRules] = useState<CouncilRuleChapter[]>([]);
  const [openRuleChapter, setOpenRuleChapter] = useState<number | null>(1);
  const [activeTab, setActiveTab] = useState<'greeting' | 'members' | 'rules' | 'campus' | 'directions'>('greeting');

  useEffect(() => {
    async function loadData() {
      const [membersData, introData, rulesData] = await Promise.all([
        api.getCouncilMembers(),
        api.getCouncilIntro(),
        api.getCouncilRules()
      ]);
      setMembers(membersData);
      setCouncilIntro(introData);
      setRules(rulesData);
    }
    loadData();
  }, []);

  return (
    <div className="space-y-10">
      {/* Clean Editorial Page Header */}
      <div className="border-b border-slate-200 pb-8">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-blue-700 tracking-wider uppercase mb-1.5">
          <span>Student Council Introduction</span>
        </div>
        <h1 className="font-knou text-2xl sm:text-3xl md:text-4xl font-bold text-slate-950 tracking-tight mb-2.5">
          학생회 소개
        </h1>
        <p className="text-slate-700 text-sm sm:text-base leading-relaxed max-w-3xl font-normal">
          한국방송통신대학교 광주전남지역대학 컴퓨터과학과 학생회는 학우 여러분의 보람찬 대학 생활과 성공적인 학위 취득을 위한 가장 가까운 길잡이가 되겠습니다.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200 overflow-x-auto pb-px gap-2">
        <button
          onClick={() => setActiveTab('greeting')}
          className={`px-5 py-3.5 text-sm sm:text-base font-bold rounded-t-xl transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'greeting'
              ? 'bg-white text-blue-700 border-t-2 border-x border-blue-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
          }`}
        >
          <Heart className="w-4 h-4 text-rose-500" />
          학생회장 인사말
        </button>
        <button
          onClick={() => setActiveTab('members')}
          className={`px-5 py-3.5 text-sm sm:text-base font-bold rounded-t-xl transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'members'
              ? 'bg-white text-blue-700 border-t-2 border-x border-blue-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
          }`}
        >
          <Users className="w-4 h-4 text-blue-600" />
          학생회 임원진 소개
        </button>
        <button
          onClick={() => setActiveTab('rules')}
          className={`px-5 py-3.5 text-sm sm:text-base font-bold rounded-t-xl transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'rules'
              ? 'bg-white text-blue-700 border-t-2 border-x border-blue-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
          }`}
        >
          <Scale className="w-4 h-4 text-amber-600" />
          학과 학생회칙 및 세칙
        </button>
        <button
          onClick={() => setActiveTab('campus')}
          className={`px-5 py-3.5 text-sm sm:text-base font-bold rounded-t-xl transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'campus'
              ? 'bg-white text-blue-700 border-t-2 border-x border-blue-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
          }`}
        >
          <Laptop className="w-4 h-4 text-emerald-600" />
          지역대학 & 실습실 안내
        </button>
        <button
          onClick={() => setActiveTab('directions')}
          className={`px-5 py-3.5 text-sm sm:text-base font-bold rounded-t-xl transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'directions'
              ? 'bg-white text-blue-700 border-t-2 border-x border-blue-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
          }`}
        >
          <MapPin className="w-4 h-4 text-amber-500" />
          오시는 길 & 학습관
        </button>
      </div>

      {/* Tab 1: Greeting */}
      {activeTab === 'greeting' && (
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-xs space-y-8 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
            <div className="border-l-4 border-blue-600 pl-4 py-1">
              <h2 className="font-knou text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {councilIntro.title}
              </h2>
              <p className="text-sm sm:text-base text-slate-600 mt-1.5 font-semibold">
                한국방송통신대학교 광주전남지역대학 컴퓨터과학과 학생회
              </p>
            </div>
            <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-26 md:h-26 rounded-2xl bg-blue-50/70 border border-blue-100 p-2 shrink-0 flex items-center justify-center shadow-xs">
              <img
                src={ASSETS.characters.greeting}
                alt="방송대 감사 마스코트"
                className="w-full h-full object-contain drop-shadow-xs"
              />
            </div>
          </div>

          <div className="prose prose-slate max-w-none text-slate-800 text-base sm:text-lg leading-loose space-y-5 whitespace-pre-line font-normal">
            {councilIntro.president_greeting}
          </div>

          {/* Student Council Pledges Box */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-6 border-t border-slate-100">
            <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-5 sm:p-6">
              <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center mb-3">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base sm:text-lg mb-1.5">1. 든든한 학업 동반자</h3>
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
                출석수업 자료 나눔, 과제물 가이드라인 및 수준별 스터디 그룹을 활성화하여 중도 포기 없이 전원 졸업을 지원합니다.
              </p>
            </div>

            <div className="bg-indigo-50/60 border border-indigo-100 rounded-2xl p-5 sm:p-6">
              <div className="w-11 h-11 rounded-xl bg-indigo-600 text-white flex items-center justify-center mb-3">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base sm:text-lg mb-1.5">2. 따뜻한 교류의 장</h3>
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
                현업 IT 선배 특강, 종강총회, 소그룹 모임을 통해 같은 고민을 나누는 소중한 개발자 동료 네트워크를 구축합니다.
              </p>
            </div>

            <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-5 sm:p-6 flex flex-col justify-between">
              <div>
                <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-3">
                  <Shield className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-base sm:text-lg mb-1.5">3. 투명하고 정직한 운영</h3>
                <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
                  납부해주신 학생회비 내역을 1원 단위까지 분기별로 공개하고, 모든 학우의 의견을 경청하는 열린 학생회가 되겠습니다.
                </p>
              </div>
              <Link
                to="/governance"
                className="mt-4 inline-flex items-center text-sm font-bold text-emerald-700 hover:text-emerald-800 underline"
              >
                투명 회계 보고 & 회칙 확인 →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Council Members */}
      {activeTab === 'members' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">학생회 임원진</h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                학우 여러분의 편리한 학업과 권익을 위해 봉사하는 임원진입니다.
              </p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
              총 {members.length}명
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {members.map((member) => (
              <div
                key={member.id}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      {member.role}
                    </span>
                    <span className="text-sm text-slate-600 font-medium">{member.grade_info}</span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-2">{member.name}</h3>
                  <p className="text-sm sm:text-base text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100 font-normal">
                    "{member.message}"
                  </p>
                </div>

                {member.email && (
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-sm text-slate-600 font-medium">
                    <Mail className="w-4 h-4 text-blue-500" />
                    <span>{member.email}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Council Rules (학생회칙 및 세칙) */}
      {activeTab === 'rules' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
            <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                  한국방송통신대학교 광주전남지역대학 컴퓨터과학과 학생회칙
                </h2>
                <p className="text-sm sm:text-base text-slate-600 mt-1">
                  본 회칙은 광주전남 컴퓨터과학과 모든 학우의 권익과 자치 활동의 근간이 되는 기본 규범입니다.
                </p>
              </div>
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-100 hidden sm:block">
                <Scale className="w-6 h-6 text-amber-600" />
              </div>
            </div>

            <div className="space-y-4">
              {rules.map((chapter) => {
                const isOpen = openRuleChapter === chapter.chapter;
                return (
                  <div key={chapter.chapter} className="border border-slate-200 rounded-2xl overflow-hidden transition-all">
                    <button
                      onClick={() => setOpenRuleChapter(isOpen ? null : chapter.chapter)}
                      className="w-full p-4.5 sm:p-5.5 text-left flex items-center justify-between gap-4 bg-slate-50/60 hover:bg-slate-50 transition-colors"
                    >
                      <h3 className="font-bold text-base sm:text-lg text-slate-900">
                        제{chapter.chapter}장 {chapter.title}
                      </h3>
                      {isOpen ? (
                        <ChevronUp className="w-5 h-5 text-amber-600 shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                      )}
                    </button>

                    {isOpen && (
                      <div className="p-5 sm:p-6 bg-white border-t border-slate-100 space-y-4 divide-y divide-slate-100">
                        {chapter.articles.map((art) => (
                          <div key={art.number} className="pt-3.5 first:pt-0">
                            <span className="font-bold text-base text-blue-950 block mb-1.5">
                              제{art.number}조 ({art.title})
                            </span>
                            <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
                              {art.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Campus & Facilities */}
      {activeTab === 'campus' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">광주전남지역대학 주요 시설</h2>
            <p className="text-sm sm:text-base text-slate-600 mb-6">
              컴퓨터과학과 학우들이 학습과 실습, 스터디를 위해 이용할 수 있는 지역대학 내 시설 안내입니다.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {regionalInfo.facilities.map((fac, idx) => (
                <div
                  key={idx}
                  className="p-5 sm:p-6 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-blue-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center gap-3 mb-2.5">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-base shrink-0">
                      {idx + 1}
                    </div>
                    <h3 className="font-bold text-slate-900 text-lg">{fac.name}</h3>
                  </div>
                  <p className="text-sm sm:text-base text-slate-700 leading-relaxed pl-13">
                    {fac.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Directions & Regional Centers */}
      {activeTab === 'directions' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Main Regional Center Info */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6 flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={ASSETS.UI.gwangjuJeonnam}
                  alt="광주전남지역대학"
                  className="h-9 sm:h-11 w-auto object-contain shrink-0"
                />
                <div>
                  <span className="text-xs sm:text-sm font-bold px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-800">
                    본관
                  </span>
                  <h2 className="font-knou text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                    {regionalInfo.center_name}
                  </h2>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`https://map.naver.com/v5/search/${encodeURIComponent(regionalInfo.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-bold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                >
                  네이버 지도
                  <ExternalLink className="w-4 h-4" />
                </a>
                <a
                  href={`https://map.kakao.com/link/search/${encodeURIComponent(regionalInfo.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-bold rounded-xl bg-amber-400 text-slate-900 hover:bg-amber-500 transition-colors"
                >
                  카카오맵
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-base text-slate-800">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-slate-900 text-base">도로명 주소</span>
                    <span className="text-slate-700 text-sm sm:text-base leading-relaxed">{regionalInfo.address}</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-slate-900 text-base">지역대학 행정실 대표전화</span>
                    <span className="text-slate-700 text-sm sm:text-base">{regionalInfo.tel}</span>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-100 text-sm sm:text-base text-slate-700 space-y-2.5">
                <div className="font-bold text-blue-900 flex items-center gap-2 text-base">
                  <Navigation className="w-5 h-5 text-blue-700" />
                  대중교통 & 방문 안내
                </div>
                <div className="leading-relaxed">
                  <span className="font-semibold text-slate-900">• 시내버스 :</span> 봉선27, 첨단40, 첨단92, 첨단192 (방송통신대 정류장 하차)
                  <p className="text-xs sm:text-sm text-amber-800 bg-amber-50 border border-amber-200/80 rounded-lg px-2.5 py-1.5 mt-1 font-medium">
                    ※ 2026년 10월 31일 광주시 시내버스 노선 개편으로 경유 노선이 변경될 예정입니다.
                  </p>
                </div>
                <p className="leading-relaxed">
                  • 자가용 이용 시 : 대학 지상 무료 주차 가능 (주말 출석수업 시 혼잡할 수 있으니 대중교통 이용을 권장합니다)
                </p>
              </div>
            </div>
          </div>

          {/* Sub-center 학습관 List */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
            <div className="pb-4 border-b border-slate-100 mb-6">
              <h3 className="text-xl font-bold text-slate-900 mb-1">전남 관할 시·군 학습관 (2개소)</h3>
              <p className="text-sm sm:text-base text-slate-600">
                광주 본관 외에도 각 지역 학습관에서 시험(출석대체시험, 기말시험) 응시 및 사전 신청을 통한 스터디 진행이 가능합니다.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {regionalInfo.sub_centers.map((center, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                      <span className="font-bold text-lg text-slate-900 flex items-center gap-2">
                        <Building className="w-5 h-5 text-blue-600" />
                        {center.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <a
                          href={`https://map.naver.com/v5/search/${encodeURIComponent(center.address)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-bold px-2.5 py-1 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 transition-colors inline-flex items-center gap-1"
                        >
                          네이버 지도 <ExternalLink className="w-3 h-3" />
                        </a>
                        <a
                          href={`https://map.kakao.com/link/search/${encodeURIComponent(center.address)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-bold px-2.5 py-1 rounded-md bg-amber-400 text-slate-900 hover:bg-amber-500 transition-colors inline-flex items-center gap-1"
                        >
                          카카오맵 <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>

                    <div className="space-y-2.5 text-sm sm:text-base">
                      <div className="flex items-start gap-2.5 text-slate-700">
                        <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-1" />
                        <div>
                          <span className="font-semibold text-slate-900 mr-2">주소:</span>
                          <span>{center.address}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-slate-700">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-blue-600 shrink-0" />
                          <span className="font-semibold text-slate-900">전화:</span>
                          <span className="font-bold text-blue-700">{center.tel}</span>
                        </div>
                        {center.fax && (
                          <div className="flex items-center gap-2">
                            <Printer className="w-4 h-4 text-slate-400 shrink-0" />
                            <span className="font-semibold text-slate-900">팩스:</span>
                            <span>{center.fax}</span>
                          </div>
                        )}
                      </div>

                      {center.facilities && (
                        <div className="flex items-start gap-2.5 text-slate-700">
                          <Building className="w-4 h-4 text-indigo-600 shrink-0 mt-1" />
                          <div>
                            <span className="font-semibold text-slate-900 mr-2">주요 시설:</span>
                            <span>{center.facilities}</span>
                          </div>
                        </div>
                      )}

                      {center.hours && (
                        <div className="flex items-start gap-2.5 text-slate-700">
                          <Clock className="w-4 h-4 text-emerald-600 shrink-0 mt-1" />
                          <div>
                            <span className="font-semibold text-slate-900 mr-2">근무 시간:</span>
                            <span>{center.hours}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {center.notice && (
                      <div className="mt-4 p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/80 text-xs sm:text-sm text-amber-900 flex items-start gap-2 leading-relaxed">
                        <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="font-semibold block mb-0.5">이용 안내:</strong>
                          <span>{center.notice}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
