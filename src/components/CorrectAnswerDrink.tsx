import React, { useEffect, useState } from 'react';

interface Props {
  streak: number;
}

export const CorrectAnswerDrink: React.FC<Props> = ({ streak }) => {
  const [phase, setPhase] = useState<'cheers' | 'sip' | 'lovely'>('cheers');
  const [videoReady, setVideoReady] = useState(false);
  const [videoFinished, setVideoFinished] = useState(false);
  const animationSrc = `${import.meta.env.BASE_URL}pub-host-drink-2d.mp4`;

  useEffect(() => {
    const timers = [
      window.setTimeout(() => setPhase('sip'), 1350),
      window.setTimeout(() => setPhase('lovely'), 4300),
    ];
    return () => timers.forEach(window.clearTimeout);
  }, []);

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
        <video
          className={`correct-drink-video${videoReady && !videoFinished ? ' is-ready' : ''}`}
          src={animationSrc}
          autoPlay
          muted
          playsInline
          preload="auto"
          onLoadedData={() => setVideoReady(true)}
          onEnded={() => setVideoFinished(true)}
          aria-hidden="true"
        />
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
