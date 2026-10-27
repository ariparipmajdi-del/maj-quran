import { useState, useEffect, useRef, useCallback } from 'react';
import APP_CONFIG from '../config/appConfig';
import { quranApi } from '../services/quranApi';
import { persistence } from '../storage/persistence';
import { PrayerScheduleItem, PrayerKey, PrayerSettings } from '../types/quran';

export const PRAYER_LABELS: Record<PrayerKey, string> = {
  imsak: 'Imsak',
  subuh: 'Subuh',
  terbit: 'Terbit (Syuruq)',
  dzuhur: 'Dzuhur',
  ashar: 'Ashar',
  maghrib: 'Maghrib',
  isya: 'Isya’',
};

export interface ActivePrayerAudio {
  isPlaying: boolean;
  prayerKey: PrayerKey | 'test';
  label: string;
  audioUrl: string;
  currentTime: number;
  duration: number;
  isTest: boolean;
}

export interface NextPrayerInfo {
  key: PrayerKey;
  name: string;
  time: string;
  countdownStr: string;
  diffMs: number;
}

export function usePrayerTimes(onPrayerAudioStart?: () => void) {
  const [settings, setSettings] = useState<PrayerSettings>(persistence.getPrayerSettings());
  const [provinces, setProvinces] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [schedule, setSchedule] = useState<PrayerScheduleItem[]>([]);
  const [todaySchedule, setTodaySchedule] = useState<PrayerScheduleItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [nextPrayer, setNextPrayer] = useState<NextPrayerInfo | null>(null);
  const [activeAudio, setActiveAudio] = useState<ActivePrayerAudio | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const settingsRef = useRef<PrayerSettings>(settings);
  settingsRef.current = settings;

  const onPrayerAudioStartRef = useRef(onPrayerAudioStart);
  onPrayerAudioStartRef.current = onPrayerAudioStart;

  // Initialize Audio instance
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    const onTimeUpdate = () => {
      setActiveAudio((cur) => {
        if (!cur) return null;
        return {
          ...cur,
          currentTime: audio.currentTime,
          duration: isNaN(audio.duration) ? 0 : audio.duration,
        };
      });
    };

    const onEnded = () => {
      setActiveAudio(null);
    };

    const onError = () => {
      console.warn('Gagal memutar audio pengingat jadwal salat.');
      setActiveAudio(null);
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
      audioRef.current = null;
    };
  }, []);

  // Load provinces on mount
  useEffect(() => {
    quranApi
      .getPrayerProvinces()
      .then(setProvinces)
      .catch(() => {});
  }, []);

  // Load cities when province changes
  useEffect(() => {
    if (settings.provinsi) {
      quranApi
        .getPrayerCities(settings.provinsi)
        .then((data) => {
          setCities(data);
          // If current kabkota is not in list, select first available
          if (data.length > 0 && !data.includes(settings.kabkota)) {
            updateSettings({ kabkota: data[0] });
          }
        })
        .catch(() => {});
    }
  }, [settings.provinsi]);

  // Load monthly schedule
  const loadSchedule = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const now = new Date();
    const month = now.getMonth() + 1; // 1-12
    const year = now.getFullYear();

    try {
      const items = await quranApi.getPrayerSchedule(
        settings.provinsi,
        settings.kabkota,
        month,
        year
      );
      setSchedule(items);

      const dayNumber = now.getDate();
      const todayItem = items.find((i) => i.tanggal === dayNumber) || items[0] || null;
      setTodaySchedule(todayItem);
      setIsLoading(false);
    } catch (err: any) {
      setError(err.message || 'Gagal memuat jadwal shalat.');
      setIsLoading(false);
    }
  }, [settings.provinsi, settings.kabkota]);

  useEffect(() => {
    loadSchedule();
  }, [loadSchedule]);

  // Update Settings
  const updateSettings = useCallback((partial: Partial<PrayerSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...partial };
      persistence.savePrayerSettings(updated);
      if (audioRef.current && partial.volume !== undefined) {
        audioRef.current.volume = partial.volume;
      }
      return updated;
    });
  }, []);

  // Request browser notification permission
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission !== 'granted') {
      try {
        const perm = await Notification.requestPermission();
        return perm === 'granted';
      } catch {
        return false;
      }
    }
    return Notification.permission === 'granted';
  }, []);

  // Stop active prayer/test audio
  const stopPrayerAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setActiveAudio(null);
  }, []);

  // Play audio helper - completely stable
  const playAudioFile = useCallback(
    async (url: string, prayerKey: PrayerKey | 'test', label: string, isTest = false) => {
      const audio = audioRef.current;
      if (!audio) return;

      // Notify caller to pause any playing murottal
      onPrayerAudioStartRef.current?.();

      try {
        audio.pause();
        audio.currentTime = 0;
        audio.src = url;
        audio.volume = settingsRef.current.volume;
        audio.load();

        setActiveAudio({
          isPlaying: true,
          prayerKey,
          label,
          audioUrl: url,
          currentTime: 0,
          duration: 0,
          isTest,
        });

        await audio.play();
      } catch (err) {
        console.warn('Autoplay audio pengingat salat dibatasi atau gagal:', err);
      }
    },
    []
  );

  // Test individual audio
  const testAudio = useCallback(
    (type: 'subuh' | 'reguler' | 'imsak' | 'terbit') => {
      let url = APP_CONFIG.prayerAudio.adzanReguler;
      let label = 'Uji Adzan Reguler (Dzuhur/Ashar/Maghrib/Isya)';

      if (type === 'subuh') {
        url = APP_CONFIG.prayerAudio.subuh;
        label = 'Uji Adzan Subuh';
      } else if (type === 'imsak') {
        url = APP_CONFIG.prayerAudio.imsak;
        label = 'Uji Peringatan Imsak';
      } else if (type === 'terbit') {
        url = APP_CONFIG.prayerAudio.terbit;
        label = 'Uji Suara Ayam (Terbit/Syuruq)';
      }

      playAudioFile(url, 'test', label, true);
    },
    [playAudioFile]
  );

  // Send desktop/mobile Web Notification
  const sendNotification = useCallback((title: string, body: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '/pwa-192x192.png',
          badge: '/pwa-192x192.png',
        });
      } catch (e) {
        console.warn('Gagal memicu notifikasi', e);
      }
    }
  }, []);

  // Timer loop: recalculate countdown & trigger scheduled prayer audio
  useEffect(() => {
    if (!todaySchedule) return;

    const prayerKeys: PrayerKey[] = ['imsak', 'subuh', 'terbit', 'dzuhur', 'ashar', 'maghrib', 'isya'];

    const checkAndCalculate = () => {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      const currentDate = now.getDate();
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();
      const currentSeconds = now.getSeconds();

      const currentTimeStr = `${String(currentHours).padStart(2, '0')}:${String(currentMinutes).padStart(2, '0')}`;

      // 1. Check triggers for each prayer time
      prayerKeys.forEach((key) => {
        const scheduledTime = todaySchedule[key]; // e.g. "04:23"
        if (!scheduledTime) return;

        // Trigger condition: same minute and within first 15 seconds of the minute
        if (currentTimeStr === scheduledTime && currentSeconds <= 15) {
          const isTriggered = persistence.isPrayerTriggeredToday(key);
          if (!isTriggered) {
            // Deduplication: mark as triggered IMMEDIATELY
            persistence.markPrayerTriggered(key);

            const isPrayerEnabled = settingsRef.current.isEnabled && settingsRef.current.enabledPrayers[key];
            if (isPrayerEnabled) {
              const label = PRAYER_LABELS[key];
              const reminderType = settingsRef.current.reminderType;

              // Audio playback
              if (reminderType === 'audio_and_notification' || reminderType === 'audio_only') {
                let audioUrl = APP_CONFIG.prayerAudio.adzanReguler;
                if (key === 'subuh') audioUrl = APP_CONFIG.prayerAudio.subuh;
                else if (key === 'imsak') audioUrl = APP_CONFIG.prayerAudio.imsak;
                else if (key === 'terbit') audioUrl = APP_CONFIG.prayerAudio.terbit;

                playAudioFile(audioUrl, key, `Waktu ${label} Telah Tiba`);
              }

              // Notification
              if (reminderType === 'audio_and_notification' || reminderType === 'notification_only') {
                sendNotification(
                  `Waktu ${label} Telah Tiba`,
                  `Saatnya menunaikan ibadah untuk wilayah ${settingsRef.current.kabkota}.`
                );
              }
            }
          }
        }
      });

      // 2. Calculate Next Prayer countdown
      let next: NextPrayerInfo | null = null;
      let minDiff = Infinity;

      prayerKeys.forEach((key) => {
        const timeStr = todaySchedule[key];
        if (!timeStr) return;

        const [h, m] = timeStr.split(':').map(Number);
        const prayerDate = new Date(currentYear, currentMonth, currentDate, h, m, 0);
        let diff = prayerDate.getTime() - now.getTime();

        // If today's prayer already passed, check tomorrow's imsak
        if (diff > 0 && diff < minDiff) {
          minDiff = diff;
          const diffSec = Math.floor(diff / 1000);
          const hrs = Math.floor(diffSec / 3600);
          const mins = Math.floor((diffSec % 3600) / 60);
          const secs = diffSec % 60;
          const countdownStr = `${hrs > 0 ? `${hrs}j ` : ''}${mins}m ${secs}d`;

          next = {
            key,
            name: PRAYER_LABELS[key],
            time: timeStr,
            diffMs: diff,
            countdownStr,
          };
        }
      });

      // If all passed today, next is tomorrow's Subuh/Imsak
      if (!next && todaySchedule.subuh) {
        const tomorrow = new Date(currentYear, currentMonth, currentDate + 1);
        const [h, m] = todaySchedule.subuh.split(':').map(Number);
        tomorrow.setHours(h, m, 0, 0);
        const diff = tomorrow.getTime() - now.getTime();
        const diffSec = Math.floor(diff / 1000);
        const hrs = Math.floor(diffSec / 3600);
        const mins = Math.floor((diffSec % 3600) / 60);
        const secs = diffSec % 60;
        next = {
          key: 'subuh',
          name: 'Subuh (Besok)',
          time: todaySchedule.subuh,
          diffMs: diff,
          countdownStr: `${hrs}j ${mins}m ${secs}d`,
        };
      }

      setNextPrayer((prev) => {
        if (!prev && !next) return null;
        if (
          prev &&
          next &&
          prev.key === next.key &&
          prev.time === next.time &&
          prev.countdownStr === next.countdownStr
        ) {
          return prev;
        }
        return next;
      });
    };

    checkAndCalculate();
    const interval = setInterval(checkAndCalculate, 1000);

    return () => clearInterval(interval);
  }, [todaySchedule]);

  return {
    settings,
    updateSettings,
    provinces,
    cities,
    schedule,
    todaySchedule,
    isLoading,
    error,
    nextPrayer,
    activeAudio,
    stopPrayerAudio,
    testAudio,
    requestNotificationPermission,
    refreshSchedule: loadSchedule,
  };
}
