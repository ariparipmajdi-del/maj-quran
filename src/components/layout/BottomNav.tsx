import React from 'react';
import { Home, BookOpen, Clock, Bookmark, Settings } from 'lucide-react';

interface BottomNavProps {
  currentPage: string;
  onNavigate: (page: string, params?: any) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentPage, onNavigate }) => {
  const navItems = [
    { id: 'home', label: 'Beranda', icon: Home },
    { id: 'surahs', label: 'Surat', icon: BookOpen },
    { id: 'prayer', label: 'Salat', icon: Clock },
    { id: 'bookmarks', label: 'Tersimpan', icon: Bookmark },
    { id: 'settings', label: 'Pengaturan', icon: Settings },
  ];

  return (
    <nav
      aria-label="Navigasi bawah mobile"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FDFBF5]/95 backdrop-blur-md border-t border-[#E4E9F0] pb-safe"
    >
      <div className="grid grid-cols-5 items-center h-15">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id || (item.id === 'surahs' && currentPage === 'reader');
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="flex flex-col items-center justify-center h-full min-h-[44px] min-w-[44px] transition-colors focus-visible:outline-none"
            >
              <Icon
                className={`w-5 h-5 transition-transform ${
                  isActive ? 'text-[#0756C9] stroke-[2.4] scale-110' : 'text-[#5E6B7C] stroke-[1.8]'
                }`}
              />
              <span
                className={`text-[10px] tracking-tight mt-1 whitespace-nowrap ${
                  isActive ? 'text-[#0756C9] font-bold' : 'text-[#5E6B7C] font-medium'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
