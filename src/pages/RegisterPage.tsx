import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { auth, REGIONAL_COLLEGES } from '../services/auth';
import { PrivacyConsentText, TermsText } from '../components/auth/PrivacyConsent';
import { UserPlus, AlertCircle, Mail, CheckCircle2, Clock, Send, RefreshCw, Search, MapPin } from 'lucide-react';

const inputCls =
  'w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none';
const labelCls = 'block font-bold text-slate-800 mb-1.5 text-sm';

// Daum Postcode dynamic script loader fallback
const loadDaumPostcodeScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if ((window as any).daum && (window as any).daum.Postcode) {
      return resolve();
    }
    const existing = document.getElementById('daum-postcode-script');
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('우편번호 검색 스크립트 로드 실패')));
      return;
    }
    const script = document.createElement('script');
    script.id = 'daum-postcode-script';
    script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('우편번호 검색 서비스를 불러오지 못했습니다. 네트워크 상태를 확인해 주세요.'));
    document.head.appendChild(script);
  });
};

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
    student_no: '',
    regional_college: '광주전남',
    department: '컴퓨터과학과',
  });

  // Standardized Address states
  const [zonecode, setZonecode] = useState('');
  const [baseAddress, setBaseAddress] = useState('');
  const [detailAddress, setDetailAddress] = useState('');
  const detailAddressRef = useRef<HTMLInputElement>(null);

  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Email verification states
  const [code, setCode] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [cooldown, setCooldown] = useState(0); // in seconds
  const [expireSeconds, setExpireSeconds] = useState(0); // 10 minutes (600s)
  const [emailMsg, setEmailMsg] = useState<{ type: 'info' | 'error' | 'success'; text: string } | null>(null);

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  // Expiration timer
  useEffect(() => {
    if (expireSeconds <= 0) return;
    const t = setInterval(() => setExpireSeconds((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [expireSeconds]);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (key === 'username') {
      if (isEmailVerified) {
        setIsEmailVerified(false);
        setIsCodeSent(false);
        setEmailMsg({ type: 'info', text: '이메일이 변경되었습니다. 다시 인증해 주세요.' });
      }
    }
    setForm((f) => ({ ...f, [key]: e.target.value }));
  };

  const handleSendCode = async () => {
    setEmailMsg(null);
    setError('');
    const email = form.username.trim();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email || !emailRegex.test(email)) {
      setEmailMsg({ type: 'error', text: '올바른 이메일 주소를 입력해 주세요.' });
      return;
    }

    try {
      setIsSendingCode(true);
      const res = await auth.sendEmailCode(email, 'register');
      setIsCodeSent(true);
      setCooldown(60); // 60s cooldown
      setExpireSeconds(600); // 10 minutes
      setEmailMsg({
        type: 'info',
        text: res.message || '인증번호가 발송되었습니다. 메일함을 확인해 주세요.',
      });
    } catch (err: any) {
      setEmailMsg({ type: 'error', text: err.message || '인증번호 발송에 실패했습니다.' });
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleVerifyCode = async () => {
    setEmailMsg(null);
    if (!code.trim()) {
      setEmailMsg({ type: 'error', text: '6자리 인증번호를 입력해 주세요.' });
      return;
    }

    try {
      setIsVerifyingCode(true);
      const res = await auth.verifyEmailCode(form.username.trim(), code.trim());
      setIsEmailVerified(true);
      setEmailMsg({ type: 'success', text: res.message || '이메일 인증이 완료되었습니다!' });
    } catch (err: any) {
      setEmailMsg({ type: 'error', text: err.message || '인증번호가 일치하지 않습니다.' });
    } finally {
      setIsVerifyingCode(false);
    }
  };

  // Address search with Daum Postcode API
  const handleSearchAddress = async () => {
    try {
      await loadDaumPostcodeScript();
      new (window as any).daum.Postcode({
        oncomplete: (data: any) => {
          // Standardized address: 도로명 또는 지번
          let addr = '';
          let extraAddr = '';

          if (data.userSelectedType === 'R') {
            addr = data.roadAddress;
            if (data.bname !== '' && /[동|로|가]$/g.test(data.bname)) {
              extraAddr += data.bname;
            }
            if (data.buildingName !== '' && data.apartment === 'Y') {
              extraAddr += extraAddr !== '' ? `, ${data.buildingName}` : data.buildingName;
            }
            if (extraAddr !== '') {
              extraAddr = ` (${extraAddr})`;
            }
          } else {
            // 지번 주소 선택 시
            addr = data.jibunAddress || data.address;
          }

          setZonecode(data.zonecode); // 5자리 우편번호
          setBaseAddress(`${addr}${extraAddr}`);
          setError('');

          // Auto-focus detail address field
          setTimeout(() => {
            detailAddressRef.current?.focus();
          }, 100);
        },
      }).open();
    } catch (err: any) {
      alert(err.message || '주소 검색 서비스를 불러올 수 없습니다.');
    }
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isEmailVerified) {
      setError('이메일 인증을 완료해 주세요. [인증번호 발송]을 눌러 인증을 진행해 주세요.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (form.password !== form.passwordConfirm) {
      setError('비밀번호 확인이 일치하지 않습니다.');
      return;
    }

    const RESTRICTED_NICK_REGEX = /(관리자|운영자|학생회|회장|국장|부장|차장|팀장|임원)/i;
    if (RESTRICTED_NICK_REGEX.test(form.nickname.trim())) {
      setError('관리자, 운영자 또는 학생회 임원 직함(회장, 부장, 국장 등)이 포함된 닉네임은 가입 시 사용하실 수 없습니다. 임원 닉네임은 관리자 승인 후 별도 설정됩니다.');
      window.scrollTo({ top: 300, behavior: 'smooth' });
      return;
    }

    if (!zonecode || !baseAddress.trim()) {
      setError('주소 검색을 통해 우편번호와 기본 주소를 입력해 주세요.');
      window.scrollTo({ top: 350, behavior: 'smooth' });
      return;
    }

    if (!agreePrivacy || !agreeTerms) {
      setError('개인정보 수집·이용 및 이용약관에 모두 동의해 주세요.');
      return;
    }

    const fullAddress = `(${zonecode}) ${baseAddress} ${detailAddress}`.trim();

    try {
      setSubmitting(true);
      await auth.register({
        username: form.username.trim(),
        password: form.password,
        nickname: form.nickname.trim(),
        name: form.name.trim(),
        phone: form.phone.trim(),
        address: fullAddress,
        student_no: form.student_no.trim(),
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
        <div className="flex items-baseline justify-between flex-wrap gap-2">
          <h1 className="font-knou text-2xl sm:text-3xl font-bold text-slate-950">회원가입</h1>
          <span className="text-xs text-slate-500 font-medium">
            <span className="text-rose-500 font-bold">*</span> 표시는 필수 입력 항목입니다.
          </span>
        </div>
        <p className="text-sm sm:text-base text-slate-600 mt-1.5">
          외부 이메일 인증 후 가입하시면 자유게시판·열린 건의함·학습자료 등록과 스터디 개설 신청을 이용하실 수 있습니다.
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-2 p-4 rounded-2xl bg-red-50 border border-red-200 text-sm text-red-800 font-medium">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={submit} className="space-y-6">
        {/* Section 1: Account & Email Verification */}
        <section className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-4 shadow-xs">
          <h2 className="font-bold text-slate-900 text-lg flex items-center gap-2">
            <Mail className="w-5 h-5 text-blue-600" />
            계정 정보 (이메일 인증)
          </h2>

          <div>
            <label className={labelCls}>
              아이디 (외부 이메일 주소) <span className="text-rose-500 font-bold">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                className={`${inputCls} ${isEmailVerified ? 'bg-slate-50 text-slate-600 font-semibold cursor-not-allowed' : ''}`}
                required
                readOnly={isEmailVerified}
                value={form.username}
                onChange={set('username')}
                autoComplete="email"
                placeholder="예: user@naver.com, user@gmail.com"
                maxLength={80}
              />
              {!isEmailVerified ? (
                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled={isSendingCode || cooldown > 0}
                  className="shrink-0 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-500 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  {isSendingCode ? (
                    '발송 중...'
                  ) : cooldown > 0 ? (
                    `${cooldown}초 후 재발송`
                  ) : isCodeSent ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5" /> 재발송
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" /> 인증번호 발송
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setIsEmailVerified(false);
                    setIsCodeSent(false);
                    setCode('');
                    setEmailMsg({ type: 'info', text: '이메일을 변경하려면 다시 인증번호를 발송해 주세요.' });
                  }}
                  className="shrink-0 px-3.5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-semibold"
                >
                  변경
                </button>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              네이버, 구글, 다음 등 실제 사용 중인 외부 이메일을 입력해 주세요.
            </p>
          </div>

          {/* Verification Code Input */}
          {isCodeSent && !isEmailVerified && (
            <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-2 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-blue-950">
                  인증번호 6자리 입력 <span className="text-rose-500 font-bold">*</span>
                </label>
                {expireSeconds > 0 && (
                  <span className="text-xs font-semibold text-rose-600 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    남은 시간 {formatTimer(expireSeconds)}
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="6자리 숫자"
                  className="w-full px-4 py-2.5 bg-white rounded-xl border border-blue-200 text-center text-lg font-mono tracking-widest font-bold text-blue-900 focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <button
                  type="button"
                  onClick={handleVerifyCode}
                  disabled={isVerifyingCode || !code.trim() || expireSeconds <= 0}
                  className="shrink-0 px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 disabled:bg-slate-300 text-white font-bold text-xs transition-colors shadow-xs"
                >
                  {isVerifyingCode ? '확인 중...' : '인증 확인'}
                </button>
              </div>
              <p className="text-[11px] text-blue-800/80">
                메일이 오지 않은 경우 스팸메일함을 확인하시거나 60초 후 [재발송]을 눌러주세요.
              </p>
            </div>
          )}

          {/* Verification status feedback */}
          {emailMsg && (
            <div
              className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                emailMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold'
                  : emailMsg.type === 'error'
                  ? 'bg-rose-50 text-rose-800 border border-rose-200 font-medium'
                  : 'bg-blue-50 text-blue-800 border border-blue-200'
              }`}
            >
              {emailMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              )}
              <span>{emailMsg.text}</span>
            </div>
          )}

          {isEmailVerified && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              이메일 소유권이 확인되었습니다. 아래 필수 정보를 마저 입력해 주세요.
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className={labelCls}>
                비밀번호 <span className="text-rose-500 font-bold">*</span>
              </label>
              <input
                className={inputCls}
                type="password"
                required
                value={form.password}
                onChange={set('password')}
                autoComplete="new-password"
                placeholder="영문+숫자 8자 이상"
                maxLength={64}
              />
            </div>
            <div>
              <label className={labelCls}>
                비밀번호 확인 <span className="text-rose-500 font-bold">*</span>
              </label>
              <input
                className={inputCls}
                type="password"
                required
                value={form.passwordConfirm}
                onChange={set('passwordConfirm')}
                autoComplete="new-password"
                placeholder="비밀번호 다시 입력"
                maxLength={64}
              />
            </div>
          </div>

          <div>
            <label className={labelCls}>
              닉네임 (게시물에 표시되는 이름) <span className="text-rose-500 font-bold">*</span>
            </label>
            <input
              className={inputCls}
              required
              value={form.nickname}
              onChange={set('nickname')}
              placeholder="예: 3학년 불꽃코너"
              maxLength={12}
            />
            <p className="text-xs text-slate-500 mt-1">실명은 공개되지 않으며 닉네임만 표시됩니다. (2~12자, 임원 직함 제외)</p>
          </div>
        </section>

        {/* Section 2: Student & Address Information */}
        <section className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-4 shadow-xs">
          <h2 className="font-bold text-slate-900 text-lg flex items-center gap-2">
            <MapPin className="w-5 h-5 text-indigo-600" />
            학우 정보 및 주소
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>
                성명 <span className="text-rose-500 font-bold">*</span>
              </label>
              <input className={inputCls} required value={form.name} onChange={set('name')} autoComplete="name" maxLength={30} />
            </div>
            <div>
              <label className={labelCls}>
                연락처 (휴대전화) <span className="text-rose-500 font-bold">*</span>
              </label>
              <input
                className={inputCls}
                type="tel"
                required
                value={form.phone}
                onChange={set('phone')}
                autoComplete="tel"
                placeholder="010-0000-0000"
                maxLength={20}
              />
            </div>
          </div>

          <div>
            <label className={labelCls}>
              학번 (숫자 8~10자리) <span className="text-rose-500 font-bold">*</span>
            </label>
            <input
              className={inputCls}
              required
              value={form.student_no}
              onChange={set('student_no')}
              placeholder="예: 202612345"
              maxLength={10}
            />
          </div>

          {/* Standardized Address with Daum Postcode Search */}
          <div className="space-y-2 pt-1">
            <label className={labelCls}>
              자택 주소 <span className="text-rose-500 font-bold">*</span>
            </label>

            {/* Postal Code + Search Button */}
            <div className="flex gap-2 max-w-xs">
              <input
                type="text"
                readOnly
                value={zonecode}
                placeholder="우편번호 (5자리)"
                className={`${inputCls} bg-slate-50 font-mono font-bold text-slate-800 cursor-pointer`}
                onClick={handleSearchAddress}
              />
              <button
                type="button"
                onClick={handleSearchAddress}
                className="shrink-0 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors shadow-xs flex items-center gap-1.5"
              >
                <Search className="w-3.5 h-3.5" /> 우편번호 검색
              </button>
            </div>

            {/* Base Address (Readonly) */}
            <input
              type="text"
              readOnly
              value={baseAddress}
              placeholder="기본 주소 (우편번호 검색 시 자동 입력)"
              className={`${inputCls} bg-slate-50 cursor-pointer text-slate-800 font-medium`}
              onClick={handleSearchAddress}
            />

            {/* Detail Address */}
            <input
              ref={detailAddressRef}
              type="text"
              value={detailAddress}
              onChange={(e) => setDetailAddress(e.target.value)}
              placeholder="상세 주소 입력 (동·호수 등)"
              maxLength={100}
              className={inputCls}
            />
            <p className="text-xs text-slate-500">
              우편번호 검색 버튼을 눌러 표준화된 도로명 주소 또는 지번 주소를 검색하실 수 있습니다.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className={labelCls}>
                소속 지역대학 <span className="text-rose-500 font-bold">*</span>
              </label>
              <select className={inputCls} value={form.regional_college} onChange={set('regional_college')}>
                {REGIONAL_COLLEGES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>
                소속 학과 <span className="text-rose-500 font-bold">*</span>
              </label>
              <input className={inputCls} required value={form.department} onChange={set('department')} maxLength={30} />
            </div>
          </div>
        </section>

        {/* Section 3: Terms & Consents */}
        <section className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-4 shadow-xs">
          <h2 className="font-bold text-slate-900 text-lg">약관 및 개인정보 동의</h2>

          <div className="space-y-2">
            <label className="flex items-center gap-2.5 font-bold text-slate-900 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={agreePrivacy}
                onChange={(e) => setAgreePrivacy(e.target.checked)}
                className="w-4.5 h-4.5 accent-blue-600"
              />
              [필수] 개인정보 수집 및 이용에 동의합니다. <span className="text-rose-500 font-bold">*</span>
            </label>
            <div className="max-h-40 overflow-y-auto p-3 rounded-2xl border border-slate-200 bg-slate-50/60">
              <PrivacyConsentText compact />
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2.5 font-bold text-slate-900 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="w-4.5 h-4.5 accent-blue-600"
              />
              [필수] 이용약관에 동의합니다. <span className="text-rose-500 font-bold">*</span>
            </label>
            <div className="max-h-40 overflow-y-auto p-3 rounded-2xl border border-slate-200 bg-slate-50/60">
              <TermsText compact />
            </div>
          </div>

          <label className="flex items-center gap-2.5 text-sm font-semibold text-slate-700 cursor-pointer pt-1 border-t border-slate-100">
            <input
              type="checkbox"
              checked={agreePrivacy && agreeTerms}
              onChange={(e) => {
                setAgreePrivacy(e.target.checked);
                setAgreeTerms(e.target.checked);
              }}
              className="w-4.5 h-4.5 accent-blue-600"
            />
            전체 동의
          </label>
        </section>

        <button
          type="submit"
          disabled={submitting || !isEmailVerified}
          className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-base transition-colors shadow-sm"
        >
          {submitting
            ? '가입 처리 중...'
            : !isEmailVerified
            ? '이메일 인증을 먼저 완료해 주세요'
            : '가입하기'}
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
