import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check, ChevronRight, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { M, BlockMath } from '@/components/Math';
import { useLabProgress } from '@/hooks/useLabProgress';

// ---------- Joint Distribution Data ----------

interface JointRow {
  cavity: boolean;
  toothache: boolean;
  catch_: boolean;
  p: number;
}

const JOINT: JointRow[] = [
  { cavity: true,  toothache: true,  catch_: true,  p: 0.108 },
  { cavity: true,  toothache: true,  catch_: false, p: 0.012 },
  { cavity: true,  toothache: false, catch_: true,  p: 0.072 },
  { cavity: true,  toothache: false, catch_: false, p: 0.008 },
  { cavity: false, toothache: true,  catch_: true,  p: 0.016 },
  { cavity: false, toothache: true,  catch_: false, p: 0.064 },
  { cavity: false, toothache: false, catch_: true,  p: 0.144 },
  { cavity: false, toothache: false, catch_: false, p: 0.576 },
];

function boolLabel(val: boolean, name: string) {
  return val ? name : `\u00AC${name}`;
}

// ---------- Question Definitions ----------

type HighlightType = 'numerator' | 'denominator' | 'both';

interface Question {
  id: number;
  prompt: string;
  formula: string;
  answer: number;
  tolerance: number;
  highlights: { index: number; type: HighlightType }[];
  explanation: string;
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    prompt: 'P(toothache)',
    formula: 'P(\\text{toothache}) = \\sum_{c,k} P(c, \\text{toothache}, k)',
    answer: 0.2,
    tolerance: 0.01,
    highlights: [
      { index: 0, type: 'both' },
      { index: 1, type: 'both' },
      { index: 4, type: 'both' },
      { index: 5, type: 'both' },
    ],
    explanation: '0.108 + 0.012 + 0.016 + 0.064 = 0.2',
  },
  {
    id: 2,
    prompt: 'P(cavity)',
    formula: 'P(\\text{cavity}) = \\sum_{t,k} P(\\text{cavity}, t, k)',
    answer: 0.2,
    tolerance: 0.01,
    highlights: [
      { index: 0, type: 'both' },
      { index: 1, type: 'both' },
      { index: 2, type: 'both' },
      { index: 3, type: 'both' },
    ],
    explanation: '0.108 + 0.012 + 0.072 + 0.008 = 0.2',
  },
  {
    id: 3,
    prompt: 'P(toothache \\wedge cavity)',
    formula: 'P(\\text{toothache} \\wedge \\text{cavity}) = \\sum_{k} P(\\text{cavity}, \\text{toothache}, k)',
    answer: 0.12,
    tolerance: 0.01,
    highlights: [
      { index: 0, type: 'both' },
      { index: 1, type: 'both' },
    ],
    explanation: '0.108 + 0.012 = 0.12',
  },
  {
    id: 4,
    prompt: 'P(toothache \\vee cavity)',
    formula: 'P(T \\vee C) = P(T) + P(C) - P(T \\wedge C) = 0.2 + 0.2 - 0.12',
    answer: 0.28,
    tolerance: 0.01,
    highlights: [
      { index: 0, type: 'both' },
      { index: 1, type: 'both' },
      { index: 2, type: 'both' },
      { index: 3, type: 'both' },
      { index: 4, type: 'both' },
      { index: 5, type: 'both' },
    ],
    explanation: 'By inclusion-exclusion: 0.2 + 0.2 - 0.12 = 0.28',
  },
  {
    id: 5,
    prompt: 'P(toothache \\mid cavity)',
    formula: 'P(\\text{toothache} \\mid \\text{cavity}) = \\frac{P(\\text{toothache} \\wedge \\text{cavity})}{P(\\text{cavity})} = \\frac{0.12}{0.2}',
    answer: 0.6,
    tolerance: 0.01,
    highlights: [
      { index: 0, type: 'numerator' },
      { index: 1, type: 'numerator' },
      { index: 2, type: 'denominator' },
      { index: 3, type: 'denominator' },
    ],
    explanation: '0.12 / 0.2 = 0.6',
  },
  {
    id: 6,
    prompt: 'P(cavity \\mid toothache, catch)',
    formula: 'P(\\text{cavity} \\mid \\text{toothache}, \\text{catch}) = \\frac{P(\\text{cavity}, \\text{toothache}, \\text{catch})}{P(\\text{toothache}, \\text{catch})}',
    answer: 0.108 / (0.108 + 0.016),
    tolerance: 0.01,
    highlights: [
      { index: 0, type: 'numerator' },
      { index: 4, type: 'denominator' },
    ],
    explanation: `0.108 / (0.108 + 0.016) = 0.108 / 0.124 = ${(0.108 / 0.124).toFixed(4)}`,
  },
  {
    id: 7,
    prompt: 'P(toothache \\mid cavity, catch)',
    formula: 'P(\\text{toothache} \\mid \\text{cavity}, \\text{catch}) = \\frac{P(\\text{cavity}, \\text{toothache}, \\text{catch})}{P(\\text{cavity}, \\text{catch})}',
    answer: 0.108 / (0.108 + 0.072),
    tolerance: 0.01,
    highlights: [
      { index: 0, type: 'numerator' },
      { index: 2, type: 'denominator' },
    ],
    explanation: `0.108 / (0.108 + 0.072) = 0.108 / 0.18 = 0.6`,
  },
  {
    id: 8,
    prompt: 'Conditional independence check',
    formula: 'P(\\text{toothache} \\mid \\text{cavity}) \\stackrel{?}{=} P(\\text{toothache} \\mid \\text{cavity}, \\text{catch})',
    answer: -1, // special: multiple choice
    tolerance: 0,
    highlights: [],
    explanation: 'Both equal 0.6, so toothache is conditionally independent of catch given cavity.',
  },
];

// ---------- Joint Table Component ----------

function JointTable({
  highlights,
  showHighlights,
}: {
  highlights: { index: number; type: HighlightType }[];
  showHighlights: boolean;
}) {
  const highlightMap = useMemo(() => {
    const map = new Map<number, HighlightType>();
    if (showHighlights) {
      for (const h of highlights) map.set(h.index, h.type);
    }
    return map;
  }, [highlights, showHighlights]);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b-2 border-border">
            <th className="px-3 py-2 text-left font-semibold">Cavity</th>
            <th className="px-3 py-2 text-left font-semibold">Toothache</th>
            <th className="px-3 py-2 text-left font-semibold">Catch</th>
            <th className="px-3 py-2 text-right font-semibold">P</th>
          </tr>
        </thead>
        <tbody>
          {JOINT.map((row, i) => {
            const ht = highlightMap.get(i);
            let bgClass = '';
            if (ht === 'numerator' || ht === 'both') {
              bgClass = 'bg-blue-200/60 dark:bg-blue-800/40';
            } else if (ht === 'denominator') {
              bgClass = 'bg-amber-200/60 dark:bg-amber-800/40';
            }
            return (
              <tr
                key={i}
                className={`border-b border-border transition-colors duration-300 ${bgClass}`}
              >
                <td className="px-3 py-1.5 font-mono text-xs">{boolLabel(row.cavity, 'cavity')}</td>
                <td className="px-3 py-1.5 font-mono text-xs">{boolLabel(row.toothache, 'toothache')}</td>
                <td className="px-3 py-1.5 font-mono text-xs">{boolLabel(row.catch_, 'catch')}</td>
                <td className="px-3 py-1.5 font-mono text-xs text-right font-medium">{row.p.toFixed(3)}</td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-border">
            <td colSpan={3} className="px-3 py-1.5 font-semibold text-xs">Total</td>
            <td className="px-3 py-1.5 font-mono text-xs text-right font-bold">1.000</td>
          </tr>
        </tfoot>
      </table>
      {showHighlights && (
        <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
          {Array.from(highlightMap.values()).some((t) => t === 'numerator') && (
            <span className="flex items-center gap-1">
              <span className="size-3 rounded bg-blue-200/60 dark:bg-blue-800/40 inline-block border border-border" /> Numerator
            </span>
          )}
          {Array.from(highlightMap.values()).some((t) => t === 'denominator') && (
            <span className="flex items-center gap-1">
              <span className="size-3 rounded bg-amber-200/60 dark:bg-amber-800/40 inline-block border border-border" /> Denominator
            </span>
          )}
          {Array.from(highlightMap.values()).some((t) => t === 'both') && !Array.from(highlightMap.values()).some((t) => t === 'numerator') && (
            <span className="flex items-center gap-1">
              <span className="size-3 rounded bg-blue-200/60 dark:bg-blue-800/40 inline-block border border-border" /> Relevant cells
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// ---------- Question Step Component ----------

function QuestionStep({
  question,
  onComplete,
  isComplete,
}: {
  question: Question;
  onComplete: () => void;
  isComplete: boolean;
}) {
  const isQ8 = question.id === 8;
  const [input, setInput] = useState(
    isComplete && !isQ8 ? question.answer.toFixed(4) : '',
  );
  const [mcChoice, setMcChoice] = useState<string | null>(
    isComplete && isQ8 ? 'yes' : null,
  );
  const [checked, setChecked] = useState(false);
  const [correct, setCorrect] = useState(isComplete);
  const [showAnswer, setShowAnswer] = useState(false);

  const handleCheck = useCallback(() => {
    if (isQ8) {
      const isCorrect = mcChoice === 'yes';
      setChecked(true);
      setCorrect(isCorrect);
      if (isCorrect) onComplete();
    } else {
      const val = parseFloat(input);
      const isCorrect = !isNaN(val) && Math.abs(val - question.answer) <= question.tolerance;
      setChecked(true);
      setCorrect(isCorrect);
      if (isCorrect) onComplete();
    }
  }, [input, mcChoice, question, isQ8, onComplete]);

  const handleReveal = useCallback(() => {
    setShowAnswer(true);
    setCorrect(true);
    onComplete();
  }, [onComplete]);

  return (
    <div className="space-y-4">
      {/* Question prompt */}
      <div className="text-sm font-medium">
        Compute: <M>{question.prompt}</M>
      </div>

      {/* Table with highlights */}
      <div className="rounded-lg border p-3">
        <JointTable highlights={question.highlights} showHighlights />
      </div>

      {/* Formula */}
      <div className="rounded-lg bg-muted/30 border p-3">
        <BlockMath>{question.formula}</BlockMath>
      </div>

      {/* Input area */}
      {isQ8 ? (
        <div>
          <p className="text-sm text-muted-foreground mb-3">
            From Q5: <M>{'P(\\text{toothache} \\mid \\text{cavity}) = 0.6'}</M>.
            From Q7: <M>{'P(\\text{toothache} \\mid \\text{cavity}, \\text{catch}) = 0.6'}</M>.
            <br />
            Is <M>{'\\text{toothache}'}</M> conditionally independent of <M>{'\\text{catch}'}</M> given <M>{'\\text{cavity}'}</M>?
          </p>
          <div className="flex gap-3">
            {(['yes', 'no'] as const).map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => { setMcChoice(opt); setChecked(false); }}
                disabled={correct || showAnswer}
                className={`px-4 py-2 rounded-md border text-sm font-medium transition-all ${
                  mcChoice === opt
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-muted-foreground hover:border-primary/50'
                }`}
              >
                {opt === 'yes' ? 'Yes, independent' : 'No, dependent'}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium">Answer:</label>
          <input
            type="text"
            value={input}
            onChange={(e) => { setInput(e.target.value); setChecked(false); }}
            placeholder="e.g. 0.2"
            disabled={correct || showAnswer}
            className="w-28 rounded-md border border-border bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
      )}

      {/* Action buttons */}
      {!correct && !showAnswer && (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            className="h-8 text-xs"
            onClick={handleCheck}
            disabled={isQ8 ? !mcChoice : !input}
          >
            Check
          </Button>
          <Button size="sm" variant="ghost" className="h-8 text-xs gap-1" onClick={handleReveal}>
            <Eye className="size-3" /> Show Answer
          </Button>
        </div>
      )}

      {/* Feedback */}
      {checked && !correct && !showAnswer && (
        <p className="text-sm text-red-500">
          Not quite. Look at the highlighted cells in the table and apply the formula. (tolerance: +/-{question.tolerance})
        </p>
      )}

      {(correct || showAnswer) && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg bg-green-500/10 px-4 py-3 text-sm text-green-700 dark:text-green-300"
        >
          <Check className="size-4 inline mr-1" />
          {isQ8 ? (
            <span>
              <strong>Yes!</strong> Both values equal 0.6, confirming that toothache is conditionally independent of catch given cavity.
            </span>
          ) : (
            <span>
              <strong><M>{question.prompt}</M> = {question.answer.toFixed(4)}</strong>
              <span className="text-muted-foreground ml-2">({question.explanation})</span>
            </span>
          )}
        </motion.div>
      )}
    </div>
  );
}

// ---------- Main Component ----------

export default function Exercise3JointTable() {
  const { isStepComplete, markStepComplete } = useLabProgress('lab7-ex3', QUESTIONS.length);
  const [active, setActive] = useState(() => {
    for (let i = 0; i < QUESTIONS.length; i++) {
      if (!isStepComplete(i + 1)) return i;
    }
    return QUESTIONS.length - 1;
  });

  const markComplete = useCallback(
    (idx: number) => markStepComplete(idx + 1),
    [markStepComplete],
  );

  const completed = QUESTIONS.map((_, i) => isStepComplete(i + 1));
  const allDone = completed.every(Boolean);
  const q = QUESTIONS[active];
  const hasNext = active < QUESTIONS.length - 1;

  return (
    <div>
      {/* Compact step indicator */}
      <div className="flex flex-wrap items-center gap-1 mb-5">
        {QUESTIONS.map((question, i) => (
          <div key={question.id} className="flex items-center gap-1">
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
              <span>Q{question.id}</span>
            </button>
          </div>
        ))}
      </div>

      <h4 className="text-sm font-semibold text-muted-foreground mb-3">
        Question {q.id} of 8
      </h4>

      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
        >
          <QuestionStep
            key={active}
            question={q}
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
            Continue to Q{QUESTIONS[active + 1].id}
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
          All 8 questions completed! You've practiced marginal, joint, conditional probabilities,
          and tested for conditional independence using a full joint distribution table.
        </motion.div>
      )}
    </div>
  );
}
