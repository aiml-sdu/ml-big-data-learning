import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useLabProgress } from '@/hooks/useLabProgress';
import {
  type BtPiece,
  type BtBoard,
  type BtMove,
  btInitBoard,
  btWinner,
  btMoves,
  btApplyMove,
  btBestMove,
} from '@/lib/adversarial';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const BOARD_SIZE = 5;
const CELL_SIZE = 50;
const GRID_SIZE = CELL_SIZE * BOARD_SIZE;

// ---------------------------------------------------------------------------
// Board renderer
// ---------------------------------------------------------------------------

function BoardGrid({
  board,
  onCellClick,
  selectedCell,
  legalMoves,
  highlightDots,
  lastMove,
}: {
  board: BtBoard;
  onCellClick?: (r: number, c: number) => void;
  selectedCell?: { r: number; c: number } | null;
  legalMoves?: BtMove[];
  highlightDots?: Set<string>;
  lastMove?: BtMove | null;
}) {
  const legalDestinations = useMemo(() => {
    if (!legalMoves) return new Set<string>();
    return new Set(legalMoves.map((m) => `${m.toR},${m.toC}`));
  }, [legalMoves]);

  return (
    <svg
      width={GRID_SIZE}
      height={GRID_SIZE}
      viewBox={`0 0 ${GRID_SIZE} ${GRID_SIZE}`}
      className="border rounded"
    >
      {/* Cells */}
      {Array.from({ length: BOARD_SIZE }, (_, r) =>
        Array.from({ length: BOARD_SIZE }, (_, c) => {
          const isSelected = selectedCell?.r === r && selectedCell?.c === c;
          const isLegalDest = legalDestinations.has(`${r},${c}`);
          const isDot = highlightDots?.has(`${r},${c}`);
          const isLastFrom = lastMove?.fromR === r && lastMove?.fromC === c;
          const isLastTo = lastMove?.toR === r && lastMove?.toC === c;
          const piece = board[r][c];
          const cx = c * CELL_SIZE + CELL_SIZE / 2;
          const cy = r * CELL_SIZE + CELL_SIZE / 2;

          return (
            <g
              key={`${r}-${c}`}
              onClick={() => onCellClick?.(r, c)}
              className={onCellClick ? 'cursor-pointer' : ''}
            >
              {/* Cell background */}
              <rect
                x={c * CELL_SIZE}
                y={r * CELL_SIZE}
                width={CELL_SIZE}
                height={CELL_SIZE}
                fill={
                  isSelected
                    ? 'oklch(0.75 0.15 140)'
                    : isLastFrom
                      ? 'oklch(0.85 0.08 90 / 0.4)'
                      : isLastTo
                        ? 'oklch(0.80 0.10 90 / 0.5)'
                        : (r + c) % 2 === 0
                          ? 'oklch(0.92 0.01 250)'
                          : 'oklch(0.82 0.02 250)'
                }
                stroke="oklch(0.7 0.02 250)"
                strokeWidth={0.5}
              />

              {/* Legal move dots */}
              {(isLegalDest || isDot) && !piece && (
                <circle
                  cx={cx}
                  cy={cy}
                  r={8}
                  fill="oklch(0.6 0.2 145)"
                  opacity={0.5}
                />
              )}

              {/* Capture indicator (legal move on enemy piece) */}
              {isLegalDest && piece && (
                <rect
                  x={c * CELL_SIZE + 3}
                  y={r * CELL_SIZE + 3}
                  width={CELL_SIZE - 6}
                  height={CELL_SIZE - 6}
                  fill="none"
                  stroke="oklch(0.6 0.25 30)"
                  strokeWidth={3}
                  rx={4}
                  opacity={0.7}
                />
              )}

              {/* Pieces */}
              {piece === 'W' && (
                <>
                  <circle cx={cx} cy={cy} r={18} fill="oklch(0.95 0.01 250)" stroke="oklch(0.3 0.02 250)" strokeWidth={2} />
                  <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight="bold" fill="oklch(0.3 0.02 250)" className="select-none">W</text>
                </>
              )}
              {piece === 'B' && (
                <>
                  <circle cx={cx} cy={cy} r={18} fill="oklch(0.25 0.02 250)" stroke="oklch(0.5 0.02 250)" strokeWidth={2} />
                  <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight="bold" fill="oklch(0.9 0.01 250)" className="select-none">B</text>
                </>
              )}
            </g>
          );
        }),
      )}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Step 1: Rules Demo
// ---------------------------------------------------------------------------

const DEMO_PIECES: { r: number; c: number }[] = [
  { r: 3, c: 2 },  // W piece in middle area
  { r: 4, c: 0 },  // W piece at bottom-left
  { r: 3, c: 4 },  // W piece at right side
];

function StepRulesDemo({ onComplete }: { onComplete: () => void }) {
  const board = useMemo(() => btInitBoard(BOARD_SIZE), []);
  const [demoPieceIdx, setDemoPieceIdx] = useState(0);
  const [clickedMoves, setClickedMoves] = useState<Set<string>>(new Set());
  const [allDemosDone, setAllDemosDone] = useState(false);

  const currentPiece = DEMO_PIECES[demoPieceIdx];
  const legalMovesForPiece = useMemo(() => {
    return btMoves(board, 'W').filter(
      (m) => m.fromR === currentPiece.r && m.fromC === currentPiece.c,
    );
  }, [board, currentPiece]);

  const dotPositions = useMemo(
    () => new Set(legalMovesForPiece.map((m) => `${m.toR},${m.toC}`)),
    [legalMovesForPiece],
  );

  const allMovesClicked = clickedMoves.size >= legalMovesForPiece.length;

  const handleCellClick = useCallback(
    (r: number, c: number) => {
      if (allDemosDone) return;
      const key = `${r},${c}`;
      if (dotPositions.has(key)) {
        setClickedMoves((prev) => {
          const next = new Set(prev);
          next.add(key);
          return next;
        });
      }
    },
    [dotPositions, allDemosDone],
  );

  const handleNextPiece = useCallback(() => {
    if (demoPieceIdx < DEMO_PIECES.length - 1) {
      setDemoPieceIdx((i) => i + 1);
      setClickedMoves(new Set());
    } else {
      setAllDemosDone(true);
      onComplete();
    }
  }, [demoPieceIdx, onComplete]);

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Explore how W pieces move. Each piece can move <strong>forward</strong> (up) one step: straight or diagonal.
        Diagonal moves can <strong>capture</strong> opponent pieces. Click each green dot to learn.
      </p>
      <div className="flex items-start gap-4">
        <BoardGrid
          board={board}
          onCellClick={handleCellClick}
          selectedCell={allDemosDone ? null : currentPiece}
          highlightDots={allDemosDone ? undefined : dotPositions}
        />
        <div className="space-y-2 text-sm">
          {!allDemosDone && (
            <>
              <p>
                Piece {demoPieceIdx + 1}/{DEMO_PIECES.length} at ({currentPiece.r}, {currentPiece.c}).
              </p>
              <p className="text-xs text-muted-foreground">
                {legalMovesForPiece.length} legal move{legalMovesForPiece.length !== 1 ? 's' : ''}.
                Clicked: {clickedMoves.size}/{legalMovesForPiece.length}
              </p>
              {legalMovesForPiece.map((m) => {
                const key = `${m.toR},${m.toC}`;
                const clicked = clickedMoves.has(key);
                return (
                  <div key={key} className={`text-xs ${clicked ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
                    {clicked ? '\u2713' : '\u25CB'} ({m.fromR},{m.fromC}) \u2192 ({m.toR},{m.toC})
                    {m.capture ? ' [capture]' : ''}
                  </div>
                );
              })}
              {allMovesClicked && (
                <Button size="sm" onClick={handleNextPiece}>
                  {demoPieceIdx < DEMO_PIECES.length - 1 ? 'Next Piece' : 'Done'}
                </Button>
              )}
            </>
          )}
          {allDemosDone && (
            <p className="text-green-600 dark:text-green-400 font-semibold">
              You've explored all demo pieces! W moves up, B moves down.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 2: Move Generation Count
// ---------------------------------------------------------------------------

// A mid-game board for counting
function makeMidGameBoard(): BtBoard {
  const b: BtBoard = Array.from({ length: BOARD_SIZE }, () =>
    Array(BOARD_SIZE).fill(null),
  );
  // Place some W and B pieces in a mid-game arrangement
  b[1][1] = 'B';
  b[1][3] = 'B';
  b[0][0] = 'B';
  b[0][4] = 'B';
  b[3][1] = 'W';
  b[3][3] = 'W';
  b[4][0] = 'W';
  b[4][2] = 'W';
  b[4][4] = 'W';
  return b;
}

function StepMoveGeneration({ onComplete }: { onComplete: () => void }) {
  const board = useMemo(() => makeMidGameBoard(), []);
  const correctCount = useMemo(() => btMoves(board, 'W').length, [board]);

  const options = useMemo(() => {
    const opts = new Set<number>();
    opts.add(correctCount);
    opts.add(correctCount - 2);
    opts.add(correctCount + 2);
    opts.add(correctCount + 4);
    return [...opts].sort((a, b) => a - b);
  }, [correctCount]);

  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const handlePick = useCallback(
    (val: number) => {
      if (feedback === 'correct') return;
      if (val === correctCount) {
        setFeedback('correct');
        setTimeout(onComplete, 800);
      } else {
        setFeedback('wrong');
        setTimeout(() => setFeedback(null), 1200);
      }
    },
    [correctCount, feedback, onComplete],
  );

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Count the total number of legal moves for <strong>White (W)</strong> in this position.
        Remember: forward straight (if empty) and forward diagonal (empty or capture).
      </p>
      <div className="flex items-start gap-4">
        <BoardGrid board={board} />
        <div className="space-y-3">
          <p className="text-sm font-medium">How many legal moves does White have?</p>
          <div className="flex gap-2">
            {options.map((v) => (
              <Button
                key={v}
                size="sm"
                variant={feedback === 'correct' && v === correctCount ? 'default' : 'outline'}
                disabled={feedback === 'correct'}
                onClick={() => handlePick(v)}
              >
                {v}
              </Button>
            ))}
          </div>
          <AnimatePresence>
            {feedback === 'wrong' && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="text-xs text-red-600 dark:text-red-400">
                Not quite. Check each W piece: can it go straight up? Diagonal-left? Diagonal-right?
              </motion.p>
            )}
            {feedback === 'correct' && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-xs text-green-600 dark:text-green-400">
                Correct! White has {correctCount} legal moves in this position.
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 3: Full Game
// ---------------------------------------------------------------------------

function StepPlayGame({ onComplete }: { onComplete: () => void }) {
  const [board, setBoard] = useState<BtBoard>(() => btInitBoard(BOARD_SIZE));
  const [selectedCell, setSelectedCell] = useState<{ r: number; c: number } | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<BtPiece>(null);
  const [message, setMessage] = useState('Your turn (White). Click a W piece to select it.');
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [lastMove, setLastMove] = useState<BtMove | null>(null);

  const legalMovesForSelected = useMemo(() => {
    if (!selectedCell) return [];
    if (board[selectedCell.r][selectedCell.c] !== 'W') return [];
    return btMoves(board, 'W').filter(
      (m) => m.fromR === selectedCell.r && m.fromC === selectedCell.c,
    );
  }, [board, selectedCell]);

  const handleCellClick = useCallback(
    (r: number, c: number) => {
      if (!isPlayerTurn || gameOver) return;

      // If clicking a legal destination, make the move
      if (selectedCell && legalMovesForSelected.some((m) => m.toR === r && m.toC === c)) {
        const move = legalMovesForSelected.find((m) => m.toR === r && m.toC === c)!;
        const nextBoard = btApplyMove(board, move);
        setBoard(nextBoard);
        setSelectedCell(null);
        setLastMove(move);

        const w = btWinner(nextBoard);
        if (w) {
          setGameOver(true);
          setWinner(w);
          setMessage(w === 'W' ? 'White wins!' : 'Black wins!');
          setTimeout(onComplete, 600);
          return;
        }

        // AI turn
        setIsPlayerTurn(false);
        setMessage("Black is thinking...");

        setTimeout(() => {
          const aiMove = btBestMove(nextBoard, 'B');
          if (!aiMove) {
            setGameOver(true);
            setWinner('W');
            setMessage('Black has no moves. White wins!');
            setTimeout(onComplete, 600);
            return;
          }

          const afterAI = btApplyMove(nextBoard, aiMove);
          setBoard(afterAI);
          setLastMove(aiMove);

          const w2 = btWinner(afterAI);
          if (w2) {
            setGameOver(true);
            setWinner(w2);
            setMessage(w2 === 'W' ? 'White wins!' : 'Black wins!');
            setTimeout(onComplete, 600);
          } else {
            setIsPlayerTurn(true);
            setMessage('Your turn (White). Click a W piece.');
          }
        }, 500);

        return;
      }

      // If clicking a W piece, select it
      if (board[r][c] === 'W') {
        const pieceMoves = btMoves(board, 'W').filter((m) => m.fromR === r && m.fromC === c);
        if (pieceMoves.length === 0) {
          setMessage('That piece has no legal moves.');
          return;
        }
        setSelectedCell({ r, c });
        setMessage(`Selected W at (${r},${c}). Click a green dot to move.`);
      } else {
        setSelectedCell(null);
        setMessage('Click a W piece to select it.');
      }
    },
    [board, selectedCell, legalMovesForSelected, isPlayerTurn, gameOver, onComplete],
  );

  const handleReset = useCallback(() => {
    setBoard(btInitBoard(BOARD_SIZE));
    setSelectedCell(null);
    setGameOver(false);
    setWinner(null);
    setMessage('Your turn (White). Click a W piece to select it.');
    setIsPlayerTurn(true);
    setLastMove(null);
  }, []);

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Play as <strong>White</strong> against the AI (Black). Win by reaching the top row or capturing all Black pieces.
      </p>
      <div className="flex items-start gap-4">
        <motion.div
          animate={gameOver && winner === 'W' ? { scale: [1, 1.03, 1] } : {}}
          transition={{ duration: 0.5 }}
        >
          <BoardGrid
            board={board}
            onCellClick={!gameOver && isPlayerTurn ? handleCellClick : undefined}
            selectedCell={selectedCell}
            legalMoves={legalMovesForSelected}
            lastMove={lastMove}
          />
        </motion.div>
        <div className="space-y-2 text-sm min-w-[140px]">
          <p className={
            gameOver
              ? winner === 'W'
                ? 'font-semibold text-green-600 dark:text-green-400'
                : 'font-semibold text-red-600 dark:text-red-400'
              : 'text-muted-foreground'
          }>
            {message}
          </p>

          {!gameOver && (
            <div className="text-xs text-muted-foreground space-y-1">
              <p>W pieces: {board.flat().filter((c) => c === 'W').length}</p>
              <p>B pieces: {board.flat().filter((c) => c === 'B').length}</p>
            </div>
          )}

          {gameOver && (
            <Button size="sm" variant="outline" onClick={handleReset}>
              Play again
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Exercise Component
// ---------------------------------------------------------------------------

const STEPS = [
  { id: 1, title: 'Rules Demo', desc: 'Explore how pieces move in Breakthrough' },
  { id: 2, title: 'Move Generation', desc: 'Count legal moves for White in a position' },
  { id: 3, title: 'Play', desc: 'Play a full game against the AI' },
];

export default function Exercise3Breakthrough() {
  const { markStepComplete, isStepComplete } = useLabProgress('lab5-ex3', 3);
  const [currentStep, setCurrentStep] = useState(() => {
    for (let i = 1; i <= 3; i++) {
      if (!isStepComplete(i)) return i;
    }
    return 4;
  });

  const allDone = currentStep > 3;

  const handleStepComplete = useCallback(
    (step: number) => {
      markStepComplete(step);
    },
    [markStepComplete],
  );

  const handleNext = useCallback(() => {
    setCurrentStep((s) => s + 1);
  }, []);

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="flex items-center gap-2">
        {STEPS.map((s) => (
          <div
            key={s.id}
            className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold border transition-colors ${
              isStepComplete(s.id)
                ? 'bg-green-500 text-white border-green-600'
                : s.id === currentStep
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-muted text-muted-foreground border-border'
            }`}
          >
            {isStepComplete(s.id) ? '\u2713' : s.id}
          </div>
        ))}
        <span className="text-sm text-muted-foreground ml-2">
          {allDone ? 'All steps complete!' : `Step ${currentStep}: ${STEPS[currentStep - 1].title}`}
        </span>
      </div>

      {!allDone && (
        <div className="rounded-md bg-muted px-3 py-2 text-sm">
          <strong>Step {currentStep}/3:</strong> {STEPS[currentStep - 1].desc}
        </div>
      )}

      <AnimatePresence mode="wait">
        {currentStep === 1 && (
          <motion.div key="s1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <StepRulesDemo onComplete={() => handleStepComplete(1)} />
          </motion.div>
        )}
        {currentStep === 2 && (
          <motion.div key="s2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <StepMoveGeneration onComplete={() => handleStepComplete(2)} />
          </motion.div>
        )}
        {currentStep === 3 && (
          <motion.div key="s3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <StepPlayGame onComplete={() => handleStepComplete(3)} />
          </motion.div>
        )}
      </AnimatePresence>

      {!allDone && isStepComplete(currentStep) && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <Button onClick={handleNext}>
            {currentStep < 3 ? 'Next Step' : 'Finish'}
          </Button>
        </motion.div>
      )}

      {allDone && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-md bg-green-500/10 border border-green-500/30 px-3 py-2 text-sm"
        >
          <strong>Exercise complete!</strong> You've learned Breakthrough's movement rules,
          practiced move generation, and played against an AI opponent.
        </motion.div>
      )}
    </div>
  );
}
