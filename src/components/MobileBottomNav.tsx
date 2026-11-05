import React from 'react';
import { ScreenView } from '../types';

interface MobileBottomNavProps {
  currentScreen: ScreenView;
  onNavigate: (screen: ScreenView) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentScreen,
  onNavigate,
}) => {
  const isAttendanceActive = currentScreen === 'staff-attendance' || currentScreen === 'home';
  const isGuestActive = currentScreen === 'guest-book';
  const isQrActive = currentScreen === 'qr-scanner';

  return (
    <nav className="fixed bottom-0 left-0 w-full z-40 flex justify-around items-center h-16 px-3 pb-safe md:hidden bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg">
      <button
        onClick={() => onNavigate('staff-attendance')}
        className={`flex flex-col items-center justify-center transition-all px-3 py-1 rounded-full ${
          isAttendanceActive && !isQrActive
            ? 'bg-primary-container text-white font-medium shadow-sm'
            : 'text-slate-600 hover:text-primary'
        }`}
      >
        <span className="material-symbols-outlined text-xl" data-icon="event_available">
          event_available
        </span>
        <span className="text-[11px] font-medium">Daftar Hadir</span>
      </button>

      {/* Center QR Scan Button */}
      <button
        onClick={() => onNavigate('qr-scanner')}
        className={`flex flex-col items-center justify-center transition-all px-4 py-1 rounded-full -mt-2 ${
          isQrActive
            ? 'bg-secondary text-white shadow-md scale-105'
            : 'bg-primary text-white shadow-sm'
        }`}
      >
        <span className="material-symbols-outlined text-xl" data-icon="qr_code_scanner">
          qr_code_scanner
        </span>
        <span className="text-[10px] font-bold">Scan QR</span>
      </button>

      <button
        onClick={() => onNavigate('guest-book')}
        className={`flex flex-col items-center justify-center transition-all px-3 py-1 rounded-full ${
          isGuestActive && !isQrActive
            ? 'bg-primary-container text-white font-medium shadow-sm'
            : 'text-slate-600 hover:text-primary'
        }`}
      >
        <span className="material-symbols-outlined text-xl" data-icon="import_contacts">
          import_contacts
        </span>
        <span className="text-[11px] font-medium">Buku Tamu</span>
      </button>
    </nav>
  );
};
