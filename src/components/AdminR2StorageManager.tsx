import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { showConfirm } from './ui/GlobalDialog';
import {
  HardDrive,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  ExternalLink,
  ShieldAlert,
  FileText,
  Image as ImageIcon,
  Receipt,
  FileCode,
  Download,
  Database
} from 'lucide-react';

interface StorageStats {
  used_bytes: number;
  file_count: number;
  used_gb: number;
  max_gb: number;
  max_bytes: number;
  percent: number;
  is_blocked: boolean;
  recent_files?: Array<{
    key: string;
    file_name: string;
    size: number;
    category: string;
    uploaded_by: string;
    uploaded_at: string;
  }>;
}

export const AdminR2StorageManager: React.FC = () => {
  const [stats, setStats] = useState<StorageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [deletingKey, setDeletingKey] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('전체');

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await api.getR2StorageStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load R2 storage stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleSync = async () => {
    if (
      !(await showConfirm({
        title: '파일 저장소 재스캔 및 동기화',
        message: '파일 저장소의 실제 파일 목록과 용량을 재스캔하여 동기화하시겠습니까?',
        subMessage: '버킷 내 모든 객체를 조회하여 D1 통계 및 파일 목록을 최신 상태로 갱신합니다.',
        confirmText: '동기화 실행',
        variant: 'info'
      }))
    ) {
      return;
    }
    try {
      setSyncing(true);
      const res = await api.syncR2StorageStats();
      alert(res.message || '파일 저장소와의 동기화가 완료되었습니다.');
      await loadStats();
    } catch (err: any) {
      alert(err.message || '동기화 중 오류가 발생했습니다.');
    } finally {
      setSyncing(false);
    }
  };

  const handleDeleteFile = async (key: string, fileName: string) => {
    if (
      !(await showConfirm({
        title: '파일 영구 삭제',
        message: `[${fileName}] 파일을 저장소에서 영구 삭제하시겠습니까?`,
        subMessage: '이 작업은 취소할 수 없으며 삭제 즉시 저장 용량이 확보됩니다.',
        confirmText: '영구 삭제',
        variant: 'danger'
      }))
    ) {
      return;
    }
    try {
      setDeletingKey(key);
      const ok = await api.deleteUploadedFile(key);
      if (ok) {
        alert('파일이 성공적으로 삭제되었습니다.');
        await loadStats();
      } else {
        alert('파일 삭제에 실패했습니다.');
      }
    } catch (err: any) {
      alert(err.message || '삭제 중 오류가 발생했습니다.');
    } finally {
      setDeletingKey(null);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1000 * 1000 * 1000) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1000 * 1000 * 1000)).toFixed(3)} GB`;
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'materials':
        return { label: '학습자료', bg: 'bg-blue-50 text-blue-700 border-blue-200', icon: FileText };
      case 'activities':
        return { label: '활동사진', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: ImageIcon };
      case 'receipts':
        return { label: '결산영수증', bg: 'bg-amber-50 text-amber-700 border-amber-200', icon: Receipt };
      case 'minutes':
        return { label: '회의록문서', bg: 'bg-purple-50 text-purple-700 border-purple-200', icon: FileCode };
      default:
        return { label: cat || '일반', bg: 'bg-slate-100 text-slate-700 border-slate-200', icon: Database };
    }
  };

  const usedBytes = stats?.used_bytes || 0;
  const maxBytes = stats?.max_bytes || 9.9 * 1000 * 1000 * 1000;
  const usedGB = stats?.used_gb || 0;
  const maxGB = stats?.max_gb || 9.9;
  const percent = stats?.percent || 0;
  const isBlocked = stats?.is_blocked || usedBytes >= maxBytes;
  const remainingBytes = Math.max(0, maxBytes - usedBytes);
  const remainingGB = (remainingBytes / (1000 * 1000 * 1000)).toFixed(3);

  const filteredFiles = (stats?.recent_files || []).filter((f) => {
    if (filterCategory === '전체') return true;
    return f.category === filterCategory;
  });

  return (
    <div className="space-y-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-600 flex items-center justify-center">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                파일 저장소 용량 관리
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-blue-100 text-blue-700">
                  9.9GB 안전 상한제
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                무료 제공 용량(10GB)을 초과하여 과금되지 않도록 9.9GB 도달 시 추가 업로드를 자동 차단합니다.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleSync}
          disabled={syncing || loading}
          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-2 self-start sm:self-center transition-colors cursor-pointer disabled:opacity-50"
          title="파일 저장소와 실제 용량 동기화"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin text-blue-600' : ''}`} />
          <span>{syncing ? '버킷 스캔 중...' : '스토리지 용량 동기화'}</span>
        </button>
      </div>

      {/* Storage Gauge Card */}
      <div className="p-6 rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-cyan-50/30 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-xs font-semibold text-slate-500">현재 스토리지 사용량</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-baseline gap-2">
              <span>{usedGB} GB</span>
              <span className="text-sm font-semibold text-slate-400">/ {maxGB} GB</span>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                isBlocked
                  ? 'bg-rose-100 text-rose-700 border border-rose-200 animate-pulse'
                  : percent > 80
                  ? 'bg-amber-100 text-amber-700 border border-amber-200'
                  : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
              }`}>
                {isBlocked ? '업로드 차단됨 (9.9GB 도달)' : percent > 80 ? '용량 주의' : '정상 (무료 범위)'}
              </span>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <div className="text-xs font-semibold text-slate-500">잔여 여유 공간</div>
            <div className="text-base sm:text-lg font-bold text-cyan-700">
              {remainingGB} GB 여유
            </div>
            <div className="text-[11px] text-slate-400">
              총 {stats?.file_count || 0}개 파일 저장됨
            </div>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="space-y-1.5">
          <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden p-0.5 shadow-inner">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isBlocked
                  ? 'bg-rose-500'
                  : percent > 80
                  ? 'bg-amber-500'
                  : 'bg-gradient-to-r from-blue-500 to-cyan-500'
              }`}
              style={{ width: `${Math.min(100, Math.max(0.5, percent))}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[11px] text-slate-500 font-medium">
            <span>0 GB</span>
            <span className="font-bold text-slate-700">{percent}% 사용 중</span>
            <span>한도: 9.9 GB (무료 10GB 이내)</span>
          </div>
        </div>

        {/* Warning Alert if blocked or near limit */}
        {isBlocked ? (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800 text-xs">
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold">스토리지 사용량이 9.9GB에 도달하여 신규 업로드가 차단되었습니다.</strong>
              <p className="mt-0.5 text-rose-700">
                유료 과금을 방지하기 위해 자동 차단되었습니다. 아래 파일 목록에서 더 이상 사용하지 않는 대용량 자료를 삭제하시면 즉시 용량이 확보되어 업로드가 재개됩니다.
              </p>
            </div>
          </div>
        ) : percent > 80 ? (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-2.5 text-amber-800 text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              사용량이 80%를 초과했습니다. 9.9GB에 도달하면 무료 플랜 보호를 위해 자동으로 파일 업로드가 차단됩니다.
            </span>
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 flex items-center gap-2 text-blue-800 text-xs">
            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              무료 제공 용량(10GB) 안전 범위 내에서 정상 운영 중입니다. (9.9GB 도달 시 자동 차단 보호 활성화)
            </span>
          </div>
        )}
      </div>

      {/* Files List Section */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-800">
              저장 파일 목록 ({filteredFiles.length}건)
            </h3>
            {loading && <span className="text-xs text-slate-400">새로고침 중...</span>}
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {['전체', 'materials', 'activities', 'receipts', 'minutes'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                  filterCategory === cat
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat === '전체' ? '전체' : getCategoryBadge(cat).label}
              </button>
            ))}
          </div>
        </div>

        {/* Files Table */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          {filteredFiles.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              {loading ? '파일 목록을 불러오는 중입니다...' : '저장된 파일이 없습니다.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                  <tr>
                    <th className="py-3 px-4">분류</th>
                    <th className="py-3 px-4">파일명</th>
                    <th className="py-3 px-4">크기</th>
                    <th className="py-3 px-4">등록자</th>
                    <th className="py-3 px-4">등록일시</th>
                    <th className="py-3 px-4 text-center">작업</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredFiles.map((file) => {
                    const badge = getCategoryBadge(file.category);
                    const IconComponent = badge.icon;
                    const fileUrl = `/api/files/${encodeURI(file.key)}`;
                    return (
                      <tr key={file.key} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-semibold ${badge.bg}`}>
                            <IconComponent className="w-3 h-3" />
                            {badge.label}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-800 max-w-xs truncate" title={file.file_name}>
                          {file.file_name}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap font-mono text-slate-600">
                          {formatBytes(file.size)}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap text-slate-500">
                          {file.uploaded_by || '관리자'}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap text-slate-400">
                          {file.uploaded_at ? file.uploaded_at.substring(0, 16).replace('T', ' ') : '-'}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap text-center">
                          <div className="inline-flex items-center gap-1.5">
                            <a
                              href={`${fileUrl}?download=true`}
                              target="_blank"
                              rel="noreferrer"
                              download={file.file_name}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                              title="다운로드"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </a>
                            <a
                              href={fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-lg text-slate-500 hover:text-cyan-600 hover:bg-cyan-50 transition-colors"
                              title="새 창에서 열기"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                            <button
                              onClick={() => handleDeleteFile(file.key, file.file_name)}
                              disabled={deletingKey === file.key}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer disabled:opacity-50"
                              title="스토리지에서 삭제 (용량 확보)"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
