# 한국방송통신대학교 광주전남지역대학 컴퓨터과학과 학생회 홈페이지

한국방송통신대학교(KNOU) 광주전남지역대학 컴퓨터과학과 학생회 공식 웹사이트입니다.  
직장과 학업을 병행하는 학우들을 위해 **공지사항**, **학사일정 캘린더 & D-Day 알림**, **학과 및 학생회 소개**, **스터디 그룹 & FAQ**를 제공합니다.

---

## 🌟 핵심 특징

- **0원(무료) 서버리스 인프라**:
  - **호스팅**: Cloudflare Pages (무제한 대역폭, 초고속 전세계/국내 CDN 무료)
  - **데이터베이스/스토리지**: Supabase (PostgreSQL, 실시간 DB, RLS 보안 정책 무료)
- **모바일 퍼스트 & 반응형 디자인**:
  - 스마트폰부터 PC/태블릿까지 최적화된 Pretendard 폰트 및 모바일 드로어 메뉴 지원
- **실시간 학사일정 & D-Day 알림**:
  - 월간 달력 그리드 뷰 및 타임라인 목록 뷰 지원
  - 중간과제물 제출 마감, 출석수업, 기말평가 D-Day 자동 계산
- **코딩 없는 관리자 센터 (`/admin`)**:
  - 개발 지식이나 Git/Vite/배포를 몰라도, 웹 화면에서 마우스 클릭과 입력만으로 공지사항, 학사일정, 임원 소개를 바로 추가/수정/삭제
  - 초기 기본 관리자 비밀번호: `knoucs2026!` (관리자 센터에서 변경 가능)
  - **원클릭 데이터 백업 & 인수인계**: 차기 학생회로 넘어갈 때 클릭 한 번으로 `.json` 백업 파일 다운로드 및 복원 지원
- **안정적인 듀얼 데이터 모드**:
  - Supabase 연동 전에도 풍부한 목업 데이터로 모든 기능 즉시 작동
  - Supabase 환경변수 연결 시 즉시 실시간 클라우드 DB 모드로 자동 전환

---

## 🛠️ 기술 스택

- **프론트엔드**: React 19, TypeScript, Vite
- **스타일링**: Tailwind CSS v4, Lucide React (아이콘)
- **라우팅**: React Router v7 (`public/_redirects` Cloudflare SPA 지원)
- **백엔드/DB**: Supabase (PostgreSQL, RLS)
- **배포 플랫폼**: Cloudflare Pages

---

## 🚀 빠른 시작 (로컬 개발)

```bash
# 1. 의존성 패키지 설치
npm install

# 2. 로컬 개발 서버 실행
npm run dev
```

브라우저에서 `http://localhost:5173` 접속

---

## ☁️ Cloudflare Pages 배포 가이드 (무료)

1. 이 저장소를 **GitHub** 개인/학생회 계정에 Push합니다.
2. [Cloudflare 대시보드](https://dash.cloudflare.com/)에 로그인 후 **Workers & Pages** > **Create application** > **Pages** 클릭
3. **Connect to Git**을 누르고 해당 레포지토리를 선택합니다.
4. 빌드 설정을 입력합니다:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
5. **Save and Deploy**를 클릭하면 1분 안에 무료 서브도메인(`*.pages.dev`)으로 즉시 배포됩니다!

---

## 🗄️ Supabase 데이터베이스 연동 가이드 (무료)

1. [Supabase](https://supabase.com/)에서 무료 계정 생성 후 새 프로젝트(예: `knou-cs-gj`)를 생성합니다.
2. 좌측 메뉴의 **SQL Editor**로 이동합니다.
3. 프로젝트 루트에 있는 `supabase_schema.sql` 파일의 전체 내용을 복사하여 붙여넣고 **Run**을 실행합니다.
   - `notices`(공지사항), `academic_events`(학사일정), `council_members`(임원진) 테이블 및 보안 정책(RLS), 초기 데이터가 자동 생성됩니다.
4. Supabase **Project Settings > API**에서 아래 두 값을 복사합니다:
   - `Project URL`
   - `Project API Keys` 중 `anon / public` 키
5. 프로젝트 루트의 `.env` 파일(또는 Cloudflare Pages의 Settings > Environment variables)에 등록합니다:

```env
VITE_SUPABASE_URL=https://[YOUR-PROJECT-ID].supabase.co
VITE_SUPABASE_ANON_KEY=[YOUR-ANON-KEY]
```

연동이 완료되면 상단 바에 `Supabase 연동됨` 표시가 나타나며 실시간 데이터베이스와 동기화됩니다.

---

## 📁 디렉터리 구조

```
├── public/
│   ├── _redirects          # Cloudflare Pages SPA 리다이렉트 규칙
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── home/           # 히어로, 바로가기, 최근공지, 주요학사일정
│   │   └── layout/         # 네비게이션바, 푸터, 레이아웃
│   ├── data/               # 공지, 학사일정, 학생회 초기 데이터
│   ├── lib/                # Supabase 클라이언트 및 날짜 유틸
│   ├── pages/              # 홈, 소개, 공지사항, 캘린더, 커뮤니티 페이지
│   ├── services/           # Supabase & 로컬 Fallback API 레이어
│   ├── App.tsx             # 라우트 설정
│   └── main.tsx
├── supabase_schema.sql     # Supabase 1클릭 DB 생성 스크립트
├── .env.example
└── vite.config.ts
```
