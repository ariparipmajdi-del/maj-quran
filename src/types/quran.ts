export interface SurahItem {
  nomor: number;
  nama: string;
  namaLatin: string;
  jumlahAyat: number;
  tempatTurun: string;
  arti: string;
  deskripsi: string;
  audioFull: Record<string, string>;
}

export interface AyatItem {
  nomorAyat: number;
  teksArab: string;
  teksLatin: string;
  teksIndonesia: string;
  audio: Record<string, string>;
}

export interface SurahNavigation {
  nomor: number;
  nama: string;
  namaLatin: string;
  jumlahAyat: number;
}

export interface SurahDetail extends SurahItem {
  ayat: AyatItem[];
  suratSebelumnya: false | SurahNavigation;
  suratSelanjutnya: false | SurahNavigation;
}

export interface TafsirItem {
  ayat: number;
  teks: string;
}

export interface SurahTafsir {
  nomor: number;
  nama: string;
  namaLatin: string;
  jumlahAyat: number;
  tempatTurun: string;
  arti: string;
  deskripsi: string;
  tafsir: TafsirItem[];
}

export interface Bookmark {
  id: string; // e.g. "surah-1-ayah-1"
  surahNumber: number;
  surahName: string;
  surahArabic: string;
  ayahNumber: number;
  ayahArabic: string;
  ayahTranslation: string;
  createdAt: string;
}

export interface Note {
  id: string;
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  content: string;
  updatedAt: string;
}

export interface LastRead {
  surahNumber: number;
  surahName: string;
  surahArabic: string;
  ayahNumber: number;
  totalAyat: number;
  timestamp: string;
}

export interface ReadingProgress {
  dailyTargetAyat: number;
  ayatReadToday: number;
  lastDate: string;
  surahsCompleted: number[];
}

export interface UserSettings {
  arabicFont: 'amiri' | 'scheherazade' | 'lateef';
  arabicFontSize: 'sm' | 'md' | 'lg' | 'xl';
  showTranslation: boolean;
  showTransliteration: boolean;
  autoScrollSpeed: number; // 1 to 5
  preferredQari: string; // '01' to '06'
}

export type PrayerKey = 'imsak' | 'subuh' | 'terbit' | 'dzuhur' | 'ashar' | 'maghrib' | 'isya';

export interface PrayerScheduleItem {
  tanggal: number;
  tanggal_lengkap: string; // "YYYY-MM-DD"
  hari: string;
  imsak: string;
  subuh: string;
  terbit: string;
  dhuha: string;
  dzuhur: string;
  ashar: string;
  maghrib: string;
  isya: string;
}

export interface PrayerSettings {
  isEnabled: boolean;
  volume: number; // 0 to 1
  reminderType: 'audio_and_notification' | 'audio_only' | 'notification_only';
  provinsi: string;
  kabkota: string;
  enabledPrayers: Record<PrayerKey, boolean>;
}

export interface QariInfo {
  id: string;
  name: string;
  title: string;
}
