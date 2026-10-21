import React from 'react';
import { PrivacyConsentText, TermsText } from '../components/auth/PrivacyConsent';

export const PrivacyPage: React.FC = () => (
  <div className="max-w-3xl mx-auto space-y-8">
    <div className="border-b border-slate-200 pb-6">
      <h1 className="font-knou text-2xl sm:text-3xl font-bold text-slate-950">개인정보 처리 및 이용약관</h1>
      <p className="text-sm text-slate-600 mt-1.5">시행일: 2026년 10월 22일</p>
    </div>
    <section className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-3">
      <h2 className="font-bold text-lg text-slate-900">1. 개인정보 수집·이용 안내</h2>
      <PrivacyConsentText />
    </section>
    <section className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-3">
      <h2 className="font-bold text-lg text-slate-900">2. 이용약관</h2>
      <TermsText />
    </section>
  </div>
);
