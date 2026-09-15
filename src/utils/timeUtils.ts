import { DayOfWeek, DAYS_OF_WEEK } from '../types';

/**
 * Maps JS Date.getDay() (0=Sunday ... 6=Saturday) to our DayOfWeek
 */
export function getCurrentDayOfWeek(date: Date = new Date()): DayOfWeek {
  const dayIndex = date.getDay();
  switch (dayIndex) {
    case 6:
      return 'saturday';
    case 0:
      return 'sunday';
    case 1:
      return 'monday';
    case 2:
      return 'tuesday';
    case 3:
      return 'wednesday';
    case 4:
      return 'thursday';
    case 5:
      return 'friday';
    default:
      return 'saturday';
  }
}

export function getArabicDayName(day: DayOfWeek): string {
  const found = DAYS_OF_WEEK.find(d => d.id === day);
  return found ? found.nameAr : '';
}

/**
 * Converts "HH:MM" (24h) to total minutes from midnight
 */
export function timeToMinutes(timeStr: string): number {
  if (!timeStr || !timeStr.includes(':')) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

/**
 * Converts minutes from midnight to "HH:MM" (24h)
 */
export function minutesToTime(minutes: number): string {
  const normalized = ((minutes % 1440) + 1440) % 1440;
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Calculates end time given start time "HH:MM" and duration in minutes
 */
export function calculateEndTime(startTime: string, durationMinutes: number): string {
  const startMin = timeToMinutes(startTime);
  const endMin = startMin + durationMinutes;
  return minutesToTime(endMin);
}

/**
 * Format time to 12-hour format with AM/PM in Arabic
 */
export function formatTime12h(time24: string): string {
  if (!time24 || !time24.includes(':')) return '';
  const [hStr, mStr] = time24.split(':');
  let h = parseInt(hStr, 10);
  const m = mStr;
  const period = h >= 12 ? 'م' : 'ص';
  h = h % 12 || 12;
  return `${h}:${m} ${period}`;
}

/**
 * Format seconds into MM:SS or HH:MM:SS
 */
export function formatSeconds(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(s / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const seconds = s % 60;

  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/**
 * Motivational message based on completion percentage:
 * 50% or less: "معلش شد حيلك"
 * >50% to 70%: "عاش بس فيه أفضل"
 * >70% to 80%: "حلو أوي برافو"
 * 81% to 100%: "عاش جامد كافئ نفسك (بالحلال)"
 */
export function getMotivationalMessage(percentage: number): { message: string; badgeColor: string } {
  if (percentage <= 50) {
    return {
      message: 'معلش شد حيلك',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    };
  } else if (percentage <= 70) {
    return {
      message: 'عاش بس فيه أفضل',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
    };
  } else if (percentage <= 80) {
    return {
      message: 'حلو أوي برافو',
      badgeColor: 'bg-teal-100 text-teal-800 border-teal-300',
    };
  } else {
    return {
      message: 'عاش جامد كافئ نفسك (بالحلال)',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    };
  }
}
