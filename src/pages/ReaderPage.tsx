import React, { useState, useEffect, useRef } from 'react';
import { quranApi } from '../services/quranApi';
import { persistence } from '../storage/persistence';
import { SurahDetail, AyatItem, UserSettings } from '../types/quran';
import { AyatCard } from '../components/quran/AyatCard';
import { TafsirModal } from '../components/quran/TafsirModal';
import { NoteModal } from '../components/quran/NoteModal';
import { ShareModal } from '../components/quran/ShareModal';
import { AutoScrollControl } from '../components/quran/AutoScrollControl';
import { useAutoScroll } from '../hooks/useAutoScroll';
import APP_CONFIG from '../config/appConfig';
import {
  ChevronLeft,
  ChevronRight,
  Play,
  BookOpen,
  Type,
  Loader2,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';

interface ReaderPageProps {
  surahNumber: number;
  initialAyahNumber?: number;
  onBack: () => void;
  onNavigateSurah: (surahNumber: number, ayahNumber?: number) => void;
  audioState: {
    isPlaying: boolean;
    currentSurah: { nomor: number; namaLatin: string } | null;
    currentAyahNumber: number | null;
    qariId: string;
  };
  onPlayVerse: (surah: { nomor: number; namaLatin: string }, ayahNumber: number, allAyat: AyatItem[]) => void;
  onPlayFullSurah: (surah: SurahDetail) => void;
  onToggleAudio: () => void;
}

export const ReaderPage: React.FC<ReaderPageProps> = ({
  surahNumber,
  initialAyahNumber,
  onBack,
  onNavigateSurah,
  audioState,
  onPlayVerse,
  onPlayFullSurah,
}) => {
  const [surah, setSurah] = useState<SurahDetail | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Settings
  const [settings, setSettings] = useState<UserSettings>(persistence.getSettings());
  const [showSettingsDrawer, setShowSettingsDrawer] = useState<boolean>(false);

  // Modals state
  const [tafsirAyah, setTafsirAyah] = useState<number | null>(null);
  const [isTafsirOpen, setIsTafsirOpen] = useState<boolean>(false);

  const [activeNoteAyat, setActiveNoteAyat] = useState<AyatItem | null>(null);
  const [isNoteOpen, setIsNoteOpen] = useState<boolean>(false);

  const [activeShareAyat, setActiveShareAyat] = useState<AyatItem | null>(null);
  const [isShareOpen, setIsShareOpen] = useState<boolean>(false);

  const [copiedAyahId, setCopiedAyahId] = useState<number | null>(null);

  // Bookmarks & Notes state for reactive re-render
  const [, setBookmarksVersion] = useState<number>(0);
  const [, setNotesVersion] = useState<number>(0);

  // Auto-Scroll hook
  const { isScrolling, isPaused, speed, start, pause, resume, stop, setSpeed } = useAutoScroll();

  // Load Surah
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);
    stop(); // Stop auto scroll when navigating to new surah

    quranApi
      .getSurahDetail(surahNumber)
      .then((data) => {
        if (isMounted) {
          setSurah(data);
          setIsLoading(false);

          // Save last read
          persistence.saveLastRead({
            surahNumber: data.nomor,
            surahName: data.namaLatin,
            surahArabic: data.nama,
            ayahNumber: initialAyahNumber || 1,
            totalAyat: data.jumlahAyat,
            timestamp: new Date().toISOString(),
          });

          // Record 1 read in tilawah tracker
          persistence.recordAyatRead(1);

          // Scroll to initial ayah if specified
          if (initialAyahNumber && initialAyahNumber > 1) {
            setTimeout(() => {
              const el = document.getElementById(`ayah-${initialAyahNumber}`);
              if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }, 300);
          } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Gagal memuat surat.');
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [surahNumber, initialAyahNumber]);

  const handleUpdateSettings = (partial: Partial<UserSettings>) => {
    const updated = { ...settings, ...partial };
    persistence.saveSettings(updated);
    setSettings(updated);
  };

  const handleToggleBookmark = (ayah: AyatItem) => {
    if (!surah) return;
    const isBookmarked = persistence.isBookmarked(surah.nomor, ayah.nomorAyat);
    const bookmarkId = `surah-${surah.nomor}-ayah-${ayah.nomorAyat}`;
    if (isBookmarked) {
      persistence.removeBookmark(bookmarkId);
    } else {
      persistence.addBookmark({
        id: bookmarkId,
        surahNumber: surah.nomor,
        surahName: surah.namaLatin,
        surahArabic: surah.nama,
        ayahNumber: ayah.nomorAyat,
        ayahArabic: ayah.teksArab,
        ayahTranslation: ayah.teksIndonesia,
        createdAt: new Date().toISOString(),
      });
    }
    setBookmarksVersion((v) => v + 1);
  };

  const handleCopyAyat = (ayat: AyatItem) => {
    if (!surah) return;
    const text = `${ayat.teksArab}\n\n"${ayat.teksIndonesia}"\n\n(QS. ${surah.namaLatin} [${surah.nomor}]: ${ayat.nomorAyat})`;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedAyahId(ayat.nomorAyat);
      setTimeout(() => setCopiedAyahId(null), 2000);
    });
  };

  const handleJumpToAyah = (ayahNum: number) => {
    const el = document.getElementById(`ayah-${ayahNum}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Update last read
      if (surah) {
        persistence.saveLastRead({
          surahNumber: surah.nomor,
          surahName: surah.namaLatin,
          surahArabic: surah.nama,
          ayahNumber: ayahNum,
          totalAyat: surah.jumlahAyat,
          timestamp: new Date().toISOString(),
        });
      }
    }
  };

  // Font classes mapping
  const arabicFontClass =
    settings.arabicFont === 'scheherazade'
      ? 'font-arabic-scheherazade'
      : settings.arabicFont === 'lateef'
      ? 'font-arabic-lateef'
      : 'font-arabic-amiri';

  const arabicSizeClass =
    settings.arabicFontSize === 'sm'
      ? 'text-2xl leading-loose'
      : settings.arabicFontSize === 'lg'
      ? 'text-4xl leading-relaxed'
      : settings.arabicFontSize === 'xl'
      ? 'text-5xl leading-relaxed'
      : 'text-3xl leading-loose';

  return (
    <div className="space-y-6 pb-24">
      {/* Top Header Bar for Reader */}
      <div className="sticky top-16 z-30 bg-[#FDFBF5]/95 backdrop-blur-md py-3 border-b border-stone-200/80 -mx-4 px-4 sm:-mx-6 sm:px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          {/* Back button & Surah title */}
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={onBack}
              className="p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition shrink-0"
              title="Kembali ke Daftar Surat"
              aria-label="Kembali"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            {surah && (
              <div className="min-w-0">
                <h1 className="text-base sm:text-lg font-bold text-[#061A35] truncate leading-tight">
                  {surah.nomor}. {surah.namaLatin}
                </h1>
                <p className="text-[11px] text-stone-500 truncate">
                  {surah.arti} · {surah.jumlahAyat} Ayat
                </p>
              </div>
            )}
          </div>

          {/* Quick Toolbar */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Auto-Scroll control trigger */}
            <AutoScrollControl
              isScrolling={isScrolling}
              isPaused={isPaused}
              speed={speed}
              onStart={start}
              onPause={pause}
              onResume={resume}
              onStop={stop}
              onSpeedChange={setSpeed}
            />

            {/* Jump to Ayat Selector */}
            {surah && (
              <div className="relative hidden sm:block">
                <select
                  aria-label="Lompat ke ayat"
                  onChange={(e) => handleJumpToAyah(Number(e.target.value))}
                  defaultValue=""
                  className="px-2.5 py-1.5 rounded-xl border border-stone-200 bg-white text-xs font-semibold text-stone-700 focus:outline-none focus:border-[#0756C9] cursor-pointer"
                >
                  <option value="" disabled>
                    Lompat ke Ayat...
                  </option>
                  {surah.ayat.map((a) => (
                    <option key={a.nomorAyat} value={a.nomorAyat}>
                      Ayat {a.nomorAyat}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Tafsir Surat Button */}
            <button
              onClick={() => {
                setTafsirAyah(1);
                setIsTafsirOpen(true);
              }}
              className="p-2 rounded-xl border border-stone-200 bg-white text-stone-700 hover:text-[#0756C9] hover:border-[#0756C9]/40 transition text-xs font-medium"
              title="Buka Tafsir Kemenag"
            >
              <BookOpen className="w-4 h-4" />
            </button>

            {/* Audio full surah play button */}
            {surah && (
              <button
                onClick={() => onPlayFullSurah(surah)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0756C9] text-white hover:bg-[#0645A8] transition text-xs font-semibold shadow-xs"
                title="Putar Murottal Surat Penuh"
              >
                <Play className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Putar Surat</span>
              </button>
            )}

            {/* View/Font settings drawer toggle */}
            <button
              onClick={() => setShowSettingsDrawer(!showSettingsDrawer)}
              className={`p-2 rounded-xl border transition ${
                showSettingsDrawer
                  ? 'bg-[#EBF3FE] border-[#0756C9] text-[#0645A8]'
                  : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
              }`}
              title="Pengaturan Teks & Tampilan"
            >
              <Type className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Collapsible Display Settings Drawer */}
        {showSettingsDrawer && (
          <div className="max-w-4xl mx-auto mt-3 p-4 bg-white rounded-2xl border border-stone-200 shadow-md space-y-4 animate-fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <span className="text-xs font-bold text-[#061A35]">Tampilan & Ukuran Teks</span>
              <button
                onClick={() => setShowSettingsDrawer(false)}
                className="text-xs text-stone-400 hover:text-stone-700 font-medium"
              >
                Tutup
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              {/* Font Style */}
              <div>
                <label className="block text-stone-500 font-semibold mb-1.5">Gaya Khat Arab</label>
                <div className="flex gap-1.5">
                  {APP_CONFIG.typography.arabicFonts.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => handleUpdateSettings({ arabicFont: f.id as any })}
                      className={`flex-1 py-1.5 px-2 rounded-lg border text-xs font-medium transition ${
                        settings.arabicFont === f.id
                          ? 'border-[#0756C9] bg-[#EBF3FE] text-[#0645A8] font-bold'
                          : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      {f.id === 'amiri' ? 'Standar' : f.id === 'scheherazade' ? 'Utsmani' : 'Lateef'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Size */}
              <div>
                <label className="block text-stone-500 font-semibold mb-1.5">Ukuran Teks Arab</label>
                <div className="flex gap-1.5">
                  {(['sm', 'md', 'lg', 'xl'] as const).map((sz) => (
                    <button
                      key={sz}
                      onClick={() => handleUpdateSettings({ arabicFontSize: sz })}
                      className={`flex-1 py-1.5 rounded-lg border text-xs font-medium transition ${
                        settings.arabicFontSize === sz
                          ? 'border-[#0756C9] bg-[#EBF3FE] text-[#0645A8] font-bold'
                          : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      {sz.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Visibility Toggles */}
              <div>
                <label className="block text-stone-500 font-semibold mb-1.5">Elemen Ayat</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdateSettings({ showTranslation: !settings.showTranslation })}
                    className={`flex-1 py-1.5 px-2 rounded-lg border text-xs font-medium transition ${
                      settings.showTranslation
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                        : 'border-stone-200 text-stone-400 line-through'
                    }`}
                  >
                    Terjemahan
                  </button>
                  <button
                    onClick={() => handleUpdateSettings({ showTransliteration: !settings.showTransliteration })}
                    className={`flex-1 py-1.5 px-2 rounded-lg border text-xs font-medium transition ${
                      settings.showTransliteration
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                        : 'border-stone-200 text-stone-400 line-through'
                    }`}
                  >
                    Latin
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="py-28 flex flex-col items-center justify-center gap-3 text-stone-500">
          <Loader2 className="w-10 h-10 animate-spin text-[#0756C9]" />
          <p className="text-sm font-semibold">Memuat ayat-ayat suci Al-Qur’an...</p>
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <div className="max-w-2xl mx-auto p-8 rounded-3xl bg-red-50 border border-red-200 text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-red-600 mx-auto" />
          <h3 className="text-base font-bold text-red-950">Gagal Membuka Surat</h3>
          <p className="text-sm text-red-700">{error}</p>
          <button
            onClick={onBack}
            className="px-4 py-2 rounded-xl bg-[#0756C9] text-white text-xs font-semibold"
          >
            Kembali ke Daftar Surat
          </button>
        </div>
      )}

      {/* Reader Content */}
      {!isLoading && !error && surah && (
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Surah Intro Card */}
          <div className="p-6 md:p-8 rounded-3xl bg-white border border-stone-200 text-center space-y-4 shadow-xs relative overflow-hidden">
            <div className="space-y-1">
              <span className="text-xs font-bold text-[#0645A8] uppercase tracking-wider">
                Surat ke-{surah.nomor} · {surah.tempatTurun}
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-[#061A35]">
                {surah.namaLatin}
              </h2>
              <p className="text-stone-500 text-sm">
                "{surah.arti}" · {surah.jumlahAyat} Ayat
              </p>
            </div>

            <div className="pt-2">
              <p className="font-arabic-amiri text-4xl sm:text-5xl font-bold text-[#0645A8]">
                {surah.nama}
              </p>
            </div>

            {/* Bismillah Header (except for Surah 1 Al-Fatihah where Bismillah is verse 1, and Surah 9 At-Taubah) */}
            {surah.nomor !== 1 && surah.nomor !== 9 && (
              <div className="pt-6 border-t border-stone-100">
                <p className="font-arabic-amiri text-2xl sm:text-3xl text-stone-800 font-semibold" dir="rtl">
                  بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ
                </p>
              </div>
            )}
          </div>

          {/* List of Ayat */}
          <div className="space-y-4">
            {surah.ayat.map((ayat) => {
              const isPlayingThis =
                audioState.isPlaying &&
                audioState.currentSurah?.nomor === surah.nomor &&
                audioState.currentAyahNumber === ayat.nomorAyat;

              const isBookmarked = persistence.isBookmarked(surah.nomor, ayat.nomorAyat);
              const note = persistence.getNote(surah.nomor, ayat.nomorAyat);

              return (
                <AyatCard
                  key={ayat.nomorAyat}
                  surahNumber={surah.nomor}
                  surahName={surah.namaLatin}
                  ayat={ayat}
                  arabicFontClass={arabicFontClass}
                  arabicSizeClass={arabicSizeClass}
                  showTranslation={settings.showTranslation}
                  showTransliteration={settings.showTransliteration}
                  isBookmarked={isBookmarked}
                  hasNote={!!note}
                  isPlaying={isPlayingThis}
                  onPlay={(ayahNum) =>
                    onPlayVerse(
                      { nomor: surah.nomor, namaLatin: surah.namaLatin },
                      ayahNum,
                      surah.ayat
                    )
                  }
                  onToggleBookmark={handleToggleBookmark}
                  onOpenNote={(ay) => {
                    setActiveNoteAyat(ay);
                    setIsNoteOpen(true);
                  }}
                  onOpenTafsir={(ayahNum) => {
                    setTafsirAyah(ayahNum);
                    setIsTafsirOpen(true);
                  }}
                  onShare={(ay) => {
                    setActiveShareAyat(ay);
                    setIsShareOpen(true);
                  }}
                  onCopy={handleCopyAyat}
                  copiedId={copiedAyahId}
                />
              );
            })}
          </div>

          {/* Bottom Surah Navigation (Previous / Next Surah) */}
          <div className="pt-8 flex items-center justify-between gap-4 border-t border-stone-200">
            {surah.suratSebelumnya ? (
              <button
                onClick={() => onNavigateSurah(surah.suratSebelumnya ? surah.suratSebelumnya.nomor : 1)}
                className="flex items-center gap-2 p-3 sm:px-4 rounded-2xl bg-white border border-stone-200 hover:border-[#0756C9]/40 text-stone-800 text-left transition shadow-xs group"
              >
                <ChevronLeft className="w-5 h-5 text-stone-400 group-hover:text-[#0756C9] transition" />
                <div>
                  <span className="text-[10px] text-stone-400 font-semibold uppercase block">
                    Surat Sebelumnya
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-stone-900 group-hover:text-[#0756C9] transition">
                    {surah.suratSebelumnya.namaLatin}
                  </span>
                </div>
              </button>
            ) : (
              <div />
            )}

            {surah.suratSelanjutnya ? (
              <button
                onClick={() => onNavigateSurah(surah.suratSelanjutnya ? surah.suratSelanjutnya.nomor : 114)}
                className="flex items-center gap-2 p-3 sm:px-4 rounded-2xl bg-white border border-stone-200 hover:border-[#0756C9]/40 text-stone-800 text-right transition shadow-xs group"
              >
                <div>
                  <span className="text-[10px] text-stone-400 font-semibold uppercase block">
                    Surat Selanjutnya
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-stone-900 group-hover:text-[#0756C9] transition">
                    {surah.suratSelanjutnya.namaLatin}
                  </span>
                </div>
                <ChevronRight className="w-5 h-5 text-stone-400 group-hover:text-[#0756C9] transition" />
              </button>
            ) : (
              <div />
            )}
          </div>
        </div>
      )}

      {/* Tafsir Modal */}
      {surah && (
        <TafsirModal
          isOpen={isTafsirOpen}
          surahNumber={surah.nomor}
          surahName={surah.namaLatin}
          initialAyahNumber={tafsirAyah}
          onClose={() => setIsTafsirOpen(false)}
          onNavigateToAyah={handleJumpToAyah}
        />
      )}

      {/* Personal Note Modal */}
      {surah && (
        <NoteModal
          isOpen={isNoteOpen}
          surahNumber={surah.nomor}
          surahName={surah.namaLatin}
          ayat={activeNoteAyat}
          onClose={() => setIsNoteOpen(false)}
          onSaved={() => setNotesVersion((v) => v + 1)}
        />
      )}

      {/* Share Modal */}
      {surah && (
        <ShareModal
          isOpen={isShareOpen}
          surahName={surah.namaLatin}
          surahNumber={surah.nomor}
          ayat={activeShareAyat}
          onClose={() => setIsShareOpen(false)}
        />
      )}
    </div>
  );
};
