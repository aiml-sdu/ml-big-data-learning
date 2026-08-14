import { useState } from 'react';
import { Lightbulb, ChevronRight, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface HintLevel {
  label: string;
  content: string;
}

interface HintPanelProps {
  hints: HintLevel[];
  /** Number of wrong attempts — drives progressive unlock for multi-hint mode */
  failCount?: number;
  /** Fail thresholds to unlock each hint level (default [2, 4, 6]) */
  thresholds?: number[];
}

const DEFAULT_THRESHOLDS = [2, 4, 6];

export default function HintPanel({
  hints,
  failCount,
  thresholds = DEFAULT_THRESHOLDS,
}: HintPanelProps) {
  const [open, setOpen] = useState(false);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  // Manual mode: how many hints have been revealed via button
  const [manualRevealed, setManualRevealed] = useState(0);

  if (hints.length === 0) return null;

  const isManualMode = failCount === undefined;
  const isSingleHint = hints.length === 1;

  // How many hints are unlocked?
  const unlockedCount = isSingleHint
    ? 1
    : isManualMode
      ? manualRevealed
      : thresholds.reduce((count, t) => (failCount >= t ? count + 1 : count), 0);

  const handleRevealNext = () => {
    setManualRevealed((n) => Math.min(n + 1, hints.length));
  };

  const toggleHint = (idx: number) => {
    setExpandedIdx(expandedIdx === idx ? null : idx);
  };

  return (
    <div className="border-t px-4 py-3">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <Lightbulb className="size-3.5" />
        {open
          ? (isSingleHint ? 'Hide hint' : 'Hide hints')
          : (isSingleHint ? 'Show hint' : 'Show hints')}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {isSingleHint ? (
              /* Single hint: just show the text */
              <p className="text-sm text-muted-foreground mt-2 italic">
                {hints[0].content}
              </p>
            ) : (
              /* Multi-hint: expandable rows */
              <div className="mt-2 space-y-1">
                {hints.map((hint, idx) => {
                  const isUnlocked = idx < unlockedCount;
                  const isExpanded = expandedIdx === idx;

                  if (!isUnlocked) {
                    // Locked hint
                    const neededFails = isManualMode
                      ? null
                      : thresholds[idx] - failCount;
                    return (
                      <div
                        key={idx}
                        className="flex items-center gap-2 rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground/60"
                      >
                        <Lock className="size-3" />
                        <span className="font-medium">{hint.label}</span>
                        {neededFails != null && neededFails > 0 && (
                          <span className="ml-auto text-[10px]">
                            Try {neededFails} more time{neededFails > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    );
                  }

                  return (
                    <div key={idx}>
                      <button
                        type="button"
                        onClick={() => toggleHint(idx)}
                        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs text-muted-foreground hover:bg-muted/50 transition-colors"
                      >
                        <motion.div
                          animate={{ rotate: isExpanded ? 90 : 0 }}
                          transition={{ duration: 0.15 }}
                        >
                          <ChevronRight className="size-3" />
                        </motion.div>
                        <span className="font-medium">{hint.label}</span>
                      </button>
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.15 }}
                            className="overflow-hidden"
                          >
                            <p className="text-sm text-muted-foreground italic px-3 pb-2 pl-8">
                              {hint.content}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}

                {/* "Reveal next hint" button in manual mode */}
                {isManualMode && unlockedCount < hints.length && (
                  <button
                    type="button"
                    onClick={handleRevealNext}
                    className="mt-1 text-xs text-primary hover:text-primary/80 transition-colors font-medium px-3 py-1"
                  >
                    Reveal next hint
                  </button>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
