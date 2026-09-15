import React, { useState, useEffect, useMemo } from 'react';
import { AppSettings, PrayerTimeItem } from '../../types';
import {
  calculatePrayerTimes,
  getCountdownToNextPrayer,
  SUPPORTED_CITIES,
} from '../../utils/prayerUtils';
import {
  MORNING_ADHKAR,
  EVENING_ADHKAR,
  AUTHENTIC_HADITHS,
  QURAN_SURAHS,
} from '../../data/islamicContent';
import { formatSeconds, formatTime12h } from '../../utils/timeUtils';
import {
  Compass,
  Clock,
  Sun,
  Moon,
  BookOpen,
  Scroll,
  MapPin,
  Settings as SettingsIcon,
  CheckCircle,
  RefreshCw,
  Edit2,
  X,
} from 'lucide-react';

interface PrayerPageProps {
  settings: AppSettings;
  onUpdateSettings: (updated: AppSettings) => void;
  onOpenSideMenu: () => void;
}

export const PrayerPage: React.FC<PrayerPageProps> = ({
  settings,
  onUpdateSettings,
  onOpenSideMenu,
}) => {
  const [activeSection, setActiveSection] = useState<'prayers' | 'adhkar' | 'quran' | 'hadith'>('prayers');
  const [adhkarSubTab, setAdhkarSubTab] = useState<'morning' | 'evening'>('morning');
  const [selectedSurahId, setSelectedSurahId] = useState<number>(1);

  // Adhkar Counters
  const [adhkarCounts, setAdhkarCounts] = useState<Record<string, number>>({});

  // Manual Prayer Overrides Modal
  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false);
  const [overridePrayerName, setOverridePrayerName] = useState('الفجر');
  const [overridePrayerTime, setOverridePrayerTime] = useState('');

  // Live timer ticker for next prayer countdown
  const [ticker, setTicker] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setTicker((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Calculate prayer times
  const prayerTimes: PrayerTimeItem[] = useMemo(() => {
    return calculatePrayerTimes(
      new Date(),
      settings.latitude,
      settings.longitude,
      3, // Default offset for Cairo/Mecca/Riyadh region
      settings.manualPrayerOverrides
    );
  }, [settings.latitude, settings.longitude, settings.manualPrayerOverrides, ticker]);

  const countdown = useMemo(() => {
    return getCountdownToNextPrayer(prayerTimes);
  }, [prayerTimes, ticker]);

  const handleIncrementDhikr = (id: string, max: number) => {
    const current = adhkarCounts[id] || 0;
    if (current < max) {
      setAdhkarCounts({ ...adhkarCounts, [id]: current + 1 });
    }
  };

  const handleResetDhikr = (id: string) => {
    setAdhkarCounts({ ...adhkarCounts, [id]: 0 });
  };

  const handleSaveManualOverride = () => {
    if (!overridePrayerTime) return;
    const updated = {
      ...settings.manualPrayerOverrides,
      [overridePrayerName]: overridePrayerTime,
    };
    onUpdateSettings({ ...settings, manualPrayerOverrides: updated });
    setIsOverrideModalOpen(false);
    setOverridePrayerTime('');
  };

  const handleRemoveOverride = (name: string) => {
    const copy = { ...settings.manualPrayerOverrides };
    delete copy[name];
    onUpdateSettings({ ...settings, manualPrayerOverrides: copy });
  };

  const handleCityChange = (cityName: string) => {
    const found = SUPPORTED_CITIES.find((c) => c.nameAr === cityName);
    if (found) {
      onUpdateSettings({
        ...settings,
        city: found.nameAr,
        latitude: found.latitude,
        longitude: found.longitude,
      });
    }
  };

  const currentSurah = QURAN_SURAHS.find((s) => s.id === selectedSurahId) || QURAN_SURAHS[0];

  return (
    <div className="min-h-full p-4 pb-12 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            id="prayer-side-menu-btn"
            onClick={onOpenSideMenu}
            className="p-2.5 rounded-2xl bg-white/90 dark:bg-black/25 text-[#4AA690] border border-[#E7C690]/40 shadow-sm active:scale-95"
          >
            <Compass className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-base font-bold text-[#2C221E] dark:text-white">
              مواقيت الصلاة، الأذكار، والقرآن
            </h2>
            <div className="text-[11px] text-[#2C221E]/60 dark:text-white/60">
              {settings.city} • مصادر موثوقة ونصوص معتمدة
            </div>
          </div>
        </div>

        {/* City Selector */}
        <div className="flex items-center gap-1.5 bg-white/80 dark:bg-black/20 px-2 py-1.5 rounded-xl border border-[#E7C690]/40">
          <MapPin className="w-3.5 h-3.5 text-[#4AA690]" />
          <select
            value={settings.city}
            onChange={(e) => handleCityChange(e.target.value)}
            className="text-xs font-semibold bg-transparent text-[#2C221E] dark:text-white focus:outline-none"
          >
            {SUPPORTED_CITIES.map((c) => (
              <option key={c.nameAr} value={c.nameAr}>
                {c.nameAr}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center p-1 bg-white/90 dark:bg-black/20 rounded-2xl border border-[#E7C690]/40 gap-1 text-xs font-bold">
        <button
          onClick={() => setActiveSection('prayers')}
          className={`flex-1 py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
            activeSection === 'prayers'
              ? 'bg-[#E3F5EE] text-[#4AA690] shadow-sm border border-[#4AA690]/30'
              : 'text-[#2C221E]/60 dark:text-white/60'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>الصلوات</span>
        </button>

        <button
          onClick={() => setActiveSection('adhkar')}
          className={`flex-1 py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
            activeSection === 'adhkar'
              ? 'bg-[#E3F5EE] text-[#4AA690] shadow-sm border border-[#4AA690]/30'
              : 'text-[#2C221E]/60 dark:text-white/60'
          }`}
        >
          <Sun className="w-3.5 h-3.5" />
          <span>الأذكار</span>
        </button>

        <button
          onClick={() => setActiveSection('quran')}
          className={`flex-1 py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
            activeSection === 'quran'
              ? 'bg-[#E3F5EE] text-[#4AA690] shadow-sm border border-[#4AA690]/30'
              : 'text-[#2C221E]/60 dark:text-white/60'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>القرآن</span>
        </button>

        <button
          onClick={() => setActiveSection('hadith')}
          className={`flex-1 py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
            activeSection === 'hadith'
              ? 'bg-[#E3F5EE] text-[#4AA690] shadow-sm border border-[#4AA690]/30'
              : 'text-[#2C221E]/60 dark:text-white/60'
          }`}
        >
          <Scroll className="w-3.5 h-3.5" />
          <span>البخاري</span>
        </button>
      </div>

      {/* SECTION 1: PRAYER TIMES */}
      {activeSection === 'prayers' && (
        <div className="space-y-4">
          {/* Next Prayer Countdown Hero Card */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-[#4AA690] to-[#347c6b] text-white shadow-lg relative overflow-hidden text-center">
            <div className="text-xs text-[#E7C690] font-semibold mb-1">
              الصلاة القادمة: {countdown.nextPrayerName}
            </div>
            <div className="text-3xl sm:text-4xl font-mono font-black tracking-widest my-2" dir="ltr">
              {formatSeconds(countdown.remainingSeconds)}
            </div>
            <div className="text-[11px] text-white/80">
              الوقت المتبقي حتى موعد أذان {countdown.nextPrayerName}
            </div>

            <button
              onClick={() => setIsOverrideModalOpen(true)}
              className="mt-3 inline-flex items-center gap-1 text-[11px] bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-full transition"
            >
              <Edit2 className="w-3 h-3" />
              <span>تعديل يدوي لوقت صلاة (Manual Override)</span>
            </button>
          </div>

          {/* Prayer Times Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {prayerTimes.map((p) => {
              const isOverridden = !!settings.manualPrayerOverrides[p.name];

              return (
                <div
                  key={p.name}
                  className={`p-3 rounded-2xl border transition flex flex-col justify-between ${
                    p.isNext
                      ? 'bg-[#E3F5EE] dark:bg-[#4AA690]/20 border-[#4AA690] shadow-sm'
                      : 'bg-white dark:bg-[#201915] border-[#E7C690]/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${p.isNext ? 'text-[#4AA690]' : 'text-[#2C221E] dark:text-white'}`}>
                      {p.name}
                    </span>
                    {p.isNext && (
                      <span className="text-[9px] bg-[#4AA690] text-white px-1.5 py-0.5 rounded-full font-bold">
                        القادمة
                      </span>
                    )}
                  </div>

                  <div className="text-lg font-mono font-black text-[#2C221E] dark:text-white my-1">
                    {formatTime12h(p.time)}
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-gray-400">
                    <span>{p.isPassed ? 'مضت' : 'متبقية'}</span>
                    {isOverridden && (
                      <button
                        onClick={() => handleRemoveOverride(p.name)}
                        className="text-amber-600 hover:underline"
                        title="إلغاء التعديل اليدوي"
                      >
                        يدوي ✕
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 2: ADHKAR */}
      {activeSection === 'adhkar' && (
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-2 p-1 bg-white/80 dark:bg-black/20 rounded-2xl border border-[#E7C690]/40 max-w-xs mx-auto">
            <button
              onClick={() => setAdhkarSubTab('morning')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 ${
                adhkarSubTab === 'morning'
                  ? 'bg-[#4AA690] text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span>أذكار الصباح (بعد الفجر)</span>
            </button>
            <button
              onClick={() => setAdhkarSubTab('evening')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 ${
                adhkarSubTab === 'evening'
                  ? 'bg-[#4AA690] text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span>أذكار المساء (قبل المغرب)</span>
            </button>
          </div>

          <div className="space-y-3">
            {(adhkarSubTab === 'morning' ? MORNING_ADHKAR : EVENING_ADHKAR).map((dhikr) => {
              const count = adhkarCounts[dhikr.id] || 0;
              const isDone = count >= dhikr.count;

              return (
                <div
                  key={dhikr.id}
                  className={`p-4 rounded-3xl border transition space-y-2 ${
                    isDone
                      ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-300'
                      : 'bg-white dark:bg-[#201915] border-[#E7C690]/40 shadow-sm'
                  }`}
                >
                  <p className="text-sm font-amiri text-[#2C221E] dark:text-white leading-relaxed">
                    {dhikr.text}
                  </p>

                  {dhikr.virtue && (
                    <div className="text-[11px] text-[#4AA690] font-semibold">
                      {dhikr.virtue}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-white/10">
                    <span className="text-xs text-gray-500">
                      التكرار المطلوب: {dhikr.count}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleResetDhikr(dhikr.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600"
                        title="إعادة ضبط"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleIncrementDhikr(dhikr.id, dhikr.count)}
                        disabled={isDone}
                        className={`px-4 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                          isDone
                            ? 'bg-emerald-500 text-white'
                            : 'bg-[#4AA690] text-white shadow-sm active:scale-95'
                        }`}
                      >
                        {isDone ? (
                          <>
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>تم</span>
                          </>
                        ) : (
                          <span>{count} / {dhikr.count}</span>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 3: QURAN */}
      {activeSection === 'quran' && (
        <div className="space-y-4">
          {/* Surah Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {QURAN_SURAHS.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedSurahId(s.id)}
                className={`px-3 py-1.5 rounded-xl text-xs whitespace-nowrap font-bold transition ${
                  selectedSurahId === s.id
                    ? 'bg-[#4AA690] text-white shadow-sm'
                    : 'bg-white dark:bg-black/20 border border-[#E7C690]/40 text-[#2C221E] dark:text-white'
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>

          {/* Surah Content Card */}
          <div className="p-5 rounded-3xl bg-white dark:bg-[#201915] border border-[#E7C690]/50 shadow-sm text-center space-y-4">
            <div className="border-b border-[#E7C690]/30 pb-3">
              <h3 className="text-xl font-bold font-amiri text-[#2C221E] dark:text-white">
                {currentSurah.name}
              </h3>
              <div className="text-xs text-gray-500 mt-0.5">
                {currentSurah.revelationType} • {currentSurah.versesCount} آيات
              </div>
            </div>

            <div className="space-y-3 font-amiri text-base sm:text-lg leading-loose text-[#2C221E] dark:text-white text-justify px-2">
              {currentSurah.text.map((ayah, i) => (
                <span key={i} className="inline">
                  {ayah}{' '}
                  <span className="inline-flex items-center justify-center w-6 h-6 mx-1 rounded-full border border-[#E7C690] text-xs font-sans text-[#4AA690] font-bold">
                    {i + 1}
                  </span>{' '}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: SAHIH AL-BUKHARI */}
      {activeSection === 'hadith' && (
        <div className="space-y-3">
          <div className="text-xs font-semibold text-gray-500">
            أحاديث نبوية صحيحة موثقة في استثمار الوقت والعمل من صحيح الإمام البخاري
          </div>

          {AUTHENTIC_HADITHS.map((h) => (
            <div
              key={h.id}
              className="p-4 rounded-3xl bg-white dark:bg-[#201915] border border-[#E7C690]/40 shadow-sm space-y-2"
            >
              <div className="inline-block text-[10px] font-bold bg-[#E7C690]/25 text-[#2C221E] dark:text-[#E7C690] px-2.5 py-0.5 rounded-full">
                {h.topic}
              </div>

              <p className="text-sm font-amiri font-bold text-[#2C221E] dark:text-white leading-relaxed">
                {h.matn}
              </p>

              <div className="text-xs text-gray-500 italic">
                {h.narrator}
              </div>

              <div className="text-[11px] text-[#4AA690] font-semibold pt-1 border-t border-gray-100 dark:border-white/10">
                المصدر: {h.reference}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Manual Prayer Time Override Modal */}
      {isOverrideModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FAF8F5] dark:bg-[#261E1A] rounded-3xl w-full max-w-sm p-5 shadow-2xl border border-[#E7C690]/50 text-right space-y-4">
            <div className="flex items-center justify-between border-b border-[#E7C690]/30 pb-2">
              <h3 className="text-sm font-bold text-[#2C221E] dark:text-white">
                تعديل وقت صلاة يدوياً
              </h3>
              <button
                onClick={() => setIsOverrideModalOpen(false)}
                className="p-1 rounded-full text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">اختر الصلاة:</label>
              <select
                value={overridePrayerName}
                onChange={(e) => setOverridePrayerName(e.target.value)}
                className="w-full bg-white dark:bg-black/20 border border-[#E7C690]/50 rounded-xl p-2 text-xs font-bold"
              >
                {prayerTimes.map((p) => (
                  <option key={p.name} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">الوقت الجديد (24 ساعة):</label>
              <input
                type="time"
                value={overridePrayerTime}
                onChange={(e) => setOverridePrayerTime(e.target.value)}
                className="w-full bg-white dark:bg-black/20 border border-[#E7C690]/50 rounded-xl p-2 text-xs font-bold text-center"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={handleSaveManualOverride}
                disabled={!overridePrayerTime}
                className="flex-1 bg-[#4AA690] text-white py-2.5 rounded-xl font-bold text-xs shadow-md disabled:opacity-50"
              >
                حفظ التعديل اليدوي
              </button>
              <button
                onClick={() => setIsOverrideModalOpen(false)}
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
