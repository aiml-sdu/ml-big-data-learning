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
  hints: { label: string; content: string }[];
  answers: {
    performance: string[];
    environment: string[];
    actuators: string[];
    sensors: string[];
  };
  fullAnswer: {
    performance: string;
    environment: string;
    actuators: string;
    sensors: string;
  };
}

// ---------- Scenario data ----------

const SCENARIOS: Scenario[] = [
  {
    title: 'Movie Recommendation Engine',
    description:
      'Design a movie recommendation agent (like Netflix\'s algorithm). It suggests movies to individual users based on their viewing history, ratings, and preferences.',
    hints: [
      { label: 'Nudge', content: 'Think about what Netflix optimizes for \u2014 what makes a recommendation "good"?' },
      { label: 'Strategy', content: 'P = what you measure success by. E = the world the agent operates in. A = how it affects that world. S = how it gathers information.' },
      { label: 'Answer', content: 'P: satisfaction/engagement, E: catalog + users, A: display recommendations, S: watch history + ratings' },
    ],
    answers: {
      performance: ['relevance', 'satisfaction', 'click', 'watch', 'engagement', 'rating'],
      environment: ['user', 'catalog', 'movie', 'database', 'platform'],
      actuators: ['recommend', 'display', 'suggest', 'list', 'notification'],
      sensors: ['rating', 'watch', 'click', 'history', 'browse', 'preference', 'profile'],
    },
    fullAnswer: {
      performance: 'User satisfaction, click-through rate, watch completion rate',
      environment: 'Movie catalog, user profiles, streaming platform',
      actuators: 'Display recommendations, send notifications, update homepage',
      sensors: 'Watch history, ratings, click data, browse patterns, user profile',
    },
  },
  {
    title: 'Delivery Drone',
    description:
      'Design an autonomous drone delivery agent. It picks up packages from a warehouse and delivers them to customers\' addresses, navigating urban environments.',
    hints: [
      { label: 'Nudge', content: 'A drone needs to navigate 3D space \u2014 what sensors help with that?' },
      { label: 'Strategy', content: 'Think about what could go wrong (wind, obstacles, wrong address) and what sensors/actuators handle those.' },
      { label: 'Answer', content: 'P: delivery time + safety, E: urban airspace + weather, A: rotors + gripper, S: GPS + cameras + lidar' },
    ],
    answers: {
      performance: ['delivery', 'time', 'safe', 'damage', 'speed', 'success', 'cost', 'efficient'],
      environment: ['urban', 'city', 'building', 'weather', 'airspace', 'obstacle', 'street', 'outdoor'],
      actuators: ['rotor', 'motor', 'propeller', 'fly', 'gripper', 'release', 'navigate', 'arm'],
      sensors: ['camera', 'gps', 'lidar', 'radar', 'imu', 'accelerometer', 'gyro', 'barometer', 'ultrasonic'],
    },
    fullAnswer: {
      performance: 'Delivery time, safety, package condition, energy efficiency',
      environment: 'Urban airspace, buildings, weather, other aircraft, obstacles',
      actuators: 'Rotors/propellers for flight, gripper to hold/release packages',
      sensors: 'GPS, cameras, lidar, barometer, accelerometer, gyroscope',
    },
  },
  {
    title: 'Customer Service Chatbot',
    description:
      'Design a customer service chatbot for an e-commerce company. It handles order inquiries, returns, complaints, and basic product questions via text conversation.',
    hints: [
      { label: 'Nudge', content: 'What actions can a chatbot actually take beyond just replying?' },
      { label: 'Strategy', content: 'Chatbots can trigger actions in backend systems \u2014 refunds, escalations, email. Those are actuators too.' },
      { label: 'Answer', content: 'P: resolution rate + satisfaction, E: conversations + order DB, A: text replies + trigger refunds/escalation, S: text input + database lookups' },
    ],
    answers: {
      performance: ['resolution', 'satisfaction', 'response', 'time', 'accuracy', 'escalation', 'resolved'],
      environment: ['customer', 'order', 'database', 'product', 'inventory', 'text', 'chat', 'conversation'],
      actuators: ['text', 'message', 'response', 'reply', 'display', 'send', 'email', 'initiate', 'trigger'],
      sensors: ['text', 'message', 'input', 'query', 'order', 'database', 'history', 'customer'],
    },
    fullAnswer: {
      performance: 'Resolution rate, customer satisfaction, response time, accuracy',
      environment: 'Customer conversations, order database, product catalog, company policies',
      actuators: 'Send text responses, initiate refunds, escalate to human agent, send email confirmations',
      sensors: 'Customer text input, order database lookups, customer history',
    },
  },
];

// ---------- PEAS field metadata ----------

const PEAS_FIELDS = ['performance', 'environment', 'actuators', 'sensors'] as const;
type PEASField = (typeof PEAS_FIELDS)[number];

const FIELD_LABELS: Record<PEASField, string> = {
  performance: 'P \u2014 Performance',
  environment: 'E \u2014 Environment',
  actuators: 'A \u2014 Actuators',
  sensors: 'S \u2014 Sensors',
};

// ---------- PEASStep component ----------

function PEASStep({ scenario, onComplete }: { scenario: Scenario; onComplete: () => void }) {
  const [values, setValues] = useState<Record<PEASField, string>>({
    performance: '',
    environment: '',
    actuators: '',
    sensors: '',
  });
  const [results, setResults] = useState<Record<PEASField, boolean | null>>({
    performance: null,
    environment: null,
    actuators: null,
    sensors: null,
  });
  const [attempts, setAttempts] = useState(0);
  const [done, setDone] = useState(false);
  const [allCorrect, setAllCorrect] = useState(false);

  const handleCheck = useCallback(() => {
    const newResults = {} as Record<PEASField, boolean>;
    let perfect = true;

    for (const field of PEAS_FIELDS) {
      const input = values[field].toLowerCase();
      const found = scenario.answers[field].some((kw) => input.includes(kw.toLowerCase()));
      newResults[field] = found;
      if (!found) perfect = false;
    }

    setResults(newResults);
    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);

    if (perfect) {
      setAllCorrect(true);
      setDone(true);
      onComplete();
    } else if (nextAttempts >= 3) {
      setDone(true);
      onComplete();
    }
  }, [values, scenario, attempts, onComplete]);

  return (
    <div>
      <p className="text-sm text-muted-foreground mb-4">{scenario.description}</p>

      <div className="space-y-3 my-4">
        {PEAS_FIELDS.map((field) => (
          <div key={field}>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {FIELD_LABELS[field]}
            </label>
            <input
              type="text"
              value={values[field]}
              onChange={(e) => setValues((v) => ({ ...v, [field]: e.target.value }))}
              disabled={done}
              placeholder={`Enter ${field}...`}
              className={`mt-1 w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40 ${
                results[field] === true
                  ? 'border-green-500'
                  : results[field] === false
                    ? 'border-red-400'
                    : 'border-border'
              }`}
            />
            {results[field] === false && !done && (
              <p className="text-xs text-red-500 mt-1">Try to include more specific keywords.</p>
            )}
          </div>
        ))}
      </div>

      {!done && (
        <div className="flex items-center gap-3">
          <Button size="sm" className="h-8 text-xs" onClick={handleCheck}>
            Check
          </Button>
          {attempts > 0 && (
            <span className="text-xs text-muted-foreground">
              Attempt {attempts}/3
            </span>
          )}
        </div>
      )}

      {/* Feedback after checking */}
      {done && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {allCorrect ? (
            <div className="flex items-center gap-1.5 text-sm font-medium text-green-700 dark:text-green-400 mb-3">
              <Check className="size-4" />
              All fields correct! Great PEAS analysis.
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-sm font-medium text-amber-700 dark:text-amber-400 mb-3">
              <X className="size-4" />
              Out of attempts. Here's the complete answer:
            </div>
          )}

          {/* Reveal full answer card */}
          <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
            <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
              Correct PEAS Analysis
            </h5>
            {PEAS_FIELDS.map((field) => (
              <div key={field} className="text-sm">
                <span className="font-semibold text-primary">
                  {field.charAt(0).toUpperCase()}:
                </span>{' '}
                <span className="text-muted-foreground">{scenario.fullAnswer[field]}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {!done && <HintPanel hints={scenario.hints} failCount={attempts} />}
    </div>
  );
}

// ---------- Main export ----------

export default function Exercise1PEASChallenge() {
  const steps: StepDef[] = [
    {
      id: 1,
      title: SCENARIOS[0].title,
      content: (onComplete) => <PEASStep scenario={SCENARIOS[0]} onComplete={onComplete} />,
    },
    {
      id: 2,
      title: SCENARIOS[1].title,
      content: (onComplete) => <PEASStep scenario={SCENARIOS[1]} onComplete={onComplete} />,
    },
    {
      id: 3,
      title: SCENARIOS[2].title,
      content: (onComplete) => <PEASStep scenario={SCENARIOS[2]} onComplete={onComplete} />,
    },
  ];

  return (
    <ExerciseCard exerciseId="lab-t02-ex1" number={1} title="PEAS Design Challenge" totalSteps={3}>
      <StepChallenge exerciseId="lab-t02-ex1" steps={steps} />
    </ExerciseCard>
  );
}
