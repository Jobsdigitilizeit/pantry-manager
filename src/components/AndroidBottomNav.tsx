import React from 'react';
import { Refrigerator, Sparkles, BookOpen, Settings } from 'lucide-react';

export type ScreenTab = 'pantry' | 'suggested' | 'settings';

interface AndroidBottomNavProps {
  currentTab: ScreenTab;
  onTabChange: (tab: ScreenTab) => void;
  strictRecipesCount: number;
  expiringItemsCount: number;
}

export const AndroidBottomNav: React.FC<AndroidBottomNavProps> = ({
  currentTab,
  onTabChange,
  strictRecipesCount,
  expiringItemsCount,
}) => {
  const tabs = [
    {
      id: 'pantry' as ScreenTab,
      label: 'Pantry',
      icon: Refrigerator,
      badge: expiringItemsCount > 0 ? expiringItemsCount : undefined,
      badgeColor: 'bg-amber-500 text-white',
    },
    {
      id: 'suggested' as ScreenTab,
      label: 'Suggested',
      icon: Sparkles,
      badge: strictRecipesCount > 0 ? strictRecipesCount : undefined,
      badgeColor: 'bg-emerald-600 text-white',
    },
    {
      id: 'settings' as ScreenTab,
      label: 'Settings',
      icon: Settings,
    },
  ];

  return (
    <div className="sticky bottom-0 z-30 bg-white border-t border-slate-200 px-2 py-1 shadow-lg select-none">
      <div className="grid grid-cols-3 items-center">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all relative cursor-pointer ${
                isActive ? 'text-emerald-800' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className="relative">
                <div
                  className={`w-9 h-6 rounded-full flex items-center justify-center transition-colors ${
                    isActive ? 'bg-emerald-100 text-emerald-800' : 'text-slate-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                {tab.badge !== undefined && (
                  <span
                    className={`absolute -top-1 -right-1 text-[10px] font-bold px-1.5 py-0.2 rounded-full ring-2 ring-white shadow-xs ${tab.badgeColor}`}
                  >
                    {tab.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] mt-0.5 tracking-tight ${
                  isActive ? 'font-bold text-emerald-900' : 'font-medium text-slate-500'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
