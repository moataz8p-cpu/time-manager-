import React, { useState, useEffect } from 'react';
import { PageId } from '../../types';
import { Menu, Sparkles, Clock as ClockIcon, Calendar, Compass } from 'lucide-react';
import { motion } from 'motion/react';

interface HomePageProps {
  onNavigate: (page: PageId) => void;
  onOpenSideMenu: () => void;
  onOpenNotifications: () => void;
  activeTimerCount?: number;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  onOpenSideMenu,
  onOpenNotifications,
  activeTimerCount = 0,
}) => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // Typewriter effect for "نظم وقتك مع معتز"
  const [typedText, setTypedText] = useState('');
  const fullWelcomeText = 'نظم وقتك مع معتز';

  useEffect(() => {
    let index = 0;
    setTypedText('');
    const timer = setInterval(() => {
      index++;
      setTypedText(fullWelcomeText.slice(0, index));
      if (index >= fullWelcomeText.length) {
        clearInterval(timer);
      }
    }, 90);
    return () => clearInterval(timer);
  }, []);

  // Real-Time Clock updating every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format real clock
  const hoursRaw = currentTime.getHours();
  const minutes = String(currentTime.getMinutes()).padStart(2, '0');
  const seconds = String(currentTime.getSeconds()).padStart(2, '0');
  const period = hoursRaw >= 12 ? 'م' : 'ص';
  const hours = String(hoursRaw % 12 || 12).padStart(2, '0');

  // Real Arabic Date
  const dateFormatted = currentTime.toLocaleDateString('ar-EG', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="relative min-h-full flex flex-col justify-between p-5 pb-8">
      {/* Top Bar with Hamburger & Notifications */}
      <div className="flex items-center justify-between pt-2">
        <button
          id="home-hamburger-btn"
          onClick={onOpenSideMenu}
          className="p-3 rounded-2xl bg-white/80 dark:bg-black/25 text-[#2C221E] dark:text-white shadow-sm hover:shadow-md border border-[#E7C690]/40 transition active:scale-95"
          aria-label="القائمة الجانبية"
        >
          <Menu className="w-5 h-5 text-[#4AA690]" />
        </button>

        <div className="text-center">
          <div className="text-[11px] text-[#4AA690] font-bold tracking-wider">منظم الوقت</div>
          <div className="text-xs text-[#2C221E]/60 dark:text-white/60 font-medium">{dateFormatted}</div>
        </div>

        <button
          id="home-notifications-btn"
          onClick={onOpenNotifications}
          className="relative p-3 rounded-2xl bg-white/80 dark:bg-black/25 text-[#2C221E] dark:text-white shadow-sm hover:shadow-md border border-[#E7C690]/40 transition active:scale-95"
          aria-label="الإشعارات والمؤقت"
        >
          <ClockIcon className="w-5 h-5 text-[#E7C690]" />
          {activeTimerCount > 0 && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#4AA690] rounded-full ring-2 ring-[#FAF8F5] animate-ping" />
          )}
        </button>
      </div>

      {/* Center Hero: Bismillah, Authentic Duaa, Surah Al-Fatiha, and Real Clock */}
      <div className="my-auto py-4 text-center flex flex-col items-center">
        {/* Basmala */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-4"
        >
          <h1 className="text-3xl sm:text-4xl font-amiri font-bold text-[#2C221E] dark:text-[#FAF8F5] tracking-wide">
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </h1>
          <div className="w-16 h-1 bg-[#E7C690] mx-auto mt-2 rounded-full opacity-70" />
        </motion.div>

        {/* Short Authentic Duaa */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="max-w-xs sm:max-w-sm px-4 py-2.5 rounded-2xl bg-white/60 dark:bg-black/20 border border-[#E7C690]/30 shadow-sm mb-4"
        >
          <p className="text-xs sm:text-sm font-amiri text-[#4AA690] dark:text-[#6ec1ad] font-bold leading-relaxed">
            «اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا طَيِّبًا، وَعَمَلاً مُتَقَبَّلاً»
          </p>
        </motion.div>

        {/* Typewriter Welcoming Text: "نظم وقتك مع معتز" */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25, duration: 0.4 }}
          className="px-5 py-2.5 rounded-2xl bg-white/90 dark:bg-[#261E1A] border border-[#E7C690]/60 shadow-sm mb-5 relative flex items-center justify-center"
        >
          {/* Invisible placeholder to prevent layout shifting during typing */}
          <span className="invisible text-base sm:text-lg font-bold select-none">{fullWelcomeText}</span>
          <span className="absolute text-base sm:text-lg font-bold text-[#2C221E] dark:text-[#FAF8F5] tracking-wide">
            {typedText}
          </span>
        </motion.div>

        {/* Surat Al-Fatiha Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="w-full max-w-sm p-4 rounded-3xl bg-gradient-to-b from-white/90 to-[#FAF8F5]/80 dark:from-[#261E1A]/90 dark:to-[#1F1815]/80 border border-[#E7C690]/40 shadow-sm text-center mb-6"
        >
          <div className="text-[11px] font-bold text-[#E7C690] mb-2 flex items-center justify-center gap-1.5">
            <Compass className="w-3.5 h-3.5" />
            <span>سُورَةُ الفَاتِحَة</span>
          </div>
          <p className="text-xs sm:text-[13px] font-amiri text-[#2C221E]/90 dark:text-white/90 leading-loose">
            الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ﴿٢﴾ الرَّحْمَٰنِ الرَّحِيمِ ﴿٣﴾ مَالِكِ يَوْمِ الدِّينِ ﴿٤﴾ إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ ﴿٥﴾ اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ ﴿٦﴾ صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ ﴿٧﴾
          </p>
        </motion.div>

        {/* Large Real-Time Clock */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="w-full max-w-sm p-6 rounded-3xl bg-white dark:bg-[#201915] border border-[#E7C690]/50 shadow-md flex flex-col items-center justify-center relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-[#E7C690] via-[#4AA690] to-[#E7C690]" />

          <div className="text-[11px] text-[#2C221E]/60 dark:text-white/60 mb-2 font-medium flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#4AA690] animate-pulse" />
            <span>الوقت الحالي الفعلي (Real-Time Clock)</span>
          </div>

          <div className="flex items-baseline justify-center gap-2 font-mono" dir="ltr">
            <div className="flex flex-col items-center">
              <span className="text-3xl sm:text-4xl font-black text-[#2C221E] dark:text-white tracking-tight">
                {hours}
              </span>
              <span className="text-[9px] font-sans text-gray-400">ساعة</span>
            </div>
            <span className="text-3xl font-bold text-[#E7C690] animate-pulse">:</span>
            <div className="flex flex-col items-center">
              <span className="text-3xl sm:text-4xl font-black text-[#2C221E] dark:text-white tracking-tight">
                {minutes}
              </span>
              <span className="text-[9px] font-sans text-gray-400">دقيقة</span>
            </div>
            <span className="text-3xl font-bold text-[#E7C690] animate-pulse">:</span>
            <div className="flex flex-col items-center">
              <span className="text-3xl sm:text-4xl font-black text-[#4AA690] tracking-tight">
                {seconds}
              </span>
              <span className="text-[9px] font-sans text-[#4AA690]/80">ثانية</span>
            </div>

            <span className="text-sm font-bold text-[#E7C690] ml-2 self-center bg-[#E7C690]/15 px-2 py-1 rounded-lg">
              {period}
            </span>
          </div>
        </motion.div>
      </div>

      {/* Main Action Button: "يلا ننظم وقتنا" */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="w-full max-w-sm mx-auto pt-2"
      >
        <button
          id="start-organizing-btn"
          onClick={() => onNavigate('schedule')}
          className="w-full group relative overflow-hidden bg-gradient-to-r from-[#4AA690] to-[#3a8b77] hover:from-[#3f9480] hover:to-[#337a68] text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-[#4AA690]/25 transition-all duration-300 transform active:scale-98 flex items-center justify-center gap-3 text-lg"
        >
          <Calendar className="w-6 h-6 transition-transform group-hover:-rotate-12" />
          <span className="tracking-wide">يلا ننظم وقتنا</span>
          <Sparkles className="w-5 h-5 text-[#E7C690] transition-transform group-hover:scale-125" />
        </button>
      </motion.div>
    </div>
  );
};
