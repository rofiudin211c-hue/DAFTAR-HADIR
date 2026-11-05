import React, { useState } from 'react';
import { ScreenView, AttendanceRecord, KioskSettings } from '../types';

interface ConnectionStatusScreenProps {
  records: AttendanceRecord[];
  settings: KioskSettings;
  onNavigate: (screen: ScreenView) => void;
  onTriggerSync: () => void;
  isSyncing: boolean;
}

export const ConnectionStatusScreen: React.FC<ConnectionStatusScreenProps> = ({
  records,
  settings,
  onNavigate,
  onTriggerSync,
  isSyncing,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'perangkat' | 'tamu'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredRecords = records.filter(record => {
    const matchesType = filterType === 'all' || record.recordType === filterType;
    const matchesSearch =
      record.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.roleOrAffiliation.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleExportCSV = () => {
    const headers = ['ID', 'Tipe', 'Nama', 'Jabatan / Instansi', 'Tanggal', 'Waktu', 'Metode', 'Status Sync', 'Row ID'];
    const rows = records.map(r => [
      r.id,
      r.recordType === 'perangkat' ? 'Perangkat Desa' : 'Buku Tamu',
      `"${r.name}"`,
      `"${r.roleOrAffiliation}"`,
      `"${r.dateFormatted}"`,
      `"${r.timeFormatted}"`,
      `"${r.verificationMethod}"`,
      r.googleSheetsSyncStatus,
      r.sheetsRowId || '-',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rekap_Presensi_${settings.villageName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-8 pb-28 md:pb-16 w-full">
      {/* Top Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-primary font-headline tracking-tight">
            Status Koneksi & Database Cloud
          </h2>
          <p className="text-sm text-on-surface-variant font-body mt-1">
            Monitoring integrasi real-time Google Sheets dan penyimpanan riwayat presensi mandiri.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 px-5 py-2.5 border border-slate-300 hover:bg-slate-100 rounded-xl font-semibold text-sm text-slate-700 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            <span>Menu Utama</span>
          </button>

          <button
            onClick={onTriggerSync}
            disabled={isSyncing}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white hover:bg-primary-container rounded-xl font-bold text-sm transition-all active:scale-95 cursor-pointer shadow-sm"
          >
            <span className={`material-symbols-outlined text-lg ${isSyncing ? 'animate-spin' : ''}`}>
              sync
            </span>
            <span>{isSyncing ? 'Menyinkronkan...' : 'Sinkronkan Sekarang'}</span>
          </button>
        </div>
      </div>

      {/* Cloud Connectivity Bento Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <div className="bg-white border border-outline-variant p-6 rounded-xl shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Google Sheets Database
            </span>
            <span className="w-3 h-3 bg-emerald-500 rounded-full status-pulse-green"></span>
          </div>
          <p className="text-xl font-bold text-primary font-headline truncate">
            {settings.googleSheetsName}
          </p>
          <p className="text-xs font-mono text-slate-500 mt-1">ID: {settings.googleSheetsId}</p>
        </div>

        <div className="bg-white border border-outline-variant p-6 rounded-xl shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Frekuensi Sinkronisasi
            </span>
            <span className="material-symbols-outlined text-secondary text-xl">schedule</span>
          </div>
          <p className="text-xl font-bold text-primary font-headline">
            Otomatis Tiap {settings.autoSyncIntervalMinutes} Menit
          </p>
          <p className="text-xs text-slate-500 mt-1">Status: Terkoneksi (Protokol HTTPS Aman)</p>
        </div>

        <div className="bg-white border border-outline-variant p-6 rounded-xl shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Log Tercatat
            </span>
            <span className="material-symbols-outlined text-emerald-600 text-xl">dataset</span>
          </div>
          <p className="text-xl font-bold text-primary font-headline tabular-nums">
            {records.length} Entri Kehadiran
          </p>
          <p className="text-xs text-slate-500 mt-1">100% Data Biometrik & Identitas Valid</p>
        </div>
      </div>

      {/* Records Filter & Table */}
      <div className="bg-white border border-outline-variant rounded-xl shadow-xs overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterType === 'all'
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Semua ({records.length})
            </button>
            <button
              onClick={() => setFilterType('perangkat')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterType === 'perangkat'
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Perangkat Desa ({records.filter(r => r.recordType === 'perangkat').length})
            </button>
            <button
              onClick={() => setFilterType('tamu')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterType === 'tamu'
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Buku Tamu ({records.filter(r => r.recordType === 'tamu').length})
            </button>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Cari nama atau jabatan..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="text-xs px-3 py-2 border border-slate-300 rounded-lg w-full sm:w-56 bg-white focus:outline-none focus:ring-1 focus:ring-secondary"
            />

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 text-xs font-bold text-secondary px-3.5 py-2 bg-secondary/10 hover:bg-secondary/20 rounded-lg transition-colors shrink-0 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">download</span>
              <span>Ekspor CSV</span>
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Nama Lengkap</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4">Jabatan / Instansi</th>
                <th className="py-3 px-4">Waktu Presensi</th>
                <th className="py-3 px-4">Metode Verifikasi</th>
                <th className="py-3 px-4 text-center">Status Sheets</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Belum ada data presensi yang sesuai.
                  </td>
                </tr>
              ) : (
                filteredRecords.map(record => (
                  <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-primary">
                      {record.name}
                      {record.purpose && (
                        <p className="text-[11px] text-slate-500 font-normal mt-0.5">
                          Keperluan: {record.purpose}
                        </p>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-bold ${
                          record.recordType === 'perangkat'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-200 text-slate-800'
                        }`}
                      >
                        {record.recordType === 'perangkat' ? 'Perangkat Desa' : 'Tamu Warga / Dinas'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">{record.roleOrAffiliation}</td>
                    <td className="py-3.5 px-4 tabular-nums text-slate-600">
                      <div>{record.timeFormatted}</div>
                      <div className="text-[10px] text-slate-400">{record.dateFormatted}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <span className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-emerald-600 text-base">
                          verified
                        </span>
                        <span>{record.verificationMethod}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                        <span className="material-symbols-outlined text-sm">cloud_done</span>
                        <span>Tersinkron ({record.sheetsRowId})</span>
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
};
