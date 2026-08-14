import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { M } from '@/components/Math';

// ── Scenarios ───────────────────────────────────────────────────────

interface Scenario {
  key: string;
  label: string;
  alarm: boolean;
  earthquake: boolean;
  pBurglary: number;
  pEarthquake: number;
  explanation: string;
}

const SCENARIOS: Scenario[] = [
  {
    key: 'none',
    label: 'No evidence',
    alarm: false,
    earthquake: false,
    pBurglary: 0.001,
    pEarthquake: 0.002,
    explanation:
      'With no observations, B and E have their prior probabilities. They are marginally independent — knowing nothing about the alarm, one tells us nothing about the other.',
  },
  {
    key: 'alarm',
    label: 'Alarm observed',
    alarm: true,
    earthquake: false,
    pBurglary: 0.374,
    pEarthquake: 0.231,
    explanation:
      'The alarm went off! Both burglary and earthquake become much more likely — each could explain the alarm. B and E are now dependent because they share a common effect that has been observed.',
  },
  {
    key: 'alarm+eq',
    label: 'Alarm + Earthquake',
    alarm: true,
    earthquake: true,
    pBurglary: 0.003,
    pEarthquake: 1.0,
    explanation:
      'We learn there actually was an earthquake. This "explains away" the alarm — burglary probability drops from 37.4% back down to 0.3%. The earthquake already accounts for the alarm, so burglary becomes unnecessary.',
  },
];

// ── Network SVG ─────────────────────────────────────────────────────

const NET = {
  B: { x: 100, y: 45, label: 'Burglary' },
  E: { x: 300, y: 45, label: 'Earthquake' },
  A: { x: 200, y: 145, label: 'Alarm' },
} as const;

const NET_EDGES: [keyof typeof NET, keyof typeof NET][] = [
  ['B', 'A'],
  ['E', 'A'],
];

const R = 24;

function MiniNetwork({ alarm, earthquake }: { alarm: boolean; earthquake: boolean }) {
  return (
    <svg viewBox="0 0 400 195" className="w-full max-w-sm" role="img">
      <defs>
        <marker
          id="ea-arrow"
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

      {NET_EDGES.map(([from, to]) => {
        const a = NET[from];
        const b = NET[to];
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
            markerEnd="url(#ea-arrow)"
          />
        );
      })}

      {/* B */}
      <circle cx={NET.B.x} cy={NET.B.y} r={R} className="fill-card stroke-border" strokeWidth={2} />
      <text
        x={NET.B.x}
        y={NET.B.y + 1}
        textAnchor="middle"
        dominantBaseline="central"
        className="fill-foreground text-[11px] font-semibold select-none"
      >
        B
      </text>

      {/* E */}
      <circle
        cx={NET.E.x}
        cy={NET.E.y}
        r={R}
        className={earthquake ? 'fill-amber-500/25 stroke-amber-500' : 'fill-card stroke-border'}
        strokeWidth={2}
      />
      <text
        x={NET.E.x}
        y={NET.E.y + 1}
        textAnchor="middle"
        dominantBaseline="central"
        className="fill-foreground text-[11px] font-semibold select-none"
      >
        E
      </text>
      {earthquake && (
        <text
          x={NET.E.x}
          y={NET.E.y + R + 13}
          textAnchor="middle"
          className="fill-amber-600 text-[9px] font-medium dark:fill-amber-400"
        >
          = True
        </text>
      )}

      {/* A */}
      <circle
        cx={NET.A.x}
        cy={NET.A.y}
        r={R}
        className={alarm ? 'fill-amber-500/25 stroke-amber-500' : 'fill-card stroke-border'}
        strokeWidth={2}
      />
      <text
        x={NET.A.x}
        y={NET.A.y + 1}
        textAnchor="middle"
        dominantBaseline="central"
        className="fill-foreground text-[11px] font-semibold select-none"
      >
        A
      </text>
      {alarm && (
        <text
          x={NET.A.x}
          y={NET.A.y + R + 13}
          textAnchor="middle"
          className="fill-amber-600 text-[9px] font-medium dark:fill-amber-400"
        >
          = True
        </text>
      )}
    </svg>
  );
}

// ── Probability bar ─────────────────────────────────────────────────

function ProbBar({ label, value, maxValue }: { label: string; value: number; maxValue: number }) {
  const pct = Math.min((value / maxValue) * 100, 100);
  const display = value >= 0.01 ? `${(value * 100).toFixed(1)}%` : `${(value * 100).toFixed(2)}%`;

  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="font-mono text-xs font-semibold text-primary">{display}</span>
      </div>
      <div className="h-5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all duration-700 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ── Component ───────────────────────────────────────────────────────

export default function ExplainingAwayViz() {
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const scenario = SCENARIOS[scenarioIdx];

  return (
    <div className="my-6 rounded-xl border bg-card p-4">
      <div className="mb-1">
        <h3 className="font-semibold">Explaining Away</h3>
        <p className="text-sm text-muted-foreground">
          Two causes (B, E) are independent a priori, but become dependent once their common
          effect (A) is observed. Observing one cause "explains away" the other.
        </p>
      </div>

      {/* Network */}
      <div className="flex justify-center">
        <MiniNetwork alarm={scenario.alarm} earthquake={scenario.earthquake} />
      </div>

      {/* Toggle buttons */}
      <div className="flex flex-wrap justify-center gap-2">
        {SCENARIOS.map((s, i) => (
          <Button
            key={s.key}
            size="sm"
            variant={i === scenarioIdx ? 'default' : 'outline'}
            onClick={() => setScenarioIdx(i)}
          >
            {s.label}
          </Button>
        ))}
      </div>

      {/* Probability bars */}
      <div className="mx-auto mt-5 max-w-md space-y-4">
        <ProbBar
          label="P(Burglary = T)"
          value={scenario.pBurglary}
          maxValue={0.5}
        />
        <ProbBar
          label="P(Earthquake = T)"
          value={scenario.pEarthquake}
          maxValue={1.0}
        />
      </div>

      {/* Explanation */}
      <div className="mx-auto mt-5 max-w-md rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
        <p>{scenario.explanation}</p>
      </div>

      {/* Key numbers callout */}
      {scenarioIdx === 2 && (
        <div className="mx-auto mt-3 max-w-md rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm">
          <p className="font-medium text-foreground">The dramatic drop:</p>
          <p className="mt-1 text-muted-foreground">
            <M>{'P(B \\mid A{=}T) \\approx 37.4\\%'}</M>
            {' '}&rarr;{' '}
            <M>{'P(B \\mid A{=}T, E{=}T) \\approx 0.3\\%'}</M>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Learning about the earthquake "explains away" the alarm, making burglary over 100x
            less likely.
          </p>
        </div>
      )}
    </div>
  );
}
