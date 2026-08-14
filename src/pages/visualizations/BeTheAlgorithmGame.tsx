import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { RotateCcw, Trophy } from 'lucide-react';
import { bfs, dfs } from '../../lib/search.ts';
import {
  TREE_NODES,
  TREE_GOAL,
  getTreeNeighbors,
  COL_UNSEEN,
  COL_FRINGE,
  COL_EXPLORED,
  COL_GOAL,
  contrastText,
} from './tree-drawing.ts';

type Algorithm = 'bfs' | 'dfs';

interface GameState {
  correctOrder: string[];
  currentStep: number;
  explored: Set<string>;
  fringeList: string[];
  mistakes: number;
  lastWrong: string | null;
  wrongMessage: string | null;
  gameOver: boolean;
}

function computeOrder(algo: Algorithm): string[] {
  const gen = algo === 'bfs'
    ? bfs('A', TREE_GOAL, getTreeNeighbors)
    : dfs('A', TREE_GOAL, getTreeNeighbors);

  const order: string[] = [];
  for (const state of gen) {
    if (state.type === 'expand' && state.current) {
      order.push(state.current);
    }
  }
  return order;
}

function buildFringeAtStep(
  algo: Algorithm,
  step: number,
): string[] {
  // Replay the algorithm up to `step` expansions to get the current fringe
  const gen = algo === 'bfs'
    ? bfs('A', TREE_GOAL, getTreeNeighbors)
    : dfs('A', TREE_GOAL, getTreeNeighbors);

  let expandCount = 0;
  let lastFringe: string[] = ['A'];

  for (const state of gen) {
    if (state.type === 'init') {
      lastFringe = state.fringe.map((e) => e.node);
    }
    if (state.type === 'expand') {
      if (expandCount >= step) {
        // Return the fringe just before this expansion
        return lastFringe;
      }
      expandCount++;
    }
    // After each yield, capture fringe state
    if (state.type === 'check' || state.type === 'expand') {
      lastFringe = state.fringe.map((e) => e.node);
    }
  }
  return lastFringe;
}

const WRONG_HINTS: Record<Algorithm, string> = {
  bfs: 'BFS uses a queue (FIFO) — it expands the node that has been waiting the longest!',
  dfs: 'DFS uses a stack (LIFO) — it expands the most recently added node!',
};

// SVG layout: scale tree-drawing coords to fit viewBox
const SVG_W = 600;
const SVG_H = 300;
const NODE_R = 26;
const SCALE_X = SVG_W / 700;
const SCALE_Y = SVG_H / 280;
const OFFSET_Y = 20;

function nodePos(id: string) {
  const n = TREE_NODES[id];
  return { cx: n.x * SCALE_X + 10, cy: n.y * SCALE_Y + OFFSET_Y };
}

function initialState(algo: Algorithm): GameState {
  return {
    correctOrder: computeOrder(algo),
    currentStep: 0,
    explored: new Set<string>(),
    fringeList: ['A'],
    mistakes: 0,
    lastWrong: null,
    wrongMessage: null,
    gameOver: false,
  };
}

export default function BeTheAlgorithmGame() {
  const [algo, setAlgo] = useState<Algorithm>('bfs');
  const [game, setGame] = useState<GameState>(() => initialState('bfs'));

  const switchAlgo = useCallback((a: Algorithm) => {
    setAlgo(a);
    setGame(initialState(a));
  }, []);

  const reset = useCallback(() => {
    setGame(initialState(algo));
  }, [algo]);

  const handleNodeClick = useCallback(
    (nodeId: string) => {
      if (game.gameOver) return;

      const expected = game.correctOrder[game.currentStep];
      if (nodeId === expected) {
        // Correct!
        const newExplored = new Set(game.explored);
        newExplored.add(nodeId);
        const newStep = game.currentStep + 1;
        const isGoal = nodeId === TREE_GOAL;
        const isLast = newStep >= game.correctOrder.length;
        const done = isGoal || isLast;

        // Compute new fringe
        const newFringe = done ? [] : buildFringeAtStep(algo, newStep);

        if (done) {
          confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
        }

        setGame((prev) => ({
          ...prev,
          explored: newExplored,
          currentStep: newStep,
          fringeList: newFringe,
          lastWrong: null,
          wrongMessage: null,
          gameOver: done,
        }));
      } else {
        // Wrong!
        setGame((prev) => ({
          ...prev,
          mistakes: prev.mistakes + 1,
          lastWrong: nodeId,
          wrongMessage: WRONG_HINTS[algo],
        }));
        // Clear shake after animation
        setTimeout(() => {
          setGame((prev) =>
            prev.lastWrong === nodeId ? { ...prev, lastWrong: null } : prev,
          );
        }, 600);
      }
    },
    [game, algo],
  );

  const fringeSet = useMemo(() => new Set(game.fringeList), [game.fringeList]);

  const accuracy =
    game.currentStep + game.mistakes > 0
      ? Math.round((game.currentStep / (game.currentStep + game.mistakes)) * 100)
      : 100;

  const fringeLabel = algo === 'bfs' ? 'Queue (front → back)' : 'Stack (top → bottom)';

  return (
    <div className="not-prose my-6 rounded-lg border border-border bg-card p-4">
      {/* Header */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-semibold text-foreground">
          🧠 Be the Algorithm
        </h3>
        <div className="flex items-center gap-2">
          {/* Algorithm toggle */}
          <div className="flex rounded-md border border-border text-sm">
            <button
              onClick={() => switchAlgo('bfs')}
              className={`px-3 py-1 rounded-l-md transition-colors ${
                algo === 'bfs'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-accent'
              }`}
            >
              BFS
            </button>
            <button
              onClick={() => switchAlgo('dfs')}
              className={`px-3 py-1 rounded-r-md transition-colors ${
                algo === 'dfs'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-accent'
              }`}
            >
              DFS
            </button>
          </div>
          <button
            onClick={reset}
            className="flex items-center gap-1 rounded-md border border-border px-2 py-1 text-sm text-muted-foreground hover:bg-accent transition-colors"
          >
            <RotateCcw size={14} /> Reset
          </button>
        </div>
      </div>

      {/* Prompt */}
      {!game.gameOver && (
        <p className="mb-3 text-sm text-muted-foreground">
          Which node does <strong>{algo.toUpperCase()}</strong> expand next? Click it!
        </p>
      )}

      {/* SVG Tree */}
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        className="mx-auto mb-3 w-full max-w-2xl"
        role="img"
        aria-label={`${algo.toUpperCase()} game tree`}
      >
        {/* Edges */}
        {Object.values(TREE_NODES).map((node) =>
          node.children.map((childId) => {
            const p = nodePos(node.id);
            const c = nodePos(childId);
            return (
              <line
                key={`${node.id}-${childId}`}
                x1={p.cx}
                y1={p.cy}
                x2={c.cx}
                y2={c.cy}
                stroke="currentColor"
                className="text-border"
                strokeWidth={1.5}
              />
            );
          }),
        )}

        {/* Nodes */}
        {Object.values(TREE_NODES).map((node) => {
          const { cx, cy } = nodePos(node.id);
          const isExplored = game.explored.has(node.id);
          const isFringe = fringeSet.has(node.id);
          const isGoalFound = game.gameOver && node.id === TREE_GOAL && isExplored;
          const isWrong = game.lastWrong === node.id;
          const isClickable = isFringe && !game.gameOver;

          let fill = COL_UNSEEN;
          if (isGoalFound) fill = COL_GOAL;
          else if (isExplored) fill = COL_EXPLORED;
          else if (isFringe) fill = COL_FRINGE;

          return (
            <g
              key={node.id}
              onClick={() => isClickable ? handleNodeClick(node.id) : undefined}
              style={{ cursor: isClickable ? 'pointer' : 'default' }}
            >
              {/* Dashed ring for fringe nodes */}
              {isFringe && !isExplored && !game.gameOver && (
                <circle
                  cx={cx}
                  cy={cy}
                  r={NODE_R + 4}
                  fill="none"
                  stroke={COL_FRINGE}
                  strokeWidth={2}
                  strokeDasharray="4 3"
                  opacity={0.7}
                />
              )}
              <motion.circle
                cx={cx}
                cy={cy}
                r={NODE_R}
                fill={isWrong ? '#ef4444' : fill}
                stroke="currentColor"
                className="text-foreground"
                strokeWidth={1.5}
                animate={
                  isWrong
                    ? { x: [0, -4, 4, -4, 4, 0], transition: { duration: 0.4 } }
                    : isExplored && game.correctOrder[game.currentStep - 1] === node.id
                      ? { scale: [1, 1.15, 1], transition: { duration: 0.3 } }
                      : {}
                }
              />
              <text
                x={cx}
                y={cy}
                textAnchor="middle"
                dominantBaseline="central"
                fill={contrastText(isWrong ? '#ef4444' : fill)}
                fontSize={12}
                fontWeight="bold"
                pointerEvents="none"
                className="select-none"
              >
                {node.id}{node.id === TREE_GOAL ? ' ★' : ''}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Wrong-click message */}
      <AnimatePresence>
        {game.wrongMessage && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-3 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200"
          >
            ✗ Not quite. {game.wrongMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fringe display */}
      {!game.gameOver && (
        <div className="mb-3 rounded-md border border-border bg-muted/50 px-3 py-2">
          <p className="mb-1 text-xs font-medium text-muted-foreground">{fringeLabel}</p>
          <div className="flex flex-wrap gap-1.5">
            {game.fringeList.length === 0 ? (
              <span className="text-xs text-muted-foreground italic">empty</span>
            ) : (
              game.fringeList.map((nodeId, i) => (
                <span
                  key={`${nodeId}-${i}`}
                  className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-mono font-semibold"
                  style={{
                    borderColor: COL_FRINGE,
                    backgroundColor: `${COL_FRINGE}20`,
                    color: 'inherit',
                  }}
                >
                  {nodeId}
                  {i === 0 && (
                    <span className="ml-1 text-[10px] text-muted-foreground">
                      ← next
                    </span>
                  )}
                </span>
              ))
            )}
          </div>
        </div>
      )}

      {/* Score bar */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span>
          Step {game.currentStep}/{game.correctOrder.length}
        </span>
        <span>Mistakes: {game.mistakes}</span>
        <span>Accuracy: {accuracy}%</span>
      </div>

      {/* Game over summary */}
      <AnimatePresence>
        {game.gameOver && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-3 rounded-md border border-green-300 bg-green-50 px-4 py-3 dark:border-green-800 dark:bg-green-950"
          >
            <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
              <Trophy size={18} />
              <span className="font-semibold">Goal reached!</span>
            </div>
            <p className="mt-1 text-sm text-green-700 dark:text-green-300">
              You expanded {game.currentStep} nodes with {game.mistakes} mistake{game.mistakes !== 1 ? 's' : ''} ({accuracy}% accuracy).
              {game.mistakes === 0 && ' Perfect run!'}
            </p>
            <div className="mt-2 flex gap-2">
              <button
                onClick={reset}
                className="rounded-md border border-green-300 dark:border-green-700 px-3 py-1 text-sm text-green-800 dark:text-green-200 hover:bg-green-100 dark:hover:bg-green-900 transition-colors"
              >
                Play again
              </button>
              <button
                onClick={() => switchAlgo(algo === 'bfs' ? 'dfs' : 'bfs')}
                className="rounded-md border border-green-300 dark:border-green-700 px-3 py-1 text-sm text-green-800 dark:text-green-200 hover:bg-green-100 dark:hover:bg-green-900 transition-colors"
              >
                Try {algo === 'bfs' ? 'DFS' : 'BFS'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
