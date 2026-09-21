import React, { useEffect, useMemo, useRef, useState } from 'react';
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
  const [canvasReady, setCanvasReady] = useState(false);
  const [loadedAssetCount, setLoadedAssetCount] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const runnerImageRef = useRef<HTMLImageElement | null>(null);
  const loadingCover = `${import.meta.env.BASE_URL}london-route-loading-cover.webp`;
  const background = `${import.meta.env.BASE_URL}london-pub-run-background.webp`;
  const runnerSprite = useMemo(() => `${import.meta.env.BASE_URL}london-run-canvas-sprite.webp`, []);
  const runnerFallback = `${import.meta.env.BASE_URL}london-run-frames/run-frame-00.webp`;

  useEffect(() => {
    let cancelled = false;
    const assets = [background, runnerSprite, runnerFallback];
    setLoadedAssetCount(0);
    const loadAssets = Promise.all(
      assets.map((src) => new Promise<void>((resolve) => {
        const image = new Image();
        const finish = () => {
          if (src === runnerSprite) runnerImageRef.current = image;
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
  }, [background, runnerSprite, runnerFallback]);

  useEffect(() => {
    if (!assetsReady) return;
    startTimeRef.current = null;
    audioSynth.playFunnyEntranceSfx();
    let requestId = 0;
    let revealedCanvas = false;
    const animate = (now: number) => {
      if (startTimeRef.current === null) startTimeRef.current = now;
      const elapsed = now - startTimeRef.current;
      const runnerImage = runnerImageRef.current;
      const context = canvasRef.current?.getContext('2d');
      if (runnerImage && context) {
        const frameIndex = Math.floor(elapsed / 31.25) % 32;
        const sourceX = (frameIndex % 8) * 314;
        const sourceY = Math.floor(frameIndex / 8) * 314;
        context.clearRect(0, 0, 628, 628);
        context.drawImage(runnerImage, sourceX, sourceY, 314, 314, 0, 0, 628, 628);
        if (!revealedCanvas) {
          revealedCanvas = true;
          setCanvasReady(true);
        }
      }
      if (elapsed >= 650 && elapsed < 7200) setPhase('running');
      if (elapsed >= 7200) setPhase('arriving');
      if (elapsed >= RUN_DURATION_MS) { onComplete(); return; }
      requestId = window.requestAnimationFrame(animate);
    };
    requestId = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(requestId);
  }, [assetsReady, onComplete]);

  const loadProgress = Math.round((loadedAssetCount / 3) * 100);

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
        <img className={`pub-run-runner-fallback${canvasReady ? ' is-hidden' : ''}`} src={runnerFallback} alt="" draggable={false} />
        <canvas ref={canvasRef} className={`pub-run-runner${canvasReady ? ' is-ready' : ''}`} width={628} height={628} />
        <span className="pub-run-shadow" />
      </div>}
      <div className="pub-run-speed-lines" aria-hidden="true"><i /><i /><i /><i /><i /></div>
      <div className="pub-run-arrival-burst" aria-hidden="true">🍻</div>
    </div>
  );
};
