import { useState, useRef, useEffect, useCallback } from 'react';
import APP_CONFIG from '../config/appConfig';
import { AyatItem, SurahDetail } from '../types/quran';

export interface AudioPlaybackState {
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
}

export function useAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const activeAyatList = useRef<AyatItem[]>([]);
  const isContinuous = useRef<boolean>(true);

  const [state, setState] = useState<AudioPlaybackState>({
    isPlaying: false,
    isLoading: false,
    mode: null,
    currentSurah: null,
    currentAyahNumber: null,
    currentTime: 0,
    duration: 0,
    volume: 1,
    qariId: '05', // Default: Misyari Rasyid Al-Afasi
    errorMessage: null,
  });

  // Initialize Audio element
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    const onPlay = () => setState((s) => ({ ...s, isPlaying: true, isLoading: false, errorMessage: null }));
    const onPause = () => setState((s) => ({ ...s, isPlaying: false }));
    const onWaiting = () => setState((s) => ({ ...s, isLoading: true }));
    const onCanPlay = () => setState((s) => ({ ...s, isLoading: false }));
    
    const onTimeUpdate = () => {
      if (audio) {
        setState((s) => ({
          ...s,
          currentTime: audio.currentTime,
          duration: isNaN(audio.duration) ? 0 : audio.duration,
        }));
      }
    };

    const onError = () => {
      setState((s) => ({
        ...s,
        isPlaying: false,
        isLoading: false,
        errorMessage: 'Gagal memuat audio. Periksa koneksi internet Anda.',
      }));
    };

    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('canplay', onCanPlay);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('error', onError);

    return () => {
      audio.pause();
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('canplay', onCanPlay);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('error', onError);
      audioRef.current = null;
    };
  }, []);

  const setQari = useCallback((newQariId: string) => {
    setState((s) => {
      // If currently playing, we can update source
      return { ...s, qariId: newQariId };
    });
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setState((s) => ({
      ...s,
      isPlaying: false,
      isLoading: false,
      mode: null,
      currentAyahNumber: null,
      currentTime: 0,
    }));
  }, []);

  const playVerse = useCallback(
    async (
      surah: { nomor: number; namaLatin: string },
      ayahNumber: number,
      allAyat: AyatItem[],
      qariId?: string
    ) => {
      const audio = audioRef.current;
      if (!audio) return;

      const activeQari = qariId || state.qariId;
      const targetAyah = allAyat.find((a) => a.nomorAyat === ayahNumber);
      if (!targetAyah || !targetAyah.audio || !targetAyah.audio[activeQari]) {
        setState((s) => ({ ...s, errorMessage: 'Audio ayat tidak tersedia untuk qari ini.' }));
        return;
      }

      const audioUrl = targetAyah.audio[activeQari];
      activeAyatList.current = allAyat;

      try {
        setState((s) => ({
          ...s,
          isLoading: true,
          mode: 'verse',
          currentSurah: surah,
          currentAyahNumber: ayahNumber,
          qariId: activeQari,
          errorMessage: null,
        }));

        audio.src = audioUrl;
        audio.load();
        await audio.play();
      } catch (err: any) {
        setState((s) => ({
          ...s,
          isPlaying: false,
          isLoading: false,
          errorMessage: 'Pemutaran audio diblokir peramban atau terjadi kesalahan jaringan.',
        }));
      }
    },
    [state.qariId]
  );

  const playFullSurah = useCallback(
    async (surah: SurahDetail, qariId?: string) => {
      const audio = audioRef.current;
      if (!audio) return;

      const activeQari = qariId || state.qariId;
      const audioUrl = surah.audioFull?.[activeQari];
      if (!audioUrl) {
        setState((s) => ({ ...s, errorMessage: 'Audio lengkap surat tidak tersedia untuk qari ini.' }));
        return;
      }

      try {
        setState((s) => ({
          ...s,
          isLoading: true,
          mode: 'full',
          currentSurah: { nomor: surah.nomor, namaLatin: surah.namaLatin },
          currentAyahNumber: null,
          qariId: activeQari,
          errorMessage: null,
        }));

        audio.src = audioUrl;
        audio.load();
        await audio.play();
      } catch (err: any) {
        setState((s) => ({
          ...s,
          isPlaying: false,
          isLoading: false,
          errorMessage: 'Gagal memulai audio surat.',
        }));
      }
    },
    [state.qariId]
  );

  const togglePlayPause = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (state.isPlaying) {
      audio.pause();
    } else {
      try {
        await audio.play();
      } catch (e) {
        setState((s) => ({ ...s, errorMessage: 'Gagal melanjutkan audio.' }));
      }
    }
  }, [state.isPlaying]);

  const seek = useCallback((time: number) => {
    const audio = audioRef.current;
    if (audio && !isNaN(time)) {
      audio.currentTime = time;
      setState((s) => ({ ...s, currentTime: time }));
    }
  }, []);

  const setVolume = useCallback((val: number) => {
    const audio = audioRef.current;
    const clamped = Math.max(0, Math.min(1, val));
    if (audio) {
      audio.volume = clamped;
    }
    setState((s) => ({ ...s, volume: clamped }));
  }, []);

  // Handle onEnded for auto-advance to next verse in playlist mode
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onEnded = () => {
      if (state.mode === 'verse' && isContinuous.current && state.currentSurah && state.currentAyahNumber !== null) {
        const nextAyahNum = state.currentAyahNumber + 1;
        const nextAyah = activeAyatList.current.find((a) => a.nomorAyat === nextAyahNum);
        if (nextAyah) {
          playVerse(state.currentSurah, nextAyahNum, activeAyatList.current, state.qariId);
          // Scroll verse into view gently
          const el = document.getElementById(`ayah-${nextAyahNum}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
          return;
        }
      }
      setState((s) => ({ ...s, isPlaying: false, currentTime: 0 }));
    };

    audio.addEventListener('ended', onEnded);
    return () => {
      audio.removeEventListener('ended', onEnded);
    };
  }, [state.mode, state.currentSurah, state.currentAyahNumber, state.qariId, playVerse]);

  return {
    ...state,
    playVerse,
    playFullSurah,
    togglePlayPause,
    seek,
    setVolume,
    setQari,
    stop,
  };
}
