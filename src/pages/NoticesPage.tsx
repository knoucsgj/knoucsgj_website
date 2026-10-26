import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../services/auth';
import type { Notice, NoticeCategory, BudgetReport, MeetingMinute } from '../lib/types';
import { formatDate } from '../lib/dateUtils';
import { ASSETS } from '../lib/assets';
import { MeetingMinutePrintView } from '../components/MeetingMinutePrintView';
import {
  Search,
  Pin,
  Eye,
  PlusCircle,
  X,
  FileText,
  Download,
  Receipt,
  FileCheck,
  Printer,
  ChevronRight,
  ShieldCheck,
  MapPin,
  Image as ImageIcon,
  History
} from 'lucide-react';

export const NoticesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = (searchParams.get('tab') || 'notices') as 'notices' | 'finance' | 'minutes';

  // 1. 공지사항 State
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loadingNotices, setLoadingNotices] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<NoticeCategory>('전체');
  const [noticeSearchQuery, setNoticeSearchQuery] = useState('');
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);

  // 공지사항 작성 Modal (임원/회장/관리자)
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<'필독' | '학생회' | '학사' | '행사'>('학생회');
  const [newAuthor, setNewAuthor] = useState('학생회');
  const [newIsPinned, setNewIsPinned] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 2. 결산보고 State
  const [budgetReports, setBudgetReports] = useState<BudgetReport[]>([]);
  const [loadingBudgets, setLoadingBudgets] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<BudgetReport | null>(null);
  const [receiptModalUrl, setReceiptModalUrl] = useState<string | null>(null);

  // 3. 회의록 State
  const [meetingMinutes, setMeetingMinutes] = useState<MeetingMinute[]>([]);
  const [loadingMinutes, setLoadingMinutes] = useState(false);
  const [selectedMinute, setSelectedMinute] = useState<MeetingMinute | null>(null);
  const [printMinute, setPrintMinute] = useState<MeetingMinute | null>(null);

  const { member, isAdmin } = useAuth();
  const canWriteNotice = isAdmin || member?.role === 'president' || member?.role === 'officer';

  // 탭 전환 핸들러
  const handleTabChange = (tab: 'notices' | 'finance' | 'minutes') => {
    setSearchParams({ tab });
  };

  useEffect(() => {
    if (currentTab === 'notices') {
      loadNotices();
    } else if (currentTab === 'finance') {
      loadBudgets();
    } else if (currentTab === 'minutes') {
      loadMinutes();
    }
  }, [currentTab]);

  const loadNotices = async () => {
    try {
      setLoadingNotices(true);
      const data = await api.getNotices();
      setNotices(data);

      const targetId = searchParams.get('id');
      if (targetId) {
        const found = data.find((n) => n.id === targetId);
        if (found) setSelectedNotice(found);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingNotices(false);
    }
  };

  const loadBudgets = async () => {
    try {
      setLoadingBudgets(true);
      const data = await api.getBudgetReports();
      setBudgetReports(data);
      if (data.length > 0 && !selectedBudget) {
        setSelectedBudget(data[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingBudgets(false);
    }
  };

  const loadMinutes = async () => {
    try {
      setLoadingMinutes(true);
      const data = await api.getMeetingMinutes();
      setMeetingMinutes(data);
      if (data.length > 0 && !selectedMinute) {
        setSelectedMinute(data[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMinutes(false);
    }
  };

  // 공지사항 등록 핸들러
  const handleCreateNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canWriteNotice) {
      alert('공지사항 등록 권한이 없습니다.');
      return;
    }
    if (!newTitle.trim() || !newContent.trim()) {
      alert('제목과 내용을 모두 입력해 주세요.');
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
    } catch (err: any) {
      alert(err.message || '공지 등록에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 공지 필터링
  const filteredNotices = notices.filter((item) => {
    const matchesCategory = selectedCategory === '전체' ? true : item.category === selectedCategory;
    const q = noticeSearchQuery.toLowerCase().trim();
    const matchesQuery =
      q === '' ||
      item.title.toLowerCase().includes(q) ||
      item.content.toLowerCase().includes(q) ||
      item.author.toLowerCase().includes(q);
    return matchesCategory && matchesQuery;
  });

  const noticeCategories: NoticeCategory[] = ['전체', '필독', '학생회', '학사', '행사'];

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case '필독':
        return 'bg-rose-100 text-rose-700 border-rose-200';
      case '학생회':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case '학사':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case '행사':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-8">
      {/* Official Page Header */}
      <div className="border-b border-slate-200 pb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4 sm:gap-5">
          <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-22 md:h-22 rounded-2xl bg-blue-50/70 border border-blue-100 p-1.5 shrink-0 flex items-center justify-center shadow-xs">
            <img
              src={ASSETS.characters.proud}
              alt="방송대 공식 마스코트"
              className="w-full h-full object-contain drop-shadow-xs"
            />
          </div>
          <div>
            <div className="flex items-center gap-2 text-[11px] font-semibold text-blue-700 tracking-wider uppercase mb-1">
              <span>Notice & Governance</span>
            </div>
            <h1 className="font-knou text-xl sm:text-2xl md:text-3xl font-bold text-slate-950 tracking-tight mb-1.5">
              공지사항 및 학생 자치 자료실
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed max-w-2xl font-normal">
              광주전남 컴퓨터과학과 학우들을 위한 학사·학과 공지사항, 100% 투명한 학생회비 결산 증빙, 공식 정기 회의록을 투명하게 공개합니다.
            </p>
          </div>
        </div>

        {/* Action Button: 공지사항 탭일 때만 작성 버튼 노출 */}
        {currentTab === 'notices' && canWriteNotice && (
          <button
            onClick={() => setIsWriteModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-sm transition-all self-start sm:self-auto cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>공지사항 등록</span>
          </button>
        )}
      </div>

      {/* 3 Main Independent Tabs */}
      <div className="flex border-b border-slate-200 gap-2 sm:gap-6 overflow-x-auto">
        <button
          onClick={() => handleTabChange('notices')}
          className={`pb-3.5 px-3 sm:px-4 text-sm sm:text-base font-bold transition-all relative flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            currentTab === 'notices'
              ? 'text-blue-700 border-b-2 border-blue-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>공지사항</span>
        </button>

        <button
          onClick={() => handleTabChange('finance')}
          className={`pb-3.5 px-3 sm:px-4 text-sm sm:text-base font-bold transition-all relative flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            currentTab === 'finance'
              ? 'text-blue-700 border-b-2 border-blue-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>학생회비 결산보고</span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
            영수증 100% 공개
          </span>
        </button>

        <button
          onClick={() => handleTabChange('minutes')}
          className={`pb-3.5 px-3 sm:px-4 text-sm sm:text-base font-bold transition-all relative flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            currentTab === 'minutes'
              ? 'text-blue-700 border-b-2 border-blue-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>정기·임시 회의록</span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200">
            공식 양식 출력
          </span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* 1. 공지사항 탭 (Notices Tab) */}
      {/* ========================================================= */}
      {currentTab === 'notices' && (
        <div className="space-y-6">
          {/* Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-50 p-3 sm:p-4 rounded-2xl border border-slate-200/80">
            {/* Category Badges */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {noticeCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-200/60 border border-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={noticeSearchQuery}
                onChange={(e) => setNoticeSearchQuery(e.target.value)}
                placeholder="공지사항 검색 (제목, 내용, 작성자)"
                className="w-full pl-9 pr-4 py-2 bg-white rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Notices List */}
          {loadingNotices ? (
            <div className="py-20 text-center text-slate-400 text-sm">공지사항을 불러오는 중입니다...</div>
          ) : filteredNotices.length === 0 ? (
            <div className="py-20 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-sm">
              등록된 공지사항이 없습니다.
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-xs">
              {filteredNotices.map((notice) => (
                <div
                  key={notice.id}
                  onClick={() => setSelectedNotice(notice)}
                  className={`p-4 sm:p-5 flex items-start sm:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors cursor-pointer ${
                    notice.is_pinned ? 'bg-amber-50/30' : ''
                  }`}
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {notice.is_pinned && (
                        <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                          <Pin className="w-3 h-3 fill-amber-700" />
                          고정 공지
                        </span>
                      )}
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${getCategoryBadgeClass(notice.category)}`}>
                        {notice.category}
                      </span>
                      <span className="text-xs text-slate-400">{formatDate(notice.created_at)}</span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-sm sm:text-base hover:text-blue-700 transition-colors truncate">
                      {notice.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-4 text-slate-400 text-xs shrink-0 self-center">
                    <span className="hidden sm:inline font-medium text-slate-500">{notice.author}</span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      {notice.views}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. 학생회비 결산보고 탭 (Finance Tab) */}
      {/* ========================================================= */}
      {currentTab === 'finance' && (
        <div className="space-y-8">
          {/* Transparency Info Box */}
          <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-emerald-950 text-sm sm:text-base">투명한 학생회비 집행 원칙</h3>
                <p className="text-xs sm:text-sm text-emerald-800/90 mt-0.5 leading-relaxed">
                  모든 학생회비 결산 보고서는 <strong>영수증 파일 원본 첨부가 의무화</strong>되어 있으며,
                  수정 및 삭제 시 감사 사유가 시스템에 영구 보존됩니다.
                </p>
              </div>
            </div>
            <div className="text-xs text-emerald-800 font-semibold bg-white/80 px-3.5 py-1.5 rounded-xl border border-emerald-200 shrink-0">
              총 {budgetReports.length}건 보고
            </div>
          </div>

          {loadingBudgets ? (
            <div className="py-20 text-center text-slate-400 text-sm">결산 내역을 불러오는 중입니다...</div>
          ) : budgetReports.length === 0 ? (
            <div className="py-20 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-sm">
              등록된 결산 보고서가 없습니다.
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Report List */}
              <div className="space-y-3">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-emerald-600" />
                  <span>분기별 결산 보고서 목록</span>
                </h3>
                <div className="space-y-2.5">
                  {budgetReports.map((report) => (
                    <div
                      key={report.id}
                      onClick={() => setSelectedBudget(report)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                        selectedBudget?.id === report.id
                          ? 'bg-blue-50/80 border-blue-500 shadow-sm ring-1 ring-blue-500'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-semibold text-slate-500">{report.period}</span>
                        <span className="px-2 py-0.5 rounded-full font-bold text-[11px] bg-emerald-100 text-emerald-800">
                          {report.status}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm line-clamp-2 mb-2">{report.title}</h4>
                      <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                        <span>잔액: <strong className="text-blue-700">{report.balance.toLocaleString()}원</strong></span>
                        <span className="text-[11px] text-slate-400">{report.published_date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Detailed View */}
              {selectedBudget && (
                <div className="lg:col-span-2 space-y-6">
                  {/* Summary Card */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-xs">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 mb-1">
                        <span>{selectedBudget.period}</span>
                        <span>•</span>
                        <span>공고일: {selectedBudget.published_date}</span>
                      </div>
                      <h2 className="text-lg sm:text-xl font-bold text-slate-950">{selectedBudget.title}</h2>
                    </div>

                    {/* Summary Numbers Grid */}
                    <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
                      <div>
                        <div className="text-[11px] font-semibold text-slate-500">총 수입금액</div>
                        <div className="text-sm sm:text-base font-extrabold text-blue-700 mt-0.5">
                          +{selectedBudget.income_total.toLocaleString()}원
                        </div>
                      </div>
                      <div>
                        <div className="text-[11px] font-semibold text-slate-500">총 지출금액</div>
                        <div className="text-sm sm:text-base font-extrabold text-rose-600 mt-0.5">
                          -{selectedBudget.expense_total.toLocaleString()}원
                        </div>
                      </div>
                      <div>
                        <div className="text-[11px] font-semibold text-slate-500">최종 집행 잔액</div>
                        <div className="text-sm sm:text-base font-extrabold text-emerald-700 mt-0.5">
                          {selectedBudget.balance.toLocaleString()}원
                        </div>
                      </div>
                    </div>

                    {/* Receipt Evidence Attachment Card */}
                    <div className="p-4 rounded-xl border-2 border-dashed border-emerald-300 bg-emerald-50/40 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                          <Receipt className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                            <span>증빙 영수증 첨부 파일</span>
                            <span className="text-[10px] bg-emerald-200 text-emerald-900 px-1.5 py-0.2 rounded font-semibold">필수 증빙</span>
                          </div>
                          <p className="text-xs text-emerald-800 truncate">
                            {selectedBudget.receipt_name || '결산_영수증_증빙자료.pdf'}
                          </p>
                        </div>
                      </div>

                      {selectedBudget.receipt_url ? (
                        <button
                          onClick={() => setReceiptModalUrl(selectedBudget.receipt_url || null)}
                          className="px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shrink-0 cursor-pointer shadow-xs"
                        >
                          영수증 열람
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400">영수증 이미지 없음</span>
                      )}
                    </div>

                    {/* Breakdown Table */}
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm mb-3">세부 수입·지출 집행 내역</h4>
                      <div className="border border-slate-200 rounded-xl overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                            <tr>
                              <th className="p-3">일자</th>
                              <th className="p-3">구분</th>
                              <th className="p-3">항목</th>
                              <th className="p-3">적요 / 사용 내역</th>
                              <th className="p-3 text-right">금액</th>
                              <th className="p-3">증빙 비고</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {selectedBudget.items && selectedBudget.items.map((it) => (
                              <tr key={it.id} className="hover:bg-slate-50/60">
                                <td className="p-3 font-medium text-slate-500 whitespace-nowrap">{it.date}</td>
                                <td className="p-3 whitespace-nowrap">
                                  <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                                    it.type === '수입' ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-800'
                                  }`}>
                                    {it.type}
                                  </span>
                                </td>
                                <td className="p-3 font-medium text-slate-700 whitespace-nowrap">{it.category}</td>
                                <td className="p-3 text-slate-800">{it.description}</td>
                                <td className={`p-3 text-right font-bold whitespace-nowrap ${
                                  it.type === '수입' ? 'text-blue-700' : 'text-slate-900'
                                }`}>
                                  {it.type === '수입' ? '+' : '-'}{it.amount.toLocaleString()}원
                                </td>
                                <td className="p-3 text-slate-500 text-[11px] whitespace-nowrap">{it.note || '영수증 대조 완료'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Edit History (Transparency) */}
                    {selectedBudget.edit_history && selectedBudget.edit_history.length > 0 && (
                      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                        <div className="font-bold flex items-center gap-1.5 text-amber-950">
                          <History className="w-3.5 h-3.5" />
                          <span>투명성 보존: 결산 정정(수정) 이력</span>
                        </div>
                        {selectedBudget.edit_history.map((h, i) => (
                          <div key={i} className="text-slate-700">
                            • [{formatDate(h.edited_at)}] <strong>{h.edited_by}</strong>: {h.reason}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. 정기·임시 회의록 탭 (Minutes Tab) */}
      {/* ========================================================= */}
      {currentTab === 'minutes' && (
        <div className="space-y-8">
          {/* Header Description */}
          <div className="bg-blue-50/60 border border-blue-200 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <FileCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-blue-950 text-sm sm:text-base">학생 자치 정기·임시 회의록 공개</h3>
                <p className="text-xs sm:text-sm text-blue-800/90 mt-0.5 leading-relaxed">
                  학생회 임원회의 및 총회 의결 사항을 기록 보존하며, <strong>[공문서 양식 출력]</strong>을 통해 A4 규격 회의록 서식으로 인쇄 또는 PDF 저장이 가능합니다.
                </p>
              </div>
            </div>
            <div className="text-xs text-blue-800 font-semibold bg-white/80 px-3.5 py-1.5 rounded-xl border border-blue-200 shrink-0">
              총 {meetingMinutes.length}건 회의록 보존
            </div>
          </div>

          {loadingMinutes ? (
            <div className="py-20 text-center text-slate-400 text-sm">회의록을 불러오는 중입니다...</div>
          ) : meetingMinutes.length === 0 ? (
            <div className="py-20 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-sm">
              등록된 회의록이 없습니다.
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Minutes List */}
              <div className="space-y-3">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>회의록 목록</span>
                </h3>
                <div className="space-y-2.5">
                  {meetingMinutes.map((minute) => (
                    <div
                      key={minute.id}
                      onClick={() => setSelectedMinute(minute)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                        selectedMinute?.id === minute.id
                          ? 'bg-blue-50/80 border-blue-500 shadow-sm ring-1 ring-blue-500'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="px-2 py-0.5 rounded font-bold text-[11px] bg-blue-100 text-blue-800">
                          {minute.meeting_type}
                        </span>
                        <span className="text-slate-400 text-[11px]">{minute.meeting_date}</span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm line-clamp-2 mb-2">{minute.title}</h4>
                      <div className="text-xs text-slate-500 truncate flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{minute.location || '학생회실'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Detailed View */}
              {selectedMinute && (
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
                    {/* Top Action Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
                      <div>
                        <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 mb-1">
                          <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">{selectedMinute.meeting_type}</span>
                          <span>•</span>
                          <span>일시: {selectedMinute.meeting_date}</span>
                        </div>
                        <h2 className="text-lg sm:text-2xl font-bold text-slate-950">{selectedMinute.title}</h2>
                      </div>

                      {/* Official Print/PDF Button */}
                      <button
                        onClick={() => setPrintMinute(selectedMinute)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold shadow-sm transition-all self-start sm:self-auto cursor-pointer"
                      >
                        <Printer className="w-4 h-4 text-blue-400" />
                        <span>공문서 양식 출력 / PDF</span>
                      </button>
                    </div>

                    {/* Metadata Overview */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                      <div>
                        <span className="text-slate-500 font-medium">회의 장소: </span>
                        <strong className="text-slate-900">{selectedMinute.location || '광주전남지역대학 405호 학생회실'}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 font-medium">의장 / 기록자: </span>
                        <strong className="text-slate-900">{selectedMinute.chairperson || '학생회장'} / {selectedMinute.recorder || '총무부장'}</strong>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="text-slate-500 font-medium">참석자 명단: </span>
                        <span className="text-slate-800 font-medium">{selectedMinute.attendees || '임원진 전원'}</span>
                      </div>
                    </div>

                    {/* Agenda */}
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-slate-800"></span>
                        상정 안건 (Agenda)
                      </h4>
                      <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs sm:text-sm whitespace-pre-wrap text-slate-800">
                        {selectedMinute.agenda || '상정 안건 없음'}
                      </div>
                    </div>

                    {/* Content */}
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-slate-800"></span>
                        주요 회의 경과 및 논의 내용
                      </h4>
                      <div className="p-4 rounded-xl border border-slate-200 text-xs sm:text-sm whitespace-pre-wrap text-slate-800 leading-relaxed min-h-[120px]">
                        {selectedMinute.content || '기록된 세부 내용이 없습니다.'}
                      </div>
                    </div>

                    {/* Decisions */}
                    <div>
                      <h4 className="font-bold text-blue-900 text-sm mb-2 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                        최종 의결 및 결정 사항
                      </h4>
                      <div className="p-4 bg-blue-50/70 border-2 border-blue-200 rounded-xl text-xs sm:text-sm font-semibold text-blue-950 whitespace-pre-wrap leading-relaxed">
                        {selectedMinute.decisions || '의결 사항 없음'}
                      </div>
                    </div>

                    {/* Attachments & Images */}
                    {selectedMinute.attachments && selectedMinute.attachments.length > 0 && (
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-1.5">
                          <ImageIcon className="w-4 h-4 text-slate-600" />
                          별첨 증빙 자료 및 현장 사진
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {selectedMinute.attachments.map((att, i) => (
                            <div key={i} className="p-3 border border-slate-200 rounded-xl bg-slate-50 text-xs">
                              <div className="font-semibold text-slate-800 truncate mb-1">{att.name}</div>
                              {att.url && (att.type === 'image' || att.url.startsWith('data:image')) && (
                                <img src={att.url} alt={att.name} className="mt-2 max-h-48 w-full object-contain rounded border border-slate-200 bg-white" />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Edit History (Transparency) */}
                    {selectedMinute.edit_history && selectedMinute.edit_history.length > 0 && (
                      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                        <div className="font-bold flex items-center gap-1.5 text-amber-950">
                          <History className="w-3.5 h-3.5" />
                          <span>투명성 보존: 회의록 정정(수정) 이력</span>
                        </div>
                        {selectedMinute.edit_history.map((h, i) => (
                          <div key={i} className="text-slate-700">
                            • [{formatDate(h.edited_at)}] <strong>{h.edited_by}</strong>: {h.reason}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* Notice Detail Modal */}
      {/* ========================================================= */}
      {selectedNotice && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 space-y-6">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${getCategoryBadgeClass(selectedNotice.category)}`}>
                    {selectedNotice.category}
                  </span>
                  <span className="text-xs text-slate-400">{formatDate(selectedNotice.created_at)}</span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">{selectedNotice.title}</h2>
                <p className="text-xs text-slate-500 mt-1">작성자: {selectedNotice.author}</p>
              </div>
              <button onClick={() => setSelectedNotice(null)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs sm:text-sm text-slate-800 whitespace-pre-wrap leading-relaxed min-h-[160px]">
              {selectedNotice.content}
            </div>

            {selectedNotice.attachments && selectedNotice.attachments.length > 0 && (
              <div className="pt-4 border-t border-slate-100 space-y-2">
                <div className="text-xs font-bold text-slate-700">첨부파일</div>
                <div className="space-y-1.5">
                  {selectedNotice.attachments.map((att, i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                      <div className="flex items-center gap-2 text-slate-700 truncate">
                        <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="truncate">{att.name}</span>
                      </div>
                      <span className="text-slate-400 text-[11px] shrink-0">{att.size || ''}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* Notice Write Modal (Officers & Admin) */}
      {/* ========================================================= */}
      {isWriteModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">공지사항 등록</h3>
              <button onClick={() => setIsWriteModalOpen(false)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNotice} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">카테고리</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['필독', '학생회', '학사', '행사'] as const).map((cat) => (
                    <button
                      type="button"
                      key={cat}
                      onClick={() => setNewCategory(cat)}
                      className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                        newCategory === cat
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">작성자 (소속)</label>
                <input
                  type="text"
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                  placeholder="예: 학생회 학술부, 학생회장"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">제목</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="공지 제목을 입력하세요"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">내용</label>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="공지 내용을 작성하세요"
                  required
                  rows={6}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="pinNotice"
                  checked={newIsPinned}
                  onChange={(e) => setNewIsPinned(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <label htmlFor="pinNotice" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  상단 고정 공지로 등록
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsWriteModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
                >
                  {isSubmitting ? '등록 중...' : '등록하기'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* Receipt Image Viewer Modal */}
      {/* ========================================================= */}
      {receiptModalUrl && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-sm">학생회비 집행 영수증 증빙 확인</h3>
              </div>
              <button
                onClick={() => setReceiptModalUrl(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 flex items-center justify-center bg-slate-100">
              {receiptModalUrl.startsWith('data:image') || receiptModalUrl.endsWith('.png') || receiptModalUrl.endsWith('.jpg') || receiptModalUrl.endsWith('.jpeg') ? (
                <img src={receiptModalUrl} alt="영수증 증빙" className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-md" />
              ) : (
                <div className="text-center p-8 bg-white rounded-xl shadow-xs">
                  <FileText className="w-12 h-12 text-emerald-600 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-800 mb-4">첨부 문서(PDF 등) 파일입니다.</p>
                  <a
                    href={receiptModalUrl}
                    download="결산_영수증_증빙.pdf"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                  >
                    <Download className="w-4 h-4" />
                    <span>영수증 파일 다운로드</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* Official Meeting Minute Print / PDF Modal */}
      {/* ========================================================= */}
      {printMinute && (
        <MeetingMinutePrintView minute={printMinute} onClose={() => setPrintMinute(null)} />
      )}
    </div>
  );
};
