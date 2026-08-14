import { useState, useCallback } from 'react';
import StepChallenge, { type StepDef } from '@/components/StepChallenge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import CalloutBox from '@/components/CalloutBox';

// Step 1: Identify which heuristics are admissible for 8-puzzle
// Step 2: Determine dominance relationships
// Step 3: Design a heuristic via relaxation

function Step1({ onComplete }: { onComplete: () => void }) {
  const heuristics = [
    { id: 'h0', label: 'h(n) = 0', admissible: true, explanation: 'Always 0, trivially admissible (it never overestimates). Equivalent to UCS.' },
    { id: 'h1', label: 'h1: Misplaced tiles', admissible: true, explanation: 'Each misplaced tile needs at least 1 move. Never overestimates.' },
    { id: 'h2', label: 'h2: Manhattan distance', admissible: true, explanation: 'Each tile needs at least its Manhattan distance in moves. Never overestimates.' },
    { id: 'h3', label: 'h(n) = 8 for all n', admissible: false, explanation: 'A state 1 move from the goal has h*(n)=1, but h(n)=8. Overestimates!' },
    { id: 'h4', label: 'max(h1, h2)', admissible: true, explanation: 'The max of two admissible heuristics is still admissible and more informed.' },
  ];

  const [answers, setAnswers] = useState<Record<string, boolean | null>>({});
  const [submitted, setSubmitted] = useState(false);

  const toggle = (id: string) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [id]: prev[id] === true ? false : true }));
  };

  const handleSubmit = useCallback(() => {
    setSubmitted(true);
    const allCorrect = heuristics.every((h) => (answers[h.id] ?? false) === h.admissible);
    if (allCorrect) setTimeout(onComplete, 600);
  }, [answers, onComplete]);

  const score = submitted
    ? heuristics.filter((h) => (answers[h.id] ?? false) === h.admissible).length
    : 0;

  return (
    <div>
      <p className="text-sm mb-3">
        Which of these heuristics are <strong>admissible</strong> for the 8-puzzle?
        Toggle each one.
      </p>
      <div className="space-y-2 mb-3">
        {heuristics.map((h) => {
          const answer = answers[h.id];
          const correct = submitted && (answer ?? false) === h.admissible;
          const wrong = submitted && (answer ?? false) !== h.admissible;

          return (
            <div key={h.id}>
              <button
                type="button"
                onClick={() => toggle(h.id)}
                disabled={submitted}
                className={cn(
                  'w-full text-left px-3 py-2 rounded border text-sm transition-colors',
                  answer && !submitted && 'border-green-500 bg-green-500/10',
                  answer === false && !submitted && 'border-red-500 bg-red-500/10',
                  correct && 'border-green-500 bg-green-500/10',
                  wrong && 'border-red-500 bg-red-500/10',
                  !answer && !submitted && 'hover:bg-muted',
                )}
              >
                <span className="font-mono">{h.label}</span>
                {answer === true && <span className="ml-2 text-green-600">Admissible</span>}
                {answer === false && <span className="ml-2 text-red-600">Not admissible</span>}
              </button>
              {submitted && (
                <p className="text-xs text-muted-foreground mt-1 ml-3">{h.explanation}</p>
              )}
            </div>
          );
        })}
      </div>
      {!submitted ? (
        <Button size="sm" onClick={handleSubmit}>Check</Button>
      ) : (
        <div className="text-sm font-medium">
          Score: {score}/{heuristics.length}
          {score === heuristics.length && (
            <span className="ml-2 text-green-600">Perfect!</span>
          )}
        </div>
      )}
    </div>
  );
}

function Step2({ onComplete }: { onComplete: () => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const correct = 'h2';

  const options = [
    { id: 'h0', label: 'h(n) = 0 dominates all' },
    { id: 'h1', label: 'h1 (misplaced) dominates h2 (Manhattan)' },
    { id: 'h2', label: 'h2 (Manhattan) dominates h1 (misplaced)' },
    { id: 'none', label: 'Neither dominates the other' },
  ];

  const handleSubmit = useCallback(() => {
    setSubmitted(true);
    if (selected === correct) setTimeout(onComplete, 400);
  }, [selected, onComplete]);

  return (
    <div>
      <p className="text-sm mb-3">
        What is the dominance relationship between h1 (misplaced tiles) and h2 (Manhattan distance)?
      </p>
      <div className="space-y-1.5 mb-3">
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => !submitted && setSelected(o.id)}
            disabled={submitted}
            className={cn(
              'w-full text-left px-3 py-2 rounded border text-sm transition-colors',
              selected === o.id && !submitted && 'border-primary bg-primary/10',
              submitted && o.id === correct && 'border-green-500 bg-green-500/10',
              submitted && selected === o.id && o.id !== correct && 'border-red-500 bg-red-500/10',
              !submitted && selected !== o.id && 'hover:bg-muted',
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
      {!submitted ? (
        <Button size="sm" onClick={handleSubmit} disabled={!selected}>Check</Button>
      ) : (
        <div className={cn(
          'rounded p-2 text-sm',
          selected === correct ? 'bg-green-500/10 text-green-700 dark:text-green-400' : 'bg-red-500/10 text-red-700 dark:text-red-400',
        )}>
          {selected === correct
            ? 'Correct! Manhattan distance is always >= misplaced tiles for every state.'
            : 'h2 dominates h1: for every state, h2(n) >= h1(n), and both are admissible.'}
        </div>
      )}
    </div>
  );
}

function Step3({ onComplete }: { onComplete: () => void }) {
  const [answered, setAnswered] = useState(false);

  return (
    <div>
      <CalloutBox type="key-idea" title="Relaxation Technique">
        <p>
          To design an admissible heuristic, <strong>relax</strong> the problem constraints.
          The optimal solution to the relaxed problem is an admissible heuristic for the original.
        </p>
      </CalloutBox>
      <p className="text-sm mb-3">
        Consider the <strong>15-puzzle</strong> (4x4 grid with 15 tiles). Design a heuristic
        by relaxation: if tiles could move to any adjacent square <em>even if occupied</em>,
        what's the cost of the relaxed solution?
      </p>
      <div className="space-y-1.5 mb-3">
        {[
          { id: 'a', label: 'Number of tiles not in goal position', correct: false },
          { id: 'b', label: 'Sum of Manhattan distances', correct: true },
          { id: 'c', label: 'Number of tiles * 15', correct: false },
        ].map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => {
              if (!answered) {
                setAnswered(true);
                if (o.correct) setTimeout(onComplete, 400);
              }
            }}
            disabled={answered}
            className={cn(
              'w-full text-left px-3 py-2 rounded border text-sm transition-colors',
              answered && o.correct && 'border-green-500 bg-green-500/10',
              !answered && 'hover:bg-muted',
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
      {answered && (
        <div className="text-sm text-green-700 dark:text-green-400 bg-green-500/10 rounded p-2">
          Manhattan distance! When tiles can move through each other, each tile needs exactly
          its Manhattan distance in moves. This relaxation gives h2 for the 8-puzzle and
          extends naturally to the 15-puzzle.
        </div>
      )}
    </div>
  );
}

export default function Exercise3HeuristicDesign() {
  const steps: StepDef[] = [
    { id: 1, title: 'Identify admissible heuristics', content: (onComplete) => <Step1 onComplete={onComplete} /> },
    { id: 2, title: 'Dominance relationships', content: (onComplete) => <Step2 onComplete={onComplete} /> },
    { id: 3, title: 'Design via relaxation', content: (onComplete) => <Step3 onComplete={onComplete} /> },
  ];

  return (
    <div>
      <p className="text-sm mb-3">
        Practice designing and evaluating heuristics.
      </p>
      <StepChallenge exerciseId="lab3-ex3" steps={steps} />
    </div>
  );
}
