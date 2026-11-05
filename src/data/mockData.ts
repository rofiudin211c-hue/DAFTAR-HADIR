import { StaffMember, AttendanceRecord, KioskSettings } from '../types';

export const INITIAL_STAFF_MEMBERS: StaffMember[] = [
  {
    id: 'staff-1',
    nip: '19780512 200604 1 008',
    name: 'Bambang Susilo Utomo',
    role: 'Sekretaris Desa',
    phone: '0812-3456-7890',
    statusToday: 'Belum Hadir',
    avatarSeed: 'Bambang',
  },
  {
    id: 'staff-2',
    nip: '19710315 199803 1 004',
    name: 'Drs. H. M. Samsul Huda',
    role: 'Kepala Desa',
    phone: '0813-9876-5432',
    statusToday: 'Belum Hadir',
    avatarSeed: 'Samsul',
  },
  {
    id: 'staff-3',
    nip: '19840210 201001 2 015',
    name: 'Siti Nurjanah, S.AP',
    role: 'Kaur Keuangan',
    phone: '0857-1122-3344',
    statusToday: 'Belum Hadir',
    avatarSeed: 'Siti',
  },
  {
    id: 'staff-4',
    nip: '19860924 201202 1 003',
    name: 'Budi Santoso, S.Sos',
    role: 'Kasi Pemerintahan',
    phone: '0821-4455-6677',
    statusToday: 'Belum Hadir',
    avatarSeed: 'Budi',
  },
  {
    id: 'staff-5',
    nip: '19901118 201503 2 007',
    name: 'Rina Wulandari, S.Kom',
    role: 'Kasi Pelayanan',
    phone: '0819-7788-9900',
    statusToday: 'Belum Hadir',
    avatarSeed: 'Rina',
  },
  {
    id: 'staff-6',
    nip: '19890405 201401 1 006',
    name: 'Agus Setiawan',
    role: 'Kaur Umum & Perencanaan',
    phone: '0856-3344-5566',
    statusToday: 'Belum Hadir',
    avatarSeed: 'Agus',
  },
  {
    id: 'staff-7',
    nip: '19920812 201802 1 002',
    name: 'Eko Prasetyo',
    role: 'Kepala Dusun Krajan',
    phone: '0812-9900-1122',
    statusToday: 'Belum Hadir',
    avatarSeed: 'Eko',
  },
  {
    id: 'staff-8',
    nip: '19910520 201701 1 005',
    name: 'Tri Wahyudi',
    role: 'Kepala Dusun Kedungboto',
    phone: '0852-6677-8899',
    statusToday: 'Belum Hadir',
    avatarSeed: 'Tri',
  },
];

export const INITIAL_SETTINGS: KioskSettings = {
  villageName: 'Desa Kedungrejo',
  districtName: 'Kecamatan Pakis',
  regencyName: 'Kabupaten Malang',
  googleSheetsId: '1k9b5x_Kedungrejo_Presensi_2024',
  googleSheetsName: 'DAFTAR_HADIR_KEDUNGREJO_2024',
  autoSyncIntervalMinutes: 5,
  soundEffects: true,
  gpsValidation: true,
  officeLat: -7.954201,
  officeLng: 112.721482,
};

export const INITIAL_RECORDS: AttendanceRecord[] = [
  {
    id: 'REC-001',
    recordType: 'perangkat',
    name: 'Drs. H. M. Samsul Huda',
    roleOrAffiliation: 'Kepala Desa',
    timestamp: Date.now() - 3600000 * 2,
    timeFormatted: '07:15 WIB',
    dateFormatted: getIndonesianDateString(new Date()),
    verificationMethod: 'Biometrik Wajah & Sidik Jari',
    locationCoordinates: '-7.954201, 112.721482',
    locationName: 'Kantor Balai Desa Kedungrejo (Presisi: 4m)',
    googleSheetsSyncStatus: 'synced',
    sheetsRowId: 'ROW-142',
  },
  {
    id: 'REC-002',
    recordType: 'tamu',
    name: 'Ir. Hendro Wicaksono',
    roleOrAffiliation: 'Dinas Pemberdayaan Masyarakat dan Desa (DPMD)',
    timestamp: Date.now() - 3600000 * 1.2,
    timeFormatted: '08:05 WIB',
    dateFormatted: getIndonesianDateString(new Date()),
    verificationMethod: 'Foto Wajah & Formulir Kunjungan',
    locationCoordinates: '-7.954198, 112.721475',
    locationName: 'Lobi Pelayanan Balai Desa Kedungrejo',
    googleSheetsSyncStatus: 'synced',
    sheetsRowId: 'ROW-143',
    purpose: 'Monitoring dan Evaluasi Realisasi Dana Desa Tahap I',
    address: 'Jl. Merdeka Barat No. 45, Kepanjen, Kab. Malang',
    phone: '0812-7788-9900',
  },
];

export function getIndonesianDateString(date: Date = new Date()): string {
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const dayName = days[date.getDay()];
  const day = date.getDate();
  const monthName = months[date.getMonth()];
  const year = date.getFullYear();

  return `${dayName}, ${day} ${monthName} ${year}`;
}

export function getIndonesianTimeString(date: Date = new Date()): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes} WIB`;
}

// Web Audio API Synthesizer for feedback chimes (no external assets needed)
export function playFeedbackSound(type: 'beep' | 'camera' | 'fingerprint' | 'success') {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (type === 'camera') {
      // Camera shutter click sound
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } else if (type === 'fingerprint') {
      // High-tech scanning hum
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(540, ctx.currentTime + 0.4);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } else if (type === 'success') {
      // Positive harmonic major chime
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
        gain.gain.setValueAtTime(0.25, ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + idx * 0.08 + 0.35);
      });
    } else {
      // General subtle tap
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    }
  } catch {
    // Ignore audio context autoplay limitations
  }
}
