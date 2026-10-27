import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { showConfirm } from './ui/GlobalDialog';
import type { CurriculumCourse } from '../lib/types';
import {
  BookOpen,
  PlusCircle,
  Edit2,
  Trash2,
  Search,
  RefreshCw,
  X
} from 'lucide-react';

export const AdminCurriculumManager: React.FC = () => {
  const [courses, setCourses] = useState<CurriculumCourse[]>([]);
  const [loading, setLoading] = useState(true);

  // 필터 State
  const [filterGrade, setFilterGrade] = useState<number | '전체'>('전체');
  const [filterSemester, setFilterSemester] = useState<number | '전체'>('전체');
  const [filterType, setFilterType] = useState<string>('전체');
  const [searchQuery, setSearchQuery] = useState('');

  // 모달 State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CurriculumCourse | null>(null);

  // Form State
  const [formGrade, setFormGrade] = useState<1 | 2 | 3 | 4>(1);
  const [formSemester, setFormSemester] = useState<1 | 2>(1);
  const [formType, setFormType] = useState<'전공' | '교양' | '일반선택'>('전공');
  const [formName, setFormName] = useState('');
  const [formSortOrder, setFormSortOrder] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const data = await api.getCourses();
      setCourses(data);
    } catch (err) {
      console.error(err);
      alert('교과목 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingCourse(null);
    setFormGrade(typeof filterGrade === 'number' ? (filterGrade as 1 | 2 | 3 | 4) : 1);
    setFormSemester(typeof filterSemester === 'number' ? (filterSemester as 1 | 2) : 1);
    setFormType(filterType !== '전체' ? (filterType as any) : '전공');
    setFormName('');
    setFormSortOrder(courses.length + 1);
    setIsModalOpen(true);
  };

  const openEditModal = (course: CurriculumCourse) => {
    setEditingCourse(course);
    setFormGrade(course.grade);
    setFormSemester(course.semester);
    setFormType(course.course_type);
    setFormName(course.course_name);
    setFormSortOrder(course.sort_order || 0);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert('교과목명을 입력해 주세요.');
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingCourse) {
        await api.updateCourse(editingCourse.id, {
          grade: formGrade,
          semester: formSemester,
          course_type: formType,
          course_name: formName.trim(),
          sort_order: formSortOrder,
        });
        alert('교과목 정보가 성공적으로 수정되었습니다.');
      } else {
        await api.createCourse({
          grade: formGrade,
          semester: formSemester,
          course_type: formType,
          course_name: formName.trim(),
          sort_order: formSortOrder,
        });
        alert('새 교과목이 성공적으로 등록되었습니다.');
      }
      setIsModalOpen(false);
      setEditingCourse(null);
      await loadCourses();
    } catch (err: any) {
      alert(err.message || '저장 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (course: CurriculumCourse) => {
    if (
      !(await showConfirm({
        title: '교과목 삭제 확인',
        message: `[${course.grade}학년 ${course.semester}학기] ${course.course_name} (${course.course_type}) 교과목을 삭제하시겠습니까?`,
        subMessage: '삭제 시 학습자료실의 과목 필터 및 드롭다운 목록에서도 제외됩니다.',
        confirmText: '삭제하기',
        variant: 'danger'
      }))
    ) {
      return;
    }

    try {
      await api.deleteCourse(course.id);
      alert('교과목이 삭제되었습니다.');
      await loadCourses();
    } catch (err: any) {
      alert(err.message || '삭제 중 오류가 발생했습니다.');
    }
  };

  const handleReset = async () => {
    if (
      !(await showConfirm({
        title: '2026 정규 교육과정 복원',
        message: '2026년 정규 교육과정 52개 교과목으로 전체 복원하시겠습니까?',
        subMessage: '현재 수동으로 추가/변경하신 교과목 목록이 초기화되고 공식 교육과정 목록으로 덮어씌워집니다.',
        confirmText: '복원 진행',
        variant: 'warning'
      }))
    ) {
      return;
    }

    try {
      setLoading(true);
      await api.resetCourses();
      alert('2026년 정규 교육과정 52개 교과목으로 성공적으로 복원되었습니다.');
      await loadCourses();
    } catch (err: any) {
      alert(err.message || '복원 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 필터링된 교과목 목록
  const filteredCourses = courses.filter((c) => {
    const matchesGrade = filterGrade === '전체' ? true : c.grade === filterGrade;
    const matchesSemester = filterSemester === '전체' ? true : c.semester === filterSemester;
    const matchesType = filterType === '전체' ? true : c.course_type === filterType;
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery = q === '' || c.course_name.toLowerCase().includes(q);
    return matchesGrade && matchesSemester && matchesType && matchesQuery;
  });

  // 교과구분별 통계
  const countMajor = courses.filter((c) => c.course_type === '전공').length;
  const countGeneral = courses.filter((c) => c.course_type === '교양').length;
  const countElective = courses.filter((c) => c.course_type === '일반선택').length;

  const getTypeBadgeClass = (type: string) => {
    switch (type) {
      case '전공':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case '교양':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case '일반선택':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Statistics */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                <BookOpen className="w-5 h-5" />
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">개설 교육과정 교과목 관리</h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-2xl">
              컴퓨터과학과 학년별·학기별 개설 교과목(전공, 교양, 일반선택)을 실시간으로 추가, 수정, 삭제합니다.
              여기서 변경된 과목은 <strong>학술·스터디 학습자료실의 필터 및 등록 드롭다운</strong>에 즉시 연동됩니다.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={handleReset}
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
              title="2026년 공식 교육과정 목록으로 리셋"
            >
              <RefreshCw className="w-4 h-4 text-slate-500" />
              <span>2026 기본과목 복원</span>
            </button>

            <button
              onClick={openCreateModal}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>새 교과목 추가</span>
            </button>
          </div>
        </div>

        {/* Counter Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="text-xs font-semibold text-slate-500 block mb-1">전체 등록 과목</span>
            <strong className="text-2xl font-bold text-slate-900">{courses.length}개</strong>
          </div>
          <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/80">
            <span className="text-xs font-semibold text-blue-700 block mb-1">전공 과목</span>
            <strong className="text-2xl font-bold text-blue-800">{countMajor}개</strong>
          </div>
          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80">
            <span className="text-xs font-semibold text-emerald-700 block mb-1">교양 과목</span>
            <strong className="text-2xl font-bold text-emerald-800">{countGeneral}개</strong>
          </div>
          <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200/80">
            <span className="text-xs font-semibold text-purple-700 block mb-1">일반선택 과목</span>
            <strong className="text-2xl font-bold text-purple-800">{countElective}개</strong>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {/* Grade Filter */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              {(['전체', 1, 2, 3, 4] as const).map((g) => (
                <button
                  key={g}
                  onClick={() => setFilterGrade(g)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    filterGrade === g
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {g === '전체' ? '전학년' : `${g}학년`}
                </button>
              ))}
            </div>

            {/* Semester Filter */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              {(['전체', 1, 2] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterSemester(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    filterSemester === s
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {s === '전체' ? '전학기' : `${s}학기`}
                </button>
              ))}
            </div>

            {/* Type Filter */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              {(['전체', '전공', '교양', '일반선택'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    filterType === t
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Search Input */}
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="교과목명 검색..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Courses List Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-20 text-center text-slate-400 text-sm">교과목 정보를 불러오는 중입니다...</div>
        ) : filteredCourses.length === 0 ? (
          <div className="py-20 text-center text-slate-400 text-sm">
            조건에 일치하는 개설 교과목이 없습니다.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                  <th className="py-3.5 px-4 w-20 text-center">학년</th>
                  <th className="py-3.5 px-4 w-20 text-center">학기</th>
                  <th className="py-3.5 px-4 w-28 text-center">교과 구분</th>
                  <th className="py-3.5 px-6">교과목명</th>
                  <th className="py-3.5 px-4 w-24 text-center">정렬 순서</th>
                  <th className="py-3.5 px-6 w-32 text-center">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCourses.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                      {c.grade}학년
                    </td>
                    <td className="py-3.5 px-4 text-center font-semibold text-slate-600">
                      {c.semester}학기
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getTypeBadgeClass(c.course_type)}`}>
                        {c.course_type}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 font-bold text-slate-900 text-sm sm:text-base">
                      {c.course_name}
                    </td>
                    <td className="py-3.5 px-4 text-center text-slate-500 font-mono text-xs">
                      {c.sort_order || 0}
                    </td>
                    <td className="py-3.5 px-6 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => openEditModal(c)}
                          className="p-1.5 rounded-lg text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors cursor-pointer"
                          title="교과목 수정"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(c)}
                          className="p-1.5 rounded-lg text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
                          title="교과목 삭제"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Create or Edit Course */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-base">
                  {editingCourse ? '개설 교과목 수정' : '새 개설 교과목 추가'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 leading-relaxed">
                💡 <strong>안내</strong>: 여기서 등록하거나 수정한 교과목은 <strong>학술·스터디 학습자료실의 과목 필터 및 등록 드롭다운 목록</strong>에 실시간으로 즉시 반영됩니다.
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">대상 학년 *</label>
                  <select
                    value={formGrade}
                    onChange={(e) => setFormGrade(Number(e.target.value) as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 font-semibold bg-white"
                  >
                    <option value={1}>1학년</option>
                    <option value={2}>2학년</option>
                    <option value={3}>3학년</option>
                    <option value={4}>4학년</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">개설 학기 *</label>
                  <select
                    value={formSemester}
                    onChange={(e) => setFormSemester(Number(e.target.value) as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 font-semibold bg-white"
                  >
                    <option value={1}>1학기</option>
                    <option value={2}>2학기</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">교과 구분 *</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['전공', '교양', '일반선택'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setFormType(t)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        formType === t
                          ? t === '전공'
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : t === '교양'
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-purple-600 text-white border-purple-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">교과목명 *</label>
                <input
                  type="text"
                  required
                  placeholder="예: 클라우드컴퓨팅, 데이터베이스시스템"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">정렬 순서</label>
                <input
                  type="number"
                  min={0}
                  value={formSortOrder}
                  onChange={(e) => setFormSortOrder(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">숫자가 작을수록 필터 및 드롭다운 목록 앞쪽에 배치됩니다.</p>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? '저장 중...' : editingCourse ? '교과목 수정' : '교과목 추가'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
