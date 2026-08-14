import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check, ChevronRight, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { M, BlockMath } from '@/components/Math';
import { useLabProgress } from '@/hooks/useLabProgress';

// ── HMM parameters from /labs/Lab 9/handout/hidden_markov_models.py ──
// states: [initial, HOT, COLD, final]
// transitions[from][to]
//   initial: [0.0, 0.8, 0.2, 0.0]
//   HOT:     [0.0, 0.2, 0.6, 0.2]
//   COLD:    [0.0, 0.3, 0.5, 0.2]
//   final:   [0.0, 0.0, 0.0, 0.0]
// emissions[state][obs]
//   HOT:  {1: 0.1, 2: 0.15, 3: 0.75}
//   COLD: {1: 0.8, 2: 0.1,  3: 0.1}

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

// ── Compute expected answers ─────────────────────────────────────────

const a1H = A_INIT.HOT * B.HOT[OBS[0]];  // 0.8 * 0.75 = 0.6
const a1C = A_INIT.COLD * B.COLD[OBS[0]]; // 0.2 * 0.1 = 0.02

const a2H = (a1H * A.HOT.HOT + a1C * A.COLD.HOT) * B.HOT[OBS[1]];   // (0.6*0.2 + 0.02*0.3)*0.1
const a2C = (a1H * A.HOT.COLD + a1C * A.COLD.COLD) * B.COLD[OBS[1]]; // (0.6*0.6 + 0.02*0.5)*0.8

const a3H = (a2H * A.HOT.HOT + a2C * A.COLD.HOT) * B.HOT[OBS[2]];
const a3C = (a2H * A.HOT.COLD + a2C * A.COLD.COLD) * B.COLD[OBS[2]];

const finalP = a3H * A.HOT.F + a3C * A.COLD.F;

// ── Step definitions ─────────────────────────────────────────────────

interface Step {
  id: number;
  title: string;
  prompt: string;
  formula: string;
  expected: number;
  hint: string;
}

const STEPS: Step[] = [
  {
    id: 1,
    title: 'Init α₁(HOT)',
    prompt: 'Compute α₁(HOT) = P(start → HOT) · P(o₁ = 3 | HOT)',
    formula: '\\alpha_1(\\text{HOT}) = a_{0,\\text{HOT}} \\cdot b_\\text{HOT}(3) = 0.8 \\times 0.75',
    expected: a1H,
    hint: 'Multiply the initial transition 0.8 by the emission probability of 3 given HOT (0.75).',
  },
  {
    id: 2,
    title: 'Init α₁(COLD)',
    prompt: 'Compute α₁(COLD) = P(start → COLD) · P(o₁ = 3 | COLD)',
    formula: '\\alpha_1(\\text{COLD}) = a_{0,\\text{COLD}} \\cdot b_\\text{COLD}(3) = 0.2 \\times 0.1',
    expected: a1C,
    hint: '0.2 × 0.1',
  },
  {
    id: 3,
    title: 'Recurse α₂(HOT)',
    prompt: 'Compute α₂(HOT) for o₂ = 1. Sum over all previous states.',
    formula:
      '\\alpha_2(\\text{HOT}) = \\big[\\alpha_1(H)\\,a_{HH} + \\alpha_1(C)\\,a_{CH}\\big]\\,b_H(1) = (0.6 \\cdot 0.2 + 0.02 \\cdot 0.3) \\cdot 0.1',
    expected: a2H,
    hint: 'Use your α₁ values from steps 1 & 2. a_{HH}=0.2, a_{CH}=0.3, b_H(1)=0.1.',
  },
  {
    id: 4,
    title: 'Recurse α₂(COLD)',
    prompt: 'Compute α₂(COLD) for o₂ = 1.',
    formula:
      '\\alpha_2(\\text{COLD}) = \\big[\\alpha_1(H)\\,a_{HC} + \\alpha_1(C)\\,a_{CC}\\big]\\,b_C(1) = (0.6 \\cdot 0.6 + 0.02 \\cdot 0.5) \\cdot 0.8',
    expected: a2C,
    hint: 'a_{HC}=0.6, a_{CC}=0.5, b_C(1)=0.8.',
  },
  {
    id: 5,
    title: 'Recurse α₃(HOT)',
    prompt: 'Compute α₃(HOT) for o₃ = 3.',
    formula:
      '\\alpha_3(\\text{HOT}) = \\big[\\alpha_2(H)\\,a_{HH} + \\alpha_2(C)\\,a_{CH}\\big]\\,b_H(3)',
    expected: a3H,
    hint: `Use α₂(H)=${a2H.toFixed(4)}, α₂(C)=${a2C.toFixed(4)}. b_H(3)=0.75.`,
  },
  {
    id: 6,
    title: 'Recurse α₃(COLD)',
    prompt: 'Compute α₃(COLD) for o₃ = 3.',
    formula:
      '\\alpha_3(\\text{COLD}) = \\big[\\alpha_2(H)\\,a_{HC} + \\alpha_2(C)\\,a_{CC}\\big]\\,b_C(3)',
    expected: a3C,
    hint: 'b_C(3)=0.1.',
  },
  {
    id: 7,
    title: 'Termination',
    prompt: 'Compute P(O | λ) by transitioning each final state into the final state F.',
    formula:
      'P(O\\mid\\lambda) = \\alpha_3(H)\\,a_{H,F} + \\alpha_3(C)\\,a_{C,F}',
    expected: finalP,
    hint: 'Both a_{H,F} and a_{C,F} equal 0.2 in this HMM.',
  },
];

// ── Component ────────────────────────────────────────────────────────

function StepView({
  step,
  onComplete,
  isComplete,
}: {
  step: Step;
  onComplete: () => void;
  isComplete: boolean;
}) {
  // When this step was already finished previously, render the completed view
  // immediately so the green explanation stays visible on revisit.
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
          <M>{`\\alpha`}</M> =
        </label>
        <input
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setChecked(false);
          }}
          placeholder="e.g. 0.0126"
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
        <p className="text-sm text-red-500">
          Not quite. Remember: α values can be very small. Tolerance is ±0.001.
        </p>
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

export default function Lab9Ex1ForwardBuilder() {
  const { isStepComplete, markStepComplete } = useLabProgress('lab9-ex1', STEPS.length);
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
      {/* HMM reference card */}
      <div className="rounded-lg bg-muted/30 border border-border p-3 mb-5 text-xs font-mono space-y-1">
        <div className="font-semibold text-sm">Lab 9 HMM parameters (observation sequence O = 3 1 3)</div>
        <div>
          π: HOT={A_INIT.HOT}, COLD={A_INIT.COLD}
        </div>
        <div>
          Transitions: a(H→H)={A.HOT.HOT}, a(H→C)={A.HOT.COLD}, a(H→F)={A.HOT.F}, a(C→H)={A.COLD.HOT}, a(C→C)=
          {A.COLD.COLD}, a(C→F)={A.COLD.F}
        </div>
        <div>
          Emissions HOT: b(1)=0.1, b(2)=0.15, b(3)=0.75 · COLD: b(1)=0.8, b(2)=0.1, b(3)=0.1
        </div>
      </div>

      {/* Step indicator */}
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
          <StepView
            key={active}
            step={step}
            onComplete={() => markComplete(active)}
            isComplete={completed[active]}
          />
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
          You've just run the <strong>forward algorithm by hand</strong> on the Lab 9 HMM. Final result:{' '}
          <span className="font-mono font-bold">P(O | λ) ≈ {finalP.toFixed(6)}</span>. Now translate these steps
          into Python in <code className="text-xs bg-muted px-1 rounded">compute_forward</code>.
        </motion.div>
      )}
    </div>
  );
}
