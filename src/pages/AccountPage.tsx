import React, { useState } from 'react';
import { showConfirm } from '../components/ui/GlobalDialog';
import { Link, useNavigate } from 'react-router-dom';
import { auth, useAuth } from '../services/auth';
import { UserCircle, AlertCircle, CheckCircle2, Shield } from 'lucide-react';
import { parseStudentNo } from '../lib/knouDepartments';

const inputCls =
  'w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none';

const maskPhone = (p: string) => (p.length >= 8 ? `${p.slice(0, 3)}-****-${p.slice(-4)}` : p);
const maskStudentNo = (sn: string) => {
  if (sn.includes('-')) {
    const parts = sn.split('-');
    return `${parts[0]}-*`;
  }
  return sn.length > 5 ? `${sn.slice(0, -5)}*****` : '*****';
};

export const AccountPage: React.FC = () => {
  const navigate = useNavigate();
  const { member, loaded } = useAuth();
  const [showSensitive, setShowSensitive] = useState(false);

  const [oldPw, setOldPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const [withdrawPw, setWithdrawPw] = useState('');
  const [withdrawErr, setWithdrawErr] = useState('');

  if (!loaded) return <div className="py-20 text-center text-slate-500">불러오는 중...</div>;
  if (!member) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <p className="text-slate-700">로그인이 필요한 페이지입니다.</p>
        <Link to="/login?next=/account" className="inline-block px-6 py-3 rounded-xl bg-blue-600 text-white font-bold">
          로그인하기
        </Link>
      </div>
    );
  }

  const changePw = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMsg(null);
    try {
      await auth.changeMemberPassword(oldPw, newPw);
      setPwMsg({ ok: true, text: '비밀번호가 변경되었습니다.' });
      setOldPw('');
      setNewPw('');
    } catch (err: any) {
      setPwMsg({ ok: false, text: err.message });
    }
  };

  const withdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawErr('');
    if (!(await showConfirm({ title: '회원 탈퇴 확인', message: '정말 탈퇴하시겠습니까?', subMessage: '탈퇴 시 모든 개인정보가 즉시 파기되며 복구할 수 없습니다.', confirmText: '탈퇴하기', variant: 'danger' }))) return;
    try {
      await auth.withdraw(withdrawPw);
      alert('회원 탈퇴가 완료되었습니다. 이용해 주셔서 감사합니다.');
      navigate('/', { replace: true });
    } catch (err: any) {
      setWithdrawErr(err.message);
    }
  };

  const roleLabel =
    member.role === 'president'
      ? '학생회장'
      : member.role === 'officer'
      ? '임원진'
      : member.role === 'regular'
      ? '정회원'
      : '준회원';

  const parsedSn = parseStudentNo(member.student_no);

  const rows: [string, string][] = [
    ['회원 등급', roleLabel],
    ['아이디', member.username],
    ['닉네임', member.nickname],
    ['성명', member.name],
    ['연락처', showSensitive ? member.phone : maskPhone(member.phone)],
    ['소속 학습관', member.learning_center || (member.regional_college === '광주전남' ? '광주전남지역대학' : '해당 없음 (타 지역대학 / 준회원)')],
    ['거주지역', member.address],
    ['학번 (앞 8자리)', showSensitive ? member.student_no : maskStudentNo(member.student_no)],
    ...(parsedSn.isValid
      ? ([['입학 정보', `${parsedSn.admissionYear}년 입학 (${parsedSn.admissionGrade}학년${parsedSn.departmentName ? ` · ${parsedSn.departmentName}` : ''})`]] as [string, string][])
      : []),
    ['소속 지역대학', `${member.regional_college} 지역대학`],
    ['소속 학과', member.department],
    ['가입일', member.created_at.split('T')[0]],
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="border-b border-slate-200 pb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <UserCircle className="w-10 h-10 text-blue-600" />
          <div>
            <h1 className="font-knou text-2xl sm:text-3xl font-bold text-slate-950">내 정보</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-slate-600 font-semibold">{member.nickname} 님</span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                  member.role === 'president'
                    ? 'bg-purple-100 text-purple-700 border-purple-200'
                    : member.role === 'officer'
                    ? 'bg-blue-100 text-blue-700 border-blue-200'
                    : member.role === 'regular'
                    ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                    : 'bg-amber-100 text-amber-700 border-amber-200'
                }`}
              >
                {roleLabel}
              </span>
            </div>
          </div>
        </div>
        {(member.role === 'president' || member.role === 'officer') && (
          <Link
            to="/admin"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors shadow-xs"
          >
            <Shield className="w-4 h-4 text-amber-400" />
            관리자 센터
          </Link>
        )}
      </div>

      <section className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg text-slate-900">가입 정보</h2>
          <button onClick={() => setShowSensitive((v) => !v)} className="text-sm font-bold text-blue-700 hover:underline">
            {showSensitive ? '가리기' : '전체 보기'}
          </button>
        </div>
        <dl className="divide-y divide-slate-100 text-sm">
          {rows.map(([k, v]) => (
            <div key={k} className="flex py-2.5 gap-4">
              <dt className="w-32 shrink-0 font-semibold text-slate-600">{k}</dt>
              <dd className="text-slate-900 break-all">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-5 p-4 rounded-2xl border text-xs leading-relaxed space-y-1.5 ${
          member.role === 'president' || member.role === 'officer'
            ? 'bg-indigo-50/60 border-indigo-100 text-indigo-900'
            : member.role === 'regular'
            ? 'bg-emerald-50/60 border-emerald-100 text-emerald-900'
            : 'bg-amber-50/60 border-amber-100 text-amber-900'
        }">
          <div className="font-bold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
            회원 등급 권한 안내
          </div>
          {member.role === 'president' && (
            <p>
              <strong>학생회장 등급:</strong> 관리자 센터 및 회원 관리 접근이 가능하며, 공지사항 및 학사일정을 총괄 관리합니다. (단, 학생회칙 및 세칙 수정, 결산 및 회의록 공지사항의 삭제는 최고 관리자만 가능합니다.)
            </p>
          )}
          {member.role === 'officer' && (
            <p>
              <strong>임원진 등급:</strong> 학생회 관리자 센터에서 공지사항, 학사일정, 스터디 승인, 임원 정보를 관리할 수 있으며, 학생회에 바란다에 공식 답변 댓글을 작성할 수 있습니다. (회원 관리 및 타인 게시물 강제 삭제는 제한됩니다.)
            </p>
          )}
          {member.role === 'regular' && (
            <p>
              <strong>정회원:</strong> 광주전남지역대학 컴퓨터과학과 소속 재학생으로, 커뮤니티 자유게시판 글/댓글 작성, 학습자료실 자료 열람/업로드/다운로드, 스터디 개설 신청 등 모든 서비스를 이용하실 수 있습니다.
            </p>
          )}
          {member.role === 'associate' && (
            <p>
              <strong>준회원:</strong> 커뮤니티(자유게시판, 벼룩시장, Q&A 코너, 학생회에 바란다) 글쓰기 및 댓글 작성과 모든 게시글 열람이 가능하며, 학습자료실 파일 다운로드 및 자료 등록은 정회원 이상부터 가능합니다. 정보 정정은 학생회에 문의해 주세요.
            </p>
          )}
        </div>
        <p className="mt-4 text-xs text-slate-500">
          정보 정정·처리정지는 학생회 이메일(knoucsgj@gmail.com)로 요청해 주세요.
        </p>
      </section>

      <section className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
        <h2 className="font-bold text-lg text-slate-900 mb-4">비밀번호 변경</h2>
        <form onSubmit={changePw} className="space-y-3">
          <input className={inputCls} type="password" placeholder="현재 비밀번호" required value={oldPw}
            onChange={(e) => setOldPw(e.target.value)} autoComplete="current-password" />
          <input className={inputCls} type="password" placeholder="새 비밀번호 (영문+숫자 8자 이상)" required value={newPw}
            onChange={(e) => setNewPw(e.target.value)} autoComplete="new-password" />
          {pwMsg && (
            <div className={`flex items-center gap-2 text-sm font-medium ${pwMsg.ok ? 'text-emerald-700' : 'text-red-700'}`}>
              {pwMsg.ok ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {pwMsg.text}
            </div>
          )}
          <button className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-sm">변경하기</button>
        </form>
      </section>

      <section className="bg-white rounded-3xl border border-red-200 p-6 shadow-xs">
        <h2 className="font-bold text-lg text-red-700 mb-1">회원 탈퇴</h2>
        <p className="text-sm text-slate-600 mb-4">
          탈퇴 시 성명·연락처·주소·학번 등 개인정보가 즉시 삭제됩니다. 작성한 게시물은 닉네임으로 남지만 더 이상 수정·삭제할
          수 없습니다.
        </p>
        <form onSubmit={withdraw} className="space-y-3">
          <input className={inputCls} type="password" placeholder="비밀번호 확인" required value={withdrawPw}
            onChange={(e) => setWithdrawPw(e.target.value)} autoComplete="current-password" />
          {withdrawErr && <p className="text-sm font-medium text-red-700">{withdrawErr}</p>}
          <button className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm">탈퇴하기</button>
        </form>
      </section>
    </div>
  );
};
