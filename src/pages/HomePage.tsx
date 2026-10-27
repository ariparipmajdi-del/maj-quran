import React, { useState, useEffect } from 'react';
import APP_CONFIG from '../config/appConfig';
import { persistence } from '../storage/persistence';
import { LastRead, ReadingProgress } from '../types/quran';
import { usePrayerTimes } from '../hooks/usePrayerTimes';
import { BookOpen, Search, BookmarkCheck, Settings, ArrowRight, Sparkles, CheckCircle2, Clock, Volume2 } from 'lucide-react';

interface HomePageProps {
  onNavigate: (page: string, params?: any) => void;
  onOpenSurah: (surahNumber: number, ayahNumber?: number) => void;
  prayer?: ReturnType<typeof usePrayerTimes>;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onOpenSurah, prayer }) => {
  const [lastRead, setLastRead] = useState<LastRead | null>(null);
  const [progress, setProgress] = useState<ReadingProgress>(persistence.getProgress());
  const [bookmarksCount, setBookmarksCount] = useState<number>(0);
  const [notesCount, setNotesCount] = useState<number>(0);

  useEffect(() => {
    setLastRead(persistence.getLastRead());
    setProgress(persistence.getProgress());
    setBookmarksCount(persistence.getBookmarks().length);
    setNotesCount(persistence.getNotes().length);
  }, []);

  const progressPercentage = Math.min(
    100,
    Math.round((progress.ayatReadToday / progress.dailyTargetAyat) * 100)
  );

  const popularSurahs = [
    { number: 1, name: 'Al-Fatihah', arabic: 'الفاتحة', meaning: 'Pembukaan' },
    { number: 36, name: 'Yasin', arabic: 'يس', meaning: 'Ya Sin' },
    { number: 67, name: 'Al-Mulk', arabic: 'الملك', meaning: 'Kerajaan' },
    { number: 18, name: 'Al-Kahf', arabic: 'الكهف', meaning: 'Gua' },
    { number: 56, name: 'Al-Waqi’ah', arabic: 'الواقعة', meaning: 'Hari Kiamat' },
    { number: 55, name: 'Ar-Rahman', arabic: 'الرحمن', meaning: 'Yang Maha Pemurah' },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Brand Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#061A35] via-[#0756C9] to-[#0645A8] text-white p-6 sm:p-8 md:p-10 shadow-xl shadow-blue-950/20">
        {/* Subtle geometric pattern overlay */}
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="flex items-center gap-2 text-blue-200 text-xs font-semibold tracking-wider uppercase">
              <Sparkles className="w-4 h-4 text-[#168BFF]" />
              <span>Aplikasi Al-Qur’an Digital Indonesia</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
              {APP_CONFIG.appName}
            </h1>

            <p className="text-base sm:text-lg text-blue-100/90 font-medium leading-relaxed">
              “{APP_CONFIG.tagline}”
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => onNavigate('surahs')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-[#061A35] hover:bg-blue-50 font-bold text-sm shadow-md transition active:scale-95"
              >
                <BookOpen className="w-4 h-4 text-[#0756C9]" />
                <span>Buka 114 Surat</span>
              </button>

              <button
                onClick={() => onNavigate('prayer')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white backdrop-blur-xs font-semibold text-sm transition active:scale-95 border border-white/20"
              >
                <Clock className="w-4 h-4 text-cyan-300" />
                <span>Jadwal Salat & Adzan</span>
              </button>
            </div>
          </div>

          {/* Official Brand Logo */}
          <div className="shrink-0 flex items-center justify-center">
            <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full p-2 bg-white/15 backdrop-blur-md border border-white/25 shadow-2xl flex items-center justify-center">
              <img
                src={APP_CONFIG.logoUrl}
                alt="Logo Maj Qur’an"
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain filter drop-shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Widget: Jadwal Salat & Countdown */}
      {prayer && prayer.todaySchedule && (
        <section className="p-5 sm:p-6 bg-white rounded-3xl border border-stone-200/90 shadow-xs space-y-4 hover:border-blue-200 transition">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#EBF3FE] text-[#0756C9] flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-bold text-stone-900 text-sm">
                  Jadwal Salat Hari Ini — {prayer.settings.kabkota}
                </h2>
                <p className="text-xs text-stone-500">
                  {prayer.todaySchedule.hari}, {prayer.todaySchedule.tanggal_lengkap}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#EBF3FE] text-[#0645A8] text-xs font-medium">
                <Volume2 className="w-3.5 h-3.5 text-[#0756C9]" />
                <span>Adzan: {prayer.settings.isEnabled ? 'Aktif' : 'Mati'}</span>
              </div>
              <button
                onClick={() => onNavigate('prayer')}
                className="text-xs font-semibold text-[#0756C9] hover:text-[#0645A8] hover:underline"
              >
                Lihat Lengkap & Pengaturan
              </button>
            </div>
          </div>

          {/* Countdown & Times bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
            {[
              { key: 'imsak', label: 'Imsak', time: prayer.todaySchedule.imsak },
              { key: 'subuh', label: 'Subuh', time: prayer.todaySchedule.subuh },
              { key: 'terbit', label: 'Terbit', time: prayer.todaySchedule.terbit },
              { key: 'dzuhur', label: 'Dzuhur', time: prayer.todaySchedule.dzuhur },
              { key: 'ashar', label: 'Ashar', time: prayer.todaySchedule.ashar },
              { key: 'maghrib', label: 'Maghrib', time: prayer.todaySchedule.maghrib },
              { key: 'isya', label: 'Isya', time: prayer.todaySchedule.isya },
            ].map((item) => {
              const isNext = prayer.nextPrayer?.key === item.key;
              return (
                <div
                  key={item.key}
                  className={`p-2.5 rounded-xl border text-center transition ${
                    isNext
                      ? 'bg-[#EBF3FE] border-[#0756C9] ring-1 ring-[#0756C9]/40'
                      : 'bg-stone-50 border-stone-200'
                  }`}
                >
                  <span className="text-[11px] font-medium text-stone-500 block">
                    {item.label}
                  </span>
                  <span className="text-base font-extrabold text-stone-900 tabular-nums block mt-0.5">
                    {item.time}
                  </span>
                  {isNext && (
                    <span className="text-[9px] font-bold text-[#0756C9] uppercase tracking-wider block mt-0.5">
                      Berikutnya
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Grid: Lanjutkan Membaca & Progres Tilawah */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Card: Lanjutkan Membaca */}
        <div className="p-6 bg-white rounded-3xl border border-stone-200/90 shadow-xs flex flex-col justify-between hover:border-blue-200 transition">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0756C9]" />
                <h2 className="font-bold text-stone-900 text-sm">Terakhir Dibaca</h2>
              </div>
              <span className="text-xs text-stone-400 font-medium">
                {lastRead ? new Date(lastRead.timestamp).toLocaleDateString('id-ID', { dateStyle: 'medium' }) : 'Belum ada riwayat'}
              </span>
            </div>

            {lastRead ? (
              <div className="py-4 space-y-2">
                <div className="flex items-baseline justify-between">
                  <h3 className="text-xl font-bold text-[#061A35]">
                    {lastRead.surahName}
                  </h3>
                  <span className="font-arabic-amiri text-2xl font-bold text-[#0645A8]">
                    {lastRead.surahArabic}
                  </span>
                </div>
                <p className="text-sm text-stone-600">
                  Ayat ke-<span className="font-bold text-[#0756C9]">{lastRead.ayahNumber}</span> dari {lastRead.totalAyat} ayat
                </p>
              </div>
            ) : (
              <div className="py-6 text-center space-y-2">
                <p className="text-sm text-stone-600">
                  Anda belum memulai sesi membaca tilawah.
                </p>
                <p className="text-xs text-stone-400">
                  Mulai membaca sekarang dari Surat Al-Fatihah.
                </p>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              if (lastRead) {
                onOpenSurah(lastRead.surahNumber, lastRead.ayahNumber);
              } else {
                onOpenSurah(1, 1);
              }
            }}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#0756C9] hover:bg-[#0645A8] text-white font-bold text-sm transition active:scale-98 shadow-sm"
          >
            <span>{lastRead ? 'Lanjutkan Membaca' : 'Mulai Membaca Surat Pertama'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Card: Progres Tilawah Harian */}
        <div className="p-6 bg-white rounded-3xl border border-stone-200/90 shadow-xs flex flex-col justify-between hover:border-blue-200 transition">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <h2 className="font-bold text-stone-900 text-sm">Target Tilawah Hari Ini</h2>
              </div>
              <span className="text-xs text-stone-500 font-medium tabular-nums">
                {progress.ayatReadToday} / {progress.dailyTargetAyat} Ayat
              </span>
            </div>

            <div className="py-5 space-y-3">
              {/* Progress bar */}
              <div className="w-full bg-stone-100 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#0756C9] to-[#168BFF] transition-all duration-500 rounded-full"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-stone-500">
                <span>{progressPercentage}% tercapai</span>
                {progress.ayatReadToday >= progress.dailyTargetAyat ? (
                  <span className="font-bold text-emerald-600">Target hari ini tercapai! Alhamdulillah.</span>
                ) : (
                  <span>Sisa {Math.max(0, progress.dailyTargetAyat - progress.ayatReadToday)} ayat lagi</span>
                )}
              </div>
            </div>
          </div>

          {/* Quick stats inline */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-100 text-xs">
            <div className="p-2.5 rounded-xl bg-[#FDFBF5] border border-stone-100 flex items-center justify-between">
              <span className="text-stone-500">Bookmark</span>
              <span className="font-bold text-[#061A35] tabular-nums">{bookmarksCount}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#FDFBF5] border border-stone-100 flex items-center justify-between">
              <span className="text-stone-500">Catatan</span>
              <span className="font-bold text-[#061A35] tabular-nums">{notesCount}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Akses Cepat Surat Pilihan */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#061A35] tracking-tight">
            Surat Sering Dibaca
          </h2>
          <button
            onClick={() => onNavigate('surahs')}
            className="text-xs font-semibold text-[#0756C9] hover:text-[#0645A8] flex items-center gap-1"
          >
            <span>Semua 114 Surat</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {popularSurahs.map((s) => (
            <button
              key={s.number}
              onClick={() => onOpenSurah(s.number)}
              className="p-3.5 bg-white rounded-2xl border border-stone-200 hover:border-[#0756C9]/60 hover:shadow-xs transition text-left group flex flex-col justify-between h-28"
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-[11px] font-bold text-[#0645A8] tabular-nums">
                  #{s.number}
                </span>
                <span className="font-arabic-amiri text-lg font-bold text-stone-800 group-hover:text-[#0756C9] transition">
                  {s.arabic}
                </span>
              </div>
              <div>
                <p className="font-semibold text-stone-900 text-xs truncate group-hover:text-[#0756C9] transition">
                  {s.name}
                </p>
                <p className="text-[10px] text-stone-500 truncate">{s.meaning}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Quick Navigation Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => onNavigate('search')}
          className="p-5 bg-white rounded-2xl border border-stone-200/90 hover:border-[#0756C9]/50 hover:shadow-sm transition text-left flex items-start gap-4 group"
        >
          <div className="w-10 h-10 rounded-xl bg-[#EBF3FE] text-[#0756C9] flex items-center justify-center shrink-0 group-hover:bg-[#0756C9] group-hover:text-white transition">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-[#061A35] text-sm group-hover:text-[#0756C9] transition">
              Pencarian Pintar
            </h3>
            <p className="text-xs text-stone-500 mt-1 leading-relaxed">
              Cari kata terjemahan, nama surat, nomor ayat, atau teks Arab.
            </p>
          </div>
        </button>

        <button
          onClick={() => onNavigate('bookmarks')}
          className="p-5 bg-white rounded-2xl border border-stone-200/90 hover:border-[#0756C9]/50 hover:shadow-sm transition text-left flex items-start gap-4 group"
        >
          <div className="w-10 h-10 rounded-xl bg-[#EBF3FE] text-[#0756C9] flex items-center justify-center shrink-0 group-hover:bg-[#0756C9] group-hover:text-white transition">
            <BookmarkCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-[#061A35] text-sm group-hover:text-[#0756C9] transition">
              Bookmark & Catatan
            </h3>
            <p className="text-xs text-stone-500 mt-1 leading-relaxed">
              Koleksi ayat yang Anda simpan dan catatan tadabbur pribadi.
            </p>
          </div>
        </button>

        <button
          onClick={() => onNavigate('settings')}
          className="p-5 bg-white rounded-2xl border border-stone-200/90 hover:border-[#0756C9]/50 hover:shadow-sm transition text-left flex items-start gap-4 group"
        >
          <div className="w-10 h-10 rounded-xl bg-[#EBF3FE] text-[#0756C9] flex items-center justify-center shrink-0 group-hover:bg-[#0756C9] group-hover:text-white transition">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-[#061A35] text-sm group-hover:text-[#0756C9] transition">
              Pengaturan Tampilan
            </h3>
            <p className="text-xs text-stone-500 mt-1 leading-relaxed">
              Sesuaikan ukuran font Arab, pilihan qari, dan preferensi audio.
            </p>
          </div>
        </button>
      </section>
    </div>
  );
};
