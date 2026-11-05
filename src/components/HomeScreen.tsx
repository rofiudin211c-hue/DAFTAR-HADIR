import React from 'react';
import { ScreenView, AttendanceRecord, StaffMember } from '../types';
import { playFeedbackSound } from '../data/mockData';

interface HomeScreenProps {
  onNavigate: (screen: ScreenView) => void;
  soundEnabled: boolean;
  records: AttendanceRecord[];
  staffList: StaffMember[];
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigate,
  soundEnabled,
  records,
  staffList,
}) => {
  const handleSelect = (screen: ScreenView) => {
    if (soundEnabled) {
      playFeedbackSound('beep');
    }
    onNavigate(screen);
  };

  const presentCount = records.filter(r => r.recordType === 'perangkat').length;
  const guestCount = records.filter(r => r.recordType === 'tamu').length;

  return (
    <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden px-4 sm:px-6 md:px-8 py-10 md:py-16">
      {/* Background civic watermark blur */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary rounded-full filter blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary rounded-full filter blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
      </div>

      <div className="w-full max-w-5xl z-10 flex flex-col items-center">
        {/* Hero Title */}
        <div className="text-center mb-10 md:mb-12">
          <p className="text-xs sm:text-sm font-semibold text-secondary uppercase tracking-widest mb-2 font-body">
            Pelayanan Publik Digital
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-on-surface tracking-tight mb-4 font-headline">
            Sistem Kehadiran Mandiri
          </h2>
          <div className="h-1 w-24 bg-primary mx-auto rounded-full"></div>
        </div>

        {/* Real-time Status Strip */}
        <div className="w-full max-w-3xl flex flex-wrap items-center justify-center gap-3 sm:gap-6 mb-8 text-xs sm:text-sm text-slate-600">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-white/80 border border-slate-200 rounded-full shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 status-pulse-green"></span>
            <span className="font-medium text-slate-700">Kiosk Online</span>
            <span className="text-slate-400">·</span>
            <span className="text-slate-500">Google Sheets Terhubung</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 bg-white/80 border border-slate-200 rounded-full shadow-xs">
            <span className="material-symbols-outlined text-base text-secondary">location_on</span>
            <span className="font-medium text-slate-700">GPS Balai Desa Aktif</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 bg-white/80 border border-slate-200 rounded-full shadow-xs">
            <span className="material-symbols-outlined text-base text-primary">badge</span>
            <span className="font-medium text-slate-700">{presentCount} Perangkat Hadir</span>
            <span className="text-slate-400">·</span>
            <span className="text-slate-500">{guestCount} Tamu</span>
          </div>
        </div>

        {/* Quick QR Check-in Banner */}
        <div className="w-full mb-8 bg-gradient-to-r from-primary via-primary-container to-secondary p-5 sm:p-6 rounded-2xl shadow-sm text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-3xl text-secondary-container">
                qr_code_scanner
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container">
                  Fitur Cepat
                </span>
                <span className="text-xs text-white/80">Kamera Kiosk Aktif</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold font-headline text-white mt-0.5">
                Scan QR Code Kartu ID & Tamu
              </h3>
              <p className="text-xs sm:text-sm text-white/80 font-body">
                Punya kartu tanda pengenal QR atau tiket tamu? Tunjukkan ke kamera untuk presensi instan.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => handleSelect('qr-scanner')}
              className="bg-white text-primary hover:bg-slate-100 px-5 py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer font-headline"
            >
              <span className="material-symbols-outlined text-lg">photo_camera</span>
              <span>Buka Scanner Kamera</span>
            </button>
          </div>
        </div>

        {/* Bento-style Action Buttons (Direct 1:1 Match with Design) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-14 w-full">
          {/* Attendance Button (White Card) */}
          <button
            onClick={() => handleSelect('staff-attendance')}
            className="group flex flex-col items-start justify-between p-8 md:p-10 bg-white border border-outline-variant rounded-2xl shadow-sm hover:shadow-lg hover:border-secondary transition-all duration-300 text-left w-full h-full min-h-[260px] active:scale-[0.98] cursor-pointer focus:outline-none focus:ring-2 focus:ring-secondary"
          >
            <div className="flex justify-between w-full items-start mb-8">
              <div className="flex gap-4 items-center">
                <span className="material-symbols-outlined text-5xl text-primary" data-icon="face">
                  face
                </span>
                <span className="material-symbols-outlined text-5xl text-secondary" data-icon="fingerprint">
                  fingerprint
                </span>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-outline group-hover:bg-primary-container group-hover:text-white transition-all">
                <span className="material-symbols-outlined text-2xl" data-icon="arrow_forward">
                  arrow_forward
                </span>
              </div>
            </div>
            <div className="w-full">
              <h3 className="text-xl md:text-2xl font-bold text-primary mb-2 tracking-tight font-headline">
                DAFTAR HADIR PERANGKAT
              </h3>
              <p className="text-sm md:text-base text-on-surface-variant font-body leading-relaxed">
                Khusus untuk seluruh perangkat desa Kedungrejo. Gunakan scan wajah atau sidik jari.
              </p>
            </div>
          </button>

          {/* Guest Book Button (Deep Navy Card) */}
          <button
            onClick={() => handleSelect('guest-book')}
            className="group flex flex-col items-start justify-between p-8 md:p-10 bg-primary text-on-primary rounded-2xl shadow-sm hover:shadow-lg hover:bg-primary-container transition-all duration-300 text-left w-full h-full min-h-[260px] active:scale-[0.98] cursor-pointer focus:outline-none focus:ring-2 focus:ring-secondary-container"
          >
            <div className="flex justify-between w-full items-start mb-8">
              <span className="material-symbols-outlined text-6xl text-white" data-icon="menu_book">
                menu_book
              </span>
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/70 group-hover:bg-white group-hover:text-primary transition-all">
                <span className="material-symbols-outlined text-2xl" data-icon="arrow_forward">
                  arrow_forward
                </span>
              </div>
            </div>
            <div className="w-full">
              <h3 className="text-xl md:text-2xl font-bold text-white mb-2 tracking-tight uppercase font-headline">
                BUKU TAMU DIGITAL
              </h3>
              <p className="text-sm md:text-base text-white/80 font-body leading-relaxed">
                Pencatatan kunjungan warga dan tamu dinas untuk administrasi kependudukan yang lebih baik.
              </p>
            </div>
          </button>
        </div>

        {/* Instructions Section (Panduan Penggunaan Kiosk) */}
        <div className="w-full max-w-4xl border-t border-slate-200 pt-10">
          <div className="flex items-center gap-2.5 mb-8 justify-center">
            <span className="material-symbols-outlined text-primary text-2xl" data-icon="info">
              info
            </span>
            <h4 className="text-sm md:text-base font-bold text-primary uppercase tracking-wide font-headline">
              Panduan Penggunaan Kiosk
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center text-center p-4 rounded-xl bg-white/60 border border-slate-200/60">
              <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-primary font-bold text-lg mb-3 shadow-xs">
                1
              </div>
              <p className="text-sm text-on-surface-variant font-body">
                Pilih menu sesuai keperluan Anda pada layar utama.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-4 rounded-xl bg-white/60 border border-slate-200/60">
              <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-primary font-bold text-lg mb-3 shadow-xs">
                2
              </div>
              <p className="text-sm text-on-surface-variant font-body">
                Lengkapi data diri atau lakukan verifikasi biometrik.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-4 rounded-xl bg-white/60 border border-slate-200/60">
              <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-primary font-bold text-lg mb-3 shadow-xs">
                3
              </div>
              <p className="text-sm text-on-surface-variant font-body">
                Klik simpan dan pastikan muncul konfirmasi berhasil.
              </p>
            </div>
          </div>
        </div>

        {/* Shortcut to view Data Rekap / Google Sheets log */}
        <div className="mt-10 flex items-center gap-3">
          <button
            onClick={() => handleSelect('connection-status')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-colors shadow-xs"
          >
            <span className="material-symbols-outlined text-base text-secondary">table_view</span>
            <span>Lihat Rekap Data & Status Google Sheets</span>
          </button>
        </div>
      </div>
    </div>
  );
};
