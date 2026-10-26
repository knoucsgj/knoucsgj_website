import React from 'react';
import type { MeetingMinute } from '../lib/types';
import { formatDate } from '../lib/dateUtils';
import { Printer, X, FileText, Image as ImageIcon } from 'lucide-react';

interface Props {
  minute: MeetingMinute;
  onClose: () => void;
}

export const MeetingMinutePrintView: React.FC<Props> = ({ minute, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs flex items-start justify-center p-2 sm:p-4 md:p-6 print:p-0 print:bg-white print:static print:inset-auto">
      {/* Container */}
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden my-4 sm:my-8 print:my-0 print:shadow-none print:w-full print:max-w-none print:rounded-none">
        
        {/* Screen-Only Control Toolbar (Hidden on print) */}
        <div className="print:hidden bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">학생회 공식 회의록 공문서 양식 출력</h3>
              <p className="text-xs text-slate-400">A4 규격에 맞춰 인쇄하거나 PDF로 저장하실 수 있습니다.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>인쇄 / PDF 저장</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="닫기"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Document Body */}
        <div className="p-8 sm:p-12 md:p-16 bg-white text-slate-900 print:p-8 font-serif leading-relaxed">
          
          {/* Official Document Header */}
          <div className="text-center pb-6 border-b-2 border-slate-900">
            <p className="text-xs sm:text-sm tracking-widest text-slate-600 font-sans font-medium mb-1">
              한국방송통신대학교 광주전남지역대학 컴퓨터과학과 학생회
            </p>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-slate-950 my-2">
              회 의 록 (會議錄)
            </h1>
            <div className="flex justify-between items-center text-xs font-sans text-slate-500 mt-4 px-2">
              <span>문서분류: 학생자치기구 정규의결문서</span>
              <span>회의구분: <strong className="text-slate-800">{minute.meeting_type}</strong></span>
              <span>작성일자: {formatDate(minute.meeting_date)}</span>
            </div>
          </div>

          {/* Meeting Summary Table */}
          <div className="my-6">
            <table className="w-full border-collapse border border-slate-400 text-xs sm:text-sm font-sans">
              <tbody>
                <tr>
                  <th className="border border-slate-300 bg-slate-100 p-2.5 text-left w-24 sm:w-28 font-bold text-slate-800">
                    회 의 명
                  </th>
                  <td colSpan={3} className="border border-slate-300 p-2.5 font-bold text-slate-950">
                    {minute.title}
                  </td>
                </tr>
                <tr>
                  <th className="border border-slate-300 bg-slate-100 p-2.5 text-left font-bold text-slate-800">
                    일 시
                  </th>
                  <td className="border border-slate-300 p-2.5">
                    {minute.meeting_date}
                  </td>
                  <th className="border border-slate-300 bg-slate-100 p-2.5 text-left w-24 sm:w-28 font-bold text-slate-800">
                    장 소
                  </th>
                  <td className="border border-slate-300 p-2.5">
                    {minute.location || '광주전남지역대학 학생회실'}
                  </td>
                </tr>
                <tr>
                  <th className="border border-slate-300 bg-slate-100 p-2.5 text-left font-bold text-slate-800">
                    의장 (주재자)
                  </th>
                  <td className="border border-slate-300 p-2.5 font-medium">
                    {minute.chairperson || '학생회장'}
                  </td>
                  <th className="border border-slate-300 bg-slate-100 p-2.5 text-left font-bold text-slate-800">
                    서기 (기록자)
                  </th>
                  <td className="border border-slate-300 p-2.5 font-medium">
                    {minute.recorder || '총무부장'}
                  </td>
                </tr>
                <tr>
                  <th className="border border-slate-300 bg-slate-100 p-2.5 text-left font-bold text-slate-800 align-top">
                    참석자 명단
                  </th>
                  <td colSpan={3} className="border border-slate-300 p-2.5 text-slate-800 whitespace-pre-wrap">
                    {minute.attendees || '임원진 전원'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 1: Agenda */}
          <div className="my-6">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 border-b border-slate-300 pb-1 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-slate-800 inline-block"></span>
              1. 상정 안건 (Agenda)
            </h2>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs sm:text-sm font-sans whitespace-pre-wrap text-slate-800 leading-relaxed">
              {minute.agenda || '상정 안건 없음'}
            </div>
          </div>

          {/* Section 2: Meeting Proceedings and Discussions */}
          <div className="my-6">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 border-b border-slate-300 pb-1 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-slate-800 inline-block"></span>
              2. 회의 경과 및 주요 논의 내용
            </h2>
            <div className="p-4 border border-slate-200 rounded-lg text-xs sm:text-sm font-sans whitespace-pre-wrap text-slate-800 leading-relaxed min-h-[140px]">
              {minute.content || '기록된 세부 회의 내용이 없습니다.'}
            </div>
          </div>

          {/* Section 3: Decisions & Resolutions */}
          <div className="my-6">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 border-b border-slate-300 pb-1 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-700 inline-block"></span>
              3. 의결 및 결정 사항 (Resolutions)
            </h2>
            <div className="p-4 bg-blue-50/60 border-2 border-blue-200 rounded-lg text-xs sm:text-sm font-sans font-medium whitespace-pre-wrap text-slate-900 leading-relaxed">
              {minute.decisions || '의결 사항 없음'}
            </div>
          </div>

          {/* Section 4: Attachments / Images (if any) */}
          {minute.attachments && minute.attachments.length > 0 && (
            <div className="my-6 page-break-inside-avoid">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 border-b border-slate-300 pb-1 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-800 inline-block"></span>
                4. 별첨 자료 및 현장 사진 증빙
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {minute.attachments.map((att, idx) => (
                  <div key={idx} className="border border-slate-200 rounded-lg p-3 bg-slate-50 text-xs font-sans">
                    <div className="font-semibold text-slate-800 mb-1 flex items-center gap-1.5 truncate">
                      {att.type === 'image' || att.url.startsWith('data:image') ? (
                        <ImageIcon className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      ) : (
                        <FileText className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                      )}
                      <span className="truncate">{att.name}</span>
                    </div>
                    {att.url && (att.type === 'image' || att.url.startsWith('data:image')) && (
                      <div className="mt-2 max-h-48 overflow-hidden rounded border border-slate-300 bg-white flex items-center justify-center">
                        <img src={att.url} alt={att.name} className="max-h-48 object-contain" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Revision History Notice (if edited) */}
          {minute.edit_history && minute.edit_history.length > 0 && (
            <div className="my-6 p-3 bg-amber-50/60 border border-amber-200 rounded text-xs font-sans text-amber-900">
              <span className="font-bold">※ 문서 정정/수정 이력: </span>
              {minute.edit_history.map((h, i) => (
                <span key={i} className="inline-block mr-3">
                  [{formatDate(h.edited_at)}] {h.edited_by} ({h.reason})
                </span>
              ))}
            </div>
          )}

          {/* Official Signatures & Seal Footer */}
          <div className="mt-12 pt-8 border-t-2 border-slate-900 text-center font-sans page-break-inside-avoid">
            <p className="text-sm sm:text-base font-semibold text-slate-900 mb-8">
              위와 같이 회의가 적법하게 개최되고 의결되었음을 확인하고 서명 날인합니다.
            </p>

            <p className="text-xs sm:text-sm text-slate-600 mb-8">
              {formatDate(minute.meeting_date)}
            </p>

            <div className="flex justify-center items-center gap-12 sm:gap-20 text-xs sm:text-sm">
              <div className="flex items-center gap-3">
                <span className="text-slate-600">학생회장:</span>
                <span className="font-bold text-slate-900 border-b border-slate-400 pb-1 px-4 min-w-[120px] inline-block">
                  {minute.chairperson || '학생회장'} (인)
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-slate-600">서기/기록자:</span>
                <span className="font-bold text-slate-900 border-b border-slate-400 pb-1 px-4 min-w-[120px] inline-block">
                  {minute.recorder || '총무부장'} (인)
                </span>
              </div>
            </div>

            <div className="mt-8 text-[11px] text-slate-400">
              한국방송통신대학교 광주전남지역대학 컴퓨터과학과 학생회 의결문서 보관용
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
