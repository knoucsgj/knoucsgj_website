import type { AcademicMaterial } from '../lib/types';

// 방송통신대학교 컴퓨터과학과 정규 교육과정 과목 목록
export const KNOU_CS_COURSES = {
  1: {
    1: ['컴퓨터개론', '인터넷서비스', 'C프로그래밍'],
    2: ['파이썬프로그래밍', '컴퓨터의이해', '멀티미디어시스템']
  },
  2: {
    1: ['자료구조', '컴퓨터구조', '이산수학', '객체지향프로그래밍'],
    2: ['알고리즘', '선형대수', '자바프로그래밍', '유닉스시스템']
  },
  3: {
    1: ['데이터베이스시스템', '운영체제', '소프트웨어공학', '인공지능'],
    2: ['컴퓨터네트워크', '시뮬레이션', '모바일앱프로그래밍', '웹프로그래밍']
  },
  4: {
    1: ['정보보안', '클라우드컴퓨팅', '빅데이터이해와활용', '컴퓨터그래픽스'],
    2: ['기계학습', '사물인터넷이해와응용', '블록체인의이해', '소프트웨어프로젝트']
  }
};

export const initialMaterials: AcademicMaterial[] = [
  // 1학년
  {
    id: 'mat-1',
    grade: 1,
    semester: 1,
    course_name: 'C프로그래밍',
    title: 'C프로그래밍 포인터 및 다차원 배열 핵심 실습 요약본',
    description: '출석수업 및 중간과제 대비 필수 개념인 포인터 연산, 동적 메모리 할당(malloc/free) 예제 코드 정리집입니다.',
    category: '출석수업요약',
    author: '학술부장',
    created_at: '2026-10-05',
    downloads: 142,
    file_name: 'C프로그래밍_포인터_실습가이드.pdf',
    file_size: '2.1MB'
  },
  {
    id: 'mat-2',
    grade: 1,
    semester: 2,
    course_name: '파이썬프로그래밍',
    title: '파이썬프로그래밍 5개년 기출문제 풀이 및 해설집',
    description: '2021~2025학년도 기말평가 파이썬 교과목 기출문제 분석 및 문법 빈출 유형 오답노트입니다.',
    category: '기출문제/해설',
    author: '3학년 선배',
    created_at: '2026-09-20',
    downloads: 215,
    file_name: '파이썬_기출문제_해설집_2021-2025.pdf',
    file_size: '3.8MB'
  },
  // 2학년
  {
    id: 'mat-3',
    grade: 2,
    semester: 1,
    course_name: '자료구조',
    title: '자료구조 트리/그래프/정렬 알고리즘 C언어 구현 모음',
    description: '이진 탐색 트리(BST), 힙 정렬, 다익스트라 최단경로 알고리즘 전체 소스코드 및 단계별 시각화 다이어그램입니다.',
    category: '과제물참고자료',
    author: '알고리즘스터디장',
    created_at: '2026-10-08',
    downloads: 178,
    file_name: '자료구조_트리_그래프_구현코드.zip',
    file_size: '4.5MB'
  },
  {
    id: 'mat-4',
    grade: 2,
    semester: 1,
    course_name: '컴퓨터구조',
    title: '컴퓨터구조 파이프라인 & 캐시 메모리 매핑 핵심 노트',
    description: '기말시험 객관식 다빈출 파트인 명령어 파이프라이닝 해저드와 캐시 적중/실패 계산법 요약입니다.',
    category: '강의노트',
    author: '2학년 과대표',
    created_at: '2026-10-12',
    downloads: 98,
    file_name: '컴퓨터구조_파이프라인_캐시_정리.pdf',
    file_size: '1.4MB'
  },
  {
    id: 'mat-5',
    grade: 2,
    semester: 2,
    course_name: '알고리즘',
    title: '알고리즘 동적계획법(DP) 및 분할정복 기출 유형 정복',
    description: '배낭 문제, 피보나치, 최장공통부분수열(LCS) DP 점화식 도출법과 기출 응용문제 해설입니다.',
    category: '기출문제/해설',
    author: '학술부',
    created_at: '2026-09-18',
    downloads: 130,
    file_name: '알고리즘_DP_기출유형정리.pdf',
    file_size: '1.8MB'
  },
  // 3학년
  {
    id: 'mat-6',
    grade: 3,
    semester: 1,
    course_name: '데이터베이스시스템',
    title: '데이터베이스시스템 정규화(1NF~BCNF) 및 SQL DDL/DML 실습',
    description: '함수 종속성과 정규화 단계별 테이블 분해 예제, 관계대수 기출문제 총정리 자료입니다.',
    category: '출석수업요약',
    author: '학생회장',
    created_at: '2026-10-14',
    downloads: 165,
    file_name: 'DB정규화_SQL실습가이드.pdf',
    file_size: '2.4MB'
  },
  {
    id: 'mat-7',
    grade: 3,
    semester: 1,
    course_name: '운영체제',
    title: '운영체제 프로세스 스케줄링 & 가상메모리 페이지 교체 요약',
    description: 'FCFS, SJF, RR 타임퀀텀 계산 및 FIFO, LRU 페이지 폴트 계산 공식 한눈에 보기 정리본입니다.',
    category: '강의노트',
    author: '학술부',
    created_at: '2026-10-11',
    downloads: 112,
    file_name: '운영체제_핵심_요약정리.pdf',
    file_size: '1.6MB'
  },
  // 4학년
  {
    id: 'mat-8',
    grade: 4,
    semester: 1,
    course_name: '정보보안',
    title: '정보보안 암호학(대칭키/공개키/RSA) 및 네트워크 보안 요약',
    description: 'AES, RSA 전자서명 알고리즘 동작 원리와 정보처리기사/보안기사 연계 출제 핵심 서머리입니다.',
    category: '강의노트',
    author: '정보처리스터디',
    created_at: '2026-09-29',
    downloads: 87,
    file_name: '정보보안_암호학_네트워크_요약.pdf',
    file_size: '1.9MB'
  },
  // 기타자료
  {
    id: 'mat-9',
    grade: 1,
    semester: 1,
    course_name: '컴퓨터개론',
    title: 'VS Code 개발환경 셋팅 및 Git/GitHub 기초 사용 매뉴얼',
    description: '비전공 신입생을 위한 C/Python 개발환경(VS Code, MinGW, Anaconda) 설치 및 GitHub 연동 가이드입니다.',
    category: '기타자료',
    author: '학생회 기술부',
    created_at: '2026-09-10',
    downloads: 240,
    file_name: '신입생_개발환경_Git_매뉴얼.pdf',
    file_size: '5.2MB'
  },
  {
    id: 'mat-10',
    grade: 3,
    semester: 2,
    course_name: '컴퓨터네트워크',
    title: 'Wireshark 패킷 분석 실습 가이드 및 TCP/IP 계층 흐름도',
    description: '출석수업 패킷 캡처 실습용 Wireshark 필터링 명령어 및 TCP 3-way 핸드셰이크 패킷 분석 문서입니다.',
    category: '기타자료',
    author: '학술부',
    created_at: '2026-10-02',
    downloads: 95,
    file_name: 'Wireshark_패킷분석_실습가이드.pdf',
    file_size: '3.1MB'
  }
];
