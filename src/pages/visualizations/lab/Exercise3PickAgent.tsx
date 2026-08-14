import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ExerciseCard from '@/components/ExerciseCard';
import StepChallenge, { type StepDef } from '@/components/StepChallenge';
import HintPanel from '@/components/HintPanel';

// ---------- Types ----------

interface Scenario {
  title: string;
  description: string;
  correctIndex: number; // 0-3
  feedback: string[]; // feedback for each choice (4 strings)
  explanation: string; // shown after correct answer
  hints: { label: string; content: string }[];
}

// ---------- Agent types ----------

const AGENT_TYPES = [
  { name: 'Simple Reflex', icon: '1', brief: 'Current percept only' },
  { name: 'Model-Based Reflex', icon: '2', brief: 'Tracks internal state' },
  { name: 'Goal-Based', icon: '3', brief: 'Plans toward a goal' },
  { name: 'Utility-Based', icon: '4', brief: 'Optimizes a utility function' },
];

// ---------- Scenario data ----------

const SCENARIOS: Scenario[] = [
  {
    title: 'Automatic Door Opener',
    description:
      'A sensor-activated door at a grocery store. When someone approaches, the door opens. When they pass through, it closes. The door operates the same way regardless of time of day or who the person is.',
    correctIndex: 0,
    feedback: [
      'Correct! A simple reflex is all you need. The rule is straightforward: person detected \u2192 open door, no person \u2192 close door. No memory or planning required.',
      'Overcomplicated! A model-based agent tracks state it can\'t see \u2014 but the door sensor tells you everything you need right now. No need to remember past visitors.',
      'Overkill! A goal-based agent plans sequences of actions. But the door only has one decision to make at any moment: open or closed. No planning needed.',
      'Way overkill! Utility-based agents compare complex tradeoffs. A door just needs: person? \u2192 open. No person? \u2192 close. That\'s it.',
    ],
    explanation:
      'The simplest agent wins here. The door\'s environment is fully observable (sensor sees everything it needs), deterministic, and episodic (each detection event is independent). A condition-action rule is perfect: IF person_detected THEN open ELSE close.',
    hints: [
      { label: 'Nudge', content: 'Does the door need to remember anything about past visitors?' },
      { label: 'Strategy', content: 'If the current sensor reading is all you need to decide, the simplest agent type suffices.' },
      { label: 'Answer', content: 'Simple Reflex \u2014 the rule "person detected \u2192 open" requires no memory, goals, or optimization.' },
    ],
  },
  {
    title: 'Hospital Patient Monitor',
    description:
      'A bedside monitoring system that tracks a patient\'s vital signs (heart rate, blood pressure, oxygen). It must detect concerning TRENDS \u2014 like slowly declining oxygen over 30 minutes \u2014 and alert nurses before a crisis. A single low reading might be a sensor glitch, but a persistent downward trend is dangerous.',
    correctIndex: 1,
    feedback: [
      'Not enough! A simple reflex agent only sees the current reading. It would either miss slow declines or cry wolf on every momentary dip. It can\'t track trends.',
      'Correct! The agent needs an internal model to track vital signs over time and detect trends. But it doesn\'t need to plan \u2014 it just needs rules based on the trend state (e.g., "if oxygen declining for 30 min \u2192 alert").',
      'More than needed! A goal-based agent plans sequences of actions, but the monitor doesn\'t need to plan \u2014 it just needs to recognize patterns in historical data and alert accordingly.',
      'More than needed! The monitor doesn\'t need to weigh tradeoffs between different alert strategies \u2014 it just needs to detect concerning trends and raise alarms.',
    ],
    explanation:
      'The key requirement is detecting TRENDS, not just current values. This requires maintaining internal state (a model of how vitals have changed over time). Simple reflex fails because it can\'t see history. But we don\'t need goal-based planning \u2014 condition-action rules based on the tracked state are sufficient.',
    hints: [
      { label: 'Nudge', content: 'Can you detect a "trend" by looking at only the current reading?' },
      { label: 'Strategy', content: 'Detecting trends requires memory of past readings \u2014 that means internal state. But does it need to plan?' },
      { label: 'Answer', content: 'Model-Based Reflex \u2014 it needs memory of past readings to detect trends, but doesn\'t need to plan actions.' },
    ],
  },
  {
    title: 'Ride-Sharing Price Setting',
    description:
      'An agent that sets ride prices for a ride-sharing service (like Uber\'s surge pricing). It must balance multiple competing objectives: maximize revenue, keep wait times short (so riders don\'t leave), ensure enough drivers are available in each area, and avoid prices so high they drive customers to competitors.',
    correctIndex: 3,
    feedback: [
      'Not nearly enough! Simple reflex can\'t handle the complexity of balancing multiple factors across areas and time.',
      'Not enough! Even tracking state doesn\'t help with the core challenge: BALANCING competing objectives. How do you weigh revenue vs. customer retention vs. driver availability?',
      'Close, but not quite! A goal-based agent can pursue a goal like "serve all riders", but how does it choose between $15 (higher revenue, might lose customers) and $12 (lower revenue, keeps customers)? It needs to compare degrees of desirability.',
      'Correct! Multiple competing objectives (revenue, wait time, driver availability, customer retention) require a utility function that quantifies tradeoffs. Only a utility-based agent can weigh "earn $3 more per ride but lose 5% of customers" against alternatives.',
    ],
    explanation:
      'The critical complexity is MULTIPLE COMPETING OBJECTIVES. A goal-based agent can tell you whether a state achieves a goal, but when you need to compare how "good" different outcomes are \u2014 especially when they trade off against each other \u2014 you need a utility function. Surge pricing is a classic optimization problem: maximize a utility that combines revenue, customer satisfaction, driver supply, and competitive positioning.',
    hints: [
      { label: 'Nudge', content: 'When you have multiple competing objectives, can a simple yes/no goal test tell you which option is better?' },
      { label: 'Strategy', content: 'Revenue vs. retention is a tradeoff \u2014 you need to quantify how much you value each.' },
      { label: 'Answer', content: 'Utility-Based \u2014 balancing multiple competing objectives requires a utility function to compare tradeoffs.' },
    ],
  },
];

// ---------- AgentStep component ----------

function AgentStep({ scenario, onComplete }: { scenario: Scenario; onComplete: () => void }) {
  const [answer, setAnswer] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const handleCheck = useCallback(() => {
    if (answer === null) return;
    setSubmitted(true);
    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);

    if (answer === scenario.correctIndex) {
      setCorrect(true);
      onComplete();
    }
  }, [answer, scenario.correctIndex, attempts, onComplete]);

  return (
    <div>
      <p className="text-sm text-muted-foreground mb-4">{scenario.description}</p>

      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
        Which agent architecture is the simplest that works?
      </p>

      <div className="grid grid-cols-2 gap-2 my-4">
        {AGENT_TYPES.map((agent, i) => (
          <button
            key={i}
            type="button"
            onClick={() => {
              setAnswer(i);
              setSubmitted(false);
            }}
            disabled={correct}
            className={`rounded-lg border px-4 py-3 text-left transition-all ${
              answer === i ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
            } ${correct && i === scenario.correctIndex ? 'border-green-500 bg-green-500/10' : ''}
              ${submitted && !correct && answer === i ? 'border-red-400 bg-red-500/10' : ''}`}
          >
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center size-6 rounded-full bg-muted text-xs font-bold">
                {agent.icon}
              </span>
              <span className="text-sm font-semibold">{agent.name}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{agent.brief}</p>
          </button>
        ))}
      </div>

      {/* Check button */}
      {!correct && (
        <div className="flex items-center gap-3">
          <Button size="sm" className="h-8 text-xs" onClick={handleCheck} disabled={answer === null}>
            Check
          </Button>
          {attempts > 0 && (
            <span className="text-xs text-muted-foreground">
              Attempt {attempts}
            </span>
          )}
        </div>
      )}

      {/* Wrong answer feedback */}
      {submitted && !correct && answer !== null && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-3 rounded-lg border border-red-400/50 bg-red-500/5 p-3"
        >
          <div className="flex items-start gap-2">
            <X className="size-4 text-red-500 mt-0.5 shrink-0" />
            <p className="text-sm text-muted-foreground">{scenario.feedback[answer]}</p>
          </div>
        </motion.div>
      )}

      {/* Correct answer feedback */}
      {correct && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="mt-3 rounded-lg border border-green-500/50 bg-green-500/5 p-3">
            <div className="flex items-start gap-2">
              <Check className="size-4 text-green-500 mt-0.5 shrink-0" />
              <p className="text-sm text-muted-foreground">{scenario.feedback[scenario.correctIndex]}</p>
            </div>
          </div>

          <div className="mt-3 rounded-lg border bg-muted/30 p-4">
            <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
              Why this is the simplest that works
            </h5>
            <p className="text-sm text-muted-foreground">{scenario.explanation}</p>
          </div>
        </motion.div>
      )}

      {!correct && <HintPanel hints={scenario.hints} failCount={attempts} />}
    </div>
  );
}

// ---------- Main export ----------

export default function Exercise3PickAgent() {
  const steps: StepDef[] = [
    {
      id: 1,
      title: SCENARIOS[0].title,
      content: (onComplete) => <AgentStep scenario={SCENARIOS[0]} onComplete={onComplete} />,
    },
    {
      id: 2,
      title: SCENARIOS[1].title,
      content: (onComplete) => <AgentStep scenario={SCENARIOS[1]} onComplete={onComplete} />,
    },
    {
      id: 3,
      title: SCENARIOS[2].title,
      content: (onComplete) => <AgentStep scenario={SCENARIOS[2]} onComplete={onComplete} />,
    },
  ];

  return (
    <ExerciseCard exerciseId="lab-t02-ex3" number={3} title="Pick the Right Agent" totalSteps={3}>
      <StepChallenge exerciseId="lab-t02-ex3" steps={steps} />
    </ExerciseCard>
  );
}
