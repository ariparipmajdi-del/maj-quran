import React, { useState } from 'react';
import { X, Share2, Copy, Check } from 'lucide-react';
import { AyatItem } from '../../types/quran';

interface ShareModalProps {
  isOpen: boolean;
  surahName: string;
  surahNumber: number;
  ayat: AyatItem | null;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  surahName,
  surahNumber,
  ayat,
  onClose,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen || !ayat) return null;

  const formattedShareText = `${ayat.teksArab}\n\n"${ayat.teksIndonesia}"\n\n(QS. ${surahName} [${surahNumber}]: Ayat ${ayat.nomorAyat})\n\nDibagikan dari aplikasi Maj Qur’an: Dekat dengan Al-Qur’an, Setiap Hari.`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formattedShareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.warn('Failed to copy to clipboard', e);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `QS. ${surahName}: ${ayat.nomorAyat}`,
          text: formattedShareText,
          url: window.location.href,
        });
        onClose();
      } catch (err) {
        // User cancelled share or failed
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in"
    >
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-[#FDFBF5]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#EBF3FE] text-[#0756C9] flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h2 id="share-modal-title" className="text-base font-bold text-[#061A35] leading-tight">
                Bagikan Ayat
              </h2>
              <p className="text-xs text-stone-500">
                QS. {surahName} : Ayat {ayat.nomorAyat}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition"
            aria-label="Tutup dialog bagikan"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formatted Preview */}
        <div className="p-6">
          <div className="p-4 rounded-2xl bg-[#FDFBF5] border border-stone-200 text-[#061A35] space-y-3 font-mono text-xs max-h-60 overflow-y-auto leading-relaxed">
            <p className="text-right text-[#061A35] font-arabic-amiri text-lg leading-loose" dir="rtl">
              {ayat.teksArab}
            </p>
            <p className="text-stone-600 font-sans italic">
              "{ayat.teksIndonesia}"
            </p>
            <p className="text-[#0756C9] font-sans font-semibold">
              — QS. {surahName} : {ayat.nomorAyat}
            </p>
          </div>

          {copied && (
            <p className="mt-3 text-center text-xs font-semibold text-emerald-600">
              Teks ayat berhasil disalin ke papan klip!
            </p>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-stone-100 bg-[#FDFBF5] flex items-center justify-end gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 text-xs font-semibold transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Tersalin' : 'Salin Teks'}</span>
          </button>

          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <button
              onClick={handleNativeShare}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0756C9] hover:bg-[#0645A8] text-white text-xs font-semibold transition shadow-xs"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Bagikan ke Aplikasi</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
