import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, useAuth } from '../services/auth';
import { UserCircle, AlertCircle, CheckCircle2 } from 'lucide-react';

const inputCls =
  'w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none';

const maskPhone = (p: string) => (p.length >= 8 ? `${p.slice(0, 3)}-****-${p.slice(-4)}` : p);

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
    if (!window.confirm('정말 탈퇴하시겠습니까? 개인정보가 즉시 삭제되며 복구할 수 없습니다.')) return;
    try {
      await auth.withdraw(withdrawPw);
      alert('회원 탈퇴가 완료되었습니다. 이용해 주셔서 감사합니다.');
      navigate('/', { replace: true });
    } catch (err: any) {
      setWithdrawErr(err.message);
    }
  };

  const rows: [string, string][] = [
    ['아이디', member.username],
    ['닉네임', member.nickname],
    ['성명', member.name],
    ['연락처', showSensitive ? member.phone : maskPhone(member.phone)],
    ['주소', showSensitive ? member.address : `${member.address.slice(0, 6)}***`],
    ['학번', showSensitive ? member.student_no : `${member.student_no.slice(0, 4)}****`],
    ['소속 지역대학', `${member.regional_college} 지역대학`],
    ['소속 학과', member.department],
    ['가입일', member.created_at.split('T')[0]],
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="border-b border-slate-200 pb-6 flex items-center gap-3">
        <UserCircle className="w-10 h-10 text-blue-600" />
        <div>
          <h1 className="font-knou text-2xl sm:text-3xl font-bold text-slate-950">내 정보</h1>
          <p className="text-sm text-slate-600">{member.nickname} 님</p>
        </div>
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
