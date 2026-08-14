import { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { coinsBestMove, coinsMinimaxValue } from '@/lib/adversarial';

type Phase = 'playing' | 'over';
type Turn = 'human' | 'ai';

interface GameState {
  total: number;
  remaining: number;
  phase: Phase;
  turn: Turn;
  aiThinking: boolean;
  loser: Turn | null;
  lastTake: number | null;
  showAnalysis: boolean;
}

function initState(n: number): GameState {
  return {
    total: n,
    remaining: n,
    phase: 'playing',
    turn: 'human',
    aiThinking: false,
    loser: null,
    lastTake: null,
    showAnalysis: false,
  };
}

export default function CoinsGameViz() {
  const [coinCount, setCoinCount] = useState(7);
  const [state, setState] = useState<GameState>(() => initState(7));
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const { remaining, phase, turn, aiThinking, loser, lastTake, showAnalysis, total } = state;

  // AI move effect
  useEffect(() => {
    if (phase !== 'playing' || turn !== 'ai') return;

    setState(s => ({ ...s, aiThinking: true }));
    timerRef.current = setTimeout(() => {
      setState(prev => {
        // AI is MAX player when it's AI's turn
        const take = coinsBestMove(prev.remaining, true);
        const next = prev.remaining - take;
        if (next <= 0) {
          // AI took the last coin(s) -- AI loses
          return { ...prev, remaining: 0, phase: 'over', aiThinking: false, loser: 'ai', lastTake: take };
        }
        return { ...prev, remaining: next, turn: 'human', aiThinking: false, lastTake: take };
      });
    }, 500);

    return () => clearTimeout(timerRef.current);
  }, [phase, turn]);

  const handleTake = useCallback((take: number) => {
    setState(prev => {
      if (prev.phase !== 'playing' || prev.turn !== 'human' || prev.aiThinking) return prev;
      if (take > prev.remaining) return prev;

      const next = prev.remaining - take;
      if (next <= 0) {
        // Human took the last coin(s) -- human loses
        return { ...prev, remaining: 0, phase: 'over', loser: 'human', lastTake: take };
      }
      return { ...prev, remaining: next, turn: 'ai', lastTake: take };
    });
  }, []);

  const handleNewGame = useCallback(() => {
    clearTimeout(timerRef.current);
    setState(initState(coinCount));
  }, [coinCount]);

  const handleSlider = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const n = Number(e.target.value);
    setCoinCount(n);
    clearTimeout(timerRef.current);
    setState(initState(n));
  }, []);

  const handleShowAnalysis = useCallback(() => {
    setState(s => ({ ...s, showAnalysis: true }));
  }, []);

  // Human goes first. In our game, AI is always MAX in the effect.
  // For the post-game analysis, model the first player (human) as MAX:
  // coinsMinimaxValue(total, true) = value when it's MAX's turn with `total` coins.
  // If > 0, the first mover (human) can force a win with perfect play.
  const startingValue = coinsMinimaxValue(total, true);
  const firstPlayerWins = startingValue > 0;

  return (
    <div className="rounded-lg border border-border bg-card p-4 my-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{remaining}</span> coin{remaining !== 1 ? 's' : ''} remaining
        </div>
        <Button variant="outline" size="sm" onClick={handleNewGame}>
          New Game
        </Button>
      </div>

      {/* Coin count slider */}
      <div className="flex items-center gap-3 mb-4">
        <label className="text-sm text-muted-foreground whitespace-nowrap" htmlFor="coin-slider">
          Coins:
        </label>
        <input
          id="coin-slider"
          type="range"
          min={4}
          max={10}
          value={coinCount}
          onChange={handleSlider}
          disabled={phase === 'playing' && remaining !== coinCount}
          className="flex-1 accent-primary h-2"
        />
        <span className="text-sm font-semibold text-foreground w-6 text-center">{coinCount}</span>
      </div>

      {/* Coins display */}
      <div className="flex justify-center gap-1.5 flex-wrap mb-4 min-h-[48px]">
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            className={`
              w-10 h-10 rounded-full flex items-center justify-center text-lg
              transition-all duration-300
              ${i < remaining
                ? 'bg-amber-400 dark:bg-amber-500 shadow-sm scale-100'
                : 'bg-muted scale-75 opacity-30'
              }
            `}
          >
            {i < remaining ? '🪙' : ''}
          </div>
        ))}
      </div>

      {/* Rules */}
      <p className="text-xs text-muted-foreground text-center mb-4">
        Take 1-3 coins per turn. Whoever takes the <span className="font-semibold">last coin loses</span>.
      </p>

      {/* Status */}
      <div className="text-center mb-4 min-h-[28px]">
        {phase === 'over' ? (
          <span className="text-base font-bold text-foreground">
            {loser === 'human' ? 'You took the last coin — you lose!' : 'AI took the last coin — you win!'}
          </span>
        ) : aiThinking ? (
          <span className="text-sm text-muted-foreground flex items-center justify-center gap-1.5">
            <span className="inline-flex gap-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:0ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:300ms]" />
            </span>
            AI is thinking
          </span>
        ) : turn === 'ai' ? (
          <span className="text-sm text-muted-foreground">AI&apos;s turn</span>
        ) : (
          <span className="text-sm text-muted-foreground">
            Your turn
            {lastTake !== null && <span> &middot; AI took {lastTake}</span>}
          </span>
        )}
      </div>

      {/* Action buttons */}
      {phase === 'playing' && turn === 'human' && !aiThinking && (
        <div className="flex justify-center gap-2 mb-2">
          {[1, 2, 3].map(n => (
            <Button
              key={n}
              variant="outline"
              size="sm"
              disabled={n > remaining}
              onClick={() => handleTake(n)}
            >
              Take {n}
            </Button>
          ))}
        </div>
      )}

      {/* Post-game analysis */}
      {phase === 'over' && !showAnalysis && (
        <div className="flex justify-center mt-2">
          <Button variant="secondary" size="sm" onClick={handleShowAnalysis}>
            Show Game Tree
          </Button>
        </div>
      )}

      {showAnalysis && (
        <div className="mt-3 rounded-md border border-border bg-muted/50 p-3 text-sm text-center">
          <p className="font-semibold text-foreground mb-1">
            Starting position: {total} coins
          </p>
          <p className="text-muted-foreground">
            {firstPlayerWins
              ? `The first player (you) has a winning strategy from ${total} coins. With perfect play, you can always force the AI to take the last coin.`
              : `The first player (you) is in a losing position from ${total} coins. With perfect play by the AI, you cannot avoid taking the last coin.`
            }
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Minimax value: <span className="font-mono font-semibold">{startingValue > 0 ? `+${startingValue}` : startingValue}</span>
            {' '}(+1 = first player wins, -1 = first player loses)
          </p>
        </div>
      )}
    </div>
  );
}
