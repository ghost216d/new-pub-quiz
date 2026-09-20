import React, { useCallback, useEffect, useState } from 'react';
import {
  Beer,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Coins,
  Crown,
  Heart,
  Loader2,
  Lock,
  ShoppingBag,
  Sparkles,
  Star,
  User,
  Menu,
  X,
  Zap,
} from 'lucide-react';
import {
  CartoonMap,
  MapLevel,
  SoloProgression,
} from '../types';
import {
  CARTOON_MAPS,
  checkAndReplenishLives,
  getAllMaps,
} from '../data/cartoonMapsData';
import { audioSynth } from '../utils/audioSynth';
import { getLondonTheme } from '../utils/londonTheme';
import { AuthModal } from './AuthModal';
import confetti from 'canvas-confetti';

interface Props {
  progression: SoloProgression;
  onUpdateProgression: (progression: SoloProgression) => void;
  onSelectLevel: (level: MapLevel, map: CartoonMap) => void;
  onOpenShop: (tab?: 'lives' | 'bundles' | 'free') => void;
  onCustomSoloMode: () => void;
  onBackToHome: () => void;
  onOpenQuizMaster: () => void;
  autoAdvanceTarget?: { mapId: string; levelId: string } | null;
  initialEntranceAnim?: boolean;
}

const LEVEL_COORDS = [
  { x: 17, y: 83 },
  { x: 43, y: 67 },
  { x: 74, y: 52 },
  { x: 39, y: 35 },
  { x: 75, y: 18 },
];

const SEASON_DETAILS = {
  spring: { label: 'Spring', icon: '🌸' },
  summer: { label: 'Summer', icon: '☀️' },
  autumn: { label: 'Autumn', icon: '🍂' },
  winter: { label: 'Winter', icon: '❄️' },
} as const;

export const CartoonMapCanvas: React.FC<Props> = ({
  progression,
  onUpdateProgression,
  onSelectLevel,
  onOpenShop,
  onCustomSoloMode,
  onBackToHome,
  onOpenQuizMaster,
  autoAdvanceTarget,
}) => {
  const allMaps = getAllMaps(progression);

  const [activeMapId, setActiveMapId] = useState(
    progression.currentMapId ||
      allMaps[0]?.id ||
      'thames_riverside_crawl'
  );

  const [selectedLevel, setSelectedLevel] =
    useState<MapLevel | null>(null);

  const [isAuthModalOpen, setIsAuthModalOpen] =
    useState(false);

  const [isGeneratingAiMap, setIsGeneratingAiMap] =
    useState(false);

  const [regenCountdown, setRegenCountdown] =
    useState('Full ❤️');
  const [arrivalLevelId, setArrivalLevelId] = useState<string | null>(null);
  const [isActionsOpen, setIsActionsOpen] = useState(false);

  const activeMap =
    allMaps.find((map) => map.id === activeMapId) ||
    allMaps[0] ||
    CARTOON_MAPS[0];

  const activeMapIndex = allMaps.findIndex(
    (map) => map.id === activeMap.id
  );
  const londonTheme = getLondonTheme();
  const londonSeason = { id: londonTheme.season, ...SEASON_DETAILS[londonTheme.season] };
  const activeArtwork = activeMap.seasonalArtwork?.[londonTheme.season]?.[londonTheme.time]
    || activeMap.mapArtwork
    || 'thames-game-map.png';

  const userProfile = progression.userProfile || {
    id: 'guest_local',
    name: 'Player',
    avatar: '🍺',
    provider: 'guest',
    createdAt: Date.now(),
  };

  const isMapUnlocked = useCallback(
    (map: CartoonMap) =>
      progression.totalStars >= map.requiredStars ||
      progression.unlockedMaps.includes(map.id),
    [progression.totalStars, progression.unlockedMaps]
  );

  const isLevelUnlocked = useCallback(
    (level: MapLevel) => {
      if (!isMapUnlocked(activeMap)) return false;
      if (level.levelNumber === 1) return true;

      const previousLevel =
        activeMap.levels[level.levelNumber - 2];

      return Boolean(
        previousLevel &&
          progression.completedLevels[previousLevel.id]?.passed
      ) || progression.totalStars >= level.requiredStars;
    },
    [
      activeMap,
      isMapUnlocked,
      progression.completedLevels,
      progression.totalStars,
    ]
  );

  const currentLevelNumber = (() => {
    for (
      let index = activeMap.levels.length - 1;
      index >= 0;
      index -= 1
    ) {
      const level = activeMap.levels[index];

      if (progression.completedLevels[level.id]?.passed) {
        return Math.min(
          activeMap.levels.length,
          level.levelNumber + 1
        );
      }
    }

    return 1;
  })();

  useEffect(() => {
    const timer = window.setInterval(() => {
      const result = checkAndReplenishLives(progression);

      if (result.regenerated) {
        onUpdateProgression(result.progression);
        audioSynth.playLifeRegenSfx();
      }

      const checkedProgression = result.progression;

      if (
        checkedProgression.lives <
          checkedProgression.maxLives &&
        checkedProgression.nextHeartRegenTimestamp
      ) {
        const remainingMilliseconds = Math.max(
          0,
          checkedProgression.nextHeartRegenTimestamp -
            Date.now()
        );

        const totalSeconds = Math.floor(
          remainingMilliseconds / 1000
        );

        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;

        setRegenCountdown(
          `${minutes}:${seconds
            .toString()
            .padStart(2, '0')}`
        );
      } else {
        setRegenCountdown('Full ❤️');
      }
    }, 1000);

    return () => window.clearInterval(timer);
  }, [progression, onUpdateProgression]);

  useEffect(() => {
    if (!autoAdvanceTarget) return;

    const targetMap = allMaps.find((map) => map.id === autoAdvanceTarget.mapId);
    const targetLevel = targetMap?.levels.find((level) => level.id === autoAdvanceTarget.levelId);
    if (!targetMap || !targetLevel) return;

    setActiveMapId(targetMap.id);
    setSelectedLevel(targetLevel);
    setArrivalLevelId(targetLevel.id);
    audioSynth.playCoinFx();

    const celebrationTimer = window.setTimeout(() => {
      setArrivalLevelId(null);
    }, 2400);

    return () => window.clearTimeout(celebrationTimer);
  }, [autoAdvanceTarget]);

  const changeMap = (direction: -1 | 1) => {
    const nextIndex = activeMapIndex + direction;
    const nextMap = allMaps[nextIndex];

    if (!nextMap) return;

    setActiveMapId(nextMap.id);
    setSelectedLevel(null);
    audioSynth.playCoinFx();
  };

  const selectMap = (map: CartoonMap) => {
    setActiveMapId(map.id);
    setSelectedLevel(null);
    audioSynth.playCoinFx();
  };

  const generateAiMap = async () => {
    if (isGeneratingAiMap) return;

    setIsGeneratingAiMap(true);

    try {
      const response = await fetch('/api/ai/generate-map', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          existingThemes: allMaps.map((map) => map.id),
          totalStars: progression.totalStars,
          currentMapName: activeMap.name,
        }),
      });

      const data = await response.json();

      if (data?.map) {
        const generatedMap = data.map as CartoonMap;
        const existingDynamicMaps =
          progression.dynamicMaps || [];

        const alreadyExists = existingDynamicMaps.some(
          (map) =>
            map.id === generatedMap.id ||
            map.name === generatedMap.name
        );

        if (!alreadyExists) {
          onUpdateProgression({
            ...progression,
            dynamicMaps: [
              ...existingDynamicMaps,
              generatedMap,
            ],
          });

          setActiveMapId(generatedMap.id);

          confetti({
            particleCount: 80,
            spread: 80,
            origin: { y: 0.65 },
          });

          audioSynth.playChampionFanfare();
        }
      }
    } catch (error) {
      console.warn('AI map generation failed:', error);
    } finally {
      setIsGeneratingAiMap(false);
    }
  };

  const playSelectedLevel = () => {
    if (!selectedLevel) return;

    if (progression.lives <= 0) {
      onOpenShop('lives');
      return;
    }

    if (!isLevelUnlocked(selectedLevel)) return;

    onSelectLevel(selectedLevel, activeMap);
  };

  return (
    <main
      id="cartoon-map-main-view"
      className="game-map-shell"
    >
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        progression={progression}
        onUpdateProgression={onUpdateProgression}
      />

      {/* Top navigation */}
      <header className="game-top-bar">
        <button
          onClick={onBackToHome}
          className="game-icon-button"
          aria-label="Return to main menu"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div className="game-title">
          <span className="game-title-icon">🍺</span>

          <div>
            <h1>The Pub Quiz</h1>
            <p>Tavern Trivia Adventure</p>
          </div>
        </div>

        <button
          onClick={() => setIsAuthModalOpen(true)}
          className="game-avatar-button"
          aria-label="Open player profile"
        >
          <span>{userProfile.avatar}</span>
        </button>
      </header>

      {/* Player currencies */}
      <aside className="game-side-panel">
      <section className="game-hud">
        <button
          onClick={() => onOpenShop('lives')}
          className="game-resource game-resource-lives"
        >
          <span className="game-hearts">
            {Array.from({
              length: progression.maxLives,
            }).map((_, index) => (
              <Heart
                key={index}
                className={
                  index < progression.lives
                    ? 'game-heart-full'
                    : 'game-heart-empty'
                }
              />
            ))}
          </span>

          <strong>
            {progression.lives}/{progression.maxLives}
          </strong>

          <span className="game-add-button">+</span>
        </button>

        <button
          onClick={() => onOpenShop('bundles')}
          className="game-resource game-resource-coins"
        >
          <Coins className="w-5 h-5" />
          <strong>
            {progression.coins.toLocaleString()}
          </strong>
          <ShoppingBag className="w-4 h-4" />
        </button>

        <div className="game-resource game-resource-stars">
          <Star className="w-5 h-5 fill-current" />
          <strong>{progression.totalStars}</strong>
        </div>
      </section>

      {progression.lives < progression.maxLives && (
        <div className="game-regen">
          <Clock className="w-3.5 h-3.5" />
          Next heart in {regenCountdown}
        </div>
      )}

      {/* Action buttons */}
      <section className={`game-actions ${isActionsOpen ? 'is-open' : ''}`}>
        <button
          type="button"
          onClick={() => setIsActionsOpen((open) => !open)}
          className="game-actions-toggle"
          aria-expanded={isActionsOpen}
          aria-label={isActionsOpen ? 'Close game options' : 'Open game options'}
        >
          {isActionsOpen ? <X /> : <Menu />}
          <strong>{isActionsOpen ? 'Close' : 'Options'}</strong>
        </button>

        {isActionsOpen && <button
          onClick={onCustomSoloMode}
          className="game-action game-action-purple"
        >
          <Zap className="w-5 h-5" />
          <span>
            <strong>Custom Quiz</strong>
            <small>Choose any topic</small>
          </span>
        </button>}

        {isActionsOpen && <button
          onClick={generateAiMap}
          disabled={isGeneratingAiMap}
          className="game-action game-action-green"
        >
          {isGeneratingAiMap ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Sparkles className="w-5 h-5" />
          )}

          <span>
            <strong>
              {isGeneratingAiMap
                ? 'Brewing...'
                : 'New Realm'}
            </strong>
            <small>Made by AI</small>
          </span>
        </button>}

        {isActionsOpen && <button
          onClick={onOpenQuizMaster}
          className="game-action game-action-gold"
        >
          <Crown className="w-5 h-5" />
          <span>
            <strong>Quiz Master</strong>
            <small>Host a live quiz</small>
          </span>
        </button>}
      </section>

      {/* Realm selector */}
      <section className="game-realm-card">
        <div className="game-realm-heading">
          <button
            onClick={() => changeMap(-1)}
            disabled={activeMapIndex <= 0}
            className="game-map-arrow"
            aria-label="Previous realm"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <div className="game-realm-title">
            <span>{activeMap.icon}</span>

            <div>
              <h2>{activeMap.name}</h2>
              <p>{activeMap.subtitle}</p>
            </div>
          </div>

          <button
            onClick={() => changeMap(1)}
            disabled={
              activeMapIndex >= allMaps.length - 1
            }
            className="game-map-arrow"
            aria-label="Next realm"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        <div className="game-realm-tabs">
          {allMaps.map((map) => {
            const unlocked = isMapUnlocked(map);
            const selected = map.id === activeMap.id;

            return (
              <button
                key={map.id}
                onClick={() => selectMap(map)}
                className={[
                  'game-realm-tab',
                  selected ? 'is-selected' : '',
                  !unlocked ? 'is-locked' : '',
                ].join(' ')}
                aria-label={map.name}
              >
                <span>{map.icon}</span>
                {!unlocked && (
                  <Lock className="w-3 h-3" />
                )}
              </button>
            );
          })}
        </div>

        <p className="game-auto-difficulty-note">
          <Sparkles className="w-4 h-4" />
          Fresh Internet questions load automatically without repeats. Every 5th level is a hard challenge.
        </p>
        <div className="game-season-badge" aria-label={`Current map theme: ${londonSeason.label}`}>
          <span>{londonSeason.icon}</span>
          <strong>{londonSeason.label} {londonTheme.time === 'night' ? 'Night' : 'Day'} in London</strong>
          <small>Season and light change automatically</small>
        </div>
      </section>
      </aside>

      {/* Main illustrated map */}
      <section
        id="cartoon-map-canvas-board"
        className={`game-map-board season-${londonSeason.id} time-${londonTheme.time}`}
        style={{
          background: 'transparent',
        }}
      >
        <img
          className="game-map-artwork"
          src={`${import.meta.env.BASE_URL}${activeArtwork}`}
          alt=""
          aria-hidden="true"
          draggable={false}
        />
        <div className="game-season-overlay" aria-hidden="true" />
        <svg
          className="game-map-path"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            className="game-path-shadow"
            d="M17 83 C20 73 43 78 43 67 C43 57 74 62 74 52 C74 42 39 45 39 35 C39 25 75 30 75 18"
          />

          <path
            className="game-path-main"
            stroke={activeMap.pathColor || '#f59e0b'}
            d="M17 83 C20 73 43 78 43 67 C43 57 74 62 74 52 C74 42 39 45 39 35 C39 25 75 30 75 18"
          />
        </svg>

        {activeMap.levels.map((level, index) => {
          const coordinates =
            LEVEL_COORDS[index] || { x: 50, y: 50 };

          const unlocked = isLevelUnlocked(level);
          const progress =
            progression.completedLevels[level.id];

          const completed = Boolean(progress?.passed);
          const stars = progress?.stars || 0;
                  const selected =
            selectedLevel?.id === level.id;
          const current =
            currentLevelNumber === level.levelNumber;

          return (
            <div
              key={level.id}
              className="game-level-position"
              style={{
                left: `${coordinates.x}%`,
                top: `${coordinates.y}%`,
              }}
            >
              {current && unlocked && !completed && (
                <div className="game-you-marker">
                  <span>{userProfile.avatar}</span>
                  <strong>YOU</strong>
                </div>
              )}

              <button
                aria-label={
                  unlocked
                    ? `Play ${level.pubName || level.name}`
                    : `Locked level ${level.levelNumber}: ${level.pubName || level.name}`
                }
                onClick={() => {
                  audioSynth.playCoinFx();
                  if (unlocked) {
                    onSelectLevel(level, activeMap);
                  } else {
                    setSelectedLevel(level);
                  }
                }}
                className={[
                  'game-level-node',
                  level.levelNumber === 5
                    ? 'is-boss'
                    : '',
                  completed ? 'is-completed' : '',
                  !unlocked ? 'is-locked' : '',
                  selected ? 'is-selected' : '',
                  current && unlocked && !completed
                    ? 'is-current'
                    : '',
                  arrivalLevelId === level.id
                    ? 'is-arriving'
                    : '',
                ].join(' ')}
              >
                <span className="game-node-icon">
                  {!unlocked ? (
                    <span className="game-locked-dot" aria-hidden="true" />
                  ) : completed ? (
                    <CheckCircle2 className="w-7 h-7" />
                  ) : (
                    level.icon
                  )}
                </span>

                <strong>
                  {level.pubName?.replace('The ', '') ||
                    level.name}
                </strong>
              </button>

              <div className="game-node-stars">
                {[0, 1, 2].map((star) => (
                  <Star
                    key={star}
                    className={
                      star < stars
                        ? 'is-earned'
                        : ''
                    }
                  />
                ))}
              </div>
            </div>
          );
        })}

      </section>

      {/* Selected level information */}
      {selectedLevel && (
        <section className="game-level-card">
          <button
            onClick={() => setSelectedLevel(null)}
            className="game-close-button"
            aria-label="Close level information"
          >
            ×
          </button>

          <div className="game-level-card-heading">
            <div className="game-level-card-icon">
              {selectedLevel.icon}
            </div>

            <div>
              <small>
                Pub stop {selectedLevel.levelNumber} of{' '}
                {activeMap.levels.length}
              </small>

              <h3>
                {selectedLevel.pubName ||
                  selectedLevel.name}
              </h3>

              <p>
                {selectedLevel.address}
                {selectedLevel.postcode
                  ? `, ${selectedLevel.postcode}`
                  : ''}
              </p>
            </div>
          </div>

          <div className="game-level-details">
            <div>
              <span>Quiz</span>
              <strong>{selectedLevel.category}</strong>
            </div>

            <div>
              <span>Difficulty</span>
              <strong>
                {selectedLevel.levelNumber % 5 === 0
                  ? 'Hard challenge'
                  : 'Standard'}
              </strong>
            </div>

            <div>
              <span>Reward</span>
              <strong>
                {selectedLevel.coinReward} 🪙
              </strong>
            </div>
          </div>

          {selectedLevel.funFact && (
            <p className="game-level-fact">
              💡 {selectedLevel.funFact}
            </p>
          )}

          {isLevelUnlocked(selectedLevel) ? (
            <button
              onClick={playSelectedLevel}
              className="game-play-button"
            >
              <Beer className="w-5 h-5" />

              <span>
                {progression.lives <= 0
                  ? 'Refill Hearts to Play'
                  : 'Play This Level'}
              </span>
            </button>
          ) : (
            <div className="game-locked-message">
              <Lock className="w-4 h-4" />
              Complete the previous pub to unlock this
              level.
            </div>
          )}
        </section>
      )}

      {/* Bottom navigation */}
      <nav className="game-bottom-nav">
        <button onClick={onBackToHome}>
          <span>🏠</span>
          <strong>Home</strong>
        </button>

        <button onClick={() => onOpenShop('bundles')}>
          <ShoppingBag className="w-6 h-6" />
          <strong>Shop</strong>
        </button>

        <button
          className="is-active"
          onClick={() => setSelectedLevel(null)}
        >
          <span>🗺️</span>
          <strong>World</strong>
        </button>

        <button onClick={onCustomSoloMode}>
          <Zap className="w-6 h-6" />
          <strong>Quiz</strong>
        </button>

        <button
          onClick={() => setIsAuthModalOpen(true)}
        >
          <User className="w-6 h-6" />
          <strong>Profile</strong>
        </button>
      </nav>
    </main>
  );
};
