import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, ChevronRight, Play, Pause, Trophy, CheckCircle } from 'lucide-react';
import { bfs, dfs, ids, ucs, type SearchState } from '../../lib/search.ts';
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

const SVG_W = 220;
const SVG_H = 140;
const NODE_R = 12;
const SCALE_X = SVG_W / 700;
const SCALE_Y = SVG_H / 300;

function nodePos(id: string) {
  const n = TREE_NODES[id];
  return { cx: n.x * SCALE_X + 5, cy: n.y * SCALE_Y + 10 };
}

type AlgoKey = 'bfs' | 'dfs' | 'ids' | 'ucs';

interface AlgoInfo {
  key: AlgoKey;
  label: string;
  color: string;
}

const ALGOS: AlgoInfo[] = [
  { key: 'bfs', label: 'BFS', color: '#3b82f6' },
  { key: 'dfs', label: 'DFS', color: '#ef4444' },
  { key: 'ids', label: 'IDS', color: '#8b5cf6' },
  { key: 'ucs', label: 'UCS', color: '#f59e0b' },
];

function collectStates(key: AlgoKey): SearchState[] {
  const gen =
    key === 'bfs' ? bfs('A', TREE_GOAL, getTreeNeighbors) :
    key === 'dfs' ? dfs('A', TREE_GOAL, getTreeNeighbors) :
    key === 'ids' ? ids('A', TREE_GOAL, getTreeNeighbors) :
    ucs('A', TREE_GOAL, getTreeNeighbors);
  const states: SearchState[] = [];
  for (const s of gen) states.push(s);
  return states;
}

interface AlgoState {
  states: SearchState[];
  /** Index into expand/check states only (for synchronized stepping) */
  stepStates: number[];
  currentStepIdx: number;
  done: boolean;
  expandCount: number;
  maxFringe: number;
  finishStep: number | null;
  pathCost: number | null;
}

function initAlgo(key: AlgoKey): AlgoState {
  const allStates = collectStates(key);
  // Index of each expand/check state for stepping
  const stepStates: number[] = [];
  for (let i = 0; i < allStates.length; i++) {
    const t = allStates[i].type;
    if (t === 'expand' || t === 'solution' || t === 'failure') {
      stepStates.push(i);
    }
  }
  return {
    states: allStates,
    stepStates,
    currentStepIdx: 0,
    done: false,
    expandCount: 0,
    maxFringe: 0,
    finishStep: null,
    pathCost: null,
  };
}

function advanceAlgo(algo: AlgoState): AlgoState {
  if (algo.done) return algo;
  const nextIdx = algo.currentStepIdx + 1;
  if (nextIdx >= algo.stepStates.length) return { ...algo, done: true };

  const stateIdx = algo.stepStates[nextIdx];
  const state = algo.states[stateIdx];
  const expandCount = algo.expandCount + (state.type === 'expand' ? 1 : 0);
  const maxFringe = Math.max(algo.maxFringe, state.fringe.length);
  const done = state.type === 'solution' || state.type === 'failure';

  return {
    ...algo,
    currentStepIdx: nextIdx,
    done,
    expandCount,
    maxFringe,
    finishStep: done ? nextIdx : null,
    pathCost: state.type === 'solution' ? (state.cost ?? null) : algo.pathCost,
  };
}

function MiniTree({ state, color }: { state: SearchState; color: string }) {
  const fringeNodes = new Set(state.fringe.map((e) => e.node));
  const pathSet = new Set(state.path ?? []);

  return (
    <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full">
      {Object.values(TREE_NODES).map((node) =>
        node.children.map((childId) => {
          const p = nodePos(node.id);
          const c = nodePos(childId);
          const onPath = pathSet.has(node.id) && pathSet.has(childId);
          return (
            <line
              key={`${node.id}-${childId}`}
              x1={p.cx} y1={p.cy} x2={c.cx} y2={c.cy}
              stroke={onPath ? COL_PATH : 'currentColor'}
              className={onPath ? '' : 'text-border'}
              strokeWidth={onPath ? 2 : 1}
            />
          );
        }),
      )}
      {Object.values(TREE_NODES).map((node) => {
        const { cx, cy } = nodePos(node.id);
        const isGoalFound = state.type === 'solution' && state.current === node.id;
        const isOnPath = pathSet.has(node.id);
        const isCurrent = state.current === node.id;
        const isExplored = state.explored.has(node.id);
        const isFringe = fringeNodes.has(node.id);

        let fill = COL_UNSEEN;
        if (isGoalFound) fill = COL_GOAL;
        else if (isOnPath) fill = COL_PATH;
        else if (isCurrent) fill = COL_CURRENT;
        else if (isExplored) fill = COL_EXPLORED;
        else if (isFringe) fill = COL_FRINGE;

        return (
          <g key={node.id}>
            <circle cx={cx} cy={cy} r={NODE_R} fill={fill}
              stroke="currentColor" className="text-foreground" strokeWidth={0.8} />
            <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central"
              fill={contrastText(fill)} fontSize={8} fontWeight="bold" className="select-none">
              {node.id}
            </text>
          </g>
        );
      })}
      {/* Algorithm label */}
      <rect x={0} y={0} width={36} height={14} rx={3} fill={color} opacity={0.9} />
      <text x={18} y={7.5} textAnchor="middle" dominantBaseline="central"
        fill="#fff" fontSize={8} fontWeight="bold" className="select-none">
        {/* Set from parent */}
      </text>
    </svg>
  );
}

export default function AlgorithmRaceViz() {
  const [algos, setAlgos] = useState<Record<AlgoKey, AlgoState>>(() => ({
    bfs: initAlgo('bfs'),
    dfs: initAlgo('dfs'),
    ids: initAlgo('ids'),
    ucs: initAlgo('ucs'),
  }));
  const [globalStep, setGlobalStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const playRef = useMemo(() => ({ current: false }), []);

  const allDone = ALGOS.every((a) => algos[a.key].done);

  // Find first finisher
  const winner = useMemo(() => {
    let best: AlgoKey | null = null;
    let bestStep = Infinity;
    for (const a of ALGOS) {
      const fs = algos[a.key].finishStep;
      if (fs !== null && fs < bestStep) {
        bestStep = fs;
        best = a.key;
      }
    }
    return best;
  }, [algos]);

  const stepForward = useCallback(() => {
    if (allDone) return;
    setAlgos((prev) => {
      const next = { ...prev };
      for (const a of ALGOS) {
        next[a.key] = advanceAlgo(prev[a.key]);
      }
      return next;
    });
    setGlobalStep((s) => s + 1);
  }, [allDone]);

  const reset = useCallback(() => {
    setPlaying(false);
    playRef.current = false;
    setAlgos({
      bfs: initAlgo('bfs'),
      dfs: initAlgo('dfs'),
      ids: initAlgo('ids'),
      ucs: initAlgo('ucs'),
    });
    setGlobalStep(0);
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
      setAlgos((prev) => {
        const anyRunning = ALGOS.some((a) => !prev[a.key].done);
        if (!anyRunning) {
          playRef.current = false;
          setPlaying(false);
          return prev;
        }
        const next = { ...prev };
        for (const a of ALGOS) {
          next[a.key] = advanceAlgo(prev[a.key]);
        }
        return next;
      });
      setGlobalStep((s) => s + 1);
      if (playRef.current) setTimeout(tick, 350);
    };
    setTimeout(tick, 350);
  }, [playRef]);

  const getCurrentState = (key: AlgoKey): SearchState => {
    const a = algos[key];
    const idx = a.stepStates[a.currentStepIdx] ?? 0;
    return a.states[idx] ?? a.states[0];
  };

  return (
    <div className="not-prose my-6 rounded-lg border border-border bg-card p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-semibold text-foreground">
          Algorithm Race
        </h3>
        <button
          onClick={reset}
          className="flex items-center gap-1 rounded-md border border-border px-2 py-1 text-sm text-muted-foreground hover:bg-accent transition-colors"
        >
          <RotateCcw size={14} /> Reset
        </button>
      </div>

      <p className="mb-3 text-sm text-muted-foreground">
        Watch BFS, DFS, IDS, and UCS race to find goal G on the same tree. Each step advances all algorithms simultaneously.
      </p>

      {/* 2x2 grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        {ALGOS.map((info) => {
          const a = algos[info.key];
          const state = getCurrentState(info.key);
          const isWinner = winner === info.key;
          const isDone = a.done;

          return (
            <div
              key={info.key}
              className={`rounded-lg border p-3 transition-colors ${
                isWinner && isDone
                  ? 'border-green-400 bg-green-50/50 dark:border-green-700 dark:bg-green-950/30'
                  : isDone
                    ? 'border-border bg-muted/30'
                    : 'border-border bg-card'
              }`}
            >
              {/* Panel header */}
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block rounded px-2 py-0.5 text-xs font-bold text-white"
                    style={{ backgroundColor: info.color }}
                  >
                    {info.label}
                  </span>
                  {isWinner && isDone && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex items-center gap-0.5 text-xs font-semibold text-green-600 dark:text-green-400"
                    >
                      <Trophy size={12} /> Winner!
                    </motion.span>
                  )}
                  {isDone && state.type === 'solution' && !isWinner && (
                    <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                      <CheckCircle size={12} /> Done
                    </span>
                  )}
                </div>
              </div>

              {/* Mini tree */}
              <MiniTree state={state} color={info.color} />

              {/* Stats */}
              <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                <span>Expanded: <strong className="text-foreground">{a.expandCount}</strong></span>
                <span>Fringe: <strong className="text-foreground">{state.fringe.length}</strong></span>
                <span>Max fringe: <strong className="text-foreground">{a.maxFringe}</strong></span>
                {a.pathCost !== null && (
                  <span>Cost: <strong className="text-foreground">{a.pathCost}</strong></span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-2 mb-3">
        <button
          onClick={togglePlay}
          disabled={allDone}
          className="rounded-md border border-border p-1.5 text-muted-foreground hover:bg-accent transition-colors disabled:opacity-30"
        >
          {playing ? <Pause size={16} /> : <Play size={16} />}
        </button>
        <button
          onClick={stepForward}
          disabled={allDone}
          className="flex items-center gap-1 rounded-md border border-border px-2 py-1 text-sm text-muted-foreground hover:bg-accent transition-colors disabled:opacity-30"
        >
          <ChevronRight size={14} /> Step
        </button>
        <span className="ml-2 text-xs text-muted-foreground">Step {globalStep}</span>
      </div>

      {/* Summary bar chart after all done */}
      <AnimatePresence>
        {allDone && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-3 rounded-md border border-border bg-muted/30 p-3"
          >
            <p className="text-xs font-medium text-muted-foreground mb-2">Nodes Expanded Comparison</p>
            <div className="space-y-1.5">
              {ALGOS.map((info) => {
                const a = algos[info.key];
                const maxExpand = Math.max(...ALGOS.map((x) => algos[x.key].expandCount));
                const pct = maxExpand > 0 ? (a.expandCount / maxExpand) * 100 : 0;
                return (
                  <div key={info.key} className="flex items-center gap-2">
                    <span className="w-8 text-xs font-semibold text-foreground">{info.label}</span>
                    <div className="flex-1 h-5 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: info.color }}
                      />
                    </div>
                    <span className="w-6 text-xs text-muted-foreground text-right">{a.expandCount}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
