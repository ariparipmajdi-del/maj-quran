import { Bookmark, Note, LastRead, ReadingProgress, UserSettings, SurahItem, SurahDetail, PrayerSettings, PrayerScheduleItem } from '../types/quran';
import APP_CONFIG from '../config/appConfig';

const STORAGE_KEYS = {
  BOOKMARKS: 'qi_bookmarks_v1',
  NOTES: 'qi_notes_v1',
  LAST_READ: 'qi_last_read_v1',
  PROGRESS: 'qi_reading_progress_v1',
  SETTINGS: 'qi_settings_v1',
  PRAYER_SETTINGS: 'qi_prayer_settings_v1',
  TRIGGERED_PRAYERS: 'qi_triggered_prayers_v1',
  PRAYER_SCHEDULE_CACHE: 'qi_prayer_schedule_cache_',
  SURAH_CACHE_PREFIX: 'qi_surah_cache_',
  SURAHS_LIST_CACHE: 'qi_surahs_list_cache_v1',
};

const DEFAULT_SETTINGS: UserSettings = {
  arabicFont: 'amiri',
  arabicFontSize: 'md',
  showTranslation: true,
  showTransliteration: true,
  autoScrollSpeed: 2,
  preferredQari: '05', // Misyari Rasyid Al-Afasi
};

const DEFAULT_PRAYER_SETTINGS: PrayerSettings = APP_CONFIG.defaultPrayerSettings;

function getTodayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export const persistence = {
  // Settings
  getSettings(): UserSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (data) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
      }
    } catch (e) {
      console.warn('Failed to read settings from storage', e);
    }
    return DEFAULT_SETTINGS;
  },

  saveSettings(settings: UserSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save settings to storage', e);
    }
  },

  // Last Read
  getLastRead(): LastRead | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LAST_READ);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.warn('Failed to read last read position', e);
      return null;
    }
  },

  saveLastRead(lastRead: LastRead): void {
    try {
      localStorage.setItem(STORAGE_KEYS.LAST_READ, JSON.stringify(lastRead));
    } catch (e) {
      console.warn('Failed to save last read position', e);
    }
  },

  // Bookmarks
  getBookmarks(): Bookmark[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.warn('Failed to get bookmarks', e);
      return [];
    }
  },

  addBookmark(bookmark: Bookmark): Bookmark[] {
    const list = this.getBookmarks().filter((b) => b.id !== bookmark.id);
    const updated = [bookmark, ...list];
    try {
      localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save bookmark', e);
    }
    return updated;
  },

  removeBookmark(id: string): Bookmark[] {
    const list = this.getBookmarks().filter((b) => b.id !== id);
    try {
      localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(list));
    } catch (e) {
      console.warn('Failed to remove bookmark', e);
    }
    return list;
  },

  isBookmarked(surahNumber: number, ayahNumber: number): boolean {
    const id = `surah-${surahNumber}-ayah-${ayahNumber}`;
    return this.getBookmarks().some((b) => b.id === id);
  },

  // Notes
  getNotes(): Note[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.NOTES);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.warn('Failed to get notes', e);
      return [];
    }
  },

  getNote(surahNumber: number, ayahNumber: number): Note | undefined {
    const id = `note-${surahNumber}-${ayahNumber}`;
    return this.getNotes().find((n) => n.id === id);
  },

  saveNote(surahNumber: number, surahName: string, ayahNumber: number, content: string): Note[] {
    const id = `note-${surahNumber}-${ayahNumber}`;
    const trimmed = content.trim();
    let current = this.getNotes();

    if (!trimmed) {
      // Remove empty note
      current = current.filter((n) => n.id !== id);
    } else {
      const index = current.findIndex((n) => n.id === id);
      const updatedNote: Note = {
        id,
        surahNumber,
        surahName,
        ayahNumber,
        content: trimmed,
        updatedAt: new Date().toISOString(),
      };
      if (index >= 0) {
        current[index] = updatedNote;
      } else {
        current.unshift(updatedNote);
      }
    }

    try {
      localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(current));
    } catch (e) {
      console.warn('Failed to save note', e);
    }
    return current;
  },

  deleteNote(id: string): Note[] {
    const list = this.getNotes().filter((n) => n.id !== id);
    try {
      localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(list));
    } catch (e) {
      console.warn('Failed to delete note', e);
    }
    return list;
  },

  // Reading Progress & Tilawah Target
  getProgress(): ReadingProgress {
    const today = getTodayString();
    const defaultProgress: ReadingProgress = {
      dailyTargetAyat: 10,
      ayatReadToday: 0,
      lastDate: today,
      surahsCompleted: [],
    };

    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROGRESS);
      if (data) {
        const parsed: ReadingProgress = JSON.parse(data);
        if (parsed.lastDate !== today) {
          // Reset daily counter for the new day
          parsed.ayatReadToday = 0;
          parsed.lastDate = today;
          localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(parsed));
        }
        return parsed;
      }
    } catch (e) {
      console.warn('Failed to read reading progress', e);
    }
    return defaultProgress;
  },

  recordAyatRead(count: number = 1): ReadingProgress {
    const prog = this.getProgress();
    prog.ayatReadToday += count;
    try {
      localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(prog));
    } catch (e) {
      console.warn('Failed to update reading progress', e);
    }
    return prog;
  },

  setDailyTarget(target: number): ReadingProgress {
    const prog = this.getProgress();
    prog.dailyTargetAyat = Math.max(1, target);
    try {
      localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(prog));
    } catch (e) {
      console.warn('Failed to update daily target', e);
    }
    return prog;
  },

  // Offline caching for Surahs
  getCachedSurahsList(): SurahItem[] | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SURAHS_LIST_CACHE);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  setCachedSurahsList(surahs: SurahItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SURAHS_LIST_CACHE, JSON.stringify(surahs));
    } catch (e) {
      console.warn('Storage limit reached for surahs list cache', e);
    }
  },

  getCachedSurahDetail(surahNumber: number): SurahDetail | null {
    try {
      const data = localStorage.getItem(`${STORAGE_KEYS.SURAH_CACHE_PREFIX}${surahNumber}`);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  setCachedSurahDetail(surahNumber: number, detail: SurahDetail): void {
    try {
      localStorage.setItem(`${STORAGE_KEYS.SURAH_CACHE_PREFIX}${surahNumber}`, JSON.stringify(detail));
    } catch (e) {
      // Clear oldest caches if quota exceeded
      console.warn('Storage quota exceeded, caching skipped for surah detail', e);
    }
  },

  // Prayer Time Settings
  getPrayerSettings(): PrayerSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PRAYER_SETTINGS);
      if (data) {
        return { ...DEFAULT_PRAYER_SETTINGS, ...JSON.parse(data) };
      }
    } catch (e) {
      console.warn('Failed to read prayer settings', e);
    }
    return DEFAULT_PRAYER_SETTINGS;
  },

  savePrayerSettings(settings: PrayerSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PRAYER_SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save prayer settings', e);
    }
  },

  // Deduplication for audio triggers: ensures maximum 1 trigger per prayer event per day
  isPrayerTriggeredToday(prayerKey: string): boolean {
    const today = getTodayString();
    const compoundKey = `${today}_${prayerKey}`;
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.TRIGGERED_PRAYERS);
      if (raw) {
        const data: Record<string, number> = JSON.parse(raw);
        return !!data[compoundKey];
      }
    } catch (e) {
      console.warn('Failed to check prayer trigger status', e);
    }
    return false;
  },

  markPrayerTriggered(prayerKey: string): void {
    const today = getTodayString();
    const compoundKey = `${today}_${prayerKey}`;
    try {
      let data: Record<string, number> = {};
      const raw = localStorage.getItem(STORAGE_KEYS.TRIGGERED_PRAYERS);
      if (raw) {
        data = JSON.parse(raw);
      }
      data[compoundKey] = Date.now();

      // Clean up records older than 2 days to prevent storage bloating
      const twoDaysAgo = Date.now() - 2 * 24 * 60 * 60 * 1000;
      for (const k of Object.keys(data)) {
        if (data[k] < twoDaysAgo) {
          delete data[k];
        }
      }

      localStorage.setItem(STORAGE_KEYS.TRIGGERED_PRAYERS, JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to mark prayer as triggered', e);
    }
  },

  // Prayer monthly schedule cache
  getCachedPrayerSchedule(provinsi: string, kabkota: string, month: number, year: number): PrayerScheduleItem[] | null {
    const cacheKey = `${STORAGE_KEYS.PRAYER_SCHEDULE_CACHE}${provinsi}_${kabkota}_${month}_${year}`;
    try {
      const data = localStorage.getItem(cacheKey);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  setCachedPrayerSchedule(provinsi: string, kabkota: string, month: number, year: number, schedule: PrayerScheduleItem[]): void {
    const cacheKey = `${STORAGE_KEYS.PRAYER_SCHEDULE_CACHE}${provinsi}_${kabkota}_${month}_${year}`;
    try {
      localStorage.setItem(cacheKey, JSON.stringify(schedule));
    } catch (e) {
      console.warn('Failed to cache prayer schedule', e);
    }
  },
};
