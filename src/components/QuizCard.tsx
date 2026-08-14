import { useCallback, useRef, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Zap } from 'lucide-react';
import { useQuizState, type QuizQuestion } from '../hooks/useQuizState.ts';
import { useGamification } from '../hooks/useGamification.ts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface QuizCardProps {
  questions: QuizQuestion[];
  onComplete?: () => void;
}

export { type QuizQuestion };

function fireConfetti(big?: boolean) {
  const opts = big
    ? { particleCount: 120, spread: 80, origin: { y: 0.6 } }
    : { particleCount: 40, spread: 55, origin: { y: 0.7 } };
  confetti(opts);
}

export default function QuizCard({ questions, onComplete }: QuizCardProps) {
  const { streak, recordCorrect, recordWrong } = useGamification();

  const onResult = useCallback(
    (correct: boolean) => {
      if (correct) {
        recordCorrect();
        fireConfetti();
      } else {
        recordWrong();
      }
    },
    [recordCorrect, recordWrong],
  );

  const { states, select, submit } = useQuizState(questions, onResult);

  // Init to true if all questions were already answered (from localStorage)
  // so we don't replay confetti on page load
  const perfectFired = useRef(states.every((s) => s.submitted));
  const completionFired = useRef(false);

  if (questions.length === 0) return null;

  const isMulti = questions.length > 1;
  const allSubmitted = states.every((s) => s.submitted);
  const score = states.reduce(
    (acc, s, i) => (s.submitted && s.selected === questions[i].correctIndex ? acc + 1 : acc),
    0,
  );
  const isPerfect = allSubmitted && score === questions.length;

  // Fire big confetti once when perfect score is first reached
  useEffect(() => {
    if (isPerfect && isMulti && !perfectFired.current) {
      perfectFired.current = true;
      setTimeout(() => fireConfetti(true), 400);
    }
  }, [isPerfect, isMulti]);

  useEffect(() => {
    if (allSubmitted && !completionFired.current) {
      completionFired.current = true;
      onComplete?.();
    }
  }, [allSubmitted, onComplete]);

  return (
    <Card className="my-6">
      <CardHeader>
        <CardTitle className="text-lg">Check yourself</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {questions.map((q, qi) => {
          const state = states[qi];
          return (
            <div key={q.id} className="space-y-3">
              <p className="font-medium">{q.question}</p>
              <div className="space-y-2">
                {q.options.map((opt, oi) => {
                  const isCorrect = state.submitted && oi === q.correctIndex;
                  const isWrong = state.submitted && oi === state.selected && oi !== q.correctIndex;
                  const isSelected = !state.submitted && oi === state.selected;
                  const label = String.fromCharCode(65 + oi);

                  return (
                    <label
                      key={oi}
                      className={cn(
                        'flex items-center gap-3 rounded-lg border-2 px-4 py-3 cursor-pointer transition-colors',
                        isCorrect && 'border-green-500 bg-green-500/10',
                        isWrong && 'border-red-500 bg-red-500/10',
                        isSelected && 'border-primary bg-primary/5',
                        !isCorrect && !isWrong && !isSelected && 'border-border hover:bg-muted/50',
                        state.submitted && 'cursor-default',
                      )}
                    >
                      <input
                        type="radio"
                        name={`quiz-${q.id}`}
                        value={oi}
                        checked={oi === state.selected}
                        disabled={state.submitted}
                        className="sr-only"
                        onChange={() => select(qi, oi)}
                      />
                      <span className={cn(
                        'flex size-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold',
                        isCorrect && 'border-green-500 bg-green-500 text-white',
                        isWrong && 'border-red-500 bg-red-500 text-white',
                        isSelected && 'border-primary bg-primary text-primary-foreground',
                        !isCorrect && !isWrong && !isSelected && 'border-muted-foreground/30',
                      )}>
                        {label}
                      </span>
                      <span className="text-sm">{opt}</span>
                    </label>
                  );
                })}
              </div>
              {!state.submitted ? (
                <Button
                  type="button"
                  disabled={state.selected === null}
                  onClick={() => submit(qi)}
                >
                  Submit
                </Button>
              ) : (
                <div className="space-y-2">
                  <div className={cn(
                    'rounded-lg p-3 text-sm',
                    state.selected === q.correctIndex
                      ? 'bg-green-500/10 text-green-700 dark:text-green-300'
                      : 'bg-red-500/10 text-red-700 dark:text-red-300',
                  )}>
                    <strong>{state.selected === q.correctIndex ? 'Correct!' : 'Not quite.'}</strong>{' '}
                    {q.explanation}
                  </div>
                  <AnimatePresence>
                    {state.selected === q.correctIndex && streak >= 2 && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-1.5 text-sm font-semibold text-orange-500"
                      >
                        <Zap className="size-4" />
                        {streak} in a row!
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          );
        })}
        {isMulti && allSubmitted && (
          isPerfect ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-1 pt-2"
            >
              <Trophy className="size-8 text-yellow-500" />
              <span className="font-bold text-lg">Perfect!</span>
              <span className="text-sm text-muted-foreground">
                {score} / {questions.length}
              </span>
            </motion.div>
          ) : (
            <div className="text-center font-semibold text-lg pt-2">
              Score: {score} / {questions.length}
            </div>
          )
        )}
      </CardContent>
    </Card>
  );
}
