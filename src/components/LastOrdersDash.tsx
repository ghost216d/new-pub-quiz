import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Coins, DoorOpen, SkipForward } from 'lucide-react';

type DashItem = {
  id: number;
  lane: number;
  y: number;
  kind: 'coin' | 'star' | 'stool' | 'spill';
};

interface Props {
  pubName: string;
  onComplete: (reward: number) => void;
}

const DURATION_SECONDS = 15;
const hostImage = `${import.meta.env.BASE_URL}pub-quiz-cover-host.webp`;
const itemSymbol: Record<DashItem['kind'], string> = {
  coin: '🪙',
  star: '⭐',
  stool: '🪑',
  spill: '💦',
};

export const LastOrdersDash: React.FC<Props> = ({ pubName, onComplete }) => {
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [playerLane, setPlayerLane] = useState(1);
  const [items, setItems] = useState<DashItem[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(DURATION_SECONDS);
  const [message, setMessage] = useState('Collect rewards and dodge the pub furniture!');
  const laneRef = useRef(1);
  const scoreRef = useRef(0);
  const nextIdRef = useRef(1);
  const completedRef = useRef(false);

  const moveToLane = (lane: number) => {
    const nextLane = Math.max(0, Math.min(2, lane));
    laneRef.current = nextLane;
    setPlayerLane(nextLane);
  };

  const finishDash = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    setFinished(true);
    setStarted(false);
    setItems([]);
    setMessage(scoreRef.current >= 80 ? 'Brilliant dash!' : 'You made it to the next pub!');
    window.setTimeout(() => onComplete(Math.max(0, scoreRef.current)), 1500);
  };

  useEffect(() => {
    if (!started || finished) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') moveToLane(laneRef.current - 1);
      if (event.key === 'ArrowRight') moveToLane(laneRef.current + 1);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [started, finished]);

  useEffect(() => {
    if (!started || finished) return;

    const timer = window.setInterval(() => {
      setTimeLeft((previous) => {
        if (previous <= 1) {
          window.clearInterval(timer);
          finishDash();
          return 0;
        }
        return previous - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [started, finished]);

  useEffect(() => {
    if (!started || finished) return;
    let step = 0;
    const gameLoop = window.setInterval(() => {
      step += 1;
      setItems((previous) => {
        const moved = previous
          .map((item) => ({ ...item, y: item.y + 10 }))
          .filter((item) => {
            if (item.y < 76 || item.y > 88 || item.lane !== laneRef.current) return item.y < 105;

            const isReward = item.kind === 'coin' || item.kind === 'star';
            const change = item.kind === 'star' ? 25 : item.kind === 'coin' ? 10 : -10;
            scoreRef.current = Math.max(0, scoreRef.current + change);
            setScore(scoreRef.current);
            setMessage(isReward ? (item.kind === 'star' ? 'Quiz star! +25' : 'Pub Buck! +10') : 'Careful! -10');
            window.setTimeout(() => setMessage('Keep going!'), 550);
            return false;
          });

        if (step % 2 === 0) {
          const roll = Math.random();
          const kind: DashItem['kind'] = roll < 0.42 ? 'coin' : roll < 0.58 ? 'star' : roll < 0.8 ? 'stool' : 'spill';
          moved.push({
            id: nextIdRef.current++,
            lane: Math.floor(Math.random() * 3),
            y: -8,
            kind,
          });
        }
        return moved;
      });
    }, 360);

    return () => window.clearInterval(gameLoop);
  }, [started, finished]);

  return (
    <main className="last-orders-shell" aria-label="Last Orders Dash mini game">
      <section className="last-orders-card">
        <header className="last-orders-header">
          <div>
            <span className="last-orders-kicker">BONUS MINI-GAME</span>
            <h2>Last Orders Dash</h2>
            <p>{finished ? 'Next stop unlocked!' : `Race out of ${pubName}`}</p>
          </div>
          <div className="last-orders-score" aria-label={`${score} bonus Pub Bucks`}>
            <Coins aria-hidden="true" />
            <strong>{score}</strong>
          </div>
        </header>

        <div className="last-orders-track">
          <div className="last-orders-door" aria-hidden="true">
            <DoorOpen />
            <span>NEXT PUB</span>
          </div>
          {[0, 1, 2].map((lane) => (
            <div key={lane} className="last-orders-lane" aria-hidden="true" />
          ))}

          {items.map((item) => (
            <span
              key={item.id}
              className={`last-orders-item is-${item.kind}`}
              style={{ left: `${16.67 + item.lane * 33.33}%`, top: `${item.y}%` }}
              aria-hidden="true"
            >
              {itemSymbol[item.kind]}
            </span>
          ))}

          <div
            className={`last-orders-player ${started ? 'is-running' : ''} ${finished ? 'is-celebrating' : ''}`}
            style={{ left: `${16.67 + playerLane * 33.33}%` }}
            aria-label="Quiz host character"
          >
            <img src={hostImage} alt="The Pub Quiz host" />
          </div>

          {!started && !finished && (
            <div className="last-orders-overlay">
              <div className="last-orders-instructions">
                <span className="last-orders-character-preview">
                  <img src={hostImage} alt="The Pub Quiz cover character" />
                </span>
                <h3>Ready for last orders?</h3>
                <p>Move left and right. Collect 🪙 and ⭐. Dodge 🪑 and 💦.</p>
                <button type="button" onClick={() => setStarted(true)}>
                  START DASH
                </button>
              </div>
            </div>
          )}

          {finished && (
            <div className="last-orders-overlay is-finished" role="status">
              <div className="last-orders-finish-copy">
                <span>🎉</span>
                <strong>{message}</strong>
                <small>+{score} bonus Pub Bucks</small>
              </div>
            </div>
          )}
        </div>

        <div className="last-orders-status" aria-live="polite">
          <span>{started ? `${timeLeft}s` : finished ? 'Stage complete' : '15-second bonus round'}</span>
          <strong>{message}</strong>
        </div>

        <div className="last-orders-controls">
          <button type="button" onClick={() => moveToLane(playerLane - 1)} disabled={!started} aria-label="Move left">
            <ChevronLeft /> LEFT
          </button>
          <button type="button" onClick={() => moveToLane(playerLane + 1)} disabled={!started} aria-label="Move right">
            RIGHT <ChevronRight />
          </button>
        </div>

        {!finished && (
          <button type="button" className="last-orders-skip" onClick={() => onComplete(0)}>
            <SkipForward /> Skip bonus game
          </button>
        )}
      </section>
    </main>
  );
};
