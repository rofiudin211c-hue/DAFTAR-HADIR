import React, { useState } from 'react';
import { ScreenView, AttendanceRecord, KioskSettings } from '../types';
import { playFeedbackSound } from '../data/mockData';

interface SuccessScreenProps {
  record: AttendanceRecord | null;
  onNavigate: (screen: ScreenView) => void;
  onPrintReceipt: () => void;
  settings: KioskSettings;
}

export const SuccessScreen: React.FC<SuccessScreenProps> = ({
  record,
  onNavigate,
  onPrintReceipt,
  settings,
}) => {
  const [isPrinting, setIsPrinting] = useState<boolean>(false);

  // Fallback default display if accessed directly
  const displayName = record?.name || 'Bambang Susilo Utomo';
  const displayTime = record?.timeFormatted || '07:42 WIB';
  const displayDate = record?.dateFormatted || 'Senin, 24 Mei 2024';
  const displayRole = record?.roleOrAffiliation || 'Sekretaris Desa';
  const isGuest = record?.recordType === 'tamu';

  const handlePrintClick = () => {
    if (settings.soundEffects) {
      playFeedbackSound('beep');
    }
    setIsPrinting(true);
    setTimeout(() => {
      setIsPrinting(false);
      onPrintReceipt();
    }, 400);
  };

  const handleReturnHome = () => {
    if (settings.soundEffects) {
      playFeedbackSound('beep');
    }
    onNavigate('home');
  };

  return (
    <main className="flex-1 pt-6 pb-20 md:pb-16 px-4 sm:px-6 md:px-8 flex flex-col items-center justify-center max-w-4xl mx-auto w-full">
      {/* Success State Card (Direct 1:1 match with Image 5 & 6) */}
      <div className="w-full bg-white border border-outline-variant rounded-2xl p-6 sm:p-8 md:p-12 text-center relative overflow-hidden shadow-xs">
        {/* Atmospheric Background Element */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-secondary/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>

        {/* Success Icon Badge */}
        <div className="animate-scale-check inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-emerald-100 text-emerald-600 mb-6 border-4 border-white shadow-xs">
          <span className="material-symbols-outlined text-4xl sm:text-5xl fill" data-icon="check_circle">
            check_circle
          </span>
        </div>

        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-2 font-headline tracking-tight">
          Berhasil Terkirim!
        </h2>
        <p className="text-sm sm:text-base md:text-lg text-on-surface-variant mb-8 sm:mb-10 font-body max-w-xl mx-auto">
          {isGuest
            ? 'Data kunjungan tamu Anda telah tercatat secara resmi di buku tamu administrasi desa.'
            : 'Data kehadiran Anda telah tercatat secara resmi di sistem administrasi desa.'}
        </p>

        {/* Bento Grid Summary Data */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 sm:mb-10 text-left">
          {/* Box 1: Name */}
          <div className="bg-surface p-5 sm:p-6 rounded-xl border border-outline-variant flex items-center gap-4">
            <div className="bg-primary-container p-3 rounded-full text-white shrink-0">
              <span className="material-symbols-outlined text-2xl" data-icon="person">
                person
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider font-body">
                {isGuest ? 'NAMA PENGUNJUNG' : 'NAMA PERANGKAT'}
              </p>
              <p className="text-base sm:text-lg font-bold text-on-surface font-headline truncate">
                {displayName}
              </p>
            </div>
          </div>

          {/* Box 2: Time */}
          <div className="bg-surface p-5 sm:p-6 rounded-xl border border-outline-variant flex items-center gap-4">
            <div className="bg-primary-container p-3 rounded-full text-white shrink-0">
              <span className="material-symbols-outlined text-2xl" data-icon="schedule">
                schedule
              </span>
            </div>
            <div>
              <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider font-body">
                WAKTU PRESENSI
              </p>
              <p className="text-base sm:text-lg font-bold text-on-surface font-headline tabular-nums">
                {displayTime}
              </p>
            </div>
          </div>

          {/* Box 3: Date */}
          <div className="bg-surface p-5 sm:p-6 rounded-xl border border-outline-variant flex items-center gap-4">
            <div className="bg-primary-container p-3 rounded-full text-white shrink-0">
              <span className="material-symbols-outlined text-2xl" data-icon="calendar_today">
                calendar_today
              </span>
            </div>
            <div>
              <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider font-body">
                TANGGAL
              </p>
              <p className="text-base sm:text-lg font-bold text-on-surface font-headline">
                {displayDate}
              </p>
            </div>
          </div>

          {/* Box 4: Role or Agency */}
          <div className="bg-surface p-5 sm:p-6 rounded-xl border border-outline-variant flex items-center gap-4">
            <div className="bg-primary-container p-3 rounded-full text-white shrink-0">
              <span className="material-symbols-outlined text-2xl" data-icon="assignment_ind">
                assignment_ind
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider font-body">
                {isGuest ? 'INSTANSI / ALAMAT' : 'JABATAN'}
              </p>
              <p className="text-base sm:text-lg font-bold text-on-surface font-headline truncate">
                {displayRole}
              </p>
            </div>
          </div>
        </div>

        {/* Connection Status Pill */}
        <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-surface-container border border-outline-variant mb-8 sm:mb-10 text-xs sm:text-sm">
          <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full status-pulse-green"></div>
          <span className="font-semibold text-on-surface">
            Terhubung ke Google Sheets (ID: 1k9b5...)
          </span>
          <span className="material-symbols-outlined text-emerald-600 text-lg" data-icon="cloud_done">
            cloud_done
          </span>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleReturnHome}
            className="bg-primary text-white font-bold px-10 h-14 flex items-center justify-center rounded-xl hover:bg-primary-container transition-all shadow-sm active:scale-95 cursor-pointer text-base font-headline"
          >
            Kembali ke Menu Utama
          </button>

          <button
            onClick={handlePrintClick}
            disabled={isPrinting}
            className="bg-surface-container text-primary font-bold px-8 h-14 flex items-center justify-center rounded-xl border border-outline-variant hover:bg-surface-container-high transition-all active:scale-95 gap-2 cursor-pointer text-base font-headline"
          >
            <span
              className={`material-symbols-outlined text-xl ${
                isPrinting ? 'animate-spin' : ''
              }`}
              data-icon="print"
            >
              {isPrinting ? 'sync' : 'print'}
            </span>
            <span>{isPrinting ? 'Menyiapkan...' : 'Cetak Bukti'}</span>
          </button>
        </div>
      </div>

      {/* Decorative Info Section (3 cards directly as in screenshot) */}
      <section className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-5 w-full">
        <div className="p-6 bg-white/70 backdrop-blur-xs rounded-xl border border-outline-variant shadow-xs">
          <span className="material-symbols-outlined text-secondary text-2xl mb-2.5" data-icon="security">
            security
          </span>
          <h3 className="font-bold text-primary mb-1 text-sm font-headline">Aman & Terenkripsi</h3>
          <p className="text-xs text-on-surface-variant font-body leading-relaxed">
            Data Anda diamankan menggunakan protokol enkripsi standar pemerintah desa.
          </p>
        </div>

        <div className="p-6 bg-white/70 backdrop-blur-xs rounded-xl border border-outline-variant shadow-xs">
          <span className="material-symbols-outlined text-secondary text-2xl mb-2.5" data-icon="update">
            update
          </span>
          <h3 className="font-bold text-primary mb-1 text-sm font-headline">Real-time Sync</h3>
          <p className="text-xs text-on-surface-variant font-body leading-relaxed">
            Sistem melakukan sinkronisasi otomatis setiap 5 menit ke server pusat.
          </p>
        </div>

        <div className="p-6 bg-white/70 backdrop-blur-xs rounded-xl border border-outline-variant shadow-xs">
          <span className="material-symbols-outlined text-secondary text-2xl mb-2.5" data-icon="help_outline">
            help_outline
          </span>
          <h3 className="font-bold text-primary mb-1 text-sm font-headline">Butuh Bantuan?</h3>
          <p className="text-xs text-on-surface-variant font-body leading-relaxed">
            Hubungi tim IT Desa Kedungrejo jika terdapat kesalahan data presensi.
          </p>
        </div>
      </section>
    </main>
  );
};
