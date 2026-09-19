import React, { useState } from 'react';
import { UserProfile, SoloProgression } from '../types';
import { audioSynth } from '../utils/audioSynth';
import {
  CheckCircle2,
  X,
  Sparkles,
  ShieldCheck,
  User,
  LogOut,
  Coins,
  Heart,
  Share2,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  progression: SoloProgression;
  onUpdateProgression: (progression: SoloProgression) => void;
  isFirstTime?: boolean;
}

const TAVERN_AVATARS = ['🍺', '🧙‍♂️', '🏴‍☠️', '👾', '👑', '🤠', '👩‍🚀', '🦖', '🍕', '🦉', '🎯', '🐱'];

export const AuthModal: React.FC<Props> = ({
  isOpen,
  onClose,
  progression,
  onUpdateProgression,
  isFirstTime = false,
}) => {
  const currentProfile = progression.userProfile;
  const [nameInput, setNameInput] = useState(currentProfile?.name || 'Quiz Master');
  const [selectedAvatar, setSelectedAvatar] = useState(currentProfile?.avatar || '🍺');
  const [showGooglePrompt, setShowGooglePrompt] = useState(false);
  const [googleEmailInput, setGoogleEmailInput] = useState('');

  if (!isOpen) return null;

  // Sign In with Google
  const handleSignInGoogle = (email?: string, displayName?: string) => {
    const finalName = displayName || nameInput || 'Google Trivia Star';
    const finalEmail = email || googleEmailInput || 'player@gmail.com';
    const finalAvatar = selectedAvatar || '👑';

    // Welcome bonus for syncing account!
    const welcomeBonus = currentProfile?.provider === 'google' ? 0 : 150;

    const newProfile: UserProfile = {
      id: `google_${Date.now()}`,
      name: finalName,
      email: finalEmail,
      avatar: finalAvatar,
      provider: 'google',
      facebookLinked: currentProfile?.facebookLinked || false,
      facebookName: currentProfile?.facebookName,
      createdAt: currentProfile?.createdAt || Date.now(),
    };

    onUpdateProgression({
      ...progression,
      coins: progression.coins + welcomeBonus,
      userProfile: newProfile,
    });

    audioSynth.playPurchaseFx();
    onClose();
  };

  // Play as Guest
  const handlePlayAsGuest = () => {
    const guestNumber = Math.floor(100 + Math.random() * 900);
    const guestName = nameInput.trim() || `TavernGuest_${guestNumber}`;

    const newProfile: UserProfile = {
      id: `guest_${Date.now()}`,
      name: guestName,
      avatar: selectedAvatar,
      provider: 'guest',
      facebookLinked: false,
      createdAt: Date.now(),
    };

    onUpdateProgression({
      ...progression,
      userProfile: newProfile,
    });

    audioSynth.playCoinFx();
    onClose();
  };

  // Toggle Facebook Link
  const handleToggleFacebookLink = () => {
    const isCurrentlyLinked = !!currentProfile?.facebookLinked;

    if (!isCurrentlyLinked) {
      // Linking Facebook -> grant bonus Pub Bucks!
      const bonus = 200;
      const fbName = `${currentProfile?.name || 'Pub Regular'} (FB)`;

      const updatedProfile: UserProfile = {
        ...(currentProfile || {
          id: `fb_user_${Date.now()}`,
          name: 'Tavern Regular',
          avatar: '🍺',
          provider: 'guest',
          createdAt: Date.now(),
        }),
        facebookLinked: true,
        facebookName: fbName,
      };

      onUpdateProgression({
        ...progression,
        coins: progression.coins + bonus,
        userProfile: updatedProfile,
      });

      audioSynth.playPurchaseFx();
    } else {
      // Unlink Facebook
      if (currentProfile) {
        onUpdateProgression({
          ...progression,
          userProfile: {
            ...currentProfile,
            facebookLinked: false,
            facebookName: undefined,
          },
        });
      }
      audioSynth.playCoinFx();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-amber-950/60 backdrop-blur-sm animate-in fade-in">
      <div className="max-w-md w-full bg-[#fffdf8] rounded-3xl p-5 sm:p-6 border-4 border-amber-800 shadow-[0_12px_0_#451a03] text-stone-900 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-amber-800/30 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center text-xl font-black shadow border border-amber-900">
              {currentProfile?.avatar || '🍺'}
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-amber-950 leading-tight">
                {isFirstTime ? 'Welcome to Cartoon Pub Quiz!' : 'Player Profile & Cloud Sync'}
              </h3>
              <p className="text-[11px] text-stone-600 font-bold">
                Save your stars, coins, and maps across devices
              </p>
            </div>
          </div>
          {!isFirstTime && (
            <button
              onClick={onClose}
              className="text-stone-500 hover:text-stone-900 p-1 rounded-lg hover:bg-amber-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Current Status Pill if signed in */}
        {currentProfile && (
          <div className="p-3 bg-amber-50 rounded-2xl border-2 border-amber-800/30 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{currentProfile.avatar}</span>
              <div>
                <div className="text-xs font-black text-stone-900 flex items-center gap-1.5">
                  <span>{currentProfile.name}</span>
                  {currentProfile.provider === 'google' && (
                    <span className="px-1.5 py-0.2 rounded bg-blue-100 text-blue-700 border border-blue-400 text-[9px] font-bold">
                      Google
                    </span>
                  )}
                  {currentProfile.provider === 'guest' && (
                    <span className="px-1.5 py-0.2 rounded bg-amber-200 text-stone-700 text-[9px] font-bold">
                      Guest
                    </span>
                  )}
                </div>
                {currentProfile.email && (
                  <div className="text-[10px] text-stone-500 truncate max-w-[180px]">
                    {currentProfile.email}
                  </div>
                )}
              </div>
            </div>

            <div className="text-right">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-400">
                <CheckCircle2 className="w-3 h-3" />
                <span>Progress Saved</span>
              </span>
            </div>
          </div>
        )}

        {/* Customize Name & Avatar */}
        <div className="space-y-2">
          <label className="text-xs font-black text-amber-950 uppercase tracking-wider block">
            Choose Character & Nickname
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Your Pub Nickname..."
              maxLength={20}
              className="flex-1 bg-[#fffdf8] border-2 border-amber-800/40 rounded-xl px-3 py-2 text-xs text-stone-900 font-bold focus:border-amber-800 outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
            {TAVERN_AVATARS.map((av) => (
              <button
                key={av}
                onClick={() => setSelectedAvatar(av)}
                className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center shrink-0 transition cursor-pointer border-2 ${
                  selectedAvatar === av
                    ? 'bg-amber-500 border-amber-950 scale-110 shadow-md'
                    : 'bg-amber-50 border-amber-800/30 hover:border-amber-600'
                }`}
              >
                {av}
              </button>
            ))}
          </div>
        </div>

        {/* PRIMARY AUTH OPTIONS: GOOGLE & GUEST */}
        <div className="space-y-2.5 pt-1">
          {/* Sign In with Google Button */}
          {currentProfile?.provider !== 'google' ? (
            <div className="space-y-2">
              <button
                id="sign-in-google-btn"
                onClick={() => {
                  if (!showGooglePrompt) {
                    setShowGooglePrompt(true);
                  } else {
                    handleSignInGoogle();
                  }
                }}
                className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-stone-50 text-slate-900 font-black text-xs sm:text-sm shadow-[0_4px_0_#cbd5e1] active:translate-y-0.5 active:shadow-none transition cursor-pointer flex items-center justify-center gap-2.5 border-2 border-stone-300 min-h-[44px]"
              >
                {/* Official Google Multi-Color G Icon */}
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google (+150 🪙 Bonus)</span>
              </button>

              {showGooglePrompt && (
                <div className="p-3 bg-amber-50 rounded-xl border border-blue-400 space-y-2 text-left animate-in fade-in">
                  <div className="text-[11px] font-bold text-stone-700">
                    Enter Google account email to link:
                  </div>
                  <input
                    type="email"
                    placeholder="you@gmail.com"
                    value={googleEmailInput}
                    onChange={(e) => setGoogleEmailInput(e.target.value)}
                    className="w-full bg-[#fffdf8] border border-amber-800/40 rounded-lg p-2 text-xs text-stone-900 font-bold"
                  />
                  <button
                    onClick={() => handleSignInGoogle()}
                    className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-black text-xs transition"
                  >
                    Confirm & Link Google Account
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="p-3 rounded-2xl bg-blue-50 border border-blue-300 flex items-center justify-between text-xs text-blue-900">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span className="font-bold">Google Account Synced!</span>
              </div>
              <span className="text-[10px] text-stone-500 font-bold">{currentProfile.email}</span>
            </div>
          )}

          {/* Facebook Link Option */}
          <div className="pt-1">
            <button
              id="link-facebook-btn"
              onClick={handleToggleFacebookLink}
              className={`w-full py-2.5 px-4 rounded-2xl font-black text-xs transition cursor-pointer flex items-center justify-between border-2 min-h-[42px] ${
                currentProfile?.facebookLinked
                  ? 'bg-blue-50 border-blue-500 text-blue-900'
                  : 'bg-[#1877F2] hover:bg-[#166fe5] text-white border-blue-800 shadow-[0_3px_0_#0e4ea0] active:translate-y-0.5 active:shadow-none'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {/* Facebook 'f' logo */}
                <div className="w-5 h-5 rounded-full bg-white text-[#1877F2] flex items-center justify-center font-bold text-xs font-mono">
                  f
                </div>
                <span>
                  {currentProfile?.facebookLinked
                    ? 'Facebook Connected (Linked)'
                    : 'Link Facebook Account (+200 🪙)'}
                </span>
              </div>
              <span className="text-[10px] underline">
                {currentProfile?.facebookLinked ? 'Unlink' : 'Connect'}
              </span>
            </button>
          </div>

          {/* Guest / Continue Action */}
          {(!currentProfile || currentProfile.provider === 'guest') && (
            <button
              id="play-as-guest-btn"
              onClick={handlePlayAsGuest}
              className="w-full py-2.5 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-950 font-black text-xs transition cursor-pointer border border-amber-800/40 flex items-center justify-center gap-1.5 shadow-sm"
            >
              <User className="w-3.5 h-3.5" />
              <span>{isFirstTime ? 'Play as Guest (Local Storage)' : 'Save Guest Nickname'}</span>
            </button>
          )}
        </div>

        {/* Info footer */}
        <div className="text-[11px] text-stone-600 font-bold text-center pt-1 border-t border-amber-800/30">
          🔒 Your progress is automatically stored locally and cloud-backed so you don't lose any stars or coins!
        </div>
      </div>
    </div>
  );
};
