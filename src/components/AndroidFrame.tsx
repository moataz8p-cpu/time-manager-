import React, { useState } from 'react';
import { PageId } from '../types';
import {
  Home,
  Calendar,
  Compass,
  Sparkles,
  Settings as SettingsIcon,
  X,
  Smartphone,
} from 'lucide-react';

interface AndroidFrameProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  isSideMenuOpen: boolean;
  onCloseSideMenu: () => void;
  onToggleNotificationDrawer: () => void;
  activeTimerCount: number;
  children: React.ReactNode;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({
  currentPage,
  onNavigate,
  isSideMenuOpen,
  onCloseSideMenu,
  onToggleNotificationDrawer,
  activeTimerCount,
  children,
}) => {
  // Mobile device frame sizing toggle
  const [deviceMode, setDeviceMode] = useState<'pixel' | 'large' | 'fluid'>('pixel');

  const menuItems: { id: PageId; title: string; icon: React.ReactNode; subtitle: string }[] = [
    {
      id: 'home',
      title: 'الرئيسية',
      subtitle: 'الساعة الحية وبسم الله وتوجيه اليوم',
      icon: <Home className="w-5 h-5" />,
    },
    {
      id: 'schedule',
      title: 'تنظيم الوقت والجدول الأسبوعي',
      subtitle: 'المهام الأساسية، التراكمية، وBuffer',
      icon: <Calendar className="w-5 h-5" />,
    },
    {
      id: 'prayer',
      title: 'مواقيت الصلاة، الأذكار، والقرآن',
      subtitle: 'حساب دقيق، أذكار، وصحيح البخاري',
      icon: <Compass className="w-5 h-5" />,
    },
    {
      id: 'ai',
      title: 'المساعد الذكي (AI)',
      subtitle: 'تحسين الجدول وإعادة توزيع الطوارئ',
      icon: <Sparkles className="w-5 h-5" />,
    },
    {
      id: 'settings',
      title: 'الإعدادات',
      subtitle: 'ساعات العمل، الجمعة، والبومودورو',
      icon: <SettingsIcon className="w-5 h-5" />,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F3EFEA] dark:bg-[#1A1412] flex flex-col items-center justify-center p-2 sm:p-4 text-[#2C221E] dark:text-white transition-colors">
      {/* Top Device Viewport Switcher Bar */}
      <div className="w-full max-w-md flex items-center justify-between px-3 py-1.5 mb-2 text-xs text-gray-500 font-semibold">
        <div className="flex items-center gap-1 text-[#4AA690]">
          <Smartphone className="w-4 h-4" />
          <span>Android Jetpack Compose Preview</span>
        </div>

        <div className="flex items-center gap-1 bg-white/70 dark:bg-black/30 p-1 rounded-xl border border-[#E7C690]/40">
          <button
            onClick={() => setDeviceMode('pixel')}
            className={`px-2 py-0.5 rounded-lg transition ${
              deviceMode === 'pixel' ? 'bg-[#4AA690] text-white font-bold' : 'hover:text-gray-900'
            }`}
          >
            390×844
          </button>
          <button
            onClick={() => setDeviceMode('large')}
            className={`px-2 py-0.5 rounded-lg transition ${
              deviceMode === 'large' ? 'bg-[#4AA690] text-white font-bold' : 'hover:text-gray-900'
            }`}
          >
            430×932
          </button>
          <button
            onClick={() => setDeviceMode('fluid')}
            className={`px-2 py-0.5 rounded-lg transition ${
              deviceMode === 'fluid' ? 'bg-[#4AA690] text-white font-bold' : 'hover:text-gray-900'
            }`}
          >
            كامل
          </button>
        </div>
      </div>

      {/* Android Device Shell */}
      <div
        className={`relative bg-[#FAF8F5] dark:bg-[#201915] rounded-[32px] shadow-2xl border-4 border-[#2C221E] overflow-hidden flex flex-col transition-all duration-300 ${
          deviceMode === 'pixel'
            ? 'w-[390px] h-[844px]'
            : deviceMode === 'large'
            ? 'w-[430px] h-[932px]'
            : 'w-full max-w-md h-[860px]'
        }`}
      >
        {/* Main App Page Viewport (No fake status bar elements) */}
        <main className="flex-1 overflow-y-auto relative scroll-smooth pt-2">
          {children}
        </main>

        {/* Side Menu (Android Navigation Drawer) */}
        {isSideMenuOpen && (
          <div
            id="side-menu-overlay"
            className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-start transition-opacity"
            onClick={onCloseSideMenu}
          >
            <div
              id="side-menu-drawer"
              className="w-[300px] h-full bg-[#FAF8F5] dark:bg-[#261E1A] shadow-2xl p-5 flex flex-col justify-between border-l border-[#E7C690]/40 text-right animate-in slide-in-from-right duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drawer Top Branding */}
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-[#E7C690]/30 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-[#4AA690] text-white flex items-center justify-center font-amiri font-bold text-lg shadow-sm">
                      و
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-[#2C221E] dark:text-white font-amiri">
                        تطبيق منظم الوقت
                      </h3>
                      <p className="text-[11px] text-[#4AA690] font-semibold">
                        نظام أندرويد متكامل 5 صفحات
                      </p>
                    </div>
                  </div>

                  <button
                    id="close-side-menu-btn"
                    onClick={onCloseSideMenu}
                    className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-gray-500"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* The 5 Main Pages */}
                <div className="space-y-1.5">
                  {menuItems.map((item) => {
                    const isSelected = currentPage === item.id;

                    return (
                      <button
                        key={item.id}
                        id={`nav-item-${item.id}`}
                        onClick={() => {
                          onNavigate(item.id);
                          onCloseSideMenu();
                        }}
                        className={`w-full p-3 rounded-2xl transition flex items-center justify-between text-right ${
                          isSelected
                            ? 'bg-[#E3F5EE] dark:bg-[#4AA690]/25 text-[#4AA690] font-bold border border-[#4AA690]/40 shadow-sm'
                            : 'text-[#2C221E]/80 dark:text-white/80 hover:bg-black/5 dark:hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-xl ${
                              isSelected
                                ? 'bg-[#4AA690] text-white'
                                : 'bg-[#E7C690]/25 text-[#2C221E] dark:text-white'
                            }`}
                          >
                            {item.icon}
                          </div>
                          <div>
                            <div className="text-xs font-bold">{item.title}</div>
                            <div className="text-[10px] text-gray-500 font-normal">
                              {item.subtitle}
                            </div>
                          </div>
                        </div>

                        {isSelected && (
                          <div className="w-2 h-2 rounded-full bg-[#4AA690]" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Drawer Footer Quote */}
              <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-black/20 border border-[#E7C690]/30 text-center">
                <p className="text-[11px] font-amiri text-[#4AA690] font-bold leading-relaxed">
                  «بُورِكَ لِأُمَّتِي فِي بُكُورِهَا»
                </p>
                <div className="text-[9px] text-gray-400 mt-0.5">
                  حديث صحيح - سنن الترمذي
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
