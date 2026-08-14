import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check, ChevronRight, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { M, BlockMath } from '@/components/Math';
import { useLabProgress } from '@/hooks/useLabProgress';

// ── HMM parameters identical to Lab9Ex1 / the handout ──────────────
const A_INIT = { HOT: 0.8, COLD: 0.2 };
const A = {
  HOT:  { HOT: 0.2, COLD: 0.6, F: 0.2 },
  COLD: { HOT: 0.3, COLD: 0.5, F: 0.2 },
};
const B: Record<'HOT' | 'COLD', Record<1 | 2 | 3, number>> = {
  HOT:  { 1: 0.1, 2: 0.15, 3: 0.75 },
  COLD: { 1: 0.8, 2: 0.1,  3: 0.1  },
};

const OBS: (1 | 2 | 3)[] = [3, 1, 3];

// ── Expected Viterbi values (computed once, pinned) ─────────────────
// v1: init
const v1H = A_INIT.HOT * B.HOT[OBS[0]];       // 0.6
const v1C = A_INIT.COLD * B.COLD[OBS[0]];     // 0.02

// v2: max of two contributions
const v2H_fromH = v1H * A.HOT.HOT * B.HOT[OBS[1]];
const v2H_fromC = v1C * A.COLD.HOT * B.HOT[OBS[1]];
const v2H = Math.max(v2H_fromH, v2H_fromC);
const bt2H: 'HOT' | 'COLD' = v2H_fromH >= v2H_fromC ? 'HOT' : 'COLD';

const v2C_fromH = v1H * A.HOT.COLD * B.COLD[OBS[1]];
const v2C_fromC = v1C * A.COLD.COLD * B.COLD[OBS[1]];
const v2C = Math.max(v2C_fromH, v2C_fromC);
const bt2C: 'HOT' | 'COLD' = v2C_fromH >= v2C_fromC ? 'HOT' : 'COLD';

// v3
const v3H_fromH = v2H * A.HOT.HOT * B.HOT[OBS[2]];
const v3H_fromC = v2C * A.COLD.HOT * B.HOT[OBS[2]];
const v3H = Math.max(v3H_fromH, v3H_fromC);
const bt3H: 'HOT' | 'COLD' = v3H_fromH >= v3H_fromC ? 'HOT' : 'COLD';

const v3C_fromH = v2H * A.HOT.COLD * B.COLD[OBS[2]];
const v3C_fromC = v2C * A.COLD.COLD * B.COLD[OBS[2]];
const v3C = Math.max(v3C_fromH, v3C_fromC);
const bt3C: 'HOT' | 'COLD' = v3C_fromH >= v3C_fromC ? 'HOT' : 'COLD';

// Termination via final state
const termH = v3H * A.HOT.F;
const termC = v3C * A.COLD.F;
const BEST_SCORE = Math.max(termH, termC);
const BEST_FINAL: 'HOT' | 'COLD' = termH >= termC ? 'HOT' : 'COLD';

// Backtrace
const btFrom3 = BEST_FINAL === 'HOT' ? bt3H : bt3C;
const btFrom2 = btFrom3 === 'HOT' ? bt2H : bt2C;
const BEST_PATH: ('HOT' | 'COLD')[] = [btFrom2, btFrom3, BEST_FINAL];

// ── Step definitions ─────────────────────────────────────────────────

interface NumericStep {
  kind: 'numeric';
  id: string;
  title: string;
  prompt: string;
  formula: string;
  expected: number;
  hint: string;
}

interface ChoiceStep {
  kind: 'choice';
  id: string;
  title: string;
  prompt: string;
  options: string[];
  correctIdx: number;
  explanation: string;
}

type Step = NumericStep | ChoiceStep;

const STEPS: Step[] = [
  // Init
  {
    kind: 'numeric',
    id: 'v1H',
    title: 'v₁(H)',
    prompt: 'Compute v₁(HOT) = π_H · b_H(3).',
    formula: 'v_1(H) = 0.8 \\times 0.75',
    expected: v1H,
    hint: '0.8 × 0.75',
  },
  {
    kind: 'numeric',
    id: 'v1C',
    title: 'v₁(C)',
    prompt: 'Compute v₁(COLD) = π_C · b_C(3).',
    formula: 'v_1(C) = 0.2 \\times 0.1',
    expected: v1C,
    hint: '0.2 × 0.1',
  },

  // Recursion t=2
  {
    kind: 'numeric',
    id: 'v2H',
    title: 'v₂(H)',
    prompt: 'Compute v₂(HOT) = max[ v₁(H)·a_{HH}, v₁(C)·a_{CH} ] · b_H(1).',
    formula:
      'v_2(H) = \\max\\big(0.6 \\cdot 0.2,\\; 0.02 \\cdot 0.3\\big) \\cdot 0.1',
    expected: v2H,
    hint: 'Compute both 0.6×0.2=0.12 and 0.02×0.3=0.006, take the max 0.12, then multiply by b_H(1)=0.1.',
  },
  {
    kind: 'choice',
    id: 'bt2H',
    title: 'bt₂(H)',
    prompt: 'Which predecessor wins for v₂(HOT)? (Record the backpointer.)',
    options: ['HOT', 'COLD'],
    correctIdx: bt2H === 'HOT' ? 0 : 1,
    explanation:
      'v₁(H)·a_{HH} = 0.6·0.2 = 0.12 is larger than v₁(C)·a_{CH} = 0.02·0.3 = 0.006, so bt₂(H) = HOT.',
  },
  {
    kind: 'numeric',
    id: 'v2C',
    title: 'v₂(C)',
    prompt: 'Compute v₂(COLD).',
    formula:
      'v_2(C) = \\max\\big(0.6 \\cdot 0.6,\\; 0.02 \\cdot 0.5\\big) \\cdot 0.8',
    expected: v2C,
    hint: 'max(0.36, 0.01) × 0.8',
  },
  {
    kind: 'choice',
    id: 'bt2C',
    title: 'bt₂(C)',
    prompt: 'Which predecessor wins for v₂(COLD)?',
    options: ['HOT', 'COLD'],
    correctIdx: bt2C === 'HOT' ? 0 : 1,
    explanation: '0.6·0.6 = 0.36 beats 0.02·0.5 = 0.01 — bt₂(C) = HOT.',
  },

  // Recursion t=3
  {
    kind: 'numeric',
    id: 'v3H',
    title: 'v₃(H)',
    prompt: 'Compute v₃(HOT) for o₃ = 3. (Use your v₂ values.)',
    formula:
      'v_3(H) = \\max\\big(v_2(H) \\cdot 0.2,\\; v_2(C) \\cdot 0.3\\big) \\cdot 0.75',
    expected: v3H,
    hint: `v₂(H)=${v2H.toFixed(4)}, v₂(C)=${v2C.toFixed(4)}. b_H(3)=0.75.`,
  },
  {
    kind: 'choice',
    id: 'bt3H',
    title: 'bt₃(H)',
    prompt: 'Which predecessor wins for v₃(HOT)?',
    options: ['HOT', 'COLD'],
    correctIdx: bt3H === 'HOT' ? 0 : 1,
    explanation: `v₂(H)·a_{HH} = ${v2H.toFixed(4)}·0.2 = ${(v2H * 0.2).toFixed(
      4,
    )} vs v₂(C)·a_{CH} = ${v2C.toFixed(4)}·0.3 = ${(v2C * 0.3).toFixed(4)}. COLD wins.`,
  },
  {
    kind: 'numeric',
    id: 'v3C',
    title: 'v₃(C)',
    prompt: 'Compute v₃(COLD) for o₃ = 3.',
    formula:
      'v_3(C) = \\max\\big(v_2(H) \\cdot 0.6,\\; v_2(C) \\cdot 0.5\\big) \\cdot 0.1',
    expected: v3C,
    hint: 'b_C(3) = 0.1',
  },

  // Termination + path
  {
    kind: 'choice',
    id: 'best-final',
    title: 'argmax v₃',
    prompt: 'Which state has the higher Viterbi score after multiplying by the final-transition a_{·,F} = 0.2?',
    options: ['HOT', 'COLD'],
    correctIdx: BEST_FINAL === 'HOT' ? 0 : 1,
    explanation: `v₃(H) · 0.2 = ${(v3H * 0.2).toFixed(6)} vs v₃(C) · 0.2 = ${(v3C * 0.2).toFixed(
      6,
    )}. HOT wins — start the backtrace from HOT at t=3.`,
  },
  {
    kind: 'choice',
    id: 'best-path',
    title: 'Best path',
    prompt: 'Following the backpointers, what is the most likely hidden sequence for O = 3 1 3?',
    options: ['HOT HOT HOT', 'HOT COLD HOT', 'COLD HOT COLD', 'HOT HOT COLD'],
    correctIdx: 1, // HOT COLD HOT based on our computed path
    explanation: `From bt₃(HOT) = COLD → t=2 is COLD. From bt₂(COLD) = HOT → t=1 is HOT. Best path: HOT → COLD → HOT.`,
  },
];

// ── UI ───────────────────────────────────────────────────────────────

function NumericStepView({
  step,
  onComplete,
  isComplete,
}: {
  step: NumericStep;
  onComplete: () => void;
  isComplete: boolean;
}) {
  const [input, setInput] = useState(isComplete ? step.expected.toFixed(6) : '');
  const [checked, setChecked] = useState(false);
  const [correct, setCorrect] = useState(isComplete);
  const [revealed, setRevealed] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const handleCheck = useCallback(() => {
    const val = parseFloat(input);
    const isCorrect = !isNaN(val) && Math.abs(val - step.expected) < 0.001;
    setChecked(true);
    setCorrect(isCorrect);
    if (isCorrect) onComplete();
  }, [input, step.expected, onComplete]);

  const handleReveal = useCallback(() => {
    setRevealed(true);
    setCorrect(true);
    onComplete();
  }, [onComplete]);

  return (
    <div className="space-y-4">
      <div className="text-sm font-medium">{step.prompt}</div>
      <div className="rounded-lg bg-muted/30 border p-3">
        <BlockMath>{step.formula}</BlockMath>
      </div>
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium shrink-0">
          <M>{`v`}</M> =
        </label>
        <input
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setChecked(false);
          }}
          placeholder="e.g. 0.0012"
          disabled={correct || revealed}
          className="w-36 rounded-md border border-border bg-transparent px-3 py-2 text-sm font-mono outline-none focus:ring-2 focus:ring-primary/40"
        />
      </div>
      {!correct && !revealed && (
        <div className="flex items-center gap-2">
          <Button size="sm" className="h-8 text-xs" onClick={handleCheck} disabled={!input}>
            Check
          </Button>
          <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => setShowHint((h) => !h)}>
            {showHint ? 'Hide hint' : 'Hint'}
          </Button>
          <Button size="sm" variant="ghost" className="h-8 text-xs gap-1" onClick={handleReveal}>
            <Eye className="size-3" /> Show answer
          </Button>
        </div>
      )}
      {showHint && !correct && !revealed && (
        <p className="text-xs text-muted-foreground italic">💡 {step.hint}</p>
      )}
      {checked && !correct && !revealed && (
        <p className="text-sm text-red-500">Not quite — tolerance ±0.001.</p>
      )}
      {(correct || revealed) && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg bg-green-500/10 px-4 py-3 text-sm text-green-700 dark:text-green-300"
        >
          <Check className="size-4 inline mr-1" />
          <strong>{step.title}</strong> ={' '}
          <span className="font-mono">{step.expected.toFixed(6)}</span>
        </motion.div>
      )}
    </div>
  );
}

function ChoiceStepView({
  step,
  onComplete,
  isComplete,
}: {
  step: ChoiceStep;
  onComplete: () => void;
  isComplete: boolean;
}) {
  const [choice, setChoice] = useState<number | null>(isComplete ? step.correctIdx : null);
  const [checked, setChecked] = useState(false);
  const [correct, setCorrect] = useState(isComplete);
  const [revealed, setRevealed] = useState(false);

  const handleCheck = useCallback(() => {
    const isCorrect = choice === step.correctIdx;
    setChecked(true);
    setCorrect(isCorrect);
    if (isCorrect) onComplete();
  }, [choice, step.correctIdx, onComplete]);

  const handleReveal = useCallback(() => {
    setChoice(step.correctIdx);
    setRevealed(true);
    setCorrect(true);
    onComplete();
  }, [step.correctIdx, onComplete]);

  return (
    <div className="space-y-4">
      <div className="text-sm font-medium">{step.prompt}</div>
      <div className="flex flex-wrap gap-2">
        {step.options.map((opt, i) => (
          <button
            key={opt}
            type="button"
            onClick={() => {
              setChoice(i);
              setChecked(false);
            }}
            disabled={correct || revealed}
            className={`px-4 py-2 rounded-md border text-sm font-medium transition-all ${
              choice === i
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border text-muted-foreground hover:border-primary/50'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
      {!correct && !revealed && (
        <div className="flex items-center gap-2">
          <Button size="sm" className="h-8 text-xs" onClick={handleCheck} disabled={choice === null}>
            Check
          </Button>
          <Button size="sm" variant="ghost" className="h-8 text-xs gap-1" onClick={handleReveal}>
            <Eye className="size-3" /> Show answer
          </Button>
        </div>
      )}
      {checked && !correct && !revealed && (
        <p className="text-sm text-red-500">Not quite — try again.</p>
      )}
      {(correct || revealed) && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg bg-green-500/10 px-4 py-3 text-sm text-green-700 dark:text-green-300"
        >
          <Check className="size-4 inline mr-1" />
          <strong>{step.options[step.correctIdx]}</strong> — {step.explanation}
        </motion.div>
      )}
    </div>
  );
}

export default function Lab9Ex2ViterbiDecoder() {
  const { isStepComplete, markStepComplete } = useLabProgress('lab9-ex2', STEPS.length);
  const [active, setActive] = useState(() => {
    for (let i = 0; i < STEPS.length; i++) {
      if (!isStepComplete(i + 1)) return i;
    }
    return STEPS.length - 1;
  });

  const markComplete = useCallback(
    (idx: number) => markStepComplete(idx + 1),
    [markStepComplete],
  );

  const completed = STEPS.map((_, i) => isStepComplete(i + 1));
  const allDone = completed.every(Boolean);
  const step = STEPS[active];
  const hasNext = active < STEPS.length - 1;

  return (
    <div>
      <div className="rounded-lg bg-muted/30 border border-border p-3 mb-5 text-xs font-mono space-y-1">
        <div className="font-semibold text-sm">Same HMM, observation O = 3 1 3 — now find the best state path.</div>
        <div>
          π: HOT=0.8, COLD=0.2 · Transitions: H→H=0.2 H→C=0.6 H→F=0.2 · C→H=0.3 C→C=0.5 C→F=0.2
        </div>
        <div>Emissions HOT: b(1)=0.1, b(2)=0.15, b(3)=0.75 · COLD: b(1)=0.8, b(2)=0.1, b(3)=0.1</div>
      </div>

      <div className="flex flex-wrap items-center gap-1 mb-5">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="size-3 text-muted-foreground/50 shrink-0 hidden sm:block" />}
            <button
              type="button"
              onClick={() => {
                if (i === 0 || completed[i - 1]) setActive(i);
              }}
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                active === i
                  ? 'bg-primary text-primary-foreground'
                  : completed[i]
                    ? 'bg-primary/15 text-primary'
                    : i > 0 && !completed[i - 1]
                      ? 'bg-muted text-muted-foreground/40'
                      : 'bg-muted text-muted-foreground'
              }`}
            >
              {completed[i] && <Check className="size-3" />}
              <span>{s.title}</span>
            </button>
          </div>
        ))}
      </div>

      <h4 className="text-sm font-semibold text-muted-foreground mb-3">
        Step {active + 1} of {STEPS.length}
      </h4>

      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
        >
          {step.kind === 'numeric' ? (
            <NumericStepView
              key={active}
              step={step}
              onComplete={() => markComplete(active)}
              isComplete={completed[active]}
            />
          ) : (
            <ChoiceStepView
              key={active}
              step={step}
              onComplete={() => markComplete(active)}
              isComplete={completed[active]}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {completed[active] && hasNext && (
        <div className="mt-4 flex justify-end">
          <Button
            size="sm"
            onClick={() => setActive(active + 1)}
            className="h-8 text-xs"
          >
            Continue to {STEPS[active + 1].title}
            <ArrowRight className="ml-1.5 size-3.5" />
          </Button>
        </div>
      )}

      {allDone && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 rounded-lg bg-green-500/10 border border-green-500/30 px-4 py-3 text-sm text-green-700 dark:text-green-300"
        >
          You decoded the full Viterbi trellis. The most likely hidden sequence for{' '}
          <span className="font-mono">3 1 3</span> is{' '}
          <span className="font-mono font-bold">
            {BEST_PATH.join(' → ')}
          </span>{' '}
          with score <span className="font-mono">{BEST_SCORE.toFixed(6)}</span>. Now port this into{' '}
          <code className="text-xs bg-muted px-1 rounded">compute_viterbi</code> in the lab handout.
        </motion.div>
      )}
    </div>
  );
}
