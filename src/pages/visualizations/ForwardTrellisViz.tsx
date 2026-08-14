import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, RotateCcw, Zap } from 'lucide-react';
import { BlockMath, M } from '@/components/Math';

// ── Ice Cream HMM (matches the slides) ────────────────────────────────

type StateId = 'HOT' | 'COLD';
const STATES: StateId[] = ['HOT', 'COLD'];

const INITIAL: Record<StateId, number> = { HOT: 0.8, COLD: 0.2 };
const A: Record<StateId, Record<StateId, number>> = {
  HOT:  { HOT: 0.7, COLD: 0.3 },
  COLD: { HOT: 0.4, COLD: 0.6 },
};
// Emissions indexed [obs-1]: obs ∈ {1,2,3}
const B: Record<StateId, number[]> = {
  HOT:  [0.2, 0.4, 0.4],
  COLD: [0.5, 0.4, 0.1],
};

const OBS = [3, 1, 3]; // The classic Jurafsky example
const T = OBS.length;
const N = STATES.length;

// ── Compute the full forward trellis up front ─────────────────────────

interface CellContribution {
  from: StateId;
  prevAlpha: number;
  transition: number;
  emission: number;
  product: number;
}

interface Cell {
  state: StateId;
  t: number;
  alpha: number;
  contributions: CellContribution[]; // empty at t=0 (initialization uses π)
}

function computeTrellis(): Cell[][] {
  const alpha: Record<StateId, number[]> = { HOT: new Array(T).fill(0), COLD: new Array(T).fill(0) };

  // Initialization: α₁(j) = π_j · b_j(o₁)
  for (const s of STATES) {
    alpha[s][0] = INITIAL[s] * B[s][OBS[0] - 1];
  }

  // Recursion
  for (let t = 1; t < T; t++) {
    for (const j of STATES) {
      let sum = 0;
      for (const i of STATES) {
        sum += alpha[i][t - 1] * A[i][j] * B[j][OBS[t] - 1];
      }
      alpha[j][t] = sum;
    }
  }

  // Materialize as [state][t] with contributions
  return STATES.map((s) =>
    Array.from({ length: T }, (_, t) => {
      const contribs: CellContribution[] =
        t === 0
          ? []
          : STATES.map((i) => {
              const prev = alpha[i][t - 1];
              const trans = A[i][s];
              const emit = B[s][OBS[t] - 1];
              return {
                from: i,
                prevAlpha: prev,
                transition: trans,
                emission: emit,
                product: prev * trans * emit,
              };
            });
      return {
        state: s,
        t,
        alpha: alpha[s][t],
        contributions: contribs,
      };
    }),
  );
}

const TRELLIS = computeTrellis();
const FINAL_PROB = TRELLIS.reduce((acc, row) => acc + row[T - 1].alpha, 0);

// ── Visual layout ─────────────────────────────────────────────────────

const CELL_W = 140;
const CELL_H = 80;
const ROW_GAP = 30;
const COL_GAP = 60;
const PAD_X = 70;
const PAD_Y = 60;
const SVG_W = PAD_X * 2 + T * CELL_W + (T - 1) * COL_GAP;
const SVG_H = PAD_Y * 2 + N * CELL_H + (N - 1) * ROW_GAP + 60;

function cellPos(stateIdx: number, t: number) {
  const x = PAD_X + t * (CELL_W + COL_GAP);
  const y = PAD_Y + stateIdx * (CELL_H + ROW_GAP);
  return { x, y };
}

// ── Steps in the walkthrough ──────────────────────────────────────────
// Step 0: nothing revealed (explain setup)
// Step 1: initialization (t=0, both cells)
// Step 2..T: recursion for t=1, t=2, ... (each step reveals column t)
// Step T+1: termination (sum final column)
const TOTAL_STEPS = 1 + 1 + (T - 1) + 1; // setup + init + recursions + term

function formatNum(n: number): string {
  if (n === 0) return '0';
  if (n >= 0.01) return n.toFixed(4);
  return n.toExponential(2);
}

// ── Component ─────────────────────────────────────────────────────────

export default function ForwardTrellisViz() {
  const [step, setStep] = useState(0);

  const revealT = useMemo(() => {
    // At step 0, nothing revealed (-1)
    // At step 1, t=0 revealed (init)
    // At step 2, t=1 revealed
    // At step 3, t=2 revealed
    // At step TOTAL_STEPS-1 (termination), everything revealed
    if (step === 0) return -1;
    if (step >= TOTAL_STEPS - 1) return T - 1;
    return step - 1;
  }, [step]);

  const isTermStep = step === TOTAL_STEPS - 1;

  return (
    <div className="rounded-lg border border-border bg-card p-4 my-6 space-y-4">
      {/* Header + step control */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold">Observation sequence O = 3 1 3</div>
          <div className="text-xs text-muted-foreground">
            Step {step + 1} / {TOTAL_STEPS} —{' '}
            {step === 0 && 'Setup'}
            {step === 1 && 'Initialization (t = 1)'}
            {step > 1 && step < TOTAL_STEPS - 1 && `Recursion at t = ${step}`}
            {isTermStep && 'Termination: sum final column'}
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

      {/* Trellis SVG */}
      <div className="overflow-x-auto rounded-md bg-muted/30 border border-border">
        <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full min-w-[560px] h-auto">
          {/* Observation labels along the bottom */}
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
                <text
                  x={x + CELL_W / 2}
                  y={SVG_H - 4}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-muted-foreground text-[10px] font-mono"
                >
                  o{t + 1}
                </text>
              </g>
            );
          })}

          {/* Edges from t-1 to t (shown when cell t is revealed) */}
          {TRELLIS.flatMap((row, si) =>
            row.map((cell) => {
              if (cell.t === 0 || cell.t > revealT) return null;
              const toPos = cellPos(si, cell.t);
              return cell.contributions.map((c) => {
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
                    strokeWidth={1.5}
                    opacity={0.55}
                  />
                );
              });
            }),
          )}

          {/* Cells */}
          {TRELLIS.flatMap((row, si) =>
            row.map((cell) => {
              const { x, y } = cellPos(si, cell.t);
              const revealed = cell.t <= revealT;
              const stateColor = cell.state === 'HOT' ? '#fb923c' : '#60a5fa';
              const stateRing = cell.state === 'HOT' ? '#ea580c' : '#2563eb';
              const stateText = cell.state === 'HOT' ? '#7c2d12' : '#1e3a8a';

              return (
                <motion.g
                  key={`cell-${cell.state}-${cell.t}`}
                  initial={false}
                  animate={{ opacity: revealed ? 1 : 0.25 }}
                  transition={{ duration: 0.3 }}
                >
                  <rect
                    x={x}
                    y={y}
                    width={CELL_W}
                    height={CELL_H}
                    rx={10}
                    fill={revealed ? stateColor : 'var(--muted)'}
                    stroke={revealed ? stateRing : 'var(--border)'}
                    strokeWidth={revealed ? 3 : 1.5}
                    opacity={revealed ? 0.2 : 1}
                  />
                  <rect
                    x={x}
                    y={y}
                    width={CELL_W}
                    height={26}
                    rx={10}
                    fill={revealed ? stateColor : 'var(--border)'}
                  />
                  <text
                    x={x + 12}
                    y={y + 13}
                    dominantBaseline="middle"
                    className="text-[11px] font-bold"
                    fill={revealed ? stateText : 'var(--muted-foreground)'}
                  >
                    {cell.state}
                  </text>
                  <text
                    x={x + CELL_W - 12}
                    y={y + 13}
                    textAnchor="end"
                    dominantBaseline="middle"
                    className="text-[10px] font-mono"
                    fill={revealed ? stateText : 'var(--muted-foreground)'}
                  >
                    α{cell.t + 1}({cell.state === 'HOT' ? 'H' : 'C'})
                  </text>
                  <text
                    x={x + CELL_W / 2}
                    y={y + 53}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-lg font-bold font-mono fill-foreground"
                  >
                    {revealed ? formatNum(cell.alpha) : '?'}
                  </text>
                </motion.g>
              );
            }),
          )}
        </svg>
      </div>

      {/* Explanation panel — what's happening at this step */}
      <StepExplanation step={step} />

      {/* Termination box */}
      {isTermStep && (
        <div className="rounded-md border-2 border-primary bg-primary/5 p-4 space-y-2">
          <div className="flex items-center gap-2 font-semibold text-primary">
            <Zap className="size-4" />
            Termination
          </div>
          <BlockMath>
            {`P(O \\mid \\lambda) = \\sum_i \\alpha_T(i) = \\alpha_3(H) + \\alpha_3(C) = ${formatNum(
              TRELLIS[0][T - 1].alpha,
            )} + ${formatNum(TRELLIS[1][T - 1].alpha)} = \\mathbf{${formatNum(FINAL_PROB)}}`}
          </BlockMath>
          <div className="text-sm text-muted-foreground">
            This is the total probability of observing the sequence <M>3\ 1\ 3</M> — summed over <strong>all</strong>{' '}
            possible hidden state sequences. No brute-force enumeration needed.
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2 items-center text-xs text-muted-foreground">
        <Badge variant="outline" className="font-mono">
          π = {`[HOT ${INITIAL.HOT}, COLD ${INITIAL.COLD}]`}
        </Badge>
        <Badge variant="outline" className="font-mono">
          A[H→H]=0.7 · A[H→C]=0.3
        </Badge>
        <Badge variant="outline" className="font-mono">
          A[C→H]=0.4 · A[C→C]=0.6
        </Badge>
      </div>
    </div>
  );
}

// ── Step-by-step explanation ──────────────────────────────────────────

function StepExplanation({ step }: { step: number }) {
  if (step === 0) {
    return (
      <div className="rounded-md bg-muted/40 border border-border p-3 text-sm space-y-2">
        <div className="font-semibold">Setup</div>
        <p className="text-muted-foreground">
          We want <M>{'P(O \\mid \\lambda)'}</M> for the observation sequence <strong>3 1 3</strong> under the
          ice-cream HMM. The trellis has one row per hidden state and one column per time step. Each cell
          <M>{'\\alpha_t(j)'}</M> will store the total probability of being in state <M>j</M> at time <M>t</M>, summed
          over all paths that lead there.
        </p>
        <p className="text-muted-foreground">Step through to see the forward algorithm fill the table.</p>
      </div>
    );
  }

  if (step === 1) {
    const aH = TRELLIS[0][0].alpha;
    const aC = TRELLIS[1][0].alpha;
    return (
      <div className="rounded-md bg-muted/40 border border-border p-3 text-sm space-y-2">
        <div className="font-semibold">Initialization — fill column t = 1</div>
        <BlockMath>{'\\alpha_1(j) = \\pi_j \\cdot b_j(o_1)'}</BlockMath>
        <div className="font-mono text-xs space-y-1">
          <div>
            α₁(H) = π_H · b_H(3) = 0.8 · 0.4 = <strong>{formatNum(aH)}</strong>
          </div>
          <div>
            α₁(C) = π_C · b_C(3) = 0.2 · 0.1 = <strong>{formatNum(aC)}</strong>
          </div>
        </div>
        <div className="text-muted-foreground">
          We multiply the probability of starting in each state by the probability that the state emits the first
          observation.
        </div>
      </div>
    );
  }

  if (step === TOTAL_STEPS - 1) {
    // Termination — explanation already rendered below
    return (
      <div className="rounded-md bg-muted/40 border border-border p-3 text-sm">
        <div className="font-semibold mb-1">Termination</div>
        <div className="text-muted-foreground">
          Sum the values in the final column — that's the total probability of observing <strong>3 1 3</strong>.
        </div>
      </div>
    );
  }

  // Recursion step for t = step - 1 (0-indexed)
  const t = step - 1;
  const cellH = TRELLIS[0][t];
  const cellC = TRELLIS[1][t];
  const obs = OBS[t];

  return (
    <div className="rounded-md bg-muted/40 border border-border p-3 text-sm space-y-2">
      <div className="font-semibold">Recursion — fill column t = {t + 1}</div>
      <BlockMath>{'\\alpha_t(j) = \\left[\\sum_{i=1}^{N} \\alpha_{t-1}(i)\\, a_{ij}\\right] b_j(o_t)'}</BlockMath>
      <div className="space-y-2 font-mono text-xs">
        <div>
          <div className="font-semibold text-foreground">α_{t + 1}(H):</div>
          <div className="pl-3">
            = α_{t}(H)·a(H→H)·b_H({obs}) + α_{t}(C)·a(C→H)·b_H({obs})
          </div>
          <div className="pl-3">
            = {formatNum(cellH.contributions[0].prevAlpha)} · {cellH.contributions[0].transition} ·{' '}
            {cellH.contributions[0].emission} + {formatNum(cellH.contributions[1].prevAlpha)} ·{' '}
            {cellH.contributions[1].transition} · {cellH.contributions[1].emission}
          </div>
          <div className="pl-3">
            = {formatNum(cellH.contributions[0].product)} + {formatNum(cellH.contributions[1].product)} ={' '}
            <strong className="text-foreground">{formatNum(cellH.alpha)}</strong>
          </div>
        </div>
        <div>
          <div className="font-semibold text-foreground">α_{t + 1}(C):</div>
          <div className="pl-3">
            = α_{t}(H)·a(H→C)·b_C({obs}) + α_{t}(C)·a(C→C)·b_C({obs})
          </div>
          <div className="pl-3">
            = {formatNum(cellC.contributions[0].prevAlpha)} · {cellC.contributions[0].transition} ·{' '}
            {cellC.contributions[0].emission} + {formatNum(cellC.contributions[1].prevAlpha)} ·{' '}
            {cellC.contributions[1].transition} · {cellC.contributions[1].emission}
          </div>
          <div className="pl-3">
            = {formatNum(cellC.contributions[0].product)} + {formatNum(cellC.contributions[1].product)} ={' '}
            <strong className="text-foreground">{formatNum(cellC.alpha)}</strong>
          </div>
        </div>
      </div>
      <div className="text-muted-foreground">
        Each new cell <em>sums</em> over all possible previous states — that's why the forward algorithm gives the
        total probability across all paths.
      </div>
    </div>
  );
}
