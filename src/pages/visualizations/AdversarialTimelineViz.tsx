import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

interface Milestone {
  year: number;
  label: string;
  tagline: string;
  description: string;
}

const MILESTONES: Milestone[] = [
  {
    year: 1912,
    label: "Zermelo's Theorem",
    tagline: 'Proved that chess has a determined outcome',
    description:
      'Ernst Zermelo published the first formal theorem about game strategy, proving that in chess (and similar finite two-player games), either White can force a win, Black can force a win, or both sides can force a draw. This laid the mathematical foundation for all game-tree search.',
  },
  {
    year: 1949,
    label: 'Claude Shannon',
    tagline: 'Proposed chess algorithms with evaluation + minimax',
    description:
      "Shannon's landmark paper described two strategies for computer chess: Type A (brute-force search) and Type B (selective search with evaluation functions). He introduced the idea of combining minimax with heuristic board evaluation, which became the blueprint for decades of game AI.",
  },
  {
    year: 1952,
    label: 'Arthur Samuel',
    tagline: 'First self-learning checkers program',
    description:
      "Samuel's checkers program at IBM could improve by playing against itself, adjusting its evaluation function over time. It is widely considered the first demonstration of machine learning in games and popularized the term 'machine learning' itself.",
  },
  {
    year: 1997,
    label: 'Deep Blue',
    tagline: 'Beat Kasparov using massive alpha-beta search (200M pos/sec)',
    description:
      "IBM's Deep Blue defeated world chess champion Garry Kasparov in a six-game match. It combined custom hardware evaluating 200 million positions per second with deep alpha-beta pruning, an opening book, and endgame tablebases. It was a watershed moment for AI in the public consciousness.",
  },
  {
    year: 2016,
    label: 'AlphaGo',
    tagline: 'Defeated Lee Sedol using MCTS + deep neural networks',
    description:
      "DeepMind's AlphaGo combined Monte Carlo Tree Search with deep convolutional neural networks trained via supervised learning on human games and reinforcement learning through self-play. Its victory over 18-time world champion Lee Sedol stunned the Go community because the game's branching factor was thought to be intractable for computers.",
  },
  {
    year: 2019,
    label: 'AlphaStar',
    tagline: 'Grandmaster-level StarCraft II via reinforcement learning',
    description:
      "AlphaStar tackled an imperfect-information, real-time strategy game with an enormous action space. It trained through a league of self-play agents and reached Grandmaster level on Battle.net, demonstrating that game AI could scale beyond perfect-information board games to complex, real-time domains.",
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AdversarialTimelineViz() {
  const [expanded, setExpanded] = useState<number | null>(null);

  const toggle = (year: number) => {
    setExpanded(prev => (prev === year ? null : year));
  };

  return (
    <div className="rounded-lg border border-border bg-card p-4 my-6">
      <p className="text-sm font-medium text-muted-foreground mb-5">
        Click a milestone to learn more
      </p>

      <div className="relative ml-4">
        {/* Vertical timeline line */}
        <div className="absolute left-3 top-2 bottom-2 w-px bg-border" />

        <div className="flex flex-col gap-1">
          {MILESTONES.map((m) => {
            const isOpen = expanded === m.year;
            return (
              <div key={m.year} className="relative pl-10">
                {/* Dot */}
                <div
                  className={`absolute left-0 top-3 z-10 size-[26px] rounded-full border-2 flex items-center justify-center transition-colors ${
                    isOpen
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-card text-muted-foreground'
                  }`}
                >
                  <span className="text-[8px] font-bold leading-none">{m.year}</span>
                </div>

                {/* Card */}
                <button
                  type="button"
                  onClick={() => toggle(m.year)}
                  className={`w-full text-left rounded-lg border px-4 py-3 transition-colors cursor-pointer ${
                    isOpen
                      ? 'border-primary/50 bg-primary/5'
                      : 'border-transparent hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-baseline gap-3">
                    <span className="text-sm font-bold text-foreground tabular-nums shrink-0">
                      {m.year}
                    </span>
                    <span className="text-sm font-semibold text-foreground">
                      {m.label}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {m.tagline}
                  </p>
                </button>

                {/* Expandable description */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-3 pt-1">
                        <p className="text-sm leading-relaxed text-foreground/80">
                          {m.description}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
