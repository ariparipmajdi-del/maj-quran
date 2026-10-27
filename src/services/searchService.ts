import { quranApi } from './quranApi';
import { SurahItem, AyatItem } from '../types/quran';

export interface SearchResultItem {
  type: 'surah' | 'ayah';
  surahNumber: number;
  surahName: string;
  surahArabic: string;
  ayahNumber?: number;
  arabicText?: string;
  latinText?: string;
  translation?: string;
  matchHighlight?: string;
}

// Arabic diacritics / tashkeel stripper for flexible Arabic searching
export function stripArabicTashkeel(text: string): string {
  return text.replace(/[\u064B-\u0652\u0670\u06D6-\u06ED]/g, '');
}

export const searchService = {
  /**
   * Search surah by name, meaning, or number
   */
  searchSurahs(query: string, allSurahs: SurahItem[]): SearchResultItem[] {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const num = parseInt(q, 10);
    const results: SearchResultItem[] = [];

    // Number match
    if (!isNaN(num) && num >= 1 && num <= 114) {
      const match = allSurahs.find((s) => s.nomor === num);
      if (match) {
        results.push({
          type: 'surah',
          surahNumber: match.nomor,
          surahName: match.namaLatin,
          surahArabic: match.nama,
          translation: `Surat ke-${match.nomor} · ${match.arti} · ${match.jumlahAyat} Ayat`,
        });
      }
    }

    // Name / Meaning / Arabic match
    const cleanQ = stripArabicTashkeel(q);

    allSurahs.forEach((s) => {
      if (results.some((r) => r.surahNumber === s.nomor)) return;

      const latinMatch = s.namaLatin.toLowerCase().includes(q);
      const artiMatch = s.arti.toLowerCase().includes(q);
      const arabicClean = stripArabicTashkeel(s.nama);
      const arabicMatch = arabicClean.includes(cleanQ);

      if (latinMatch || artiMatch || arabicMatch) {
        results.push({
          type: 'surah',
          surahNumber: s.nomor,
          surahName: s.namaLatin,
          surahArabic: s.nama,
          translation: `Surat ke-${s.nomor} · ${s.arti} · ${s.jumlahAyat} Ayat`,
        });
      }
    });

    return results;
  },

  /**
   * Parse reference queries like "2:255", "QS 2:255", "Al-Baqarah 255"
   */
  parseReference(query: string, allSurahs: SurahItem[]): { surahNumber: number; ayahNumber: number } | null {
    const cleaned = query.trim().toLowerCase().replace(/^qs\.?\s*/i, '').replace(/^surat\s*/i, '');

    // Pattern 1: "2:255" or "2 255" or "2 ayat 255"
    const digitMatch = cleaned.match(/^(\d{1,3})(?::|\s+|(?:\s+ayat\s+))(\d{1,3})$/i);
    if (digitMatch) {
      const surahNum = parseInt(digitMatch[1], 10);
      const ayahNum = parseInt(digitMatch[2], 10);
      if (surahNum >= 1 && surahNum <= 114) {
        return { surahNumber: surahNum, ayahNumber: ayahNum };
      }
    }

    // Pattern 2: "al baqarah 255" or "yasin 12"
    const nameMatch = cleaned.match(/^(.+?)(?::|\s+|(?:\s+ayat\s+))(\d{1,3})$/i);
    if (nameMatch) {
      const surahNamePart = nameMatch[1].trim();
      const ayahNum = parseInt(nameMatch[2], 10);
      const found = allSurahs.find((s) =>
        s.namaLatin.toLowerCase().replace(/['-]/g, '').includes(surahNamePart.replace(/['-]/g, ''))
      );
      if (found) {
        return { surahNumber: found.nomor, ayahNumber: ayahNum };
      }
    }

    return null;
  },

  /**
   * Search through loaded / cached verses for keywords
   */
  searchVersesInLoadedSurah(
    surahDetail: { nomor: number; namaLatin: string; nama: string; ayat: AyatItem[] },
    query: string
  ): SearchResultItem[] {
    const q = query.trim().toLowerCase();
    const cleanQ = stripArabicTashkeel(q);
    const results: SearchResultItem[] = [];

    surahDetail.ayat.forEach((ayah) => {
      const indoMatch = ayah.teksIndonesia.toLowerCase().includes(q);
      const latinMatch = ayah.teksLatin.toLowerCase().includes(q);
      const arabClean = stripArabicTashkeel(ayah.teksArab);
      const arabMatch = arabClean.includes(cleanQ);

      if (indoMatch || latinMatch || arabMatch) {
        results.push({
          type: 'ayah',
          surahNumber: surahDetail.nomor,
          surahName: surahDetail.namaLatin,
          surahArabic: surahDetail.nama,
          ayahNumber: ayah.nomorAyat,
          arabicText: ayah.teksArab,
          latinText: ayah.teksLatin,
          translation: ayah.teksIndonesia,
        });
      }
    });

    return results;
  },
};
