# 한국방송통신대학교 광주전남지역대학 컴퓨터과학과 학생회 웹사이트 프로젝트

## 1. 프로젝트 개요
- **기술 스택**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React, React Router v7
- **패키지 매니저**: npm
- **현재 브랜치**: `master`

---

## 2. 최근 구현된 주요 기능 및 변경 이력

1. **상단 네비게이션 & 헤더 브랜드 아이덴티티**
   - **공식 엠블럼**: 방송대 공식 상징물 표준관리지침에 규정된 **BS 16 엠블럼 C** 적용 (`public/UI/knou_emblem_c.png`).
   - **2줄 타이틀**: 
     - 윗줄: `광주전남지역대학` (KNOU Dark Blue `#0054a6`)
     - 아랫줄: `컴퓨터과학과 학생회` (KNOU Deep Blue `#00428e`)
     - 위아래 동일 폰트 크기(`17px / 18.5px`), 좁아진 자간과 줄간격, 첫 글자(`광`-`컴`)와 끝 글자(`학`-`회`) 양끝 칼맞춤(`justify-between`) 완료.
   - **외부 링크 최신화**:
     - `MyKNOU 학사정보` (`https://m.knou.ac.kr/`) 탑바, 우측 강조 버튼, 모바일 메뉴, 홈 퀵링크, 푸터 전면 배치.
     - `광주전남지역대학` (`https://wgwangju.knou.ac.kr/`) 반영.
     - `컴퓨터과학과` (`https://cs.knou.ac.kr/`) 명칭 및 링크 동기화.
     - `U-KNOU 원격수강` (`https://ucampus.knou.ac.kr`) 연동.

2. **학술·스터디 메뉴 신설 (`/studies`)**
   - **학습자료 탭**: 
     - 1~4학년 및 1/2학기 선택 지원.
     - 선택 학년/학기별 전공 교과목(C프로그래밍, 자료구조, 운영체제 등) 버튼 자동 나열 및 필터링.
     - 실제 파일 첨부(PDF, HWP, ZIP, 소스코드 등) 및 다운로드(Base64 로컬 저장/다운로드 카운터 연동) 지원.
     - **자료 수정/삭제** 기능 완비.
   - **기타자료 탭**:
     - VS Code, Git/GitHub, Wireshark, 정보처리기사 등 IT 실무 자료실.
     - 파일 업로드/다운로드 및 수정/삭제 완비.
   - **스터디 탭**:
     - 스터디 소그룹 개설 및 참여 신청 기능 이관.

3. **커뮤니티 메뉴 개편 (`/community`)**
   - **자유게시판** 신설: 글 작성, 조회수, 댓글 소통 기능 완비.
   - **학우 소통 & 열린 건의함**: 학생회 건의사항 접수 및 관리자 실시간 댓글 답변 게시판 방식.
   - **자주 묻는 질문 (FAQ)**.

---

## 3. 다른 컴퓨터로 프로젝트 이전 및 작업 방법

### 방법 A: GitHub 등 원격 Git 저장소를 이용할 경우 (권장)
1. **현재 PC에서 원격 저장소 연결 및 Push**:
   ```bash
   git remote add origin <GitHub_저장소_URL>
   git branch -M master
   git push -u origin master
   ```
2. **다른 컴퓨터에서**:
   ```bash
   git clone <GitHub_저장소_URL>
   cd knoucsgj_website
   npm install
   npm run dev
   ```

### 방법 B: USB 또는 압축 파일로 복사할 경우
- `node_modules` 폴더와 `dist` 폴더를 **제외한 전체 폴더**(`src`, `public`, `package.json`, `tsconfig.json`, `vite.config.ts`, `.git` 등)를 압축하여 전달합니다.
- 다른 컴퓨터에서 압축 해제 후:
  ```bash
  npm install
  npm run dev
  ```

---

## 4. 다른 컴퓨터의 안티그래비티(Antigravity)에 첫 프롬프트 추천
다른 컴퓨터의 안티그래비티에서 프로젝트 폴더를 열고 첫 대화창에 아래 문장을 그대로 입력하시면 즉시 이전 맥락을 파악하고 작업을 이어갈 수 있습니다:

> "이 프로젝트는 방송대 광주전남지역대학 컴퓨터과학과 학생회 웹사이트(React + TS + Tailwind)입니다. 방금 전 컴퓨터에서 BS16 엠블럼 C 및 2줄 양끝맞춤 브랜드 헤더, 학술·스터디 자료실(파일 업로드/다운로드/수정/삭제), 커뮤니티 자유게시판 및 건의함, MyKNOU 학사정보 연동까지 master 브랜치에 커밋 완료된 상태입니다. `PROJECT_TRANSFER_GUIDE.md`를 참고해서 다음 작업을 도와줘."
