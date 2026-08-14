import { useEffect, useMemo, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, RotateCcw, StepForward } from 'lucide-react';
import { M } from '@/components/Math';

// ── Model ───────────────────────────────────────────────────────────

type StateId = 'HOT' | 'COLD' | 'WARM';
const STATES: StateId[] = ['HOT', 'COLD', 'WARM'];

// π = [.5, .3, .2] from the slides (indexed in STATES order)
const PI: Record<StateId, number> = { HOT: 0.5, COLD: 0.3, WARM: 0.2 };

// Transition matrix from the slide "The weather figure: specific example"
// rows = from, cols = to
const A: Record<StateId, Record<StateId, number>> = {
  HOT:  { HOT: 0.5, COLD: 0.2, WARM: 0.3 },
  COLD: { HOT: 0.2, COLD: 0.5, WARM: 0.3 },
  WARM: { HOT: 0.3, COLD: 0.1, WARM: 0.6 },
};

// Node layout (circles in an equilateral-ish triangle)
const NODE_POS: Record<StateId, { x: number; y: number }> = {
  HOT:  { x: 150, y: 300 },
  COLD: { x: 320, y: 120 },
  WARM: { x: 490, y: 300 },
};

const NODE_COLORS: Record<StateId, { fill: string; ring: string; text: string }> = {
  HOT:  { fill: '#fb923c', ring: '#ea580c', text: '#7c2d12' },
  COLD: { fill: '#60a5fa', ring: '#2563eb', text: '#1e3a8a' },
  WARM: { fill: '#fbbf24', ring: '#d97706', text: '#78350f' },
};

const R = 40;

// ── Helpers ─────────────────────────────────────────────────────────

function sampleNext(from: StateId): StateId {
  const r = Math.random();
  let acc = 0;
  for (const to of STATES) {
    acc += A[from][to];
    if (r < acc) return to;
  }
  return STATES[STATES.length - 1];
}

function sampleInitial(): StateId {
  const r = Math.random();
  let acc = 0;
  for (const s of STATES) {
    acc += PI[s];
    if (r < acc) return s;
  }
  return STATES[0];
}

// Centroid of the three state positions — used to direct self-loops outward.
const CENTROID = {
  x: (NODE_POS.HOT.x + NODE_POS.COLD.x + NODE_POS.WARM.x) / 3,
  y: (NODE_POS.HOT.y + NODE_POS.COLD.y + NODE_POS.WARM.y) / 3,
};

// Compute a quadratic bezier control point for a curved edge between two nodes
function edgePath(from: StateId, to: StateId): { d: string; labelX: number; labelY: number } {
  const a = NODE_POS[from];
  const b = NODE_POS[to];

  if (from === to) {
    // Self-loop: a clean cubic Bezier lobe pointing outward from the centroid.
    const dxC = a.x - CENTROID.x;
    const dyC = a.y - CENTROID.y;
    const lenC = Math.hypot(dxC, dyC) || 1;
    const ox = dxC / lenC; // outward unit vector
    const oy = dyC / lenC;
    const px = -oy; // perpendicular (tangent at the node)
    const py = ox;

    const tangent = R * 0.55; // half-width of the loop base on the node
    const depth = R * 1.5;    // how far the loop extends outward

    const startX = a.x + ox * R - px * tangent;
    const startY = a.y + oy * R - py * tangent;
    const endX = a.x + ox * R + px * tangent;
    const endY = a.y + oy * R + py * tangent;
    const c1x = startX + ox * depth;
    const c1y = startY + oy * depth;
    const c2x = endX + ox * depth;
    const c2y = endY + oy * depth;

    const d = `M ${startX} ${startY} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${endX} ${endY}`;
    const labelX = a.x + ox * (R + depth * 0.7);
    const labelY = a.y + oy * (R + depth * 0.7);
    return { d, labelX, labelY };
  }

  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy);
  const ux = dx / len;
  const uy = dy / len;

  // Shrink the endpoints by the radius so arrows don't dive into nodes
  const sx = a.x + ux * R;
  const sy = a.y + uy * R;
  const ex = b.x - ux * R;
  const ey = b.y - uy * R;

  // Curve the path perpendicularly
  const midX = (sx + ex) / 2;
  const midY = (sy + ey) / 2;
  const perpX = -uy;
  const perpY = ux;
  const curve = 28;
  const cx = midX + perpX * curve;
  const cy = midY + perpY * curve;

  const d = `M ${sx} ${sy} Q ${cx} ${cy} ${ex} ${ey}`;
  // Label sits a bit further along the perpendicular
  const labelX = midX + perpX * (curve + 10);
  const labelY = midY + perpY * (curve + 10);
  return { d, labelX, labelY };
}

interface Step {
  state: StateId;
  fromState: StateId | null; // null at t=0
}

// ── Component ───────────────────────────────────────────────────────

export default function WeatherMarkovChainViz() {
  const [steps, setSteps] = useState<Step[]>(() => [
    { state: sampleInitial(), fromState: null },
  ]);
  const [playing, setPlaying] = useState(false);
  const playingRef = useRef(playing);
  playingRef.current = playing;

  const current = steps[steps.length - 1];

  // Auto-play loop
  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => {
      if (!playingRef.current) return;
      setSteps((prev) => {
        if (prev.length >= 24) {
          setPlaying(false);
          return prev;
        }
        const last = prev[prev.length - 1];
        const next = sampleNext(last.state);
        return [...prev, { state: next, fromState: last.state }];
      });
    }, 700);
    return () => window.clearInterval(id);
  }, [playing]);

  const doStep = () => {
    setSteps((prev) => {
      if (prev.length >= 24) return prev;
      const last = prev[prev.length - 1];
      const next = sampleNext(last.state);
      return [...prev, { state: next, fromState: last.state }];
    });
  };

  const reset = () => {
    setPlaying(false);
    setSteps([{ state: sampleInitial(), fromState: null }]);
  };

  // Compute the sequence probability so far
  const pathProb = useMemo(() => {
    let p = PI[steps[0].state];
    for (let i = 1; i < steps.length; i++) {
      p *= A[steps[i].fromState as StateId][steps[i].state];
    }
    return p;
  }, [steps]);

  const activeEdge = current.fromState
    ? { from: current.fromState, to: current.state }
    : null;

  return (
    <div className="rounded-lg border border-border bg-card p-4 my-6 space-y-4">
      {/* Diagram */}
      <div className="flex justify-center">
        <svg
          viewBox="-20 -30 680 480"
          className="w-full max-w-[660px] h-auto"
          role="img"
          aria-label="Weather Markov chain diagram"
        >
          {/* Edges */}
          {STATES.flatMap((from) =>
            STATES.map((to) => {
              const { d, labelX, labelY } = edgePath(from, to);
              const isActive = activeEdge && activeEdge.from === from && activeEdge.to === to;
              return (
                <g key={`${from}->${to}`}>
                  <path
                    d={d}
                    fill="none"
                    stroke={isActive ? 'var(--color-key-idea, #8b5cf6)' : 'var(--border)'}
                    strokeWidth={isActive ? 3 : 1.5}
                    markerEnd={from === to ? undefined : 'url(#mc-arrow)'}
                    className="transition-all duration-300"
                    opacity={isActive ? 1 : 0.55}
                  />
                  <text
                    x={labelX}
                    y={labelY}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-foreground text-[11px] font-mono font-semibold"
                  >
                    {A[from][to].toFixed(1)}
                  </text>
                </g>
              );
            }),
          )}

          {/* Arrow marker */}
          <defs>
            <marker
              id="mc-arrow"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted-foreground)" />
            </marker>
          </defs>

          {/* Nodes */}
          {STATES.map((s) => {
            const { x, y } = NODE_POS[s];
            const { fill, ring, text } = NODE_COLORS[s];
            const isCurrent = current.state === s;
            return (
              <g key={s}>
                <motion.circle
                  cx={x}
                  cy={y}
                  r={R}
                  fill={fill}
                  stroke={ring}
                  strokeWidth={isCurrent ? 5 : 2}
                  animate={{
                    scale: isCurrent ? 1.08 : 1,
                  }}
                  style={{ originX: `${x}px`, originY: `${y}px` }}
                  transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                />
                <text
                  x={x}
                  y={y - 4}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={text}
                  className="text-sm font-bold pointer-events-none"
                >
                  {s}
                </text>
                <text
                  x={x}
                  y={y + 12}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={text}
                  className="text-[10px] font-mono pointer-events-none"
                >
                  π={PI[s]}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button size="sm" variant={playing ? 'secondary' : 'default'} onClick={() => setPlaying((p) => !p)}>
          {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
          {playing ? 'Pause' : 'Play'}
        </Button>
        <Button size="sm" variant="outline" onClick={doStep} disabled={steps.length >= 24}>
          <StepForward className="size-4" />
          Step
        </Button>
        <Button size="sm" variant="ghost" onClick={reset}>
          <RotateCcw className="size-4" />
          Reset
        </Button>
      </div>

      {/* Sequence */}
      <div>
        <div className="text-xs text-muted-foreground mb-2">Sampled sequence (step {steps.length - 1}):</div>
        <div className="flex flex-wrap gap-1.5">
          <AnimatePresence initial={false}>
            {steps.map((step, i) => {
              const colors = NODE_COLORS[step.state];
              return (
                <motion.div
                  key={i}
                  layout
                  initial={{ opacity: 0, scale: 0.7, y: -6 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-1"
                >
                  <Badge
                    variant="outline"
                    style={{
                      backgroundColor: colors.fill,
                      color: colors.text,
                      borderColor: colors.ring,
                    }}
                    className="font-bold text-[11px] px-2 py-0.5"
                  >
                    {step.state}
                  </Badge>
                  {i < steps.length - 1 && (
                    <span className="text-muted-foreground text-xs">→</span>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Probability readout */}
      <div className="rounded-md bg-muted/50 border border-border p-3 text-sm">
        <div className="font-semibold mb-1">Probability of this exact sequence:</div>
        <div className="font-mono text-xs break-all">
          {steps.length === 1 ? (
            <span>
              <M>{`\\pi_{${steps[0].state}} = ${PI[steps[0].state]}`}</M>
            </span>
          ) : (
            <>
              <M>{`\\pi_{${steps[0].state}}`}</M>
              {steps.slice(1).map((s, i) => (
                <span key={i}>
                  {' · '}
                  <M>{`a_{${steps[i].state}\\to ${s.state}}`}</M>
                </span>
              ))}
              {' = '}
              <strong>{pathProb.toExponential(3)}</strong>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
