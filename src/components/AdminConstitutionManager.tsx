import React, { useState, useEffect, useMemo } from 'react';
import { showConfirm } from './ui/GlobalDialog';
import { api } from '../services/api';
import type {
  ConstitutionVersion,
  ConstitutionDocument,
  ConstitutionChapter,
  ConstitutionArticle
} from '../lib/types';
import { officialConstitutionDocuments } from '../data/officialConstitution';
import {
  Scale,
  PlusCircle,
  Pencil,
  Trash2,
  BookOpen,
  Search,
  History,
  CheckCircle2,
  X,
  FileText,
  Copy
} from 'lucide-react';

export const AdminConstitutionManager: React.FC = () => {
  const [versions, setVersions] = useState<ConstitutionVersion[]>([]);
  const [selectedVersionId, setSelectedVersionId] = useState<string>('');
  const [selectedDocId, setSelectedDocId] = useState<'constitution' | 'election' | 'bylaws'>('constitution');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
  const [editingChapterNum, setEditingChapterNum] = useState<number | string>(1);
  const [editingArticleNum, setEditingArticleNum] = useState<number | string | null>(null);
  const [articleForm, setArticleForm] = useState({
    number: '' as string | number,
    title: '',
    section: '',
    content: ''
  });

  const [isPreambleModalOpen, setIsPreambleModalOpen] = useState(false);
  const [preambleForm, setPreambleForm] = useState('');

  const [isNewVersionModalOpen, setIsNewVersionModalOpen] = useState(false);
  const [newVersionForm, setNewVersionForm] = useState({
    title: '',
    revision_date: new Date().toISOString().split('T')[0],
    description: '',
    is_current: true,
    clone_from_id: ''
  });

  // Load versions from API
  const loadVersions = async () => {
    try {
      const data = await api.getConstitutionVersions();
      setVersions(data);
      if (!selectedVersionId && data.length > 0) {
        const current = data.find((v) => v.is_current) || data[0];
        setSelectedVersionId(current.id);
      }
    } catch (err) {
      console.error('Failed to load constitution versions', err);
    }
  };

  useEffect(() => {
    loadVersions();
  }, []);

  // Currently selected version
  const activeVersion = useMemo(() => {
    if (!versions.length) {
      return {
        id: 'ver-default',
        title: '제11차 개정 학생회칙 (2018. 04. 02)',
        revision_date: '2018. 04. 02',
        is_current: true,
        description: '2018년 4월 2일 제11차 개정 학생회칙 전문',
        documents: officialConstitutionDocuments,
        created_at: '2018-04-02',
        updated_at: '2018-04-02'
      };
    }
    return (
      versions.find((v) => v.id === selectedVersionId) ||
      versions.find((v) => v.is_current) ||
      versions[0]
    );
  }, [versions, selectedVersionId]);

  // Documents of active version
  const documents: ConstitutionDocument[] = activeVersion.documents && activeVersion.documents.length > 0
    ? activeVersion.documents
    : officialConstitutionDocuments;

  // Active document
  const activeDoc = useMemo(() => {
    return documents.find((d) => d.id === selectedDocId) || documents[0];
  }, [documents, selectedDocId]);

  // Filtered chapters & articles
  const filteredChapters = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return activeDoc.chapters;

    return activeDoc.chapters
      .map((ch) => {
        const matchesChapter = ch.title.toLowerCase().includes(q);
        const filteredArticles = ch.articles.filter(
          (art) =>
            art.title.toLowerCase().includes(q) ||
            art.content.toLowerCase().includes(q) ||
            String(art.number).includes(q)
        );

        if (matchesChapter || filteredArticles.length > 0) {
          return {
            ...ch,
            articles: matchesChapter ? ch.articles : filteredArticles
          };
        }
        return null;
      })
      .filter((ch): ch is ConstitutionChapter => ch !== null);
  }, [activeDoc, searchQuery]);

  // --------------------------------------------------------------------------
  // Article Edit / Add Handlers
  // --------------------------------------------------------------------------
  const openEditArticleModal = (chapterNumber: number | string, article: ConstitutionArticle) => {
    setEditingChapterNum(chapterNumber);
    setEditingArticleNum(article.number);
    setArticleForm({
      number: article.number,
      title: article.title,
      section: article.section || '',
      content: article.content
    });
    setIsArticleModalOpen(true);
  };

  const openAddArticleModal = (chapterNumber?: number | string) => {
    const defaultChap = chapterNumber || activeDoc.chapters[0]?.chapter || 1;
    setEditingChapterNum(defaultChap);
    setEditingArticleNum(null);
    setArticleForm({
      number: '',
      title: '',
      section: '',
      content: ''
    });
    setIsArticleModalOpen(true);
  };

  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!articleForm.title.trim() || !articleForm.content.trim()) {
      alert('조항 제목과 내용을 모두 입력해 주세요.');
      return;
    }

    try {
      // Clone all documents deeply
      const updatedDocs: ConstitutionDocument[] = JSON.parse(JSON.stringify(documents));
      const targetDoc = updatedDocs.find((d) => d.id === selectedDocId);
      if (!targetDoc) return;

      const targetChap = targetDoc.chapters.find((c) => String(c.chapter) === String(editingChapterNum));
      if (!targetChap) {
        alert('해당 장을 찾을 수 없습니다.');
        return;
      }

      if (editingArticleNum !== null) {
        // Edit existing article
        const artIdx = targetChap.articles.findIndex((a) => String(a.number) === String(editingArticleNum));
        if (artIdx !== -1) {
          targetChap.articles[artIdx] = {
            number: articleForm.number || targetChap.articles[artIdx].number,
            title: articleForm.title.trim(),
            section: articleForm.section.trim() || null,
            content: articleForm.content.trim()
          };
        }
      } else {
        // Add new article
        const newArtNum = articleForm.number || (targetChap.articles.length + 1);
        targetChap.articles.push({
          number: newArtNum,
          title: articleForm.title.trim(),
          section: articleForm.section.trim() || null,
          content: articleForm.content.trim()
        });
      }

      await api.updateConstitutionVersion(activeVersion.id, {
        documents: updatedDocs
      });

      setIsArticleModalOpen(false);
      await loadVersions();
      alert('조항 내용이 성공적으로 저장되었습니다!');
    } catch (err: any) {
      alert(err.message || '저장 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteArticle = async (chapterNumber: number | string, articleNumber: number | string, articleTitle: string) => {
    if (!(await showConfirm({
      title: '회칙 조항 삭제',
      message: `제${articleNumber}조 (${articleTitle}) 조항을 삭제하시겠습니까?`,
      confirmText: '삭제하기',
      variant: 'danger'
    }))) {
      return;
    }

    try {
      const updatedDocs: ConstitutionDocument[] = JSON.parse(JSON.stringify(documents));
      const targetDoc = updatedDocs.find((d) => d.id === selectedDocId);
      if (!targetDoc) return;

      const targetChap = targetDoc.chapters.find((c) => String(c.chapter) === String(chapterNumber));
      if (!targetChap) return;

      targetChap.articles = targetChap.articles.filter((a) => String(a.number) !== String(articleNumber));

      await api.updateConstitutionVersion(activeVersion.id, {
        documents: updatedDocs
      });

      await loadVersions();
      alert('조항이 삭제되었습니다.');
    } catch (err: any) {
      alert(err.message || '삭제 중 오류가 발생했습니다.');
    }
  };

  // --------------------------------------------------------------------------
  // Preamble Edit Handlers
  // --------------------------------------------------------------------------
  const openPreambleModal = () => {
    setPreambleForm(activeDoc.preamble || '');
    setIsPreambleModalOpen(true);
  };

  const handleSavePreamble = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updatedDocs: ConstitutionDocument[] = JSON.parse(JSON.stringify(documents));
      const targetDoc = updatedDocs.find((d) => d.id === selectedDocId);
      if (!targetDoc) return;

      targetDoc.preamble = preambleForm.trim();

      await api.updateConstitutionVersion(activeVersion.id, {
        documents: updatedDocs
      });

      setIsPreambleModalOpen(false);
      await loadVersions();
      alert('전문(Preamble) 내용이 성공적으로 저장되었습니다!');
    } catch (err: any) {
      alert(err.message || '저장 중 오류가 발생했습니다.');
    }
  };

  // --------------------------------------------------------------------------
  // Versioning & Amendment Handlers
  // --------------------------------------------------------------------------
  const openNewVersionModal = () => {
    setNewVersionForm({
      title: `제${versions.length + 11}차 개정 학생회칙`,
      revision_date: new Date().toISOString().split('T')[0],
      description: '',
      is_current: true,
      clone_from_id: activeVersion.id
    });
    setIsNewVersionModalOpen(true);
  };

  const handleCreateNewVersion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVersionForm.title.trim() || !newVersionForm.revision_date.trim()) {
      alert('개정 회칙 명칭과 개정일자를 입력해 주세요.');
      return;
    }

    try {
      const sourceVersion = versions.find((v) => v.id === newVersionForm.clone_from_id) || activeVersion;
      const clonedDocs = JSON.parse(JSON.stringify(sourceVersion.documents || officialConstitutionDocuments));

      const created = await api.createConstitutionVersion({
        title: newVersionForm.title.trim(),
        revision_date: newVersionForm.revision_date.trim(),
        description: newVersionForm.description.trim(),
        is_current: newVersionForm.is_current,
        documents: clonedDocs
      });

      setIsNewVersionModalOpen(false);
      await loadVersions();
      setSelectedVersionId(created.id);
      alert('새 개정 회칙 버전이 성공적으로 등록되었습니다!\n기존 과거 회칙은 보존되며, 이제 새 버전의 조항들을 수정하실 수 있습니다.');
    } catch (err: any) {
      alert(err.message || '개정안 생성에 실패했습니다.');
    }
  };

  const handleSetAsCurrent = async (versionId: string, versionTitle: string) => {
    if (!(await showConfirm({
      title: '현행 회칙 지정 확인',
      message: `"${versionTitle}" 버전을 현재 공식 효력이 적용되는 [현행 회칙]으로 지정하시겠습니까?`,
      confirmText: '현행 회칙으로 지정',
      variant: 'info'
    }))) {
      return;
    }

    try {
      await api.updateConstitutionVersion(versionId, { is_current: true });
      await loadVersions();
      alert('현행 회칙으로 변경되었습니다.');
    } catch (err: any) {
      alert(err.message || '변경에 실패했습니다.');
    }
  };

  const handleDeleteVersion = async (versionId: string, versionTitle: string) => {
    if (!(await showConfirm({
      title: '회칙 버전 삭제 확인',
      message: `"${versionTitle}" 회칙 버전을 영구 삭제하시겠습니까?`,
      subMessage: '과거 기록 보존을 위해 특별한 사유가 없는 한 삭제는 권장되지 않습니다.',
      confirmText: '영구 삭제',
      variant: 'danger'
    }))) {
      return;
    }

    try {
      await api.deleteConstitutionVersion(versionId);
      await loadVersions();
      alert('회칙 버전이 삭제되었습니다.');
    } catch (err: any) {
      alert(err.message || '삭제에 실패했습니다.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Bar */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-5 border-b border-slate-100 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200 flex items-center gap-1">
                <Scale className="w-3.5 h-3.5 text-amber-700" />
                최고 관리자 전용
              </span>
              <span className="text-xs text-slate-500">한국방송통신대학교 광주전남 컴퓨터과학과</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight font-knou">
              학과 학생회칙 및 세칙 관리 센터
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              조항의 오타 수정, 내용 수정, 신규 개정 회칙 등록 및 과거 회칙 연혁 보존을 관리합니다.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={openNewVersionModal}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors"
            >
              <Copy className="w-4 h-4" />
              <span>새 개정안 등록 (버전 복제)</span>
            </button>
            <button
              onClick={() => openAddArticleModal()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>새 조항 추가</span>
            </button>
            {activeDoc.id === 'constitution' && (
              <button
                onClick={openPreambleModal}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm border border-slate-200 transition-colors"
              >
                <Pencil className="w-3.5 h-3.5 text-slate-500" />
                <span>전문(Preamble) 수정</span>
              </button>
            )}
          </div>
        </div>

        {/* Version Selector Bar */}
        <div className="bg-slate-50/80 p-4 sm:p-5 rounded-2xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 whitespace-nowrap">
              <History className="w-4 h-4 text-indigo-600" />
              <span>관리할 회칙 버전:</span>
            </label>
            <select
              value={selectedVersionId}
              onChange={(e) => setSelectedVersionId(e.target.value)}
              className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 shadow-2xs"
            >
              {versions.map((ver) => (
                <option key={ver.id} value={ver.id}>
                  {ver.is_current ? `★ [현행] ${ver.title}` : `[과거] ${ver.title}`} ({ver.revision_date})
                </option>
              ))}
            </select>

            {activeVersion.is_current ? (
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-xs flex items-center gap-1 border border-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5" />
                현행 효력 회칙
              </span>
            ) : (
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-extrabold text-xs flex items-center gap-1 border border-amber-300">
                  <History className="w-3.5 h-3.5" />
                  과거 회칙 (보존 기록)
                </span>
                <button
                  onClick={() => handleSetAsCurrent(activeVersion.id, activeVersion.title)}
                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors"
                >
                  현행 회칙으로 지정
                </button>
                {versions.length > 1 && (
                  <button
                    onClick={() => handleDeleteVersion(activeVersion.id, activeVersion.title)}
                    className="p-1 text-rose-500 hover:text-rose-700 rounded"
                    title="버전 삭제"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="text-xs text-slate-500">
            {activeVersion.description ? (
              <span>비고: {activeVersion.description}</span>
            ) : (
              <span>등록일: {activeVersion.revision_date}</span>
            )}
          </div>
        </div>

        {/* 3 Document Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-slate-100/70 p-1.5 rounded-2xl border border-slate-200">
          {documents.map((doc) => {
            const isSelected = doc.id === selectedDocId;
            return (
              <button
                key={doc.id}
                onClick={() => {
                  setSelectedDocId(doc.id);
                  setSearchQuery('');
                }}
                className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all text-center flex items-center justify-center gap-2 ${
                  isSelected
                    ? 'bg-white text-blue-700 shadow-xs border border-blue-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <BookOpen className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                <span>{doc.short_title}</span>
                <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-600">
                  {doc.chapters.reduce((sum, ch) => sum + ch.articles.length, 0)}개 조
                </span>
              </button>
            );
          })}
        </div>

        {/* Search for Typo Correction */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="수정할 조항 검색 (예: 명칭, 탄핵, 선거, 의결, 회비 등)..."
            className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Chapters & Articles Editor List */}
      <div className="space-y-4">
        {filteredChapters.map((chapter) => (
          <div key={String(chapter.chapter)} className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            {/* Chapter Header */}
            <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-800 font-extrabold text-xs">
                  {chapter.chapter === '부칙' ? '부칙' : `제${chapter.chapter}장`}
                </span>
                <h3 className="font-bold text-sm sm:text-base text-slate-900">{chapter.title}</h3>
                <span className="text-xs text-slate-400 font-normal">({chapter.articles.length}개 조항)</span>
              </div>
              <button
                onClick={() => openAddArticleModal(chapter.chapter)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-blue-700 hover:bg-blue-50 text-xs font-bold transition-colors"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>이 장에 조항 추가</span>
              </button>
            </div>

            {/* Articles List */}
            <div className="p-4 sm:p-6 divide-y divide-slate-100 space-y-4">
              {chapter.articles.map((art) => (
                <div key={String(art.number)} className="pt-4 first:pt-0 flex flex-col sm:flex-row sm:items-start justify-between gap-4 group">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm sm:text-base text-blue-950">
                        제{art.number}조 ({art.title})
                      </span>
                      {art.section && (
                        <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                          {art.section}
                        </span>
                      )}
                    </div>
                    <div className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal whitespace-pre-line pl-1 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                      {art.content}
                    </div>
                  </div>

                  {/* Edit / Delete Buttons */}
                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-start">
                    <button
                      onClick={() => openEditArticleModal(chapter.chapter, art)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 font-bold text-xs transition-colors"
                      title="오타 및 내용 수정"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>수정</span>
                    </button>
                    <button
                      onClick={() => handleDeleteArticle(chapter.chapter, art.number, art.title)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 font-bold text-xs transition-colors"
                      title="조항 삭제"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {filteredChapters.length === 0 && (
          <div className="py-12 text-center text-slate-400 bg-white rounded-3xl border border-slate-200">
            "{searchQuery}"에 해당하는 조항을 찾을 수 없습니다.
          </div>
        )}
      </div>

      {/* ==================================================================== */}
      {/* Article Edit / Add Modal                                             */}
      {/* ==================================================================== */}
      {isArticleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 p-6 sm:p-7 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg text-slate-900">
                    {editingArticleNum !== null ? `제${editingArticleNum}조 조항 및 오타 수정` : '새 조항 추가'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {activeDoc.short_title} · {editingChapterNum === '부칙' ? '부칙' : `제${editingChapterNum}장`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsArticleModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveArticle} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">조항 번호 *</label>
                  <input
                    type="text"
                    required
                    value={articleForm.number}
                    onChange={(e) => setArticleForm({ ...articleForm, number: e.target.value })}
                    placeholder="예: 1, 2, 33"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">조항 명칭 (제목) *</label>
                  <input
                    type="text"
                    required
                    value={articleForm.title}
                    onChange={(e) => setArticleForm({ ...articleForm, title: e.target.value })}
                    placeholder="예: 명칭, 목적, 탄핵사유"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">소속 절 (선택 사항)</label>
                <input
                  type="text"
                  value={articleForm.section}
                  onChange={(e) => setArticleForm({ ...articleForm, section: e.target.value })}
                  placeholder="예: 제1절 운영위원회, 제2절 집행부 (없으면 비워둠)"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">조항 본문 (오타 수정 및 항/호 구성) *</label>
                <textarea
                  required
                  rows={10}
                  value={articleForm.content}
                  onChange={(e) => setArticleForm({ ...articleForm, content: e.target.value })}
                  placeholder="조항 본문을 입력하세요. ①, ② 등 항 구분 또는 가., 나. 호 구분을 줄바꿈하여 작성하시면 웹에 정돈되어 표시됩니다."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 leading-relaxed font-mono"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsArticleModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-xs"
                >
                  저장하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* Preamble Edit Modal                                                  */}
      {/* ==================================================================== */}
      {isPreambleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 p-6 sm:p-7 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg text-slate-900">
                    학생회칙 전문 (Preamble) 수정
                  </h3>
                  <p className="text-xs text-slate-400">오타를 수정하고 학생회 공식 설립 이념을 정돈합니다.</p>
                </div>
              </div>
              <button
                onClick={() => setIsPreambleModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePreamble} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-slate-700 mb-1">전문 내용 *</label>
                <textarea
                  required
                  rows={8}
                  value={preambleForm}
                  onChange={(e) => setPreambleForm(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 leading-relaxed"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPreambleModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-xs"
                >
                  저장하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* New Version / Amendment Modal                                        */}
      {/* ==================================================================== */}
      {isNewVersionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 p-6 sm:p-7 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                  <Copy className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg text-slate-900">
                    새 개정 회칙 등록 (버전 복제)
                  </h3>
                  <p className="text-xs text-slate-400">기존 과거 회칙은 영구 보존되며 새 버전이 생성됩니다.</p>
                </div>
              </div>
              <button
                onClick={() => setIsNewVersionModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewVersion} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-slate-700 mb-1">개정 회칙 명칭 *</label>
                <input
                  type="text"
                  required
                  value={newVersionForm.title}
                  onChange={(e) => setNewVersionForm({ ...newVersionForm, title: e.target.value })}
                  placeholder="예: 제12차 개정 학생회칙"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">개정 일자 *</label>
                <input
                  type="text"
                  required
                  value={newVersionForm.revision_date}
                  onChange={(e) => setNewVersionForm({ ...newVersionForm, revision_date: e.target.value })}
                  placeholder="예: 2026-10-23 또는 2026. 10. 23"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">개정 내용 요약 / 사유</label>
                <textarea
                  rows={3}
                  value={newVersionForm.description}
                  onChange={(e) => setNewVersionForm({ ...newVersionForm, description: e.target.value })}
                  placeholder="예: 온라인 정기총회 규정 신설 및 학생회비 감사 일정 조정 등"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">복제할 기준 회칙</label>
                <select
                  value={newVersionForm.clone_from_id}
                  onChange={(e) => setNewVersionForm({ ...newVersionForm, clone_from_id: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm focus:bg-white"
                >
                  {versions.map((ver) => (
                    <option key={ver.id} value={ver.id}>
                      {ver.title} ({ver.revision_date}) {ver.is_current ? '★[현행]' : ''}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  * 선택하신 기존 버전의 전문 및 조항들을 그대로 복제하여 새 버전으로 생성합니다.
                </p>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer p-3 rounded-xl bg-indigo-50/70 border border-indigo-200">
                  <input
                    type="checkbox"
                    checked={newVersionForm.is_current}
                    onChange={(e) => setNewVersionForm({ ...newVersionForm, is_current: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="font-bold text-indigo-950 text-xs sm:text-sm">
                    생성과 동시에 이 개정안을 [현행 회칙(현재 적용)]으로 공포합니다.
                  </span>
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewVersionModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-xs"
                >
                  새 개정안 생성
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
