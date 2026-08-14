import { useState, useMemo, useCallback } from 'react';
import { astar } from '@/lib/search';
import { getVacuumSearchNeighbors, isGoal, ALL_STATES, decodeState } from '@/lib/vacuum-search';
import StepChallenge, { type StepDef } from '@/components/StepChallenge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Heuristic for vacuum world: number of dirty rooms
function vacuumH(state: string): number {
  const s = decodeState(state);
  let dirty = 0;
  if (s.roomA === 'D') dirty++;
  if (s.roomB === 'D') dirty++;
  return dirty;
}

// Find goal states
function findGoalState(): string {
  return ALL_STATES.find(isGoal)!;
}

// Run A* from A-D-D to find the expand sequence
function computeTrace(): { state: string; g: number; h: number; f: number }[] {
  const start = 'A-D-D';
  const goal = findGoalState();

  const gen = astar(start, goal, getVacuumSearchNeighbors, vacuumH);
  const trace: { state: string; g: number; h: number; f: number }[] = [];

  for (const step of gen) {
    if (step.type === 'expand' && step.current) {
      const g = step.cost ?? 0;
      const h = vacuumH(step.current);
      trace.push({ state: step.current, g, h, f: g + h });
    }
    if (step.type === 'solution') break;
  }
  return trace;
}

function StateLabel({ state }: { state: string }) {
  const s = decodeState(state);
  return (
    <span className="font-mono text-xs">
      Robot@{s.pos} [A:{s.roomA === 'D' ? 'Dirty' : 'Clean'}, B:{s.roomB === 'D' ? 'Dirty' : 'Clean'}]
    </span>
  );
}

export default function Exercise2VacuumAStar() {
  const trace = useMemo(computeTrace, []);

  const steps: StepDef[] = trace.map((entry, i) => ({
    id: i + 1,
    title: `Step ${i + 1}`,
    content: (onComplete: () => void) => (
      <VacuumStep
        correctState={entry.state}
        correctG={entry.g}
        correctH={entry.h}
        correctF={entry.f}
        previousStates={trace.slice(0, i).map((e) => e.state)}
        onComplete={onComplete}
      />
    ),
  }));

  return (
    <div>
      <p className="text-sm mb-3">
        Trace A* on the vacuum world. Start state: Robot at A, both rooms dirty.
        Heuristic: number of dirty rooms. Actions cost 1 each (Suck, Left, Right).
      </p>
      <div className="rounded border bg-muted/30 p-3 mb-4 text-xs">
        <strong>State space:</strong> 8 states (2 positions * 2 room A states * 2 room B states)
        <br />
        <strong>Goal:</strong> Both rooms clean (any position)
        <br />
        <strong>h(n) =</strong> number of dirty rooms (0, 1, or 2)
      </div>
      <StepChallenge exerciseId="lab3-ex2" steps={steps} />
    </div>
  );
}

function VacuumStep({
  correctState,
  correctG,
  correctH,
  correctF,
  previousStates,
  onComplete,
}: {
  correctState: string;
  correctG: number;
  correctH: number;
  correctF: number;
  previousStates: string[];
  onComplete: () => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const isCorrect = selected === correctState;

  const available = ALL_STATES.filter((s) => !previousStates.includes(s));

  const handleSubmit = useCallback(() => {
    setSubmitted(true);
    if (selected === correctState) {
      setTimeout(onComplete, 400);
    }
  }, [selected, correctState, onComplete]);

  return (
    <div>
      <p className="text-sm mb-2">
        Expanded so far: {previousStates.length > 0 ? previousStates.map((s) => <span key={s} className="font-mono text-xs mr-1">{s}</span>) : 'none'}
      </p>
      <p className="text-sm mb-2">Which state does A* expand next?</p>
      <div className="grid grid-cols-2 gap-1.5 mb-3">
        {available.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => !submitted && setSelected(s)}
            disabled={submitted}
            className={cn(
              'px-2 py-1.5 rounded border text-left transition-colors',
              selected === s && !submitted && 'border-primary bg-primary/10',
              submitted && s === correctState && 'border-green-500 bg-green-500/10',
              submitted && selected === s && s !== correctState && 'border-red-500 bg-red-500/10',
              !submitted && selected !== s && 'hover:bg-muted',
            )}
          >
            <StateLabel state={s} />
          </button>
        ))}
      </div>
      {!submitted ? (
        <Button size="sm" onClick={handleSubmit} disabled={!selected}>
          Check
        </Button>
      ) : (
        <div className={cn(
          'rounded p-2 text-sm',
          isCorrect ? 'bg-green-500/10 text-green-700 dark:text-green-400' : 'bg-red-500/10 text-red-700 dark:text-red-400',
        )}>
          {isCorrect ? (
            <>Correct! f = g + h = {correctG} + {correctH} = {correctF}</>
          ) : (
            <>The correct answer is <strong>{correctState}</strong> (f = {correctG} + {correctH} = {correctF})</>
          )}
        </div>
      )}
    </div>
  );
}
