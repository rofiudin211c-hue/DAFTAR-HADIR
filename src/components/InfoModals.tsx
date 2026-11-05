import React from 'react';
import { KioskSettings } from '../types';

interface PanduanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PanduanModal: React.FC<PanduanModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-primary text-2xl">menu_book</span>
            <h3 className="text-lg font-bold text-primary font-headline">
              Panduan Layanan Kiosk Mandiri
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <div className="space-y-4 text-xs sm:text-sm text-slate-700 font-body leading-relaxed max-h-[70vh] overflow-y-auto pr-1">
          <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl">
            <h4 className="font-bold text-primary text-sm mb-1 font-headline">
              Jam Operasional Balai Desa Kedungrejo
            </h4>
            <p className="text-xs text-slate-600">
              Senin s.d. Kamis: 07.30 - 15.30 WIB <br />
              Jumat: 07.30 - 14.30 WIB (Istirahat Shalat Jumat 11.30 - 13.00 WIB)
            </p>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-1">A. Presensi Perangkat Desa:</h4>
            <ol className="list-decimal list-inside space-y-1 text-slate-600">
              <li>Pilih menu <strong>Daftar Hadir Perangkat</strong> di layar utama.</li>
              <li>Pilih nama dan jabatan Anda pada menu dropdown.</li>
              <li>Posisikan wajah tepat di tengah bingkai hingga lampu indikator hijau, lalu klik <strong>Capture</strong>.</li>
              <li>Tempelkan jari telunjuk pada sensor sidik jari hingga terdengar nada konfirmasi.</li>
              <li>Simpan atau cetak bukti kehadiran jika diperlukan.</li>
            </ol>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-1">B. Buku Tamu Digital (Warga & Tamu Dinas):</h4>
            <ol className="list-decimal list-inside space-y-1 text-slate-600">
              <li>Pilih menu <strong>Buku Tamu Digital</strong>.</li>
              <li>Isi Nama Lengkap sesuai KTP dan Alamat atau Instansi asal.</li>
              <li>Tentukan keperluan kunjungan (KTP, KK, Surat Pengantar, atau Dinas).</li>
              <li>Ambil foto wajah pengunjung sebagai verifikasi fisik yang sah.</li>
              <li>Klik <strong>Simpan Data Kunjungan</strong>. Data otomatis terhubung ke sistem desa.</li>
            </ol>
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={onClose}
            className="w-full bg-primary text-white py-3 rounded-xl font-bold text-sm hover:bg-primary-container transition-all cursor-pointer"
          >
            Mengerti & Tutup Panduan
          </button>
        </div>
      </div>
    </div>
  );
};

interface LokasiModalProps {
  isOpen: boolean;
  settings: KioskSettings;
  onClose: () => void;
}

export const LokasiModal: React.FC<LokasiModalProps> = ({ isOpen, settings, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-secondary text-2xl">location_on</span>
            <h3 className="text-lg font-bold text-primary font-headline">
              Lokasi Kantor Balai Desa
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <div className="space-y-4 text-xs sm:text-sm text-slate-700 font-body leading-relaxed">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <h4 className="font-bold text-slate-900 text-sm mb-1 font-headline">
              Kantor Pemerintah {settings.villageName}
            </h4>
            <p className="text-slate-600 text-xs">
              Jl. Raya Kedungrejo No. 01, Dusun Krajan, {settings.villageName}, {settings.districtName}, {settings.regencyName}, Jawa Timur 65154
            </p>
            <div className="mt-3 pt-3 border-t border-slate-200 flex flex-col gap-1 text-xs">
              <span className="font-medium">
                Koordinat GPS Kantor: <span className="font-mono text-primary font-bold">{settings.officeLat}, {settings.officeLng}</span>
              </span>
              <span className="text-slate-500">
                Radius Validasi Kiosk Geofencing: 50 Meter
              </span>
            </div>
          </div>

          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-600">check_circle</span>
            <span>Perangkat Kiosk ini terverifikasi berada di dalam zona sah Balai Desa.</span>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <a
            href="https://maps.google.com/?q=-7.954201,112.721482"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-secondary text-white py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all text-center"
          >
            <span className="material-symbols-outlined text-base">map</span>
            <span>Buka di Google Maps</span>
          </a>
          <button
            onClick={onClose}
            className="px-5 py-3 border border-slate-300 hover:bg-slate-100 rounded-xl font-bold text-xs sm:text-sm text-slate-700 transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

interface PengaturanModalProps {
  isOpen: boolean;
  settings: KioskSettings;
  onUpdateSettings: (newSettings: Partial<KioskSettings>) => void;
  onResetData: () => void;
  onClose: () => void;
}

export const PengaturanModal: React.FC<PengaturanModalProps> = ({
  isOpen,
  settings,
  onUpdateSettings,
  onResetData,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-primary text-2xl">tune</span>
            <h3 className="text-lg font-bold text-primary font-headline">
              Pengaturan Kiosk & Sistem
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <div className="space-y-4 text-xs sm:text-sm font-body">
          {/* Sound Toggle */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
            <div>
              <p className="font-bold text-slate-900">Efek Suara Kiosk & Shutter</p>
              <p className="text-xs text-slate-500">Bunyi konfirmasi saat capture foto dan sidik jari</p>
            </div>
            <button
              onClick={() => onUpdateSettings({ soundEffects: !settings.soundEffects })}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                settings.soundEffects ? 'bg-primary' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                  settings.soundEffects ? 'right-0.5' : 'left-0.5'
                }`}
              ></div>
            </button>
          </div>

          {/* GPS Validation Toggle */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
            <div>
              <p className="font-bold text-slate-900">Validasi Geofencing GPS</p>
              <p className="text-xs text-slate-500">Mencatat koordinat presisi perangkat presensi</p>
            </div>
            <button
              onClick={() => onUpdateSettings({ gpsValidation: !settings.gpsValidation })}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                settings.gpsValidation ? 'bg-primary' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                  settings.gpsValidation ? 'right-0.5' : 'left-0.5'
                }`}
              ></div>
            </button>
          </div>

          {/* Google Sheets Identifier */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
            <p className="font-bold text-slate-900 mb-1">Spreadsheet Cloud Terhubung</p>
            <p className="text-xs text-slate-500 mb-2">Nama Sheet: {settings.googleSheetsName}</p>
            <div className="bg-white px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono text-slate-700 select-all">
              ID: {settings.googleSheetsId}
            </div>
          </div>

          {/* Reset Demo Data Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Reset data kehadiran demo ke setelan awal?')) {
                  onResetData();
                  onClose();
                }
              }}
              className="w-full py-2.5 px-4 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-colors cursor-pointer"
            >
              Reset Data Riwayat Presensi Demo
            </button>
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={onClose}
            className="w-full bg-primary text-white py-3 rounded-xl font-bold text-sm hover:bg-primary-container transition-all cursor-pointer"
          >
            Simpan & Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
