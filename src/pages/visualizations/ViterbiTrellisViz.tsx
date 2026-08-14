import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, RotateCcw, Route } from 'lucide-react';
import { BlockMath, M } from '@/components/Math';

// Same ice-cream HMM as ForwardTrellisViz
type StateId = 'HOT' | 'COLD';
const STATES: StateId[] = ['HOT', 'COLD'];

const INITIAL: Record<StateId, number> = { HOT: 0.8, COLD: 0.2 };
const A: Record<StateId, Record<StateId, number>> = {
  HOT:  { HOT: 0.7, COLD: 0.3 },
  COLD: { HOT: 0.4, COLD: 0.6 },
};
const B: Record<StateId, number[]> = {
  HOT:  [0.2, 0.4, 0.4],
  COLD: [0.5, 0.4, 0.1],
};

const OBS = [3, 1, 3];
const T = OBS.length;
const N = STATES.length;

interface Contribution {
  from: StateId;
  prevV: number;
  transition: number;
  emission: number;
  product: number;
}

interface Cell {
  state: StateId;
  t: number;
  v: number;
  best: StateId | null; // backpointer (null at t=0)
  contributions: Contribution[];
}

function computeViterbi(): { trellis: Cell[][]; bestFinal: StateId; bestPath: StateId[] } {
  const v: Record<StateId, number[]> = { HOT: new Array(T).fill(0), COLD: new Array(T).fill(0) };
  const bt: Record<StateId, (StateId | null)[]> = {
    HOT:  new Array(T).fill(null),
    COLD: new Array(T).fill(null),
  };

  // Init
  for (const s of STATES) {
    v[s][0] = INITIAL[s] * B[s][OBS[0] - 1];
    bt[s][0] = null;
  }

  // Recursion
  for (let t = 1; t < T; t++) {
    for (const j of STATES) {
      let bestVal = -Infinity;
      let bestFrom: StateId = STATES[0];
      for (const i of STATES) {
        const val = v[i][t - 1] * A[i][j] * B[j][OBS[t] - 1];
        if (val > bestVal) {
          bestVal = val;
          bestFrom = i;
        }
      }
      v[j][t] = bestVal;
      bt[j][t] = bestFrom;
    }
  }

  // Find best final state
  let bestFinal: StateId = STATES[0];
  let bestFinalVal = -Infinity;
  for (const s of STATES) {
    if (v[s][T - 1] > bestFinalVal) {
      bestFinalVal = v[s][T - 1];
      bestFinal = s;
    }
  }

  // Backtrace
  const path: StateId[] = new Array(T).fill(null);
  path[T - 1] = bestFinal;
  for (let t = T - 1; t > 0; t--) {
    path[t - 1] = bt[path[t]][t] as StateId;
  }

  const trellis: Cell[][] = STATES.map((s) =>
    Array.from({ length: T }, (_, t) => {
      const contribs: Contribution[] =
        t === 0
          ? []
          : STATES.map((i) => {
              const prev = v[i][t - 1];
              const trans = A[i][s];
              const emit = B[s][OBS[t] - 1];
              return { from: i, prevV: prev, transition: trans, emission: emit, product: prev * trans * emit };
            });
      return {
        state: s,
        t,
        v: v[s][t],
        best: bt[s][t],
        contributions: contribs,
      };
    }),
  );

  return { trellis, bestFinal, bestPath: path };
}

const { trellis: TRELLIS, bestFinal: BEST_FINAL, bestPath: BEST_PATH } = computeViterbi();
const BEST_SCORE = TRELLIS[STATES.indexOf(BEST_FINAL)][T - 1].v;

// Layout (mirrors Forward viz)
const CELL_W = 140;
const CELL_H = 80;
const ROW_GAP = 30;
const COL_GAP = 60;
const PAD_X = 70;
const PAD_Y = 60;
const SVG_W = PAD_X * 2 + T * CELL_W + (T - 1) * COL_GAP;
const SVG_H = PAD_Y * 2 + N * CELL_H + (N - 1) * ROW_GAP + 60;

function cellPos(stateIdx: number, t: number) {
  return { x: PAD_X + t * (CELL_W + COL_GAP), y: PAD_Y + stateIdx * (CELL_H + ROW_GAP) };
}

// Steps: setup → init → T-1 recursions → termination+backtrace
const TOTAL_STEPS = 1 + 1 + (T - 1) + 1;

function formatNum(n: number): string {
  if (n === 0) return '0';
  if (n >= 0.01) return n.toFixed(4);
  return n.toExponential(2);
}

export default function ViterbiTrellisViz() {
  const [step, setStep] = useState(0);

  const revealT = useMemo(() => {
    if (step === 0) return -1;
    if (step >= TOTAL_STEPS - 1) return T - 1;
    return step - 1;
  }, [step]);

  const isTerm = step === TOTAL_STEPS - 1;

  return (
    <div className="rounded-lg border border-border bg-card p-4 my-6 space-y-4">
      {/* Header + controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold">Decoding O = 3 1 3 with Viterbi</div>
          <div className="text-xs text-muted-foreground">
            Step {step + 1} / {TOTAL_STEPS} —{' '}
            {step === 0 && 'Setup'}
            {step === 1 && 'Initialization (t = 1)'}
            {step > 1 && step < TOTAL_STEPS - 1 && `Recursion at t = ${step}`}
            {isTerm && 'Termination + backtrace'}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={() => setStep(0)}>
            <RotateCcw className="size-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={() => setStep((s) => Math.max(s - 1, 0))} disabled={step === 0}>
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            size="sm"
            onClick={() => setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1))}
            disabled={step === TOTAL_STEPS - 1}
          >
            Next
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      {/* Trellis */}
      <div className="overflow-x-auto rounded-md bg-muted/30 border border-border">
        <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full min-w-[560px] h-auto">
          {/* Observation labels */}
          {OBS.map((o, t) => {
            const { x } = cellPos(0, t);
            return (
              <g key={`obs-${t}`}>
                <rect
                  x={x + CELL_W / 2 - 18}
                  y={SVG_H - 42}
                  width={36}
                  height={36}
                  rx={6}
                  fill={revealT >= t ? 'var(--primary)' : 'var(--muted)'}
                  stroke={revealT >= t ? 'var(--primary)' : 'var(--border)'}
                  strokeWidth={2}
                />
                <text
                  x={x + CELL_W / 2}
                  y={SVG_H - 24}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className={`text-sm font-bold ${revealT >= t ? 'fill-primary-foreground' : 'fill-muted-foreground'}`}
                >
                  {o}
                </text>
              </g>
            );
          })}

          {/* Non-winning edges */}
          {TRELLIS.flatMap((row, si) =>
            row.map((cell) => {
              if (cell.t === 0 || cell.t > revealT) return null;
              const toPos = cellPos(si, cell.t);
              return cell.contributions.map((c) => {
                const isWinning = cell.best === c.from;
                if (isWinning) return null;
                const fromIdx = STATES.indexOf(c.from);
                const fromPos = cellPos(fromIdx, cell.t - 1);
                return (
                  <line
                    key={`e-${cell.state}-${cell.t}-${c.from}`}
                    x1={fromPos.x + CELL_W}
                    y1={fromPos.y + CELL_H / 2}
                    x2={toPos.x}
                    y2={toPos.y + CELL_H / 2}
                    stroke="var(--muted-foreground)"
                    strokeWidth={1}
                    opacity={0.3}
                    strokeDasharray="4 3"
                  />
                );
              });
            }),
          )}

          {/* Winning (argmax) edges */}
          {TRELLIS.flatMap((row, si) =>
            row.map((cell) => {
              if (cell.t === 0 || cell.t > revealT || cell.best == null) return null;
              const toPos = cellPos(si, cell.t);
              const fromIdx = STATES.indexOf(cell.best);
              const fromPos = cellPos(fromIdx, cell.t - 1);
              // Highlight the backtrace path when we reach the termination step
              const onBestPath = isTerm && BEST_PATH[cell.t] === cell.state && BEST_PATH[cell.t - 1] === cell.best;
              return (
                <line
                  key={`win-${cell.state}-${cell.t}`}
                  x1={fromPos.x + CELL_W}
                  y1={fromPos.y + CELL_H / 2}
                  x2={toPos.x}
                  y2={toPos.y + CELL_H / 2}
                  stroke={onBestPath ? 'var(--color-key-idea, #8b5cf6)' : 'var(--primary)'}
                  strokeWidth={onBestPath ? 4 : 2}
                  opacity={onBestPath ? 1 : 0.75}
                />
              );
            }),
          )}

          {/* Cells */}
          {TRELLIS.flatMap((row, si) =>
            row.map((cell) => {
              const { x, y } = cellPos(si, cell.t);
              const revealed = cell.t <= revealT;
              const color = cell.state === 'HOT' ? '#fb923c' : '#60a5fa';
              const ring = cell.state === 'HOT' ? '#ea580c' : '#2563eb';
              const textCol = cell.state === 'HOT' ? '#7c2d12' : '#1e3a8a';
              const onBestPath = isTerm && BEST_PATH[cell.t] === cell.state;

              return (
                <motion.g key={`cell-${cell.state}-${cell.t}`} initial={false} animate={{ opacity: revealed ? 1 : 0.25 }}>
                  <rect
                    x={x}
                    y={y}
                    width={CELL_W}
                    height={CELL_H}
                    rx={10}
                    fill={revealed ? color : 'var(--muted)'}
                    stroke={onBestPath ? 'var(--color-key-idea, #8b5cf6)' : revealed ? ring : 'var(--border)'}
                    strokeWidth={onBestPath ? 5 : revealed ? 3 : 1.5}
                    opacity={revealed ? 0.2 : 1}
                  />
                  <rect
                    x={x}
                    y={y}
                    width={CELL_W}
                    height={26}
                    rx={10}
                    fill={revealed ? color : 'var(--border)'}
                  />
                  <text
                    x={x + 12}
                    y={y + 13}
                    dominantBaseline="middle"
                    className="text-[11px] font-bold"
                    fill={revealed ? textCol : 'var(--muted-foreground)'}
                  >
                    {cell.state}
                  </text>
                  <text
                    x={x + CELL_W - 12}
                    y={y + 13}
                    textAnchor="end"
                    dominantBaseline="middle"
                    className="text-[10px] font-mono"
                    fill={revealed ? textCol : 'var(--muted-foreground)'}
                  >
                    v{cell.t + 1}({cell.state === 'HOT' ? 'H' : 'C'})
                  </text>
                  <text
                    x={x + CELL_W / 2}
                    y={y + 53}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-lg font-bold font-mono fill-foreground"
                  >
                    {revealed ? formatNum(cell.v) : '?'}
                  </text>
                </motion.g>
              );
            }),
          )}
        </svg>
      </div>

      {/* Explanation */}
      <StepExplanation step={step} />

      {/* Termination + backtrace summary */}
      {isTerm && (
        <div className="rounded-md border-2 bg-[color:var(--color-key-idea-light,#f3e8ff)] border-[color:var(--color-key-idea,#8b5cf6)] p-4 space-y-2">
          <div className="flex items-center gap-2 font-semibold text-[color:var(--color-key-idea-dark,#6b21a8)]">
            <Route className="size-4" />
            Best path via backtrace
          </div>
          <div className="font-mono text-lg font-bold tracking-wide flex flex-wrap items-center gap-2">
            {BEST_PATH.map((s, i) => (
              <span key={i} className="flex items-center gap-2">
                <span
                  className="rounded px-2 py-0.5 border-2"
                  style={{
                    backgroundColor: s === 'HOT' ? '#fb923c' : '#60a5fa',
                    color: s === 'HOT' ? '#7c2d12' : '#1e3a8a',
                    borderColor: s === 'HOT' ? '#ea580c' : '#2563eb',
                  }}
                >
                  {s}
                </span>
                {i < BEST_PATH.length - 1 && <span className="text-muted-foreground">→</span>}
              </span>
            ))}
          </div>
          <BlockMath>{`P(\\text{best path}, O) = ${formatNum(BEST_SCORE)}`}</BlockMath>
          <div className="text-sm text-muted-foreground">
            The purple arrows trace the backpointers from the best final state back to the start. This is the single
            most likely hidden state sequence that could have produced the observations <strong>3 1 3</strong>.
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2 items-center text-xs text-muted-foreground">
        <Badge variant="outline" className="font-mono">
          Forward: α uses SUM
        </Badge>
        <Badge variant="outline" className="font-mono">
          Viterbi: v uses MAX + backpointer
        </Badge>
      </div>
    </div>
  );
}

function StepExplanation({ step }: { step: number }) {
  if (step === 0) {
    return (
      <div className="rounded-md bg-muted/40 border border-border p-3 text-sm space-y-2">
        <div className="font-semibold">Setup</div>
        <p className="text-muted-foreground">
          Viterbi answers: <em>which hidden sequence most likely produced the observations?</em> It uses the same
          trellis as the forward algorithm, but replaces the sum with a <strong>max</strong>, and records a
          backpointer so we can reconstruct the best path at the end.
        </p>
      </div>
    );
  }

  if (step === 1) {
    return (
      <div className="rounded-md bg-muted/40 border border-border p-3 text-sm space-y-2">
        <div className="font-semibold">Initialization — fill column t = 1</div>
        <BlockMath>{'v_1(j) = \\pi_j \\cdot b_j(o_1)'}</BlockMath>
        <div className="font-mono text-xs space-y-1">
          <div>
            v₁(H) = 0.8 · 0.4 = <strong>{formatNum(TRELLIS[0][0].v)}</strong>
          </div>
          <div>
            v₁(C) = 0.2 · 0.1 = <strong>{formatNum(TRELLIS[1][0].v)}</strong>
          </div>
        </div>
        <div className="text-muted-foreground">
          Exactly like the forward algorithm — at t = 1 there is only one path into each cell, so max and sum agree.
        </div>
      </div>
    );
  }

  if (step === TOTAL_STEPS - 1) {
    return (
      <div className="rounded-md bg-muted/40 border border-border p-3 text-sm space-y-2">
        <div className="font-semibold">Termination &amp; backtrace</div>
        <BlockMath>{'P^* = \\max_i v_T(i) \\qquad q_T^* = \\text{argmax}_i\\ v_T(i)'}</BlockMath>
        <p className="text-muted-foreground">
          Pick the state with the highest final score, then follow the backpointers (solid arrows) back through the
          trellis to reconstruct the full state sequence.
        </p>
      </div>
    );
  }

  const t = step - 1;
  const cellH = TRELLIS[0][t];
  const cellC = TRELLIS[1][t];
  const obs = OBS[t];

  return (
    <div className="rounded-md bg-muted/40 border border-border p-3 text-sm space-y-2">
      <div className="font-semibold">
        Recursion — fill column t = {t + 1} (observation o{t + 1} = {obs})
      </div>
      <BlockMath>
        {'v_t(j) = \\max_{i}\\ v_{t-1}(i)\\, a_{ij}\\, b_j(o_t) \\qquad bt_t(j) = \\arg\\max_{i}\\ v_{t-1}(i)\\, a_{ij}\\, b_j(o_t)'}
      </BlockMath>
      <div className="space-y-2 font-mono text-xs">
        <div>
          <div className="font-semibold text-foreground">v_{t + 1}(H):</div>
          <div className="pl-3">
            max(
            {formatNum(cellH.contributions[0].product)} via H,{' '}
            {formatNum(cellH.contributions[1].product)} via C
            ) ={' '}
            <strong className="text-foreground">{formatNum(cellH.v)}</strong> &nbsp;← via <strong>{cellH.best}</strong>
          </div>
        </div>
        <div>
          <div className="font-semibold text-foreground">v_{t + 1}(C):</div>
          <div className="pl-3">
            max(
            {formatNum(cellC.contributions[0].product)} via H,{' '}
            {formatNum(cellC.contributions[1].product)} via C
            ) ={' '}
            <strong className="text-foreground">{formatNum(cellC.v)}</strong> &nbsp;← via <strong>{cellC.best}</strong>
          </div>
        </div>
      </div>
      <div className="text-muted-foreground">
        Instead of summing contributions, we keep only the best one. The solid arrows in the trellis point to the
        "winning" predecessor for each cell — these are the <M>{'bt_t(j)'}</M> backpointers.
      </div>
    </div>
  );
}
