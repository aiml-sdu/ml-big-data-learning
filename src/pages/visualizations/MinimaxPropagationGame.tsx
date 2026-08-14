import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { RotateCcw, Trophy } from 'lucide-react';
import { samplePropagationTree, propagationAnswers, type GameNode } from '@/lib/adversarial';

// ---------------------------------------------------------------------------
// Layout constants
// ---------------------------------------------------------------------------

const SVG_W = 640;
const SVG_H = 420;
const LEVEL_Y = [40, 130, 220, 340];
const NODE_R = 22;
const LEAF_W = 36;
const LEAF_H = 28;

// Pre-computed x positions for a balanced layout
const positions: Record<string, { x: number; y: number }> = {
  // Level 0
  R: { x: 320, y: LEVEL_Y[0] },
  // Level 1
  A: { x: 160, y: LEVEL_Y[1] },
  B: { x: 480, y: LEVEL_Y[1] },
  // Level 2
  C: { x: 80, y: LEVEL_Y[2] },
  D: { x: 240, y: LEVEL_Y[2] },
  E: { x: 400, y: LEVEL_Y[2] },
  F: { x: 560, y: LEVEL_Y[2] },
  // Level 3 – leaves under C
  c1: { x: 40, y: LEVEL_Y[3] },
  c2: { x: 80, y: LEVEL_Y[3] },
  c3: { x: 120, y: LEVEL_Y[3] },
  // Leaves under D
  d1: { x: 200, y: LEVEL_Y[3] },
  d2: { x: 240, y: LEVEL_Y[3] },
  d3: { x: 280, y: LEVEL_Y[3] },
  // Leaves under E
  e1: { x: 360, y: LEVEL_Y[3] },
  e2: { x: 400, y: LEVEL_Y[3] },
  e3: { x: 440, y: LEVEL_Y[3] },
  // Leaves under F
  f1: { x: 520, y: LEVEL_Y[3] },
  f2: { x: 560, y: LEVEL_Y[3] },
  f3: { x: 600, y: LEVEL_Y[3] },
};

// ---------------------------------------------------------------------------
// Helpers: flatten tree, get edges
// ---------------------------------------------------------------------------

function flattenTree(node: GameNode): GameNode[] {
  return [node, ...node.children.flatMap(flattenTree)];
}

function getEdges(node: GameNode): [string, string][] {
  const edges: [string, string][] = [];
  for (const child of node.children) {
    edges.push([node.id, child.id]);
    edges.push(...getEdges(child));
  }
  return edges;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function MinimaxPropagationGame() {
  const tree = useMemo(() => samplePropagationTree(), []);
  const answers = useMemo(() => propagationAnswers(), []);
  const allNodes = useMemo(() => flattenTree(tree), [tree]);
  const edges = useMemo(() => getEdges(tree), [tree]);

  // Map of nodeId → children ids for quick lookup
  const childrenMap = useMemo(() => {
    const m: Record<string, string[]> = {};
    for (const n of allNodes) {
      m[n.id] = n.children.map((c) => c.id);
    }
    return m;
  }, [allNodes]);

  // Map of nodeId → player type
  const playerMap = useMemo(() => {
    const m: Record<string, string> = {};
    for (const n of allNodes) {
      m[n.id] = n.player;
    }
    return m;
  }, [allNodes]);

  const leaves = useMemo(
    () => new Set(allNodes.filter((n) => n.children.length === 0).map((n) => n.id)),
    [allNodes],
  );

  const [solved, setSolved] = useState<Record<string, number>>(() => {
    // Leaves start pre-filled
    const init: Record<string, number> = {};
    for (const n of allNodes) {
      if (n.children.length === 0) {
        init[n.id] = n.utility ?? 0;
      }
    }
    return init;
  });

  const [shaking, setShaking] = useState<string | null>(null);
  const [inputNode, setInputNode] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [wrongMsg, setWrongMsg] = useState<string | null>(null);

  const isClickable = useCallback(
    (id: string) => {
      if (leaves.has(id)) return false;
      if (id in solved) return false;
      return childrenMap[id].every((cid) => cid in solved);
    },
    [solved, leaves, childrenMap],
  );

  const allSolved = useMemo(() => {
    const nonLeaves = allNodes.filter((n) => n.children.length > 0);
    return nonLeaves.every((n) => n.id in solved);
  }, [solved, allNodes]);

  const handleNodeClick = useCallback(
    (id: string) => {
      if (!isClickable(id)) return;
      setInputNode(id);
      setInputValue('');
      setWrongMsg(null);
    },
    [isClickable],
  );

  const handleSubmit = useCallback(() => {
    if (inputNode === null) return;
    const val = Number(inputValue);
    if (isNaN(val)) {
      setWrongMsg('Enter a valid number.');
      return;
    }
    if (val === answers[inputNode]) {
      // Correct
      setSolved((prev) => ({ ...prev, [inputNode]: val }));
      setInputNode(null);
      setWrongMsg(null);

      // Check if this was the last node
      const nonLeaves = allNodes.filter((n) => n.children.length > 0);
      const newSolvedCount = Object.keys(solved).length + 1 - Object.keys(solved).filter((k) => leaves.has(k)).length;
      const totalNonLeaves = nonLeaves.length;
      if (newSolvedCount >= totalNonLeaves) {
        confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
      }
    } else {
      // Wrong
      setShaking(inputNode);
      setWrongMsg(`${val} is not correct. Think: ${playerMap[inputNode]} picks the ${playerMap[inputNode] === 'MAX' ? 'maximum' : 'minimum'} of its children.`);
      setTimeout(() => setShaking(null), 500);
    }
  }, [inputNode, inputValue, answers, solved, allNodes, leaves, playerMap]);

  const reset = useCallback(() => {
    const init: Record<string, number> = {};
    for (const n of allNodes) {
      if (n.children.length === 0) {
        init[n.id] = n.utility ?? 0;
      }
    }
    setSolved(init);
    setInputNode(null);
    setInputValue('');
    setWrongMsg(null);
    setShaking(null);
  }, [allNodes]);

  const solvedNonLeaves = Object.keys(solved).filter((k) => !leaves.has(k)).length;
  const totalNonLeaves = allNodes.filter((n) => n.children.length > 0).length;

  return (
    <div className="not-prose my-6 rounded-lg border border-border bg-card p-4">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Be the Minimax</h3>
        <button
          onClick={reset}
          className="flex items-center gap-1 rounded-md border border-border px-2 py-1 text-sm text-muted-foreground hover:bg-accent transition-colors"
        >
          <RotateCcw size={14} /> Reset
        </button>
      </div>

      {!allSolved && (
        <p className="mb-3 text-sm text-muted-foreground">
          Fill in minimax values bottom-up. Click a glowing node once all its children are solved.
        </p>
      )}

      {/* Progress */}
      <div className="mb-3 flex items-center gap-3 text-xs text-muted-foreground">
        <span>
          Progress: {solvedNonLeaves}/{totalNonLeaves} nodes
        </span>
        <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${(solvedNonLeaves / totalNonLeaves) * 100}%` }}
          />
        </div>
      </div>

      {/* SVG Tree */}
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        className="mx-auto mb-3 w-full max-w-2xl"
        role="img"
        aria-label="Minimax propagation game tree"
      >
        {/* Legend */}
        <g transform="translate(4, 4)">
          <polygon points="0,12 8,0 16,12" fill="#3b82f6" opacity={0.7} />
          <text x={20} y={11} fontSize={10} fill="currentColor" className="text-muted-foreground">
            MAX
          </text>
          <polygon points="60,0 68,12 52,12" fill="#ef4444" opacity={0.7} />
          <text x={73} y={11} fontSize={10} fill="currentColor" className="text-muted-foreground">
            MIN
          </text>
        </g>

        {/* Edges */}
        {edges.map(([pid, cid]) => {
          const p = positions[pid];
          const c = positions[cid];
          return (
            <line
              key={`${pid}-${cid}`}
              x1={p.x}
              y1={p.y}
              x2={c.x}
              y2={c.y}
              stroke="currentColor"
              className="text-border"
              strokeWidth={1.5}
            />
          );
        })}

        {/* Nodes */}
        {allNodes.map((node) => {
          const pos = positions[node.id];
          if (!pos) return null;
          const isLeaf = leaves.has(node.id);
          const isSolved = node.id in solved;
          const clickable = isClickable(node.id);
          const isShaking = shaking === node.id;
          const isActive = inputNode === node.id;
          const isMax = node.player === 'MAX';

          if (isLeaf) {
            // Leaf: rectangle with utility
            return (
              <g key={node.id}>
                <rect
                  x={pos.x - LEAF_W / 2}
                  y={pos.y - LEAF_H / 2}
                  width={LEAF_W}
                  height={LEAF_H}
                  rx={4}
                  fill="oklch(0.55 0.1 250)"
                  stroke="oklch(0.65 0.1 250)"
                  strokeWidth={1}
                />
                <text
                  x={pos.x}
                  y={pos.y - 6}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={8}
                  fill="white"
                  opacity={0.7}
                  className="select-none"
                >
                  {node.id}
                </text>
                <text
                  x={pos.x}
                  y={pos.y + 7}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={13}
                  fontWeight="bold"
                  fill="white"
                  className="select-none"
                >
                  {node.utility}
                </text>
              </g>
            );
          }

          // Non-leaf: triangle shape
          const r = NODE_R;
          const triPoints = isMax
            ? `${pos.x},${pos.y - r} ${pos.x - r},${pos.y + r * 0.7} ${pos.x + r},${pos.y + r * 0.7}`
            : `${pos.x - r},${pos.y - r * 0.7} ${pos.x + r},${pos.y - r * 0.7} ${pos.x},${pos.y + r}`;

          const fillColor = isSolved
            ? '#22c55e'
            : isActive
              ? '#fbbf24'
              : isMax
                ? '#3b82f6'
                : '#ef4444';

          return (
            <g
              key={node.id}
              onClick={() => handleNodeClick(node.id)}
              style={{ cursor: clickable ? 'pointer' : 'default' }}
            >
              {/* Pulsing glow for clickable nodes */}
              {clickable && (
                <motion.polygon
                  points={triPoints}
                  fill="none"
                  stroke={isMax ? '#3b82f6' : '#ef4444'}
                  strokeWidth={3}
                  initial={{ opacity: 0.3 }}
                  animate={{ opacity: [0.3, 0.9, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                />
              )}

              <motion.polygon
                points={triPoints}
                fill={fillColor}
                stroke={isSolved ? '#16a34a' : isActive ? '#d97706' : 'currentColor'}
                className={!isSolved && !isActive ? 'text-foreground' : undefined}
                strokeWidth={1.5}
                animate={
                  isShaking
                    ? { x: [0, -6, 6, -6, 6, 0], transition: { duration: 0.4 } }
                    : {}
                }
              />

              {/* Node label */}
              <text
                x={pos.x}
                y={isMax ? pos.y - 6 : pos.y - 4}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={9}
                fill="white"
                opacity={0.8}
                pointerEvents="none"
                className="select-none"
              >
                {node.id} ({node.player})
              </text>

              {/* Value or ? */}
              <text
                x={pos.x}
                y={isMax ? pos.y + 10 : pos.y + 10}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={15}
                fontWeight="bold"
                fill="white"
                pointerEvents="none"
                className="select-none"
              >
                {isSolved ? solved[node.id] : '?'}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Input panel */}
      <AnimatePresence>
        {inputNode && !allSolved && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-3 rounded-md border border-border bg-muted/50 px-4 py-3"
          >
            <p className="mb-2 text-sm text-foreground">
              Node <strong>{inputNode}</strong> is a{' '}
              <strong>{playerMap[inputNode]}</strong> node. Its children have values:{' '}
              <span className="font-mono">
                [{childrenMap[inputNode].map((cid) => solved[cid]).join(', ')}]
              </span>
              . What is the minimax value?
            </p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                autoFocus
                className="w-24 rounded-md border border-border bg-background px-2 py-1 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Value"
              />
              <button
                onClick={handleSubmit}
                className="rounded-md bg-primary px-3 py-1 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Submit
              </button>
              <button
                onClick={() => {
                  setInputNode(null);
                  setWrongMsg(null);
                }}
                className="rounded-md border border-border px-3 py-1 text-sm text-muted-foreground hover:bg-accent transition-colors"
              >
                Cancel
              </button>
            </div>
            {wrongMsg && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">{wrongMsg}</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success */}
      <AnimatePresence>
        {allSolved && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-3 rounded-md border border-green-300 bg-green-50 px-4 py-3 dark:border-green-800 dark:bg-green-950"
          >
            <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
              <Trophy size={18} />
              <span className="font-semibold">All minimax values correct!</span>
            </div>
            <p className="mt-1 text-sm text-green-700 dark:text-green-300">
              The root value is <strong>{solved['R']}</strong>. MAX can guarantee a utility
              of at least {solved['R']} with optimal play.
            </p>
            <button
              onClick={reset}
              className="mt-2 rounded-md border border-green-300 dark:border-green-700 px-3 py-1 text-sm text-green-800 dark:text-green-200 hover:bg-green-100 dark:hover:bg-green-900 transition-colors"
            >
              Play again
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
