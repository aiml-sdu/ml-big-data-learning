import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useLabProgress } from '@/hooks/useLabProgress';
import {
  type TTTBoard,
  tttEmpty,
  tttWinner,
  tttIsTerminal,
  tttUtility,
  tttCurrentPlayer,
  tttMovesWithValues,
  tttBestMove,
} from '@/lib/adversarial';

// ---------------------------------------------------------------------------
// Shared tiny board renderer
// ---------------------------------------------------------------------------

function TinyBoard({
  board,
  size = 150,
  onClick,
  highlightCells,
  highlightColor,
}: {
  board: TTTBoard;
  size?: number;
  onClick?: (idx: number) => void;
  highlightCells?: Map<number, string>;
  highlightColor?: string;
}) {
  const cell = size / 3;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="border rounded">
      {/* Grid lines */}
      <line x1={cell} y1={0} x2={cell} y2={size} stroke="currentColor" className="text-border" strokeWidth={2} />
      <line x1={cell * 2} y1={0} x2={cell * 2} y2={size} stroke="currentColor" className="text-border" strokeWidth={2} />
      <line x1={0} y1={cell} x2={size} y2={cell} stroke="currentColor" className="text-border" strokeWidth={2} />
      <line x1={0} y1={cell * 2} x2={size} y2={cell * 2} stroke="currentColor" className="text-border" strokeWidth={2} />

      {/* Cells */}
      {board.map((v, i) => {
        const r = Math.floor(i / 3);
        const c = i % 3;
        const cx = c * cell + cell / 2;
        const cy = r * cell + cell / 2;
        const bg = highlightCells?.get(i);
        return (
          <g key={i}>
            {bg && (
              <rect
                x={c * cell + 1}
                y={r * cell + 1}
                width={cell - 2}
                height={cell - 2}
                fill={bg}
                opacity={0.25}
                rx={4}
              />
            )}
            {highlightColor && !v && !bg && onClick && (
              <rect
                x={c * cell + 1}
                y={r * cell + 1}
                width={cell - 2}
                height={cell - 2}
                fill="transparent"
                className="cursor-pointer hover:fill-accent/30"
                onClick={() => onClick(i)}
              />
            )}
            {onClick && !v && (
              <rect
                x={c * cell}
                y={r * cell}
                width={cell}
                height={cell}
                fill="transparent"
                className="cursor-pointer"
                onClick={() => onClick(i)}
              />
            )}
            {v && (
              <text
                x={cx}
                y={cy}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={cell * 0.55}
                fontWeight="bold"
                fill={v === 'X' ? '#3b82f6' : '#ef4444'}
                className="select-none"
              >
                {v}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Step 1: Terminal Test
// ---------------------------------------------------------------------------

const TERMINAL_BOARDS: { board: TTTBoard; label: string }[] = [
  { board: ['X', 'X', 'X', 'O', 'O', null, null, null, null], label: 'Board A' },
  { board: ['X', 'O', 'X', 'O', 'X', null, 'O', null, null], label: 'Board B' },
  { board: ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X'], label: 'Board C' },
];

function StepTerminalTest({ onComplete }: { onComplete: () => void }) {
  const [, setAnswers] = useState<Record<number, boolean | null>>({ 0: null, 1: null, 2: null });
  const [feedback, setFeedback] = useState<Record<number, 'correct' | 'wrong'>>({});

  const correctAnswers = useMemo(
    () => TERMINAL_BOARDS.map((b) => tttIsTerminal(b.board)),
    [],
  );

  const handleAnswer = useCallback(
    (idx: number, answer: boolean) => {
      if (feedback[idx]) return;
      const correct = correctAnswers[idx] === answer;
      setAnswers((prev) => ({ ...prev, [idx]: answer }));
      setFeedback((prev) => ({ ...prev, [idx]: correct ? 'correct' : 'wrong' }));

      if (!correct) {
        setTimeout(() => {
          setFeedback((prev) => {
            const next = { ...prev };
            delete next[idx];
            return next;
          });
          setAnswers((prev) => ({ ...prev, [idx]: null }));
        }, 1200);
        return;
      }

      // Check if all correct
      const newFeedback = { ...feedback, [idx]: 'correct' as const };
      if (TERMINAL_BOARDS.every((_, i) => newFeedback[i] === 'correct')) {
        setTimeout(onComplete, 800);
      }
    },
    [correctAnswers, feedback, onComplete],
  );

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Classify each board as <strong>terminal</strong> (game over) or <strong>non-terminal</strong> (game continues).
      </p>
      <div className="flex flex-wrap gap-4">
        {TERMINAL_BOARDS.map((b, i) => {
          const fb = feedback[i];
          return (
            <motion.div
              key={i}
              animate={fb === 'wrong' ? { x: [0, -8, 8, -8, 8, 0] } : fb === 'correct' ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 0.4 }}
              className={`rounded-lg border p-3 space-y-2 ${
                fb === 'correct' ? 'border-green-500 bg-green-500/5' : fb === 'wrong' ? 'border-red-500 bg-red-500/5' : 'border-border'
              }`}
            >
              <p className="text-xs font-medium text-muted-foreground">{b.label}</p>
              <TinyBoard board={b.board} size={120} />
              <div className="flex gap-2">
                <Button
                  size="xs"
                  variant={fb === 'correct' && correctAnswers[i] ? 'default' : 'outline'}
                  disabled={fb === 'correct'}
                  onClick={() => handleAnswer(i, true)}
                >
                  Terminal
                </Button>
                <Button
                  size="xs"
                  variant={fb === 'correct' && !correctAnswers[i] ? 'default' : 'outline'}
                  disabled={fb === 'correct'}
                  onClick={() => handleAnswer(i, false)}
                >
                  Non-terminal
                </Button>
              </div>
              {fb === 'correct' && (
                <p className="text-xs text-green-600 dark:text-green-400">
                  Correct! {tttWinner(b.board) ? `${tttWinner(b.board)} wins` : b.board.every((c) => c) ? 'Draw' : 'Game continues'}
                </p>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 2: Utility Values
// ---------------------------------------------------------------------------

const UTILITY_BOARDS: { board: TTTBoard; label: string }[] = [
  { board: ['X', 'X', 'X', 'O', 'O', null, null, null, null], label: 'Board A' },
  { board: ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X'], label: 'Board B' },
  { board: ['X', 'O', 'O', 'O', 'O', 'X', 'X', 'X', null], label: 'Board C' },
];

function StepUtility({ onComplete }: { onComplete: () => void }) {
  const [answered, setAnswered] = useState<Record<number, boolean>>({});
  const [feedback, setFeedback] = useState<Record<number, 'correct' | 'wrong'>>({});

  const correctUtils = useMemo(
    () => UTILITY_BOARDS.map((b) => tttUtility(b.board)),
    [],
  );

  const handlePick = useCallback(
    (idx: number, val: number) => {
      if (answered[idx]) return;
      const correct = correctUtils[idx] === val;
      setFeedback((prev) => ({ ...prev, [idx]: correct ? 'correct' : 'wrong' }));

      if (!correct) {
        setTimeout(() => {
          setFeedback((prev) => {
            const next = { ...prev };
            delete next[idx];
            return next;
          });
        }, 1200);
        return;
      }

      setAnswered((prev) => ({ ...prev, [idx]: true }));
      const newAnswered = { ...answered, [idx]: true };
      if (UTILITY_BOARDS.every((_, i) => newAnswered[i])) {
        setTimeout(onComplete, 800);
      }
    },
    [correctUtils, answered, onComplete],
  );

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Assign the correct utility value to each terminal board. Convention: X = MAX (+1), O = MIN (-1), Draw = 0.
      </p>
      <div className="flex flex-wrap gap-4">
        {UTILITY_BOARDS.map((b, i) => {
          const fb = feedback[i];
          return (
            <motion.div
              key={i}
              animate={fb === 'wrong' ? { x: [0, -8, 8, -8, 8, 0] } : fb === 'correct' ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 0.4 }}
              className={`rounded-lg border p-3 space-y-2 ${
                fb === 'correct' ? 'border-green-500 bg-green-500/5' : fb === 'wrong' ? 'border-red-500 bg-red-500/5' : 'border-border'
              }`}
            >
              <p className="text-xs font-medium text-muted-foreground">{b.label}</p>
              <TinyBoard board={b.board} size={120} />
              <div className="flex gap-2">
                {[1, 0, -1].map((v) => (
                  <Button
                    key={v}
                    size="xs"
                    variant={fb === 'correct' && correctUtils[i] === v ? 'default' : 'outline'}
                    disabled={!!answered[i]}
                    onClick={() => handlePick(i, v)}
                  >
                    {v > 0 ? '+1' : v === 0 ? '0' : '-1'}
                  </Button>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 3: Successors
// ---------------------------------------------------------------------------

const SUCCESSORS_BOARD: TTTBoard = ['X', 'O', 'X', 'O', 'X', null, null, 'O', null];
const SUCCESSORS_COUNT = SUCCESSORS_BOARD.filter((c) => c === null).length;

function StepSuccessors({ onComplete }: { onComplete: () => void }) {
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const options = [2, 3, 4, 5];

  const handlePick = useCallback(
    (val: number) => {
      if (feedback === 'correct') return;
      if (val === SUCCESSORS_COUNT) {
        setFeedback('correct');
        setTimeout(onComplete, 800);
      } else {
        setFeedback('wrong');
        setTimeout(() => setFeedback(null), 1200);
      }
    },
    [feedback, onComplete],
  );

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        How many successor states does this board have? Count the empty cells &mdash; each one produces a new state.
      </p>
      <div className="flex items-start gap-4">
        <TinyBoard board={SUCCESSORS_BOARD} size={150} />
        <div className="space-y-3">
          <p className="text-sm font-medium">
            It is <strong>{tttCurrentPlayer(SUCCESSORS_BOARD)}</strong>'s turn. How many successors?
          </p>
          <div className="flex gap-2">
            {options.map((v) => (
              <motion.div
                key={v}
                animate={
                  feedback === 'wrong' && v !== SUCCESSORS_COUNT
                    ? {}
                    : feedback === 'correct' && v === SUCCESSORS_COUNT
                      ? { scale: [1, 1.1, 1] }
                      : {}
                }
              >
                <Button
                  size="sm"
                  variant={feedback === 'correct' && v === SUCCESSORS_COUNT ? 'default' : 'outline'}
                  disabled={feedback === 'correct'}
                  onClick={() => handlePick(v)}
                >
                  {v}
                </Button>
              </motion.div>
            ))}
          </div>
          <AnimatePresence>
            {feedback === 'wrong' && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-xs text-red-600 dark:text-red-400"
              >
                Not quite. Count the null cells on the board.
              </motion.p>
            )}
            {feedback === 'correct' && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-green-600 dark:text-green-400"
              >
                Correct! {SUCCESSORS_COUNT} empty cells = {SUCCESSORS_COUNT} possible successor states.
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 4: Play as Minimax
// ---------------------------------------------------------------------------

function StepPlay({ onComplete }: { onComplete: () => void }) {
  const [board, setBoard] = useState<TTTBoard>(() => {
    // Start from a mid-game position where the student plays as X (MAX)
    const b = tttEmpty();
    // Pre-set a few moves so the game is shorter (2-3 turns for the student)
    b[4] = 'X'; // center
    b[0] = 'O'; // corner
    b[8] = 'X'; // opposite corner
    b[2] = 'O'; // another corner
    return b;
  });
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'wrong'; msg: string } | null>(null);
  const [done, setDone] = useState(false);
  const [turnsPlayed, setTurnsPlayed] = useState(0);

  const currentPlayer = tttCurrentPlayer(board);
  const movesWithValues = useMemo(() => {
    if (tttIsTerminal(board)) return [];
    return tttMovesWithValues(board, currentPlayer);
  }, [board, currentPlayer]);

  const bestValue = useMemo(() => {
    if (movesWithValues.length === 0) return 0;
    const isMax = currentPlayer === 'X';
    return isMax
      ? Math.max(...movesWithValues.map((m) => m.value))
      : Math.min(...movesWithValues.map((m) => m.value));
  }, [movesWithValues, currentPlayer]);

  const optimalMoves = useMemo(
    () => new Set(movesWithValues.filter((m) => m.value === bestValue).map((m) => m.move)),
    [movesWithValues, bestValue],
  );

  // Highlight optimal cells in green
  const highlights = useMemo(() => {
    const map = new Map<number, string>();
    for (const mv of movesWithValues) {
      if (optimalMoves.has(mv.move)) {
        map.set(mv.move, '#22c55e');
      }
    }
    return map;
  }, [movesWithValues, optimalMoves]);

  const handleCellClick = useCallback(
    (idx: number) => {
      if (done || tttIsTerminal(board) || board[idx] !== null) return;
      if (currentPlayer !== 'X') return; // student plays X

      if (optimalMoves.has(idx)) {
        const next = [...board] as TTTBoard;
        next[idx] = 'X';
        setFeedback({ type: 'correct', msg: 'Optimal move!' });
        setTurnsPlayed((t) => t + 1);

        if (tttIsTerminal(next)) {
          setBoard(next);
          setDone(true);
          setTimeout(onComplete, 600);
          return;
        }

        // AI (O) responds
        setTimeout(() => {
          const aiMove = tttBestMove(next, 'O');
          const afterAI = [...next] as TTTBoard;
          afterAI[aiMove] = 'O';
          setBoard(afterAI);
          setFeedback(null);

          if (tttIsTerminal(afterAI)) {
            setDone(true);
            setTimeout(onComplete, 600);
          }
        }, 500);

        setBoard(next);
      } else {
        setFeedback({ type: 'wrong', msg: 'Not optimal. Look at the highlighted cells.' });
        setTimeout(() => setFeedback(null), 1500);
      }
    },
    [board, currentPlayer, done, onComplete, optimalMoves],
  );

  const winner = tttWinner(board);

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Play as X (MAX). Pick the <strong>optimal</strong> move each turn. Optimal cells are highlighted in green.
      </p>
      <div className="flex items-start gap-4">
        <motion.div
          animate={feedback?.type === 'wrong' ? { x: [0, -6, 6, -6, 6, 0] } : {}}
          transition={{ duration: 0.4 }}
        >
          <TinyBoard
            board={board}
            size={150}
            onClick={!done && currentPlayer === 'X' ? handleCellClick : undefined}
            highlightCells={!done && currentPlayer === 'X' ? highlights : undefined}
            highlightColor="#22c55e"
          />
        </motion.div>
        <div className="space-y-2 text-sm">
          {!done && (
            <p>
              Turn: <strong>{currentPlayer}</strong>
              {currentPlayer === 'O' && <span className="text-muted-foreground"> (AI thinking...)</span>}
            </p>
          )}
          {!done && currentPlayer === 'X' && movesWithValues.length > 0 && (
            <div className="text-xs text-muted-foreground">
              <p>Move values:</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {movesWithValues.map((m) => (
                  <span
                    key={m.move}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                      optimalMoves.has(m.move)
                        ? 'bg-green-500/20 text-green-700 dark:text-green-300'
                        : 'bg-muted'
                    }`}
                  >
                    [{Math.floor(m.move / 3)},{m.move % 3}]={m.value > 0 ? '+' : ''}{m.value}
                  </span>
                ))}
              </div>
            </div>
          )}
          <AnimatePresence>
            {feedback && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`text-xs font-medium ${
                  feedback.type === 'correct' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}
              >
                {feedback.msg}
              </motion.p>
            )}
          </AnimatePresence>
          {done && (
            <p className="font-semibold text-green-600 dark:text-green-400">
              Game over! {winner ? `${winner} wins.` : 'Draw.'} ({turnsPlayed} optimal moves played)
            </p>
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
  { id: 1, title: 'Terminal Test', desc: 'Classify boards as terminal or non-terminal' },
  { id: 2, title: 'Utility Values', desc: 'Assign utility values to terminal states' },
  { id: 3, title: 'Successors', desc: 'Count successor states for a board position' },
  { id: 4, title: 'Play as Minimax', desc: 'Pick optimal moves as the MAX player' },
];

export default function Exercise1TicTacToeMinimax() {
  const { markStepComplete, isStepComplete } = useLabProgress('lab5-ex1', 4);
  const [currentStep, setCurrentStep] = useState(() => {
    for (let i = 1; i <= 4; i++) {
      if (!isStepComplete(i)) return i;
    }
    return 5;
  });

  const allDone = currentStep > 4;

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

      {/* Current step description */}
      {!allDone && (
        <div className="rounded-md bg-muted px-3 py-2 text-sm">
          <strong>Step {currentStep}/4:</strong> {STEPS[currentStep - 1].desc}
        </div>
      )}

      {/* Step content */}
      <AnimatePresence mode="wait">
        {currentStep === 1 && (
          <motion.div key="s1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <StepTerminalTest onComplete={() => handleStepComplete(1)} />
          </motion.div>
        )}
        {currentStep === 2 && (
          <motion.div key="s2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <StepUtility onComplete={() => handleStepComplete(2)} />
          </motion.div>
        )}
        {currentStep === 3 && (
          <motion.div key="s3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <StepSuccessors onComplete={() => handleStepComplete(3)} />
          </motion.div>
        )}
        {currentStep === 4 && (
          <motion.div key="s4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <StepPlay onComplete={() => handleStepComplete(4)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Next button */}
      {!allDone && isStepComplete(currentStep) && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <Button onClick={handleNext}>
            {currentStep < 4 ? 'Next Step' : 'Finish'}
          </Button>
        </motion.div>
      )}

      {/* All done */}
      {allDone && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-md bg-green-500/10 border border-green-500/30 px-3 py-2 text-sm"
        >
          <strong>Exercise complete!</strong> You've practiced identifying terminal states, assigning utilities,
          counting successors, and playing as the minimax algorithm.
        </motion.div>
      )}
    </div>
  );
}
