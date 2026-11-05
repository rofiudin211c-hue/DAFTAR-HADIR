import React, { useState, useEffect } from 'react';
import { ScreenView, AttendanceRecord, StaffMember, KioskSettings } from './types';
import {
  INITIAL_STAFF_MEMBERS,
  INITIAL_SETTINGS,
  INITIAL_RECORDS,
  playFeedbackSound,
  getIndonesianDateString,
  getIndonesianTimeString,
} from './data/mockData';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { MobileBottomNav } from './components/MobileBottomNav';
import { HomeScreen } from './components/HomeScreen';
import { StaffAttendanceScreen } from './components/StaffAttendanceScreen';
import { GuestBookScreen } from './components/GuestBookScreen';
import { SuccessScreen } from './components/SuccessScreen';
import { ConnectionStatusScreen } from './components/ConnectionStatusScreen';
import { PrintReceiptModal } from './components/PrintReceiptModal';
import { PanduanModal, LokasiModal, PengaturanModal } from './components/InfoModals';
import { QRScannerScreen } from './components/QRScannerScreen';
import { BadgeModal } from './components/BadgeModal';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenView>('home');
  const [latestRecord, setLatestRecord] = useState<AttendanceRecord | null>(null);
  const [isBadgeModalOpen, setIsBadgeModalOpen] = useState<boolean>(false);

  // Load records from localStorage or initial
  const [records, setRecords] = useState<AttendanceRecord[]>(() => {
    try {
      const saved = localStorage.getItem('kedungrejo_attendance_records');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_RECORDS;
  });

  // Staff members
  const [staffList, setStaffList] = useState<StaffMember[]>(() => {
    try {
      const saved = localStorage.getItem('kedungrejo_staff_list');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_STAFF_MEMBERS;
  });

  // Settings
  const [settings, setSettings] = useState<KioskSettings>(() => {
    try {
      const saved = localStorage.getItem('kedungrejo_kiosk_settings');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_SETTINGS;
  });

  // Sync state
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncToast, setSyncToast] = useState<string | null>(null);

  // Modals
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);
  const [isPanduanOpen, setIsPanduanOpen] = useState<boolean>(false);
  const [isLokasiOpen, setIsLokasiOpen] = useState<boolean>(false);
  const [isPengaturanOpen, setIsPengaturanOpen] = useState<boolean>(false);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('kedungrejo_attendance_records', JSON.stringify(records));
    } catch {}
  }, [records]);

  useEffect(() => {
    try {
      localStorage.setItem('kedungrejo_staff_list', JSON.stringify(staffList));
    } catch {}
  }, [staffList]);

  useEffect(() => {
    try {
      localStorage.setItem('kedungrejo_kiosk_settings', JSON.stringify(settings));
    } catch {}
  }, [settings]);

  // Periodic automatic sync simulation (every 5 minutes)
  useEffect(() => {
    const timer = setInterval(() => {
      handleTriggerSync(false);
    }, settings.autoSyncIntervalMinutes * 60 * 1000);
    return () => clearInterval(timer);
  }, [settings.autoSyncIntervalMinutes]);

  const handleNavigate = (screen: ScreenView) => {
    setCurrentScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAttendanceSuccess = (record: AttendanceRecord) => {
    setRecords(prev => [record, ...prev]);
    setLatestRecord(record);

    // Update staff presence status
    setStaffList(prev =>
      prev.map(staff =>
        staff.name === record.name
          ? { ...staff, statusToday: 'Hadir', timeToday: record.timeFormatted }
          : staff
      )
    );

    setCurrentScreen('success');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGuestSubmit = (record: AttendanceRecord) => {
    setRecords(prev => [record, ...prev]);
    setLatestRecord(record);
    setCurrentScreen('success');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleQRDetected = (qrString: string) => {
    const now = new Date();
    let recordName = 'Perangkat Desa';
    let recordRole = 'Perangkat Desa Kedungrejo';
    let recordType: 'perangkat' | 'tamu' = 'perangkat';
    let recordPurpose: string | undefined = undefined;

    if (qrString.startsWith('KDR-STAFF:')) {
      try {
        const json = JSON.parse(qrString.replace('KDR-STAFF:', ''));
        recordName = json.name || recordName;
        recordRole = json.role || recordRole;
        recordType = 'perangkat';
      } catch {
        recordName = 'Perangkat Desa';
      }
    } else if (qrString.startsWith('KDR-GUEST:')) {
      try {
        const json = JSON.parse(qrString.replace('KDR-GUEST:', ''));
        recordName = json.name || 'Tamu Kedungrejo';
        recordRole = json.roleOrAffiliation || 'Tamu Kunjungan';
        recordPurpose = json.purpose || 'Kunjungan Desa';
        recordType = 'tamu';
      } catch {
        recordType = 'tamu';
      }
    }

    const newRecord: AttendanceRecord = {
      id: `QR-${Date.now().toString().slice(-6)}`,
      recordType,
      name: recordName,
      roleOrAffiliation: recordRole,
      timestamp: Date.now(),
      timeFormatted: getIndonesianTimeString(now),
      dateFormatted: getIndonesianDateString(now),
      verificationMethod: 'QR Code ID Badge (Kiosk Scanner)',
      locationCoordinates: `${settings.officeLat.toFixed(6)}, ${settings.officeLng.toFixed(6)}`,
      locationName: 'Gerbang Kiosk Mandiri Balai Desa Kedungrejo',
      googleSheetsSyncStatus: 'synced',
      sheetsRowId: `ROW-${Math.floor(100 + Math.random() * 900)}`,
      purpose: recordPurpose,
    };

    handleAttendanceSuccess(newRecord);
  };

  const handleTriggerSync = (showNotice: boolean = true) => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setRecords(prev =>
        prev.map(r => ({ ...r, googleSheetsSyncStatus: 'synced' as const }))
      );
      if (showNotice) {
        setSyncToast(`Tersinkronisasi ke Google Sheets (${settings.googleSheetsId})`);
        setTimeout(() => setSyncToast(null), 3500);
      }
    }, 1200);
  };

  const handleResetData = () => {
    setRecords(INITIAL_RECORDS);
    setStaffList(INITIAL_STAFF_MEMBERS);
    setSettings(INITIAL_SETTINGS);
    setSyncToast('Data riwayat presensi berhasil di-reset.');
    setTimeout(() => setSyncToast(null), 3000);
  };

  const handleUpdateSettings = (updated: Partial<KioskSettings>) => {
    setSettings(prev => ({ ...prev, ...updated }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9ff] text-[#121c2a] font-body relative">
      {/* Toast Notification */}
      {syncToast && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 bg-primary text-white px-5 py-3 rounded-xl shadow-xl border border-white/20 flex items-center gap-3 animate-scale-check">
          <span className="material-symbols-outlined text-emerald-400 text-xl">cloud_done</span>
          <span className="text-xs sm:text-sm font-semibold">{syncToast}</span>
        </div>
      )}

      {/* Global Top Government Header */}
      <Header
        currentScreen={currentScreen}
        onNavigate={handleNavigate}
        settings={settings}
        onTriggerSync={() => handleTriggerSync(true)}
        isSyncing={isSyncing}
        onOpenSettings={() => setIsPengaturanOpen(true)}
      />

      {/* Active Screen View */}
      <div className="flex-1 flex flex-col">
        {currentScreen === 'home' && (
          <HomeScreen
            onNavigate={handleNavigate}
            soundEnabled={settings.soundEffects}
            records={records}
            staffList={staffList}
          />
        )}

        {currentScreen === 'staff-attendance' && (
          <StaffAttendanceScreen
            onNavigate={handleNavigate}
            staffList={staffList}
            onAttendanceSuccess={handleAttendanceSuccess}
            settings={settings}
          />
        )}

        {currentScreen === 'guest-book' && (
          <GuestBookScreen
            onNavigate={handleNavigate}
            onGuestSubmit={handleGuestSubmit}
            settings={settings}
            onTriggerSync={() => handleTriggerSync(true)}
            isSyncing={isSyncing}
            onOpenSettings={() => setIsPengaturanOpen(true)}
          />
        )}

        {currentScreen === 'success' && (
          <SuccessScreen
            record={latestRecord}
            onNavigate={handleNavigate}
            onPrintReceipt={() => setIsPrintModalOpen(true)}
            settings={settings}
          />
        )}

        {currentScreen === 'connection-status' && (
          <ConnectionStatusScreen
            records={records}
            settings={settings}
            onNavigate={handleNavigate}
            onTriggerSync={() => handleTriggerSync(true)}
            isSyncing={isSyncing}
          />
        )}

        {currentScreen === 'qr-scanner' && (
          <QRScannerScreen
            onNavigate={handleNavigate}
            staffList={staffList}
            onAttendanceSuccess={handleAttendanceSuccess}
            settings={settings}
            onOpenBadgeModal={() => setIsBadgeModalOpen(true)}
          />
        )}
      </div>

      {/* Official Government Footer */}
      <Footer
        settings={settings}
        onOpenPanduan={() => setIsPanduanOpen(true)}
        onOpenLokasi={() => setIsLokasiOpen(true)}
        onOpenKontak={() => setIsLokasiOpen(true)}
      />

      {/* Mobile Sticky Bottom Navigation */}
      <MobileBottomNav currentScreen={currentScreen} onNavigate={handleNavigate} />

      {/* Modals */}
      <PrintReceiptModal
        record={latestRecord}
        settings={settings}
        onClose={() => setIsPrintModalOpen(false)}
      />

      <PanduanModal isOpen={isPanduanOpen} onClose={() => setIsPanduanOpen(false)} />

      <LokasiModal
        isOpen={isLokasiOpen}
        settings={settings}
        onClose={() => setIsLokasiOpen(false)}
      />

      <PengaturanModal
        isOpen={isPengaturanOpen}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onResetData={handleResetData}
        onClose={() => setIsPengaturanOpen(false)}
      />

      <BadgeModal
        isOpen={isBadgeModalOpen}
        onClose={() => setIsBadgeModalOpen(false)}
        staffList={staffList}
        settings={settings}
        onSelectAndScan={handleQRDetected}
      />
    </div>
  );
}
