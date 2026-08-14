import { useEffect, useMemo, useRef, useState } from 'react';
import AlgoControls from '@/components/AlgoControls';

interface TreeNode {
  id: string;
  label: string;
  x: number;
  y: number;
  parentId?: string;
  status: 'normal' | 'dead' | 'solution';
  message: string;
}

const TREE_NODES: TreeNode[] = [
  { id: 'root', label: 'start', x: 390, y: 36, status: 'normal', message: 'Start with an empty assignment.' },
  { id: 'wa', label: 'WA = red', x: 390, y: 104, parentId: 'root', status: 'normal', message: 'Assign WA = red.' },
  { id: 'nt', label: 'NT = green', x: 390, y: 172, parentId: 'wa', status: 'normal', message: 'Assign NT = green.' },
  { id: 'q-blue', label: 'Q = blue', x: 260, y: 242, parentId: 'nt', status: 'normal', message: 'Explore the unlucky branch Q = blue.' },
  { id: 'nsw-red', label: 'NSW = red', x: 210, y: 312, parentId: 'q-blue', status: 'normal', message: 'NSW has only one legal value on this branch.' },
  { id: 'sa-fail', label: 'SA = ∅', x: 210, y: 382, parentId: 'nsw-red', status: 'dead', message: 'Dead-end: SA has no legal color, so the solver backtracks.' },
  { id: 'q-red', label: 'Q = red', x: 520, y: 242, parentId: 'nt', status: 'normal', message: 'Backtrack to Q and try a different value.' },
  { id: 'nsw-green', label: 'NSW = green', x: 470, y: 312, parentId: 'q-red', status: 'normal', message: 'Now NSW can take green.' },
  { id: 'sa-blue', label: 'SA = blue', x: 470, y: 382, parentId: 'nsw-green', status: 'normal', message: 'SA becomes forced to blue.' },
  { id: 'v-red', label: 'V = red', x: 580, y: 382, parentId: 'nsw-green', status: 'normal', message: 'V can safely take red.' },
  { id: 't-green', label: 'T = green', x: 580, y: 450, parentId: 'v-red', status: 'solution', message: 'One complete consistent coloring is found.' },
];

const EDGE_IDS = TREE_NODES
  .filter((node) => node.parentId)
  .map((node) => ({ from: node.parentId!, to: node.id }));

export default function BacktrackingTreeViz() {
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!playing) {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
      return;
    }

    timerRef.current = setInterval(() => {
      setStepIndex((prev) => {
        if (prev >= TREE_NODES.length - 1) {
          setPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, Math.max(180, 900 / speed));

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [playing, speed]);

  const visibleIds = useMemo(
    () => new Set(TREE_NODES.slice(0, stepIndex + 1).map((node) => node.id)),
    [stepIndex],
  );

  const currentNode = TREE_NODES[stepIndex];

  return (
    <div className="my-6 rounded-xl border bg-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold">Backtracking as a search tree</h3>
          <p className="text-sm text-muted-foreground">
            One branch fails, the solver retreats to the latest choice point, and then explores an alternative branch.
          </p>
        </div>
        <div className="rounded-full border px-3 py-1 text-xs font-medium">
          Node {stepIndex + 1} / {TREE_NODES.length}
        </div>
      </div>

      <AlgoControls
        playing={playing}
        canStepBack={stepIndex > 0}
        canStepForward={stepIndex < TREE_NODES.length - 1}
        speed={speed}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onStep={() => setStepIndex((prev) => Math.min(prev + 1, TREE_NODES.length - 1))}
        onStepBack={() => setStepIndex((prev) => Math.max(prev - 1, 0))}
        onReset={() => {
          setPlaying(false);
          setStepIndex(0);
        }}
        onSpeedChange={setSpeed}
      />

      <svg viewBox="0 0 780 490" className="w-full rounded-xl border bg-muted/20 p-2">
        {EDGE_IDS.map((edge) => {
          if (!visibleIds.has(edge.from) || !visibleIds.has(edge.to)) return null;
          const from = TREE_NODES.find((node) => node.id === edge.from)!;
          const to = TREE_NODES.find((node) => node.id === edge.to)!;
          const emphasized = currentNode.id === edge.to;
          return (
            <line
              key={`${edge.from}-${edge.to}`}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke={emphasized ? 'oklch(0.62 0.18 250)' : 'oklch(0.76 0 0)'}
              strokeWidth={emphasized ? 3 : 2}
            />
          );
        })}

        {TREE_NODES.map((node) => {
          if (!visibleIds.has(node.id)) return null;
          const active = currentNode.id === node.id;
          const fill = node.status === 'dead'
            ? 'oklch(0.94 0.04 25)'
            : node.status === 'solution'
              ? 'oklch(0.94 0.04 150)'
              : active
                ? 'oklch(0.92 0.04 250)'
                : 'oklch(0.97 0.005 265)';
          const stroke = node.status === 'dead'
            ? 'oklch(0.58 0.22 27)'
            : node.status === 'solution'
              ? 'oklch(0.55 0.17 150)'
              : active
                ? 'oklch(0.62 0.18 250)'
                : 'oklch(0.74 0 0)';
          return (
            <g key={node.id}>
              <rect
                x={node.x - 58}
                y={node.y - 18}
                width={116}
                height={36}
                rx={12}
                fill={fill}
                stroke={stroke}
                strokeWidth={active ? 3 : 2}
              />
              <text
                x={node.x}
                y={node.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-foreground"
                style={{ fontSize: 12, fontWeight: 700 }}
              >
                {node.label}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_0.9fr]">
        <div className="rounded-xl border bg-muted/30 p-4 text-sm">
          <div className="font-semibold">Current event</div>
          <p className="mt-2 text-muted-foreground">{currentNode.message}</p>
        </div>
        <div className="rounded-xl border bg-card p-4 text-sm">
          <div className="font-semibold">What the tree tells you</div>
          <ul className="mt-2 space-y-1 text-muted-foreground">
            <li>Every internal node is a partial assignment.</li>
            <li>Red leaves are dead-ends discovered by constraint checks.</li>
            <li>Green leaves are complete solutions.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
