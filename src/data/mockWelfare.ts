import type { RentalItem, PartnershipItem } from '../lib/types';

export const initialRentalItems: RentalItem[] = [
  {
    id: 'rent-1',
    name: 'C프로그래밍 / 파이썬 교재 및 실습 참고서',
    category: '전산실습 교재',
    total_qty: 6,
    available_qty: 4,
    location: '본관 4층 405호 학생회실',
    status: '대여가능',
    desc: '출석수업 및 과제 작성 기간 7일간 대여 가능 (연장 1회)'
  },
  {
    id: 'rent-2',
    name: '자료구조 / 알고리즘 기출 풀이 해설집',
    category: '전산실습 교재',
    total_qty: 4,
    available_qty: 3,
    location: '본관 4층 405호 학생회실',
    status: '대여가능',
    desc: '선배 학우들이 기증한 기출 풀이 노트 및 핵심 요약본'
  },
  {
    id: 'rent-3',
    name: '공학용 계산기 (기말시험/기사시험 대비)',
    category: 'IT 기기/소모품',
    total_qty: 5,
    available_qty: 5,
    location: '본관 4층 405호 학생회실',
    status: '대여가능',
    desc: '이산수학, 컴퓨터구조 등 계산기 지참 가능 시험 대비'
  },
  {
    id: 'rent-4',
    name: '무선 프리젠터 (발표용 레이저 포인터)',
    category: 'IT 기기/소모품',
    total_qty: 3,
    available_qty: 2,
    location: '본관 4층 405호 학생회실',
    status: '대여가능',
    desc: '종강총회 발표 및 과제 프로젝트 발표용'
  },
  {
    id: 'rent-5',
    name: '학생회 상비 우산',
    category: '생활복지',
    total_qty: 15,
    available_qty: 12,
    location: '본관 4층 405호 및 302호 실습실 앞',
    status: '대여가능',
    desc: '출석수업 당일 갑작스러운 우천 시 자유 대여 후 반납'
  },
  {
    id: 'rent-6',
    name: '노트북 고속 충전기 및 C타입 멀티허브',
    category: 'IT 기기/소모품',
    total_qty: 4,
    available_qty: 3,
    location: '본관 4층 405호 학생회실',
    status: '대여가능',
    desc: '실습실에서 개인 노트북 작업 시 대여 가능'
  }
];

export const initialPartnerships: PartnershipItem[] = [
  {
    id: 'part-1',
    partner_name: '패스트캠퍼스 / 인프런 학우 전용 할인',
    category: 'IT 교육/인강',
    benefit: '컴퓨터과학과 재학생 전 강좌 15~20% 할인 쿠폰',
    period: '2026학년도 연중 상시',
    instructions: '학생회 제휴 코드 [KNOUCS2026] 입력 또는 학교 웹메일(@knou.ac.kr) 인증'
  },
  {
    id: 'part-2',
    partner_name: '한빛미디어 / 이지스퍼블리싱 IT 도서 제휴',
    category: '도서/출판',
    benefit: '정보처리기사 및 프로그래밍 입문서 단체 주문 10% 추가 할인',
    period: '매 학기 초 (3월, 9월)',
    instructions: '학생회 학술부 단체 구매 신청 게시판 통해 주문 접수'
  },
  {
    id: 'part-3',
    partner_name: '광주 첨단지구 스터디카페 (토즈/작심)',
    category: '생활/복지',
    benefit: '광주전남 방송대 학생증 제시 시 시간권/기간권 10% 할인',
    period: '2026.03.01 ~ 2026.12.31',
    instructions: '현장 데스크에서 U-KNOU 모바일 학생증 제시'
  }
];

export const initialGalleryPhotos = [
  {
    id: 'g-1',
    title: '2026-1학기 종강총회 및 학술 프로젝트 시상식',
    date: '2026-06-20',
    location: '광주전남지역대학 본관 세미나실',
    image_url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80',
    desc: '한 학기 동안 열심히 달려오신 학우님들과 함께한 종강총회 현장입니다.'
  },
  {
    id: 'g-2',
    title: '2026 봄 IT 실무 특강 (클라우드 & 백엔드 아키텍처)',
    date: '2026-05-16',
    location: '지역대학 302호 전산실습실',
    image_url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80',
    desc: '현업 카카오 개발자 동문 선배님과 함께한 실무 세미나 모습입니다.'
  },
  {
    id: 'g-3',
    title: '2026-1학기 신·편입생 오리엔테이션 및 멘토링 데이',
    date: '2026-03-08',
    location: '광주지역대학 4층 대강당',
    image_url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80',
    desc: '새롭게 방송대 컴퓨터과학과 가족이 되신 학우 여러분을 환영하는 자리였습니다.'
  }
];
