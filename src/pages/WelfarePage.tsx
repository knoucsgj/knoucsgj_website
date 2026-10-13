import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ASSETS } from '../lib/assets';
import {
  Image as ImageIcon,
  MessageSquare,
  CheckCircle2,
  MapPin,
  Send,
  AlertCircle
} from 'lucide-react';

export const WelfarePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'gallery' | 'feedback'>('gallery');
  const [gallery, setGallery] = useState<Array<{ id: string; title: string; date: string; location: string; image_url: string; desc: string }>>([]);

  // 건의함 State
  const [feedbackTitle, setFeedbackTitle] = useState('');
  const [feedbackCategory, setFeedbackCategory] = useState<'학사/수업' | '행사/스터디' | '학생회운영' | '기타'>('학사/수업');
  const [feedbackAuthor, setFeedbackAuthor] = useState('');
  const [feedbackContent, setFeedbackContent] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  useEffect(() => {
    async function loadData() {
      const gData = await api.getGalleryPhotos();
      setGallery(gData);
    }
    loadData();
  }, []);

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

  return (
    <div className="space-y-10">
      {/* Clean Editorial Page Header */}
      <div className="border-b border-slate-200 pb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4 sm:gap-5">
          <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-22 md:h-22 rounded-2xl bg-blue-50/70 border border-blue-100 p-1.5 shrink-0 flex items-center justify-center shadow-xs">
            <img
              src={ASSETS.characters.heart}
              alt="소통 하트 마스코트"
              className="w-full h-full object-contain drop-shadow-xs"
            />
          </div>
          <div>
            <div className="flex items-center gap-2 text-[11px] font-semibold text-blue-700 tracking-wider uppercase mb-1">
              <span>Photo Gallery & Communication</span>
            </div>
            <h1 className="font-knou text-xl sm:text-2xl md:text-3xl font-bold text-slate-950 tracking-tight mb-1.5">
              학과 갤러리 & 소통 창구
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed max-w-2xl font-normal">
              한국방송통신대학교 광주전남지역대학 컴퓨터과학과의 생생한 활동 현장 기록과 학우 여러분의 목소리를 듣는 열린 소통 공간입니다.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-1">
        <button
          onClick={() => setActiveTab('gallery')}
          className={`px-5 py-3 text-base font-bold rounded-t-xl transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'gallery'
              ? 'bg-white text-blue-700 border-t-2 border-x border-blue-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
          }`}
        >
          <ImageIcon className="w-5 h-5 text-blue-600" />
          학과 활동 갤러리 ({gallery.length})
        </button>
        <button
          onClick={() => setActiveTab('feedback')}
          className={`px-5 py-3 text-base font-bold rounded-t-xl transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'feedback'
              ? 'bg-white text-blue-700 border-t-2 border-x border-blue-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
          }`}
        >
          <MessageSquare className="w-5 h-5 text-indigo-600" />
          학우 소통 및 열린 건의함
        </button>
      </div>

      {/* ========================================== */}
      {/* TAB 1: 활동 갤러리                          */}
      {/* ========================================== */}
      {activeTab === 'gallery' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gallery.map((photo) => (
              <div
                key={photo.id}
                className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-md transition-shadow group"
              >
                <div className="aspect-video w-full overflow-hidden bg-slate-100 relative">
                  <img
                    src={photo.image_url}
                    alt={photo.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute bottom-2.5 left-2.5 bg-black/65 backdrop-blur-xs text-white text-xs font-semibold px-3 py-1 rounded-lg flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    {photo.location}
                  </div>
                </div>

                <div className="p-5 sm:p-6">
                  <p className="text-xs text-blue-600 font-bold mb-1">{photo.date}</p>
                  <h3 className="font-bold text-slate-900 text-lg mb-2 group-hover:text-blue-700 transition-colors">
                    {photo.title}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed line-clamp-2">
                    {photo.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* TAB 2: 소통 & 건의함                        */}
      {/* ========================================== */}
      {activeTab === 'feedback' && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5 sm:p-6 text-indigo-950">
            <h3 className="font-bold text-lg mb-1.5 flex items-center gap-2 text-indigo-900">
              <MessageSquare className="w-5 h-5 text-indigo-600" />
              학우 여러분의 소중한 의견을 들려주세요
            </h3>
            <p className="text-sm text-indigo-900 leading-relaxed mt-1">
              학우 제휴 혜택 건의, 출석수업 및 학사 건의, 학술 스터디 지원 요청 등 다양한 의견을 자유롭게 남겨주시면 정기 임원회의 안건으로 적극 상정하여 답변드리겠습니다.
            </p>
          </div>

          {feedbackSubmitted && (
            <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-5 sm:p-6 text-emerald-900 flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-base">건의사항이 학생회에 안전하게 접수되었습니다!</p>
                <p className="text-sm text-emerald-800 mt-1">
                  소중한 의견 감사드립니다. 다음 정기 임원회의에서 안건으로 다룬 후 회의록을 통해 결과를 공지하겠습니다.
                </p>
                <button
                  onClick={() => setFeedbackSubmitted(false)}
                  className="mt-3 text-sm font-bold text-emerald-800 underline hover:text-emerald-950"
                >
                  새로운 의견 남기기
                </button>
              </div>
            </div>
          )}

          {!feedbackSubmitted && (
            <form onSubmit={handleFeedbackSubmit} className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-1.5">분류</label>
                  <select
                    value={feedbackCategory}
                    onChange={(e) => setFeedbackCategory(e.target.value as any)}
                    className="w-full text-sm border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-slate-50"
                  >
                    <option value="제휴/복지">학우 제휴 & 복지 혜택</option>
                    <option value="학사/수업">학사 일정 & 출석수업</option>
                    <option value="행사/스터디">학과 행사 & 스터디 지원</option>
                    <option value="기타">기타 자유 제안</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-1.5">작성자 (익명 가능)</label>
                  <input
                    type="text"
                    value={feedbackAuthor}
                    onChange={(e) => setFeedbackAuthor(e.target.value)}
                    placeholder="익명 또는 학번/이름"
                    className="w-full text-sm border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1.5">제목 *</label>
                <input
                  type="text"
                  required
                  value={feedbackTitle}
                  onChange={(e) => setFeedbackTitle(e.target.value)}
                  placeholder="건의사항 제목을 간략히 적어주세요"
                  className="w-full text-sm border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1.5">상세 내용 *</label>
                <textarea
                  required
                  rows={5}
                  value={feedbackContent}
                  onChange={(e) => setFeedbackContent(e.target.value)}
                  placeholder="학생회에 건의하고 싶은 내용을 상세히 적어주세요. 학우 여러분의 피드백은 학생회 운영에 큰 힘이 됩니다."
                  className="w-full text-sm border border-slate-300 rounded-xl p-3.5 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                />
              </div>

              <div className="bg-slate-50 rounded-xl p-3.5 text-xs sm:text-sm text-slate-600 flex items-center gap-2.5 border border-slate-200">
                <AlertCircle className="w-4.5 h-4.5 text-slate-400 shrink-0" />
                <span>접수된 건의는 매월 개최되는 학생회 임원회의에서 검토되며 비방·욕설 등은 반려될 수 있습니다.</span>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm sm:text-base font-bold transition-colors flex items-center justify-center gap-2 shadow-xs"
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
