import type { MeetingMinute, CouncilRuleChapter } from '../lib/types';
import { officialCouncilRules } from './officialConstitution';

export const initialMeetingMinutes: MeetingMinute[] = [
  {
    id: 'min-1',
    title: '학생회 제5차 정기 임원회의 회의록',
    meeting_type: '정기임원회의',
    meeting_date: '2026-10-06',
    attendees: '회장 김민수, 부회장 이지은, 총무 박진우, 학술 정현우, 기획 최윤아, 홍보 강태석 (총 6명 참석)',
    agenda: '1. 2학기 가을 IT 특강 연사 섭외 및 예산안 심의\n2. 중간과제물 멘토링 프로그램 운영 건\n3. 학생회비 3분기 결산 보고 공개 건',
    content: `1. 가을 IT 특강(11월 7일 예정)은 동문 시니어 개발자를 초청하여 대강당에서 진행하기로 만장일치 의결함. 참가비는 전액 학생회비로 무료 지원함.
2. 중간과제물 제출을 앞두고 신·편입생의 어려움이 예상되므로 학술부 주관으로 온라인 Q&A 오픈 멘토링 데이를 10월 18일에 개설하기로 함.
3. 총무부장이 작성한 3분기 학생회비 결산서를 감사 검토 후 홈페이지 '투명 재정' 게시판에 투명하게 게재하기로 의결함.`,
    decisions: '특강 예산 40만원 배정 승인, 멘토링 방 개설 확정, 3분기 회계 공시 의결'
  },
  {
    id: 'min-2',
    title: '2026학년도 2학기 개강총회 회의록 및 의결문',
    meeting_type: '개강총회',
    meeting_date: '2026-09-05',
    attendees: '컴퓨터과학과 재학생 및 임원 48명 참석 (오프라인/온라인 화상 병행)',
    agenda: '1. 학생회 2학기 주요 사업계획 인준\n2. 2학기 학생회비 예산 편성안 심의 및 의결\n3. 학과 스터디 및 학습동아리 지원 방안',
    content: `2학기 개강을 맞아 학우 48명이 모여 2학기 주요 일정 및 예산안을 심의하였습니다.
출석수업 기간 실습실 간식 지원 및 시험기간 응원 사업, 연말 종강총회 계획이 원안 가결되었습니다.`,
    decisions: '2학기 사업계획 및 예산안 찬성 46표, 기권 2표로 원안 가결'
  }
];

export const councilRules: CouncilRuleChapter[] = officialCouncilRules;
