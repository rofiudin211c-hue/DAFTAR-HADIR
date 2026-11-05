import React, { useState, useRef, useEffect } from 'react';
import { ScreenView, StaffMember, AttendanceRecord, KioskSettings } from '../types';
import { getIndonesianDateString, getIndonesianTimeString, playFeedbackSound } from '../data/mockData';

interface StaffAttendanceScreenProps {
  onNavigate: (screen: ScreenView) => void;
  staffList: StaffMember[];
  onAttendanceSuccess: (record: AttendanceRecord) => void;
  settings: KioskSettings;
}

export const StaffAttendanceScreen: React.FC<StaffAttendanceScreenProps> = ({
  onNavigate,
  staffList,
  onAttendanceSuccess,
  settings,
}) => {
  // Selected staff member
  const [selectedStaffId, setSelectedStaffId] = useState<string>(staffList[0]?.id || '');
  const selectedStaff = staffList.find(s => s.id === selectedStaffId) || staffList[0];

  // Camera & Face scan states
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [capturedFaceUrl, setCapturedFaceUrl] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Step 2 fingerprint states
  const [step1Done, setStep1Done] = useState<boolean>(false);
  const [isScanningFingerprint, setIsScanningFingerprint] = useState<boolean>(false);
  const [fingerprintSuccess, setFingerprintSuccess] = useState<boolean>(false);

  // GPS coordinates
  const [gpsCoords, setGpsCoords] = useState<string>('-7.954201, 112.721482');
  const [gpsAccuracy, setGpsAccuracy] = useState<string>('3.5m');

  // Start webcam automatically on mount
  useEffect(() => {
    let activeStream: MediaStream | null = null;
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false,
        });
        activeStream = mediaStream;
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play().catch(() => {});
        }
        setCameraActive(true);
        setCameraError(null);
      } catch (err) {
        console.warn('Webcam permission not granted or device has no camera:', err);
        setCameraError('Kamera tidak aktif atau izin ditolak. Menggunakan mode simulasi presensi.');
        setCameraActive(false);
      }
    };

    startCamera();

    // Try to get actual GPS if available
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          setGpsCoords(`${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`);
          setGpsAccuracy(`${pos.coords.accuracy.toFixed(1)}m`);
        },
        () => {
          // Keep default Kedungrejo Pakis coords
        },
        { timeout: 5000 }
      );
    }

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Handle capture face button
  const handleCaptureFace = () => {
    if (settings.soundEffects) {
      playFeedbackSound('camera');
    }

    if (cameraActive && videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setCapturedFaceUrl(dataUrl);
      }
    } else {
      // Create a clean simulated avatar capture snapshot with staff details
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Gradient background
        const grad = ctx.createLinearGradient(0, 0, 640, 480);
        grad.addColorStop(0, '#001e40');
        grad.addColorStop(1, '#1b5eaf');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 640, 480);

        // Oval face silhouette
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(320, 210, 85, 110, 0, 0, Math.PI * 2);
        ctx.fill();

        // Shoulders
        ctx.beginPath();
        ctx.ellipse(320, 410, 180, 120, 0, 0, Math.PI * 2);
        ctx.fill();

        // Label
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(selectedStaff?.name || 'Perangkat Desa', 320, 450);

        setCapturedFaceUrl(canvas.toDataURL('image/jpeg'));
      }
    }

    setStep1Done(true);
  };

  const handleRetakeFace = () => {
    setCapturedFaceUrl(null);
    setStep1Done(false);
    setFingerprintSuccess(false);
  };

  // Handle fingerprint scan
  const handleScanFingerprint = () => {
    if (!step1Done) return;

    setIsScanningFingerprint(true);
    if (settings.soundEffects) {
      playFeedbackSound('fingerprint');
    }

    // Vibrate device if supported
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 150]);
    }

    setTimeout(() => {
      setIsScanningFingerprint(false);
      setFingerprintSuccess(true);
      if (settings.soundEffects) {
        playFeedbackSound('success');
      }

      // Record attendance
      const now = new Date();
      const newRecord: AttendanceRecord = {
        id: `REC-${Date.now().toString().slice(-6)}`,
        recordType: 'perangkat',
        name: selectedStaff?.name || 'Perangkat Desa Kedungrejo',
        roleOrAffiliation: selectedStaff?.role || 'Perangkat Desa',
        timestamp: Date.now(),
        timeFormatted: getIndonesianTimeString(now),
        dateFormatted: getIndonesianDateString(now),
        verificationMethod: 'Biometrik Wajah & Sidik Jari',
        photoUrl: capturedFaceUrl || undefined,
        locationCoordinates: gpsCoords,
        locationName: `Kantor Balai Desa Kedungrejo, Kec. Pakis (Akurasi: ${gpsAccuracy})`,
        googleSheetsSyncStatus: 'synced',
        sheetsRowId: `ROW-${Math.floor(100 + Math.random() * 900)}`,
      };

      onAttendanceSuccess(newRecord);
    }, 1200);
  };

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-8 pb-28 sm:pb-32 w-full">
      {/* Navigation / Header Section */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-primary font-headline tracking-tight">
            Presensi Perangkat Desa
          </h2>
          <p className="text-sm sm:text-base text-on-surface-variant font-body mt-1">
            Silakan lengkapi verifikasi wajah dan sidik jari untuk mencatat kehadiran hari ini.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('qr-scanner')}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-secondary-container text-on-secondary-container font-semibold text-sm sm:text-base rounded-xl hover:bg-secondary/20 transition-all min-h-[48px] w-fit active:scale-95 cursor-pointer shadow-xs"
          >
            <span className="material-symbols-outlined text-xl" data-icon="qr_code_scanner">
              qr_code_scanner
            </span>
            <span>Scan QR Badge</span>
          </button>

          <button
            onClick={() => onNavigate('home')}
            className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-primary text-primary font-semibold text-sm sm:text-base rounded-xl hover:bg-surface-container-high transition-colors min-h-[48px] w-fit active:scale-95 cursor-pointer shadow-xs"
          >
            <span className="material-symbols-outlined text-xl" data-icon="arrow_back">
              arrow_back
            </span>
            <span>Kembali</span>
          </button>
        </div>
      </div>

      {/* Staff Selector Dropdown / Selection Bar */}
      <div className="mb-8 bg-white border border-outline-variant rounded-xl p-4 sm:p-5 shadow-xs">
        <label className="block text-xs font-bold uppercase tracking-wider text-primary mb-2">
          Pilih Nama Perangkat Desa yang Hadir:
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2">
            <select
              value={selectedStaffId}
              onChange={e => setSelectedStaffId(e.target.value)}
              className="w-full h-12 px-4 rounded-lg border border-slate-300 bg-surface text-on-surface font-medium text-base focus:ring-2 focus:ring-secondary focus:border-secondary transition-all"
            >
              {staffList.map(staff => (
                <option key={staff.id} value={staff.id}>
                  {staff.name} — {staff.role} (NIP: {staff.nip})
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-3 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700">
            <span className="material-symbols-outlined text-secondary text-2xl">verified_user</span>
            <div>
              <p className="font-bold text-primary">{selectedStaff.role}</p>
              <p className="text-slate-500">Status: Siap diverifikasi</p>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Flow Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Step 1: Face Scan */}
        <section
          className={`bg-white border border-outline-variant rounded-xl p-6 md:p-8 flex flex-col gap-6 shadow-xs transition-all duration-300 ${
            step1Done ? 'ring-2 ring-emerald-500/40' : ''
          }`}
        >
          <div className="flex items-center gap-4 border-b border-outline-variant pb-4">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl transition-colors ${
                step1Done
                  ? 'bg-emerald-600 text-white'
                  : 'bg-primary-container text-on-primary-container'
              }`}
            >
              {step1Done ? (
                <span className="material-symbols-outlined text-2xl">check</span>
              ) : (
                '1'
              )}
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-bold text-primary uppercase font-headline">
                Scan Wajah / Ambil Gambar
              </h3>
              <p className="text-xs text-slate-500 font-body">Langkah 1 dari 2 verifikasi biometrik</p>
            </div>
          </div>

          {/* Viewfinder Box */}
          <div className="relative w-full aspect-[4/3] bg-surface-dim rounded-xl overflow-hidden border-2 border-dashed border-outline group flex items-center justify-center">
            {/* Live Camera Feed */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`absolute inset-0 w-full h-full object-cover transform -scale-x-100 ${
                capturedFaceUrl ? 'hidden' : 'block'
              }`}
            />

            {/* Hidden canvas for taking snapshot */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Captured Snapshot if taken */}
            {capturedFaceUrl && (
              <img
                src={capturedFaceUrl}
                alt="Captured Face"
                className="absolute inset-0 w-full h-full object-cover z-20"
              />
            )}

            {/* Fallback Viewfinder Placeholder if no video */}
            {!cameraActive && !capturedFaceUrl && (
              <div className="absolute inset-0 flex items-center justify-center p-6 text-center z-0">
                <div className="flex flex-col items-center gap-3">
                  <span
                    className="material-symbols-outlined text-6xl md:text-7xl text-outline-variant"
                    data-icon="camera_enhance"
                  >
                    camera_enhance
                  </span>
                  <p className="text-sm md:text-base text-on-surface-variant max-w-xs">
                    Posisikan wajah Anda tepat di tengah bingkai kamera
                  </p>
                  <span className="text-xs text-slate-500 bg-white/70 px-3 py-1 rounded-full border border-slate-200">
                    Mode Sensor AI Aktif
                  </span>
                </div>
              </div>
            )}

            {/* Decorative Viewfinder Corners */}
            <div className="absolute top-6 left-6 w-10 h-10 border-t-4 border-l-4 border-secondary rounded-tl-lg pointer-events-none z-10"></div>
            <div className="absolute top-6 right-6 w-10 h-10 border-t-4 border-r-4 border-secondary rounded-tr-lg pointer-events-none z-10"></div>
            <div className="absolute bottom-6 left-6 w-10 h-10 border-b-4 border-l-4 border-secondary rounded-bl-lg pointer-events-none z-10"></div>
            <div className="absolute bottom-6 right-6 w-10 h-10 border-b-4 border-r-4 border-secondary rounded-br-lg pointer-events-none z-10"></div>

            {/* Scanning Animation Line (Active while camera is streaming & not captured) */}
            {!capturedFaceUrl && (
              <div className="absolute left-0 right-0 h-1 bg-sky-400 shadow-[0_0_12px_#38bdf8] animate-scan-line z-10 pointer-events-none"></div>
            )}

            {/* Bottom Overlay lighting status pill */}
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-primary/60 to-transparent flex items-center justify-center px-4 z-10 pointer-events-none">
              <div className="bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-primary font-semibold text-xs md:text-sm shadow-xs flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Kualitas Pencahayaan: Baik</span>
              </div>
            </div>
          </div>

          {/* Step 1 Actions */}
          {!step1Done ? (
            <button
              onClick={handleCaptureFace}
              className="w-full bg-primary text-white py-4 md:py-5 px-6 rounded-xl font-bold text-base md:text-lg flex items-center justify-center gap-3 hover:bg-primary-container transition-all active:scale-[0.98] shadow-md cursor-pointer"
            >
              <span className="material-symbols-outlined text-2xl fill" data-icon="photo_camera">
                photo_camera
              </span>
              <span>CAPTURE / AMBIL GAMBAR</span>
            </button>
          ) : (
            <div className="flex gap-3">
              <div className="flex-1 bg-emerald-600 text-white py-4 md:py-5 px-6 rounded-xl font-bold text-base md:text-lg flex items-center justify-center gap-2 shadow-md">
                <span className="material-symbols-outlined text-2xl" data-icon="check">
                  check
                </span>
                <span>BERHASIL DIAMBIL</span>
              </div>
              <button
                onClick={handleRetakeFace}
                className="px-4 py-4 border border-slate-300 hover:bg-slate-100 rounded-xl font-medium text-slate-700 text-sm transition-colors cursor-pointer"
                title="Ambil Ulang Foto"
              >
                <span className="material-symbols-outlined text-xl">refresh</span>
              </button>
            </div>
          )}
        </section>

        {/* Step 2: Fingerprint Scan */}
        <section
          className={`bg-white border border-outline-variant rounded-xl p-6 md:p-8 flex flex-col gap-6 shadow-xs transition-all duration-300 ${
            !step1Done ? 'opacity-40 pointer-events-none' : 'opacity-100'
          }`}
        >
          <div className="flex items-center gap-4 border-b border-outline-variant pb-4">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl transition-colors ${
                !step1Done
                  ? 'bg-outline-variant text-on-surface-variant'
                  : fingerprintSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-secondary-container text-on-secondary-container'
              }`}
            >
              {fingerprintSuccess ? (
                <span className="material-symbols-outlined text-2xl">check</span>
              ) : (
                '2'
              )}
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-bold text-primary uppercase font-headline">
                Sidik Jari
              </h3>
              <p className="text-xs text-slate-500 font-body">Langkah 2: Sentuh pemindai sidik jari</p>
            </div>
          </div>

          {/* Fingerprint Interactive Area */}
          <div className="flex-1 flex flex-col items-center justify-center gap-6 py-6 md:py-10">
            <button
              onClick={handleScanFingerprint}
              disabled={!step1Done || isScanningFingerprint}
              className={`relative w-44 h-44 sm:w-48 sm:h-48 rounded-full flex items-center justify-center border-4 transition-all duration-500 cursor-pointer focus:outline-none ${
                fingerprintSuccess
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-600'
                  : isScanningFingerprint
                  ? 'border-secondary bg-blue-50 text-secondary scale-105'
                  : 'bg-surface-container-high border-outline-variant hover:border-secondary hover:scale-105 text-primary'
              }`}
            >
              <span
                className={`material-symbols-outlined text-7xl sm:text-8xl transition-colors ${
                  isScanningFingerprint ? 'animate-pulse text-secondary' : ''
                }`}
                data-icon="fingerprint"
              >
                fingerprint
              </span>

              {/* Ripple Animation during scanning */}
              {isScanningFingerprint && (
                <div className="absolute inset-0 rounded-full border-4 border-secondary animate-pulse-ripple pointer-events-none"></div>
              )}
            </button>

            <div className="text-center space-y-1.5">
              <p className="text-base sm:text-lg font-bold text-primary uppercase font-headline">
                {isScanningFingerprint
                  ? 'Memindai Sidik Jari...'
                  : fingerprintSuccess
                  ? 'Sidik Jari Terverifikasi!'
                  : 'Scan Sekarang'}
              </p>
              <p className="text-xs sm:text-sm text-on-surface-variant max-w-xs font-body">
                {isScanningFingerprint
                  ? 'Tahan jari Anda, sistem mencocokkan biometrik perangkat...'
                  : 'Tempelkan jari telunjuk Anda pada alat pemindai yang tersedia'}
              </p>
            </div>
          </div>

          {/* Step 2 Action Button */}
          <button
            onClick={handleScanFingerprint}
            disabled={!step1Done || isScanningFingerprint}
            className={`w-full py-4 md:py-5 px-6 rounded-xl font-bold text-base md:text-lg flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-md cursor-pointer ${
              !step1Done
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                : isScanningFingerprint
                ? 'bg-secondary/80 text-white cursor-wait'
                : 'bg-secondary text-white hover:bg-secondary/90'
            }`}
          >
            <span
              className={`material-symbols-outlined text-2xl ${
                isScanningFingerprint ? 'animate-spin' : ''
              }`}
              data-icon="settings_input_antenna"
            >
              settings_input_antenna
            </span>
            <span>
              {isScanningFingerprint ? 'MEMVERIFIKASI...' : 'MULAI SCAN SIDIK JARI'}
            </span>
          </button>
        </section>
      </div>

      {/* Info Card with GPS status */}
      <div className="mt-10 bg-primary-container/10 border border-primary-container/20 rounded-xl p-6 flex flex-col md:flex-row items-center gap-5 shadow-xs">
        <div className="w-14 h-14 bg-primary-container rounded-full flex items-center justify-center text-white shrink-0">
          <span className="material-symbols-outlined text-3xl" data-icon="info">
            info
          </span>
        </div>
        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-1">
            <h4 className="font-bold text-primary text-base font-headline">Informasi Penting</h4>
            <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
              Koordinat GPS: {gpsCoords}
            </span>
          </div>
          <p className="text-sm text-on-surface font-body leading-relaxed">
            Pastikan anda berada di lingkungan kantor desa saat melakukan presensi. Sistem GPS akan
            mencatat lokasi koordinat Anda secara otomatis bersamaan dengan pengambilan data
            biometrik ini.
          </p>
        </div>
      </div>
    </main>
  );
};
