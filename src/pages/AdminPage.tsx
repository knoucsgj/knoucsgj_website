import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { auth } from '../services/auth';
import { isSupabaseConfigured } from '../lib/supabase';
import type { Notice, AcademicEvent, CouncilMember } from '../lib/types';
import { formatDate } from '../lib/dateUtils';
import {
  Shield,
  Lock,
  LogOut,
  Bell,
  Calendar,
  Users,
  Download,
  Upload,
  Key,
  PlusCircle,
  Pencil,
  Trash2,
  AlertCircle,
  ExternalLink,
  X,
  Pin,
  Save,
  RotateCcw
} from 'lucide-react';

export const AdminPage: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(auth.isAdmin());
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  // Active Tab: 'notices' | 'events' | 'council' | 'backup'
  const [activeTab, setActiveTab] = useState<'notices' | 'events' | 'council' | 'backup'>('notices');

  // Data states
  const [notices, setNotices] = useState<Notice[]>([]);
  const [events, setEvents] = useState<AcademicEvent[]>([]);
  const [councilIntro, setCouncilIntro] = useState({
    title: '',
    president_greeting: '',
    president_name: '',
    president_role: ''
  });
  const [councilMembers, setCouncilMembers] = useState<CouncilMember[]>([]);

  // Notice Modals
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [editingNoticeId, setEditingNoticeId] = useState<string | null>(null);
  const [noticeForm, setNoticeForm] = useState({
    title: '',
    content: '',
    category: '학생회' as '필독' | '학생회' | '학사' | '행사',
    author: '학생회',
    is_pinned: false
  });

  // Event Modals
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [eventForm, setEventForm] = useState({
    title: '',
    start_date: '2026-10-15',
    end_date: '2026-10-25',
    category: '과제' as '출석수업' | '시험' | '과제' | '등록/수강' | '행사',
    description: '',
    target_grades: '전학년',
    is_important: false
  });

  // Council Member Modals
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [memberForm, setMemberForm] = useState({
    role: '학생회장',
    name: '',
    grade_info: '컴퓨터과학과 3학년',
    message: '',
    email: ''
  });

  // Password change state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [pwChangeMessage, setPwChangeMessage] = useState<{ isError: boolean; text: string } | null>(null);

  useEffect(() => {
    if (isAdmin) {
      loadAllData();
    }
  }, [isAdmin]);

  const loadAllData = async () => {
    const [nData, eData, iData, mData] = await Promise.all([
      api.getNotices(),
      api.getEvents(),
      api.getCouncilIntro(),
      api.getCouncilMembers()
    ]);
    setNotices(nData);
    setEvents(eData);
    setCouncilIntro(iData);
    setCouncilMembers(mData);
  };

  // Login handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (auth.login(passwordInput)) {
      setIsAdmin(true);
      setLoginError('');
      setPasswordInput('');
    } else {
      setLoginError('비밀번호가 올바르지 않습니다.');
    }
  };

  const handleLogout = () => {
    auth.logout();
    setIsAdmin(false);
  };

  // ==========================================
  // Notice CRUD
  // ==========================================
  const openNewNoticeModal = () => {
    setEditingNoticeId(null);
    setNoticeForm({
      title: '',
      content: '',
      category: '학생회',
      author: '학생회',
      is_pinned: false
    });
    setIsNoticeModalOpen(true);
  };

  const openEditNoticeModal = (notice: Notice) => {
    setEditingNoticeId(notice.id);
    setNoticeForm({
      title: notice.title,
      content: notice.content,
      category: notice.category,
      author: notice.author,
      is_pinned: Boolean(notice.is_pinned)
    });
    setIsNoticeModalOpen(true);
  };

  const handleSaveNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeForm.title.trim() || !noticeForm.content.trim()) {
      alert('제목과 내용을 모두 입력해 주세요.');
      return;
    }

    if (editingNoticeId) {
      await api.updateNotice(editingNoticeId, noticeForm);
    } else {
      await api.createNotice(noticeForm);
    }

    setIsNoticeModalOpen(false);
    loadAllData();
  };

  const handleDeleteNotice = async (id: string, title: string) => {
    if (confirm(`"${title}" 공지사항을 정말 삭제하시겠습니까?`)) {
      await api.deleteNotice(id);
      loadAllData();
    }
  };

  // ==========================================
  // Event CRUD
  // ==========================================
  const openNewEventModal = () => {
    setEditingEventId(null);
    setEventForm({
      title: '',
      start_date: '2026-10-15',
      end_date: '2026-10-25',
      category: '과제',
      description: '',
      target_grades: '전학년',
      is_important: false
    });
    setIsEventModalOpen(true);
  };

  const openEditEventModal = (event: AcademicEvent) => {
    setEditingEventId(event.id);
    setEventForm({
      title: event.title,
      start_date: event.start_date,
      end_date: event.end_date,
      category: event.category,
      description: event.description,
      target_grades: event.target_grades,
      is_important: Boolean(event.is_important)
    });
    setIsEventModalOpen(true);
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventForm.title.trim()) {
      alert('일정명을 입력해 주세요.');
      return;
    }

    if (editingEventId) {
      await api.updateEvent(editingEventId, eventForm);
    } else {
      await api.createEvent(eventForm);
    }

    setIsEventModalOpen(false);
    loadAllData();
  };

  const handleDeleteEvent = async (id: string, title: string) => {
    if (confirm(`"${title}" 일정을 정말 삭제하시겠습니까?`)) {
      await api.deleteEvent(id);
      loadAllData();
    }
  };

  // ==========================================
  // Council CRUD
  // ==========================================
  const handleSaveCouncilIntro = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.updateCouncilIntro(councilIntro);
    alert('학생회 인사말이 성공적으로 저장되었습니다!');
  };

  const openNewMemberModal = () => {
    setEditingMemberId(null);
    setMemberForm({
      role: '학생회장',
      name: '',
      grade_info: '컴퓨터과학과 3학년',
      message: '',
      email: ''
    });
    setIsMemberModalOpen(true);
  };

  const openEditMemberModal = (member: CouncilMember) => {
    setEditingMemberId(member.id);
    setMemberForm({
      role: member.role,
      name: member.name,
      grade_info: member.grade_info,
      message: member.message,
      email: member.email || ''
    });
    setIsMemberModalOpen(true);
  };

  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberForm.name.trim()) {
      alert('이름을 입력해 주세요.');
      return;
    }

    if (editingMemberId) {
      await api.updateCouncilMember(editingMemberId, memberForm);
    } else {
      await api.createCouncilMember(memberForm);
    }

    setIsMemberModalOpen(false);
    loadAllData();
  };

  const handleDeleteMember = async (id: string, name: string) => {
    if (confirm(`"${name}" 임원 정보를 정말 삭제하시겠습니까?`)) {
      await api.deleteCouncilMember(id);
      loadAllData();
    }
  };

  // ==========================================
  // Backup & Restore
  // ==========================================
  const handleExportBackup = async () => {
    const jsonStr = await api.exportAllData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `knou_cs_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      const res = await api.importAllData(content);
      if (res.success) {
        alert(res.message);
        loadAllData();
      } else {
        alert(res.message);
      }
    };
    reader.readAsText(file);
  };

  const handleResetDefaults = async () => {
    if (confirm('모든 데이터를 초기 기본값으로 리셋하시겠습니까? (직접 추가한 데이터가 삭제됩니다)')) {
      await api.resetToDefaults();
      alert('기본 데이터로 리셋되었습니다.');
      loadAllData();
    }
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    const result = auth.changePassword(oldPassword, newPassword);
    setPwChangeMessage({ isError: !result.success, text: result.message });
    if (result.success) {
      setOldPassword('');
      setNewPassword('');
    }
  };

  // ==========================================
  // Login Gate
  // ==========================================
  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-slate-200 shadow-xl text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center">
          <Shield className="w-8 h-8" />
        </div>

        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">학생회 관리자 모드</h1>
          <p className="text-xs text-slate-500 mt-1">
            공지사항, 학사일정, 임원 정보 관리를 위해 비밀번호를 입력해주세요.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              관리자 비밀번호
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="비밀번호 입력..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {loginError && (
              <p className="text-xs text-rose-600 mt-1.5 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                {loginError}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all shadow-md active:scale-95"
          >
            관리자 로그인
          </button>
        </form>

        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-500 space-y-1">
          <div className="font-semibold text-slate-700">💡 초기 기본 비밀번호 안내:</div>
          <div className="font-mono text-blue-600 font-bold bg-white py-1 px-2 rounded-lg border border-slate-200 inline-block">
            {auth.getDefaultPasswordHint()}
          </div>
          <p className="text-[11px] text-slate-400">
            (로그인 후 관리자 센터에서 언제든 비밀번호를 변경할 수 있습니다)
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // Logged-in Dashboard
  // ==========================================
  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              관리자 모드 활성화됨
            </span>
            <span className="text-xs text-slate-400">
              {isSupabaseConfigured ? '• Supabase 실시간 클라우드 DB 연동' : '• 브라우저 로컬 저장소 모드'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            학생회 웹사이트 관리자 센터
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
            코딩이나 배포 과정 없이, 마우스 클릭과 입력만으로 공지사항, 학사일정, 임원진 정보를 실시간으로 수정합니다.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-center">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            홈페이지 보기
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-rose-950 text-rose-300 hover:bg-rose-900 transition-colors border border-rose-800"
          >
            <LogOut className="w-3.5 h-3.5" />
            로그아웃
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200 overflow-x-auto pb-px gap-2">
        <button
          onClick={() => setActiveTab('notices')}
          className={`px-5 py-3 text-sm font-semibold rounded-t-xl transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'notices'
              ? 'bg-white text-blue-700 border-t-2 border-x border-blue-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
          }`}
        >
          <Bell className="w-4 h-4 text-blue-600" />
          공지사항 관리 ({notices.length})
        </button>
        <button
          onClick={() => setActiveTab('events')}
          className={`px-5 py-3 text-sm font-semibold rounded-t-xl transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'events'
              ? 'bg-white text-blue-700 border-t-2 border-x border-blue-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
          }`}
        >
          <Calendar className="w-4 h-4 text-indigo-600" />
          학사일정 관리 ({events.length})
        </button>
        <button
          onClick={() => setActiveTab('council')}
          className={`px-5 py-3 text-sm font-semibold rounded-t-xl transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'council'
              ? 'bg-white text-blue-700 border-t-2 border-x border-blue-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
          }`}
        >
          <Users className="w-4 h-4 text-emerald-600" />
          인사말 & 임원진 관리
        </button>
        <button
          onClick={() => setActiveTab('backup')}
          className={`px-5 py-3 text-sm font-semibold rounded-t-xl transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'backup'
              ? 'bg-white text-blue-700 border-t-2 border-x border-blue-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
          }`}
        >
          <Key className="w-4 h-4 text-amber-500" />
          데이터 백업 & 비밀번호 설정
        </button>
      </div>

      {/* ========================================== */}
      {/* TAB 1: Notices Management                  */}
      {/* ========================================== */}
      {activeTab === 'notices' && (
        <div className="space-y-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900">공지사항 관리 목록</h2>
              <p className="text-xs text-slate-500">
                새로운 공지를 등록하거나 기존 공지를 수정/삭제할 수 있습니다.
              </p>
            </div>
            <button
              onClick={openNewNoticeModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              새 공지 작성
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {notices.map((n) => (
              <div key={n.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {n.is_pinned && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-600 text-white flex items-center gap-1">
                        <Pin className="w-3 h-3" />
                        고정
                      </span>
                    )}
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                      {n.category}
                    </span>
                    <span className="text-xs text-slate-400">{formatDate(n.created_at)}</span>
                    <span className="text-xs text-slate-400">작성자: {n.author}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{n.title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-1">{n.content}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => openEditNoticeModal(n)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-xs font-semibold transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    수정
                  </button>
                  <button
                    onClick={() => handleDeleteNotice(n.id, n.title)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* TAB 2: Academic Events Management          */}
      {/* ========================================== */}
      {activeTab === 'events' && (
        <div className="space-y-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900">학사일정 관리 목록</h2>
              <p className="text-xs text-slate-500">
                출석수업, 기말시험, 과제 마감일 등의 일정을 추가/수정/삭제합니다.
              </p>
            </div>
            <button
              onClick={openNewEventModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              새 일정 추가
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {events.map((ev) => (
              <div key={ev.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {ev.category}
                    </span>
                    <span className="text-xs text-slate-500">
                      기간: {ev.start_date} ~ {ev.end_date}
                    </span>
                    <span className="text-xs text-slate-400">대상: {ev.target_grades}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{ev.title}</h3>
                  {ev.description && (
                    <p className="text-xs text-slate-500">{ev.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => openEditEventModal(ev)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 text-xs font-semibold transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    수정
                  </button>
                  <button
                    onClick={() => handleDeleteEvent(ev.id, ev.title)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* TAB 3: Council Intro & Members             */}
      {/* ========================================== */}
      {activeTab === 'council' && (
        <div className="space-y-8">
          {/* President Greeting Editor */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">학생회장 인사말 수정</h2>
              <span className="text-xs text-slate-400">소개 페이지 상단에 노출되는 메시지</span>
            </div>

            <form onSubmit={handleSaveCouncilIntro} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">인사말 제목</label>
                <input
                  type="text"
                  required
                  value={councilIntro.title}
                  onChange={(e) => setCouncilIntro({ ...councilIntro, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">인사말 본문 내용</label>
                <textarea
                  rows={8}
                  required
                  value={councilIntro.president_greeting}
                  onChange={(e) => setCouncilIntro({ ...councilIntro, president_greeting: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs leading-relaxed focus:ring-2 focus:ring-blue-500 font-sans"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition-all"
                >
                  <Save className="w-4 h-4" />
                  인사말 저장하기
                </button>
              </div>
            </form>
          </div>

          {/* Council Members List */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900">학생회 임원진 목록</h2>
                <p className="text-xs text-slate-500">학생회장, 부회장, 부장 등 임원 정보를 관리합니다.</p>
              </div>
              <button
                onClick={openNewMemberModal}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                임원 추가
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {councilMembers.map((m) => (
                <div key={m.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                  <div className="space-y-1 mb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        {m.role}
                      </span>
                      <span className="text-xs text-slate-400">{m.grade_info}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">{m.name}</h3>
                    <p className="text-xs text-slate-600 line-clamp-2">"{m.message}"</p>
                    {m.email && <p className="text-[11px] text-slate-400">{m.email}</p>}
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                    <button
                      onClick={() => openEditMemberModal(m)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white text-slate-700 text-xs font-medium border border-slate-200 hover:bg-slate-100"
                    >
                      <Pencil className="w-3 h-3" />
                      수정
                    </button>
                    <button
                      onClick={() => handleDeleteMember(m.id, m.name)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-rose-50 text-rose-700 text-xs font-medium border border-rose-200 hover:bg-rose-100"
                    >
                      <Trash2 className="w-3 h-3" />
                      삭제
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* TAB 4: Backup & Password Settings          */}
      {/* ========================================== */}
      {activeTab === 'backup' && (
        <div className="space-y-6">
          {/* Backup & Restore */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-lg font-bold text-slate-900">데이터 백업 및 인수인계</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              임기 만료 시 다음 학생회에 데이터를 안전하게 전달하거나, 데이터 유실을 방지하기 위해 전체 공지사항, 학사일정, 임원 목록을 하나의 파일로 저장하고 복원할 수 있습니다.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-5 rounded-2xl bg-blue-50 border border-blue-200 space-y-3">
                <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
                  <Download className="w-4 h-4 text-blue-600" />
                  전체 데이터 백업 다운로드
                </div>
                <p className="text-xs text-blue-700">
                  현재 등록된 모든 공지사항, 일정, 인사말, 임원 정보를 안전한 JSON 파일로 즉시 다운로드합니다.
                </p>
                <button
                  onClick={handleExportBackup}
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition-all"
                >
                  백업 파일 다운로드 (.json)
                </button>
              </div>

              <div className="p-5 rounded-2xl bg-indigo-50 border border-indigo-200 space-y-3">
                <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm">
                  <Upload className="w-4 h-4 text-indigo-600" />
                  백업 파일로 복원하기
                </div>
                <p className="text-xs text-indigo-700">
                  기존에 다운로드해 둔 백업 파일(.json)을 업로드하면 이전의 모든 데이터가 즉시 복원됩니다.
                </p>
                <label className="block w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs text-center cursor-pointer shadow-sm transition-all">
                  백업 파일 선택하여 복원
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportBackup}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={handleResetDefaults}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                초기 샘플 데이터로 리셋
              </button>
            </div>
          </div>

          {/* Change Admin Password */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4 max-w-lg">
            <h2 className="text-lg font-bold text-slate-900">관리자 비밀번호 변경</h2>
            <p className="text-xs text-slate-500">관리자 센터에 로그인할 때 사용하는 비밀번호를 변경합니다.</p>

            <form onSubmit={handleChangePassword} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">기존 비밀번호</label>
                <input
                  type="password"
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="현재 비밀번호 입력"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">새 비밀번호 (4자 이상)</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="새 비밀번호 입력"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {pwChangeMessage && (
                <p className={`text-xs font-medium ${pwChangeMessage.isError ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {pwChangeMessage.text}
                </p>
              )}

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors"
              >
                비밀번호 변경하기
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* Notice Modal (Write / Edit)                */}
      {/* ========================================== */}
      {isNoticeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 p-6 sm:p-8 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-base text-slate-900">
                {editingNoticeId ? '공지사항 수정' : '새 공지사항 작성'}
              </h3>
              <button
                onClick={() => setIsNoticeModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNotice} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">카테고리</label>
                <select
                  value={noticeForm.category}
                  onChange={(e) => setNoticeForm({ ...noticeForm, category: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="학생회">학생회</option>
                  <option value="필독">필독</option>
                  <option value="학사">학사</option>
                  <option value="행사">행사</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">제목</label>
                <input
                  type="text"
                  required
                  value={noticeForm.title}
                  onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
                  placeholder="공지 제목 입력"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">작성자</label>
                <input
                  type="text"
                  value={noticeForm.author}
                  onChange={(e) => setNoticeForm({ ...noticeForm, author: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">내용</label>
                <textarea
                  rows={6}
                  required
                  value={noticeForm.content}
                  onChange={(e) => setNoticeForm({ ...noticeForm, content: e.target.value })}
                  placeholder="공지 내용을 입력하세요..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="noticePinned"
                  checked={noticeForm.is_pinned}
                  onChange={(e) => setNoticeForm({ ...noticeForm, is_pinned: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="noticePinned" className="text-xs font-medium text-slate-700">
                  게시판 상단 중요 공지로 고정(Pin)하기
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNoticeModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-semibold"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700"
                >
                  저장하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* Event Modal (Write / Edit)                 */}
      {/* ========================================== */}
      {isEventModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 p-6 sm:p-8 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-base text-slate-900">
                {editingEventId ? '학사일정 수정' : '새 학사일정 추가'}
              </h3>
              <button
                onClick={() => setIsEventModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">일정명</label>
                <input
                  type="text"
                  required
                  value={eventForm.title}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                  placeholder="예: 2학기 중간과제물 제출"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">시작일</label>
                  <input
                    type="date"
                    required
                    value={eventForm.start_date}
                    onChange={(e) => setEventForm({ ...eventForm, start_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">종료일</label>
                  <input
                    type="date"
                    required
                    value={eventForm.end_date}
                    onChange={(e) => setEventForm({ ...eventForm, end_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">분류</label>
                  <select
                    value={eventForm.category}
                    onChange={(e) => setEventForm({ ...eventForm, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50"
                  >
                    <option value="과제">과제</option>
                    <option value="출석수업">출석수업</option>
                    <option value="시험">시험</option>
                    <option value="등록/수강">등록/수강</option>
                    <option value="행사">행사</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">대상 학년</label>
                  <input
                    type="text"
                    value={eventForm.target_grades}
                    onChange={(e) => setEventForm({ ...eventForm, target_grades: e.target.value })}
                    placeholder="예: 전학년, 1학년"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">상세 설명</label>
                <textarea
                  rows={3}
                  value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  placeholder="일정에 대한 부가 설명..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEventModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-semibold"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
                >
                  저장하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* Member Modal (Write / Edit)                */}
      {/* ========================================== */}
      {isMemberModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 p-6 sm:p-8 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-base text-slate-900">
                {editingMemberId ? '임원 정보 수정' : '새 임원 등록'}
              </h3>
              <button
                onClick={() => setIsMemberModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMember} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">직책</label>
                  <input
                    type="text"
                    required
                    value={memberForm.role}
                    onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value })}
                    placeholder="예: 학생회장, 총무부장"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">이름</label>
                  <input
                    type="text"
                    required
                    value={memberForm.name}
                    onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                    placeholder="예: 홍길동"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">학년 / 소속</label>
                <input
                  type="text"
                  value={memberForm.grade_info}
                  onChange={(e) => setMemberForm({ ...memberForm, grade_info: e.target.value })}
                  placeholder="예: 컴퓨터과학과 3학년"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">각오 / 소개 한마디</label>
                <textarea
                  rows={3}
                  value={memberForm.message}
                  onChange={(e) => setMemberForm({ ...memberForm, message: e.target.value })}
                  placeholder="학우들에게 전하는 한마디..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">이메일 (선택)</label>
                <input
                  type="email"
                  value={memberForm.email}
                  onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
                  placeholder="email@knou-cs-gj.org"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsMemberModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-semibold"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700"
                >
                  저장하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
