import type { CouncilMember, PastCouncilMember } from '../lib/types';

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

// Strict No-Mock Policy: D1 is the Single Source of Truth (SSOT).
export const councilMembers: CouncilMember[] = [];
export const initialPastCouncilMembers: PastCouncilMember[] = [];
