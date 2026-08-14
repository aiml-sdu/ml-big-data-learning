import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLabProgress } from '@/hooks/useLabProgress';
import { nQueensFitness } from '@/lib/local-search';

const P1 = [3, 1, 6, 2, 7, 4, 0, 5];
const P2 = [5, 2, 0, 6, 4, 7, 1, 3];
const CROSSOVER_POINT = 4;
const CHILD1_EXPECTED = [3, 1, 6, 2, 4, 7, 1, 3];
const CHILD2_EXPECTED = [5, 2, 0, 6, 7, 4, 0, 5];
const MUTATION_POS = 6;
const MUTATION_VAL = 5;
const MUTATED_CHILD = [3, 1, 6, 2, 4, 7, 5, 3];
const MUTATED_FITNESS = nQueensFitness(MUTATED_CHILD);

const N = 8;

function ChromosomeRow({ label, genes, highlight }: { label: string; genes: number[]; highlight?: Set<number> }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-semibold text-muted-foreground w-16 shrink-0">{label}</span>
      <div className="flex gap-0.5">
        {genes.map((g, i) => (
          <div key={i} className={`w-8 h-8 rounded flex items-center justify-center text-sm font-mono font-bold ${
            highlight?.has(i) ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
          }`}>
            {g}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Exercise2CrossoverMutation() {
  const { markStepComplete, isStepComplete } = useLabProgress('lab4-ex2', 4);
  const [step, setStep] = useState(() => {
    for (let i = 1; i <= 4; i++) {
      if (!isStepComplete(i)) return i;
    }
    return 5;
  });
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'wrong'; msg: string } | null>(null);

  // Step 1 & 2: fill in child genes
  const [child1Input, setChild1Input] = useState<number[]>(Array(N).fill(-1));
  const [child2Input, setChild2Input] = useState<number[]>(Array(N).fill(-1));

  // Step 3: click mutation position
  const [mutClickedPos, setMutClickedPos] = useState<number | null>(null);

  // Step 4: multiple choice for fitness
  const [fitnessChoice, setFitnessChoice] = useState<number | null>(null);

  const allDone = step > 4;

  const handleSubmitChild1 = useCallback(() => {
    const correct = child1Input.every((v, i) => v === CHILD1_EXPECTED[i]);
    if (correct) {
      setFeedback({ type: 'correct', msg: 'Correct! Child 1 = first 4 from P1 + last 4 from P2.' });
      markStepComplete(1);
    } else {
      setFeedback({ type: 'wrong', msg: 'Not quite. Take genes 0-3 from Parent 1 and genes 4-7 from Parent 2.' });
      setTimeout(() => setFeedback(null), 2000);
    }
  }, [child1Input, markStepComplete]);

  const handleSubmitChild2 = useCallback(() => {
    const correct = child2Input.every((v, i) => v === CHILD2_EXPECTED[i]);
    if (correct) {
      setFeedback({ type: 'correct', msg: 'Correct! Child 2 = first 4 from P2 + last 4 from P1.' });
      markStepComplete(2);
    } else {
      setFeedback({ type: 'wrong', msg: 'Not quite. Take genes 0-3 from Parent 2 and genes 4-7 from Parent 1.' });
      setTimeout(() => setFeedback(null), 2000);
    }
  }, [child2Input, markStepComplete]);

  const handleMutationClick = useCallback((pos: number) => {
    setMutClickedPos(pos);
    if (pos === MUTATION_POS) {
      setFeedback({ type: 'correct', msg: `Correct! Position ${MUTATION_POS} changed from 1 to ${MUTATION_VAL}.` });
      markStepComplete(3);
    } else {
      setFeedback({ type: 'wrong', msg: 'Look at which position differs between the two chromosomes.' });
      setTimeout(() => { setFeedback(null); setMutClickedPos(null); }, 1500);
    }
  }, [markStepComplete]);

  const handleFitnessChoice = useCallback((val: number) => {
    setFitnessChoice(val);
    if (val === MUTATED_FITNESS) {
      setFeedback({ type: 'correct', msg: `Correct! Fitness = ${MUTATED_FITNESS} (${28 - MUTATED_FITNESS} attacking pairs).` });
      markStepComplete(4);
    } else {
      setFeedback({ type: 'wrong', msg: 'Count the attacking pairs (same column or diagonal) and subtract from 28.' });
      setTimeout(() => setFeedback(null), 2000);
    }
  }, [markStepComplete]);

  const handleContinue = useCallback(() => {
    setStep((s) => s + 1);
    setFeedback(null);
  }, []);

  return (
    <div className="space-y-4">
      {/* Parents */}
      <div className="space-y-2">
        <ChromosomeRow label="Parent 1" genes={P1} highlight={new Set(step === 1 ? [0,1,2,3] : step === 2 ? [4,5,6,7] : [])} />
        <ChromosomeRow label="Parent 2" genes={P2} highlight={new Set(step === 1 ? [4,5,6,7] : step === 2 ? [0,1,2,3] : [])} />
        <p className="text-xs text-muted-foreground">Crossover point: position {CROSSOVER_POINT} (between gene {CROSSOVER_POINT - 1} and {CROSSOVER_POINT})</p>
      </div>

      {/* Step 1: Child 1 */}
      {step === 1 && (
        <div className="rounded-md border p-3 space-y-2">
          <p className="text-sm font-semibold">Step 1: What is Child 1 after crossover at position {CROSSOVER_POINT}?</p>
          <p className="text-xs text-muted-foreground">First {CROSSOVER_POINT} from Parent 1, rest from Parent 2.</p>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground w-16 shrink-0">Child 1</span>
            <div className="flex gap-0.5">
              {child1Input.map((v, i) => (
                <select key={i} value={v} onChange={e => {
                  const copy = [...child1Input];
                  copy[i] = Number(e.target.value);
                  setChild1Input(copy);
                }} className="w-8 h-8 rounded border text-center text-sm font-mono bg-background">
                  <option value={-1}>?</option>
                  {Array.from({ length: N }, (_, n) => <option key={n} value={n}>{n}</option>)}
                </select>
              ))}
            </div>
          </div>
          <Button size="sm" onClick={handleSubmitChild1} disabled={child1Input.includes(-1)}>Check</Button>
        </div>
      )}

      {/* Step 2: Child 2 */}
      {step === 2 && (
        <div className="rounded-md border p-3 space-y-2">
          <p className="text-sm font-semibold">Step 2: What is Child 2?</p>
          <p className="text-xs text-muted-foreground">First {CROSSOVER_POINT} from Parent 2, rest from Parent 1.</p>
          <ChromosomeRow label="Child 1" genes={CHILD1_EXPECTED} />
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground w-16 shrink-0">Child 2</span>
            <div className="flex gap-0.5">
              {child2Input.map((v, i) => (
                <select key={i} value={v} onChange={e => {
                  const copy = [...child2Input];
                  copy[i] = Number(e.target.value);
                  setChild2Input(copy);
                }} className="w-8 h-8 rounded border text-center text-sm font-mono bg-background">
                  <option value={-1}>?</option>
                  {Array.from({ length: N }, (_, n) => <option key={n} value={n}>{n}</option>)}
                </select>
              ))}
            </div>
          </div>
          <Button size="sm" onClick={handleSubmitChild2} disabled={child2Input.includes(-1)}>Check</Button>
        </div>
      )}

      {/* Step 3: Mutation */}
      {step === 3 && (
        <div className="rounded-md border p-3 space-y-2">
          <p className="text-sm font-semibold">Step 3: Mutation applied to Child 1. Click the position that changed.</p>
          <ChromosomeRow label="Before" genes={CHILD1_EXPECTED} />
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground w-16 shrink-0">After</span>
            <div className="flex gap-0.5">
              {MUTATED_CHILD.map((g, i) => (
                <button key={i} type="button" onClick={() => handleMutationClick(i)}
                  className={`w-8 h-8 rounded flex items-center justify-center text-sm font-mono font-bold cursor-pointer border ${
                    mutClickedPos === i
                      ? i === MUTATION_POS ? 'bg-green-500 text-white border-green-600' : 'bg-red-500 text-white border-red-600'
                      : 'bg-muted text-foreground border-border hover:border-primary'
                  }`}>
                  {g}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Fitness */}
      {step === 4 && (
        <div className="rounded-md border p-3 space-y-2">
          <p className="text-sm font-semibold">Step 4: Calculate the fitness of the mutated child.</p>
          <ChromosomeRow label="Child" genes={MUTATED_CHILD} />
          <p className="text-xs text-muted-foreground">Fitness = 28 − (number of attacking pairs). Count pairs that share a column or diagonal.</p>
          <div className="flex gap-2">
            {[24, 25, 26, 27].map(v => (
              <Button key={v} size="sm" variant={fitnessChoice === v ? (v === MUTATED_FITNESS ? 'default' : 'destructive') : 'outline'}
                onClick={() => handleFitnessChoice(v)}>
                {v}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Done */}
      {allDone && (
        <div className="rounded-md bg-green-500/10 border border-green-500/30 px-3 py-2 text-sm">
          <strong>Exercise complete!</strong> You've performed crossover and mutation on N-Queens chromosomes,
          matching exactly what the Python lab code does.
        </div>
      )}

      {/* Feedback */}
      {feedback && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-md px-3 py-2 text-sm font-medium flex items-center justify-between gap-3 ${
            feedback.type === 'correct' ? 'bg-green-500/10 text-green-600 dark:text-green-400'
              : 'bg-red-500/10 text-red-600 dark:text-red-400'
          }`}
        >
          <span>{feedback.msg}</span>
          {feedback.type === 'correct' && step <= 4 && (
            <Button
              size="sm"
              onClick={handleContinue}
              className="h-7 text-xs shrink-0"
            >
              Continue
              <ArrowRight className="ml-1 size-3" />
            </Button>
          )}
        </motion.div>
      )}
    </div>
  );
}
