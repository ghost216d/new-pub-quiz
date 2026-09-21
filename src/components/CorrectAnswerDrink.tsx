import React, { useEffect, useMemo, useState } from 'react';

interface Props {
  streak: number;
}

export const CorrectAnswerDrink: React.FC<Props> = ({ streak }) => {
  const [phase, setPhase] = useState<'cheers' | 'sip' | 'lovely'>('cheers');
  const [frame, setFrame] = useState(0);
  const [framesReady, setFramesReady] = useState(false);
  const frames = useMemo(
    () => Array.from(
      { length: 16 },
      (_, index) => `${import.meta.env.BASE_URL}drink-frames/frame-${String(index).padStart(2, '0')}.webp`,
    ),
    [],
  );

  useEffect(() => {
    let cancelled = false;
    Promise.all(
      frames.map((src) => new Promise<void>((resolve) => {
        const image = new Image();
        image.onload = () => resolve();
        image.onerror = () => resolve();
        image.src = src;
      })),
    ).then(() => {
      if (!cancelled) setFramesReady(true);
    });
    return () => { cancelled = true; };
  }, [frames]);

  useEffect(() => {
    if (!framesReady) return;
    setFrame(0);
    const frameTimers = frames.slice(1).map((_, index) =>
      window.setTimeout(() => setFrame(index + 1), 500 + (index * 300)),
    );
    const timers = [
      window.setTimeout(() => setPhase('sip'), 1350),
      window.setTimeout(() => setPhase('lovely'), 4300),
    ];
    return () => [...frameTimers, ...timers].forEach(window.clearTimeout);
  }, [frames, framesReady]);

  return (
    <div className="correct-drink-celebration" role="status" aria-live="polite">
      <div className="correct-drink-stage">
        <div className="correct-drink-lights" aria-hidden="true" />
        <img
          className={`correct-drink-fallback${framesReady ? ' is-hidden' : ''}`}
          src={`${import.meta.env.BASE_URL}pub-quiz-cover-host.webp`}
          alt=""
          aria-hidden="true"
        />
        <div className="correct-drink-character" aria-hidden="true">
          {frames.map((src, index) => (
            <img
              key={src}
              className={`correct-drink-frame${framesReady && index === frame ? ' is-current' : ''}`}
              src={src}
              alt=""
              decoding="async"
              draggable={false}
            />
          ))}
        </div>
        <div className="correct-drink-sparkles" aria-hidden="true">
          <i>✦</i><i>✧</i><i>✦</i><i>✧</i>
        </div>
        <div className="correct-drink-copy">
          <strong>{phase === 'sip' ? 'Sip, sip…' : phase === 'lovely' ? 'Lovely!' : 'Correct! Cheers!'}</strong>
          <span>{streak > 1 ? `🔥 ${streak} correct in a row` : '🍺 A well-earned drink'}</span>
        </div>
      </div>
    </div>
  );
};
