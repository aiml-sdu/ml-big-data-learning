import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { M, BlockMath } from '@/components/Math';
import CalloutBox from '@/components/CalloutBox';

// ---------- Constants ----------

const SENSITIVITY = 0.99;
const PREVALENCE = 0.0001;
const FPR = 0.01;
const COMPLEMENT = 1 - PREVALENCE;
const POSTERIOR = (SENSITIVITY * PREVALENCE) / (SENSITIVITY * PREVALENCE + FPR * COMPLEMENT);
const POPULATION = 1_000_000;
const SICK = Math.round(POPULATION * PREVALENCE);
const HEALTHY = POPULATION - SICK;
const TP = Math.round(SICK * SENSITIVITY);
const FP = Math.round(HEALTHY * FPR);
const TOTAL_POS = TP + FP;

// ---------- Step 1: Guess ----------

function GuessStep({ onComplete, onGuess }: { onComplete: () => void; onGuess: (v: number) => void }) {
  const [guess, setGuess] = useState(90);
  const [locked, setLocked] = useState(false);

  const handleLock = useCallback(() => {
    setLocked(true);
    onGuess(guess);
    onComplete();
  }, [guess, onComplete, onGuess]);

  return (
    <div>
      <div className="rounded-lg border bg-muted/30 p-4 mb-4 text-sm">
        <p className="font-medium text-foreground mb-2">Scenario</p>
        <p className="text-muted-foreground">
          A disease affects <strong>1 in 10,000</strong> people. A test for this disease is{' '}
          <strong>99% accurate</strong> — it correctly identifies 99% of sick people (sensitivity = 99%)
          and correctly identifies 99% of healthy people (specificity = 99%, so FPR = 1%).
        </p>
        <p className="text-muted-foreground mt-2">
          You test positive. What is the probability you actually have the disease?
        </p>
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium">
          Your guess: <span className="text-primary font-bold">{guess}%</span>
        </label>
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={guess}
          onChange={(e) => setGuess(Number(e.target.value))}
          disabled={locked}
          className="w-full accent-primary"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>

      {!locked ? (
        <Button size="sm" className="h-8 text-xs mt-4" onClick={handleLock}>
          Lock In
        </Button>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 rounded-lg bg-primary/10 px-4 py-3 text-sm text-primary"
        >
          <Check className="size-4 inline mr-1" />
          Locked in at <strong>{guess}%</strong>. Let's see how it compares to the real answer.
        </motion.div>
      )}
    </div>
  );
}

// ---------- Step 2: Do the Math ----------

function MathStep({ guess, onComplete }: { guess: number; onComplete: () => void }) {
  const [input, setInput] = useState('');
  const [checked, setChecked] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);

  const handleCheck = useCallback(() => {
    const val = parseFloat(input);
    const isCorrect = !isNaN(val) && Math.abs(val - POSTERIOR) < 0.001;
    setChecked(true);
    setCorrect(isCorrect);
    if (isCorrect) onComplete();
  }, [input, onComplete]);

  const handleReveal = useCallback(() => {
    setShowAnswer(true);
    onComplete();
  }, [onComplete]);

  return (
    <div>
      <p className="text-sm text-muted-foreground mb-4">
        Apply Bayes' theorem with these values:
      </p>

      <div className="rounded-lg border bg-muted/30 p-4 mb-4 space-y-2">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div><M>{'P(+ \\mid D) = 0.99'}</M></div>
          <div><M>{'P(D) = 0.0001'}</M></div>
          <div><M>{'P(+ \\mid \\neg D) = 0.01'}</M></div>
          <div><M>{'P(\\neg D) = 0.9999'}</M></div>
        </div>
        <div className="pt-2 border-t">
          <BlockMath>{`P(D \\mid +) = \\frac{P(+ \\mid D) \\cdot P(D)}{P(+ \\mid D) \\cdot P(D) + P(+ \\mid \\neg D) \\cdot P(\\neg D)}`}</BlockMath>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-2">
        <label className="text-sm font-medium"><M>{'P(D \\mid +)'}</M> =</label>
        <input
          type="text"
          value={input}
          onChange={(e) => { setInput(e.target.value); setChecked(false); }}
          placeholder="e.g. 0.0098"
          disabled={correct || showAnswer}
          className="w-32 rounded-md border border-border bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
        />
        {!correct && !showAnswer && (
          <>
            <Button size="sm" className="h-8 text-xs" onClick={handleCheck} disabled={!input}>
              Check
            </Button>
            <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={handleReveal}>
              Show Answer
            </Button>
          </>
        )}
      </div>

      {checked && !correct && !showAnswer && (
        <p className="text-sm text-red-500 mt-2">
          Not quite. Hint: numerator = 0.99 x 0.0001, denominator = numerator + 0.01 x 0.9999. (tolerance: +/-0.001)
        </p>
      )}

      {(correct || showAnswer) && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 space-y-3"
        >
          <div className="rounded-lg border bg-muted/30 p-4">
            <BlockMath>{`P(D \\mid +) = \\frac{0.99 \\times 0.0001}{0.99 \\times 0.0001 + 0.01 \\times 0.9999} = \\frac{0.000099}{0.010098} \\approx 0.0098`}</BlockMath>
          </div>

          <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 px-4 py-3 text-sm">
            <p className="font-medium text-amber-700 dark:text-amber-300 mb-1">Surprise!</p>
            <p className="text-muted-foreground">
              You guessed <strong>{guess}%</strong>, but the actual probability is only{' '}
              <strong>{(POSTERIOR * 100).toFixed(2)}%</strong>!
              {guess > 50 && ' Most people dramatically overestimate this.'}
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ---------- Step 3: Frequency Perspective ----------

interface TreeNode {
  label: string;
  count: number;
  color: string;
  marker?: string;
  children?: TreeNode[];
}

function FrequencyTree() {
  const tree: TreeNode = {
    label: `${POPULATION.toLocaleString()} people`,
    count: POPULATION,
    color: 'bg-gray-200 dark:bg-gray-700',
    children: [
      {
        label: `${SICK} have the disease`,
        count: SICK,
        color: 'bg-red-100 dark:bg-red-900/40',
        children: [
          { label: `${TP} test positive`, count: TP, color: 'bg-green-100 dark:bg-green-900/40', marker: 'TP' },
          { label: `${SICK - TP} test negative`, count: SICK - TP, color: 'bg-gray-100 dark:bg-gray-800', marker: 'FN' },
        ],
      },
      {
        label: `${HEALTHY.toLocaleString()} are healthy`,
        count: HEALTHY,
        color: 'bg-blue-100 dark:bg-blue-900/40',
        children: [
          { label: `${FP.toLocaleString()} test positive`, count: FP, color: 'bg-red-100 dark:bg-red-900/40', marker: 'FP' },
          { label: `${(HEALTHY - FP).toLocaleString()} test negative`, count: HEALTHY - FP, color: 'bg-gray-100 dark:bg-gray-800', marker: 'TN' },
        ],
      },
    ],
  };

  return (
    <div className="space-y-2 text-sm font-mono">
      <TreeBranch node={tree} depth={0} />
    </div>
  );
}

function TreeBranch({ node, depth }: { node: TreeNode; depth: number }) {
  const indent = depth > 0;
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: depth * 0.15, duration: 0.3 }}
    >
      <div className={`flex items-center gap-2 ${indent ? 'ml-6' : ''}`}>
        {indent && <span className="text-muted-foreground">{'|--'}</span>}
        <span className={`inline-block rounded px-2 py-0.5 text-xs ${node.color}`}>
          {node.label}
          {node.marker && (
            <span className={`ml-1.5 font-bold ${node.marker === 'TP' ? 'text-green-600 dark:text-green-400' : node.marker === 'FP' ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground'}`}>
              {node.marker === 'TP' ? '\u2713' : node.marker === 'FP' ? '\u2717' : ''}
            </span>
          )}
        </span>
      </div>
      {node.children?.map((child, i) => (
        <TreeBranch key={i} node={child} depth={depth + 1} />
      ))}
    </motion.div>
  );
}

function FrequencyStep({ onComplete }: { onComplete: () => void }) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div>
      <p className="text-sm text-muted-foreground mb-4">
        Why is the answer so low? Let's think in frequencies instead of probabilities.
      </p>

      <Button
        size="sm"
        className="h-8 text-xs mb-4"
        onClick={() => { setRevealed(true); onComplete(); }}
        disabled={revealed}
      >
        Show Frequency Breakdown
      </Button>

      {revealed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="space-y-4"
        >
          <div className="rounded-lg border bg-muted/30 p-4">
            <FrequencyTree />
          </div>

          {/* Stacked bar visualization */}
          <div className="rounded-lg border bg-muted/30 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              All positive results ({TOTAL_POS.toLocaleString()} people)
            </p>
            <div className="flex rounded-full overflow-hidden h-6">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(TP / TOTAL_POS) * 100}%` }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="bg-green-500 flex items-center justify-center"
              >
                <span className="text-[10px] font-bold text-white">{TP}</span>
              </motion.div>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(FP / TOTAL_POS) * 100}%` }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="bg-red-400 flex items-center justify-center"
              >
                <span className="text-[10px] font-bold text-white">{FP.toLocaleString()}</span>
              </motion.div>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span className="flex items-center gap-1">
                <span className="size-2.5 rounded-full bg-green-500 inline-block" /> True Positives: {TP}
              </span>
              <span className="flex items-center gap-1">
                <span className="size-2.5 rounded-full bg-red-400 inline-block" /> False Positives: {FP.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="rounded-lg border bg-muted/30 p-4">
            <BlockMath>{`P(D \\mid +) = \\frac{${TP}}{${TOTAL_POS.toLocaleString()}} = ${(TP / TOTAL_POS * 100).toFixed(2)}\\%`}</BlockMath>
          </div>

          <CalloutBox type="key-idea" title="Base Rate Neglect">
            The false positives from the massive healthy population ({HEALTHY.toLocaleString()})
            overwhelm the true positives from the tiny sick population ({SICK}).
            Even with a 99% accurate test, a positive result is almost certainly a false alarm
            when the disease is extremely rare.
          </CalloutBox>
        </motion.div>
      )}
    </div>
  );
}

// ---------- Main Component ----------

interface StepState {
  completed: boolean[];
  active: number;
  guess: number;
}

export default function Exercise2RareDisease() {
  const [state, setState] = useState<StepState>({
    completed: [false, false, false],
    active: 0,
    guess: 90,
  });

  const markComplete = useCallback((idx: number) => {
    setState((prev) => {
      const completed = [...prev.completed];
      completed[idx] = true;
      const nextActive = idx < 2 ? idx + 1 : idx;
      return { ...prev, completed, active: nextActive };
    });
  }, []);

  const steps = [
    {
      title: 'Guess the probability',
      content: (
        <GuessStep
          onComplete={() => markComplete(0)}
          onGuess={(v) => setState((s) => ({ ...s, guess: v }))}
        />
      ),
    },
    {
      title: "Let's do the math",
      content: <MathStep guess={state.guess} onComplete={() => markComplete(1)} />,
    },
    {
      title: 'Why so low? The frequency perspective',
      content: <FrequencyStep onComplete={() => markComplete(2)} />,
    },
  ];

  return (
    <div>
      {/* Step indicator */}
      <div className="flex items-center gap-1 mb-5">
        {steps.map((_, i) => (
          <div key={i} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="size-3.5 text-muted-foreground/50 shrink-0" />}
            <button
              type="button"
              onClick={() => {
                if (i === 0 || state.completed[i - 1]) setState((s) => ({ ...s, active: i }));
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                state.active === i
                  ? 'bg-primary text-primary-foreground'
                  : state.completed[i]
                    ? 'bg-primary/15 text-primary'
                    : 'bg-muted text-muted-foreground'
              }`}
            >
              {state.completed[i] && <Check className="size-3" />}
              <span>Step {i + 1}</span>
            </button>
          </div>
        ))}
      </div>

      <h4 className="text-sm font-semibold text-muted-foreground mb-3">
        Step {state.active + 1} of 3: {steps[state.active].title}
      </h4>

      <AnimatePresence mode="wait">
        <motion.div
          key={state.active}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
        >
          {steps[state.active].content}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
