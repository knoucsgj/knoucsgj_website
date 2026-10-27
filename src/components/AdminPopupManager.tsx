import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { showConfirm, showAlert } from './ui/GlobalDialog';
import type {
  PopupItem,
  Notice,
  ActivityReport,
  AcademicEvent,
  AcademicMaterial,
  FreePost,
  FeedbackItem,
  MarketPost,
  QnaPost
} from '../lib/types';
import {
  Layers,
  PlusCircle,
  Pencil,
  Trash2,
  Eye,
  CheckCircle2,
  XCircle,
  Sparkles,
  X,
  ArrowRight,
  Bell
} from 'lucide-react';

interface AdminPopupManagerProps {
  canManage: boolean;
}

const getCategoryLabel = (type: PopupItem['target_type']) => {
  switch (type) {
    case 'notice':
      return '공지사항';
    case 'activity':
      return '활동보고';
    case 'event':
      return '학사일정';
    case 'material':
      return '학습자료';
    case 'free':
      return '자유게시판';
    case 'feedback':
      return '학생회에 바란다';
    case 'market':
      return '벼룩시장';
    case 'qna':
      return 'Q&A 코너';
    case 'direct':
    default:
      return '직접 지정';
  }
};

const getCategoryBadgeClass = (type: PopupItem['target_type']) => {
  switch (type) {
    case 'notice':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'activity':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'event':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'material':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'free':
      return 'bg-sky-50 text-sky-700 border-sky-200';
    case 'feedback':
      return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    case 'market':
      return 'bg-teal-50 text-teal-700 border-teal-200';
    case 'qna':
      return 'bg-violet-50 text-violet-700 border-violet-200';
    case 'direct':
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

export const AdminPopupManager: React.FC<AdminPopupManagerProps> = ({ canManage }) => {
  const [popups, setPopups] = useState<PopupItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPopup, setEditingPopup] = useState<PopupItem | null>(null);

  // Form Fields
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formTargetType, setFormTargetType] = useState<PopupItem['target_type']>('notice');
  const [formTargetId, setFormTargetId] = useState('');
  const [formTargetUrl, setFormTargetUrl] = useState('');
  const [formLinkText, setFormLinkText] = useState('자세히 보기');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);
  const [formStartDate, setFormStartDate] = useState('');
  const [formEndDate, setFormEndDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Selectable Source Posts
  const [selectableNotices, setSelectableNotices] = useState<Notice[]>([]);
  const [selectableActivities, setSelectableActivities] = useState<ActivityReport[]>([]);
  const [selectableEvents, setSelectableEvents] = useState<AcademicEvent[]>([]);
  const [selectableMaterials, setSelectableMaterials] = useState<AcademicMaterial[]>([]);
  const [selectableFreePosts, setSelectableFreePosts] = useState<FreePost[]>([]);
  const [selectableFeedbacks, setSelectableFeedbacks] = useState<FeedbackItem[]>([]);
  const [selectableMarketPosts, setSelectableMarketPosts] = useState<MarketPost[]>([]);
  const [selectableQnaPosts, setSelectableQnaPosts] = useState<QnaPost[]>([]);

  // Preview Modal State
  const [previewItem, setPreviewItem] = useState<PopupItem | null>(null);

  useEffect(() => {
    if (canManage) {
      loadPopups();
      loadSourcePosts();
    }
  }, [canManage]);

  const loadPopups = async () => {
    try {
      setLoading(true);
      const data = await api.getAllPopups();
      setPopups(data);
    } catch (err) {
      console.error(err);
      await showAlert({
        title: '팝업 목록 조회 실패',
        message: '팝업 목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.',
        variant: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSourcePosts = async () => {
    try {
      const [n, a, e, m, fp, fb, mk, qna] = await Promise.all([
        api.getNotices(),
        api.getActivities(),
        api.getEvents(),
        api.getMaterials(),
        api.getFreePosts(),
        api.getFeedbacks(),
        api.getMarketPosts(),
        api.getQnaPosts()
      ]);
      setSelectableNotices(n);
      setSelectableActivities(a);
      setSelectableEvents(e);
      setSelectableMaterials(m);
      setSelectableFreePosts(fp);
      setSelectableFeedbacks(fb);
      setSelectableMarketPosts(mk);
      setSelectableQnaPosts(qna);
    } catch (err) {
      console.error('Failed to load source posts for popup selection', err);
    } finally {
      /* done */
    }
  };

  const openCreateModal = () => {
    setEditingPopup(null);
    setFormTitle('');
    setFormContent('');
    setFormTargetType('notice');
    setFormTargetId('');
    setFormTargetUrl('');
    setFormLinkText('자세히 보기');
    setFormImageUrl('');
    setFormIsActive(true);
    setFormStartDate(new Date().toISOString().split('T')[0]);
    setFormEndDate('');
    setIsModalOpen(true);
  };

  const openEditModal = (p: PopupItem) => {
    setEditingPopup(p);
    setFormTitle(p.title);
    setFormContent(p.content);
    setFormTargetType(p.target_type);
    setFormTargetId(p.target_id || '');
    setFormTargetUrl(p.target_url);
    setFormLinkText(p.link_text || '자세히 보기');
    setFormImageUrl(p.image_url || '');
    setFormIsActive(p.is_active);
    setFormStartDate(p.start_date || '');
    setFormEndDate(p.end_date || '');
    setIsModalOpen(true);
  };

  // Handler when user selects a target post from dropdown
  const handleSelectPost = (postId: string) => {
    setFormTargetId(postId);
    if (!postId) return;

    switch (formTargetType) {
      case 'notice': {
        const item = selectableNotices.find((n) => n.id === postId);
        if (item) {
          setFormTitle(item.title);
          setFormContent(item.content.slice(0, 200) + (item.content.length > 200 ? '...' : ''));
          setFormTargetUrl(`/notices?id=${item.id}`);
          if (item.attachments && item.attachments[0] && /\.(jpg|jpeg|png|webp|gif)$/i.test(item.attachments[0].url)) {
            setFormImageUrl(item.attachments[0].url);
          }
        }
        break;
      }
      case 'activity': {
        const item = selectableActivities.find((a) => a.id === postId);
        if (item) {
          setFormTitle(item.title);
          setFormContent(item.description ? item.description.slice(0, 200) + (item.description.length > 200 ? '...' : '') : '');
          setFormTargetUrl(`/notices?tab=activities&id=${item.id}`);
          if (item.thumbnail_url || (item.media_type === 'image' && item.media_url)) {
            setFormImageUrl(item.thumbnail_url || item.media_url);
          }
        }
        break;
      }
      case 'event': {
        const item = selectableEvents.find((e) => e.id === postId);
        if (item) {
          setFormTitle(`[학사일정] ${item.title}`);
          setFormContent(item.description ? item.description.slice(0, 200) : `${item.start_date} ~ ${item.end_date}`);
          setFormTargetUrl(`/calendar?date=${item.start_date}`);
        }
        break;
      }
      case 'material': {
        const item = selectableMaterials.find((m) => m.id === postId);
        if (item) {
          setFormTitle(`[학습자료] ${item.title}`);
          setFormContent(item.description ? item.description.slice(0, 200) : `${item.grade}학년 ${item.semester}학기 ${item.course_name}`);
          setFormTargetUrl(`/studies?id=${item.id}`);
        }
        break;
      }
      case 'free': {
        const item = selectableFreePosts.find((f) => f.id === postId);
        if (item) {
          setFormTitle(item.title);
          setFormContent(item.content.slice(0, 200));
          setFormTargetUrl(`/community?tab=free&id=${item.id}`);
        }
        break;
      }
      case 'feedback': {
        const item = selectableFeedbacks.find((f) => f.id === postId);
        if (item) {
          setFormTitle(item.title);
          setFormContent(item.content.slice(0, 200));
          setFormTargetUrl(`/community?tab=feedback&id=${item.id}`);
        }
        break;
      }
      case 'market': {
        const item = selectableMarketPosts.find((m) => m.id === postId);
        if (item) {
          setFormTitle(`[${item.category}] ${item.title}`);
          setFormContent(item.content.slice(0, 200));
          setFormTargetUrl(`/community?tab=market&id=${item.id}`);
        }
        break;
      }
      case 'qna': {
        const item = selectableQnaPosts.find((q) => q.id === postId);
        if (item) {
          setFormTitle(`[Q&A] ${item.title}`);
          setFormContent(item.content.slice(0, 200));
          setFormTargetUrl(`/community?tab=qna&id=${item.id}`);
        }
        break;
      }
      default:
        break;
    }
  };

  const handleToggleActive = async (p: PopupItem) => {
    try {
      const nextActive = !p.is_active;
      await api.updatePopup(p.id, { is_active: nextActive });
      setPopups((prev) =>
        prev.map((item) => (item.id === p.id ? { ...item, is_active: nextActive } : item))
      );
    } catch (err: any) {
      await showAlert({
        title: '상태 변경 실패',
        message: err.message || '상태 변경 중 오류가 발생했습니다.',
        variant: 'error'
      });
    }
  };

  const handleDelete = async (p: PopupItem) => {
    const confirmed = await showConfirm({
      title: '팝업 삭제 확인',
      message: `"${p.title}" 팝업을 정말 삭제하시겠습니까?`,
      subMessage: '삭제 후에는 복구할 수 없으며 즉시 사용자 화면에서 제외됩니다.',
      confirmText: '삭제하기',
      variant: 'danger'
    });
    if (!confirmed) return;

    try {
      await api.deletePopup(p.id);
      setPopups((prev) => prev.filter((item) => item.id !== p.id));
      await showAlert({
        title: '삭제 완료',
        message: '팝업이 안전하게 삭제되었습니다.',
        variant: 'success'
      });
    } catch (err: any) {
      await showAlert({
        title: '삭제 실패',
        message: err.message || '삭제 중 오류가 발생했습니다.',
        variant: 'error'
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      await showAlert({ title: '입력 확인', message: '팝업 제목을 입력해 주세요.', variant: 'warning' });
      return;
    }
    if (!formTargetUrl.trim()) {
      await showAlert({ title: '입력 확인', message: '자세히 보기 클릭 시 이동할 링크 URL을 입력해 주세요.', variant: 'warning' });
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        title: formTitle.trim(),
        content: formContent.trim(),
        target_type: formTargetType,
        target_id: formTargetId || null,
        target_url: formTargetUrl.trim(),
        link_text: formLinkText.trim() || '자세히 보기',
        image_url: formImageUrl.trim() || null,
        is_active: formIsActive,
        start_date: formStartDate || null,
        end_date: formEndDate || null,
      };

      if (editingPopup) {
        const updated = await api.updatePopup(editingPopup.id, payload);
        setPopups((prev) => prev.map((item) => (item.id === editingPopup.id ? updated : item)));
        await showAlert({ title: '수정 완료', message: '팝업 설정이 성공적으로 수정되었습니다.', variant: 'success' });
      } else {
        const created = await api.createPopup(payload);
        setPopups((prev) => [created, ...prev]);
        await showAlert({ title: '등록 완료', message: '새로운 팝업이 등록되었습니다.', variant: 'success' });
      }

      setIsModalOpen(false);
    } catch (err: any) {
      await showAlert({
        title: '저장 실패',
        message: err.message || '팝업 저장 중 오류가 발생했습니다.',
        variant: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Status helper
  const getPopupStatus = (p: PopupItem) => {
    if (!p.is_active) return { label: '비활성', class: 'bg-slate-100 text-slate-500 border-slate-200' };
    const today = new Date().toISOString().split('T')[0];
    if (p.start_date && p.start_date > today) {
      return { label: '노출예정', class: 'bg-amber-50 text-amber-700 border-amber-200' };
    }
    if (p.end_date && p.end_date < today) {
      return { label: '기간종료', class: 'bg-rose-50 text-rose-600 border-rose-200' };
    }
    return { label: '노출중', class: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
  };

  if (!canManage) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center text-slate-500">
        <p className="font-bold text-base text-slate-800">접근 권한이 없습니다.</p>
        <p className="text-xs text-slate-400 mt-1">팝업 설정은 관리자 또는 학생회장 등급만 이용 가능합니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Banner */}
      <div className="bg-gradient-to-r from-pink-50/90 via-purple-50/60 to-blue-50/70 border border-pink-200/80 rounded-3xl p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <Layers className="w-6 h-6 text-pink-600 shrink-0" />
            <h3 className="font-bold text-slate-900 text-lg sm:text-xl">팝업 공지 관리</h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
            홈페이지 메인화면 접속 시 띄울 팝업 공지를 관리합니다. 공지사항, 활동보고, 학사일정, 학습자료, 커뮤니티 등 <strong>모든 게시물을 원클릭으로 선택</strong>하여 자세히 보기 링크와 함께 팝업으로 노출할 수 있습니다.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all shrink-0 cursor-pointer self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>새 팝업 등록</span>
        </button>
      </div>

      {/* Popups List */}
      {loading ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-slate-200 text-slate-400 text-sm">
          팝업 목록을 불러오는 중입니다...
        </div>
      ) : popups.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <Layers className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="font-semibold text-slate-700 text-base">등록된 팝업이 없습니다.</p>
          <p className="text-xs text-slate-400">
            중요한 학과 공지사항이나 오프라인 행사, 모집 일정을 팝업으로 등록해 보세요!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {popups.map((p) => {
            const status = getPopupStatus(p);
            return (
              <div
                key={p.id}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs hover:border-pink-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-5"
              >
                <div className="space-y-2.5 flex-1 pr-2">
                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    <span className={`font-bold px-2.5 py-0.5 rounded-full border ${status.class}`}>
                      {status.label}
                    </span>
                    <span className={`font-semibold px-2.5 py-0.5 rounded-full border ${getCategoryBadgeClass(p.target_type)}`}>
                      {getCategoryLabel(p.target_type)}
                    </span>
                    <span className="text-slate-400 font-medium">
                      노출기간: {p.start_date || '즉시'} ~ {p.end_date || '기한없음'}
                    </span>
                    {p.created_by && (
                      <span className="text-slate-400 font-medium ml-auto hidden sm:inline">
                        등록자: {p.created_by}
                      </span>
                    )}
                  </div>

                  <h4 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                    {p.title}
                  </h4>

                  <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
                    {p.content}
                  </p>

                  <div className="flex items-center gap-3 text-xs text-slate-500 font-medium pt-1">
                    <span className="inline-flex items-center gap-1 text-pink-600 font-bold bg-pink-50 px-2.5 py-1 rounded-lg border border-pink-100">
                      버튼: {p.link_text || '자세히 보기'} ➔
                    </span>
                    <span className="truncate max-w-xs text-slate-400" title={p.target_url}>
                      연결: {p.target_url}
                    </span>
                    {p.image_url && (
                      <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100 text-[11px]">
                        이미지 첨부됨
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                  {/* ON/OFF Switch */}
                  <button
                    onClick={() => handleToggleActive(p)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      p.is_active
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                        : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
                    }`}
                    title="즉시 노출 상태 토글"
                  >
                    {p.is_active ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    <span>{p.is_active ? 'ON' : 'OFF'}</span>
                  </button>

                  {/* Preview Button */}
                  <button
                    onClick={() => setPreviewItem(p)}
                    className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                    title="실제 팝업 미리보기"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  {/* Edit Button */}
                  <button
                    onClick={() => openEditModal(p)}
                    className="p-2 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                    title="팝업 수정"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDelete(p)}
                    className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    title="팝업 삭제"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <h3 className="font-bold text-base sm:text-lg flex items-center gap-2">
                <Layers className="w-5 h-5 text-pink-400" />
                {editingPopup ? '팝업 공지 수정' : '새 팝업 공지 등록'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1 text-sm">
              {/* STEP 1: 대상 게시판 및 게시물 선택 */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-pink-600" />
                    1. 팝업 대상 게시판 선택 (원클릭 자동 완성)
                  </label>
                  <span className="text-xs text-slate-500">모든 게시물 지원</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { type: 'notice', label: '공지사항' },
                    { type: 'activity', label: '활동보고' },
                    { type: 'event', label: '학사일정' },
                    { type: 'material', label: '학습자료' },
                    { type: 'free', label: '자유게시판' },
                    { type: 'feedback', label: '학생회 건의' },
                    { type: 'market', label: '벼룩시장' },
                    { type: 'qna', label: 'Q&A 코너' },
                  ].map((cat) => (
                    <button
                      key={cat.type}
                      type="button"
                      onClick={() => {
                        setFormTargetType(cat.type as any);
                        setFormTargetId('');
                      }}
                      className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        formTargetType === cat.type
                          ? 'bg-pink-600 text-white border-pink-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Post Select Dropdown */}
                <div className="pt-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    {getCategoryLabel(formTargetType)} 등록 목록에서 선택:
                  </label>
                  <select
                    value={formTargetId}
                    onChange={(e) => handleSelectPost(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm font-medium focus:ring-2 focus:ring-pink-500 outline-none"
                  >
                    <option value="">-- 게시물을 선택하면 제목과 링크가 자동 완성됩니다 --</option>
                    {formTargetType === 'notice' &&
                      selectableNotices.map((n) => (
                        <option key={n.id} value={n.id}>
                          [{n.category}] {n.title} ({n.created_at})
                        </option>
                      ))}
                    {formTargetType === 'activity' &&
                      selectableActivities.map((a) => (
                        <option key={a.id} value={a.id}>
                          [{a.category}] {a.title} ({a.activity_date})
                        </option>
                      ))}
                    {formTargetType === 'event' &&
                      selectableEvents.map((e) => (
                        <option key={e.id} value={e.id}>
                          [{e.category}] {e.title} ({e.start_date} ~ {e.end_date})
                        </option>
                      ))}
                    {formTargetType === 'material' &&
                      selectableMaterials.map((m) => (
                        <option key={m.id} value={m.id}>
                          [{m.course_name}] {m.title} ({m.grade}학년 {m.semester}학기)
                        </option>
                      ))}
                    {formTargetType === 'free' &&
                      selectableFreePosts.map((f) => (
                        <option key={f.id} value={f.id}>
                          [{f.category}] {f.title} ({f.created_at})
                        </option>
                      ))}
                    {formTargetType === 'feedback' &&
                      selectableFeedbacks.map((f) => (
                        <option key={f.id} value={f.id}>
                          [{f.status}] {f.title} ({f.created_at})
                        </option>
                      ))}
                    {formTargetType === 'market' &&
                      selectableMarketPosts.map((m) => (
                        <option key={m.id} value={m.id}>
                          [{m.category}] {m.title} ({m.price})
                        </option>
                      ))}
                    {formTargetType === 'qna' &&
                      selectableQnaPosts.map((q) => (
                        <option key={q.id} value={q.id}>
                          [{q.status}] {q.title} ({q.created_at})
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* STEP 2: 상세 설정 */}
              <div className="space-y-4">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    팝업 제목 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="팝업 상단에 표시될 제목을 입력하세요"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-pink-500 outline-none text-slate-900 font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    팝업 본문 요약 / 안내 내용
                  </label>
                  <textarea
                    rows={4}
                    value={formContent}
                    onChange={(e) => setFormContent(e.target.value)}
                    placeholder="팝업 창 내부에 보여줄 안내 문구나 게시물 요약을 입력하세요."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-pink-500 outline-none text-slate-800 leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      이동 링크 URL (자세히 보기 대상) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formTargetUrl}
                      onChange={(e) => setFormTargetUrl(e.target.value)}
                      placeholder="/notices?id=... 또는 https://..."
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-pink-500 outline-none text-xs sm:text-sm font-mono text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      버튼 문구
                    </label>
                    <input
                      type="text"
                      value={formLinkText}
                      onChange={(e) => setFormLinkText(e.target.value)}
                      placeholder="자세히 보기"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-pink-500 outline-none text-xs sm:text-sm text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    배너/포스터 이미지 URL (선택)
                  </label>
                  <input
                    type="text"
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    placeholder="https://... 또는 첨부 이미지 URL"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-pink-500 outline-none text-xs sm:text-sm text-slate-800"
                  />
                  {formImageUrl && (
                    <div className="mt-2 h-24 w-auto rounded-xl overflow-hidden border border-slate-200 inline-block">
                      <img src={formImageUrl} alt="미리보기" className="h-full object-cover" />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      노출 시작일 (선택)
                    </label>
                    <input
                      type="date"
                      value={formStartDate}
                      onChange={(e) => setFormStartDate(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-pink-500 outline-none text-xs sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      노출 종료일 (선택)
                    </label>
                    <input
                      type="date"
                      value={formEndDate}
                      onChange={(e) => setFormEndDate(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-pink-500 outline-none text-xs sm:text-sm"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="popupActiveCheckbox"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="w-4 h-4 text-pink-600 rounded border-slate-300 focus:ring-pink-500 cursor-pointer"
                  />
                  <label htmlFor="popupActiveCheckbox" className="font-bold text-slate-800 text-xs sm:text-sm cursor-pointer">
                    즉시 활성화하여 노출 (체크 해제 시 비활성화 저장)
                  </label>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() =>
                    setPreviewItem({
                      id: 'preview',
                      title: formTitle || '팝업 미리보기 제목',
                      content: formContent || '팝업 본문 안내 문구 미리보기입니다.',
                      target_type: formTargetType,
                      target_id: formTargetId,
                      target_url: formTargetUrl || '#',
                      link_text: formLinkText || '자세히 보기',
                      image_url: formImageUrl || null,
                      is_active: formIsActive,
                      start_date: formStartDate,
                      end_date: formEndDate,
                      created_at: new Date().toISOString(),
                      updated_at: new Date().toISOString()
                    })
                  }
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                  미리보기
                </button>

                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors cursor-pointer"
                >
                  취소
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? '저장 중...' : editingPopup ? '수정 내용 저장' : '새 팝업 등록'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POPUP PREVIEW MODAL */}
      {previewItem && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <h3 className="font-bold text-sm sm:text-base flex items-center gap-1.5 text-slate-100">
                <Bell className="w-4 h-4 text-amber-400" />
                컴퓨터과학과 알림 (미리보기 화면)
              </h3>
              <button
                onClick={() => setPreviewItem(null)}
                className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className={`font-bold px-3 py-1 rounded-full border ${getCategoryBadgeClass(previewItem.target_type)}`}>
                  {getCategoryLabel(previewItem.target_type)}
                </span>
                {previewItem.end_date && (
                  <span className="text-slate-500 font-medium">~ {previewItem.end_date}까지</span>
                )}
              </div>

              <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                {previewItem.title}
              </h2>

              {previewItem.image_url && (
                <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 max-h-60 sm:max-h-72">
                  <img src={previewItem.image_url} alt="팝업 이미지" className="w-full h-full object-cover" />
                </div>
              )}

              <div className="text-sm sm:text-base text-slate-700 whitespace-pre-wrap leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                {previewItem.content}
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    showAlert({
                      title: '자세히 보기 링크 테스트',
                      message: `실제 사용자 화면에서는 "${previewItem.target_url}" 위치로 이동합니다.`,
                      variant: 'info'
                    });
                  }}
                  className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm sm:text-base shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{previewItem.link_text || '자세히 보기'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="px-6 py-3.5 bg-slate-100/90 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
              <span>오늘 하루 보지 않기 (시뮬레이션)</span>
              <button
                onClick={() => setPreviewItem(null)}
                className="px-4 py-1.5 rounded-xl bg-white border border-slate-300 font-bold hover:bg-slate-50 cursor-pointer"
              >
                미리보기 닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
