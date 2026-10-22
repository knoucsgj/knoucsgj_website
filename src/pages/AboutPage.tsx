import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { councilIntro as defaultCouncilIntro } from '../data/mockCouncil';
import { api } from '../services/api';
import type { CouncilMember,  PastCouncilMember } from '../lib/types';
import { ASSETS } from '../lib/assets';
import { OfficialConstitutionView } from '../components/OfficialConstitutionView';
import {
  Users,
  Mail,
  Shield,
  Heart,
  BookOpen,
  Sparkles,
  Scale,
  Award,
  Search,
  FileText,
  ArrowLeft,
  ChevronRight,
  User,
  Calendar
} from 'lucide-react';

interface CohortGroup {
  key: string;
  generation: string;
  period: string;
  members: PastCouncilMember[];
  president?: PastCouncilMember;
}

export const AboutPage: React.FC = () => {
  const [members, setMembers] = useState<CouncilMember[]>([]);
  const [councilIntro, setCouncilIntro] = useState(defaultCouncilIntro);
  const [pastMembers, setPastMembers] = useState<PastCouncilMember[]>([]);
  const [selectedCohortKey, setSelectedCohortKey] = useState<string | null>(null);
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'greeting' | 'members' | 'alumni' | 'rules'>('greeting');

  useEffect(() => {
    async function loadData() {
      const [membersData, introData, pastData] = await Promise.all([
        api.getCouncilMembers(),
        api.getCouncilIntro(),
        api.getPastCouncilMembers()
      ]);
      setMembers(membersData);
      setCouncilIntro(introData);
      setPastMembers(pastData);
    }
    loadData();
  }, []);

  // Group past members by cohort (generation & period)
  const cohorts = useMemo<CohortGroup[]>(() => {
    const map = new Map<string, CohortGroup>();

    for (const m of pastMembers) {
      const key = `${m.generation || '기타'}-${m.period || ''}`;
      if (!map.has(key)) {
        map.set(key, {
          key,
          generation: m.generation || '기타',
          period: m.period || '',
          members: []
        });
      }
      map.get(key)!.members.push(m);
    }

    const list = Array.from(map.values()).map((group) => {
      // Sort members inside cohort: sort_order asc, role priority (학생회장 -> 부학생회장 -> others)
      const sortedMembers = [...group.members].sort((a, b) => {
        const orderA = a.sort_order ?? 999;
        const orderB = b.sort_order ?? 999;
        if (orderA !== orderB) return orderA - orderB;
        if (a.role === '학생회장') return -1;
        if (b.role === '학생회장') return 1;
        if (a.role.includes('부회장') || a.role.includes('부학생회장')) return -1;
        if (b.role.includes('부회장') || b.role.includes('부학생회장')) return 1;
        return 0;
      });

      const president = sortedMembers.find((m) => m.role === '학생회장');
      return {
        ...group,
        members: sortedMembers,
        president
      };
    });

    // Sort cohorts descending (higher generation first, or recent year first)
    list.sort((a, b) => {
      const genA = parseInt(a.generation.replace(/[^0-9]/g, '')) || 0;
      const genB = parseInt(b.generation.replace(/[^0-9]/g, '')) || 0;
      if (genA !== genB) return genB - genA;
      const yearA = parseInt(a.period.replace(/[^0-9]/g, '')) || 0;
      const yearB = parseInt(b.period.replace(/[^0-9]/g, '')) || 0;
      return yearB - yearA;
    });

    return list;
  }, [pastMembers]);

  // Filter cohorts by search keyword
  const filteredCohorts = useMemo(() => {
    if (!searchKeyword.trim()) return cohorts;
    const q = searchKeyword.trim().toLowerCase();
    return cohorts.filter(
      (c) =>
        c.generation.toLowerCase().includes(q) ||
        c.period.toLowerCase().includes(q) ||
        c.members.some((m) => m.name.toLowerCase().includes(q) || m.role.toLowerCase().includes(q))
    );
  }, [cohorts, searchKeyword]);

  // Find currently active cohort if selected
  const activeCohort = useMemo(() => {
    if (!selectedCohortKey) return null;
    return cohorts.find((c) => c.key === selectedCohortKey) || null;
  }, [cohorts, selectedCohortKey]);

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

      {/* Tab 3: Past Council Members (기수별 게시판 형태 & 선택 시 기수 전체 임원진 노출) */}
      {activeTab === 'alumni' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-indigo-50/90 via-blue-50/60 to-purple-50/70 border border-indigo-200/80 rounded-3xl p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <Award className="w-6 h-6 text-indigo-700 shrink-0" />
                <h3 className="font-bold text-indigo-950 text-lg">컴퓨터과학과 역대 학생회 임원진 게시판</h3>
              </div>
              <p className="text-sm sm:text-base text-indigo-900/90 leading-relaxed">
                광주전남 컴퓨터과학과를 이끌어 온 역대 학생회 기록입니다. 열람을 원하시는 기수(임기)를 선택하시면 해당 대수에 등록된 전체 임원진 명단과 사진을 확인하실 수 있습니다.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
              <span className="text-xs sm:text-sm font-bold px-3.5 py-1.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                총 {cohorts.length}개 기수 ({pastMembers.length}명의 임원)
              </span>
            </div>
          </div>

          {/* DETAIL VIEW: Specific Cohort Selected */}
          {activeCohort ? (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Back to list & Cohort Quick Selector Bar */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <button
                  onClick={() => setSelectedCohortKey(null)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-bold transition-colors w-fit"
                >
                  <ArrowLeft className="w-4 h-4" />
                  전체 기수 목록으로 돌아가기
                </button>

                {/* Cohort Switcher Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
                  <span className="text-xs font-semibold text-slate-500 mr-1 whitespace-nowrap">다른 기수 바로가기:</span>
                  {cohorts.map((c) => (
                    <button
                      key={c.key}
                      onClick={() => setSelectedCohortKey(c.key)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                        c.key === activeCohort.key
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80'
                      }`}
                    >
                      {c.generation} ({c.period})
                    </button>
                  ))}
                </div>
              </div>

              {/* Cohort Detail Header Card */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 font-extrabold text-xs sm:text-sm">
                        {activeCohort.generation}
                      </span>
                      <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs sm:text-sm flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        임기: {activeCohort.period}
                      </span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight font-knou">
                      {activeCohort.generation} 컴퓨터과학과 학생회 임원 명단
                    </h2>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="text-xs sm:text-sm text-slate-500 block">등록된 임원 수</span>
                    <span className="text-lg sm:text-xl font-extrabold text-indigo-600">
                      총 {activeCohort.members.length}명
                    </span>
                  </div>
                </div>

                {/* Visual Officer Cards Grid (사진 & 직책 & 성명) */}
                <div className="pt-2">
                  <h4 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-600" />
                    임원진 소개 카드 (총 {activeCohort.members.length}명)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
                    {activeCohort.members.map((member) => (
                      <div
                        key={member.id}
                        className={`bg-white rounded-2xl p-5 border transition-all flex flex-col items-center text-center ${
                          member.role === '학생회장'
                            ? 'border-purple-300 ring-2 ring-purple-100 shadow-sm'
                            : member.role.includes('부회장') || member.role.includes('부학생회장')
                            ? 'border-blue-200 hover:border-blue-300 shadow-xs'
                            : 'border-slate-200 hover:border-indigo-200 shadow-xs'
                        }`}
                      >
                        {/* Member Photo (사진이 없는 경우 공란 처리) */}
                        <div className="mb-3.5">
                          {member.photo_url ? (
                            <img
                              src={member.photo_url}
                              alt={member.name}
                              className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border border-slate-200 shadow-xs"
                            />
                          ) : (
                            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
                              <User className="w-8 h-8 opacity-30 mb-1" />
                              <span className="text-[11px] font-medium text-slate-400">사진 공란</span>
                            </div>
                          )}
                        </div>

                        {/* Role Badge */}
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold mb-2 ${
                            member.role === '학생회장'
                              ? 'bg-purple-100 text-purple-800 border border-purple-200'
                              : member.role.includes('부회장') || member.role.includes('부학생회장')
                              ? 'bg-blue-100 text-blue-800 border border-blue-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {member.role}
                        </span>

                        {/* Member Name */}
                        <h4 className="text-lg font-bold text-slate-900 tracking-tight">
                          {member.name}
                        </h4>

                        {/* Cohort & Period Tag */}
                        <p className="text-xs text-slate-500 mt-1 font-medium">
                          {member.generation} · {member.period}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tabular Officer List for Official Record */}
                <div className="pt-6 border-t border-slate-100 space-y-3">
                  <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-500" />
                    임원 명단 공식 기록표
                  </h4>
                  <div className="border border-slate-200 rounded-2xl overflow-hidden">
                    <table className="w-full text-left text-xs sm:text-sm border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                          <th className="py-3 px-4 w-16 text-center">순번</th>
                          <th className="py-3 px-4 w-32">직책명</th>
                          <th className="py-3 px-4 font-bold">성명</th>
                          <th className="py-3 px-4 w-28 text-center">기수</th>
                          <th className="py-3 px-4 w-32 text-center">임기</th>
                          <th className="py-3 px-4 w-24 text-center">사진 유무</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {activeCohort.members.map((m, idx) => (
                          <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-3 px-4 text-center text-slate-500 font-medium">
                              {idx + 1}
                            </td>
                            <td className="py-3 px-4 font-semibold">
                              <span
                                className={`px-2 py-0.5 rounded text-xs font-bold inline-block ${
                                  m.role === '학생회장'
                                    ? 'bg-purple-100 text-purple-800'
                                    : m.role.includes('부회장')
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                {m.role}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-bold text-slate-900 text-sm">
                              {m.name}
                            </td>
                            <td className="py-3 px-4 text-center text-indigo-700 font-semibold">
                              {m.generation}
                            </td>
                            <td className="py-3 px-4 text-center text-slate-600">
                              {m.period}
                            </td>
                            <td className="py-3 px-4 text-center">
                              {m.photo_url ? (
                                <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                  등록됨
                                </span>
                              ) : (
                                <span className="text-[11px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                                  공란
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Bottom Back Button */}
                <div className="pt-4 flex justify-between items-center border-t border-slate-100">
                  <button
                    onClick={() => setSelectedCohortKey(null)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-bold transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    전체 기수 목록으로 돌아가기
                  </button>
                  <p className="text-xs text-slate-400">
                    * 역대 임원 수정 및 등록은 관리자 센터(학생회장·최고관리자)에서 가능합니다.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* BOARD LIST VIEW: List of Cohorts (기수/임기연도별 게시글 목록) */
            <div className="space-y-6">
              {/* Search Bar & Instructions */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="text-xs sm:text-sm text-slate-600">
                  아래 게시판에서 <span className="font-bold text-indigo-700">기수 또는 임기연도를 선택</span>하시면 해당 대수의 전체 임원 명단이 상세히 노출됩니다.
                </div>
                <div className="relative min-w-[240px]">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    placeholder="기수, 임기, 임원 성명 검색..."
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Board Table */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs sm:text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                        <th className="py-3.5 px-4 w-16 text-center">번호</th>
                        <th className="py-3.5 px-4 w-24 text-center">기수</th>
                        <th className="py-3.5 px-4 w-28 text-center">임기연도</th>
                        <th className="py-3.5 px-4">게시글 제목 (임원진 명단)</th>
                        <th className="py-3.5 px-4 w-32 text-center">학생회장</th>
                        <th className="py-3.5 px-4 w-24 text-center">임원 수</th>
                        <th className="py-3.5 px-4 w-32 text-center">상세보기</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredCohorts.map((cohort, idx) => (
                        <tr
                          key={cohort.key}
                          onClick={() => setSelectedCohortKey(cohort.key)}
                          className="hover:bg-indigo-50/50 transition-colors cursor-pointer group"
                        >
                          {/* 1. 번호 */}
                          <td className="py-4 px-4 text-center text-slate-500 font-semibold">
                            {filteredCohorts.length - idx}
                          </td>

                          {/* 2. 기수 */}
                          <td className="py-4 px-4 text-center">
                            <span className="px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 font-extrabold text-xs border border-indigo-200 whitespace-nowrap">
                              {cohort.generation}
                            </span>
                          </td>

                          {/* 3. 임기연도 */}
                          <td className="py-4 px-4 text-center font-medium text-slate-600 whitespace-nowrap">
                            {cohort.period}
                          </td>

                          {/* 4. 게시글 제목 */}
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors text-sm sm:text-base">
                                {cohort.generation} 컴퓨터과학과 학생회 임원 명단
                              </span>
                              <span className="text-xs text-slate-400 font-normal hidden sm:inline">
                                ({cohort.period})
                              </span>
                            </div>
                            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 flex-wrap">
                              <span>주요 임원:</span>
                              {cohort.members.slice(0, 3).map((m) => (
                                <span key={m.id} className="text-slate-700 font-medium">
                                  {m.role} {m.name}
                                </span>
                              ))}
                              {cohort.members.length > 3 && (
                                <span className="text-slate-400">외 {cohort.members.length - 3}명</span>
                              )}
                            </div>
                          </td>

                          {/* 5. 당시 학생회장 */}
                          <td className="py-4 px-4 text-center">
                            {cohort.president ? (
                              <span className="px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 font-bold text-xs border border-purple-200">
                                {cohort.president.name}
                              </span>
                            ) : (
                              <span className="text-slate-400 text-xs">-</span>
                            )}
                          </td>

                          {/* 6. 임원 수 */}
                          <td className="py-4 px-4 text-center">
                            <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-bold text-xs">
                              {cohort.members.length}명
                            </span>
                          </td>

                          {/* 7. 상세보기 버튼 */}
                          <td className="py-4 px-4 text-center">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedCohortKey(cohort.key);
                              }}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-50 group-hover:bg-indigo-600 group-hover:text-white text-indigo-700 font-bold text-xs transition-colors shadow-2xs"
                            >
                              <span>임원 보기</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}

                      {filteredCohorts.length === 0 && (
                        <tr>
                          <td colSpan={7} className="py-16 text-center text-slate-500 font-medium">
                            <div className="flex flex-col items-center justify-center max-w-sm mx-auto space-y-2">
                              <Award className="w-10 h-10 text-slate-300 mb-1" />
                              <p className="text-base font-bold text-slate-700">등록된 역대 임원 정보가 없습니다.</p>
                              <p className="text-xs text-slate-400 leading-relaxed">
                                관리자 센터(학생회장·최고관리자)에서 기수 및 임원 정보를 등록하시면 실시간으로 이곳에 표시됩니다.
                              </p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Council Rules (학과 학생회칙 및 세칙 전문 - PDF 실 내용 100% 반영) */}
      {activeTab === 'rules' && (
        <OfficialConstitutionView />
      )}
    </div>
  );
};
