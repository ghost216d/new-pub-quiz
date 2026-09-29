import React, { useEffect } from 'react';

interface Props {
  streak: number;
  onComplete?: () => void;
}

export const CorrectAnswerDrink: React.FC<Props> = ({ streak, onComplete }) => {
  useEffect(() => {
    const timer = window.setTimeout(() => onComplete?.(), 7000);
    return () => window.clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      className="correct-drink-celebration"
      role="status"
      aria-live="polite"
      aria-label={`Level complete. ${streak} correct answers in a row.`}
    >
      <div className="correct-drink-stage">
        <img
          className="correct-drink-still"
          src={`${import.meta.env.BASE_URL}level-complete-celebration-v2.webp`}
          alt="Well done! Friends celebrate with a toast in a pub quiz."
          draggable={false}
        />
      </div>
    </div>
  );
};
