import React from 'react';

export const CONTACT_EMAIL = 'knoucsgj@gmail.com';

/** 회원가입 시 표시되는 개인정보 수집·이용 안내 (개인정보 보호법 제15조 필수 고지 항목) */
export const PrivacyConsentText: React.FC<{ compact?: boolean }> = ({ compact }) => (
  <div className={`space-y-3 text-slate-700 leading-relaxed ${compact ? 'text-xs' : 'text-sm'}`}>
    <p className="font-bold text-slate-900">
      한국방송통신대학교 광주전남지역대학 컴퓨터과학과 학생회는 아래와 같이 개인정보를 수집·이용합니다.
    </p>

    <div className="overflow-x-auto">
      <table className="w-full border border-slate-200 text-left">
        <tbody className="divide-y divide-slate-200">
          <tr>
            <th className="w-28 bg-slate-50 px-3 py-2 align-top font-semibold text-slate-900">수집 항목</th>
            <td className="px-3 py-2">
              <p>
                <strong>필수</strong> : 성명, 연락처(휴대전화), 주소, 학번, 소속 지역대학, 소속 학과, 아이디, 비밀번호, 닉네임
              </p>
              <p className="mt-1 text-slate-500">서비스 이용 과정에서 접속 일시, 로그인 세션 정보가 자동 생성될 수 있습니다.</p>
            </td>
          </tr>
          <tr>
            <th className="bg-slate-50 px-3 py-2 align-top font-semibold text-slate-900">수집·이용 목적</th>
            <td className="px-3 py-2">
              <ul className="list-disc space-y-0.5 pl-4">
                <li>회원 식별 및 본인 확인, 부정 이용 방지</li>
                <li>재학생 여부 확인 및 학과 학생회 구성원 관리</li>
                <li>게시판·학습자료 게시, 스터디 개설 신청 및 승인 등 커뮤니티 서비스 제공</li>
                <li>학생회 행사·학사 안내, 문의 응대 및 우편물·물품 발송</li>
              </ul>
            </td>
          </tr>
          <tr>
            <th className="bg-slate-50 px-3 py-2 align-top font-semibold text-slate-900">보유·이용 기간</th>
            <td className="px-3 py-2">
              회원 탈퇴 시까지 보유하며, 탈퇴 즉시 지체 없이 파기합니다. 단, 관계 법령에 따라 보존이 필요한 경우 해당
              기간 동안 보관합니다.
            </td>
          </tr>
          <tr>
            <th className="bg-slate-50 px-3 py-2 align-top font-semibold text-slate-900">동의 거부 권리</th>
            <td className="px-3 py-2">
              개인정보 수집·이용에 동의하지 않을 권리가 있습니다. 다만 동의하지 않으실 경우 회원가입 및 게시글·자료
              등록, 스터디 개설 신청이 제한됩니다. (게시물 열람은 가입 없이 가능합니다.)
            </td>
          </tr>
          <tr>
            <th className="bg-slate-50 px-3 py-2 align-top font-semibold text-slate-900">안전성 확보</th>
            <td className="px-3 py-2">
              비밀번호는 복원이 불가능한 방식으로 암호화하여 저장하며, 성명·연락처·주소·학번은 관리자 외에는
              열람할 수 없고 다른 회원에게 공개되지 않습니다. (게시물에는 닉네임만 표시됩니다.)
            </td>
          </tr>
          <tr>
            <th className="bg-slate-50 px-3 py-2 align-top font-semibold text-slate-900">제3자 제공</th>
            <td className="px-3 py-2">법령에 근거가 있는 경우를 제외하고 수집한 개인정보를 제3자에게 제공하지 않습니다.</td>
          </tr>
          <tr>
            <th className="bg-slate-50 px-3 py-2 align-top font-semibold text-slate-900">문의처</th>
            <td className="px-3 py-2">
              컴퓨터과학과 학생회 · {CONTACT_EMAIL} (열람·탈퇴(삭제)는 로그인 후 '내 정보' 메뉴에서, 정정·처리정지 요청은
              이메일로 가능합니다.)
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
);

/** 이용약관 요약 */
export const TermsText: React.FC<{ compact?: boolean }> = ({ compact }) => (
  <ol className={`list-decimal space-y-1.5 pl-5 text-slate-700 leading-relaxed ${compact ? 'text-xs' : 'text-sm'}`}>
    <li>본 사이트는 한국방송통신대학교 광주전남지역대학 컴퓨터과학과 학우 간 소통과 학습 지원을 위한 공간입니다.</li>
    <li>회원은 타인의 명예를 훼손하거나 불쾌감을 주는 글, 광고·도배, 저작권을 침해하는 자료를 게시할 수 없습니다.</li>
    <li>학습자료 등록 시 저작권(교재·강의 원문 무단 복제 등)에 유의해야 하며, 문제 발생 시 책임은 게시자에게 있습니다.</li>
    <li>학생회는 운영 원칙에 어긋나는 게시물을 삭제하거나 이용을 제한할 수 있습니다.</li>
    <li>회원은 언제든지 탈퇴할 수 있으며, 탈퇴 시 개인정보는 즉시 파기됩니다. 작성한 게시물은 닉네임으로 남을 수 있습니다.</li>
  </ol>
);
