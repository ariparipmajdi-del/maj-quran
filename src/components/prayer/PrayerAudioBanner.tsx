import React from 'react';
import { Square, Volume2, BellRing } from 'lucide-react';
import { ActivePrayerAudio } from '../../hooks/usePrayerTimes';

interface PrayerAudioBannerProps {
  activeAudio: ActivePrayerAudio | null;
  volume: number;
  onStop: () => void;
}

export const PrayerAudioBanner: React.FC<PrayerAudioBannerProps> = ({
  activeAudio,
  volume,
  onStop,
}) => {
  if (!activeAudio || !activeAudio.isPlaying) return null;

  return (
    <aside
      aria-label="Peringatan audio jadwal salat sedang berbunyi"
      className="fixed top-20 left-4 right-4 md:left-auto md:right-6 md:w-96 z-50 bg-[#061A35] text-white p-4 rounded-3xl shadow-2xl border border-[#168BFF]/30 animate-fade-in flex flex-col gap-3 backdrop-blur-md"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-[#0756C9]/40 border border-[#168BFF]/30 flex items-center justify-center shrink-0">
            <BellRing className="w-5 h-5 text-[#168BFF] animate-bounce" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#168BFF]">
                {activeAudio.isTest ? 'Mode Uji Coba Audio' : 'Panggilan Salat'}
              </span>
            </div>
            <h4 className="font-bold text-sm text-white truncate">
              {activeAudio.label}
            </h4>
          </div>
        </div>

        {/* Big Stop Button */}
        <button
          onClick={onStop}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0756C9] text-white hover:bg-[#0645A8] font-bold text-xs shadow-md transition active:scale-95 shrink-0"
          title="Hentikan pemutaran audio adzan"
        >
          <Square className="w-3.5 h-3.5 fill-current" />
          <span>Hentikan</span>
        </button>
      </div>

      {/* Progress & Wave Indicator */}
      <div className="flex items-center justify-between gap-3 text-xs text-white/80 pt-1 border-t border-white/10">
        <div className="flex items-center gap-1.5">
          <Volume2 className="w-3.5 h-3.5 text-white/70" />
          <span className="tabular-nums">Volume {Math.round(volume * 100)}%</span>
        </div>

        <div className="flex items-center gap-1">
          <span className="w-1 h-3 bg-[#168BFF] rounded-full animate-pulse" />
          <span className="w-1 h-4 bg-[#168BFF] rounded-full animate-pulse delay-75" />
          <span className="w-1 h-2 bg-[#168BFF] rounded-full animate-pulse delay-150" />
          <span className="w-1 h-4 bg-[#168BFF] rounded-full animate-pulse delay-100" />
          <span className="text-[11px] font-medium ml-1 text-white/90">Sedang Memutar Audio...</span>
        </div>
      </div>
    </aside>
  );
};
