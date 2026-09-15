export type PageId = 'home' | 'schedule' | 'prayer' | 'ai' | 'settings';

export type DayOfWeek = 'saturday' | 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday';

export const DAYS_OF_WEEK: { id: DayOfWeek; nameAr: string; nameEn: string }[] = [
  { id: 'saturday', nameAr: 'السبت', nameEn: 'Saturday' },
  { id: 'sunday', nameAr: 'الأحد', nameEn: 'Sunday' },
  { id: 'monday', nameAr: 'الاثنين', nameEn: 'Monday' },
  { id: 'tuesday', nameAr: 'الثلاثاء', nameEn: 'Tuesday' },
  { id: 'wednesday', nameAr: 'الأربعاء', nameEn: 'Wednesday' },
  { id: 'thursday', nameAr: 'الخميس', nameEn: 'Thursday' },
  { id: 'friday', nameAr: 'الجمعة', nameEn: 'Friday' },
];

export type TaskCategory = 'essential' | 'development';
export type DevelopmentType = 'cumulative' | 'non_cumulative';

export interface Task {
  id: string;
  title: string;
  day: DayOfWeek;
  startTime: string; // "HH:MM" 24h format
  durationMinutes: number;
  endTime: string; // Calculated "HH:MM"
  isPomodoro: boolean;
  category: TaskCategory;
  developmentType?: DevelopmentType;
  cumulativeOrder?: number; // Order in the cumulative chain
  completed: boolean;
  notes?: string;
  createdAt: number;
}

export interface DailyBuffer {
  day: DayOfWeek;
  durationMinutes: number;
  enabled: boolean;
  used: boolean;
}

export interface AppSettings {
  dailyStartTime: string; // e.g. "08:00"
  dailyEndTime: string;   // e.g. "22:00"
  fridayStartTime: string;// e.g. "14:00"
  fridayEndTime: string;  // e.g. "23:00"
  pomodoroEnabled: boolean;
  focusDuration: number;  // minutes (default 25)
  breakDuration: number;  // minutes (default 5)
  bufferEnabled: boolean;
  defaultBufferDuration: number; // minutes (default 45)
  notificationsEnabled: boolean;
  timerNotificationEnabled: boolean;
  soundEnabled: boolean;
  darkMode: boolean;
  city: string;
  latitude: number;
  longitude: number;
  manualPrayerOverrides: Record<string, string>; // e.g. { 'الفجر': '04:45' }
  morningAdhkarOffsetMinutes: number; // minutes after Fajr
  eveningAdhkarOffsetMinutes: number; // minutes before Maghrib
  animationsEnabled: boolean;
  isFirstLaunchCompleted: boolean;
}

export interface ActiveTimer {
  taskId: string;
  taskTitle: string;
  phase: 'focus' | 'break' | 'standard';
  remainingSeconds: number;
  totalSeconds: number;
  isRunning: boolean;
  targetEndTime: number; // Date.now() + remainingSeconds * 1000
  pomodoroCount?: number;
  completedPomodoros?: number;
}

export interface EmergencyShiftOption {
  minutes: 15 | 30 | 45 | 60 | 90;
  label: string;
}

export interface ShiftPreviewItem {
  taskId: string;
  title: string;
  oldDay: DayOfWeek;
  newDay: DayOfWeek;
  oldStartTime: string;
  newStartTime: string;
  oldEndTime: string;
  newEndTime: string;
  reason: string;
}

export interface PrayerTimeItem {
  name: string;
  time: string; // "HH:MM"
  timestamp: Date;
  isPassed: boolean;
  isNext: boolean;
}

export interface DhikrItem {
  id: string;
  text: string;
  virtue?: string;
  count: number;
  currentCount: number;
  category: 'morning' | 'evening';
}

export interface HadithItem {
  id: string;
  matn: string;
  narrator: string;
  reference: string;
  topic: string;
}

export interface SurahItem {
  id: number;
  name: string;
  versesCount: number;
  revelationType: string;
  text: string[];
}
