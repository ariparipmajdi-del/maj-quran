import React, { useState, useEffect } from 'react';
import { persistence } from '../storage/persistence';
import { Bookmark, Note } from '../types/quran';
import { Bookmark as BookmarkIcon, FileText, Trash2, ArrowRight } from 'lucide-react';

interface BookmarksPageProps {
  onOpenAyah: (surahNumber: number, ayahNumber: number) => void;
}

export const BookmarksPage: React.FC<BookmarksPageProps> = ({ onOpenAyah }) => {
  const [activeTab, setActiveTab] = useState<'bookmarks' | 'notes'>('bookmarks');
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);

  const loadData = () => {
    setBookmarks(persistence.getBookmarks());
    setNotes(persistence.getNotes());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = persistence.removeBookmark(id);
    setBookmarks(updated);
  };

  const handleDeleteNote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = persistence.deleteNote(id);
    setNotes(updated);
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-[#061A35] tracking-tight">
          Ayat Tersimpan & Catatan
        </h1>
        <p className="text-sm text-stone-500 mt-1">
          Koleksi ayat penting dan catatan refleksi tadabbur pribadi Anda
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1 bg-stone-100 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('bookmarks')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'bookmarks'
              ? 'bg-white text-[#0645A8] shadow-2xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <BookmarkIcon className="w-3.5 h-3.5" />
          <span>Bookmark ({bookmarks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('notes')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'notes'
              ? 'bg-white text-[#0645A8] shadow-2xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Catatan ({notes.length})</span>
        </button>
      </div>

      {/* Bookmarks Tab Content */}
      {activeTab === 'bookmarks' && (
        <div className="space-y-3">
          {bookmarks.length === 0 ? (
            <div className="py-20 text-center space-y-3 bg-white rounded-3xl border border-stone-200 p-8">
              <BookmarkIcon className="w-10 h-10 text-stone-300 mx-auto" />
              <h3 className="text-base font-bold text-[#061A35]">Belum Ada Bookmark</h3>
              <p className="text-sm text-stone-500 max-w-sm mx-auto">
                Anda dapat menandai ayat favorit Anda saat membaca dengan menekan ikon bookmark di setiap ayat.
              </p>
            </div>
          ) : (
            bookmarks.map((b) => (
              <div
                key={b.id}
                onClick={() => onOpenAyah(b.surahNumber, b.ayahNumber)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onOpenAyah(b.surahNumber, b.ayahNumber);
                }}
                className="p-5 bg-white rounded-2xl border border-stone-200 hover:border-[#0756C9]/40 hover:shadow-md transition text-left cursor-pointer group space-y-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0756C9]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-[#EBF3FE] text-[#0645A8] flex items-center justify-center font-bold text-xs">
                      {b.surahNumber}
                    </span>
                    <div>
                      <h4 className="font-bold text-sm text-[#061A35] group-hover:text-[#0756C9] transition">
                        QS. {b.surahName} : Ayat {b.ayahNumber}
                      </h4>
                      <span className="text-[10px] text-stone-400">
                        Disimpan {new Date(b.createdAt).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-arabic-amiri text-lg font-bold text-[#0645A8]">
                      {b.surahArabic}
                    </span>
                    <button
                      onClick={(e) => handleDeleteBookmark(b.id, e)}
                      className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Hapus bookmark"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="font-arabic-amiri text-xl text-[#061A35] text-right leading-loose" dir="rtl">
                  {b.ayahArabic}
                </p>

                <p className="text-xs text-stone-600 line-clamp-2 italic">
                  "{b.ayahTranslation}"
                </p>

                <div className="flex items-center justify-end gap-1 text-xs font-semibold text-[#0756C9] group-hover:text-[#0645A8]">
                  <span>Buka Ayat</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Notes Tab Content */}
      {activeTab === 'notes' && (
        <div className="space-y-3">
          {notes.length === 0 ? (
            <div className="py-20 text-center space-y-3 bg-white rounded-3xl border border-stone-200 p-8">
              <FileText className="w-10 h-10 text-stone-300 mx-auto" />
              <h3 className="text-base font-bold text-[#061A35]">Belum Ada Catatan Pribadi</h3>
              <p className="text-sm text-stone-500 max-w-sm mx-auto">
                Tulis catatan tadabbur atau pengingat untuk ayat mana pun dengan menekan ikon dokumen pada kartu ayat.
              </p>
            </div>
          ) : (
            notes.map((n) => (
              <div
                key={n.id}
                onClick={() => onOpenAyah(n.surahNumber, n.ayahNumber)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onOpenAyah(n.surahNumber, n.ayahNumber);
                }}
                className="p-5 bg-white rounded-2xl border border-stone-200 hover:border-[#0756C9]/40 hover:shadow-md transition text-left cursor-pointer group space-y-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0756C9]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-[#EBF3FE] text-[#0645A8] flex items-center justify-center font-bold text-xs">
                      {n.surahNumber}
                    </span>
                    <div>
                      <h4 className="font-bold text-sm text-[#061A35] group-hover:text-[#0756C9] transition">
                        QS. {n.surahName} : Ayat {n.ayahNumber}
                      </h4>
                      <span className="text-[10px] text-stone-400">
                        Diperbarui {new Date(n.updatedAt).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleDeleteNote(n.id, e)}
                    className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="Hapus catatan"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-3.5 rounded-xl bg-[#FDFBF5] border border-stone-100 text-[#061A35] text-sm whitespace-pre-line leading-relaxed">
                  {n.content}
                </div>

                <div className="flex items-center justify-end gap-1 text-xs font-semibold text-[#0756C9] group-hover:text-[#0645A8]">
                  <span>Buka di Pembaca</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
