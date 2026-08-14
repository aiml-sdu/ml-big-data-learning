import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Capability {
  label: string;
  /** 0 = far below human, 0.5 = human-level, 1 = superhuman */
  level: number;
  detail: string;
}

const CAPABILITIES: Capability[] = [
  { label: 'Game Playing', level: 0.95, detail: 'AI is superhuman at chess, Go, poker, and StarCraft. DeepMind\'s AlphaZero mastered chess in 4 hours with no human knowledge.' },
  { label: 'Image Recognition', level: 0.85, detail: 'Surpasses human accuracy on specific benchmarks (e.g., ImageNet). Struggles with adversarial examples and novel contexts.' },
  { label: 'Translation', level: 0.7, detail: 'Near-fluent for common language pairs. Still misses nuance, idioms, and cultural context in complex texts.' },
  { label: 'Creative Generation', level: 0.6, detail: 'Can produce impressive text, images, music, and code. Lacks genuine understanding — remixes patterns rather than creating from insight.' },
  { label: 'Scientific Discovery', level: 0.55, detail: 'AlphaFold solved protein folding. AI accelerates drug discovery and materials science — but still needs human guidance for novel hypotheses.' },
  { label: 'Common Sense', level: 0.25, detail: '"Water is wet, fire is hot" — obvious to a toddler, surprisingly hard for AI. LLMs fake it well but still make bizarre errors.' },
  { label: 'Causal Reasoning', level: 0.2, detail: 'AI finds correlations, not causes. It can predict that umbrellas correlate with rain but can\'t reason that rain causes umbrella use.' },
  { label: 'Long-term Planning', level: 0.15, detail: 'Reasoning over extended time horizons with many unknowns remains extremely difficult. AI excels at short-horizon, well-defined tasks.' },
];

function barColor(level: number): string {
  if (level >= 0.7) return '#22c55e'; // green
  if (level >= 0.45) return '#eab308'; // yellow
  return '#ef4444'; // red
}

function levelLabel(level: number): string {
  if (level >= 0.8) return 'Superhuman';
  if (level >= 0.6) return 'Near-human';
  if (level >= 0.4) return 'Developing';
  return 'Far below human';
}

export default function CapabilitySpectrumViz() {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <div className="not-prose my-6 rounded-lg border border-border bg-card p-4">
      <h3 className="mb-1 text-lg font-semibold text-foreground">AI Capability Spectrum</h3>
      <p className="mb-4 text-sm text-muted-foreground">
        Click any bar to learn more. The dashed line marks human-level performance.
      </p>

      <div className="relative space-y-2">
        {/* Human-level reference */}
        <div className="absolute left-[calc(50%+3rem)] sm:left-[calc(50%+4.5rem)] top-0 bottom-0 border-l-2 border-dashed border-muted-foreground/40 pointer-events-none z-10" />
        <div className="absolute left-[calc(50%+3rem)] sm:left-[calc(50%+4.5rem)] -top-4 text-[10px] text-muted-foreground whitespace-nowrap -translate-x-1/2 z-10">
          Human level
        </div>

        {CAPABILITIES.map((cap, i) => {
          const isExpanded = expanded === i;
          const color = barColor(cap.level);
          return (
            <div key={cap.label}>
              <button
                onClick={() => setExpanded(isExpanded ? null : i)}
                className="flex w-full items-center gap-2 sm:gap-3 group text-left"
              >
                <span className="w-24 sm:w-36 text-xs sm:text-sm font-medium text-foreground shrink-0 text-right">
                  {cap.label}
                </span>
                <div className="flex-1 h-6 rounded-full bg-muted overflow-hidden relative">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${cap.level * 100}%` }}
                    transition={{ duration: 0.8, delay: i * 0.05, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: color }}
                  />
                </div>
                <span className="w-16 text-[10px] text-muted-foreground shrink-0">
                  {levelLabel(cap.level)}
                </span>
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="ml-[6.5rem] sm:ml-[9.5rem] mt-1 mb-2 rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-foreground">
                      {cap.detail}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-xs text-muted-foreground italic">
        AI excels at narrow, well-defined tasks but struggles with things toddlers find easy &mdash; common sense, causal reasoning, and long-term planning.
      </p>
    </div>
  );
}
