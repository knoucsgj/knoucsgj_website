import React, { useState, useEffect } from 'react';
import { showConfirm } from '../components/ui/GlobalDialog';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../services/auth';
import { useRequireLogin } from '../lib/useRequireLogin';
import type {
  FeedbackItem,
  FeedbackReply,
  FreePost,
  MarketPost,
  QnaPost
} from '../lib/types';
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
  Eye,
  ShoppingBag,
  Tag,
  CheckCircle2
} from 'lucide-react';

export const CommunityPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<'free' | 'feedback' | 'market' | 'qna'>(
    initialTabParam === 'feedback' || initialTabParam === 'market' || initialTabParam === 'qna'
      ? initialTabParam
      : 'free'
  );

  const handleTabChange = (tab: 'free' | 'feedback' | 'market' | 'qna') => {
    setActiveTab(tab);
    setSearchParams({ tab }, { replace: true });
  };

  // ==========================================
  // 1. 자유게시판 State
  // ==========================================
  const [freePosts, setFreePosts] = useState<FreePost[]>([]);
  const [freeCategoryFilter, setFreeCategoryFilter] = useState<string>('전체');
  const [openFreePostId, setOpenFreePostId] = useState<string | null>(null);
  const [isWriteFreeModalOpen, setIsWriteFreeModalOpen] = useState(false);
  const [freeTitle, setFreeTitle] = useState('');
  const [freeCategory, setFreeCategory] = useState<'자유' | '질문' | '취업·이직' | '정보공유'>('자유');
  const [freeContent, setFreeContent] = useState('');
  const [isSubmittingFree, setIsSubmittingFree] = useState(false);
  const [freeReplyInputMap, setFreeReplyInputMap] = useState<Record<string, string>>({});

  // ==========================================
  // 2. 학생회에 바란다 State
  // ==========================================
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [feedbackCategoryFilter, setFeedbackCategoryFilter] = useState<string>('전체');
  const [openFeedbackId, setOpenFeedbackId] = useState<string | null>(null);
  const [isWriteFeedbackModalOpen, setIsWriteFeedbackModalOpen] = useState(false);
  const [feedbackTitle, setFeedbackTitle] = useState('');
  const [feedbackCategory, setFeedbackCategory] = useState<'학사/수업' | '행사/스터디' | '학생회운영' | '기타'>('학사/수업');
  const [feedbackContent, setFeedbackContent] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [replyInputMap, setReplyInputMap] = useState<Record<string, string>>({});
  const [replyAuthorMap, setReplyAuthorMap] = useState<Record<string, string>>({});

  // ==========================================
  // 3. 벼룩시장 State
  // ==========================================
  const [marketPosts, setMarketPosts] = useState<MarketPost[]>([]);
  const [marketCategoryFilter, setMarketCategoryFilter] = useState<string>('전체');
  const [openMarketPostId, setOpenMarketPostId] = useState<string | null>(null);
  const [isWriteMarketModalOpen, setIsWriteMarketModalOpen] = useState(false);
  const [marketTitle, setMarketTitle] = useState('');
  const [marketCategory, setMarketCategory] = useState<MarketPost['category']>('팝니다');
  const [marketPrice, setMarketPrice] = useState('');
  const [marketContent, setMarketContent] = useState('');
  const [isSubmittingMarket, setIsSubmittingMarket] = useState(false);
  const [marketReplyInputMap, setMarketReplyInputMap] = useState<Record<string, string>>({});

  // ==========================================
  // 4. Q&A 코너 State
  // ==========================================
  const [qnaPosts, setQnaPosts] = useState<QnaPost[]>([]);
  const [qnaCategoryFilter, setQnaCategoryFilter] = useState<string>('전체');
  const [openQnaPostId, setOpenQnaPostId] = useState<string | null>(null);
  const [isWriteQnaModalOpen, setIsWriteQnaModalOpen] = useState(false);
  const [qnaTitle, setQnaTitle] = useState('');
  const [qnaCategory, setQnaCategory] = useState<QnaPost['category']>('전공/학습');
  const [qnaContent, setQnaContent] = useState('');
  const [isSubmittingQna, setIsSubmittingQna] = useState(false);
  const [qnaReplyInputMap, setQnaReplyInputMap] = useState<Record<string, string>>({});

  const { member, isAdmin } = useAuth();
  const requireLogin = useRequireLogin();
  const isPresident = member?.role === 'president';
  const isOfficer = member?.role === 'officer';

  // 학생회에 바란다는 학생회 임원, 학생회장, 관리자 등급만 댓글(답변) 작성 가능
  const canAnswerFeedback = isAdmin || isPresident || isOfficer;

  // 본인 작성 글/댓글 또는 학생회장/최고관리자 삭제 가능
  const canDelete = (authorId?: string | null) =>
    isAdmin || isPresident || (!!member && !!authorId && authorId === member.id);

  const writerDisplayName = member?.nickname || (isAdmin ? '관리자' : '학우');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [feedbacksData, freePostsData, marketData, qnaData] = await Promise.all([
      api.getFeedbacks(),
      api.getFreePosts(),
      api.getMarketPosts(),
      api.getQnaPosts()
    ]);
    setFeedbacks(feedbacksData);
    setFreePosts(freePostsData);
    setMarketPosts(marketData);
    setQnaPosts(qnaData);

    const targetId = searchParams.get('id');
    if (targetId) {
      if (freePostsData.some((p) => p.id === targetId)) {
        setActiveTab('free');
        setOpenFreePostId(targetId);
      } else if (feedbacksData.some((f) => f.id === targetId)) {
        setActiveTab('feedback');
        setOpenFeedbackId(targetId);
      } else if (marketData.some((m) => m.id === targetId)) {
        setActiveTab('market');
        setOpenMarketPostId(targetId);
      } else if (qnaData.some((q) => q.id === targetId)) {
        setActiveTab('qna');
        setOpenQnaPostId(targetId);
      }
    }
  };

  // ==========================================
  // 1. 자유게시판 핸들러 (회원가입한 누구나 글/댓글 가능)
  // ==========================================
  const handleCreateFreePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!freeTitle.trim() || !freeContent.trim()) {
      alert('제목과 내용을 입력해 주세요.');
      return;
    }
    try {
      setIsSubmittingFree(true);
      const created = await api.createFreePost({
        title: freeTitle.trim(),
        content: freeContent.trim(),
        category: freeCategory
      });
      const data = await api.getFreePosts();
      setFreePosts(data);
      setOpenFreePostId(created.id);
      setIsWriteFreeModalOpen(false);
      setFreeTitle('');
      setFreeContent('');
      alert('자유게시판에 게시글이 등록되었습니다!');
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : '게시글 등록에 실패했습니다.');
    } finally {
      setIsSubmittingFree(false);
    }
  };

  const handleAddFreeReply = async (postId: string) => {
    if (!member && !isAdmin) {
      requireLogin();
      return;
    }
    const text = freeReplyInputMap[postId]?.trim();
    if (!text) {
      alert('댓글 내용을 입력해 주세요.');
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
      const data = await api.getFreePosts();
      setFreePosts(data);
    } catch (err) {
      alert(err instanceof Error ? err.message : '삭제에 실패했습니다.');
    }
  };

  const handleDeleteFreeReply = async (postId: string, replyId: string) => {
    if (!(await showConfirm({ title: '댓글 삭제', message: '이 댓글을 삭제하시겠습니까?', confirmText: '삭제하기', variant: 'danger' }))) return;
    try {
      await api.deleteFreePostReply(postId, replyId);
      const data = await api.getFreePosts();
      setFreePosts(data);
    } catch (err) {
      alert(err instanceof Error ? err.message : '댓글 삭제에 실패했습니다.');
    }
  };

  // ==========================================
  // 2. 학생회에 바란다 핸들러 (댓글은 임원/학생회장/관리자만 가능)
  // ==========================================
  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackTitle.trim() || !feedbackContent.trim()) {
      alert('제목과 내용을 입력해 주세요.');
      return;
    }
    try {
      setIsSubmittingFeedback(true);
      const created = await api.createFeedback({
        title: feedbackTitle.trim(),
        content: feedbackContent.trim(),
        category: feedbackCategory
      });
      const data = await api.getFeedbacks();
      setFeedbacks(data);
      setOpenFeedbackId(created.id);
      setIsWriteFeedbackModalOpen(false);
      setFeedbackTitle('');
      setFeedbackContent('');
      alert('학생회에 바란다 게시글이 등록되었습니다. 학생회 임원진이 확인 후 댓글로 답변드리겠습니다!');
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : '등록 중 오류가 발생했습니다.');
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const handleAddFeedbackReply = async (feedbackId: string) => {
    if (!canAnswerFeedback) {
      alert('학생회에 바란다 댓글은 학생회 임원, 학생회장 및 관리자 등급만 작성할 수 있습니다.');
      return;
    }
    const replyText = replyInputMap[feedbackId]?.trim();
    if (!replyText) {
      alert('댓글(답변) 내용을 입력해 주세요.');
      return;
    }
    const defaultAuthor = isAdmin && !member ? '학생회 관리자' : (member?.nickname || '학생회 임원');
    const replyAuthor = replyAuthorMap[feedbackId]?.trim() || defaultAuthor;
    try {
      await api.addFeedbackReply(feedbackId, {
        author: replyAuthor,
        content: replyText
      });
      setReplyInputMap((prev) => ({ ...prev, [feedbackId]: '' }));
      const data = await api.getFeedbacks();
      setFeedbacks(data);
      alert('학생회 공식 답변 댓글이 등록되었습니다!');
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : '댓글 등록에 실패했습니다.');
    }
  };

  const handleDeleteFeedback = async (id: string) => {
    if (!(await showConfirm({ title: '게시글 삭제', message: '이 글을 정말 삭제하시겠습니까?', confirmText: '삭제하기', variant: 'danger' }))) return;
    try {
      await api.deleteFeedback(id);
      const data = await api.getFeedbacks();
      setFeedbacks(data);
    } catch (err) {
      alert(err instanceof Error ? err.message : '삭제에 실패했습니다.');
    }
  };

  const handleDeleteFeedbackReply = async (feedbackId: string, replyId: string) => {
    if (!(await showConfirm({ title: '답변 댓글 삭제', message: '이 답변 댓글을 삭제하시겠습니까?', confirmText: '삭제하기', variant: 'danger' }))) return;
    try {
      await api.deleteFeedbackReply(feedbackId, replyId);
      const data = await api.getFeedbacks();
      setFeedbacks(data);
    } catch (err) {
      alert(err instanceof Error ? err.message : '댓글 삭제에 실패했습니다.');
    }
  };

  // ==========================================
  // 3. 벼룩시장 핸들러 (회원가입한 누구나 글/댓글 가능)
  // ==========================================
  const handleCreateMarketPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!marketTitle.trim() || !marketContent.trim()) {
      alert('제목과 상세 내용을 입력해 주세요.');
      return;
    }
    try {
      setIsSubmittingMarket(true);
      const defaultPrice = marketCategory === '무료나눔' ? '무료나눔' : (marketPrice.trim() || '협의');
      const created = await api.createMarketPost({
        title: marketTitle.trim(),
        content: marketContent.trim(),
        category: marketCategory,
        price: defaultPrice
      });
      const data = await api.getMarketPosts();
      setMarketPosts(data);
      setOpenMarketPostId(created.id);
      setIsWriteMarketModalOpen(false);
      setMarketTitle('');
      setMarketPrice('');
      setMarketContent('');
      alert('벼룩시장에 게시글이 등록되었습니다!');
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : '벼룩시장 글 등록에 실패했습니다.');
    } finally {
      setIsSubmittingMarket(false);
    }
  };

  const handleAddMarketReply = async (postId: string) => {
    if (!member && !isAdmin) {
      requireLogin();
      return;
    }
    const text = marketReplyInputMap[postId]?.trim();
    if (!text) {
      alert('댓글 내용을 입력해 주세요.');
      return;
    }
    try {
      await api.addMarketReply(postId, { content: text });
      setMarketReplyInputMap((prev) => ({ ...prev, [postId]: '' }));
      const data = await api.getMarketPosts();
      setMarketPosts(data);
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : '댓글 등록에 실패했습니다.');
    }
  };

  const handleUpdateMarketStatus = async (postId: string, status: MarketPost['status']) => {
    try {
      await api.updateMarketStatus(postId, status);
      const data = await api.getMarketPosts();
      setMarketPosts(data);
    } catch (err) {
      alert(err instanceof Error ? err.message : '상태 변경에 실패했습니다.');
    }
  };

  const handleDeleteMarketPost = async (id: string) => {
    if (!(await showConfirm({ title: '벼룩시장 게시글 삭제', message: '이 게시글을 정말 삭제하시겠습니까?', confirmText: '삭제하기', variant: 'danger' }))) return;
    try {
      await api.deleteMarketPost(id);
      const data = await api.getMarketPosts();
      setMarketPosts(data);
    } catch (err) {
      alert(err instanceof Error ? err.message : '삭제에 실패했습니다.');
    }
  };

  const handleDeleteMarketReply = async (postId: string, replyId: string) => {
    if (!(await showConfirm({ title: '댓글 삭제', message: '이 댓글을 삭제하시겠습니까?', confirmText: '삭제하기', variant: 'danger' }))) return;
    try {
      await api.deleteMarketReply(postId, replyId);
      const data = await api.getMarketPosts();
      setMarketPosts(data);
    } catch (err) {
      alert(err instanceof Error ? err.message : '댓글 삭제에 실패했습니다.');
    }
  };

  // ==========================================
  // 4. Q&A 코너 핸들러 (회원가입한 누구나 질문/답변댓글 가능)
  // ==========================================
  const handleCreateQnaPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qnaTitle.trim() || !qnaContent.trim()) {
      alert('질문 제목과 내용을 입력해 주세요.');
      return;
    }
    try {
      setIsSubmittingQna(true);
      const created = await api.createQnaPost({
        title: qnaTitle.trim(),
        content: qnaContent.trim(),
        category: qnaCategory
      });
      const data = await api.getQnaPosts();
      setQnaPosts(data);
      setOpenQnaPostId(created.id);
      setIsWriteQnaModalOpen(false);
      setQnaTitle('');
      setQnaContent('');
      alert('Q&A 코너에 질문이 등록되었습니다!');
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : '질문 등록에 실패했습니다.');
    } finally {
      setIsSubmittingQna(false);
    }
  };

  const handleAddQnaReply = async (postId: string) => {
    if (!member && !isAdmin) {
      requireLogin();
      return;
    }
    const text = qnaReplyInputMap[postId]?.trim();
    if (!text) {
      alert('답변 또는 댓글 내용을 입력해 주세요.');
      return;
    }
    try {
      await api.addQnaReply(postId, { content: text });
      setQnaReplyInputMap((prev) => ({ ...prev, [postId]: '' }));
      const data = await api.getQnaPosts();
      setQnaPosts(data);
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : '답변 등록에 실패했습니다.');
    }
  };

  const handleDeleteQnaPost = async (id: string) => {
    if (!(await showConfirm({ title: '질문글 삭제', message: '이 질문글을 정말 삭제하시겠습니까?', confirmText: '삭제하기', variant: 'danger' }))) return;
    try {
      await api.deleteQnaPost(id);
      const data = await api.getQnaPosts();
      setQnaPosts(data);
    } catch (err) {
      alert(err instanceof Error ? err.message : '삭제에 실패했습니다.');
    }
  };

  const handleDeleteQnaReply = async (postId: string, replyId: string) => {
    if (!(await showConfirm({ title: '댓글 삭제', message: '이 답변/댓글을 삭제하시겠습니까?', confirmText: '삭제하기', variant: 'danger' }))) return;
    try {
      await api.deleteQnaReply(postId, replyId);
      const data = await api.getQnaPosts();
      setQnaPosts(data);
    } catch (err) {
      alert(err instanceof Error ? err.message : '댓글 삭제에 실패했습니다.');
    }
  };

  const checkLoginBeforeOpen = (openFn: () => void) => {
    if (!member && !isAdmin) {
      if (!requireLogin()) return;
    }
    openFn();
  };

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
            <p className="text-slate-700 text-sm sm:text-base max-w-2xl leading-relaxed font-normal">
              학우들의 이야기를 나누는 자유게시판, 학생회에 바란다, 중고 교재·물품을 나누는 벼룩시장, 서로 묻고 답하는 Q&A 코너입니다.
            </p>
          </div>
        </div>

        {activeTab === 'free' && (
          <button
            onClick={() => checkLoginBeforeOpen(() => setIsWriteFreeModalOpen(true))}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm transition-colors shrink-0 self-start sm:self-auto shadow-xs cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            자유 글쓰기
          </button>
        )}

        {activeTab === 'feedback' && (
          <button
            onClick={() => checkLoginBeforeOpen(() => setIsWriteFeedbackModalOpen(true))}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm transition-colors shrink-0 self-start sm:self-auto shadow-xs cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            학생회에 바란다 글쓰기
          </button>
        )}

        {activeTab === 'market' && (
          <button
            onClick={() => checkLoginBeforeOpen(() => setIsWriteMarketModalOpen(true))}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm transition-colors shrink-0 self-start sm:self-auto shadow-xs cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            벼룩시장 글쓰기
          </button>
        )}

        {activeTab === 'qna' && (
          <button
            onClick={() => checkLoginBeforeOpen(() => setIsWriteQnaModalOpen(true))}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs sm:text-sm transition-colors shrink-0 self-start sm:self-auto shadow-xs cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            질문 등록하기
          </button>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-1">
        <button
          onClick={() => handleTabChange('free')}
          className={`px-5 py-3.5 text-sm sm:text-base font-bold rounded-t-xl transition-colors whitespace-nowrap flex items-center gap-2 cursor-pointer ${
            activeTab === 'free'
              ? 'bg-white text-blue-700 border-t-2 border-x border-blue-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
          }`}
        >
          <MessageCircle className="w-4.5 h-4.5 text-blue-600" />
          자유게시판 ({freePosts.length})
        </button>

        <button
          onClick={() => handleTabChange('feedback')}
          className={`px-5 py-3.5 text-sm sm:text-base font-bold rounded-t-xl transition-colors whitespace-nowrap flex items-center gap-2 cursor-pointer ${
            activeTab === 'feedback'
              ? 'bg-white text-indigo-700 border-t-2 border-x border-indigo-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
          }`}
        >
          <MessageSquare className="w-4.5 h-4.5 text-indigo-600" />
          학생회에 바란다 ({feedbacks.length})
        </button>

        <button
          onClick={() => handleTabChange('market')}
          className={`px-5 py-3.5 text-sm sm:text-base font-bold rounded-t-xl transition-colors whitespace-nowrap flex items-center gap-2 cursor-pointer ${
            activeTab === 'market'
              ? 'bg-white text-emerald-700 border-t-2 border-x border-emerald-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
          }`}
        >
          <ShoppingBag className="w-4.5 h-4.5 text-emerald-600" />
          벼룩시장 ({marketPosts.length})
        </button>

        <button
          onClick={() => handleTabChange('qna')}
          className={`px-5 py-3.5 text-sm sm:text-base font-bold rounded-t-xl transition-colors whitespace-nowrap flex items-center gap-2 cursor-pointer ${
            activeTab === 'qna'
              ? 'bg-white text-violet-700 border-t-2 border-x border-violet-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
          }`}
        >
          <HelpCircle className="w-4.5 h-4.5 text-violet-600" />
          Q&A 코너 ({qnaPosts.length})
        </button>
      </div>

      {/* ============================================================ */}
      {/* TAB 1: 자유게시판 (Free Board) - 누구나 글/댓글 작성 가능      */}
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
                공부 꿀팁, 과제 고민, 취업·이직 준비 이야기, 일상 소식 등을 회원가입한 학우 누구나 자유롭게 나누는 열린 소통 공간입니다.
              </p>
            </div>
            <button
              onClick={() => checkLoginBeforeOpen(() => setIsWriteFreeModalOpen(true))}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shrink-0 self-start sm:self-center shadow-xs transition-colors cursor-pointer"
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
                  className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
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
            {freePosts.filter((p) => freeCategoryFilter === '전체' || p.category === freeCategoryFilter).length === 0 ? (
              <div className="py-16 text-center bg-white rounded-3xl border border-slate-200/90 shadow-xs">
                <p className="font-semibold text-slate-700 text-base mb-1">등록된 자유게시글이 없습니다.</p>
                <p className="text-xs sm:text-sm text-slate-400">학우들과 나누고 싶은 일상 이야기나 꿀팁을 남겨보세요!</p>
              </div>
            ) : freePosts
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
                            className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors text-xs font-semibold cursor-pointer"
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

                          {post.replies &&
                            post.replies.map((r) => (
                              <div
                                key={r.id}
                                className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 text-xs sm:text-sm space-y-1.5"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-slate-900">{r.author}</span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-slate-400">{r.created_at}</span>
                                    {canDelete(r.author_id) && (
                                      <button
                                        onClick={() => handleDeleteFreeReply(post.id, r.id)}
                                        className="text-rose-500 hover:underline text-xs font-semibold cursor-pointer"
                                      >
                                        삭제
                                      </button>
                                    )}
                                  </div>
                                </div>
                                <p className="text-slate-700 leading-relaxed whitespace-pre-line">{r.content}</p>
                              </div>
                            ))}

                          {/* Write reply input (회원가입한 누구나 가능) */}
                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-2">
                            <input
                              type="text"
                              placeholder={member || isAdmin ? '댓글을 남겨보세요...' : '로그인 후 댓글을 작성하실 수 있습니다.'}
                              value={freeReplyInputMap[post.id] || ''}
                              onChange={(e) =>
                                setFreeReplyInputMap((prev) => ({ ...prev, [post.id]: e.target.value }))
                              }
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleAddFreeReply(post.id);
                              }}
                              className="sm:col-span-3 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            <button
                              onClick={() => handleAddFreeReply(post.id)}
                              className="sm:col-span-1 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                            >
                              <Send className="w-3.5 h-3.5" />
                              댓글 등록
                            </button>
                          </div>
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
      {/* TAB 2: 학생회에 바란다 (댓글은 임원·학생회장·관리자만 가능)     */}
      {/* ============================================================ */}
      {activeTab === 'feedback' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-3xl p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <MessageSquare className="w-6 h-6 text-indigo-700" />
                <h3 className="font-bold text-indigo-950 text-lg">학생회에 바란다</h3>
              </div>
              <p className="text-sm sm:text-base text-indigo-900 leading-relaxed">
                출석수업, 학사 일정, 학생회 운영 및 행사 등 학생회에 바라는 점을 남겨주세요. 학생회 임원, 학생회장, 관리자가 직접 댓글로 답변드립니다.
              </p>
            </div>
            <button
              onClick={() => checkLoginBeforeOpen(() => setIsWriteFeedbackModalOpen(true))}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shrink-0 self-start sm:self-center shadow-xs transition-colors cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              학생회에 바란다 글쓰기
            </button>
          </div>

          {canAnswerFeedback && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-3 text-sm text-blue-950 font-medium">
              <div className="flex items-center gap-2.5">
                <Shield className="w-5 h-5 text-blue-600 shrink-0" />
                <span>
                  <strong className="text-blue-900">학생회 임원·관리자 권한 활성화:</strong> 각 게시글을 클릭하여 하단 댓글창에서 공식 답변 댓글을 작성할 수 있습니다.
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
                  className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
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
              총 <strong className="text-slate-900 font-bold">{feedbacks.length}</strong>건의 게시글
            </span>
          </div>

          {/* Feedback Board List */}
          <div className="space-y-4">
            {feedbacks.filter((fb) => feedbackCategoryFilter === '전체' || fb.category === feedbackCategoryFilter).length === 0 ? (
              <div className="py-16 text-center bg-white rounded-3xl border border-slate-200/90 shadow-xs">
                <p className="font-semibold text-slate-700 text-base mb-1">등록된 건의사항이 없습니다.</p>
                <p className="text-xs sm:text-sm text-slate-400">학생회에 바라는 점이나 학과 발전을 위한 의견을 언제든 남겨주세요.</p>
              </div>
            ) : feedbacks
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
                            className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors text-xs font-semibold cursor-pointer"
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

                    {isOpen && (
                      <div className="border-t border-slate-100 p-6 sm:p-8 bg-slate-50/40 space-y-6">
                        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
                          <span className="text-xs font-bold text-slate-500 tracking-wider uppercase">
                            상세 내용
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

                          {!fb.replies || fb.replies.length === 0 ? (
                            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/70 text-amber-900 text-xs sm:text-sm">
                              💬 학생회 임원진이 내용을 확인 중입니다. 곧 성실한 답변 댓글이 등록될 예정입니다.
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
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-indigo-700 font-medium">
                                      {reply.created_at}
                                    </span>
                                    {canAnswerFeedback && (
                                      <button
                                        onClick={() => handleDeleteFeedbackReply(fb.id, reply.id)}
                                        className="text-rose-600 hover:underline text-xs font-semibold cursor-pointer"
                                      >
                                        삭제
                                      </button>
                                    )}
                                  </div>
                                </div>
                                <p className="text-sm sm:text-base leading-relaxed text-indigo-950 whitespace-pre-line font-normal">
                                  {reply.content}
                                </p>
                              </div>
                            ))
                          )}
                        </div>

                        {/* Reply Input Form (학생회 임원, 학생회장, 관리자 등급만 가능) */}
                        {canAnswerFeedback ? (
                          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-indigo-100 bg-indigo-50/20 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                                <MessageCircle className="w-4 h-4 text-indigo-600" />
                                학생회 임원·회장·관리자 답변 댓글 작성
                              </span>
                              <span className="text-[11px] text-indigo-600 font-medium">
                                임원/관리자 권한 확인됨
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
                                className="sm:col-span-1 px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
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
                                className="sm:col-span-2 px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                              />
                              <button
                                onClick={() => handleAddFeedbackReply(fb.id)}
                                className="sm:col-span-1 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
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
                              학생회에 바란다 댓글(답변)은 학생회 임원, 학생회장 및 관리자 등급만 작성할 수 있습니다.
                            </span>
                            {!member && !isAdmin && (
                              <Link
                                to="/login"
                                className="text-indigo-600 hover:underline font-semibold"
                              >
                                로그인 →
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
      {/* TAB 3: 벼룩시장 (Flea Market) - 누구나 글/댓글 작성 가능       */}
      {/* ============================================================ */}
      {activeTab === 'market' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-3xl p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-6 h-6 text-emerald-700" />
                <h3 className="font-bold text-emerald-950 text-lg">학우 벼룩시장 (교재·학용품·IT기기 나눔 및 중고거래)</h3>
              </div>
              <p className="text-sm sm:text-base text-emerald-900 leading-relaxed">
                수강을 마친 전공·교양 교재 무료 나눔부터 중고 서적 판매·구매, IT 학습기기 거래까지 회원가입한 학우 누구나 자유롭게 이용하실 수 있습니다.
              </p>
            </div>
            <button
              onClick={() => checkLoginBeforeOpen(() => setIsWriteMarketModalOpen(true))}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shrink-0 self-start sm:self-center shadow-xs transition-colors cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              벼룩시장 글쓰기
            </button>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <Filter className="w-4 h-4 text-slate-400 mr-1 hidden sm:inline" />
              {['전체', '팝니다', '삽니다', '무료나눔', '교재교환'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setMarketCategoryFilter(cat)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                    marketCategoryFilter === cat
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <span className="text-xs sm:text-sm text-slate-500 font-medium">
              총 <strong className="text-slate-900 font-bold">{marketPosts.length}</strong>개의 물품
            </span>
          </div>

          {/* Market Posts List */}
          <div className="space-y-4">
            {marketPosts.filter((p) => marketCategoryFilter === '전체' || p.category === marketCategoryFilter).length === 0 ? (
              <div className="py-16 text-center bg-white rounded-3xl border border-slate-200/90 shadow-xs">
                <p className="font-semibold text-slate-700 text-base mb-1">등록된 벼룩시장 물품이 없습니다.</p>
                <p className="text-xs sm:text-sm text-slate-400">다 본 교재나 나눔할 물품이 있다면 첫 번째 글을 등록해 보세요!</p>
              </div>
            ) : marketPosts
              .filter((p) => marketCategoryFilter === '전체' || p.category === marketCategoryFilter)
              .map((post) => {
                const isOpen = openMarketPostId === post.id;
                const statusBadgeStyle =
                  post.status === '거래완료'
                    ? 'bg-slate-100 text-slate-500 border-slate-200'
                    : post.status === '예약중'
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200';
                const categoryBadgeStyle =
                  post.category === '무료나눔'
                    ? 'bg-pink-50 text-pink-700 border-pink-200'
                    : post.category === '삽니다'
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-teal-50 text-teal-800 border-teal-200';

                return (
                  <div
                    key={post.id}
                    className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden transition-all"
                  >
                    <div
                      onClick={() => setOpenMarketPostId(isOpen ? null : post.id)}
                      className="p-5 sm:p-6 cursor-pointer hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-2 flex-1 pr-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${statusBadgeStyle}`}>
                            {post.status}
                          </span>
                          <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${categoryBadgeStyle}`}>
                            {post.category}
                          </span>
                          <span className="inline-flex items-center gap-1 text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-slate-900 text-white">
                            <Tag className="w-3 h-3" />
                            {post.price}
                          </span>
                          <span className="text-xs text-slate-400 font-medium sm:hidden ml-auto">
                            {post.created_at}
                          </span>
                        </div>

                        <h3
                          className={`text-base sm:text-lg font-bold transition-colors leading-snug ${
                            post.status === '거래완료'
                              ? 'text-slate-400 line-through'
                              : 'text-slate-900 hover:text-emerald-600'
                          }`}
                        >
                          {post.title}
                        </h3>

                        <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-500 font-medium">
                          <span>작성자: {post.author}</span>
                          <span>•</span>
                          <span className="hidden sm:inline">등록일: {post.created_at}</span>
                          <span>•</span>
                          <span className="text-emerald-600 font-bold">
                            댓글 {post.replies ? post.replies.length : 0}개
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                        {canDelete(post.author_id) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteMarketPost(post.id);
                            }}
                            className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors text-xs font-semibold cursor-pointer"
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

                    {isOpen && (
                      <div className="border-t border-slate-100 p-6 sm:p-8 bg-slate-50/40 space-y-6">
                        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-emerald-800">
                              <span>희망 가격/조건:</span>
                              <span className="px-3 py-1 rounded-lg bg-emerald-100 text-emerald-900">{post.price}</span>
                            </div>

                            {canDelete(post.author_id) && (
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs text-slate-500 mr-1">거래상태 변경:</span>
                                {(['거래가능', '예약중', '거래완료'] as const).map((st) => (
                                  <button
                                    key={st}
                                    type="button"
                                    onClick={() => handleUpdateMarketStatus(post.id, st)}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                                      post.status === st
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                                  >
                                    {st}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>

                          <p className="text-slate-800 text-sm sm:text-base leading-relaxed whitespace-pre-line font-normal">
                            {post.content}
                          </p>
                        </div>

                        {/* Market Replies */}
                        <div className="space-y-3">
                          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                            <MessageCircle className="w-4 h-4 text-emerald-600" />
                            거래/나눔 댓글 ({post.replies ? post.replies.length : 0})
                          </h4>

                          {post.replies &&
                            post.replies.map((r) => (
                              <div
                                key={r.id}
                                className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 text-xs sm:text-sm space-y-1.5"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-slate-900">{r.author}</span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-slate-400">{r.created_at}</span>
                                    {canDelete(r.author_id) && (
                                      <button
                                        onClick={() => handleDeleteMarketReply(post.id, r.id)}
                                        className="text-rose-500 hover:underline text-xs font-semibold cursor-pointer"
                                      >
                                        삭제
                                      </button>
                                    )}
                                  </div>
                                </div>
                                <p className="text-slate-700 leading-relaxed whitespace-pre-line">{r.content}</p>
                              </div>
                            ))}

                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-2">
                            <input
                              type="text"
                              placeholder={member || isAdmin ? '구매/나눔 문의 댓글을 남겨보세요...' : '로그인 후 댓글을 작성하실 수 있습니다.'}
                              value={marketReplyInputMap[post.id] || ''}
                              onChange={(e) =>
                                setMarketReplyInputMap((prev) => ({ ...prev, [post.id]: e.target.value }))
                              }
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleAddMarketReply(post.id);
                              }}
                              className="sm:col-span-3 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                            />
                            <button
                              onClick={() => handleAddMarketReply(post.id)}
                              className="sm:col-span-1 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                            >
                              <Send className="w-3.5 h-3.5" />
                              댓글 등록
                            </button>
                          </div>
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
      {/* TAB 4: Q&A 코너 (Q&A Board) - 누구나 질문/답변댓글 작성 가능   */}
      {/* ============================================================ */}
      {activeTab === 'qna' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-violet-50/70 border border-violet-200/80 rounded-3xl p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <HelpCircle className="w-6 h-6 text-violet-700" />
                <h3 className="font-bold text-violet-950 text-lg">학우 Q&A 코너 (무엇이든 물어보세요)</h3>
              </div>
              <p className="text-sm sm:text-base text-violet-900 leading-relaxed">
                전공 공부 중 막히는 부분, 출석수업·대체시험·과제물 팁, 학사 행정 및 진로 고민까지 회원가입한 학우 누구나 자유롭게 질문하고 답변을 나눌 수 있습니다.
              </p>
            </div>
            <button
              onClick={() => checkLoginBeforeOpen(() => setIsWriteQnaModalOpen(true))}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm shrink-0 self-start sm:self-center shadow-xs transition-colors cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              질문 등록하기
            </button>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <Filter className="w-4 h-4 text-slate-400 mr-1 hidden sm:inline" />
              {['전체', '전공/학습', '학사/행정', '출석/과제/시험', '진로/자격증', '기타질문'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setQnaCategoryFilter(cat)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                    qnaCategoryFilter === cat
                      ? 'bg-violet-600 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <span className="text-xs sm:text-sm text-slate-500 font-medium">
              총 <strong className="text-slate-900 font-bold">{qnaPosts.length}</strong>개의 질문
            </span>
          </div>

          {/* Q&A Posts List */}
          <div className="space-y-4">
            {qnaPosts.filter((q) => qnaCategoryFilter === '전체' || q.category === qnaCategoryFilter).length === 0 ? (
              <div className="py-16 text-center bg-white rounded-3xl border border-slate-200/90 shadow-xs">
                <p className="font-semibold text-slate-700 text-base mb-1">등록된 질문이 없습니다.</p>
                <p className="text-xs sm:text-sm text-slate-400">전공 과목, 출석수업, 시험 팁 등 궁금한 점을 첫 번째로 질문해 보세요!</p>
              </div>
            ) : qnaPosts
              .filter((q) => qnaCategoryFilter === '전체' || q.category === qnaCategoryFilter)
              .map((qna) => {
                const isOpen = openQnaPostId === qna.id;
                const hasReplies = qna.replies && qna.replies.length > 0;
                return (
                  <div
                    key={qna.id}
                    className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden transition-all"
                  >
                    <div
                      onClick={() => setOpenQnaPostId(isOpen ? null : qna.id)}
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
                            {hasReplies ? '✓ 답변완료' : '⏳ 답변대기'}
                          </span>
                          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-200">
                            {qna.category}
                          </span>
                          <span className="text-xs text-slate-400 font-medium sm:hidden ml-auto">
                            {qna.created_at}
                          </span>
                        </div>

                        <h3 className="text-base sm:text-lg font-bold text-slate-900 hover:text-violet-600 transition-colors leading-snug">
                          <span className="text-violet-600 font-extrabold mr-1.5">Q.</span>
                          {qna.title}
                        </h3>

                        <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-500 font-medium">
                          <span>질문자: {qna.author}</span>
                          <span>•</span>
                          <span className="hidden sm:inline">등록일: {qna.created_at}</span>
                          <span>•</span>
                          <span className="text-violet-600 font-bold">
                            답변/댓글 {qna.replies ? qna.replies.length : 0}개
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                        {canDelete(qna.author_id) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteQnaPost(qna.id);
                            }}
                            className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors text-xs font-semibold cursor-pointer"
                            title="질문글 삭제"
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
                          <span className="text-xs font-bold text-violet-600 tracking-wider uppercase">
                            질문 내용
                          </span>
                          <p className="text-slate-800 text-sm sm:text-base leading-relaxed whitespace-pre-line font-normal">
                            {qna.content}
                          </p>
                        </div>

                        {/* Q&A Replies */}
                        <div className="space-y-3">
                          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-violet-600" />
                            답변 및 댓글 ({qna.replies ? qna.replies.length : 0})
                          </h4>

                          {!qna.replies || qna.replies.length === 0 ? (
                            <div className="p-4 rounded-2xl bg-violet-50/60 border border-violet-200/70 text-violet-900 text-xs sm:text-sm">
                              💡 첫 번째 답변을 남겨 학우의 궁금증을 해결해 주세요!
                            </div>
                          ) : (
                            qna.replies.map((r) => (
                              <div
                                key={r.id}
                                className="bg-white p-4 sm:p-5 rounded-2xl border border-violet-200/80 text-xs sm:text-sm space-y-1.5 shadow-2xs"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 rounded-md bg-violet-100 text-violet-800 font-bold text-xs">
                                      A. 답변
                                    </span>
                                    <span className="font-bold text-slate-900">{r.author}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-slate-400">{r.created_at}</span>
                                    {canDelete(r.author_id) && (
                                      <button
                                        onClick={() => handleDeleteQnaReply(qna.id, r.id)}
                                        className="text-rose-500 hover:underline text-xs font-semibold cursor-pointer"
                                      >
                                        삭제
                                      </button>
                                    )}
                                  </div>
                                </div>
                                <p className="text-slate-700 leading-relaxed whitespace-pre-line pt-1">{r.content}</p>
                              </div>
                            ))
                          )}

                          {/* Write Q&A Reply (회원가입한 누구나 가능) */}
                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-2">
                            <input
                              type="text"
                              placeholder={member || isAdmin ? '학우의 질문에 답변이나 댓글을 남겨보세요...' : '로그인 후 답변을 작성하실 수 있습니다.'}
                              value={qnaReplyInputMap[qna.id] || ''}
                              onChange={(e) =>
                                setQnaReplyInputMap((prev) => ({ ...prev, [qna.id]: e.target.value }))
                              }
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleAddQnaReply(qna.id);
                              }}
                              className="sm:col-span-3 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white focus:ring-2 focus:ring-violet-500 outline-none"
                            />
                            <button
                              onClick={() => handleAddQnaReply(qna.id)}
                              className="sm:col-span-1 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
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
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 1: Write Free Post                                     */}
      {/* ============================================================ */}
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
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
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
                  <div className="w-full px-3 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs sm:text-sm font-semibold">
                    {writerDisplayName}
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">제목 *</label>
                <input
                  type="text"
                  required
                  value={freeTitle}
                  onChange={(e) => setFreeTitle(e.target.value)}
                  placeholder="게시글 제목을 입력해 주세요"
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
                  placeholder="내용을 작성해 주세요..."
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 leading-relaxed"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsWriteFreeModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingFree}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {isSubmittingFree ? '등록 중...' : '게시글 등록'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 2: Write Feedback (학생회에 바란다)                      */}
      {/* ============================================================ */}
      {isWriteFeedbackModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 p-6 sm:p-8 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg text-slate-900">학생회에 바란다 작성</h3>
                  <p className="text-xs text-slate-500">학생회에 건의하거나 바라는 내용을 작성해 주세요.</p>
                </div>
              </div>
              <button
                onClick={() => setIsWriteFeedbackModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
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
                    <option value="학사/수업">학사 일정 & 출석수업</option>
                    <option value="행사/스터디">학과 행사 & 스터디 지원</option>
                    <option value="학생회운영">학생회 운영 건의</option>
                    <option value="기타">기타 제안</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">작성자</label>
                  <div className="w-full px-3 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs sm:text-sm font-semibold">
                    {writerDisplayName}
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">제목 *</label>
                <input
                  type="text"
                  required
                  value={feedbackTitle}
                  onChange={(e) => setFeedbackTitle(e.target.value)}
                  placeholder="제목을 간결히 입력해 주세요"
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
                  placeholder="학생회에 바라는 상세 내용을 적어주세요. 학생회 임원, 학생회장, 관리자가 확인 후 답변 댓글을 달아드립니다."
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                />
              </div>

              <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-600 flex items-center gap-2 border border-slate-200">
                <AlertCircle className="w-4 h-4 text-slate-400 shrink-0" />
                <span>답변 댓글은 학생회 임원, 학생회장 및 관리자 등급만 등록할 수 있습니다.</span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsWriteFeedbackModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingFeedback}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {isSubmittingFeedback ? '등록 중...' : '등록하기'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 3: Write Market Post (벼룩시장)                          */}
      {/* ============================================================ */}
      {isWriteMarketModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 p-6 sm:p-8 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg text-slate-900">벼룩시장 글쓰기</h3>
                  <p className="text-xs text-slate-500">중고 교재·학용품·물품 나눔 및 거래 글을 등록해 주세요.</p>
                </div>
              </div>
              <button
                onClick={() => setIsWriteMarketModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMarketPost} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">거래 구분</label>
                  <select
                    value={marketCategory}
                    onChange={(e) => {
                      const val = e.target.value as MarketPost['category'];
                      setMarketCategory(val);
                      if (val === '무료나눔') setMarketPrice('무료나눔');
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="팝니다">팝니다</option>
                    <option value="삽니다">삽니다</option>
                    <option value="무료나눔">무료나눔</option>
                    <option value="교재교환">교재교환</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">희망 가격/조건</label>
                  <input
                    type="text"
                    value={marketCategory === '무료나눔' ? '무료나눔' : marketPrice}
                    disabled={marketCategory === '무료나눔'}
                    onChange={(e) => setMarketPrice(e.target.value)}
                    placeholder="예: 10,000원, 무료나눔, 협의"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-100"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">작성자</label>
                  <div className="w-full px-3 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs sm:text-sm font-semibold">
                    {writerDisplayName}
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">제목 *</label>
                <input
                  type="text"
                  required
                  value={marketTitle}
                  onChange={(e) => setMarketTitle(e.target.value)}
                  placeholder="예: [2학년 1학기] 자료구조, 선형대수 교재 상태 깨끗한 것 팝니다"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">상세 설명 (물품 상태, 거래 방법 등) *</label>
                <textarea
                  required
                  rows={5}
                  value={marketContent}
                  onChange={(e) => setMarketContent(e.target.value)}
                  placeholder="교재/물품 상태, 직거래(광주지역대학) 또는 택배 여부 등을 자유롭게 적어주세요."
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 leading-relaxed"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsWriteMarketModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingMarket}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {isSubmittingMarket ? '등록 중...' : '벼룩시장 등록'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 4: Write Q&A Post (Q&A 코너)                             */}
      {/* ============================================================ */}
      {isWriteQnaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 p-6 sm:p-8 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-violet-50 text-violet-600">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg text-slate-900">Q&A 질문 등록하기</h3>
                  <p className="text-xs text-slate-500">학업·학사·진로 등 궁금한 점을 학우들에게 물어보세요.</p>
                </div>
              </div>
              <button
                onClick={() => setIsWriteQnaModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateQnaPost} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">질문 분야</label>
                  <select
                    value={qnaCategory}
                    onChange={(e) => setQnaCategory(e.target.value as QnaPost['category'])}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm focus:ring-2 focus:ring-violet-500"
                  >
                    <option value="전공/학습">전공/학습 질문</option>
                    <option value="학사/행정">학사/행정 문의</option>
                    <option value="출석/과제/시험">출석수업·과제·시험</option>
                    <option value="진로/자격증">진로·취업·자격증</option>
                    <option value="기타질문">기타 질문</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">질문자</label>
                  <div className="w-full px-3 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs sm:text-sm font-semibold">
                    {writerDisplayName}
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">질문 제목 *</label>
                <input
                  type="text"
                  required
                  value={qnaTitle}
                  onChange={(e) => setQnaTitle(e.target.value)}
                  placeholder="궁금하신 내용을 한눈에 알 수 있도록 제목을 입력해 주세요"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">질문 상세 내용 *</label>
                <textarea
                  required
                  rows={5}
                  value={qnaContent}
                  onChange={(e) => setQnaContent(e.target.value)}
                  placeholder="궁금한 내용을 자세히 적어주시면 선배 및 동료 학우들이 더 정확하게 답변해 드릴 수 있습니다."
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-violet-500 leading-relaxed"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsWriteQnaModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingQna}
                  className="px-5 py-2.5 rounded-xl bg-violet-600 text-white font-bold text-xs hover:bg-violet-700 transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {isSubmittingQna ? '등록 중...' : '질문 등록'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
