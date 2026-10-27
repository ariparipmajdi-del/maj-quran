import React from 'react';
import { Play, Pause, Square, Gauge } from 'lucide-react';

interface AutoScrollControlProps {
  isScrolling: boolean;
  isPaused: boolean;
  speed: number;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onSpeedChange: (newSpeed: number) => void;
}

export const AutoScrollControl: React.FC<AutoScrollControlProps> = ({
  isScrolling,
  isPaused,
  speed,
  onStart,
  onPause,
  onResume,
  onStop,
  onSpeedChange,
}) => {
  // If not scrolling and not paused, show the compact start button
  if (!isScrolling && !isPaused) {
    return (
      <button
        onClick={onStart}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-stone-200 text-stone-700 hover:text-[#0756C9] hover:border-[#0756C9]/40 text-xs font-semibold shadow-xs transition active:scale-95 whitespace-nowrap"
        title="Aktifkan Auto-scroll Tilawah"
      >
        <Play className="w-3.5 h-3.5 text-[#0756C9]" />
        <span>Auto-Scroll</span>
      </button>
    );
  }

  // Active floating control panel
  return (
    <aside
      aria-label="Kontrol gulir otomatis"
      className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 px-4 py-2 bg-[#061A35]/95 text-white backdrop-blur-md rounded-2xl shadow-xl border border-blue-900/40 text-xs animate-fade-in"
    >
      <div className="flex items-center gap-1.5 pr-2 border-r border-blue-800/40">
        <span className="w-2 h-2 rounded-full bg-[#168BFF] animate-ping" />
        <span className="font-semibold">{isPaused ? 'Auto-Scroll Dijeda' : 'Auto-Scroll Aktif'}</span>
      </div>

      {/* Play/Pause toggle */}
      {isPaused ? (
        <button
          onClick={onResume}
          className="p-1.5 rounded-lg bg-blue-900/60 hover:bg-blue-800 text-white transition"
          title="Lanjutkan gulir otomatis"
        >
          <Play className="w-3.5 h-3.5 text-[#168BFF]" />
        </button>
      ) : (
        <button
          onClick={onPause}
          className="p-1.5 rounded-lg bg-blue-900/60 hover:bg-blue-800 text-white transition"
          title="Jeda gulir otomatis"
        >
          <Pause className="w-3.5 h-3.5 text-[#168BFF]" />
        </button>
      )}

      {/* Speed cycler */}
      <div className="flex items-center gap-1 pl-1">
        <Gauge className="w-3.5 h-3.5 text-blue-200/60" />
        {[1, 2, 3, 4].map((s) => (
          <button
            key={s}
            onClick={() => onSpeedChange(s)}
            className={`w-6 h-6 rounded-md font-bold text-[11px] transition ${
              speed === s
                ? 'bg-[#0756C9] text-white shadow-xs'
                : 'text-blue-100 hover:bg-blue-900/50'
            }`}
            title={`Kecepatan ${s}x`}
          >
            {s}x
          </button>
        ))}
      </div>

      {/* Stop button */}
      <button
        onClick={onStop}
        className="p-1.5 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white transition ml-1"
        title="Hentikan auto-scroll"
      >
        <Square className="w-3.5 h-3.5 fill-current" />
      </button>
    </aside>
  );
};
