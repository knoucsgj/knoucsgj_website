import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { auth } from '../services/auth';
import { LogIn, AlertCircle } from 'lucide-react';

const inputCls =
  'w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get('next') || '/';
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      setSubmitting(true);
      await auth.login(username, password);
      navigate(next, { replace: true });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="border-b border-slate-200 pb-6">
        <div className="flex items-center gap-2 text-[11px] font-semibold text-blue-700 tracking-wider uppercase mb-1">
          <LogIn className="w-4 h-4" /> Member Login
        </div>
        <h1 className="font-knou text-2xl sm:text-3xl font-bold text-slate-950">로그인</h1>
        <p className="text-sm sm:text-base text-slate-600 mt-1.5">
          게시글·자료 등록과 스터디 개설 신청은 로그인 후 이용하실 수 있습니다.
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-2 p-4 rounded-2xl bg-red-50 border border-red-200 text-sm text-red-800 font-medium">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={submit} className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-4 shadow-xs">
        <div>
          <label className="block font-bold text-slate-800 mb-1.5 text-sm">아이디</label>
          <input className={inputCls} required value={username} onChange={(e) => setUsername(e.target.value)}
            autoComplete="username" autoFocus />
        </div>
        <div>
          <label className="block font-bold text-slate-800 mb-1.5 text-sm">비밀번호</label>
          <input className={inputCls} type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password" />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold text-base transition-colors"
        >
          {submitting ? '로그인 중...' : '로그인'}
        </button>
      </form>

      <p className="text-center text-sm text-slate-600">
        아직 회원이 아니신가요?{' '}
        <Link to={`/register?next=${encodeURIComponent(next)}`} className="font-bold text-blue-700 hover:underline">
          회원가입
        </Link>
      </p>
      <p className="text-center text-xs text-slate-500">
        비밀번호를 잊으신 경우 학생회 이메일(knoucsgj@gmail.com)로 문의해 주세요.
      </p>
    </div>
  );
};
