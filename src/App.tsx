import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Navbar } from './components/layout/Navbar';
import { BottomNav } from './components/layout/BottomNav';
import { MiniAudioPlayer } from './components/audio/MiniAudioPlayer';
import { PrayerAudioBanner } from './components/prayer/PrayerAudioBanner';
import { OfflineIndicator } from './components/common/OfflineIndicator';
import { HomePage } from './pages/HomePage';
import { SurahListPage } from './pages/SurahListPage';
import { ReaderPage } from './pages/ReaderPage';
import { SearchPage } from './pages/SearchPage';
import { BookmarksPage } from './pages/BookmarksPage';
import { SettingsPage } from './pages/SettingsPage';
import { PrayerTimesPage } from './pages/PrayerTimesPage';
import { useAudioPlayer } from './hooks/useAudioPlayer';
import { usePrayerTimes } from './hooks/usePrayerTimes';
import { persistence } from './storage/persistence';
import { AyatItem, SurahDetail } from './types/quran';

export default function App() {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [readerParams, setReaderParams] = useState<{ surahNumber: number; ayahNumber?: number }>({
    surahNumber: 1,
    ayahNumber: 1,
  });

  // Top-level audio player instance for Quran Murottal
  const audio = useAudioPlayer();
  const audioStopRef = useRef(audio.stop);
  audioStopRef.current = audio.stop;

  // Prayer times & automated Adzan audio hook
  // When prayer audio starts, automatically stop murottal to avoid overlapping audio
  const handlePrayerAudioStarted = useCallback(() => {
    audioStopRef.current();
  }, []);

  const prayer = usePrayerTimes(handlePrayerAudioStarted);

  // Read saved settings to load preferred Qari on start
  useEffect(() => {
    const s = persistence.getSettings();
    if (s.preferredQari && s.preferredQari !== audio.qariId) {
      audio.setQari(s.preferredQari);
    }
  }, []);

  const handleNavigate = (page: string, params?: any) => {
    if (page === 'reader' && params?.surahNumber) {
      setReaderParams({
        surahNumber: params.surahNumber,
        ayahNumber: params.ayahNumber || 1,
      });
    }
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenSurah = (surahNumber: number, ayahNumber?: number) => {
    setReaderParams({ surahNumber, ayahNumber: ayahNumber || 1 });
    setCurrentPage('reader');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePlayVerse = (
    surah: { nomor: number; namaLatin: string },
    ayahNumber: number,
    allAyat: AyatItem[]
  ) => {
    // Stop prayer audio if it was running
    prayer.stopPrayerAudio();
    audio.playVerse(surah, ayahNumber, allAyat);
  };

  const handlePlayFullSurah = (surah: SurahDetail) => {
    // Stop prayer audio if it was running
    prayer.stopPrayerAudio();
    audio.playFullSurah(surah);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF5] flex flex-col font-sans selection:bg-[#EBF3FE] selection:text-[#0645A8]">
      {/* Top Navbar */}
      <Navbar currentPage={currentPage} onNavigate={handleNavigate} />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-6">
        {currentPage === 'home' && (
          <HomePage onNavigate={handleNavigate} onOpenSurah={handleOpenSurah} prayer={prayer} />
        )}

        {currentPage === 'surahs' && (
          <SurahListPage onSelectSurah={(num) => handleOpenSurah(num, 1)} />
        )}

        {currentPage === 'reader' && (
          <ReaderPage
            surahNumber={readerParams.surahNumber}
            initialAyahNumber={readerParams.ayahNumber}
            onBack={() => setCurrentPage('surahs')}
            onNavigateSurah={(num, ayah) => handleOpenSurah(num, ayah || 1)}
            audioState={{
              isPlaying: audio.isPlaying,
              currentSurah: audio.currentSurah,
              currentAyahNumber: audio.currentAyahNumber,
              qariId: audio.qariId,
            }}
            onPlayVerse={handlePlayVerse}
            onPlayFullSurah={handlePlayFullSurah}
            onToggleAudio={audio.togglePlayPause}
          />
        )}

        {currentPage === 'prayer' && <PrayerTimesPage prayer={prayer} />}

        {currentPage === 'search' && (
          <SearchPage onOpenAyah={(surahNum, ayahNum) => handleOpenSurah(surahNum, ayahNum || 1)} />
        )}

        {currentPage === 'bookmarks' && (
          <BookmarksPage onOpenAyah={(surahNum, ayahNum) => handleOpenSurah(surahNum, ayahNum)} />
        )}

        {currentPage === 'settings' && <SettingsPage prayer={prayer} />}
      </main>

      {/* Floating Prayer / Adzan Audio Banner */}
      <PrayerAudioBanner
        activeAudio={prayer.activeAudio}
        volume={prayer.settings.volume}
        onStop={prayer.stopPrayerAudio}
      />

      {/* Mini Audio Player for Murottal (Persistent across pages) */}
      <MiniAudioPlayer
        isPlaying={audio.isPlaying}
        isLoading={audio.isLoading}
        mode={audio.mode}
        currentSurah={audio.currentSurah}
        currentAyahNumber={audio.currentAyahNumber}
        currentTime={audio.currentTime}
        duration={audio.duration}
        volume={audio.volume}
        qariId={audio.qariId}
        errorMessage={audio.errorMessage}
        onTogglePlayPause={audio.togglePlayPause}
        onSeek={audio.seek}
        onSetVolume={audio.setVolume}
        onSetQari={audio.setQari}
        onClose={audio.stop}
      />

      {/* Offline Status Indicator */}
      <OfflineIndicator />

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav currentPage={currentPage} onNavigate={handleNavigate} />
    </div>
  );
}
