import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import type { Notice, NoticeCategory } from '../lib/types';
import { formatDate } from '../lib/dateUtils';
import {
  Search,
  Pin,
  Eye,
  PlusCircle,
  X,
  FileText,
  Download,
  Filter
} from 'lucide-react';

export const NoticesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<NoticeCategory>('전체');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Notice Detail Modal State
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);

  // New Notice Modal State
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<'필독' | '학생회' | '학사' | '행사'>('학생회');
  const [newAuthor, setNewAuthor] = useState('학생회');
  const [newIsPinned, setNewIsPinned] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadNotices();
  }, []);

  const loadNotices = async () => {
    try {
      setLoading(true);
      const data = await api.getNotices();
      setNotices(data);

      // Check if URL has ?id=xxx
      const targetId = searchParams.get('id');
      if (targetId) {
        const found = data.find((n) => n.id === targetId);
        if (found) {
          setSelectedNotice(found);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectNotice = (notice: Notice) => {
    setSelectedNotice(notice);
    setSearchParams({ id: notice.id });
  };

  const handleCloseDetail = () => {
    setSelectedNotice(null);
    setSearchParams({});
  };

  const handleCreateNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) {
      alert('제목과 내용을 모두 입력해주세요.');
      return;
    }

    try {
      setIsSubmitting(true);
      const created = await api.createNotice({
        title: newTitle.trim(),
        content: newContent.trim(),
        category: newCategory,
        author: newAuthor.trim() || '학생회',
        is_pinned: newIsPinned,
      });

      setNotices([created, ...notices]);
      setIsWriteModalOpen(false);
      setNewTitle('');
      setNewContent('');
      setNewIsPinned(false);
      alert('공지사항이 성공적으로 등록되었습니다!');
    } catch (err) {
      console.error('Failed to create notice', err);
      alert('공지 등록에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter & Search Logic
  const filteredNotices = notices.filter((item) => {
    const matchesCategory =
      selectedCategory === '전체' ? true : item.category === selectedCategory;
    const matchesQuery =
      searchQuery.trim() === '' ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const categories: NoticeCategory[] = ['전체', '필독', '학생회', '학사', '행사'];

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case '필독':
        return 'bg-rose-100 text-rose-700 border-rose-200';
      case '학생회':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case '학사':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case '행사':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-3xl p-8 sm:p-10 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/20 inline-block mb-3">
            학생회 소식통
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-2">
            공지사항
          </h1>
          <p className="text-slate-300 text-sm max-w-xl leading-relaxed">
            광주전남지역대학 컴퓨터과학과의 주요 학사 소식과 학생회 행사, 시험 및 과제 안내를 전해드립니다.
          </p>
        </div>

        <button
          onClick={() => setIsWriteModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm transition-all shadow-md active:scale-95 self-start md:self-center"
        >
          <PlusCircle className="w-4 h-4" />
          공지 등록 (관리자)
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-4 h-4 text-slate-400 mr-1 hidden sm:inline" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="제목, 내용 검색..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Notices Table / List */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-slate-400 text-sm">
            공지사항을 불러오는 중입니다...
          </div>
        ) : filteredNotices.length === 0 ? (
          <div className="p-16 text-center text-slate-400 text-sm">
            해당 조건의 공지사항이 없습니다.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredNotices.map((notice) => (
              <div
                key={notice.id}
                onClick={() => handleSelectNotice(notice)}
                className={`p-4 sm:p-5 cursor-pointer transition-colors hover:bg-blue-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  notice.is_pinned ? 'bg-amber-50/20' : ''
                }`}
              >
                <div className="space-y-1.5 flex-1 pr-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    {notice.is_pinned && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-rose-600 text-white">
                        <Pin className="w-3 h-3" />
                        고정
                      </span>
                    )}
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${getCategoryBadgeClass(
                        notice.category
                      )}`}
                    >
                      {notice.category}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1 sm:hidden ml-auto">
                      {formatDate(notice.created_at)}
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-slate-900 hover:text-blue-600 transition-colors">
                    {notice.title}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-1">
                    {notice.content}
                  </p>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center text-xs text-slate-400 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                  <span className="hidden sm:inline font-medium text-slate-500">
                    {formatDate(notice.created_at)}
                  </span>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span>{notice.author}</span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {notice.views}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notice Detail Modal */}
      {selectedNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 sm:p-8 animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-semibold px-2.5 py-0.5 rounded-md border ${getCategoryBadgeClass(
                      selectedNotice.category
                    )}`}
                  >
                    {selectedNotice.category}
                  </span>
                  {selectedNotice.is_pinned && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-md bg-rose-600 text-white">
                      <Pin className="w-3 h-3" />
                      고정 공지
                    </span>
                  )}
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                  {selectedNotice.title}
                </h2>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span>작성자: {selectedNotice.author}</span>
                  <span>•</span>
                  <span>등록일: {formatDate(selectedNotice.created_at)}</span>
                  <span>•</span>
                  <span>조회수: {selectedNotice.views}</span>
                </div>
              </div>

              <button
                onClick={handleCloseDetail}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Notice Body */}
            <div className="py-6 text-slate-700 text-sm leading-relaxed whitespace-pre-line">
              {selectedNotice.content}
            </div>

            {/* Attachments (if any) */}
            {selectedNotice.attachments && selectedNotice.attachments.length > 0 && (
              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-600" />
                  첨부파일 ({selectedNotice.attachments.length})
                </h4>
                <div className="space-y-2">
                  {selectedNotice.attachments.map((att, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="truncate">{att.name}</span>
                        {att.size && <span className="text-slate-400">({att.size})</span>}
                      </div>
                      <a
                        href={att.url}
                        onClick={(e) => {
                          e.preventDefault();
                          alert('샘플 첨부파일입니다.');
                        }}
                        className="inline-flex items-center gap-1 text-blue-600 font-semibold hover:underline shrink-0 ml-2"
                      >
                        <Download className="w-3.5 h-3.5" />
                        다운로드
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-6 border-t border-slate-100 mt-6 flex justify-end">
              <button
                onClick={handleCloseDetail}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Notice Modal (Admin mode) */}
      {isWriteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 p-6 sm:p-8 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">새 공지사항 등록</h2>
                <p className="text-xs text-slate-500">학생회 및 학과 공지를 등록합니다.</p>
              </div>
              <button
                onClick={() => setIsWriteModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNotice} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  분류 (카테고리)
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="학생회">학생회</option>
                  <option value="필독">필독</option>
                  <option value="학사">학사</option>
                  <option value="행사">행사</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  공지 제목
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="예: 2학기 출석수업 안내"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  작성자 (부서명)
                </label>
                <input
                  type="text"
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                  placeholder="예: 학생회 기획부"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  공지 내용
                </label>
                <textarea
                  required
                  rows={6}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="공지할 상세 내용을 입력해주세요..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="pinNotice"
                  checked={newIsPinned}
                  onChange={(e) => setNewIsPinned(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="pinNotice" className="text-xs font-medium text-slate-700">
                  게시판 상단에 중요 공지로 고정(Pin)하기
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsWriteModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-semibold hover:bg-slate-200 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? '등록 중...' : '공지 게시'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
