import React from 'react';
import { AttendanceRecord, KioskSettings } from '../types';

interface PrintReceiptModalProps {
  record: AttendanceRecord | null;
  settings: KioskSettings;
  onClose: () => void;
}

export const PrintReceiptModal: React.FC<PrintReceiptModalProps> = ({
  record,
  settings,
  onClose,
}) => {
  if (!record) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 overflow-y-auto max-h-[90vh]">
        {/* Printable slip area */}
        <div id="printable-receipt" className="border-2 border-dashed border-slate-300 p-6 rounded-xl bg-slate-50/50">
          {/* Header */}
          <div className="text-center border-b-2 border-slate-800 pb-4 mb-4">
            <h3 className="text-xs uppercase tracking-wider text-slate-600 font-bold">
              Pemerintah {settings.regencyName}
            </h3>
            <h4 className="text-xs uppercase tracking-wider text-slate-600 font-bold">
              {settings.districtName}
            </h4>
            <h2 className="text-base font-black uppercase text-slate-900 tracking-tight mt-0.5">
              PEMERINTAH {settings.villageName.toUpperCase()}
            </h2>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Jl. Raya Kedungrejo No. 01 Pakis, Malang 65154 · Layanan Kiosk Digital
            </p>
          </div>

          {/* Receipt Title */}
          <div className="text-center my-3">
            <span className="inline-block px-3 py-1 bg-slate-200 text-slate-800 text-xs font-bold uppercase tracking-wider rounded-md">
              BUKTI {record.recordType === 'perangkat' ? 'PRESENSI PERANGKAT' : 'KUNJUNGAN TAMU'} RESMI
            </span>
            <p className="text-[11px] text-slate-400 font-mono mt-1">
              No: {record.id} / KIOSK-KDR / {new Date().getFullYear()}
            </p>
          </div>

          {/* Receipt Data Table */}
          <div className="space-y-2.5 text-xs text-slate-800 my-4 border-t border-b border-slate-200 py-3">
            <div className="flex justify-between">
              <span className="text-slate-500">Nama:</span>
              <span className="font-bold text-right">{record.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">
                {record.recordType === 'perangkat' ? 'Jabatan:' : 'Instansi / Asal:'}
              </span>
              <span className="font-medium text-right">{record.roleOrAffiliation}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Hari & Tanggal:</span>
              <span className="font-medium text-right">{record.dateFormatted}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Waktu Tercatat:</span>
              <span className="font-bold text-emerald-700 text-right tabular-nums">{record.timeFormatted}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Metode Verifikasi:</span>
              <span className="text-right">{record.verificationMethod}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Lokasi Koordinat:</span>
              <span className="font-mono text-[10px] text-right">{record.locationCoordinates}</span>
            </div>
            {record.purpose && (
              <div className="flex justify-between border-t border-dashed border-slate-200 pt-2">
                <span className="text-slate-500">Keperluan:</span>
                <span className="font-medium text-right">{record.purpose}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-500">Google Sheets Sync:</span>
              <span className="font-bold text-emerald-600 text-right">TERCATAT ({record.sheetsRowId})</span>
            </div>
          </div>

          {/* Verification Barcode / Seal Simulation */}
          <div className="flex items-center justify-between pt-2">
            <div className="text-left">
              <p className="text-[9px] text-slate-400">Verifikasi Sistem:</p>
              <p className="text-[10px] font-mono font-bold text-slate-700">SHA256: 7f8c9a12b3e4</p>
              <p className="text-[9px] text-slate-400">Balai Desa Kedungrejo Pakis</p>
            </div>
            <div className="w-16 h-16 border-2 border-slate-800 p-1 flex items-center justify-center bg-white rounded-md">
              {/* Simulated QR Code matrix */}
              <div className="grid grid-cols-4 gap-0.5 w-full h-full p-0.5">
                {Array.from({ length: 16 }).map((_, i) => (
                  <div
                    key={i}
                    className={`${(i * 7) % 3 === 0 ? 'bg-slate-900' : 'bg-slate-100'} rounded-2xs`}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={handlePrint}
            className="flex-1 bg-primary text-white py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-primary-container transition-all cursor-pointer shadow-md"
          >
            <span className="material-symbols-outlined text-lg">print</span>
            <span>Cetak Dokumen Sekarang</span>
          </button>
          <button
            onClick={onClose}
            className="px-5 py-3.5 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl font-bold text-sm transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
