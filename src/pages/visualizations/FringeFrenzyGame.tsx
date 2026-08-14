import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { RotateCcw, Trophy } from 'lucide-react';
import { bfs, dfs, ucs } from '../../lib/search.ts';
import {
  TREE_NODES,
  TREE_GOAL,
  getTreeNeighbors,
  COL_FRINGE,
  COL_EXPLORED,
  contrastText,
} from './tree-drawing.ts';

type Algorithm = 'bfs' | 'dfs' | 'ucs';

interface FringeEvent {
  node: string;
  cost: number;
  correctIndex: number;
}

// Replay the algorithm and extract all "add to fringe" events with the correct insertion index.
// Uses count-based diff so multiple children added at once are all captured.
function computeFringeEvents(algo: Algorithm): FringeEvent[] {
  const gen =
    algo === 'bfs' ? bfs('A', TREE_GOAL, getTreeNeighbors) :
    algo === 'dfs' ? dfs('A', TREE_GOAL, getTreeNeighbors) :
    ucs('A', TREE_GOAL, getTreeNeighbors);

  const events: FringeEvent[] = [];
  let prevFringe: string[] = [];

  for (const state of gen) {
    const curFringe = state.fringe.map((e) => e.node);

    if (state.type === 'check') {
      // Count occurrences in both arrays to find truly new nodes
      const prevCounts = new Map<string, number>();
      for (const n of prevFringe) prevCounts.set(n, (prevCounts.get(n) ?? 0) + 1);

      const curCounts = new Map<string, number>();
      for (const n of curFringe) curCounts.set(n, (curCounts.get(n) ?? 0) + 1);

      // Collect all new nodes (those with higher count in cur than prev)
      const newNodes: string[] = [];
      for (const [n, count] of curCounts) {
        const prev = prevCounts.get(n) ?? 0;
        for (let i = 0; i < count - prev; i++) newNodes.push(n);
      }

      for (const node of newNodes) {
        const idx = curFringe.indexOf(node);
        const cost = state.fringe.find((e) => e.node === node)?.cost ?? 0;
        events.push({ node, cost, correctIndex: idx });
      }
    }

    prevFringe = curFringe;
  }

  return events;
}

const ALGO_LABELS: Record<Algorithm, { name: string; structure: string; hint: string }> = {
  bfs: { name: 'BFS', structure: 'Queue (FIFO)', hint: 'New nodes go to the BACK' },
  dfs: { name: 'DFS', structure: 'Stack (LIFO)', hint: 'New nodes go to the FRONT' },
  ucs: { name: 'UCS', structure: 'Priority Queue', hint: 'Insert by ascending cost' },
};

interface GameState {
  events: FringeEvent[];
  currentEventIdx: number;
  fringe: { node: string; cost: number }[];
  mistakes: number;
  wrongSlot: number | null;
  gameOver: boolean;
  startTime: number;
  endTime: number | null;
}

function initialState(algo: Algorithm): GameState {
  return {
    events: computeFringeEvents(algo),
    currentEventIdx: 0,
    fringe: [{ node: 'A', cost: 0 }],
    mistakes: 0,
    wrongSlot: null,
    gameOver: false,
    startTime: Date.now(),
    endTime: null,
  };
}

// SVG mini tree display
const SVG_W = 500;
const SVG_H = 220;
const NODE_R = 18;
const SCALE_X = SVG_W / 700;
const SCALE_Y = SVG_H / 280;

function nodePos(id: string) {
  const n = TREE_NODES[id];
  return { cx: n.x * SCALE_X + 10, cy: n.y * SCALE_Y + 10 };
}

export default function FringeFrenzyGame() {
  const [algo, setAlgo] = useState<Algorithm>('bfs');
  const [game, setGame] = useState<GameState>(() => initialState('bfs'));
  const wrongTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const switchAlgo = useCallback((a: Algorithm) => {
    setAlgo(a);
    setGame(initialState(a));
  }, []);

  const reset = useCallback(() => {
    setGame(initialState(algo));
  }, [algo]);

  const currentEvent = game.events[game.currentEventIdx] ?? null;

  // Which nodes have been "consumed" (expanded) from the fringe so far
  const expandedNodes = useMemo(() => {
    const set = new Set<string>();
    // Track which nodes were in the fringe but are no longer
    // Simple approach: nodes from events before current that aren't in fringe
    const fringeNodes = new Set(game.fringe.map((f) => f.node));
    for (let i = 0; i < game.currentEventIdx; i++) {
      const ev = game.events[i];
      if (!fringeNodes.has(ev.node)) {
        set.add(ev.node);
      }
    }
    // Also the root 'A' if it's been expanded
    if (game.currentEventIdx > 0) set.add('A');
    return set;
  }, [game.fringe, game.currentEventIdx, game.events]);

  // Number of insertion slots = fringe.length + 1
  const slotCount = game.fringe.length + 1;

  const handleSlotClick = useCallback((slotIndex: number) => {
    if (game.gameOver || !currentEvent) return;

    if (slotIndex === currentEvent.correctIndex) {
      // Correct!
      const newFringe = [...game.fringe];
      newFringe.splice(slotIndex, 0, { node: currentEvent.node, cost: currentEvent.cost });

      const nextIdx = game.currentEventIdx + 1;
      const done = nextIdx >= game.events.length;

      if (done) {
        confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
      }

      setGame((prev) => ({
        ...prev,
        fringe: newFringe,
        currentEventIdx: nextIdx,
        wrongSlot: null,
        gameOver: done,
        endTime: done ? Date.now() : null,
      }));
    } else {
      // Wrong
      setGame((prev) => ({
        ...prev,
        mistakes: prev.mistakes + 1,
        wrongSlot: slotIndex,
      }));
      if (wrongTimeoutRef.current) clearTimeout(wrongTimeoutRef.current);
      wrongTimeoutRef.current = setTimeout(() => {
        setGame((prev) => prev.wrongSlot === slotIndex ? { ...prev, wrongSlot: null } : prev);
      }, 600);
    }
  }, [game.gameOver, game.fringe, game.currentEventIdx, game.events, currentEvent]);

  useEffect(() => {
    return () => { if (wrongTimeoutRef.current) clearTimeout(wrongTimeoutRef.current); };
  }, []);

  const info = ALGO_LABELS[algo];

  return (
    <div className="not-prose my-6 rounded-lg border border-border bg-card p-4">
      {/* Header */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-semibold text-foreground">
          Fringe Frenzy
        </h3>
        <div className="flex items-center gap-2">
          <div className="flex rounded-md border border-border text-sm">
            {(['bfs', 'dfs', 'ucs'] as const).map((a, i) => (
              <button
                key={a}
                onClick={() => switchAlgo(a)}
                className={`px-3 py-1 transition-colors ${
                  i === 0 ? 'rounded-l-md' : i === 2 ? 'rounded-r-md' : ''
                } ${
                  algo === a
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-accent'
                }`}
              >
                {a.toUpperCase()}
              </button>
            ))}
          </div>
          <button
            onClick={reset}
            className="flex items-center gap-1 rounded-md border border-border px-2 py-1 text-sm text-muted-foreground hover:bg-accent transition-colors"
          >
            <RotateCcw size={14} /> Reset
          </button>
        </div>
      </div>

      {/* Instructions */}
      {!game.gameOver && (
        <p className="mb-3 text-sm text-muted-foreground">
          YOU are the {info.structure}. Place each new node at the correct position in the fringe.{' '}
          <strong>{info.hint}.</strong>
        </p>
      )}

      {/* Mini tree SVG */}
      <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="mx-auto mb-3 w-full max-w-xl">
        {Object.values(TREE_NODES).map((node) =>
          node.children.map((childId) => {
            const p = nodePos(node.id);
            const c = nodePos(childId);
            return (
              <line key={`${node.id}-${childId}`} x1={p.cx} y1={p.cy} x2={c.cx} y2={c.cy}
                stroke="currentColor" className="text-border" strokeWidth={1} />
            );
          }),
        )}
        {Object.values(TREE_NODES).map((node) => {
          const { cx, cy } = nodePos(node.id);
          const isExpanded = expandedNodes.has(node.id);
          const isFringe = game.fringe.some((f) => f.node === node.id);
          const isIncoming = currentEvent?.node === node.id;

          let fill = '#9ca3af';
          if (isExpanded) fill = COL_EXPLORED;
          else if (isIncoming) fill = '#ef4444';
          else if (isFringe) fill = COL_FRINGE;

          return (
            <g key={node.id}>
              {isIncoming && (
                <motion.circle cx={cx} cy={cy} r={NODE_R + 4} fill="none" stroke="#ef4444"
                  strokeWidth={2} animate={{ scale: [1, 1.15, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }} />
              )}
              <circle cx={cx} cy={cy} r={NODE_R} fill={fill} stroke="currentColor"
                className="text-foreground" strokeWidth={1} />
              <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central"
                fill={contrastText(fill)} fontSize={10} fontWeight="bold" className="select-none">
                {node.id}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Incoming node */}
      {!game.gameOver && currentEvent && (
        <div className="mb-3 flex items-center justify-center gap-2">
          <span className="text-sm text-muted-foreground">Insert:</span>
          <motion.span
            key={currentEvent.node}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-1 rounded-md border-2 border-red-400 bg-red-50 px-3 py-1 font-mono text-sm font-bold text-red-700 dark:bg-red-950 dark:text-red-300"
          >
            {currentEvent.node}
            {algo === 'ucs' && <span className="text-xs font-normal">(cost: {currentEvent.cost})</span>}
          </motion.span>
        </div>
      )}

      {/* Fringe with insertion slots */}
      {!game.gameOver && (
        <div className="mb-3 rounded-md border border-border bg-muted/50 px-3 py-3">
          <p className="mb-2 text-xs font-medium text-muted-foreground">{info.structure}</p>
          <div className="flex flex-wrap items-center gap-0">
            {Array.from({ length: slotCount }).map((_, slotIdx) => (
              <div key={slotIdx} className="flex items-center">
                {/* Insertion slot */}
                <motion.button
                  onClick={() => handleSlotClick(slotIdx)}
                  className={`mx-0.5 h-10 w-6 rounded border-2 border-dashed transition-colors ${
                    game.wrongSlot === slotIdx
                      ? 'border-red-500 bg-red-100 dark:bg-red-950'
                      : 'border-muted-foreground/30 hover:border-primary hover:bg-primary/10'
                  }`}
                  animate={game.wrongSlot === slotIdx ? { x: [0, -3, 3, -3, 0] } : {}}
                  transition={{ duration: 0.3 }}
                  title={`Insert here (position ${slotIdx})`}
                >
                  <span className="text-[10px] text-muted-foreground/40">↓</span>
                </motion.button>

                {/* Existing fringe node */}
                {slotIdx < game.fringe.length && (
                  <span
                    className="inline-flex items-center rounded-md border px-2.5 py-1.5 font-mono text-xs font-semibold"
                    style={{
                      borderColor: COL_FRINGE,
                      backgroundColor: `${COL_FRINGE}20`,
                    }}
                  >
                    {game.fringe[slotIdx].node}
                    {algo === 'ucs' && (
                      <span className="ml-1 text-[10px] text-muted-foreground">
                        ({game.fringe[slotIdx].cost})
                      </span>
                    )}
                    {slotIdx === 0 && (
                      <span className="ml-1 text-[10px] text-muted-foreground">← next</span>
                    )}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span>Insertions: {game.currentEventIdx}/{game.events.length}</span>
        <span>Mistakes: {game.mistakes}</span>
      </div>

      {/* Hint on wrong */}
      <AnimatePresence>
        {game.wrongSlot !== null && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-2 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200"
          >
            Not there! {info.hint}.
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game over */}
      <AnimatePresence>
        {game.gameOver && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-3 rounded-md border border-green-300 bg-green-50 px-4 py-3 dark:border-green-800 dark:bg-green-950"
          >
            <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
              <Trophy size={18} />
              <span className="font-semibold">Fringe complete!</span>
            </div>
            <p className="mt-1 text-sm text-green-700 dark:text-green-300">
              {game.events.length} insertions with {game.mistakes} mistake{game.mistakes !== 1 ? 's' : ''}.
              {game.mistakes === 0 && ' Perfect run!'}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                onClick={reset}
                className="rounded-md border border-green-300 dark:border-green-700 px-3 py-1 text-sm text-green-800 dark:text-green-200 hover:bg-green-100 dark:hover:bg-green-900 transition-colors"
              >
                Play again
              </button>
              {algo !== 'ucs' && (
                <button
                  onClick={() => switchAlgo(algo === 'bfs' ? 'dfs' : 'ucs')}
                  className="rounded-md border border-green-300 dark:border-green-700 px-3 py-1 text-sm text-green-800 dark:text-green-200 hover:bg-green-100 dark:hover:bg-green-900 transition-colors"
                >
                  Try {algo === 'bfs' ? 'DFS' : 'UCS'}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
