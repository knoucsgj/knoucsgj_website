import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { RentalItem, PartnershipItem } from '../lib/types';
import {
  Package,
  Sparkles,
  Image as ImageIcon,
  MessageSquare,
  CheckCircle2,
  Clock,
  MapPin,
  ExternalLink,
  Info,
  Send,
  AlertCircle,
  Copy,
  Check
} from 'lucide-react';

export const WelfarePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'rentals' | 'partnerships' | 'gallery' | 'feedback'>('rentals');
  const [rentals, setRentals] = useState<RentalItem[]>([]);
  const [partnerships, setPartnerships] = useState<PartnershipItem[]>([]);
  const [gallery, setGallery] = useState<Array<{ id: string; title: string; date: string; location: string; image_url: string; desc: string }>>([]);
  const [selectedRentalCategory, setSelectedRentalCategory] = useState<string>('전체');

  // 건의함 State
  const [feedbackTitle, setFeedbackTitle] = useState('');
  const [feedbackCategory, setFeedbackCategory] = useState<'복지/비품' | '학사/수업' | '행사/스터디' | '기타'>('복지/비품');
  const [feedbackAuthor, setFeedbackAuthor] = useState('');
  const [feedbackContent, setFeedbackContent] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      const [rData, pData, gData] = await Promise.all([
        api.getRentalItems(),
        api.getPartnerships(),
        api.getGalleryPhotos()
      ]);
      setRentals(rData);
      setPartnerships(pData);
      setGallery(gData);
    }
    loadData();
  }, []);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackTitle.trim() || !feedbackContent.trim()) {
      alert('제목과 내용을 입력해 주세요.');
      return;
    }
    // 건의 제출 시뮬레이션
    setFeedbackSubmitted(true);
    setFeedbackTitle('');
    setFeedbackContent('');
    setFeedbackAuthor('');
  };

  const filteredRentals = rentals.filter((item) => {
    if (selectedRentalCategory === '전체') return true;
    return item.category === selectedRentalCategory;
  });

  return (
    <div className="space-y-10">
      {/* Clean Editorial Page Header */}
      <div className="border-b border-slate-200 pb-8">
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 tracking-wider uppercase mb-2">
          <span>Student Welfare & Communication</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight mb-3">
          학생 복지 & 소통 센터
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-3xl font-normal">
          광주전남지역대학 컴퓨터과학과 학생회는 학우들의 원활한 학습과 대학 생활을 위해 실습 교재 및 비품 대여, IT 제휴 혜택, 열린 소통 창구를 운영합니다.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto pb-px gap-2">
        <button
          onClick={() => setActiveTab('rentals')}
          className={`px-5 py-3 text-sm font-semibold rounded-t-xl transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'rentals'
              ? 'bg-white text-emerald-700 border-t-2 border-x border-emerald-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
          }`}
        >
          <Package className="w-4 h-4 text-emerald-600" />
          학생회 비품·교재 대여 ({rentals.length})
        </button>
        <button
          onClick={() => setActiveTab('partnerships')}
          className={`px-5 py-3 text-sm font-semibold rounded-t-xl transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'partnerships'
              ? 'bg-white text-emerald-700 border-t-2 border-x border-emerald-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          학우 제휴 혜택 ({partnerships.length})
        </button>
        <button
          onClick={() => setActiveTab('gallery')}
          className={`px-5 py-3 text-sm font-semibold rounded-t-xl transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'gallery'
              ? 'bg-white text-emerald-700 border-t-2 border-x border-emerald-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
          }`}
        >
          <ImageIcon className="w-4 h-4 text-blue-500" />
          활동 갤러리 ({gallery.length})
        </button>
        <button
          onClick={() => setActiveTab('feedback')}
          className={`px-5 py-3 text-sm font-semibold rounded-t-xl transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'feedback'
              ? 'bg-white text-emerald-700 border-t-2 border-x border-emerald-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-indigo-500" />
          학우 소통 및 건의함
        </button>
      </div>

      {/* ========================================== */}
      {/* TAB 1: 비품 및 교재 대여                    */}
      {/* ========================================== */}
      {activeTab === 'rentals' && (
        <div className="space-y-6">
          {/* Information & Instructions Banner */}
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-5 text-emerald-950 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-bold text-emerald-900 mb-1">대여 이용 안내 및 수칙</p>
                <p className="text-emerald-800 leading-relaxed">
                  광주전남지역대학 컴퓨터과학과 재학생이라면 누구나 대여 가능합니다. 
                  대여 시 학생증(모바일 학생증 가능)을 지참해 학생회실(본관 405호)에 방문해 대여 대장을 작성해 주세요.
                </p>
              </div>
            </div>
            <div className="text-xs bg-white text-emerald-900 font-semibold px-4 py-2.5 rounded-xl border border-emerald-300 shadow-xs shrink-0">
              최대 대여 기간: <span className="text-emerald-700 font-bold">7일 (연장 1회 가능)</span>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {['전체', '전산실습 교재', 'IT 기기/소모품', '생활복지'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedRentalCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  selectedRentalCategory === cat
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredRentals.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                      {item.category}
                    </span>
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${
                        item.status === '대여가능' && item.available_qty > 0
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {item.status === '대여가능' && item.available_qty > 0 ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          대여 가능 ({item.available_qty}/{item.total_qty})
                        </>
                      ) : (
                        <>
                          <Clock className="w-3.5 h-3.5" />
                          모두 대여 중 ({item.available_qty}/{item.total_qty})
                        </>
                      )}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base mb-2">{item.name}</h3>
                  <p className="text-slate-600 text-xs leading-relaxed mb-4">{item.desc}</p>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>보관 장소: {item.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>신청 방법: 학생회실 당일 방문 또는 사전 문의</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* TAB 2: 제휴 혜택                            */}
      {/* ========================================== */}
      {activeTab === 'partnerships' && (
        <div className="space-y-6">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-amber-950 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-bold text-amber-900 mb-1">컴퓨터과학과 학우 전용 특별 제휴</p>
              <p className="text-amber-800 leading-relaxed">
                학생회는 학우들의 자기계발 및 수강 편의를 위해 온라인 IT 교육 플랫폼 및 전공 출판사, 지역 스터디 공간과 협력 제휴를 맺고 있습니다.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {partnerships.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-amber-100 text-amber-800">
                      {p.category}
                    </span>
                    <span className="text-xs text-slate-500">{p.period}</span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-lg mb-2">{p.partner_name}</h3>
                  <div className="bg-slate-50 rounded-xl p-3 mb-4 border border-slate-100">
                    <p className="text-xs font-semibold text-slate-500 mb-1">제휴 혜택</p>
                    <p className="text-sm font-bold text-emerald-700">{p.benefit}</p>
                  </div>

                  <div className="text-xs text-slate-600 space-y-2">
                    <p className="font-semibold text-slate-800">이용 방법:</p>
                    <p className="leading-relaxed bg-slate-100/70 p-2.5 rounded-lg border border-slate-200">
                      {p.instructions}
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleCopyCode('KNOUCS2026')}
                    className="flex-1 py-2 px-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    {copiedCode === 'KNOUCS2026' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        복사 완료!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        제휴 코드 복사
                      </>
                    )}
                  </button>
                  {p.link && (
                    <a
                      href={p.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2 px-3 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      바로가기
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* TAB 3: 활동 갤러리                          */}
      {/* ========================================== */}
      {activeTab === 'gallery' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gallery.map((photo) => (
              <div
                key={photo.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow group"
              >
                <div className="aspect-video w-full overflow-hidden bg-slate-100 relative">
                  <img
                    src={photo.image_url}
                    alt={photo.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-xs text-white text-[11px] px-2.5 py-1 rounded-md flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {photo.location}
                  </div>
                </div>

                <div className="p-5">
                  <p className="text-xs text-blue-600 font-semibold mb-1">{photo.date}</p>
                  <h3 className="font-bold text-slate-900 text-base mb-2 group-hover:text-blue-700 transition-colors">
                    {photo.title}
                  </h3>
                  <p className="text-slate-600 text-xs leading-relaxed line-clamp-2">
                    {photo.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* TAB 4: 소통 & 건의함                        */}
      {/* ========================================== */}
      {activeTab === 'feedback' && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5 text-indigo-950">
            <h3 className="font-bold text-base mb-1 flex items-center gap-2 text-indigo-900">
              <MessageSquare className="w-5 h-5 text-indigo-600" />
              학우 여러분의 소중한 의견을 들려주세요
            </h3>
            <p className="text-xs text-indigo-800 leading-relaxed mt-1">
              학생회실 비품 희망 품목, 출석수업 및 학사 건의, 학술 스터디 지원 요청 등 다양한 의견을 자유롭게 남겨주시면 정기 임원회의 안건으로 적극 상정하여 답변드리겠습니다.
            </p>
          </div>

          {feedbackSubmitted && (
            <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-5 text-emerald-900 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm">건의사항이 학생회에 안전하게 접수되었습니다!</p>
                <p className="text-xs text-emerald-700 mt-1">
                  소중한 의견 감사드립니다. 다음 정기 임원회의에서 안건으로 다룬 후 회의록을 통해 결과를 공지하겠습니다.
                </p>
                <button
                  onClick={() => setFeedbackSubmitted(false)}
                  className="mt-3 text-xs font-semibold text-emerald-800 underline hover:text-emerald-900"
                >
                  새로운 의견 남기기
                </button>
              </div>
            </div>
          )}

          {!feedbackSubmitted && (
            <form onSubmit={handleFeedbackSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">분류</label>
                  <select
                    value={feedbackCategory}
                    onChange={(e) => setFeedbackCategory(e.target.value as any)}
                    className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="복지/비품">복지 물품 & 대여 건의</option>
                    <option value="학사/수업">학사 일정 & 출석수업</option>
                    <option value="행사/스터디">학과 행사 & 스터디 지원</option>
                    <option value="기타">기타 자유 제안</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">작성자 (익명 가능)</label>
                  <input
                    type="text"
                    value={feedbackAuthor}
                    onChange={(e) => setFeedbackAuthor(e.target.value)}
                    placeholder="익명 또는 학번/이름"
                    className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">제목 *</label>
                <input
                  type="text"
                  required
                  value={feedbackTitle}
                  onChange={(e) => setFeedbackTitle(e.target.value)}
                  placeholder="건의사항 제목을 간략히 적어주세요"
                  className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">상세 내용 *</label>
                <textarea
                  required
                  rows={5}
                  value={feedbackContent}
                  onChange={(e) => setFeedbackContent(e.target.value)}
                  placeholder="학생회에 건의하고 싶은 내용을 상세히 적어주세요. 학우 여러분의 피드백은 학생회 운영에 큰 힘이 됩니다."
                  className="w-full text-xs border border-slate-300 rounded-xl p-3 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                />
              </div>

              <div className="bg-slate-50 rounded-xl p-3 text-[11px] text-slate-500 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-slate-400 shrink-0" />
                <span>접수된 건의는 매월 개최되는 학생회 임원회의에서 검토되며 비방·욕설 등은 반려될 수 있습니다.</span>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                <Send className="w-4 h-4" />
                건의사항 제출하기
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};
