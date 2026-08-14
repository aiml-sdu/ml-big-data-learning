import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { M, BlockMath } from '@/components/Math';

// ---------- Types & Data ----------

interface TestData {
  name: string;
  sensitivity: number;
  fpr: number;
}

const TEST_A: TestData = { name: 'A', sensitivity: 0.95, fpr: 0.10 };
const TEST_B: TestData = { name: 'B', sensitivity: 0.90, fpr: 0.05 };
const PREVALENCE = 0.01;

function bayesPosterior(sens: number, fpr: number, prev: number) {
  return (sens * prev) / (sens * prev + fpr * (1 - prev));
}

const ANSWER_A = bayesPosterior(TEST_A.sensitivity, TEST_A.fpr, PREVALENCE);
const ANSWER_B = bayesPosterior(TEST_B.sensitivity, TEST_B.fpr, PREVALENCE);

// ---------- Frequency Dot Viz ----------

function FrequencyDots({ test, population = 1000 }: { test: TestData; population?: number }) {
  const sick = Math.round(population * PREVALENCE);
  const healthy = population - sick;
  const tp = Math.round(sick * test.sensitivity);
  const fp = Math.round(healthy * test.fpr);

  const dots = useMemo(() => {
    const result: { color: string; label: string }[] = [];
    // True positives
    for (let i = 0; i < tp; i++) result.push({ color: 'bg-green-500', label: 'TP' });
    // False negatives
    for (let i = 0; i < sick - tp; i++) result.push({ color: 'bg-green-500/30', label: 'FN' });
    // False positives
    for (let i = 0; i < fp; i++) result.push({ color: 'bg-red-500', label: 'FP' });
    // True negatives
    const tn = healthy - fp;
    for (let i = 0; i < Math.min(tn, 200); i++) result.push({ color: 'bg-gray-300 dark:bg-gray-600', label: 'TN' });
    if (tn > 200) result.push({ color: 'bg-gray-300 dark:bg-gray-600', label: `+${tn - 200} TN` });
    return result;
  }, [tp, fp, sick, healthy]);

  return (
    <div>
      <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
        Test {test.name} — {population.toLocaleString()} people
      </h5>
      <div className="flex flex-wrap gap-0.5 mb-2 max-h-32 overflow-hidden">
        {dots.map((d, i) => (
          <div key={i} className={`size-2 rounded-full ${d.color}`} title={d.label} />
        ))}
      </div>
      <div className="flex gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="size-2.5 rounded-full bg-green-500 inline-block" /> True Positives: {tp}
        </span>
        <span className="flex items-center gap-1">
          <span className="size-2.5 rounded-full bg-red-500 inline-block" /> False Positives: {fp}
        </span>
      </div>
    </div>
  );
}

// ---------- Step 1 & 3: Formula Setup ----------

const SELECT_OPTIONS = ['0.01', '0.05', '0.10', '0.90', '0.95', '0.99'];

function FormulaSetupStep({
  test,
  onComplete,
}: {
  test: TestData;
  onComplete: () => void;
}) {
  const [sensVal, setSensVal] = useState('');
  const [prevVal, setPrevVal] = useState('');
  const [fprVal, setFprVal] = useState('');
  const [compVal, setCompVal] = useState('');
  const [checked, setChecked] = useState(false);
  const [correct, setCorrect] = useState(false);

  const handleCheck = useCallback(() => {
    const isCorrect =
      parseFloat(sensVal) === test.sensitivity &&
      parseFloat(prevVal) === PREVALENCE &&
      parseFloat(fprVal) === test.fpr &&
      parseFloat(compVal) === 1 - PREVALENCE;
    setChecked(true);
    setCorrect(isCorrect);
    if (isCorrect) onComplete();
  }, [sensVal, prevVal, fprVal, compVal, test, onComplete]);

  const allSelected = sensVal && prevVal && fprVal && compVal;

  return (
    <div>
      <p className="text-sm text-muted-foreground mb-4">
        Set up the Bayes formula for Test {test.name}. Select the correct value for each slot.
      </p>

      <div className="rounded-lg border bg-muted/30 p-4 mb-4 space-y-4">
        <div className="text-sm font-medium mb-2">
          <BlockMath>{`P(V \\mid +) = \\frac{P(+ \\mid V) \\times P(V)}{P(+ \\mid V) \\times P(V) + P(+ \\mid \\neg V) \\times P(\\neg V)}`}</BlockMath>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1">
              <M>{'P(+ \\mid V)'}</M> — Sensitivity
            </label>
            <select
              value={sensVal}
              onChange={(e) => { setSensVal(e.target.value); setChecked(false); }}
              className="w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm"
            >
              <option value="">Select...</option>
              {SELECT_OPTIONS.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1">
              <M>{'P(V)'}</M> — Prevalence
            </label>
            <select
              value={prevVal}
              onChange={(e) => { setPrevVal(e.target.value); setChecked(false); }}
              className="w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm"
            >
              <option value="">Select...</option>
              {SELECT_OPTIONS.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1">
              <M>{'P(+ \\mid \\neg V)'}</M> — False Positive Rate
            </label>
            <select
              value={fprVal}
              onChange={(e) => { setFprVal(e.target.value); setChecked(false); }}
              className="w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm"
            >
              <option value="">Select...</option>
              {SELECT_OPTIONS.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1">
              <M>{'P(\\neg V)'}</M> — Complement
            </label>
            <select
              value={compVal}
              onChange={(e) => { setCompVal(e.target.value); setChecked(false); }}
              className="w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm"
            >
              <option value="">Select...</option>
              {SELECT_OPTIONS.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {!correct && (
        <Button size="sm" className="h-8 text-xs" onClick={handleCheck} disabled={!allSelected}>
          Check
        </Button>
      )}

      {checked && !correct && (
        <p className="text-sm text-red-500 mt-2">
          Some values are incorrect. Review the test parameters and try again.
        </p>
      )}
      {correct && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-1.5 text-sm font-medium text-green-700 dark:text-green-400 mt-2"
        >
          <Check className="size-4" /> Correct! The formula is set up properly.
        </motion.div>
      )}
    </div>
  );
}

// ---------- Step 2 & (part of 3): Compute Posterior ----------

function ComputeStep({
  test,
  answer,
  onComplete,
}: {
  test: TestData;
  answer: number;
  onComplete: () => void;
}) {
  const [input, setInput] = useState('');
  const [checked, setChecked] = useState(false);
  const [correct, setCorrect] = useState(false);

  const handleCheck = useCallback(() => {
    const val = parseFloat(input);
    const isCorrect = !isNaN(val) && Math.abs(val - answer) < 0.002;
    setChecked(true);
    setCorrect(isCorrect);
    if (isCorrect) onComplete();
  }, [input, answer, onComplete]);

  const filledFormula = `P(V \\mid +_{${test.name}}) = \\frac{${test.sensitivity} \\times ${PREVALENCE}}{${test.sensitivity} \\times ${PREVALENCE} + ${test.fpr} \\times ${1 - PREVALENCE}}`;

  return (
    <div>
      <p className="text-sm text-muted-foreground mb-4">
        Compute <M>{`P(\\text{Virus} \\mid +_{${test.name}})`}</M> using the filled formula below.
      </p>

      <div className="rounded-lg border bg-muted/30 p-4 mb-4">
        <BlockMath>{filledFormula}</BlockMath>
      </div>

      <div className="flex items-center gap-3">
        <label className="text-sm font-medium">Answer:</label>
        <input
          type="text"
          value={input}
          onChange={(e) => { setInput(e.target.value); setChecked(false); }}
          placeholder="e.g. 0.0876"
          disabled={correct}
          className="w-32 rounded-md border border-border bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
        />
        {!correct && (
          <Button size="sm" className="h-8 text-xs" onClick={handleCheck} disabled={!input}>
            Check
          </Button>
        )}
      </div>

      {checked && !correct && (
        <p className="text-sm text-red-500 mt-2">
          Not quite. Compute the numerator and denominator separately, then divide. (tolerance: +/-0.002)
        </p>
      )}
      {correct && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 rounded-lg bg-green-500/10 px-4 py-3"
        >
          <p className="text-sm font-medium text-green-700 dark:text-green-300">
            <Check className="size-4 inline mr-1" />
            <M>{`P(V \\mid +_{${test.name}}) = ${answer.toFixed(4)}`}</M> — about {(answer * 100).toFixed(1)}%
          </p>
        </motion.div>
      )}
    </div>
  );
}

// ---------- Step 4: Comparison ----------

function CompareStep({ onComplete }: { onComplete: () => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const correct = selected === 'B';

  const handleCheck = useCallback(() => {
    setChecked(true);
    if (selected === 'B') onComplete();
  }, [selected, onComplete]);

  return (
    <div>
      <p className="text-sm text-muted-foreground mb-4">
        Test A gives <M>{`P(V \\mid +_A) = ${ANSWER_A.toFixed(4)}`}</M> ({(ANSWER_A * 100).toFixed(1)}%).
        Test B gives <M>{`P(V \\mid +_B) = ${ANSWER_B.toFixed(4)}`}</M> ({(ANSWER_B * 100).toFixed(1)}%).
        Which test is more indicative of actual infection?
      </p>

      <div className="flex gap-3 mb-4">
        {(['A', 'B', 'Equal'] as const).map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => { setSelected(opt === 'Equal' ? 'Equal' : opt); setChecked(false); }}
            disabled={checked && correct}
            className={`px-4 py-2 rounded-md border text-sm font-medium transition-all ${
              selected === opt
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border text-muted-foreground hover:border-primary/50'
            }`}
          >
            {opt === 'Equal' ? "They're equal" : `Test ${opt}`}
          </button>
        ))}
      </div>

      {!checked && (
        <Button size="sm" className="h-8 text-xs" onClick={handleCheck} disabled={!selected}>
          Check
        </Button>
      )}

      {checked && !correct && (
        <p className="text-sm text-red-500 mt-2">
          Compare the posteriors. Which test gives a higher probability of actually being infected?
        </p>
      )}

      {checked && correct && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mt-4 space-y-4"
        >
          <div className="rounded-lg bg-green-500/10 px-4 py-3">
            <p className="text-sm font-medium text-green-700 dark:text-green-300">
              <Check className="size-4 inline mr-1" />
              Correct! Test B is more indicative despite having lower sensitivity.
            </p>
          </div>

          <div className="rounded-lg border bg-muted/30 p-4 space-y-1">
            <p className="text-sm text-muted-foreground">
              Test B has fewer false alarms because its false positive rate (5%) is half of Test A's (10%).
              When the disease is rare, the FPR dominates the denominator — so lower FPR means a much higher
              posterior probability.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FrequencyDots test={TEST_A} />
            <FrequencyDots test={TEST_B} />
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ---------- Main Component ----------

interface StepState {
  completed: boolean[];
  active: number;
}

export default function Exercise1BayesCompare() {
  const [state, setState] = useState<StepState>({
    completed: [false, false, false, false],
    active: 0,
  });

  const markComplete = useCallback((idx: number) => {
    setState((prev) => {
      const completed = [...prev.completed];
      completed[idx] = true;
      const nextActive = idx < 3 ? idx + 1 : idx;
      return { completed, active: nextActive };
    });
  }, []);

  const steps = [
    { title: 'Set up Bayes formula for Test A', content: <FormulaSetupStep test={TEST_A} onComplete={() => markComplete(0)} /> },
    { title: 'Compute P(Virus | +A)', content: <ComputeStep test={TEST_A} answer={ANSWER_A} onComplete={() => markComplete(1)} /> },
    { title: 'Now do Test B', content: <ComputeStep test={TEST_B} answer={ANSWER_B} onComplete={() => markComplete(2)} /> },
    { title: 'Which test is more indicative?', content: <CompareStep onComplete={() => markComplete(3)} /> },
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

      {/* Step title */}
      <h4 className="text-sm font-semibold text-muted-foreground mb-3">
        Step {state.active + 1} of 4: {steps[state.active].title}
      </h4>

      {/* Problem context */}
      {state.active === 0 && (
        <div className="rounded-lg border bg-muted/30 p-4 mb-4 text-sm text-muted-foreground">
          <p className="font-medium text-foreground mb-1">Scenario</p>
          <p>
            A virus has a prevalence of <strong>1%</strong>. Two tests are available:
          </p>
          <ul className="list-disc ml-5 mt-1 space-y-0.5">
            <li><strong>Test A:</strong> 95% sensitivity, 10% false positive rate</li>
            <li><strong>Test B:</strong> 90% sensitivity, 5% false positive rate</li>
          </ul>
        </div>
      )}

      {/* Active step content */}
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
