import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useLabProgress } from '@/hooks/useLabProgress';

const INDIVIDUALS = [
  { id: 'A', fitness: 10, color: 'rgb(59,130,246)' },
  { id: 'B', fitness: 25, color: 'rgb(168,85,247)' },
  { id: 'C', fitness: 15, color: 'rgb(34,197,94)' },
  { id: 'D', fitness: 30, color: 'rgb(249,115,22)' },
  { id: 'E', fitness: 20, color: 'rgb(236,72,153)' },
];

const TOTAL_FITNESS = INDIVIDUALS.reduce((s, ind) => s + ind.fitness, 0);

// Pre-determined random values for each step
const RANDOM_VALUES = [0.08, 0.42, 0.63, 0.91];

// Which individual does each value select?
function getCorrectIndex(val: number): number {
  let acc = 0;
  for (let i = 0; i < INDIVIDUALS.length; i++) {
    acc += INDIVIDUALS[i].fitness / TOTAL_FITNESS;
    if (val < acc) return i;
  }
  return INDIVIDUALS.length - 1;
}

// Pre-compute so summary survives page reload
const SELECTIONS = RANDOM_VALUES.map(v => INDIVIDUALS[getCorrectIndex(v)].id);

export default function Exercise1RouletteSelection() {
  const { markStepComplete, isStepComplete } = useLabProgress('lab4-ex1', 4);
  const [currentStep, setCurrentStep] = useState(() => {
    for (let i = 1; i <= 4; i++) {
      if (!isStepComplete(i)) return i;
    }
    return 5; // all done
  });
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'wrong'; msg: string } | null>(null);

  const allDone = currentStep > 4;
  const randomVal = allDone ? 0 : RANDOM_VALUES[currentStep - 1];
  const correctIdx = allDone ? -1 : getCorrectIndex(randomVal);

  const handleSegmentClick = useCallback((idx: number) => {
    if (allDone) return;
    if (idx === correctIdx) {
      setFeedback({ type: 'correct', msg: `Correct! ${INDIVIDUALS[idx].id} (fitness ${INDIVIDUALS[idx].fitness}) is selected.` });
      markStepComplete(currentStep);
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        setFeedback(null);
      }, 1200);
    } else {
      setFeedback({ type: 'wrong', msg: `Not quite. Think about where ${(randomVal * 100).toFixed(0)}% falls on the wheel.` });
      setTimeout(() => setFeedback(null), 1500);
    }
  }, [allDone, correctIdx, currentStep, markStepComplete, randomVal]);

  // Compute segment positions (as fractions of total bar width)
  const segments: { left: number; width: number }[] = [];
  let acc = 0;
  for (const ind of INDIVIDUALS) {
    const w = ind.fitness / TOTAL_FITNESS;
    segments.push({ left: acc, width: w });
    acc += w;
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Click the correct segment on the fitness-proportionate bar for each random value.
        Higher fitness = larger segment = higher selection probability.
      </p>

      {/* Fitness bar */}
      <div className="relative w-full h-12 rounded-lg overflow-hidden border">
        {INDIVIDUALS.map((ind, i) => (
          <button
            key={ind.id}
            type="button"
            onClick={() => handleSegmentClick(i)}
            disabled={allDone}
            className="absolute top-0 h-full flex items-center justify-center text-xs font-bold text-white transition-opacity hover:opacity-80 disabled:cursor-default"
            style={{
              left: `${segments[i].left * 100}%`,
              width: `${segments[i].width * 100}%`,
              backgroundColor: ind.color,
            }}
          >
            {ind.id} ({ind.fitness})
          </button>
        ))}
      </div>

      {/* Scale */}
      <div className="relative w-full h-4">
        {[0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0].map(v => (
          <span key={v} className="absolute text-[9px] text-muted-foreground -translate-x-1/2"
            style={{ left: `${v * 100}%` }}>
            {v.toFixed(1)}
          </span>
        ))}
        {/* Pointer for current random value */}
        {!allDone && (
          <div className="absolute top-0 -translate-x-1/2" style={{ left: `${randomVal * 100}%` }}>
            <div className="w-0.5 h-3 bg-red-500 mx-auto" />
            <div className="text-[10px] font-bold text-red-500 -translate-x-1/2">
              {randomVal.toFixed(2)}
            </div>
          </div>
        )}
      </div>

      {/* Current task */}
      {!allDone && (
        <div className="rounded-md bg-muted px-3 py-2 text-sm">
          <strong>Step {currentStep}/4:</strong> Random value = <code className="font-bold text-red-500">{randomVal.toFixed(2)}</code>.
          Click the segment where this value falls.
        </div>
      )}

      {/* Feedback */}
      {feedback && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-md px-3 py-2 text-sm font-medium ${
            feedback.type === 'correct' ? 'bg-green-500/10 text-green-600 dark:text-green-400'
              : 'bg-red-500/10 text-red-600 dark:text-red-400'
          }`}
        >
          {feedback.msg}
        </motion.div>
      )}

      {/* Summary */}
      {allDone && (
        <div className="rounded-md bg-green-500/10 border border-green-500/30 px-3 py-2 text-sm">
          <strong>All done!</strong> Selected: {SELECTIONS.join(', ')}.
          Notice how D (fitness 30) has the largest segment — higher fitness means higher selection probability.
        </div>
      )}

      {/* Legend table */}
      <div className="overflow-x-auto">
        <table className="text-xs w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-1 pr-3">Individual</th>
              <th className="text-right py-1 pr-3">Fitness</th>
              <th className="text-right py-1 pr-3">P(select)</th>
              <th className="text-right py-1">Cumulative</th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              let cumul = 0;
              return INDIVIDUALS.map(ind => {
                const p = ind.fitness / TOTAL_FITNESS;
                cumul += p;
                return (
                  <tr key={ind.id} className="border-b border-border/40">
                    <td className="py-1 pr-3 font-semibold" style={{ color: ind.color }}>{ind.id}</td>
                    <td className="text-right py-1 pr-3">{ind.fitness}</td>
                    <td className="text-right py-1 pr-3">{(p * 100).toFixed(0)}%</td>
                    <td className="text-right py-1">{cumul.toFixed(2)}</td>
                  </tr>
                );
              });
            })()}
          </tbody>
        </table>
      </div>
    </div>
  );
}
