import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { StaffMember, KioskSettings } from '../types';

interface BadgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffList: StaffMember[];
  settings: KioskSettings;
  onSelectAndScan?: (qrText: string) => void;
}

export const BadgeModal: React.FC<BadgeModalProps> = ({
  isOpen,
  onClose,
  staffList,
  settings,
  onSelectAndScan,
}) => {
  const [selectedStaffId, setSelectedStaffId] = useState<string>(staffList[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'staff' | 'guest'>('staff');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  // Guest pass builder
  const [guestName, setGuestName] = useState<string>('Ir. Hendro Wicaksono');
  const [guestAgency, setGuestAgency] = useState<string>('Dinas PMD Kab. Malang');
  const [guestPurpose, setGuestPurpose] = useState<string>('Koordinasi Pembangunan Desa');

  const selectedStaff = staffList.find(s => s.id === selectedStaffId) || staffList[0];

  useEffect(() => {
    if (!isOpen) return;

    let payloadString = '';

    if (activeTab === 'staff' && selectedStaff) {
      const payload = {
        type: 'staff',
        id: selectedStaff.id,
        name: selectedStaff.name,
        role: selectedStaff.role,
        nip: selectedStaff.nip,
        village: settings.villageName,
        district: settings.districtName,
        issuedAt: new Date().getFullYear().toString(),
      };
      payloadString = `KDR-STAFF:${JSON.stringify(payload)}`;
    } else {
      const payload = {
        type: 'guest',
        name: guestName.trim() || 'Tamu Kedungrejo',
        roleOrAffiliation: guestAgency.trim() || 'Warga / Dinas Luar',
        purpose: guestPurpose.trim() || 'Kunjungan Desa',
        village: settings.villageName,
        issuedAt: new Date().toISOString().slice(0, 10),
      };
      payloadString = `KDR-GUEST:${JSON.stringify(payload)}`;
    }

    QRCode.toDataURL(payloadString, {
      width: 240,
      margin: 1,
      color: {
        dark: '#001e40',
        light: '#ffffff',
      },
    })
      .then(url => setQrDataUrl(url))
      .catch(err => console.error('Error generating QR code:', err));
  }, [isOpen, activeTab, selectedStaff, guestName, guestAgency, guestPurpose, settings]);

  if (!isOpen) return null;

  const currentPayloadString =
    activeTab === 'staff' && selectedStaff
      ? `KDR-STAFF:${JSON.stringify({
          type: 'staff',
          id: selectedStaff.id,
          name: selectedStaff.name,
          role: selectedStaff.role,
          nip: selectedStaff.nip,
          village: settings.villageName,
        })}`
      : `KDR-GUEST:${JSON.stringify({
          type: 'guest',
          name: guestName.trim(),
          roleOrAffiliation: guestAgency.trim(),
          purpose: guestPurpose.trim(),
        })}`;

  const handleTestScan = () => {
    if (onSelectAndScan) {
      onSelectAndScan(currentPayloadString);
      onClose();
    }
  };

  const handlePrintBadge = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 overflow-y-auto max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-primary text-2xl">qr_code_2</span>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-primary font-headline">
                Kartu ID & QR Code Presensi
              </h3>
              <p className="text-xs text-slate-500 font-body">
                Dapat dipindai langsung melalui kamera Kiosk Mandiri
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Tab switch: Perangkat vs Tamu */}
        <div className="flex gap-2 p-1 bg-slate-100 rounded-xl mb-5">
          <button
            onClick={() => setActiveTab('staff')}
            className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'staff'
                ? 'bg-white text-primary shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Badge Perangkat Desa
          </button>
          <button
            onClick={() => setActiveTab('guest')}
            className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'guest'
                ? 'bg-white text-primary shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tiket / Pass Tamu
          </button>
        </div>

        {activeTab === 'staff' ? (
          <div className="mb-4">
            <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-1.5">
              Pilih Nama Perangkat:
            </label>
            <select
              value={selectedStaffId}
              onChange={e => setSelectedStaffId(e.target.value)}
              className="w-full h-11 px-3 rounded-lg border border-slate-300 bg-surface text-on-surface font-medium text-xs sm:text-sm focus:ring-2 focus:ring-secondary focus:border-secondary transition-all"
            >
              {staffList.map(staff => (
                <option key={staff.id} value={staff.id}>
                  {staff.name} — {staff.role}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="mb-4 space-y-2.5">
            <div>
              <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-1">
                Nama Pengunjung / Tamu:
              </label>
              <input
                type="text"
                value={guestName}
                onChange={e => setGuestName(e.target.value)}
                className="w-full h-10 px-3 text-xs sm:text-sm rounded-lg border border-slate-300"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-1">
                  Instansi / Asal:
                </label>
                <input
                  type="text"
                  value={guestAgency}
                  onChange={e => setGuestAgency(e.target.value)}
                  className="w-full h-10 px-3 text-xs sm:text-sm rounded-lg border border-slate-300"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-1">
                  Keperluan:
                </label>
                <input
                  type="text"
                  value={guestPurpose}
                  onChange={e => setGuestPurpose(e.target.value)}
                  className="w-full h-10 px-3 text-xs sm:text-sm rounded-lg border border-slate-300"
                />
              </div>
            </div>
          </div>
        )}

        {/* Physical Badge Preview */}
        <div className="border-2 border-primary/20 bg-gradient-to-b from-white to-slate-50 p-5 rounded-2xl shadow-sm text-center relative overflow-hidden my-3">
          {/* Badge Top Header */}
          <div className="bg-primary text-white py-2 px-3 -mx-5 -mt-5 mb-4 rounded-t-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">account_balance</span>
              <span className="text-[11px] font-bold uppercase tracking-wider">
                {settings.villageName} {settings.districtName}
              </span>
            </div>
            <span className="text-[9px] font-mono bg-white/20 px-2 py-0.5 rounded-full">
              {activeTab === 'staff' ? 'PERANGKAT' : 'TAMU'}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 my-2">
            {/* QR Code */}
            <div className="p-2.5 bg-white border border-slate-200 rounded-xl shadow-xs shrink-0">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="Badge QR Code"
                  className="w-36 h-36 sm:w-40 sm:h-40 object-contain mx-auto"
                />
              ) : (
                <div className="w-36 h-36 sm:w-40 sm:h-40 bg-slate-100 flex items-center justify-center text-slate-400">
                  <span className="material-symbols-outlined animate-spin text-3xl">sync</span>
                </div>
              )}
            </div>

            {/* Badge Info */}
            <div className="text-left space-y-1 sm:space-y-1.5 flex-1 min-w-0">
              <p className="text-[10px] font-bold text-secondary uppercase tracking-wider">
                {activeTab === 'staff' ? 'Kartu ID Presensi' : 'Pass Kunjungan Resmi'}
              </p>
              <h4 className="text-base sm:text-lg font-bold text-primary font-headline truncate">
                {activeTab === 'staff' ? selectedStaff?.name : guestName}
              </h4>
              <p className="text-xs sm:text-sm font-semibold text-slate-700">
                {activeTab === 'staff' ? selectedStaff?.role : guestAgency}
              </p>
              {activeTab === 'staff' && (
                <p className="text-xs font-mono text-slate-500">NIP: {selectedStaff?.nip}</p>
              )}
              {activeTab === 'guest' && (
                <p className="text-xs text-slate-500">Tujuan: {guestPurpose}</p>
              )}
              <div className="pt-2 text-[10px] text-slate-400 border-t border-slate-200 flex items-center gap-1">
                <span className="material-symbols-outlined text-xs text-emerald-600">verified</span>
                <span>Terverifikasi Sistem Kiosk Desa</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 flex flex-col sm:flex-row gap-2.5">
          {onSelectAndScan && (
            <button
              onClick={handleTestScan}
              className="flex-1 bg-secondary text-white py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all cursor-pointer shadow-xs"
            >
              <span className="material-symbols-outlined text-lg">qr_code_scanner</span>
              <span>Simulasikan Scan Badge Ini</span>
            </button>
          )}

          <button
            onClick={handlePrintBadge}
            className="px-4 py-3 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">print</span>
            <span>Cetak Kartu</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-3 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl font-bold text-xs sm:text-sm transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
