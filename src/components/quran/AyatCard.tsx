import React from 'react';
import { AyatItem } from '../../types/quran';
import { Play, Pause, Bookmark, BookOpen, Share2, Copy, FileText, Check } from 'lucide-react';

interface AyatCardProps {
  surahNumber: number;
  surahName: string;
  ayat: AyatItem;
  arabicFontClass: string;
  arabicSizeClass: string;
  showTranslation: boolean;
  showTransliteration: boolean;
  isBookmarked: boolean;
  hasNote: boolean;
  isPlaying: boolean;
  onPlay: (ayahNumber: number) => void;
  onToggleBookmark: (ayah: AyatItem) => void;
  onOpenNote: (ayah: AyatItem) => void;
  onOpenTafsir: (ayahNumber: number) => void;
  onShare: (ayah: AyatItem) => void;
  onCopy: (ayah: AyatItem) => void;
  copiedId: number | null;
}

export const AyatCard: React.FC<AyatCardProps> = ({
  surahNumber,
  surahName,
  ayat,
  arabicFontClass,
  arabicSizeClass,
  showTranslation,
  showTransliteration,
  isBookmarked,
  hasNote,
  isPlaying,
  onPlay,
  onToggleBookmark,
  onOpenNote,
  onOpenTafsir,
  onShare,
  onCopy,
  copiedId,
}) => {
  const isCopied = copiedId === ayat.nomorAyat;

  return (
    <article
      id={`ayah-${ayat.nomorAyat}`}
      className={`relative p-5 md:p-6 rounded-2xl border transition-all duration-200 ${
        isPlaying
          ? 'bg-[#EBF3FE]/70 border-[#0756C9] shadow-md ring-1 ring-[#0756C9]/30'
          : 'bg-white border-[#E4E9F0] hover:border-stone-300 shadow-2xs'
      }`}
    >
      {/* Top action toolbar for this verse */}
      <div className="flex items-center justify-between gap-2 pb-4 border-b border-[#E4E9F0]/80 text-[#5E6B7C]">
        {/* Ayah Reference Badge */}
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#EBF3FE] text-[#0645A8] font-bold text-xs tabular-nums">
            {ayat.nomorAyat}
          </span>
          <span className="text-xs text-[#5E6B7C] font-semibold">
            QS. {surahName} : {ayat.nomorAyat}
          </span>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1">
          {/* Audio Play/Pause */}
          <button
            onClick={() => onPlay(ayat.nomorAyat)}
            className={`p-2 rounded-lg transition active:scale-95 ${
              isPlaying
                ? 'bg-[#0756C9] text-white shadow-xs'
                : 'text-[#5E6B7C] hover:text-[#0756C9] hover:bg-[#EBF3FE]'
            }`}
            title={isPlaying ? 'Jeda Murottal' : 'Putar Audio Ayat'}
            aria-label={`Putar audio ayat ${ayat.nomorAyat}`}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 translate-x-0.2" />}
          </button>

          {/* Bookmark */}
          <button
            onClick={() => onToggleBookmark(ayat)}
            className={`p-2 rounded-lg transition active:scale-95 ${
              isBookmarked
                ? 'text-[#0756C9] bg-[#EBF3FE]'
                : 'text-[#5E6B7C] hover:text-[#0756C9] hover:bg-[#EBF3FE]'
            }`}
            title={isBookmarked ? 'Hapus dari bookmark' : 'Simpan bookmark'}
            aria-label={`Bookmark ayat ${ayat.nomorAyat}`}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-[#0756C9]' : ''}`} />
          </button>

          {/* Note */}
          <button
            onClick={() => onOpenNote(ayat)}
            className={`p-2 rounded-lg transition relative active:scale-95 ${
              hasNote
                ? 'text-[#0645A8] bg-[#EBF3FE]'
                : 'text-[#5E6B7C] hover:text-[#0645A8] hover:bg-stone-100'
            }`}
            title="Catatan pribadi"
            aria-label={`Buka catatan ayat ${ayat.nomorAyat}`}
          >
            <FileText className="w-4 h-4" />
            {hasNote && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#0756C9]" />
            )}
          </button>

          {/* Tafsir */}
          <button
            onClick={() => onOpenTafsir(ayat.nomorAyat)}
            className="p-2 rounded-lg text-[#5E6B7C] hover:text-[#0756C9] hover:bg-[#EBF3FE] transition active:scale-95"
            title="Tafsir Kemenag"
            aria-label={`Buka tafsir ayat ${ayat.nomorAyat}`}
          >
            <BookOpen className="w-4 h-4" />
          </button>

          {/* Share */}
          <button
            onClick={() => onShare(ayat)}
            className="p-2 rounded-lg text-[#5E6B7C] hover:text-[#061A35] hover:bg-stone-100 transition active:scale-95"
            title="Bagikan ayat"
            aria-label={`Bagikan ayat ${ayat.nomorAyat}`}
          >
            <Share2 className="w-4 h-4" />
          </button>

          {/* Copy */}
          <button
            onClick={() => onCopy(ayat)}
            className="p-2 rounded-lg text-[#5E6B7C] hover:text-[#061A35] hover:bg-stone-100 transition active:scale-95"
            title="Salin teks ayat"
            aria-label={`Salin ayat ${ayat.nomorAyat}`}
          >
            {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Arabic Text Display */}
      <div className="py-6 text-right" dir="rtl">
        <p className={`${arabicFontClass} ${arabicSizeClass} text-[#061A35] font-normal leading-loose tracking-wide`}>
          {ayat.teksArab}
        </p>
      </div>

      {/* Transliteration (Latin) */}
      {showTransliteration && ayat.teksLatin && (
        <div className="pt-2 pb-1 text-left text-sm text-[#0645A8] font-medium leading-relaxed italic">
          {ayat.teksLatin}
        </div>
      )}

      {/* Indonesian Translation */}
      {showTranslation && (
        <div className="pt-2 text-left text-[#5E6B7C] text-sm md:text-base leading-relaxed">
          {ayat.teksIndonesia}
        </div>
      )}
    </article>
  );
};
