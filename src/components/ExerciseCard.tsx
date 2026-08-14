import { type ReactNode, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Trophy } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useLabProgress } from '@/hooks/useLabProgress';

interface ExerciseCardProps {
  exerciseId: string;
  number: number;
  title: string;
  totalSteps: number;
  children: ReactNode;
  defaultOpen?: boolean;
}

export default function ExerciseCard({
  exerciseId,
  number,
  title,
  totalSteps,
  children,
  defaultOpen = false,
}: ExerciseCardProps) {
  const [open, setOpen] = useState(defaultOpen);
  const { getProgress } = useLabProgress(exerciseId, totalSteps);
  const { completed, total } = getProgress();
  const allDone = completed === total;

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="rounded-lg border bg-card my-6 overflow-hidden">
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="flex w-full items-center gap-3 px-5 py-4 text-left hover:bg-muted/50 transition-colors"
          >
            <span className="flex items-center justify-center size-8 rounded-full bg-primary text-primary-foreground text-sm font-bold shrink-0">
              {number}
            </span>
            <span className="flex-1 font-semibold text-base">{title}</span>

            {/* Step progress dots */}
            <div className="flex items-center gap-1.5 mr-2">
              {Array.from({ length: total }, (_, i) => {
                const stepNum = i + 1;
                const done = completed >= stepNum;
                const current = completed === i && !allDone;
                return (
                  <div
                    key={i}
                    className={`size-2.5 rounded-full transition-all duration-300 ${
                      done
                        ? 'bg-primary scale-100'
                        : current
                          ? 'ring-2 ring-primary bg-transparent'
                          : 'bg-muted-foreground/30'
                    }`}
                  />
                );
              })}
            </div>

            <AnimatePresence>
              {allDone && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-primary"
                >
                  <Trophy className="size-5" />
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              animate={{ rotate: open ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="size-5 text-muted-foreground" />
            </motion.div>
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="px-5 pb-5 pt-0"
          >
            {children}
          </motion.div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
