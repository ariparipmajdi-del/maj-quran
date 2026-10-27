import React, { useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // Hide if already running in standalone PWA mode
  if (isInstalled) {
    return null;
  }

  // Chromium / Desktop / Android native prompt
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className={`flex items-center gap-1.5 rounded-xl bg-[#0756C9] text-white font-medium hover:bg-[#0645A8] transition shadow-xs active:scale-95 whitespace-nowrap shrink-0 ${
          compact ? 'px-2.5 py-1 text-xs' : 'px-3.5 py-2 text-xs md:text-sm'
        }`}
        title="Pasang aplikasi Maj Qur’an ke layar utama"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Install App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className={`flex items-center gap-1.5 rounded-xl border border-[#0756C9]/30 text-[#0756C9] bg-[#EBF3FE]/50 hover:bg-[#EBF3FE] transition font-medium whitespace-nowrap shrink-0 ${
            compact ? 'px-2.5 py-1 text-xs' : 'px-3.5 py-2 text-xs md:text-sm'
          }`}
          title="Petunjuk pasang di iPhone / iPad"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Install iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-stone-200">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <h3 className="text-base font-bold text-[#061A35]">Pasang di iPhone / iPad</h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 text-stone-400 hover:text-stone-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="mt-4 space-y-3 text-sm text-[#5E6B7C]">
                <div className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#EBF3FE] text-xs font-bold text-[#0645A8]">
                    1
                  </span>
                  <p>
                    Buka situs ini di <strong>Safari</strong>, lalu ketuk tombol <strong>Share</strong> di bilah navigasi bawah Safari.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#EBF3FE] text-xs font-bold text-[#0645A8]">
                    2
                  </span>
                  <p>
                    Gulir ke bawah dan pilih <strong>"Add to Home Screen"</strong> (Tambah ke Layar Utama).
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#EBF3FE] text-xs font-bold text-[#0645A8]">
                    3
                  </span>
                  <p>
                    Ketuk <strong>Add</strong> di pojok kanan atas. Ikon Maj Qur’an akan muncul di layar utama Anda.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-[#0756C9] py-2.5 text-sm font-semibold text-white hover:bg-[#0645A8] transition"
              >
                Mengerti
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
