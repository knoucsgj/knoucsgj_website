import type { CouncilMember, PastCouncilMember, StudyGroup } from '../lib/types';

export const councilIntro = {
  title: '배움에는 나이와 한계가 없습니다. 함께이기에 완주할 수 있습니다!',
  president_greeting: `학우 여러분, 안녕하십니까!
한국방송통신대학교 광주전남지역대학 컴퓨터과학과 학생회입니다.

우리 방송대 컴퓨터과학과는 20대부터 60대까지, 현업 개발자부터 새로운 꿈을 품고 IT에 첫 발을 내딛는 비전공자까지 다양한 열정을 가진 학우들이 한자리에 모인 특별한 공간입니다.

직장과 가정, 그리고 학업을 병행하는 '주경야독'의 여정이 결코 쉽지 않음을 누구보다 잘 알고 있습니다. 혼자 책상 앞에 앉아 밤을 새우며 모니터와 씨름할 때 느끼는 외로움과 막막함을 덜어드리고자 학생회가 곁에 있겠습니다.

학생회는 다음 세 가지를 약속드립니다.
1. 든든한 학업 동반자 : 스터디 그룹 활성화와 과제/시험 가이드 및 선후배 멘토링을 통해 중도 포기 없이 모두가 졸업의 기쁨을 누릴 수 있도록 돕겠습니다.
2. 따뜻한 교류의 장 : 명사 초청강연, 개강총회, 컴퓨터과학인의 밤 행사 및 스터디 활동을 통해 서로 소통하고 의지할 수 있는 따뜻한 학우 교류의 장을 만들어 가겠습니다.
3. 투명하고 정직한 학생회 : 학과 학생회비 납부 제도를 새롭게 시행하며, 소중한 회비 집행 내역을 1원 단위까지 투명하게 공개하고 모든 학우의 의견에 귀 기울이겠습니다.

배움에 대한 여러분의 용기 있는 도전을 진심으로 응원하며, 늘 학우 여러분의 든든한 버팀목이 되겠습니다. 감사합니다.`,
  president_name: '학생회장단 일동',
  president_role: '광주전남지역대학 컴퓨터과학과 학생회장'
};

export const councilMembers: CouncilMember[] = [
  {
    id: 'cm-1',
    role: '학생회장',
    name: '김민수',
    grade_info: '컴퓨터과학과 3학년',
    message: '학우 여러분의 든든한 러닝메이트가 되겠습니다. 언제든 학생회 문을 두드려주세요!',
    email: 'president@knou-cs-gj.org'
  },
  {
    id: 'cm-2',
    role: '부학생회장',
    name: '이지은',
    grade_info: '컴퓨터과학과 3학년',
    message: '신·편입생 여러분이 학교 생활에 빠르게 적응하실 수 있도록 살뜰히 돕겠습니다.',
    email: 'vice@knou-cs-gj.org'
  },
  {
    id: 'cm-3',
    role: '총무부장',
    name: '박진우',
    grade_info: '컴퓨터과학과 2학년',
    message: '소중한 학생회비를 1원도 헛되이 쓰지 않고 투명하고 명확하게 관리하겠습니다.',
    email: 'finance@knou-cs-gj.org'
  },
  {
    id: 'cm-4',
    role: '학술부장',
    name: '정현우',
    grade_info: '컴퓨터과학과 4학년',
    message: '수업 과제와 시험 꿀팁, 양질의 스터디 그룹 매칭을 적극 지원하겠습니다.',
    email: 'academic@knou-cs-gj.org'
  },
  {
    id: 'cm-5',
    role: '기획부장',
    name: '최윤아',
    grade_info: '컴퓨터과학과 2학년',
    message: '모두가 즐겁고 유익한 IT 특강과 네트워킹 행사를 기획하고 있습니다.',
    email: 'plan@knou-cs-gj.org'
  },
  {
    id: 'cm-6',
    role: '홍보/웹관리',
    name: '강태석',
    grade_info: '컴퓨터과학과 3학년',
    message: '홈페이지와 SNS를 통해 주요 학사 소식을 가장 빠르고 정확하게 전달하겠습니다.',
    email: 'web@knou-cs-gj.org'
  }
];

export const regionalInfo = {
  center_name: '한국방송통신대학교 광주전남지역대학',
  address: '전남광주통합특별시 광산구 첨단내촌로 6',
  tel: '062-973-5100',
  facilities: [
    { name: '전산실습실 (3층 302호)', desc: '최신 PC 60대 보유, 출석수업 및 실습 진행, 수업 외 시간 자율 학습 개방' },
    { name: '도서관 및 전자열람실 (2층)', desc: 'IT 전문 서적 및 학술자료 비치, 개인 노트북 좌석 및 콘센트 구비' },
    { name: '스터디룸 (각 층)', desc: '학과 스터디 모임 및 소규모 세미나 전용 공간 (사전 예약제)' },
    { name: '학생회실 (103호)', desc: '컴퓨터과학과 학생회 상주 및 학우 쉼터' }
  ],
  sub_centers: [
    {
      name: '목포시학습관',
      address: '전남광주통합특별시 목포시 백년대로412번길 14',
      tel: '061-287-9110',
      fax: '061-287-9115',
      facilities: '행정실, 도서열람실, 컴퓨터실, 강의실, 학생회실 등',
      notice: '출석수업은 진행하지 않고 시험(출석대체시험, 기말시험)만 진행됩니다. 평소에는 사전 강의실 사용 신청을 통해 스터디 등을 진행할 수 있습니다.',
      hours: '화요일 ~ 토요일 13:00 ~ 21:00 (일·월요일 및 법정 공휴일 휴무)'
    },
    {
      name: '순천시학습관',
      address: '전남광주통합특별시 순천시 임촌동길 23',
      tel: '061-751-0801',
      fax: '061-751-0802',
      facilities: '행정실, 도서열람실, 컴퓨터실, 강의실, 학생회실 등',
      notice: '출석수업은 진행하지 않고 시험(출석대체시험, 기말시험)만 진행됩니다. 평소에는 사전 강의실 사용 신청을 통해 스터디 등을 진행할 수 있습니다.',
      hours: '화요일 ~ 토요일 13:00 ~ 21:00 (일·월요일 및 법정 공휴일 휴무)'
    }
  ]
};

export const mockStudies: StudyGroup[] = [
  {
    id: 'study-1',
    title: '2026-2학기 자료구조 & 알고리즘 집중 스터디',
    subject: '자료구조 / C++ / 백준 문제풀이',
    status: '모집중',
    members_count: 5,
    max_members: 8,
    target_grade: '2~3학년',
    meeting_type: '온/오프라인 병행',
    leader: '정현우 (4학년)',
    created_at: '2026-10-09'
  },
  {
    id: 'study-2',
    title: '신·편입생을 위한 파이썬 기초 프로그래밍 멘토링',
    subject: '파이썬프로그래밍 기초 및 중간과제 코칭',
    status: '모집중',
    members_count: 6,
    max_members: 10,
    target_grade: '1학년 및 편입생',
    meeting_type: '온라인 (Zoom/Discord)',
    leader: '김민수 (3학년)',
    created_at: '2026-10-07'
  },
  {
    id: 'study-3',
    title: '웹 풀스택 실무 프로젝트 스터디 (React + Supabase)',
    subject: '학과 프로젝트 및 포트폴리오 웹 제작',
    status: '진행중',
    members_count: 6,
    max_members: 6,
    target_grade: '전학년',
    meeting_type: '온/오프라인 병행',
    leader: '강태석 (3학년)',
    created_at: '2026-09-25'
  },
  {
    id: 'study-4',
    title: '2027년 1회 정보처리기사 필기 스터디반',
    subject: '소프트웨어설계, DB, 프로그래밍 언어 활용',
    status: '모집중',
    members_count: 4,
    max_members: 8,
    target_grade: '3~4학년',
    meeting_type: '온라인 (Zoom/Discord)',
    leader: '이지은 (3학년)',
    created_at: '2026-10-11'
  }
];

export const initialPastCouncilMembers: PastCouncilMember[] = [];
