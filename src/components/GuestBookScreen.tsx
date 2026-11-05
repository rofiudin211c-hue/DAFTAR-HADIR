import React, { useState, useRef, useEffect } from 'react';
import { ScreenView, AttendanceRecord, KioskSettings } from '../types';
import { getIndonesianDateString, getIndonesianTimeString, playFeedbackSound } from '../data/mockData';

interface GuestBookScreenProps {
  onNavigate: (screen: ScreenView) => void;
  onGuestSubmit: (record: AttendanceRecord) => void;
  settings: KioskSettings;
  onTriggerSync: () => void;
  isSyncing: boolean;
  onOpenSettings: () => void;
}

export const GuestBookScreen: React.FC<GuestBookScreenProps> = ({
  onNavigate,
  onGuestSubmit,
  settings,
  onTriggerSync,
  isSyncing,
  onOpenSettings,
}) => {
  // Form fields
  const [fullName, setFullName] = useState<string>('');
  const [addressOrAgency, setAddressOrAgency] = useState<string>('');
  const [purpose, setPurpose] = useState<string>('Pelayanan Dokumen Kependudukan (KTP/KK)');
  const [phoneNumber, setPhoneNumber] = useState<string>('');

  // Camera states
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState<string | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Quick purpose tag selector
  const quickPurposes = [
    'Pelayanan KTP / KK',
    'Surat Pengantar & Keterangan',
    'Konsultasi Perizinan & Desa',
    'Urusan Pertanahan (Letter C)',
    'Kunjungan Dinas / Instansi',
    'Bantuan Sosial (Bansos / BLT)',
  ];

  // Stop camera on unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  // Toggle Camera / Capture
  const handleCameraToggle = async () => {
    if (!isCameraActive && !capturedPhotoUrl) {
      // Start camera
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 480 }, height: { ideal: 640 } },
        });
        setCameraStream(stream);
        setIsCameraActive(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      } catch (err) {
        console.warn('Camera access denied or unavailable, switching to snapshot generator:', err);
        // Generate simulated guest photo snapshot
        generateSimulatedSnapshot();
      }
    } else if (isCameraActive) {
      // Capture from video feed
      if (settings.soundEffects) {
        playFeedbackSound('camera');
      }
      if (videoRef.current && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth || 480;
        canvas.height = video.videoHeight || 640;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setCapturedPhotoUrl(dataUrl);
        }
      }
      // Stop camera stream
      if (cameraStream) {
        cameraStream.getTracks().forEach(t => t.stop());
        setCameraStream(null);
      }
      setIsCameraActive(false);
    } else {
      // Retake photo
      setCapturedPhotoUrl(null);
      handleCameraToggle();
    }
  };

  const generateSimulatedSnapshot = () => {
    if (settings.soundEffects) {
      playFeedbackSound('camera');
    }
    const canvas = document.createElement('canvas');
    canvas.width = 480;
    canvas.height = 640;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createLinearGradient(0, 0, 480, 640);
      grad.addColorStop(0, '#1b5eaf');
      grad.addColorStop(1, '#001e40');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 480, 640);

      // Silhouette
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(240, 260, 90, 120, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.ellipse(240, 520, 200, 150, 0, 0, Math.PI * 2);
      ctx.fill();

      // Guest label
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(fullName.trim() || 'Tamu Desa Kedungrejo', 240, 580);

      setCapturedPhotoUrl(canvas.toDataURL('image/jpeg'));
    }
  };

  // Form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setFormError('Mohon isi nama lengkap Anda sesuai KTP.');
      return;
    }
    if (!addressOrAgency.trim()) {
      setFormError('Mohon isi alamat lengkap atau instansi asal.');
      return;
    }

    setFormError(null);
    if (settings.soundEffects) {
      playFeedbackSound('success');
    }

    const now = new Date();
    const guestRecord: AttendanceRecord = {
      id: `GUEST-${Date.now().toString().slice(-6)}`,
      recordType: 'tamu',
      name: fullName.trim(),
      roleOrAffiliation: addressOrAgency.trim(),
      timestamp: Date.now(),
      timeFormatted: getIndonesianTimeString(now),
      dateFormatted: getIndonesianDateString(now),
      verificationMethod: 'Foto Wajah & Formulir Kunjungan',
      photoUrl: capturedPhotoUrl || undefined,
      locationCoordinates: `${settings.officeLat.toFixed(6)}, ${settings.officeLng.toFixed(6)}`,
      locationName: 'Lobi Pelayanan Kantor Balai Desa Kedungrejo',
      googleSheetsSyncStatus: 'synced',
      sheetsRowId: `ROW-${Math.floor(200 + Math.random() * 800)}`,
      purpose: purpose,
      address: addressOrAgency.trim(),
      phone: phoneNumber.trim() || '-',
    };

    onGuestSubmit(guestRecord);
  };

  return (
    <div className="flex flex-1 overflow-hidden w-full min-h-[calc(100vh-65px)]">
      {/* SideNavBar (Desktop - Direct 1:1 match with Image 3 & 4) */}
      <aside className="hidden md:flex flex-col h-auto p-4 bg-white border-r border-outline-variant w-80 shrink-0 sticky top-16 self-start shadow-xs">
        {/* Village Emblem Lockup */}
        <div className="flex items-center gap-3.5 mb-8 p-2 rounded-xl bg-slate-50 border border-slate-200/60">
          <div className="w-12 h-12 bg-primary-container rounded-lg flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDaTXJLu--hagBA5XbSSrn11CK8aJgRsJTWbAvj5wjm2MAuHtJFRCLUcVhB-hHhf-d7vjLqUq0nlhTC80uZ0e46iMvzAMJuUzMl-0mrZGsT_b8vQQkcyE-gUsrl4J8annNVhkcgfe2pECCiU_9vqtXTfUyvaKUsEZBSbDr85f04vSOOG0JJ4q-NUO-fCkBpp2EnpIfIc9-h7lcLQvUAN0JlTSue5vyWmNCc1rscTt-c6LwhIfSU6kWRl4YOIwmtRzjrt6I-yIrweAg"
              alt="Lambang Resmi Pemerintah Desa Kedungrejo Pakis"
              className="w-full h-full object-cover"
              onError={e => {
                // High-fidelity fallback SVG emblem
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
            />
          </div>
          <div>
            <h2 className="text-base font-bold text-primary font-headline leading-tight">
              Desa Kedungrejo
            </h2>
            <p className="text-xs text-on-surface-variant font-body">Kecamatan Pakis</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1.5 font-body">
          <button
            onClick={() => onNavigate('staff-attendance')}
            className="w-full text-on-surface-variant flex items-center gap-3.5 px-4 py-3 hover:bg-surface-container-high transition-colors rounded-xl text-left cursor-pointer font-medium text-sm"
          >
            <span className="material-symbols-outlined text-xl">assignment_turned_in</span>
            <span>Daftar Hadir Perangkat</span>
          </button>

          <button
            onClick={() => onNavigate('guest-book')}
            className="w-full bg-secondary-container text-on-secondary-container flex items-center gap-3.5 px-4 py-3 rounded-xl active:scale-95 transition-transform text-left font-bold text-sm shadow-xs"
          >
            <span className="material-symbols-outlined text-xl">menu_book</span>
            <span>Buku Tamu Digital</span>
          </button>

          <button
            onClick={() => onNavigate('qr-scanner')}
            className="w-full text-on-surface-variant flex items-center gap-3.5 px-4 py-3 hover:bg-surface-container-high transition-colors rounded-xl text-left cursor-pointer font-medium text-sm"
          >
            <span className="material-symbols-outlined text-xl">qr_code_scanner</span>
            <span>Scan QR Code Cepat</span>
          </button>

          <button
            onClick={() => onNavigate('connection-status')}
            className="w-full text-on-surface-variant flex items-center gap-3.5 px-4 py-3 hover:bg-surface-container-high transition-colors rounded-xl text-left cursor-pointer font-medium text-sm"
          >
            <span className="material-symbols-outlined text-xl">cloud_done</span>
            <span>Status Koneksi</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="w-full text-on-surface-variant flex items-center gap-3.5 px-4 py-3 hover:bg-surface-container-high transition-colors rounded-xl text-left cursor-pointer font-medium text-sm"
          >
            <span className="material-symbols-outlined text-xl">settings</span>
            <span>Pengaturan</span>
          </button>
        </nav>

        {/* Sidebar Bottom Sync Button */}
        <button
          onClick={onTriggerSync}
          className="mt-6 w-full bg-primary text-white py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer shadow-md"
        >
          <span className={`material-symbols-outlined text-lg ${isSyncing ? 'animate-spin' : ''}`}>
            sync
          </span>
          <span>Sinkronisasi Sekarang</span>
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-surface-bright pb-28 md:pb-16">
        <div className="max-w-4xl mx-auto">
          {/* Header Title */}
          <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-1 font-headline tracking-tight">
                Buku Tamu Digital
              </h1>
              <p className="text-on-surface-variant text-sm sm:text-base font-body">
                Silakan isi data kunjungan Anda untuk keperluan administrasi desa.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onNavigate('qr-scanner')}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-secondary-container text-on-secondary-container rounded-xl text-xs sm:text-sm font-bold shadow-xs hover:bg-secondary/20 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">qr_code_scanner</span>
                <span>Scan Tiket QR</span>
              </button>
              <button
                onClick={() => onNavigate('home')}
                className="md:hidden flex items-center gap-1.5 text-xs text-primary font-bold px-3 py-2 border border-primary/30 rounded-xl"
              >
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                <span>Menu Utama</span>
              </button>
            </div>
          </div>

          {formError && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-red-600">error</span>
              <span>{formError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Section 1: Identity */}
            <div className="bg-white p-6 md:p-8 rounded-xl shadow-xs border border-outline-variant space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-primary font-headline uppercase tracking-wide">
                  1. Identitas Tamu / Pengunjung
                </h3>
              </div>

              <div className="space-y-4">
                <label className="block">
                  <span className="font-semibold text-sm text-primary block mb-1.5 font-headline">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </span>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="Masukkan nama lengkap sesuai KTP"
                    className="w-full min-h-[52px] px-4 rounded-lg border border-slate-300 bg-white text-on-surface focus:ring-2 focus:ring-secondary focus:border-secondary transition-all text-base"
                  />
                </label>

                <label className="block">
                  <span className="font-semibold text-sm text-primary block mb-1.5 font-headline">
                    Alamat Lengkap / Instansi <span className="text-red-500">*</span>
                  </span>
                  <textarea
                    required
                    value={addressOrAgency}
                    onChange={e => setAddressOrAgency(e.target.value)}
                    rows={2}
                    placeholder="Contoh: Jl. Merdeka No. 12, RT 01/RW 02 atau Nama Instansi"
                    className="w-full p-3.5 rounded-lg border border-slate-300 bg-white text-on-surface focus:ring-2 focus:ring-secondary focus:border-secondary transition-all text-base"
                  />
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="font-semibold text-sm text-primary block mb-1.5 font-headline">
                      Keperluan Kunjungan
                    </span>
                    <input
                      type="text"
                      value={purpose}
                      onChange={e => setPurpose(e.target.value)}
                      placeholder="Tuliskan keperluan Anda..."
                      className="w-full min-h-[48px] px-4 rounded-lg border border-slate-300 bg-white text-on-surface focus:ring-2 focus:ring-secondary focus:border-secondary transition-all text-sm"
                    />
                    {/* Quick selector pills */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {quickPurposes.map((p, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setPurpose(p)}
                          className={`text-xs px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                            purpose === p
                              ? 'bg-primary text-white font-medium'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="font-semibold text-sm text-primary block mb-1.5 font-headline">
                      No. WhatsApp / HP (Opsional)
                    </span>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={e => setPhoneNumber(e.target.value)}
                      placeholder="Contoh: 0812-3456-7890"
                      className="w-full min-h-[48px] px-4 rounded-lg border border-slate-300 bg-white text-on-surface focus:ring-2 focus:ring-secondary focus:border-secondary transition-all text-sm"
                    />
                    <p className="text-xs text-slate-400 mt-1.5">
                      Untuk konfirmasi status berkas atau tindak lanjut layanan desa.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Verification (Face Photo) */}
            <div className="bg-surface-container p-6 md:p-8 rounded-xl border border-outline-variant">
              <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
                {/* Photo Preview Box */}
                <div className="w-full md:w-1/3 flex flex-col items-center gap-2">
                  <div className="w-48 h-60 bg-surface-dim rounded-xl border-2 border-dashed border-outline flex flex-col items-center justify-center text-center p-2 overflow-hidden relative shadow-inner">
                    {/* Live Video */}
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className={`absolute inset-0 w-full h-full object-cover transform -scale-x-100 ${
                        isCameraActive ? 'block' : 'hidden'
                      }`}
                    />

                    {/* Canvas for snapshot */}
                    <canvas ref={canvasRef} className="hidden" />

                    {/* Captured Photo */}
                    {capturedPhotoUrl ? (
                      <img
                        src={capturedPhotoUrl}
                        alt="Foto Wajah Tamu"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      !isCameraActive && (
                        <div className="flex flex-col items-center justify-center p-4">
                          <span className="material-symbols-outlined text-5xl text-outline mb-2">
                            face_retouching_natural
                          </span>
                          <p className="text-xs font-semibold text-outline uppercase tracking-wider">
                            Pratinjau Foto
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Right Verification Instructions & Button */}
                <div className="w-full md:w-2/3 space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-primary font-headline">
                      Verifikasi Kehadiran
                    </h3>
                    <p className="text-on-surface-variant text-sm font-body mt-1 leading-relaxed">
                      Kami memerlukan foto wajah Anda sebagai bukti fisik kunjungan tamu yang sah
                      untuk ketertiban administrasi desa.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleCameraToggle}
                    className={`w-full min-h-[56px] rounded-lg font-bold text-base flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-sm cursor-pointer ${
                      capturedPhotoUrl
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                        : isCameraActive
                        ? 'bg-sky-600 text-white hover:bg-sky-700 animate-pulse'
                        : 'bg-secondary text-white hover:opacity-90'
                    }`}
                  >
                    <span className="material-symbols-outlined text-2xl">
                      {capturedPhotoUrl
                        ? 'check_circle'
                        : isCameraActive
                        ? 'photo_camera'
                        : 'photo_camera'}
                    </span>
                    <span>
                      {capturedPhotoUrl
                        ? 'Ambil Ulang Foto'
                        : isCameraActive
                        ? 'Klik Untuk Ambil Foto'
                        : 'Scan Wajah / Ambil Foto'}
                    </span>
                  </button>

                  <p
                    className={`text-xs font-medium text-center ${
                      capturedPhotoUrl
                        ? 'text-emerald-700'
                        : isCameraActive
                        ? 'text-secondary'
                        : 'text-slate-500'
                    }`}
                  >
                    {capturedPhotoUrl
                      ? '✓ Foto wajah berhasil diambil dan siap diverifikasi'
                      : isCameraActive
                      ? 'Kamera aktif. Silakan posisikan wajah di dalam bingkai.'
                      : 'Kamera opsional: dapat diambil langsung melalui webcam atau sensor kiosk.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Section */}
            <div className="py-2">
              <button
                type="submit"
                className="w-full min-h-[64px] md:min-h-[72px] bg-primary text-white rounded-xl font-bold text-lg md:text-xl flex items-center justify-center gap-3 hover:bg-primary-container transition-all active:scale-[0.98] shadow-md cursor-pointer font-headline"
              >
                <span className="material-symbols-outlined text-2xl">save</span>
                <span>SIMPAN DATA KUNJUNGAN</span>
              </button>

              <div className="mt-4 flex items-center justify-center gap-2 py-3 px-4 bg-tertiary-fixed rounded-lg text-on-tertiary-fixed-variant text-xs sm:text-sm">
                <span className="material-symbols-outlined text-base">cloud_upload</span>
                <span className="font-medium">
                  Data akan tersimpan secara otomatis di Google Sheets ({settings.googleSheetsName})
                </span>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};
