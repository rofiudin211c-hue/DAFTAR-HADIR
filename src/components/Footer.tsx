import React from 'react';
import { KioskSettings } from '../types';

interface FooterProps {
  settings: KioskSettings;
  onOpenPanduan: () => void;
  onOpenLokasi: () => void;
  onOpenKontak: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  settings,
  onOpenPanduan,
  onOpenLokasi,
  onOpenKontak,
}) => {
  return (
    <footer className="w-full bg-[#1c1f21] text-white py-8 px-4 sm:px-6 md:px-8 mt-auto border-t border-white/5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <span className="font-semibold text-sm tracking-wide text-white uppercase font-headline">
            Pemerintah {settings.villageName}
          </span>
          <p className="text-xs text-white/60 mt-1 font-body">
            © 2024 Seluruh hak cipta dilindungi. Sistem Kehadiran Mandiri Kiosk.
          </p>
        </div>

        <div className="flex items-center gap-6 text-sm text-white/70">
          <button
            onClick={onOpenPanduan}
            className="hover:text-white transition-colors underline-offset-4 hover:underline text-xs md:text-sm font-medium"
          >
            Panduan
          </button>
          <button
            onClick={onOpenLokasi}
            className="hover:text-white transition-colors underline-offset-4 hover:underline text-xs md:text-sm font-medium"
          >
            Lokasi Kantor
          </button>
          <button
            onClick={onOpenKontak}
            className="hover:text-white transition-colors underline-offset-4 hover:underline text-xs md:text-sm font-medium"
          >
            Hubungi Kami
          </button>
        </div>
      </div>
    </footer>
  );
};
