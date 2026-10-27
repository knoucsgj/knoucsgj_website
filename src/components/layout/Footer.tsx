import React from 'react';
import { ExternalLink, Mail, MapPin, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ASSETS } from '../../lib/assets';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Column 1 & 2: Council Identity */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3.5">
              <div className="bg-white px-3.5 py-1.5 rounded-xl border border-slate-700/60 inline-flex items-center shrink-0 shadow-xs">
                <img
                  src={ASSETS.UI.gwangjuJeonnam}
                  alt="한국방송통신대학교 광주전남지역대학"
                  className="h-8 sm:h-9 w-auto object-contain"
                />
              </div>
              <div>
                <h3 className="font-knou text-white font-bold text-base tracking-tight">
                  컴퓨터과학과 학생회
                </h3>
                <p className="text-slate-400 text-xs">한국방송통신대학교 광주전남지역대학</p>
              </div>
            </div>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-lg">
              일과 학업을 병행하는 컴퓨터과학과 학우 여러분들의 든든한 학업 동반자입니다.
              중도 포기 없는 전원 완주와 도약을 위해 학생회가 언제나 함께하겠습니다.
            </p>

            <div className="pt-2 text-sm text-slate-300 space-y-2">
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
                <span>학생회 주소: 전남광주통합특별시 광산구 첨단내촌로 6, 103호</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                <span>학생회 공식 이메일: knoucsgj@gmail.com</span>
              </div>
            </div>
          </div>

          {/* Column 3: Quick University Links */}
          <div>
            <h4 className="text-white font-bold text-sm tracking-wider uppercase mb-3.5">
              주요 포털 바로가기
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-300">
              <li>
                <a
                  href="https://www.knou.ac.kr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-2"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  한국방송통신대학교
                </a>
              </li>
              <li>
                <a
                  href="https://wgwangju.knou.ac.kr/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-2"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  광주전남지역대학
                </a>
              </li>
              <li>
                <a
                  href="https://cs.knou.ac.kr/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-2"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  컴퓨터과학과
                </a>
              </li>
              <li>
                <a
                  href="https://library.knou.ac.kr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-2"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  중앙도서관
                </a>
              </li>
              <li>
                <a
                  href="https://m.knou.ac.kr/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-2"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                  MyKNOU 학사정보 시스템
                </a>
              </li>
              <li>
                <a
                  href="https://ucampus.knou.ac.kr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-2"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  U-KNOU 캠퍼스
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: KakaoTalk Open Chat */}
          <div>
            <h4 className="text-white font-bold text-sm tracking-wider uppercase mb-3.5 flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-amber-400" />
              카카오톡 오픈채팅방
            </h4>
            <div className="space-y-3">
              <div className="bg-white p-2.5 rounded-2xl inline-block shadow-sm">
                <img
                  src={ASSETS.openchat.qrCode}
                  alt="카카오톡 오픈채팅방 QR코드"
                  className="w-32 h-32 sm:w-36 sm:h-36 object-contain rounded-xl"
                />
              </div>
              <p className="text-xs text-slate-400 leading-relaxed max-w-[220px]">
                스마트폰 카메라로 QR코드를 스캔하시면 컴퓨터과학과 공식 오픈채팅방으로 바로 연결됩니다.
              </p>
            </div>
          </div>
        </div>

        <div className="pb-4 text-xs sm:text-sm flex items-center justify-between">
          <Link to="/privacy" className="font-bold text-white hover:underline">
            개인정보 처리방침 및 이용약관
          </Link>
          <Link to="/admin" className="text-slate-500 hover:text-slate-300 text-xs">
            학생회 관리자 로그인
          </Link>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs sm:text-sm text-slate-400 gap-3">
          <p>© 2026 한국방송통신대학교 광주전남지역대학 컴퓨터과학과 학생회. All rights reserved.</p>
          <div className="text-slate-400 text-xs sm:text-sm">
            전남광주통합특별시 광산구 첨단내촌로 6, 103호 | 공식 이메일: knoucsgj@gmail.com
          </div>
        </div>
      </div>
    </footer>
  );
};
