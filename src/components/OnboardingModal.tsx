import React, { useState } from 'react';
import { AppSettings } from '../types';
import { SUPPORTED_CITIES } from '../utils/prayerUtils';
import { Sparkles, Clock, Bell, MapPin, CheckCircle2, ArrowLeft } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  settings: AppSettings;
  onSave: (updated: AppSettings) => void;
  onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  settings,
  onSave,
  onClose,
}) => {
  const [formData, setFormData] = useState<AppSettings>({ ...settings });
  const [step, setStep] = useState<number>(1);

  if (!isOpen) return null;

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      onSave({ ...formData, isFirstLaunchCompleted: true });
      onClose();
    }
  };

  return (
    <div
      id="onboarding-modal"
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4"
    >
      <div className="bg-[#FAF8F5] dark:bg-[#261E1A] rounded-3xl w-full max-w-md p-6 shadow-2xl border border-[#E7C690]/50 relative text-right">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#4AA690]/15 text-[#4AA690] flex items-center justify-center mx-auto mb-3 border border-[#4AA690]/30">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-[#2C221E] dark:text-white font-amiri">
            أهلاً بك في منظم الوقت
          </h2>
          <p className="text-xs text-[#2C221E]/70 dark:text-white/70 mt-1">
            دعنا نضبط إعدادات يومك وأسبوعك لتخصيص أفضل تجربة ممكنة
          </p>

          {/* Stepper indicator */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className={`h-1.5 rounded-full transition-all duration-300 ${step === 1 ? 'w-8 bg-[#4AA690]' : 'w-2 bg-[#E7C690]/40'}`} />
            <div className={`h-1.5 rounded-full transition-all duration-300 ${step === 2 ? 'w-8 bg-[#4AA690]' : 'w-2 bg-[#E7C690]/40'}`} />
            <div className={`h-1.5 rounded-full transition-all duration-300 ${step === 3 ? 'w-8 bg-[#4AA690]' : 'w-2 bg-[#E7C690]/40'}`} />
          </div>
        </div>

        {/* Step 1: Work Hours & Friday */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-[#4AA690] border-b border-[#E7C690]/30 pb-2">
              <Clock className="w-4 h-4" />
              <span>1. فترات العمل والدراسة اليومية</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#2C221E]/80 dark:text-white/80 mb-1">
                ساعات العمل / المذاكرة اليومية (الأيام العادية)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[11px] text-gray-500">من الساعة:</span>
                  <input
                    type="time"
                    value={formData.dailyStartTime}
                    onChange={(e) => setFormData({ ...formData, dailyStartTime: e.target.value })}
                    className="w-full bg-white dark:bg-black/20 border border-[#E7C690]/50 rounded-xl p-2.5 text-sm font-semibold text-center focus:outline-none focus:border-[#4AA690]"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-gray-500">حتى الساعة:</span>
                  <input
                    type="time"
                    value={formData.dailyEndTime}
                    onChange={(e) => setFormData({ ...formData, dailyEndTime: e.target.value })}
                    className="w-full bg-white dark:bg-black/20 border border-[#E7C690]/50 rounded-xl p-2.5 text-sm font-semibold text-center focus:outline-none focus:border-[#4AA690]"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-xs font-semibold text-[#2C221E]/80 dark:text-white/80 mb-1">
                ساعات يوم الجمعة (ساعات مستقلة مخصصة)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[11px] text-gray-500">بداية الجمعة:</span>
                  <input
                    type="time"
                    value={formData.fridayStartTime}
                    onChange={(e) => setFormData({ ...formData, fridayStartTime: e.target.value })}
                    className="w-full bg-white dark:bg-black/20 border border-[#E7C690]/50 rounded-xl p-2.5 text-sm font-semibold text-center focus:outline-none focus:border-[#4AA690]"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-gray-500">نهاية الجمعة:</span>
                  <input
                    type="time"
                    value={formData.fridayEndTime}
                    onChange={(e) => setFormData({ ...formData, fridayEndTime: e.target.value })}
                    className="w-full bg-white dark:bg-black/20 border border-[#E7C690]/50 rounded-xl p-2.5 text-sm font-semibold text-center focus:outline-none focus:border-[#4AA690]"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Pomodoro & Buffer */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-[#4AA690] border-b border-[#E7C690]/30 pb-2">
              <Sparkles className="w-4 h-4" />
              <span>2. نظام البومودورو ووقت الاحتياط (Buffer)</span>
            </div>

            {/* Pomodoro Toggle */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-black/20 border border-[#E7C690]/30">
              <div>
                <div className="text-sm font-bold text-[#2C221E] dark:text-white">تقنية بومودورو (Pomodoro)</div>
                <div className="text-[11px] text-[#2C221E]/60 dark:text-white/60">تقسيم المهام لجلسات تركيز واستراحة</div>
              </div>
              <input
                type="checkbox"
                checked={formData.pomodoroEnabled}
                onChange={(e) => setFormData({ ...formData, pomodoroEnabled: e.target.checked })}
                className="w-5 h-5 accent-[#4AA690] cursor-pointer"
              />
            </div>

            {formData.pomodoroEnabled && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-xs font-semibold">مدة التركيز (دقيقة):</span>
                  <input
                    type="number"
                    min={15}
                    max={90}
                    value={formData.focusDuration}
                    onChange={(e) => setFormData({ ...formData, focusDuration: Number(e.target.value) })}
                    className="w-full mt-1 bg-white dark:bg-black/20 border border-[#E7C690]/50 rounded-xl p-2 text-sm text-center font-bold"
                  />
                </div>
                <div>
                  <span className="text-xs font-semibold">مدة الاستراحة (دقيقة):</span>
                  <input
                    type="number"
                    min={3}
                    max={30}
                    value={formData.breakDuration}
                    onChange={(e) => setFormData({ ...formData, breakDuration: Number(e.target.value) })}
                    className="w-full mt-1 bg-white dark:bg-black/20 border border-[#E7C690]/50 rounded-xl p-2 text-sm text-center font-bold"
                  />
                </div>
              </div>
            )}

            {/* Buffer Toggle */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-black/20 border border-[#E7C690]/30">
              <div>
                <div className="text-sm font-bold text-[#2C221E] dark:text-white">وقت الاحتياط اليومي (Buffer)</div>
                <div className="text-[11px] text-[#2C221E]/60 dark:text-white/60">هامش في نهاية اليوم لاستيعاب التأخيرات</div>
              </div>
              <input
                type="checkbox"
                checked={formData.bufferEnabled}
                onChange={(e) => setFormData({ ...formData, bufferEnabled: e.target.checked })}
                className="w-5 h-5 accent-[#4AA690] cursor-pointer"
              />
            </div>

            {formData.bufferEnabled && (
              <div>
                <span className="text-xs font-semibold">مدة الـ Buffer الافتراضية (دقيقة):</span>
                <input
                  type="number"
                  min={15}
                  max={120}
                  step={15}
                  value={formData.defaultBufferDuration}
                  onChange={(e) => setFormData({ ...formData, defaultBufferDuration: Number(e.target.value) })}
                  className="w-full mt-1 bg-white dark:bg-black/20 border border-[#E7C690]/50 rounded-xl p-2 text-sm text-center font-bold"
                />
              </div>
            )}
          </div>
        )}

        {/* Step 3: Location & Notifications */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-[#4AA690] border-b border-[#E7C690]/30 pb-2">
              <MapPin className="w-4 h-4" />
              <span>3. مواقيت الصلاة والإشعارات</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#2C221E]/80 dark:text-white/80 mb-1">
                اختر مدينتك لحساب مواقيت الصلاة بدقة:
              </label>
              <select
                value={formData.city}
                onChange={(e) => {
                  const selectedCity = SUPPORTED_CITIES.find((c) => c.nameAr === e.target.value);
                  if (selectedCity) {
                    setFormData({
                      ...formData,
                      city: selectedCity.nameAr,
                      latitude: selectedCity.latitude,
                      longitude: selectedCity.longitude,
                    });
                  }
                }}
                className="w-full bg-white dark:bg-black/20 border border-[#E7C690]/50 rounded-xl p-3 text-sm font-semibold focus:outline-none focus:border-[#4AA690]"
              >
                {SUPPORTED_CITIES.map((c) => (
                  <option key={c.nameAr} value={c.nameAr}>
                    {c.nameAr} ({c.nameEn})
                  </option>
                ))}
              </select>
            </div>

            {/* Notifications Toggle */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-black/20 border border-[#E7C690]/30">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#4AA690]" />
                <div>
                  <div className="text-sm font-bold text-[#2C221E] dark:text-white">إشعارات المؤقت والصلوات</div>
                  <div className="text-[11px] text-[#2C221E]/60 dark:text-white/60">تنبيهات عند انتهاء الجلسات ودخول الصلاة</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={formData.notificationsEnabled}
                onChange={(e) => setFormData({ ...formData, notificationsEnabled: e.target.checked })}
                className="w-5 h-5 accent-[#4AA690] cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="flex items-center justify-between gap-3 mt-8 pt-4 border-t border-[#E7C690]/30">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="px-4 py-2.5 rounded-xl border border-[#E7C690] text-xs font-semibold text-[#2C221E] dark:text-white hover:bg-[#E7C690]/15 transition"
            >
              السابق
            </button>
          ) : (
            <button
              onClick={() => {
                onSave({ ...formData, isFirstLaunchCompleted: true });
                onClose();
              }}
              className="text-xs text-gray-500 hover:underline"
            >
              تخطي واستخدام الافتراضي
            </button>
          )}

          <button
            onClick={handleNext}
            className="flex-1 max-w-[200px] flex items-center justify-center gap-2 bg-[#4AA690] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md hover:bg-[#4AA690]/90 transition"
          >
            <span>{step === 3 ? 'ابدأ الآن' : 'التالي'}</span>
            {step === 3 ? <CheckCircle2 className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
