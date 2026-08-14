import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ExerciseCard from '@/components/ExerciseCard';
import StepChallenge, { type StepDef } from '@/components/StepChallenge';
import HintPanel from '@/components/HintPanel';

// ---------- Types & data ----------

interface Property {
  name: string;
  optionA: string;
  optionB: string;
}

const PROPERTIES: Property[] = [
  { name: 'Observable', optionA: 'Fully', optionB: 'Partially' },
  { name: 'Deterministic', optionA: 'Deterministic', optionB: 'Stochastic' },
  { name: 'Episodes', optionA: 'Episodic', optionB: 'Sequential' },
  { name: 'Timing', optionA: 'Static', optionB: 'Dynamic' },
  { name: 'Values', optionA: 'Discrete', optionB: 'Continuous' },
  { name: 'Agents', optionA: 'Single-agent', optionB: 'Multi-agent' },
];

interface Scenario {
  title: string;
  description: string;
  correct: ('A' | 'B')[];
  explanations: string[];
  hints: { label: string; content: string }[];
}

const SCENARIOS: Scenario[] = [
  {
    title: 'Stock Trading Bot',
    description:
      'An automated stock trading agent that buys and sells equities on the stock market in real-time. It monitors price feeds, news, and order books.',
    correct: ['B', 'B', 'B', 'B', 'B', 'B'],
    explanations: [
      "Partially \u2014 the agent can't see other traders' strategies, insider info, or future market events.",
      'Stochastic \u2014 market movements are influenced by unpredictable factors; same action can lead to different outcomes.',
      'Sequential \u2014 each trade affects portfolio state and influences future decisions.',
      'Dynamic \u2014 prices change continuously while the agent is deciding.',
      'Continuous \u2014 prices, volumes, and timing are continuous values.',
      'Multi-agent \u2014 many traders (human and AI) competing and affecting prices.',
    ],
    hints: [
      { label: 'Nudge', content: "Think about what information a trader can and can't see." },
      {
        label: 'Strategy',
        content:
          'Markets are about the hardest environment possible \u2014 uncertain, competitive, and fast-changing.',
      },
      {
        label: 'Answer',
        content:
          "All 'hard' options: Partially, Stochastic, Sequential, Dynamic, Continuous, Multi-agent.",
      },
    ],
  },
  {
    title: 'Multiplayer Online Game AI (e.g., opponent in StarCraft)',
    description:
      'An AI opponent in a real-time strategy game. It controls units, gathers resources, builds structures, and battles against human players on a partially-revealed map.',
    correct: ['B', 'B', 'B', 'B', 'A', 'B'],
    explanations: [
      "Partially \u2014 fog of war hides opponent's base, army, and strategy.",
      'Stochastic \u2014 combat outcomes have random elements, opponent behavior is unpredictable.',
      'Sequential \u2014 resource allocation and army positioning affect all future decisions.',
      'Dynamic \u2014 the opponent acts in real-time while the AI is deciding.',
      'Discrete \u2014 the game operates on a grid with discrete unit types, actions, and resource counts.',
      'Multi-agent \u2014 at least one opponent is actively competing.',
    ],
    hints: [
      {
        label: 'Nudge',
        content: 'Is the game world continuous like driving, or discrete like a board game?',
      },
      {
        label: 'Strategy',
        content:
          'RTS games run on discrete grids and time steps, even though they feel continuous to the player.',
      },
      {
        label: 'Answer',
        content: 'Partially, Stochastic, Sequential, Dynamic, Discrete, Multi-agent.',
      },
    ],
  },
  {
    title: 'Weather Forecasting System',
    description:
      'An AI system that predicts weather conditions 1-7 days in advance. It processes satellite imagery, sensor data from weather stations, and atmospheric models.',
    correct: ['B', 'B', 'A', 'B', 'B', 'A'],
    explanations: [
      "Partially \u2014 sensors can't measure every point in the atmosphere; there are always gaps in data.",
      'Stochastic \u2014 weather is inherently chaotic; small measurement errors lead to large prediction differences.',
      "Episodic \u2014 each forecast is independent; tomorrow's prediction doesn't depend on what was predicted yesterday.",
      'Dynamic \u2014 the atmosphere changes continuously while the system processes data.',
      'Continuous \u2014 temperature, pressure, humidity, wind speed are all continuous values.',
      "Single-agent \u2014 the weather doesn't compete with or respond to the forecasting system.",
    ],
    hints: [
      {
        label: 'Nudge',
        content: "Does today's forecast decision affect tomorrow's forecast?",
      },
      {
        label: 'Strategy',
        content:
          "Each forecast is a fresh prediction \u2014 the system doesn't build on yesterday's forecast.",
      },
      {
        label: 'Answer',
        content: 'Partially, Stochastic, Episodic, Dynamic, Continuous, Single-agent.',
      },
    ],
  },
];

// ---------- ClassifyStep component ----------

type Choice = 'A' | 'B' | null;

interface ClassifyStepProps {
  scenario: Scenario;
  onComplete: () => void;
  isComplete: boolean;
}

function ClassifyStep({ scenario, onComplete, isComplete }: ClassifyStepProps) {
  // When this step has already been completed in a prior session, render the
  // "all correct" state directly so explanations remain visible on revisit.
  const [answers, setAnswers] = useState<Choice[]>(() =>
    isComplete ? (scenario.correct as Choice[]) : Array(6).fill(null),
  );
  const [results, setResults] = useState<(boolean | null)[]>(() =>
    isComplete ? Array(6).fill(true) : Array(6).fill(null),
  );
  const [done, setDone] = useState(isComplete);
  const [wrongCount, setWrongCount] = useState(0);

  const handleSelect = useCallback(
    (index: number, opt: 'A' | 'B') => {
      if (done) return;
      setAnswers((prev) => {
        const next = [...prev];
        next[index] = opt;
        return next;
      });
      // Clear previous result for this property when re-selecting
      setResults((prev) => {
        const next = [...prev];
        next[index] = null;
        return next;
      });
    },
    [done],
  );

  const handleCheck = useCallback(() => {
    const newResults = answers.map((ans, i) => (ans === null ? null : ans === scenario.correct[i]));
    setResults(newResults);

    const allCorrect = newResults.every((r) => r === true);
    if (allCorrect) {
      setDone(true);
      onComplete();
    } else {
      setWrongCount((c) => c + 1);
    }
  }, [answers, scenario.correct, onComplete]);

  const allAnswered = answers.every((a) => a !== null);

  return (
    <div>
      <p className="text-sm text-muted-foreground mb-1">Classify the environment properties:</p>
      <p className="text-sm font-medium mb-4">"{scenario.description}"</p>

      <div className="space-y-2 my-4">
        {PROPERTIES.map((prop, i) => (
          <div key={prop.name} className="flex items-center gap-2">
            <span className="text-xs font-semibold w-28 text-muted-foreground">{prop.name}</span>
            <div className="flex gap-1.5">
              {(['A', 'B'] as const).map((opt) => {
                const label = opt === 'A' ? prop.optionA : prop.optionB;
                const selected = answers[i] === opt;
                const isCorrect = results[i] === true;
                const isWrong = results[i] === false && selected;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleSelect(i, opt)}
                    disabled={done}
                    className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-all ${
                      isCorrect && selected
                        ? 'border-green-500 bg-green-500/10 text-green-700 dark:text-green-400'
                        : isWrong
                          ? 'border-red-400 bg-red-500/10 text-red-700 dark:text-red-400'
                          : selected
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border hover:border-primary/50'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}

              {/* Per-property feedback icon */}
              {results[i] === true && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-green-600 dark:text-green-400"
                >
                  <Check className="size-4" />
                </motion.span>
              )}
              {results[i] === false && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-red-500 dark:text-red-400"
                >
                  <X className="size-4" />
                </motion.span>
              )}
            </div>
          </div>
        ))}
      </div>

      <Button size="sm" className="h-8 text-xs" onClick={handleCheck} disabled={!allAnswered || done}>
        Check
      </Button>

      {/* Summary feedback */}
      {results.some((r) => r !== null) && !done && (
        <motion.p
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-sm font-medium text-red-700 dark:text-red-400 flex items-center gap-1.5"
        >
          <X className="size-4" />
          {results.filter((r) => r === true).length} / 6 correct — fix the red ones and try again.
        </motion.p>
      )}

      {done && (
        <motion.p
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-sm font-medium text-green-700 dark:text-green-400 flex items-center gap-1.5"
        >
          <Check className="size-4" />
          All correct!
        </motion.p>
      )}

      {/* Explanations revealed on completion */}
      {done && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="mt-4 space-y-2 overflow-hidden"
        >
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Explanations
          </p>
          {PROPERTIES.map((prop, i) => (
            <div key={prop.name} className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{prop.name}:</span>{' '}
              {scenario.explanations[i]}
            </div>
          ))}
        </motion.div>
      )}

      {!done && <HintPanel hints={scenario.hints} failCount={wrongCount} />}
    </div>
  );
}

// ---------- Main export ----------

export default function Exercise2EnvironmentDetective() {
  const steps: StepDef[] = [
    {
      id: 1,
      title: SCENARIOS[0].title,
      content: (onComplete, isComplete) => (
        <ClassifyStep scenario={SCENARIOS[0]} onComplete={onComplete} isComplete={isComplete} />
      ),
    },
    {
      id: 2,
      title: SCENARIOS[1].title,
      content: (onComplete, isComplete) => (
        <ClassifyStep scenario={SCENARIOS[1]} onComplete={onComplete} isComplete={isComplete} />
      ),
    },
    {
      id: 3,
      title: SCENARIOS[2].title,
      content: (onComplete, isComplete) => (
        <ClassifyStep scenario={SCENARIOS[2]} onComplete={onComplete} isComplete={isComplete} />
      ),
    },
  ];

  return (
    <ExerciseCard exerciseId="lab-t02-ex2" number={2} title="Environment Detective" totalSteps={3}>
      <StepChallenge exerciseId="lab-t02-ex2" steps={steps} />
    </ExerciseCard>
  );
}
