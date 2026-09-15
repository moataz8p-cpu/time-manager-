import React, { useState } from 'react';
import { AppSettings, Task } from '../../types';
import { SUPPORTED_CITIES } from '../../utils/prayerUtils';
import { playChime, triggerBrowserNotification } from '../../utils/soundAndNotification';
import {
  Settings as SettingsIcon,
  Clock,
  Sparkles,
  Bell,
  Volume2,
  Moon,
  Sun,
  MapPin,
  RotateCcw,
  Download,
  Upload,
  Check,
  Smartphone,
} from 'lucide-react';

interface SettingsPageProps {
  settings: AppSettings;
  onUpdateSettings: (updated: AppSettings) => void;
  tasks: Task[];
  onUpdateTasks: (tasks: Task[]) => void;
  onOpenSideMenu: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  settings,
  onUpdateSettings,
  tasks,
  onUpdateTasks,
  onOpenSideMenu,
}) => {
  const [saveToast, setSaveToast] = useState(false);

  const showSaveSuccess = () => {
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2000);
  };

  const handleToggleSoundTest = () => {
    playChime();
    triggerBrowserNotification(
      'تجربة الصوت والتنبيهات',
      'صوت التنبيه يعمل بدقة مع إشعارات النظام!'
    );
  };

  const handleExportData = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({ settings, tasks }));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `waqt_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="min-h-full p-4 pb-12 space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            id="settings-side-menu-btn"
            onClick={onOpenSideMenu}
            className="p-2.5 rounded-2xl bg-white/90 dark:bg-black/25 text-[#4AA690] border border-[#E7C690]/40 shadow-sm active:scale-95"
          >
            <SettingsIcon className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-base font-bold text-[#2C221E] dark:text-white">
              الإعدادات العامة
            </h2>
            <div className="text-[11px] text-[#2C221E]/60 dark:text-white/60">
              تخصيص الفترات، الجمعة، البومودورو، والتنبيهات
            </div>
          </div>
        </div>

        {saveToast && (
          <div className="flex items-center gap-1 text-[11px] bg-emerald-500 text-white px-2.5 py-1 rounded-full animate-bounce">
            <Check className="w-3.5 h-3.5" />
            <span>تم الحفظ</span>
          </div>
        )}
      </div>

      {/* 1. Working Hours & Friday */}
      <div className="p-4 rounded-3xl bg-white dark:bg-[#201915] border border-[#E7C690]/40 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-[#4AA690] border-b border-gray-100 dark:border-white/10 pb-2">
          <Clock className="w-4 h-4" />
          <span>فترات العمل والمذاكرة (أيام عادية ويوم الجمعة)</span>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#2C221E] dark:text-white mb-1">
            ساعات الأيام العادية (السبت - الخميس):
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[10px] text-gray-500">من الساعة:</span>
              <input
                type="time"
                value={settings.dailyStartTime}
                onChange={(e) => {
                  onUpdateSettings({ ...settings, dailyStartTime: e.target.value });
                  showSaveSuccess();
                }}
                className="w-full bg-[#FAF8F5] dark:bg-black/30 border border-[#E7C690]/50 rounded-xl p-2 text-xs font-bold text-center"
              />
            </div>
            <div>
              <span className="text-[10px] text-gray-500">حتى الساعة:</span>
              <input
                type="time"
                value={settings.dailyEndTime}
                onChange={(e) => {
                  onUpdateSettings({ ...settings, dailyEndTime: e.target.value });
                  showSaveSuccess();
                }}
                className="w-full bg-[#FAF8F5] dark:bg-black/30 border border-[#E7C690]/50 rounded-xl p-2 text-xs font-bold text-center"
              />
            </div>
          </div>
        </div>

        <div className="pt-1">
          <label className="block text-xs font-semibold text-[#2C221E] dark:text-white mb-1">
            ساعات يوم الجمعة المستقلة:
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[10px] text-gray-500">بداية الجمعة:</span>
              <input
                type="time"
                value={settings.fridayStartTime}
                onChange={(e) => {
                  onUpdateSettings({ ...settings, fridayStartTime: e.target.value });
                  showSaveSuccess();
                }}
                className="w-full bg-[#FAF8F5] dark:bg-black/30 border border-[#E7C690]/50 rounded-xl p-2 text-xs font-bold text-center"
              />
            </div>
            <div>
              <span className="text-[10px] text-gray-500">نهاية الجمعة:</span>
              <input
                type="time"
                value={settings.fridayEndTime}
                onChange={(e) => {
                  onUpdateSettings({ ...settings, fridayEndTime: e.target.value });
                  showSaveSuccess();
                }}
                className="w-full bg-[#FAF8F5] dark:bg-black/30 border border-[#E7C690]/50 rounded-xl p-2 text-xs font-bold text-center"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Pomodoro & Buffer Settings */}
      <div className="p-4 rounded-3xl bg-white dark:bg-[#201915] border border-[#E7C690]/40 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-[#4AA690] border-b border-gray-100 dark:border-white/10 pb-2">
          <Sparkles className="w-4 h-4" />
          <span>إعدادات البومودورو والـ Buffer</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#2C221E] dark:text-white">
            تفعيل تقنية البومودورو
          </span>
          <input
            type="checkbox"
            checked={settings.pomodoroEnabled}
            onChange={(e) => {
              onUpdateSettings({ ...settings, pomodoroEnabled: e.target.checked });
              showSaveSuccess();
            }}
            className="w-4 h-4 accent-[#4AA690]"
          />
        </div>

        {settings.pomodoroEnabled && (
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div>
              <span className="text-[10px] text-gray-500">جلسة التركيز (دقيقة):</span>
              <input
                type="number"
                min={15}
                max={90}
                value={settings.focusDuration}
                onChange={(e) => {
                  onUpdateSettings({ ...settings, focusDuration: Number(e.target.value) });
                  showSaveSuccess();
                }}
                className="w-full bg-[#FAF8F5] dark:bg-black/30 border border-[#E7C690]/50 rounded-xl p-2 text-xs font-bold text-center"
              />
            </div>
            <div>
              <span className="text-[10px] text-gray-500">الاستراحة (دقيقة):</span>
              <input
                type="number"
                min={3}
                max={30}
                value={settings.breakDuration}
                onChange={(e) => {
                  onUpdateSettings({ ...settings, breakDuration: Number(e.target.value) });
                  showSaveSuccess();
                }}
                className="w-full bg-[#FAF8F5] dark:bg-black/30 border border-[#E7C690]/50 rounded-xl p-2 text-xs font-bold text-center"
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-white/10">
          <span className="text-xs font-semibold text-[#2C221E] dark:text-white">
            تفعيل وقت الاحتياط اليومي (Buffer)
          </span>
          <input
            type="checkbox"
            checked={settings.bufferEnabled}
            onChange={(e) => {
              onUpdateSettings({ ...settings, bufferEnabled: e.target.checked });
              showSaveSuccess();
            }}
            className="w-4 h-4 accent-[#4AA690]"
          />
        </div>

        {settings.bufferEnabled && (
          <div>
            <span className="text-[10px] text-gray-500">مدة الـ Buffer الافتراضية (دقيقة):</span>
            <input
              type="number"
              min={15}
              max={120}
              step={15}
              value={settings.defaultBufferDuration}
              onChange={(e) => {
                onUpdateSettings({ ...settings, defaultBufferDuration: Number(e.target.value) });
                showSaveSuccess();
              }}
              className="w-full bg-[#FAF8F5] dark:bg-black/30 border border-[#E7C690]/50 rounded-xl p-2 text-xs font-bold text-center"
            />
          </div>
        )}
      </div>

      {/* 3. Notifications & Sound */}
      <div className="p-4 rounded-3xl bg-white dark:bg-[#201915] border border-[#E7C690]/40 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-[#4AA690] border-b border-gray-100 dark:border-white/10 pb-2">
          <Bell className="w-4 h-4" />
          <span>الإشعارات والأصوات</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#2C221E] dark:text-white">
            إشعارات المتصفح والنظام
          </span>
          <input
            type="checkbox"
            checked={settings.notificationsEnabled}
            onChange={(e) => {
              onUpdateSettings({ ...settings, notificationsEnabled: e.target.checked });
              showSaveSuccess();
            }}
            className="w-4 h-4 accent-[#4AA690]"
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#2C221E] dark:text-white">
            عرض مؤقت المهمة في شريط إشعارات أندرويد
          </span>
          <input
            type="checkbox"
            checked={settings.timerNotificationEnabled}
            onChange={(e) => {
              onUpdateSettings({ ...settings, timerNotificationEnabled: e.target.checked });
              showSaveSuccess();
            }}
            className="w-4 h-4 accent-[#4AA690]"
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#2C221E] dark:text-white">
            نغمة الرنين عند اكتمال الجلسة
          </span>
          <input
            type="checkbox"
            checked={settings.soundEnabled}
            onChange={(e) => {
              onUpdateSettings({ ...settings, soundEnabled: e.target.checked });
              showSaveSuccess();
            }}
            className="w-4 h-4 accent-[#4AA690]"
          />
        </div>

        <button
          onClick={handleToggleSoundTest}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-[#E7C690]/25 text-[#2C221E] dark:text-[#E7C690] text-xs font-bold hover:bg-[#E7C690]/40 transition"
        >
          <Volume2 className="w-4 h-4" />
          <span>تجربة صوت التنبيه والإشعار</span>
        </button>
      </div>

      {/* 4. Appearance & City */}
      <div className="p-4 rounded-3xl bg-white dark:bg-[#201915] border border-[#E7C690]/40 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-[#4AA690] border-b border-gray-100 dark:border-white/10 pb-2">
          <MapPin className="w-4 h-4" />
          <span>المدينة والمظهر</span>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#2C221E] dark:text-white mb-1">
            المدينة المختارة لمواقيت الصلاة:
          </label>
          <select
            value={settings.city}
            onChange={(e) => {
              const selected = SUPPORTED_CITIES.find((c) => c.nameAr === e.target.value);
              if (selected) {
                onUpdateSettings({
                  ...settings,
                  city: selected.nameAr,
                  latitude: selected.latitude,
                  longitude: selected.longitude,
                });
                showSaveSuccess();
              }
            }}
            className="w-full bg-[#FAF8F5] dark:bg-black/30 border border-[#E7C690]/50 rounded-xl p-2.5 text-xs font-bold"
          >
            {SUPPORTED_CITIES.map((c) => (
              <option key={c.nameAr} value={c.nameAr}>
                {c.nameAr} ({c.nameEn})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-xs font-semibold text-[#2C221E] dark:text-white">
            المظهر الداكن (Dark Mode)
          </span>
          <button
            onClick={() => {
              onUpdateSettings({ ...settings, darkMode: !settings.darkMode });
              showSaveSuccess();
            }}
            className="p-2 rounded-xl bg-gray-100 dark:bg-white/10 text-[#2C221E] dark:text-white"
          >
            {settings.darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 5. Backup & Export */}
      <div className="p-4 rounded-3xl bg-white dark:bg-[#201915] border border-[#E7C690]/40 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-[#4AA690] border-b border-gray-100 dark:border-white/10 pb-2">
          <Download className="w-4 h-4" />
          <span>النسخ الاحتياطي وحفظ البيانات</span>
        </div>

        <button
          onClick={handleExportData}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#4AA690] text-white text-xs font-bold shadow-md hover:bg-[#4AA690]/90 transition"
        >
          <Download className="w-4 h-4" />
          <span>تصدير نسخة احتياطية من جدولك (JSON)</span>
        </button>
      </div>
    </div>
  );
};
