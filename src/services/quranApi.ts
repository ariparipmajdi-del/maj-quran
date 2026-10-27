import APP_CONFIG from '../config/appConfig';
import { persistence } from '../storage/persistence';
import { SurahItem, SurahDetail, SurahTafsir, PrayerScheduleItem } from '../types/quran';

// In-memory runtime cache for blazing fast navigation
const memoryCache = {
  surahs: null as SurahItem[] | null,
  surahDetails: new Map<number, SurahDetail>(),
  tafsir: new Map<number, SurahTafsir>(),
  provinces: null as string[] | null,
  cities: new Map<string, string[]>(),
};

const TIMEOUT_MS = 12000;

async function fetchWithRetry(url: string, retries = 2, delay = 1000): Promise<any> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          Accept: 'application/json',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}: ${response.statusText}`);
      }

      const json = await response.json();
      if (json.code !== 200 && json.status !== 'success' && !json.data) {
        throw new Error(json.message || 'Format data dari server tidak valid');
      }

      return json.data;
    } catch (err: any) {
      clearTimeout(timeoutId);
      lastError = err;

      if (attempt < retries) {
        await new Promise((res) => setTimeout(res, delay * (attempt + 1)));
      }
    }
  }

  throw lastError || new Error('Gagal menghubungi server setelah beberapa percobaan');
}

async function postWithRetry(url: string, body: any, retries = 2, delay = 1000): Promise<any> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(body),
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}: ${response.statusText}`);
      }

      const json = await response.json();
      if (json.code !== 200 && json.status !== 'success' && !json.data) {
        throw new Error(json.message || 'Format data dari server tidak valid');
      }

      return json.data;
    } catch (err: any) {
      clearTimeout(timeoutId);
      lastError = err;

      if (attempt < retries) {
        await new Promise((res) => setTimeout(res, delay * (attempt + 1)));
      }
    }
  }

  throw lastError || new Error('Gagal menghubungi server setelah beberapa percobaan');
}

export const quranApi = {
  /**
   * Fetch all 114 Surahs
   */
  async getAllSurahs(): Promise<SurahItem[]> {
    // 1. Check memory cache
    if (memoryCache.surahs && memoryCache.surahs.length === 114) {
      return memoryCache.surahs;
    }

    // 2. Check persistence storage cache (for offline support)
    const stored = persistence.getCachedSurahsList();
    if (stored && stored.length === 114) {
      memoryCache.surahs = stored;
      // Background revalidate if online
      if (navigator.onLine) {
        this.revalidateSurahsInBackground();
      }
      return stored;
    }

    // 3. Network fetch
    try {
      const data: SurahItem[] = await fetchWithRetry(`${APP_CONFIG.apiBaseUrl}/surat`);
      if (Array.isArray(data) && data.length > 0) {
        memoryCache.surahs = data;
        persistence.setCachedSurahsList(data);
        return data;
      }
      throw new Error('Data surat tidak lengkap');
    } catch (error) {
      // If network fails, check if we have any cached data at all
      if (stored && stored.length > 0) {
        return stored;
      }
      throw error;
    }
  },

  async revalidateSurahsInBackground(): Promise<void> {
    try {
      const data: SurahItem[] = await fetchWithRetry(`${APP_CONFIG.apiBaseUrl}/surat`, 1, 2000);
      if (Array.isArray(data) && data.length === 114) {
        memoryCache.surahs = data;
        persistence.setCachedSurahsList(data);
      }
    } catch {
      // Ignore background revalidation errors
    }
  },

  /**
   * Fetch detail of a single Surah with all its verses and audio
   */
  async getSurahDetail(surahNumber: number): Promise<SurahDetail> {
    const num = Number(surahNumber);
    if (isNaN(num) || num < 1 || num > 114) {
      throw new Error(`Nomor surat tidak valid: ${surahNumber}. Harus antara 1 sampai 114.`);
    }

    // 1. Check memory cache
    if (memoryCache.surahDetails.has(num)) {
      return memoryCache.surahDetails.get(num)!;
    }

    // 2. Check persistence storage cache
    const cached = persistence.getCachedSurahDetail(num);
    if (cached && cached.ayat && cached.ayat.length > 0) {
      memoryCache.surahDetails.set(num, cached);
      return cached;
    }

    // 3. Fetch from API
    try {
      const data: SurahDetail = await fetchWithRetry(`${APP_CONFIG.apiBaseUrl}/surat/${num}`);
      if (!data || !data.ayat || !Array.isArray(data.ayat)) {
        throw new Error(`Data ayat untuk surat #${num} tidak ditemukan.`);
      }

      memoryCache.surahDetails.set(num, data);
      persistence.setCachedSurahDetail(num, data);
      return data;
    } catch (error: any) {
      if (cached) {
        return cached;
      }
      throw error;
    }
  },

  /**
   * Fetch official Kemenag Tafsir for a Surah
   */
  async getSurahTafsir(surahNumber: number): Promise<SurahTafsir> {
    const num = Number(surahNumber);
    if (isNaN(num) || num < 1 || num > 114) {
      throw new Error(`Nomor surat tidak valid: ${surahNumber}.`);
    }

    if (memoryCache.tafsir.has(num)) {
      return memoryCache.tafsir.get(num)!;
    }

    const data: SurahTafsir = await fetchWithRetry(`${APP_CONFIG.apiBaseUrl}/tafsir/${num}`);
    if (!data || !data.tafsir) {
      throw new Error(`Data tafsir untuk surat #${num} tidak tersedia.`);
    }

    memoryCache.tafsir.set(num, data);
    return data;
  },

  /**
   * Fetch Indonesian provinces list for prayer times
   */
  async getPrayerProvinces(): Promise<string[]> {
    if (memoryCache.provinces && memoryCache.provinces.length > 0) {
      return memoryCache.provinces;
    }
    const data: string[] = await fetchWithRetry(`${APP_CONFIG.apiBaseUrl}/shalat/provinsi`);
    if (Array.isArray(data)) {
      memoryCache.provinces = data;
      return data;
    }
    return ['DKI Jakarta', 'Jawa Barat', 'Jawa Tengah', 'Jawa Timur', 'Banten', 'D.I. Yogyakarta'];
  },

  /**
   * Fetch cities for a province
   */
  async getPrayerCities(provinsi: string): Promise<string[]> {
    if (memoryCache.cities.has(provinsi)) {
      return memoryCache.cities.get(provinsi)!;
    }
    const data: string[] = await postWithRetry(`${APP_CONFIG.apiBaseUrl}/shalat/kabkota`, { provinsi });
    if (Array.isArray(data)) {
      memoryCache.cities.set(provinsi, data);
      return data;
    }
    return [];
  },

  /**
   * Fetch monthly prayer schedule
   */
  async getPrayerSchedule(
    provinsi: string,
    kabkota: string,
    month: number,
    year: number
  ): Promise<PrayerScheduleItem[]> {
    // 1. Check local cache
    const cached = persistence.getCachedPrayerSchedule(provinsi, kabkota, month, year);
    if (cached && cached.length > 0) {
      // Revalidate in background if online
      if (navigator.onLine) {
        postWithRetry(`${APP_CONFIG.apiBaseUrl}/shalat`, {
          provinsi,
          kabkota,
          bulan: month,
          tahun: year,
        })
          .then((res) => {
            if (res && res.jadwal && Array.isArray(res.jadwal)) {
              persistence.setCachedPrayerSchedule(provinsi, kabkota, month, year, res.jadwal);
            }
          })
          .catch(() => {});
      }
      return cached;
    }

    // 2. Fetch from network
    try {
      const res = await postWithRetry(`${APP_CONFIG.apiBaseUrl}/shalat`, {
        provinsi,
        kabkota,
        bulan: month,
        tahun: year,
      });

      if (res && res.jadwal && Array.isArray(res.jadwal)) {
        persistence.setCachedPrayerSchedule(provinsi, kabkota, month, year, res.jadwal);
        return res.jadwal;
      }
      throw new Error('Jadwal shalat tidak valid dari server');
    } catch (err: any) {
      if (cached) return cached;
      throw err;
    }
  },
};
