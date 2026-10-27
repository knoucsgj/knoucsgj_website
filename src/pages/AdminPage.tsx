import { AdminConstitutionManager } from '../components/AdminConstitutionManager';
import { AdminCurriculumManager } from '../components/AdminCurriculumManager';
import { AdminR2StorageManager } from '../components/AdminR2StorageManager';
import { showConfirm } from '../components/ui/GlobalDialog';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { auth, useAuth } from '../services/auth';
import type { Notice, AcademicEvent, CouncilMember, PastCouncilMember, StudyGroup, StudyStatus, MeetingMinute, AdminMember, BudgetReport, BudgetItem } from '../lib/types';
import { formatDate } from '../lib/dateUtils';
import {
  Shield,
  Scale,
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
  CheckCircle2,
  Award,
  Receipt,
  FileCheck,
  HardDrive
} from 'lucide-react';

export const AdminPage: React.FC = () => {
  const { isAdmin, member } = useAuth();
  const isPresident = member?.role === 'president';
  const isOfficer = member?.role === 'officer';
  const canAccess = isAdmin || isPresident || isOfficer;
  const canManageMembers = isAdmin || isPresident;
  const canManageCouncil = isAdmin || isPresident || isOfficer;
  const canManageBackup = isAdmin;

  const [adminIdInput, setAdminIdInput] = useState('admin');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  // Member Role Edit state
  const [editingRoleMember, setEditingRoleMember] = useState<AdminMember | null>(null);
  const [newMemberRole, setNewMemberRole] = useState<AdminMember['role']>('regular');
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);

  // Active Tab: 'notices' | 'events' | 'studies' | 'members' | 'council' | 'alumni' | 'rules' | 'minutes' | 'backup'
  const [activeTab, setActiveTab] = useState<'notices' | 'events' | 'studies' | 'members' | 'council' | 'alumni' | 'rules' | 'finance' | 'minutes' | 'audits' | 'backup' | 'curriculum' | 'storage'>('notices');

  // Reset activeTab if user does not have permission
  useEffect(() => {
    if (activeTab === 'members' && !canManageMembers) setActiveTab('notices');
    if (activeTab === 'council' && !canManageCouncil) setActiveTab('notices');
    if (activeTab === 'alumni' && !canManageCouncil) setActiveTab('notices');
    if (activeTab === 'rules' && !isAdmin) setActiveTab('notices');
    if (activeTab === 'backup' && !canManageBackup) setActiveTab('notices');
  }, [activeTab, canManageMembers, canManageCouncil, canManageBackup, isAdmin]);

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
  const [pastMembers, setPastMembers] = useState<PastCouncilMember[]>([]);
  const [adminSelectedGen, setAdminSelectedGen] = useState<string>('전체');

  // Past Council Member Modal
  const [isPastModalOpen, setIsPastModalOpen] = useState(false);
  const [editingPastId, setEditingPastId] = useState<string | null>(null);
  const [pastForm, setPastForm] = useState({
    generation: '제42대',
    period: '2025년',
    role: '학생회장',
    name: '',
    photo_url: '',
    sort_order: 1
  });

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
    // Budget Reports State & Modals
  const [budgetReports, setBudgetReports] = useState<BudgetReport[]>([]);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null);
  const [budgetEditReason, setBudgetEditReason] = useState('');
  const [budgetForm, setBudgetForm] = useState<{
    title: string;
    period: string;
    published_date: string;
    status: '감사완료' | '집행중';
    income_total: number;
    expense_total: number;
    balance: number;
    items: BudgetItem[];
    receipt_url: string;
    receipt_name: string;
  }>({
    title: '',
    period: '2026학년도 2학기 3분기',
    published_date: new Date().toISOString().split('T')[0],
    status: '감사완료',
    income_total: 0,
    expense_total: 0,
    balance: 0,
    items: [],
    receipt_url: '',
    receipt_name: ''
  });

  // Minute Editing & Auditing
  const [editingMinuteId, setEditingMinuteId] = useState<string | null>(null);
  const [minuteEditReason, setMinuteEditReason] = useState('');

  // Transparency Audit Logs State (Master Admin Only)
  const [auditLogs, setAuditLogs] = useState<{ budgets: BudgetReport[]; minutes: MeetingMinute[] }>({ budgets: [], minutes: [] });

  // Delete Audit Modal State (Reason is mandatory, Master Admin only)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'budget' | 'minute'; id: string; title: string } | null>(null);
  const [deleteReasonInput, setDeleteReasonInput] = useState('');
  const [minutes, setMeetingMinutes] = useState<MeetingMinute[]>([]);
  const [isMinuteModalOpen, setIsMinuteModalOpen] = useState(false);
  const [minuteForm, setMinuteForm] = useState<{
    title: string;
    meeting_type: '정기임원회의' | '개강총회' | '종강총회' | '임시회의' | '운영위원회';
    meeting_date: string;
    location: string;
    chairperson: string;
    recorder: string;
    attendees: string;
    agenda: string;
    content: string;
    decisions: string;
    attachments: Array<{ name: string; url: string; size?: string; type?: 'image' | 'file' }>;
  }>({
    title: '',
    meeting_type: '정기임원회의',
    meeting_date: new Date().toISOString().split('T')[0],
    location: '본관 405호 학생회실',
    chairperson: '학생회장',
    recorder: '총무부장',
    attendees: '학생회장, 부회장, 총무부장, 기획부장, 학술부장',
    agenda: '',
    content: '',
    decisions: '',
    attachments: []
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
    const [nData, eData, sData, iData, mData, pastData, minData, memberData, bData] = await Promise.all([
      api.getNotices(),
      api.getEvents(),
      api.getStudies(),
      api.getCouncilIntro(),
      api.getCouncilMembers(),
      api.getPastCouncilMembers(),
      api.getMeetingMinutes(),
      api.getMembers().catch(() => [] as AdminMember[]),
      api.getBudgetReports()
    ]);
    setBudgetReports(bData);
    setMembers(memberData);
    setNotices(nData);
    setEvents(eData);
    setStudies(sData);
    setCouncilIntro(iData);
    setCouncilMembers(mData);
    setPastMembers(pastData);
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

  const navigate = useNavigate();
  const handleLogout = async () => {
    await auth.logout();
    navigate('/', { replace: true });
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
    if (await showConfirm({
      title: '공지사항 삭제',
      message: `"${title}" 공지사항을 정말 삭제하시겠습니까?`,
      subMessage: '삭제된 공지사항은 목록에서 즉시 제거됩니다.',
      confirmText: '삭제하기',
      variant: 'danger'
    })) {
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
    if (await showConfirm({
      title: '학사 일정 삭제',
      message: `"${title}" 일정을 정말 삭제하시겠습니까?`,
      subMessage: '삭제된 일정은 캘린더에서 즉시 제거됩니다.',
      confirmText: '삭제하기',
      variant: 'danger'
    })) {
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
    if (!(await showConfirm({
      title: '회원 강제 탈퇴 처리',
      message: `'${m.nickname}'(${m.name}) 회원을 강제 탈퇴 처리하시겠습니까?`,
      subMessage: '탈퇴 처리 시 해당 회원의 개인정보 및 계정 정보가 즉시 삭제됩니다.',
      confirmText: '강제 탈퇴 처리',
      variant: 'danger'
    }))) return;
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
    if (await showConfirm({
      title: '스터디 그룹 삭제',
      message: `"${title}" 스터디 그룹을 정말 삭제(해체)하시겠습니까?`,
      subMessage: '삭제 시 홈페이지 목록에서 즉시 내려갑니다.',
      confirmText: '삭제(해체)하기',
      variant: 'danger'
    })) {
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

    try {
      if (editingMemberId) {
        await api.updateCouncilMember(editingMemberId, memberForm);
        alert('임원 정보가 성공적으로 수정되었습니다.');
      } else {
        await api.createCouncilMember(memberForm);
        alert('새로운 임원이 성공적으로 등록되었습니다.');
      }
      setIsMemberModalOpen(false);
      await loadAllData();
    } catch (err: any) {
      console.error(err);
      alert(err.message || '임원 정보 저장에 실패했습니다.');
    }
  };

  const handleDeleteMember = async (id: string, name: string) => {
    if (!(await showConfirm({
      title: '임원 정보 삭제',
      message: `"${name}" 임원 정보를 정말 삭제하시겠습니까?`,
      subMessage: '삭제된 임원 정보는 학생회 소개 및 임원진 목록에서 즉시 제거됩니다.',
      confirmText: '삭제하기',
      variant: 'danger'
    }))) return;
    try {
      await api.deleteCouncilMember(id);
      alert(`"${name}" 임원 정보가 성공적으로 삭제되었습니다.`);
      await loadAllData();
    } catch (err: any) {
      console.error(err);
      alert(err.message || '임원 정보 삭제에 실패했습니다.');
    }
  };

  // ==========================================
  // Past Council CRUD (최고관리자 & 학생회장 전용)
  // ==========================================
  const openNewPastModal = () => {
    setEditingPastId(null);
    setPastForm({
      generation: '제42대',
      period: '2025년',
      role: '학생회장',
      name: '',
      photo_url: '',
      sort_order: 1
    });
    setIsPastModalOpen(true);
  };

  const openEditPastModal = (m: PastCouncilMember) => {
    setEditingPastId(m.id);
    setPastForm({
      generation: m.generation,
      period: m.period,
      role: m.role,
      name: m.name,
      photo_url: m.photo_url || '',
      sort_order: m.sort_order || 1
    });
    setIsPastModalOpen(true);
  };

  const handlePastPhotoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await api.uploadFile(file, 'past_members');
      setPastForm((prev) => ({ ...prev, photo_url: res.url }));
    } catch {
      if (file.size <= 1024 * 1024) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setPastForm((prev) => ({ ...prev, photo_url: event.target?.result as string }));
        };
        reader.readAsDataURL(file);
      } else {
        alert('사진 파일 업로드에 실패했습니다. (저장소 상태 또는 파일 크기를 확인해 주세요)');
      }
    }
  };

  const handleSavePastMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManageCouncil) {
      alert('역대 임원 관리는 학생회장 또는 최고 관리자만 가능합니다.');
      return;
    }
    if (!pastForm.generation.trim() || !pastForm.name.trim() || !pastForm.role.trim()) {
      alert('기수, 직책명, 성명을 모두 입력해 주세요.');
      return;
    }
    try {
      if (editingPastId) {
        await api.updatePastCouncilMember(editingPastId, pastForm);
      } else {
        await api.createPastCouncilMember(pastForm);
      }
      setIsPastModalOpen(false);
      await loadAllData();
      alert('역대 임원 정보가 성공적으로 저장되었습니다!');
    } catch (err: any) {
      alert(err.message || '저장에 실패했습니다.');
    }
  };

  const handleDeletePastMember = async (id: string, name: string) => {
    if (!canManageCouncil) {
      alert('역대 임원 관리는 학생회 또는 최고 관리자만 가능합니다.');
      return;
    }
    if (!(await showConfirm({
      title: '역대 임원 정보 삭제',
      message: `"${name}" 역대 임원 정보를 정말 삭제하시겠습니까?`,
      subMessage: '삭제된 역대 임원 정보는 기수별 명단에서 즉시 제거됩니다.',
      confirmText: '삭제하기',
      variant: 'danger'
    }))) return;
    try {
      await api.deletePastCouncilMember(id);
      alert(`"${name}" 역대 임원 정보가 성공적으로 삭제되었습니다.`);
      await loadAllData();
    } catch (err: any) {
      console.error(err);
      alert(err.message || '역대 임원 정보 삭제에 실패했습니다.');
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
    if (await showConfirm({
      title: '초기 기본값 리셋',
      message: '모든 데이터를 초기 기본값으로 리셋하시겠습니까?',
      subMessage: '직접 추가한 데이터가 초기화될 수 있으므로 주의해 주세요.',
      confirmText: '초기화 진행',
      variant: 'warning'
    })) {
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
  // Budget Handlers (President & Admin only, Delete: Admin only with mandatory reason)
  // ==========================================
  const canManageGovernance = isAdmin || isPresident;

  const openNewBudgetModal = () => {
    if (!canManageGovernance) {
      alert('결산 보고 등록 권한이 없습니다 (학생회장 또는 최고관리자 전용).');
      return;
    }
    setEditingBudgetId(null);
    setBudgetEditReason('');
    setBudgetForm({
      title: '',
      period: '2026학년도 2학기 3분기',
      published_date: new Date().toISOString().split('T')[0],
      status: '감사완료',
      income_total: 0,
      expense_total: 0,
      balance: 0,
      items: [
        { id: 'b1', date: new Date().toISOString().split('T')[0], type: '수입', category: '학생회비', description: '학생회비 수납금', amount: 1000000, note: '영수증 확인' }
      ],
      receipt_url: '',
      receipt_name: ''
    });
    setIsBudgetModalOpen(true);
  };

  const openEditBudgetModal = (report: BudgetReport) => {
    if (!canManageGovernance) {
      alert('결산 보고 수정 권한이 없습니다 (학생회장 또는 최고관리자 전용).');
      return;
    }
    setEditingBudgetId(report.id);
    setBudgetEditReason('');
    setBudgetForm({
      title: report.title,
      period: report.period,
      published_date: report.published_date,
      status: report.status,
      income_total: report.income_total,
      expense_total: report.expense_total,
      balance: report.balance,
      items: report.items || [],
      receipt_url: report.receipt_url || '',
      receipt_name: report.receipt_name || ''
    });
    setIsBudgetModalOpen(true);
  };

  const handleReceiptFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      alert('영수증 파일 크기는 20MB 이하만 가능합니다.');
      return;
    }
    try {
      const res = await api.uploadFile(file, 'receipts');
      setBudgetForm((prev) => ({
        ...prev,
        receipt_url: res.url,
        receipt_name: file.name
      }));
    } catch {
      if (file.size <= 1.5 * 1024 * 1024) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64 = event.target?.result as string;
          setBudgetForm((prev) => ({
            ...prev,
            receipt_url: base64,
            receipt_name: file.name
          }));
        };
        reader.readAsDataURL(file);
      } else {
        alert('영수증 파일 업로드에 실패했습니다. (저장소 상태 또는 파일 크기를 확인해 주세요)');
      }
    }
  };

  const handleSaveBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!budgetForm.title.trim()) {
      alert('결산 보고서 제목을 입력해 주세요.');
      return;
    }
    // 영수증 파일 필수 검증!
    if (!budgetForm.receipt_url.trim()) {
      alert('투명한 학생회비 집행 증빙을 위해 [영수증 및 증빙 파일] 첨부는 필수입니다!');
      return;
    }

    if (editingBudgetId) {
      if (!budgetEditReason.trim()) {
        alert('투명성 보존을 위해 [결산 정정/수정 사유]를 반드시 입력해야 합니다.');
        return;
      }
      await api.updateBudgetReport(editingBudgetId, budgetForm, budgetEditReason.trim());
      alert('결산 내역이 정정 사유와 함께 성공적으로 수정되었습니다.');
    } else {
      await api.createBudgetReport(budgetForm);
      alert('결산 보고서가 영수증 증빙과 함께 성공적으로 등록되었습니다.');
    }

    setIsBudgetModalOpen(false);
    loadAllData();
  };

  // Delete Request Handler (Only Master Admin)
  const requestDelete = (type: 'budget' | 'minute', id: string, title: string) => {
    if (!isAdmin) {
      alert('투명성과 신뢰 보존을 위해 삭제 권한은 오직 [최고 관리자(admin)]에게만 있습니다.\n학생회장은 삭제 권한이 부여되지 않습니다.');
      return;
    }
    setDeleteTarget({ type, id, title });
    setDeleteReasonInput('');
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    if (!deleteReasonInput.trim()) {
      alert('삭제 사유를 반드시 입력해야 합니다. (투명성 감사 기록에 영구 보존됩니다)');
      return;
    }

    if (deleteTarget.type === 'budget') {
      await api.deleteBudgetReport(deleteTarget.id, deleteReasonInput.trim());
      alert(`"${deleteTarget.title}" 결산 내역이 삭제 사유와 함께 감사 로그에 안전하게 보존 처리되었습니다.`);
    } else {
      await api.deleteMeetingMinute(deleteTarget.id, deleteReasonInput.trim());
      alert(`"${deleteTarget.title}" 회의록이 삭제 사유와 함께 감사 로그에 안전하게 보존 처리되었습니다.`);
    }

    setDeleteModalOpen(false);
    setDeleteTarget(null);
    loadAllData();
    if (activeTab === 'audits') loadAudits();
  };

  const loadAudits = async () => {
    if (!isAdmin) return;
    try {
      const data = await api.getAdminAudits();
      setAuditLogs(data);
    } catch (e) {
      console.error(e);
    }
  };

  // Minute Handlers
  const openNewMinuteModal = () => {
    if (!canManageGovernance) {
      alert('회의록 작성 권한이 없습니다 (학생회장 또는 최고관리자 전용).');
      return;
    }
    setEditingMinuteId(null);
    setMinuteEditReason('');
    setMinuteForm({
      title: '',
      meeting_type: '정기임원회의',
      meeting_date: new Date().toISOString().split('T')[0],
      location: '본관 405호 학생회실',
      chairperson: '학생회장',
      recorder: '총무부장',
      attendees: '학생회장, 부회장, 총무부장, 기획부장, 학술부장',
      agenda: '',
      content: '',
      decisions: '',
      attachments: []
    });
    setIsMinuteModalOpen(true);
  };

  const openEditMinuteModal = (m: MeetingMinute) => {
    if (!canManageGovernance) {
      alert('회의록 수정 권한이 없습니다 (학생회장 또는 최고관리자 전용).');
      return;
    }
    setEditingMinuteId(m.id);
    setMinuteEditReason('');
    setMinuteForm({
      title: m.title,
      meeting_type: m.meeting_type,
      meeting_date: m.meeting_date,
      location: m.location || '본관 405호 학생회실',
      chairperson: m.chairperson || '학생회장',
      recorder: m.recorder || '총무부장',
      attendees: m.attendees || '',
      agenda: m.agenda || '',
      content: m.content || '',
      decisions: m.decisions || '',
      attachments: m.attachments || []
    });
    setIsMinuteModalOpen(true);
  };

  const handleMinuteAttachment = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isImg = file.type.startsWith('image/');
    try {
      const res = await api.uploadFile(file, 'minutes');
      setMinuteForm((prev) => ({
        ...prev,
        attachments: [
          ...prev.attachments,
          {
            name: file.name,
            url: res.url,
            size: res.fileSize,
            type: isImg ? 'image' : 'file'
          }
        ]
      }));
    } catch {
      if (file.size <= 1024 * 1024) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64 = event.target?.result as string;
          setMinuteForm((prev) => ({
            ...prev,
            attachments: [
              ...prev.attachments,
              {
                name: file.name,
                url: base64,
                size: `${(file.size / 1024).toFixed(1)}KB`,
                type: isImg ? 'image' : 'file'
              }
            ]
          }));
        };
        reader.readAsDataURL(file);
      } else {
        alert('첨부파일 업로드에 실패했습니다. (저장소 상태 또는 파일 크기를 확인해 주세요)');
      }
    }
  };

  const handleSaveMinute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!minuteForm.title.trim() || !minuteForm.decisions.trim()) {
      alert('회의 제목과 의결 사항을 입력해 주세요.');
      return;
    }

    if (editingMinuteId) {
      if (!minuteEditReason.trim()) {
        alert('투명성 보존을 위해 [회의록 정정/수정 사유]를 반드시 입력해야 합니다.');
        return;
      }
      await api.updateMeetingMinute(editingMinuteId, minuteForm, minuteEditReason.trim());
      alert('회의록이 정정 사유와 함께 성공적으로 수정되었습니다.');
    } else {
      await api.createMeetingMinute(minuteForm);
      alert('회의록이 성공적으로 등록되었습니다.');
    }
    setIsMinuteModalOpen(false);
    loadAllData();
  };

  // ==========================================
  // Login Gate
  // ==========================================
  if (!canAccess) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full my-8 p-8 bg-white rounded-3xl border border-slate-200 shadow-2xl text-center space-y-6">
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
                placeholder="관리자 아이디 또는 이메일 입력"
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
            관리자 로그인 콘솔 접속
          </button>
        </form>

        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-500 leading-relaxed text-left space-y-1">
          <p className="font-semibold text-slate-700">💡 관리자 로그인 안내:</p>
          <p>• 관리 권한이 부여된 관리자 또는 학생회 임원 계정으로 로그인해 주세요.</p>
          <p>• 계정 접속 관련 문의는 학생회로 연락하시기 바랍니다.</p>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-center">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-slate-500 hover:text-blue-600 flex items-center gap-1.5 font-semibold transition-colors"
          >
            <span>← 일반 학과 홈페이지 열기 (새 창 ↗)</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
    );
  }

  // ==========================================
  // Logged-in Dashboard
  // ==========================================
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col text-slate-900">
      {/* Dedicated Admin Console Top Bar */}
      <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold">
            <Shield className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm sm:text-base tracking-tight text-white">
                KNOU CS 광주전남 관리자 센터
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 font-semibold hidden sm:inline">
                Admin Console
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              홈페이지 콘텐츠 및 회원 등급을 실시간으로 관리하는 독립 관리자 콘솔입니다.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-md active:scale-95"
            title="새 창/탭으로 학과 홈페이지를 열어 관리자 반영 결과를 실시간으로 나란히 확인합니다"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>학과 홈페이지 열기 (새 창 ↗)</span>
          </a>

          <div className="h-6 w-px bg-slate-800 hidden sm:block" />

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-rose-950 hover:text-rose-300 text-slate-300 transition-colors border border-slate-700"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>로그아웃</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6 flex-1">
        {/* Top Header Card */}
        <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
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
                • 독립 관리자 콘솔 대시보드
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              학생회 웹사이트 운영·회원 관리
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
              회원 등급 변경, 공지사항 및 일정 관리 결과를 즉시 확인하려면 우측 상단의 <strong className="text-blue-400">[학과 홈페이지 열기 (새 창 ↗)]</strong>을 눌러 나란히 두고 실시간 동기화를 검증하세요.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-center">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors border border-slate-700 shadow-xs"
            >
              홈페이지 새 창 열기
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
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
        {canManageCouncil && (
          <button
            onClick={() => setActiveTab('council')}
            className={`px-5 py-3 text-sm font-semibold rounded-t-xl transition-colors whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'council'
                ? 'bg-white text-blue-700 border-t-2 border-x border-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
            }`}
          >
            <Users className="w-4 h-4 text-emerald-600" />
            인사말 & 현임원 관리
          </button>
        )}
        {canManageCouncil && (
          <button
            onClick={() => setActiveTab('alumni')}
            className={`px-5 py-3 text-sm font-semibold rounded-t-xl transition-colors whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'alumni'
                ? 'bg-white text-blue-700 border-t-2 border-x border-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
            }`}
          >
            <Award className="w-4 h-4 text-indigo-600" />
            역대 임원 관리 ({pastMembers.length})
          </button>
        )}
        {isAdmin && (
          <button
            onClick={() => setActiveTab('rules')}
            className={`px-5 py-3 text-sm font-semibold rounded-t-xl transition-colors whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'rules'
                ? 'bg-white text-blue-700 border-t-2 border-x border-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
            }`}
          >
            <Scale className="w-4 h-4 text-amber-600" />
            학생회칙 & 세칙 관리
          </button>
        )}
        <button
          onClick={() => setActiveTab('minutes')}
          className={`px-5 py-3 text-sm font-semibold rounded-t-xl transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'minutes'
              ? 'bg-white text-blue-700 border-t-2 border-x border-blue-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
          }`}
        >
          <FileText className="w-4 h-4 text-purple-600" />
          학생회 회의록 관리 ({minutes.length})
        </button>
        <button
          onClick={() => setActiveTab('curriculum')}
          className={`px-5 py-3 text-sm font-semibold rounded-t-xl transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'curriculum'
              ? 'bg-white text-blue-700 border-t-2 border-x border-blue-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
          }`}
        >
          <BookOpen className="w-4 h-4 text-blue-600" />
          개설 교과목 관리
        </button>
        <button
          onClick={() => setActiveTab('storage')}
          className={`px-5 py-3 text-sm font-semibold rounded-t-xl transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'storage'
              ? 'bg-white text-blue-700 border-t-2 border-x border-blue-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
          }`}
        >
          <HardDrive className="w-4 h-4 text-cyan-600" />
          파일 저장소 (9.9GB 한도)
        </button>
        {canManageBackup && (
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
        )}
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
                    onClick={() => handleDeleteNotice(n.id, n.title, n.category)}
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

      {canManageCouncil && activeTab === 'council' && (
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

            {councilMembers.length === 0 ? (
              <div className="py-12 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="text-sm font-semibold text-slate-600">등록된 학생회 임원이 없습니다.</p>
                <p className="text-xs text-slate-400 mt-1">'임원 추가' 버튼을 눌러 임원 정보를 등록해 주세요.</p>
              </div>
            ) : (
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
            )}
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* TAB 5: Backup & Password Settings          */}
      {/* ========================================== */}
      {canManageBackup && activeTab === 'backup' && (
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
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {['knoucsgj@gmail.com', 'knoucsgj@daum.net', 'knoucsgj@hanmail.net', 'knoucsgj@kakao.com'].map((em) => (
                      <button
                        key={em}
                        type="button"
                        onClick={() => setEmailConfig((c) => ({ ...c, sender: em }))}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold border transition-colors ${
                          emailConfig.sender === em
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
                        }`}
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">최고 관리자 공식 메일 목록에서 발신용 주소를 빠르게 선택할 수 있습니다.</p>
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
            {/* ========================================== */}
      {/* TAB: Past Council Members (역대 임원 관리)  */}
      {/* ========================================== */}
      {canManageCouncil && activeTab === 'alumni' && (
        <div className="space-y-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-600" />
                <h2 className="text-lg font-bold text-slate-900">역대 학생회 임원 명단 관리</h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                학생회 소개 페이지의 [역대 임원 소개] 게시판에 표시되는 임원 목록을 관리합니다. (학생회장·최고관리자 전용)
              </p>
            </div>
            <button
              onClick={openNewPastModal}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors shadow-xs shrink-0 self-start sm:self-auto"
            >
              <PlusCircle className="w-4 h-4" />
              새 역대 임원 등록
            </button>
          </div>

          {/* Generation Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {['전체', ...Array.from(new Set(pastMembers.map((m) => m.generation))).filter(Boolean)].map((gen) => (
              <button
                key={gen}
                onClick={() => setAdminSelectedGen(gen)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  adminSelectedGen === gen
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200/70'
                }`}
              >
                {gen}
              </button>
            ))}
          </div>

          {/* Members Table */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                  <th className="py-3 px-4 w-16 text-center">사진</th>
                  <th className="py-3 px-4 w-24 text-center">기수</th>
                  <th className="py-3 px-4 w-28 text-center">임기</th>
                  <th className="py-3 px-4 w-32">직책명</th>
                  <th className="py-3 px-4">성명</th>
                  <th className="py-3 px-4 w-28 text-center">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pastMembers
                  .filter((m) => adminSelectedGen === '전체' || m.generation === adminSelectedGen)
                  .map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 text-center">
                        {m.photo_url ? (
                          <img
                            src={m.photo_url}
                            alt={m.name}
                            className="w-10 h-10 rounded-full object-cover border border-slate-200 mx-auto"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 mx-auto flex items-center justify-center text-[10px] text-slate-400 font-semibold">
                            공란
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-indigo-700">
                        {m.generation}
                      </td>
                      <td className="py-3 px-4 text-center text-slate-600">
                        {m.period}
                      </td>
                      <td className="py-3 px-4 font-semibold">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-xs font-bold">
                          {m.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900 text-sm">
                        {m.name}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => openEditPastModal(m)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="수정"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeletePastMember(m.id, m.name)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="삭제"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                {pastMembers.filter((m) => adminSelectedGen === '전체' || m.generation === adminSelectedGen).length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                      등록된 역대 임원이 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Past Member Modal */}
      {isPastModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 p-6 sm:p-7 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg text-slate-900">
                    {editingPastId ? '역대 임원 정보 수정' : '새 역대 임원 등록'}
                  </h3>
                  <p className="text-xs text-slate-400">기수, 임기, 직책명, 성명과 사진을 설정합니다.</p>
                </div>
              </div>
              <button
                onClick={() => setIsPastModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePastMember} className="space-y-3.5 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">기수 *</label>
                  <input
                    type="text"
                    required
                    value={pastForm.generation}
                    onChange={(e) => setPastForm({ ...pastForm, generation: e.target.value })}
                    placeholder="예: 제42대"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">임기 *</label>
                  <input
                    type="text"
                    required
                    value={pastForm.period}
                    onChange={(e) => setPastForm({ ...pastForm, period: e.target.value })}
                    placeholder="예: 2025년"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">직책명 *</label>
                  <input
                    type="text"
                    required
                    value={pastForm.role}
                    onChange={(e) => setPastForm({ ...pastForm, role: e.target.value })}
                    placeholder="예: 학생회장, 총무부장"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">성명 *</label>
                  <input
                    type="text"
                    required
                    value={pastForm.name}
                    onChange={(e) => setPastForm({ ...pastForm, name: e.target.value })}
                    placeholder="예: 홍길동"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">사진 (선택사항)</label>
                <div className="flex items-center gap-3">
                  {pastForm.photo_url ? (
                    <img
                      src={pastForm.photo_url}
                      alt="미리보기"
                      className="w-14 h-14 rounded-full object-cover border border-slate-200 shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[11px] text-slate-400 font-medium shrink-0">
                      공란
                    </div>
                  )}
                  <div className="space-y-1.5 flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePastPhotoFileChange}
                      className="block w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                    {pastForm.photo_url && (
                      <button
                        type="button"
                        onClick={() => setPastForm({ ...pastForm, photo_url: '' })}
                        className="text-[11px] text-rose-500 hover:underline font-semibold"
                      >
                        사진 삭제 (공란으로 설정)
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPastModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors shadow-xs"
                >
                  {editingPastId ? '수정 저장' : '등록 완료'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB: Constitution Management (학생회칙 & 세칙 관리) */}
      {/* ================================================= */}
      {isAdmin && activeTab === 'rules' && (
        <AdminConstitutionManager />
      )}

            {/* TAB: Budget Finance Management */}
      {/* ========================================== */}
      {activeTab === 'finance' && (
        <div className="space-y-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">투명 재정: 학생회비 결산보고 관리</h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                  영수증 첨부 필수 원칙
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                등록 및 수정 권한은 <strong>학생회장 및 최고관리자</strong>만 가능하며, 삭제는 <strong>최고관리자만 사유 기록 후</strong> 가능합니다.
              </p>
            </div>
            {canManageGovernance && (
              <button
                onClick={openNewBudgetModal}
                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95 self-start sm:self-auto cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>새 결산보고 등록</span>
              </button>
            )}
          </div>

          <div className="divide-y divide-slate-100">
            {budgetReports.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">등록된 결산 보고서가 없습니다.</div>
            ) : (
              budgetReports.map((report) => (
                <div key={report.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 p-3 rounded-2xl transition-colors">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap text-xs">
                      <span className="font-semibold text-slate-500">{report.period}</span>
                      <span className="px-2 py-0.5 rounded-full font-bold text-[11px] bg-emerald-100 text-emerald-800">
                        {report.status}
                      </span>
                      <span className="text-slate-400">공고일: {report.published_date}</span>
                      {report.receipt_url && (
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          ✓ 영수증 증빙 첨부됨
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm">{report.title}</h3>
                    <div className="text-xs text-slate-600 flex items-center gap-4 flex-wrap">
                      <span>수입: <strong className="text-blue-700">+{report.income_total.toLocaleString()}원</strong></span>
                      <span>지출: <strong className="text-rose-600">-{report.expense_total.toLocaleString()}원</strong></span>
                      <span>잔액: <strong className="text-emerald-700">{report.balance.toLocaleString()}원</strong></span>
                      <span>작성자: {report.created_by || '학생회'}</span>
                    </div>
                    {report.edit_history && report.edit_history.length > 0 && (
                      <div className="text-[11px] text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 inline-block">
                        수정 이력 {report.edit_history.length}건 (최근 정정: {report.edit_history[report.edit_history.length - 1].reason})
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {canManageGovernance && (
                      <button
                        onClick={() => openEditBudgetModal(report)}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                        title="수정하기"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>수정</span>
                      </button>
                    )}
                    {isAdmin ? (
                      <button
                        onClick={() => requestDelete('budget', report.id, report.title)}
                        className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                        title="삭제 (사유 보존)"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>삭제</span>
                      </button>
                    ) : isPresident ? (
                      <span className="text-[11px] text-slate-400 bg-slate-100 px-2 py-1 rounded">
                        삭제: 최고관리자 전용
                      </span>
                    ) : null}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB: Master Admin Audit Logs */}
      {/* ========================================== */}
      {isAdmin && activeTab === 'audits' && (
        <div className="space-y-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs">
          <div className="pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">투명성 보존: 삭제 감사 로그 (Audit Trail)</h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold">
                최고 관리자 전용
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              학생회비 결산 및 회의록은 공정성과 투명성을 위해 삭제 시 사유가 의무 기록되며, 데이터가 영구 보존됩니다.
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-sm text-slate-900 mb-3 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-rose-600" />
                <span>삭제 보존된 결산 내역 ({auditLogs.budgets.length})</span>
              </h3>
              {auditLogs.budgets.length === 0 ? (
                <div className="p-4 bg-slate-50 rounded-xl text-center text-xs text-slate-400">삭제 보존된 결산 기록이 없습니다.</div>
              ) : (
                <div className="space-y-3">
                  {auditLogs.budgets.map((b) => (
                    <div key={b.id} className="p-4 rounded-xl border border-rose-200 bg-rose-50/40 text-xs space-y-1.5">
                      <div className="flex items-center justify-between text-slate-500">
                        <span className="font-bold text-slate-800">{b.title} ({b.period})</span>
                        <span className="text-rose-700 font-semibold">삭제일: {formatDate(b.deleted_at || '')} (삭제자: {b.deleted_by || '총괄관리자'})</span>
                      </div>
                      <div className="p-2.5 bg-white rounded-lg border border-rose-200 text-rose-900 font-medium">
                        <strong>📌 삭제 사유: </strong> {b.deleted_reason || '사유 없음'}
                      </div>
                      <div className="text-slate-500">
                        원래 잔액: {b.balance.toLocaleString()}원 | 수입: {b.income_total.toLocaleString()}원 | 지출: {b.expense_total.toLocaleString()}원
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h3 className="font-bold text-sm text-slate-900 mb-3 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-rose-600" />
                <span>삭제 보존된 회의록 ({auditLogs.minutes.length})</span>
              </h3>
              {auditLogs.minutes.length === 0 ? (
                <div className="p-4 bg-slate-50 rounded-xl text-center text-xs text-slate-400">삭제 보존된 회의록이 없습니다.</div>
              ) : (
                <div className="space-y-3">
                  {auditLogs.minutes.map((m) => (
                    <div key={m.id} className="p-4 rounded-xl border border-rose-200 bg-rose-50/40 text-xs space-y-1.5">
                      <div className="flex items-center justify-between text-slate-500">
                        <span className="font-bold text-slate-800">{m.title} ({m.meeting_date})</span>
                        <span className="text-rose-700 font-semibold">삭제일: {formatDate(m.deleted_at || '')} (삭제자: {m.deleted_by || '총괄관리자'})</span>
                      </div>
                      <div className="p-2.5 bg-white rounded-lg border border-rose-200 text-rose-900 font-medium">
                        <strong>📌 삭제 사유: </strong> {m.deleted_reason || '사유 없음'}
                      </div>
                      <div className="text-slate-500">
                        회의구분: {m.meeting_type} | 의결내용: {m.decisions}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: Minutes Management (회의록 관리)     */}
      {/* ========================================== */}
      {activeTab === 'minutes' && (
        <div className="space-y-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900">학생회 회의록 관리</h2>
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
                  {canManageGovernance && (
                    <button
                      onClick={() => openEditMinuteModal(m)}
                      className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold"
                      title="회의록 수정"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>수정</span>
                    </button>
                  )}
                  {isAdmin ? (
                    <button
                      onClick={() => requestDelete('minute', m.id, m.title)}
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold"
                      title="회의록 삭제 (사유 보존)"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>삭제</span>
                    </button>
                  ) : isPresident ? (
                    <span className="text-[11px] text-slate-400 bg-slate-100 px-2 py-1 rounded">
                      삭제: 최고관리자 전용
                    </span>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* TAB: Curriculum Course Management          */}
      {/* ========================================== */}
      {activeTab === 'curriculum' && (
        <AdminCurriculumManager />
      )}

      {/* ========================================== */}
      {/* TAB: R2 Storage Capacity Management (9.9GB) */}
      {/* ========================================== */}
      {activeTab === 'storage' && (
        <AdminR2StorageManager />
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

              <div>
                <label className="block font-semibold text-slate-700 mb-1">별첨 자료 및 사진 첨부 (선택)</label>
                <input
                  type="file"
                  onChange={handleMinuteAttachment}
                  className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
                {minuteForm.attachments.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {minuteForm.attachments.map((att, i) => (
                      <div key={i} className="text-[11px] text-slate-600 flex items-center justify-between bg-slate-50 p-1.5 rounded">
                        <span>{att.name} ({att.size || ''})</span>
                        <button
                          type="button"
                          onClick={() => setMinuteForm(p => ({ ...p, attachments: p.attachments.filter((_, idx) => idx !== i) }))}
                          className="text-rose-500 hover:underline cursor-pointer"
                        >
                          삭제
                        </button>
                      </div>
                    ))}
                  </div>
                )}
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

      {/* ========================================== */}
      {/* Budget Report Modal (New / Edit)           */}
      {/* ========================================== */}
      {isBudgetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base text-slate-900">
                  {editingBudgetId ? '학생회비 결산 정정(수정)' : '새 학생회비 결산보고 등록'}
                </h3>
              </div>
              <button
                onClick={() => setIsBudgetModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBudget} className="space-y-4 text-xs">
              {editingBudgetId && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 space-y-1">
                  <label className="block font-bold text-amber-950">결산 정정/수정 사유 (필수) *</label>
                  <input
                    type="text"
                    required
                    value={budgetEditReason}
                    onChange={(e) => setBudgetEditReason(e.target.value)}
                    placeholder="예: 3호 영수증 금액 오기 정정, 잔액 재계산"
                    className="w-full px-3 py-2 rounded-lg border border-amber-300 bg-white text-xs font-medium text-slate-900 focus:ring-2 focus:ring-amber-500"
                  />
                  <p className="text-[11px] text-amber-800">투명성 보존을 위해 수정 일시와 사유가 학우 공개 페이지에 영구 기록됩니다.</p>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">결산 보고서 제목 *</label>
                <input
                  type="text"
                  required
                  value={budgetForm.title}
                  onChange={(e) => setBudgetForm({ ...budgetForm, title: e.target.value })}
                  placeholder="예: 2026학년도 2학기 3분기 학생회비 결산 및 집행 내역 보고"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">대상 기간 (분기)</label>
                  <input
                    type="text"
                    required
                    value={budgetForm.period}
                    onChange={(e) => setBudgetForm({ ...budgetForm, period: e.target.value })}
                    placeholder="예: 2026.07.01 ~ 2026.09.30"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">공고 일자</label>
                  <input
                    type="date"
                    required
                    value={budgetForm.published_date}
                    onChange={(e) => setBudgetForm({ ...budgetForm, published_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">감사 상태</label>
                  <select
                    value={budgetForm.status}
                    onChange={(e) => setBudgetForm({ ...budgetForm, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50"
                  >
                    <option value="감사완료">감사완료</option>
                    <option value="집행중">집행중</option>
                  </select>
                </div>
              </div>

              {/* Mandatory Receipt Upload Box */}
              <div className="p-4 rounded-2xl border-2 border-dashed border-emerald-400 bg-emerald-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-emerald-700" />
                    <span className="font-bold text-emerald-950 text-xs">영수증 및 증빙 파일 첨부 (필수) *</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-emerald-600 text-white">필수 증빙</span>
                </div>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  결산 등록 시 영수증 원본(사진 이미지 또는 스캔 PDF) 첨부가 없으면 등록할 수 없습니다.
                </p>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleReceiptFileChange}
                  className="w-full text-xs text-slate-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 cursor-pointer"
                />
                {budgetForm.receipt_name && (
                  <div className="text-xs text-emerald-900 font-semibold bg-white p-2 rounded-lg border border-emerald-200 flex items-center justify-between">
                    <span>첨부됨: {budgetForm.receipt_name}</span>
                    <span className="text-[11px] text-emerald-600">✓ 검증 완료</span>
                  </div>
                )}
              </div>

              {/* Totals */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">총 수입금액 (원)</label>
                  <input
                    type="number"
                    value={budgetForm.income_total}
                    onChange={(e) => {
                      const inc = Number(e.target.value);
                      setBudgetForm({ ...budgetForm, income_total: inc, balance: inc - budgetForm.expense_total });
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-blue-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">총 지출금액 (원)</label>
                  <input
                    type="number"
                    value={budgetForm.expense_total}
                    onChange={(e) => {
                      const exp = Number(e.target.value);
                      setBudgetForm({ ...budgetForm, expense_total: exp, balance: budgetForm.income_total - exp });
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-rose-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">최종 잔액 (자동계산)</label>
                  <input
                    type="number"
                    readOnly
                    value={budgetForm.balance}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-extrabold text-emerald-700 bg-slate-50"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsBudgetModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-semibold cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 cursor-pointer shadow-xs"
                >
                  {editingBudgetId ? '결산 정정사항 저장' : '결산보고 등록'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* Master Admin Delete Audit Reason Modal     */}
      {/* ========================================== */}
      {deleteModalOpen && deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 p-6 sm:p-7 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">투명성 보존: 삭제 사유 입력</h3>
                <p className="text-xs text-rose-600 font-semibold">최고 관리자 전용 삭제 감사 프로세스</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
              <div><strong>삭제 대상: </strong> {deleteTarget.title}</div>
              <div className="text-[11px] text-slate-500">
                삭제된 데이터는 영구 파기되지 않고 <strong>삭제 감사 로그</strong>에 사유 및 삭제 일시와 함께 영구 보존됩니다.
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1">삭제 사유를 구체적으로 작성하세요 (필수) *</label>
              <textarea
                rows={3}
                required
                value={deleteReasonInput}
                onChange={(e) => setDeleteReasonInput(e.target.value)}
                placeholder="예: 중복 등록으로 인한 삭제, 작성자 요청에 의한 취소"
                className="w-full px-3.5 py-2.5 rounded-xl border border-rose-300 text-xs focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => { setDeleteModalOpen(false); setDeleteTarget(null); }}
                className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-600 font-semibold text-xs cursor-pointer hover:bg-slate-200"
              >
                취소
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={!deleteReasonInput.trim()}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 text-white font-bold text-xs cursor-pointer shadow-xs"
              >
                보존 처리 및 삭제 확정
              </button>
            </div>
          </div>
        </div>
      )}

      </main>
    </div>
  );
};
