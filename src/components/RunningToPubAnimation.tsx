import React, { useEffect, useMemo, useRef, useState } from 'react';
import { audioSynth } from '../utils/audioSynth';

interface Props {
  destinationName: string;
  onComplete: () => void;
}

const FRAME_COUNT = 16;
const RUN_DURATION_MS = 8600;

export const RunningToPubAnimation: React.FC<Props> = ({ destinationName, onComplete }) => {
  const [framePosition, setFramePosition] = useState(0);
  const [phase, setPhase] = useState<'leaving' | 'running' | 'arriving'>('leaving');
  const startTimeRef = useRef<number | null>(null);
  const frames = useMemo(
    () => Array.from(
      { length: FRAME_COUNT },
      (_, index) => `${import.meta.env.BASE_URL}london-run-frames/run-frame-${String(index).padStart(2, '0')}.webp`,
    ),
    [],
  );

  useEffect(() => {
    frames.forEach((src) => { const image = new Image(); image.src = src; });
    audioSynth.playFunnyEntranceSfx();
    let requestId = 0;
    const animate = (now: number) => {
      if (startTimeRef.current === null) startTimeRef.current = now;
      const elapsed = now - startTimeRef.current;
      setFramePosition((elapsed / 92) % FRAME_COUNT);
      if (elapsed >= 650 && elapsed < 7200) setPhase('running');
      if (elapsed >= 7200) setPhase('arriving');
      if (elapsed >= RUN_DURATION_MS) { onComplete(); return; }
      requestId = window.requestAnimationFrame(animate);
    };
    requestId = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(requestId);
  }, [frames, onComplete]);

  const currentFrame = Math.floor(framePosition) % FRAME_COUNT;
  const nextFrame = (currentFrame + 1) % FRAME_COUNT;
  const blend = framePosition - Math.floor(framePosition);

  return (
    <div className={`pub-run-cinematic is-${phase}`} role="status" aria-live="polite">
      <div className="pub-run-city" />
      <div className="pub-run-atmosphere" />
      <div className="pub-run-road-lines" />
      <div className="pub-run-label">
        <span>{phase === 'arriving' ? 'Made it!' : 'Running to the next pub'}</span>
        <strong>{destinationName}</strong>
      </div>
      <div className="pub-run-character" aria-hidden="true">
        <img src={frames[currentFrame]} alt="" style={{ opacity: 1 - blend }} draggable={false} />
        <img src={frames[nextFrame]} alt="" style={{ opacity: blend }} draggable={false} />
        <span className="pub-run-shadow" />
      </div>
      <div className="pub-run-speed-lines" aria-hidden="true"><i /><i /><i /><i /><i /></div>
      <div className="pub-run-arrival-burst" aria-hidden="true">🍻</div>
    </div>
  );
};
