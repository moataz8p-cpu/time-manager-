import React from 'react';
import { ActiveTimer } from '../types';
import { formatSeconds } from '../utils/timeUtils';
import { Play, Pause, Square, Bell, Sparkles, X } from 'lucide-react';

interface ActiveTimerModalProps {
  timer: ActiveTimer | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleTimer: () => void;
  onStopTimer: () => void;
  onSkipPhase?: () => void;
}

export const ActiveTimerModal: React.FC<ActiveTimerModalProps> = ({
  timer,
  isOpen,
  onClose,
  onToggleTimer,
  onStopTimer,
  onSkipPhase,
}) => {
  if (!isOpen || !timer) return null;

  const progress = timer.totalSeconds > 0
    ? ((timer.totalSeconds - timer.remainingSeconds) / timer.totalSeconds) * 100
    : 0;

  return (
    <div
      id="active-timer-modal"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div className="bg-[#FAF8F5] dark:bg-[#261E1A] rounded-3xl w-full max-w-sm p-6 shadow-2xl border border-[#E7C690]/40 relative overflow-hidden text-center">
        {/* Close Button */}
        <button
          id="close-timer-modal-btn"
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-full text-[#2C221E]/60 dark:text-white/60 hover:bg-black/5 dark:hover:bg-white/10 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Phase Pill */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#4AA690]/15 text-[#4AA690] border border-[#4AA690]/30 mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>
            {timer.phase === 'focus'
              ? 'جلسة تركيز (Focus Session)'
              : timer.phase === 'break'
              ? 'استراحة قصيرة (Short Break)'
              : 'مؤقت المهمة (Task Timer)'}
          </span>
        </div>

        {/* Task Title */}
        <h3 className="text-xl font-bold text-[#2C221E] dark:text-white mb-2 line-clamp-2">
          {timer.taskTitle}
        </h3>

        {/* Circular Progress & Time Display */}
        <div className="relative w-56 h-56 mx-auto my-6 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="112"
              cy="112"
              r="95"
              stroke="#E7C690"
              strokeWidth="8"
              strokeOpacity="0.25"
              fill="transparent"
            />
            <circle
              cx="112"
              cy="112"
              r="95"
              stroke={timer.phase === 'break' ? '#E7C690' : '#4AA690'}
              strokeWidth="8"
              strokeDasharray={2 * Math.PI * 95}
              strokeDashoffset={2 * Math.PI * 95 * (1 - progress / 100)}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-linear"
            />
          </svg>

          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-4xl font-mono font-black text-[#2C221E] dark:text-white tracking-widest">
              {formatSeconds(timer.remainingSeconds)}
            </span>
            <span className="text-xs text-[#2C221E]/60 dark:text-white/60 mt-1">
              {timer.isRunning ? 'جارٍ العد التنازلي...' : 'متوقف مؤقتاً'}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 mt-2">
          <button
            id="modal-stop-timer-btn"
            onClick={onStopTimer}
            className="p-3.5 rounded-full bg-red-100 dark:bg-red-950/40 text-red-600 hover:bg-red-200 transition"
            title="إنهاء الجلسة"
          >
            <Square className="w-5 h-5 fill-current" />
          </button>

          <button
            id="modal-toggle-timer-btn"
            onClick={onToggleTimer}
            className="p-5 rounded-full bg-[#4AA690] text-white shadow-lg shadow-[#4AA690]/30 hover:scale-105 active:scale-95 transition"
            title={timer.isRunning ? 'إيقاف مؤقت' : 'استئناف'}
          >
            {timer.isRunning ? (
              <Pause className="w-7 h-7" />
            ) : (
              <Play className="w-7 h-7 fill-current ml-0.5" />
            )}
          </button>

          {onSkipPhase && timer.phase !== 'standard' && (
            <button
              id="modal-skip-phase-btn"
              onClick={onSkipPhase}
              className="px-3.5 py-3 rounded-full bg-[#E7C690]/20 text-[#2C221E] dark:text-white text-xs font-semibold hover:bg-[#E7C690]/40 transition"
            >
              تخطي المرحلة
            </button>
          )}
        </div>

        {/* Background timing notice */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#2C221E]/60 dark:text-white/50 mt-6">
          <Bell className="w-3.5 h-3.5 text-[#4AA690]" />
          <span>المؤقت يعمل في الخلفية ويُرسل إشعاراً عند الانتهاء</span>
        </div>
      </div>
    </div>
  );
};
