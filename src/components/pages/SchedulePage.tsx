import React, { useState, useMemo } from 'react';
import {
  DayOfWeek,
  DAYS_OF_WEEK,
  Task,
  DailyBuffer,
  AppSettings,
  ActiveTimer,
  ShiftPreviewItem,
  TaskCategory,
  DevelopmentType,
} from '../../types';
import {
  getCurrentDayOfWeek,
  timeToMinutes,
  minutesToTime,
  calculateEndTime,
  formatTime12h,
  getMotivationalMessage,
  formatSeconds,
} from '../../utils/timeUtils';
import { calculateEmergencyShift } from '../../utils/schedulerEngine';
import {
  Calendar,
  AlertTriangle,
  Play,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Clock,
  Shield,
  Layers,
  Sparkles,
  BarChart3,
  Check,
  X,
} from 'lucide-react';

interface SchedulePageProps {
  tasks: Task[];
  buffers: DailyBuffer[];
  settings: AppSettings;
  onUpdateTasks: (updated: Task[]) => void;
  onUpdateBuffers: (updated: DailyBuffer[]) => void;
  onStartTimer: (task: Task) => void;
  onOpenSideMenu: () => void;
  onOpenNotifications: () => void;
}

export const SchedulePage: React.FC<SchedulePageProps> = ({
  tasks,
  buffers,
  settings,
  onUpdateTasks,
  onUpdateBuffers,
  onStartTimer,
  onOpenSideMenu,
  onOpenNotifications,
}) => {
  // Real current day from device
  const realCurrentDay = useMemo(() => getCurrentDayOfWeek(), []);
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(realCurrentDay);

  // Active sub-section tab inside the page
  const [activeTab, setActiveTab] = useState<'essential' | 'development' | 'buffer' | 'graph'>('essential');

  // Emergency Shift Modal State
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [selectedShiftMinutes, setSelectedShiftMinutes] = useState<15 | 30 | 45 | 60 | 90>(30);
  const [shiftPreview, setShiftPreview] = useState<{
    items: ShiftPreviewItem[];
    updatedTasks: Task[];
    updatedBuffers: DailyBuffer[];
    explanation: string;
  } | null>(null);

  // Add/Edit Task Modal State
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<TaskCategory>('essential');
  const [newTaskDevType, setNewTaskDevType] = useState<DevelopmentType>('cumulative');
  const [newTaskStartTime, setNewTaskStartTime] = useState('09:00');
  const [newTaskDuration, setNewTaskDuration] = useState(60);
  const [newTaskPomodoro, setNewTaskPomodoro] = useState(true);

  // Filter tasks for selected day
  const dayTasks = useMemo(
    () => tasks.filter((t) => t.day === selectedDay).sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime)),
    [tasks, selectedDay]
  );

  const essentialTasks = dayTasks.filter((t) => t.category === 'essential');
  const developmentTasks = dayTasks.filter((t) => t.category === 'development');
  const currentBuffer = buffers.find((b) => b.day === selectedDay) || {
    day: selectedDay,
    durationMinutes: settings.defaultBufferDuration,
    enabled: true,
    used: false,
  };

  // Completion calculation for selected day
  const totalDayTasksCount = dayTasks.length;
  const completedDayTasksCount = dayTasks.filter((t) => t.completed).length;
  const dayCompletionRate = totalDayTasksCount > 0
    ? Math.round((completedDayTasksCount / totalDayTasksCount) * 100)
    : 0;
  const motivational = getMotivationalMessage(dayCompletionRate);

  // Work/study period countdown for today
  const isSelectedFriday = selectedDay === 'friday';
  const dayStartStr = isSelectedFriday ? settings.fridayStartTime : settings.dailyStartTime;
  const dayEndStr = isSelectedFriday ? settings.fridayEndTime : settings.dailyEndTime;
  const dayEndMinutes = timeToMinutes(dayEndStr);
  const now = new Date();
  const currentMinNow = now.getHours() * 60 + now.getMinutes();
  const workMinutesRemaining = Math.max(0, dayEndMinutes - currentMinNow);

  // Weekly Completion Rates for Graph
  const weeklyCompletionRates = useMemo(() => {
    return DAYS_OF_WEEK.map((d) => {
      const dTasks = tasks.filter((t) => t.day === d.id);
      const total = dTasks.length;
      const completed = dTasks.filter((t) => t.completed).length;
      const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
      return {
        day: d.id,
        nameAr: d.nameAr,
        rate,
        total,
        completed,
        isToday: d.id === realCurrentDay,
        isSelected: d.id === selectedDay,
      };
    });
  }, [tasks, realCurrentDay, selectedDay]);

  // Handlers
  const handleToggleTaskCompletion = (taskId: string) => {
    const updated = tasks.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t));
    onUpdateTasks(updated);
  };

  const handleDeleteTask = (taskId: string) => {
    const updated = tasks.filter((t) => t.id !== taskId);
    onUpdateTasks(updated);
  };

  const handleAddNewTask = () => {
    if (!newTaskTitle.trim()) return;

    const endTime = calculateEndTime(newTaskStartTime, newTaskDuration);

    let maxOrder = 0;
    if (newTaskCategory === 'development' && newTaskDevType === 'cumulative') {
      const existingCumulative = tasks.filter((t) => t.category === 'development' && t.developmentType === 'cumulative');
      maxOrder = existingCumulative.reduce((max, t) => Math.max(max, t.cumulativeOrder ?? 0), 0);
    }

    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: newTaskTitle.trim(),
      day: selectedDay,
      startTime: newTaskStartTime,
      durationMinutes: newTaskDuration,
      endTime,
      isPomodoro: newTaskPomodoro,
      category: newTaskCategory,
      developmentType: newTaskCategory === 'development' ? newTaskDevType : undefined,
      cumulativeOrder: newTaskCategory === 'development' && newTaskDevType === 'cumulative' ? maxOrder + 1 : undefined,
      completed: false,
      createdAt: Date.now(),
    };

    onUpdateTasks([...tasks, newTask]);
    setNewTaskTitle('');
    setIsAddTaskModalOpen(false);
  };

  const handleRunEmergencyShiftPreview = () => {
    const result = calculateEmergencyShift(
      selectedDay,
      selectedShiftMinutes,
      tasks,
      buffers,
      settings
    );
    setShiftPreview({
      items: result.previewItems,
      updatedTasks: result.updatedTasks,
      updatedBuffers: result.updatedBuffers,
      explanation: result.explanation,
    });
  };

  const handleConfirmEmergencyShift = () => {
    if (!shiftPreview) return;
    onUpdateTasks(shiftPreview.updatedTasks);
    onUpdateBuffers(shiftPreview.updatedBuffers);
    setShiftPreview(null);
    setIsEmergencyModalOpen(false);
  };

  const handleToggleBufferEnabled = () => {
    const updated = buffers.map((b) =>
      b.day === selectedDay ? { ...b, enabled: !b.enabled } : b
    );
    onUpdateBuffers(updated);
  };

  const handleUpdateBufferDuration = (minutes: number) => {
    const updated = buffers.map((b) =>
      b.day === selectedDay ? { ...b, durationMinutes: minutes } : b
    );
    onUpdateBuffers(updated);
  };

  return (
    <div className="min-h-full p-4 pb-12 space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            id="schedule-side-menu-btn"
            onClick={onOpenSideMenu}
            className="p-2.5 rounded-2xl bg-white/90 dark:bg-black/25 text-[#4AA690] border border-[#E7C690]/40 shadow-sm active:scale-95"
          >
            <Calendar className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-base font-bold text-[#2C221E] dark:text-white">
              تنظيم الوقت والجدول الأسبوعي
            </h2>
            <div className="text-[11px] text-[#2C221E]/60 dark:text-white/60">
              {isSelectedFriday ? 'جدول يوم الجمعة المستقل' : 'الجدول الأسبوعي الموحد'}
            </div>
          </div>
        </div>

        {/* Emergency Shift Button */}
        <button
          id="open-emergency-shift-btn"
          onClick={() => {
            setShiftPreview(null);
            setIsEmergencyModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/15 border border-amber-400/50 text-amber-900 dark:text-amber-200 text-xs font-bold hover:bg-amber-500/25 transition active:scale-95"
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span>Emergency Shift</span>
        </button>
      </div>

      {/* Horizontal Days Strip: Saturday -> Friday */}
      <div className="bg-white/80 dark:bg-black/20 p-1.5 rounded-2xl border border-[#E7C690]/40 shadow-sm">
        <div className="flex items-center justify-between gap-1 overflow-x-auto py-1 no-scrollbar">
          {DAYS_OF_WEEK.map((d) => {
            const isToday = d.id === realCurrentDay;
            const isSelected = d.id === selectedDay;
            const dayTaskCount = tasks.filter((t) => t.day === d.id).length;

            return (
              <button
                key={d.id}
                id={`day-tab-${d.id}`}
                onClick={() => setSelectedDay(d.id)}
                className={`flex-1 min-w-[50px] py-2 px-1 rounded-xl text-center transition flex flex-col items-center justify-center relative ${
                  isSelected
                    ? 'bg-[#4AA690] text-white shadow-sm font-bold'
                    : isToday
                    ? 'bg-[#E7C690]/25 text-[#2C221E] dark:text-white font-semibold border border-[#4AA690]'
                    : 'text-[#2C221E]/70 dark:text-white/70 hover:bg-black/5'
                }`}
              >
                {isToday && (
                  <span className="text-[8px] uppercase tracking-tighter bg-[#E7C690] text-[#2C221E] px-1 rounded-full absolute -top-2">
                    اليوم
                  </span>
                )}
                <span className="text-xs">{d.nameAr}</span>
                <span className={`text-[9px] mt-0.5 ${isSelected ? 'text-white/80' : 'text-gray-400'}`}>
                  {dayTaskCount} مهام
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Daily Work Period & Countdown Widget */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-white to-[#FAF8F5] dark:from-[#261E1A] dark:to-[#1F1815] border border-[#E7C690]/40 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#4AA690]/15 text-[#4AA690] flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-[#2C221E] dark:text-white">
              فترة اليوم: {formatTime12h(dayStartStr)} إلى {formatTime12h(dayEndStr)}
            </div>
            <div className="text-[11px] text-[#2C221E]/60 dark:text-white/60">
              {workMinutesRemaining > 0
                ? `متبقي على نهاية فترة العمل اليوم: ${Math.floor(workMinutesRemaining / 60)} س و ${workMinutesRemaining % 60} د`
                : 'انتهت فترة العمل الرسمية لهذا اليوم'}
            </div>
          </div>
        </div>

        {/* Completion Badge */}
        <div className="text-left">
          <div className="text-lg font-black text-[#4AA690] font-mono">
            {dayCompletionRate}%
          </div>
          <div className="text-[10px] text-gray-400">إنجاز اليوم</div>
        </div>
      </div>

      {/* Daily Motivational Message */}
      <div className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-between ${motivational.badgeColor}`}>
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          <span>رسالة الإنجاز: «{motivational.message}»</span>
        </div>
        <span className="text-[11px] font-mono">
          {completedDayTasksCount} / {totalDayTasksCount} مكتمل
        </span>
      </div>

      {/* Inner Tabs for Sections inside Page 2 */}
      <div className="flex items-center p-1 bg-white/90 dark:bg-black/20 rounded-2xl border border-[#E7C690]/40 gap-1 text-xs font-bold">
        <button
          id="tab-essential-btn"
          onClick={() => setActiveTab('essential')}
          className={`flex-1 py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
            activeTab === 'essential'
              ? 'bg-[#E3F5EE] text-[#4AA690] shadow-sm border border-[#4AA690]/30'
              : 'text-[#2C221E]/60 dark:text-white/60'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>أساسية ({essentialTasks.length})</span>
        </button>

        <button
          id="tab-development-btn"
          onClick={() => setActiveTab('development')}
          className={`flex-1 py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
            activeTab === 'development'
              ? 'bg-[#E3F5EE] text-[#4AA690] shadow-sm border border-[#4AA690]/30'
              : 'text-[#2C221E]/60 dark:text-white/60'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>تطوير ({developmentTasks.length})</span>
        </button>

        <button
          id="tab-buffer-btn"
          onClick={() => setActiveTab('buffer')}
          className={`flex-1 py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
            activeTab === 'buffer'
              ? 'bg-[#E3F5EE] text-[#4AA690] shadow-sm border border-[#4AA690]/30'
              : 'text-[#2C221E]/60 dark:text-white/60'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Buffer</span>
        </button>

        <button
          id="tab-graph-btn"
          onClick={() => setActiveTab('graph')}
          className={`flex-1 py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
            activeTab === 'graph'
              ? 'bg-[#E3F5EE] text-[#4AA690] shadow-sm border border-[#4AA690]/30'
              : 'text-[#2C221E]/60 dark:text-white/60'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>الرسم البياني</span>
        </button>
      </div>

      {/* Tab 1: Essential Tasks */}
      {activeTab === 'essential' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold text-[#2C221E]/70 dark:text-white/70">
              المهام الأساسية (أعلى أولوية في اليوم)
            </div>
            <button
              id="add-essential-task-btn"
              onClick={() => {
                setNewTaskCategory('essential');
                setIsAddTaskModalOpen(true);
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#4AA690] text-white text-xs font-bold shadow-sm hover:bg-[#4AA690]/90 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة مهمة أساسية</span>
            </button>
          </div>

          {essentialTasks.length === 0 ? (
            <div className="p-8 text-center bg-white/50 dark:bg-black/10 rounded-2xl border border-dashed border-[#E7C690]/50 text-xs text-gray-500">
              لا توجد مهام أساسية مجدولة لهذا اليوم. اضغط على "إضافة مهمة أساسية".
            </div>
          ) : (
            <div className="space-y-2">
              {essentialTasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-3.5 rounded-2xl border transition ${
                    task.completed
                      ? 'bg-gray-100/70 dark:bg-black/30 border-gray-200 opacity-60'
                      : 'bg-white dark:bg-[#201915] border-[#E7C690]/40 shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <button
                      onClick={() => handleToggleTaskCompletion(task.id)}
                      className="mt-0.5 text-[#4AA690] hover:scale-110 transition"
                    >
                      {task.completed ? (
                        <CheckCircle2 className="w-5 h-5 fill-current" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>

                    <div className="flex-1">
                      <div className={`text-sm font-bold ${task.completed ? 'line-through text-gray-500' : 'text-[#2C221E] dark:text-white'}`}>
                        {task.title}
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
                        <span className="font-mono text-[#4AA690]">
                          {formatTime12h(task.startTime)} - {formatTime12h(task.endTime)}
                        </span>
                        <span>• {task.durationMinutes} دقيقة</span>
                        {task.isPomodoro && (
                          <span className="text-[10px] bg-[#E7C690]/25 text-[#2C221E] dark:text-[#E7C690] px-2 py-0.5 rounded-full">
                            Pomodoro
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {!task.completed && (
                        <button
                          onClick={() => onStartTimer(task)}
                          className="p-2 rounded-full bg-[#4AA690]/15 text-[#4AA690] hover:bg-[#4AA690] hover:text-white transition"
                          title="تشغيل المؤقت"
                        >
                          <Play className="w-4 h-4 fill-current ml-0.5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-2 rounded-full text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition"
                        title="حذف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Development Tasks (Cumulative & Non-Cumulative) */}
      {activeTab === 'development' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold text-[#2C221E]/70 dark:text-white/70">
              مهام التطوير (تراكمية Cumulative وغير تراكمية)
            </div>
            <button
              id="add-dev-task-btn"
              onClick={() => {
                setNewTaskCategory('development');
                setIsAddTaskModalOpen(true);
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#4AA690] text-white text-xs font-bold shadow-sm hover:bg-[#4AA690]/90 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة مهمة تطوير</span>
            </button>
          </div>

          <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/60 text-[11px] text-amber-900 dark:text-amber-200 leading-relaxed">
            <strong>قاعدة التتابع الصارمة:</strong> المهام التراكمية (Cumulative) مرتبطة ببعضها في سلسلة متتابعة، ولا يجوز لأي مهمة لاحقة أن تسبق سابقتها عند حدوث أي تأخير أو طارئ.
          </div>

          {developmentTasks.length === 0 ? (
            <div className="p-8 text-center bg-white/50 dark:bg-black/10 rounded-2xl border border-dashed border-[#E7C690]/50 text-xs text-gray-500">
              لا توجد مهام تطوير مجدولة لهذا اليوم.
            </div>
          ) : (
            <div className="space-y-2">
              {developmentTasks.map((task) => {
                const isCumulative = task.developmentType === 'cumulative';

                return (
                  <div
                    key={task.id}
                    className={`p-3.5 rounded-2xl border transition ${
                      task.completed
                        ? 'bg-gray-100/70 dark:bg-black/30 border-gray-200 opacity-60'
                        : 'bg-white dark:bg-[#201915] border-[#E7C690]/40 shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <button
                        onClick={() => handleToggleTaskCompletion(task.id)}
                        className="mt-0.5 text-[#4AA690] hover:scale-110 transition"
                      >
                        {task.completed ? (
                          <CheckCircle2 className="w-5 h-5 fill-current" />
                        ) : (
                          <Circle className="w-5 h-5" />
                        )}
                      </button>

                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-bold ${task.completed ? 'line-through text-gray-500' : 'text-[#2C221E] dark:text-white'}`}>
                            {task.title}
                          </span>
                          {isCumulative ? (
                            <span className="text-[10px] bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200 font-bold px-2 py-0.5 rounded-full">
                              تراكمي #{task.cumulativeOrder || 1}
                            </span>
                          ) : (
                            <span className="text-[10px] bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-200 font-bold px-2 py-0.5 rounded-full">
                              مستقل
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
                          <span className="font-mono text-[#4AA690]">
                            {formatTime12h(task.startTime)} - {formatTime12h(task.endTime)}
                          </span>
                          <span>• {task.durationMinutes} دقيقة</span>
                          {task.isPomodoro && (
                            <span className="text-[10px] bg-[#E7C690]/25 text-[#2C221E] dark:text-[#E7C690] px-2 py-0.5 rounded-full">
                              Pomodoro
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {!task.completed && (
                          <button
                            onClick={() => onStartTimer(task)}
                            className="p-2 rounded-full bg-[#4AA690]/15 text-[#4AA690] hover:bg-[#4AA690] hover:text-white transition"
                            title="تشغيل المؤقت"
                          >
                            <Play className="w-4 h-4 fill-current ml-0.5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-2 rounded-full text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Buffer */}
      {activeTab === 'buffer' && (
        <div className="space-y-4">
          <div className="p-4 rounded-3xl bg-white dark:bg-[#201915] border border-[#E7C690]/50 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/10">
              <div>
                <h3 className="text-sm font-bold text-[#2C221E] dark:text-white">
                  وقت الاحتياط اليومي (Daily Buffer)
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  هامش زمني واحد فقط في نهاية كل يوم لاستيعاب التأخيرات الطارئة
                </p>
              </div>
              <button
                id="toggle-buffer-btn"
                onClick={handleToggleBufferEnabled}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  currentBuffer.enabled
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-gray-100 text-gray-600 border border-gray-300'
                }`}
              >
                {currentBuffer.enabled ? '✓ مفعّل' : '✕ معطّل'}
              </button>
            </div>

            {currentBuffer.enabled && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#2C221E] dark:text-white">
                    مدة الـ Buffer لهذا اليوم:
                  </span>
                  <div className="flex items-center gap-2">
                    {[15, 30, 45, 60].map((mins) => (
                      <button
                        key={mins}
                        onClick={() => handleUpdateBufferDuration(mins)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                          currentBuffer.durationMinutes === mins
                            ? 'bg-[#4AA690] text-white'
                            : 'bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {mins} د
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#FAF8F5] dark:bg-black/20 border border-[#E7C690]/30 text-xs text-[#2C221E]/80 dark:text-white/80 flex items-center justify-between">
                  <span>حالة استهلاك الـ Buffer اليوم:</span>
                  <span className={`font-bold ${currentBuffer.used ? 'text-amber-600' : 'text-[#4AA690]'}`}>
                    {currentBuffer.used ? 'تم استهلاكه في إزاحة طارئة' : 'متاح بالكامل في نهاية اليوم'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Weekly Completion Graph */}
      {activeTab === 'graph' && (
        <div className="space-y-4">
          <div className="p-4 rounded-3xl bg-white dark:bg-[#201915] border border-[#E7C690]/50 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-[#2C221E] dark:text-white">
                  مخطط الإنجاز الأسبوعي (Weekly Graph)
                </h3>
                <p className="text-xs text-gray-500">
                  من السبت إلى الجمعة (الجمعة آخر أيام الأسبوع)
                </p>
              </div>
              <div className="text-xs font-bold text-[#4AA690] bg-[#4AA690]/10 px-2.5 py-1 rounded-lg">
                تحديث تلقائي حي
              </div>
            </div>

            {/* Bar Chart Visualization */}
            <div className="flex items-end justify-between gap-2 h-44 pt-6 pb-2 px-2 border-b border-gray-100 dark:border-white/10">
              {weeklyCompletionRates.map((item) => (
                <div key={item.day} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                  <span className="text-[10px] font-mono font-bold text-[#2C221E] dark:text-white">
                    {item.rate}%
                  </span>
                  <div className="w-full max-w-[28px] bg-gray-100 dark:bg-white/10 rounded-t-lg relative flex items-end justify-center overflow-hidden h-28">
                    <div
                      style={{ height: `${item.rate}%` }}
                      className={`w-full rounded-t-lg transition-all duration-700 ${
                        item.isSelected
                          ? 'bg-[#4AA690]'
                          : item.isToday
                          ? 'bg-[#E7C690]'
                          : 'bg-[#4AA690]/50'
                      }`}
                    />
                  </div>
                  <span className={`text-[10px] font-semibold ${item.isSelected ? 'text-[#4AA690] font-bold' : 'text-gray-500'}`}>
                    {item.nameAr}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between text-[11px] text-gray-500 pt-3">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm bg-[#4AA690]" />
                <span>اليوم المحدد</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm bg-[#E7C690]" />
                <span>تاريخ اليوم الحقيقي</span>
              </div>
              <span>الجمعة: ختام الأسبوع</span>
            </div>
          </div>
        </div>
      )}

      {/* Emergency Shift Modal */}
      {isEmergencyModalOpen && (
        <div
          id="emergency-shift-modal"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="bg-[#FAF8F5] dark:bg-[#261E1A] rounded-3xl w-full max-w-md p-5 shadow-2xl border border-amber-400/50 text-right space-y-4">
            <div className="flex items-center justify-between border-b border-amber-400/30 pb-3">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-bold">
                <AlertTriangle className="w-5 h-5" />
                <span>إزاحة طارئة (Emergency Shift)</span>
              </div>
              <button
                onClick={() => {
                  setShiftPreview(null);
                  setIsEmergencyModalOpen(false);
                }}
                className="p-1 rounded-full text-gray-500 hover:text-gray-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#2C221E]/80 dark:text-white/80">
              اختر مدة التأخير الطارئ (الحد الأقصى 90 دقيقة). سيعيد النظام تنظيم المهام تلقائياً:
              <br />
              <strong>1. المهام الأساسية</strong> أولاً، ثم <strong>2. الـ Buffer</strong>، ثم <strong>3. مهام التطوير</strong> مع الحفاظ الصارم على ترتيب المهام التراكمية.
            </p>

            {/* Shift Durations Selector */}
            <div className="grid grid-cols-5 gap-1.5">
              {([15, 30, 45, 60, 90] as const).map((mins) => (
                <button
                  key={mins}
                  onClick={() => setSelectedShiftMinutes(mins)}
                  className={`py-2 rounded-xl text-xs font-bold transition ${
                    selectedShiftMinutes === mins
                      ? 'bg-amber-500 text-white shadow-md'
                      : 'bg-white dark:bg-black/20 border border-amber-300/60 text-amber-900 dark:text-amber-200'
                  }`}
                >
                  {mins} دقيقة
                </button>
              ))}
            </div>

            {/* Preview Action Button */}
            {!shiftPreview && (
              <button
                id="calculate-emergency-shift-btn"
                onClick={handleRunEmergencyShiftPreview}
                className="w-full bg-[#4AA690] text-white py-3 rounded-xl font-bold text-xs shadow-md hover:bg-[#4AA690]/90 transition"
              >
                معاينة إعادة تنظيم الجدول (Preview)
              </button>
            )}

            {/* Shift Preview Details */}
            {shiftPreview && (
              <div className="space-y-3 pt-2 border-t border-gray-200 dark:border-white/10">
                <div className="text-xs font-bold text-[#4AA690]">
                  {shiftPreview.explanation}
                </div>

                {shiftPreview.items.length > 0 && (
                  <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                    {shiftPreview.items.map((item) => (
                      <div
                        key={item.taskId}
                        className="p-2.5 rounded-xl bg-white dark:bg-black/30 border border-[#E7C690]/40 text-xs"
                      >
                        <div className="font-bold text-[#2C221E] dark:text-white">
                          {item.title}
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-gray-500 mt-1">
                          <span>
                            من: {formatTime12h(item.oldStartTime)} ({item.oldDay})
                          </span>
                          <span className="text-[#4AA690] font-bold">
                            إلى: {formatTime12h(item.newStartTime)} ({item.newDay})
                          </span>
                        </div>
                        <div className="text-[10px] text-amber-600 mt-0.5">
                          {item.reason}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Confirm and Cancel Buttons */}
                <div className="flex items-center gap-2 pt-2">
                  <button
                    id="confirm-emergency-shift-btn"
                    onClick={handleConfirmEmergencyShift}
                    className="flex-1 bg-[#4AA690] text-white py-2.5 rounded-xl font-bold text-xs shadow-md hover:bg-[#4AA690]/90 transition"
                  >
                    تأكيد وتطبيق التعديل
                  </button>
                  <button
                    id="cancel-emergency-shift-btn"
                    onClick={() => setShiftPreview(null)}
                    className="px-4 py-2.5 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 dark:text-gray-300"
                  >
                    تراجع
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {isAddTaskModalOpen && (
        <div
          id="add-task-modal"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="bg-[#FAF8F5] dark:bg-[#261E1A] rounded-3xl w-full max-w-md p-5 shadow-2xl border border-[#E7C690]/50 text-right space-y-4">
            <div className="flex items-center justify-between border-b border-[#E7C690]/30 pb-3">
              <h3 className="text-sm font-bold text-[#2C221E] dark:text-white">
                إضافة مهمة جديدة ليوم {DAYS_OF_WEEK.find((d) => d.id === selectedDay)?.nameAr}
              </h3>
              <button
                onClick={() => setIsAddTaskModalOpen(false)}
                className="p-1 rounded-full text-gray-500 hover:text-gray-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                اسم المهمة:
              </label>
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="مثال: مذاكرة خوارزميات، مراجعة القرآن..."
                className="w-full bg-white dark:bg-black/20 border border-[#E7C690]/50 rounded-xl p-2.5 text-sm focus:outline-none focus:border-[#4AA690]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  نوع المهمة:
                </label>
                <select
                  value={newTaskCategory}
                  onChange={(e) => setNewTaskCategory(e.target.value as TaskCategory)}
                  className="w-full bg-white dark:bg-black/20 border border-[#E7C690]/50 rounded-xl p-2.5 text-xs font-semibold"
                >
                  <option value="essential">أساسية (Essential)</option>
                  <option value="development">تطوير (Development)</option>
                </select>
              </div>

              {newTaskCategory === 'development' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    تصنيف التطوير:
                  </label>
                  <select
                    value={newTaskDevType}
                    onChange={(e) => setNewTaskDevType(e.target.value as DevelopmentType)}
                    className="w-full bg-white dark:bg-black/20 border border-[#E7C690]/50 rounded-xl p-2.5 text-xs font-semibold"
                  >
                    <option value="cumulative">تراكمية (Cumulative)</option>
                    <option value="non_cumulative">غير تراكمية (مستقلة)</option>
                  </select>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  وقت البدء (24h):
                </label>
                <input
                  type="time"
                  value={newTaskStartTime}
                  onChange={(e) => setNewTaskStartTime(e.target.value)}
                  className="w-full bg-white dark:bg-black/20 border border-[#E7C690]/50 rounded-xl p-2 text-xs font-semibold text-center"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  المدة (بالدقائق):
                </label>
                <input
                  type="number"
                  min={10}
                  max={240}
                  step={15}
                  value={newTaskDuration}
                  onChange={(e) => setNewTaskDuration(Number(e.target.value))}
                  className="w-full bg-white dark:bg-black/20 border border-[#E7C690]/50 rounded-xl p-2 text-xs font-semibold text-center"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-black/20 border border-[#E7C690]/30 text-xs">
              <span className="font-semibold">وقت الانتهاء المحسوب تلقائياً:</span>
              <span className="font-mono font-bold text-[#4AA690]">
                {calculateEndTime(newTaskStartTime, newTaskDuration)}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-black/20 border border-[#E7C690]/30 text-xs">
              <span>تفعيل تقنية بومودورو للمهمة:</span>
              <input
                type="checkbox"
                checked={newTaskPomodoro}
                onChange={(e) => setNewTaskPomodoro(e.target.checked)}
                className="w-4 h-4 accent-[#4AA690] cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                id="submit-add-task-btn"
                onClick={handleAddNewTask}
                disabled={!newTaskTitle.trim()}
                className="flex-1 bg-[#4AA690] text-white py-2.5 rounded-xl font-bold text-xs shadow-md hover:bg-[#4AA690]/90 transition disabled:opacity-50"
              >
                إضافة للجدول
              </button>
              <button
                onClick={() => setIsAddTaskModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-gray-300 text-xs font-semibold"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
