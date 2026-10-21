import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { auth, REGIONAL_COLLEGES } from '../services/auth';
import { PrivacyConsentText, TermsText } from '../components/auth/PrivacyConsent';
import { UserPlus, AlertCircle } from 'lucide-react';

const inputCls =
  'w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none';
const labelCls = 'block font-bold text-slate-800 mb-1.5 text-sm';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get('next') || '/';

  const [form, setForm] = useState({
    username: '',
    password: '',
    passwordConfirm: '',
    nickname: '',
    name: '',
    phone: '',
    address: '',
    student_no: '',
    regional_college: '광주전남',
    department: '컴퓨터과학과',
  });
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.passwordConfirm) {
      setError('비밀번호 확인이 일치하지 않습니다.');
      return;
    }
    if (!agreePrivacy || !agreeTerms) {
      setError('개인정보 수집·이용 및 이용약관에 모두 동의해 주세요.');
      return;
    }
    try {
      setSubmitting(true);
      await auth.register({
        username: form.username,
        password: form.password,
        nickname: form.nickname,
        name: form.name,
        phone: form.phone,
        address: form.address,
        student_no: form.student_no,
        regional_college: form.regional_college,
        department: form.department,
        consent_privacy: agreePrivacy,
        consent_terms: agreeTerms,
      });
      navigate(next, { replace: true });
    } catch (err: any) {
      setError(err.message);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="border-b border-slate-200 pb-6">
        <div className="flex items-center gap-2 text-[11px] font-semibold text-blue-700 tracking-wider uppercase mb-1">
          <UserPlus className="w-4 h-4" /> Member Registration
        </div>
        <h1 className="font-knou text-2xl sm:text-3xl font-bold text-slate-950">회원가입</h1>
        <p className="text-sm sm:text-base text-slate-600 mt-1.5">
          가입하시면 자유게시판·열린 건의함·학습자료 등록과 스터디 개설 신청을 이용하실 수 있습니다.
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-2 p-4 rounded-2xl bg-red-50 border border-red-200 text-sm text-red-800 font-medium">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={submit} className="space-y-6">
        <section className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-4 shadow-xs">
          <h2 className="font-bold text-slate-900 text-lg">계정 정보</h2>
          <div>
            <label className={labelCls}>아이디 (이메일 주소)</label>
            <input
              type="email"
              className={inputCls}
              required
              value={form.username}
              onChange={set('username')}
              autoComplete="email"
              placeholder="예: user@example.com"
              maxLength={80}
            />
            <p className="text-xs text-slate-500 mt-1">
              비밀번호 찾기 및 계정 인증에 사용되므로 사용 중인 이메일 주소를 입력해 주세요.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>비밀번호</label>
              <input className={inputCls} type="password" required value={form.password} onChange={set('password')}
                autoComplete="new-password" placeholder="영문+숫자 8자 이상" maxLength={64} />
            </div>
            <div>
              <label className={labelCls}>비밀번호 확인</label>
              <input className={inputCls} type="password" required value={form.passwordConfirm} onChange={set('passwordConfirm')}
                autoComplete="new-password" maxLength={64} />
            </div>
          </div>
          <div>
            <label className={labelCls}>닉네임 (게시물에 표시되는 이름)</label>
            <input className={inputCls} required value={form.nickname} onChange={set('nickname')}
              placeholder="예: 3학년 불꽃코너" maxLength={12} />
            <p className="text-xs text-slate-500 mt-1">실명은 공개되지 않으며 닉네임만 표시됩니다. (2~12자)</p>
          </div>
        </section>

        <section className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-4 shadow-xs">
          <h2 className="font-bold text-slate-900 text-lg">학우 정보</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>성명</label>
              <input className={inputCls} required value={form.name} onChange={set('name')} autoComplete="name" maxLength={30} />
            </div>
            <div>
              <label className={labelCls}>연락처 (휴대전화)</label>
              <input className={inputCls} type="tel" required value={form.phone} onChange={set('phone')}
                autoComplete="tel" placeholder="010-0000-0000" maxLength={20} />
            </div>
          </div>
          <div>
            <label className={labelCls}>주소</label>
            <input className={inputCls} required value={form.address} onChange={set('address')}
              autoComplete="street-address" placeholder="도로명 주소 (상세 주소 포함)" maxLength={200} />
          </div>
          <div>
            <label className={labelCls}>학번</label>
            <input className={inputCls} required inputMode="numeric" value={form.student_no} onChange={set('student_no')}
              placeholder="숫자 8~10자리" maxLength={12} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>소속 지역대학</label>
              <select className={inputCls} value={form.regional_college} onChange={set('regional_college')}>
                {REGIONAL_COLLEGES.map((c) => (
                  <option key={c} value={c}>{c} 지역대학</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>소속 학과</label>
              <input className={inputCls} required value={form.department} onChange={set('department')} maxLength={30} />
            </div>
          </div>
        </section>

        <section className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-5 shadow-xs">
          <h2 className="font-bold text-slate-900 text-lg">약관 동의</h2>

          <div className="space-y-2">
            <label className="flex items-center gap-2.5 font-bold text-slate-900 text-sm cursor-pointer">
              <input type="checkbox" checked={agreePrivacy} onChange={(e) => setAgreePrivacy(e.target.checked)}
                className="w-4.5 h-4.5 accent-blue-600" />
              [필수] 개인정보 수집·이용에 동의합니다.
            </label>
            <div className="max-h-64 overflow-y-auto p-3 rounded-2xl border border-slate-200 bg-slate-50/60">
              <PrivacyConsentText compact />
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2.5 font-bold text-slate-900 text-sm cursor-pointer">
              <input type="checkbox" checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)}
                className="w-4.5 h-4.5 accent-blue-600" />
              [필수] 이용약관에 동의합니다.
            </label>
            <div className="max-h-40 overflow-y-auto p-3 rounded-2xl border border-slate-200 bg-slate-50/60">
              <TermsText compact />
            </div>
          </div>

          <label className="flex items-center gap-2.5 text-sm font-semibold text-slate-700 cursor-pointer pt-1 border-t border-slate-100">
            <input
              type="checkbox"
              checked={agreePrivacy && agreeTerms}
              onChange={(e) => { setAgreePrivacy(e.target.checked); setAgreeTerms(e.target.checked); }}
              className="w-4.5 h-4.5 accent-blue-600"
            />
            전체 동의
          </label>
        </section>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold text-base transition-colors"
        >
          {submitting ? '가입 처리 중...' : '가입하기'}
        </button>

        <p className="text-center text-sm text-slate-600">
          이미 회원이신가요?{' '}
          <Link to={`/login?next=${encodeURIComponent(next)}`} className="font-bold text-blue-700 hover:underline">
            로그인
          </Link>
        </p>
      </form>
    </div>
  );
};
