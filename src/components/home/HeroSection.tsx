import React from 'react';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-slate-950 text-white border border-slate-800 shadow-xl mb-12">
      {/* Background subtle architectural grid */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.2) 1px, transparent 0)`,
          backgroundSize: '24px 24px'
        }}
      />

      <div className="relative z-10 p-8 sm:p-12 lg:p-14">
        <div className="max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs sm:text-sm font-semibold">
            <span className="w-2 h-2 rounded-full bg-blue-400"></span>
            <span>한국방송통신대학교 광주전남지역대학 컴퓨터과학과 학생회</span>
          </div>

          <h1 className="font-knou text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white leading-snug">
            일과 학업의 병행, <br className="hidden sm:inline" />
            <span className="text-blue-400">끝까지 완주할 수 있도록</span> 함께합니다.
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl font-normal">
            출석수업 및 과제 가이드, 100% 투명한 학생회비 결산, 학술 스터디 지원, 생생한 학과 활동까지 학생회가 든든한 동반자가 되겠습니다.
          </p>
        </div>
      </div>
    </section>
  );
};
