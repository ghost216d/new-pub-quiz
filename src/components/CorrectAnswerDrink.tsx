import React from 'react';

interface Props {
  streak: number;
}

export const CorrectAnswerDrink: React.FC<Props> = ({ streak }) => (
  <div className="correct-drink-celebration" role="status" aria-live="polite">
    <div className="correct-drink-card">
      <div className="correct-drink-glow" aria-hidden="true" />
      <div className="correct-drink-host" aria-hidden="true">
        <img src={`${import.meta.env.BASE_URL}pub-quiz-cover-host.webp`} alt="" />
        <span className="correct-drink-pint">🍺</span>
        <span className="correct-drink-foam foam-one">●</span>
        <span className="correct-drink-foam foam-two">●</span>
        <span className="correct-drink-foam foam-three">●</span>
      </div>
      <div className="correct-drink-copy">
        <strong>Correct! Cheers!</strong>
        <span>{streak > 1 ? `🔥 ${streak} in a row` : '🍺 A well-earned sip'}</span>
      </div>
    </div>
  </div>
);
