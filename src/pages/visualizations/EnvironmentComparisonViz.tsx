import { useState } from 'react';
import { motion } from 'framer-motion';

interface Environment {
  label: string;
  color: string;
  /** 6 values, 0–1, for: Observable, Deterministic, Episodic, Static, Discrete, Single-Agent */
  values: [number, number, number, number, number, number];
  callout?: string;
}

const DIMENSIONS = [
  { label: 'Observable', tip: 'Can the agent see the full state? 1 = fully observable, 0 = partially observable.' },
  { label: 'Deterministic', tip: 'Are outcomes predictable? 1 = deterministic, 0 = stochastic (random elements).' },
  { label: 'Episodic', tip: 'Are decisions independent? 1 = episodic (no history), 0 = sequential (decisions affect future).' },
  { label: 'Static', tip: 'Does the world wait for the agent? 1 = static, 0 = dynamic (changes while deciding).' },
  { label: 'Discrete', tip: 'Is the state/action space finite? 1 = discrete, 0 = continuous.' },
  { label: 'Single-Agent', tip: 'Only one agent acting? 1 = single, 0 = multi-agent (opponents/cooperators).' },
];

const ENVIRONMENTS: Environment[] = [
  { label: 'Chess', color: '#3b82f6', values: [1, 1, 0, 0.8, 1, 0], callout: 'Chess is fully observable and deterministic — "easy" dimensions. But it\'s sequential and multi-agent.' },
  { label: 'Poker', color: '#ef4444', values: [0.2, 0.3, 0, 0.8, 1, 0], callout: 'Poker\'s partial observability (hidden cards) and stochasticity (deck shuffling) make it fundamentally harder than chess.' },
  { label: 'Self-Driving Car', color: '#f59e0b', values: [0.3, 0.2, 0, 0, 0, 0], callout: 'Self-driving faces the hardest combination — partially observable, stochastic, sequential, dynamic, continuous, multi-agent.' },
  { label: 'Medical Diagnosis', color: '#8b5cf6', values: [0.2, 0.3, 0.3, 0.6, 0.4, 0.8], callout: 'Medical diagnosis operates under deep uncertainty — you can\'t observe all patient state, and treatments have probabilistic outcomes.' },
];

const CX = 150;
const CY = 140;
const R = 100;
const N = 6;

function getRadarPoint(index: number, value: number) {
  const angle = (Math.PI * 2 * index) / N - Math.PI / 2;
  return {
    x: CX + R * value * Math.cos(angle),
    y: CY + R * value * Math.sin(angle),
  };
}

export default function EnvironmentComparisonViz() {
  const [active, setActive] = useState<boolean[]>([true, false, true, false]);
  const [hoveredDim, setHoveredDim] = useState<number | null>(null);

  const activeEnvs = ENVIRONMENTS.filter((_, i) => active[i]);
  // Show callout if exactly one environment is active
  const singleActive = activeEnvs.length === 1 ? activeEnvs[0] : null;

  return (
    <div className="not-prose my-6 rounded-lg border border-border bg-card p-4">
      <h3 className="mb-1 text-lg font-semibold text-foreground">Environment Comparison</h3>
      <p className="mb-3 text-sm text-muted-foreground">
        Toggle environments to compare them on 6 dimensions. Hover on axis labels for explanations.
      </p>

      {/* Checkboxes */}
      <div className="mb-4 flex flex-wrap gap-3">
        {ENVIRONMENTS.map((env, i) => (
          <label key={env.label} className="flex items-center gap-1.5 cursor-pointer text-sm">
            <input
              type="checkbox"
              checked={active[i]}
              onChange={() => {
                const next = [...active];
                next[i] = !next[i];
                setActive(next);
              }}
              className="accent-current"
              style={{ accentColor: env.color }}
            />
            <span className="font-medium" style={{ color: env.color }}>{env.label}</span>
          </label>
        ))}
      </div>

      <div className="flex flex-col items-center">
        <svg viewBox="0 0 300 280" className="w-full max-w-[360px]">
          {/* Grid rings */}
          {[0.25, 0.5, 0.75, 1].map((ring) => (
            <polygon
              key={ring}
              points={Array.from({ length: N }, (_, i) => {
                const { x, y } = getRadarPoint(i, ring);
                return `${x},${y}`;
              }).join(' ')}
              fill="none"
              stroke="currentColor"
              className="text-border"
              strokeWidth={0.5}
            />
          ))}

          {/* Axis lines */}
          {DIMENSIONS.map((_, i) => {
            const { x, y } = getRadarPoint(i, 1);
            return (
              <line key={i} x1={CX} y1={CY} x2={x} y2={y}
                stroke="currentColor" className="text-border" strokeWidth={0.5} />
            );
          })}

          {/* Environment polygons */}
          {ENVIRONMENTS.map((env, i) => {
            if (!active[i]) return null;
            return (
              <motion.polygon
                key={env.label}
                points={env.values.map((v, j) => {
                  const { x, y } = getRadarPoint(j, v);
                  return `${x},${y}`;
                }).join(' ')}
                fill={env.color}
                fillOpacity={0.15}
                stroke={env.color}
                strokeWidth={2}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              />
            );
          })}

          {/* Data points */}
          {ENVIRONMENTS.map((env, i) => {
            if (!active[i]) return null;
            return env.values.map((v, j) => {
              const { x, y } = getRadarPoint(j, v);
              return <circle key={`${env.label}-${j}`} cx={x} cy={y} r={3} fill={env.color} />;
            });
          })}

          {/* Axis labels */}
          {DIMENSIONS.map((dim, i) => {
            const { x, y } = getRadarPoint(i, 1.22);
            const isHovered = hoveredDim === i;
            return (
              <text
                key={dim.label}
                x={x} y={y}
                textAnchor="middle"
                dominantBaseline="central"
                fill="currentColor"
                className={isHovered ? 'text-primary' : 'text-foreground'}
                fontSize={10}
                fontWeight={isHovered ? 700 : 500}
                onMouseEnter={() => setHoveredDim(i)}
                onMouseLeave={() => setHoveredDim(null)}
                style={{ cursor: 'help' }}
              >
                {dim.label}
              </text>
            );
          })}
        </svg>

        {/* Dimension tooltip */}
        {hoveredDim !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-1 rounded-md border border-border bg-muted/50 px-3 py-1.5 text-sm text-foreground max-w-sm text-center"
          >
            <strong>{DIMENSIONS[hoveredDim].label}:</strong> {DIMENSIONS[hoveredDim].tip}
          </motion.div>
        )}

        {/* Single-environment callout */}
        {singleActive?.callout && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 rounded-md border px-3 py-2 text-sm text-foreground max-w-sm"
            style={{ borderColor: singleActive.color, backgroundColor: `${singleActive.color}10` }}
          >
            {singleActive.callout}
          </motion.div>
        )}
      </div>

      <p className="mt-3 text-xs text-muted-foreground italic">
        Different environments cluster differently on the radar chart. Self-driving is uniquely hard &mdash; it scores low on nearly every "easy" dimension.
      </p>
    </div>
  );
}
