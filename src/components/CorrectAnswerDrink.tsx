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

  useEffect(() => {
    const timers = POSES.slice(1).map((_, index) =>
      window.setTimeout(() => setFrame(index + 1), 360 + index * 360),
    );
    return () => timers.forEach(window.clearTimeout);
  }, []);

  return (
    <div className="correct-drink-celebration" role="status" aria-live="polite">
      <div className="correct-drink-stage">
        <div className="correct-drink-lights" aria-hidden="true" />
        <div
          className="correct-drink-sprite"
          aria-hidden="true"
          style={{
            backgroundImage: `url(${import.meta.env.BASE_URL}pub-host-drink-sprite.webp)`,
            backgroundPosition: POSES[frame],
          }}
        />
        <div className="correct-drink-sparkles" aria-hidden="true">
          <i>✦</i><i>✧</i><i>✦</i><i>✧</i>
        </div>
        <div className="correct-drink-copy">
          <strong>{frame >= 3 && frame <= 4 ? 'Sip, sip…' : frame === 5 ? 'Lovely!' : 'Correct! Cheers!'}</strong>
          <span>{streak > 1 ? `🔥 ${streak} correct in a row` : '🍺 A well-earned drink'}</span>
        </div>
      </div>
    </div>
  );
};
