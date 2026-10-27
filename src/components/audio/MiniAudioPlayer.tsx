import React from 'react';
import { Play, Pause, X, Volume2, User, Loader2, AlertCircle } from 'lucide-react';
import APP_CONFIG from '../../config/appConfig';

interface MiniAudioPlayerProps {
  isPlaying: boolean;
  isLoading: boolean;
  mode: 'full' | 'verse' | null;
  currentSurah: { nomor: number; namaLatin: string } | null;
  currentAyahNumber: number | null;
  currentTime: number;
  duration: number;
  volume: number;
  qariId: string;
  errorMessage: string | null;
  onTogglePlayPause: () => void;
  onSeek: (time: number) => void;
  onSetVolume: (vol: number) => void;
  onSetQari: (qariId: string) => void;
  onClose: () => void;
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export const MiniAudioPlayer: React.FC<MiniAudioPlayerProps> = ({
  isPlaying,
  isLoading,
  mode,
  currentSurah,
  currentAyahNumber,
  currentTime,
  duration,
  volume,
  qariId,
  errorMessage,
  onTogglePlayPause,
  onSeek,
  onSetVolume,
  onSetQari,
  onClose,
}) => {
  // Only render if a track is active or was played
  if (!currentSurah) return null;

  const currentQari = APP_CONFIG.qariList.find((q) => q.id === qariId) || APP_CONFIG.qariList[0];
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed bottom-16 md:bottom-4 left-3 right-3 md:left-auto md:right-6 md:w-96 z-40 bg-white rounded-2xl shadow-xl border border-stone-200/90 overflow-hidden transition-all duration-300">
      {/* Top progress bar / seeker */}
      <div
        className="w-full bg-stone-100 h-1.5 cursor-pointer relative group"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const clickPos = (e.clientX - rect.left) / rect.width;
          if (duration > 0) onSeek(clickPos * duration);
        }}
      >
        <div
          className="h-full bg-[#0756C9] transition-all relative"
          style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-[#0645A8] rounded-full opacity-0 group-hover:opacity-100 shadow-xs" />
        </div>
      </div>

      <div className="p-3">
        {errorMessage && (
          <div className="mb-2 p-1.5 rounded-lg bg-red-50 text-red-700 text-xs flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{errorMessage}</span>
          </div>
        )}

        <div className="flex items-center justify-between gap-3">
          {/* Track Info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[#061A35] text-sm truncate">
                {currentSurah.namaLatin}
              </span>
              <span className="text-[11px] font-medium text-[#0645A8] bg-[#EBF3FE] px-2 py-0.5 rounded-md shrink-0">
                {mode === 'verse' ? `Ayat ${currentAyahNumber}` : 'Surat Penuh'}
              </span>
            </div>
            
            {/* Qari selector */}
            <div className="flex items-center gap-1 mt-0.5 text-xs text-[#5E6B7C]">
              <User className="w-3 h-3 shrink-0" />
              <select
                aria-label="Pilih Qari murottal"
                value={qariId}
                onChange={(e) => onSetQari(e.target.value)}
                className="bg-transparent text-[#5E6B7C] text-xs truncate max-w-[170px] focus:outline-none cursor-pointer hover:text-[#061A35]"
              >
                {APP_CONFIG.qariList.map((q) => (
                  <option key={q.id} value={q.id}>
                    {q.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Time & Playback Controls */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] text-[#5E6B7C] tabular-nums">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>

            <button
              onClick={onTogglePlayPause}
              disabled={isLoading}
              className="w-9 h-9 rounded-full bg-[#0756C9] hover:bg-[#0645A8] text-white flex items-center justify-center transition shadow-xs active:scale-95 disabled:opacity-50"
              title={isPlaying ? 'Jeda' : 'Putar'}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4 translate-x-0.5" />
              )}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition"
              title="Tutup pemutar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
