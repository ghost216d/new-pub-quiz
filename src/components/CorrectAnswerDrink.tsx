import React, { useEffect, useState } from 'react';

interface Props {
  streak: number;
}

const POSES = [
  '0% 0%', '50% 0%', '100% 0%',
  '0% 100%', '50% 100%', '100% 100%',
];

export const CorrectAnswerDrink: React.FC<Props> = ({ streak }) => {
  const [frame, setFrame] = useState(0);
  const [spriteReady, setSpriteReady] = useState(false);
  const spriteUrl = `${import.meta.env.BASE_URL}pub-host-drink-sprite.webp`;

  useEffect(() => {
    const sprite = new Image();
    sprite.onload = () => setSpriteReady(true);
    sprite.src = spriteUrl;
    if (sprite.complete) setSpriteReady(true);
  }, [spriteUrl]);

  useEffect(() => {
    if (!spriteReady) return;
    const timers = POSES.slice(1).map((_, index) =>
      window.setTimeout(() => setFrame(index + 1), 360 + index * 360),
    );
    return () => timers.forEach(window.clearTimeout);
  }, [spriteReady]);

  return (
    <div className="correct-drink-celebration" role="status" aria-live="polite">
      <div className="correct-drink-stage">
        <div className="correct-drink-lights" aria-hidden="true" />
        <img
          className="correct-drink-fallback"
          src={`${import.meta.env.BASE_URL}pub-quiz-cover-host.webp`}
          alt=""
          aria-hidden="true"
        />
        <div
          className={`correct-drink-sprite${spriteReady ? ' is-ready' : ''}`}
          aria-hidden="true"
          style={{
            backgroundImage: `url(${spriteUrl})`,
            backgroundPosition: POSES[frame],
          }}
        />
        <div className="correct-drink-sparkles" aria-hidden="true">
          <i>✦</i><i>✧</i><i>✦</i><i>✧</i>
        </div>
        <div className="correct-drink-copy">
          <strong>{spriteReady && frame >= 3 && frame <= 4 ? 'Sip, sip…' : spriteReady && frame === 5 ? 'Lovely!' : 'Correct! Cheers!'}</strong>
          <span>{streak > 1 ? `🔥 ${streak} correct in a row` : '🍺 A well-earned drink'}</span>
        </div>
      </div>
    </div>
  );
};
