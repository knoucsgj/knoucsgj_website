import React, { useState, useEffect } from 'react';
import { showConfirm } from '../components/ui/GlobalDialog';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../services/auth';
import { useRequireLogin } from '../lib/useRequireLogin';
import type { FeedbackItem, FeedbackReply, FreePost } from '../lib/types';
import { ASSETS } from '../lib/assets';
import {
  MessageSquare,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  PlusCircle,
  Filter,
  Shield,
  Send,
  AlertCircle,
  X,
  MessageCircle,
  Eye
} from 'lucide-react';

export const CommunityPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'free' | 'feedback' | 'faq'>('free');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // ==========================================
  // 자유게시판 State
  // ==========================================
  const [freePosts, setFreePosts] = useState<FreePost[]>([]);
  const [freeCategoryFilter, setFreeCategoryFilter] = useState<string>('전체');
  const [openFreePostId, setOpenFreePostId] = useState<string | null>('fp-1');
  const [isWriteFreeModalOpen, setIsWriteFreeModalOpen] = useState(false);
  const [freeTitle, setFreeTitle] = useState('');
  const [freeCategory, setFreeCategory] = useState<'자유' | '질문' | '취업·이직' | '정보공유'>('자유');
  const [freeContent, setFreeContent] = useState('');
  const [isSubmittingFree, setIsSubmittingFree] = useState(false);

  // 자유게시판 댓글 State
  const [freeReplyInputMap, setFreeReplyInputMap] = useState<Record<string, string>>({});

  // ==========================================
  // 열린 건의함 State
  // ==========================================
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [feedbackCategoryFilter, setFeedbackCategoryFilter] = useState<string>('전체');
  const [openFeedbackId, setOpenFeedbackId] = useState<string | null>('fb-1');
  const [isWriteFeedbackModalOpen, setIsWriteFeedbackModalOpen] = useState(false);
  const [feedbackTitle, setFeedbackTitle] = useState('');
  const [feedbackCategory, setFeedbackCategory] = useState<'학사/수업' | '행사/스터디' | '학생회운영' | '기타'>('학사/수업');
  const [feedbackContent, setFeedbackContent] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  // 관리자 댓글 작성 State
  const [replyInputMap, setReplyInputMap] = useState<Record<string, string>>({});
  const [replyAuthorMap, setReplyAuthorMap] = useState<Record<string, string>>({});

  const { member, isAdmin } = useAuth();
  const requireLogin = useRequireLogin();
  const isPresident = member?.role === 'president';
  const isOfficer = member?.role === 'officer';
  const isAssociate = member?.role === 'associate';
  const isRegular = member?.role === 'regular';
  const canAnswerFeedback = !isAssociate && !isRegular && (isAdmin || isPresident || isOfficer);
  const canDelete = (authorId?: string | null) =>
    (!isAssociate && !isRegular && (isAdmin || isPresident)) || (!!member && !!authorId && authorId === member.id);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [feedbacksData, freePostsData] = await Promise.all([
      api.getFeedbacks(),
      api.getFreePosts()
    ]);
    setFeedbacks(feedbacksData);
    setFreePosts(freePostsData);
  };

  // 자유게시판 핸들러
  const handleCreateFreePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!freeTitle.trim() || !freeContent.trim()) {
      alert('제목과 내용을 입력해 주세요.');
      return;
    }
    if (isAssociate) {
      alert('자유게시판 글쓰기는 광주전남 컴퓨터과학과 재학생(정회원) 전용 기능입니다. 준회원은 열람만 가능합니다.');
      return;
    }
    try {
      setIsSubmittingFree(true);
      await api.createFreePost({
        title: freeTitle.trim(),
        content: freeContent.trim(),
        category: freeCategory
      });
      const data = await api.getFreePosts();
      setFreePosts(data);
      setIsWriteFreeModalOpen(false);
      setFreeTitle('');
      setFreeContent('');
      alert('자유게시판에 글이 등록되었습니다!');
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : '게시글 등록에 실패했습니다.');
    } finally {
      setIsSubmittingFree(false);
    }
  };

  const handleAddFreeReply = async (postId: string) => {
    const text = freeReplyInputMap[postId]?.trim();
    if (!text) {
      alert('댓글 내용을 입력해 주세요.');
      return;
    }
    if (!requireLogin()) return;
    if (isAssociate) {
      alert('자유게시판 댓글 작성은 광주전남 컴퓨터과학과 재학생(정회원) 전용 기능입니다.');
      return;
    }
    try {
      await api.addFreePostReply(postId, { content: text });
      setFreeReplyInputMap((prev) => ({ ...prev, [postId]: '' }));
      const data = await api.getFreePosts();
      setFreePosts(data);
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : '댓글 등록 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteFreePost = async (id: string) => {
    if (!(await showConfirm({ title: '게시글 삭제', message: '이 게시글을 정말 삭제하시겠습니까?', confirmText: '삭제하기', variant: 'danger' }))) return;
    try {
      await api.deleteFreePost(id);
    } catch (err) {
      alert(err instanceof Error ? err.message : '삭제에 실패했습니다.');
      return;
    }
    const data = await api.getFreePosts();
    setFreePosts(data);
  };

  // 건의함 핸들러
  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isAssociate) {
      alert('건의사항 등록은 광주전남 컴퓨터과학과 재학생(정회원) 전용 기능입니다. 준회원은 열람만 가능합니다.');
      return;
    }
    if (!feedbackTitle.trim() || !feedbackContent.trim()) {
      alert('제목과 내용을 입력해 주세요.');
      return;
    }
    try {
      setIsSubmittingFeedback(true);
      await api.createFeedback({
        title: feedbackTitle.trim(),
        content: feedbackContent.trim(),
        category: feedbackCategory
      });
      const data = await api.getFeedbacks();
      setFeedbacks(data);
      setIsWriteFeedbackModalOpen(false);
      setFeedbackTitle('');
      setFeedbackContent('');
      alert('건의사항이 등록되었습니다. 학생회가 확인 후 댓글로 정성껏 답변드리겠습니다!');
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : '건의 등록 중 오류가 발생했습니다.');
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const handleAddFeedbackReply = async (feedbackId: string) => {
    if (!canAnswerFeedback) {
      alert('건의함 답변 댓글은 학생회 임원진, 학생회장 및 관리자만 작성할 수 있습니다.');
      return;
    }
    const replyText = replyInputMap[feedbackId]?.trim();
    if (!replyText) {
      alert('답변 내용을 입력해 주세요.');
      return;
    }
    const defaultAuthor = isAdmin ? '학생회' : (member?.nickname || '학생회');
    const replyAuthor = replyAuthorMap[feedbackId]?.trim() || defaultAuthor;
    try {
      await api.addFeedbackReply(feedbackId, {
        author: replyAuthor,
        content: replyText
      });
      setReplyInputMap((prev) => ({ ...prev, [feedbackId]: '' }));
      const data = await api.getFeedbacks();
      setFeedbacks(data);
      alert('학생회 공식 답변 댓글이 성공적으로 등록되었습니다!');
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : '댓글 등록에 실패했습니다.');
    }
  };

  const handleDeleteFeedback = async (id: string) => {
    if (!(await showConfirm({ title: '건의글 삭제', message: '이 건의글을 정말 삭제하시겠습니까?', confirmText: '삭제하기', variant: 'danger' }))) return;
    try {
      await api.deleteFeedback(id);
    } catch (err) {
      alert(err instanceof Error ? err.message : '삭제에 실패했습니다.');
      return;
    }
    const data = await api.getFeedbacks();
    setFeedbacks(data);
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
      q: '비전공자 신·편입생인데 학습자료실은 어떻게 활용하면 되나요?',
      a: '상단 [학술·스터디] 메뉴의 "학습자료" 탭에서 학년 및 학기를 선택하시면 과목별 기출문제 풀이, 출석수업 요약본, 실습 가이드를 열람하고 바로 다운로드받으실 수 있습니다.'
    },
    {
      q: '학생회비는 어떻게 쓰이며 결산 내역을 어디서 볼 수 있나요?',
      a: '학생회비는 IT 실무 세미나 개최, 시험 기간 응원 간식, 전산실습실 환경 개선, 신입생 오리엔테이션 등에 소중하게 사용됩니다. 홈페이지 상단 [공지사항] 메뉴에서 [결산] 카테고리 필터를 누르시면 분기별 수입/지출 결산 보고서와 세부 집행 장부를 100% 투명하게 확인하실 수 있습니다.'
    }
  ];

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
              <span>Student Community & Communication</span>
            </div>
            <h1 className="font-knou text-2xl sm:text-3xl md:text-4xl font-bold text-slate-950 tracking-tight mb-2">
              커뮤니티
            </h1>
            <p className="text-slate-700 text-sm sm:text-base max-w-xl leading-relaxed font-normal">
              학우들의 일상과 취업·이직 이야기를 나누는 자유게시판, 학생회 소통 건의함, 신·편입생 학업 FAQ를 제공합니다.
            </p>
          </div>
        </div>

        {activeTab === 'free' && (
          <button
            onClick={() => {
              if (!requireLogin()) return;
              if (isAssociate) {
                alert('자유게시판 글쓰기는 광주전남 컴퓨터과학과 재학생(정회원) 전용 기능입니다. 준회원은 열람만 가능합니다.');
                return;
              }
              setIsWriteFreeModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm transition-colors shrink-0 self-start sm:self-auto shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            자유 글쓰기
          </button>
        )}

        {activeTab === 'feedback' && (
          <button
            onClick={() => {
              if (!requireLogin()) return;
              if (isAssociate) {
                alert('건의사항 작성은 광주전남 컴퓨터과학과 재학생(정회원) 전용 기능입니다. 준회원은 열람만 가능합니다.');
                return;
              }
              setIsWriteFeedbackModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm transition-colors shrink-0 self-start sm:self-auto shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            새 건의사항 작성
          </button>
        )}
      </div>

      {isAssociate && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-3 text-sm text-amber-950 font-medium shadow-xs">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>
              <strong className="text-amber-900">준회원 열람 모드:</strong> 현재 준회원 등급으로 로그인되어 있어 게시글 열람만 가능하며, 자유 글쓰기, 건의사항 작성 및 댓글 등록은 제한됩니다.
            </span>
          </div>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-1">
        <button
          onClick={() => setActiveTab('free')}
          className={`px-5 py-3.5 text-sm sm:text-base font-bold rounded-t-xl transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'free'
              ? 'bg-white text-blue-700 border-t-2 border-x border-blue-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
          }`}
        >
          <MessageCircle className="w-4.5 h-4.5 text-blue-600" />
          자유게시판 ({freePosts.length})
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
          학우 소통 & 열린 건의함 ({feedbacks.length})
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

      {/* ============================================================ */}
      {/* TAB 1: 자유게시판 (Free Board)                               */}
      {/* ============================================================ */}
      {activeTab === 'free' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-blue-50/70 border border-blue-200/80 rounded-3xl p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <MessageCircle className="w-6 h-6 text-blue-700" />
                <h3 className="font-bold text-blue-950 text-lg">컴퓨터과학과 학우 자유게시판</h3>
              </div>
              <p className="text-sm sm:text-base text-blue-900 leading-relaxed">
                공부 꿀팁, 과제 고민, 취업·이직 준비 이야기, 일상 소식 등을 자유롭게 나누는 열린 소통 광장입니다.
              </p>
            </div>
            <button
              onClick={() => {
                if (!requireLogin()) return;
                if (isAssociate) {
                  alert('자유게시판 글쓰기는 광주전남 컴퓨터과학과 재학생(정회원) 전용 기능입니다. 준회원은 열람만 가능합니다.');
                  return;
                }
                setIsWriteFreeModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shrink-0 self-start sm:self-center shadow-xs transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              자유 글쓰기
            </button>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <Filter className="w-4 h-4 text-slate-400 mr-1 hidden sm:inline" />
              {['전체', '자유', '질문', '취업·이직', '정보공유'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFreeCategoryFilter(cat)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                    freeCategoryFilter === cat
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <span className="text-xs sm:text-sm text-slate-500 font-medium">
              총 <strong className="text-slate-900 font-bold">{freePosts.length}</strong>개의 글
            </span>
          </div>

          {/* Free Posts List */}
          <div className="space-y-4">
            {freePosts
              .filter((p) => freeCategoryFilter === '전체' || p.category === freeCategoryFilter)
              .map((post) => {
                const isOpen = openFreePostId === post.id;
                return (
                  <div
                    key={post.id}
                    className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden transition-all"
                  >
                    <div
                      onClick={() => setOpenFreePostId(isOpen ? null : post.id)}
                      className="p-5 sm:p-6 cursor-pointer hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-2 flex-1 pr-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                            {post.category}
                          </span>
                          <span className="text-xs text-slate-400 font-medium sm:hidden ml-auto">
                            {post.created_at}
                          </span>
                        </div>

                        <h3 className="text-base sm:text-lg font-bold text-slate-900 hover:text-blue-600 transition-colors leading-snug">
                          {post.title}
                        </h3>

                        <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-500 font-medium">
                          <span>작성자: {post.author}</span>
                          <span>•</span>
                          <span className="hidden sm:inline">등록일: {post.created_at}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5" />
                            {post.views}
                          </span>
                          <span>•</span>
                          <span className="text-blue-600 font-bold">
                            댓글 {post.replies ? post.replies.length : 0}개
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                        {canDelete(post.author_id) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteFreePost(post.id);
                            }}
                            className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors text-xs font-semibold"
                            title="게시글 삭제"
                          >
                            삭제
                          </button>
                        )}
                        <div className="p-2 rounded-xl bg-slate-100 text-slate-600">
                          {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </div>
                      </div>
                    </div>

                    {/* Collapsible Content & Replies */}
                    {isOpen && (
                      <div className="border-t border-slate-100 p-6 sm:p-8 bg-slate-50/40 space-y-6">
                        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
                          <p className="text-slate-800 text-sm sm:text-base leading-relaxed whitespace-pre-line font-normal">
                            {post.content}
                          </p>
                        </div>

                        {/* Reply List */}
                        <div className="space-y-3">
                          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                            <MessageCircle className="w-4 h-4 text-blue-600" />
                            댓글 목록 ({post.replies ? post.replies.length : 0})
                          </h4>

                          {post.replies && post.replies.map((r) => (
                            <div
                              key={r.id}
                              className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 text-xs sm:text-sm space-y-1.5"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-900">{r.author}</span>
                                <span className="text-slate-400">{r.created_at}</span>
                              </div>
                              <p className="text-slate-700 leading-relaxed">{r.content}</p>
                            </div>
                          ))}

                          {/* Write reply input */}
                          {isAssociate ? (
                            <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-800 flex items-center justify-between">
                              <span className="flex items-center gap-1.5">
                                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                                <strong>준회원 안내:</strong> 자유게시판 댓글 작성은 정회원(광주전남 컴퓨터과학과 재학생) 전용입니다. 준회원은 열람만 가능합니다.
                              </span>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-2">
                              <input
                                type="text"
                                placeholder="댓글을 남겨보세요..."
                                value={freeReplyInputMap[post.id] || ''}
                                onChange={(e) =>
                                  setFreeReplyInputMap((prev) => ({ ...prev, [post.id]: e.target.value }))
                                }
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleAddFreeReply(post.id);
                                }}
                                className="sm:col-span-3 px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white"
                              />
                              <button
                                onClick={() => handleAddFreeReply(post.id)}
                                className="sm:col-span-1 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                              >
                                <Send className="w-3.5 h-3.5" />
                                댓글 등록
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: 학우 소통 & 열린 건의함 (게시판 + 관리자 댓글)        */}
      {/* ============================================================ */}
      {activeTab === 'feedback' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-3xl p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <MessageSquare className="w-6 h-6 text-indigo-700" />
                <h3 className="font-bold text-indigo-950 text-lg">열린 건의함 & 소통 게시판</h3>
              </div>
              <p className="text-sm sm:text-base text-indigo-900 leading-relaxed">
                출석수업, 학사 일정, 실습실 환경 등 학생회에 전하고 싶은 의견을 자유롭게 남겨주세요. 임원진이 직접 댓글로 성실히 답변드립니다.
              </p>
            </div>
            <button
              onClick={() => {
                if (!requireLogin()) return;
                if (isAssociate) {
                  alert('건의사항 작성은 광주전남 컴퓨터과학과 재학생(정회원) 전용 기능입니다. 준회원은 열람만 가능합니다.');
                  return;
                }
                setIsWriteFeedbackModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shrink-0 self-start sm:self-center shadow-xs transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              건의사항 작성하기
            </button>
          </div>

          {/* Admin Notice Pill (if logged in as admin without member or as officer/president) */}
          {canAnswerFeedback && (
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
                        {canDelete(fb.author_id) && (
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

                    {isOpen && (
                      <div className="border-t border-slate-100 p-6 sm:p-8 bg-slate-50/40 space-y-6">
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
                                      {reply.author_id ? '학우 댓글' : '학생회 공식 답변'}
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

                        {/* Reply Input Form (Only for Admin, President, Officer) */}
                        {canAnswerFeedback ? (
                          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-indigo-100 bg-indigo-50/20 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                                <MessageCircle className="w-4 h-4 text-indigo-600" />
                                학생회 임원 공식 답변 댓글 작성
                              </span>
                              <span className="text-[11px] text-indigo-600 font-medium">
                                임원 권한 확인됨
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                              <input
                                type="text"
                                placeholder={member?.nickname || '작성자 (예: 학생회장, 총무부장)'}
                                value={replyAuthorMap[fb.id] || ''}
                                onChange={(e) =>
                                  setReplyAuthorMap((prev) => ({ ...prev, [fb.id]: e.target.value }))
                                }
                                className="sm:col-span-1 px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white focus:ring-2 focus:ring-indigo-500"
                              />
                              <input
                                type="text"
                                placeholder="학우에게 전할 공식 답변 내용을 입력해 주세요..."
                                value={replyInputMap[fb.id] || ''}
                                onChange={(e) =>
                                  setReplyInputMap((prev) => ({ ...prev, [fb.id]: e.target.value }))
                                }
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleAddFeedbackReply(fb.id);
                                }}
                                className="sm:col-span-2 px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white focus:ring-2 focus:ring-indigo-500"
                              />
                              <button
                                onClick={() => handleAddFeedbackReply(fb.id)}
                                className="sm:col-span-1 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                              >
                                <Send className="w-3.5 h-3.5" />
                                답변 등록
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-500 flex items-center justify-between">
                            <span className="flex items-center gap-1.5 font-medium">
                              <MessageCircle className="w-4 h-4 text-slate-400" />
                              건의사항에 대한 답변은 학생회 임원진만 작성할 수 있습니다.
                            </span>
                            {!member && !isAdmin && (
                              <Link
                                to="/admin"
                                className="text-indigo-600 hover:underline font-semibold"
                              >
                                임원 관리자 로그인 →
                              </Link>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 3: FAQ Section                                           */}
      {/* ============================================================ */}
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

      {/* Write Free Post Modal */}
      {isWriteFreeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 p-6 sm:p-8 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg text-slate-900">새 자유게시글 작성</h3>
                  <p className="text-xs text-slate-500">학우들과 나누고 싶은 이야기를 적어주세요.</p>
                </div>
              </div>
              <button
                onClick={() => setIsWriteFreeModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateFreePost} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">분류</label>
                  <select
                    value={freeCategory}
                    onChange={(e) => setFreeCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="자유">자유</option>
                    <option value="질문">질문</option>
                    <option value="취업·이직">취업·이직</option>
                    <option value="정보공유">정보공유</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">작성자</label>
                  <div className="w-full px-3 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs sm:text-sm font-semibold">{member?.nickname}</div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">제목 *</label>
                <input
                  type="text"
                  required
                  value={freeTitle}
                  onChange={(e) => setFreeTitle(e.target.value)}
                  placeholder="게시글 제목을 입력해주세요"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">상세 내용 *</label>
                <textarea
                  required
                  rows={6}
                  value={freeContent}
                  onChange={(e) => setFreeContent(e.target.value)}
                  placeholder="내용을 작성해주세요..."
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 leading-relaxed"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsWriteFreeModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingFree}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-colors shadow-xs disabled:opacity-50"
                >
                  {isSubmittingFree ? '등록 중...' : '게시글 등록'}
                </button>
              </div>
            </form>
          </div>
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
                  <label className="block font-bold text-slate-800 mb-1">작성자</label>
                  <div className="w-full px-3 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs sm:text-sm font-semibold">{member?.nickname}</div>
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
    </div>
  );
};
