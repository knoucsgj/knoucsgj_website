import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { auth } from '../services/auth';
import type { StudyGroup } from '../lib/types';
import {
  Users,
  PlusCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Laptop,
  MessageCircle,
  Sparkles,
  X,
  Filter,
  Shield,
  ArrowRight
} from 'lucide-react';

export const CommunityPage: React.FC = () => {
  const [studies, setStudies] = useState<StudyGroup[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('전체');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedStudy, setSelectedStudy] = useState<StudyGroup | null>(null);

  // Study registration modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newStudyTitle, setNewStudyTitle] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newMeetingType, setNewMeetingType] = useState<'온라인 (Zoom/Discord)' | '오프라인 (광주지역대학)' | '온/오프라인 병행'>('온/오프라인 병행');
  const [newMaxMembers, setNewMaxMembers] = useState(8);
  const [newLeader, setNewLeader] = useState('');
  const [newLeaderContact, setNewLeaderContact] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdmin = auth.isAdmin();

  useEffect(() => {
    loadStudies();
  }, []);

  const loadStudies = async () => {
    const data = await api.getStudies();
    setStudies(data);
  };

  const faqs = [
    {
      q: '직장인이라 평일이나 주말 낮 출석수업 참여가 어렵습니다. 대체시험은 어떻게 신청하나요?',
      a: '출석수업 과목은 지정된 기간(보통 학기 초 수강신청 변경 기간 및 출석수업 유형변경 신청 기간)에 U-KNOU 홈페이지 [학사정보 > 수업/시험 > 출석수업유형변경] 메뉴에서 "대체시험"으로 변경하실 수 있습니다. 대체시험으로 변경 시 주말 기말시험 기간에 객관식 또는 온라인 시험으로 평가를 대체하게 됩니다.'
    },
    {
      q: '중간과제물 작성 시 카피킬러(표절 검사)는 어떻게 확인하나요?',
      a: '한국방송통신대학교 중앙도서관 홈페이지 로그인 후 [연구·학습지원 > 카피킬러 캠퍼스]를 통해 무료로 표절 검사를 받아보실 수 있습니다. 통상 15%~20% 이하의 표절율을 권장하며, 인용 코드나 레퍼런스는 주석으로 명확히 출처를 기재하셔야 불이익을 피할 수 있습니다.'
    },
    {
      q: '광주전남지역대학 전산실습실 PC는 언제 자유롭게 이용할 수 있나요?',
      a: '광주지역대학 본관 3층 302호 전산실습실은 출석수업이 없는 평일 주간 및 주말 자율학습 시간에 개방됩니다. 개인 노트북 지참 시에는 2층 전자열람실이나 각 층 스터디룸도 쾌적하게 이용하실 수 있습니다.'
    },
    {
      q: '비전공자 신·편입생인데 어떤 스터디부터 참여하는 것이 좋은가요?',
      a: '1학년 개설과목인 [C프로그래밍], [파이썬프로그래밍] 튜터링 스터디나 2학년 [자료구조] 기초 스터디를 적극 추천해 드립니다. 학생회 학술부에서 운영하는 신입생 멘토링 방에 입장하시면 선배 학우들이 친절히 조언해 드립니다.'
    },
    {
      q: '학생회비는 어떻게 쓰이며 결산 내역을 어디서 볼 수 있나요?',
      a: '학생회비는 IT 실무 세미나 개최, 시험 기간 응원 간식, 전산실습실 비품 및 소모품 지원, 신입생 오리엔테이션, 총회 다과 등에 사용됩니다. 매 분기별로 결산 영수증 및 집행 내역을 공지사항 게시판에 투명하게 공개하고 있습니다.'
    }
  ];

  const handleApplyClick = (study: StudyGroup) => {
    setSelectedStudy(study);
    setIsApplyModalOpen(true);
  };

  const handleCreateStudy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudyTitle.trim() || !newSubject.trim()) {
      alert('스터디 제목과 주제를 입력해주세요.');
      return;
    }

    try {
      setIsSubmitting(true);
      await api.createStudy({
        title: newStudyTitle.trim(),
        subject: newSubject.trim(),
        status: '모집중',
        members_count: 1,
        max_members: newMaxMembers,
        target_grade: '전학년',
        meeting_type: newMeetingType,
        leader: newLeader.trim() || '익명 학우',
        leader_contact: newLeaderContact.trim(),
        description: newDescription.trim()
      });

      await loadStudies();
      setIsCreateModalOpen(false);
      setNewStudyTitle('');
      setNewSubject('');
      setNewLeader('');
      setNewLeaderContact('');
      setNewDescription('');
      alert('새 스터디 그룹이 성공적으로 등록되었습니다!');
    } catch (err) {
      console.error(err);
      alert('스터디 등록 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter studies by status
  const filteredStudies = studies.filter((s) => {
    if (selectedStatus === '전체') return true;
    if (selectedStatus === '마감·종료') return s.status === '마감' || s.status === '종료';
    return s.status === selectedStatus;
  });

  const statusOptions = ['전체', '모집중', '진행중', '마감·종료'];

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-3xl p-8 sm:p-10 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/20 inline-block mb-3">
            함께 성장하는 배움터
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-2">
            스터디 & 커뮤니티
          </h1>
          <p className="text-slate-300 text-sm max-w-xl leading-relaxed">
            혼자 공부하면 어렵지만 함께하면 끝까지 해낼 수 있습니다.
            온·오프라인 스터디 그룹에 참여하거나 직접 모집해 보세요.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm transition-all shadow-md active:scale-95 self-start md:self-center"
        >
          <PlusCircle className="w-4 h-4" />
          스터디 개설 신청
        </button>
      </div>

      {/* Admin Notice Pill (if logged in) */}
      {isAdmin && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-600" />
            <span className="font-semibold">관리자 접속 중:</span>
            <span>스터디 상태 변경(모집중/진행중/마감) 및 삭제(해체)는 관리자 센터에서 바로 가능합니다.</span>
          </div>
          <Link
            to="/admin"
            className="font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1"
          >
            관리자 센터
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Study Groups Section */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">스터디 그룹 목록</h2>
            <p className="text-xs sm:text-sm text-slate-500">
              학기별로 개설되고 활동하는 스터디 소그룹입니다.
            </p>
          </div>

          {/* Status Filter Pills */}
          <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400 ml-1 hidden sm:inline" />
            {statusOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => setSelectedStatus(opt)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedStatus === opt
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {filteredStudies.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-slate-200 text-slate-400 text-sm">
            해당 조건의 스터디 그룹이 없습니다.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredStudies.map((study) => (
              <div
                key={study.id}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        study.status === '모집중'
                          ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                          : study.status === '진행중'
                          ? 'bg-blue-100 text-blue-700 border border-blue-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {study.status}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      인원: {study.members_count} / {study.max_members}명
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1">
                    {study.title}
                  </h3>

                  <p className="text-xs text-blue-600 font-medium mb-3">
                    주제: {study.subject}
                  </p>

                  <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100 mb-4">
                    <div className="flex items-center gap-2">
                      <Laptop className="w-3.5 h-3.5 text-slate-400" />
                      <span>진행 방식: {study.meeting_type}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>대상 학년: {study.target_grade}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-slate-400" />
                      <span>개설자: {study.leader}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleApplyClick(study)}
                  disabled={study.status === '종료' || study.status === '마감'}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                    study.status === '종료' || study.status === '마감'
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : 'bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700'
                  }`}
                >
                  <MessageCircle className="w-4 h-4" />
                  {study.status === '종료' || study.status === '마감' ? '모집 마감된 스터디' : '스터디 참여 문의'}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* FAQ Section */}
      <section className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
          <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">자주 묻는 질문 (FAQ)</h2>
            <p className="text-xs text-slate-500">신·편입생 및 재학생 학우들이 가장 많이 문의하시는 내용입니다.</p>
          </div>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="border border-slate-200 rounded-2xl overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                >
                  <span className="font-bold text-sm sm:text-base text-slate-900">
                    Q. {faq.q}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-blue-600 shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="p-4 sm:p-5 bg-white text-xs sm:text-sm text-slate-700 leading-relaxed border-t border-slate-100 whitespace-pre-line animate-in fade-in duration-150">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Apply Info Modal */}
      {isApplyModalOpen && selectedStudy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 p-6 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-base text-slate-900">스터디 참여 문의</h3>
              <button
                onClick={() => setIsApplyModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              선택하신 <span className="font-bold text-blue-600">[{selectedStudy.title}]</span> 스터디에 참여를 희망하시나요?
            </p>

            <div className="bg-blue-50 p-4 rounded-2xl text-xs text-blue-900 space-y-2 mb-4 border border-blue-100">
              <p className="font-semibold text-blue-950">참여 방법 안내:</p>
              {selectedStudy.leader_contact ? (
                <div>
                  <span className="font-medium text-slate-700">개설자 직접 연락처:</span>
                  <p className="font-bold text-blue-700 mt-0.5 break-all">{selectedStudy.leader_contact}</p>
                </div>
              ) : null}
              <p>1. 광주전남 컴퓨터과학과 학생회 오픈카톡방 또는 학술부장(academic@knou-cs-gj.org)에게 학번과 성함을 알려주세요.</p>
              <p>2. 스터디 리더({selectedStudy.leader})에게 전달 후 스터디 모임 단톡방 및 온라인 회의 링크를 전달해 드립니다.</p>
            </div>

            <button
              onClick={() => setIsApplyModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors"
            >
              확인 완료
            </button>
          </div>
        </div>
      )}

      {/* Create Study Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 p-6 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-base text-slate-900">새 스터디 그룹 개설 신청</h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStudy} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">스터디 명칭</label>
                <input
                  type="text"
                  required
                  value={newStudyTitle}
                  onChange={(e) => setNewStudyTitle(e.target.value)}
                  placeholder="예: 2학기 자료구조 스터디반"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">주요 학습 주제/교과목</label>
                <input
                  type="text"
                  required
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="예: 자료구조, 백준 알고리즘"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">진행 방식</label>
                <select
                  value={newMeetingType}
                  onChange={(e) => setNewMeetingType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="온/오프라인 병행">온/오프라인 병행</option>
                  <option value="온라인 (Zoom/Discord)">온라인 (Zoom/Discord)</option>
                  <option value="오프라인 (광주지역대학)">오프라인 (광주지역대학)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">모집 정원 (명)</label>
                <input
                  type="number"
                  min={2}
                  max={20}
                  value={newMaxMembers}
                  onChange={(e) => setNewMaxMembers(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">개설자 성명 (학년)</label>
                  <input
                    type="text"
                    required
                    value={newLeader}
                    onChange={(e) => setNewLeader(e.target.value)}
                    placeholder="예: 홍길동 (3학년)"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">연락처 / 카톡 링크</label>
                  <input
                    type="text"
                    value={newLeaderContact}
                    onChange={(e) => setNewLeaderContact(e.target.value)}
                    placeholder="오픈카톡 링크 등"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">소개 / 목표 (선택)</label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="스터디 진행 계획 및 목표..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-semibold"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? '등록 중...' : '개설 등록'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
