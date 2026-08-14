import { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import AlgoControls from '@/components/AlgoControls';
import {
  sampleAlphaBetaTree,
  alphaBetaGen,
  type GameNode,
  type AlphaBetaStep,
} from '@/lib/adversarial';

// ---------------------------------------------------------------------------
// Layout — compute (x, y) for each node via recursive positioning
// ---------------------------------------------------------------------------

const SVG_W = 820;
const SVG_H = 420;
const NODE_R = 22;
const LEAF_W = 36;
const LEAF_H = 28;
const LEVEL_GAP = 90;
const LEAF_GAP = 58;
const SUBTREE_GAP = 16;

interface LayoutNode {
  id: string;
  player: 'MAX' | 'MIN' | 'CHANCE';
  x: number;
  y: number;
  children: LayoutNode[];
  utility?: number;
  isLeaf: boolean;
}

function layoutTree(node: GameNode, depth = 0, xOffset = { v: 0 }): LayoutNode {
  const y = 40 + depth * LEVEL_GAP;
  const isLeaf = node.children.length === 0;

  if (isLeaf) {
    const x = xOffset.v;
    xOffset.v += LEAF_GAP;
    return { id: node.id, player: node.player, x, y, children: [], utility: node.utility, isLeaf };
  }

  const kids = node.children.map((c) => layoutTree(c, depth + 1, xOffset));
  if (kids.length > 1) xOffset.v += SUBTREE_GAP;

  const x = (kids[0].x + kids[kids.length - 1].x) / 2;
  return { id: node.id, player: node.player, x, y, children: kids, utility: node.utility, isLeaf };
}

function flattenLayout(n: LayoutNode): LayoutNode[] {
  return [n, ...n.children.flatMap(flattenLayout)];
}

interface TreeEdge { from: string; to: string }

function collectEdges(n: LayoutNode): TreeEdge[] {
  return [
    ...n.children.map((c) => ({ from: n.id, to: c.id })),
    ...n.children.flatMap(collectEdges),
  ];
}

// ---------------------------------------------------------------------------
// Pre-compute all steps
// ---------------------------------------------------------------------------

function collectSteps(root: GameNode): AlphaBetaStep[] {
  const steps: AlphaBetaStep[] = [];
  for (const s of alphaBetaGen(root)) steps.push(s);
  return steps;
}

// ---------------------------------------------------------------------------
// Accumulated state per node at a given step index
// ---------------------------------------------------------------------------

interface NodeState {
  visited: boolean;
  alpha?: number;
  beta?: number;
  value?: number;
  backtrackedValue?: number;
  pruned: boolean;
  done: boolean;
}

function buildNodeStates(
  steps: AlphaBetaStep[],
  upTo: number,
  allNodes: LayoutNode[],
): Map<string, NodeState> {
  const map = new Map<string, NodeState>();
  for (const n of allNodes) {
    map.set(n.id, { visited: false, pruned: false, done: false });
  }

  const prunedSet = new Set<string>();

  for (let i = 0; i <= upTo; i++) {
    const s = steps[i];
    const ns = map.get(s.nodeId)!;

    switch (s.type) {
      case 'visit':
        ns.visited = true;
        ns.alpha = s.alpha;
        ns.beta = s.beta;
        break;
      case 'update':
        ns.alpha = s.alpha;
        ns.beta = s.beta;
        ns.value = s.value;
        break;
      case 'prune':
        ns.alpha = s.alpha;
        ns.beta = s.beta;
        ns.value = s.value;
        if (s.prunedChildren) {
          for (const pid of s.prunedChildren) prunedSet.add(pid);
        }
        break;
      case 'backtrack':
        ns.backtrackedValue = s.value;
        ns.alpha = s.alpha;
        ns.beta = s.beta;
        ns.done = true;
        break;
      case 'done':
        ns.backtrackedValue = s.value;
        ns.done = true;
        break;
    }
  }

  // Mark pruned nodes
  for (const id of prunedSet) {
    const ns = map.get(id);
    if (ns) ns.pruned = true;
  }

  // Propagate pruned status to all descendants
  const nodeById = new Map<string, LayoutNode>();
  for (const n of allNodes) nodeById.set(n.id, n);

  const markDown = (id: string) => {
    const ln = nodeById.get(id);
    if (!ln) return;
    for (const c of ln.children) {
      const cs = map.get(c.id);
      if (cs) cs.pruned = true;
      markDown(c.id);
    }
  };
  for (const id of prunedSet) markDown(id);

  return map;
}

// ---------------------------------------------------------------------------
// Format helpers
// ---------------------------------------------------------------------------

function fmtAB(v: number | undefined): string {
  if (v === undefined) return '?';
  if (v === -Infinity) return '-\u221E';
  if (v === Infinity) return '\u221E';
  return String(v);
}

// ---------------------------------------------------------------------------
// Colors (oklch for consistency with shadcn theme)
// ---------------------------------------------------------------------------

const MAX_FILL = 'oklch(0.65 0.18 250)';
const MAX_STROKE = 'oklch(0.55 0.20 250)';
const MIN_FILL = 'oklch(0.65 0.18 20)';
const MIN_STROKE = 'oklch(0.55 0.20 20)';
const DONE_STROKE = 'oklch(0.60 0.20 150)';
const VISIT_GLOW = 'oklch(0.80 0.20 80)';
const PRUNED_FILL = 'oklch(0.50 0.00 0)';
const PRUNED_OPACITY = 0.25;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AlphaBetaStepViz() {
  const tree = useMemo(() => sampleAlphaBetaTree(), []);
  const steps = useMemo(() => collectSteps(tree), [tree]);
  const layout = useMemo(() => layoutTree(tree), [tree]);
  const allNodes = useMemo(() => flattenLayout(layout), [layout]);
  const edges = useMemo(() => collectEdges(layout), [layout]);
  const nodeById = useMemo(() => {
    const m = new Map<string, LayoutNode>();
    for (const n of allNodes) m.set(n.id, n);
    return m;
  }, [allNodes]);

  // Center the tree horizontally
  const xShift = useMemo(() => {
    const xs = allNodes.map((n) => n.x);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    return (SVG_W - (maxX - minX)) / 2 - minX;
  }, [allNodes]);

  const [stepIdx, setStepIdx] = useState(-1); // -1 = no steps executed yet
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-play
  useEffect(() => {
    if (!playing) {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
      return;
    }
    const ms = Math.max(100, 800 / speed);
    timerRef.current = setInterval(() => {
      setStepIdx((prev) => {
        if (prev >= steps.length - 1) {
          setPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, ms);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [playing, speed, steps.length]);

  const currentStep = stepIdx >= 0 ? steps[stepIdx] : null;

  const nodeStates = useMemo(() => {
    if (stepIdx < 0) {
      const m = new Map<string, NodeState>();
      for (const n of allNodes) m.set(n.id, { visited: false, pruned: false, done: false });
      return m;
    }
    return buildNodeStates(steps, stepIdx, allNodes);
  }, [stepIdx, steps, allNodes]);

  const totalLeaves = useMemo(
    () => allNodes.filter((n) => n.isLeaf).length,
    [allNodes],
  );

  // Handlers
  const handleStep = useCallback(
    () => setStepIdx((i) => Math.min(i + 1, steps.length - 1)),
    [steps.length],
  );
  const handleStepBack = useCallback(
    () => setStepIdx((i) => Math.max(i - 1, -1)),
    [],
  );
  const handleReset = useCallback(() => {
    setPlaying(false);
    setStepIdx(-1);
  }, []);
  const handlePlay = useCallback(() => setPlaying(true), []);
  const handlePause = useCallback(() => setPlaying(false), []);

  return (
    <div className="not-prose my-6 rounded-lg border border-border bg-card p-4">
      <h3 className="mb-3 text-lg font-semibold text-foreground">
        Alpha-Beta Pruning — Step by Step
      </h3>

      {/* Legend */}
      <div className="mb-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <svg width="14" height="14"><circle cx="7" cy="7" r="6" fill={MAX_FILL} /></svg>
          MAX
        </span>
        <span className="flex items-center gap-1.5">
          <svg width="14" height="14"><circle cx="7" cy="7" r="6" fill={MIN_FILL} /></svg>
          MIN
        </span>
        <span className="flex items-center gap-1.5">
          <svg width="14" height="14">
            <rect x="1" y="3" width="12" height="8" rx="2" className="fill-muted stroke-border" />
          </svg>
          Leaf
        </span>
        <span className="flex items-center gap-1.5">
          <svg width="14" height="14">
            <circle cx="7" cy="7" r="6" fill="none" stroke={DONE_STROKE} strokeWidth="2.5" />
          </svg>
          Done
        </span>
        <span className="flex items-center gap-1.5 opacity-40">
          <svg width="14" height="14">
            <circle cx="7" cy="7" r="6" fill={MIN_FILL} />
            <line x1="2" y1="2" x2="12" y2="12" stroke="#ef4444" strokeWidth="2" />
          </svg>
          Pruned
        </span>
      </div>

      {/* SVG Tree */}
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        className="mx-auto mb-2 w-full max-w-4xl"
        style={{ maxHeight: 420 }}
      >
        <defs>
          <filter id="ab-glow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Edges */}
        {edges.map((e) => {
          const from = nodeById.get(e.from)!;
          const to = nodeById.get(e.to)!;
          const fromState = nodeStates.get(e.from);
          const toState = nodeStates.get(e.to);
          const isPruned = toState?.pruned;
          return (
            <line
              key={`${e.from}-${e.to}`}
              x1={from.x + xShift}
              y1={from.y + (from.isLeaf ? 0 : NODE_R)}
              x2={to.x + xShift}
              y2={to.y - (to.isLeaf ? LEAF_H / 2 : NODE_R)}
              className="stroke-border"
              strokeWidth={1.5}
              opacity={isPruned ? PRUNED_OPACITY : fromState?.visited || toState?.visited ? 1 : 0.4}
            />
          );
        })}

        {/* Nodes */}
        {allNodes.map((n) => {
          const ns = nodeStates.get(n.id)!;
          const cx = n.x + xShift;
          const cy = n.y;
          const isCurrent =
            currentStep?.nodeId === n.id && currentStep.type !== 'done';
          const isBacktracked = ns.done;
          const isVisited = ns.visited;
          const isPruned = ns.pruned;
          const opacity = isPruned ? PRUNED_OPACITY : 1;

          if (n.isLeaf) {
            return (
              <g key={n.id} opacity={opacity}>
                {isCurrent && (
                  <rect
                    x={cx - LEAF_W / 2 - 3} y={cy - LEAF_H / 2 - 3}
                    width={LEAF_W + 6} height={LEAF_H + 6}
                    rx={6} fill={VISIT_GLOW} opacity={0.4}
                    filter="url(#ab-glow)"
                  />
                )}
                <rect
                  x={cx - LEAF_W / 2} y={cy - LEAF_H / 2}
                  width={LEAF_W} height={LEAF_H} rx={4}
                  fill={isPruned ? PRUNED_FILL : undefined}
                  className={isPruned ? undefined : 'fill-muted'}
                  stroke={isBacktracked ? DONE_STROKE : undefined}
                  strokeWidth={isBacktracked ? 2.5 : 0}
                />
                {!isBacktracked && (
                  <rect
                    x={cx - LEAF_W / 2} y={cy - LEAF_H / 2}
                    width={LEAF_W} height={LEAF_H} rx={4}
                    fill="none" className="stroke-border" strokeWidth={1.5}
                  />
                )}
                <text
                  x={cx} y={cy + 1}
                  textAnchor="middle" dominantBaseline="central"
                  fontSize={12} fontWeight="bold"
                  className="fill-foreground select-none pointer-events-none"
                >
                  {n.utility}
                </text>
                <text
                  x={cx} y={cy - LEAF_H / 2 - 6}
                  textAnchor="middle" fontSize={9}
                  className="fill-muted-foreground select-none"
                >
                  {n.id}
                </text>
                {isPruned && (
                  <>
                    <line
                      x1={cx - LEAF_W / 2 + 2} y1={cy - LEAF_H / 2 + 2}
                      x2={cx + LEAF_W / 2 - 2} y2={cy + LEAF_H / 2 - 2}
                      stroke="#ef4444" strokeWidth={2.5} opacity={0.8}
                    />
                    <line
                      x1={cx + LEAF_W / 2 - 2} y1={cy - LEAF_H / 2 + 2}
                      x2={cx - LEAF_W / 2 + 2} y2={cy + LEAF_H / 2 - 2}
                      stroke="#ef4444" strokeWidth={2.5} opacity={0.8}
                    />
                  </>
                )}
              </g>
            );
          }

          // Internal node
          const isMax = n.player === 'MAX';
          const baseFill = isMax ? MAX_FILL : MIN_FILL;
          const baseStroke = isMax ? MAX_STROKE : MIN_STROKE;
          const nodeFill = isPruned ? PRUNED_FILL : baseFill;

          return (
            <g key={n.id} opacity={opacity}>
              {isCurrent && (
                <circle
                  cx={cx} cy={cy} r={NODE_R + 6}
                  fill={VISIT_GLOW} opacity={0.35}
                  filter="url(#ab-glow)"
                />
              )}
              <circle
                cx={cx} cy={cy} r={NODE_R}
                fill={nodeFill}
                stroke={isBacktracked ? DONE_STROKE : baseStroke}
                strokeWidth={isBacktracked ? 3 : isCurrent ? 2.5 : 1.5}
              />
              <text
                x={cx} y={cy + 1}
                textAnchor="middle" dominantBaseline="central"
                fontSize={13} fontWeight="bold" fill="white"
                className="select-none pointer-events-none"
              >
                {n.id}
              </text>
              <text
                x={cx} y={cy - NODE_R - 6}
                textAnchor="middle" fontSize={9} fontWeight="600"
                fill={isMax ? MAX_FILL : MIN_FILL}
                className="select-none"
              >
                {n.player}
              </text>
              {isVisited && !isPruned && (
                <text
                  x={cx} y={cy + NODE_R + 14}
                  textAnchor="middle" fontSize={10}
                  className="fill-muted-foreground select-none"
                  fontFamily="monospace"
                >
                  {ns.backtrackedValue !== undefined
                    ? `= ${ns.backtrackedValue}`
                    : `[${fmtAB(ns.alpha)}, ${fmtAB(ns.beta)}]`}
                </text>
              )}
              {isPruned && (
                <>
                  <line
                    x1={cx - NODE_R * 0.6} y1={cy - NODE_R * 0.6}
                    x2={cx + NODE_R * 0.6} y2={cy + NODE_R * 0.6}
                    stroke="#ef4444" strokeWidth={3} opacity={0.8}
                  />
                  <line
                    x1={cx + NODE_R * 0.6} y1={cy - NODE_R * 0.6}
                    x2={cx - NODE_R * 0.6} y2={cy + NODE_R * 0.6}
                    stroke="#ef4444" strokeWidth={3} opacity={0.8}
                  />
                </>
              )}
            </g>
          );
        })}
      </svg>

      {/* Controls */}
      <AlgoControls
        playing={playing}
        canStepForward={stepIdx < steps.length - 1}
        canStepBack={stepIdx > -1}
        speed={speed}
        onPlay={handlePlay}
        onPause={handlePause}
        onStep={handleStep}
        onStepBack={handleStepBack}
        onReset={handleReset}
        onSpeedChange={setSpeed}
      />

      {/* Step counter */}
      <div className="mb-2 text-xs text-muted-foreground">
        Step {stepIdx + 1} / {steps.length}
      </div>

      {/* Status Panel */}
      <div className="rounded-md border border-border bg-muted/50 p-3 space-y-2">
        <p className="text-sm font-medium text-foreground min-h-5">
          {currentStep?.message ?? 'Press Step or Play to begin.'}
        </p>
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
          <span>
            Evaluated:{' '}
            <strong className="text-foreground">
              {currentStep?.evaluated ?? 0}/{currentStep?.totalLeaves ?? totalLeaves}
            </strong>{' '}
            leaves
          </span>
          <span>
            Pruned:{' '}
            <strong className="text-foreground">{currentStep?.pruned ?? 0}</strong>{' '}
            leaves
          </span>
          {currentStep && (
            <span>
              Current node:{' '}
              <strong className="text-foreground">{currentStep.nodeId}</strong>{' '}
              [{'\u03B1'}={fmtAB(currentStep.alpha)}, {'\u03B2'}={fmtAB(currentStep.beta)}]
            </span>
          )}
        </div>
      </div>

      {/* Completion banner */}
      {currentStep?.type === 'done' && (
        <div className="mt-3 rounded-md border border-green-300 bg-green-50 px-4 py-3 dark:border-green-800 dark:bg-green-950">
          <p className="text-sm font-semibold text-green-800 dark:text-green-200">
            Alpha-Beta complete! Optimal value = {currentStep.value}
          </p>
          <p className="mt-1 text-xs text-green-700 dark:text-green-300">
            Evaluated <strong>{currentStep.evaluated}</strong> of{' '}
            <strong>{currentStep.totalLeaves}</strong> leaves.{' '}
            Pruning saved <strong>{currentStep.pruned}</strong> leaf evaluations
            ({Math.round((currentStep.pruned / currentStep.totalLeaves) * 100)}% reduction).
          </p>
        </div>
      )}
    </div>
  );
}
