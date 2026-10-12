import React from 'react';
import { ExternalLink, Mail, MapPin, Phone, ShieldCheck, Heart } from 'lucide-react';
import { regionalInfo } from '../../data/mockCouncil';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Column 1: Council Identity */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-extrabold text-sm">
                KNOU
              </div>
              <div>
                <h3 className="text-white font-bold text-base">
                  한국방송통신대학교 광주전남지역대학
                </h3>
                <p className="text-blue-400 text-sm font-medium">컴퓨터과학과 제43대 학생회</p>
              </div>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-lg">
              일과 학업을 병행하는 컴퓨터과학과 학우 여러분들의 든든한 학업 동반자입니다.
              중도 포기 없는 완주와 성장을 위해 학생회가 언제나 함께하겠습니다.
            </p>
            <div className="pt-2 text-xs text-slate-400 space-y-1.5">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
                <span>{regionalInfo.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-400 shrink-0" />
                <span>지역대학 대표: {regionalInfo.tel} / 팩스: {regionalInfo.fax}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                <span>학생회 문의: contact@knou-cs-gj.org</span>
              </div>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
              주요 포털 바로가기
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <a
                  href="https://www.knou.ac.kr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                  한국방송통신대학교 본교
                </a>
              </li>
              <li>
                <a
                  href="https://cs.knou.ac.kr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                  방송대 컴퓨터과학과 본부
                </a>
              </li>
              <li>
                <a
                  href="https://ucampus.knou.ac.kr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                  U-KNOU 캠퍼스 (원격강의)
                </a>
              </li>
              <li>
                <a
                  href="https://gj.knou.ac.kr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                  광주전남지역대학 홈페이지
                </a>
              </li>
              <li>
                <a
                  href="https://library.knou.ac.kr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                  중앙도서관 학술검색
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Tech Info */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              시스템 및 인프라
            </h4>
            <div className="bg-slate-800/80 rounded-xl p-3.5 border border-slate-700/60 text-xs space-y-2">
              <div className="flex justify-between items-center text-slate-300">
                <span>호스팅 인프라</span>
                <span className="font-semibold text-amber-400">Cloudflare Pages</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>데이터베이스</span>
                <span className="font-semibold text-emerald-400">Supabase (PostgreSQL)</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>호스팅 비용</span>
                <span className="font-semibold text-emerald-300">0원 (Free Tier 운영)</span>
              </div>
              <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-700 leading-tight">
                광주전남 컴퓨터과학과 학생회 예산 절감을 위해 서버리스 무료 스택으로 구축되었습니다.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>© 2026 KNOU Computer Science Gwangju-Jeonnam Student Council. All rights reserved.</p>
          <div className="flex items-center gap-1 text-slate-400">
            <span>만든 이: 광주전남 컴퓨터과학과 학우 일동</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline mx-0.5" />
          </div>
        </div>
      </div>
    </footer>
  );
};
