import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { auth } from '../services/auth';
import type { StudyGroup, FeedbackItem, FeedbackReply } from '../lib/types';
import { ASSETS } from '../lib/assets';
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
  ArrowRight,
  MessageSquare,
  Send,
  AlertCircle
} from 'lucide-react';

export const CommunityPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'study' | 'feedback' | 'faq'>('study');
  const [studies, setStudies] = useState<StudyGroup[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('전체');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedStudy, setSelectedStudy] = useState<StudyGroup | null>(null);

  // 건의함 State
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [feedbackCategoryFilter, setFeedbackCategoryFilter] = useState<string>('전체');
  const [openFeedbackId, setOpenFeedbackId] = useState<string | null>('fb-1');
  const [isWriteFeedbackModalOpen, setIsWriteFeedbackModalOpen] = useState(false);
  const [feedbackTitle, setFeedbackTitle] = useState('');
  const [feedbackCategory, setFeedbackCategory] = useState<'학사/수업' | '행사/스터디' | '학생회운영' | '기타'>('학사/수업');
  const [feedbackAuthor, setFeedbackAuthor] = useState('');
  const [feedbackContent, setFeedbackContent] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  // 관리자 댓글 작성 State
  const [replyInputMap, setReplyInputMap] = useState<Record<string, string>>({});
  const [replyAuthorMap, setReplyAuthorMap] = useState<Record<string, string>>({});

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
    loadFeedbacks();
  }, []);

  const loadStudies = async () => {
    const data = await api.getStudies();
    setStudies(data);
  };

  const loadFeedbacks = async () => {
    const data = await api.getFeedbacks();
    setFeedbacks(data);
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackTitle.trim() || !feedbackContent.trim()) {
      alert('제목과 내용을 입력해 주세요.');
      return;
    }
    try {
      setIsSubmittingFeedback(true);
      await api.createFeedback({
        title: feedbackTitle.trim(),
        content: feedbackContent.trim(),
        category: feedbackCategory,
        author: feedbackAuthor.trim() || '익명 학우'
      });
      await loadFeedbacks();
      setIsWriteFeedbackModalOpen(false);
      setFeedbackTitle('');
      setFeedbackContent('');
      setFeedbackAuthor('');
      alert('건의사항이 등록되었습니다. 학생회가 확인 후 댓글로 정성껏 답변드리겠습니다!');
    } catch (err) {
      console.error(err);
      alert('건의 등록 중 오류가 발생했습니다.');
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const handleAddReply = async (feedbackId: string) => {
    const replyText = replyInputMap[feedbackId]?.trim();
    if (!replyText) {
      alert('답변 내용을 입력해 주세요.');
      return;
    }
    const replyAuthor = replyAuthorMap[feedbackId]?.trim() || '학생회';
    try {
      await api.addFeedbackReply(feedbackId, {
        author: replyAuthor,
        content: replyText
      });
      setReplyInputMap((prev) => ({ ...prev, [feedbackId]: '' }));
      await loadFeedbacks();
      alert('답변 댓글이 성공적으로 등록되었습니다!');
    } catch (err) {
      console.error(err);
      alert('댓글 등록에 실패했습니다.');
    }
  };

  const handleDeleteFeedback = async (id: string) => {
    if (!window.confirm('이 건의글을 삭제하시겠습니까?')) return;
    await api.deleteFeedback(id);
    await loadFeedbacks();
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
      a: '학생회비는 IT 실무 세미나 개최, 시험 기간 응원 간식, 비품 및 실습 교재 구비, 신입생 오리엔테이션, 종강총회 등에 소중하게 사용됩니다. 홈페이지 상단 [투명재정·자치] 메뉴에서 분기별 수입/지출 결산 보고서와 세부 집행 장부를 100% 투명하게 확인하실 수 있습니다.'
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
    <div className="space-y-10">
      {/* Clean Editorial Page Header */}
      <div className="border-b border-slate-200 pb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4 sm:gap-5">
          <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-22 md:h-22 rounded-2xl bg-blue-50/70 border border-blue-100 p-1.5 shrink-0 flex items-center justify-center shadow-xs">
            <img
              src={ASSETS.characters.study}
              alt="커뮤니티 마스코트"
              className="w-full h-full object-contain drop-shadow-xs"
            />
          </div>
          <div>
            <div className="flex items-center gap-2 text-[11px] font-semibold text-blue-700 tracking-wider uppercase mb-1">
              <span>Student Community & Academic Groups</span>
            </div>
            <h1 className="font-knou text-2xl sm:text-3xl md:text-4xl font-bold text-slate-950 tracking-tight mb-2">
              커뮤니티
            </h1>
            <p className="text-slate-700 text-sm sm:text-base max-w-xl leading-relaxed font-normal">
              학우 간의 온·오프라인 스터디 소그룹 활동과 학생회를 향한 열린 건의 및 소통, 학업 FAQ를 한곳에서 지원합니다.
            </p>
          </div>
        </div>

        {activeTab === 'study' && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm transition-colors shrink-0 self-start sm:self-auto shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            스터디 개설 신청
          </button>
        )}

        {activeTab === 'feedback' && (
          <button
            onClick={() => setIsWriteFeedbackModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm transition-colors shrink-0 self-start sm:self-auto shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            새 건의사항 작성
          </button>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-1">
        <button
          onClick={() => setActiveTab('study')}
          className={`px-5 py-3.5 text-sm sm:text-base font-bold rounded-t-xl transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'study'
              ? 'bg-white text-blue-700 border-t-2 border-x border-blue-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
          }`}
        >
          <Users className="w-4.5 h-4.5 text-blue-600" />
          학술 & 스터디 ({studies.length})
        </button>
        <button
          onClick={() => setActiveTab('feedback')}
          className={`px-5 py-3.5 text-sm sm:text-base font-bold rounded-t-xl transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'feedback'
              ? 'bg-white text-blue-700 border-t-2 border-x border-blue-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
          }`}
        >
          <MessageSquare className="w-4.5 h-4.5 text-indigo-600" />
          학우 소통 & 열린 건의함
        </button>
        <button
          onClick={() => setActiveTab('faq')}
          className={`px-5 py-3.5 text-sm sm:text-base font-bold rounded-t-xl transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'faq'
              ? 'bg-white text-blue-700 border-t-2 border-x border-blue-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
          }`}
        >
          <HelpCircle className="w-4.5 h-4.5 text-emerald-600" />
          자주 묻는 질문 (FAQ)
        </button>
      </div>

      {/* TAB 1: Study Groups Section */}
      {activeTab === 'study' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Admin Notice Pill (if logged in) */}
          {isAdmin && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm text-amber-950 font-medium">
              <div className="flex items-center gap-2.5">
                <Shield className="w-5 h-5 text-amber-600 shrink-0" />
                <span className="font-bold">관리자 접속 중:</span>
                <span>스터디 상태 변경(모집중/진행중/마감) 및 삭제(해체)는 관리자 센터에서 바로 가능합니다.</span>
              </div>
              <Link
                to="/admin"
                className="font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1.5 shrink-0"
              >
                관리자 센터
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">스터디 그룹 목록</h2>
              <p className="text-sm sm:text-base text-slate-600 mt-0.5">
                학기별로 개설되고 활동하는 스터디 소그룹입니다.
              </p>
            </div>

            {/* Status Filter Pills */}
            <div className="flex items-center gap-1.5 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs">
              <Filter className="w-4 h-4 text-slate-400 ml-1.5 hidden sm:inline" />
              {statusOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setSelectedStatus(opt)}
                  className={`px-3.5 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                    selectedStatus === opt
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {filteredStudies.length === 0 ? (
            <div className="bg-white rounded-3xl p-16 text-center border border-slate-200 text-slate-500 text-base font-medium">
              해당 조건의 스터디 그룹이 없습니다.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredStudies.map((study) => (
                <div
                  key={study.id}
                  className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3.5">
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full ${
                          study.status === '모집중'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : study.status === '진행중'
                            ? 'bg-blue-100 text-blue-800 border border-blue-300'
                            : 'bg-slate-100 text-slate-700 border border-slate-300'
                        }`}
                      >
                        {study.status}
                      </span>
                      <span className="text-sm text-slate-600 font-bold">
                        인원: {study.members_count} / {study.max_members}명
                      </span>
                    </div>

                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-1.5 leading-snug">
                      {study.title}
                    </h3>

                    <p className="text-sm font-bold text-blue-700 mb-3.5">
                      주제: {study.subject}
                    </p>

                    <div className="space-y-2 text-sm text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-5">
                      <div className="flex items-center gap-2.5">
                        <Laptop className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>진행 방식: <strong className="text-slate-900">{study.meeting_type}</strong></span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <Users className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>대상 학년: <strong className="text-slate-900">{study.target_grade}</strong></span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <Sparkles className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>개설자: <strong className="text-slate-900">{study.leader}</strong></span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleApplyClick(study)}
                    disabled={study.status === '종료' || study.status === '마감'}
                    className={`w-full py-3 px-5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                      study.status === '종료' || study.status === '마감'
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                    }`}
                  >
                    <MessageCircle className="w-4.5 h-4.5" />
                    {study.status === '종료' || study.status === '마감' ? '모집 마감된 스터디' : '스터디 참여 문의'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Feedback & Suggestion Board (게시판 방식 + 관리자 댓글) */}
      {activeTab === 'feedback' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Header Banner */}
          <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-3xl p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <MessageSquare className="w-6 h-6 text-indigo-700" />
                <h3 className="font-bold text-indigo-950 text-lg">열린 건의함 & 소통 게시판</h3>
              </div>
              <p className="text-sm sm:text-base text-indigo-900 leading-relaxed">
                출석수업, 학사 일정, 스터디 지원 등 학생회에 전하고 싶은 의견을 자유롭게 남겨주세요. 임원진이 직접 댓글로 성실히 답변드립니다.
              </p>
            </div>
            <button
              onClick={() => setIsWriteFeedbackModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shrink-0 self-start sm:self-center shadow-xs transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              건의사항 작성하기
            </button>
          </div>

          {/* Admin Notice Pill (if logged in) */}
          {isAdmin && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-3 text-sm text-blue-950 font-medium">
              <div className="flex items-center gap-2.5">
                <Shield className="w-5 h-5 text-blue-600 shrink-0" />
                <span>
                  <strong className="text-blue-900">학생회 관리자 모드:</strong> 각 건의글을 클릭하여 하단 댓글창에서 공식 답변 댓글을 작성하거나 글을 삭제할 수 있습니다.
                </span>
              </div>
            </div>
          )}

          {/* Category Filter Pills */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <Filter className="w-4 h-4 text-slate-400 mr-1 hidden sm:inline" />
              {['전체', '학사/수업', '행사/스터디', '학생회운영', '기타'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFeedbackCategoryFilter(cat)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                    feedbackCategoryFilter === cat
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <span className="text-xs sm:text-sm text-slate-500 font-medium">
              총 <strong className="text-slate-900 font-bold">{feedbacks.length}</strong>건의 소통
            </span>
          </div>

          {/* Feedback Board List */}
          {feedbacks.length === 0 ? (
            <div className="bg-white rounded-3xl p-16 text-center border border-slate-200 text-slate-500 text-base font-medium">
              등록된 건의사항이 없습니다. 첫 번째 건의를 남겨보세요!
            </div>
          ) : (
            <div className="space-y-4">
              {feedbacks
                .filter((fb) => feedbackCategoryFilter === '전체' || fb.category === feedbackCategoryFilter)
                .map((fb) => {
                  const isOpen = openFeedbackId === fb.id;
                  const hasReplies = fb.replies && fb.replies.length > 0;
                  return (
                    <div
                      key={fb.id}
                      className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden transition-all"
                    >
                      {/* Header Item */}
                      <div
                        onClick={() => setOpenFeedbackId(isOpen ? null : fb.id)}
                        className="p-5 sm:p-6 cursor-pointer hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-2 flex-1 pr-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                                hasReplies
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : 'bg-amber-50 text-amber-800 border-amber-200'
                              }`}
                            >
                              {hasReplies ? '✓ 답변완료' : '⏳ 접수완료'}
                            </span>
                            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                              {fb.category}
                            </span>
                            <span className="text-xs text-slate-400 font-medium sm:hidden ml-auto">
                              {fb.created_at}
                            </span>
                          </div>

                          <h3 className="text-base sm:text-lg font-bold text-slate-900 hover:text-indigo-600 transition-colors leading-snug">
                            {fb.title}
                          </h3>

                          <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-500 font-medium">
                            <span>작성자: {fb.author}</span>
                            <span>•</span>
                            <span className="hidden sm:inline">등록일: {fb.created_at}</span>
                            <span>•</span>
                            <span className="text-indigo-600 font-bold">
                              답변 {fb.replies ? fb.replies.length : 0}개
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                          {isAdmin && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteFeedback(fb.id);
                              }}
                              className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors text-xs font-semibold"
                              title="건의글 삭제"
                            >
                              삭제
                            </button>
                          )}
                          <div className="p-2 rounded-xl bg-slate-100 text-slate-600">
                            {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                          </div>
                        </div>
                      </div>

                      {/* Collapsible Content & Reply Section */}
                      {isOpen && (
                        <div className="border-t border-slate-100 p-6 sm:p-8 bg-slate-50/40 space-y-6">
                          {/* Main Question Content */}
                          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
                            <span className="text-xs font-bold text-slate-500 tracking-wider uppercase">
                              건의 상세 내용
                            </span>
                            <p className="text-slate-800 text-sm sm:text-base leading-relaxed whitespace-pre-line font-normal">
                              {fb.content}
                            </p>
                          </div>

                          {/* Replies List */}
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <MessageSquare className="w-4 h-4 text-indigo-600" />
                              <h4 className="text-sm font-bold text-slate-900">
                                학생회 공식 답변 ({fb.replies ? fb.replies.length : 0})
                              </h4>
                            </div>

                            {(!fb.replies || fb.replies.length === 0) ? (
                              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/70 text-amber-900 text-xs sm:text-sm">
                                💬 학생회 임원진이 건의사항을 확인 중입니다. 곧 성실한 답변 댓글이 등록될 예정입니다.
                              </div>
                            ) : (
                              fb.replies.map((reply: FeedbackReply) => (
                                <div
                                  key={reply.id}
                                  className="bg-indigo-50/80 border border-indigo-200/80 rounded-2xl p-5 sm:p-6 space-y-2.5 text-indigo-950"
                                >
                                  <div className="flex items-center justify-between pb-2 border-b border-indigo-200/50">
                                    <div className="flex items-center gap-2">
                                      <span className="px-2.5 py-0.5 rounded-md bg-indigo-600 text-white font-bold text-xs">
                                        학생회 공식 답변
                                      </span>
                                      <span className="font-bold text-sm text-indigo-950">
                                        {reply.author}
                                      </span>
                                    </div>
                                    <span className="text-xs text-indigo-700 font-medium">
                                      {reply.created_at}
                                    </span>
                                  </div>
                                  <p className="text-sm sm:text-base leading-relaxed text-indigo-950 whitespace-pre-line font-normal">
                                    {reply.content}
                                  </p>
                                </div>
                              ))
                            )}
                          </div>

                          {/* Reply Form for Admin */}
                          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                <MessageCircle className="w-4 h-4 text-indigo-600" />
                                {isAdmin ? '관리자 공식 답변 댓글 달기' : '학생회 답변 작성 (임원 전용)'}
                              </span>
                              {!isAdmin && (
                                <Link
                                  to="/admin"
                                  className="text-xs text-indigo-600 hover:underline font-semibold"
                                >
                                  임원 관리자 로그인 →
                                </Link>
                              )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                              <input
                                type="text"
                                placeholder="작성자 (예: 학생회장, 학술부장)"
                                value={replyAuthorMap[fb.id] || ''}
                                onChange={(e) =>
                                  setReplyAuthorMap((prev) => ({ ...prev, [fb.id]: e.target.value }))
                                }
                                className="sm:col-span-1 px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500"
                              />
                              <input
                                type="text"
                                placeholder="답변 내용을 입력해 주세요..."
                                value={replyInputMap[fb.id] || ''}
                                onChange={(e) =>
                                  setReplyInputMap((prev) => ({ ...prev, [fb.id]: e.target.value }))
                                }
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleAddReply(fb.id);
                                  }
                                }}
                                className="sm:col-span-2 px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500"
                              />
                              <button
                                onClick={() => handleAddReply(fb.id)}
                                className="sm:col-span-1 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                              >
                                <Send className="w-3.5 h-3.5" />
                                답변 등록
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* Write Feedback Modal */}
      {isWriteFeedbackModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 p-6 sm:p-8 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg text-slate-900">새 건의사항 작성</h3>
                  <p className="text-xs text-slate-500">학생회에 건의할 내용을 작성해 주세요.</p>
                </div>
              </div>
              <button
                onClick={() => setIsWriteFeedbackModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFeedbackSubmit} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">분류</label>
                  <select
                    value={feedbackCategory}
                    onChange={(e) => setFeedbackCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="학사/수업">학사 일정 & 출석수업 문의</option>
                    <option value="행사/스터디">학과 행사 & 스터디 지원</option>
                    <option value="학생회운영">학생회 운영 건의</option>
                    <option value="기타">기타 자유 제안</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">작성자 (익명 가능)</label>
                  <input
                    type="text"
                    value={feedbackAuthor}
                    onChange={(e) => setFeedbackAuthor(e.target.value)}
                    placeholder="예: 2학년 재학생 (익명)"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">제목 *</label>
                <input
                  type="text"
                  required
                  value={feedbackTitle}
                  onChange={(e) => setFeedbackTitle(e.target.value)}
                  placeholder="건의사항 제목을 간결히 입력해 주세요"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">상세 내용 *</label>
                <textarea
                  required
                  rows={5}
                  value={feedbackContent}
                  onChange={(e) => setFeedbackContent(e.target.value)}
                  placeholder="건의하고 싶으신 상세 내용을 적어주세요. 학생회 임원진이 확인 후 답변 댓글을 달아드립니다."
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                />
              </div>

              <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-600 flex items-center gap-2 border border-slate-200">
                <AlertCircle className="w-4 h-4 text-slate-400 shrink-0" />
                <span>등록된 글은 게시판에 공개되며, 학생회 임원진이 검토 후 댓글로 답변합니다.</span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsWriteFeedbackModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingFeedback}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition-colors shadow-xs disabled:opacity-50"
                >
                  {isSubmittingFeedback ? '등록 중...' : '건의사항 등록'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 3: FAQ Section */}
      {activeTab === 'faq' && (
        <section className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-xs space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">자주 묻는 질문 (FAQ)</h2>
              <p className="text-sm text-slate-600 mt-0.5">신·편입생 및 재학생 학우들이 가장 많이 문의하시는 내용입니다.</p>
            </div>
          </div>

          <div className="space-y-3.5">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="border border-slate-200 rounded-2xl overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-4.5 sm:p-5.5 text-left flex items-center justify-between gap-4 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                  >
                    <span className="font-bold text-base sm:text-lg text-slate-900 leading-snug">
                      Q. {faq.q}
                    </span>
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-blue-600 shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="p-5 sm:p-6 bg-white text-sm sm:text-base text-slate-700 leading-relaxed border-t border-slate-100 whitespace-pre-line animate-in fade-in duration-150">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Apply Info Modal */}
      {isApplyModalOpen && selectedStudy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 p-6 sm:p-7 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-lg text-slate-900">스터디 참여 문의</h3>
              <button
                onClick={() => setIsApplyModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm sm:text-base text-slate-700 mb-4 leading-relaxed">
              선택하신 <span className="font-bold text-blue-700">[{selectedStudy.title}]</span> 스터디에 참여를 희망하시나요?
            </p>

            <div className="bg-blue-50 p-5 rounded-2xl text-sm text-blue-950 space-y-2.5 mb-5 border border-blue-100 leading-relaxed">
              <p className="font-bold text-blue-950 text-base">참여 방법 안내:</p>
              {selectedStudy.leader_contact ? (
                <div className="bg-white p-3 rounded-xl border border-blue-200">
                  <span className="font-semibold text-slate-700">개설자 직접 연락처:</span>
                  <p className="font-bold text-blue-700 mt-1 text-base break-all">{selectedStudy.leader_contact}</p>
                </div>
              ) : null}
              <p>1. 광주전남 컴퓨터과학과 학생회 오픈카톡방 또는 학술부장에게 학번과 성함을 알려주세요.</p>
              <p>2. 스터디 리더({selectedStudy.leader})에게 전달 후 스터디 모임 단톡방 및 온라인 회의 링크를 전달해 드립니다.</p>
            </div>

            <button
              onClick={() => setIsApplyModalOpen(false)}
              className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm sm:text-base transition-colors"
            >
              확인 완료
            </button>
          </div>
        </div>
      )}

      {/* Create Study Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 p-6 sm:p-7 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-lg text-slate-900">새 스터디 그룹 개설 신청</h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStudy} className="space-y-4 text-sm">
              <div>
                <label className="block font-bold text-slate-800 mb-1.5">스터디 명칭</label>
                <input
                  type="text"
                  required
                  value={newStudyTitle}
                  onChange={(e) => setNewStudyTitle(e.target.value)}
                  placeholder="예: 2학기 자료구조 스터디반"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1.5">주요 학습 주제/교과목</label>
                <input
                  type="text"
                  required
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="예: 자료구조, 백준 알고리즘"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1.5">진행 방식</label>
                <select
                  value={newMeetingType}
                  onChange={(e) => setNewMeetingType(e.target.value as any)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="온/오프라인 병행">온/오프라인 병행</option>
                  <option value="온라인 (Zoom/Discord)">온라인 (Zoom/Discord)</option>
                  <option value="오프라인 (광주지역대학)">오프라인 (광주지역대학)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1.5">모집 정원 (명)</label>
                <input
                  type="number"
                  min={2}
                  max={20}
                  value={newMaxMembers}
                  onChange={(e) => setNewMaxMembers(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1.5">개설자 성명 (학년)</label>
                  <input
                    type="text"
                    required
                    value={newLeader}
                    onChange={(e) => setNewLeader(e.target.value)}
                    placeholder="예: 홍길동 (3학년)"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1.5">연락처 / 카톡 링크</label>
                  <input
                    type="text"
                    value={newLeaderContact}
                    onChange={(e) => setNewLeaderContact(e.target.value)}
                    placeholder="오픈카톡 링크 등"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1.5">소개 / 목표 (선택)</label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="스터디 진행 계획 및 목표..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-3.5 border-t border-slate-100 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 disabled:opacity-50"
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
