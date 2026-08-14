import { useState, useCallback } from 'react';
import { motion, Reorder } from 'framer-motion';
import { Check, X, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ExerciseCard from '@/components/ExerciseCard';
import StepChallenge, { type StepDef } from '@/components/StepChallenge';
import HintPanel from '@/components/HintPanel';

// ---------- helpers ----------

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ---------- types ----------

interface TimelineItem {
  id: string;
  label: string;
  year: string;
}

// ---------- reusable ordering step ----------

function OrderingStep({
  items: initialItems,
  onComplete,
}: {
  items: TimelineItem[];
  onComplete: () => void;
}) {
  const [items, setItems] = useState(() => shuffle(initialItems));
  const [submitted, setSubmitted] = useState(false);
  const [correct, setCorrect] = useState(false);

  const correctOrder = initialItems.map((i) => i.id);

  const handleCheck = useCallback(() => {
    const isCorrect = items.every((item, idx) => item.id === correctOrder[idx]);
    setSubmitted(true);
    setCorrect(isCorrect);
    if (isCorrect) onComplete();
  }, [items, correctOrder, onComplete]);

  return (
    <div>
      <p className="text-sm text-muted-foreground mb-4">
        Drag the milestones into chronological order (earliest at top).
      </p>

      <Reorder.Group axis="y" values={items} onReorder={setItems} className="space-y-2">
        {items.map((item) => (
          <Reorder.Item
            key={item.id}
            value={item}
            className={`flex items-center gap-3 rounded-lg border px-4 py-3 bg-card cursor-grab active:cursor-grabbing select-none ${
              submitted && correct
                ? 'border-green-500'
                : submitted && !correct
                  ? 'border-red-300'
                  : 'border-border'
            }`}
          >
            <GripVertical className="size-4 text-muted-foreground shrink-0" />
            <span className="text-sm font-medium">{item.label}</span>
          </Reorder.Item>
        ))}
      </Reorder.Group>

      <div className="mt-4 flex items-center gap-3">
        <Button size="sm" onClick={handleCheck} disabled={correct}>
          Check Order
        </Button>
        {!correct && submitted && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setItems(shuffle(initialItems));
              setSubmitted(false);
            }}
          >
            Shuffle Again
          </Button>
        )}
      </div>

      {submitted && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-2 flex items-center gap-1.5 text-sm font-medium ${
            correct
              ? 'text-green-700 dark:text-green-400'
              : 'text-red-700 dark:text-red-400'
          }`}
        >
          {correct ? (
            <>
              <Check className="size-4" /> Correct!
            </>
          ) : (
            <>
              <X className="size-4" /> Not quite -- check the dates again.
            </>
          )}
        </motion.div>
      )}

      {correct && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 space-y-1">
          {initialItems.map((item) => (
            <div key={item.id} className="text-xs text-muted-foreground">
              <span className="font-mono font-semibold text-primary">{item.year}</span> --{' '}
              {item.label}
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

// ---------- step data ----------

const STEP_1_ITEMS: TimelineItem[] = [
  { id: 'neuron', label: 'McCulloch & Pitts model the first artificial neuron', year: '1943' },
  { id: 'turing', label: 'Turing publishes "Computing Machinery and Intelligence"', year: '1950' },
  { id: 'dartmouth', label: 'Dartmouth Conference coins "artificial intelligence"', year: '1956' },
  { id: 'eliza', label: 'ELIZA chatbot holds first human-computer conversation', year: '1966' },
];

const STEP_2_ITEMS: TimelineItem[] = [
  { id: 'winter1', label: 'First AI Winter — funding dries up', year: '1970s' },
  { id: 'expert', label: 'Expert systems boom in industry', year: '1980s' },
  { id: 'deepblue', label: 'Deep Blue defeats world chess champion Kasparov', year: '1997' },
  { id: 'watson', label: 'Watson wins Jeopardy! against human champions', year: '2011' },
];

const STEP_3_ITEMS: TimelineItem[] = [
  { id: 'alexnet', label: 'AlexNet wins ImageNet — deep learning era begins', year: '2012' },
  { id: 'alphago', label: 'AlphaGo defeats world Go champion Lee Sedol', year: '2016' },
  { id: 'transformer', label: 'Transformer architecture enables modern LLMs', year: '2017' },
  { id: 'llm', label: 'Large language models (GPT, Claude) transform AI', year: '2020s' },
];

// ---------- step content components ----------

function Step1Content({ onComplete }: { onComplete: () => void }) {
  return (
    <div>
      <OrderingStep items={STEP_1_ITEMS} onComplete={onComplete} />
      <HintPanel
        hints={[
          {
            label: 'Nudge',
            content: 'The mathematical model came before the philosophical paper.',
          },
          {
            label: 'Strategy',
            content: 'Neuron model -> Turing paper -> Dartmouth Conference -> ELIZA',
          },
          { label: 'Answer', content: '1943 -> 1950 -> 1956 -> 1966' },
        ]}
      />
    </div>
  );
}

function Step2Content({ onComplete }: { onComplete: () => void }) {
  return (
    <div>
      <OrderingStep items={STEP_2_ITEMS} onComplete={onComplete} />
      <HintPanel
        hints={[
          {
            label: 'Nudge',
            content: 'The first winter came before the expert systems boom.',
          },
          {
            label: 'Strategy',
            content: 'Winter -> Expert systems -> Chess -> Jeopardy!',
          },
          { label: 'Answer', content: '1970s -> 1980s -> 1997 -> 2011' },
        ]}
      />
    </div>
  );
}

function Step3Content({ onComplete }: { onComplete: () => void }) {
  return (
    <div>
      <OrderingStep items={STEP_3_ITEMS} onComplete={onComplete} />
      <HintPanel
        hints={[
          {
            label: 'Nudge',
            content: 'The image recognition breakthrough came before the game-playing one.',
          },
          {
            label: 'Strategy',
            content: 'ImageNet -> Go -> Transformers -> LLMs',
          },
          { label: 'Answer', content: '2012 -> 2016 -> 2017 -> 2020s' },
        ]}
      />
    </div>
  );
}

// ---------- main export ----------

export default function Exercise2TimelineOrder() {
  const steps: StepDef[] = [
    {
      id: 1,
      title: 'The Foundations (1940s-1960s)',
      content: (onComplete) => <Step1Content onComplete={onComplete} />,
    },
    {
      id: 2,
      title: 'Winters and Comebacks (1970s-2000s)',
      content: (onComplete) => <Step2Content onComplete={onComplete} />,
    },
    {
      id: 3,
      title: 'The Deep Learning Revolution (2012-present)',
      content: (onComplete) => <Step3Content onComplete={onComplete} />,
    },
  ];

  return (
    <ExerciseCard exerciseId="lab-t01-ex2" number={2} title="AI Timeline Ordering" totalSteps={3}>
      <StepChallenge exerciseId="lab-t01-ex2" steps={steps} />
    </ExerciseCard>
  );
}
