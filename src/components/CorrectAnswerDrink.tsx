import React, { useEffect, useState } from 'react';

interface Props {
  streak: number;
}

export const CorrectAnswerDrink: React.FC<Props> = ({ streak }) => {
  const [phase, setPhase] = useState<'cheers' | 'sip' | 'lovely'>('cheers');
  const [videoReady, setVideoReady] = useState(false);
  const videoUrl = `${import.meta.env.BASE_URL}pub-host-drink.mp4`;

  useEffect(() => {
    if (!videoReady) return;
    const timers = [
      window.setTimeout(() => setPhase('sip'), 820),
      window.setTimeout(() => setPhase('lovely'), 1720),
    ];
    return () => timers.forEach(window.clearTimeout);
  }, [videoReady]);

  return (
    <div className="correct-drink-celebration" role="status" aria-live="polite">
      <div className="correct-drink-stage">
        <div className="correct-drink-lights" aria-hidden="true" />
        <img
          className={`correct-drink-fallback${videoReady ? ' is-hidden' : ''}`}
          src={`${import.meta.env.BASE_URL}pub-quiz-cover-host.webp`}
          alt=""
          aria-hidden="true"
        />
        <div className="correct-drink-character" aria-hidden="true">
          <video
            className={`correct-drink-animation${videoReady ? ' is-ready' : ''}`}
            src={videoUrl}
            autoPlay
            muted
            playsInline
            preload="auto"
            onLoadedData={() => setVideoReady(true)}
            onCanPlay={() => setVideoReady(true)}
          />
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
