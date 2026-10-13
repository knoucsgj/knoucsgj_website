import type { BudgetReport } from '../lib/types';

export const initialBudgetReports: BudgetReport[] = [
  {
    id: 'budget-2026-q3',
    title: '2026학년도 2학기 3분기 학생회비 결산 및 집행 내역 보고',
    period: '2026.07.01 ~ 2026.09.30',
    income_total: 1850000,
    expense_total: 1120000,
    balance: 730000,
    status: '감사완료',
    published_date: '2026-10-02',
    items: [
      { id: 'b1', date: '2026-07-05', type: '수입', category: '이월금', description: '전분기(2분기) 잔액 이월', amount: 850000 },
      { id: 'b2', date: '2026-08-28', type: '수입', category: '학생회비', description: '2026-2학기 신·편입생 및 재학생 학생회비 납부금', amount: 1000000 },
      { id: 'b3', date: '2026-09-05', type: '지출', category: '행사비', description: '2학기 개강총회 다과 및 음료 구입', amount: 320000, note: '영수증 증빙 완료' },
      { id: 'b4', date: '2026-09-12', type: '지출', category: '복지사업', description: '전산실습실 302호 환경정비 및 소모품(마우스패드, 물티슈 등) 구입', amount: 180000, note: '품의서 첨부' },
      { id: 'b5', date: '2026-09-20', type: '지출', category: '학술비', description: '과제물 대비 IT 전공 서적 및 열람용 참고도서 구매 (4권)', amount: 220000, note: '학생회실 비치' },
      { id: 'b6', date: '2026-09-28', type: '지출', category: '운영비', description: '학생회 홈페이지 호스팅 도메인 및 운영 소모품비', amount: 400000, note: 'Cloudflare 연계' }
    ]
  },
  {
    id: 'budget-2026-q2',
    title: '2026학년도 1학기 종강 결산 및 2분기 회계 집행 보고',
    period: '2026.04.01 ~ 2026.06.30',
    income_total: 2450000,
    expense_total: 1600000,
    balance: 850000,
    status: '감사완료',
    published_date: '2026-07-02',
    items: [
      { id: 'b7', date: '2026-04-01', type: '수입', category: '이월금', description: '1분기 잔액 이월', amount: 1250000 },
      { id: 'b8', date: '2026-04-15', type: '수입', category: '학생회비', description: '추가 수납 학생회비', amount: 1200000 },
      { id: 'b9', date: '2026-05-18', type: '지출', category: '행사비', description: '1학기 기말평가 시험응원 간식(샌드위치/음료 100인분) 배부', amount: 650000, note: '현장 배부 명부 확인' },
      { id: 'b10', date: '2026-06-20', type: '지출', category: '행사비', description: '1학기 종강총회 대관 및 행사 진행비', amount: 750000 },
      { id: 'b11', date: '2026-06-25', type: '지출', category: '운영비', description: '학생회 공용 복사용지 및 프린터 토너 교체', amount: 200000 }
    ]
  }
];
