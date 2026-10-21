import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { auth } from '../services/auth';
import { isSupabaseConfigured } from '../lib/supabase';
import type { Notice, AcademicEvent, CouncilMember, StudyGroup, StudyStatus, MeetingMinute } from '../lib/types';
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
  RotateCcw,
  BookOpen,
  FileText
} from 'lucide-react';

export const AdminPage: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(auth.isAdmin());
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  // Active Tab: 'notices' | 'events' | 'studies' | 'council' | 'minutes' | 'backup'
  const [activeTab, setActiveTab] = useState<'notices' | 'events' | 'studies' | 'council' | 'minutes' | 'backup'>('notices');

  // Data states
  const [notices, setNotices] = useState<Notice[]>([]);
  const [events, setEvents] = useState<AcademicEvent[]>([]);
  const [studies, setStudies] = useState<StudyGroup[]>([]);
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
    category: '학생회' as '필독' | '학생회' | '학사' | '행사' | '결산' | '회의록',
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

  // Study Modals
  const [isStudyModalOpen, setIsStudyModalOpen] = useState(false);
  const [editingStudyId, setEditingStudyId] = useState<string | null>(null);
  const [studyForm, setStudyForm] = useState({
    title: '',
    subject: '',
    status: '모집중' as StudyStatus,
    members_count: 1,
    max_members: 8,
    target_grade: '전학년',
    meeting_type: '온/오프라인 병행' as '온라인 (Zoom/Discord)' | '오프라인 (광주지역대학)' | '온/오프라인 병행',
    leader: '',
    leader_contact: '',
    description: ''
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

  // Governance States
  const [minutes, setMeetingMinutes] = useState<MeetingMinute[]>([]);
  const [isMinuteModalOpen, setIsMinuteModalOpen] = useState(false);
  const [minuteForm, setMinuteForm] = useState({
    title: '',
    meeting_type: '정기임원회의' as '정기임원회의' | '개강총회' | '종강총회' | '임시회의',
    meeting_date: new Date().toISOString().split('T')[0],
    attendees: '학생회장, 부회장, 총무부장, 기획부장, 학술부장',
    agenda: '',
    content: '',
    decisions: ''
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
    const [nData, eData, sData, iData, mData, minData] = await Promise.all([
      api.getNotices(),
      api.getEvents(),
      api.getStudies(),
      api.getCouncilIntro(),
      api.getCouncilMembers(),
      api.getMeetingMinutes()
    ]);
    setNotices(nData);
    setEvents(eData);
    setStudies(sData);
    setCouncilIntro(iData);
    setCouncilMembers(mData);
    setMeetingMinutes(minData);
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
  // Study Group CRUD & Status Management
  // ==========================================
  const openNewStudyModal = () => {
    setEditingStudyId(null);
    setStudyForm({
      title: '',
      subject: '',
      status: '모집중',
      members_count: 1,
      max_members: 8,
      target_grade: '전학년',
      meeting_type: '온/오프라인 병행',
      leader: '',
      leader_contact: '',
      description: ''
    });
    setIsStudyModalOpen(true);
  };

  const openEditStudyModal = (study: StudyGroup) => {
    setEditingStudyId(study.id);
    setStudyForm({
      title: study.title,
      subject: study.subject,
      status: study.status,
      members_count: study.members_count,
      max_members: study.max_members,
      target_grade: study.target_grade,
      meeting_type: study.meeting_type,
      leader: study.leader,
      leader_contact: study.leader_contact || '',
      description: study.description || ''
    });
    setIsStudyModalOpen(true);
  };

  const handleSaveStudy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studyForm.title.trim() || !studyForm.subject.trim()) {
      alert('스터디 제목과 주제를 모두 입력해 주세요.');
      return;
    }

    if (editingStudyId) {
      await api.updateStudy(editingStudyId, studyForm);
    } else {
      await api.createStudy(studyForm);
    }

    setIsStudyModalOpen(false);
    loadAllData();
  };

  const handleQuickStatusChange = async (studyId: string, newStatus: StudyStatus) => {
    await api.updateStudy(studyId, { status: newStatus });
    loadAllData();
  };

  const handleDeleteStudy = async (id: string, title: string) => {
    if (confirm(`"${title}" 스터디 그룹을 정말 삭제(해체)하시겠습니까?\n홈페이지에서 즉시 내려갑니다.`)) {
      await api.deleteStudy(id);
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
  // Governance Minutes & Rental Handlers
  // ==========================================
  const openNewMinuteModal = () => {
    setMinuteForm({
      title: '',
      meeting_type: '정기임원회의',
      meeting_date: new Date().toISOString().split('T')[0],
      attendees: '학생회장, 부회장, 총무부장, 기획부장, 학술부장',
      agenda: '',
      content: '',
      decisions: ''
    });
    setIsMinuteModalOpen(true);
  };

  const handleSaveMinute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!minuteForm.title.trim() || !minuteForm.decisions.trim()) {
      alert('회의 제목과 의결 사항을 입력해 주세요.');
      return;
    }
    await api.createMeetingMinute(minuteForm);
    setIsMinuteModalOpen(false);
    loadAllData();
  };

  const handleDeleteMinute = async (id: string, title: string) => {
    if (confirm(`"${title}" 회의록을 삭제하시겠습니까?`)) {
      await api.deleteMeetingMinute(id);
      loadAllData();
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
            공지사항, 학사일정, 스터디, 임원 정보 관리를 위해 비밀번호를 입력해주세요.
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
            코딩이나 배포 과정 없이, 마우스 클릭과 입력만으로 공지사항, 학사일정, 스터디 그룹, 임원진 정보를 실시간으로 관리합니다.
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
          onClick={() => setActiveTab('studies')}
          className={`px-5 py-3 text-sm font-semibold rounded-t-xl transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'studies'
              ? 'bg-white text-blue-700 border-t-2 border-x border-blue-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
          }`}
        >
          <BookOpen className="w-4 h-4 text-teal-600" />
          스터디 그룹 관리 ({studies.length})
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
          onClick={() => setActiveTab('minutes')}
          className={`px-5 py-3 text-sm font-semibold rounded-t-xl transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'minutes'
              ? 'bg-white text-blue-700 border-t-2 border-x border-blue-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
          }`}
        >
          <FileText className="w-4 h-4 text-purple-600" />
          자치 회의록 관리 ({minutes.length})
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
          데이터 백업 & 설정
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
      {/* TAB 3: Study Groups Management (NEW)       */}
      {/* ========================================== */}
      {activeTab === 'studies' && (
        <div className="space-y-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900">스터디 그룹 관리</h2>
              <p className="text-xs text-slate-500">
                스터디 상태(모집중/진행중/마감/종료)를 변경하거나, 없어진 스터디를 삭제 및 신규 개설합니다.
              </p>
            </div>
            <button
              onClick={openNewStudyModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-sm transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              새 스터디 등록
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {studies.map((s) => (
              <div key={s.id} className="py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Status Pill */}
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        s.status === '모집중'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : s.status === '진행중'
                          ? 'bg-blue-100 text-blue-800 border border-blue-300'
                          : 'bg-slate-100 text-slate-600 border border-slate-300'
                      }`}
                    >
                      {s.status}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      인원: {s.members_count} / {s.max_members}명
                    </span>
                    <span className="text-xs text-slate-400">대상: {s.target_grade}</span>
                    <span className="text-xs text-slate-400">진행: {s.meeting_type}</span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">{s.title}</h3>
                  <p className="text-xs text-teal-700 font-medium">주제: {s.subject}</p>
                  <p className="text-xs text-slate-500">
                    개설자: <span className="font-semibold text-slate-700">{s.leader}</span>
                    {s.leader_contact && ` (${s.leader_contact})`}
                  </p>
                </div>

                {/* Quick Status Toggles & Actions */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {/* Quick Status Dropdown */}
                  <select
                    value={s.status}
                    onChange={(e) => handleQuickStatusChange(s.id, e.target.value as StudyStatus)}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium bg-slate-50 hover:bg-white transition-colors"
                  >
                    <option value="모집중">상태: 모집중</option>
                    <option value="진행중">상태: 진행중</option>
                    <option value="마감">상태: 마감</option>
                    <option value="종료">상태: 종료</option>
                  </select>

                  <button
                    onClick={() => openEditStudyModal(s)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-700 text-xs font-semibold transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    수정
                  </button>
                  <button
                    onClick={() => handleDeleteStudy(s.id, s.title)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    삭제(해체)
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* TAB 4: Council Intro & Members             */}
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
      {/* TAB 5: Backup & Password Settings          */}
      {/* ========================================== */}
      {activeTab === 'backup' && (
        <div className="space-y-6">
          {/* Backup & Restore */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-lg font-bold text-slate-900">데이터 백업 및 인수인계</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              임기 만료 시 다음 학생회에 데이터를 안전하게 전달하거나, 데이터 유실을 방지하기 위해 전체 공지사항, 학사일정, 스터디, 임원 목록을 하나의 파일로 저장하고 복원할 수 있습니다.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-5 rounded-2xl bg-blue-50 border border-blue-200 space-y-3">
                <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
                  <Download className="w-4 h-4 text-blue-600" />
                  전체 데이터 백업 다운로드
                </div>
                <p className="text-xs text-blue-700">
                  현재 등록된 모든 공지사항, 일정, 스터디, 인사말, 임원 정보를 안전한 JSON 파일로 즉시 다운로드합니다.
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
      {/* TAB 5: Minutes Management (회의록 관리)     */}
      {/* ========================================== */}
      {activeTab === 'minutes' && (
        <div className="space-y-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900">학생 자치 회의록 관리</h2>
              <p className="text-xs text-slate-500">
                정기임원회의, 개강총회, 종강총회 의결 내용을 기록하고 학우들에게 투명하게 공개합니다.
              </p>
            </div>
            <button
              onClick={openNewMinuteModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-sm transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              새 회의록 작성
            </button>
          </div>

          <div className="space-y-4">
            {minutes.map((m) => (
              <div
                key={m.id}
                className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-purple-300 transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800">
                      {m.meeting_type}
                    </span>
                    <span className="text-xs text-slate-500">{m.meeting_date}</span>
                    <span className="text-xs text-slate-400">• 참석: {m.attendees}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">{m.title}</h3>
                  <div className="bg-white p-3 rounded-xl border border-slate-100 text-xs text-slate-600 space-y-1">
                    <p><span className="font-semibold text-slate-700">안건:</span> {m.agenda}</p>
                    <p><span className="font-semibold text-purple-700">의결 결과:</span> {m.decisions}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-start">
                  <button
                    onClick={() => handleDeleteMinute(m.id, m.title)}
                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                    title="회의록 삭제"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
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
                  <option value="결산">결산보고</option>
                  <option value="회의록">회의록</option>
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
      {/* Study Modal (Write / Edit) (NEW)           */}
      {/* ========================================== */}
      {isStudyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 p-6 sm:p-8 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-base text-slate-900">
                {editingStudyId ? '스터디 그룹 수정' : '새 스터디 그룹 등록'}
              </h3>
              <button
                onClick={() => setIsStudyModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudy} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">스터디 명칭</label>
                <input
                  type="text"
                  required
                  value={studyForm.title}
                  onChange={(e) => setStudyForm({ ...studyForm, title: e.target.value })}
                  placeholder="예: 2학기 자료구조 & 알고리즘 집중반"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">학습 주제 / 목표 교과목</label>
                <input
                  type="text"
                  required
                  value={studyForm.subject}
                  onChange={(e) => setStudyForm({ ...studyForm, subject: e.target.value })}
                  placeholder="예: 자료구조 교재 정독 및 백준 실습"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">모집/진행 상태</label>
                  <select
                    value={studyForm.status}
                    onChange={(e) => setStudyForm({ ...studyForm, status: e.target.value as StudyStatus })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50"
                  >
                    <option value="모집중">모집중</option>
                    <option value="진행중">진행중</option>
                    <option value="마감">마감</option>
                    <option value="종료">종료</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">진행 방식</label>
                  <select
                    value={studyForm.meeting_type}
                    onChange={(e) => setStudyForm({ ...studyForm, meeting_type: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50"
                  >
                    <option value="온/오프라인 병행">온/오프라인 병행</option>
                    <option value="온라인 (Zoom/Discord)">온라인 (Zoom/Discord)</option>
                    <option value="오프라인 (광주지역대학)">오프라인 (광주지역대학)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">현재 인원</label>
                  <input
                    type="number"
                    min={1}
                    value={studyForm.members_count}
                    onChange={(e) => setStudyForm({ ...studyForm, members_count: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">모집 정원</label>
                  <input
                    type="number"
                    min={2}
                    value={studyForm.max_members}
                    onChange={(e) => setStudyForm({ ...studyForm, max_members: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">대상 학년</label>
                  <input
                    type="text"
                    value={studyForm.target_grade}
                    onChange={(e) => setStudyForm({ ...studyForm, target_grade: e.target.value })}
                    placeholder="예: 2~3학년"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">개설자 성명(소속)</label>
                  <input
                    type="text"
                    required
                    value={studyForm.leader}
                    onChange={(e) => setStudyForm({ ...studyForm, leader: e.target.value })}
                    placeholder="예: 홍길동 (3학년)"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">연락처 / 단톡 링크</label>
                  <input
                    type="text"
                    value={studyForm.leader_contact}
                    onChange={(e) => setStudyForm({ ...studyForm, leader_contact: e.target.value })}
                    placeholder="오픈카톡 링크 또는 이메일"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsStudyModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-semibold"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-700"
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

      {/* ========================================== */}
      {/* Meeting Minute Modal (New)                 */}
      {/* ========================================== */}
      {isMinuteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 p-6 sm:p-8 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-base text-slate-900">새 회의록 작성 및 등록</h3>
              <button
                onClick={() => setIsMinuteModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMinute} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">회의 구분</label>
                  <select
                    value={minuteForm.meeting_type}
                    onChange={(e) => setMinuteForm({ ...minuteForm, meeting_type: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50"
                  >
                    <option value="정기임원회의">정기임원회의</option>
                    <option value="개강총회">개강총회</option>
                    <option value="종강총회">종강총회</option>
                    <option value="임시회의">임시회의</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">회의 일자</label>
                  <input
                    type="date"
                    required
                    value={minuteForm.meeting_date}
                    onChange={(e) => setMinuteForm({ ...minuteForm, meeting_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">회의 명칭 (제목)</label>
                <input
                  type="text"
                  required
                  value={minuteForm.title}
                  onChange={(e) => setMinuteForm({ ...minuteForm, title: e.target.value })}
                  placeholder="예: 2026학년도 2학기 제2차 정기 임원회의록"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">참석 임원 및 학우</label>
                <input
                  type="text"
                  value={minuteForm.attendees}
                  onChange={(e) => setMinuteForm({ ...minuteForm, attendees: e.target.value })}
                  placeholder="예: 학생회장, 부회장, 총무부장, 학술부장 외 15명"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">주요 안건</label>
                <input
                  type="text"
                  value={minuteForm.agenda}
                  onChange={(e) => setMinuteForm({ ...minuteForm, agenda: e.target.value })}
                  placeholder="예: 2학기 출석수업 간식 지원의 건, 2차 예산 집행 승인"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">논의 내용 요약</label>
                <textarea
                  rows={3}
                  value={minuteForm.content}
                  onChange={(e) => setMinuteForm({ ...minuteForm, content: e.target.value })}
                  placeholder="회의에서 논의된 주요 내용을 요약하세요..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">의결 및 결정 사항 *</label>
                <textarea
                  rows={2}
                  required
                  value={minuteForm.decisions}
                  onChange={(e) => setMinuteForm({ ...minuteForm, decisions: e.target.value })}
                  placeholder="예: 재적인원 전원 찬성으로 원안 가결. 간식 예산 250,000원 배정 완료."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsMinuteModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-semibold"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 text-white font-semibold hover:bg-purple-700"
                >
                  회의록 저장
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
