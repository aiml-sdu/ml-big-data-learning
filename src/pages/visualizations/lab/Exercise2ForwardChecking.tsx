import { useMemo, useState } from 'react';
import StepChallenge, { type StepDef } from '@/components/StepChallenge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  createAustraliaMapCSP,
  type AustraliaColor,
  type AustraliaVariable,
  type DomainMap,
} from '@/lib/csp';
import { AustraliaConstraintGraph, domainLabel } from '../CSPShared';

type AustraliaAssignment = Partial<Record<AustraliaVariable, AustraliaColor>>;

function deriveDomains(assignment: AustraliaAssignment): DomainMap<AustraliaColor> {
  const problem = createAustraliaMapCSP();
  const domains: DomainMap<AustraliaColor> = {
    WA: ['red', 'green', 'blue'],
    NT: ['red', 'green', 'blue'],
    SA: ['red', 'green', 'blue'],
    Q: ['red', 'green', 'blue'],
    NSW: ['red', 'green', 'blue'],
    V: ['red', 'green', 'blue'],
    T: ['red', 'green', 'blue'],
  };

  for (const [variable, value] of Object.entries(assignment) as [AustraliaVariable, AustraliaColor][]) {
    domains[variable] = [value];
    for (const neighbor of problem.neighbors[variable] as AustraliaVariable[]) {
      if (assignment[neighbor]) continue;
      domains[neighbor] = domains[neighbor].filter((candidate) => candidate !== value);
    }
  }
  return domains;
}

function FCStep({
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
  const domains = useMemo(() => deriveDomains(assignment), [assignment]);
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const selectedChoice = choices.find((choice) => choice.label === selected);
  const correct = !!selectedChoice?.correct;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <AustraliaConstraintGraph
          assignment={assignment}
          problem={problem}
          domains={domains}
          activeRegion={activeRegion}
        />
        <div className="rounded-xl border bg-card p-4 text-sm">
          <div className="font-semibold">Domains after pruning</div>
          <div className="mt-3 space-y-2">
            {(Object.entries(domains) as [AustraliaVariable, AustraliaColor[]][])
              .map(([variable, values]) => (
                <div key={variable} className="flex items-center justify-between gap-3">
                  <span className="font-medium">{variable}</span>
                  <span className={values.length === 0 ? 'font-semibold text-red-600 dark:text-red-300' : 'text-muted-foreground'}>
                    {domainLabel(values)}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>

      <p className="text-sm">{prompt}</p>
      <div className="flex flex-wrap gap-2">
        {choices.map((choice) => (
          <button
            key={choice.label}
            type="button"
            onClick={() => !submitted && setSelected(choice.label)}
            disabled={submitted}
            className={cn(
              'rounded-full border px-3 py-1.5 text-sm transition-colors',
              selected === choice.label && !submitted && 'border-primary bg-primary/10',
              submitted && choice.correct && 'border-green-500 bg-green-500/10',
              submitted && selected === choice.label && !choice.correct && 'border-red-500 bg-red-500/10',
              !submitted && selected !== choice.label && 'hover:bg-muted',
            )}
          >
            {choice.label}
          </button>
        ))}
      </div>
      {!submitted ? (
        <Button
          size="sm"
          onClick={() => {
            if (!selected) return;
            setSubmitted(true);
            if (correct) setTimeout(onComplete, 500);
          }}
          disabled={!selected}
        >
          Check
        </Button>
      ) : (
        <div className="space-y-2">
          <div className={cn(
            'rounded-lg px-3 py-2 text-sm',
            correct ? 'bg-green-500/10 text-green-700 dark:text-green-300' : 'bg-red-500/10 text-red-700 dark:text-red-300',
          )}>
            {selectedChoice?.explanation}
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

export default function Exercise2ForwardChecking() {
  const steps: StepDef[] = [
    {
      id: 1,
      title: 'Find the empty domain',
      content: (onComplete) => (
        <FCStep
          prompt="Suppose WA = red, NT = green, and Q = blue. Which variable now has an empty domain under forward checking?"
          assignment={{ WA: 'red', NT: 'green', Q: 'blue' }}
          activeRegion="SA"
          choices={[
            { label: 'SA', correct: true, explanation: 'Correct. SA touches WA, NT, and Q, so red, green, and blue are all removed.' },
            { label: 'NSW', correct: false, explanation: 'NSW still has legal values available.' },
            { label: 'T', correct: false, explanation: 'Tasmania has no mainland neighbors, so its domain is untouched.' },
          ]}
          onComplete={onComplete}
        />
      ),
    },
    {
      id: 2,
      title: 'Pick the smarter algorithm',
      content: (onComplete) => (
        <FCStep
          prompt="Which method notices this contradiction first?"
          assignment={{ WA: 'red', NT: 'green', Q: 'blue' }}
          activeRegion="SA"
          choices={[
            { label: 'Forward checking', correct: true, explanation: 'Correct. It notices the empty SA domain immediately after assigning Q = blue.' },
            { label: 'Plain backtracking', correct: false, explanation: 'Plain backtracking keeps extending the branch until SA is selected.' },
            { label: 'Both at the same time', correct: false, explanation: 'Forward checking gets the warning earlier.' },
          ]}
          onComplete={onComplete}
        />
      ),
    },
    {
      id: 3,
      title: 'Explain the benefit',
      content: (onComplete) => (
        <FCStep
          prompt="What is the main payoff of forward checking on this branch?"
          assignment={{ WA: 'red', NT: 'green', Q: 'blue' }}
          activeRegion="SA"
          choices={[
            { label: 'It avoids wasted deeper search', correct: true, explanation: 'Correct. The solver backtracks before exploring NSW, V, and other pointless continuations.' },
            { label: 'It guarantees no backtracking', correct: false, explanation: 'Forward checking reduces backtracking, but it does not eliminate it in general.' },
            { label: 'It adds more colors to the problem', correct: false, explanation: 'Forward checking changes domains, not the number of colors.' },
          ]}
          onComplete={onComplete}
        />
      ),
    },
  ];

  return (
    <div>
      <p className="mb-3 text-sm text-muted-foreground">
        Compare plain backtracking with the domain-pruning version you will implement in Lab 6.
      </p>
      <StepChallenge exerciseId="lab6-ex2" steps={steps} />
    </div>
  );
}
