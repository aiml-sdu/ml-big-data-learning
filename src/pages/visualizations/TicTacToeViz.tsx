import { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  tttEmpty,
  tttWinner,
  tttWinLine,
  tttIsTerminal,
  tttBestMove,
  tttCurrentPlayer,
  tttMovesWithValues,
} from '@/lib/adversarial';
import type { TTTBoard, TTTCell } from '@/lib/adversarial';

type GamePhase = 'playing' | 'over';

interface GameState {
  board: TTTBoard;
  phase: GamePhase;
  aiSymbol: TTTCell;
  humanSymbol: TTTCell;
  aiThinking: boolean;
  showValues: boolean;
  lastAIBoard: TTTBoard | null; // board state before AI's last move
}

function initState(aiFirst: boolean): GameState {
  return {
    board: tttEmpty(),
    phase: 'playing',
    aiSymbol: aiFirst ? 'X' : 'O',    // X always goes first
    humanSymbol: aiFirst ? 'O' : 'X',
    aiThinking: false,
    showValues: false,
    lastAIBoard: null,
  };
}

function resultText(board: TTTBoard): string {
  const w = tttWinner(board);
  if (w === 'X') return 'X wins!';
  if (w === 'O') return 'O wins!';
  return 'Draw!';
}

export default function TicTacToeViz() {
  const [state, setState] = useState<GameState>(() => initState(true));
  const [aiFirst, setAiFirst] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const { board, phase, aiSymbol, humanSymbol, aiThinking, showValues, lastAIBoard } = state;
  const winLine = phase === 'over' ? tttWinLine(board) : null;
  const currentPlayer = tttCurrentPlayer(board);
  const isAITurn = phase === 'playing' && currentPlayer === aiSymbol;

  // Compute minimax values for the AI's last decision state
  const aiValues = showValues && lastAIBoard
    ? tttMovesWithValues(lastAIBoard, aiSymbol)
    : null;

  const valueMap = new Map<number, number>();
  if (aiValues) {
    for (const { move, value } of aiValues) {
      valueMap.set(move, value);
    }
  }

  // AI move effect
  useEffect(() => {
    if (!isAITurn) return;

    setState(s => ({ ...s, aiThinking: true }));
    timerRef.current = setTimeout(() => {
      setState(prev => {
        const move = tttBestMove(prev.board, prev.aiSymbol);
        const next = [...prev.board] as TTTBoard;
        next[move] = prev.aiSymbol;
        const done = tttIsTerminal(next);
        return {
          ...prev,
          board: next,
          phase: done ? 'over' : 'playing',
          aiThinking: false,
          lastAIBoard: prev.board,
        };
      });
    }, 500);

    return () => clearTimeout(timerRef.current);
  }, [isAITurn, aiSymbol]);

  const handleCellClick = useCallback((i: number) => {
    setState(prev => {
      if (prev.phase !== 'playing' || prev.aiThinking) return prev;
      if (prev.board[i] !== null) return prev;
      if (tttCurrentPlayer(prev.board) !== prev.humanSymbol) return prev;

      const next = [...prev.board] as TTTBoard;
      next[i] = prev.humanSymbol;
      const done = tttIsTerminal(next);
      return {
        ...prev,
        board: next,
        phase: done ? 'over' : 'playing',
      };
    });
  }, []);

  const handleNewGame = useCallback(() => {
    clearTimeout(timerRef.current);
    setState(initState(aiFirst));
  }, [aiFirst]);

  const handleToggleFirst = useCallback(() => {
    clearTimeout(timerRef.current);
    const next = !aiFirst;
    setAiFirst(next);
    setState(initState(next));
  }, [aiFirst]);

  const handleShowValues = useCallback(() => {
    setState(s => ({ ...s, showValues: true }));
  }, []);

  return (
    <div className="rounded-lg border border-border bg-card p-4 my-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="text-sm text-muted-foreground">
          You are <span className="font-bold text-foreground">{humanSymbol}</span>
          {' '}&middot;{' '}
          AI is <span className="font-bold text-foreground">{aiSymbol}</span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleToggleFirst}>
            {aiFirst ? 'Let me go first' : 'Let AI go first'}
          </Button>
          <Button variant="outline" size="sm" onClick={handleNewGame}>
            New Game
          </Button>
        </div>
      </div>

      {/* Status */}
      <div className="text-center mb-3 min-h-[28px]">
        {phase === 'over' ? (
          <span className="text-base font-bold text-foreground">{resultText(board)}</span>
        ) : aiThinking ? (
          <span className="text-sm text-muted-foreground flex items-center justify-center gap-1.5">
            <span className="inline-flex gap-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:0ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:300ms]" />
            </span>
            AI is thinking
          </span>
        ) : isAITurn ? (
          <span className="text-sm text-muted-foreground">AI&apos;s turn</span>
        ) : (
          <span className="text-sm text-muted-foreground">Your turn</span>
        )}
      </div>

      {/* Board */}
      <div className="flex justify-center mb-4">
        <div
          className="grid grid-cols-3 gap-1 rounded-lg bg-border p-1"
          style={{ width: 280, height: 280 }}
        >
          {board.map((cell, i) => {
            const isWinCell = winLine?.includes(i) ?? false;
            const clickable = phase === 'playing' && !aiThinking && cell === null && currentPlayer === humanSymbol;
            const miniVal = valueMap.get(i);

            return (
              <button
                key={i}
                type="button"
                onClick={() => handleCellClick(i)}
                disabled={!clickable}
                className={`
                  relative flex items-center justify-center rounded-md text-4xl font-bold
                  transition-colors select-none
                  ${isWinCell
                    ? 'bg-emerald-500/20 dark:bg-emerald-400/20 ring-2 ring-emerald-500 dark:ring-emerald-400'
                    : 'bg-card'
                  }
                  ${clickable ? 'cursor-pointer hover:bg-muted' : 'cursor-default'}
                `}
              >
                {cell === 'X' && (
                  <span className="text-blue-600 dark:text-blue-400">X</span>
                )}
                {cell === 'O' && (
                  <span className="text-orange-600 dark:text-orange-400">O</span>
                )}
                {/* Minimax value overlay */}
                {miniVal !== undefined && cell === null && (
                  <span className="absolute bottom-1 right-1.5 text-[11px] font-mono font-semibold text-muted-foreground">
                    {miniVal > 0 ? `+${miniVal}` : miniVal}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Post-game controls */}
      {phase === 'over' && !showValues && lastAIBoard && (
        <div className="flex justify-center">
          <Button variant="secondary" size="sm" onClick={handleShowValues}>
            Show AI&apos;s thinking
          </Button>
        </div>
      )}

      {showValues && aiValues && (
        <div className="text-center text-xs text-muted-foreground mt-2">
          Minimax values from AI&apos;s last decision.{' '}
          <span className="font-semibold">+1</span> = AI wins,{' '}
          <span className="font-semibold">0</span> = draw,{' '}
          <span className="font-semibold">-1</span> = AI loses.
        </div>
      )}
    </div>
  );
}
