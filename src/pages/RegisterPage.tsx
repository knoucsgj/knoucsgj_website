import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { auth, REGIONAL_COLLEGES } from '../services/auth';
import { LEARNING_CENTERS, KOREA_DISTRICTS, SIDO_LIST } from '../lib/koreaDistricts';
import { formatStudentNoInput, parseStudentNo } from '../lib/knouDepartments';
import { Shield, CheckCircle2, AlertCircle, Eye, EyeOff, Send, Clock, Building2, MapPin, Sparkles, Award } from 'lucide-react';

const inputCls =
  'w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 focus:outline-hidden transition-all text-sm';
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
    student_no: '',
    regional_college: '광주전남',
    department: '컴퓨터과학과',
  });

  // 소속 학습관 (광주전남 4곳 + 해당 없음/타지역 1곳)
  const [learningCenter, setLearningCenter] = useState<string>('광주전남지역대학');

  // 거주지역 (시·도 및 시·군·구 - 전남광주통합특별시 최우선 기본값)
  const [residenceSido, setResidenceSido] = useState<string>('전남광주통합특별시');
  const [residenceSigungu, setResidenceSigungu] = useState<string>('북구');

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

  // Password visibility toggle
  const [showPw, setShowPw] = useState(false);
  const [showPwC, setShowPwC] = useState(false);

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
    const val = e.target.value;
    if (key === 'username') {
      if (isEmailVerified) {
        setIsEmailVerified(false);
        setIsCodeSent(false);
        setEmailMsg({ type: 'info', text: '이메일이 변경되었습니다. 다시 인증해 주세요.' });
      }
    }
    if (key === 'regional_college') {
      if (val !== '광주전남') {
        setLearningCenter('해당 없음 (타 지역대학 / 준회원)');
      } else if (learningCenter === '해당 없음 (타 지역대학 / 준회원)') {
        setLearningCenter('광주전남지역대학');
      }
    }
    setForm((f) => ({ ...f, [key]: val }));
  };

  const handleLearningCenterChange = (center: string) => {
    setLearningCenter(center);
    if (center !== '해당 없음 (타 지역대학 / 준회원)' && form.regional_college !== '광주전남') {
      setForm((f) => ({ ...f, regional_college: '광주전남' }));
    }
  };

  const parsedStudentNo = parseStudentNo(form.student_no);

  const handleStudentNoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatStudentNoInput(e.target.value);
    const parsed = parseStudentNo(formatted);
    setForm((f) => {
      const updated = { ...f, student_no: formatted };
      if (parsed.departmentName) {
        updated.department = parsed.departmentName;
      }
      return updated;
    });
  };

  const isRegularCandidate =
    form.regional_college === '광주전남' &&
    (form.department.includes('컴퓨터과학') || form.department === '컴퓨터과학과');

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
        text: res.message || '인증번호(6자리)가 발송되었습니다. 메일함을 확인해 주세요.',
      });
    } catch (err: any) {
      setEmailMsg({ type: 'error', text: err.message || '인증번호 발송에 실패했습니다.' });
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleVerifyCode = async () => {
    setEmailMsg(null);
    setError('');
    if (!code || code.trim().length !== 6) {
      setEmailMsg({ type: 'error', text: '숫자 6자리 인증번호를 정확히 입력해 주세요.' });
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

    if (!/^\d{6}-\d$/.test(form.student_no.trim())) {
      setError('학번은 하이픈(-) 포함 앞 8자리(예: 202134-3)로 정확히 입력해 주세요.');
      window.scrollTo({ top: 350, behavior: 'smooth' });
      return;
    }

    if (!residenceSido || !residenceSigungu) {
      setError('거주지역(시·도 및 시·군·구)을 선택해 주세요.');
      window.scrollTo({ top: 400, behavior: 'smooth' });
      return;
    }

    if (!agreePrivacy || !agreeTerms) {
      setError('개인정보 수집·이용 및 이용약관에 모두 동의해 주세요.');
      return;
    }

    const fullAddress = `${residenceSido} ${residenceSigungu}`.trim();

    try {
      setSubmitting(true);
      await auth.register({
        username: form.username.trim(),
        password: form.password,
        nickname: form.nickname.trim(),
        name: form.name.trim(),
        phone: form.phone.trim(),
        address: fullAddress,
        learning_center: learningCenter,
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
    <div className="max-w-2xl mx-auto py-8 sm:py-12 px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 mb-3 border border-blue-100 shadow-xs">
          <Shield className="w-7 h-7" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-knou">
          컴퓨터과학과 학생회 회원가입
        </h1>
        <p className="text-sm text-slate-600 mt-2">
          광주전남지역대학 컴퓨터과학과 및 전국의 방송대 학우 여러분을 진심으로 환영합니다.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600" />
          <div className="leading-relaxed font-medium">{error}</div>
        </div>
      )}

      <form onSubmit={submit} className="space-y-6">
        {/* Section 1: 계정 정보 (이메일 인증) */}
        <section className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            <h2 className="font-bold text-slate-900 text-base">로그인 및 계정 정보</h2>
          </div>

          {/* Email / Username with Real-time Verification */}
          <div>
            <label className={labelCls}>
              아이디 (실제 수신 가능한 이메일 주소) <span className="text-rose-500 font-bold">*</span>
            </label>
            <div className="flex gap-2">
              <input
                className={`${inputCls} ${isEmailVerified ? 'bg-slate-50 text-slate-600 font-semibold cursor-not-allowed' : ''}`}
                type="email"
                required
                readOnly={isEmailVerified}
                value={form.username}
                onChange={set('username')}
                placeholder="예: knoucs@gmail.com"
                autoComplete="email"
              />
              <button
                type="button"
                onClick={handleSendCode}
                disabled={isSendingCode || cooldown > 0 || isEmailVerified}
                className="shrink-0 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold text-xs sm:text-sm transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
              >
                {isSendingCode ? (
                  <span>발송 중...</span>
                ) : cooldown > 0 ? (
                  <span>{cooldown}초 후 재요청</span>
                ) : isEmailVerified ? (
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" /> 인증완료
                  </span>
                ) : isCodeSent ? (
                  <span>인증번호 재발송</span>
                ) : (
                  <span className="flex items-center gap-1">
                    <Send className="w-3.5 h-3.5" /> 인증번호 발송
                  </span>
                )}
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              비밀번호 재설정 및 주요 학사 알림 수신을 위해 본인이 소유한 실제 이메일을 입력해 주세요.
            </p>
          </div>

          {/* Verification Code Input */}
          {isCodeSent && !isEmailVerified && (
            <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 space-y-2 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span>이메일로 전송된 숫자 6자리 인증번호</span>
                </label>
                {expireSeconds > 0 && (
                  <span className="text-xs font-mono font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                    유효시간 {formatTimer(expireSeconds)}
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="인증번호 6자리 입력"
                  className="w-full px-4 py-2 rounded-xl border border-blue-300 bg-white font-mono tracking-widest text-base font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={handleVerifyCode}
                  disabled={isVerifyingCode || !code || expireSeconds <= 0}
                  className="shrink-0 px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs sm:text-sm disabled:bg-slate-300 transition-colors shadow-xs cursor-pointer"
                >
                  {isVerifyingCode ? '확인 중...' : '인증 확인'}
                </button>
              </div>
            </div>
          )}

          {/* Email Msg Alert */}
          {emailMsg && (
            <div
              className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
                emailMsg.type === 'error'
                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                  : emailMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-blue-50 text-blue-800 border border-blue-200'
              }`}
            >
              {emailMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{emailMsg.text}</span>
            </div>
          )}

          {/* Passwords */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>
                비밀번호 <span className="text-rose-500 font-bold">*</span>
              </label>
              <div className="relative">
                <input
                  className={inputCls}
                  type={showPw ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={set('password')}
                  placeholder="영문, 숫자 포함 8자 이상"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                  tabIndex={-1}
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className={labelCls}>
                비밀번호 확인 <span className="text-rose-500 font-bold">*</span>
              </label>
              <div className="relative">
                <input
                  className={inputCls}
                  type={showPwC ? 'text' : 'password'}
                  required
                  value={form.passwordConfirm}
                  onChange={set('passwordConfirm')}
                  placeholder="비밀번호 재입력"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPwC(!showPwC)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                  tabIndex={-1}
                >
                  {showPwC ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className={labelCls}>
              커뮤니티 활동 닉네임 <span className="text-rose-500 font-bold">*</span>
            </label>
            <input
              className={inputCls}
              required
              value={form.nickname}
              onChange={set('nickname')}
              maxLength={12}
              placeholder="게시판에서 사용할 2~12자 닉네임"
            />
            <p className="text-xs text-slate-500 mt-1">
              * 임원 직함(회장, 부장 등)이 들어간 닉네임은 가입 시 제한되며, 승인 후 별도 부여됩니다.
            </p>
          </div>
        </section>

        {/* Section 2: 학사 인증 및 소속·거주 정보 */}
        <section className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-5 shadow-xs">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            <h2 className="font-bold text-slate-900 text-base">학사 인증 및 소속·거주 정보</h2>
          </div>

          {/* Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>
                성명 (실명) <span className="text-rose-500 font-bold">*</span>
              </label>
              <input className={inputCls} required value={form.name} onChange={set('name')} autoComplete="name" placeholder="홍길동" />
            </div>
            <div>
              <label className={labelCls}>
                휴대전화 번호 <span className="text-rose-500 font-bold">*</span>
              </label>
              <input
                className={inputCls}
                type="tel"
                required
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value.replace(/[^0-9]/g, '') }))}
                placeholder="01012345678 (숫자만)"
                autoComplete="tel"
                maxLength={11}
              />
            </div>
          </div>

          {/* Student No */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-bold text-slate-800 text-sm">
                학번 (앞 8자리) <span className="text-rose-500 font-bold">*</span>
              </label>
              {parsedStudentNo.isValid && (
                <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                  {parsedStudentNo.admissionYear}년 입학 · {parsedStudentNo.admissionGrade}학년{parsedStudentNo.departmentName ? ` · ${parsedStudentNo.departmentName}` : ''}
                </span>
              )}
            </div>
            <input
              className={`${inputCls} font-mono tracking-wider font-bold text-base`}
              required
              value={form.student_no}
              onChange={handleStudentNoChange}
              placeholder="예: 202134-3"
              maxLength={8}
            />
            <div className="space-y-0.5 mt-1 text-xs text-slate-500">
              <p>
                * 하이픈(-) 포함 앞 8자리를 입력해 주세요. (앞 4자리: 입학연도, 5~6자리: 학과코드, 8번째 자리: 입학학년)
              </p>
              <p className="text-emerald-700 font-medium">
                🔒 개인정보 보호를 위해 학번 뒷자리(개인 일련번호 5자리)는 일체 수집하지 않습니다.
              </p>
            </div>
          </div>

          {/* Regional College & Department */}
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

          {/* Membership Role Preview Banner */}
          {isRegularCandidate ? (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/90 text-xs text-emerald-950 flex items-start gap-2.5 shadow-2xs">
              <div className="p-1.5 rounded-xl bg-emerald-100 text-emerald-700 shrink-0 mt-0.5">
                <Award className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <div className="font-bold text-emerald-900 text-sm flex items-center gap-1.5">
                  <span>정회원 자동 승인 대상</span>
                  <span className="text-[11px] px-1.5 py-0.2 rounded-md bg-emerald-200 text-emerald-800 font-bold">정회원</span>
                </div>
                <p className="text-emerald-800 leading-relaxed">
                  광주전남지역대학 컴퓨터과학과 학우님은 가입과 동시에 <strong>정회원</strong> 권한이 자동 부여되어 족보, 기출문제, 과제물 가이드 등 학생회의 모든 학사 자료실과 커뮤니티를 즉시 이용하실 수 있습니다.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-200/90 text-xs text-indigo-950 flex items-start gap-2.5 shadow-2xs">
              <div className="p-1.5 rounded-xl bg-indigo-100 text-indigo-700 shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <div className="font-bold text-indigo-950 text-sm flex items-center gap-1.5">
                  <span>전국 방송대 학우 환영! 준회원 가입 안내</span>
                  <span className="text-[11px] px-1.5 py-0.2 rounded-md bg-indigo-200 text-indigo-800 font-bold">준회원</span>
                </div>
                <p className="text-indigo-800 leading-relaxed">
                  타 지역대학 또는 타 학과 학우님은 <strong>준회원</strong>으로 안전하게 가입되어 자유게시판, Q&amp;A 등 주요 커뮤니티와 정보 교류에 자유롭게 참여하실 수 있습니다. 향후 컴퓨터과학과 입학/편입 시 정회원으로 승급 전환됩니다.
                </p>
              </div>
            </div>
          )}

          {/* 소속 학습관 선택 */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <label className={labelCls}>
                소속 학습관 <span className="text-rose-500 font-bold">*</span>
              </label>
              {form.regional_college !== '광주전남' && (
                <span className="text-[11px] text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                  타 지역대학 학우 자동 선택됨
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {LEARNING_CENTERS.map((center) => {
                const isSelected = learningCenter === center;
                const isNotApplicable = center === '해당 없음 (타 지역대학 / 준회원)';
                return (
                  <label
                    key={center}
                    className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                      isNotApplicable ? 'sm:col-span-2' : ''
                    } ${
                      isSelected
                        ? 'bg-blue-50/90 border-blue-600 text-blue-950 font-bold shadow-xs'
                        : 'bg-white border-slate-200/90 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="learningCenter"
                      value={center}
                      checked={isSelected}
                      onChange={() => handleLearningCenterChange(center)}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <Building2 className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                    <span className="text-xs sm:text-sm">{center}</span>
                  </label>
                );
              })}
            </div>
            <p className="text-xs text-slate-500">
              * 출석수업, 시험 및 학생회 오프라인 모임의 주 활동 학습관을 선택해 주세요. (타 지역대학/타 학과 학우는 마지막 항목 선택)
            </p>
          </div>

          {/* 거주지역 선택 (시·도 및 시·군·구 연동 드롭다운) */}
          <div className="space-y-2 pt-1">
            <label className={labelCls}>
              거주 지역 <span className="text-rose-500 font-bold">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  <span>시 · 도 선택</span>
                </label>
                <select
                  className={inputCls}
                  value={residenceSido}
                  onChange={(e) => {
                    const nextSido = e.target.value;
                    setResidenceSido(nextSido);
                    const subList = KOREA_DISTRICTS[nextSido] || [];
                    setResidenceSigungu(subList[0] || '');
                  }}
                >
                  {SIDO_LIST.map((sido) => (
                    <option key={sido} value={sido}>
                      {sido}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  시 · 군 · 구 선택
                </label>
                <select
                  className={inputCls}
                  value={residenceSigungu}
                  onChange={(e) => setResidenceSigungu(e.target.value)}
                >
                  {(KOREA_DISTRICTS[residenceSido] || []).map((sigungu) => (
                    <option key={sigungu} value={sigungu}>
                      {sigungu}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <p className="text-xs text-slate-500">
              * 상세 주소(동·호수) 없이 시·도 및 시·군·구 단위만 선택하므로 개인정보가 안전하게 보호되며, 지역별 스터디 조직에 활용됩니다.
            </p>
          </div>
        </section>

        {/* Section 3: Terms & Consents */}
        <section className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            <h2 className="font-bold text-slate-900 text-base">이용약관 및 개인정보 동의</h2>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-2.5 font-bold text-slate-900 text-sm cursor-pointer">
              <input
                type="checkbox"
                required
                checked={agreePrivacy}
                onChange={(e) => setAgreePrivacy(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <span>[필수] 개인정보 수집 및 이용 동의</span>
            </label>
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 leading-relaxed space-y-1">
              <p>• <strong>수집 항목</strong>: 이메일(아이디), 성명, 연락처, 학번, 소속 학습관, 거주지역(시/군/구), 소속 학과</p>
              <p>• <strong>수집 목적</strong>: 학생회 회원 관리, 재학생 등급 부여, 공지사항 알림 및 지역 스터디 그룹 매칭</p>
              <p>• <strong>보유 기간</strong>: 회원 탈퇴 시 또는 졸업·학적 변동 시까지 안전하게 보관 후 파기</p>
            </div>

            <label className="flex items-center gap-2.5 font-bold text-slate-900 text-sm cursor-pointer pt-2">
              <input
                type="checkbox"
                required
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <span>[필수] 학생회 홈페이지 이용약관 동의</span>
            </label>
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 leading-relaxed">
              건전한 학술 교류 및 학우 간 상호 존중 문화를 위해 비방, 욕설, 상업적 광고 게시물은 통보 없이 제재될 수 있음에 동의합니다.
            </div>
          </div>

          <label className="flex items-center gap-2.5 text-sm font-semibold text-slate-700 cursor-pointer pt-2 border-t border-slate-100">
            <input
              type="checkbox"
              checked={agreePrivacy && agreeTerms}
              onChange={(e) => {
                const checked = e.target.checked;
                setAgreePrivacy(checked);
                setAgreeTerms(checked);
              }}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <span className="text-slate-900 font-bold">약관 전체 동의하기</span>
          </label>
        </section>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting || !isEmailVerified}
          className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-extrabold text-base transition-all shadow-md active:scale-98 cursor-pointer disabled:cursor-not-allowed"
        >
          {submitting ? '가입 처리 중...' : '회원가입 완료하기'}
        </button>

        <p className="text-center text-xs text-slate-500">
          이미 계정이 있으신가요?{' '}
          <Link to="/login" className="text-blue-600 font-bold hover:underline">
            로그인하기
          </Link>
        </p>
      </form>
    </div>
  );
};
