# 한국방송통신대학교 광주전남지역대학 컴퓨터과학과 학생회 홈페이지

한국방송통신대학교(KNOU) 광주전남지역대학 컴퓨터과학과 학생회 공식 웹사이트입니다.  
직장과 학업을 병행하는 학우들을 위해 **공지사항**, **학사일정 캘린더 & D-Day 알림**, **학과 및 학생회 소개**, **학생회칙 & 세칙**, **투명 결산·회의록·감사보고**, **학술·스터디 자료실**, **커뮤니티 소통 공간**을 제공합니다.

---

## 🌟 핵심 특징

- **서버리스 클라우드 인프라**:
  - **호스팅 & API**: Cloudflare Workers & Pages (글로벌 CDN, 초고속 엣지 라우팅)
  - **데이터베이스**: Cloudflare D1 (서버리스 분산 SQLite 관계형 DB)
  - **파일 저장소**: Cloudflare R2 (학습 자료, 결산 영수증, 회의록 문서 스토리지)
- **엄격한 데이터 신뢰성 (No-Mock Policy)**:
  - 임의의 Mock(가짜) 데이터를 배제하고, 데이터베이스(D1) 및 스토리지(R2)만을 단일 진실 공급원(SSOT)으로 작동
- **모바일 퍼스트 & 반응형 디자인**:
  - 스마트폰부터 PC/태블릿까지 최적화된 반응형 레이아웃 및 모바일 드로어 메뉴 지원
  - 방송대 공식 상징물 표준관리지침(BS 16 엠블럼 C) 준수
- **실시간 학사일정 & D-Day 알림**:
  - 월간 달력 그리드 뷰 및 타임라인 목록 뷰 지원
  - 과제물 제출, 출석수업, 기말평가 D-Day 자동 계산
- **전공 학술 & 스터디 자료실**:
  - 1~4학년 전공 교과목별 강의/실습 과제 파일 업로드 & 다운로드
  - IT 실무 및 자격증 자료실 (Python, C/C++, Java 등 소스코드 업로드 지원)
- **투명한 학생회 운영**:
  - 학생회비 결산보고 (영수증 첨부 의무화)
  - 운영위원회 회의록 및 감사보고서 등록/열람
  - 학생회칙 및 선거시행세칙 통합 관리
- **보안 강화 및 웹 표준 준수**:
  - OWASP ZAP 및 Security Headers 점검 기준 통과 (CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy 적용)
  - 파일 업로드 보안 격리 헤더 적용

---

## 🛠️ 기술 스택

- **프론트엔드**: React 19, TypeScript, Vite
- **스타일링**: Tailwind CSS v4, Lucide React (아이콘)
- **라우팅**: React Router v7 (SPA 라우팅 지원)
- **백엔드/API**: Cloudflare Workers (TypeScript REST API)
- **데이터베이스**: Cloudflare D1 (SQLite)
- **파일 스토리지**: Cloudflare R2
- **배포 & 인프라 설정**: `wrangler.jsonc`

---

## 🚀 빠른 시작 (로컬 개발)

### 1. 패키지 설치
```bash
npm install
```

### 2. 로컬 개발 서버 실행
```bash
npm run dev
```
브라우저에서 `http://localhost:5173`으로 접속합니다. (로컬 Wrangler D1 및 Vite 연동)

### 3. 프로덕션 빌드 및 타입 검증
```bash
npm run build
```

---

## 🗄️ 데이터베이스 스키마 및 마이그레이션

프로젝트 루트의 [`cloudflare_d1_schema.sql`](./cloudflare_d1_schema.sql)에 모든 테이블 스키마가 정의되어 있습니다:

- `members` / `sessions`: 회원 및 세션 인증 테이블
- `notices`: 공지사항 테이블
- `academic_events`: 학사일정 테이블
- `council_members`: 학생회 임원진 테이블
- `council_intros`: 학생회 소개 및 회장 인사말
- `study_materials`: 학술 및 IT 실무 자료실 테이블
- `free_posts` / `free_comments`: 자유게시판 테이블
- `suggestions` / `suggestion_comments`: 학우 소통 및 건의함 테이블
- `finance_reports`: 투명 재정 결산보고 테이블
- `meeting_minutes`: 학생회 회의록 테이블
- `audit_reports`: 감사보고서 테이블
- `constitution_versions`: 학생회칙 및 세칙 연혁 테이블
- `popups`: 메인 팝업 공지 관리 테이블

### D1 데이터베이스 적용 명령어 (Wrangler CLI)
```bash
# 로컬 개발 환경 D1 적용
npx wrangler d1 execute knoucs-db --local --file=./cloudflare_d1_schema.sql

# 원격 프로덕션 D1 적용
npx wrangler d1 execute knoucs-db --remote --file=./cloudflare_d1_schema.sql
```

---

## 📁 디렉터리 구조

```
├── public/
│   ├── UI/                     # 방송대 공식 엠블럼 및 정적 이미지 에셋
│   └── favicon.svg
├── src/
│   ├── components/             # 관리자 화면, 회칙 뷰어, 모달 등 UI 컴포넌트
│   ├── data/                   # 공식 학생회칙 텍스트 원문 및 상수 데이터
│   ├── lib/                    # 공통 타입(types.ts) 및 유틸리티
│   ├── pages/                  # 홈, 공지사항, 학사일정, 자료실, 커뮤니티, 관리자 등
│   ├── services/               # 백엔드 API 통신 레이어 (api.ts)
│   ├── App.tsx                 # 라우트 설정
│   └── main.tsx
├── worker/
│   └── index.ts                # Cloudflare Workers 백엔드 REST API & 보안 헤더
├── cloudflare_d1_schema.sql    # Cloudflare D1 데이터베이스 테이블 생성 스크립트
├── wrangler.jsonc              # Cloudflare Workers, D1, R2 바인딩 설정
├── GEMINI.md                   # 프로젝트 개발 및 운영 핵심 원칙 (No-Mock 원칙 등)
├── PROJECT_TRANSFER_GUIDE.md   # 프로젝트 인수인계 가이드
└── package.json
```
