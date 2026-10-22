import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { BudgetReport, MeetingMinute } from '../lib/types';
import { formatDate } from '../lib/dateUtils';
import { ASSETS } from '../lib/assets';
import { OfficialConstitutionView } from '../components/OfficialConstitutionView';
import {
  ShieldCheck,
  FileText,
  DollarSign,
  Scale,
  Calendar,
  ChevronDown,
  ChevronUp,
  Receipt,
  FileCheck,
} from 'lucide-react';

export const GovernancePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'finance' | 'minutes' | 'rules'>('finance');
  const [reports, setReports] = useState<BudgetReport[]>([]);
  const [minutes, setMeetingMinutes] = useState<MeetingMinute[]>([]);
  const [selectedReport, setSelectedReport] = useState<BudgetReport | null>(null);
  const [openMinuteId, setOpenMinuteId] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      const [rData, mData] = await Promise.all([
        api.getBudgetReports(),
        api.getMeetingMinutes(),
      ]);
      setReports(rData);
      setMeetingMinutes(mData);
      if (rData.length > 0) setSelectedReport(rData[0]);
    }
    loadData();
  }, []);

  return (
    <div className="space-y-10">
      {/* Clean Editorial Page Header */}
      <div className="border-b border-slate-200 pb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4 sm:gap-5">
          <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-22 md:h-22 rounded-2xl bg-indigo-50/70 border border-indigo-100 p-1.5 shrink-0 flex items-center justify-center shadow-xs">
            <img
              src={ASSETS.characters.proud}
              alt="뿌듯함 마스코트"
              className="w-full h-full object-contain drop-shadow-xs"
            />
          </div>
          <div>
            <div className="flex items-center gap-2 text-[11px] font-semibold text-blue-700 tracking-wider uppercase mb-1">
              <span>Student Government & Transparency</span>
            </div>
            <h1 className="font-knou text-xl sm:text-2xl md:text-3xl font-bold text-slate-950 tracking-tight mb-1.5">
              투명 재정 & 학생 자치 자료실
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed max-w-2xl font-normal">
              광주전남 컴퓨터과학과 학생회는 학우들의 소중한 학생회비 집행 내역과 회의록, 학생회칙을 100% 투명하게 공개하여 공정하고 신뢰받는 학생 자치를 실현합니다.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-1">
        <button
          onClick={() => setActiveTab('finance')}
          className={`px-5 py-3 text-base font-bold rounded-t-xl transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'finance'
              ? 'bg-white text-blue-700 border-t-2 border-x border-blue-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
          }`}
        >
          <DollarSign className="w-5 h-5 text-emerald-600" />
          학생회비 결산 보고 ({reports.length})
        </button>
        <button
          onClick={() => setActiveTab('minutes')}
          className={`px-5 py-3 text-base font-bold rounded-t-xl transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'minutes'
              ? 'bg-white text-blue-700 border-t-2 border-x border-blue-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
          }`}
        >
          <FileText className="w-5 h-5 text-indigo-600" />
          임원회·총회 회의록 ({minutes.length})
        </button>
        <button
          onClick={() => setActiveTab('rules')}
          className={`px-5 py-3 text-base font-bold rounded-t-xl transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'rules'
              ? 'bg-white text-blue-700 border-t-2 border-x border-blue-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
          }`}
        >
          <Scale className="w-5 h-5 text-amber-600" />
          학과 학생회칙 및 세칙
        </button>
      </div>

      {/* ========================================== */}
      {/* TAB 1: Financial Reports (투명 회계)        */}
      {/* ========================================== */}
      {activeTab === 'finance' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Transparency Pledge Card */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-3xl p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-6 h-6 text-emerald-700" />
                <h3 className="font-bold text-emerald-950 text-lg">회계 투명성 서약</h3>
              </div>
              <p className="text-sm sm:text-base text-emerald-900 leading-relaxed">
                학생회비는 학우 복지, IT 특강, 실습실 환경 개선, 시험 간식 사업에만 목적대로 사용되며, 모든 영수증은 감사 후 대외 공개됩니다.
              </p>
            </div>
            <span className="text-sm font-bold px-4 py-2 rounded-xl bg-emerald-600 text-white shrink-0 self-start sm:self-center shadow-xs">
              감사 및 공시 완료
            </span>
          </div>

          {/* Report Selector Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {reports.map((rep) => (
              <button
                key={rep.id}
                onClick={() => setSelectedReport(rep)}
                className={`px-4.5 py-2.5 rounded-2xl text-sm font-bold whitespace-nowrap transition-all border ${
                  selectedReport?.id === rep.id
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {rep.period}
              </button>
            ))}
          </div>

          {selectedReport && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
                <div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-100 text-blue-800">
                    {selectedReport.status}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1.5">
                    {selectedReport.title}
                  </h2>
                  <p className="text-sm text-slate-600 mt-1">
                    집행 기간: <strong className="text-slate-800">{selectedReport.period}</strong> | 공시일: {formatDate(selectedReport.published_date)}
                  </p>
                </div>

                <button
                  onClick={() => alert('PDF 결산 영수증 모음집 다운로드 준비 중입니다.')}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-bold self-start sm:self-center transition-colors"
                >
                  <Receipt className="w-4 h-4" />
                  영수증 증빙 확인
                </button>
              </div>

              {/* Financial Balance Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-100">
                  <span className="text-sm text-blue-800 font-bold">총 수입 (이월+납부)</span>
                  <div className="text-2xl sm:text-3xl font-black text-blue-950 mt-1">
                    ₩{selectedReport.income_total.toLocaleString()}
                  </div>
                </div>
                <div className="p-5 rounded-2xl bg-rose-50/70 border border-rose-100">
                  <span className="text-sm text-rose-800 font-bold">총 지출 (사업 집행)</span>
                  <div className="text-2xl sm:text-3xl font-black text-rose-950 mt-1">
                    ₩{selectedReport.expense_total.toLocaleString()}
                  </div>
                </div>
                <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-100">
                  <span className="text-sm text-emerald-800 font-bold">현재 잔액 (이월 예정)</span>
                  <div className="text-2xl sm:text-3xl font-black text-emerald-950 mt-1">
                    ₩{selectedReport.balance.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Detailed Ledger Items Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-y border-slate-200 text-slate-600 font-bold">
                      <th className="py-3.5 px-3">일자</th>
                      <th className="py-3.5 px-2">구분</th>
                      <th className="py-3.5 px-3">항목</th>
                      <th className="py-3.5 px-4">적요 (상세 내역)</th>
                      <th className="py-3.5 px-3 text-right">금액</th>
                      <th className="py-3.5 px-3 text-center">비고</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedReport.items.map((it) => (
                      <tr key={it.id} className="hover:bg-slate-50/50">
                        <td className="py-3.5 px-3 font-mono text-slate-600 font-medium">{it.date}</td>
                        <td className="py-3.5 px-2">
                          <span
                            className={`font-bold px-2.5 py-0.5 rounded text-xs ${
                              it.type === '수입'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {it.type}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 font-bold text-slate-800">{it.category}</td>
                        <td className="py-3.5 px-4 text-slate-800 font-medium">{it.description}</td>
                        <td className={`py-3.5 px-3 text-right font-extrabold text-base ${
                          it.type === '수입' ? 'text-blue-700' : 'text-rose-700'
                        }`}>
                          {it.type === '수입' ? '+' : '-'}₩{it.amount.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-3 text-center text-slate-500 text-xs">
                          {it.note || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================== */}
      {/* TAB 2: Meeting Minutes (회의록)             */}
      {/* ========================================== */}
      {activeTab === 'minutes' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">의결기구 회의록 아카이브</h2>
              <p className="text-sm sm:text-base text-slate-600 mt-1">
                정기 임원회의 및 개강·종강총회의 안건 논의 내용과 의결 결과를 투명하게 기록합니다.
              </p>
            </div>

            <div className="space-y-4">
              {minutes.map((m) => {
                const isOpen = openMinuteId === m.id;
                return (
                  <div key={m.id} className="border border-slate-200 rounded-2xl overflow-hidden transition-all">
                    <button
                      onClick={() => setOpenMinuteId(isOpen ? null : m.id)}
                      className="w-full p-4.5 sm:p-5.5 text-left flex items-center justify-between gap-4 bg-slate-50/60 hover:bg-slate-50 transition-colors"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-100 text-indigo-800">
                            {m.meeting_type}
                          </span>
                          <span className="text-xs font-medium text-slate-600 flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {m.meeting_date}
                          </span>
                        </div>
                        <h3 className="font-bold text-base sm:text-lg text-slate-900">{m.title}</h3>
                      </div>

                      {isOpen ? (
                        <ChevronUp className="w-5 h-5 text-indigo-600 shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                      )}
                    </button>

                    {isOpen && (
                      <div className="p-5 sm:p-6 bg-white border-t border-slate-100 text-sm sm:text-base text-slate-700 space-y-4 leading-relaxed">
                        <div className="p-3.5 bg-slate-50 rounded-xl space-y-1">
                          <div className="font-bold text-slate-900">참석자:</div>
                          <div className="text-slate-700">{m.attendees}</div>
                        </div>

                        <div>
                          <div className="font-bold text-slate-900 mb-1.5">상정 안건:</div>
                          <div className="whitespace-pre-line text-slate-800 bg-blue-50/60 p-4 rounded-xl border border-blue-100">
                            {m.agenda}
                          </div>
                        </div>

                        <div>
                          <div className="font-bold text-slate-900 mb-1.5">회의 내용:</div>
                          <div className="whitespace-pre-line text-slate-800 leading-relaxed">
                            {m.content}
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-100 flex items-center gap-2 text-indigo-950 font-bold text-base">
                          <FileCheck className="w-5 h-5 text-indigo-600 shrink-0" />
                          <span>최종 의결 결과: {m.decisions}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* TAB 3: Council Rules (학생회칙)            */}
      {/* ========================================== */}
      {activeTab === 'rules' && (
        <OfficialConstitutionView />
      )}
    </div>
  );
};
