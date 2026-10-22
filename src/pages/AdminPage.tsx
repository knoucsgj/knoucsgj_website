import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { auth, useAuth } from '../services/auth';
import type { Notice, AcademicEvent, CouncilMember, StudyGroup, StudyStatus, MeetingMinute, AdminMember } from '../lib/types';
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
  FileText,
  Mail,
  CheckCircle2
} from 'lucide-react';

export const AdminPage: React.FC = () => {
  const { isAdmin, member } = useAuth();
  const isPresident = member?.role === 'president';
  const isOfficer = member?.role === 'officer';
  const canAccess = isAdmin || isPresident || isOfficer;
  const canManageMembers = isAdmin || isPresident;

  const [adminIdInput, setAdminIdInput] = useState('admin');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  // Member Role Edit state
  const [editingRoleMember, setEditingRoleMember] = useState<AdminMember | null>(null);
  const [newMemberRole, setNewMemberRole] = useState<AdminMember['role']>('regular');
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);

  // Active Tab: 'notices' | 'events' | 'studies' | 'members' | 'council' | 'minutes' | 'backup'
  const [activeTab, setActiveTab] = useState<'notices' | 'events' | 'studies' | 'members' | 'council' | 'minutes' | 'backup'>('notices');

  // Data states
  const [notices, setNotices] = useState<Notice[]>([]);
  const [events, setEvents] = useState<AcademicEvent[]>([]);
  const [studies, setStudies] = useState<StudyGroup[]>([]);
  const [members, setMembers] = useState<AdminMember[]>([]);
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

  // Email Configuration state
  const [emailConfig, setEmailConfig] = useState({
    provider: 'brevo' as 'brevo' | 'resend' | 'gas',
    api_key: '',
    sender: 'knoucsgj@gmail.com',
    sender_name: '한국방송통신대학교 광주전남 컴퓨터과학과 학생회',
    gas_url: '',
    has_api_key: false,
  });
  const [emailTestTarget, setEmailTestTarget] = useState('');
  const [emailStatusMsg, setEmailStatusMsg] = useState<{ isError: boolean; text: string } | null>(null);
  const [isEmailSaving, setIsEmailSaving] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);

  // Member Nickname Edit state
  const [editingNicknameMember, setEditingNicknameMember] = useState<AdminMember | null>(null);
  const [newMemberNickname, setNewMemberNickname] = useState('');
  const [isUpdatingNickname, setIsUpdatingNickname] = useState(false);

  useEffect(() => {
    const onRejection = (ev: PromiseRejectionEvent) => {
      if (ev.reason instanceof Error) {
        ev.preventDefault();
        alert(ev.reason.message);
      }
    };
    window.addEventListener('unhandledrejection', onRejection);
    return () => window.removeEventListener('unhandledrejection', onRejection);
  }, []);

  useEffect(() => {
    if (canAccess) {
      loadAllData();
    }
  }, [canAccess]);

  useEffect(() => {
    if (!canManageMembers && activeTab === 'members') {
      setActiveTab('notices');
    }
  }, [canManageMembers, activeTab]);

  const loadAllData = async () => {
    const [nData, eData, sData, iData, mData, minData, memberData] = await Promise.all([
      api.getNotices(),
      api.getEvents(),
      api.getStudies(),
      api.getCouncilIntro(),
      api.getCouncilMembers(),
      api.getMeetingMinutes(),
      api.getMembers().catch(() => [] as AdminMember[])
    ]);
    setMembers(memberData);
    setNotices(nData);
    setEvents(eData);
    setStudies(sData);
    setCouncilIntro(iData);
    setCouncilMembers(mData);
    setMeetingMinutes(minData);
    api.getEmailSettings().then((cfg) => {
      setEmailConfig((prev) => ({
        ...prev,
        ...cfg,
        api_key: cfg.has_api_key ? '••••••••••••••••' : '',
      }));
    }).catch(() => {});
  };

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await auth.adminLogin(adminIdInput, passwordInput);
      setLoginError('');
      setPasswordInput('');
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : '비밀번호가 올바르지 않습니다.');
    }
  };

  const handleLogout = async () => {
    await auth.adminLogout();
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

  const handleDeleteNotice = async (id: string, title: string, category?: string) => {
    if ((category === '결산' || category === '회의록') && !isAdmin) {
      alert('결산 및 회의록 공지사항은 최고 관리자(admin)만 삭제할 수 있습니다.');
      return;
    }
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

  const handleStudyApproval = async (studyId: string, approval: 'approved' | 'rejected') => {
    await api.updateStudy(studyId, { approval });
    loadAllData();
  };

  const handleDeleteSiteMember = async (m: AdminMember) => {
    if (!confirm(`'${m.nickname}'(${m.name}) 회원을 강제 탈퇴(개인정보 삭제) 처리하시겠습니까?`)) return;
    await api.deleteMember(m.id);
    loadAllData();
  };

  const handleOpenNicknameModal = (m: AdminMember) => {
    setEditingNicknameMember(m);
    setNewMemberNickname(m.nickname);
  };

  const handleSaveMemberNickname = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNicknameMember || !newMemberNickname.trim()) return;
    try {
      setIsUpdatingNickname(true);
      await api.updateMemberNickname(editingNicknameMember.id, newMemberNickname.trim());
      setMembers((prev) =>
        prev.map((m) => (m.id === editingNicknameMember.id ? { ...m, nickname: newMemberNickname.trim() } : m))
      );
      alert(`[${editingNicknameMember.name}] 학우의 닉네임이 '${newMemberNickname.trim()}'(으)로 변경되었습니다.`);
      setEditingNicknameMember(null);
    } catch (err: any) {
      alert(err.message || '닉네임 변경에 실패했습니다.');
    } finally {
      setIsUpdatingNickname(false);
    }
  };

  const handleOpenRoleModal = (m: AdminMember) => {
    setEditingRoleMember(m);
    setNewMemberRole(m.role || 'associate');
  };

  const handleSaveMemberRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoleMember) return;
    try {
      setIsUpdatingRole(true);
      await api.updateMemberRole(editingRoleMember.id, newMemberRole);
      setMembers((prev) =>
        prev.map((m) => (m.id === editingRoleMember.id ? { ...m, role: newMemberRole } : m))
      );
      const roleNames: Record<AdminMember['role'], string> = {
        president: '학생회장',
        officer: '임원진',
        regular: '정회원',
        associate: '준회원',
      };
      alert(`[${editingRoleMember.name}] 학우의 회원 등급이 '${roleNames[newMemberRole]}'(으)로 변경되었습니다.`);
      setEditingRoleMember(null);
    } catch (err: any) {
      alert(err.message || '등급 변경에 실패했습니다.');
    } finally {
      setIsUpdatingRole(false);
    }
  };

  const handleDownloadMembersCsv = () => {
    const esc = (v: string) => '"' + String(v).replace(/"/g, '""') + '"';
    const roleNames: Record<string, string> = {
      president: '학생회장',
      officer: '임원진',
      regular: '정회원',
      associate: '준회원',
    };
    const header = ['가입일', '회원등급', '아이디', '닉네임', '성명', '연락처', '주소', '학번', '지역대학', '학과'];
    const rows = members.map((m) => [
      m.created_at.split('T')[0],
      roleNames[m.role] || m.role || '준회원',
      m.username,
      m.nickname,
      m.name,
      m.phone,
      m.address,
      m.student_no,
      m.regional_college,
      m.department
    ]);
    const csv = '\uFEFF' + [header, ...rows].map((r) => r.map(esc).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `회원명단_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
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

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await auth.adminChangePassword(oldPassword, newPassword);
    setPwChangeMessage({ isError: !result.success, text: result.message });
    if (result.success) {
      setOldPassword('');
      setNewPassword('');
    }
  };

  const handleSaveEmailConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsEmailSaving(true);
      setEmailStatusMsg(null);
      await api.updateEmailSettings({
        provider: emailConfig.provider,
        api_key: emailConfig.api_key.includes('••••') ? undefined : emailConfig.api_key,
        sender: emailConfig.sender,
        sender_name: emailConfig.sender_name,
        gas_url: emailConfig.gas_url,
      });
      setEmailStatusMsg({ isError: false, text: '이메일 발송 설정이 성공적으로 저장되었습니다.' });
      const refreshed = await api.getEmailSettings();
      setEmailConfig((prev) => ({
        ...prev,
        ...refreshed,
        api_key: refreshed.has_api_key ? '••••••••••••••••' : '',
      }));
    } catch (err: any) {
      setEmailStatusMsg({ isError: true, text: err.message || '저장에 실패했습니다.' });
    } finally {
      setIsEmailSaving(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!emailTestTarget.trim()) {
      alert('테스트 메일을 받을 이메일 주소를 입력해 주세요.');
      return;
    }
    try {
      setIsSendingTest(true);
      setEmailStatusMsg(null);
      const res = await api.sendTestEmail(emailTestTarget.trim());
      setEmailStatusMsg({ isError: false, text: res.message || '테스트 메일이 발송되었습니다!' });
    } catch (err: any) {
      setEmailStatusMsg({ isError: true, text: err.message || '테스트 메일 발송에 실패했습니다.' });
    } finally {
      setIsSendingTest(false);
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
  if (!canAccess) {
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
              관리자 아이디
            </label>
            <div className="relative">
              <Shield className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={adminIdInput}
                onChange={(e) => setAdminIdInput(e.target.value)}
                placeholder="admin"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
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

        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-500">
          관리자 비밀번호는 학생회 임원진만 공유하며, 로그인 후 관리자 센터에서 변경할 수 있습니다.
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
          <div className="flex items-center gap-2 flex-wrap">
            {isAdmin && (
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-400/30">
                최고 관리자 (Master Admin)
              </span>
            )}
            {isPresident && (
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-400/30">
                학생회장: {member?.name} ({member?.nickname})
              </span>
            )}
            {isOfficer && (
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-400/30">
                학생회 임원: {member?.name} ({member?.nickname})
              </span>
            )}
            <span className="text-xs text-slate-400">
              • 관리자 센터
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
        {canManageMembers && (
          <button
            onClick={() => setActiveTab('members')}
            className={`px-5 py-3 text-sm font-semibold rounded-t-xl transition-colors whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'members'
                ? 'bg-white text-blue-700 border-t-2 border-x border-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
            }`}
          >
            <Users className="w-4 h-4 text-rose-600" />
            회원 관리 (${members.length})
          </button>
        )}
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
                  {(n.category === '결산' || n.category === '회의록') && !isAdmin ? (
                    <button
                      disabled
                      title="결산 및 회의록 공지사항은 최고 관리자(admin)만 삭제할 수 있습니다."
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-400 text-xs font-semibold cursor-not-allowed opacity-60"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      삭제불가
                    </button>
                  ) : (
                    <button
                      onClick={() => handleDeleteNotice(n.id, n.title, n.category)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      삭제
                    </button>
                  )}
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
                    {s.approval && s.approval !== 'approved' && (
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                        {s.approval === 'pending' ? '승인 대기' : '반려됨'}
                      </span>
                    )}
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
                  {s.approval && s.approval !== 'approved' && (
                    <>
                      <button
                        onClick={() => handleStudyApproval(s.id, 'approved')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                      >
                        승인
                      </button>
                      {s.approval === 'pending' && (
                        <button
                          onClick={() => handleStudyApproval(s.id, 'rejected')}
                          className="px-3 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold"
                        >
                          반려
                        </button>
                      )}
                    </>
                  )}
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
      {/* ========================================== */}
      {/* TAB: Members (개인정보 - 관리자 전용)      */}
      {/* ========================================== */}
      {activeTab === 'members' && (
        <div className="space-y-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900">회원 관리 ({members.length}명)</h2>
              <p className="text-xs text-slate-500">
                회원 개인정보(성명·연락처·주소·학번)가 포함되어 있습니다. 목적 외 사용·외부 유출에 유의하고, CSV 파일은 사용 후 즉시 삭제하세요.
              </p>
            </div>
            <button
              onClick={handleDownloadMembersCsv}
              disabled={members.length === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-semibold text-xs"
            >
              <Download className="w-4 h-4" />
              명단 CSV 내려받기
            </button>
          </div>

          {members.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-500">아직 가입한 회원이 없습니다.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    {['가입일', '등급', '닉네임(아이디)', '성명', '연락처', '학번', '지역대학 / 학과', '주소', '관리'].map((h) => (
                      <th key={h} className="px-3 py-2 font-semibold whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {members.map((m) => {
                    const roleBadge = m.role === 'president' ? (
                      <span className="px-2 py-0.5 rounded-full font-bold bg-purple-100 text-purple-700 border border-purple-200 whitespace-nowrap">학생회장</span>
                    ) : m.role === 'officer' ? (
                      <span className="px-2 py-0.5 rounded-full font-bold bg-blue-100 text-blue-700 border border-blue-200 whitespace-nowrap">임원진</span>
                    ) : m.role === 'regular' ? (
                      <span className="px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 whitespace-nowrap">정회원</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-700 border border-amber-200 whitespace-nowrap">준회원</span>
                    );

                    return (
                      <tr key={m.id} className="align-top">
                        <td className="px-3 py-2.5 whitespace-nowrap">{m.created_at.split('T')[0]}</td>
                        <td className="px-3 py-2.5 whitespace-nowrap">{roleBadge}</td>
                        <td className="px-3 py-2.5">
                          <span className="font-bold text-slate-900">{m.nickname}</span>
                          <span className="block text-slate-400">{m.username}</span>
                        </td>
                        <td className="px-3 py-2.5 whitespace-nowrap">{m.name}</td>
                        <td className="px-3 py-2.5 whitespace-nowrap">{m.phone}</td>
                        <td className="px-3 py-2.5 whitespace-nowrap">{m.student_no}</td>
                        <td className="px-3 py-2.5 whitespace-nowrap">{m.regional_college} / {m.department}</td>
                        <td className="px-3 py-2.5 min-w-[200px]">{m.address}</td>
                        <td className="px-3 py-2.5 whitespace-nowrap space-x-1.5">
                          <button
                            onClick={() => handleOpenRoleModal(m)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold"
                            title="회원 등급 변경 (학생회장, 임원진, 정회원, 준회원)"
                          >
                            <Shield className="w-3.5 h-3.5" />
                            등급 변경
                          </button>
                          <button
                            onClick={() => handleOpenNicknameModal(m)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold"
                            title="학생회장, 부장 등 임원 직함 닉네임 부여"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            닉네임 변경
                          </button>
                          <button
                            onClick={() => handleDeleteSiteMember(m)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            강제 탈퇴
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

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

          {/* Email Settings Card */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-blue-600" />
                  회원가입 이메일 발송 설정 (외부 메일 인증)
                </h2>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  학우들이 회원가입 시 네이버, 구글, 다음 등 외부 이메일로 6자리 인증번호를 수신할 수 있도록 연동합니다.<br/>
                  <strong>Brevo (구 Sendinblue)</strong> 무료 서비스를 이용하면 도메인 없이도 학생회 지메일(knoucsgj@gmail.com)로 <strong>매일 300건(월 9,000건) 완전 무료</strong>로 발송됩니다.
                </p>
              </div>
              <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${emailConfig.has_api_key ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                {emailConfig.has_api_key ? '✓ 발송 API 연동됨' : '⚠ API 키 미설정 (테스트 모드)'}
              </span>
            </div>

            <form onSubmit={handleSaveEmailConfig} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">발송 서비스 제공자</label>
                  <select
                    value={emailConfig.provider}
                    onChange={(e) => setEmailConfig((c) => ({ ...c, provider: e.target.value as any }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="brevo">Brevo (추천: 도메인 불필요, 무료 월 9,000건)</option>
                    <option value="gas">Google Apps Script 웹훅</option>
                    <option value="resend">Resend (도메인 소유 시)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {emailConfig.provider === 'gas' ? '웹훅 URL' : 'API Key (비밀 키)'}
                  </label>
                  {emailConfig.provider === 'gas' ? (
                    <input
                      type="url"
                      value={emailConfig.gas_url}
                      onChange={(e) => setEmailConfig((c) => ({ ...c, gas_url: e.target.value }))}
                      placeholder="https://script.google.com/macros/s/.../exec"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <input
                      type="password"
                      value={emailConfig.api_key}
                      onChange={(e) => setEmailConfig((c) => ({ ...c, api_key: e.target.value }))}
                      placeholder={emailConfig.has_api_key ? '•••••••••••••••• (기존 키 설정됨, 변경 시 입력)' : 'xkeysib-... 또는 re_...'}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">발신자 이메일 주소</label>
                  <input
                    type="email"
                    value={emailConfig.sender}
                    onChange={(e) => setEmailConfig((c) => ({ ...c, sender: e.target.value }))}
                    placeholder="knoucsgj@gmail.com"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-[11px] text-slate-400 mt-0.5">Brevo의 'Senders & IP'에 등록된 이메일과 일치해야 합니다.</p>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">발신자 표시 이름</label>
                  <input
                    type="text"
                    value={emailConfig.sender_name}
                    onChange={(e) => setEmailConfig((c) => ({ ...c, sender_name: e.target.value }))}
                    placeholder="한국방송통신대학교 광주전남 컴퓨터과학과 학생회"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="submit"
                  disabled={isEmailSaving}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold text-xs transition-colors shadow-xs"
                >
                  {isEmailSaving ? '저장 중...' : '이메일 설정 저장'}
                </button>
              </div>
            </form>

            {/* Test Email Section */}
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <label className="block font-semibold text-slate-700 text-xs">발송 테스트 (설정 검증)</label>
              <div className="flex gap-2 max-w-md">
                <input
                  type="email"
                  value={emailTestTarget}
                  onChange={(e) => setEmailTestTarget(e.target.value)}
                  placeholder="테스트 메일 받을 본인 이메일 (예: test@naver.com)"
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={handleSendTestEmail}
                  disabled={isSendingTest || !emailTestTarget.trim()}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold text-xs transition-colors"
                >
                  {isSendingTest ? '발송 중...' : '테스트 발송'}
                </button>
              </div>
            </div>

            {emailStatusMsg && (
              <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${emailStatusMsg.isError ? 'bg-rose-50 text-rose-800 border border-rose-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'}`}>
                {emailStatusMsg.isError ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />}
                <span>{emailStatusMsg.text}</span>
              </div>
            )}

            {/* Brevo Guide Accordion */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-600 space-y-2">
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                💡 Brevo 무료 API 키 2분 만에 발급받는 방법:
              </div>
              <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-600 leading-relaxed pl-1">
                <li><a href="https://www.brevo.com" target="_blank" rel="noreferrer" className="text-blue-600 font-semibold underline">brevo.com</a>에 접속하여 무료 계정을 생성합니다 (카드 등록 불필요).</li>
                <li>우측 상단 프로필 클릭 &gt; <strong>[SMTP &amp; API]</strong> &gt; <strong>[API Keys]</strong> 탭으로 이동합니다.</li>
                <li><strong>[Generate a new API key]</strong> 버튼을 누르고 이름을 입력한 후 생성된 키(xkeysib-...)를 복사하여 위 API Key 란에 붙여넣습니다.</li>
                <li>좌측 메뉴 <strong>[Senders &amp; IP]</strong>에서 <strong>[Add sender]</strong>를 눌러 학생회 이메일(knoucsgj@gmail.com)을 입력하고 받은 메일함의 인증 링크를 1회 클릭하면 즉시 모든 외부 메일(네이버, 지메일 등)로 인증 메일이 발송됩니다.</li>
              </ol>
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
            {/* Member Role Edit Modal */}
      {editingRoleMember && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Shield className="w-4 h-4" />
                </div>
                회원 등급 변경
              </div>
              <button
                type="button"
                onClick={() => setEditingRoleMember(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
              <div><span className="text-slate-400 font-medium">대상 학우:</span> <strong className="text-slate-800">{editingRoleMember.name}</strong> ({editingRoleMember.username})</div>
              <div><span className="text-slate-400 font-medium">닉네임:</span> <span className="text-slate-700 font-bold">{editingRoleMember.nickname}</span></div>
              <div><span className="text-slate-400 font-medium">학번 / 소속:</span> <span className="text-slate-700">{editingRoleMember.student_no} / {editingRoleMember.regional_college} {editingRoleMember.department}</span></div>
              <div><span className="text-slate-400 font-medium">현재 등급:</span> <span className="font-bold text-indigo-600">{editingRoleMember.role === 'president' ? '학생회장' : editingRoleMember.role === 'officer' ? '임원진' : editingRoleMember.role === 'regular' ? '정회원' : '준회원'}</span></div>
            </div>

            <form onSubmit={handleSaveMemberRole} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-2">변경할 회원 등급 선택</label>
                <div className="space-y-2">
                  {[
                    { value: 'president', label: '학생회장', badge: 'bg-purple-100 text-purple-700', desc: '관리자 센터 및 회원 관리 가능. 회칙 수정 및 결산/회의록 삭제 제한.' },
                    { value: 'officer', label: '임원진', badge: 'bg-blue-100 text-blue-700', desc: '공지/일정 등록 및 건의함 공식 답변 작성 가능. 회원 관리 및 타인 글 강제 삭제 불가.' },
                    { value: 'regular', label: '정회원', badge: 'bg-emerald-100 text-emerald-700', desc: '광주전남 컴퓨터과학과 재학생. 자료 다운로드/업로드, 자유게시판 글/댓글 작성 가능.' },
                    { value: 'associate', label: '준회원', badge: 'bg-amber-100 text-amber-700', desc: '타 지역/타 학과 회원. 게시글/자료 열람만 가능하며 학습자료 다운로드 불가.' },
                  ].map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex items-start gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                        newMemberRole === opt.value
                          ? 'border-indigo-600 bg-indigo-50/40 ring-1 ring-indigo-600'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="memberRole"
                        value={opt.value}
                        checked={newMemberRole === opt.value}
                        onChange={(e) => setNewMemberRole(e.target.value as AdminMember['role'])}
                        className="mt-1 text-indigo-600 focus:ring-indigo-500"
                      />
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{opt.label}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm ${opt.badge}`}>{opt.value}</span>
                        </div>
                        <p className="text-slate-500 text-[11px] leading-relaxed">{opt.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingRoleMember(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingRole}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold text-xs shadow-xs"
                >
                  {isUpdatingRole ? '저장 중...' : '등급 변경 저장'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Member Nickname Edit Modal */}
      {editingNicknameMember && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <Pencil className="w-4 h-4" />
                </div>
                회원 임원 직함 / 닉네임 변경
              </div>
              <button
                type="button"
                onClick={() => setEditingNicknameMember(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
              <div><span className="text-slate-400 font-medium">대상 학우:</span> <strong className="text-slate-800">{editingNicknameMember.name}</strong> ({editingNicknameMember.username})</div>
              <div><span className="text-slate-400 font-medium">학번 / 소속:</span> <span className="text-slate-700">{editingNicknameMember.student_no} / {editingNicknameMember.regional_college} {editingNicknameMember.department}</span></div>
              <div><span className="text-slate-400 font-medium">현재 닉네임:</span> <span className="text-slate-700 font-bold">{editingNicknameMember.nickname}</span></div>
            </div>

            <form onSubmit={handleSaveMemberNickname} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">새 닉네임 (임원 직책 입력 가능)</label>
                <input
                  type="text"
                  required
                  value={newMemberNickname}
                  onChange={(e) => setNewMemberNickname(e.target.value)}
                  placeholder="예: 학생회장, 총무부장, 기획국장 등"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 font-bold text-slate-900"
                  maxLength={15}
                />
              </div>

              <div>
                <span className="block text-[11px] font-semibold text-slate-500 mb-1.5">빠른 임원 직함 선택:</span>
                <div className="flex flex-wrap gap-1.5">
                  {['학생회장', '부학생회장', '총무부장', '학술부장', '기획부장', '홍보부장', '사무국장', '운영위원'].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setNewMemberNickname(preset)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 text-xs font-semibold transition-colors border border-slate-200"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-blue-50 rounded-xl text-[11px] text-blue-800 leading-relaxed">
                관리자가 부여한 임원 닉네임은 해당 학우가 작성한 모든 게시글, 댓글, 건의함에 즉시 반영됩니다.
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingNicknameMember(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingNickname || !newMemberNickname.trim()}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold text-xs shadow-xs"
                >
                  {isUpdatingNickname ? '저장 중...' : '닉네임 변경 적용'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
