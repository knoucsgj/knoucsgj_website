import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { regionalInfo, councilIntro as defaultCouncilIntro } from '../data/mockCouncil';
import { api } from '../services/api';
import type { CouncilMember } from '../lib/types';
import {
  Users,
  MapPin,
  Phone,
  Mail,
  Shield,
  Heart,
  ExternalLink,
  Laptop,
  BookOpen,
  Sparkles,
  Navigation
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  const [members, setMembers] = useState<CouncilMember[]>([]);
  const [councilIntro, setCouncilIntro] = useState(defaultCouncilIntro);
  const [activeTab, setActiveTab] = useState<'greeting' | 'members' | 'campus' | 'directions'>('greeting');

  useEffect(() => {
    async function loadData() {
      const [membersData, introData] = await Promise.all([
        api.getCouncilMembers(),
        api.getCouncilIntro()
      ]);
      setMembers(membersData);
      setCouncilIntro(introData);
    }
    loadData();
  }, []);

  return (
    <div className="space-y-10">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-3xl p-8 sm:p-10 text-white shadow-lg">
        <div className="max-w-3xl">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/20 inline-block mb-3">
            제43대 컴퓨터과학과 학생회
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-3">
            학과 및 학생회 소개
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            한국방송통신대학교 광주전남지역대학 컴퓨터과학과 학생회는 학우 여러분의 보람찬 대학 생활과 성공적인 학위 취득을 위한 가장 가까운 길잡이가 되겠습니다.
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200 overflow-x-auto pb-px gap-2">
        <button
          onClick={() => setActiveTab('greeting')}
          className={`px-5 py-3 text-sm font-semibold rounded-t-xl transition-colors whitespace-nowrap flex items-center gap-2 ${
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
          className={`px-5 py-3 text-sm font-semibold rounded-t-xl transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'members'
              ? 'bg-white text-blue-700 border-t-2 border-x border-blue-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
          }`}
        >
          <Users className="w-4 h-4 text-blue-600" />
          학생회 임원진 소개
        </button>
        <button
          onClick={() => setActiveTab('campus')}
          className={`px-5 py-3 text-sm font-semibold rounded-t-xl transition-colors whitespace-nowrap flex items-center gap-2 ${
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
          className={`px-5 py-3 text-sm font-semibold rounded-t-xl transition-colors whitespace-nowrap flex items-center gap-2 ${
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
          <div className="border-l-4 border-blue-600 pl-4 py-1">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              {councilIntro.title}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              한국방송통신대학교 광주전남지역대학 컴퓨터과학과 제43대 학생회
            </p>
          </div>

          <div className="prose prose-slate max-w-none text-slate-700 text-sm sm:text-base leading-relaxed space-y-4 whitespace-pre-line font-normal">
            {councilIntro.president_greeting}
          </div>

          {/* Student Council Pledges Box */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-slate-100">
            <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-5">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center mb-3">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1">1. 든든한 학업 동반자</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                출석수업 자료 나눔, 과제물 가이드라인 및 수준별 스터디 그룹을 활성화하여 중도 포기 없이 전원 졸업을 지원합니다.
              </p>
            </div>

            <div className="bg-indigo-50/60 border border-indigo-100 rounded-2xl p-5">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center mb-3">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1">2. 따뜻한 교류의 장</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                현업 IT 선배 특강, 종강총회, 소그룹 모임을 통해 같은 고민을 나누는 소중한 개발자 동료 네트워크를 구축합니다.
              </p>
            </div>

            <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-3">
                  <Shield className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-1">3. 투명하고 정직한 운영</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  납부해주신 학생회비 내역을 1원 단위까지 분기별로 공개하고, 모든 학우의 의견을 경청하는 열린 학생회가 되겠습니다.
                </p>
              </div>
              <Link
                to="/governance"
                className="mt-3 inline-flex items-center text-xs font-semibold text-emerald-700 hover:text-emerald-800 underline"
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
              <h2 className="text-xl font-bold text-slate-900">제43대 학생회 임원진</h2>
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
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      {member.role}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">{member.grade_info}</span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-2">{member.name}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                    "{member.message}"
                  </p>
                </div>

                {member.email && (
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
                    <Mail className="w-3.5 h-3.5 text-blue-500" />
                    <span>{member.email}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Campus & Facilities */}
      {activeTab === 'campus' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
            <h2 className="text-xl font-bold text-slate-900 mb-2">광주전남지역대학 주요 시설</h2>
            <p className="text-sm text-slate-500 mb-6">
              컴퓨터과학과 학우들이 학습과 실습, 스터디를 위해 이용할 수 있는 지역대학 내 시설 안내입니다.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {regionalInfo.facilities.map((fac, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-blue-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                      {idx + 1}
                    </div>
                    <h3 className="font-bold text-slate-900 text-base">{fac.name}</h3>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed pl-12">
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
              <div>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-800">
                  본관
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-1">
                  {regionalInfo.center_name}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`https://map.naver.com/v5/search/${encodeURIComponent(regionalInfo.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                >
                  네이버 지도
                  <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href={`https://map.kakao.com/link/search/${encodeURIComponent(regionalInfo.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-400 text-slate-900 hover:bg-amber-500 transition-colors"
                >
                  카카오맵
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-slate-700">
              <div className="space-y-3">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block text-slate-900">도로명 주소</span>
                    <span>{regionalInfo.address}</span>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Phone className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block text-slate-900">대표 전화</span>
                    <span>전화: {regionalInfo.tel} / 팩스: {regionalInfo.fax}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 text-xs text-slate-600 space-y-2">
                <div className="font-bold text-blue-900 flex items-center gap-1.5">
                  <Navigation className="w-4 h-4 text-blue-700" />
                  대중교통 이용 안내
                </div>
                <p>
                  • 시내버스 : 첨단09, 첨단20, 첨단40, 문흥39 등 (광주방송통신대 정류장 하차)
                </p>
                <p>
                  • 지하철 이용 시 : 광주지하철 1호선 상무역 또는 광주송정역에서 버스 환승
                </p>
                <p>
                  • 자가용 이용 시 : 지상 및 지하 무료 주차 가능 (주말 출석수업 시 혼잡할 수 있습니다)
                </p>
              </div>
            </div>
          </div>

          {/* Sub-center 학습관 List */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
            <h3 className="text-lg font-bold text-slate-900 mb-2">전남 관할 시·군 학습관</h3>
            <p className="text-xs sm:text-sm text-slate-500 mb-5">
              광주 본관 외에도 각 지역 학습관에서 시험 응시 및 강의실 이용이 가능합니다.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {regionalInfo.sub_centers.map((center, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/40 hover:bg-blue-50/40 transition-colors"
                >
                  <span className="font-bold text-sm text-slate-900 block mb-1">
                    {center.name}
                  </span>
                  <p className="text-xs text-slate-500 mb-2 leading-relaxed">{center.address}</p>
                  <p className="text-xs font-semibold text-blue-700 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" />
                    {center.tel}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
