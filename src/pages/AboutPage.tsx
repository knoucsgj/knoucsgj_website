import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { councilIntro as defaultCouncilIntro } from '../data/mockCouncil';
import { api } from '../services/api';
import type { CouncilMember, CouncilRuleChapter, PastCouncilMember } from '../lib/types';
import { ASSETS } from '../lib/assets';
import {
  Users,
  Mail,
  Shield,
  Heart,
  BookOpen,
  Sparkles,
  Scale,
  ChevronDown,
  ChevronUp,
  Award,
  Search
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  const [members, setMembers] = useState<CouncilMember[]>([]);
  const [councilIntro, setCouncilIntro] = useState(defaultCouncilIntro);
  const [rules, setRules] = useState<CouncilRuleChapter[]>([]);
  const [pastMembers, setPastMembers] = useState<PastCouncilMember[]>([]);
  const [selectedGen, setSelectedGen] = useState<string>('전체');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [openRuleChapter, setOpenRuleChapter] = useState<number | null>(1);
  const [activeTab, setActiveTab] = useState<'greeting' | 'members' | 'alumni' | 'rules'>('greeting');

  useEffect(() => {
    async function loadData() {
      const [membersData, introData, rulesData, pastData] = await Promise.all([
        api.getCouncilMembers(),
        api.getCouncilIntro(),
        api.getCouncilRules(),
        api.getPastCouncilMembers()
      ]);
      setMembers(membersData);
      setCouncilIntro(introData);
      setRules(rulesData);
      setPastMembers(pastData);
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
          onClick={() => setActiveTab('alumni')}
          className={`px-5 py-3.5 text-sm sm:text-base font-bold rounded-t-xl transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'alumni'
              ? 'bg-white text-blue-700 border-t-2 border-x border-blue-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
          }`}
        >
          <Award className="w-4 h-4 text-indigo-600" />
          역대 임원 소개
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

            {/* Tab 3: Past Council Members (역대 임원 소개 게시판) */}
      {activeTab === 'alumni' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Header Banner */}
          <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-3xl p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <Award className="w-6 h-6 text-indigo-700" />
                <h3 className="font-bold text-indigo-950 text-lg">컴퓨터과학과 역대 학생회 임원진</h3>
              </div>
              <p className="text-sm sm:text-base text-indigo-900 leading-relaxed">
                광주전남지역대학 컴퓨터과학과의 발전과 학우 여러분의 권익을 위해 헌신해 온 역대 학생회 임원 명단입니다.
              </p>
            </div>
            <span className="text-xs sm:text-sm font-bold px-3.5 py-1.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200 shrink-0 self-start sm:self-center">
              총 {pastMembers.length}명의 임원
            </span>
          </div>

          {/* Filters & Search */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Generation Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              {['전체', ...Array.from(new Set(pastMembers.map((m) => m.generation))).filter(Boolean)].map((gen) => (
                <button
                  key={gen}
                  onClick={() => setSelectedGen(gen)}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                    selectedGen === gen
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200/70'
                  }`}
                >
                  {gen}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative min-w-[220px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="성명, 직책, 기수 검색..."
                className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Past Council Members Board (게시판 형태) */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                    <th className="py-3.5 px-4 sm:px-6 w-20 text-center">사진</th>
                    <th className="py-3.5 px-4 sm:px-6 w-28 text-center">기수</th>
                    <th className="py-3.5 px-4 sm:px-6 w-32 text-center">임기</th>
                    <th className="py-3.5 px-4 sm:px-6 w-36">직책명</th>
                    <th className="py-3.5 px-4 sm:px-6">성명</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pastMembers
                    .filter((m) => {
                      const matchesGen = selectedGen === '전체' || m.generation === selectedGen;
                      const q = searchKeyword.trim().toLowerCase();
                      const matchesQ =
                        !q ||
                        m.name.toLowerCase().includes(q) ||
                        m.role.toLowerCase().includes(q) ||
                        m.generation.toLowerCase().includes(q) ||
                        m.period.toLowerCase().includes(q);
                      return matchesGen && matchesQ;
                    })
                    .map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                        {/* 1. 사진 (없으면 공란) */}
                        <td className="py-3.5 px-4 sm:px-6 text-center">
                          {m.photo_url ? (
                            <img
                              src={m.photo_url}
                              alt={m.name}
                              className="w-11 h-11 sm:w-12 sm:h-12 rounded-full object-cover border border-slate-200 mx-auto shadow-xs"
                            />
                          ) : (
                            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-slate-100 border border-slate-200 mx-auto flex items-center justify-center text-slate-300">
                              <span className="text-[10px] text-slate-400 font-medium">공란</span>
                            </div>
                          )}
                        </td>

                        {/* 2. 기수 */}
                        <td className="py-3.5 px-4 sm:px-6 text-center">
                          <span className="px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 font-bold text-xs border border-indigo-200 whitespace-nowrap">
                            {m.generation}
                          </span>
                        </td>

                        {/* 3. 임기 */}
                        <td className="py-3.5 px-4 sm:px-6 text-center text-slate-600 font-medium whitespace-nowrap">
                          {m.period}
                        </td>

                        {/* 4. 직책명 */}
                        <td className="py-3.5 px-4 sm:px-6 font-semibold">
                          <span
                            className={`px-2.5 py-1 rounded-md text-xs font-bold inline-block ${
                              m.role === '학생회장'
                                ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                : m.role.includes('부회장') || m.role.includes('부학생회장')
                                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}
                          >
                            {m.role}
                          </span>
                        </td>

                        {/* 5. 성명 */}
                        <td className="py-3.5 px-4 sm:px-6 font-bold text-slate-900 text-sm sm:text-base">
                          {m.name}
                        </td>
                      </tr>
                    ))}
                  {pastMembers.filter((m) => {
                    const matchesGen = selectedGen === '전체' || m.generation === selectedGen;
                    const q = searchKeyword.trim().toLowerCase();
                    return matchesGen && (!q || m.name.toLowerCase().includes(q) || m.role.toLowerCase().includes(q));
                  }).length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-500 font-medium">
                        조건에 해당하는 역대 임원 정보가 없습니다.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
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
    </div>
  );
};