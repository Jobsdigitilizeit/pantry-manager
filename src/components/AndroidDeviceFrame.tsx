import React, { useState, useEffect } from 'react';
import { Wifi, BatteryMedium, Signal, ArrowLeft, MoreVertical } from 'lucide-react';

interface AndroidDeviceFrameProps {
  children: React.ReactNode;
  activeScreenTitle: string;
  onBack?: () => void;
  showBack?: boolean;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  currentActivityName: string;
}

export const AndroidDeviceFrame: React.FC<AndroidDeviceFrameProps> = ({
  children,
  activeScreenTitle,
  onBack,
  showBack = false,
  isFullscreen = false,
  onToggleFullscreen,
  currentActivityName,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('12:45');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`flex flex-col items-center justify-center transition-all duration-300 ${isFullscreen ? 'w-full h-full' : 'p-2 sm:p-4'}`}>
      <div
        className={`relative flex flex-col bg-slate-900 text-slate-900 overflow-hidden shadow-2xl transition-all duration-300 ${
          isFullscreen
            ? 'w-full h-screen rounded-none'
            : 'w-full max-w-[410px] h-[820px] rounded-[44px] border-[8px] border-slate-800 ring-1 ring-slate-700/50'
        }`}
        style={{
          boxShadow: isFullscreen ? 'none' : '0 25px 60px -15px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255,255,255,0.05)',
        }}
      >
        {/* Hardware Camera Punch-Hole (Pixel style) */}
        {!isFullscreen && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
            <div className="w-4 h-4 bg-black rounded-full ring-2 ring-slate-900/80 shadow-inner flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-slate-900/60 rounded-full" />
            </div>
          </div>
        )}

        {/* Android Status Bar */}
        <div className="sticky top-0 z-40 bg-emerald-800 text-emerald-50 px-6 pt-2 pb-1.5 flex items-center justify-between text-xs select-none">
          <span className="font-semibold tracking-tight">{currentTime}</span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] opacity-80 font-mono">MAD700</span>
            <Signal className="w-3.5 h-3.5" />
            <Wifi className="w-3.5 h-3.5" />
            <BatteryMedium className="w-4 h-4" />
          </div>
        </div>

        {/* Top App Bar (Material 3 TopAppBar) */}
        <div className="sticky top-[29px] z-30 bg-emerald-800 text-white px-4 py-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            {showBack && (
              <button
                onClick={onBack}
                aria-label="Navigate Up"
                className="w-9 h-9 -ml-1 rounded-full flex items-center justify-center hover:bg-emerald-700/60 active:bg-emerald-700 transition-colors text-white"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <h1 className="text-lg font-semibold tracking-tight truncate leading-tight">
                {activeScreenTitle}
              </h1>
              <p className="text-[11px] text-emerald-200/90 font-mono truncate">
                {currentActivityName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {onToggleFullscreen && (
              <button
                onClick={onToggleFullscreen}
                title={isFullscreen ? 'Exit Fullscreen Device' : 'Expand Device View'}
                className="text-xs text-emerald-100 hover:text-white px-2 py-1 rounded bg-emerald-700/50 hover:bg-emerald-700 font-medium transition-colors"
              >
                {isFullscreen ? 'Exit' : 'Full'}
              </button>
            )}
          </div>
        </div>

        {/* Main Android Screen Content Area */}
        <div className="flex-1 bg-slate-50 flex flex-col overflow-y-auto relative">
          {children}
        </div>

        {/* Android System Gesture Bar */}
        <div className="bg-slate-50 py-1.5 flex justify-center items-center select-none border-t border-slate-200/50">
          <div className="w-32 h-1 bg-slate-400/80 rounded-full" />
        </div>
      </div>
    </div>
  );
};
