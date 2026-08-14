import { useState, useCallback, useRef, useEffect } from 'react';
import { sampleExpectiminimax, expectiminimax, type GameNode } from '@/lib/adversarial';
import { Button } from '@/components/ui/button';

// ---------------------------------------------------------------------------
// Layout constants
// ---------------------------------------------------------------------------

const W = 700;
const H = 350;
const LEVEL_Y = [30, 110, 190, 280]; // root, chance, min, leaf
const NODE_R = 22;
const LEAF_W = 40;
const LEAF_H = 28;
const DIAMOND = 24;

// ---------------------------------------------------------------------------
// Precomputed positions for the fixed tree
// ---------------------------------------------------------------------------

interface Pos { x: number; y: number }

const POS: Record<string, Pos> = {
  // Root (MAX)
  A: { x: 350, y: LEVEL_Y[0] },
  // Chance
  B: { x: 185, y: LEVEL_Y[1] },
  C: { x: 515, y: LEVEL_Y[1] },
  // MIN
  D: { x: 105, y: LEVEL_Y[2] },
  E: { x: 265, y: LEVEL_Y[2] },
  F: { x: 435, y: LEVEL_Y[2] },
  G: { x: 595, y: LEVEL_Y[2] },
  // Leaves
  H: { x: 65, y: LEVEL_Y[3] },
  I: { x: 145, y: LEVEL_Y[3] },
  J: { x: 225, y: LEVEL_Y[3] },
  K: { x: 305, y: LEVEL_Y[3] },
  L: { x: 395, y: LEVEL_Y[3] },
  M: { x: 475, y: LEVEL_Y[3] },
  N: { x: 555, y: LEVEL_Y[3] },
  O: { x: 635, y: LEVEL_Y[3] },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function collectValues(node: GameNode): Record<string, number> {
  const result: Record<string, number> = {};
  function walk(n: GameNode) {
    const v = expectiminimax(n);
    result[n.id] = v;
    n.children.forEach(walk);
  }
  walk(node);
  return result;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ExpectiminimaxViz() {
  const tree = useRef(sampleExpectiminimax()).current;
  const answers = useRef(collectValues(tree)).current;

  const [values, setValues] = useState<Record<string, number | null>>({});
  const [highlight, setHighlight] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const cancelRef = useRef(false);

  // Cancel animation on unmount
  useEffect(() => () => { cancelRef.current = true; }, []);

  const evaluate = useCallback(async () => {
    if (running) return;
    cancelRef.current = false;
    setRunning(true);
    setValues({});
    setDone(false);

    const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

    // Step 1: MIN nodes (D, E, F, G)
    for (const id of ['D', 'E', 'F', 'G']) {
      if (cancelRef.current) return;
      setHighlight(id);
      await delay(600);
      if (cancelRef.current) return;
      setValues(prev => ({ ...prev, [id]: answers[id] }));
    }

    // Step 2: CHANCE nodes (B, C)
    for (const id of ['B', 'C']) {
      if (cancelRef.current) return;
      setHighlight(id);
      await delay(600);
      if (cancelRef.current) return;
      setValues(prev => ({ ...prev, [id]: answers[id] }));
    }

    // Step 3: MAX root (A)
    if (cancelRef.current) return;
    setHighlight('A');
    await delay(600);
    if (cancelRef.current) return;
    setValues(prev => ({ ...prev, A: answers.A }));

    setHighlight(null);
    setRunning(false);
    setDone(true);
  }, [running, answers]);

  const reset = useCallback(() => {
    setValues({});
    setHighlight(null);
    setDone(false);
  }, []);

  // Collect edges
  type Edge = { from: string; to: string };
  const edges: Edge[] = [];
  function walkEdges(n: GameNode) {
    for (const c of n.children) {
      edges.push({ from: n.id, to: c.id });
      walkEdges(c);
    }
  }
  walkEdges(tree);

  return (
    <div className="rounded-lg border border-border bg-card p-4 my-6">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-muted-foreground">
          Expectiminimax: chance nodes compute weighted averages
        </p>
        <div className="flex gap-2">
          <Button size="sm" onClick={evaluate} disabled={running || done}>
            Evaluate
          </Button>
          <Button size="sm" variant="outline" onClick={reset} disabled={running}>
            Reset
          </Button>
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 380 }}>
        {/* Edges */}
        {edges.map(({ from, to }) => (
          <line
            key={`${from}-${to}`}
            x1={POS[from].x}
            y1={POS[from].y}
            x2={POS[to].x}
            y2={POS[to].y}
            className="stroke-border"
            strokeWidth={1.5}
          />
        ))}

        {/* Nodes — rendered by type */}
        {renderNodes(tree, values, highlight)}
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full bg-blue-500" /> MAX
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full bg-red-500" /> MIN
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rotate-45 bg-emerald-500" style={{ width: 10, height: 10 }} /> CHANCE
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm border border-current" /> Leaf
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Render helpers
// ---------------------------------------------------------------------------

function renderNodes(
  node: GameNode,
  values: Record<string, number | null>,
  highlight: string | null,
): React.ReactNode[] {
  const elements: React.ReactNode[] = [];

  function walk(n: GameNode) {
    const pos = POS[n.id];
    if (!pos) return;
    const isHighlighted = highlight === n.id;
    const computed = values[n.id];

    if (n.children.length === 0) {
      // Leaf — rectangle
      elements.push(
        <g key={n.id}>
          <rect
            x={pos.x - LEAF_W / 2}
            y={pos.y - LEAF_H / 2}
            width={LEAF_W}
            height={LEAF_H}
            rx={4}
            className="fill-muted stroke-border"
            strokeWidth={1.5}
          />
          <text
            x={pos.x}
            y={pos.y}
            textAnchor="middle"
            dominantBaseline="central"
            className="fill-foreground text-xs font-bold"
          >
            {n.utility}
          </text>
          <text
            x={pos.x}
            y={pos.y - LEAF_H / 2 - 6}
            textAnchor="middle"
            className="fill-muted-foreground"
            style={{ fontSize: 9 }}
          >
            {n.id}
          </text>
        </g>,
      );
    } else if (n.player === 'CHANCE') {
      // Diamond
      const d = DIAMOND;
      const points = `${pos.x},${pos.y - d} ${pos.x + d},${pos.y} ${pos.x},${pos.y + d} ${pos.x - d},${pos.y}`;
      elements.push(
        <g key={n.id}>
          <polygon
            points={points}
            className={isHighlighted ? 'fill-emerald-400 dark:fill-emerald-500' : 'fill-emerald-500/80 dark:fill-emerald-600/80'}
            stroke={isHighlighted ? '#fff' : 'none'}
            strokeWidth={isHighlighted ? 2.5 : 0}
          />
          <text
            x={pos.x}
            y={pos.y}
            textAnchor="middle"
            dominantBaseline="central"
            className="fill-white text-xs font-bold"
          >
            {computed != null ? formatNum(computed) : n.id}
          </text>
          {/* Probability labels on edges to children */}
          {n.children.map(c => {
            const cp = POS[c.id];
            if (!cp) return null;
            const mx = (pos.x + cp.x) / 2;
            const my = (pos.y + cp.y) / 2;
            return (
              <text
                key={`prob-${n.id}-${c.id}`}
                x={mx + (cp.x < pos.x ? -12 : 12)}
                y={my - 4}
                textAnchor="middle"
                className="fill-emerald-600 dark:fill-emerald-400"
                style={{ fontSize: 10, fontStyle: 'italic' }}
              >
                1/2
              </text>
            );
          })}
        </g>,
      );
    } else {
      // Circle: MAX (blue) or MIN (red)
      const isMax = n.player === 'MAX';
      const fillClass = isMax
        ? (isHighlighted ? 'fill-blue-400 dark:fill-blue-500' : 'fill-blue-500/80 dark:fill-blue-600/80')
        : (isHighlighted ? 'fill-red-400 dark:fill-red-500' : 'fill-red-500/80 dark:fill-red-600/80');

      elements.push(
        <g key={n.id}>
          <circle
            cx={pos.x}
            cy={pos.y}
            r={NODE_R}
            className={fillClass}
            stroke={isHighlighted ? '#fff' : 'none'}
            strokeWidth={isHighlighted ? 2.5 : 0}
          />
          <text
            x={pos.x}
            y={pos.y - 1}
            textAnchor="middle"
            dominantBaseline="central"
            className="fill-white text-xs font-bold"
          >
            {computed != null ? formatNum(computed) : n.id}
          </text>
          <text
            x={pos.x}
            y={pos.y + 11}
            textAnchor="middle"
            className="fill-white/70"
            style={{ fontSize: 8 }}
          >
            {n.player}
          </text>
        </g>,
      );
    }

    n.children.forEach(walk);
  }

  walk(node);
  return elements;
}

function formatNum(v: number): string {
  return Number.isInteger(v) ? String(v) : v.toFixed(1);
}
