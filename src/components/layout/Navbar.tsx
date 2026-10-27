import React from 'react';
import APP_CONFIG from '../../config/appConfig';
import { PWAInstallButton } from '../common/PWAInstallButton';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string, params?: any) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate }) => {
  return (
    <header className="sticky top-0 z-40 bg-[#FDFBF5]/95 backdrop-blur-md border-b border-[#E4E9F0] transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-6">
        {/* Zone 1: Brand Wordmark with Maj Qur’an Logo */}
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-3 text-left group shrink-0 focus-visible:outline-[#0756C9] rounded-xl p-1 -ml-1 transition"
        >
          <img
            src={APP_CONFIG.logoUrl}
            alt="Logo Maj Qur’an"
            referrerPolicy="no-referrer"
            className="w-11 h-11 md:w-12 md:h-12 object-contain drop-shadow-xs transition-transform group-hover:scale-105"
          />
          <div className="flex flex-col">
            <span className="font-bold text-lg md:text-xl tracking-tight text-[#061A35] leading-none">
              {APP_CONFIG.appName}
            </span>
            <span className="text-[11px] text-[#5E6B7C] font-medium hidden sm:inline mt-0.5">
              {APP_CONFIG.tagline}
            </span>
          </div>
        </button>

        {/* Zone 2: Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <button
            onClick={() => onNavigate('home')}
            className={`whitespace-nowrap transition-colors py-1 ${
              currentPage === 'home'
                ? 'text-[#0756C9] font-bold border-b-2 border-[#0756C9]'
                : 'text-[#5E6B7C] hover:text-[#061A35]'
            }`}
          >
            Beranda
          </button>
          <button
            onClick={() => onNavigate('surahs')}
            className={`whitespace-nowrap transition-colors py-1 ${
              currentPage === 'surahs' || currentPage === 'reader'
                ? 'text-[#0756C9] font-bold border-b-2 border-[#0756C9]'
                : 'text-[#5E6B7C] hover:text-[#061A35]'
            }`}
          >
            Daftar Surat
          </button>
          <button
            onClick={() => onNavigate('prayer')}
            className={`whitespace-nowrap transition-colors py-1 ${
              currentPage === 'prayer'
                ? 'text-[#0756C9] font-bold border-b-2 border-[#0756C9]'
                : 'text-[#5E6B7C] hover:text-[#061A35]'
            }`}
          >
            Jadwal Salat
          </button>
          <button
            onClick={() => onNavigate('search')}
            className={`whitespace-nowrap transition-colors py-1 ${
              currentPage === 'search'
                ? 'text-[#0756C9] font-bold border-b-2 border-[#0756C9]'
                : 'text-[#5E6B7C] hover:text-[#061A35]'
            }`}
          >
            Pencarian
          </button>
          <button
            onClick={() => onNavigate('bookmarks')}
            className={`whitespace-nowrap transition-colors py-1 ${
              currentPage === 'bookmarks'
                ? 'text-[#0756C9] font-bold border-b-2 border-[#0756C9]'
                : 'text-[#5E6B7C] hover:text-[#061A35]'
            }`}
          >
            Tersimpan
          </button>
          <button
            onClick={() => onNavigate('settings')}
            className={`whitespace-nowrap transition-colors py-1 ${
              currentPage === 'settings'
                ? 'text-[#0756C9] font-bold border-b-2 border-[#0756C9]'
                : 'text-[#5E6B7C] hover:text-[#061A35]'
            }`}
          >
            Pengaturan
          </button>
        </nav>

        {/* Zone 3: Primary CTA */}
        <div className="flex items-center gap-2 shrink-0">
          <PWAInstallButton />
        </div>
      </div>
    </header>
  );
};
