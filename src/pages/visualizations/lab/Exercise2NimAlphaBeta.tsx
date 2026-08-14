import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useLabProgress } from '@/hooks/useLabProgress';
import {
  type NimState,
  nimIsTerminal,
  nimSuccessors,
  nimBestMove,
} from '@/lib/adversarial';

// ---------------------------------------------------------------------------
// Pile rendering
// ---------------------------------------------------------------------------

function PileRow({ piles, label }: { piles: NimState; label?: string }) {
  return (
    <div className="flex items-end gap-3">
      {label && <span className="text-xs text-muted-foreground w-12 shrink-0">{label}</span>}
      {piles.map((size, i) => (
        <div key={i} className="flex flex-col items-center gap-0.5">
          <div className="flex flex-wrap justify-center gap-1 max-w-20">
            {Array.from({ length: size }, (_, j) => (
              <div
                key={j}
                className="w-4 h-4 rounded-full bg-primary/80 border border-primary"
              />
            ))}
          </div>
          <span className="text-[10px] text-muted-foreground font-mono">{size}</span>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 1: Terminal Test
// ---------------------------------------------------------------------------

const TERMINAL_CONFIGS: { piles: NimState; label: string }[] = [
  { piles: [2, 2, 1], label: 'Config A' },
  { piles: [5, 2], label: 'Config B' },
  { piles: [1, 1, 2, 1], label: 'Config C' },
];

function StepTerminalTest({ onComplete }: { onComplete: () => void }) {
  const [, setAnswers] = useState<Record<number, boolean | null>>({ 0: null, 1: null, 2: null });
  const [feedback, setFeedback] = useState<Record<number, 'correct' | 'wrong'>>({});

  const correctAnswers = useMemo(
    () => TERMINAL_CONFIGS.map((c) => nimIsTerminal(c.piles)),
    [],
  );

  const handleAnswer = useCallback(
    (idx: number, answer: boolean) => {
      if (feedback[idx] === 'correct') return;
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

      const newFeedback = { ...feedback, [idx]: 'correct' as const };
      if (TERMINAL_CONFIGS.every((_, i) => newFeedback[i] === 'correct')) {
        setTimeout(onComplete, 800);
      }
    },
    [correctAnswers, feedback, onComplete],
  );

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        A state is <strong>terminal</strong> if no pile can be split (all piles are size 1 or 2).
        Classify each configuration.
      </p>
      <div className="space-y-3">
        {TERMINAL_CONFIGS.map((c, i) => {
          const fb = feedback[i];
          return (
            <motion.div
              key={i}
              animate={fb === 'wrong' ? { x: [0, -6, 6, -6, 6, 0] } : {}}
              transition={{ duration: 0.4 }}
              className={`rounded-lg border p-3 flex items-center gap-4 ${
                fb === 'correct' ? 'border-green-500 bg-green-500/5' : fb === 'wrong' ? 'border-red-500 bg-red-500/5' : 'border-border'
              }`}
            >
              <div className="min-w-24">
                <p className="text-xs font-medium text-muted-foreground mb-1">{c.label}</p>
                <PileRow piles={c.piles} />
              </div>
              <div className="flex gap-2 ml-auto">
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
                <span className="text-xs text-green-600 dark:text-green-400 shrink-0">
                  {correctAnswers[i] ? 'No splits possible' : 'Can still split'}
                </span>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 2: Utility
// ---------------------------------------------------------------------------

const UTILITY_CONFIGS: { piles: NimState; isMaxTurn: boolean; label: string }[] = [
  { piles: [2, 1, 1], isMaxTurn: true, label: "It's MAX's turn, no moves left" },
  { piles: [1, 2, 2], isMaxTurn: false, label: "It's MIN's turn, no moves left" },
];

function StepUtility({ onComplete }: { onComplete: () => void }) {
  const [answered, setAnswered] = useState<Record<number, boolean>>({});
  const [feedback, setFeedback] = useState<Record<number, 'correct' | 'wrong'>>({});

  // Player who can't move loses: if it's MAX's turn and terminal, MAX loses => -1
  // If it's MIN's turn and terminal, MIN loses => +1
  const correctUtils = useMemo(
    () => UTILITY_CONFIGS.map((c) => (c.isMaxTurn ? -1 : 1)),
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
      if (UTILITY_CONFIGS.every((_, i) => newAnswered[i])) {
        setTimeout(onComplete, 800);
      }
    },
    [correctUtils, answered, onComplete],
  );

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        The player who <strong>cannot move loses</strong>. Assign utility: +1 if MAX wins, -1 if MIN wins.
      </p>
      <div className="space-y-3">
        {UTILITY_CONFIGS.map((c, i) => {
          const fb = feedback[i];
          return (
            <motion.div
              key={i}
              animate={fb === 'wrong' ? { x: [0, -6, 6, -6, 6, 0] } : {}}
              transition={{ duration: 0.4 }}
              className={`rounded-lg border p-3 space-y-2 ${
                fb === 'correct' ? 'border-green-500 bg-green-500/5' : fb === 'wrong' ? 'border-red-500 bg-red-500/5' : 'border-border'
              }`}
            >
              <p className="text-xs font-medium text-muted-foreground">{c.label}</p>
              <PileRow piles={c.piles} />
              <div className="flex gap-2">
                {[1, -1].map((v) => (
                  <Button
                    key={v}
                    size="xs"
                    variant={fb === 'correct' && correctUtils[i] === v ? 'default' : 'outline'}
                    disabled={!!answered[i]}
                    onClick={() => handlePick(i, v)}
                  >
                    {v > 0 ? '+1 (MAX wins)' : '-1 (MIN wins)'}
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
// Step 3: Split Options
// ---------------------------------------------------------------------------

function StepSplitOptions({ onComplete }: { onComplete: () => void }) {
  const startPiles: NimState = [7];
  const validSplits = useMemo(() => nimSuccessors(startPiles), []);

  const allSplitDescs = useMemo(() => {
    // Show some valid and some invalid options
    const valid = validSplits.map((s) => ({ desc: s.desc, piles: s.piles, correct: true }));
    const invalid = [
      { desc: 'Split 7 \u2192 0+7', piles: [0, 7], correct: false },
      { desc: 'Split 7 \u2192 7+0', piles: [7, 0], correct: false },
    ];
    return [...valid, ...invalid].sort((a, b) => a.desc.localeCompare(b.desc));
  }, [validSplits]);

  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const toggle = useCallback(
    (idx: number) => {
      if (submitted && feedback === 'correct') return;
      setSelected((prev) => {
        const next = new Set(prev);
        if (next.has(idx)) next.delete(idx);
        else next.add(idx);
        return next;
      });
      setFeedback(null);
      setSubmitted(false);
    },
    [submitted, feedback],
  );

  const handleSubmit = useCallback(() => {
    const correctSet = new Set(
      allSplitDescs.map((s, i) => (s.correct ? i : -1)).filter((i) => i >= 0),
    );
    const isCorrect =
      selected.size === correctSet.size && [...selected].every((i) => correctSet.has(i));

    setSubmitted(true);
    setFeedback(isCorrect ? 'correct' : 'wrong');

    if (isCorrect) {
      setTimeout(onComplete, 800);
    } else {
      setTimeout(() => {
        setFeedback(null);
        setSubmitted(false);
      }, 1500);
    }
  }, [allSplitDescs, selected, onComplete]);

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Starting pile: <strong>[7]</strong>. Select <strong>all valid splits</strong> (two non-empty parts that sum to 7).
      </p>
      <PileRow piles={startPiles} label="Start:" />
      <div className="flex flex-wrap gap-2">
        {allSplitDescs.map((s, i) => (
          <Button
            key={i}
            size="sm"
            variant={selected.has(i) ? 'default' : 'outline'}
            onClick={() => toggle(i)}
            disabled={submitted && feedback === 'correct'}
            className={
              submitted && feedback === 'correct'
                ? s.correct
                  ? 'border-green-500 bg-green-500/10'
                  : 'opacity-40'
                : ''
            }
          >
            {s.desc}
          </Button>
        ))}
      </div>
      {!(submitted && feedback === 'correct') && (
        <Button size="sm" onClick={handleSubmit} disabled={selected.size === 0}>
          Check
        </Button>
      )}
      <AnimatePresence>
        {feedback === 'wrong' && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="text-xs text-red-600 dark:text-red-400">
            Not quite. A valid split divides into two non-empty parts. Both parts must be &gt; 0.
          </motion.p>
        )}
        {feedback === 'correct' && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-xs text-green-600 dark:text-green-400">
            Correct! {validSplits.length} valid splits for pile of 7.
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 4: Play against AI
// ---------------------------------------------------------------------------

function StepPlay({ onComplete }: { onComplete: () => void }) {
  const [piles, setPiles] = useState<NimState>([7]);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [selectedPile, setSelectedPile] = useState<number | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<'player' | 'ai' | null>(null);
  const [message, setMessage] = useState<string>('Your turn. Click a pile to split it.');

  const successors = useMemo(() => {
    if (selectedPile === null) return [];
    if (piles[selectedPile] <= 2) return [];
    // Generate splits for the selected pile only
    const size = piles[selectedPile];
    const splits: { a: number; b: number; result: NimState }[] = [];
    for (let a = 1; a < size; a++) {
      const b = size - a;
      if (a <= b) {
        const next = [...piles];
        next.splice(selectedPile, 1, a, b);
        next.sort((x, y) => y - x);
        const key = next.join(',');
        if (!splits.some((s) => s.result.join(',') === key)) {
          splits.push({ a, b, result: next });
        }
      }
    }
    return splits;
  }, [piles, selectedPile]);

  const handlePileClick = useCallback(
    (idx: number) => {
      if (!isPlayerTurn || gameOver) return;
      if (piles[idx] <= 2) {
        setMessage('That pile is too small to split (needs 3+).');
        return;
      }
      setSelectedPile(idx === selectedPile ? null : idx);
      setMessage(`Pile of ${piles[idx]} selected. Choose a split below.`);
    },
    [isPlayerTurn, gameOver, piles, selectedPile],
  );

  const handleSplit = useCallback(
    (result: NimState) => {
      setPiles(result);
      setSelectedPile(null);

      if (nimIsTerminal(result)) {
        // Player just moved and now it's AI's turn but AI can't move => AI loses
        setGameOver(true);
        setWinner('player');
        setMessage('You win! The AI cannot make a move.');
        setTimeout(onComplete, 600);
        return;
      }

      setIsPlayerTurn(false);
      setMessage("AI is thinking...");

      setTimeout(() => {
        const aiResult = nimBestMove(result, false);
        setPiles(aiResult);

        if (nimIsTerminal(aiResult)) {
          setGameOver(true);
          setWinner('ai');
          setMessage('AI wins. You have no valid moves left.');
          setTimeout(onComplete, 600);
        } else {
          setIsPlayerTurn(true);
          setMessage('Your turn. Click a pile to split it.');
        }
      }, 700);
    },
    [onComplete],
  );

  const handleReset = useCallback(() => {
    setPiles([7]);
    setIsPlayerTurn(true);
    setSelectedPile(null);
    setGameOver(false);
    setWinner(null);
    setMessage('Your turn. Click a pile to split it.');
  }, []);

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Play against the AI. Split any pile of 3+ into two non-empty parts. The player who cannot move <strong>loses</strong>.
      </p>

      {/* Piles */}
      <div className="flex flex-wrap gap-3 items-end">
        {piles.map((size, i) => (
          <button
            key={i}
            onClick={() => handlePileClick(i)}
            disabled={!isPlayerTurn || gameOver}
            className={`flex flex-col items-center gap-1 rounded-lg border p-2 transition-colors ${
              selectedPile === i
                ? 'border-primary bg-primary/10'
                : size > 2 && isPlayerTurn && !gameOver
                  ? 'border-border hover:border-primary/50 cursor-pointer'
                  : 'border-border/50 opacity-60'
            }`}
          >
            <div className="flex flex-wrap justify-center gap-1 max-w-16">
              {Array.from({ length: size }, (_, j) => (
                <div
                  key={j}
                  className="w-4 h-4 rounded-full bg-primary/80 border border-primary"
                />
              ))}
            </div>
            <span className="text-xs font-mono text-muted-foreground">{size}</span>
          </button>
        ))}
      </div>

      {/* Split options */}
      <AnimatePresence>
        {selectedPile !== null && successors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-2"
          >
            <p className="text-xs text-muted-foreground">Choose a split:</p>
            <div className="flex flex-wrap gap-2">
              {successors.map((s, i) => (
                <Button key={i} size="sm" variant="outline" onClick={() => handleSplit(s.result)}>
                  {s.a} + {s.b}
                </Button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Message */}
      <p className={`text-sm ${gameOver ? (winner === 'player' ? 'text-green-600 dark:text-green-400 font-semibold' : 'text-red-600 dark:text-red-400 font-semibold') : 'text-muted-foreground'}`}>
        {message}
      </p>

      {gameOver && (
        <Button size="sm" variant="outline" onClick={handleReset}>
          Play again
        </Button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Exercise Component
// ---------------------------------------------------------------------------

const STEPS = [
  { id: 1, title: 'Terminal Test', desc: 'Classify pile configurations as terminal or non-terminal' },
  { id: 2, title: 'Utility', desc: 'Assign utility based on who cannot move' },
  { id: 3, title: 'Split Options', desc: 'Identify all valid splits for a pile' },
  { id: 4, title: 'Play', desc: 'Play Nim against an optimal AI' },
];

export default function Exercise2NimAlphaBeta() {
  const { markStepComplete, isStepComplete } = useLabProgress('lab5-ex2', 4);
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

      {!allDone && (
        <div className="rounded-md bg-muted px-3 py-2 text-sm">
          <strong>Step {currentStep}/4:</strong> {STEPS[currentStep - 1].desc}
        </div>
      )}

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
            <StepSplitOptions onComplete={() => handleStepComplete(3)} />
          </motion.div>
        )}
        {currentStep === 4 && (
          <motion.div key="s4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <StepPlay onComplete={() => handleStepComplete(4)} />
          </motion.div>
        )}
      </AnimatePresence>

      {!allDone && isStepComplete(currentStep) && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <Button onClick={handleNext}>
            {currentStep < 4 ? 'Next Step' : 'Finish'}
          </Button>
        </motion.div>
      )}

      {allDone && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-md bg-green-500/10 border border-green-500/30 px-3 py-2 text-sm"
        >
          <strong>Exercise complete!</strong> You've learned to identify terminal states, assign utilities,
          enumerate valid splits, and play Nim against an optimal opponent.
        </motion.div>
      )}
    </div>
  );
}
