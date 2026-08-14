import { useState } from 'react';
import { M } from '@/components/Math';

// ── Alarm Network Data ──────────────────────────────────────────────

type NodeId = 'B' | 'E' | 'A' | 'J' | 'M';

interface BNNode {
  id: NodeId;
  label: string;
  short: string;
  x: number;
  y: number;
  parents: NodeId[];
  params: number;
}

const NODES: BNNode[] = [
  { id: 'B', label: 'Burglary', short: 'B', x: 140, y: 50, parents: [], params: 1 },
  { id: 'E', label: 'Earthquake', short: 'E', x: 360, y: 50, parents: [], params: 1 },
  { id: 'A', label: 'Alarm', short: 'A', x: 250, y: 170, parents: ['B', 'E'], params: 4 },
  { id: 'J', label: 'JohnCalls', short: 'J', x: 140, y: 290, parents: ['A'], params: 2 },
  { id: 'M', label: 'MaryCalls', short: 'M', x: 360, y: 290, parents: ['A'], params: 2 },
];

const EDGES: [NodeId, NodeId][] = [
  ['B', 'A'],
  ['E', 'A'],
  ['A', 'J'],
  ['A', 'M'],
];

const NODE_MAP = Object.fromEntries(NODES.map((n) => [n.id, n])) as Record<NodeId, BNNode>;
const TOTAL_PARAMS = NODES.reduce((s, n) => s + n.params, 0);

// CPT data
interface CPTEntry {
  conditions: Record<string, string>;
  pTrue: number;
}

const CPTS: Record<NodeId, { headers: string[]; rows: CPTEntry[] }> = {
  B: {
    headers: [],
    rows: [{ conditions: {}, pTrue: 0.001 }],
  },
  E: {
    headers: [],
    rows: [{ conditions: {}, pTrue: 0.002 }],
  },
  A: {
    headers: ['B', 'E'],
    rows: [
      { conditions: { B: 'T', E: 'T' }, pTrue: 0.95 },
      { conditions: { B: 'T', E: 'F' }, pTrue: 0.94 },
      { conditions: { B: 'F', E: 'T' }, pTrue: 0.29 },
      { conditions: { B: 'F', E: 'F' }, pTrue: 0.001 },
    ],
  },
  J: {
    headers: ['A'],
    rows: [
      { conditions: { A: 'T' }, pTrue: 0.9 },
      { conditions: { A: 'F' }, pTrue: 0.05 },
    ],
  },
  M: {
    headers: ['A'],
    rows: [
      { conditions: { A: 'T' }, pTrue: 0.7 },
      { conditions: { A: 'F' }, pTrue: 0.01 },
    ],
  },
};

// ── Component ───────────────────────────────────────────────────────

const R = 28;

export default function BayesNetBuilderViz() {
  const [selected, setSelected] = useState<NodeId>('A');
  const cpt = CPTS[selected];
  const node = NODE_MAP[selected];

  return (
    <div className="my-6 rounded-xl border bg-card p-4">
      <div className="mb-1">
        <h3 className="font-semibold">The Alarm Network</h3>
        <p className="text-sm text-muted-foreground">
          Click a node to inspect its conditional probability table. Each node stores only{' '}
          <M>{'P(X \\mid \\text{Parents}(X))'}</M>.
        </p>
      </div>

      {/* SVG Network */}
      <div className="flex justify-center">
        <svg viewBox="0 0 500 350" className="w-full max-w-lg" role="img">
          <defs>
            <marker
              id="bn-arrow"
              viewBox="0 0 10 10"
              refX="10"
              refY="5"
              markerWidth="8"
              markerHeight="8"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" className="fill-muted-foreground" />
            </marker>
          </defs>

          {/* Edges */}
          {EDGES.map(([from, to]) => {
            const a = NODE_MAP[from];
            const b = NODE_MAP[to];
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const ux = dx / dist;
            const uy = dy / dist;
            return (
              <line
                key={`${from}-${to}`}
                x1={a.x + ux * R}
                y1={a.y + uy * R}
                x2={b.x - ux * (R + 6)}
                y2={b.y - uy * (R + 6)}
                className="stroke-muted-foreground"
                strokeWidth={2}
                markerEnd="url(#bn-arrow)"
              />
            );
          })}

          {/* Nodes */}
          {NODES.map((n) => {
            const isSelected = n.id === selected;
            return (
              <g
                key={n.id}
                className="cursor-pointer"
                onClick={() => setSelected(n.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setSelected(n.id)}
              >
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={R}
                  className={
                    isSelected
                      ? 'fill-primary stroke-primary'
                      : 'fill-card stroke-border hover:stroke-primary'
                  }
                  strokeWidth={2.5}
                />
                <text
                  x={n.x}
                  y={n.y + 1}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className={`text-xs font-semibold select-none ${
                    isSelected ? 'fill-primary-foreground' : 'fill-foreground'
                  }`}
                >
                  {n.short}
                </text>
                {/* Param count badge */}
                <circle
                  cx={n.x + R * 0.75}
                  cy={n.y - R * 0.75}
                  r={10}
                  className="fill-muted stroke-border"
                  strokeWidth={1}
                />
                <text
                  x={n.x + R * 0.75}
                  y={n.y - R * 0.75 + 1}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="fill-muted-foreground text-[10px] font-medium select-none"
                >
                  {n.params}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Stats bar */}
      <div className="mt-2 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
        <span>
          Bayes net params: <span className="font-semibold text-foreground">{TOTAL_PARAMS}</span>
        </span>
        <span className="text-border">|</span>
        <span>
          Full joint: <span className="font-semibold text-foreground">2&#8309; = 32</span>
        </span>
        <span className="text-border">|</span>
        <span>
          Savings:{' '}
          <span className="font-semibold text-primary">
            {Math.round((1 - TOTAL_PARAMS / 32) * 100)}%
          </span>
        </span>
      </div>

      {/* CPT Table */}
      <div className="mt-4 rounded-lg border bg-muted/30 p-4">
        <h4 className="mb-3 text-sm font-semibold">
          CPT for {node.label}{' '}
          <span className="font-normal text-muted-foreground">
            ({node.params} parameter{node.params > 1 ? 's' : ''})
          </span>
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                {cpt.headers.map((h) => (
                  <th key={h} className="px-3 py-2 font-medium text-muted-foreground">
                    {h}
                  </th>
                ))}
                <th className="px-3 py-2 font-medium">
                  <M>{`P(${node.short}=T${cpt.headers.length > 0 ? ' \\mid \\text{parents}' : ''})`}</M>
                </th>
                <th className="px-3 py-2 font-medium text-muted-foreground">
                  <M>{`P(${node.short}=F${cpt.headers.length > 0 ? ' \\mid \\text{parents}' : ''})`}</M>
                </th>
              </tr>
            </thead>
            <tbody>
              {cpt.rows.map((row, i) => (
                <tr key={i} className="border-b border-border/50 last:border-0">
                  {cpt.headers.map((h) => (
                    <td key={h} className="px-3 py-2 font-mono text-xs">
                      {row.conditions[h]}
                    </td>
                  ))}
                  <td className="px-3 py-2 font-mono text-xs font-semibold text-primary">
                    {row.pTrue}
                  </td>
                  <td className="px-3 py-2 font-mono text-xs text-muted-foreground">
                    {(1 - row.pTrue).toFixed(3)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {node.parents.length > 0 && (
          <p className="mt-3 text-xs text-muted-foreground">
            Parents: {node.parents.join(', ')} — each row conditions on one combination of parent
            values. Only <M>{`P(${node.short}=T \\mid \\ldots)`}</M> is stored; the F column is{' '}
            <M>{'1 - P(T \\mid \\ldots)'}</M>.
          </p>
        )}
        {node.parents.length === 0 && (
          <p className="mt-3 text-xs text-muted-foreground">
            Root node — no parents. Only one free parameter: <M>{`P(${node.short}=T)`}</M>.
          </p>
        )}
      </div>
    </div>
  );
}
