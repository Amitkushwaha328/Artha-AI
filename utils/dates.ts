import { format, differenceInDays, isToday, isTomorrow, isPast } from 'date-fns';

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  if (isToday(d)) return 'Today';
  if (isTomorrow(d)) return 'Tomorrow';
  return format(d, 'dd MMM yyyy');
}

export function daysUntil(dateStr: string): number {
  return differenceInDays(new Date(dateStr), new Date());
}

export function isOverdue(dateStr: string): boolean {
  return isPast(new Date(dateStr));
}

export function currentMonthLabel(): string {
  return format(new Date(), 'MMMM yyyy');
}
