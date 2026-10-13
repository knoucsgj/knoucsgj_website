/**
 * Official KNOU & Regional University Assets
 * (Characters, Official Marks & UI Logos)
 */

export const ASSETS = {
  // Official University Marks (Tightly cropped without empty margins for true sizing)
  UI: {
    gwangjuJeonnam: encodeURI('/UI/knou_gj_logo.png'),
    mainUniversity: encodeURI('/UI/knou_main_logo.png'),
    communicationMark: encodeURI('/UI/방송대 커뮤니케이션마크.png'),
    rawGwangjuJeonnam: encodeURI('/UI/5. 광주전남지역대학.png'),
  },

  // Official Mascot Characters
  characters: {
    // Academic & Practice
    practice: encodeURI('/character/08-10 실습1.png'),      // 전산실습/노트북
    coding: encodeURI('/character/08-10 실습2.png'),        // 컴퓨터 코딩 작업
    lecture: encodeURI('/character/02 강의.png'),           // 원격강의/공부
    study: encodeURI('/character/12-15 토론.png'),          // 스터디/토론
    exam: encodeURI('/character/16 시험.png'),              // 시험/D-Day
    admission: encodeURI('/character/01 입학.png'),         // 신입학/환영
    graduation: encodeURI('/character/04-07 졸업.png'),     // 졸업식/학사모

    // Emotions & Council Activities
    greeting: encodeURI('/character/06 감사.png'),          // 감사 인사/인사말
    best: encodeURI('/character/07 최고.png'),              // 엄지척/복지 최고
    proud: encodeURI('/character/15-16 뿌듯함.png'),        // 뿌듯함/성장
    celebrate: encodeURI('/character/03 축하.png'),         // 축하/행사
    joy: encodeURI('/character/01 희(기쁨).png'),           // 기쁨/환영
    heart: encodeURI('/character/18 하트.png'),             // 애정/소통
  },

  // Real Council & Academic Activity Photos
  pictures: {
    studyActivity: encodeURI('/pictures/CODEAI스터디활동260422.jpg'),
    councilMeeting: encodeURI('/pictures/임원회의.jpg'),
    competition1: encodeURI('/pictures/총장배소프트웨어경진대회260829-1.jpg'),
    competition2: encodeURI('/pictures/총장배소프트웨어경진대회260829-2.jpg'),
  }
} as const;
