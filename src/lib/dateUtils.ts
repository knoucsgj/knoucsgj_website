export function getDDay(targetDateStr: string): {
  label: string;
  diffDays: number;
  isPast: boolean;
  isToday: boolean;
} {
  const target = new Date(targetDateStr + 'T00:00:00');
  const now = new Date();
  // Reset time part for pure calendar day calculation
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return { label: 'D-Day', diffDays: 0, isPast: false, isToday: true };
  } else if (diffDays > 0) {
    return { label: `D-${diffDays}`, diffDays, isPast: false, isToday: false };
  } else {
    return { label: `D+${Math.abs(diffDays)}`, diffDays, isPast: true, isToday: false };
  }
}

export function formatDate(dateStr: string): string {
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[0]}.${parts[1]}.${parts[2]}`;
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}

export function formatEventPeriod(start: string, end: string): string {
  if (start === end) return formatDate(start);
  return `${formatDate(start)} ~ ${formatDate(end)}`;
}
