import { useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface RegressionChoiceOption {
  label: string;
  correct: boolean;
  explanation: string;
}

interface RegressionMultipleChoiceStepProps {
  prompt: string;
  choices: RegressionChoiceOption[];
  onComplete: () => void;
  visual?: ReactNode;
}

export default function RegressionMultipleChoiceStep({
  prompt,
  choices,
  onComplete,
  visual,
}: RegressionMultipleChoiceStepProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const choice = choices.find((item) => item.label === selected);
  const correct = !!choice?.correct;

  const handleSubmit = () => {
    if (!selected) return;
    setSubmitted(true);
    if (correct) {
      setTimeout(onComplete, 350);
    }
  };

  return (
    <div className="space-y-4">
      {visual}
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
          <div
            className={cn(
              'rounded-lg px-3 py-2 text-sm',
              correct
                ? 'bg-green-500/10 text-green-700 dark:text-green-300'
                : 'bg-red-500/10 text-red-700 dark:text-red-300',
            )}
          >
            {choice?.explanation}
          </div>
          {!correct && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSubmitted(false);
              }}
            >
              Try again
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
