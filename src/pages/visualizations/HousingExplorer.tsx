import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  HOUSING_FEATURES,
  HOUSING_ROWS,
  HOUSING_TARGET,
  type HousingRow,
} from '@/data/california-housing';
import { cn } from '@/lib/utils';

const FEATURE_UNITS: Record<string, string> = {
  MedInc: 'median income ($10k)',
  HouseAge: 'years',
  AveRooms: 'rooms / household',
  AveBedrms: 'bedrooms / household',
  Population: 'people in block',
  AveOccup: 'people / household',
  Latitude: 'degrees N',
  Longitude: 'degrees W (negative)',
};

const TARGET_UNIT = 'median house value ($100k)';
const TARGET_IDX = HOUSING_FEATURES.length;

function mulberry32(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function sampleIndices(count: number, n: number, seed: number): number[] {
  const rand = mulberry32(seed);
  const picked = new Set<number>();
  const out: number[] = [];
  const cap = Math.min(count, n);
  while (out.length < cap) {
    const idx = Math.floor(rand() * n);
    if (!picked.has(idx)) {
      picked.add(idx);
      out.push(idx);
    }
  }
  return out;
}

function pearson(xs: number[], ys: number[]): number {
  const n = xs.length;
  let sx = 0;
  let sy = 0;
  for (let i = 0; i < n; i += 1) {
    sx += xs[i];
    sy += ys[i];
  }
  const mx = sx / n;
  const my = sy / n;
  let num = 0;
  let dx2 = 0;
  let dy2 = 0;
  for (let i = 0; i < n; i += 1) {
    const a = xs[i] - mx;
    const b = ys[i] - my;
    num += a * b;
    dx2 += a * a;
    dy2 += b * b;
  }
  const denom = Math.sqrt(dx2 * dy2);
  return denom === 0 ? 0 : num / denom;
}

function formatCell(value: number, col: number): string {
  if (col === HOUSING_FEATURES.indexOf('Population')) return value.toFixed(0);
  if (col === HOUSING_FEATURES.indexOf('Latitude')) return value.toFixed(2);
  if (col === HOUSING_FEATURES.indexOf('Longitude')) return value.toFixed(2);
  return value.toFixed(2);
}

const VB_W = 720;
const VB_H = 380;
const PAD = { top: 20, right: 24, bottom: 48, left: 60 };
const PLOT_W = VB_W - PAD.left - PAD.right;
const PLOT_H = VB_H - PAD.top - PAD.bottom;

export default function HousingExplorer() {
  const [sampleSeed, setSampleSeed] = useState(1);
  const [featureIdx, setFeatureIdx] = useState<number>(HOUSING_FEATURES.indexOf('MedInc'));

  const tableRows: HousingRow[] = useMemo(() => {
    const idxs = sampleIndices(12, HOUSING_ROWS.length, sampleSeed);
    return idxs.map((i) => HOUSING_ROWS[i]);
  }, [sampleSeed]);

  const allFeatureValues = useMemo(
    () => HOUSING_ROWS.map((r) => r[featureIdx]),
    [featureIdx],
  );
  const allTargetValues = useMemo(() => HOUSING_ROWS.map((r) => r[TARGET_IDX]), []);

  const correlation = useMemo(
    () => pearson(allFeatureValues, allTargetValues),
    [allFeatureValues, allTargetValues],
  );

  const scatterSample = useMemo(() => {
    const idxs = sampleIndices(1500, HOUSING_ROWS.length, 42);
    return idxs.map((i) => ({ x: HOUSING_ROWS[i][featureIdx], y: HOUSING_ROWS[i][TARGET_IDX] }));
  }, [featureIdx]);

  const bounds = useMemo(() => {
    let xMin = Infinity;
    let xMax = -Infinity;
    for (const v of allFeatureValues) {
      if (v < xMin) xMin = v;
      if (v > xMax) xMax = v;
    }
    if (HOUSING_FEATURES[featureIdx] === 'Population') {
      xMax = Math.min(xMax, 6000);
    }
    if (HOUSING_FEATURES[featureIdx] === 'AveOccup') {
      xMax = Math.min(xMax, 10);
    }
    if (HOUSING_FEATURES[featureIdx] === 'AveRooms') {
      xMax = Math.min(xMax, 15);
    }
    if (HOUSING_FEATURES[featureIdx] === 'AveBedrms') {
      xMax = Math.min(xMax, 3);
    }
    const yMin = 0;
    const yMax = 5.1;
    return { xMin, xMax, yMin, yMax };
  }, [allFeatureValues, featureIdx]);

  const sx = (x: number) =>
    PAD.left + ((x - bounds.xMin) / (bounds.xMax - bounds.xMin)) * PLOT_W;
  const sy = (y: number) =>
    PAD.top + PLOT_H - ((y - bounds.yMin) / (bounds.yMax - bounds.yMin)) * PLOT_H;

  const featureName = HOUSING_FEATURES[featureIdx];
  const featureUnit = FEATURE_UNITS[featureName] ?? '';

  const xTicks = useMemo(() => {
    const span = bounds.xMax - bounds.xMin;
    const step = niceStep(span, 5);
    const out: number[] = [];
    const start = Math.ceil(bounds.xMin / step) * step;
    for (let v = start; v <= bounds.xMax + 1e-9; v += step) out.push(Number(v.toFixed(4)));
    return out;
  }, [bounds.xMax, bounds.xMin]);

  const yTicks = [0, 1, 2, 3, 4, 5];

  const corrStrength = Math.abs(correlation);
  const corrLabel =
    corrStrength < 0.15
      ? 'barely any'
      : corrStrength < 0.35
        ? 'weak'
        : corrStrength < 0.55
          ? 'moderate'
          : corrStrength < 0.75
            ? 'strong'
            : 'very strong';
  const corrSign = correlation >= 0 ? 'positive' : 'negative';

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-2 flex items-center justify-between gap-3">
          <div className="text-sm text-muted-foreground">
            Random sample of 12 rows from the full {HOUSING_ROWS.length.toLocaleString()}-row dataset.
          </div>
          <Button size="sm" variant="outline" onClick={() => setSampleSeed((s) => s + 1)}>
            Shuffle sample
          </Button>
        </div>
        <div className="rounded-lg border overflow-x-auto">
          <div
            className="grid min-w-full gap-x-1 px-2 py-1 text-[11px] text-muted-foreground"
            style={{ gridTemplateColumns: `repeat(${HOUSING_FEATURES.length + 1}, minmax(0, 1fr))` }}
          >
            {HOUSING_FEATURES.map((name) => (
              <div key={name} className="px-1.5 py-1 font-semibold">
                {name}
              </div>
            ))}
            <div className="px-1.5 py-1 font-semibold text-primary">{HOUSING_TARGET}</div>
          </div>
          {tableRows.map((row, i) => (
            <div
              key={`${sampleSeed}-${i}`}
              className="grid min-w-full gap-x-1 border-t px-2 font-mono text-[11px] tabular-nums"
              style={{ gridTemplateColumns: `repeat(${HOUSING_FEATURES.length + 1}, minmax(0, 1fr))` }}
            >
              {row.slice(0, HOUSING_FEATURES.length).map((v, col) => (
                <div key={col} className="px-1.5 py-1.5">
                  {formatCell(v, col)}
                </div>
              ))}
              <div className="px-1.5 py-1.5 font-semibold text-primary">
                {row[TARGET_IDX].toFixed(2)}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-2 text-xs text-muted-foreground">
          Target <span className="font-mono">{HOUSING_TARGET}</span> is in units of $100,000.
          <span className="font-mono"> MedInc</span> is in units of $10,000.
        </div>
      </div>

      <div>
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <label className="text-sm font-medium">
            Plot feature vs {HOUSING_TARGET}:
            <select
              className="ml-2 rounded-md border bg-background px-2 py-1 text-sm"
              value={featureIdx}
              onChange={(e) => setFeatureIdx(Number(e.target.value))}
            >
              {HOUSING_FEATURES.map((name, idx) => (
                <option key={name} value={idx}>
                  {name}
                </option>
              ))}
            </select>
          </label>
          <div className="text-sm text-muted-foreground">
            Pearson{' '}
            <span className="font-mono">
              r = {correlation >= 0 ? '+' : ''}
              {correlation.toFixed(3)}
            </span>{' '}
            ({corrLabel} {corrSign})
          </div>
        </div>

        <div className="rounded-lg border bg-card p-2">
          <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="w-full">
            <line
              x1={PAD.left}
              y1={PAD.top}
              x2={PAD.left}
              y2={PAD.top + PLOT_H}
              stroke="var(--border)"
              strokeWidth={1}
            />
            <line
              x1={PAD.left}
              y1={PAD.top + PLOT_H}
              x2={PAD.left + PLOT_W}
              y2={PAD.top + PLOT_H}
              stroke="var(--border)"
              strokeWidth={1}
            />

            {xTicks.map((t) => (
              <g key={`x-${t}`}>
                <line
                  x1={sx(t)}
                  y1={PAD.top}
                  x2={sx(t)}
                  y2={PAD.top + PLOT_H}
                  stroke="var(--border)"
                  strokeWidth={0.5}
                  strokeDasharray="3 4"
                  opacity={0.6}
                />
                <text
                  x={sx(t)}
                  y={PAD.top + PLOT_H + 16}
                  textAnchor="middle"
                  fill="var(--muted-foreground)"
                  fontSize={10}
                >
                  {formatTick(t)}
                </text>
              </g>
            ))}

            {yTicks.map((t) => (
              <g key={`y-${t}`}>
                <line
                  x1={PAD.left}
                  y1={sy(t)}
                  x2={PAD.left + PLOT_W}
                  y2={sy(t)}
                  stroke="var(--border)"
                  strokeWidth={0.5}
                  strokeDasharray="3 4"
                  opacity={0.6}
                />
                <text
                  x={PAD.left - 8}
                  y={sy(t) + 4}
                  textAnchor="end"
                  fill="var(--muted-foreground)"
                  fontSize={10}
                >
                  {t.toFixed(0)}
                </text>
              </g>
            ))}

            {scatterSample.map((p, i) => {
              if (p.x < bounds.xMin || p.x > bounds.xMax) return null;
              return (
                <circle
                  key={i}
                  cx={sx(p.x)}
                  cy={sy(p.y)}
                  r={1.8}
                  fill="var(--primary)"
                  opacity={0.35}
                />
              );
            })}

            <text
              x={PAD.left + PLOT_W / 2}
              y={VB_H - 10}
              textAnchor="middle"
              fill="var(--muted-foreground)"
              fontSize={12}
            >
              {featureName}
              {featureUnit ? ` — ${featureUnit}` : ''}
            </text>
            <text
              x={16}
              y={PAD.top + PLOT_H / 2}
              textAnchor="middle"
              fill="var(--muted-foreground)"
              fontSize={12}
              transform={`rotate(-90, 16, ${PAD.top + PLOT_H / 2})`}
            >
              {HOUSING_TARGET} — {TARGET_UNIT}
            </text>
          </svg>
        </div>

        <div
          className={cn(
            'mt-3 rounded-lg border-l-4 bg-muted/40 px-4 py-2 text-sm',
            corrStrength >= 0.55
              ? 'border-[color:var(--color-success)]'
              : corrStrength >= 0.25
                ? 'border-[color:var(--color-info)]'
                : 'border-[color:var(--color-warning)]',
          )}
        >
          {featureName === 'MedInc' && (
            <>
              <span className="font-medium">MedInc</span> has the strongest single-feature signal in this
              dataset — higher-income block groups tend to have higher-valued homes. That is why the next
              card picks it as the one-feature baseline.
            </>
          )}
          {featureName !== 'MedInc' && corrStrength >= 0.25 && (
            <>
              <span className="font-medium">{featureName}</span> carries some signal, but notice the cloud
              is much wider than for <span className="font-mono">MedInc</span> — one feature alone leaves a
              lot unexplained.
            </>
          )}
          {featureName !== 'MedInc' && corrStrength < 0.25 && (
            <>
              <span className="font-medium">{featureName}</span> by itself barely predicts price. That does
              not mean it is useless — combined with other features it can still help.
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function niceStep(span: number, targetTicks: number): number {
  const raw = span / targetTicks;
  const pow10 = Math.pow(10, Math.floor(Math.log10(raw)));
  const norm = raw / pow10;
  let nice: number;
  if (norm < 1.5) nice = 1;
  else if (norm < 3) nice = 2;
  else if (norm < 7) nice = 5;
  else nice = 10;
  return nice * pow10;
}

function formatTick(v: number): string {
  if (Math.abs(v) >= 1000) return v.toFixed(0);
  if (Math.abs(v) >= 10) return v.toFixed(0);
  if (Math.abs(v) >= 1) return v.toFixed(1);
  return v.toFixed(2);
}
