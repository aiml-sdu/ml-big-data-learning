import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import LessonStepper from '@/components/LessonStepper';
import LessonCard from '@/components/LessonCard';
import QuizCard from '@/components/QuizCard';
import CalloutBox from '@/components/CalloutBox';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CARDS, QUIZ_101, QUIZ_102, SECTIONS } from '@/data/topic-10-cards';

type StudentOutcome = 'Pass' | 'Needs more support';

const PARADIGM_THEME = {
  unsupervised: {
    border: 'border-amber-500/40',
    active: 'border-amber-500 bg-amber-500/10',
  },
  reinforcement: {
    border: 'border-emerald-500/40',
    active: 'border-emerald-500 bg-emerald-500/10',
  },
  supervised: {
    border: 'border-blue-500/40',
    active: 'border-blue-500 bg-blue-500/10',
  },
} as const;

const OUTCOME_THEME: Record<StudentOutcome, { tone: 'blue' | 'amber'; pill: string }> = {
  Pass: {
    tone: 'blue',
    pill: 'bg-blue-500/12 text-blue-700 dark:text-blue-300',
  },
  'Needs more support': {
    tone: 'amber',
    pill: 'bg-amber-500/12 text-amber-700 dark:text-amber-300',
  },
};

interface StudentProfile {
  studyTime: number;
  pastFailures: number;
  absences: number;
  didLab: boolean;
  sleepHours: number;
}

function sigmoid(x: number) {
  return 1 / (1 + Math.exp(-x));
}

function estimateStudentPass(profile: StudentProfile) {
  const score =
    -1.85 +
    0.47 * profile.studyTime -
    1.15 * profile.pastFailures -
    0.08 * profile.absences +
    1.05 * Number(profile.didLab) -
    0.3 * (profile.sleepHours - 7.1) ** 2;
  const probability = sigmoid(score);
  return {
    probability,
    outcome: probability >= 0.5 ? ('Pass' as const) : ('Needs more support' as const),
  };
}

interface ChoiceOption {
  id: string;
  label: string;
  detail?: string;
  correct: boolean;
  explanation: string;
}

interface ChoiceExerciseProps {
  prompt: string;
  options: ChoiceOption[];
  onComplete: () => void;
  supporting?: ReactNode;
}

function ChoiceExercise({ prompt, options, onComplete, supporting }: ChoiceExerciseProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const choice = options.find((option) => option.id === selected);
  const correct = !!choice?.correct;

  const handleSubmit = () => {
    if (!selected) return;
    setSubmitted(true);
    if (correct) {
      window.setTimeout(onComplete, 250);
    }
  };

  return (
    <div className="space-y-4">
      {supporting}
      <p>{prompt}</p>
      <div className="grid gap-3">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => !submitted && setSelected(option.id)}
            disabled={submitted}
            className={cn(
              'rounded-2xl border p-4 text-left transition-colors',
              selected === option.id && !submitted && 'border-primary bg-primary/5',
              submitted && option.correct && 'border-green-500 bg-green-500/10',
              submitted && selected === option.id && !option.correct && 'border-red-500 bg-red-500/10',
              !submitted && selected !== option.id && 'hover:bg-muted/50',
            )}
          >
            <div className="font-medium">{option.label}</div>
            {option.detail && (
              <div className="mt-1 text-sm text-muted-foreground">{option.detail}</div>
            )}
          </button>
        ))}
      </div>
      {!submitted ? (
        <Button size="sm" onClick={handleSubmit} disabled={!selected}>
          Check
        </Button>
      ) : (
        <div className="space-y-2">
          <div
            className={cn(
              'rounded-xl px-3 py-2 text-sm',
              correct
                ? 'bg-green-500/10 text-green-700 dark:text-green-300'
                : 'bg-red-500/10 text-red-700 dark:text-red-300',
            )}
          >
            {choice?.explanation}
          </div>
          {!correct && (
            <Button size="sm" variant="outline" onClick={() => setSubmitted(false)}>
              Try again
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

function Surface({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'rounded-[28px] border border-border/70 bg-gradient-to-br from-card via-card to-muted/20 p-5 shadow-sm',
        className,
      )}
    >
      {children}
    </div>
  );
}

function Tag({
  label,
  tone = 'default',
}: {
  label: string;
  tone?: 'default' | 'blue' | 'emerald' | 'amber' | 'violet';
}) {
  const styles = {
    default: 'bg-muted text-muted-foreground',
    blue: 'bg-blue-500/15 text-blue-700 dark:text-blue-300',
    emerald: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
    amber: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
    violet: 'bg-violet-500/15 text-violet-700 dark:text-violet-300',
  } as const;

  return (
    <span className={cn('rounded-full px-2.5 py-1 text-[11px] font-medium', styles[tone])}>
      {label}
    </span>
  );
}

function OutcomePill({ outcome }: { outcome: StudentOutcome }) {
  return (
    <span className={cn('rounded-full px-3 py-1 text-xs font-semibold', OUTCOME_THEME[outcome].pill)}>
      {outcome}
    </span>
  );
}

function MLDefinitionHook({ onComplete }: { onComplete: () => void }) {
  const prompts = [
    {
      id: 'spam',
      title: 'Filter spam emails',
      prompt: 'Millions of messages, messy language, and new tricks every week.',
      answer: 'learn',
      explanation: 'This is a learning problem. Writing fixed rules for every spam tactic breaks down quickly.',
    },
    {
      id: 'tax',
      title: 'Apply a tax bracket table',
      prompt: 'The thresholds are explicit and the logic is fixed by policy.',
      answer: 'rules',
      explanation: 'This is rule-driven. The logic is explicit, stable, and easy to hand-code.',
    },
    {
      id: 'chess',
      title: 'Choose strong chess moves',
      prompt: 'Too many board states to hand-code all good decisions.',
      answer: 'learn',
      explanation: 'This is the lecture’s experience-driven case: learn from rewards and outcomes instead of enumerating every rule.',
    },
    {
      id: 'turnstile',
      title: 'Open a turnstile',
      prompt: 'If the ticket is valid, unlock. If not, stay closed.',
      answer: 'rules',
      explanation: 'This logic is crisp and explicit. No learning system is needed.',
    },
  ] as const;
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [didComplete, setDidComplete] = useState(false);
  const allAnswered = prompts.every((prompt) => answers[prompt.id]);

  useEffect(() => {
    if (allAnswered && !didComplete) {
      setDidComplete(true);
      onComplete();
    }
  }, [allAnswered, didComplete, onComplete]);

  return (
    <div className="space-y-4">
      <p>
        Start with the first question from the lecture, not the first model: <strong>when do explicit rules stop scaling, and when should a system learn from experience?</strong>
      </p>
      <Surface>
        <div className="flex flex-wrap items-center gap-2">
          <Tag label="Problem first" tone="violet" />
          <Tag label="Rules vs experience" tone="blue" />
        </div>
        <div className="mt-4 grid gap-4">
          {prompts.map((prompt) => {
            const selected = answers[prompt.id];
            const correct = selected === prompt.answer;
            return (
              <div
                key={prompt.id}
                className={cn(
                  'rounded-2xl border p-4 transition-colors',
                  selected && correct && 'border-green-500/40 bg-green-500/5',
                  selected && !correct && 'border-red-500/40 bg-red-500/5',
                )}
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="max-w-xl">
                    <div className="text-sm font-semibold">{prompt.title}</div>
                    <div className="mt-1 text-sm text-muted-foreground">{prompt.prompt}</div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {([
                      ['rules', 'Write explicit rules'],
                      ['learn', 'Learn from experience'],
                    ] as const).map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setAnswers((prev) => ({ ...prev, [prompt.id]: value }))}
                        className={cn(
                          'rounded-full border px-3 py-2 text-sm transition-colors',
                          selected === value ? 'border-primary bg-primary/10' : 'hover:bg-muted/60',
                        )}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                {selected && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      'mt-3 rounded-xl px-3 py-2 text-sm',
                      correct
                        ? 'bg-green-500/10 text-green-700 dark:text-green-300'
                        : 'bg-red-500/10 text-red-700 dark:text-red-300',
                    )}
                  >
                    {prompt.explanation}
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>
      </Surface>
      {allAnswered && (
        <Surface className="grid gap-4 md:grid-cols-2">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Lecture definition
            </div>
            <div className="mt-3 text-lg font-semibold">
              Getting a computer to do well on a task without explicitly programming it.
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Experience matters
            </div>
            <div className="mt-3 text-lg font-semibold">
              Improving performance on a task based on experience.
            </div>
          </div>
        </Surface>
      )}
    </div>
  );
}

function ParadigmPlayground({ onComplete }: { onComplete: () => void }) {
  const scenarios = [
    {
      id: 'cluster',
      title: 'Cluster unlabeled data',
      prompt: 'You only have raw measurements and want to group similar examples together.',
      answer: 'unsupervised',
      explanation: 'Unsupervised learning is about structure in unlabeled data: clustering, outliers, generation, and filling in missing data.',
    },
    {
      id: 'chess',
      title: 'Learn chess from rewards',
      prompt: 'The agent sees board states, makes moves, and gets rewards from what happens next.',
      answer: 'reinforcement',
      explanation: 'Reinforcement learning uses states, actions, and rewards. The chess example in the slide is the template.',
    },
    {
      id: 'students',
      title: 'Predict whether a student will pass',
      prompt: 'Each student has features like study time and absences plus a known class label.',
      answer: 'supervised',
      explanation: 'Supervised learning uses paired input/output data. This week, Topic 10 zooms in on a student-success classification example.',
    },
  ] as const;
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [didComplete, setDidComplete] = useState(false);
  const allAnswered = scenarios.every((scenario) => answers[scenario.id]);

  useEffect(() => {
    if (allAnswered && !didComplete) {
      setDidComplete(true);
      onComplete();
    }
  }, [allAnswered, didComplete, onComplete]);

  return (
    <div className="space-y-4">
      <p>
        The lecture immediately splits ML into three paradigms. The key distinction is <strong>what kind of feedback the learner gets</strong>.
      </p>
      <Surface>
        <div className="grid gap-2 md:grid-cols-3">
          <div className={cn('rounded-2xl border px-4 py-3', PARADIGM_THEME.unsupervised.border)}>
            <div className="text-sm font-semibold">Unsupervised</div>
            <div className="mt-1 text-xs text-muted-foreground">No labels, find structure</div>
          </div>
          <div className={cn('rounded-2xl border px-4 py-3', PARADIGM_THEME.reinforcement.border)}>
            <div className="text-sm font-semibold">Reinforcement</div>
            <div className="mt-1 text-xs text-muted-foreground">Actions and rewards over time</div>
          </div>
          <div className={cn('rounded-2xl border px-4 py-3', PARADIGM_THEME.supervised.border)}>
            <div className="text-sm font-semibold">Supervised</div>
            <div className="mt-1 text-xs text-muted-foreground">Paired input and output</div>
          </div>
        </div>

        <div className="mt-4 space-y-4">
          {scenarios.map((scenario) => {
            const selected = answers[scenario.id];
            const correct = selected === scenario.answer;
            return (
              <div key={scenario.id} className="rounded-2xl border p-4">
                <div className="text-sm font-semibold">{scenario.title}</div>
                <div className="mt-1 text-sm text-muted-foreground">{scenario.prompt}</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {([
                    ['unsupervised', 'Unsupervised'],
                    ['reinforcement', 'Reinforcement'],
                    ['supervised', 'Supervised'],
                  ] as const).map(([value, label]) => {
                    const theme = PARADIGM_THEME[value];
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setAnswers((prev) => ({ ...prev, [scenario.id]: value }))}
                        className={cn(
                          'rounded-full border px-3 py-2 text-sm transition-colors',
                          theme.border,
                          selected === value ? theme.active : 'hover:bg-muted/60',
                        )}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
                {selected && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      'mt-3 rounded-xl px-3 py-2 text-sm',
                      correct
                        ? 'bg-green-500/10 text-green-700 dark:text-green-300'
                        : 'bg-red-500/10 text-red-700 dark:text-red-300',
                    )}
                  >
                    {scenario.explanation}
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>
      </Surface>
    </div>
  );
}

function ReinforcementLoopGame({ onComplete }: { onComplete: () => void }) {
  const paths = {
    exploit: {
      label: 'Repeat the known opening',
      mode: 'Exploit',
      immediateReward: '+2 now',
      nextState: 'Predictable middlegame',
      delayedReward: '+1 later',
      summary: 'You cash in a small immediate reward, but you learn very little about better options.',
    },
    explore: {
      label: 'Try a new opening line',
      mode: 'Explore',
      immediateReward: '0 now',
      nextState: 'Unfamiliar but promising position',
      delayedReward: '+4 later',
      summary: 'No reward arrives immediately, but the delayed reward is larger once the new line starts working.',
    },
  } as const;
  const [selectedId, setSelectedId] = useState<keyof typeof paths | null>(null);
  const [didComplete, setDidComplete] = useState(false);
  const selected = selectedId ? paths[selectedId] : null;

  useEffect(() => {
    if (selectedId && !didComplete) {
      setDidComplete(true);
      onComplete();
    }
  }, [didComplete, onComplete, selectedId]);

  return (
    <div className="space-y-4">
      <p>
        RL is different because the agent must <strong>act to collect data</strong>. Rewards can arrive later, so it is not always obvious which action deserved the credit.
      </p>
      <Surface>
        <div className="grid gap-5 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="space-y-3">
            <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/5 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300">
                Opening state
              </div>
              <div className="mt-2 text-lg font-semibold">Choose one move</div>
              <div className="mt-1 text-sm text-muted-foreground">
                Do you exploit the safe move you already trust, or explore a new line that might pay off later?
              </div>
            </div>
            {(Object.entries(paths) as [keyof typeof paths, (typeof paths)[keyof typeof paths]][]).map(([key, path]) => (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedId(key)}
                className={cn(
                  'w-full rounded-2xl border p-4 text-left transition-colors',
                  selectedId === key ? 'border-primary bg-primary/5' : 'hover:bg-muted/60',
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="font-semibold">{path.label}</div>
                  <Tag label={path.mode} tone={key === 'exploit' ? 'amber' : 'emerald'} />
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  Immediate reward: {path.immediateReward}
                </div>
              </button>
            ))}
          </div>

          <div className="rounded-[24px] border border-border/70 bg-background/70 p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {'State -> action -> reward -> next state'}
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-4">
              {[
                { title: 'State', value: 'Opening board' },
                { title: 'Action', value: selected ? selected.label : 'Pick a move' },
                { title: 'Reward', value: selected ? selected.immediateReward : '?' },
                { title: 'Next state', value: selected ? selected.nextState : '?' },
              ].map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0.4, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="rounded-2xl border p-3"
                >
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    {item.title}
                  </div>
                  <div className="mt-2 text-sm font-medium">{item.value}</div>
                </motion.div>
              ))}
            </div>

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={selectedId ?? 'empty'}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-4 rounded-2xl border bg-muted/40 p-4"
              >
                {selected ? (
                  <>
                    <div className="flex items-center gap-2">
                      <Tag
                        label={selected.mode === 'Explore' ? 'Exploration vs exploitation' : 'Greedy now'}
                        tone={selected.mode === 'Explore' ? 'emerald' : 'amber'}
                      />
                      <Tag label={`Delayed reward: ${selected.delayedReward}`} tone="violet" />
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">{selected.summary}</p>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Pick an action to watch the reward story unfold. The slide’s chess example is exactly this loop.
                  </p>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </Surface>
      <CalloutBox type="info" title="Why RL Is Hard">
        <p>
          The same action may not lead to the same outcome every time, and good rewards can arrive much later. That is the exploration-exploitation trade-off plus the temporal credit-assignment problem from the lecture.
        </p>
      </CalloutBox>
    </div>
  );
}

function SupervisedModelExplorer({ onComplete }: { onComplete: () => void }) {
  const samples = [
    { age: 5, height: 108 },
    { age: 7, height: 119 },
    { age: 9, height: 132 },
    { age: 11, height: 145 },
    { age: 13, height: 155 },
  ] as const;
  const candidates = [
    {
      id: 'flat',
      label: 'Too flat',
      equation: 'y = 3x + 95',
      slope: 3,
      intercept: 95,
      color: 'var(--color-warning)',
      verdict: 'This family member misses the upward trend. It stays too flat as age increases.',
    },
    {
      id: 'fit',
      label: 'Best fit in this family',
      equation: 'y = 6x + 78',
      slope: 6,
      intercept: 78,
      color: 'var(--primary)',
      verdict: 'This candidate tracks the training points well. Learning means choosing this kind of equation from the family.',
    },
    {
      id: 'steep',
      label: 'Too steep',
      equation: 'y = 9x + 60',
      slope: 9,
      intercept: 60,
      color: 'var(--color-error)',
      verdict: 'This equation rises too quickly. It still belongs to the family, but it does not fit the training data well.',
    },
  ] as const;
  const [selectedId, setSelectedId] = useState<(typeof candidates)[number]['id'] | null>(null);
  const [didComplete, setDidComplete] = useState(false);
  const selected = candidates.find((candidate) => candidate.id === selectedId) ?? candidates[1];

  useEffect(() => {
    if (selectedId && !didComplete) {
      setDidComplete(true);
      onComplete();
    }
  }, [didComplete, onComplete, selectedId]);

  const averageResidual = (
    samples.reduce(
      (sum, sample) => sum + Math.abs(selected.slope * sample.age + selected.intercept - sample.height),
      0,
    ) / samples.length
  ).toFixed(1);

  const vbWidth = 540;
  const vbHeight = 280;
  const pad = { top: 20, right: 24, bottom: 44, left: 52 };
  const plotW = vbWidth - pad.left - pad.right;
  const plotH = vbHeight - pad.top - pad.bottom;
  const xMin = 4;
  const xMax = 14;
  const yMin = 95;
  const yMax = 170;
  const sx = (x: number) => pad.left + ((x - xMin) / (xMax - xMin)) * plotW;
  const sy = (y: number) => pad.top + plotH - ((y - yMin) / (yMax - yMin)) * plotH;

  return (
    <div className="space-y-4">
      <p>
        The supervised-learning slide uses one clean idea: search through a <strong>family of possible equations</strong>, then keep the one that fits the paired data best.
      </p>
      <Surface>
        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[24px] border bg-background/70 p-4">
            <svg viewBox={`0 0 ${vbWidth} ${vbHeight}`} className="w-full">
              <line x1={pad.left} y1={pad.top} x2={pad.left} y2={pad.top + plotH} stroke="var(--border)" />
              <line x1={pad.left} y1={pad.top + plotH} x2={pad.left + plotW} y2={pad.top + plotH} stroke="var(--border)" />
              <text x={pad.left + plotW / 2} y={vbHeight - 8} textAnchor="middle" fill="var(--muted-foreground)" fontSize={12}>Age</text>
              <text
                x={16}
                y={pad.top + plotH / 2}
                textAnchor="middle"
                fill="var(--muted-foreground)"
                fontSize={12}
                transform={`rotate(-90, 16, ${pad.top + plotH / 2})`}
              >
                Height
              </text>
              {candidates.map((candidate) => (
                <line
                  key={candidate.id}
                  x1={sx(xMin)}
                  y1={sy(candidate.slope * xMin + candidate.intercept)}
                  x2={sx(xMax)}
                  y2={sy(candidate.slope * xMax + candidate.intercept)}
                  stroke={candidate.color}
                  strokeWidth={selected.id === candidate.id ? 4 : 2}
                  opacity={selected.id === candidate.id ? 1 : 0.18}
                  strokeLinecap="round"
                />
              ))}
              {samples.map((sample) => {
                const predicted = selected.slope * sample.age + selected.intercept;
                return (
                  <g key={`${sample.age}-${sample.height}`}>
                    <line
                      x1={sx(sample.age)}
                      y1={sy(predicted)}
                      x2={sx(sample.age)}
                      y2={sy(sample.height)}
                      stroke="var(--color-warning)"
                      strokeWidth={2}
                      strokeDasharray="5 4"
                      opacity={0.7}
                    />
                    <circle cx={sx(sample.age)} cy={sy(sample.height)} r={6} fill="white" stroke="var(--primary)" strokeWidth={2.5} />
                    <circle cx={sx(sample.age)} cy={sy(predicted)} r={4.5} fill={selected.color} />
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="space-y-3">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Family of candidate equations
            </div>
            {candidates.map((candidate) => (
              <button
                key={candidate.id}
                type="button"
                onClick={() => setSelectedId(candidate.id)}
                className={cn(
                  'w-full rounded-2xl border p-4 text-left transition-colors',
                  selected.id === candidate.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/60',
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-semibold">{candidate.label}</div>
                  <div className="size-3 rounded-full" style={{ backgroundColor: candidate.color }} />
                </div>
                <div className="mt-1 font-mono text-sm text-muted-foreground">{candidate.equation}</div>
              </button>
            ))}

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="rounded-2xl border bg-background/70 p-4"
              >
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Residual check
                </div>
                <div className="mt-2 text-sm font-semibold">{selected.label}</div>
                <p className="mt-2 text-sm text-muted-foreground">{selected.verdict}</p>
                <div className="mt-3 rounded-xl bg-muted/60 px-3 py-2 text-sm">
                  Average training residual: <strong>{averageResidual}</strong>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </Surface>
    </div>
  );
}

function OutputPreview({ taskId }: { taskId: string }) {
  if (taskId === 'price') {
    return (
      <div className="space-y-3">
        <div className="text-3xl font-semibold text-primary">$425k</div>
        <div className="h-2 rounded-full bg-primary/15">
          <div className="h-full w-3/4 rounded-full bg-primary" />
        </div>
      </div>
    );
  }

  if (taskId === 'sentiment') {
    return (
      <div className="flex flex-wrap gap-2">
        <span className="rounded-full bg-muted px-3 py-1 text-xs">NEGATIVE</span>
        <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">POSITIVE</span>
      </div>
    );
  }

  if (taskId === 'music') {
    return (
      <div className="space-y-3">
        <div className="flex h-16 items-end gap-1">
          {[12, 32, 18, 40, 28, 46, 26, 36, 16, 30].map((height, index) => (
            <div
              key={index}
              className={cn('w-4 rounded-t-md', index === 5 ? 'bg-primary' : 'bg-primary/35')}
              style={{ height }}
            />
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {['Jazz', 'Rock', 'Classical', 'Pop'].map((label, index) => (
            <span
              key={label}
              className={cn(
                'rounded-full px-3 py-1 text-xs',
                index === 1 ? 'bg-primary text-primary-foreground' : 'bg-muted',
              )}
            >
              {label}
            </span>
          ))}
        </div>
      </div>
    );
  }

  if (taskId === 'segmentation') {
    return (
      <div className="grid w-fit grid-cols-6 gap-1">
        {Array.from({ length: 24 }, (_, index) => (
          <div
            key={index}
            className={cn(
              'size-4 rounded-sm',
              index % 6 === 2 || index % 6 === 3 || index > 15 ? 'bg-primary' : 'bg-muted',
            )}
          />
        ))}
      </div>
    );
  }

  if (taskId === 'translation') {
    return (
      <div className="space-y-3">
        <div className="rounded-2xl bg-muted px-4 py-3 text-sm">Hello, how are you?</div>
        <div className="flex justify-center text-muted-foreground">↓</div>
        <div className="rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground">
          Hej, hvordan har du det?
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {['Cat', 'Dog', 'Car', 'Bike'].map((label, index) => (
        <span
          key={label}
          className={cn(
            'rounded-full px-3 py-1 text-xs',
            index === 1 ? 'bg-primary text-primary-foreground' : 'bg-muted',
          )}
        >
          {label}
        </span>
      ))}
    </div>
  );
}

function OutputTypeArcade({ onComplete }: { onComplete: () => void }) {
  const rounds = [
    {
      id: 'price',
      title: 'Predict a house price',
      prompt: 'The model outputs one numeric value.',
      answer: 'univariate-regression',
      why: 'One number means univariate regression.',
    },
    {
      id: 'sentiment',
      title: 'Label a review as positive or negative',
      prompt: 'The model chooses between exactly two classes.',
      answer: 'binary-classification',
      why: 'Two discrete classes means binary classification.',
    },
    {
      id: 'music',
      title: 'Choose one music genre',
      prompt: 'The model picks one label from many classes.',
      answer: 'multiclass-classification',
      why: 'Many discrete classes means multiclass classification.',
    },
    {
      id: 'segmentation',
      title: 'Label many pixels at once',
      prompt: 'The model produces many outputs across the image.',
      answer: 'multivariate-output',
      why: 'Many outputs at the same time makes this a multivariate output problem.',
    },
  ] as const;
  const options = [
    { id: 'univariate-regression', label: 'Univariate regression' },
    { id: 'binary-classification', label: 'Binary classification' },
    { id: 'multiclass-classification', label: 'Multiclass classification' },
    { id: 'multivariate-output', label: 'Multivariate output' },
  ] as const;
  const [index, setIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [didComplete, setDidComplete] = useState(false);
  const round = rounds[index];

  const handleCheck = () => {
    if (!selectedId) return;
    const correct = selectedId === round.answer;
    setFeedback(correct ? 'correct' : 'wrong');
    if (correct) {
      if (index === rounds.length - 1) {
        if (!didComplete) {
          setDidComplete(true);
          onComplete();
        }
      } else {
        window.setTimeout(() => {
          setIndex((prev) => prev + 1);
          setSelectedId(null);
          setFeedback(null);
        }, 500);
      }
    }
  };

  return (
    <div className="space-y-4">
      <p>
        The key distinction is <strong>what the model predicts</strong>. Ignore the model family for a moment and classify the output itself.
      </p>
      <Surface>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            {rounds.map((item, itemIndex) => (
              <div
                key={item.id}
                className={cn(
                  'size-2.5 rounded-full',
                  itemIndex < index || (itemIndex === index && feedback === 'correct')
                    ? 'bg-primary'
                    : itemIndex === index
                      ? 'bg-primary/40'
                      : 'bg-muted',
                )}
              />
            ))}
          </div>
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Output Type Arcade
          </div>
        </div>

        <div className="mt-4 grid gap-5 lg:grid-cols-[1fr_0.95fr]">
          <div className="rounded-[24px] border bg-background/70 p-5">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Current prediction
            </div>
            <h3 className="mt-2 text-xl font-semibold">{round.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{round.prompt}</p>
            <div className="mt-5 rounded-[22px] border bg-card/70 p-5">
              <OutputPreview taskId={round.id} />
            </div>
          </div>

          <div className="space-y-3">
            {options.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setSelectedId(option.id)}
                className={cn(
                  'w-full rounded-2xl border p-4 text-left transition-colors',
                  selectedId === option.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/60',
                )}
              >
                <div className="font-semibold">{option.label}</div>
              </button>
            ))}

            <div className="pt-1">
              {!feedback ? (
                <Button size="sm" onClick={handleCheck} disabled={!selectedId}>
                  Check framing
                </Button>
              ) : (
                <div className="space-y-3">
                  <div
                    className={cn(
                      'rounded-xl px-3 py-2 text-sm',
                      feedback === 'correct'
                        ? 'bg-green-500/10 text-green-700 dark:text-green-300'
                        : 'bg-red-500/10 text-red-700 dark:text-red-300',
                    )}
                  >
                    {feedback === 'correct'
                      ? round.why
                      : 'Not quite. Focus on the output itself: a number, two classes, many classes, or many outputs.'}
                  </div>
                  {feedback === 'wrong' && (
                    <Button size="sm" variant="outline" onClick={() => setFeedback(null)}>
                      Try again
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </Surface>
    </div>
  );
}

function DeepLearningDomainAtlas({ onComplete }: { onComplete: () => void }) {
  const tasks = [
    {
      id: 'house-price',
      title: 'House price',
      description: 'Predict the selling price of a home from its features.',
      outputType: 'Regression · continuous value',
      model: 'Fully connected network',
      note: 'Regression is one supervised branch, but this week Topic 10 pivots to label prediction.',
      badges: ['Deep Learning', 'Tabular'],
      tone: 'blue',
    },
    {
      id: 'text',
      title: 'Text classification',
      description: 'Predict whether a text belongs to one of two classes.',
      outputType: 'Binary classification',
      model: 'Transformer network',
      note: 'Same supervised setup, but the output is now a class instead of a number.',
      badges: ['Deep Learning', 'NLP / Language'],
      tone: 'violet',
    },
    {
      id: 'music',
      title: 'Music genre classification',
      description: 'Assign a clip to one of several genres.',
      outputType: 'Multiclass classification',
      model: 'Recurrent neural network (RNN)',
      note: 'Audio task, many labels, still supervised learning.',
      badges: ['Deep Learning', 'Audio'],
      tone: 'emerald',
    },
    {
      id: 'image',
      title: 'Image classification',
      description: 'Assign an image to one of several object classes.',
      outputType: 'Multiclass classification',
      model: 'Convolutional network',
      note: 'One label for the whole image. This is classic computer vision.',
      badges: ['Deep Learning', 'Computer Vision'],
      tone: 'amber',
    },
    {
      id: 'segmentation',
      title: 'Image segmentation',
      description: 'Predict many pixel-level labels at once.',
      outputType: 'Multivariate binary classification',
      model: 'Convolutional encoder-decoder',
      note: 'Many outputs at once, so it differs sharply from one-number regression.',
      badges: ['Deep Learning', 'Computer Vision'],
      tone: 'amber',
    },
    {
      id: 'translation',
      title: 'Translation',
      description: 'Produce an output sequence in another language.',
      outputType: 'Structured sequence output',
      model: 'Sequence-to-sequence language model',
      note: 'Not one label and not one number. The output is a whole sequence.',
      badges: ['Deep Learning', 'NLP / Language'],
      tone: 'violet',
    },
  ] as const;

  const [selectedId, setSelectedId] = useState<(typeof tasks)[number]['id']>('text');
  const [visited, setVisited] = useState<Set<(typeof tasks)[number]['id']>>(
    () => new Set(['text']),
  );
  const [didComplete, setDidComplete] = useState(false);
  const selectedTask = tasks.find((task) => task.id === selectedId) ?? tasks[0];

  useEffect(() => {
    if (visited.size >= 4 && !didComplete) {
      setDidComplete(true);
      onComplete();
    }
  }, [didComplete, onComplete, visited]);

  const handleSelect = (taskId: (typeof tasks)[number]['id']) => {
    setSelectedId(taskId);
    setVisited((prev) => new Set(prev).add(taskId));
  };

  const toneClass = {
    blue: 'from-blue-500/10 via-transparent to-transparent',
    violet: 'from-violet-500/10 via-transparent to-transparent',
    emerald: 'from-emerald-500/10 via-transparent to-transparent',
    amber: 'from-amber-500/10 via-transparent to-transparent',
  } as const;

  return (
    <div className="space-y-4">
      <p>
        The lecture then zooms out across modern ML domains. Same broad idea, different data types, different outputs, different model families.
      </p>
      <Surface>
        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-2">
            {tasks.map((task) => (
              <button
                key={task.id}
                type="button"
                onClick={() => handleSelect(task.id)}
                className={cn(
                  'w-full rounded-2xl border p-4 text-left transition-colors',
                  task.id === selectedId ? 'border-primary bg-primary/5' : 'hover:bg-muted/60',
                )}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <div className="font-semibold">{task.title}</div>
                  {task.badges.slice(1).map((badge) => (
                    <Tag
                      key={badge}
                      label={badge}
                      tone={
                        badge === 'Computer Vision'
                          ? 'amber'
                          : badge === 'Audio'
                            ? 'emerald'
                            : badge === 'Tabular'
                              ? 'blue'
                              : 'violet'
                      }
                    />
                  ))}
                </div>
                <div className="mt-2 text-sm text-muted-foreground">{task.description}</div>
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={selectedTask.id}
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -18 }}
              className={cn('rounded-[28px] border bg-gradient-to-br p-5', toneClass[selectedTask.tone])}
            >
              <div className="flex flex-wrap gap-2">
                {selectedTask.badges.map((badge) => (
                  <Tag
                    key={badge}
                    label={badge}
                    tone={
                      badge === 'Computer Vision'
                        ? 'amber'
                        : badge === 'Audio'
                          ? 'emerald'
                          : badge === 'Tabular'
                            ? 'blue'
                            : 'violet'
                    }
                  />
                ))}
              </div>
              <h3 className="mt-3 text-2xl font-semibold">{selectedTask.title}</h3>
              <p className="mt-2 max-w-xl text-sm text-muted-foreground">{selectedTask.description}</p>

              <div className="mt-5 rounded-[24px] border bg-background/70 p-5">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Output snapshot
                </div>
                <div className="mt-4">
                  <OutputPreview taskId={selectedTask.id} />
                </div>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Output type
                  </div>
                  <div className="mt-2 text-sm">{selectedTask.outputType}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Example model
                  </div>
                  <div className="mt-2 text-sm">{selectedTask.model}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Why it matters
                  </div>
                  <div className="mt-2 text-sm">{selectedTask.note}</div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </Surface>
      <CalloutBox type="info" title="Classification Is One Branch">
        <p>
          This overview is broad on purpose. After seeing how ML stretches across tabular data, language, audio, and vision, the rest of Topic 10 narrows to one supervised case: classification.
        </p>
      </CalloutBox>
    </div>
  );
}

function ClassificationTaskHook({ onComplete }: { onComplete: () => void }) {
  const samples = [
    {
      id: 'steady-pass',
      outcome: 'Pass' as StudentOutcome,
      studyTime: 8.4,
      pastFailures: 0,
      absences: 2,
      didLab: true,
      sleepHours: 7.4,
      summary: 'Strong study time, low absences, and completed lab work point toward a pass.',
    },
    {
      id: 'support-needed',
      outcome: 'Needs more support' as StudentOutcome,
      studyTime: 3.6,
      pastFailures: 2,
      absences: 9,
      didLab: false,
      sleepHours: 5.9,
      summary: 'Lower study time, repeated failures, and many absences make this profile high risk.',
    },
    {
      id: 'borderline-pass',
      outcome: 'Pass' as StudentOutcome,
      studyTime: 6.3,
      pastFailures: 1,
      absences: 4,
      didLab: true,
      sleepHours: 6.8,
      summary: 'This one is less obvious, but the lab completion and middling absences still keep it on the pass side.',
    },
  ];
  const [sampleIndex, setSampleIndex] = useState(0);
  const [selectedOutcome, setSelectedOutcome] = useState<StudentOutcome | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [didComplete, setDidComplete] = useState(false);
  const sample = samples[sampleIndex];
  const correct = selectedOutcome === sample.outcome;

  const handleCheck = () => {
    if (!selectedOutcome) return;
    setSubmitted(true);
    if (correct && !didComplete) {
      setDidComplete(true);
      window.setTimeout(onComplete, 250);
    }
  };

  const handleNext = () => {
    setSampleIndex((prev) => (prev + 1) % samples.length);
    setSelectedOutcome(null);
    setSubmitted(false);
  };

  return (
    <div className="space-y-4">
      <p>
        Classification predicts a <strong>label</strong>, not a number. This week’s notebook uses student features to predict whether someone is likely to <strong>pass</strong> or <strong>need more support</strong>.
      </p>
      <Surface>
        <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[24px] border bg-background/70 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Unseen student
                </div>
                <div className="mt-1 text-lg font-semibold">Predict the class label</div>
              </div>
              <Tag label="Label hidden" tone="violet" />
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                ['Study time', `${sample.studyTime.toFixed(1)} h / week`],
                ['Past failures', `${sample.pastFailures}`],
                ['Absences', `${sample.absences}`],
                ['Did lab', sample.didLab ? 'Yes' : 'No'],
                ['Sleep', `${sample.sleepHours.toFixed(1)} h / night`],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    {label}
                  </div>
                  <div className="mt-2 text-lg font-semibold">{value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {(['Pass', 'Needs more support'] as StudentOutcome[]).map((outcome) => (
              <button
                key={outcome}
                type="button"
                onClick={() => !submitted && setSelectedOutcome(outcome)}
                className={cn(
                  'w-full rounded-2xl border p-4 text-left transition-colors',
                  selectedOutcome === outcome ? 'border-primary bg-primary/5' : 'hover:bg-muted/60',
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="font-semibold">{outcome}</div>
                  <OutcomePill outcome={outcome} />
                </div>
              </button>
            ))}
            {!submitted ? (
              <Button size="sm" onClick={handleCheck} disabled={!selectedOutcome}>
                Check label
              </Button>
            ) : (
              <div className="space-y-3">
                <div
                  className={cn(
                    'rounded-xl px-3 py-2 text-sm',
                    correct
                      ? 'bg-green-500/10 text-green-700 dark:text-green-300'
                      : 'bg-red-500/10 text-red-700 dark:text-red-300',
                  )}
                >
                  {correct
                    ? `Correct. ${sample.summary}`
                    : `Not quite. The best label is ${sample.outcome}. ${sample.summary}`}
                </div>
                <div className="flex flex-wrap gap-3">
                  {!correct && (
                    <Button size="sm" variant="outline" onClick={() => setSubmitted(false)}>
                      Retry this student
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={handleNext}>
                    Try another student
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Surface>
      <CalloutBox type="key-idea" title="Classification framing">
        <p>
          The input is a feature vector. The output is one discrete class label. That is the shift from regression to classification.
        </p>
      </CalloutBox>
    </div>
  );
}

function TrainTestSplitExplorer({ onComplete }: { onComplete: () => void }) {
  const supporting = (
    <Surface className="p-4">
      <div className="grid gap-3 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">
        <div className="rounded-2xl border p-4">
          <div className="text-sm font-semibold">Student-success dataset</div>
          <div className="mt-1 text-sm text-muted-foreground">Feature rows paired with pass/support labels</div>
        </div>
        <div className="text-center text-muted-foreground">→</div>
        <div className="rounded-2xl border border-blue-500/40 bg-blue-500/5 p-4">
          <div className="text-sm font-semibold">Train split</div>
          <div className="mt-1 text-sm text-muted-foreground">Fit the tree or forest</div>
        </div>
        <div className="text-center text-muted-foreground">→</div>
        <div className="rounded-2xl border p-4">
          <div className="text-sm font-semibold">Model</div>
          <div className="mt-1 text-sm text-muted-foreground">Learns from the training rows only</div>
        </div>
        <div className="text-center text-muted-foreground">→</div>
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/5 p-4">
          <div className="text-sm font-semibold">Test split</div>
          <div className="mt-1 text-sm text-muted-foreground">Check unseen performance</div>
        </div>
      </div>
    </Surface>
  );

  return (
    <ChoiceExercise
      prompt="Which setup keeps the pass/support evaluation fair?"
      supporting={supporting}
      options={[
        {
          id: 'held-out-stratified',
          label: 'Hold out a test split and stratify by the class label',
          detail: 'Protects unseen evaluation and keeps pass/support balance similar',
          correct: true,
          explanation: 'Correct. The notebook hides the test rows until the end and uses `stratify=y` so the pass/support balance stays fair in both splits.',
        },
        {
          id: 'train-only',
          label: 'Train and evaluate on the same rows',
          detail: 'Looks good on paper, but leaks the answer',
          correct: false,
          explanation: 'That makes accuracy look better than it really is, because the model already saw those students during training.',
        },
        {
          id: 'random-no-balance',
          label: 'Randomly split without checking class balance',
          detail: 'Can skew the pass/support ratio across train and test',
          correct: false,
          explanation: 'You still need a held-out split, but for class labels you also want similar class balance across both splits.',
        },
      ]}
      onComplete={onComplete}
    />
  );
}

function ClassificationMethodsSurvey({ onComplete }: { onComplete: () => void }) {
  const methods = [
    {
      id: 'rules',
      title: 'Rule-based systems',
      summary: 'Hand-written if/then rules from experts.',
      strength: 'Useful when the logic is explicit and stable.',
      risk: 'Brittle when the data is messy or shifting.',
    },
    {
      id: 'nearest',
      title: 'Nearest neighbor',
      summary: 'Compare a new example to similar training examples.',
      strength: 'Simple and intuitive distance-based baseline.',
      risk: 'Sensitive to feature scaling and noisy neighbors.',
    },
    {
      id: 'tree',
      title: 'Decision trees',
      summary: 'Split on features until the classes separate enough.',
      strength: 'Readable rules and easy feature interpretation.',
      risk: 'Can overfit if the tree grows too deep.',
    },
    {
      id: 'prob',
      title: 'Probabilistic methods',
      summary: 'Model uncertainty and class probabilities directly.',
      strength: 'Good when uncertainty matters.',
      risk: 'Strong assumptions can hurt if they are wrong.',
    },
    {
      id: 'svm',
      title: 'Support vector machines',
      summary: 'Find a separating boundary with good margin.',
      strength: 'Strong classic classifier for structured data.',
      risk: 'Less interpretable and harder to explain visually.',
    },
    {
      id: 'nn',
      title: 'Neural networks',
      summary: 'Learn flexible representations from data.',
      strength: 'Powerful across vision, audio, and language.',
      risk: 'Needs more data and is less transparent.',
    },
    {
      id: 'ensemble',
      title: 'Ensemble methods',
      summary: 'Combine many weaker models into one stronger vote.',
      strength: 'Often more stable than a single tree.',
      risk: 'Harder to interpret model-by-model.',
    },
  ] as const;
  const [selectedId, setSelectedId] = useState<(typeof methods)[number]['id']>('tree');
  const [visited, setVisited] = useState<Set<(typeof methods)[number]['id']>>(
    () => new Set(['tree']),
  );
  const [didComplete, setDidComplete] = useState(false);
  const selected = methods.find((method) => method.id === selectedId) ?? methods[0];

  useEffect(() => {
    if (visited.size >= 3 && !didComplete) {
      setDidComplete(true);
      onComplete();
    }
  }, [didComplete, onComplete, visited]);

  const handleSelect = (id: (typeof methods)[number]['id']) => {
    setSelectedId(id);
    setVisited((prev) => new Set(prev).add(id));
  };

  return (
    <div className="space-y-4">
      <p>
        The lecture surveys several ways to do classification. This week’s lab goes deepest on <strong>decision trees</strong> and <strong>random forests</strong>, but the map matters first.
      </p>
      <Surface>
        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-2">
            {methods.map((method) => (
              <button
                key={method.id}
                type="button"
                onClick={() => handleSelect(method.id)}
                className={cn(
                  'w-full rounded-2xl border p-4 text-left transition-colors',
                  method.id === selectedId ? 'border-primary bg-primary/5' : 'hover:bg-muted/60',
                )}
              >
                <div className="font-semibold">{method.title}</div>
                <div className="mt-1 text-sm text-muted-foreground">{method.summary}</div>
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={selected.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="rounded-[28px] border bg-background/70 p-5"
            >
              <div className="flex flex-wrap gap-2">
                <Tag label="Lecture overview" tone="violet" />
                {(selected.id === 'tree' || selected.id === 'ensemble') && (
                  <Tag label="This week’s notebook" tone="emerald" />
                )}
              </div>
              <h3 className="mt-3 text-2xl font-semibold">{selected.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{selected.summary}</p>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Why use it
                  </div>
                  <div className="mt-2 text-sm">{selected.strength}</div>
                </div>
                <div className="rounded-2xl border p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    What to watch
                  </div>
                  <div className="mt-2 text-sm">{selected.risk}</div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </Surface>
    </div>
  );
}

function DecisionTreePathTracer({ onComplete }: { onComplete: () => void }) {
  const samples = [
    {
      id: 'sample-a',
      outcome: 'Pass' as StudentOutcome,
      profile: {
        didLab: true,
        absences: 2,
        pastFailures: 0,
        studyTime: 8.1,
      },
      ruleSummary: 'Completed lab work plus low absences sends this student to the pass leaf quickly.',
    },
    {
      id: 'sample-b',
      outcome: 'Needs more support' as StudentOutcome,
      profile: {
        didLab: false,
        absences: 6,
        pastFailures: 3,
        studyTime: 4.2,
      },
      ruleSummary: 'No lab plus several prior failures sends this student toward the support branch.',
    },
    {
      id: 'sample-c',
      outcome: 'Pass' as StudentOutcome,
      profile: {
        didLab: false,
        absences: 3,
        pastFailures: 1,
        studyTime: 7.4,
      },
      ruleSummary: 'Even without the lab, modest failures and solid study time still route this case to pass.',
    },
  ];
  const [sampleId, setSampleId] = useState<(typeof samples)[number]['id']>('sample-a');
  const [guess, setGuess] = useState<StudentOutcome | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [didComplete, setDidComplete] = useState(false);
  const sample = samples.find((item) => item.id === sampleId) ?? samples[0];
  const correct = guess === sample.outcome;
  const decisionTrace = (() => {
    const steps: Array<{ question: string; answer: string }> = [
      {
        question: 'Did the student complete the lab?',
        answer: sample.profile.didLab ? 'Yes' : 'No',
      },
    ];

    if (sample.profile.didLab) {
      const manageableAbsences = sample.profile.absences < 7;
      steps.push({
        question: 'Absences < 7?',
        answer: manageableAbsences ? 'Yes' : 'No',
      });
      return {
        steps,
        leaf: {
          outcome: manageableAbsences ? ('Pass' as const) : ('Needs more support' as const),
          reason: manageableAbsences
            ? 'Lab done and absences manageable'
            : 'Too many absences despite doing the lab',
        },
      };
    }

    const repeatedFailures = sample.profile.pastFailures >= 2;
    steps.push({
      question: 'Past failures >= 2?',
      answer: repeatedFailures ? 'Yes' : 'No',
    });

    if (repeatedFailures) {
      return {
        steps,
        leaf: {
          outcome: 'Needs more support' as const,
          reason: 'No lab plus repeated failures',
        },
      };
    }

    const enoughStudyTime = sample.profile.studyTime >= 6;
    steps.push({
      question: 'Study time >= 6?',
      answer: enoughStudyTime ? 'Yes' : 'No',
    });

    return {
      steps,
      leaf: {
        outcome: enoughStudyTime ? ('Pass' as const) : ('Needs more support' as const),
        reason: enoughStudyTime
          ? 'Enough study time to recover'
          : 'Low study time leaves the risk high',
      },
    };
  })();

  const traceStepClass = (highlight: boolean) =>
    cn(
      'rounded-2xl border p-4 transition-colors',
      highlight ? 'border-primary bg-primary/5 shadow-sm' : 'bg-background/70',
    );

  const answerPillClass = (answer: string) =>
    cn(
      'inline-flex rounded-full px-3 py-1 text-xs font-semibold',
      answer === 'Yes'
        ? 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-300'
        : 'bg-amber-500/12 text-amber-700 dark:text-amber-300',
    );

  const traceReady = submitted || correct;
  const visibleSteps = traceReady ? decisionTrace.steps : decisionTrace.steps.slice(0, 1);
  const leafVisible = traceReady;
  const leafHighlight = submitted;

  const handleCheck = () => {
    if (!guess) return;
    setSubmitted(true);
    if (correct && !didComplete) {
      setDidComplete(true);
      window.setTimeout(onComplete, 250);
    }
  };

  return (
    <div className="space-y-4">
      <p>
        A decision tree predicts by following splits. Read the student’s features, choose the label, then inspect the exact path the tree would take.
      </p>
      <Surface>
        <div className="grid gap-5 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {samples.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setSampleId(item.id);
                    setGuess(null);
                    setSubmitted(false);
                  }}
                  className={cn(
                    'rounded-full border px-3 py-2 text-sm transition-colors',
                    item.id === sampleId ? 'border-primary bg-primary/10' : 'hover:bg-muted/60',
                  )}
                >
                  Sample {index + 1}
                </button>
              ))}
            </div>

            <div className="rounded-[24px] border bg-background/70 p-5">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Student features
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  ['Did lab', sample.profile.didLab ? 'Yes' : 'No'],
                  ['Absences', `${sample.profile.absences}`],
                  ['Past failures', `${sample.profile.pastFailures}`],
                  ['Study time', `${sample.profile.studyTime.toFixed(1)} h / week`],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl border p-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      {label}
                    </div>
                    <div className="mt-2 text-lg font-semibold">{value}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {(['Pass', 'Needs more support'] as StudentOutcome[]).map((outcome) => (
                  <button
                    key={outcome}
                    type="button"
                    onClick={() => !submitted && setGuess(outcome)}
                    className={cn(
                      'rounded-full border px-3 py-2 text-sm transition-colors',
                      guess === outcome ? 'border-primary bg-primary/10' : 'hover:bg-muted/60',
                    )}
                  >
                    {outcome}
                  </button>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                {!submitted ? (
                  <Button size="sm" onClick={handleCheck} disabled={!guess}>
                    Check prediction
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <div
                      className={cn(
                        'rounded-xl px-3 py-2 text-sm',
                        correct
                          ? 'bg-green-500/10 text-green-700 dark:text-green-300'
                          : 'bg-red-500/10 text-red-700 dark:text-red-300',
                      )}
                    >
                      {correct
                        ? `Correct. ${sample.ruleSummary}`
                        : `The correct label is ${sample.outcome}. ${sample.ruleSummary}`}
                    </div>
                    {!correct && (
                      <Button size="sm" variant="outline" onClick={() => setSubmitted(false)}>
                        Retry this sample
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border bg-background/70 p-5">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Decision path
            </div>
            <div className="mt-4 space-y-3">
              {visibleSteps.map((step, index) => (
                <div key={`${step.question}-${index}`} className={traceStepClass(traceReady)}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Step {index + 1}
                    </div>
                    <span className={answerPillClass(step.answer)}>{step.answer}</span>
                  </div>
                  <div className="mt-3 text-lg font-semibold">{step.question}</div>
                </div>
              ))}

              {leafVisible ? (
                <div
                  className={cn(
                    'rounded-2xl border p-4 transition-colors',
                    leafHighlight ? 'border-primary bg-primary/10 shadow-sm' : 'bg-background/70',
                  )}
                >
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Leaf prediction
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <OutcomePill outcome={decisionTrace.leaf.outcome} />
                  </div>
                  <div className="mt-3 text-sm text-muted-foreground">{decisionTrace.leaf.reason}</div>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed p-4 text-sm text-muted-foreground">
                  Choose a label and check your prediction to reveal the full branch this student follows.
                </div>
              )}

              <div className="rounded-2xl border bg-muted/30 p-4 text-sm text-muted-foreground">
                This view shows the exact branch the current student takes through the tree, which is more useful than squeezing the entire tree into one crowded diagram.
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Once a node asks a question, the sample only follows one branch. That is why decision trees feel readable: you can inspect the exact rule path to the leaf.
            </p>
          </div>
        </div>
      </Surface>
    </div>
  );
}

function TreeDepthPlayground({ onComplete }: { onComplete: () => void }) {
  const depths = [
    {
      id: 'd1',
      label: 'Depth 1',
      train: 78,
      test: 74,
      verdict: 'Underfit',
      tone: 'amber' as const,
      note: 'One split is too simple. The model misses how study time, failures, and lab completion interact.',
    },
    {
      id: 'd3',
      label: 'Depth 3',
      train: 91,
      test: 88,
      verdict: 'Good fit',
      tone: 'emerald' as const,
      note: 'A moderate tree captures the main student-success pattern without chasing tiny quirks.',
    },
    {
      id: 'd8',
      label: 'Depth 8',
      train: 100,
      test: 79,
      verdict: 'Overfit',
      tone: 'blue' as const,
      note: 'A deep tree can memorize training details and lose generalization on new students.',
    },
  ];
  const [selectedId, setSelectedId] = useState<(typeof depths)[number]['id']>('d3');
  const [visited, setVisited] = useState<Set<(typeof depths)[number]['id']>>(
    () => new Set(['d3']),
  );
  const [didComplete, setDidComplete] = useState(false);
  const selected = depths.find((item) => item.id === selectedId) ?? depths[1];

  useEffect(() => {
    if (visited.size >= 2 && !didComplete) {
      setDidComplete(true);
      onComplete();
    }
  }, [didComplete, onComplete, visited]);

  const handleSelect = (id: (typeof depths)[number]['id']) => {
    setSelectedId(id);
    setVisited((prev) => new Set(prev).add(id));
  };

  return (
    <div className="space-y-4">
      <p>
        Tree depth is the cleanest lab intuition for underfitting versus overfitting. Too shallow misses structure. Too deep memorizes noise.
      </p>
      <Surface>
        <div className="grid gap-5 lg:grid-cols-[0.88fr_1.12fr]">
          <div className="space-y-3">
            {depths.map((depth) => (
              <button
                key={depth.id}
                type="button"
                onClick={() => handleSelect(depth.id)}
                className={cn(
                  'w-full rounded-2xl border p-4 text-left transition-colors',
                  depth.id === selectedId ? 'border-primary bg-primary/5' : 'hover:bg-muted/60',
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="font-semibold">{depth.label}</div>
                  <Tag label={depth.verdict} tone={depth.tone} />
                </div>
                <div className="mt-1 text-sm text-muted-foreground">{depth.note}</div>
              </button>
            ))}
          </div>

          <div className="rounded-[24px] border bg-background/70 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Accuracy pattern
                </div>
                <div className="mt-1 text-2xl font-semibold">{selected.label}</div>
              </div>
              <Tag label={selected.verdict} tone={selected.tone} />
            </div>
            <div className="mt-6 space-y-4">
              {[
                ['Train accuracy', selected.train],
                ['Test accuracy', selected.test],
              ].map(([label, value]) => (
                <div key={label}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span>{label}</span>
                    <span>{value}%</span>
                  </div>
                  <div className="h-3 rounded-full bg-muted">
                    <motion.div
                      className="h-full rounded-full bg-primary"
                      initial={false}
                      animate={{ width: `${value}%` }}
                      transition={{ duration: 0.35 }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-5 text-sm text-muted-foreground">{selected.note}</p>
          </div>
        </div>
      </Surface>
    </div>
  );
}

function RandomForestEnsemble({ onComplete }: { onComplete: () => void }) {
  const samples = [
    {
      id: 'borderline-pass',
      title: 'Borderline pass case',
      details: 'Study 6.1 h · Failures 1 · Absences 5 · Did lab yes · Sleep 6.5 h',
      singleTree: 'Needs more support' as StudentOutcome,
      forestVotes: { Pass: 4, 'Needs more support': 1 },
      note: 'A single tree can wobble on borderline profiles. A forest smooths that variance by voting.',
    },
    {
      id: 'clear-support',
      title: 'Clear support-needed case',
      details: 'Study 3.2 h · Failures 2 · Absences 9 · Did lab no · Sleep 5.6 h',
      singleTree: 'Needs more support' as StudentOutcome,
      forestVotes: { Pass: 0, 'Needs more support': 5 },
      note: 'When the signal is strong, both a single tree and a forest agree on the risk.',
    },
  ] as const;
  const [sampleId, setSampleId] = useState<(typeof samples)[number]['id']>('borderline-pass');
  const [mode, setMode] = useState<'single' | 'forest'>('single');
  const [didComplete, setDidComplete] = useState(false);
  const sample = samples.find((item) => item.id === sampleId) ?? samples[0];

  useEffect(() => {
    if (mode === 'forest' && !didComplete) {
      setDidComplete(true);
      onComplete();
    }
  }, [didComplete, mode, onComplete]);

  const forestWinner = (Object.entries(sample.forestVotes) as [StudentOutcome, number][])
    .sort((a, b) => b[1] - a[1])[0][0];

  return (
    <div className="space-y-4">
      <p>
        Random forests keep the tree idea but reduce variance: many trees vote, instead of trusting one tree completely.
      </p>
      <Surface>
        <div className="flex flex-wrap gap-2">
          {samples.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSampleId(item.id)}
              className={cn(
                'rounded-full border px-3 py-2 text-sm transition-colors',
                item.id === sampleId ? 'border-primary bg-primary/10' : 'hover:bg-muted/60',
              )}
            >
              {item.title}
            </button>
          ))}
        </div>

        <div className="mt-4 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[24px] border bg-background/70 p-5">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Current sample
            </div>
            <div className="mt-2 text-xl font-semibold">{sample.title}</div>
            <div className="mt-1 text-sm text-muted-foreground">{sample.details}</div>
            <div className="mt-5 flex gap-2">
              <Button size="sm" variant={mode === 'single' ? 'default' : 'outline'} onClick={() => setMode('single')}>
                Single tree
              </Button>
              <Button size="sm" variant={mode === 'forest' ? 'default' : 'outline'} onClick={() => setMode('forest')}>
                Random forest
              </Button>
            </div>
            <p className="mt-5 text-sm text-muted-foreground">{sample.note}</p>
          </div>

          <div className="rounded-[24px] border bg-background/70 p-5">
            {mode === 'single' ? (
              <div className="space-y-4">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  One tree says
                </div>
                <div className="text-3xl font-semibold">
                  {sample.singleTree}
                </div>
                <div className="rounded-2xl border p-4 text-sm text-muted-foreground">
                  One tree is easy to inspect, but it can be unstable when the example sits near a class boundary.
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Forest vote
                  </div>
                  <OutcomePill outcome={forestWinner} />
                </div>
                <div className="space-y-3">
                  {(Object.entries(sample.forestVotes) as [StudentOutcome, number][]).map(([outcome, votes]) => (
                    <div key={outcome}>
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span>{outcome}</span>
                        <span>{votes} / 5 trees</span>
                      </div>
                      <div className="h-3 rounded-full bg-muted">
                        <motion.div
                          className="h-full rounded-full bg-primary"
                          initial={false}
                          animate={{ width: `${(votes / 5) * 100}%` }}
                          transition={{ duration: 0.35 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </Surface>
    </div>
  );
}

function ConfusionMatrixExplorer({ onComplete }: { onComplete: () => void }) {
  const classes: StudentOutcome[] = ['Pass', 'Needs more support'];
  const counts = [
    [43, 7],
    [6, 24],
  ];
  const notes: Record<string, string> = {
    '0-0': 'Correct pass predictions. These students passed and the model said pass.',
    '0-1': 'False alarms. These students actually passed, but the model flagged them as needing more support.',
    '1-0': 'Missed support cases. These are the students the model should worry you about, because it predicted pass when extra support was needed.',
    '1-1': 'Correct support predictions. These students landed on the diagonal because actual and predicted labels match.',
  };
  const [selected, setSelected] = useState<{ row: number; col: number }>({ row: 0, col: 1 });
  const [didComplete, setDidComplete] = useState(false);

  const cellKey = `${selected.row}-${selected.col}`;
  const actual = classes[selected.row];
  const predicted = classes[selected.col];
  const count = counts[selected.row][selected.col];

  return (
    <div className="space-y-4">
      <p>
        A confusion matrix turns classifier outputs into something readable: where is the model right, and where does it confuse one class with another?
      </p>
      <Surface>
        <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[24px] border bg-background/70 p-5">
            <div className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Predicted label
            </div>
            <div className="grid grid-cols-[auto_repeat(2,minmax(0,1fr))] gap-2">
              <div />
              {classes.map((label) => (
                <div key={`col-${label}`} className="text-center text-xs font-semibold text-muted-foreground">
                  {label}
                </div>
              ))}
              {classes.map((rowLabel, row) => (
                <div key={`row-${rowLabel}`} className="contents">
                  <div className="flex items-center pr-2 text-xs font-semibold text-muted-foreground">
                    {rowLabel}
                  </div>
                  {classes.map((_, col) => {
                    const isSelected = selected.row === row && selected.col === col;
                    const diagonal = row === col;
                    return (
                      <button
                        key={`${row}-${col}`}
                        type="button"
                        onClick={() => {
                          setSelected({ row, col });
                          if (!didComplete) {
                            setDidComplete(true);
                            onComplete();
                          }
                        }}
                        className={cn(
                          'rounded-2xl border p-4 text-center transition-colors',
                          diagonal ? 'bg-emerald-500/10' : 'bg-amber-500/10',
                          isSelected && 'border-primary ring-2 ring-primary/20',
                        )}
                      >
                        <div className="text-2xl font-semibold">{counts[row][col]}</div>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
            <div className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Actual label
            </div>
          </div>

          <div className="rounded-[24px] border bg-background/70 p-5">
            <div className="flex flex-wrap items-center gap-2">
              <Tag label={`Actual: ${actual}`} tone={OUTCOME_THEME[actual].tone} />
              <Tag label={`Predicted: ${predicted}`} tone={OUTCOME_THEME[predicted].tone} />
            </div>
            <div className="mt-4 text-3xl font-semibold">{count} students</div>
            <p className="mt-3 text-sm text-muted-foreground">
              {notes[cellKey] ?? 'Use the matrix to see which mistakes cluster off the diagonal.'}
            </p>
            <CalloutBox type={selected.row === selected.col ? 'tip' : 'warning'} title={selected.row === selected.col ? 'Diagonal = correct' : 'Off-diagonal = error'}>
              <p>
                {selected.row === selected.col
                  ? 'Diagonal cells are where actual and predicted labels match.'
                  : 'Off-diagonal cells are the mistakes. They show which classes the model tends to confuse.'}
              </p>
            </CalloutBox>
          </div>
        </div>
      </Surface>
    </div>
  );
}

function FeatureImportanceAndErrorAnalysis({ onComplete }: { onComplete: () => void }) {
  const features = [
    {
      id: 'study-time',
      label: 'Study time',
      importance: 0.31,
      why: 'More study time consistently pushes the model toward pass, especially when other risk signals are mild.',
      hardCase: 'High study time does not erase repeated failures or major absences by itself.',
    },
    {
      id: 'past-failures',
      label: 'Past failures',
      importance: 0.24,
      why: 'Repeated failures are a strong warning signal and often create early tree splits.',
      hardCase: 'Some students recover with better study time and attendance, so this is not destiny.',
    },
    {
      id: 'absences',
      label: 'Absences',
      importance: 0.19,
      why: 'Attendance helps separate steady students from high-risk cases.',
      hardCase: 'A few absences are not fatal; the mistakes usually happen in the messy middle range.',
    },
    {
      id: 'did-lab',
      label: 'Did lab',
      importance: 0.16,
      why: 'Lab completion often works like a strong yes/no branch inside the decision tree.',
      hardCase: 'Doing the lab helps, but it does not override weak study habits or many absences.',
    },
    {
      id: 'sleep',
      label: 'Sleep hours',
      importance: 0.1,
      why: 'Sleep is a helpful support feature that nudges borderline cases.',
      hardCase: 'It matters most around the edges; it rarely dominates the decision alone.',
    },
  ] as const;
  const [selectedId, setSelectedId] = useState<(typeof features)[number]['id']>('study-time');
  const [didComplete, setDidComplete] = useState(false);
  const selected = features.find((feature) => feature.id === selectedId) ?? features[0];

  return (
    <div className="space-y-4">
      <p>
        The notebook does not end at accuracy. It also asks which features matter and what kinds of student profiles still confuse the classifier.
      </p>
      <Surface>
        <div className="grid gap-5 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="space-y-3">
            {features.map((feature) => (
              <button
                key={feature.id}
                type="button"
                onClick={() => {
                  setSelectedId(feature.id);
                  if (!didComplete) {
                    setDidComplete(true);
                    onComplete();
                  }
                }}
                className={cn(
                  'w-full rounded-2xl border p-4 text-left transition-colors',
                  feature.id === selectedId ? 'border-primary bg-primary/5' : 'hover:bg-muted/60',
                )}
              >
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div className="font-semibold">{feature.label}</div>
                  <span className="text-sm text-muted-foreground">
                    {(feature.importance * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted">
                  <motion.div
                    className="h-full rounded-full bg-primary"
                    initial={false}
                    animate={{ width: `${feature.importance * 100}%` }}
                    transition={{ duration: 0.35 }}
                  />
                </div>
              </button>
            ))}
          </div>

          <div className="rounded-[24px] border bg-background/70 p-5">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Selected feature
            </div>
            <div className="mt-2 text-2xl font-semibold">{selected.label}</div>
            <p className="mt-3 text-sm text-muted-foreground">{selected.why}</p>

            <div className="mt-5 rounded-2xl border p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Error-analysis angle
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{selected.hardCase}</p>
            </div>

            <CalloutBox type="info" title="Interpretation, not just score">
              <p>
                Feature importance tells you what the model leaned on. Error analysis tells you where that evidence still fails.
              </p>
            </CalloutBox>
          </div>
        </div>
      </Surface>
    </div>
  );
}

function PredictYourOwnSuccess({ onComplete }: { onComplete: () => void }) {
  const [profile, setProfile] = useState<StudentProfile>({
    studyTime: 6.2,
    pastFailures: 1,
    absences: 4,
    didLab: true,
    sleepHours: 6.9,
  });
  const [revealed, setRevealed] = useState(false);
  const [didComplete, setDidComplete] = useState(false);
  const result = estimateStudentPass(profile);

  const updateProfile = <K extends keyof StudentProfile>(key: K, value: StudentProfile[K]) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
    setRevealed(false);
  };

  const handleReveal = () => {
    setRevealed(true);
    if (!didComplete) {
      setDidComplete(true);
      onComplete();
    }
  };

  return (
    <div className="space-y-4">
      <p>
        The notebook ends with a custom profile. Adjust the inputs, then ask the model for a pass probability.
      </p>
      <Surface>
        <div className="grid gap-5 lg:grid-cols-[1fr_0.95fr]">
          <div className="rounded-[24px] border bg-background/70 p-5">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Your student profile
            </div>
            <div className="mt-4 space-y-5">
              <label className="block">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span>Study time</span>
                  <span>{profile.studyTime.toFixed(1)} h / week</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="14"
                  step="0.1"
                  value={profile.studyTime}
                  onChange={(event) => updateProfile('studyTime', Number(event.target.value))}
                  className="w-full"
                />
              </label>

              <label className="block">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span>Past failures</span>
                  <span>{profile.pastFailures}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="3"
                  step="1"
                  value={profile.pastFailures}
                  onChange={(event) => updateProfile('pastFailures', Number(event.target.value))}
                  className="w-full"
                />
              </label>

              <label className="block">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span>Absences</span>
                  <span>{profile.absences}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="25"
                  step="1"
                  value={profile.absences}
                  onChange={(event) => updateProfile('absences', Number(event.target.value))}
                  className="w-full"
                />
              </label>

              <label className="block">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span>Sleep</span>
                  <span>{profile.sleepHours.toFixed(1)} h / night</span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="9.5"
                  step="0.1"
                  value={profile.sleepHours}
                  onChange={(event) => updateProfile('sleepHours', Number(event.target.value))}
                  className="w-full"
                />
              </label>

              <div>
                <div className="mb-2 text-sm">Completed the lab?</div>
                <div className="flex gap-2">
                  {[true, false].map((value) => (
                    <button
                      key={String(value)}
                      type="button"
                      onClick={() => updateProfile('didLab', value)}
                      className={cn(
                        'rounded-full border px-3 py-2 text-sm transition-colors',
                        profile.didLab === value ? 'border-primary bg-primary/10' : 'hover:bg-muted/60',
                      )}
                    >
                      {value ? 'Yes' : 'No'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border bg-background/70 p-5">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Model output
            </div>
            {!revealed ? (
              <div className="mt-4 space-y-4">
                <p className="text-sm text-muted-foreground">
                  Build your profile first, then reveal the class prediction and probability.
                </p>
                <Button size="sm" onClick={handleReveal}>
                  Check my outcome
                </Button>
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                <div className="flex items-center gap-3">
                  <OutcomePill outcome={result.outcome} />
                  <div className="text-3xl font-semibold">{(result.probability * 100).toFixed(0)}%</div>
                </div>
                <div className="text-sm text-muted-foreground">
                  Estimated probability of passing with this synthetic teaching model.
                </div>
                <div className="h-3 rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-300"
                    style={{ width: `${Math.max(4, result.probability * 100)}%` }}
                  />
                </div>
                <CalloutBox type="info" title="Teaching model caveat">
                  <p>
                    This is a classroom intuition tool, not life advice. The model reflects the synthetic pattern used in the notebook, not a real university policy.
                  </p>
                </CalloutBox>
              </div>
            )}
          </div>
        </div>
      </Surface>
    </div>
  );
}

function ColabBridge() {
  return (
    <div className="space-y-4">
      <p>
        The live lesson stops at intuition. The hands-on work now moves to the classification notebook in Google Colab.
      </p>
      <Surface className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Next practical step
          </div>
          <div className="mt-2 text-2xl font-semibold">
            Open the student-success classification notebook
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Continue with <code>lab1_classification_handout.ipynb</code> in Colab for dataset loading, train/test splitting, tree fitting, depth sweeps, random forests, confusion matrices, and your own pass-probability experiment.
          </p>
        </div>
        <div className="rounded-[24px] border bg-background/70 p-5">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Local setup?
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            If you want to run the notebook locally instead of Colab, use the optional setup page at
            {' '}
            <a href="#/ml-setup" className="font-medium text-primary underline underline-offset-2">
              ML Setup
            </a>
            .
          </p>
        </div>
      </Surface>
    </div>
  );
}

export default function Topic10ClassificationPage() {
  const renderCard = useCallback((index: number, onComplete: () => void): ReactNode => {
    const card = CARDS[index];
    const section = SECTIONS.find((item) => item.id === card.sectionId);

    switch (card.component) {
      case 'MLDefinitionHook':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <MLDefinitionHook onComplete={onComplete} />
          </LessonCard>
        );

      case 'ParadigmPlayground':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <ParadigmPlayground onComplete={onComplete} />
          </LessonCard>
        );

      case 'ReinforcementLoopGame':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <ReinforcementLoopGame onComplete={onComplete} />
          </LessonCard>
        );

      case 'SupervisedModelExplorer':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <SupervisedModelExplorer onComplete={onComplete} />
          </LessonCard>
        );

      case 'OutputTypeArcade':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <OutputTypeArcade onComplete={onComplete} />
          </LessonCard>
        );

      case 'DeepLearningDomainAtlas':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <DeepLearningDomainAtlas onComplete={onComplete} />
          </LessonCard>
        );

      case 'QuizIntroML':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <QuizCard questions={QUIZ_101} onComplete={onComplete} />
          </LessonCard>
        );

      case 'ClassificationTaskHook':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <ClassificationTaskHook onComplete={onComplete} />
          </LessonCard>
        );

      case 'TrainTestSplit':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <TrainTestSplitExplorer onComplete={onComplete} />
          </LessonCard>
        );

      case 'ClassificationMethodsSurvey':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <ClassificationMethodsSurvey onComplete={onComplete} />
          </LessonCard>
        );

      case 'DecisionTreePathTracer':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <DecisionTreePathTracer onComplete={onComplete} />
          </LessonCard>
        );

      case 'TreeDepthPlayground':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <TreeDepthPlayground onComplete={onComplete} />
          </LessonCard>
        );

      case 'RandomForestEnsemble':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <RandomForestEnsemble onComplete={onComplete} />
          </LessonCard>
        );

      case 'ConfusionMatrixExplorer':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <ConfusionMatrixExplorer onComplete={onComplete} />
          </LessonCard>
        );

      case 'FeatureImportanceAndErrorAnalysis':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <FeatureImportanceAndErrorAnalysis onComplete={onComplete} />
          </LessonCard>
        );

      case 'PredictYourOwnSuccess':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <PredictYourOwnSuccess onComplete={onComplete} />
          </LessonCard>
        );

      case 'QuizClassification':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <QuizCard questions={QUIZ_102} onComplete={onComplete} />
          </LessonCard>
        );

      case 'ColabBridge':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <ColabBridge />
          </LessonCard>
        );

      default:
        return null;
    }
  }, []);

  return (
    <LessonStepper
      cards={CARDS}
      sections={SECTIONS}
      storagePrefix="lesson-t10-classification"
      renderCard={renderCard}
      enforceRequiredCompletion={false}
    />
  );
}
