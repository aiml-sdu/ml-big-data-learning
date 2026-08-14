import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { createAustraliaMapCSP, type AustraliaColor, type AustraliaVariable } from '@/lib/csp';
import { AustraliaConstraintGraph, AustraliaMapBoard } from './CSPShared';

type AustraliaAssignment = Partial<Record<AustraliaVariable, AustraliaColor>>;

interface StageDef {
  id: number;
  prompt: string;
  assignment: AustraliaAssignment;
  activeRegion: AustraliaVariable | null;
  choices: { label: string; correct: boolean; feedback: string }[];
  successTitle: string;
}

const STAGES: StageDef[] = [
  {
    id: 1,
    prompt: 'We already assigned WA = red, NT = green, Q = blue, and V = green. Which variable comes next in the fixed order NSW → SA → T?',
    assignment: { WA: 'red', NT: 'green', Q: 'blue', V: 'green' },
    activeRegion: 'NSW',
    successTitle: 'Correct: NSW is the next unassigned variable.',
    choices: [
      { label: 'NSW', correct: true, feedback: 'NSW is next. Backtracking search extends the current partial assignment one variable at a time.' },
      { label: 'SA', correct: false, feedback: 'Not yet. SA comes after NSW in this trace.' },
      { label: 'T', correct: false, feedback: 'Tasmania is still later in the order.' },
    ],
  },
  {
    id: 2,
    prompt: 'Which color can NSW legally take right now?',
    assignment: { WA: 'red', NT: 'green', Q: 'blue', V: 'green' },
    activeRegion: 'NSW',
    successTitle: 'Correct: NSW must be red.',
    choices: [
      { label: 'Red', correct: true, feedback: 'Blue conflicts with Q, green conflicts with V, so red is the only consistent value.' },
      { label: 'Green', correct: false, feedback: 'Green would conflict with V.' },
      { label: 'Blue', correct: false, feedback: 'Blue would conflict with Q.' },
    ],
  },
  {
    id: 3,
    prompt: 'After assigning NSW = red, what happens when the solver reaches SA?',
    assignment: { WA: 'red', NT: 'green', Q: 'blue', NSW: 'red', V: 'green' },
    activeRegion: 'SA',
    successTitle: 'Correct: SA has no legal color left.',
    choices: [
      { label: 'SA has no legal color', correct: true, feedback: 'SA touches red neighbors (WA, NSW), a green neighbor (NT, V), and a blue neighbor (Q). Every color is blocked.' },
      { label: 'SA must be blue', correct: false, feedback: 'Blue is blocked by Q = blue.' },
      { label: 'Continue to Tasmania first', correct: false, feedback: 'The dead-end is discovered as soon as we try to color SA.' },
    ],
  },
  {
    id: 4,
    prompt: 'SA failed. Which earlier decision should the solver revisit first?',
    assignment: { WA: 'red', NT: 'green', Q: 'blue', NSW: 'red', V: 'green' },
    activeRegion: 'NSW',
    successTitle: 'Correct: backtrack to NSW first.',
    choices: [
      { label: 'Backtrack to NSW', correct: true, feedback: 'Backtracking undoes the most recent decision first. NSW was assigned after V and Q.' },
      { label: 'Backtrack to WA', correct: false, feedback: 'That skips over more recent choices. Depth-first backtracking returns to the latest decision point.' },
      { label: 'Add a fourth color', correct: false, feedback: 'The solver changes assignments, not the problem definition.' },
    ],
  },
  {
    id: 5,
    prompt: 'NSW has no second legal color. What should the solver do next?',
    assignment: { WA: 'red', NT: 'green', Q: 'blue', V: 'green' },
    activeRegion: 'V',
    successTitle: 'Correct: backtrack again to V, then eventually to Q.',
    choices: [
      { label: 'Backtrack to V', correct: true, feedback: 'Once NSW is exhausted, the solver keeps unwinding until it finds a variable with an untried value.' },
      { label: 'Restart from scratch', correct: false, feedback: 'Backtracking is systematic. It does not throw away all progress at once.' },
      { label: 'Keep SA uncolored', correct: false, feedback: 'A solution requires every variable to be assigned.' },
    ],
  },
];

export default function BacktrackingCSPGame() {
  const problem = useMemo(() => createAustraliaMapCSP(), []);
  const [stageIndex, setStageIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const stage = STAGES[stageIndex];
  const done = stageIndex === STAGES.length - 1 && submitted && stage.choices.find((choice) => choice.label === selected)?.correct;
  const selectedChoice = stage.choices.find((choice) => choice.label === selected);
  const correct = !!selectedChoice?.correct;

  const handleSubmit = () => {
    if (!selected) return;
    setSubmitted(true);
  };

  const handleNext = () => {
    setSubmitted(false);
    setSelected(null);
    setStageIndex((prev) => Math.min(prev + 1, STAGES.length - 1));
  };

  const handleReset = () => {
    setStageIndex(0);
    setSelected(null);
    setSubmitted(false);
  };

  return (
    <div className="my-6 rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold">Guided backtracking trace</h3>
          <p className="text-sm text-muted-foreground">
            Follow a doomed branch on the Australia map and predict the solver&rsquo;s next move.
          </p>
        </div>
        <div className="rounded-full border px-3 py-1 text-xs font-medium">
          Step {stage.id} / {STAGES.length}
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <AustraliaMapBoard
          assignment={stage.assignment}
          activeRegion={stage.activeRegion}
          highlightRegions={stage.activeRegion ? problem.neighbors[stage.activeRegion] as AustraliaVariable[] : []}
        />
        <AustraliaConstraintGraph
          assignment={stage.assignment}
          problem={problem}
          activeRegion={stage.activeRegion}
        />
      </div>

      <div className="mt-4 rounded-xl border bg-muted/30 p-4">
        <p className="font-medium">{stage.prompt}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {stage.choices.map((choice) => (
            <button
              key={choice.label}
              type="button"
              onClick={() => !submitted && setSelected(choice.label)}
              className={`rounded-full border px-3 py-2 text-sm transition-colors ${
                selected === choice.label
                  ? 'border-primary bg-primary/10'
                  : 'hover:bg-card'
              } ${
                submitted && choice.correct ? 'border-green-500 bg-green-500/10' : ''
              } ${
                submitted && selected === choice.label && !choice.correct ? 'border-red-500 bg-red-500/10' : ''
              }`}
              disabled={submitted}
            >
              {choice.label}
            </button>
          ))}
        </div>

        {!submitted ? (
          <div className="mt-4 flex gap-2">
            <Button size="sm" onClick={handleSubmit} disabled={!selected}>
              Check
            </Button>
            <Button size="sm" variant="outline" onClick={handleReset}>
              Reset trace
            </Button>
          </div>
        ) : (
          <div className="mt-4 space-y-2">
            <div className={`rounded-lg border px-4 py-3 text-sm ${correct ? 'border-green-500 bg-green-500/10' : 'border-red-500 bg-red-500/10'}`}>
              <div className="font-semibold">{correct ? stage.successTitle : 'Not quite.'}</div>
              <p className="mt-1">{selectedChoice?.feedback}</p>
            </div>
            {!correct && (
              <Button size="sm" variant="outline" onClick={() => { setSelected(null); setSubmitted(false); }}>
                Try again
              </Button>
            )}
          </div>
        )}

        {submitted && correct && !done && (
          <div className="mt-4">
            <Button size="sm" onClick={handleNext}>
              Next step
            </Button>
          </div>
        )}

        {done && (
          <div className="mt-4 rounded-lg border border-blue-500/30 bg-blue-500/5 px-4 py-3 text-sm">
            The key idea is depth-first repair: the solver reverses the most recent choice, tries untested alternatives, and only backtracks farther when a variable is exhausted.
          </div>
        )}
      </div>
    </div>
  );
}
