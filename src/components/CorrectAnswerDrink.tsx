import React, { useEffect, useState } from 'react';

interface Props {
  streak: number;
  onComplete?: () => void;
}

const CELEBRATION_DURATION_MS = 7000;

export const CorrectAnswerDrink: React.FC<Props> = ({ streak, onComplete }) => {
  const [videoFailed, setVideoFailed] = useState(false);
  const [motionAllowed, setMotionAllowed] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => onComplete?.(), CELEBRATION_DURATION_MS);
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    setMotionAllowed(!motionPreference.matches);

    const updateMotionPreference = () => setMotionAllowed(!motionPreference.matches);
    motionPreference.addEventListener?.('change', updateMotionPreference);

    return () => {
      window.clearTimeout(timer);
      motionPreference.removeEventListener?.('change', updateMotionPreference);
    };
  }, [onComplete]);

  const poster = `${import.meta.env.BASE_URL}level-complete-celebration-v2.webp`;

  return (
    <div
      className="correct-drink-celebration"
      role="status"
      aria-live="polite"
      aria-label={`Level complete. ${streak} correct answers in a row.`}
    >
      <div className="correct-drink-stage">
        {motionAllowed && !videoFailed ? (
          <video
            className="correct-drink-still"
            src={`${import.meta.env.BASE_URL}pub-host-drink-v6.mp4`}
            poster={poster}
            autoPlay
            muted
            playsInline
            preload="auto"
            aria-hidden="true"
            onError={() => setVideoFailed(true)}
            style={{ objectFit: 'contain', objectPosition: 'center' }}
          />
        ) : (
          <img
            className="correct-drink-still"
            src={poster}
            alt="Well done! Friends celebrate with a toast in a pub quiz."
            draggable={false}
            style={{ objectFit: 'contain', objectPosition: 'center' }}
          />
        )}
      </div>
    </div>
  );
};
