import React, { useState } from 'react';
import {
  Clock,
  MapPin,
  Volume2,
  Play,
  Square,
  Bell,
  Check,
  Info,
  Calendar,
} from 'lucide-react';
import { usePrayerTimes, PRAYER_LABELS } from '../hooks/usePrayerTimes';
import { PrayerKey } from '../types/quran';

interface PrayerTimesPageProps {
  prayer: ReturnType<typeof usePrayerTimes>;
}

export const PrayerTimesPage: React.FC<PrayerTimesPageProps> = ({ prayer }) => {
  const {
    settings,
    updateSettings,
    provinces,
    cities,
    todaySchedule,
    nextPrayer,
    activeAudio,
    stopPrayerAudio,
    testAudio,
    requestNotificationPermission,
  } = prayer;

  const [notifGranted, setNotifGranted] = useState<boolean>(() => {
    return typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted';
  });

  const handleRequestNotif = async () => {
    const granted = await requestNotificationPermission();
    setNotifGranted(granted);
  };

  const prayerOrder: PrayerKey[] = ['imsak', 'subuh', 'terbit', 'dzuhur', 'ashar', 'maghrib', 'isya'];

  return (
    <div className="space-y-6 pb-16 max-w-4xl mx-auto">
      {/* Header & Location Selection */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#061A35] tracking-tight">
            Jadwal Salat & Adzan Otomatis
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Waktu salat akurat tersinkronisasi dengan data resmi Kemenag RI
          </p>
        </div>

        {/* Location selectors */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-stone-200 text-xs font-semibold text-stone-700 shadow-2xs">
            <MapPin className="w-3.5 h-3.5 text-[#0756C9] shrink-0" />
            <select
              aria-label="Pilih Provinsi"
              value={settings.provinsi}
              onChange={(e) => updateSettings({ provinsi: e.target.value })}
              className="bg-transparent text-[#061A35] font-semibold focus:outline-none cursor-pointer max-w-[130px] truncate"
            >
              {provinces.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-stone-200 text-xs font-semibold text-stone-700 shadow-2xs">
            <select
              aria-label="Pilih Kabupaten atau Kota"
              value={settings.kabkota}
              onChange={(e) => updateSettings({ kabkota: e.target.value })}
              className="bg-transparent text-[#061A35] font-semibold focus:outline-none cursor-pointer max-w-[140px] truncate"
            >
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Hero: Next Prayer Countdown */}
      {nextPrayer && (
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#061A35] via-[#0756C9] to-[#0645A8] text-white p-6 sm:p-8 shadow-xl shadow-blue-950/20">
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="text-xs font-bold text-blue-200 uppercase tracking-widest flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-cyan-300" />
                Salat Berikutnya
              </span>
              <div className="flex items-baseline gap-3">
                <h2 className="text-3xl sm:text-4xl font-black text-white">
                  {nextPrayer.name}
                </h2>
                <span className="text-2xl font-bold text-cyan-200 tabular-nums">
                  {nextPrayer.time} WIB
                </span>
              </div>
              <p className="text-xs text-blue-100/90">
                Wilayah {settings.kabkota}, {settings.provinsi}
              </p>
            </div>

            {/* Countdown Badge */}
            <div className="p-4 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 text-center sm:text-right shrink-0">
              <span className="text-[11px] font-semibold text-blue-100 block">
                Menuju waktu panggilan:
              </span>
              <span className="text-2xl sm:text-3xl font-extrabold text-white tabular-nums tracking-tight">
                {nextPrayer.countdownStr}
              </span>
            </div>
          </div>
        </section>
      )}

      {/* Today's 7 Times Schedule Grid */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#061A35] flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#0756C9]" />
            <span>Jadwal Hari Ini ({todaySchedule ? todaySchedule.hari : 'Hari Ini'})</span>
          </h2>
          <span className="text-xs text-stone-500 font-medium">
            {todaySchedule?.tanggal_lengkap || new Date().toISOString().split('T')[0]}
          </span>
        </div>

        {todaySchedule ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {prayerOrder.map((key) => {
              const time = todaySchedule[key];
              const isNext = nextPrayer?.key === key;

              return (
                <div
                  key={key}
                  className={`p-4 rounded-2xl border text-center transition flex flex-col justify-between h-32 ${
                    isNext
                      ? 'bg-[#EBF3FE] border-[#0756C9] shadow-sm ring-1 ring-[#0756C9]/40'
                      : 'bg-white border-stone-200 hover:border-blue-200'
                  }`}
                >
                  <div>
                    <span className="text-xs font-bold text-stone-700 block truncate">
                      {PRAYER_LABELS[key]}
                    </span>
                    <span className="text-xl font-extrabold text-[#061A35] tabular-nums mt-1 block">
                      {time}
                    </span>
                  </div>

                  <div className="flex items-center justify-center pt-2">
                    {key === 'imsak' && (
                      <span className="text-[10px] text-[#0645A8] font-semibold bg-[#EBF3FE] px-2 py-0.5 rounded-full border border-blue-100">
                        Sirine Imsak
                      </span>
                    )}
                    {key === 'terbit' && (
                      <span className="text-[10px] text-amber-800 font-semibold bg-amber-100 px-2 py-0.5 rounded-full">
                        Suara Ayam
                      </span>
                    )}
                    {key === 'subuh' && (
                      <span className="text-[10px] text-blue-900 font-semibold bg-blue-100 px-2 py-0.5 rounded-full">
                        Adzan Subuh
                      </span>
                    )}
                    {(key === 'dzuhur' || key === 'ashar' || key === 'maghrib' || key === 'isya') && (
                      <span className="text-[10px] text-stone-600 font-medium bg-stone-100 px-2 py-0.5 rounded-full">
                        Adzan Reguler
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center bg-white rounded-2xl border border-stone-200 text-stone-500">
            Memuat jadwal salat hari ini...
          </div>
        )}
      </section>

      {/* Audio & Notification Controls Card */}
      <section className="p-6 bg-white rounded-3xl border border-stone-200 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#EBF3FE] text-[#0756C9] flex items-center justify-center">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-[#061A35] text-sm">
                Pengaturan Audio Pengingat Salat
              </h3>
              <p className="text-xs text-stone-500">
                Pemicu audio otomatis saat waktu terjadwal tiba
              </p>
            </div>
          </div>

          {/* Master Toggle */}
          <button
            onClick={() => updateSettings({ isEnabled: !settings.isEnabled })}
            className={`w-12 h-6 rounded-full transition-colors relative ${
              settings.isEnabled ? 'bg-[#0756C9]' : 'bg-stone-300'
            }`}
            title="Aktifkan/nonaktifkan audio jadwal salat"
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform transform ${
                settings.isEnabled ? 'translate-x-6.5' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>

        {/* Volume Slider & Mode Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
          {/* Volume */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-stone-700">Volume Audio Pengingat</label>
              <span className="font-bold text-[#0645A8] tabular-nums">
                {Math.round(settings.volume * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.volume}
              onChange={(e) => updateSettings({ volume: parseFloat(e.target.value) })}
              className="w-full accent-[#0756C9] cursor-pointer"
            />
          </div>

          {/* Reminder Type */}
          <div className="space-y-2">
            <label className="font-bold text-stone-700">Jenis Pengingat</label>
            <div className="flex gap-1.5">
              {[
                { id: 'audio_and_notification', label: 'Audio & Notif' },
                { id: 'audio_only', label: 'Audio Saja' },
                { id: 'notification_only', label: 'Notifikasi' },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => updateSettings({ reminderType: m.id as any })}
                  className={`flex-1 py-1.5 px-2 rounded-xl border text-xs font-medium transition ${
                    settings.reminderType === m.id
                      ? 'border-[#0756C9] bg-[#EBF3FE] text-[#0645A8] font-bold'
                      : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Individual Toggles per Prayer */}
        <div className="pt-2 space-y-2">
          <label className="block text-xs font-bold text-stone-700">
            Aktifkan Pengingat untuk Waktu:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {prayerOrder.map((key) => {
              const isChecked = settings.enabledPrayers[key];
              return (
                <button
                  key={key}
                  onClick={() => {
                    updateSettings({
                      enabledPrayers: {
                        ...settings.enabledPrayers,
                        [key]: !isChecked,
                      },
                    });
                  }}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition ${
                    isChecked
                      ? 'border-[#0756C9] bg-[#EBF3FE] text-[#0645A8]'
                      : 'border-stone-200 text-stone-400 bg-stone-50'
                  }`}
                >
                  <span>{PRAYER_LABELS[key]}</span>
                  {isChecked ? <Check className="w-3.5 h-3.5" /> : null}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4 Dedicated Audio Test Buttons */}
        <div className="pt-3 border-t border-stone-100 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#061A35]">
              Uji Coba 4 Sumber Audio:
            </span>
            {activeAudio && activeAudio.isPlaying && (
              <button
                onClick={stopPrayerAudio}
                className="text-xs text-rose-600 font-bold hover:underline flex items-center gap-1"
              >
                <Square className="w-3 h-3 fill-current" />
                <span>Hentikan Uji Suara</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 text-xs">
            {/* Test Subuh */}
            <button
              onClick={() => (activeAudio?.isPlaying ? stopPrayerAudio() : testAudio('subuh'))}
              className="p-3 rounded-xl border border-stone-200 bg-stone-50 hover:bg-blue-50/50 hover:border-blue-200 text-stone-800 font-semibold flex items-center justify-between transition group"
            >
              <div>
                <span className="block font-bold">1. Adzan Subuh</span>
                <span className="text-[10px] text-stone-500">adzan_subuh.mp3</span>
              </div>
              <Play className="w-4 h-4 text-[#0756C9] group-hover:scale-110 transition" />
            </button>

            {/* Test Reguler */}
            <button
              onClick={() => (activeAudio?.isPlaying ? stopPrayerAudio() : testAudio('reguler'))}
              className="p-3 rounded-xl border border-stone-200 bg-stone-50 hover:bg-blue-50/50 hover:border-blue-200 text-stone-800 font-semibold flex items-center justify-between transition group"
            >
              <div>
                <span className="block font-bold">2. Adzan Reguler</span>
                <span className="text-[10px] text-stone-500">adzan.mp3</span>
              </div>
              <Play className="w-4 h-4 text-[#0756C9] group-hover:scale-110 transition" />
            </button>

            {/* Test Imsak */}
            <button
              onClick={() => (activeAudio?.isPlaying ? stopPrayerAudio() : testAudio('imsak'))}
              className="p-3 rounded-xl border border-stone-200 bg-stone-50 hover:bg-blue-50/50 hover:border-blue-200 text-stone-800 font-semibold flex items-center justify-between transition group"
            >
              <div>
                <span className="block font-bold">3. Sirine Imsak</span>
                <span className="text-[10px] text-stone-500">imsak.mp3</span>
              </div>
              <Play className="w-4 h-4 text-[#0756C9] group-hover:scale-110 transition" />
            </button>

            {/* Test Terbit */}
            <button
              onClick={() => (activeAudio?.isPlaying ? stopPrayerAudio() : testAudio('terbit'))}
              className="p-3 rounded-xl border border-stone-200 bg-stone-50 hover:bg-blue-50/50 hover:border-blue-200 text-stone-800 font-semibold flex items-center justify-between transition group"
            >
              <div>
                <span className="block font-bold">4. Suara Ayam (Terbit)</span>
                <span className="text-[10px] text-stone-500">ayam.mp3</span>
              </div>
              <Play className="w-4 h-4 text-[#0756C9] group-hover:scale-110 transition" />
            </button>
          </div>
        </div>

        {/* Browser / PWA Notification Permission Banner */}
        <div className="pt-3 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-[#FDFBF5] p-3 rounded-2xl border border-stone-100">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#0756C9] shrink-0" />
            <span className="text-stone-700">
              Status Notifikasi Perangkat:{' '}
              <strong className={notifGranted ? 'text-emerald-700' : 'text-amber-700'}>
                {notifGranted ? 'Diizinkan (Aktif)' : 'Belum Diizinkan'}
              </strong>
            </span>
          </div>

          {!notifGranted && (
            <button
              onClick={handleRequestNotif}
              className="px-3 py-1.5 rounded-lg bg-[#0756C9] text-white font-semibold hover:bg-[#0645A8] transition self-start sm:self-auto"
            >
              Izinkan Notifikasi
            </button>
          )}
        </div>

        {/* Realistis PWA & Autoplay Disclaimer */}
        <div className="p-3.5 rounded-2xl bg-[#FDFBF5] border border-stone-200 flex items-start gap-2.5 text-xs text-stone-600 leading-relaxed">
          <Info className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
          <p>
            <strong>Catatan Teknis Peramban:</strong> Sesuai kebijakan browser, audio adzan akan berbunyi otomatis saat tab/layar aplikasi dibuka. Ketika aplikasi diminimalkan di latar belakang, sistem akan mengirimkan <em>Web Notification</em> pada perangkat yang telah diizinkan.
          </p>
        </div>
      </section>
    </div>
  );
};
