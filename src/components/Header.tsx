import React, { useState, useEffect } from 'react';
import { ScreenView, KioskSettings } from '../types';
import { getIndonesianDateString, getIndonesianTimeString, playFeedbackSound } from '../data/mockData';

interface HeaderProps {
  currentScreen: ScreenView;
  onNavigate: (screen: ScreenView) => void;
  settings: KioskSettings;
  onTriggerSync: () => void;
  isSyncing: boolean;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  onNavigate,
  settings,
  onTriggerSync,
  isSyncing,
  onOpenSettings,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setCurrentTime(getIndonesianTimeString(now));
      setCurrentDate(getIndonesianDateString(now));
    };
    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSyncClick = () => {
    if (settings.soundEffects) {
      playFeedbackSound('beep');
    }
    onTriggerSync();
  };

  return (
    <header className="bg-primary text-on-primary w-full sticky top-0 z-50 shadow-md border-b border-primary-container/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-3.5 flex items-center justify-between">
        {/* Brand Lockup */}
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-3.5 text-left group hover:opacity-95 transition-all focus:outline-none"
        >
          <div className="w-10 h-10 rounded-lg bg-primary-container/60 border border-primary-fixed/20 flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-2xl" data-icon="account_balance">
              account_balance
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs uppercase tracking-wider text-on-primary/80 font-medium font-body">
              Pemerintah {settings.villageName} {settings.districtName.replace('Kecamatan ', '')}
            </span>
            <h1 className="text-base sm:text-lg md:text-xl font-bold uppercase tracking-tight text-white font-headline leading-tight">
              DAFTAR HADIR DESA
            </h1>
          </div>
        </button>

        {/* Live Clock (Desktop only) */}
        <div className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-container/40 border border-white/10 text-xs text-white/90">
          <span className="material-symbols-outlined text-sm text-secondary-container">schedule</span>
          <span className="font-semibold tabular-nums">{currentTime}</span>
          <span className="text-white/40">|</span>
          <span className="text-white/80">{currentDate}</span>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          {/* Quick QR Scanner button */}
          <button
            onClick={() => onNavigate('qr-scanner')}
            title="Scan QR Code Presensi Cepat"
            aria-label="Scan QR Code"
            className={`p-2.5 rounded-full transition-all flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-secondary-container ${
              currentScreen === 'qr-scanner'
                ? 'bg-secondary text-white shadow-xs'
                : 'hover:bg-primary-container/50 text-on-primary'
            }`}
          >
            <span className="material-symbols-outlined text-2xl" data-icon="qr_code_scanner">
              qr_code_scanner
            </span>
          </button>

          {/* Quick sync button */}
          <button
            onClick={handleSyncClick}
            title="Sinkronisasi Data ke Google Sheets"
            aria-label="Sinkronisasi Data"
            className="p-2.5 hover:bg-primary-container/50 active:scale-95 rounded-full transition-all text-on-primary flex items-center justify-center relative focus:outline-none focus:ring-2 focus:ring-secondary-container"
          >
            <span
              className={`material-symbols-outlined text-2xl ${
                isSyncing ? 'animate-spin text-secondary-container' : ''
              }`}
              data-icon="sync"
            >
              sync
            </span>
          </button>

          {/* Settings / Info button */}
          <button
            onClick={onOpenSettings}
            title="Pengaturan Kiosk & Status Sistem"
            aria-label="Pengaturan Kiosk"
            className="p-2.5 hover:bg-primary-container/50 active:scale-95 rounded-full transition-all text-on-primary flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-secondary-container"
          >
            <span className="material-symbols-outlined text-2xl" data-icon="account_circle">
              account_circle
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
