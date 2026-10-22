import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { auth } from '../services/auth';
import { LogIn, AlertCircle, KeyRound, CheckCircle2, X } from 'lucide-react';

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

  // Forgot password modal state
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetName, setResetName] = useState('');
  const [resetStudentNo, setResetStudentNo] = useState('');
  const [resetPhone, setResetPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');
  const [resetSubmitting, setResetSubmitting] = useState(false);

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

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');
    setResetSuccess('');

    if (newPassword !== newPasswordConfirm) {
      setResetError('새 비밀번호 확인이 일치하지 않습니다.');
      return;
    }
    if (newPassword.length < 8 || !/[A-Za-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      setResetError('새 비밀번호는 영문과 숫자를 포함하여 8자 이상이어야 합니다.');
      return;
    }

    try {
      setResetSubmitting(true);
      const res = await auth.resetPassword({
        username: resetEmail.trim(),
        name: resetName.trim(),
        student_no: resetStudentNo.trim(),
        phone: resetPhone.trim() || undefined,
        new_password: newPassword,
      });
      setResetSuccess(res.message || '비밀번호가 성공적으로 재설정되었습니다.');
      setUsername(resetEmail.trim());
      setTimeout(() => {
        setIsResetOpen(false);
        setResetSuccess('');
        setNewPassword('');
        setNewPasswordConfirm('');
      }, 2000);
    } catch (err: any) {
      setResetError(err.message || '비밀번호 재설정에 실패했습니다.');
    } finally {
      setResetSubmitting(false);
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
          <label className="block font-bold text-slate-800 mb-1.5 text-sm">아이디 (이메일)</label>
          <input
            type="email"
            className={inputCls}
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="예: user@example.com"
            autoComplete="username"
            autoFocus
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block font-bold text-slate-800 text-sm">비밀번호</label>
            <button
              type="button"
              onClick={() => {
                setResetEmail(username);
                setResetError('');
                setResetSuccess('');
                setIsResetOpen(true);
              }}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
            >
              비밀번호 찾기
            </button>
          </div>
          <input
            className={inputCls}
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호를 입력하세요"
            autoComplete="current-password"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold text-base transition-colors shadow-xs"
        >
          {submitting ? '로그인 중...' : '로그인'}
        </button>
      </form>

      <div className="flex items-center justify-between text-sm text-slate-600 px-2">
        <span>아직 회원이 아니신가요?</span>
        <Link to={`/register?next=${encodeURIComponent(next)}`} className="font-bold text-blue-700 hover:underline">
          회원가입 바로가기
        </Link>
      </div>

      {/* Forgot Password Modal */}
      {isResetOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <KeyRound className="w-5 h-5" />
                </div>
                비밀번호 찾기 (재설정)
              </div>
              <button
                type="button"
                onClick={() => setIsResetOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              가입 시 등록하신 이메일(아이디), 성명, 학번을 입력하여 본인 확인 후 새 비밀번호로 즉시 재설정하실 수 있습니다.
            </p>

            {resetError && (
              <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-700 rounded-xl flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{resetError}</span>
              </div>
            )}

            {resetSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 rounded-xl flex items-start gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{resetSuccess}</span>
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">아이디 (이메일 주소)</label>
                <input
                  type="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="예: user@example.com"
                  className={inputCls}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">성명</label>
                  <input
                    type="text"
                    required
                    value={resetName}
                    onChange={(e) => setResetName(e.target.value)}
                    placeholder="홍길동"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">학번 (숫자 12자리)</label>
                  <input
                    type="text"
                    required
                    value={resetStudentNo}
                    onChange={(e) => setResetStudentNo(e.target.value.replace(/[^0-9]/g, '').slice(0, 12))}
                    placeholder="12자리 숫자 (- 제외)"
                    maxLength={12}
                    className={inputCls}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  휴대폰 번호 <span className="font-normal text-slate-400">(선택)</span>
                </label>
                <input
                  type="tel"
                  value={resetPhone}
                  onChange={(e) => setResetPhone(e.target.value)}
                  placeholder="01012345678 (- 없이 입력)"
                  className={inputCls}
                />
              </div>

              <div className="pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-700 mb-1">새 비밀번호</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="영문+숫자 8자 이상"
                  className={inputCls}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">새 비밀번호 확인</label>
                <input
                  type="password"
                  required
                  value={newPasswordConfirm}
                  onChange={(e) => setNewPasswordConfirm(e.target.value)}
                  placeholder="새 비밀번호 다시 입력"
                  className={inputCls}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsResetOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={resetSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold text-xs transition-colors shadow-xs"
                >
                  {resetSubmitting ? '재설정 중...' : '비밀번호 재설정'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
