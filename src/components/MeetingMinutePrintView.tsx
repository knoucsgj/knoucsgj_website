import React from 'react';
import type { MeetingMinute } from '../lib/types';
import { formatDate } from '../lib/dateUtils';
import { Printer, X, FileText, Image as ImageIcon } from 'lucide-react';

interface Props {
  minute: MeetingMinute;
  onClose: () => void;
}

export const MeetingMinutePrintView: React.FC<Props> = ({ minute, onClose }) => {
  // 웹 브라우저의 화면 찌꺼기(Navbar, 배경, 모달 틀 등)를 원천 배제하고
  // 오직 순수한 A4 공문서 규격 서식만 인쇄/PDF 저장되도록 전용 인쇄 프레임을 생성하여 실행합니다.
  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=900,height=1100');
    if (!printWindow) {
      // 팝업이 차단된 경우 기본 인쇄 시도
      window.print();
      return;
    }

    const htmlContent = `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>${minute.title} - 회의록</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 18mm 15mm 20mm 15mm;
    }
    *, *:before, *:after {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      margin: 0;
      padding: 0;
      background: #ffffff;
      color: #0f172a;
      font-family: 'Malgun Gothic', '맑은 고딕', 'Batang', '바탕', serif;
      line-height: 1.6;
      font-size: 11pt;
    }
    .print-container {
      width: 100%;
      max-width: 180mm;
      margin: 0 auto;
    }
    /* 문서 상단 공식 헤더 */
    .doc-header {
      text-align: center;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 12px;
      margin-bottom: 16px;
    }
    .univ-name {
      font-size: 11pt;
      font-weight: 600;
      color: #475569;
      letter-spacing: 2px;
      margin-bottom: 4px;
    }
    .doc-title {
      font-size: 24pt;
      font-weight: 800;
      letter-spacing: 8px;
      color: #020617;
      margin: 8px 0;
    }
    .doc-meta {
      display: flex;
      justify-content: space-between;
      font-size: 9pt;
      color: #64748b;
      margin-top: 10px;
    }
    /* 개요 표 */
    table.summary-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
      font-size: 10pt;
    }
    table.summary-table th, table.summary-table td {
      border: 1px solid #334155;
      padding: 7px 10px;
      text-align: left;
    }
    table.summary-table th {
      background-color: #f1f5f9 !important;
      font-weight: 700;
      color: #1e293b;
      width: 22%;
    }
    table.summary-table td.title-cell {
      font-weight: 700;
      font-size: 11pt;
      color: #020617;
    }
    /* 섹션 공통 */
    .section-title {
      font-size: 12pt;
      font-weight: 700;
      color: #0f172a;
      border-bottom: 1.5px solid #cbd5e1;
      padding-bottom: 4px;
      margin-top: 18px;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
    }
    .section-content {
      border: 1px solid #cbd5e1;
      border-radius: 4px;
      padding: 10px 12px;
      font-size: 10pt;
      white-space: pre-wrap;
      word-break: break-all;
      background: #fafafa;
      line-height: 1.65;
    }
    .section-content.decisions {
      background-color: #f8fafc !important;
      border: 1.5px solid #0284c7;
      font-weight: 600;
      color: #0369a1;
    }
    /* 별첨/사진 */
    .attachment-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-top: 8px;
    }
    .attachment-card {
      border: 1px solid #e2e8f0;
      padding: 8px;
      border-radius: 4px;
      font-size: 9pt;
      background: #fff;
    }
    .attachment-img {
      max-height: 150px;
      max-width: 100%;
      display: block;
      margin: 6px auto 0;
      border: 1px solid #cbd5e1;
    }
    /* 하단 서명란 */
    .sign-section {
      margin-top: 35px;
      padding-top: 20px;
      border-top: 2px solid #0f172a;
      text-align: center;
      page-break-inside: avoid;
    }
    .sign-statement {
      font-size: 11pt;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 15px;
    }
    .sign-date {
      font-size: 10.5pt;
      color: #475569;
      margin-bottom: 25px;
    }
    .sign-box-container {
      display: flex;
      justify-content: center;
      gap: 60px;
      font-size: 11pt;
    }
    .sign-box {
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }
    .sign-line {
      border-bottom: 1px solid #0f172a;
      min-width: 120px;
      padding-bottom: 2px;
      display: inline-block;
      font-weight: 700;
    }
    .footer-mark {
      margin-top: 25px;
      font-size: 8pt;
      color: #94a3b8;
      text-align: center;
    }
    @media print {
      body {
        margin: 0;
      }
    }
  </style>
</head>
<body>
  <div class="print-container">
    <div class="doc-header">
      <div class="univ-name">한국방송통신대학교 광주전남지역대학 컴퓨터과학과 학생회</div>
      <h1 class="doc-title">회 의 록</h1>
      <div class="doc-meta">
        <span>문서분류: 학생회 정규의결문서</span>
        <span>회의구분: [ ${minute.meeting_type} ]</span>
        <span>작성일자: ${formatDate(minute.meeting_date)}</span>
      </div>
    </div>

    <table class="summary-table">
      <tbody>
        <tr>
          <th>회 의 명</th>
          <td colspan="3" class="title-cell">${minute.title}</td>
        </tr>
        <tr>
          <th>일 시</th>
          <td>${minute.meeting_date}</td>
          <th>장 소</th>
          <td>${minute.location || '광주전남지역대학 학생회실'}</td>
        </tr>
        <tr>
          <th>의장 (주재자)</th>
          <td>${minute.chairperson || '학생회장'}</td>
          <th>서기 (기록자)</th>
          <td>${minute.recorder || '총무부장'}</td>
        </tr>
        <tr>
          <th>참석자 명단</th>
          <td colspan="3">${minute.attendees || '임원진 전원'}</td>
        </tr>
      </tbody>
    </table>

    <div class="section-title">1. 상정 안건 (Agenda)</div>
    <div class="section-content">${minute.agenda || '상정 안건 없음'}</div>

    <div class="section-title">2. 회의 경과 및 주요 논의 내용</div>
    <div class="section-content">${minute.content || '기록된 논의 내용이 없습니다.'}</div>

    <div class="section-title">3. 최종 의결 및 결정 사항 (Resolutions)</div>
    <div class="section-content decisions">${minute.decisions || '의결 사항 없음'}</div>

    ${minute.attachments && minute.attachments.length > 0 ? `
    <div class="section-title" style="page-break-before: auto;">4. 별첨 자료 및 현장 사진 증빙</div>
    <div class="attachment-grid">
      ${minute.attachments.map(att => `
        <div class="attachment-card">
          <strong>${att.name}</strong> (${att.size || ''})
          ${att.type === 'image' || (att.url && att.url.startsWith('data:image')) ? `
            <img src="${att.url}" alt="${att.name}" class="attachment-img" />
          ` : ''}
        </div>
      `).join('')}
    </div>
    ` : ''}

    ${minute.edit_history && minute.edit_history.length > 0 ? `
    <div style="margin-top: 15px; padding: 8px 12px; background: #fffbeb; border: 1px solid #fef3c7; border-radius: 4px; font-size: 8.5pt; color: #92400e;">
      <strong>※ 회의록 정정(수정) 이력: </strong>
      ${minute.edit_history.map(h => `[${formatDate(h.edited_at)}] ${h.edited_by} (${h.reason})`).join(', ')}
    </div>
    ` : ''}

    <div class="sign-section">
      <div class="sign-statement">위와 같이 회의가 적법하게 개최되고 의결되었음을 확인하고 서명 날인합니다.</div>
      <div class="sign-date">${formatDate(minute.meeting_date)}</div>
      <div class="sign-box-container">
        <div class="sign-box">
          <span>학생회장:</span>
          <span class="sign-line">${minute.chairperson || '학생회장'} (인)</span>
        </div>
        <div class="sign-box">
          <span>서기/기록자:</span>
          <span class="sign-line">${minute.recorder || '총무부장'} (인)</span>
        </div>
      </div>
      <div class="footer-mark">한국방송통신대학교 광주전남지역대학 컴퓨터과학과 학생회 의결문서 보관용</div>
    </div>
  </div>

</body>
</html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    setTimeout(() => {
      try {
        printWindow.focus();
        printWindow.print();
      } catch (e) {
        console.error(e);
      }
    }, 400);
  };

  return (
    <>
      {/* 전역 인쇄 스타일: 브라우저 UI(헤더, 네비게이션, 모달 테두리 등)를 완전히 숨기고 오직 A4 서식만 출력 */}
      <style>{`
        @media print {
          html, body {
            background: #ffffff !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          /* 화면의 모든 일반 UI 요소 숨김 */
          body * {
            visibility: hidden !important;
          }
          /* 오직 회의록 공문서 문서 영역 및 자식들만 표시 */
          #minute-official-document,
          #minute-official-document * {
            visibility: visible !important;
          }
          #minute-official-document {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 10mm 15mm !important;
            border: none !important;
            box-shadow: none !important;
            background: #ffffff !important;
          }
          .print-hide {
            display: none !important;
          }
          @page {
            size: A4 portrait;
            margin: 15mm 12mm 15mm 12mm;
          }
        }
      `}</style>
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-start justify-center p-3 sm:p-6 md:p-10">
      
      {/* Outer Shell */}
      <div className="relative w-full max-w-4xl bg-slate-100 rounded-3xl shadow-2xl overflow-hidden my-4 border border-slate-300">
        
        {/* Top Control Toolbar */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 sticky top-0 z-20 shadow-md print-hide">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-xs">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base">공식 회의록 공문서 양식 인쇄</h3>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 font-semibold">
                  A4 공문서 규격
                </span>
              </div>
              <p className="text-xs text-slate-400">
                [인쇄 / PDF 저장]을 클릭하시면 브라우저 찌꺼기 없이 <strong>순수 공문서 서식</strong>으로만 출력됩니다.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold transition-all shadow-md active:scale-95 cursor-pointer"
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

        {/* Paper Container: 마치 실제 A4 용지를 책상 위에 올려놓고 검토하는 듯한 서식 프리뷰 */}
        <div className="p-4 sm:p-8 md:p-12 flex justify-center bg-slate-200/60 overflow-x-auto">
          <div id="minute-official-document" className="w-full max-w-[210mm] min-h-[297mm] bg-white text-slate-900 p-8 sm:p-14 md:p-16 shadow-xl border border-slate-300/80 rounded-sm font-serif leading-relaxed text-xs sm:text-sm">
            
            {/* Document Header */}
            <div className="text-center pb-5 border-b-2 border-slate-950 mb-6">
              <p className="text-xs sm:text-sm tracking-widest text-slate-600 font-sans font-semibold mb-1">
                한국방송통신대학교 광주전남지역대학 컴퓨터과학과 학생회
              </p>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-widest text-slate-950 my-3 font-sans">
                회 의 록
              </h1>
              <div className="flex justify-between items-center text-xs font-sans text-slate-500 mt-4 px-1">
                <span>문서분류: 학생회 정규의결문서</span>
                <span>회의구분: <strong className="text-slate-900">[{minute.meeting_type}]</strong></span>
                <span>작성일자: {formatDate(minute.meeting_date)}</span>
              </div>
            </div>

            {/* Meeting Summary Table */}
            <div className="my-6">
              <table className="w-full border-collapse border border-slate-700 text-xs sm:text-sm font-sans">
                <tbody>
                  <tr>
                    <th className="border border-slate-500 bg-slate-100 p-2.5 text-left w-24 sm:w-28 font-bold text-slate-900">
                      회 의 명
                    </th>
                    <td colSpan={3} className="border border-slate-500 p-2.5 font-bold text-slate-950 text-sm">
                      {minute.title}
                    </td>
                  </tr>
                  <tr>
                    <th className="border border-slate-500 bg-slate-100 p-2.5 text-left font-bold text-slate-900">
                      일 시
                    </th>
                    <td className="border border-slate-500 p-2.5">
                      {minute.meeting_date}
                    </td>
                    <th className="border border-slate-500 bg-slate-100 p-2.5 text-left w-24 sm:w-28 font-bold text-slate-900">
                      장 소
                    </th>
                    <td className="border border-slate-500 p-2.5">
                      {minute.location || '광주전남지역대학 학생회실'}
                    </td>
                  </tr>
                  <tr>
                    <th className="border border-slate-500 bg-slate-100 p-2.5 text-left font-bold text-slate-900">
                      의장 (주재자)
                    </th>
                    <td className="border border-slate-500 p-2.5 font-semibold text-slate-800">
                      {minute.chairperson || '학생회장'}
                    </td>
                    <th className="border border-slate-500 bg-slate-100 p-2.5 text-left font-bold text-slate-900">
                      서기 (기록자)
                    </th>
                    <td className="border border-slate-500 p-2.5 font-semibold text-slate-800">
                      {minute.recorder || '총무부장'}
                    </td>
                  </tr>
                  <tr>
                    <th className="border border-slate-500 bg-slate-100 p-2.5 text-left font-bold text-slate-900 align-top">
                      참석자 명단
                    </th>
                    <td colSpan={3} className="border border-slate-500 p-2.5 text-slate-800 leading-relaxed whitespace-pre-wrap">
                      {minute.attendees || '임원진 전원'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Section 1: Agenda */}
            <div className="my-6">
              <h2 className="text-sm sm:text-base font-bold text-slate-950 border-b border-slate-300 pb-1 mb-2.5 flex items-center gap-2 font-sans">
                <span className="w-2 h-2 rounded-full bg-slate-900"></span>
                1. 상정 안건 (Agenda)
              </h2>
              <div className="bg-slate-50 p-3.5 sm:p-4 rounded border border-slate-300 text-xs sm:text-sm font-sans whitespace-pre-wrap text-slate-800 leading-relaxed">
                {minute.agenda || '상정 안건 없음'}
              </div>
            </div>

            {/* Section 2: Proceedings */}
            <div className="my-6">
              <h2 className="text-sm sm:text-base font-bold text-slate-950 border-b border-slate-300 pb-1 mb-2.5 flex items-center gap-2 font-sans">
                <span className="w-2 h-2 rounded-full bg-slate-900"></span>
                2. 회의 경과 및 주요 논의 내용
              </h2>
              <div className="p-3.5 sm:p-4 border border-slate-300 rounded text-xs sm:text-sm font-sans whitespace-pre-wrap text-slate-800 leading-relaxed min-h-[140px] bg-white">
                {minute.content || '기록된 논의 내용이 없습니다.'}
              </div>
            </div>

            {/* Section 3: Decisions */}
            <div className="my-6">
              <h2 className="text-sm sm:text-base font-bold text-blue-900 border-b border-blue-300 pb-1 mb-2.5 flex items-center gap-2 font-sans">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                3. 최종 의결 및 결정 사항 (Resolutions)
              </h2>
              <div className="p-4 bg-blue-50/70 border-2 border-blue-400 rounded text-xs sm:text-sm font-sans font-bold text-blue-950 whitespace-pre-wrap leading-relaxed">
                {minute.decisions || '의결 사항 없음'}
              </div>
            </div>

            {/* Section 4: Attachments */}
            {minute.attachments && minute.attachments.length > 0 && (
              <div className="my-6">
                <h2 className="text-sm sm:text-base font-bold text-slate-950 border-b border-slate-300 pb-1 mb-2.5 flex items-center gap-2 font-sans">
                  <span className="w-2 h-2 rounded-full bg-slate-900"></span>
                  4. 별첨 자료 및 현장 사진 증빙
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-sans">
                  {minute.attachments.map((att, idx) => (
                    <div key={idx} className="border border-slate-300 rounded p-3 bg-slate-50 text-xs">
                      <div className="font-bold text-slate-800 truncate mb-1 flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span className="truncate">{att.name}</span>
                      </div>
                      {att.url && (att.type === 'image' || att.url.startsWith('data:image')) && (
                        <img src={att.url} alt={att.name} className="mt-2 max-h-40 object-contain rounded border border-slate-300 bg-white mx-auto" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Revision History Notice */}
            {minute.edit_history && minute.edit_history.length > 0 && (
              <div className="my-5 p-3 bg-amber-50 border border-amber-300 rounded text-xs font-sans text-amber-900">
                <strong>※ 문서 정정/수정 이력: </strong>
                {minute.edit_history.map((h, i) => (
                  <span key={i} className="inline-block mr-3">
                    [{formatDate(h.edited_at)}] {h.edited_by} ({h.reason})
                  </span>
                ))}
              </div>
            )}

            {/* Official Signatures & Seal */}
            <div className="mt-12 pt-8 border-t-2 border-slate-950 text-center font-sans">
              <p className="text-sm sm:text-base font-bold text-slate-900 mb-6">
                위와 같이 회의가 적법하게 개최되고 의결되었음을 확인하고 서명 날인합니다.
              </p>

              <p className="text-xs sm:text-sm text-slate-600 mb-8">
                {formatDate(minute.meeting_date)}
              </p>

              <div className="flex justify-center items-center gap-12 sm:gap-20 text-xs sm:text-sm">
                <div className="flex items-center gap-3">
                  <span className="text-slate-600 font-medium">학생회장:</span>
                  <span className="font-bold text-slate-950 border-b border-slate-700 pb-1 px-4 min-w-[130px] inline-block">
                    {minute.chairperson || '학생회장'} (인)
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-slate-600 font-medium">서기/기록자:</span>
                  <span className="font-bold text-slate-950 border-b border-slate-700 pb-1 px-4 min-w-[130px] inline-block">
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
    </div>
    </>
  );
};
