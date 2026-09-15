import React, { useState, useEffect, useCallback } from 'react';
import {
  PageId,
  Task,
  DailyBuffer,
  AppSettings,
  ActiveTimer,
} from './types';
import {
  loadSettings,
  saveSettings,
  loadTasks,
  saveTasks,
  loadBuffers,
  saveBuffers,
  loadActiveTimer,
  saveActiveTimer,
} from './utils/storage';
import { playChime, triggerBrowserNotification } from './utils/soundAndNotification';
import { AndroidFrame } from './components/AndroidFrame';
import { NotificationBar } from './components/NotificationBar';
import { ActiveTimerModal } from './components/ActiveTimerModal';
import { OnboardingModal } from './components/OnboardingModal';
import { HomePage } from './components/pages/HomePage';
import { SchedulePage } from './components/pages/SchedulePage';
import { PrayerPage } from './components/pages/PrayerPage';
import { AIPage } from './components/pages/AIPage';
import { SettingsPage } from './components/pages/SettingsPage';

export default function App() {
  // Navigation State: strictly the 5 pages
  const [currentPage, setCurrentPage] = useState<PageId>('home');

  // Persistence States
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());
  const [tasks, setTasks] = useState<Task[]>(() => loadTasks());
  const [buffers, setBuffers] = useState<DailyBuffer[]>(() => loadBuffers());
  const [activeTimer, setActiveTimer] = useState<ActiveTimer | null>(() => loadActiveTimer());

  // UI Modals & Drawers
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);
  const [isTimerModalOpen, setIsTimerModalOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(() => !settings.isFirstLaunchCompleted);

  // Sync dark mode with HTML root element
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  // Save changes to localStorage
  const handleUpdateSettings = (updated: AppSettings) => {
    setSettings(updated);
    saveSettings(updated);
  };

  const handleUpdateTasks = (updated: Task[]) => {
    setTasks(updated);
    saveTasks(updated);
  };

  const handleUpdateBuffers = (updated: DailyBuffer[]) => {
    setBuffers(updated);
    saveBuffers(updated);
  };

  // Timer Tick Engine: persistent and accurate using timestamps
  useEffect(() => {
    if (!activeTimer || !activeTimer.isRunning) return;

    const interval = setInterval(() => {
      setActiveTimer((current) => {
        if (!current || !current.isRunning) return current;

        const now = Date.now();
        const target = current.targetEndTime;
        const remaining = Math.max(0, Math.floor((target - now) / 1000));

        if (remaining <= 0) {
          // Timer finished!
          if (settings.soundEnabled) {
            playChime();
          }

          if (settings.notificationsEnabled) {
            const title =
              current.phase === 'focus'
                ? `انتهت جلسة التركيز: ${current.taskTitle}`
                : current.phase === 'break'
                ? 'انتهت فترة الاستراحة! حان وقت متابعة الإنجاز'
                : `اكتملت المهمة: ${current.taskTitle}`;

            triggerBrowserNotification(title, 'اضغط لمتابعة جدولك وتنظيم مهامك.');
          }

          // Cycle Pomodoro if applicable
          if (current.phase === 'focus') {
            const nextBreakSeconds = settings.breakDuration * 60;
            const updatedTimer: ActiveTimer = {
              ...current,
              phase: 'break',
              remainingSeconds: nextBreakSeconds,
              totalSeconds: nextBreakSeconds,
              targetEndTime: Date.now() + nextBreakSeconds * 1000,
              isRunning: true,
              completedPomodoros: current.completedPomodoros + 1,
            };
            saveActiveTimer(updatedTimer);
            return updatedTimer;
          } else if (current.phase === 'break') {
            // Break finished -> stop timer or back to focus
            const updatedTimer: ActiveTimer = {
              ...current,
              phase: 'focus',
              remainingSeconds: settings.focusDuration * 60,
              totalSeconds: settings.focusDuration * 60,
              targetEndTime: Date.now() + settings.focusDuration * 60 * 1000,
              isRunning: false, // Pauses until user resumes next session
            };
            saveActiveTimer(updatedTimer);
            return updatedTimer;
          } else {
            // Standard timer finished
            const updatedTimer: ActiveTimer = {
              ...current,
              remainingSeconds: 0,
              isRunning: false,
            };
            saveActiveTimer(updatedTimer);
            return updatedTimer;
          }
        }

        const updated = { ...current, remainingSeconds: remaining };
        saveActiveTimer(updated);
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTimer?.isRunning, settings]);

  // Start Timer for a specific task
  const handleStartTimer = useCallback(
    (task: Task) => {
      const isPomodoro = task.isPomodoro && settings.pomodoroEnabled;
      const durationMins = isPomodoro ? settings.focusDuration : task.durationMinutes;
      const totalSecs = durationMins * 60;

      const newTimer: ActiveTimer = {
        taskId: task.id,
        taskTitle: task.title,
        phase: isPomodoro ? 'focus' : 'standard',
        totalSeconds: totalSecs,
        remainingSeconds: totalSecs,
        isRunning: true,
        targetEndTime: Date.now() + totalSecs * 1000,
        completedPomodoros: 0,
      };

      setActiveTimer(newTimer);
      saveActiveTimer(newTimer);
      setIsTimerModalOpen(true);
    },
    [settings]
  );

  const handleToggleTimer = () => {
    if (!activeTimer) return;

    setActiveTimer((curr) => {
      if (!curr) return null;
      if (curr.isRunning) {
        // Pause
        const updated = { ...curr, isRunning: false };
        saveActiveTimer(updated);
        return updated;
      } else {
        // Resume
        const target = Date.now() + curr.remainingSeconds * 1000;
        const updated = { ...curr, isRunning: true, targetEndTime: target };
        saveActiveTimer(updated);
        return updated;
      }
    });
  };

  const handleStopTimer = () => {
    setActiveTimer(null);
    saveActiveTimer(null);
    setIsTimerModalOpen(false);
  };

  const handleSkipTimerPhase = () => {
    if (!activeTimer) return;

    if (activeTimer.phase === 'focus') {
      const breakSecs = settings.breakDuration * 60;
      const updated: ActiveTimer = {
        ...activeTimer,
        phase: 'break',
        totalSeconds: breakSecs,
        remainingSeconds: breakSecs,
        targetEndTime: Date.now() + breakSecs * 1000,
        isRunning: true,
      };
      setActiveTimer(updated);
      saveActiveTimer(updated);
    } else if (activeTimer.phase === 'break') {
      const focusSecs = settings.focusDuration * 60;
      const updated: ActiveTimer = {
        ...activeTimer,
        phase: 'focus',
        totalSeconds: focusSecs,
        remainingSeconds: focusSecs,
        targetEndTime: Date.now() + focusSecs * 1000,
        isRunning: true,
      };
      setActiveTimer(updated);
      saveActiveTimer(updated);
    }
  };

  return (
    <AndroidFrame
      currentPage={currentPage}
      onNavigate={(page) => setCurrentPage(page)}
      isSideMenuOpen={isSideMenuOpen}
      onCloseSideMenu={() => setIsSideMenuOpen(false)}
      onToggleNotificationDrawer={() => setIsNotificationDrawerOpen(!isNotificationDrawerOpen)}
      activeTimerCount={activeTimer ? 1 : 0}
    >
      {/* Android Notification Shade Simulator */}
      <NotificationBar
        timer={activeTimer}
        isOpen={isNotificationDrawerOpen}
        onClose={() => setIsNotificationDrawerOpen(false)}
        onToggleTimer={handleToggleTimer}
        onStopTimer={handleStopTimer}
        onOpenTimerDetail={() => {
          setIsNotificationDrawerOpen(false);
          setIsTimerModalOpen(true);
        }}
      />

      {/* The 5 Main Pages Viewport */}
      {currentPage === 'home' && (
        <HomePage
          onNavigate={(page) => setCurrentPage(page)}
          onOpenSideMenu={() => setIsSideMenuOpen(true)}
          onOpenNotifications={() => setIsNotificationDrawerOpen(true)}
          activeTimerCount={activeTimer ? 1 : 0}
        />
      )}

      {currentPage === 'schedule' && (
        <SchedulePage
          tasks={tasks}
          buffers={buffers}
          settings={settings}
          onUpdateTasks={handleUpdateTasks}
          onUpdateBuffers={handleUpdateBuffers}
          onStartTimer={handleStartTimer}
          onOpenSideMenu={() => setIsSideMenuOpen(true)}
          onOpenNotifications={() => setIsNotificationDrawerOpen(true)}
        />
      )}

      {currentPage === 'prayer' && (
        <PrayerPage
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          onOpenSideMenu={() => setIsSideMenuOpen(true)}
        />
      )}

      {currentPage === 'ai' && (
        <AIPage
          tasks={tasks}
          buffers={buffers}
          settings={settings}
          onUpdateTasks={handleUpdateTasks}
          onOpenSideMenu={() => setIsSideMenuOpen(true)}
        />
      )}

      {currentPage === 'settings' && (
        <SettingsPage
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          tasks={tasks}
          onUpdateTasks={handleUpdateTasks}
          onOpenSideMenu={() => setIsSideMenuOpen(true)}
        />
      )}

      {/* Expanded Active Timer Modal */}
      <ActiveTimerModal
        timer={activeTimer}
        isOpen={isTimerModalOpen}
        onClose={() => setIsTimerModalOpen(false)}
        onToggleTimer={handleToggleTimer}
        onStopTimer={handleStopTimer}
        onSkipPhase={handleSkipTimerPhase}
      />

      {/* First-Launch Onboarding Wizard */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        settings={settings}
        onSave={(updated) => {
          handleUpdateSettings(updated);
          setIsOnboardingOpen(false);
        }}
        onClose={() => setIsOnboardingOpen(false)}
      />
    </AndroidFrame>
  );
}
