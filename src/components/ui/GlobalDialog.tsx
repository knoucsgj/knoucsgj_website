import React, { useState, useEffect, useRef } from 'react';
import {
  AlertTriangle,
  Trash2,
  CheckCircle2,
  Info,
  XCircle,
  HelpCircle,
  X,
  MessageSquareWarning
} from 'lucide-react';

export interface ConfirmOptions {
  title?: string;
  message: string;
  subMessage?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export interface PromptOptions {
  title?: string;
  message: string;
  subMessage?: string;
  placeholder?: string;
  defaultValue?: string;
  confirmText?: string;
  cancelText?: string;
  required?: boolean;
  variant?: 'danger' | 'warning' | 'info';
}

export interface AlertOptions {
  title?: string;
  message: string;
  confirmText?: string;
  variant?: 'success' | 'error' | 'warning' | 'info';
}

type DialogItem =
  | ({
      id: number;
      type: 'confirm';
      resolve: (val: boolean) => void;
    } & Required<Pick<ConfirmOptions, 'message'>> &
      ConfirmOptions)
  | ({
      id: number;
      type: 'prompt';
      resolve: (val: string | null) => void;
    } & Required<Pick<PromptOptions, 'message'>> &
      PromptOptions)
  | ({
      id: number;
      type: 'alert';
      resolve: () => void;
    } & Required<Pick<AlertOptions, 'message'>> &
      AlertOptions);

let dialogIdCounter = 0;
let pushDialogFn: ((item: DialogItem) => void) | null = null;

function inferConfirmVariant(msg: string): 'danger' | 'warning' | 'info' {
  if (/삭제|탈퇴|파기|해체|제거/.test(msg)) return 'danger';
  if (/초기화|복원|덮어|재스캔|변경|동기화/.test(msg)) return 'warning';
  return 'info';
}

function inferConfirmTitle(msg: string, variant: 'danger' | 'warning' | 'info'): string {
  if (/탈퇴/.test(msg)) return '회원 탈퇴 확인';
  if (/임원/.test(msg) && /삭제/.test(msg)) return '임원 정보 삭제';
  if (/교과목/.test(msg) && /삭제/.test(msg)) return '교과목 삭제 확인';
  if (/삭제/.test(msg)) return '삭제 확인';
  if (/초기화|복원/.test(msg)) return '데이터 복원 및 초기화 확인';
  if (/동기화|재스캔/.test(msg)) return '스토리지 동기화 확인';
  if (variant === 'danger') return '중요 작업 확인';
  if (variant === 'warning') return '작업 진행 확인';
  return '확인 안내';
}

function inferAlertVariant(msg: string): 'success' | 'error' | 'warning' | 'info' {
  if (/실패|오류|에러|불가|없습니다|못했습니다|초과|거부|차단/.test(msg)) return 'error';
  if (/입력해|선택해|확인해|필수|먼저|주의|경고/.test(msg)) return 'warning';
  if (/성공|완료|되었습니다|저장되었|삭제되었|등록되었|수정되었|복원되었|변경되었|발송되었/.test(msg)) return 'success';
  return 'info';
}

function inferAlertTitle(variant: 'success' | 'error' | 'warning' | 'info'): string {
  if (variant === 'success') return '처리 완료';
  if (variant === 'error') return '오류 안내';
  if (variant === 'warning') return '입력 및 확인 안내';
  return '알림';
}

export function showConfirm(optionsOrMessage: string | ConfirmOptions): Promise<boolean> {
  const opts: ConfirmOptions =
    typeof optionsOrMessage === 'string' ? { message: optionsOrMessage } : optionsOrMessage;

  const variant = opts.variant || inferConfirmVariant(opts.message);
  const title = opts.title || inferConfirmTitle(opts.message, variant);
  const confirmText =
    opts.confirmText || (variant === 'danger' ? (/탈퇴/.test(opts.message) ? '탈퇴 처리' : '삭제하기') : '확인');
  const cancelText = opts.cancelText || '취소';

  return new Promise<boolean>((resolve) => {
    if (!pushDialogFn) {
      resolve(window.confirm(opts.message));
      return;
    }
    pushDialogFn({
      id: ++dialogIdCounter,
      type: 'confirm',
      title,
      message: opts.message,
      subMessage: opts.subMessage,
      confirmText,
      cancelText,
      variant,
      resolve
    });
  });
}

export function showPrompt(optionsOrMessage: string | PromptOptions): Promise<string | null> {
  const opts: PromptOptions =
    typeof optionsOrMessage === 'string' ? { message: optionsOrMessage } : optionsOrMessage;

  const variant = opts.variant || inferConfirmVariant(opts.message);
  const title = opts.title || (/삭제/.test(opts.message) ? '삭제 사유 입력' : '내용 입력');
  const confirmText = opts.confirmText || (/삭제/.test(opts.message) ? '삭제 확정' : '확인');
  const cancelText = opts.cancelText || '취소';

  return new Promise<string | null>((resolve) => {
    if (!pushDialogFn) {
      resolve(window.prompt(opts.message, opts.defaultValue || ''));
      return;
    }
    pushDialogFn({
      id: ++dialogIdCounter,
      type: 'prompt',
      title,
      message: opts.message,
      subMessage: opts.subMessage,
      placeholder: opts.placeholder || '내용을 입력해 주세요...',
      defaultValue: opts.defaultValue || '',
      confirmText,
      cancelText,
      required: opts.required ?? true,
      variant,
      resolve
    });
  });
}

export function showAlert(optionsOrMessage: string | AlertOptions): Promise<void> {
  const opts: AlertOptions =
    typeof optionsOrMessage === 'string' ? { message: optionsOrMessage } : optionsOrMessage;

  const variant = opts.variant || inferAlertVariant(opts.message);
  const title = opts.title || inferAlertTitle(variant);
  const confirmText = opts.confirmText || '확인';

  return new Promise<void>((resolve) => {
    if (!pushDialogFn) {
      window.alert(opts.message);
      resolve();
      return;
    }
    pushDialogFn({
      id: ++dialogIdCounter,
      type: 'alert',
      title,
      message: opts.message,
      confirmText,
      variant,
      resolve
    });
  });
}

export const GlobalDialog: React.FC = () => {
  const [dialogs, setDialogs] = useState<DialogItem[]>([]);
  const [promptInput, setPromptInput] = useState('');
  const [promptError, setPromptError] = useState('');
  const confirmBtnRef = useRef<HTMLButtonElement>(null);
  const promptInputRef = useRef<HTMLTextAreaElement>(null);

  const current = dialogs[0] || null;

  useEffect(() => {
    pushDialogFn = (item: DialogItem) => {
      setDialogs((prev) => [...prev, item]);
    };

    const originalAlert = window.alert;
    window.alert = (message?: any) => {
      showAlert(String(message ?? ''));
    };

    return () => {
      pushDialogFn = null;
      window.alert = originalAlert;
    };
  }, []);

  useEffect(() => {
    if (!current) return;
    if (current.type === 'prompt') {
      setPromptInput(current.defaultValue || '');
      setPromptError('');
      setTimeout(() => promptInputRef.current?.focus(), 30);
    } else {
      setTimeout(() => confirmBtnRef.current?.focus(), 30);
    }
  }, [current?.id]);

  useEffect(() => {
    if (!current) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        if (current.type === 'confirm') {
          closeCurrent(() => current.resolve(false));
        } else if (current.type === 'prompt') {
          closeCurrent(() => current.resolve(null));
        } else {
          closeCurrent(() => current.resolve());
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [current]);

  if (!current) return null;

  const closeCurrent = (afterClose: () => void) => {
    const id = current.id;
    setDialogs((prev) => prev.filter((d) => d.id !== id));
    afterClose();
  };

  const handleConfirm = () => {
    if (current.type === 'confirm') {
      closeCurrent(() => current.resolve(true));
    } else if (current.type === 'prompt') {
      if (current.required && !promptInput.trim()) {
        setPromptError('필수 입력 항목입니다. 내용을 입력해 주세요.');
        promptInputRef.current?.focus();
        return;
      }
      const val = promptInput.trim();
      closeCurrent(() => current.resolve(val));
    } else {
      closeCurrent(() => current.resolve());
    }
  };

  const handleCancel = () => {
    if (current.type === 'confirm') {
      closeCurrent(() => current.resolve(false));
    } else if (current.type === 'prompt') {
      closeCurrent(() => current.resolve(null));
    } else {
      closeCurrent(() => current.resolve());
    }
  };

  // Visual theme config
  const getTheme = () => {
    if (current.type === 'alert') {
      switch (current.variant) {
        case 'success':
          return {
            iconBg: 'bg-emerald-100 text-emerald-600 ring-4 ring-emerald-50',
            topBar: 'from-emerald-500 to-teal-500',
            badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            btnBg: 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500 shadow-emerald-200/60',
            icon: <CheckCircle2 className="w-6 h-6" />
          };
        case 'error':
          return {
            iconBg: 'bg-rose-100 text-rose-600 ring-4 ring-rose-50',
            topBar: 'from-rose-500 to-red-500',
            badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
            btnBg: 'bg-rose-600 hover:bg-rose-700 focus:ring-rose-500 shadow-rose-200/60',
            icon: <XCircle className="w-6 h-6" />
          };
        case 'warning':
          return {
            iconBg: 'bg-amber-100 text-amber-600 ring-4 ring-amber-50',
            topBar: 'from-amber-500 to-orange-500',
            badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
            btnBg: 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500 shadow-amber-200/60',
            icon: <AlertTriangle className="w-6 h-6" />
          };
        default:
          return {
            iconBg: 'bg-blue-100 text-blue-600 ring-4 ring-blue-50',
            topBar: 'from-blue-600 to-indigo-600',
            badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
            btnBg: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 shadow-blue-200/60',
            icon: <Info className="w-6 h-6" />
          };
      }
    }

    // confirm or prompt
    switch (current.variant) {
      case 'danger':
        return {
          iconBg: 'bg-rose-100 text-rose-600 ring-4 ring-rose-50',
          topBar: 'from-rose-500 to-red-600',
          badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
          btnBg: 'bg-rose-600 hover:bg-rose-700 focus:ring-rose-500 shadow-rose-200/60',
          icon: current.type === 'prompt' ? <MessageSquareWarning className="w-6 h-6" /> : <Trash2 className="w-6 h-6" />
        };
      case 'warning':
        return {
          iconBg: 'bg-amber-100 text-amber-600 ring-4 ring-amber-50',
          topBar: 'from-amber-500 to-orange-500',
          badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
          btnBg: 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500 shadow-amber-200/60',
          icon: <AlertTriangle className="w-6 h-6" />
        };
      default:
        return {
          iconBg: 'bg-blue-100 text-blue-600 ring-4 ring-blue-50',
          topBar: 'from-blue-600 to-indigo-600',
          badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
          btnBg: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 shadow-blue-200/60',
          icon: <HelpCircle className="w-6 h-6" />
        };
    }
  };

  const theme = getTheme();

  // Split message if it has multiple lines to highlight the first line nicely
  const lines = current.message.split('\n').filter((l) => l.trim().length > 0);
  const mainMessage = lines[0] || current.message;
  const extraLines = lines.slice(1).join('\n');

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={handleCancel}
    >
      <div
        className="relative bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200/90 overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Gradient Bar */}
        <div className={`h-1.5 w-full bg-gradient-to-r ${theme.topBar}`} />

        {/* Close Button */}
        <button
          type="button"
          onClick={handleCancel}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="닫기"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 sm:p-7">
          {/* Header with Icon */}
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${theme.iconBg}`}>
              {theme.icon}
            </div>
            <div className="flex-1 min-w-0 pt-0.5 pr-4">
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                {current.title}
              </h3>
              <p className="mt-1.5 text-sm font-medium text-slate-700 leading-relaxed break-keep">
                {mainMessage}
              </p>
            </div>
          </div>

          {/* Sub-message or extra lines box */}
          {(extraLines || ('subMessage' in current && current.subMessage)) && (
            <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 leading-relaxed whitespace-pre-line">
              {extraLines}
              {extraLines && 'subMessage' in current && current.subMessage ? '\n' : ''}
              {'subMessage' in current ? current.subMessage : ''}
            </div>
          )}

          {/* Prompt Input Field */}
          {current.type === 'prompt' && (
            <div className="mt-4">
              <textarea
                ref={promptInputRef}
                rows={3}
                value={promptInput}
                onChange={(e) => {
                  setPromptInput(e.target.value);
                  if (promptError) setPromptError('');
                }}
                placeholder={current.placeholder}
                className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all resize-none"
              />
              {promptError && (
                <p className="mt-1.5 text-xs font-semibold text-rose-600">{promptError}</p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-6 flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            {current.type !== 'alert' && (
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 sm:flex-none sm:min-w-[96px] px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition-all cursor-pointer active:scale-[0.98]"
              >
                {current.cancelText || '취소'}
              </button>
            )}
            <button
              ref={confirmBtnRef}
              type="button"
              onClick={handleConfirm}
              className={`flex-1 sm:flex-none sm:min-w-[110px] px-5 py-2.5 rounded-xl text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-1 ${theme.btnBg}`}
            >
              {current.confirmText || '확인'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
