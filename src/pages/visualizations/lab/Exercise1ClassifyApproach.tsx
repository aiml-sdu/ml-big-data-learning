import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ExerciseCard from '@/components/ExerciseCard';
import StepChallenge, { type StepDef } from '@/components/StepChallenge';
import HintPanel from '@/components/HintPanel';

// ---------- Shared quiz step component ----------

interface QuizStepProps {
  question: string;
  options: string[];
  correctIndex: number;
  correctExplanation: string;
  incorrectExplanation: string;
  hints: { label: string; content: string }[];
  onComplete: () => void;
}

function QuizStep({
  question,
  options,
  correctIndex,
  correctExplanation,
  incorrectExplanation,
  hints,
  onComplete,
}: QuizStepProps) {
  const [answer, setAnswer] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [wrongCount, setWrongCount] = useState(0);

  const handleSubmit = useCallback(() => {
    if (answer === null) return;
    const isCorrect = answer === correctIndex;
    setSubmitted(true);
    setCorrect(isCorrect);
    if (isCorrect) {
      onComplete();
    } else {
      setWrongCount((c) => c + 1);
    }
  }, [answer, correctIndex, onComplete]);

  return (
    <div>
      <p className="text-sm text-muted-foreground mb-1">
        Classify the following AI system into one of the 4 approaches:
      </p>
      <p className="text-sm font-medium mb-4">"{question}"</p>

      <div className="grid grid-cols-2 gap-2 my-4">
        {options.map((opt, i) => (
          <button
            key={i}
            type="button"
            onClick={() => { setAnswer(i); setSubmitted(false); }}
            disabled={correct}
            className={`rounded-lg border px-4 py-3 text-sm font-medium transition-all text-left ${
              answer === i
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border hover:border-primary/50'
            } ${correct && i === correctIndex ? 'border-green-500 bg-green-500/10' : ''}
              ${submitted && !correct && answer === i ? 'border-red-500 bg-red-500/10' : ''}`}
          >
            {opt}
          </button>
        ))}
      </div>

      <Button
        size="sm"
        className="h-8 text-xs"
        onClick={handleSubmit}
        disabled={answer === null || correct}
      >
        Check
      </Button>

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
              <Check className="size-4" />
              {correctExplanation}
            </>
          ) : (
            <>
              <X className="size-4" />
              {incorrectExplanation}
            </>
          )}
        </motion.div>
      )}

      {!correct && (
        <HintPanel hints={hints} failCount={wrongCount} />
      )}
    </div>
  );
}

// ---------- Step content components ----------

const OPTIONS = ['Thinking Humanly', 'Thinking Rationally', 'Acting Humanly', 'Acting Rationally'];

function Step1Content({ onComplete }: { onComplete: () => void }) {
  return (
    <QuizStep
      question="Siri answering your questions using pre-recorded phrases and NLP"
      options={OPTIONS}
      correctIndex={2}
      correctExplanation="Correct! Acting Humanly — Siri aims to interact like a human would, which is the Turing Test approach."
      incorrectExplanation="Not quite. Think about whether Siri is trying to think like a human or act like one."
      hints={[
        { label: 'Nudge', content: 'Is Siri trying to think like a human, or act like one?' },
        { label: 'Strategy', content: 'Siri uses NLP to mimic human conversation — it aims to be indistinguishable from a human assistant.' },
        { label: 'Answer', content: 'Acting Humanly — Siri aims to interact like a human would, which is the Turing Test approach.' },
      ]}
      onComplete={onComplete}
    />
  );
}

function Step2Content({ onComplete }: { onComplete: () => void }) {
  return (
    <QuizStep
      question="AlphaFold predicting protein structures by optimizing a scoring function"
      options={OPTIONS}
      correctIndex={3}
      correctExplanation="Correct! Acting Rationally — it's a rational agent that maximizes prediction accuracy."
      incorrectExplanation="Not quite. Think about whether AlphaFold tries to mimic human biologists, or achieve the best result."
      hints={[
        { label: 'Nudge', content: 'Is AlphaFold trying to mimic human biologists, or achieve the best result?' },
        { label: 'Strategy', content: 'AlphaFold optimizes for accuracy, not for thinking or acting like humans.' },
        { label: 'Answer', content: 'Acting Rationally — it\'s a rational agent that maximizes prediction accuracy.' },
      ]}
      onComplete={onComplete}
    />
  );
}

function Step3Content({ onComplete }: { onComplete: () => void }) {
  return (
    <QuizStep
      question="A cognitive science model that simulates how humans solve arithmetic problems step-by-step"
      options={OPTIONS}
      correctIndex={0}
      correctExplanation="Correct! Thinking Humanly — it models human cognition, which is the cognitive modeling approach."
      incorrectExplanation="Not quite. This model doesn't try to get the right answer fastest — it tries to replicate how humans think."
      hints={[
        { label: 'Nudge', content: 'This model doesn\'t try to get the right answer fastest — it tries to replicate how humans think.' },
        { label: 'Strategy', content: 'It uses cognitive science to model the actual thought process humans use.' },
        { label: 'Answer', content: 'Thinking Humanly — it models human cognition, which is the cognitive modeling approach.' },
      ]}
      onComplete={onComplete}
    />
  );
}

// ---------- Main export ----------

export default function Exercise1ClassifyApproach() {
  const steps: StepDef[] = [
    {
      id: 1,
      title: 'Siri & NLP',
      content: (onComplete) => <Step1Content onComplete={onComplete} />,
    },
    {
      id: 2,
      title: 'AlphaFold',
      content: (onComplete) => <Step2Content onComplete={onComplete} />,
    },
    {
      id: 3,
      title: 'Cognitive Model',
      content: (onComplete) => <Step3Content onComplete={onComplete} />,
    },
  ];

  return (
    <ExerciseCard exerciseId="lab-t01-ex1" number={1} title="Classify the Approach" totalSteps={3}>
      <StepChallenge exerciseId="lab-t01-ex1" steps={steps} />
    </ExerciseCard>
  );
}
