import React, { useEffect, useState } from 'react';
import { X, BookOpen, Loader2, AlertCircle } from 'lucide-react';
import { quranApi } from '../../services/quranApi';
import { SurahTafsir, TafsirItem } from '../../types/quran';

interface TafsirModalProps {
  isOpen: boolean;
  surahNumber: number;
  surahName: string;
  initialAyahNumber?: number | null;
  onClose: () => void;
  onNavigateToAyah?: (ayahNumber: number) => void;
}

export const TafsirModal: React.FC<TafsirModalProps> = ({
  isOpen,
  surahNumber,
  surahName,
  initialAyahNumber,
  onClose,
  onNavigateToAyah,
}) => {
  const [tafsirData, setTafsirData] = useState<SurahTafsir | null>(null);
  const [selectedAyah, setSelectedAyah] = useState<number>(initialAyahNumber || 1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialAyahNumber) {
      setSelectedAyah(initialAyahNumber);
    }
  }, [initialAyahNumber]);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    quranApi
      .getSurahTafsir(surahNumber)
      .then((data) => {
        if (isMounted) {
          setTafsirData(data);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Gagal memuat tafsir surat ini.');
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, surahNumber]);

  if (!isOpen) return null;

  const currentTafsirItem: TafsirItem | undefined = tafsirData?.tafsir?.find(
    (t) => t.ayat === selectedAyah
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="tafsir-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in"
    >
      <div className="relative w-full max-w-2xl max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-[#E4E9F0] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E4E9F0] bg-[#FDFBF5]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#EBF3FE] text-[#0645A8] flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 id="tafsir-modal-title" className="text-base font-bold text-[#061A35] leading-tight">
                Tafsir Kemenag RI — QS. {surahName}
              </h2>
              <p className="text-xs text-[#5E6B7C]">
                Sumber Resmi: Kementerian Agama Republik Indonesia
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition"
            aria-label="Tutup tafsir"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Ayah selector bar */}
        {tafsirData && tafsirData.tafsir && (
          <div className="px-6 py-2.5 border-b border-[#E4E9F0] bg-white flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-xs font-semibold text-[#5E6B7C] shrink-0">Pilih Ayat:</span>
            <div className="flex items-center gap-1.5">
              {tafsirData.tafsir.map((t) => (
                <button
                  key={t.ayat}
                  onClick={() => setSelectedAyah(t.ayat)}
                  className={`min-w-[32px] h-8 px-2 rounded-lg text-xs font-bold transition tabular-nums shrink-0 ${
                    selectedAyah === t.ayat
                      ? 'bg-[#0756C9] text-white shadow-xs'
                      : 'bg-stone-100 text-[#5E6B7C] hover:bg-stone-200'
                  }`}
                >
                  {t.ayat}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 text-[#061A35] text-sm md:text-base leading-relaxed">
          {isLoading && (
            <div className="py-16 flex flex-col items-center justify-center text-[#5E6B7C] gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-[#0756C9]" />
              <p className="text-sm font-medium">Memuat tafsir resmi Kemenag RI...</p>
            </div>
          )}

          {error && (
            <div className="py-12 flex flex-col items-center justify-center text-center p-4">
              <AlertCircle className="w-10 h-10 text-amber-600 mb-2" />
              <p className="text-[#061A35] font-semibold">{error}</p>
              <p className="text-xs text-[#5E6B7C] mt-1">
                Pastikan peramban Anda terhubung ke internet.
              </p>
            </div>
          )}

          {!isLoading && !error && currentTafsirItem && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#E4E9F0]">
                <span className="font-bold text-[#0645A8] text-sm">
                  Ayat ke-{selectedAyah}
                </span>
                {onNavigateToAyah && (
                  <button
                    onClick={() => {
                      onNavigateToAyah(selectedAyah);
                      onClose();
                    }}
                    className="text-xs text-[#0756C9] hover:underline font-semibold"
                  >
                    Buka Ayat di Pembaca
                  </button>
                )}
              </div>

              <div className="whitespace-pre-line text-[#061A35]/90 leading-relaxed space-y-3 font-normal">
                {currentTafsirItem.teks}
              </div>
            </div>
          )}

          {!isLoading && !error && !currentTafsirItem && tafsirData && (
            <p className="text-center text-[#5E6B7C] py-10">
              Tafsir untuk ayat ini belum tersedia dalam basis data Kemenag.
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#E4E9F0] bg-[#FDFBF5] flex items-center justify-between">
          <p className="text-xs text-[#5E6B7C]">
            Tafsir Al-Qur'an Kementerian Agama RI
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-100 rounded-lg transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
