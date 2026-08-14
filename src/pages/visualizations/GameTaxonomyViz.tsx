import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GameInfo {
  name: string;
  description: string;
  zeroSum: boolean;
}

interface QuadrantData {
  title: string;
  subtitle: string;
  games: GameInfo[];
  color: string;
  borderColor: string;
  bgColor: string;
}

const QUADRANTS: QuadrantData[][] = [
  // Row 0: Deterministic
  [
    {
      title: 'Deterministic',
      subtitle: 'Perfect Information',
      color: 'text-blue-600 dark:text-blue-400',
      borderColor: 'border-blue-500',
      bgColor: 'bg-blue-500/10',
      games: [
        { name: 'Chess', description: 'Both players see the full board. No randomness. Pure strategy.', zeroSum: true },
        { name: 'Checkers', description: 'Fully observable board with deterministic moves. Solved in 2007.', zeroSum: true },
        { name: 'Go', description: 'Ancient game with enormous branching factor (~250). AlphaGo conquered it in 2016.', zeroSum: true },
      ],
    },
    {
      title: 'Deterministic',
      subtitle: 'Imperfect Information',
      color: 'text-purple-600 dark:text-purple-400',
      borderColor: 'border-purple-500',
      bgColor: 'bg-purple-500/10',
      games: [
        { name: 'Battleship', description: 'Players cannot see opponent\'s ship placements. No dice, but hidden state.', zeroSum: true },
        { name: 'Stratego', description: 'Pieces have hidden ranks revealed only upon attack. Deterministic combat resolution.', zeroSum: true },
      ],
    },
  ],
  // Row 1: Stochastic
  [
    {
      title: 'Stochastic',
      subtitle: 'Perfect Information',
      color: 'text-emerald-600 dark:text-emerald-400',
      borderColor: 'border-emerald-500',
      bgColor: 'bg-emerald-500/10',
      games: [
        { name: 'Backgammon', description: 'Dice rolls introduce chance, but all pieces are visible. Expectiminimax applies.', zeroSum: true },
        { name: 'Monopoly', description: 'Dice-driven movement on a fully visible board. Chance nodes everywhere.', zeroSum: false },
      ],
    },
    {
      title: 'Stochastic',
      subtitle: 'Imperfect Information',
      color: 'text-amber-600 dark:text-amber-400',
      borderColor: 'border-amber-500',
      bgColor: 'bg-amber-500/10',
      games: [
        { name: 'Poker', description: 'Hidden cards + random deals. Bluffing and probabilistic reasoning are key.', zeroSum: true },
        { name: 'Bridge', description: 'Partner communication via bidding with hidden hands and random card distribution.', zeroSum: true },
        { name: 'Scrabble', description: 'Random tile draws + hidden opponent rack. Combines word knowledge with probability.', zeroSum: true },
      ],
    },
  ],
];

export default function GameTaxonomyViz() {
  const [selected, setSelected] = useState<[number, number] | null>(null);

  const toggle = (r: number, c: number) => {
    setSelected(prev => (prev && prev[0] === r && prev[1] === c) ? null : [r, c]);
  };

  const sel = selected;
  const selData = sel ? QUADRANTS[sel[0]][sel[1]] : null;

  return (
    <div className="rounded-lg border border-border bg-card p-4 my-6">
      <p className="text-sm font-medium text-muted-foreground mb-4">
        Click a quadrant to explore example games
      </p>

      {/* Column headers */}
      <div className="grid grid-cols-[1fr_1fr] gap-3 ml-[100px] mb-2">
        <div className="text-center text-sm font-semibold text-foreground">Perfect Information</div>
        <div className="text-center text-sm font-semibold text-foreground">Imperfect Information</div>
      </div>

      {/* Grid with row headers */}
      <div className="flex flex-col gap-3">
        {QUADRANTS.map((row, r) => (
          <div key={r} className="flex gap-3 items-stretch">
            {/* Row header */}
            <div className="w-[88px] flex items-center justify-center shrink-0">
              <span className="text-sm font-semibold text-foreground -rotate-90 whitespace-nowrap">
                {r === 0 ? 'Deterministic' : 'Stochastic'}
              </span>
            </div>

            {/* Quadrant cards */}
            {row.map((q, c) => {
              const isSelected = sel !== null && sel[0] === r && sel[1] === c;
              return (
                <motion.button
                  key={`${r}-${c}`}
                  type="button"
                  onClick={() => toggle(r, c)}
                  className={`
                    flex-1 rounded-xl border-2 p-4 text-left transition-colors cursor-pointer
                    ${isSelected ? `${q.borderColor} ${q.bgColor}` : 'border-border hover:border-muted-foreground/40 bg-card'}
                  `}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                >
                  <div className={`text-base font-bold ${isSelected ? q.color : 'text-foreground'}`}>
                    {q.subtitle}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {q.games.length} game{q.games.length > 1 ? 's' : ''}
                  </div>
                </motion.button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Expanded game list */}
      <AnimatePresence mode="wait">
        {selData && (
          <motion.div
            key={`${sel![0]}-${sel![1]}`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="mt-4 space-y-2">
              <div className={`text-sm font-semibold ${selData.color}`}>
                {selData.title} + {selData.subtitle}
              </div>
              {selData.games.map((game, i) => (
                <motion.div
                  key={game.name}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.2 }}
                  className="flex items-start gap-3 rounded-lg border border-border bg-muted/50 p-3"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-foreground">{game.name}</span>
                      {game.zeroSum && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-destructive/15 text-destructive border border-destructive/30">
                          Zero-Sum
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {game.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
