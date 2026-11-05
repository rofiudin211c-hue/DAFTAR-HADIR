import React, { useState, useRef, useEffect, useCallback } from 'react';
import jsQR from 'jsqr';
import { ScreenView, StaffMember, AttendanceRecord, KioskSettings } from '../types';
import { getIndonesianDateString, getIndonesianTimeString, playFeedbackSound } from '../data/mockData';

interface QRScannerScreenProps {
  onNavigate: (screen: ScreenView) => void;
  staffList: StaffMember[];
  onAttendanceSuccess: (record: AttendanceRecord) => void;
  settings: KioskSettings;
  onOpenBadgeModal: () => void;
}

export const QRScannerScreen: React.FC<QRScannerScreenProps> = ({
  onNavigate,
  staffList,
  onAttendanceSuccess,
  settings,
  onOpenBadgeModal,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [torchOn, setTorchOn] = useState<boolean>(false);
  const [hasTorch, setHasTorch] = useState<boolean>(false);
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const [scanStatusMessage, setScanStatusMessage] = useState<string>(
    'Arahkan QR Code kartu tanda pengenal ke dalam bingkai kamera'
  );
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Parse QR content and generate attendance record
  const processQRData = useCallback(
    (qrString: string) => {
      if (isProcessing) return;
      setIsProcessing(true);
      setScannedResult(qrString);

      if (settings.soundEffects) {
        playFeedbackSound('success');
      }

      if (navigator.vibrate) {
        navigator.vibrate([80, 50, 120]);
      }

      const now = new Date();
      let recordName = 'Perangkat Desa';
      let recordRole = 'Perangkat Desa Kedungrejo';
      let recordType: 'perangkat' | 'tamu' = 'perangkat';
      let recordPurpose: string | undefined = undefined;
      let recordAddress: string | undefined = undefined;

      // Check format
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
          recordName = 'Tamu Undangan';
        }
      } else {
        // Try direct JSON
        try {
          const parsed = JSON.parse(qrString);
          if (parsed.type === 'guest') {
            recordType = 'tamu';
            recordName = parsed.name || 'Tamu Kedungrejo';
            recordRole = parsed.roleOrAffiliation || 'Tamu Kunjungan';
            recordPurpose = parsed.purpose;
          } else {
            recordType = 'perangkat';
            recordName = parsed.name || 'Perangkat Desa';
            recordRole = parsed.role || 'Staf Pemerintah Desa';
          }
        } catch {
          // Plain text match with staff list
          const matchedStaff = staffList.find(
            s =>
              qrString.toLowerCase().includes(s.name.toLowerCase()) ||
              qrString.toLowerCase().includes(s.nip.toLowerCase()) ||
              qrString.toLowerCase().includes(s.id.toLowerCase())
          );
          if (matchedStaff) {
            recordName = matchedStaff.name;
            recordRole = matchedStaff.role;
            recordType = 'perangkat';
          } else {
            // General guest pass
            recordType = 'tamu';
            recordName = qrString.slice(0, 32);
            recordRole = 'Tamu / Pengunjung Terverifikasi';
          }
        }
      }

      setScanStatusMessage(`QR Terverifikasi: ${recordName}`);

      setTimeout(() => {
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
          locationName: 'Gerbang Kiosk Mandiri Kantor Balai Desa Kedungrejo',
          googleSheetsSyncStatus: 'synced',
          sheetsRowId: `ROW-${Math.floor(100 + Math.random() * 900)}`,
          purpose: recordPurpose,
          address: recordAddress,
        };

        onAttendanceSuccess(newRecord);
      }, 700);
    },
    [isProcessing, onAttendanceSuccess, settings, staffList]
  );

  // Start webcam
  const startCamera = useCallback(async () => {
    try {
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().catch(() => {});
      }
      setCameraActive(true);
      setCameraError(null);

      // Check torch capability
      const videoTrack = mediaStream.getVideoTracks()[0];
      if (videoTrack) {
        const capabilities = videoTrack.getCapabilities?.() as { torch?: boolean };
        if (capabilities && capabilities.torch) {
          setHasTorch(true);
        }
      }
    } catch (err) {
      console.warn('Webcam permission not granted or device has no camera:', err);
      setCameraError(
        'Kamera tidak aktif atau izin ditolak. Anda tetap dapat melakukan uji coba scan menggunakan tombol simulasi di bawah.'
      );
      setCameraActive(false);
    }
  }, [facingMode, stream]);

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [facingMode]);

  // Main QR Detection Loop
  useEffect(() => {
    let animationFrameId: number;

    const scanFrame = () => {
      if (
        !isProcessing &&
        videoRef.current &&
        videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA &&
        canvasRef.current
      ) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        if (ctx) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert',
          });

          // Draw highlight on overlay canvas if detected
          const overlayCanvas = overlayCanvasRef.current;
          if (overlayCanvas) {
            overlayCanvas.width = video.videoWidth;
            overlayCanvas.height = video.videoHeight;
            const overlayCtx = overlayCanvas.getContext('2d');
            if (overlayCtx) {
              overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

              if (code && code.location) {
                // Draw green bounding box around detected QR
                overlayCtx.lineWidth = 4;
                overlayCtx.strokeStyle = '#22c55e';
                overlayCtx.beginPath();
                overlayCtx.moveTo(code.location.topLeftCorner.x, code.location.topLeftCorner.y);
                overlayCtx.lineTo(code.location.topRightCorner.x, code.location.topRightCorner.y);
                overlayCtx.lineTo(code.location.bottomRightCorner.x, code.location.bottomRightCorner.y);
                overlayCtx.lineTo(code.location.bottomLeftCorner.x, code.location.bottomLeftCorner.y);
                overlayCtx.closePath();
                overlayCtx.stroke();
              }
            }
          }

          if (code && code.data) {
            processQRData(code.data);
            return;
          }
        }
      }

      animationFrameId = requestAnimationFrame(scanFrame);
    };

    animationFrameId = requestAnimationFrame(scanFrame);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isProcessing, processQRData]);

  // Toggle Torch/Flashlight
  const toggleTorch = async () => {
    if (!stream) return;
    const track = stream.getVideoTracks()[0];
    if (track) {
      try {
        const nextState = !torchOn;
        // @ts-expect-error torch is valid on ImageCapture supported browsers
        await track.applyConstraints({ advanced: [{ torch: nextState }] });
        setTorchOn(nextState);
      } catch (err) {
        console.warn('Torch constraint error:', err);
      }
    }
  };

  // Toggle Camera Front / Back
  const toggleFacingMode = () => {
    setFacingMode(prev => (prev === 'environment' ? 'user' : 'environment'));
  };

  // File Upload QR Scanner
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imgData.data, imgData.width, imgData.height);
          if (code && code.data) {
            processQRData(code.data);
          } else {
            alert('Tidak ditemukan QR Code yang valid pada gambar yang diunggah. Silakan coba gambar lain.');
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-6 pb-28 md:pb-16 w-full flex flex-col items-center">
      {/* Top Header & Navigation */}
      <div className="w-full mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 status-pulse-green"></span>
            <span className="text-xs font-bold text-secondary uppercase tracking-wider font-headline">
              Kiosk QR Scanner
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-primary font-headline tracking-tight">
            Scan QR Code Presensi Cepat
          </h2>
          <p className="text-xs sm:text-sm text-on-surface-variant font-body mt-1">
            Arahkan Kartu ID Perangkat atau Tiket Tamu Anda tepat di depan kamera pemindai.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenBadgeModal}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-secondary-container text-on-secondary-container hover:bg-secondary/20 rounded-xl font-bold text-xs sm:text-sm transition-colors cursor-pointer shadow-xs"
          >
            <span className="material-symbols-outlined text-lg">badge</span>
            <span>Buka Badge QR</span>
          </button>

          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-1.5 px-4 py-2.5 border border-slate-300 hover:bg-slate-100 rounded-xl font-semibold text-xs sm:text-sm text-slate-700 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            <span>Kembali</span>
          </button>
        </div>
      </div>

      {cameraError && (
        <div className="w-full mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs sm:text-sm flex items-start gap-3">
          <span className="material-symbols-outlined text-amber-600 text-xl shrink-0">info</span>
          <div>
            <p className="font-bold">Informasi Akses Kamera</p>
            <p className="mt-0.5">{cameraError}</p>
          </div>
        </div>
      )}

      {/* Camera Viewfinder Frame */}
      <div className="w-full max-w-lg bg-surface-dim rounded-2xl overflow-hidden border-2 border-outline relative aspect-[4/3] shadow-md flex items-center justify-center">
        {/* Hidden Canvas for QR parsing */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Live Video Feed */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover ${facingMode === 'user' ? '-scale-x-100' : ''}`}
        />

        {/* Overlay Canvas for Detected QR Highlight Box */}
        <canvas
          ref={overlayCanvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none z-20"
        />

        {/* Reticle Target Guide */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="w-56 h-56 sm:w-64 sm:h-64 border-2 border-white/50 rounded-2xl relative shadow-[0_0_0_9999px_rgba(0,30,64,0.45)]">
            {/* 4 Corner Markers */}
            <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-secondary rounded-tl-lg"></div>
            <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-secondary rounded-tr-lg"></div>
            <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-secondary rounded-bl-lg"></div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-secondary rounded-br-lg"></div>

            {/* Scanning Line Animation */}
            {!isProcessing && (
              <div className="absolute left-0 right-0 h-1 bg-emerald-400 shadow-[0_0_12px_#22c55e] animate-scan-line"></div>
            )}

            {/* Center target crosshair */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="material-symbols-outlined text-white/30 text-4xl">filter_center_focus</span>
            </div>
          </div>
        </div>

        {/* Detected State Flash Overlay */}
        {isProcessing && (
          <div className="absolute inset-0 bg-emerald-600/30 backdrop-blur-xs flex flex-col items-center justify-center text-white z-30 animate-scale-check">
            <div className="w-20 h-20 bg-white text-emerald-600 rounded-full flex items-center justify-center mb-3 shadow-lg">
              <span className="material-symbols-outlined text-5xl fill">check_circle</span>
            </div>
            <p className="font-bold text-lg font-headline">QR Code Berhasil Terbaca!</p>
            <p className="text-xs text-white/90">Menyiapkan konfirmasi presensi...</p>
          </div>
        )}

        {/* Camera Control Overlays */}
        <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
          {hasTorch && (
            <button
              onClick={toggleTorch}
              className={`p-2.5 rounded-full backdrop-blur-md transition-all cursor-pointer ${
                torchOn ? 'bg-amber-400 text-slate-900' : 'bg-black/40 text-white hover:bg-black/60'
              }`}
              title="Lampu Kilat / Senter"
            >
              <span className="material-symbols-outlined text-lg">
                {torchOn ? 'flashlight_on' : 'flashlight_off'}
              </span>
            </button>
          )}

          <button
            onClick={toggleFacingMode}
            className="p-2.5 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition-all cursor-pointer"
            title="Ganti Kamera Depan / Belakang"
          >
            <span className="material-symbols-outlined text-lg">flip_camera_ios</span>
          </button>
        </div>

        {/* Bottom Status Ribbon */}
        <div className="absolute bottom-4 left-4 right-4 z-20 pointer-events-none text-center">
          <div className="inline-block bg-white/90 backdrop-blur-md px-4 py-2 rounded-full text-primary font-semibold text-xs shadow-md border border-slate-200">
            {scanStatusMessage}
          </div>
        </div>
      </div>

      {/* Alternative Input / Upload File */}
      <div className="w-full max-w-lg mt-4 flex items-center justify-between gap-3 text-xs">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 py-2.5 px-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
        >
          <span className="material-symbols-outlined text-base text-secondary">upload_file</span>
          <span>Unggah Gambar QR</span>
        </button>

        <button
          onClick={onOpenBadgeModal}
          className="flex-1 py-2.5 px-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
        >
          <span className="material-symbols-outlined text-base text-primary">qr_code_2</span>
          <span>Lihat Kartu Badge QR</span>
        </button>
      </div>

      {/* Interactive 1-Click Simulation Drawer for Quick Testing */}
      <div className="w-full max-w-lg mt-8 p-5 bg-white border border-outline-variant rounded-2xl shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-xl">bolt</span>
            <h4 className="font-bold text-primary text-xs sm:text-sm font-headline uppercase tracking-wide">
              Uji Coba Cepat (Simulasi Scan Kartu)
            </h4>
          </div>
          <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
            Kiosk Ready
          </span>
        </div>
        <p className="text-xs text-slate-600 mb-4 font-body">
          Klik salah satu profil di bawah untuk menguji respon sistem saat mendeteksi kartu QR fisik:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {staffList.slice(0, 3).map(staff => (
            <button
              key={staff.id}
              onClick={() => {
                const payload = `KDR-STAFF:${JSON.stringify({
                  type: 'staff',
                  id: staff.id,
                  name: staff.name,
                  role: staff.role,
                  nip: staff.nip,
                  village: settings.villageName,
                })}`;
                processQRData(payload);
              }}
              className="p-3 text-left bg-slate-50 hover:bg-blue-50/80 border border-slate-200 hover:border-secondary rounded-xl transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-primary group-hover:text-secondary truncate">
                  {staff.name}
                </span>
                <span className="material-symbols-outlined text-xs text-slate-400 group-hover:text-secondary">
                  qr_code
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">{staff.role}</p>
            </button>
          ))}

          {/* Guest Simulation Card */}
          <button
            onClick={() => {
              const payload = `KDR-GUEST:${JSON.stringify({
                type: 'guest',
                name: 'Ir. Hendro Wicaksono',
                roleOrAffiliation: 'DPMD Kabupaten Malang',
                purpose: 'Monitoring Dana Desa',
              })}`;
              processQRData(payload);
            }}
            className="p-3 text-left bg-slate-50 hover:bg-blue-50/80 border border-slate-200 hover:border-secondary rounded-xl transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-primary group-hover:text-secondary truncate">
                Ir. Hendro Wicaksono
              </span>
              <span className="material-symbols-outlined text-xs text-slate-400 group-hover:text-secondary">
                how_to_reg
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Tamu Dinas: DPMD Kab. Malang</p>
          </button>
        </div>
      </div>
    </main>
  );
};
