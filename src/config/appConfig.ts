/**
 * KONFIGURASI UTAMA APLIKASI
 * Maj Qur’an
 */

export const APP_CONFIG = {
  appName: "Maj Qur’an",
  primaryColor: "#0756C9", // Biru laut utama
  theme: "light" as const,
  language: "id-ID" as const,
  tagline: "Dekat dengan Al-Qur’an, Setiap Hari.",
  logoUrl: "/icons/maj-quran-logo.png",
  version: "1.1.0",
  apiBaseUrl: "https://equran.id/api/v2",
  prayerAudio: {
    subuh: "https://wflq2j4mi1smqyku.public.blob.vercel-storage.com/adzan_subuh.mp3",
    adzanReguler: "https://wflq2j4mi1smqyku.public.blob.vercel-storage.com/adzan.mp3",
    imsak: "https://wflq2j4mi1smqyku.public.blob.vercel-storage.com/imsak.mp3",
    terbit: "https://wflq2j4mi1smqyku.public.blob.vercel-storage.com/ayam.mp3",
  },
  defaultPrayerSettings: {
    isEnabled: true,
    volume: 0.85,
    reminderType: 'audio_and_notification' as const,
    provinsi: 'DKI Jakarta',
    kabkota: 'Kota Jakarta',
    enabledPrayers: {
      imsak: true,
      subuh: true,
      terbit: true,
      dzuhur: true,
      ashar: true,
      maghrib: true,
      isya: true,
    },
  },
  colors: {
    primary: "#0756C9", // Biru laut utama
    secondary: "#0645A8", // Biru royal
    accent: "#168BFF", // Biru cerah
    navy: "#061A35", // Biru navy gelap
    cream: "#FDFBF5", // Putih susu
    surface: "#FFFFFF", // Putih bersih
    black: "#000000", // Hitam
    textPrimary: "#061A35",
    textSecondary: "#5E6B7C",
    border: "#E4E9F0",
    softBlue: "#EBF3FE", // Krem lembut biru muda
    focusRing: "#168BFF",
  },
  typography: {
    arabicFonts: [
      { id: "amiri", name: "Amiri (Khat Naskh Standar)", className: "font-arabic-amiri" },
      { id: "scheherazade", name: "Scheherazade New (Khat Utsmani)", className: "font-arabic-scheherazade" },
      { id: "lateef", name: "Lateef (Lembut & Anggun)", className: "font-arabic-lateef" },
    ],
    fontSizes: [
      { id: "sm", label: "Kecil", arabicClass: "text-2xl leading-loose", sizePx: 24 },
      { id: "md", label: "Standar", arabicClass: "text-3xl leading-loose", sizePx: 30 },
      { id: "lg", label: "Besar", arabicClass: "text-4xl leading-relaxed", sizePx: 36 },
      { id: "xl", label: "Ekstra Besar", arabicClass: "text-5xl leading-relaxed", sizePx: 44 },
    ],
  },
  qariList: [
    { id: "01", name: "Abdullah Al-Juhany", title: "Imam Masjidil Haram" },
    { id: "02", name: "Abdul-Muhsin Al-Qasim", title: "Imam Masjid Nabawi" },
    { id: "03", name: "Abdurrahman as-Sudais", title: "Imam Besar Masjidil Haram" },
    { id: "04", name: "Ibrahim Al-Dossari", title: "Qari Internasional" },
    { id: "05", name: "Misyari Rasyid Al-Afasi", title: "Qari & Imam Internasional" },
    { id: "06", name: "Yasser Al-Dosari", title: "Imam Masjidil Haram" },
  ],
};

export default APP_CONFIG;
