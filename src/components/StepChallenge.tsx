import { type ReactNode, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLabProgress } from '@/hooks/useLabProgress';

export interface StepDef {
  id: number;
  title: string;
  content: (onComplete: () => void, isComplete: boolean) => ReactNode;
}

interface StepChallengeProps {
  exerciseId: string;
  steps: StepDef[];
  onAllComplete?: () => void;
}

export default function StepChallenge({ exerciseId, steps, onAllComplete }: StepChallengeProps) {
  const { isStepComplete, markStepComplete } = useLabProgress(exerciseId, steps.length);
  const allDone = steps.every((step) => isStepComplete(step.id));
  const [reportedDone, setReportedDone] = useState(false);

  // Find first incomplete step
  const firstIncomplete = steps.findIndex((s) => !isStepComplete(s.id));
  const [activeStep, setActiveStep] = useState(firstIncomplete === -1 ? steps.length - 1 : firstIncomplete);

  useEffect(() => {
    if (allDone && !reportedDone) {
      setReportedDone(true);
      onAllComplete?.();
    }
  }, [allDone, onAllComplete, reportedDone]);

  const handleComplete = (stepId: number) => {
    markStepComplete(stepId);
    // No auto-advance — keep the explanation visible until the user clicks Continue.
  };

  // Compute the next step to navigate to once the current step is complete.
  // Prefer the next incomplete step (skipping ones already done); fall back to the
  // immediate next step so a user redoing earlier work can still move forward.
  const nextActiveStep = (() => {
    const nextIncomplete = steps.findIndex((s, i) => i > activeStep && !isStepComplete(s.id));
    if (nextIncomplete !== -1) return nextIncomplete;
    if (activeStep < steps.length - 1) return activeStep + 1;
    return -1;
  })();
  const currentStepDone = isStepComplete(steps[activeStep].id);

  return (
    <div>
      {/* Step indicator bar */}
      <div className="flex items-center gap-1 mb-5">
        {steps.map((step, i) => {
          const done = isStepComplete(step.id);
          const active = i === activeStep;
          return (
            <div key={step.id} className="flex items-center gap-1">
              {i > 0 && (
                <ChevronRight className="size-3.5 text-muted-foreground/50 shrink-0" />
              )}
              <button
                type="button"
                onClick={() => setActiveStep(i)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                  active
                    ? 'bg-primary text-primary-foreground'
                    : done
                      ? 'bg-primary/15 text-primary'
                      : 'bg-muted text-muted-foreground'
                }`}
              >
                {done && <Check className="size-3" />}
                <span>Step {step.id}</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Step title */}
      <h4 className="text-sm font-semibold text-muted-foreground mb-3">
        Step {steps[activeStep].id}: {steps[activeStep].title}
      </h4>

      {/* Step content with slide transitions */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
        >
          {isStepComplete(steps[activeStep].id) && (
            <div className="mb-3 rounded-lg bg-green-500/10 px-3 py-2 text-sm text-green-700 dark:text-green-300">
              Completed. You can redo this step if you want.
            </div>
          )}
          {steps[activeStep].content(
            () => handleComplete(steps[activeStep].id),
            currentStepDone,
          )}

          {currentStepDone && nextActiveStep !== -1 && (
            <div className="mt-4 flex justify-end">
              <Button
                size="sm"
                onClick={() => setActiveStep(nextActiveStep)}
                className="h-8 text-xs"
              >
                Continue to Step {steps[nextActiveStep].id}
                <ArrowRight className="ml-1.5 size-3.5" />
              </Button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
