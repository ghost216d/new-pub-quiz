import React from 'react';
import { Beer, Home, Tv, Users, LogOut, Copy, Check } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface Props {
  role: 'landing' | 'host' | 'player' | 'tv' | 'solo';
  roomCode?: string;
  teamName?: string;
  teamAvatar?: string;
  onHomeClick: () => void;
  onOpenTV?: () => void;
}

export const Header: React.FC<Props> = ({
  role,
  roomCode,
  teamName,
  teamAvatar,
  onHomeClick,
  onOpenTV,
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopyCode = () => {
    if (!roomCode) return;
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="app-main-header sticky top-0 z-40 bg-gradient-to-r from-sky-50 via-white to-amber-50 border-b-2 border-sky-300 px-3 sm:px-4 py-2 sm:py-2.5 pt-safe shadow-md">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-2 sm:gap-3">
        {/* Brand Logo & Name */}
        <button
          id="header-brand-home-btn"
          onClick={onHomeClick}
          className="flex items-center gap-2 sm:gap-2.5 text-left cursor-pointer hover:opacity-95 transition min-h-[44px]"
        >
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-b from-amber-300 to-amber-500 text-slate-950 flex items-center justify-center font-black text-xl sm:text-2xl border-3 border-amber-950 shadow-[0_3px_0_#78350f] shrink-0 animate-boing">
            🍺
          </div>
          <div>
            <h1 className="text-sm sm:text-lg font-cartoon text-sky-950 leading-tight tracking-wide">
              THE PUB QUIZ
            </h1>
            <span className="text-[10px] sm:text-[11px] font-cartoon text-amber-700 uppercase tracking-wider block">
              TAVERN TRIVIA LIVE 🍻
            </span>
          </div>
        </button>

        {/* Dynamic Controls & Badges */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 font-comic">
          {/* If inside room, show room code pill */}
          {roomCode && (
            <button
              onClick={handleCopyCode}
              title="Click to copy room code"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl cartoon-btn-amber text-xs font-cartoon tracking-wider transition cursor-pointer min-h-[36px]"
            >
              <span>{roomCode}</span>
              {copied ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Copy className="w-3.5 h-3.5 opacity-80" />}
            </button>
          )}

          {/* Quick TV toggle if host */}
          {role === 'host' && onOpenTV && (
            <button
              onClick={onOpenTV}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl cartoon-btn-purple text-xs font-cartoon tracking-wider cursor-pointer min-h-[36px]"
            >
              <Tv className="w-4 h-4 stroke-[2.5]" />
              <span>TV DISPLAY</span>
            </button>
          )}

          {/* Leave/Home button if inside a game */}
          {role !== 'landing' && (
            <button
              id="header-leave-game-btn"
              onClick={onHomeClick}
              className="p-2 sm:p-2.5 rounded-2xl bg-amber-100/90 hover:bg-white border-2 border-amber-900 text-amber-950 cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center transition shadow-[0_2px_0_#78350f]"
              title="Return to Main Menu"
            >
              <LogOut className="w-4 h-4 stroke-[2.5]" />
            </button>
          )}

          <PWAInstallButton />
        </div>
      </div>
    </header>
  );
};
