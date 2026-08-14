import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { M } from '@/components/Math';

// ── Network layout (reused positions) ───────────────────────────────

type NodeId = 'B' | 'E' | 'A' | 'J' | 'M';

interface NetNode {
  id: NodeId;
  label: string;
  x: number;
  y: number;
}

const NODES: NetNode[] = [
  { id: 'B', label: 'Burglary', x: 120, y: 40 },
  { id: 'E', label: 'Earthquake', x: 300, y: 40 },
  { id: 'A', label: 'Alarm', x: 210, y: 130 },
  { id: 'J', label: 'JohnCalls', x: 120, y: 220 },
  { id: 'M', label: 'MaryCalls', x: 300, y: 220 },
];

const EDGES: [NodeId, NodeId][] = [
  ['B', 'A'],
  ['E', 'A'],
  ['A', 'J'],
  ['A', 'M'],
];

const NODE_MAP = Object.fromEntries(NODES.map((n) => [n.id, n])) as Record<NodeId, NetNode>;
const EVIDENCE: NodeId[] = ['J', 'M'];
const R = 22;

// ── VE Steps ────────────────────────────────────────────────────────

interface FactorTable {
  vars: string[];
  rows: { vals: string[]; value: number }[];
}

interface Step {
  title: string;
  description: string;
  highlight: string[];
  factor?: FactorTable;
  factorLabel?: string;
}

const STEPS: Step[] = [
  {
    title: 'List initial factors',
    description:
      'Each CPT becomes a factor. We have five factors: f_B(B), f_E(E), f_A(A,B,E), f_J(J,A), f_M(M,A).',
    highlight: ['B', 'E', 'A', 'J', 'M'],
  },
  {
    title: 'Set evidence: J=T, M=T',
    description:
      'We observe JohnCalls=True and MaryCalls=True. Restrict f_J and f_M to the rows where J=T and M=T respectively. These become single-row factors over A only.',
    highlight: ['J', 'M'],
    factorLabel: 'f_J restricted (J=T)',
    factor: {
      vars: ['A', 'P'],
      rows: [
        { vals: ['T', '0.90'], value: 0.9 },
        { vals: ['F', '0.05'], value: 0.05 },
      ],
    },
  },
  {
    title: 'Eliminate E',
    description:
      'Multiply f_E(E) x f_A(A,B,E) to get a joint factor over (A,B,E). Then sum out E to get f_2(A,B).',
    highlight: ['E', 'A'],
    factorLabel: 'f_2(A,B) after summing out E',
    factor: {
      vars: ['A', 'B', 'P'],
      rows: [
        { vals: ['T', 'T', '0.9400'], value: 0.9400 },
        { vals: ['T', 'F', '0.00158'], value: 0.00158 },
        { vals: ['F', 'T', '0.0600'], value: 0.0600 },
        { vals: ['F', 'F', '0.9984'], value: 0.9984 },
      ],
    },
  },
  {
    title: 'Eliminate A',
    description:
      'Multiply f_2(A,B) x f_J(A) x f_M(A) — all factors mentioning A. Then sum out A to get f_4(B).',
    highlight: ['A'],
    factorLabel: 'f_4(B) after summing out A',
    factor: {
      vars: ['B', 'P'],
      rows: [
        { vals: ['T', '0.5922'], value: 0.5922 },
        { vals: ['F', '0.00149'], value: 0.00149 },
      ],
    },
  },
  {
    title: 'Multiply with f_B',
    description:
      'The only remaining factors are f_4(B) and f_B(B). Multiply them element-wise to get f_5(B).',
    highlight: ['B'],
    factorLabel: 'f_5(B) = f_4(B) x f_B(B)',
    factor: {
      vars: ['B', 'P'],
      rows: [
        { vals: ['T', '0.000592'], value: 0.000592 },
        { vals: ['F', '0.001492'], value: 0.001492 },
      ],
    },
  },
  {
    title: 'Normalize',
    description:
      'Divide each entry by the sum (0.002084) to get a valid probability distribution. This gives us the posterior: P(B | J=T, M=T).',
    highlight: ['B'],
    factorLabel: 'P(B | J=T, M=T)',
    factor: {
      vars: ['B', 'P(B | J=T, M=T)'],
      rows: [
        { vals: ['T', '0.284'], value: 0.284 },
        { vals: ['F', '0.716'], value: 0.716 },
      ],
    },
  },
];

// ── Component ───────────────────────────────────────────────────────

export default function BayesNetInferenceViz() {
  const [stepIdx, setStepIdx] = useState(0);
  const step = STEPS[stepIdx];

  return (
    <div className="my-6 rounded-xl border bg-card p-4">
      <div className="mb-1">
        <h3 className="font-semibold">Variable Elimination Walkthrough</h3>
        <p className="text-sm text-muted-foreground">
          Computing <M>{'P(B \\mid J{=}T, M{=}T)'}</M> step by step.
        </p>
      </div>

      {/* Mini network */}
      <div className="flex justify-center">
        <svg viewBox="0 0 420 265" className="w-full max-w-md" role="img">
          <defs>
            <marker
              id="ve-arrow"
              viewBox="0 0 10 10"
              refX="10"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" className="fill-muted-foreground" />
            </marker>
          </defs>

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
                x2={b.x - ux * (R + 5)}
                y2={b.y - uy * (R + 5)}
                className="stroke-muted-foreground"
                strokeWidth={1.5}
                markerEnd="url(#ve-arrow)"
              />
            );
          })}

          {NODES.map((n) => {
            const isEvidence = EVIDENCE.includes(n.id);
            const isHighlighted = step.highlight.includes(n.id);
            let circleClass = 'fill-card stroke-border';
            if (isEvidence) circleClass = 'fill-amber-500/20 stroke-amber-500';
            if (isHighlighted) circleClass = 'fill-primary/15 stroke-primary';
            if (isEvidence && isHighlighted) circleClass = 'fill-amber-500/30 stroke-primary';

            return (
              <g key={n.id}>
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={R}
                  className={circleClass}
                  strokeWidth={isHighlighted ? 2.5 : 1.5}
                />
                <text
                  x={n.x}
                  y={n.y + 1}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="fill-foreground text-[11px] font-semibold select-none"
                >
                  {n.id}
                </text>
                {isEvidence && (
                  <text
                    x={n.x}
                    y={n.y + R + 14}
                    textAnchor="middle"
                    className="fill-amber-600 text-[9px] font-medium dark:fill-amber-400"
                  >
                    = True
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Step content */}
      <div className="mt-3 rounded-lg border bg-muted/30 p-4">
        {/* Step indicator */}
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => setStepIdx(i)}
                className={`h-2.5 w-2.5 rounded-full transition-colors ${
                  i === stepIdx
                    ? 'bg-primary'
                    : i < stepIdx
                      ? 'bg-primary/40'
                      : 'bg-muted-foreground/25'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">
            Step {stepIdx + 1} of {STEPS.length}
          </span>
        </div>

        <h4 className="font-semibold">{step.title}</h4>
        <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>

        {/* Factor table */}
        {step.factor && (
          <div className="mt-3">
            <p className="mb-2 text-xs font-medium text-muted-foreground">{step.factorLabel}</p>
            <div className="overflow-x-auto">
              <table className="text-sm">
                <thead>
                  <tr className="border-b">
                    {step.factor.vars.map((v) => (
                      <th key={v} className="px-3 py-1.5 text-left font-medium">
                        {v}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {step.factor.rows.map((row, i) => (
                    <tr key={i} className="border-b border-border/50 last:border-0">
                      {row.vals.map((v, j) => (
                        <td
                          key={j}
                          className={`px-3 py-1.5 font-mono text-xs ${
                            j === row.vals.length - 1 ? 'font-semibold text-primary' : ''
                          }`}
                        >
                          {v}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Final result callout */}
        {stepIdx === STEPS.length - 1 && (
          <div className="mt-4 rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm">
            <M>{'P(B{=}T \\mid J{=}T, M{=}T) \\approx 0.284'}</M>
            <p className="mt-1 text-xs text-muted-foreground">
              Despite the low prior (0.1%), hearing both John and Mary call raises the
              probability of burglary to ~28.4%.
            </p>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-4 flex gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={stepIdx === 0}
            onClick={() => setStepIdx((i) => i - 1)}
          >
            Previous
          </Button>
          <Button
            size="sm"
            disabled={stepIdx === STEPS.length - 1}
            onClick={() => setStepIdx((i) => i + 1)}
          >
            Next Step
          </Button>
        </div>
      </div>
    </div>
  );
}
