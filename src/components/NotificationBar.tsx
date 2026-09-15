import React from 'react';
import { ActiveTimer } from '../types';
import { formatSeconds } from '../utils/timeUtils';
import { Bell, Play, Pause, X, Clock } from 'lucide-react';

interface NotificationBarProps {
  timer: ActiveTimer | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleTimer: () => void;
  onStopTimer: () => void;
  onOpenTimerDetail: () => void;
}

export const NotificationBar: React.FC<NotificationBarProps> = ({
  timer,
  isOpen,
  onClose,
  onToggleTimer,
  onStopTimer,
  onOpenTimerDetail,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="android-notification-shade"
      className="absolute top-10 left-0 right-0 z-50 bg-[#2D231E]/95 backdrop-blur-md text-white p-4 shadow-2xl rounded-b-3xl border-b border-[#E7C690]/30 transition-all duration-300"
    >
      <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3 text-xs text-[#E7C690]">
        <div className="flex items-center gap-1.5">
          <Bell className="w-3.5 h-3.5" />
          <span>مركز إشعارات أندرويد (Android Notifications)</span>
        </div>
        <button
          id="close-notifications-btn"
          onClick={onClose}
          className="text-white/60 hover:text-white p-1 rounded-full"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {timer ? (
        <div className="bg-[#FAF8F5]/10 rounded-2xl p-3.5 border border-[#4AA690]/40">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#4AA690] animate-pulse" />
              <span className="text-xs font-semibold text-[#E7C690]">
                {timer.phase === 'focus' ? 'مؤقت تركيز نشط (Focus)' : timer.phase === 'break' ? 'مؤقت استراحة (Break)' : 'مؤقت مهمة نشط'}
              </span>
            </div>
            <span className="text-[11px] text-white/60">الآن</span>
          </div>

          <div className="text-sm font-bold text-white mb-1">
            {timer.taskTitle}
          </div>

          <div className="flex items-center justify-between mt-3">
            <div className="text-2xl font-mono font-bold text-[#E7C690] tracking-wider">
              {formatSeconds(timer.remainingSeconds)}
              <span className="text-xs text-white/70 font-sans mr-2">متبقي</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="notification-toggle-timer-btn"
                onClick={onToggleTimer}
                className="p-2 rounded-full bg-[#4AA690] text-white hover:bg-[#4AA690]/80 transition"
                title={timer.isRunning ? 'إيقاف مؤقت' : 'استئناف'}
              >
                {timer.isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
              </button>
              <button
                id="notification-stop-timer-btn"
                onClick={onStopTimer}
                className="p-2 rounded-full bg-red-500/30 text-red-200 hover:bg-red-500/50 transition"
                title="إنهاء"
              >
                <X className="w-4 h-4" />
              </button>
              <button
                id="notification-open-timer-btn"
                onClick={onOpenTimerDetail}
                className="text-xs bg-white/15 px-3 py-1.5 rounded-full text-white hover:bg-white/25 transition"
              >
                فتح المؤقت
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-5 text-white/60 text-xs flex flex-col items-center gap-2">
          <Clock className="w-6 h-6 text-[#E7C690]/60" />
          <span>لا توجد مؤقتات أو تنبيهات نشطة حالياً</span>
        </div>
      )}
    </div>
  );
};
