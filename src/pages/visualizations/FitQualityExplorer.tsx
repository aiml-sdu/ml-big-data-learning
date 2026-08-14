import { useMemo, useState } from 'react';
import {
  evaluatePolynomial,
  fitPolynomial,
  polynomialMSE,
} from '@/lib/regression-math';
import {
  FIT_QUALITY_N,
  FIT_QUALITY_TEST_SEED,
  FIT_QUALITY_TRAIN_SEED,
  fitQualityTrueFn,
  makeFitQualityData,
} from '@/lib/fit-quality-data';

const MIN_DEGREE = 1;
const MAX_DEGREE = 15;

const FIT_VB_W = 520;
const FIT_VB_H = 340;
const FIT_PAD = { top: 16, right: 16, bottom: 40, left: 40 };
const FIT_PLOT_W = FIT_VB_W - FIT_PAD.left - FIT_PAD.right;
const FIT_PLOT_H = FIT_VB_H - FIT_PAD.top - FIT_PAD.bottom;

const ERR_VB_W = 520;
const ERR_VB_H = 340;
const ERR_PAD = { top: 16, right: 16, bottom: 40, left: 48 };
const ERR_PLOT_W = ERR_VB_W - ERR_PAD.left - ERR_PAD.right;
const ERR_PLOT_H = ERR_VB_H - ERR_PAD.top - ERR_PAD.bottom;

const X_MIN = 0;
const X_MAX = 1;
const Y_MIN = -2.2;
const Y_MAX = 2.2;

export default function FitQualityExplorer() {
  const [degree, setDegree] = useState(1);

  const train = useMemo(() => makeFitQualityData(FIT_QUALITY_N, FIT_QUALITY_TRAIN_SEED), []);
  const test = useMemo(() => makeFitQualityData(FIT_QUALITY_N, FIT_QUALITY_TEST_SEED), []);

  const coeffs = useMemo(() => fitPolynomial(train, degree), [train, degree]);

  const curvePath = useMemo(() => {
    const steps = 240;
    let d = '';
    for (let i = 0; i <= steps; i += 1) {
      const x = X_MIN + ((X_MAX - X_MIN) * i) / steps;
      const yRaw = evaluatePolynomial(x, coeffs);
      const y = Math.max(Y_MIN - 1, Math.min(Y_MAX + 1, yRaw));
      const px = FIT_PAD.left + ((x - X_MIN) / (X_MAX - X_MIN)) * FIT_PLOT_W;
      const py = FIT_PAD.top + FIT_PLOT_H - ((y - Y_MIN) / (Y_MAX - Y_MIN)) * FIT_PLOT_H;
      d += `${i === 0 ? 'M' : 'L'} ${px.toFixed(2)} ${py.toFixed(2)} `;
    }
    return d.trim();
  }, [coeffs]);

  const truePath = useMemo(() => {
    const steps = 120;
    let d = '';
    for (let i = 0; i <= steps; i += 1) {
      const x = X_MIN + ((X_MAX - X_MIN) * i) / steps;
      const y = fitQualityTrueFn(x);
      const px = FIT_PAD.left + ((x - X_MIN) / (X_MAX - X_MIN)) * FIT_PLOT_W;
      const py = FIT_PAD.top + FIT_PLOT_H - ((y - Y_MIN) / (Y_MAX - Y_MIN)) * FIT_PLOT_H;
      d += `${i === 0 ? 'M' : 'L'} ${px.toFixed(2)} ${py.toFixed(2)} `;
    }
    return d.trim();
  }, []);

  const trainMSE = useMemo(() => polynomialMSE(train, coeffs), [train, coeffs]);
  const testMSE = useMemo(() => polynomialMSE(test, coeffs), [test, coeffs]);

  const mseSeries = useMemo(() => {
    const rows: { degree: number; train: number; test: number }[] = [];
    for (let d = MIN_DEGREE; d <= MAX_DEGREE; d += 1) {
      const c = fitPolynomial(train, d);
      rows.push({ degree: d, train: polynomialMSE(train, c), test: polynomialMSE(test, c) });
    }
    return rows;
  }, [train, test]);

  const errCeiling = useMemo(() => {
    const values = mseSeries
      .flatMap((r) => [r.train, r.test])
      .filter((v) => Number.isFinite(v) && v >= 0);
    const maxV = values.length ? Math.max(...values) : 1;
    // Tight headroom so the U-shape fills the chart; clamp so a runaway
    // high-degree polynomial doesn't squash the meaningful range.
    return Math.min(maxV * 1.12, 3);
  }, [mseSeries]);

  const errSx = (d: number) =>
    ERR_PAD.left + ((d - MIN_DEGREE) / (MAX_DEGREE - MIN_DEGREE)) * ERR_PLOT_W;
  const errSy = (v: number) => {
    const clipped = Math.min(v, errCeiling);
    return ERR_PAD.top + ERR_PLOT_H - (clipped / errCeiling) * ERR_PLOT_H;
  };

  const trainMsePath = useMemo(() => {
    let d = '';
    for (let i = 0; i < mseSeries.length; i += 1) {
      const row = mseSeries[i];
      d += `${i === 0 ? 'M' : 'L'} ${errSx(row.degree).toFixed(2)} ${errSy(row.train).toFixed(2)} `;
    }
    return d.trim();
  }, [mseSeries, errCeiling]);

  const testMsePath = useMemo(() => {
    let d = '';
    for (let i = 0; i < mseSeries.length; i += 1) {
      const row = mseSeries[i];
      d += `${i === 0 ? 'M' : 'L'} ${errSx(row.degree).toFixed(2)} ${errSy(row.test).toFixed(2)} `;
    }
    return d.trim();
  }, [mseSeries, errCeiling]);

  const bestDegree = useMemo(
    () => mseSeries.reduce((best, row) => (row.test < best.test ? row : best), mseSeries[0]).degree,
    [mseSeries],
  );

  const regime =
    degree <= 2
      ? 'underfit'
      : testMSE > trainMSE * 2 || testMSE > errCeiling * 0.6
        ? 'overfit'
        : 'good';

  const regimeCopy = {
    underfit: {
      title: 'Underfit',
      body: 'The curve is too rigid to follow the shape of the data, so it makes large errors even on the training points.',
      tone: 'warn' as const,
    },
    good: {
      title: 'Good fit',
      body: 'Train and test errors are close. The model captures the trend without chasing individual points.',
      tone: 'good' as const,
    },
    overfit: {
      title: 'Overfit',
      body: 'Training error keeps dropping, but the curve wiggles between points. Test error shoots up — the model memorized noise.',
      tone: 'bad' as const,
    },
  }[regime];

  const sx = (x: number) => FIT_PAD.left + ((x - X_MIN) / (X_MAX - X_MIN)) * FIT_PLOT_W;
  const sy = (y: number) => FIT_PAD.top + FIT_PLOT_H - ((y - Y_MIN) / (Y_MAX - Y_MIN)) * FIT_PLOT_H;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4 rounded-lg border bg-card p-3">
        <label className="flex-1 min-w-[220px]">
          <div className="mb-1 flex items-baseline justify-between gap-2">
            <span className="text-sm font-medium">Polynomial degree</span>
            <span className="font-mono text-sm text-muted-foreground">
              d = {degree}
            </span>
          </div>
          <input
            type="range"
            min={MIN_DEGREE}
            max={MAX_DEGREE}
            step={1}
            value={degree}
            onChange={(e) => setDegree(Number(e.target.value))}
            className="w-full accent-[var(--color-key-idea)]"
          />
          <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
            <span>1 (line)</span>
            <span>best ≈ {bestDegree}</span>
            <span>{MAX_DEGREE}</span>
          </div>
        </label>
        <div className="grid grid-cols-3 gap-3 text-sm">
          <Readout label="Train MSE" value={trainMSE} tone="train" />
          <Readout label="Test MSE" value={testMSE} tone="test" />
          <Readout
            label="Gap"
            value={testMSE - trainMSE}
            tone={testMSE - trainMSE > trainMSE * 0.6 ? 'bad' : 'neutral'}
          />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <div className="mb-1 text-xs font-medium text-muted-foreground">
            Fit on training data
          </div>
          <div className="rounded-lg border bg-card p-2">
            <svg viewBox={`0 0 ${FIT_VB_W} ${FIT_VB_H}`} className="w-full">
              <defs>
                <clipPath id="fit-plot-clip">
                  <rect x={FIT_PAD.left} y={FIT_PAD.top} width={FIT_PLOT_W} height={FIT_PLOT_H} />
                </clipPath>
              </defs>
              <line x1={FIT_PAD.left} y1={FIT_PAD.top} x2={FIT_PAD.left} y2={FIT_PAD.top + FIT_PLOT_H} stroke="var(--border)" />
              <line x1={FIT_PAD.left} y1={FIT_PAD.top + FIT_PLOT_H} x2={FIT_PAD.left + FIT_PLOT_W} y2={FIT_PAD.top + FIT_PLOT_H} stroke="var(--border)" />

              {[-2, -1, 0, 1, 2].map((yt) => (
                <g key={`yt-${yt}`}>
                  <line x1={FIT_PAD.left} y1={sy(yt)} x2={FIT_PAD.left + FIT_PLOT_W} y2={sy(yt)} stroke="var(--border)" strokeWidth={0.5} strokeDasharray="3 4" opacity={0.5} />
                  <text x={FIT_PAD.left - 6} y={sy(yt) + 3} textAnchor="end" fill="var(--muted-foreground)" fontSize={10}>{yt}</text>
                </g>
              ))}
              {[0, 0.25, 0.5, 0.75, 1].map((xt) => (
                <g key={`xt-${xt}`}>
                  <line x1={sx(xt)} y1={FIT_PAD.top} x2={sx(xt)} y2={FIT_PAD.top + FIT_PLOT_H} stroke="var(--border)" strokeWidth={0.5} strokeDasharray="3 4" opacity={0.5} />
                  <text x={sx(xt)} y={FIT_PAD.top + FIT_PLOT_H + 14} textAnchor="middle" fill="var(--muted-foreground)" fontSize={10}>{xt}</text>
                </g>
              ))}

              <g clipPath="url(#fit-plot-clip)">
                <path d={truePath} fill="none" stroke="var(--muted-foreground)" strokeWidth={1.2} strokeDasharray="4 3" opacity={0.55} />
                <path d={curvePath} fill="none" stroke="var(--color-key-idea)" strokeWidth={2.25} strokeLinejoin="round" strokeLinecap="round" />
              </g>

              {test.map((p, i) => (
                <circle key={`tst-${i}`} cx={sx(p.x)} cy={sy(Math.max(Y_MIN, Math.min(Y_MAX, p.y)))} r={3} fill="none" stroke="var(--color-warning)" strokeWidth={1.5} opacity={0.85} />
              ))}
              {train.map((p, i) => (
                <circle key={`trn-${i}`} cx={sx(p.x)} cy={sy(Math.max(Y_MIN, Math.min(Y_MAX, p.y)))} r={3.2} fill="var(--primary)" opacity={0.9} />
              ))}

              <g transform={`translate(${FIT_PAD.left + 8}, ${FIT_PAD.top + 8})`}>
                <rect x={-4} y={-10} width={170} height={62} rx={6} fill="var(--card)" opacity={0.82} stroke="var(--border)" />
                <circle cx={6} cy={0} r={3.2} fill="var(--primary)" />
                <text x={16} y={3} fontSize={10} fill="var(--foreground)">Train ({FIT_QUALITY_N})</text>
                <circle cx={6} cy={16} r={3} fill="none" stroke="var(--color-warning)" strokeWidth={1.5} />
                <text x={16} y={19} fontSize={10} fill="var(--foreground)">Test ({FIT_QUALITY_N})</text>
                <line x1={0} y1={32} x2={14} y2={32} stroke="var(--color-key-idea)" strokeWidth={2.25} />
                <text x={18} y={35} fontSize={10} fill="var(--foreground)">Fitted polynomial</text>
                <line x1={0} y1={46} x2={14} y2={46} stroke="var(--muted-foreground)" strokeWidth={1.2} strokeDasharray="3 3" />
                <text x={18} y={49} fontSize={10} fill="var(--muted-foreground)">True function</text>
              </g>
            </svg>
          </div>
        </div>

        <div>
          <div className="mb-1 text-xs font-medium text-muted-foreground">
            MSE vs polynomial degree
          </div>
          <div className="rounded-lg border bg-card p-2">
            <svg viewBox={`0 0 ${ERR_VB_W} ${ERR_VB_H}`} className="w-full">
              <line x1={ERR_PAD.left} y1={ERR_PAD.top} x2={ERR_PAD.left} y2={ERR_PAD.top + ERR_PLOT_H} stroke="var(--border)" />
              <line x1={ERR_PAD.left} y1={ERR_PAD.top + ERR_PLOT_H} x2={ERR_PAD.left + ERR_PLOT_W} y2={ERR_PAD.top + ERR_PLOT_H} stroke="var(--border)" />

              {[0.25, 0.5, 0.75, 1].map((frac) => {
                const v = errCeiling * frac;
                return (
                  <g key={`ey-${frac}`}>
                    <line x1={ERR_PAD.left} y1={errSy(v)} x2={ERR_PAD.left + ERR_PLOT_W} y2={errSy(v)} stroke="var(--border)" strokeWidth={0.5} strokeDasharray="3 4" opacity={0.5} />
                    <text x={ERR_PAD.left - 6} y={errSy(v) + 3} textAnchor="end" fill="var(--muted-foreground)" fontSize={10}>{v.toFixed(2)}</text>
                  </g>
                );
              })}
              {[1, 3, 5, 7, 9, 11, 13, 15].map((d) => (
                <g key={`ex-${d}`}>
                  <text x={errSx(d)} y={ERR_PAD.top + ERR_PLOT_H + 14} textAnchor="middle" fill="var(--muted-foreground)" fontSize={10}>{d}</text>
                </g>
              ))}
              <text x={ERR_PAD.left + ERR_PLOT_W / 2} y={ERR_VB_H - 6} textAnchor="middle" fill="var(--muted-foreground)" fontSize={11}>degree</text>

              <line
                x1={errSx(degree)}
                y1={ERR_PAD.top}
                x2={errSx(degree)}
                y2={ERR_PAD.top + ERR_PLOT_H}
                stroke="var(--color-key-idea)"
                strokeWidth={1}
                strokeDasharray="4 4"
                opacity={0.6}
              />

              <path d={trainMsePath} fill="none" stroke="var(--color-info)" strokeWidth={2.25} />
              <path d={testMsePath} fill="none" stroke="var(--color-error)" strokeWidth={2.25} />

              {mseSeries.map((row) => (
                <g key={`pt-${row.degree}`}>
                  <circle cx={errSx(row.degree)} cy={errSy(row.train)} r={row.degree === degree ? 4 : 2.5} fill="var(--color-info)" />
                  <circle cx={errSx(row.degree)} cy={errSy(row.test)} r={row.degree === degree ? 4 : 2.5} fill="var(--color-error)" />
                </g>
              ))}

              <g transform={`translate(${ERR_PAD.left + ERR_PLOT_W - 120}, ${ERR_PAD.top + 8})`}>
                <rect x={-4} y={-10} width={120} height={44} rx={6} fill="var(--card)" opacity={0.82} stroke="var(--border)" />
                <line x1={0} y1={0} x2={14} y2={0} stroke="var(--color-info)" strokeWidth={2.25} />
                <text x={18} y={3} fontSize={10} fill="var(--foreground)">Train MSE</text>
                <line x1={0} y1={16} x2={14} y2={16} stroke="var(--color-error)" strokeWidth={2.25} />
                <text x={18} y={19} fontSize={10} fill="var(--foreground)">Test MSE</text>
              </g>
            </svg>
          </div>
        </div>
      </div>

      <div
        className={
          'rounded-lg border-l-4 bg-muted/40 px-4 py-3 text-sm ' +
          (regimeCopy.tone === 'good'
            ? 'border-[color:var(--color-success)]'
            : regimeCopy.tone === 'bad'
              ? 'border-[color:var(--color-error)]'
              : 'border-[color:var(--color-warning)]')
        }
      >
        <div className="font-semibold">{regimeCopy.title}</div>
        <div className="mt-1 text-muted-foreground">{regimeCopy.body}</div>
      </div>
    </div>
  );
}

function Readout({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: 'train' | 'test' | 'bad' | 'neutral';
}) {
  const dot =
    tone === 'train'
      ? 'bg-[color:var(--color-info)]'
      : tone === 'test'
        ? 'bg-[color:var(--color-error)]'
        : tone === 'bad'
          ? 'bg-[color:var(--color-warning)]'
          : 'bg-muted-foreground';
  return (
    <div className="rounded-md border bg-background px-2 py-1.5">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-muted-foreground">
        <span className={`inline-block h-1.5 w-1.5 rounded-full ${dot}`} />
        {label}
      </div>
      <div className="font-mono tabular-nums">{value.toFixed(3)}</div>
    </div>
  );
}
