import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Beer,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock,
  Coins,
  Crown,
  Heart,
  Loader2,
  Lock,
  Sparkles,
  Star,
  Menu,
  X,
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
import confetti from 'canvas-confetti';

interface Props {
  progression: SoloProgression;
  onUpdateProgression: (progression: SoloProgression) => void;
  onSelectLevel: (level: MapLevel, map: CartoonMap) => void;
  onOpenShop: (tab?: 'lives' | 'bundles' | 'free') => void;
  onOpenQuizMaster: () => void;
  autoAdvanceTarget?: { mapId: string; levelId: string } | null;
  onAutoAdvanceHandled?: () => void;
  initialEntranceAnim?: boolean;
}

const retainedPubArtwork = new Map<string, HTMLImageElement>();

const preloadPubArtwork = (artwork: string, priority: 'high' | 'low' = 'high') => {
  const src = `${import.meta.env.BASE_URL}${artwork}`;
  const retained = retainedPubArtwork.get(src);
  if (retained) {
    if (priority === 'high') retained.fetchPriority = 'high';
    return retained;
  }

  const image = new Image();
  image.decoding = 'async';
  image.fetchPriority = priority;
  retainedPubArtwork.set(src, image);
  image.src = src;

  // Keep a small warm cache without letting browsing across maps retain every
  // cover image for the lifetime of the app.
  while (retainedPubArtwork.size > 8) {
    const oldest = retainedPubArtwork.keys().next().value;
    if (!oldest) break;
    retainedPubArtwork.delete(oldest);
  }
  return image;
};

const MAP_AREA_LABELS: Record<string, string> = {
  thames_riverside_crawl: 'South London & Westminster',
  west_london_crawl: 'West End & Hyde Park',
  north_london_crawl: 'Central & North London',
  east_london_crawl: 'East & South London',
  city_clerkenwell_crawl: 'The City & Clerkenwell',
  islington_crawl: 'Islington & Angel',
  hampstead_highgate_crawl: 'Hampstead & Highgate',
  richmond_thames_crawl: 'Richmond & the Thames',
  notting_hill_crawl: 'Notting Hill & Kensington',
  hackney_crawl: 'Hackney & Broadway Market',
  greenwich_deptford_crawl: 'Deptford & Greenwich',
  putney_wandsworth_crawl: 'Putney & Wandsworth',
  chiswick_hammersmith_crawl: 'Chiswick & Hammersmith',
  wapping_rotherhithe_crawl: 'Wapping & Rotherhithe',
};

const MAP_ROUTE_LABELS: Record<string, string> = {
  thames_riverside_crawl: 'Waterloo → Westminster',
  west_london_crawl: 'Covent Garden → Hyde Park',
  north_london_crawl: 'Trafalgar Square → London Bridge',
  east_london_crawl: 'Tower Hill → Greenwich',
  city_clerkenwell_crawl: 'Blackfriars → Clerkenwell',
  islington_crawl: 'Barnsbury → Angel',
  hampstead_highgate_crawl: 'Hampstead → Highgate',
  richmond_thames_crawl: 'Richmond → Teddington',
  notting_hill_crawl: 'Kensington → Notting Hill',
  hackney_crawl: 'Broadway Market → Columbia Road',
  greenwich_deptford_crawl: 'Deptford → Greenwich',
  putney_wandsworth_crawl: 'Putney → Wandsworth',
  chiswick_hammersmith_crawl: 'Chiswick → Hammersmith',
  wapping_rotherhithe_crawl: 'Wapping → Rotherhithe',
};

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
  onOpenQuizMaster,
  autoAdvanceTarget,
  onAutoAdvanceHandled,
}) => {
  const allMaps = getAllMaps(progression);

  const [activeMapId, setActiveMapId] = useState(
    progression.currentMapId ||
      allMaps[0]?.id ||
      'thames_riverside_crawl'
  );

  const [selectedLevel, setSelectedLevel] =
    useState<MapLevel | null>(null);


  const [isGeneratingAiMap, setIsGeneratingAiMap] =
    useState(false);

  const [regenCountdown, setRegenCountdown] =
    useState('Full ❤️');
  const [arrivalLevelId, setArrivalLevelId] = useState<string | null>(null);
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [isRealmPanelExpanded, setIsRealmPanelExpanded] = useState(false);
  const [pressedLevelId, setPressedLevelId] = useState<string | null>(null);
  const lastPointerActivationRef = useRef(0);
  const levelActivationTimerRef = useRef<number | null>(null);
  const mapShellRef = useRef<HTMLElement | null>(null);

  useEffect(() => () => {
    if (levelActivationTimerRef.current !== null) {
      window.clearTimeout(levelActivationTimerRef.current);
    }
  }, []);

  const isMapUnlocked = useCallback(
    (map: CartoonMap) => {
      const mapIndex = allMaps.findIndex((candidate) => candidate.id === map.id);
      if (mapIndex <= 0) return mapIndex === 0;

      return allMaps.slice(0, mapIndex).every((previousMap) =>
        previousMap.levels.every(
          (level) => progression.completedLevels[level.id]?.passed
        )
      );
    },
    [allMaps, progression.completedLevels]
  );

  // Keep all 70 campaign stops visible so players can see the full journey.
  // They remain unselectable until the previous route is complete.
  const unlockedMaps = allMaps.filter(isMapUnlocked);
  const visibleMaps = allMaps;
  const activeMap =
    unlockedMaps.find((map) => map.id === activeMapId) ||
    unlockedMaps[unlockedMaps.length - 1] ||
    allMaps[0] ||
    CARTOON_MAPS[0];

  const activeMapIndex = allMaps.findIndex(
    (map) => map.id === activeMap.id
  );
  const londonTheme = getLondonTheme();
  const londonSeason = { id: londonTheme.season, ...SEASON_DETAILS[londonTheme.season] };
  const userProfile = progression.userProfile || {
    id: 'guest_local',
    name: 'Player',
    avatar: '🍺',
    provider: 'guest',
    createdAt: Date.now(),
  };



  const isLevelUnlocked = useCallback(
    (level: MapLevel) => {
      if (!isMapUnlocked(activeMap)) return false;
      if (level.levelNumber === 1) return true;

      const previousLevel =
        activeMap.levels[level.levelNumber - 2];

      return Boolean(
        previousLevel &&
          progression.completedLevels[previousLevel.id]?.passed
      );
    },
    [
      activeMap,
      isMapUnlocked,
      progression.completedLevels,
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
  const campaignRouteIndex = CARTOON_MAPS.findIndex((map) => map.id === activeMap.id);
  const campaignLevelTotal = CARTOON_MAPS.reduce((count, map) => count + map.levels.length, 0);
  const campaignLevelOffset = CARTOON_MAPS
    .slice(0, Math.max(0, campaignRouteIndex))
    .reduce((count, map) => count + map.levels.length, 0);
  const campaignCurrentLevel = campaignRouteIndex >= 0
    ? Math.min(campaignLevelTotal, campaignLevelOffset + currentLevelNumber)
    : currentLevelNumber;
  const campaignRouteNumber = campaignRouteIndex >= 0 ? campaignRouteIndex + 1 : activeMapIndex + 1;
  const currentPositionLevel = activeMap.levels.find(
    (level) => level.levelNumber === currentLevelNumber
  ) || activeMap.levels[activeMap.levels.length - 1];

  // On stage changes, scroll the tall mobile map to the player's current pub.
  useEffect(() => {
    if (!currentPositionLevel) return;

    const frame = window.requestAnimationFrame(() => {
      const shell = mapShellRef.current;
      const marker = shell?.querySelector<HTMLElement>(
        `[data-level-id="${CSS.escape(currentPositionLevel.id)}"]`
      );
      if (!shell || !marker) return;

      const shellBounds = shell.getBoundingClientRect();
      const markerBounds = marker.getBoundingClientRect();
      const desiredMarkerY = shellBounds.top + shell.clientHeight * 0.57;
      const nextScrollTop = shell.scrollTop + markerBounds.top - desiredMarkerY;
      shell.scrollTo({ top: Math.max(0, nextScrollTop), behavior: 'smooth' });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [activeMap.id, currentPositionLevel?.id]);
  const activeArtwork = selectedLevel?.mapArtwork
    || activeMap.levels.find((level) => level.levelNumber === currentLevelNumber)?.mapArtwork
    || activeMap.seasonalArtwork?.[londonTheme.season]?.[londonTheme.time]
    || activeMap.mapArtwork
    || 'thames-game-map.png';
  const activeArtworkUrl = `${import.meta.env.BASE_URL}${activeArtwork}`;
  const [displayedArtworkUrl, setDisplayedArtworkUrl] = useState(activeArtworkUrl);
  const initialArtworkUrlRef = useRef(activeArtworkUrl);
  const [isInitialArtworkReady, setIsInitialArtworkReady] = useState(false);
  const [isMapArtworkLoading, setIsMapArtworkLoading] = useState(false);

  // Keep the first frame covered until the initial map artwork has decoded.
  useEffect(() => {
    let cancelled = false;
    const image = new Image();
    const finish = () => {
      if (cancelled) return;
      const decoded = typeof image.decode === 'function'
        ? image.decode().catch(() => undefined)
        : Promise.resolve();
      void decoded.then(() => {
        if (!cancelled) setIsInitialArtworkReady(true);
      });
    };

    image.decoding = 'async';
    image.fetchPriority = 'high';
    image.onload = finish;
    image.onerror = () => {
      if (!cancelled) setIsInitialArtworkReady(true);
    };
    image.src = initialArtworkUrlRef.current;
    if (image.complete) {
      if (image.naturalWidth > 0) finish();
      else setIsInitialArtworkReady(true);
    }

    return () => {
      cancelled = true;
      image.onload = null;
      image.onerror = null;
    };
  }, []);

  // Keep the previous map visible until new route artwork has been downloaded
  // and decoded. This prevents rapid stage changes from exposing an empty board.
  useEffect(() => {
    if (displayedArtworkUrl === activeArtworkUrl) return;

    let cancelled = false;
    let cancelPendingArtworkLoad: (() => void) | null = null;
    const loadingIndicatorTimer = window.setTimeout(() => {
      if (!cancelled) setIsMapArtworkLoading(true);
    }, 120);

    const loadArtwork = (src: string, timeoutMs: number) => new Promise<boolean>((resolve) => {
      const image = new Image();
      let settled = false;
      let timeoutId: number;

      const finish = (loaded: boolean) => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timeoutId);
        cancelPendingArtworkLoad = null;
        if (!loaded) {
          resolve(false);
          return;
        }

        if (typeof image.decode === 'function') {
          void image.decode().catch(() => undefined).then(() => resolve(true));
        } else {
          resolve(true);
        }
      };

      cancelPendingArtworkLoad = () => finish(false);
      timeoutId = window.setTimeout(() => finish(false), timeoutMs);
      image.decoding = 'async';
      image.fetchPriority = 'high';
      image.onload = () => finish(true);
      image.onerror = () => finish(false);
      image.src = src;
      if (image.complete) finish(image.naturalWidth > 0);
    });

    const prepareArtwork = async () => {
      let artworkUrl = activeArtworkUrl;
      let ready = await loadArtwork(artworkUrl, 10000);
      if (cancelled) return;
      const fallbackUrl = `${import.meta.env.BASE_URL}${activeMap.mapArtwork || 'thames-game-map.png'}`;

      if (!ready && artworkUrl !== fallbackUrl) {
        artworkUrl = fallbackUrl;
        ready = await loadArtwork(artworkUrl, 5000);
        if (cancelled) return;
      }

      if (cancelled) return;
      if (ready) setDisplayedArtworkUrl(artworkUrl);
      setIsMapArtworkLoading(false);
    };

    void prepareArtwork();

    return () => {
      cancelled = true;
      window.clearTimeout(loadingIndicatorTimer);
      cancelPendingArtworkLoad?.();
    };
  }, [activeArtworkUrl, activeMap.mapArtwork, displayedArtworkUrl]);

  // Warm the next playable pub cover while the map is visible so a cold tap
  // does not have to wait for the artwork download to begin.
  useEffect(() => {
    const artwork = currentPositionLevel?.coverArtwork;
    if (!artwork) return;

    preloadPubArtwork(artwork, 'high');
  }, [currentPositionLevel?.id, currentPositionLevel?.coverArtwork]);

  // Warm covers for replayable pubs on this route while the map is open.
  // The current stop is already loaded at high priority above.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      activeMap.levels
        .filter((level) => level.id !== currentPositionLevel?.id && isLevelUnlocked(level))
        .forEach((level) => {
          if (level.coverArtwork) preloadPubArtwork(level.coverArtwork, 'low');
        });
    }, 250);

    return () => window.clearTimeout(timer);
  }, [activeMap.id, isLevelUnlocked, currentPositionLevel?.id]);

  // Defer low-priority preloads for adjacent routes until the current map
  // has had time to request its visible artwork. Loading every level image
  // here can overwhelm mobile browsers when returning from a quiz.
  useEffect(() => {
    const nearbyMaps = [
      visibleMaps[activeMapIndex - 1],
      visibleMaps[activeMapIndex + 1],
    ].filter((map): map is CartoonMap => Boolean(map));

    const timer = window.setTimeout(() => {
      nearbyMaps.forEach((map) => {
        const upcomingLevel =
          map.levels.find((level) => !progression.completedLevels[level.id]?.passed) ||
          map.levels[map.levels.length - 1];
        const artwork =
          upcomingLevel?.mapArtwork ||
          map.seasonalArtwork?.[londonTheme.season]?.[londonTheme.time] ||
          map.mapArtwork;
        if (!artwork) return;

        const image = new Image();
        image.decoding = 'async';
        image.fetchPriority = 'low';
        image.src = `${import.meta.env.BASE_URL}${artwork}`;
      });
    }, 1200);

    return () => window.clearTimeout(timer);
  }, [
    activeMap.id,
    activeMapIndex,
    londonTheme.season,
    londonTheme.time,
    progression.completedLevels,
    visibleMaps[activeMapIndex - 1]?.id,
    visibleMaps[activeMapIndex + 1]?.id,
  ]);
  const highestCompletedLevelIndex = activeMap.levels.reduce((highest, level, index) => (
    progression.completedLevels[level.id]?.passed ? index : highest
  ), -1);
  const allActiveMapLevelsComplete = activeMap.levels.length > 0 && activeMap.levels.every(
    (level) => progression.completedLevels[level.id]?.passed
  );
  const colourRevealTop = allActiveMapLevelsComplete
    ? 0
    : highestCompletedLevelIndex < 0
      ? 100
      : LEVEL_COORDS[highestCompletedLevelIndex]?.y ?? 50;
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
    if (!targetMap || !targetLevel) {
      onAutoAdvanceHandled?.();
      return;
    }

    setActiveMapId(targetMap.id);
    setSelectedLevel(targetLevel);
    setArrivalLevelId(targetLevel.id);
    onAutoAdvanceHandled?.();
    audioSynth.playCoinFx();

    const celebrationTimer = window.setTimeout(() => {
      setArrivalLevelId(null);
    }, 2400);

    return () => window.clearTimeout(celebrationTimer);
  }, [autoAdvanceTarget]);

  const changeMap = (direction: -1 | 1) => {
    const nextIndex = activeMapIndex + direction;
    const nextMap = visibleMaps[nextIndex];

    if (!nextMap || !isMapUnlocked(nextMap)) return;

    setActiveMapId(nextMap.id);
    setSelectedLevel(null);
    audioSynth.playCoinFx();
  };

  const selectMap = (map: CartoonMap) => {
    if (!isMapUnlocked(map)) return;
    setActiveMapId(map.id);
    setSelectedLevel(null);
    audioSynth.playCoinFx();
  };

  const generateAiMap = async () => {
    if (isGeneratingAiMap) return;

    setIsGeneratingAiMap(true);

    try {
      const apiBase = String(import.meta.env.VITE_MULTIPLAYER_API_URL || '').trim().replace(/\/$/, '');
      const response = await fetch(`${apiBase}/api/ai/generate-map`, {
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

  const pressMapLevel = (level: MapLevel, unlocked: boolean) => {
    if (levelActivationTimerRef.current !== null) {
      window.clearTimeout(levelActivationTimerRef.current);
    }

    setPressedLevelId(level.id);
    audioSynth.playCoinFx();

    if (!unlocked) {
      setSelectedLevel(level);
      levelActivationTimerRef.current = window.setTimeout(() => {
        levelActivationTimerRef.current = null;
        setPressedLevelId(null);
      }, 150);
      return;
    }

    // Start fetching the selected pub art while the marker presses, then open
    // the artwork as soon as the press cue has registered.
    const artwork = level.coverArtwork || level.mapArtwork || activeMap.mapArtwork;
    if (artwork) preloadPubArtwork(artwork, 'high');

    // Hold the pressed pose briefly, then let the marker finish its rebound
    // before opening the loading cover.
    levelActivationTimerRef.current = window.setTimeout(() => {
      setPressedLevelId(null);
      levelActivationTimerRef.current = window.setTimeout(() => {
        levelActivationTimerRef.current = null;
        onSelectLevel(level, activeMap);
      }, 45);
    }, 50);
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
      ref={mapShellRef}
    >

      {/* Top navigation */}
      <header className="game-top-bar">
        <div className="game-title">
          <span className="game-title-icon" aria-hidden="true">🍺</span>

          <div>
            <h1>{MAP_AREA_LABELS[activeMap.id] || activeMap.name}</h1>
            <p>{MAP_ROUTE_LABELS[activeMap.id] || activeMap.crawlRouteName}</p>
          </div>
        </div>

      </header>

      {/* Player currencies */}
      <aside className="game-side-panel">
      <section className="game-hud" role="group" aria-label="Player resources">
        <div
          className="game-resource game-resource-lives"
        >
          <span className="game-hearts" aria-hidden="true">
            {Array.from({ length: progression.maxLives }).map((_, index) => (
              <Heart
                key={index}
                className={index < progression.lives ? 'game-heart-full' : 'game-heart-empty'}
              />
            ))}
          </span>
          <span className="sr-only">Lives</span>
          <strong>{progression.lives}/{progression.maxLives}</strong>
        </div>

        <div
          className="game-resource game-resource-coins"
        >
          <Coins className="w-5 h-5" aria-hidden="true" />
          <span className="sr-only">Coins</span>
          <strong>{progression.coins.toLocaleString()}</strong>
        </div>

        <div
          className="game-resource game-resource-stars"
        >
          <Star className="w-5 h-5 fill-current" aria-hidden="true" />
          <span className="sr-only">Stars</span>
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
      <section
        className={`game-realm-card ${isRealmPanelExpanded ? 'is-expanded' : 'is-collapsed'}`}
      >
        <div className="game-realm-heading">
          <button
            onClick={() => changeMap(-1)}
            disabled={activeMapIndex <= 0}
            className="game-map-arrow"
            aria-label="Previous world area" title={activeMapIndex > 0 ? `Previous: ${visibleMaps[activeMapIndex - 1].name}` : "No previous area"}
          >
            <ChevronLeft className="w-5 h-5" aria-hidden="true" /><span className="game-map-arrow-label">PREV</span>
          </button>

          <button
            type="button"
            className="game-realm-toggle"
            onClick={() => setIsRealmPanelExpanded((expanded) => !expanded)}
            aria-expanded={isRealmPanelExpanded}
            aria-label={isRealmPanelExpanded ? 'Minimise map information' : `Level ${campaignCurrentLevel} of ${campaignLevelTotal} across ${CARTOON_MAPS.length} routes`}
          >
            {isRealmPanelExpanded ? (
              <>
                <span className="game-realm-title-icon">{activeMap.icon}</span>
                <span className="game-realm-title-copy">
                  <strong>{activeMap.name}</strong>
                  <small>{activeMap.subtitle}</small>
                  <small>Level {campaignCurrentLevel} of {campaignLevelTotal} · Route {campaignRouteNumber} of {CARTOON_MAPS.length}</small>
                </span>
                <ChevronDown aria-hidden="true" />
              </>
            ) : (
              <><span className="game-realm-collapsed-label">{campaignCurrentLevel} / {campaignLevelTotal}</span><ChevronUp aria-hidden="true" /></>
            )}
          </button>

          <button
            onClick={() => changeMap(1)}
            disabled={
              activeMapIndex >= visibleMaps.length - 1 || !isMapUnlocked(visibleMaps[activeMapIndex + 1])
            }
            className="game-map-arrow"
            aria-label="Next world area" title={activeMapIndex < visibleMaps.length - 1 && isMapUnlocked(visibleMaps[activeMapIndex + 1]) ? `Next: ${visibleMaps[activeMapIndex + 1].name}` : "Complete this route to unlock the next area"}
          >
            <ChevronRight className="w-5 h-5" aria-hidden="true" /><span className="game-map-arrow-label">NEXT</span>
          </button>
        </div>

        {isRealmPanelExpanded && <div className="game-realm-tabs">
          {visibleMaps.map((map) => {
            const selected = map.id === activeMap.id;
            const unlocked = isMapUnlocked(map);

            return (
              <button
                key={map.id}
                type="button"
                disabled={!unlocked}
                onClick={() => selectMap(map)}
                className={[
                  'game-realm-tab',
                  selected ? 'is-selected' : '',
                  !unlocked ? 'is-locked' : '',
                ].join(' ')}
                aria-label={`${map.name}, ${unlocked ? 'unlocked' : 'locked'}, ${map.levels.length} levels`}
                title={`${map.name} · ${map.levels.length} levels · ${unlocked ? 'unlocked' : 'locked'}`}
              >
                <span>{map.icon}</span>
                <small>{map.levels.length}</small>
              </button>
            );
          })}
        </div>}

        {isRealmPanelExpanded && <p className="game-auto-difficulty-note">
          <Sparkles className="w-4 h-4" />
          {campaignLevelTotal} pub stops across {CARTOON_MAPS.length} London routes. Finish each route’s five levels to unlock the next.
        </p>}
      </section>
      </aside>

      {/* Main illustrated map */}
      <section
        id="cartoon-map-canvas-board"
        className={`game-map-board season-${londonSeason.id} time-${londonTheme.time}`}
        style={{
          backgroundColor: activeMap.themeColor || '#7c2d12',
        }}
      >
        <img
          key={displayedArtworkUrl}
          className="game-map-artwork is-grayscale"
          src={displayedArtworkUrl}
          alt=""
          aria-hidden="true"
          draggable={false}
          loading="eager"
          decoding="sync"
          fetchPriority="high"
        />
        <img
          key={`${displayedArtworkUrl}-colour`}
          className="game-map-artwork is-colour-reveal"
          src={displayedArtworkUrl}
          alt=""
          aria-hidden="true"
          draggable={false}
          loading="eager"
          decoding="sync"
          style={{ clipPath: `inset(${colourRevealTop}% 0 0 0)` }}
        />
        {isMapArtworkLoading && (
          <div className={`game-map-artwork-loader ${isInitialArtworkReady ? '': 'is-initial'}`} role="status" aria-live="polite">
            <span className="game-map-artwork-loader-spinner" aria-hidden="true" />
            <strong>Loading map artwork</strong>
          </div>
        )}
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
              data-level-id={level.id}
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
                type="button"
                aria-label={
                  unlocked
                    ? `Play level ${campaignLevelOffset + level.levelNumber} of ${campaignLevelTotal}: ${level.pubName || level.name}`
                    : `Locked level ${campaignLevelOffset + level.levelNumber} of ${campaignLevelTotal}: ${level.pubName || level.name}`
                }
                onPointerDown={(event) => {
                  // Capture touch and mouse taps immediately, then allow the
                  // marker to spring back before the loading artwork appears.
                  event.preventDefault();
                  lastPointerActivationRef.current = Date.now();
                  pressMapLevel(level, unlocked);
                }}
                onClick={() => {
                  // Some mobile/browser combinations emit only click. Ignore
                  // the click event after pointer-down already handled the tap.
                  if (Date.now() - lastPointerActivationRef.current < 700) return;
                  pressMapLevel(level, unlocked);
                }}
                className={[
                  'game-level-node',
                  pressedLevelId === level.id ? 'is-pressing' : '',
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
                Level {campaignLevelOffset + selectedLevel.levelNumber} of {campaignLevelTotal} · Pub stop {selectedLevel.levelNumber} of {activeMap.levels.length}
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
              <strong>Mixed General Knowledge</strong>
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

    </main>
  );
};
