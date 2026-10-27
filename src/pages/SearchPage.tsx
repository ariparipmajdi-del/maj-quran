import React, { useState, useEffect, useTransition } from 'react';
import { quranApi } from '../services/quranApi';
import { searchService, SearchResultItem } from '../services/searchService';
import { SurahItem } from '../types/quran';
import { Search, ArrowRight, Loader2 } from 'lucide-react';

interface SearchPageProps {
  onOpenAyah: (surahNumber: number, ayahNumber?: number) => void;
}

export const SearchPage: React.FC<SearchPageProps> = ({ onOpenAyah }) => {
  const [query, setQuery] = useState<string>('');
  const [surahsList, setSurahsList] = useState<SurahItem[]>([]);
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    quranApi.getAllSurahs().then(setSurahsList).catch(() => {});
  }, []);

  // Debounced search effect
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setHasSearched(false);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      // 1. Check reference format (e.g. 2:255 or Al-Baqarah 255)
      const refMatch = searchService.parseReference(trimmed, surahsList);
      let combinedResults: SearchResultItem[] = [];

      if (refMatch) {
        try {
          const detail = await quranApi.getSurahDetail(refMatch.surahNumber);
          const targetAyah = detail.ayat.find((a) => a.nomorAyat === refMatch.ayahNumber);
          if (targetAyah) {
            combinedResults.push({
              type: 'ayah',
              surahNumber: detail.nomor,
              surahName: detail.namaLatin,
              surahArabic: detail.nama,
              ayahNumber: targetAyah.nomorAyat,
              arabicText: targetAyah.teksArab,
              latinText: targetAyah.teksLatin,
              translation: targetAyah.teksIndonesia,
            });
          }
        } catch {
          // Fall back to general search
        }
      }

      // 2. Surah name & meaning matches
      const surahMatches = searchService.searchSurahs(trimmed, surahsList);
      combinedResults = [...combinedResults, ...surahMatches];

      // 3. Search inside popular / cached surahs for verse keywords
      const sampleSurahIds = [1, 2, 18, 36, 55, 67, 112, 113, 114];
      try {
        const searchPromises = sampleSurahIds.map((id) =>
          quranApi.getSurahDetail(id).catch(() => null)
        );
        const loadedSurahs = await Promise.all(searchPromises);

        loadedSurahs.forEach((s) => {
          if (s) {
            const verseMatches = searchService.searchVersesInLoadedSurah(s, trimmed);
            // Avoid duplicates
            verseMatches.forEach((vm) => {
              if (
                !combinedResults.some(
                  (cr) => cr.surahNumber === vm.surahNumber && cr.ayahNumber === vm.ayahNumber
                )
              ) {
                combinedResults.push(vm);
              }
            });
          }
        });
      } catch {
        // Continue with whatever results we have
      }

      startTransition(() => {
        setResults(combinedResults);
        setIsSearching(false);
        setHasSearched(true);
      });
    }, 350);

    return () => clearTimeout(timer);
  }, [query, surahsList]);

  const quickQueries = [
    { label: 'Ayat Kursi (2:255)', q: '2:255' },
    { label: 'Surat Al-Kahf', q: 'Al-Kahf' },
    { label: 'Surat Yasin', q: 'Yasin' },
    { label: 'Keesaan Allah', q: 'Esa' },
    { label: 'Sabar dan Shalat', q: 'sabar' },
    { label: 'Pengampun', q: 'pengampun' },
  ];

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-[#061A35] tracking-tight">
          Pencarian Pintar Al-Qur’an
        </h1>
        <p className="text-sm text-stone-500 mt-1">
          Cari nama surat, nomor surat:ayat (misal <code className="text-[#0756C9] font-mono">2:255</code>), atau kata dalam terjemahan.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
        <input
          type="text"
          aria-label="Ketik pencarian ayat atau surat"
          placeholder="Ketik nama surat, referensi ayat (2:255), atau kata kunci terjemahan..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-12 pr-12 py-3.5 rounded-2xl border border-stone-300 bg-white text-base text-stone-900 focus:border-[#0756C9] focus:ring-3 focus:ring-[#0756C9]/15 focus:outline-none placeholder:text-stone-400 shadow-sm transition"
        />
        {isSearching && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <Loader2 className="w-5 h-5 animate-spin text-[#0756C9]" />
          </div>
        )}
      </div>

      {/* Suggested Quick Queries */}
      <div className="flex items-center gap-2 flex-wrap text-xs">
        <span className="text-stone-400 font-medium">Contoh pencarian:</span>
        {quickQueries.map((item) => (
          <button
            key={item.label}
            onClick={() => setQuery(item.q)}
            className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-[#EBF3FE] hover:text-[#0645A8] text-stone-600 font-medium transition"
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Search Results Area */}
      {hasSearched && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-stone-500 border-b border-stone-200 pb-2">
            <span>
              Ditemukan <strong className="text-[#061A35] font-bold">{results.length}</strong> hasil pencarian
            </span>
            <span className="text-stone-400">
              Mencakup 114 nama surat & indeks ayat terjemahan
            </span>
          </div>

          {results.length === 0 && !isSearching && (
            <div className="py-16 text-center space-y-3 bg-white rounded-3xl border border-stone-200 p-8">
              <Search className="w-10 h-10 text-stone-300 mx-auto" />
              <h3 className="text-base font-bold text-[#061A35]">Tidak Ada Hasil</h3>
              <p className="text-sm text-stone-500 max-w-sm mx-auto">
                Tidak ditemukan kecocokan untuk "{query}". Coba periksa ejaan atau gunakan format nomor surat (contoh: <code className="font-mono text-stone-800">2:255</code> atau nama surat).
              </p>
            </div>
          )}

          <div className="space-y-3">
            {results.map((item, idx) => (
              <div
                key={`${item.type}-${item.surahNumber}-${item.ayahNumber || 'all'}-${idx}`}
                onClick={() => onOpenAyah(item.surahNumber, item.ayahNumber)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onOpenAyah(item.surahNumber, item.ayahNumber);
                }}
                className="p-5 bg-white rounded-2xl border border-stone-200 hover:border-[#0756C9]/40 hover:shadow-md transition text-left cursor-pointer group space-y-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0756C9]"
              >
                {/* Header */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#EBF3FE] text-[#0645A8] font-bold text-xs">
                      {item.surahNumber}
                    </span>
                    <span className="font-bold text-sm text-[#061A35] group-hover:text-[#0756C9] transition">
                      QS. {item.surahName} {item.ayahNumber ? `: Ayat ${item.ayahNumber}` : '(Seluruh Surat)'}
                    </span>
                  </div>

                  <span className="font-arabic-amiri text-xl font-bold text-[#0645A8]">
                    {item.surahArabic}
                  </span>
                </div>

                {/* Arabic text if ayah */}
                {item.arabicText && (
                  <p className="font-arabic-amiri text-xl text-[#061A35] text-right leading-loose" dir="rtl">
                    {item.arabicText}
                  </p>
                )}

                {/* Translation excerpt */}
                {item.translation && (
                  <p className="text-sm text-stone-600 leading-relaxed line-clamp-3">
                    {item.translation}
                  </p>
                )}

                {/* Footer link */}
                <div className="pt-1 flex items-center justify-end text-xs font-semibold text-[#0756C9] group-hover:text-[#0645A8] gap-1">
                  <span>Buka di Pembaca</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
