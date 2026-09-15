import {
  AppSettings,
  DailyBuffer,
  Task,
  DAYS_OF_WEEK,
  ActiveTimer,
} from '../types';

const STORAGE_KEYS = {
  TASKS: 'waqt_tasks_v1',
  BUFFERS: 'waqt_buffers_v1',
  SETTINGS: 'waqt_settings_v1',
  TIMER: 'waqt_active_timer_v1',
  FIRST_LAUNCH: 'waqt_first_launch_done_v1',
};

export const DEFAULT_SETTINGS: AppSettings = {
  dailyStartTime: '08:00',
  dailyEndTime: '22:00',
  fridayStartTime: '14:00',
  fridayEndTime: '23:00',
  pomodoroEnabled: true,
  focusDuration: 25,
  breakDuration: 5,
  bufferEnabled: true,
  defaultBufferDuration: 45,
  notificationsEnabled: true,
  timerNotificationEnabled: true,
  soundEnabled: true,
  darkMode: false,
  city: 'القاهرة',
  latitude: 30.0444,
  longitude: 31.2357,
  manualPrayerOverrides: {},
  morningAdhkarOffsetMinutes: 15,
  eveningAdhkarOffsetMinutes: 45,
  animationsEnabled: true,
  isFirstLaunchCompleted: false,
};

export const INITIAL_BUFFERS: DailyBuffer[] = DAYS_OF_WEEK.map((d) => ({
  day: d.id,
  durationMinutes: 45,
  enabled: true,
  used: false,
}));

export const INITIAL_TASKS: Task[] = [
  // Saturday
  {
    id: 't-sat-1',
    title: 'مراجعة وتثبيت ورد القرآن الكريم',
    day: 'saturday',
    startTime: '08:30',
    durationMinutes: 45,
    endTime: '09:15',
    isPomodoro: false,
    category: 'essential',
    completed: true,
    createdAt: Date.now() - 500000,
  },
  {
    id: 't-sat-2',
    title: 'تطوير المشروع البرمجي - مرحلة التأسيس (A)',
    day: 'saturday',
    startTime: '09:30',
    durationMinutes: 90,
    endTime: '11:00',
    isPomodoro: true,
    category: 'development',
    developmentType: 'cumulative',
    cumulativeOrder: 1,
    completed: true,
    createdAt: Date.now() - 400000,
  },
  {
    id: 't-sat-3',
    title: 'قراءة بحث في الخوارزميات وهندسة النظم',
    day: 'saturday',
    startTime: '11:30',
    durationMinutes: 60,
    endTime: '12:30',
    isPomodoro: true,
    category: 'development',
    developmentType: 'non_cumulative',
    completed: false,
    createdAt: Date.now() - 300000,
  },
  // Sunday
  {
    id: 't-sun-1',
    title: 'جلسة مذاكرة وتلخيص المواد الأساسية',
    day: 'sunday',
    startTime: '09:00',
    durationMinutes: 75,
    endTime: '10:15',
    isPomodoro: true,
    category: 'essential',
    completed: true,
    createdAt: Date.now() - 250000,
  },
  {
    id: 't-sun-2',
    title: 'تطوير المشروع البرمجي - بناء الواجهات وقواعد البيانات (B)',
    day: 'sunday',
    startTime: '10:30',
    durationMinutes: 90,
    endTime: '12:00',
    isPomodoro: true,
    category: 'development',
    developmentType: 'cumulative',
    cumulativeOrder: 2,
    completed: false,
    createdAt: Date.now() - 200000,
  },
  // Monday
  {
    id: 't-mon-1',
    title: 'إنجاز التكاليف والواجبات الأسبوعية',
    day: 'monday',
    startTime: '09:00',
    durationMinutes: 60,
    endTime: '10:00',
    isPomodoro: true,
    category: 'essential',
    completed: false,
    createdAt: Date.now() - 150000,
  },
  {
    id: 't-mon-2',
    title: 'تطوير المشروع البرمجي - اختبار الوحدات وتكامل النظم (C)',
    day: 'monday',
    startTime: '10:30',
    durationMinutes: 90,
    endTime: '12:00',
    isPomodoro: true,
    category: 'development',
    developmentType: 'cumulative',
    cumulativeOrder: 3,
    completed: false,
    createdAt: Date.now() - 100000,
  },
  // Tuesday
  {
    id: 't-tue-1',
    title: 'مراجعة المفاهيم العلمية والتطبيق العملي',
    day: 'tuesday',
    startTime: '09:00',
    durationMinutes: 60,
    endTime: '10:00',
    isPomodoro: true,
    category: 'essential',
    completed: false,
    createdAt: Date.now() - 90000,
  },
  // Wednesday
  {
    id: 't-wed-1',
    title: 'حضور المحاضرة الأسبوعية والمناقشة',
    day: 'wednesday',
    startTime: '10:00',
    durationMinutes: 90,
    endTime: '11:30',
    isPomodoro: false,
    category: 'essential',
    completed: false,
    createdAt: Date.now() - 80000,
  },
  // Thursday
  {
    id: 't-thu-1',
    title: 'جلسة مراجعة الأسبوع وتجهيز مهام الغد',
    day: 'thursday',
    startTime: '11:00',
    durationMinutes: 60,
    endTime: '12:00',
    isPomodoro: true,
    category: 'essential',
    completed: false,
    createdAt: Date.now() - 70000,
  },
  // Friday
  {
    id: 't-fri-1',
    title: 'قراءة سورة الكهف والصلاة على النبي ﷺ',
    day: 'friday',
    startTime: '14:30',
    durationMinutes: 45,
    endTime: '15:15',
    isPomodoro: false,
    category: 'essential',
    completed: false,
    createdAt: Date.now() - 60000,
  },
  {
    id: 't-fri-2',
    title: 'استكمال المهام المؤجلة وتصفية ملفات الأسبوع',
    day: 'friday',
    startTime: '16:00',
    durationMinutes: 90,
    endTime: '17:30',
    isPomodoro: true,
    category: 'development',
    developmentType: 'non_cumulative',
    completed: false,
    createdAt: Date.now() - 50000,
  },
];

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch {
    // Storage quota or policy
  }
}

export function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TASKS);
    if (!raw) return INITIAL_TASKS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_TASKS;
  } catch {
    return INITIAL_TASKS;
  }
}

export function saveTasks(tasks: Task[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  } catch {
    // Storage quota or policy
  }
}

export function loadBuffers(): DailyBuffer[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BUFFERS);
    if (!raw) return INITIAL_BUFFERS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length === 7 ? parsed : INITIAL_BUFFERS;
  } catch {
    return INITIAL_BUFFERS;
  }
}

export function saveBuffers(buffers: DailyBuffer[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.BUFFERS, JSON.stringify(buffers));
  } catch {
    // Storage quota or policy
  }
}

export function loadActiveTimer(): ActiveTimer | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TIMER);
    if (!raw) return null;
    const timer: ActiveTimer = JSON.parse(raw);
    if (timer.isRunning && timer.targetEndTime) {
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((timer.targetEndTime - now) / 1000));
      timer.remainingSeconds = remaining;
      if (remaining === 0) {
        timer.isRunning = false;
      }
    }
    return timer;
  } catch {
    return null;
  }
}

export function saveActiveTimer(timer: ActiveTimer | null): void {
  try {
    if (!timer) {
      localStorage.removeItem(STORAGE_KEYS.TIMER);
    } else {
      localStorage.setItem(STORAGE_KEYS.TIMER, JSON.stringify(timer));
    }
  } catch {
    // Storage quota or policy
  }
}
