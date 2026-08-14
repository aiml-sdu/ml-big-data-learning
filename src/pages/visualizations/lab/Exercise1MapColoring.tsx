import { useMemo, useState } from 'react';
import StepChallenge, { type StepDef } from '@/components/StepChallenge';
import { createAustraliaMapCSP, type AustraliaColor, type AustraliaVariable } from '@/lib/csp';
import { AustraliaConstraintGraph, AustraliaMapBoard } from '../CSPShared';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type AustraliaAssignment = Partial<Record<AustraliaVariable, AustraliaColor>>;

function MultipleChoiceStep({
  prompt,
  assignment,
  activeRegion,
  choices,
  onComplete,
}: {
  prompt: string;
  assignment: AustraliaAssignment;
  activeRegion: AustraliaVariable;
  choices: { label: string; correct: boolean; explanation: string }[];
  onComplete: () => void;
}) {
  const problem = useMemo(() => createAustraliaMapCSP(), []);
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const choice = choices.find((item) => item.label === selected);
  const correct = !!choice?.correct;

  const handleSubmit = () => {
    if (!selected) return;
    setSubmitted(true);
    if (correct) {
      setTimeout(onComplete, 500);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <AustraliaMapBoard
          assignment={assignment}
          activeRegion={activeRegion}
          highlightRegions={problem.neighbors[activeRegion] as AustraliaVariable[]}
        />
        <AustraliaConstraintGraph
          assignment={assignment}
          problem={problem}
          activeRegion={activeRegion}
        />
      </div>

      <p className="text-sm">{prompt}</p>
      <div className="flex flex-wrap gap-2">
        {choices.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => !submitted && setSelected(item.label)}
            disabled={submitted}
            className={cn(
              'rounded-full border px-3 py-1.5 text-sm transition-colors',
              selected === item.label && !submitted && 'border-primary bg-primary/10',
              submitted && item.correct && 'border-green-500 bg-green-500/10',
              submitted && selected === item.label && !item.correct && 'border-red-500 bg-red-500/10',
              !submitted && selected !== item.label && 'hover:bg-muted',
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
      {!submitted ? (
        <Button size="sm" onClick={handleSubmit} disabled={!selected}>
          Check
        </Button>
      ) : (
        <div className="space-y-2">
          <div className={cn(
            'rounded-lg px-3 py-2 text-sm',
            correct ? 'bg-green-500/10 text-green-700 dark:text-green-300' : 'bg-red-500/10 text-red-700 dark:text-red-300',
          )}>
            {choice?.explanation}
          </div>
          {!correct && (
            <Button size="sm" variant="outline" onClick={() => { setSelected(null); setSubmitted(false); }}>
              Try again
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default function Exercise1MapColoring() {
  const steps: StepDef[] = [
    {
      id: 1,
      title: 'Choose the next variable',
      content: (onComplete) => (
        <MultipleChoiceStep
          prompt="Current branch: WA = red, NT = green, Q = blue, V = green. Which variable is next in the order NSW → SA → T?"
          assignment={{ WA: 'red', NT: 'green', Q: 'blue', V: 'green' }}
          activeRegion="NSW"
          choices={[
            { label: 'NSW', correct: true, explanation: 'Correct. NSW is the next variable in this fixed ordering.' },
            { label: 'SA', correct: false, explanation: 'SA comes later. The solver extends the current branch with NSW first.' },
            { label: 'T', correct: false, explanation: 'Tasmania is last in this ordering.' },
          ]}
          onComplete={onComplete}
        />
      ),
    },
    {
      id: 2,
      title: 'Pick a legal value',
      content: (onComplete) => (
        <MultipleChoiceStep
          prompt="With Q = blue and V = green, which color is legal for NSW?"
          assignment={{ WA: 'red', NT: 'green', Q: 'blue', V: 'green' }}
          activeRegion="NSW"
          choices={[
            { label: 'Red', correct: true, explanation: 'Correct. Green conflicts with V, blue conflicts with Q, so red is the only legal value.' },
            { label: 'Green', correct: false, explanation: 'Green would conflict with V = green.' },
            { label: 'Blue', correct: false, explanation: 'Blue would conflict with Q = blue.' },
          ]}
          onComplete={onComplete}
        />
      ),
    },
    {
      id: 3,
      title: 'Spot the dead-end',
      content: (onComplete) => (
        <MultipleChoiceStep
          prompt="After NSW = red is assigned, what happens when the solver tries SA?"
          assignment={{ WA: 'red', NT: 'green', Q: 'blue', NSW: 'red', V: 'green' }}
          activeRegion="SA"
          choices={[
            { label: 'No legal color', correct: true, explanation: 'Correct. SA touches red, green, and blue neighbors, so its domain is empty.' },
            { label: 'SA must be blue', correct: false, explanation: 'Blue is blocked by Q = blue.' },
            { label: 'Continue to T', correct: false, explanation: 'The branch already fails at SA, so the solver backtracks before touching T.' },
          ]}
          onComplete={onComplete}
        />
      ),
    },
    {
      id: 4,
      title: 'Backtrack correctly',
      content: (onComplete) => (
        <MultipleChoiceStep
          prompt="SA failed. Which earlier choice does depth-first backtracking revisit first?"
          assignment={{ WA: 'red', NT: 'green', Q: 'blue', NSW: 'red', V: 'green' }}
          activeRegion="NSW"
          choices={[
            { label: 'NSW', correct: true, explanation: 'Correct. Backtracking returns to the most recent decision point first.' },
            { label: 'WA', correct: false, explanation: 'Backtracking does not jump all the way back to the root.' },
            { label: 'Add a new color', correct: false, explanation: 'The solver changes assignments, not the CSP itself.' },
          ]}
          onComplete={onComplete}
        />
      ),
    },
  ];

  return (
    <div>
      <p className="mb-3 text-sm text-muted-foreground">
        Follow the same Australia map-coloring logic you will implement in Lab 6.
      </p>
      <StepChallenge exerciseId="lab6-ex1" steps={steps} />
    </div>
  );
}
