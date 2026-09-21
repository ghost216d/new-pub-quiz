import React, { useEffect, useRef, useState } from 'react';
import { audioSynth } from '../utils/audioSynth';

interface Props {
  destinationName: string;
  onComplete: () => void;
}

const RUN_DURATION_MS = 8600;
const MINIMUM_COVER_MS = 2400;

export const RunningToPubAnimation: React.FC<Props> = ({ destinationName, onComplete }) => {
  const [phase, setPhase] = useState<'leaving' | 'running' | 'arriving'>('leaving');
  const [assetsReady, setAssetsReady] = useState(false);
  const [frameIndex, setFrameIndex] = useState(0);
  const [loadedAssetCount, setLoadedAssetCount] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const loadingCover = `${import.meta.env.BASE_URL}london-route-loading-cover.webp`;
  const background = `${import.meta.env.BASE_URL}london-pub-run-background.webp`;
  const runnerFrames = Array.from(
    { length: 16 },
    (_, index) => `${import.meta.env.BASE_URL}london-run-frames/run-frame-${String(index).padStart(2, '0')}.webp`,
  );

  useEffect(() => {
    let cancelled = false;
    const assets = [background, ...runnerFrames];
    setLoadedAssetCount(0);
    const loadAssets = Promise.all(
      assets.map((src) => new Promise<void>((resolve) => {
        const image = new Image();
        const finish = () => {
          if (!cancelled) setLoadedAssetCount((count) => Math.min(count + 1, assets.length));
          resolve();
        };
        image.onload = finish;
        image.onerror = finish;
        image.src = src;
      })),
    );
    const minimumCover = new Promise<void>((resolve) => {
      window.setTimeout(resolve, MINIMUM_COVER_MS);
    });
    Promise.all([loadAssets, minimumCover]).then(() => {
      if (!cancelled) setAssetsReady(true);
    });
    return () => { cancelled = true; };
  }, [background]);

  useEffect(() => {
    if (!assetsReady) return;
    startTimeRef.current = null;
    audioSynth.playFunnyEntranceSfx();
    let requestId = 0;
    let previousFrame = -1;
    const animate = (now: number) => {
      if (startTimeRef.current === null) startTimeRef.current = now;
      const elapsed = now - startTimeRef.current;
      const nextFrame = Math.floor(elapsed / 62.5) % runnerFrames.length;
      if (nextFrame !== previousFrame) {
        previousFrame = nextFrame;
        setFrameIndex(nextFrame);
      }
      if (elapsed >= 650 && elapsed < 7200) setPhase('running');
      if (elapsed >= 7200) setPhase('arriving');
      if (elapsed >= RUN_DURATION_MS) { onComplete(); return; }
      requestId = window.requestAnimationFrame(animate);
    };
    requestId = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(requestId);
  }, [assetsReady, onComplete]);

  const loadProgress = Math.round((loadedAssetCount / 17) * 100);

  return (
    <div className={`pub-run-cinematic is-${phase}${assetsReady ? ' is-ready' : ' is-loading'}`} role="status" aria-live="polite">
      <div className="pub-run-loading-cover" style={{ backgroundImage: `url("${loadingCover}")` }} />
      <div className="pub-run-city" style={{ backgroundImage: `url("${background}")` }} />
      <div className="pub-run-atmosphere" />
      <div className="pub-run-road-lines" />
      <div className="pub-run-label">
        <span>{!assetsReady ? 'Getting the London route ready…' : phase === 'arriving' ? 'Made it!' : 'Running to the next pub'}</span>
        <strong>{destinationName}</strong>
        {!assetsReady && (
          <div className="pub-run-loader" aria-label={`Loading ${loadProgress}%`}>
            <div className="pub-run-loader-track">
              <span style={{ width: `${loadProgress}%` }} />
            </div>
            <small>{loadProgress}%</small>
          </div>
        )}
      </div>
      {assetsReady && <div className="pub-run-character" aria-hidden="true">
        <img className="pub-run-runner" src={runnerFrames[frameIndex]} alt="" draggable={false} />
        <span className="pub-run-shadow" />
      </div>}
      <div className="pub-run-speed-lines" aria-hidden="true"><i /><i /><i /><i /><i /></div>
      <div className="pub-run-arrival-burst" aria-hidden="true">🍻</div>
    </div>
  );
};
