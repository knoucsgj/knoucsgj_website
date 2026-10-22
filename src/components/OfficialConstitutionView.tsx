import React, { useState, useMemo } from 'react';
import {
  officialConstitutionDocuments,
  type ConstitutionChapter
} from '../data/officialConstitution';
import {
  Scale,
  FileText,
  Download,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Search,
  BookOpen
} from 'lucide-react';

export const OfficialConstitutionView: React.FC = () => {
  const [selectedDocId, setSelectedDocId] = useState<'constitution' | 'election' | 'bylaws'>('constitution');
  const [searchQuery, setSearchQuery] = useState('');
  const [openChapters, setOpenChapters] = useState<Record<string, boolean>>({
    '1': true // First chapter open by default
  });

  const activeDoc = useMemo(() => {
    return officialConstitutionDocuments.find((d) => d.id === selectedDocId) || officialConstitutionDocuments[0];
  }, [selectedDocId]);

  // Toggle chapter open/close
  const toggleChapter = (key: string) => {
    setOpenChapters((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Expand or Collapse all
  const setAllChapters = (open: boolean) => {
    const next: Record<string, boolean> = {};
    activeDoc.chapters.forEach((ch) => {
      next[String(ch.chapter)] = open;
    });
    setOpenChapters(next);
  };

  // Filtered chapters & articles based on searchQuery
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

  // Total article count in active document
  const totalArticles = useMemo(() => {
    return activeDoc.chapters.reduce((sum, ch) => sum + ch.articles.length, 0);
  }, [activeDoc]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6">
        <div className="pb-6 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
                공식 학생회 규범 전문
              </span>
              <span className="text-xs text-slate-500 font-medium">
                한국방송통신대학교 광주전남지역대학 컴퓨터과학과
              </span>
              <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {activeDoc.revision_date}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 tracking-tight font-knou">
              {activeDoc.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
              본 규정은 광주전남 컴퓨터과학과 모든 학우의 자치 권익과 투명한 학생회 운영의 근간이 되는 공식 원본 전문입니다.
            </p>
          </div>

          {/* PDF Viewer & Download Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <a
              href="/Constitution/컴퓨터과학과학생회칙.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-xs transition-all"
            >
              <FileText className="w-4 h-4" />
              <span>공식 PDF 전문 보기</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>
            <a
              href="/Constitution/컴퓨터과학과학생회칙.pdf"
              download="컴퓨터과학과학생회칙.pdf"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm border border-slate-200 transition-all"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>PDF 다운로드</span>
            </a>
          </div>
        </div>

        {/* 3-Way Document Selector Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
          {officialConstitutionDocuments.map((doc) => {
            const isSelected = doc.id === selectedDocId;
            return (
              <button
                key={doc.id}
                onClick={() => {
                  setSelectedDocId(doc.id);
                  setSearchQuery('');
                  setOpenChapters({ '1': true });
                }}
                className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all text-center flex items-center justify-center gap-2 ${
                  isSelected
                    ? 'bg-white text-blue-700 shadow-xs border border-blue-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <BookOpen className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                <span>{doc.short_title}</span>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                    isSelected ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {doc.chapters.reduce((sum, ch) => sum + ch.articles.length, 0)}개 조
                </span>
              </button>
            );
          })}
        </div>

        {/* Preamble Box (전 문) - Only for Constitution */}
        {activeDoc.preamble && (
          <div className="bg-gradient-to-r from-blue-50/70 via-slate-50 to-indigo-50/60 p-5 sm:p-6 rounded-2xl border border-blue-100/80 space-y-2">
            <div className="flex items-center gap-2 text-blue-900 font-bold text-sm sm:text-base">
              <Scale className="w-4 h-4 text-blue-700" />
              <span>전 문 (Preamble)</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal whitespace-pre-line pl-6 border-l-2 border-blue-400">
              {activeDoc.preamble}
            </p>
          </div>
        )}

        {/* Search & Bulk Toggle Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="조항 명칭, 번호, 본문 검색 (예: 탄핵, 선거, 의결, 회비)..."
              className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => setAllChapters(true)}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
            >
              전체 펼치기
            </button>
            <button
              onClick={() => setAllChapters(false)}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
            >
              전체 접기
            </button>
            <span className="text-xs font-semibold text-slate-500 pl-2">
              총 {totalArticles}개 조항
            </span>
          </div>
        </div>

        {/* Chapters Accordion */}
        <div className="space-y-4 pt-2">
          {filteredChapters.map((chapter) => {
            const chapKey = String(chapter.chapter);
            const isOpen = searchQuery.trim() ? true : Boolean(openChapters[chapKey]);

            return (
              <div
                key={chapKey}
                className="border border-slate-200 rounded-2xl overflow-hidden transition-all bg-white"
              >
                {/* Chapter Title Bar */}
                <button
                  onClick={() => toggleChapter(chapKey)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 bg-slate-50/80 hover:bg-slate-100/70 transition-colors"
                >
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="px-2.5 py-1 rounded-md bg-blue-100 text-blue-800 font-extrabold text-xs">
                      {chapKey === '부칙' ? '부칙' : `제${chapter.chapter}장`}
                    </span>
                    <h3 className="font-bold text-sm sm:text-base text-slate-900 tracking-tight">
                      {chapter.title}
                    </h3>
                    <span className="text-xs text-slate-400 font-medium">
                      ({chapter.articles.length}개 조항)
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-blue-600" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                </button>

                {/* Chapter Articles Body */}
                {isOpen && (
                  <div className="p-4 sm:p-6 border-t border-slate-100 space-y-6 divide-y divide-slate-100">
                    {chapter.articles.map((art) => (
                      <div key={String(art.number)} className="pt-5 first:pt-0 space-y-2">
                        {/* Section Header if available */}
                        {art.section && (
                          <div className="inline-block text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 mb-1">
                            {art.section}
                          </div>
                        )}

                        {/* Article Title */}
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span className="font-extrabold text-sm sm:text-base text-blue-950">
                            제{art.number}조 ({art.title})
                          </span>
                        </div>

                        {/* Article Content with clean paragraph layout */}
                        <div className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal whitespace-pre-line pl-1 space-y-1.5">
                          {art.content.split('\n').map((line, lIdx) => (
                            <p
                              key={lIdx}
                              className={
                                line.startsWith('①') ||
                                line.startsWith('②') ||
                                line.startsWith('③') ||
                                line.startsWith('④') ||
                                line.startsWith('⑤') ||
                                line.startsWith('⑥') ||
                                line.startsWith('⑦') ||
                                line.startsWith('⑧') ||
                                line.startsWith('⑨') ||
                                line.startsWith('⑩')
                                  ? 'font-medium text-slate-800 pt-0.5'
                                  : line.startsWith('가.') || line.startsWith('나.') || line.startsWith('다.') || line.startsWith('라.') || line.startsWith('마.')
                                  ? 'pl-3 text-slate-700'
                                  : 'text-slate-700'
                              }
                            >
                              {line}
                            </p>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {filteredChapters.length === 0 && (
            <div className="py-12 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <p className="text-sm font-semibold">
                "{searchQuery}"에 해당하는 회칙 조항을 찾을 수 없습니다.
              </p>
              <p className="text-xs text-slate-400 mt-1">
                다른 단어로 검색하시거나 검색어를 지워주세요.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
