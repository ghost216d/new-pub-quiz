import React, { useState, useEffect, useCallback } from 'react';
import {
  MapPin,
  Star,
  Lock,
  Play,
  Trophy,
  ChevronLeft,
  ChevronRight,
  Coins,
  Heart,
  Sparkles,
  ShoppingBag,
  Zap,
  Info,
  User,
  CheckCircle2,
  Clock,
  Share2,
  Loader2,
  Beer,
  Crown,
  Smile,
  Footprints,
  Compass,
  Navigation,
} from 'lucide-react';
import { CartoonMap, MapLevel, SoloProgression, UserProfile, MapPlayerMarker } from '../types';
import {
  CARTOON_MAPS,
  MAP_REGULAR_PLAYERS,
  getAllMaps,
  checkAndReplenishLives,
} from '../data/cartoonMapsData';
import { audioSynth } from '../utils/audioSynth';
import { FunnyMapEntranceAnimation } from './FunnyMapEntranceAnimation';
import { AuthModal } from './AuthModal';
import confetti from 'canvas-confetti';

interface Props {
  progression: SoloProgression;
  onUpdateProgression: (progression: SoloProgression) => void;
  onSelectLevel: (level: MapLevel, map: CartoonMap) => void;
  onOpenShop: (tab?: 'lives' | 'bundles' | 'free') => void;
  onCustomSoloMode: () => void;
  onBackToHome: () => void;
  initialEntranceAnim?: boolean;
}

export const CartoonMapCanvas: React.FC<Props> = ({
  progression,
  onUpdateProgression,
  onSelectLevel,
  onOpenShop,
  onCustomSoloMode,
  onBackToHome,
  initialEntranceAnim = false,
}) => {
  const allMaps = getAllMaps(progression);
  const [activeMapId, setActiveMapId] = useState<string>(
    progression.currentMapId || allMaps[0]?.id || 'village_pub'
  );
  const [selectedLevel, setSelectedLevel] = useState<MapLevel | null>(null);
  const [activePlayerCard, setActivePlayerCard] = useState<MapPlayerMarker | null>(null);

  // Entrance animation state
  const [showEntranceAnim, setShowEntranceAnim] = useState<boolean>(initialEntranceAnim);

  // Auth / Profile modal state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // AI Map Generation states
  const [isGeneratingAiMap, setIsGeneratingAiMap] = useState(false);
  const [newlyDiscoveredMap, setNewlyDiscoveredMap] = useState<CartoonMap | null>(null);
  const [cheersToast, setCheersToast] = useState<string | null>(null);

  // Live countdown timer for hourly heart regen
  const [regenCountdown, setRegenCountdown] = useState<string>('');

  const activeMap = allMaps.find((m) => m.id === activeMapId) || allMaps[0] || CARTOON_MAPS[0];
  const activeMapIdx = allMaps.findIndex((m) => m.id === activeMapId);

  // Check if a map is unlocked
  const isMapUnlocked = useCallback(
    (map: CartoonMap) => {
      return (
        progression.totalStars >= map.requiredStars ||
        progression.unlockedMaps.includes(map.id)
      );
    },
    [progression.totalStars, progression.unlockedMaps]
  );

  // Check if a level is unlocked
  const isLevelUnlocked = useCallback(
    (level: MapLevel) => {
      if (!isMapUnlocked(activeMap)) return false;
      if (level.levelNumber === 1) return true;

      const prevLevel = activeMap.levels[level.levelNumber - 2];
      const prevCompleted = prevLevel && progression.completedLevels[prevLevel.id]?.passed;
      return prevCompleted || progression.totalStars >= level.requiredStars;
    },
    [activeMap, isMapUnlocked, progression.completedLevels, progression.totalStars]
  );

  // Hourly Life Regeneration Ticker
  useEffect(() => {
    const timer = setInterval(() => {
      // 1. Check if an hour has elapsed to restore life
      const { progression: updatedProg, regenerated } = checkAndReplenishLives(progression);
      if (regenerated) {
        onUpdateProgression(updatedProg);
        audioSynth.playLifeRegenSfx();
      }

      // 2. Format remaining time to next life
      if (updatedProg.lives < updatedProg.maxLives && updatedProg.nextHeartRegenTimestamp) {
        const remainingMs = Math.max(0, updatedProg.nextHeartRegenTimestamp - Date.now());
        const totalSec = Math.floor(remainingMs / 1000);
        const m = Math.floor(totalSec / 60);
        const s = totalSec % 60;
        setRegenCountdown(`${m}:${s < 10 ? '0' : ''}${s}`);
      } else {
        setRegenCountdown('Full ❤️');
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [progression, onUpdateProgression]);

  // AI-Powered Map Generator: Triggers when near end of map (Lv 4 or Lv 5) or on demand
  const triggerGenerateNextMap = useCallback(
    async (triggerReason: 'auto' | 'manual') => {
      if (isGeneratingAiMap) return;
      setIsGeneratingAiMap(true);

      try {
        const existingThemes = allMaps.map((m) => m.id);
        const res = await fetch('/api/ai/generate-map', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            existingThemes,
            totalStars: progression.totalStars,
            currentMapName: activeMap.name,
          }),
        });

        const data = await res.json();
        if (data && data.map) {
          const generatedMap: CartoonMap = data.map;
          const currentDynamic = progression.dynamicMaps || [];

          // Prevent duplicates
          if (!currentDynamic.some((m) => m.name === generatedMap.name || m.id === generatedMap.id)) {
            const updatedProg: SoloProgression = {
              ...progression,
              dynamicMaps: [...currentDynamic, generatedMap],
            };

            onUpdateProgression(updatedProg);
            setNewlyDiscoveredMap(generatedMap);
            audioSynth.playChampionFanfare();
            confetti({ particleCount: 50, spread: 80, origin: { y: 0.6 } });
          }
        }
      } catch (err) {
        console.warn('AI map generation failed gracefully:', err);
      } finally {
        setIsGeneratingAiMap(false);
      }
    },
    [activeMap.name, allMaps, isGeneratingAiMap, onUpdateProgression, progression]
  );

  // Automatically trigger AI map generation when user reaches near the end (Level 4 or 5 completed)
  useEffect(() => {
    const lvl4 = activeMap.levels.find((l) => l.levelNumber === 4);
    const lvl5 = activeMap.levels.find((l) => l.levelNumber === 5);
    const isNearEnd =
      (lvl4 && progression.completedLevels[lvl4.id]?.passed) ||
      (lvl5 && progression.completedLevels[lvl5.id]?.passed);

    // If near end of map, and we have fewer dynamic maps than completed maps, generate one!
    const dynamicCount = progression.dynamicMaps?.length || 0;
    if (isNearEnd && dynamicCount === 0 && !isGeneratingAiMap) {
      triggerGenerateNextMap('auto');
    }
  }, [activeMap.levels, isGeneratingAiMap, progression.completedLevels, progression.dynamicMaps?.length, triggerGenerateNextMap]);

  // Navigate maps
  const handlePrevMap = () => {
    if (activeMapIdx > 0) {
      const prev = allMaps[activeMapIdx - 1];
      setActiveMapId(prev.id);
      setSelectedLevel(null);
      audioSynth.playCoinFx();
      setShowEntranceAnim(true);
    }
  };

  const handleNextMap = () => {
    if (activeMapIdx < allMaps.length - 1) {
      const next = allMaps[activeMapIdx + 1];
      setActiveMapId(next.id);
      setSelectedLevel(null);
      audioSynth.playCoinFx();
      setShowEntranceAnim(true);
    }
  };

  // Pub crawl stop coordinates along the South London route (5 sequential stops)
  const LEVEL_COORDS = [
    { x: 18, y: 78 }, // Stop 1 (Bottom Left - The George Inn, Borough High St)
    { x: 44, y: 64 }, // Stop 2 (Mid-Left - The Anchor, Bankside)
    { x: 74, y: 50 }, // Stop 3 (Mid-Right - The Mayflower, Rotherhithe)
    { x: 38, y: 34 }, // Stop 4 (Upper Left - The Dog & Bell, Deptford)
    { x: 74, y: 18 }, // Stop 5 (Top Right - The Trafalgar Tavern, Greenwich)
  ];

  // Walking journey legs between consecutive pub crawl stops
  const LEG_INFOS = [
    { fromIdx: 0, toIdx: 1, label: '🚶 8m walk', distance: '0.4 mi', x: 31, y: 72 },
    { fromIdx: 1, toIdx: 2, label: '🚶 28m walk', distance: '1.4 mi', x: 60, y: 58 },
    { fromIdx: 2, toIdx: 3, label: '🚶 30m walk', distance: '1.6 mi', x: 55, y: 43 },
    { fromIdx: 3, toIdx: 4, label: '🚶 18m walk', distance: '0.9 mi', x: 56, y: 26 },
  ];

  // Retrieve fellow pub regulars for this realm
  const realmRegulars = MAP_REGULAR_PLAYERS[activeMap.id] || [
    {
      name: 'Tavern Regular',
      avatar: '🍺',
      levelNumber: 2,
      statusQuote: 'Exploring this new realm!',
      score: 340,
      color: '#F59E0B',
      favoriteDrink: 'House Cider',
    },
    {
      name: 'Buzzer Champion',
      avatar: '👑',
      levelNumber: 4,
      statusQuote: 'Boss is around the corner!',
      score: 720,
      color: '#8B5CF6',
      favoriteDrink: 'Golden Ale',
    },
  ];

  // Determine current user's highest active level on this map
  const userCurrentLevelNumber = (() => {
    for (let i = activeMap.levels.length; i >= 1; i--) {
      const lvl = activeMap.levels[i - 1];
      if (progression.completedLevels[lvl.id]?.passed) {
        return Math.min(5, i + 1);
      }
    }
    return 1;
  })();

  const userProfile = progression.userProfile || {
    id: 'guest_local',
    name: 'You',
    avatar: '🍺',
    provider: 'guest',
    createdAt: Date.now(),
  };

  // Handle Cheers to a player
  const handleCheersToPlayer = (player: MapPlayerMarker) => {
    audioSynth.playCorrectFx();
    setCheersToast(`🍻 You toasted with ${player.name}! +10 Pub Bucks`);
    onUpdateProgression({
      ...progression,
      coins: progression.coins + 10,
    });
    setTimeout(() => setCheersToast(null), 2500);
  };

  // Thematic South London pub crawl background scenery
  const renderMapScenery = () => {
    switch (activeMap.id) {
      case 'thames_riverside_crawl':
      case 'village_pub':
      default:
        return (
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">
            {/* The River Thames (Curving Waterway along South Bank) */}
            <path
              d="M 0 120 C 160 80, 280 150, 460 110 C 600 80, 700 130, 800 100 L 800 0 L 0 0 Z"
              fill="#0284c7"
              opacity="0.28"
            />
            {/* Gentle River Ripple Waves */}
            <path
              d="M 20 85 Q 80 75 140 85 T 260 85"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="2.5"
              opacity="0.5"
            />
            <path
              d="M 320 70 Q 380 60 440 70 T 560 70"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="2.5"
              opacity="0.45"
            />
            <path
              d="M 600 65 Q 660 55 720 65 T 800 65"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="2.5"
              opacity="0.5"
            />

            {/* River Thames Typography Watermark */}
            <text
              x="360"
              y="55"
              fill="#0369a1"
              fontSize="16"
              fontWeight="900"
              letterSpacing="6"
              opacity="0.4"
              transform="rotate(-2 360 55)"
            >
              〜〜 RIVER THAMES 〜〜
            </text>

            {/* South London Postcode & Area Signposts */}
            <g opacity="0.35">
              {/* Borough SE1 Signpost */}
              <rect x="35" y="520" width="70" height="24" rx="4" fill="#1c1917" stroke="#fbbf24" strokeWidth="1.5" />
              <text x="70" y="536" fill="#fef3c7" fontSize="9" fontWeight="bold" textAnchor="middle">SE1 • BOROUGH</text>

              {/* Bankside SE1 Signpost */}
              <rect x="290" y="420" width="75" height="24" rx="4" fill="#1c1917" stroke="#fbbf24" strokeWidth="1.5" />
              <text x="327" y="436" fill="#fef3c7" fontSize="9" fontWeight="bold" textAnchor="middle">SE1 • BANKSIDE</text>

              {/* Rotherhithe SE16 Signpost */}
              <rect x="630" y="340" width="85" height="24" rx="4" fill="#1c1917" stroke="#fbbf24" strokeWidth="1.5" />
              <text x="672" y="356" fill="#fef3c7" fontSize="9" fontWeight="bold" textAnchor="middle">SE16 • ROTHERHITHE</text>

              {/* Deptford SE8 Signpost */}
              <rect x="240" y="240" width="75" height="24" rx="4" fill="#1c1917" stroke="#fbbf24" strokeWidth="1.5" />
              <text x="277" y="256" fill="#fef3c7" fontSize="9" fontWeight="bold" textAnchor="middle">SE8 • DEPTFORD</text>

              {/* Greenwich SE10 Signpost */}
              <rect x="635" y="140" width="85" height="24" rx="4" fill="#1c1917" stroke="#fbbf24" strokeWidth="1.5" />
              <text x="677" y="156" fill="#fef3c7" fontSize="9" fontWeight="bold" textAnchor="middle">SE10 • GREENWICH</text>
            </g>

            {/* Historic Landmarks in Background */}
            {/* Tower Bridge Arches across water */}
            <g opacity="0.22" fill="#1e3a8a">
              <rect x="470" y="20" width="14" height="60" rx="2" />
              <rect x="510" y="20" width="14" height="60" rx="2" />
              <polygon points="465,20 477,8 489,20" />
              <polygon points="505,20 517,8 529,20" />
              <line x1="465" y1="42" x2="530" y2="42" stroke="#1e3a8a" strokeWidth="3" />
            </g>

            {/* Cutty Sark Clipper Masts near Greenwich */}
            <g opacity="0.25" stroke="#78350f" strokeWidth="2">
              <line x1="720" y1="20" x2="720" y2="85" />
              <line x1="740" y1="15" x2="740" y2="85" />
              <line x1="760" y1="22" x2="760" y2="85" />
              <polygon points="720,25 735,35 720,45" fill="#fef3c7" opacity="0.3" stroke="none" />
              <polygon points="740,20 755,30 740,40" fill="#fef3c7" opacity="0.3" stroke="none" />
            </g>

            {/* The Mayflower Ship at Rotherhithe */}
            <g opacity="0.25">
              <path d="M 680 290 Q 700 295 720 290 L 715 305 Q 700 310 685 305 Z" fill="#78350f" />
              <line x1="700" y1="265" x2="700" y2="295" stroke="#78350f" strokeWidth="2" />
              <polygon points="700,268 714,278 700,288" fill="#fef3c7" opacity="0.4" />
            </g>

            {/* Shakespeare's Globe thatch roof near Bankside */}
            <ellipse cx="260" cy="400" rx="30" ry="14" fill="#92400e" opacity="0.25" />
            <ellipse cx="260" cy="397" rx="22" ry="10" fill="#b45309" opacity="0.3" />

            {/* Borough Market Victorian ironwork arches */}
            <path d="M 50 490 Q 75 465 100 490" stroke="#78350f" strokeWidth="4" fill="none" opacity="0.25" />
            <path d="M 100 490 Q 125 465 150 490" stroke="#78350f" strokeWidth="4" fill="none" opacity="0.25" />
          </svg>
        );
      case 'bermondsey_peckham_trail':
        return (
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">
            {/* Victorian Railway Viaduct Arches (The Bermondsey Beer Mile) */}
            <path d="M 20 460 Q 60 410 100 460 L 100 520 L 20 520 Z" fill="#7c2d12" opacity="0.25" />
            <path d="M 100 460 Q 140 410 180 460 L 180 520 L 100 520 Z" fill="#7c2d12" opacity="0.25" />
            <path d="M 180 460 Q 220 410 260 460 L 260 520 L 180 520 Z" fill="#7c2d12" opacity="0.25" />
            {/* Brewery barrels & hops silhouette */}
            <ellipse cx="640" cy="450" rx="40" ry="25" fill="#d97706" opacity="0.2" />
            <rect x="620" y="440" width="40" height="20" fill="#92400e" opacity="0.2" rx="3" />
            {/* Peckham Rye Common greenery */}
            <path d="M 400 200 Q 600 140 800 190 L 800 300 L 400 300 Z" fill="#15803d" opacity="0.15" />
          </svg>
        );
      case 'south_west_heritage_crawl':
        return (
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">
            {/* Cleaver Square Georgian Townhouses & Boules Pitch */}
            <rect x="40" y="460" width="120" height="80" fill="#78350f" opacity="0.2" rx="4" />
            <polygon points="35,460 100,410 165,460" fill="#92400e" opacity="0.25" />
            {/* Brockwell Park & Dulwich Village Greens */}
            <path d="M 300 260 Q 550 180 800 240 L 800 360 L 300 360 Z" fill="#166534" opacity="0.18" />
            {/* Dulwich Tollgate gatehouse */}
            <rect x="680" y="140" width="50" height="50" fill="#854d0e" opacity="0.25" rx="3" />
          </svg>
        );
    }
  };

  return (
    <div id="cartoon-map-main-view" className="w-full max-w-4xl mx-auto space-y-4">
      {/* FUNNY ENTRANCE ANIMATION (plays when entering quest map) */}
      {showEntranceAnim && (
        <FunnyMapEntranceAnimation
          mapName={activeMap.name}
          mapIcon={activeMap.icon}
          onComplete={() => setShowEntranceAnim(false)}
        />
      )}

      {/* AUTH & PROFILE SYNC MODAL */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        progression={progression}
        onUpdateProgression={onUpdateProgression}
      />

      {/* CHEERS TOAST NOTIFICATION */}
      {cheersToast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-slate-900 border-2 border-amber-400 text-amber-300 px-4 py-2 rounded-2xl shadow-2xl text-xs font-black flex items-center gap-2 animate-in slide-in-from-top-4">
          <span>{cheersToast}</span>
        </div>
      )}

      {/* NEWLY DISCOVERED REALM BANNER */}
      {newlyDiscoveredMap && (
        <div className="bg-gradient-to-r from-purple-900/90 via-indigo-900/90 to-amber-900/90 border-3 border-amber-400 p-3 sm:p-4 rounded-3xl text-white shadow-xl flex flex-wrap items-center justify-between gap-3 animate-in slide-in-from-top-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 text-2xl flex items-center justify-center font-black shadow border border-amber-900 animate-bounce">
              {newlyDiscoveredMap.icon}
            </div>
            <div>
              <div className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-500/40">
                <Sparkles className="w-3 h-3" />
                <span>AI Mapmaker Discovered New Realm!</span>
              </div>
              <h3 className="text-base font-black leading-tight text-white mt-0.5">
                {newlyDiscoveredMap.name}
              </h3>
              <p className="text-xs text-slate-300">{newlyDiscoveredMap.subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActiveMapId(newlyDiscoveredMap.id);
                setNewlyDiscoveredMap(null);
                setShowEntranceAnim(true);
                audioSynth.playCoinFx();
              }}
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition cursor-pointer shadow-md"
            >
              Explore New Realm!
            </button>
            <button
              onClick={() => setNewlyDiscoveredMap(null)}
              className="p-2 text-slate-400 hover:text-white rounded-lg"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* TOP HUD: User Profile, Lives Countdown, Coins, Stars & Shop (Light English Tavern Style) */}
      <div className="bg-[#fffdf8] p-2.5 sm:p-3.5 rounded-3xl border-4 border-amber-950 shadow-[0_6px_0_#451a03] flex flex-wrap items-center justify-between gap-2 sm:gap-3 text-stone-900">
        {/* Left: Back & User Account Profile Pill */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            id="map-back-home-btn"
            onClick={onBackToHome}
            className="px-2.5 py-1.5 rounded-xl bg-amber-100 hover:bg-white text-stone-900 font-cartoon text-xs transition cursor-pointer flex items-center gap-1 border-2 border-amber-800 shadow-sm"
          >
            <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">Main Menu</span>
          </button>

          {/* User Profile Sync Button */}
          <button
            id="user-profile-sync-btn"
            onClick={() => setIsAuthModalOpen(true)}
            className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-amber-100/90 hover:bg-white border-2 border-amber-800 transition cursor-pointer group text-left shadow-sm"
          >
            <span className="text-lg animate-boing">{userProfile.avatar}</span>
            <div className="hidden sm:block">
              <div className="text-[11px] font-black text-amber-950 flex items-center gap-1 leading-tight">
                <span>{userProfile.name}</span>
                {userProfile.provider === 'google' ? (
                  <span className="text-[9px] text-blue-700 bg-blue-100 px-1 rounded border border-blue-400">
                    Google
                  </span>
                ) : (
                  <span className="text-[9px] text-stone-600 font-bold">Guest</span>
                )}
              </div>
              <div className="text-[9px] text-emerald-700 font-black flex items-center gap-0.5">
                <CheckCircle2 className="w-2.5 h-2.5" />
                <span>Saved</span>
              </div>
            </div>
          </button>

          {/* Facebook Link Quick Badge */}
          <button
            onClick={() => setIsAuthModalOpen(true)}
            title="Link Facebook Account"
            className={`px-2 py-1 rounded-xl text-[10px] font-black transition cursor-pointer flex items-center gap-1 border shadow-sm ${
              userProfile.facebookLinked
                ? 'bg-blue-100 text-blue-900 border-blue-600'
                : 'bg-blue-50 hover:bg-blue-100 text-blue-800 border-blue-400'
            }`}
          >
            <span className="font-black font-mono">f</span>
            <span className="hidden md:inline">
              {userProfile.facebookLinked ? 'Linked' : 'Link FB (+200 🪙)'}
            </span>
          </button>
        </div>

        {/* Center: Hearts with Hourly Regen Timer & Pub Bucks */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Hearts / Lives with Hourly Countdown */}
          <div className="flex items-center gap-1.5 bg-rose-100 border-2 border-rose-400 px-2.5 py-1 rounded-2xl shadow-sm">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: progression.maxLives }).map((_, i) => (
                <Heart
                  key={i}
                  className={`w-4 h-4 sm:w-4.5 sm:h-4.5 transition-transform ${
                    i < progression.lives
                      ? 'text-rose-500 fill-rose-500 animate-pulse'
                      : 'text-stone-300 fill-stone-200 opacity-60'
                  }`}
                />
              ))}
            </div>
            <div className="flex flex-col text-left">
              <span className="font-cartoon font-black text-xs sm:text-sm text-rose-950 leading-none">
                {progression.lives}/{progression.maxLives}
              </span>
              {progression.lives < progression.maxLives && (
                <span className="text-[9px] font-bold text-rose-800 flex items-center gap-0.5 mt-0.5">
                  <Clock className="w-2.5 h-2.5" />
                  <span>+1 in {regenCountdown}</span>
                </span>
              )}
            </div>
            <button
              onClick={() => onOpenShop('lives')}
              title="Refill Lives in Shop"
              className="w-5 h-5 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center text-xs font-black transition cursor-pointer shadow ml-1"
            >
              +
            </button>
          </div>

          {/* Fake Money / Pub Bucks */}
          <div className="flex items-center gap-1.5 bg-amber-100 border-2 border-amber-400 px-2.5 py-1 rounded-2xl shadow-sm">
            <Coins className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-amber-600 fill-amber-500" />
            <span className="font-cartoon font-black text-xs sm:text-sm text-amber-950">
              {progression.coins.toLocaleString()}
            </span>
            <button
              id="open-shop-quick-btn"
              onClick={() => onOpenShop('bundles')}
              className="ml-1 px-2 py-0.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-[10px] font-cartoon transition cursor-pointer shadow uppercase tracking-wider flex items-center gap-1 border border-amber-950"
            >
              <ShoppingBag className="w-3 h-3" />
              <span>Shop</span>
            </button>
          </div>

          {/* Total Stars */}
          <div className="flex items-center gap-1 bg-yellow-100 border-2 border-yellow-400 px-2 py-1 rounded-2xl shadow-sm">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-400 animate-spin-slow" />
            <span className="font-cartoon font-black text-xs sm:text-sm text-amber-950">
              {progression.totalStars}
            </span>
          </div>
        </div>

        {/* Right: AI Realm Generator / Replay Entrance Anim / Custom Solo Mode */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* AI Generate New Map Button */}
          <button
            onClick={() => triggerGenerateNextMap('manual')}
            disabled={isGeneratingAiMap}
            title="A.I. automatically creates more tavern maps as you reach near the end!"
            className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 disabled:opacity-50 text-white font-cartoon text-xs transition cursor-pointer border-2 border-emerald-800 shadow-sm flex items-center gap-1 min-h-[36px]"
          >
            {isGeneratingAiMap ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span className="hidden sm:inline">Brewing Realm...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
                <span className="hidden sm:inline">AI Brew Realm</span>
              </>
            )}
          </button>

          <button
            onClick={onCustomSoloMode}
            className="px-2.5 py-1.5 rounded-xl cartoon-btn-purple text-xs font-cartoon transition cursor-pointer flex items-center gap-1 min-h-[36px] shadow-sm"
          >
            <Zap className="w-3.5 h-3.5 text-yellow-300" />
            <span className="hidden sm:inline">Custom AI Quiz</span>
            <span className="sm:hidden">Custom</span>
          </button>
        </div>
      </div>

      {/* World Map Realm Selector Banner (Light English Pub Wood Style) */}
      <div className="bg-[#fffdf8] rounded-3xl p-3 sm:p-3.5 border-4 border-amber-950 shadow-[0_6px_0_#451a03] space-y-2.5">
        {/* World Carousel / Switcher */}
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={handlePrevMap}
            disabled={activeMapIdx === 0}
            className="p-2 rounded-2xl bg-amber-100 hover:bg-white disabled:opacity-30 text-amber-950 transition cursor-pointer border-2 border-amber-800 shadow-sm min-w-[38px] flex items-center justify-center"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
          </button>

          {/* World Information Card */}
          <div className="flex-1 text-center min-w-0">
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl animate-beer-slosh inline-block">{activeMap.icon}</span>
              <h2 className="text-base sm:text-xl font-cartoon text-amber-950 tracking-wide truncate">
                {activeMap.name}
              </h2>
              {activeMap.isAiGenerated && (
                <span className="px-2 py-0.5 rounded-full bg-purple-100 border border-purple-400 text-[10px] font-cartoon text-purple-900 flex items-center gap-1 shadow-sm">
                  <Sparkles className="w-3 h-3 text-purple-600" />
                  <span>AI Realm</span>
                </span>
              )}
              {!isMapUnlocked(activeMap) && (
                <span className="px-2 py-0.5 rounded-full bg-amber-100 border border-amber-400 text-[10px] font-bold text-amber-950 flex items-center gap-1 shadow-sm">
                  <Lock className="w-3 h-3 text-amber-700" />
                  <span>Needs {activeMap.requiredStars} ⭐</span>
                </span>
              )}
            </div>
            <p className="text-[11px] sm:text-xs text-stone-600 font-bold truncate mt-0.5">{activeMap.subtitle}</p>
          </div>

          <button
            onClick={handleNextMap}
            disabled={activeMapIdx === allMaps.length - 1}
            className="p-2 rounded-2xl bg-amber-100 hover:bg-white disabled:opacity-30 text-amber-950 transition cursor-pointer border-2 border-amber-800 shadow-sm min-w-[38px] flex items-center justify-center"
          >
            <ChevronRight className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* World Dots / Indicators */}
        <div className="flex items-center justify-center gap-1.5 pt-0.5 overflow-x-auto scrollbar-none py-1">
          {allMaps.map((map) => {
            const isCurrent = map.id === activeMapId;
            const isUnlocked = isMapUnlocked(map);
            return (
              <button
                key={map.id}
                onClick={() => {
                  setActiveMapId(map.id);
                  setSelectedLevel(null);
                  setShowEntranceAnim(true);
                  audioSynth.playCoinFx();
                }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-cartoon transition cursor-pointer shrink-0 border-2 ${
                  isCurrent
                    ? 'cartoon-btn-amber shadow-sm scale-105'
                    : isUnlocked
                    ? 'bg-amber-100/90 text-stone-800 border-amber-800/40 hover:bg-white'
                    : 'bg-amber-50 text-stone-400 border-stone-300'
                }`}
              >
                <span>{map.icon}</span>
                <span className="hidden md:inline">{map.name.split(' ')[0] || map.name}</span>
                {!isUnlocked && <Lock className="w-2.5 h-2.5 text-stone-500 ml-0.5" />}
              </button>
            );
          })}
        </div>

        {/* SOUTH LONDON PUB CRAWL PASSPORT & ROUTE GUIDE */}
        <div className="mt-2 pt-2.5 border-t-2 border-amber-900/20 bg-amber-50/80 rounded-2xl p-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">🍺</span>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-cartoon uppercase tracking-wider text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-md border border-amber-800/40">
                    South London Pub Crawl Route
                  </span>
                  {activeMap.totalDistance && (
                    <span className="text-[10px] font-bold text-stone-700 bg-stone-100 px-1.5 py-0.5 rounded border border-stone-300">
                      📍 {activeMap.totalDistance}
                    </span>
                  )}
                </div>
                <div className="text-xs font-cartoon text-amber-950 mt-0.5">
                  {activeMap.startArea && activeMap.endArea
                    ? `${activeMap.startArea} ➔ ${activeMap.endArea}`
                    : activeMap.name}
                </div>
              </div>
            </div>

            {/* Walking Stats Badge */}
            <div className="flex items-center gap-2 text-[11px] font-bold text-stone-700 bg-white px-2.5 py-1 rounded-xl border border-amber-800/30 shadow-sm">
              <Footprints className="w-3.5 h-3.5 text-amber-700" />
              <span>5 Historic Pubs in Geographic Order</span>
            </div>
          </div>

          {/* Pint Stamp Cards (5 Stops) */}
          <div className="grid grid-cols-5 gap-1.5 pt-1">
            {activeMap.levels.map((lvl, idx) => {
              const progress = progression.completedLevels[lvl.id];
              const isCompleted = !!progress?.passed;
              const isSelected = selectedLevel?.id === lvl.id;
              const isCurrent = userCurrentLevelNumber === lvl.levelNumber;
              const unlocked = isLevelUnlocked(lvl);

              return (
                <button
                  key={lvl.id}
                  onClick={() => {
                    setSelectedLevel(lvl);
                    audioSynth.playCoinFx();
                  }}
                  className={`p-1.5 sm:p-2 rounded-xl border-2 text-center transition cursor-pointer flex flex-col items-center justify-center gap-0.5 min-h-[56px] ${
                    isSelected
                      ? 'ring-2 ring-amber-600 bg-amber-200/90 border-amber-900 shadow'
                      : isCompleted
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-950'
                      : isCurrent
                      ? 'bg-amber-100 border-amber-500 text-amber-950 animate-pulse'
                      : unlocked
                      ? 'bg-white border-amber-300 text-stone-800 hover:bg-amber-50'
                      : 'bg-stone-100 border-stone-300 text-stone-400 opacity-70'
                  }`}
                  title={`${lvl.pubName || lvl.name} - Stop ${idx + 1}`}
                >
                  <div className="text-base sm:text-lg select-none">
                    {isCompleted ? '🍺' : isCurrent ? '🍻' : unlocked ? lvl.icon : '🔒'}
                  </div>
                  <span className="text-[9px] sm:text-[10px] font-black leading-tight truncate w-full">
                    {lvl.pubName ? lvl.pubName.replace('The ', '') : `Stop ${lvl.levelNumber}`}
                  </span>
                  <span className="text-[8px] text-stone-500 font-bold leading-none">
                    {lvl.postcode ? lvl.postcode.split(' ')[0] : `Lv.${lvl.levelNumber}`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Interactive Cartoon Map Board */}
      <div
        id="cartoon-map-canvas-board"
        className={`relative w-full aspect-[4/3] sm:aspect-[16/10] max-h-[560px] rounded-3xl overflow-hidden border-4 border-amber-500 shadow-[0_12px_0_#78350f] bg-gradient-to-b ${activeMap.bgGradient}`}
      >
        {/* Scenery Vector Elements */}
        {renderMapScenery()}

        {/* Winding S-Curve Cobblestone Pub Crawl Path (SVG) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Cobblestone Base Path */}
          <path
            d="M 18 78 C 18 68, 44 72, 44 64 C 44 56, 74 58, 74 50 C 74 40, 38 42, 38 34 C 38 24, 74 26, 74 18"
            fill="none"
            stroke="#451a03"
            strokeWidth="5"
            strokeLinecap="round"
            opacity="0.35"
          />
          {/* Dotted Walking Trail */}
          <path
            d="M 18 78 C 18 68, 44 72, 44 64 C 44 56, 74 58, 74 50 C 74 40, 38 42, 38 34 C 38 24, 74 26, 74 18"
            fill="none"
            stroke={activeMap.pathColor || '#b45309'}
            strokeWidth="3.5"
            strokeDasharray="4 3"
            strokeLinecap="round"
            opacity="0.9"
          />
        </svg>

        {/* Walking Leg Distance & ETA Badges between consecutive pubs */}
        {LEG_INFOS.map((leg, lIdx) => (
          <div
            key={`leg-${lIdx}`}
            style={{
              left: `${leg.x}%`,
              top: `${leg.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
            className="absolute z-10 pointer-events-none hidden sm:flex items-center gap-1 bg-amber-950/80 text-amber-200 border border-amber-400/60 px-2 py-0.5 rounded-full text-[9px] font-black shadow backdrop-blur-xs select-none"
          >
            <span>{leg.label}</span>
          </div>
        ))}

        {/* Pub Signboard Nodes & Other Player Markers */}
        {activeMap.levels.map((level, idx) => {
          const coords = LEVEL_COORDS[idx] || { x: 50, y: 50 };
          const unlocked = isLevelUnlocked(level);
          const progress = progression.completedLevels[level.id];
          const isCompleted = !!progress?.passed;
          const stars = progress?.stars || 0;
          const isSelected = selectedLevel?.id === level.id;
          const isBoss = level.levelNumber === 5;

          // Find other tavern players currently on this pub node
          const regularsOnThisNode = realmRegulars.filter((r) => r.levelNumber === level.levelNumber);
          const isCurrentUserNode = userCurrentLevelNumber === level.levelNumber;

          return (
            <div
              key={level.id}
              style={{
                left: `${coords.x}%`,
                top: `${coords.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
              className="absolute z-20 flex flex-col items-center"
            >
              {/* Traditional Hanging Pub Signboard Bracket */}
              <div className="w-10 h-2 flex items-center justify-center opacity-80 mb-0.5">
                <div className="w-6 h-1 bg-stone-800 rounded-full border border-stone-950 shadow-xs" />
              </div>

              {/* Pub Signboard Button */}
              <button
                id={`level-node-${level.id}`}
                onClick={() => {
                  setSelectedLevel(level);
                  audioSynth.playCoinFx();
                }}
                className={`relative group rounded-2xl sm:rounded-3xl transition-all duration-200 cursor-pointer flex flex-col items-center justify-center shadow-xl ${
                  isBoss ? 'w-16 h-16 sm:w-20 sm:h-20' : 'w-14 h-14 sm:w-16 sm:h-16'
                } ${
                  isSelected
                    ? 'ring-4 ring-white ring-offset-2 ring-offset-amber-950 scale-110 z-30'
                    : 'hover:scale-105'
                } ${
                  !unlocked
                    ? 'bg-stone-900/90 border-3 border-stone-700 text-stone-500 shadow-[0_4px_0_#1c1917]'
                    : isCompleted
                    ? 'bg-gradient-to-br from-emerald-600 to-teal-700 border-3 border-emerald-300 text-white shadow-[0_6px_0_#065f46]'
                    : `bg-gradient-to-br ${activeMap.stoneColor} border-3 border-amber-300 text-stone-950 shadow-[0_6px_0_#78350f] animate-bounce`
                }`}
              >
                {/* Pub Signboard Hanging Icon */}
                <div className="text-xl sm:text-2xl select-none">
                  {!unlocked ? (
                    <Lock className="w-5 h-5 text-stone-400" />
                  ) : isCompleted ? (
                    <span>🍺</span>
                  ) : (
                    <span>{level.icon}</span>
                  )}
                </div>

                {/* Pub Name / Stop Tag */}
                <span
                  className={`text-[8px] sm:text-[9px] font-cartoon uppercase tracking-tight px-1 rounded truncate max-w-[90%] leading-tight ${
                    !unlocked
                      ? 'text-stone-400'
                      : isCompleted
                      ? 'text-emerald-100 bg-emerald-950/40'
                      : 'text-stone-950 font-black'
                  }`}
                >
                  {level.pubName ? level.pubName.replace('The ', '') : `Stop ${level.levelNumber}`}
                </span>

                {/* Current Active "NEXT PINT" Indicator */}
                {!isCompleted && unlocked && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-amber-400 border-2 border-stone-950 flex items-center justify-center animate-ping" />
                )}
              </button>

              {/* Pub Star Rating Display (0-3 Stars) */}
              <div className="flex items-center gap-0.5 mt-1 bg-stone-950/80 px-1.5 py-0.5 rounded-full border border-stone-800 shadow-sm">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${
                      i < stars
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-stone-600 fill-stone-800'
                    }`}
                  />
                ))}
              </div>

              {/* CURRENT PLAYER AVATAR MARKER ("YOU ARE HERE") */}
              {isCurrentUserNode && (
                <div
                  className="absolute -top-10 -left-6 z-30 flex items-center gap-1 bg-amber-400 text-stone-950 px-2 py-0.5 rounded-full border-2 border-stone-950 shadow-lg animate-bounce select-none cursor-pointer"
                  onClick={() => setIsAuthModalOpen(true)}
                  title="Your current crawl location! Click to customize profile."
                >
                  <span className="text-sm">{userProfile.avatar}</span>
                  <span className="text-[10px] font-black uppercase tracking-tight">YOU</span>
                </div>
              )}

              {/* OTHER TAVERN REGULARS ON THIS PUB STOP */}
              {regularsOnThisNode.map((player, pIdx) => {
                const offsetX = pIdx === 0 ? 'left-full ml-1' : '-right-full mr-1';
                return (
                  <div
                    key={player.name}
                    className={`absolute -top-5 ${offsetX} z-30 flex flex-col items-center select-none`}
                  >
                    {/* Interactive Regular Avatar Button */}
                    <button
                      onClick={() => {
                        setActivePlayerCard({
                          id: `p_${player.name}`,
                          name: player.name,
                          avatar: player.avatar,
                          levelNumber: player.levelNumber,
                          statusQuote: player.statusQuote,
                          score: player.score,
                          color: player.color,
                          favoriteDrink: player.favoriteDrink,
                        });
                        audioSynth.playCoinFx();
                      }}
                      className="group relative w-8 h-8 rounded-full bg-stone-900 border-2 border-white hover:border-amber-400 text-base flex items-center justify-center shadow-md transition-transform hover:scale-125 cursor-pointer"
                      title={`${player.name}: "${player.statusQuote}"`}
                    >
                      <span>{player.avatar}</span>

                      {/* Mini Name Pill */}
                      <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-1 py-0.2 rounded bg-stone-950/90 text-white font-black text-[8px] whitespace-nowrap border border-stone-700 shadow pointer-events-none">
                        {player.name.split(' ')[0]}
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
          );
        })}

        {/* Selected Pub Preview Card (Floating English Pub Info Sheet) */}
        {selectedLevel && (
          <div
            id="level-preview-popup"
            className="absolute bottom-2 left-2 right-2 sm:left-auto sm:right-3 sm:bottom-3 z-40 sm:max-w-sm bg-[#fffdf8] border-4 border-amber-950 rounded-3xl p-3.5 sm:p-4 shadow-[0_8px_0_#451a03] text-stone-900 space-y-2.5 animate-in fade-in slide-in-from-bottom-2"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 text-stone-950 flex items-center justify-center text-2xl font-black shrink-0 border-2 border-amber-950 shadow animate-boing">
                  {selectedLevel.icon}
                </div>
                <div>
                  <div className="text-[10px] font-cartoon uppercase text-amber-900 tracking-wider flex items-center gap-1">
                    <span>Crawl Stop {selectedLevel.levelNumber} of 5</span>
                    {selectedLevel.levelNumber === 5 && (
                      <span className="text-[9px] bg-amber-200 text-amber-950 px-1 rounded font-black">
                        FINALE
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-cartoon text-amber-950 leading-tight">
                    {selectedLevel.pubName || selectedLevel.name}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedLevel(null)}
                className="text-stone-400 hover:text-stone-800 text-xs font-bold px-2 py-1 rounded-lg hover:bg-amber-100"
              >
                ✕
              </button>
            </div>

            {/* Address & Walking Distance */}
            {selectedLevel.address && (
              <div className="p-2 rounded-xl bg-amber-100/70 border border-amber-800/30 text-[11px] font-bold text-amber-950 flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-800 shrink-0 mt-0.5" />
                <div>
                  <div>{selectedLevel.address}, {selectedLevel.postcode}</div>
                  <div className="text-[10px] text-stone-600 font-medium">
                    {selectedLevel.walkingTime ? `🚶 ${selectedLevel.walkingTime}` : ''}
                    {selectedLevel.distanceMiles ? ` • ${selectedLevel.distanceMiles} mi from start` : ''}
                  </div>
                </div>
              </div>
            )}

            {/* Historic Lore & Fun Fact */}
            {selectedLevel.funFact && (
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-800/20 text-xs text-stone-800 font-medium leading-relaxed">
                <span className="font-cartoon text-amber-900 block text-[10px] uppercase">Pub Lore & History:</span>
                "{selectedLevel.funFact}"
              </div>
            )}

            {/* Recommended Pint & Quiz Category */}
            <div className="grid grid-cols-2 gap-1.5 text-[11px] font-bold">
              {selectedLevel.recommendedPint && (
                <div className="p-2 rounded-xl bg-amber-100/90 border border-amber-800/40 text-amber-950">
                  <span className="text-[9px] text-stone-600 block uppercase font-cartoon">Recommended Pint</span>
                  <span className="text-xs truncate block">🍺 {selectedLevel.recommendedPint}</span>
                </div>
              )}
              <div className="p-2 rounded-xl bg-amber-100/90 border border-amber-800/40 text-purple-900">
                <span className="text-[9px] text-stone-600 block uppercase font-cartoon">Quiz Category</span>
                <span className="text-xs truncate block">{selectedLevel.name}</span>
              </div>
            </div>

            {/* Launch / Play Level Action */}
            {isLevelUnlocked(selectedLevel) ? (
              <button
                id="play-selected-level-btn"
                onClick={() => {
                  if (progression.lives <= 0) {
                    onOpenShop('lives');
                  } else {
                    onSelectLevel(selectedLevel, activeMap);
                  }
                }}
                className="w-full py-3 rounded-2xl cartoon-btn-emerald font-cartoon text-xs sm:text-sm shadow-md transition cursor-pointer flex items-center justify-center gap-2 min-h-[44px]"
              >
                <Beer className="w-4 h-4" />
                <span>
                  {progression.lives <= 0
                    ? 'Out of Lives! (Visit Shop)'
                    : `Order Pint & Start Trivia (Uses 1 ❤️)`}
                </span>
              </button>
            ) : (
              <div className="p-2.5 rounded-2xl bg-amber-100 border border-amber-400 text-center text-xs font-bold text-amber-950 flex items-center justify-center gap-2">
                <Lock className="w-4 h-4 text-amber-800" />
                <span>Visit earlier pubs on the crawl to unlock!</span>
              </div>
            )}
          </div>
        )}

        {/* TAVERN REGULAR PLAYER PROFILE CARD POPUP (Warm Light Pub Theme) */}
        {activePlayerCard && (
          <div className="absolute top-4 right-4 z-40 max-w-xs bg-[#fffdf8] border-4 border-amber-950 rounded-3xl p-4 shadow-[0_8px_0_#451a03] text-stone-900 space-y-3 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-11 h-11 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center text-2xl font-black border-2 border-amber-950 shadow animate-wobble">
                  {activePlayerCard.avatar}
                </div>
                <div>
                  <h4 className="text-sm font-cartoon text-amber-950 leading-tight">
                    {activePlayerCard.name}
                  </h4>
                  <span className="text-[10px] text-amber-800 font-bold">
                    At Level {activePlayerCard.levelNumber}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setActivePlayerCard(null)}
                className="text-stone-400 hover:text-stone-800 text-xs font-bold px-2 py-1 rounded-lg hover:bg-amber-100"
              >
                ✕
              </button>
            </div>

            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-800/30 text-xs text-stone-700 font-medium italic">
              "{activePlayerCard.statusQuote}"
            </div>

            <div className="grid grid-cols-2 gap-1.5 text-[10px] font-bold">
              <div className="p-2 rounded-xl bg-amber-100/90 border border-amber-800/30">
                <span className="text-stone-500 block font-bold">Favorite Drink</span>
                <span className="text-amber-950 font-black">{activePlayerCard.favoriteDrink}</span>
              </div>
              <div className="p-2 rounded-xl bg-amber-100/90 border border-amber-800/30">
                <span className="text-stone-500 block font-bold">Trivia Score</span>
                <span className="text-emerald-900 font-black">{activePlayerCard.score} pts</span>
              </div>
            </div>

            <button
              onClick={() => handleCheersToPlayer(activePlayerCard)}
              className="w-full py-2.5 rounded-xl cartoon-btn-amber text-xs font-cartoon transition cursor-pointer flex items-center justify-center gap-1.5 shadow min-h-[40px]"
            >
              <Beer className="w-3.5 h-3.5" />
              <span>Send Cheers 🍻 (+10 🪙)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
