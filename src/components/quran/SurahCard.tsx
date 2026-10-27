import React from 'react';
import { SurahItem } from '../../types/quran';
import { ArrowRight } from 'lucide-react';

interface SurahCardProps {
  surah: SurahItem;
  onClick: (surahNumber: number) => void;
  onQuickPlay?: (surah: SurahItem, e: React.MouseEvent) => void;
}

export const SurahCard: React.FC<SurahCardProps> = ({ surah, onClick }) => {
  return (
    <div
      onClick={() => onClick(surah.nomor)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(surah.nomor);
        }
      }}
      className="group relative flex items-center justify-between p-4 bg-white rounded-2xl border border-[#E4E9F0] hover:border-[#0756C9]/40 hover:shadow-md transition-all duration-200 cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0756C9]"
    >
      <div className="flex items-center gap-3.5 min-w-0">
        {/* Number Badge */}
        <div className="w-10 h-10 shrink-0 rounded-xl bg-[#EBF3FE] border border-[#0756C9]/20 flex items-center justify-center text-[#0645A8] font-bold text-sm group-hover:bg-[#0756C9] group-hover:text-white transition-colors duration-200">
          <span className="tabular-nums">{surah.nomor}</span>
        </div>

        {/* Latin Name & Meaning */}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-[#061A35] text-base group-hover:text-[#0756C9] transition-colors truncate">
              {surah.namaLatin}
            </h3>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-[#5E6B7C] mt-0.5 truncate">
            <span>{surah.arti}</span>
            <span aria-hidden="true">·</span>
            <span>{surah.tempatTurun}</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">{surah.jumlahAyat} Ayat</span>
          </div>
        </div>
      </div>

      {/* Arabic Name & Quick Action */}
      <div className="flex items-center gap-3 shrink-0 pl-2">
        <div className="text-right">
          <p className="font-arabic-amiri text-2xl text-[#061A35] font-bold leading-normal">
            {surah.nama}
          </p>
        </div>

        <div className="text-stone-300 group-hover:text-[#0756C9] transition-colors hidden sm:block">
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </div>
  );
};
