import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../services/auth';
import { useRequireLogin } from '../lib/useRequireLogin';
import type { StudyGroup, AcademicMaterial } from '../lib/types';
import { KNOU_CS_COURSES } from '../data/mockMaterials';
import { ASSETS } from '../lib/assets';
import {
  BookOpen,
  FolderArchive,
  Users,
  PlusCircle,
  Download,
  Filter,
  FileText,
  Search,
  Sparkles,
  Laptop,
  MessageCircle,
  X,
  Shield,
  ArrowRight,
  GraduationCap,
  FileCode,
  Upload,
  Edit3,
  Trash2
} from 'lucide-react';

export const StudyMaterialsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'materials' | 'other' | 'studies'>('materials');

  // Study Groups State
  const [studies, setStudies] = useState<StudyGroup[]>([]);
  const [selectedStudyStatus, setSelectedStudyStatus] = useState<string>('전체');
  const [isStudyApplyModalOpen, setIsStudyApplyModalOpen] = useState(false);
  const [selectedStudy, setSelectedStudy] = useState<StudyGroup | null>(null);

  // New Study Modal State
  const [isCreateStudyModalOpen, setIsCreateStudyModalOpen] = useState(false);
  const [newStudyTitle, setNewStudyTitle] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newMeetingType, setNewMeetingType] = useState<'온라인 (Zoom/Discord)' | '오프라인 (광주지역대학)' | '온/오프라인 병행'>('온/오프라인 병행');
  const [newMaxMembers, setNewMaxMembers] = useState(8);
  const [newLeaderContact, setNewLeaderContact] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [isSubmittingStudy, setIsSubmittingStudy] = useState(false);

  // Academic Materials State
  const [materials, setMaterials] = useState<AcademicMaterial[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<1 | 2 | 3 | 4>(1);
  const [selectedSemester, setSelectedSemester] = useState<1 | 2>(2); // Default 2학기 (현재 학기)
  const [selectedCourse, setSelectedCourse] = useState<string>('전체');
  const [materialSearchQuery, setMaterialSearchQuery] = useState('');

  // Other Materials Category Filter
  const [otherCategoryFilter, setOtherCategoryFilter] = useState<string>('전체');

  // New / Edit Material Modal State
  const [isCreateMaterialModalOpen, setIsCreateMaterialModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<AcademicMaterial | null>(null);
  const [newMatGrade, setNewMatGrade] = useState<1 | 2 | 3 | 4>(1);
  const [newMatSemester, setNewMatSemester] = useState<1 | 2>(2);
  const [newMatCourse, setNewMatCourse] = useState('');
  const [newMatTitle, setNewMatTitle] = useState('');
  const [newMatDescription, setNewMatDescription] = useState('');
  const [newMatCategory, setNewMatCategory] = useState<'기출문제/해설' | '출석수업요약' | '과제물참고자료' | '강의노트' | '기타자료'>('출석수업요약');
  const [newMatFileName, setNewMatFileName] = useState('');
  const [newMatFileSize, setNewMatFileSize] = useState('');
  const [newMatFileDataUrl, setNewMatFileDataUrl] = useState<string>('');
  const [isSubmittingMaterial, setIsSubmittingMaterial] = useState(false);

  const { member, isAdmin } = useAuth();
  const requireLogin = useRequireLogin();
  const canModify = (authorId?: string | null) => isAdmin || (!!member && !!authorId && authorId === member.id);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [studiesData, matsData] = await Promise.all([
      api.getStudies(),
      api.getMaterials()
    ]);
    setStudies(studiesData);
    setMaterials(matsData);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size (max 1MB: files are stored as data URLs in the D1 database row)
    if (file.size > 1024 * 1024) {
      alert('파일 크기는 1MB 이하여야 합니다. 용량이 큰 자료는 클라우드 링크를 설명에 남겨 주세요.');
      e.target.value = '';
      return;
    }

    const sizeFormatted =
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)}MB`
        : `${Math.round(file.size / 1024)}KB`;

    setNewMatFileName(file.name);
    setNewMatFileSize(sizeFormatted);

    const reader = new FileReader();
    reader.onload = (event) => {
      setNewMatFileDataUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDownload = async (mat: AcademicMaterial) => {
    await api.incrementMaterialDownload(mat.id);
    setMaterials((prev) =>
      prev.map((m) => (m.id === mat.id ? { ...m, downloads: m.downloads + 1 } : m))
    );

    const fileName = mat.file_name || `${mat.title}.pdf`;

    const fileUrl = mat.file_url || (mat.has_file ? await api.getMaterialFile(mat.id) : null);

    if (fileUrl && fileUrl.startsWith('data:')) {
      // Trigger download for uploaded data URL
      const a = document.createElement('a');
      a.href = fileUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      // Create a virtual text/pdf download blob for mock materials
      const dummyContent = `[한국방송통신대학교 광주전남지역대학 컴퓨터과학과 학습자료실]\n\n과목명: ${mat.course_name}\n자료명: ${mat.title}\n분류: ${mat.category} (${mat.grade}학년 ${mat.semester}학기)\n작성자: ${mat.author}\n등록일: ${mat.created_at}\n\n[상세 내용]\n${mat.description}\n\n※ 본 자료는 학우들의 학습 목적으로 제공됩니다.`;
      const blob = new Blob([dummyContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName.endsWith('.pdf') ? fileName.replace('.pdf', '.txt') : `${fileName}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleCreateStudy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudyTitle.trim() || !newSubject.trim()) {
      alert('스터디 제목과 주제를 입력해주세요.');
      return;
    }
    try {
      setIsSubmittingStudy(true);
      await api.createStudy({
        title: newStudyTitle.trim(),
        subject: newSubject.trim(),
        status: '모집중',
        members_count: 1,
        max_members: newMaxMembers,
        target_grade: '전학년',
        meeting_type: newMeetingType,
        leader: member?.nickname || '',
        leader_contact: newLeaderContact.trim(),
        description: newDescription.trim()
      });
      await loadData();
      setIsCreateStudyModalOpen(false);
      setNewStudyTitle('');
      setNewSubject('');
      setNewLeaderContact('');
      setNewDescription('');
      alert(isAdmin ? '새 스터디 그룹이 등록되었습니다!' : '스터디 개설 신청이 접수되었습니다. 학생회 승인 후 목록에 공개됩니다.');
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : '스터디 등록 중 오류가 발생했습니다.');
    } finally {
      setIsSubmittingStudy(false);
    }
  };

  const openCreateModal = (defaultCategory: '출석수업요약' | '기타자료' = '출석수업요약') => {
    setEditingMaterial(null);
    setNewMatGrade(selectedGrade);
    setNewMatSemester(selectedSemester);
    setNewMatCourse(selectedCourse === '전체' ? '' : selectedCourse);
    setNewMatTitle('');
    setNewMatDescription('');
    setNewMatCategory(defaultCategory);
    setNewMatFileName('');
    setNewMatFileSize('');
    setNewMatFileDataUrl('');
    setIsCreateMaterialModalOpen(true);
  };

  const openEditModal = (mat: AcademicMaterial) => {
    setEditingMaterial(mat);
    setNewMatGrade(mat.grade);
    setNewMatSemester(mat.semester);
    setNewMatCourse(mat.course_name);
    setNewMatTitle(mat.title);
    setNewMatDescription(mat.description);
    setNewMatCategory(mat.category);
    setNewMatFileName(mat.file_name || '');
    setNewMatFileSize(mat.file_size || '');
    setNewMatFileDataUrl(mat.file_url || '');
    setIsCreateMaterialModalOpen(true);
  };

  const handleDeleteMaterial = async (mat: AcademicMaterial) => {
    if (!window.confirm(`[${mat.title}] 자료를 정말 삭제하시겠습니까?`)) {
      return;
    }
    try {
      await api.deleteMaterial(mat.id);
      await loadData();
      alert('자료가 삭제되었습니다.');
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : '자료 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleSaveMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMatTitle.trim() || !newMatCourse.trim()) {
      alert('자료 제목과 전공 과목명을 입력해주세요.');
      return;
    }
    try {
      setIsSubmittingMaterial(true);
      if (editingMaterial) {
        await api.updateMaterial(editingMaterial.id, {
          grade: newMatGrade,
          semester: newMatSemester,
          course_name: newMatCourse.trim(),
          title: newMatTitle.trim(),
          description: newMatDescription.trim(),
          category: newMatCategory,
          file_name: newMatFileName.trim() || editingMaterial.file_name || `${newMatCourse}_참고자료.pdf`,
          file_size: newMatFileSize.trim() || editingMaterial.file_size || '2.5MB',
          ...(newMatFileDataUrl ? { file_url: newMatFileDataUrl } : {})
        });
        alert('자료가 성공적으로 수정되었습니다!');
      } else {
        await api.createMaterial({
          grade: newMatGrade,
          semester: newMatSemester,
          course_name: newMatCourse.trim(),
          title: newMatTitle.trim(),
          description: newMatDescription.trim(),
          category: newMatCategory,
          file_name: newMatFileName.trim() || `${newMatCourse}_참고자료.pdf`,
          file_size: newMatFileSize.trim() || '2.5MB',
          file_url: newMatFileDataUrl || undefined
        });
        alert('자료와 첨부파일이 성공적으로 자료실에 등록되었습니다!');
      }
      await loadData();
      setIsCreateMaterialModalOpen(false);
      setEditingMaterial(null);
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : '자료 저장 중 오류가 발생했습니다.');
    } finally {
      setIsSubmittingMaterial(false);
    }
  };

  // Filter Academic Materials by grade & semester & course & search
  const currentGradeCourses = KNOU_CS_COURSES[selectedGrade][selectedSemester] || [];
  const filteredMaterials = materials.filter((m) => {
    const matchesGrade = m.grade === selectedGrade;
    const matchesSemester = m.semester === selectedSemester;
    const matchesCourse = selectedCourse === '전체' ? true : m.course_name === selectedCourse;
    const matchesSearch =
      materialSearchQuery.trim() === '' ||
      m.title.toLowerCase().includes(materialSearchQuery.toLowerCase()) ||
      m.course_name.toLowerCase().includes(materialSearchQuery.toLowerCase()) ||
      m.description.toLowerCase().includes(materialSearchQuery.toLowerCase());
    return matchesGrade && matchesSemester && matchesCourse && matchesSearch;
  });

  // Filter Other Materials (category = 기타자료)
  const otherMaterials = materials.filter((m) => {
    if (m.category !== '기타자료') return false;
    if (otherCategoryFilter === '전체') return true;
    return m.course_name.includes(otherCategoryFilter) || m.title.includes(otherCategoryFilter);
  });

  // Filter Studies
  const filteredStudies = studies.filter((s) => {
    if (selectedStudyStatus === '전체') return true;
    if (selectedStudyStatus === '마감·종료') return s.status === '마감' || s.status === '종료';
    return s.status === selectedStudyStatus;
  });

  return (
    <div className="space-y-10">
      {/* Editorial Page Header */}
      <div className="border-b border-slate-200 pb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4 sm:gap-5">
          <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-22 md:h-22 rounded-2xl bg-blue-50/70 border border-blue-100 p-1.5 shrink-0 flex items-center justify-center shadow-xs">
            <img
              src={ASSETS.characters.practice}
              alt="학술 실습 마스코트"
              className="w-full h-full object-contain drop-shadow-xs"
            />
          </div>
          <div>
            <div className="flex items-center gap-2 text-[11px] font-semibold text-blue-700 tracking-wider uppercase mb-1">
              <span>Academic Resources & Study Groups</span>
            </div>
            <h1 className="font-knou text-2xl sm:text-3xl md:text-4xl font-bold text-slate-950 tracking-tight mb-2">
              학술·스터디
            </h1>
            <p className="text-slate-700 text-sm sm:text-base max-w-xl leading-relaxed font-normal">
              방송대 컴퓨터과학과 학년별·학기별 전공과목 학습자료와 기타 유용한 IT 자료실, 학우 스터디 모임을 지원합니다.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
          {activeTab === 'materials' && (
            <button
              onClick={() => requireLogin() && openCreateModal('출석수업요약')}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm transition-colors shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              학습자료 등록
            </button>
          )}
          {activeTab === 'studies' && (
            <button
              onClick={() => requireLogin() && setIsCreateStudyModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm transition-colors shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              스터디 개설 신청
            </button>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-1">
        <button
          onClick={() => setActiveTab('materials')}
          className={`px-5 py-3.5 text-sm sm:text-base font-bold rounded-t-xl transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'materials'
              ? 'bg-white text-blue-700 border-t-2 border-x border-blue-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
          }`}
        >
          <BookOpen className="w-4.5 h-4.5 text-blue-600" />
          학습자료 (학년·학기별 전공자료)
        </button>
        <button
          onClick={() => setActiveTab('other')}
          className={`px-5 py-3.5 text-sm sm:text-base font-bold rounded-t-xl transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'other'
              ? 'bg-white text-blue-700 border-t-2 border-x border-blue-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
          }`}
        >
          <FolderArchive className="w-4.5 h-4.5 text-indigo-600" />
          기타자료 (개발환경·도구·IT)
        </button>
        <button
          onClick={() => setActiveTab('studies')}
          className={`px-5 py-3.5 text-sm sm:text-base font-bold rounded-t-xl transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'studies'
              ? 'bg-white text-blue-700 border-t-2 border-x border-blue-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
          }`}
        >
          <Users className="w-4.5 h-4.5 text-emerald-600" />
          스터디 ({studies.length})
        </button>
      </div>

      {/* ============================================================ */}
      {/* TAB 1: 학습자료 (학년별 / 학기별 전공과목 나열 자료실)        */}
      {/* ============================================================ */}
      {activeTab === 'materials' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Grade & Semester Selector Banner */}
          <div className="bg-slate-900 text-white p-6 sm:p-7 rounded-3xl border border-slate-800 shadow-lg space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-400/30">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white">학년 및 학기 선택</h3>
                  <p className="text-xs sm:text-sm text-slate-300">원하시는 학년과 학기를 선택하시면 개설 전공과목별 자료가 표시됩니다.</p>
                </div>
              </div>

              {/* Semester Toggle */}
              <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 shrink-0">
                <button
                  onClick={() => {
                    setSelectedSemester(1);
                    setSelectedCourse('전체');
                  }}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    selectedSemester === 1
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  1학기 개설과목
                </button>
                <button
                  onClick={() => {
                    setSelectedSemester(2);
                    setSelectedCourse('전체');
                  }}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    selectedSemester === 2
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  2학기 개설과목 (현재)
                </button>
              </div>
            </div>

            {/* Grade Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {([1, 2, 3, 4] as const).map((grade) => (
                <button
                  key={grade}
                  onClick={() => {
                    setSelectedGrade(grade);
                    setSelectedCourse('전체');
                  }}
                  className={`p-3.5 rounded-2xl border text-center transition-all ${
                    selectedGrade === grade
                      ? 'bg-blue-500/20 border-blue-400 text-white shadow-xs ring-1 ring-blue-400'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <span className="block text-xs text-blue-300 font-semibold mb-0.5">컴퓨터과학과</span>
                  <strong className="text-base sm:text-lg font-bold block">{grade}학년 전공</strong>
                </button>
              ))}
            </div>
          </div>

          {/* Course Pills and Search Bar */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  {selectedGrade}학년 {selectedSemester}학기 전공 교과목 목록
                </span>
                <h4 className="text-lg font-bold text-slate-900">
                  과목을 선택하여 맞춤 학습자료를 확인하세요
                </h4>
              </div>

              {/* Search input */}
              <div className="relative min-w-[240px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={materialSearchQuery}
                  onChange={(e) => setMaterialSearchQuery(e.target.value)}
                  placeholder="자료명, 내용 검색..."
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Course Selector Buttons */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <button
                onClick={() => setSelectedCourse('전체')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                  selectedCourse === '전체'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200/70'
                }`}
              >
                과목 전체 ({filteredMaterials.length})
              </button>
              {currentGradeCourses.map((course) => (
                <button
                  key={course}
                  onClick={() => setSelectedCourse(course)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all border ${
                    selectedCourse === course
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {course}
                </button>
              ))}
            </div>
          </div>

          {/* Materials Cards Grid */}
          {filteredMaterials.length === 0 ? (
            <div className="bg-white rounded-3xl p-16 text-center border border-slate-200 text-slate-500 text-base font-medium">
              선택하신 과목의 학습자료가 아직 등록되지 않았습니다. 우측 상단의 [학습자료 등록]을 통해 첫 번째 자료를 공유해 주세요!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredMaterials.map((mat) => (
                <div
                  key={mat.id}
                  className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-800">
                          {mat.course_name}
                        </span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                          {mat.category}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 font-medium">
                        {mat.grade}학년 {mat.semester}학기
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug hover:text-blue-600 transition-colors">
                      {mat.title}
                    </h3>

                    <p className="text-sm text-slate-600 leading-relaxed line-clamp-2">
                      {mat.description}
                    </p>

                    {mat.file_name && (
                      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs text-slate-600">
                        <span className="font-semibold text-slate-800 truncate max-w-[220px] flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                          {mat.file_name}
                        </span>
                        <span className="text-slate-400 shrink-0 ml-2">{mat.file_size || 'PDF'}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                    <div className="text-xs text-slate-500 font-medium">
                      <span>작성: {mat.author}</span>
                      <span className="mx-2">•</span>
                      <span>다운로드 {mat.downloads}회</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {canModify(mat.author_id) && (<><button
                        onClick={() => openEditModal(mat)}
                        title="자료 수정"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 font-medium text-xs transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        수정
                      </button>
                      <button
                        onClick={() => handleDeleteMaterial(mat)}
                        title="자료 삭제"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 text-red-600 font-medium text-xs transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        삭제
                      </button></>)}
                      <button
                        onClick={() => handleDownload(mat)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs sm:text-sm transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        자료 받기
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: 기타자료 (개발도구, 환경셋팅, 자격증, IT 교양)         */}
      {/* ============================================================ */}
      {activeTab === 'other' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-3xl p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <FolderArchive className="w-6 h-6 text-indigo-700" />
                <h3 className="font-bold text-indigo-950 text-lg">기타 학습 & IT 실무 자료실</h3>
              </div>
              <p className="text-sm sm:text-base text-indigo-900 leading-relaxed">
                VS Code·Git/GitHub 개발환경 셋팅 매뉴얼, Wireshark 패킷 분석 툴, 정보처리기사 자격증 기출 등 학우들의 실무 역량 강화를 위한 유용한 자료 모음입니다.
              </p>
            </div>
            <button
              onClick={() => requireLogin() && openCreateModal('기타자료')}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shrink-0 self-start sm:self-center shadow-xs transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              기타자료 등록
            </button>
          </div>

          {/* Filter categories */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {['전체', '개발환경', '네트워크', '자격증'].map((cat) => (
              <button
                key={cat}
                onClick={() => setOtherCategoryFilter(cat)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all border ${
                  otherCategoryFilter === cat
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Other Materials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {otherMaterials.map((mat) => (
              <div
                key={mat.id}
                className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs hover:border-indigo-400 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-indigo-100 text-indigo-800">
                      {mat.category}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">등록일: {mat.created_at}</span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                    {mat.title}
                  </h3>

                  <p className="text-sm text-slate-600 leading-relaxed">
                    {mat.description}
                  </p>

                  {mat.file_name && (
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs text-slate-600">
                      <span className="font-semibold text-slate-800 truncate max-w-[220px] flex items-center gap-1.5">
                        <FileCode className="w-4 h-4 text-indigo-600 shrink-0" />
                        {mat.file_name}
                      </span>
                      <span className="text-slate-400 shrink-0">{mat.file_size || '첨부'}</span>
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-xs text-slate-500 font-medium">
                    작성자: {mat.author} | 다운로드 {mat.downloads}회
                  </span>
                  <div className="flex items-center gap-1.5">
                    {canModify(mat.author_id) && (<><button
                      onClick={() => openEditModal(mat)}
                      title="자료 수정"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 font-medium text-xs transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      수정
                    </button>
                    <button
                      onClick={() => handleDeleteMaterial(mat)}
                      title="자료 삭제"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 text-red-600 font-medium text-xs transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      삭제
                    </button></>)}
                    <button
                      onClick={() => handleDownload(mat)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs sm:text-sm transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      다운로드
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 3: 스터디 그룹 목록 (이름: 스터디)                      */}
      {/* ============================================================ */}
      {activeTab === 'studies' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Admin Notice Pill (if logged in) */}
          {isAdmin && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm text-amber-950 font-medium">
              <div className="flex items-center gap-2.5">
                <Shield className="w-5 h-5 text-amber-600 shrink-0" />
                <span className="font-bold">관리자 접속 중:</span>
                <span>스터디 상태 변경(모집중/진행중/마감) 및 삭제(해체)는 관리자 센터에서 바로 가능합니다.</span>
              </div>
              <a
                href="/admin"
                className="font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1.5 shrink-0"
              >
                관리자 센터
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">스터디 소그룹 목록</h2>
              <p className="text-sm sm:text-base text-slate-600 mt-0.5">
                광주전남지역대학 컴퓨터과학과 학우들이 자율적으로 모여 운영하는 학술 스터디입니다.
              </p>
            </div>

            {/* Status Filter Pills */}
            <div className="flex items-center gap-1.5 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs">
              <Filter className="w-4 h-4 text-slate-400 ml-1.5 hidden sm:inline" />
              {['전체', '모집중', '진행중', '마감·종료'].map((opt) => (
                <button
                  key={opt}
                  onClick={() => setSelectedStudyStatus(opt)}
                  className={`px-3.5 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                    selectedStudyStatus === opt
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {filteredStudies.length === 0 ? (
            <div className="bg-white rounded-3xl p-16 text-center border border-slate-200 text-slate-500 text-base font-medium">
              해당 조건의 스터디 그룹이 없습니다.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredStudies.map((study) => (
                <div
                  key={study.id}
                  className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3.5">
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full ${
                          study.status === '모집중'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : study.status === '진행중'
                            ? 'bg-blue-100 text-blue-800 border border-blue-300'
                            : 'bg-slate-100 text-slate-700 border border-slate-300'
                        }`}
                      >
                        {study.status}
                      </span>
                      <span className="text-sm text-slate-600 font-bold">
                        인원: {study.members_count} / {study.max_members}명
                      </span>
                    </div>

                    {study.approval && study.approval !== 'approved' && (
                      <p className="mb-2 inline-block text-xs font-bold px-2.5 py-1 rounded-md bg-amber-100 text-amber-800 border border-amber-300">
                        {study.approval === 'pending' ? '승인 대기 중 (신청자에게만 보입니다)' : '반려됨'}
                      </p>
                    )}
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-1.5 leading-snug">
                      {study.title}
                    </h3>

                    <p className="text-sm font-bold text-blue-700 mb-3.5">
                      주제: {study.subject}
                    </p>

                    <div className="space-y-2 text-sm text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-5">
                      <div className="flex items-center gap-2.5">
                        <Laptop className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>진행 방식: <strong className="text-slate-900">{study.meeting_type}</strong></span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <Users className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>대상 학년: <strong className="text-slate-900">{study.target_grade}</strong></span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <Sparkles className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>개설자: <strong className="text-slate-900">{study.leader}</strong></span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedStudy(study);
                      setIsStudyApplyModalOpen(true);
                    }}
                    disabled={study.status === '종료' || study.status === '마감'}
                    className={`w-full py-3 px-5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                      study.status === '종료' || study.status === '마감'
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                    }`}
                  >
                    <MessageCircle className="w-4.5 h-4.5" />
                    {study.status === '종료' || study.status === '마감' ? '모집 마감된 스터디' : '스터디 참여 문의'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Apply Info Modal */}
      {isStudyApplyModalOpen && selectedStudy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 p-6 sm:p-7 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-lg text-slate-900">스터디 참여 문의</h3>
              <button
                onClick={() => setIsStudyApplyModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm sm:text-base text-slate-700 mb-4 leading-relaxed">
              선택하신 <span className="font-bold text-blue-700">[{selectedStudy.title}]</span> 스터디에 참여를 희망하시나요?
            </p>

            <div className="bg-blue-50 p-5 rounded-2xl text-sm text-blue-950 space-y-2.5 mb-5 border border-blue-100 leading-relaxed">
              <p className="font-bold text-blue-950 text-base">참여 방법 안내:</p>
              {selectedStudy.leader_contact ? (
                <div className="bg-white p-3 rounded-xl border border-blue-200">
                  <span className="font-semibold text-slate-700">개설자 직접 연락처:</span>
                  <p className="font-bold text-blue-700 mt-1 text-base break-all">{selectedStudy.leader_contact}</p>
                </div>
              ) : null}
              <p>1. 광주전남 컴퓨터과학과 학생회 오픈카톡방 또는 학술부장에게 학번과 성함을 알려주세요.</p>
              <p>2. 스터디 리더({selectedStudy.leader})에게 전달 후 스터디 모임 단톡방 및 온라인 회의 링크를 전달해 드립니다.</p>
            </div>

            <button
              onClick={() => setIsStudyApplyModalOpen(false)}
              className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm sm:text-base transition-colors"
            >
              확인 완료
            </button>
          </div>
        </div>
      )}

      {/* Create Study Modal */}
      {isCreateStudyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 p-6 sm:p-7 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-lg text-slate-900">새 스터디 그룹 개설 신청</h3>
              <button
                onClick={() => setIsCreateStudyModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStudy} className="space-y-4 text-sm">
              <div>
                <label className="block font-bold text-slate-800 mb-1.5">스터디 명칭</label>
                <input
                  type="text"
                  required
                  value={newStudyTitle}
                  onChange={(e) => setNewStudyTitle(e.target.value)}
                  placeholder="예: 2학기 자료구조 스터디반"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1.5">주요 학습 주제/교과목</label>
                <input
                  type="text"
                  required
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="예: 자료구조, 백준 알고리즘"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1.5">진행 방식</label>
                <select
                  value={newMeetingType}
                  onChange={(e) => setNewMeetingType(e.target.value as any)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="온/오프라인 병행">온/오프라인 병행</option>
                  <option value="온라인 (Zoom/Discord)">온라인 (Zoom/Discord)</option>
                  <option value="오프라인 (광주지역대학)">오프라인 (광주지역대학)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1.5">모집 정원 (명)</label>
                <input
                  type="number"
                  min={2}
                  max={20}
                  value={newMaxMembers}
                  onChange={(e) => setNewMaxMembers(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1.5">개설자</label>
                  <div className="w-full px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-sm font-semibold">{member?.nickname}</div>
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1.5">연락처 / 카톡 링크</label>
                  <input
                    type="text"
                    value={newLeaderContact}
                    onChange={(e) => setNewLeaderContact(e.target.value)}
                    placeholder="오픈카톡 링크 등"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1.5">소개 / 목표 (선택)</label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="스터디 진행 계획 및 목표..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-3.5 border-t border-slate-100 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsCreateStudyModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingStudy}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmittingStudy ? '신청 중...' : '개설 신청'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create / Edit Material Modal */}
      {isCreateMaterialModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 p-6 sm:p-7 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-lg text-slate-900">
                {editingMaterial ? '학습자료 수정' : '학습자료 및 기타자료 등록'}
              </h3>
              <button
                onClick={() => {
                  setIsCreateMaterialModalOpen(false);
                  setEditingMaterial(null);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMaterial} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">대상 학년</label>
                  <select
                    value={newMatGrade}
                    onChange={(e) => setNewMatGrade(Number(e.target.value) as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50"
                  >
                    <option value={1}>1학년</option>
                    <option value={2}>2학년</option>
                    <option value={3}>3학년</option>
                    <option value={4}>4학년</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">개설 학기</label>
                  <select
                    value={newMatSemester}
                    onChange={(e) => setNewMatSemester(Number(e.target.value) as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50"
                  >
                    <option value={1}>1학기</option>
                    <option value={2}>2학기</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    {newMatCategory === '기타자료' ? '구분/소프트웨어명 *' : '전공 교과목명 *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={newMatCourse}
                    onChange={(e) => setNewMatCourse(e.target.value)}
                    placeholder={newMatCategory === '기타자료' ? '예: VS Code, Git, 정보처리기사' : '예: C프로그래밍, 자료구조'}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">자료 분류</label>
                  <select
                    value={newMatCategory}
                    onChange={(e) => setNewMatCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50"
                  >
                    <option value="출석수업요약">출석수업요약</option>
                    <option value="기출문제/해설">기출문제/해설</option>
                    <option value="과제물참고자료">과제물참고자료</option>
                    <option value="강의노트">강의노트</option>
                    <option value="기타자료">기타자료 (개발환경/IT/자격증)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">자료 제목 *</label>
                <input
                  type="text"
                  required
                  value={newMatTitle}
                  onChange={(e) => setNewMatTitle(e.target.value)}
                  placeholder="예: C프로그래밍 포인터 핵심 요약"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">상세 설명</label>
                <textarea
                  rows={3}
                  value={newMatDescription}
                  onChange={(e) => setNewMatDescription(e.target.value)}
                  placeholder="자료에 대한 주요 내용 및 참고사항을 적어주세요."
                  className="w-full p-3 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  자료 파일 첨부 (PDF, HWP, ZIP, 코드 등)
                </label>
                <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-4 transition-colors bg-slate-50 text-center relative cursor-pointer">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    accept=".pdf,.hwp,.hwpx,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.rar,.7z,.txt,.c,.cpp,.java,.py,.sql,.html,.css,.js"
                  />
                  {newMatFileName ? (
                    <div className="flex items-center justify-between px-3 py-2 bg-blue-50 border border-blue-200 rounded-xl text-left">
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="w-5 h-5 text-blue-600 shrink-0" />
                        <span className="font-bold text-xs sm:text-sm text-slate-800 truncate">
                          {newMatFileName}
                        </span>
                        <span className="text-xs text-blue-600 font-semibold shrink-0">
                          ({newMatFileSize})
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 hover:text-slate-800 shrink-0 ml-2">
                        변경
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-1.5 py-2">
                      <Upload className="w-7 h-7 text-slate-400 mx-auto" />
                      <p className="text-xs sm:text-sm font-semibold text-slate-700">
                        클릭하여 파일을 선택하거나 이곳으로 드래그하세요
                      </p>
                      <p className="text-[11px] text-slate-500">
                        PDF, HWP, Office 문서, 압축파일, 소스코드 등 (최대 1MB)
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">작성자</label>
                <div className="w-full px-3 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold">{editingMaterial ? editingMaterial.author : member?.nickname}</div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateMaterialModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingMaterial}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmittingMaterial
                    ? '저장 중...'
                    : editingMaterial
                    ? '수정 완료하기'
                    : '자료 등록하기'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
