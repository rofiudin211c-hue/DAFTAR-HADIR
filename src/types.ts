export interface StaffMember {
  id: string;
  nip: string;
  name: string;
  role: string;
  phone: string;
  statusToday: 'Belum Hadir' | 'Hadir' | 'Izin';
  timeToday?: string;
  avatarSeed: string;
}

export interface AttendanceRecord {
  id: string;
  recordType: 'perangkat' | 'tamu';
  name: string;
  roleOrAffiliation: string; // "Sekretaris Desa" or "Warga RT 02 / RW 01" / "Dinas Kesehatan"
  timestamp: number;
  timeFormatted: string; // e.g. "07:42 WIB"
  dateFormatted: string; // e.g. "Senin, 24 Mei 2024"
  verificationMethod: string;
  photoUrl?: string;
  locationCoordinates: string;
  locationName: string;
  googleSheetsSyncStatus: 'synced' | 'pending';
  sheetsRowId?: string;
  // Guest-specific fields
  purpose?: string;
  address?: string;
  phone?: string;
}

export type ScreenView = 'home' | 'staff-attendance' | 'guest-book' | 'success' | 'connection-status' | 'qr-scanner';

export interface QRPayload {
  type: 'staff' | 'guest';
  id?: string;
  name: string;
  roleOrAffiliation: string;
  nip?: string;
  phone?: string;
  purpose?: string;
  village?: string;
  issuedAt?: string;
}

export interface KioskSettings {
  villageName: string;
  districtName: string;
  regencyName: string;
  googleSheetsId: string;
  googleSheetsName: string;
  autoSyncIntervalMinutes: number;
  soundEffects: boolean;
  gpsValidation: boolean;
  officeLat: number;
  officeLng: number;
}
