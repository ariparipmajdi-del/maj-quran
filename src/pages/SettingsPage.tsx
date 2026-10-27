import React, { useState } from 'react';
import APP_CONFIG from '../config/appConfig';
import { persistence } from '../storage/persistence';
import { UserSettings, ReadingProgress } from '../types/quran';
import { usePrayerTimes } from '../hooks/usePrayerTimes';
import {
  Type,
  Volume2,
  Target,
  Database,
  Info,
  Check,
  RotateCcw,
  Clock,
  Play,
  Square,
} from 'lucide-react';

interface SettingsPageProps {
  prayer?: ReturnType<typeof usePrayerTimes>;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ prayer }) => {
  const [settings, setSettings] = useState<UserSettings>(persistence.getSettings());
  const [progress, setProgress] = useState<ReadingProgress>(persistence.getProgress());
  const [, setTargetInput] = useState<number>(progress.dailyTargetAyat);
  const [showSavedToast, setShowSavedToast] = useState<boolean>(false);
  const [clearedCacheToast, setClearedCacheToast] = useState<boolean>(false);

  const updateSetting = (partial: Partial<UserSettings>) => {
    const updated = { ...settings, ...partial };
    setSettings(updated);
    persistence.saveSettings(updated);
    triggerSaved();
  };

  const handleUpdateTarget = (val: number) => {
    setTargetInput(val);
    const updated = persistence.setDailyTarget(val);
    setProgress(updated);
    triggerSaved();
  };

  const triggerSaved = () => {
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 1800);
  };

  const handleClearCache = () => {
    if (confirm('Apakah Anda yakin ingin menghapus data cache surat lokal? Bookmark dan catatan Anda akan tetap aman.')) {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('qi_surah_cache_') || key.startsWith('qi_surahs_list_cache_'))) {
          localStorage.removeItem(key);
        }
      }
      setClearedCacheToast(true);
      setTimeout(() => setClearedCacheToast(false), 2500);
    }
  };

  const handleResetSettings = () => {
    if (confirm('Kembalikan pengaturan ke setelan awal pabrik?')) {
      const def: UserSettings = {
        arabicFont: 'amiri',
        arabicFontSize: 'md',
        showTranslation: true,
        showTransliteration: true,
        autoScrollSpeed: 2,
        preferredQari: '05',
      };
      setSettings(def);
      persistence.saveSettings(def);
      triggerSaved();
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#061A35] tracking-tight">
            Pengaturan Aplikasi
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Kustomisasi antarmuka baca, audio murottal, dan target harian
          </p>
        </div>

        {showSavedToast && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold animate-fade-in">
            <Check className="w-3.5 h-3.5" />
            <span>Pengaturan Disimpan</span>
          </div>
        )}
      </div>

      <div className="space-y-5">
        {/* Section: Tipografi & Tampilan */}
        <section className="p-6 bg-white rounded-3xl border border-stone-200/90 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-stone-100">
            <div className="w-8 h-8 rounded-lg bg-[#EBF3FE] text-[#0756C9] flex items-center justify-center">
              <Type className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-[#061A35] text-sm">Tipografi & Tampilan Teks</h2>
              <p className="text-xs text-stone-500">Pilih font kaligrafi dan ukuran bacaan</p>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            {/* Khat Style */}
            <div>
              <label className="block text-stone-700 font-semibold mb-2">Pilihan Font Kaligrafi Arab</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {APP_CONFIG.typography.arabicFonts.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => updateSetting({ arabicFont: f.id as any })}
                    className={`p-3 rounded-xl border text-left transition ${
                      settings.arabicFont === f.id
                        ? 'border-[#0756C9] bg-[#EBF3FE] ring-1 ring-[#0756C9]'
                        : 'border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    <p className="font-bold text-[#061A35]">{f.name}</p>
                    <p className={`mt-2 text-2xl text-right ${f.className} text-[#061A35]`} dir="rtl">
                      بِسْمِ اللّٰهِ
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Font Size */}
            <div>
              <label className="block text-stone-700 font-semibold mb-2">Ukuran Huruf Arab</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {APP_CONFIG.typography.fontSizes.map((sz) => (
                  <button
                    key={sz.id}
                    onClick={() => updateSetting({ arabicFontSize: sz.id as any })}
                    className={`p-3 rounded-xl border text-center transition ${
                      settings.arabicFontSize === sz.id
                        ? 'border-[#0756C9] bg-[#EBF3FE] text-[#0645A8] font-bold ring-1 ring-[#0756C9]'
                        : 'border-stone-200 text-stone-700 hover:bg-stone-50 font-medium'
                    }`}
                  >
                    <span>{sz.label}</span>
                    <span className="block text-[10px] text-stone-400 mt-0.5">{sz.sizePx}px</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Translation & Latin Toggles */}
            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-[#FDFBF5] border border-stone-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-[#061A35] block">Tampilkan Terjemahan</span>
                  <span className="text-[11px] text-stone-500">Terjemahan resmi Kemenag RI</span>
                </div>
                <button
                  onClick={() => updateSetting({ showTranslation: !settings.showTranslation })}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    settings.showTranslation ? 'bg-[#0756C9]' : 'bg-stone-300'
                  }`}
                  aria-label="Toggle terjemahan"
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform transform ${
                      settings.showTranslation ? 'translate-x-5.5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FDFBF5] border border-stone-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-[#061A35] block">Tampilkan Transliterasi Latin</span>
                  <span className="text-[11px] text-stone-500">Teks bacaan latin bersuara</span>
                </div>
                <button
                  onClick={() => updateSetting({ showTransliteration: !settings.showTransliteration })}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    settings.showTransliteration ? 'bg-[#0756C9]' : 'bg-stone-300'
                  }`}
                  aria-label="Toggle transliterasi"
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform transform ${
                      settings.showTransliteration ? 'translate-x-5.5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Audio Murottal & Qari */}
        <section className="p-6 bg-white rounded-3xl border border-stone-200/90 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-stone-100">
            <div className="w-8 h-8 rounded-lg bg-[#EBF3FE] text-[#0756C9] flex items-center justify-center">
              <Volume2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-[#061A35] text-sm">Audio Murottal</h2>
              <p className="text-xs text-stone-500">Pilih qari favorit dari rekaman resmi</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs">
            {APP_CONFIG.qariList.map((q) => (
              <button
                key={q.id}
                onClick={() => updateSetting({ preferredQari: q.id })}
                className={`p-3 rounded-xl border text-left transition ${
                  settings.preferredQari === q.id
                    ? 'border-[#0756C9] bg-[#EBF3FE] ring-1 ring-[#0756C9]'
                    : 'border-stone-200 hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#061A35]">{q.name}</span>
                  {settings.preferredQari === q.id && (
                    <Check className="w-4 h-4 text-[#0756C9]" />
                  )}
                </div>
                <span className="text-[11px] text-stone-500 block mt-0.5">{q.title}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Section: Audio Jadwal Salat & Adzan Otomatis */}
        {prayer && (
          <section className="p-6 bg-white rounded-3xl border border-stone-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#EBF3FE] text-[#0756C9] flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-bold text-[#061A35] text-sm">Audio Jadwal Salat & Adzan</h2>
                  <p className="text-xs text-stone-500">
                    Wilayah: {prayer.settings.kabkota}, {prayer.settings.provinsi}
                  </p>
                </div>
              </div>

              {/* Master toggle */}
              <button
                onClick={() => prayer.updateSettings({ isEnabled: !prayer.settings.isEnabled })}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  prayer.settings.isEnabled ? 'bg-[#0756C9]' : 'bg-stone-300'
                }`}
                title="Aktifkan/nonaktifkan audio jadwal salat"
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform transform ${
                    prayer.settings.isEnabled ? 'translate-x-5.5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Volume Slider */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-stone-700">Volume Audio Salat</span>
                  <span className="font-bold text-[#0645A8] tabular-nums">
                    {Math.round(prayer.settings.volume * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={prayer.settings.volume}
                  onChange={(e) => prayer.updateSettings({ volume: parseFloat(e.target.value) })}
                  className="w-full accent-[#0756C9] cursor-pointer"
                />
              </div>

              {/* Reminder Type */}
              <div className="space-y-1.5">
                <span className="font-semibold text-stone-700">Jenis Pengingat</span>
                <div className="flex gap-2">
                  {[
                    { id: 'audio_and_notification', label: 'Audio & Notifikasi' },
                    { id: 'audio_only', label: 'Audio Saja' },
                    { id: 'notification_only', label: 'Notifikasi Saja' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => prayer.updateSettings({ reminderType: m.id as any })}
                      className={`flex-1 py-1.5 px-2 rounded-xl border text-xs font-medium transition ${
                        prayer.settings.reminderType === m.id
                          ? 'border-[#0756C9] bg-[#EBF3FE] text-[#0645A8] font-bold'
                          : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Test Audio Buttons */}
              <div className="pt-2 border-t border-stone-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#061A35]">Uji 4 Audio Sesuai Pemetaan:</span>
                  {prayer.activeAudio?.isPlaying && (
                    <button
                      onClick={prayer.stopPrayerAudio}
                      className="text-rose-600 font-bold hover:underline flex items-center gap-1 text-[11px]"
                    >
                      <Square className="w-3 h-3 fill-current" />
                      <span>Hentikan Uji Suara</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                  <button
                    onClick={() => (prayer.activeAudio?.isPlaying ? prayer.stopPrayerAudio() : prayer.testAudio('subuh'))}
                    className="p-2.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-blue-50/50 hover:border-blue-200 text-left transition flex items-center justify-between group"
                  >
                    <div>
                      <span className="font-bold block text-stone-900">Adzan Subuh</span>
                      <span className="text-[10px] text-stone-500">adzan_subuh.mp3</span>
                    </div>
                    <Play className="w-3.5 h-3.5 text-[#0756C9] group-hover:scale-110 transition shrink-0" />
                  </button>

                  <button
                    onClick={() => (prayer.activeAudio?.isPlaying ? prayer.stopPrayerAudio() : prayer.testAudio('reguler'))}
                    className="p-2.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-blue-50/50 hover:border-blue-200 text-left transition flex items-center justify-between group"
                  >
                    <div>
                      <span className="font-bold block text-stone-900">Adzan Reguler</span>
                      <span className="text-[10px] text-stone-500">adzan.mp3</span>
                    </div>
                    <Play className="w-3.5 h-3.5 text-[#0756C9] group-hover:scale-110 transition shrink-0" />
                  </button>

                  <button
                    onClick={() => (prayer.activeAudio?.isPlaying ? prayer.stopPrayerAudio() : prayer.testAudio('imsak'))}
                    className="p-2.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-blue-50/50 hover:border-blue-200 text-left transition flex items-center justify-between group"
                  >
                    <div>
                      <span className="font-bold block text-stone-900">Sirine Imsak</span>
                      <span className="text-[10px] text-stone-500">imsak.mp3</span>
                    </div>
                    <Play className="w-3.5 h-3.5 text-[#0756C9] group-hover:scale-110 transition shrink-0" />
                  </button>

                  <button
                    onClick={() => (prayer.activeAudio?.isPlaying ? prayer.stopPrayerAudio() : prayer.testAudio('terbit'))}
                    className="p-2.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-blue-50/50 hover:border-blue-200 text-left transition flex items-center justify-between group"
                  >
                    <div>
                      <span className="font-bold block text-stone-900">Suara Ayam</span>
                      <span className="text-[10px] text-stone-500">ayam.mp3</span>
                    </div>
                    <Play className="w-3.5 h-3.5 text-[#0756C9] group-hover:scale-110 transition shrink-0" />
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Section: Target Tilawah Harian */}
        <section className="p-6 bg-white rounded-3xl border border-stone-200/90 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-stone-100">
            <div className="w-8 h-8 rounded-lg bg-[#EBF3FE] text-[#0756C9] flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-[#061A35] text-sm">Target Tilawah Harian</h2>
              <p className="text-xs text-stone-500">Tentukan komitmen membaca harian Anda</p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {[5, 10, 20, 30, 50].map((count) => (
              <button
                key={count}
                onClick={() => handleUpdateTarget(count)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                  progress.dailyTargetAyat === count
                    ? 'bg-[#0756C9] text-white shadow-xs'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {count} Ayat / Hari
              </button>
            ))}
          </div>
        </section>

        {/* Section: Penyimpanan & Cache */}
        <section className="p-6 bg-white rounded-3xl border border-stone-200/90 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-stone-100">
            <div className="w-8 h-8 rounded-lg bg-[#EBF3FE] text-[#0756C9] flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-[#061A35] text-sm">Penyimpanan & Cache Offline</h2>
              <p className="text-xs text-stone-500">Kelola memori lokal pada perangkat Anda</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleClearCache}
              className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 text-xs font-semibold transition"
            >
              Hapus Cache Surat Lokal
            </button>
            <button
              onClick={handleResetSettings}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 text-xs font-semibold transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Setelan Awal</span>
            </button>
          </div>

          {clearedCacheToast && (
            <p className="text-xs font-semibold text-emerald-600 animate-fade-in">
              Cache surat lokal berhasil dibersihkan.
            </p>
          )}
        </section>

        {/* Section: Tentang Aplikasi */}
        <section className="p-6 bg-[#FDFBF5] rounded-3xl border border-stone-200 space-y-3 text-xs text-stone-600">
          <div className="flex items-center gap-2 text-[#061A35] font-bold text-sm">
            <Info className="w-4 h-4 text-[#0756C9]" />
            <span>Tentang {APP_CONFIG.appName}</span>
          </div>
          <p className="leading-relaxed">
            <strong>{APP_CONFIG.appName}</strong> ({APP_CONFIG.version}) — “{APP_CONFIG.tagline}”.
          </p>
          <div className="pt-1 space-y-1 text-stone-500">
            <p>• Data Al-Qur’an & Audio: equran.id API v2</p>
            <p>• Tafsir & Terjemahan: Kementerian Agama Republik Indonesia (Kemenag RI)</p>
            <p>• Rekaman Murottal: Abdullah Al-Juhany, Abdul-Muhsin Al-Qasim, Abdurrahman as-Sudais, Ibrahim Al-Dossari, Misyari Rasyid Al-Afasi, Yasser Al-Dosari</p>
            <p>• Standar PWA: Offline-ready, installable pada iOS, Android, macOS, dan Windows</p>
          </div>
        </section>
      </div>
    </div>
  );
};
