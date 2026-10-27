import React, { useState, useEffect } from 'react';
import { X, FileText, Trash2, Save } from 'lucide-react';
import { persistence } from '../../storage/persistence';
import { AyatItem } from '../../types/quran';

interface NoteModalProps {
  isOpen: boolean;
  surahNumber: number;
  surahName: string;
  ayat: AyatItem | null;
  onClose: () => void;
  onSaved: () => void;
}

export const NoteModal: React.FC<NoteModalProps> = ({
  isOpen,
  surahNumber,
  surahName,
  ayat,
  onClose,
  onSaved,
}) => {
  const [content, setContent] = useState<string>('');
  const [isSavedAlert, setIsSavedAlert] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && ayat) {
      const existing = persistence.getNote(surahNumber, ayat.nomorAyat);
      setContent(existing ? existing.content : '');
      setIsSavedAlert(false);
    }
  }, [isOpen, surahNumber, ayat]);

  if (!isOpen || !ayat) return null;

  const handleSave = () => {
    persistence.saveNote(surahNumber, surahName, ayat.nomorAyat, content);
    setIsSavedAlert(true);
    setTimeout(() => {
      setIsSavedAlert(false);
      onSaved();
      onClose();
    }, 600);
  };

  const handleDelete = () => {
    persistence.saveNote(surahNumber, surahName, ayat.nomorAyat, '');
    onSaved();
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="note-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in"
    >
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-[#FDFBF5]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#EBF3FE] text-[#0756C9] flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 id="note-modal-title" className="text-base font-bold text-[#061A35] leading-tight">
                Catatan Pribadi — QS. {surahName} : {ayat.nomorAyat}
              </h2>
              <p className="text-xs text-stone-500">
                Tersimpan aman di penyimpanan peramban Anda
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition"
            aria-label="Tutup catatan"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Verse excerpt */}
        <div className="px-6 py-3 bg-[#EBF3FE]/40 border-b border-blue-50 text-xs text-stone-600 line-clamp-2 italic">
          "{ayat.teksIndonesia}"
        </div>

        {/* Text Area */}
        <div className="p-6">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Tulis refleksi, tadabbur, atau catatan penting tentang ayat ini..."
            rows={6}
            className="w-full p-4 rounded-xl border border-stone-300 focus:border-[#0756C9] focus:ring-2 focus:ring-[#0756C9]/20 focus:outline-none text-sm text-stone-800 placeholder:text-stone-400 leading-relaxed resize-none transition"
          />

          {isSavedAlert && (
            <p className="mt-2 text-xs font-semibold text-emerald-600 animate-fade-in">
              Catatan berhasil disimpan!
            </p>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3 border-t border-stone-100 bg-[#FDFBF5] flex items-center justify-between">
          <button
            onClick={handleDelete}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition"
            title="Hapus catatan ini"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Hapus</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-lg transition"
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#0756C9] hover:bg-[#0645A8] rounded-lg transition shadow-xs active:scale-95"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Simpan Catatan</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
