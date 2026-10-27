import React, { useState, useEffect, useMemo } from 'react';
import { quranApi } from '../services/quranApi';
import { SurahItem } from '../types/quran';
import { SurahCard } from '../components/quran/SurahCard';
import { Search, Loader2, AlertCircle, RefreshCw } from 'lucide-react';

interface SurahListPageProps {
  onSelectSurah: (surahNumber: number) => void;
}

export const SurahListPage: React.FC<SurahListPageProps> = ({ onSelectSurah }) => {
  const [surahs, setSurahs] = useState<SurahItem[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [placeFilter, setPlaceFilter] = useState<'all' | 'Mekah' | 'Madinah'>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadSurahs = () => {
    setIsLoading(true);
    setError(null);
    quranApi
      .getAllSurahs()
      .then((data) => {
        setSurahs(data);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Gagal memuat daftar 114 surat. Silakan coba lagi.');
        setIsLoading(false);
      });
  };

  useEffect(() => {
    loadSurahs();
  }, []);

  const filteredSurahs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return surahs.filter((s) => {
      // Place filter
      if (placeFilter !== 'all' && s.tempatTurun !== placeFilter) {
        return false;
      }

      if (!q) return true;

      // Number match
      if (s.nomor.toString() === q) return true;

      // Latin name match
      if (s.namaLatin.toLowerCase().includes(q)) return true;

      // Meaning match
      if (s.arti.toLowerCase().includes(q)) return true;

      // Arabic name match
      if (s.nama.includes(q)) return true;

      return false;
    });
  }, [surahs, searchQuery, placeFilter]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Search Bar */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#061A35] tracking-tight">
            Daftar 114 Surat
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Telusuri seluruh surat dalam kitab suci Al-Qur’an
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              aria-label="Cari surat berdasarkan nama latin, nomor, atau arti"
              placeholder="Cari surat (misal: Al-Kahf, Yasin, 18, Pembukaan)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 bg-white text-sm text-[#061A35] focus:border-[#0756C9] focus:ring-2 focus:ring-[#0756C9]/20 focus:outline-none placeholder:text-stone-400 shadow-2xs transition"
            />
          </div>

          {/* Place of revelation filter tabs */}
          <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-xl shrink-0 self-start sm:self-auto">
            <button
              onClick={() => setPlaceFilter('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition whitespace-nowrap ${
                placeFilter === 'all'
                  ? 'bg-white text-[#0645A8] shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Semua (114)
            </button>
            <button
              onClick={() => setPlaceFilter('Mekah')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition whitespace-nowrap ${
                placeFilter === 'Mekah'
                  ? 'bg-white text-[#0645A8] shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Makkiyyah
            </button>
            <button
              onClick={() => setPlaceFilter('Madinah')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition whitespace-nowrap ${
                placeFilter === 'Madinah'
                  ? 'bg-white text-[#0645A8] shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Madaniyyah
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="py-24 flex flex-col items-center justify-center gap-3 text-stone-500">
          <Loader2 className="w-9 h-9 animate-spin text-[#0756C9]" />
          <p className="text-sm font-semibold">Memuat 114 surat dari API Qur'an...</p>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="p-8 rounded-3xl bg-red-50 border border-red-200 text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-red-600 mx-auto" />
          <div>
            <h3 className="text-base font-bold text-red-950">Gagal Memuat Surat</h3>
            <p className="text-sm text-red-700 mt-1 max-w-md mx-auto">{error}</p>
          </div>
          <button
            onClick={loadSurahs}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0756C9] text-white text-xs font-semibold hover:bg-[#0645A8] transition shadow-xs active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Coba Lagi</span>
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && filteredSurahs.length === 0 && (
        <div className="py-20 text-center space-y-3 bg-white rounded-3xl border border-stone-200 p-8">
          <Search className="w-10 h-10 text-stone-300 mx-auto" />
          <h3 className="text-base font-bold text-[#061A35]">Surat Tidak Ditemukan</h3>
          <p className="text-sm text-stone-500 max-w-xs mx-auto">
            Tidak ada surat yang cocok dengan kata kunci "{searchQuery}".
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setPlaceFilter('all');
            }}
            className="text-xs font-semibold text-[#0756C9] hover:underline"
          >
            Reset Pencarian
          </button>
        </div>
      )}

      {/* Grid of Surahs */}
      {!isLoading && !error && filteredSurahs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredSurahs.map((surah) => (
            <SurahCard
              key={surah.nomor}
              surah={surah}
              onClick={onSelectSurah}
            />
          ))}
        </div>
      )}
    </div>
  );
};
