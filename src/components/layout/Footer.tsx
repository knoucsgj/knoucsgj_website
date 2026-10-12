import React from 'react';
import { ExternalLink, Mail, MapPin, Phone, Scale } from 'lucide-react';
import { Link } from 'react-router-dom';
import { regionalInfo } from '../../data/mockCouncil';
import { ASSETS } from '../../lib/assets';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Column 1 & 2: Council Identity */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3.5">
              <div className="bg-white px-3.5 py-2 rounded-2xl border border-slate-700/60 inline-flex items-center shrink-0 shadow-xs">
                <img
                  src={ASSETS.UI.gwangjuJeonnam}
                  alt="한국방송통신대학교 광주전남지역대학"
                  className="h-10 sm:h-11 w-auto object-contain"
                />
              </div>
              <div>
                <h3 className="font-knou text-white font-bold text-base tracking-tight">
                  컴퓨터과학과 제43대 학생회
                </h3>
                <p className="text-slate-400 text-xs">한국방송통신대학교 광주전남지역대학</p>
              </div>
            </div>

            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-lg">
              일과 학업을 병행하는 컴퓨터과학과 학우 여러분들의 든든한 학업 동반자입니다.
              중도 포기 없는 전원 완주와 도약을 위해 학생회가 언제나 함께하겠습니다.
            </p>

            <div className="pt-2 text-xs text-slate-400 space-y-1.5">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>{regionalInfo.address} (학생회실: 본관 405호)</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>지역대학 대표: {regionalInfo.tel} / 팩스: {regionalInfo.fax}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>학생회 공식 이메일: contact@knou-cs-gj.org</span>
              </div>
            </div>
          </div>

          {/* Column 3: Quick University Links */}
          <div>
            <h4 className="text-white font-bold text-xs tracking-wider uppercase mb-3">
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
                  <ExternalLink className="w-3 h-3 text-slate-500" />
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
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                  컴퓨터과학과 학과본부
                </a>
              </li>
              <li>
                <a
                  href="https://ucampus.knou.ac.kr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3 h-3 text-slate-500" />
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
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                  광주전남지역대학
                </a>
              </li>
              <li>
                <a
                  href="https://library.knou.ac.kr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                  중앙도서관 학술검색
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Student Council Links */}
          <div>
            <h4 className="text-white font-bold text-xs tracking-wider uppercase mb-3">
              학생 자치 & 복지
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link to="/governance" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <Scale className="w-3 h-3 text-blue-400" />
                  투명 학생회비 결산 보고
                </Link>
              </li>
              <li>
                <Link to="/governance" className="hover:text-white transition-colors">
                  학과 학생회칙 및 운영세칙
                </Link>
              </li>
              <li>
                <Link to="/welfare" className="hover:text-white transition-colors">
                  학생회실 비품 및 교재 대여
                </Link>
              </li>
              <li>
                <Link to="/welfare" className="hover:text-white transition-colors">
                  학우 제휴 혜택 안내
                </Link>
              </li>
              <li>
                <Link to="/community" className="hover:text-white transition-colors">
                  학술 스터디 & 신·편입생 FAQ
                </Link>
              </li>
              <li className="pt-2">
                <Link to="/admin" className="text-slate-500 hover:text-slate-300 text-[11px] underline">
                  학생회 임원 관리자 로그인
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>© 2026 한국방송통신대학교 광주전남지역대학 컴퓨터과학과 학생회. All rights reserved.</p>
          <div className="text-slate-500 text-[11px]">
            광주광역시 광산구 첨단과기로 208번길 43 (오룡동) 한국방송통신대학교 본관 405호
          </div>
        </div>
      </div>
    </footer>
  );
};
