import React, { useEffect, useState } from 'react';

interface Props {
  streak: number;
}

export const CorrectAnswerDrink: React.FC<Props> = ({ streak }) => {
  const [phase, setPhase] = useState<'cheers' | 'sip' | 'lovely'>('cheers');
  const [spriteReady, setSpriteReady] = useState(false);
  const animationUrl = `${import.meta.env.BASE_URL}pub-host-drink-animated.webp`;

  useEffect(() => {
    const sprite = new Image();
    sprite.onload = () => setSpriteReady(true);
    sprite.src = animationUrl;
    if (sprite.complete) setSpriteReady(true);
  }, [animationUrl]);

  useEffect(() => {
    if (!spriteReady) return;
    const timers = [
      window.setTimeout(() => setPhase('sip'), 820),
      window.setTimeout(() => setPhase('lovely'), 1720),
    ];
    return () => timers.forEach(window.clearTimeout);
  }, [spriteReady]);

  return (
    <div className="correct-drink-celebration" role="status" aria-live="polite">
      <div className="correct-drink-stage">
        <div className="correct-drink-lights" aria-hidden="true" />
        <img
          className={`correct-drink-fallback${spriteReady ? ' is-hidden' : ''}`}
          src={`${import.meta.env.BASE_URL}pub-quiz-cover-host.webp`}
          alt=""
          aria-hidden="true"
        />
        <div className="correct-drink-character" aria-hidden="true">
          <img
            className={`correct-drink-animation${spriteReady ? ' is-ready' : ''}`}
            src={animationUrl}
            alt=""
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
