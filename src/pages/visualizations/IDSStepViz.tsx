import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, ChevronRight, ChevronLeft, Play, Pause } from 'lucide-react';
import { ids, type SearchState } from '../../lib/search.ts';
import {
  TREE_NODES,
  TREE_GOAL,
  getTreeNeighbors,
  COL_UNSEEN,
  COL_FRINGE,
  COL_CURRENT,
  COL_EXPLORED,
  COL_GOAL,
  COL_PATH,
  contrastText,
} from './tree-drawing.ts';

const SVG_W = 500;
const SVG_H = 260;
const NODE_R = 20;
const SCALE_X = SVG_W / 700;
const SCALE_Y = (SVG_H - 30) / 280;

function nodePos(id: string) {
  const n = TREE_NODES[id];
  return { cx: n.x * SCALE_X + 10, cy: n.y * SCALE_Y + 30 };
}

// Depth levels: A=0, B/C=1, D/E/F/G=2
const NODE_DEPTH: Record<string, number> = { A: 0, B: 1, C: 1, D: 2, E: 2, F: 2, G: 2 };

interface IterationStep {
  state: SearchState;
  depthLimit: number;
  iteration: number;
  totalExpanded: number;
}

function collectIDSSteps(): IterationStep[] {
  const gen = ids('A', TREE_GOAL, getTreeNeighbors);
  const steps: IterationStep[] = [];
  let currentIteration = -1;
  let currentLimit = 0;
  let expanded = 0;

  for (const state of gen) {
    if (state.type === 'init') {
      currentIteration++;
      currentLimit = currentIteration;
    }
    if (state.type === 'expand') expanded++;
    steps.push({
      state,
      depthLimit: currentLimit,
      iteration: currentIteration,
      totalExpanded: expanded,
    });
  }
  return steps;
}

export default function IDSStepViz() {
  const steps = useMemo(collectIDSSteps, []);
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const playRef = useMemo(() => ({ current: false }), []);

  const current = steps[stepIdx];
  const state = current.state;

  // Track which nodes were explored in previous iterations (ghost nodes)
  const prevIterationExplored = useMemo(() => {
    const set = new Set<string>();
    for (let i = 0; i < stepIdx; i++) {
      if (steps[i].iteration < current.iteration && steps[i].state.type === 'expand') {
        set.add(steps[i].state.current!);
      }
    }
    return set;
  }, [stepIdx, steps, current.iteration]);

  // Depth limit line Y position
  const depthLimitY = useMemo(() => {
    const depths = Object.values(TREE_NODES).map((n) => nodePos(n.id).cy);
    const minY = Math.min(...depths);
    const maxY = Math.max(...depths);
    const step = (maxY - minY) / 2;
    return minY + step * current.depthLimit + NODE_R + 8;
  }, [current.depthLimit]);

  // BFS expansion count for comparison
  const bfsExpansions = 7; // A, B, C, D, E, F, G in the 7-node tree

  const stepForward = useCallback(() => {
    setStepIdx((i) => Math.min(i + 1, steps.length - 1));
  }, [steps.length]);

  const stepBack = useCallback(() => {
    setStepIdx((i) => Math.max(i - 1, 0));
  }, []);

  const reset = useCallback(() => {
    setPlaying(false);
    playRef.current = false;
    setStepIdx(0);
  }, [playRef]);

  const togglePlay = useCallback(() => {
    if (playRef.current) {
      playRef.current = false;
      setPlaying(false);
      return;
    }
    playRef.current = true;
    setPlaying(true);
    const tick = () => {
      if (!playRef.current) return;
      setStepIdx((i) => {
        if (i >= steps.length - 1) {
          playRef.current = false;
          setPlaying(false);
          return i;
        }
        return i + 1;
      });
      if (playRef.current) setTimeout(tick, 400);
    };
    setTimeout(tick, 400);
  }, [steps.length, playRef]);

  return (
    <div className="not-prose my-6 rounded-lg border border-border bg-card p-4">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-semibold text-foreground">
          IDS Step-by-Step
        </h3>
        <button
          onClick={reset}
          className="flex items-center gap-1 rounded-md border border-border px-2 py-1 text-sm text-muted-foreground hover:bg-accent transition-colors"
        >
          <RotateCcw size={14} /> Reset
        </button>
      </div>

      {/* Iteration header */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current.iteration}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          className="mb-3 rounded-md bg-primary/10 px-3 py-2 text-center"
        >
          <span className="text-sm font-semibold text-primary">
            Iteration {current.iteration}
          </span>
          <span className="ml-2 text-sm text-muted-foreground">
            (depth limit = {current.depthLimit})
          </span>
        </motion.div>
      </AnimatePresence>

      {/* SVG Tree */}
      <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="mx-auto mb-3 w-full max-w-xl">
        {/* Edges */}
        {Object.values(TREE_NODES).map((node) =>
          node.children.map((childId) => {
            const p = nodePos(node.id);
            const c = nodePos(childId);
            return (
              <line
                key={`${node.id}-${childId}`}
                x1={p.cx} y1={p.cy} x2={c.cx} y2={c.cy}
                stroke="currentColor" className="text-border" strokeWidth={1.5}
              />
            );
          }),
        )}

        {/* Depth limit line */}
        {current.depthLimit <= 2 && (
          <g>
            <line
              x1={10} y1={depthLimitY} x2={SVG_W - 10} y2={depthLimitY}
              stroke="#ef4444" strokeWidth={1.5} strokeDasharray="6 4" opacity={0.6}
            />
            <text
              x={SVG_W - 12} y={depthLimitY - 6}
              textAnchor="end" fontSize={10} fill="#ef4444" opacity={0.8}
            >
              depth limit = {current.depthLimit}
            </text>
          </g>
        )}

        {/* Nodes */}
        {Object.values(TREE_NODES).map((node) => {
          const { cx, cy } = nodePos(node.id);
          const isGhost = prevIterationExplored.has(node.id);
          const isExplored = state.explored.has(node.id);
          const isCurrent = state.current === node.id;
          const isFringe = state.fringe.some((e) => e.node === node.id);
          const isOnPath = state.path?.includes(node.id);
          const isGoalFound = state.type === 'solution' && state.current === node.id;
          const isBeyondLimit = NODE_DEPTH[node.id] > current.depthLimit;

          let fill = COL_UNSEEN;
          let opacity = 1;

          if (isGoalFound) fill = COL_GOAL;
          else if (isOnPath) fill = COL_PATH;
          else if (isCurrent) fill = COL_CURRENT;
          else if (isExplored) fill = COL_EXPLORED;
          else if (isFringe) fill = COL_FRINGE;
          else if (isGhost) { fill = COL_EXPLORED; opacity = 0.25; }

          if (isBeyondLimit && !isExplored && !isCurrent && !isFringe && !isOnPath && !isGoalFound) {
            opacity = 0.35;
          }

          return (
            <g key={node.id} opacity={opacity}>
              <motion.circle
                cx={cx} cy={cy} r={NODE_R}
                fill={fill}
                stroke="currentColor" className="text-foreground"
                strokeWidth={1}
                animate={isCurrent ? { r: [NODE_R, NODE_R + 3, NODE_R] } : { r: NODE_R }}
                transition={isCurrent ? { repeat: Infinity, duration: 0.8 } : {}}
              />
              <text
                x={cx} y={cy}
                textAnchor="middle" dominantBaseline="central"
                fill={contrastText(fill)} fontSize={11} fontWeight="bold"
                className="select-none pointer-events-none"
              >
                {node.id}{node.id === TREE_GOAL ? ' (G)' : ''}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Controls */}
      <div className="flex items-center justify-center gap-2 mb-3">
        <button
          onClick={stepBack}
          disabled={stepIdx === 0}
          className="rounded-md border border-border p-1.5 text-muted-foreground hover:bg-accent transition-colors disabled:opacity-30"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          onClick={togglePlay}
          className="rounded-md border border-border p-1.5 text-muted-foreground hover:bg-accent transition-colors"
        >
          {playing ? <Pause size={16} /> : <Play size={16} />}
        </button>
        <button
          onClick={stepForward}
          disabled={stepIdx >= steps.length - 1}
          className="rounded-md border border-border p-1.5 text-muted-foreground hover:bg-accent transition-colors disabled:opacity-30"
        >
          <ChevronRight size={16} />
        </button>
        <span className="ml-2 text-xs text-muted-foreground">
          Step {stepIdx + 1}/{steps.length}
        </span>
      </div>

      {/* Stats */}
      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mb-2">
        <span>Total nodes expanded: <strong className="text-foreground">{current.totalExpanded}</strong></span>
        <span>Current iteration: <strong className="text-foreground">{current.iteration}</strong></span>
      </div>

      {/* Message */}
      <div className="text-xs text-muted-foreground italic min-h-5">
        {state.message}
      </div>

      {/* Completion summary */}
      <AnimatePresence>
        {state.type === 'solution' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 rounded-md border border-green-300 bg-green-50 px-4 py-3 dark:border-green-800 dark:bg-green-950"
          >
            <p className="text-sm font-semibold text-green-800 dark:text-green-200">
              Goal found!
            </p>
            <p className="mt-1 text-xs text-green-700 dark:text-green-300">
              IDS expanded <strong>{current.totalExpanded}</strong> nodes across {current.iteration + 1} iterations.
              {' '}BFS would expand <strong>{bfsExpansions}</strong> nodes — IDS re-expands some nodes,
              but uses only O(bd) memory instead of O(b<sup>d</sup>).
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
