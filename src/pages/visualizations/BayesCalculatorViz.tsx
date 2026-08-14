import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { M, BlockMath } from '@/components/Math';

interface Preset {
  label: string;
  prior: number;
  sensitivity: number;
  fpr: number;
}

const PRESETS: Preset[] = [
  { label: 'Lab Ex.1 Test A', prior: 0.01, sensitivity: 0.95, fpr: 0.10 },
  { label: 'Lab Ex.1 Test B', prior: 0.01, sensitivity: 0.90, fpr: 0.05 },
  { label: 'Lab Ex.2 Rare Disease', prior: 0.0001, sensitivity: 0.99, fpr: 0.01 },
];

function fmt(n: number, digits = 4): string {
  if (n >= 0.01) return n.toFixed(digits);
  return n.toExponential(2);
}

function pct(n: number): string {
  return (n * 100).toFixed(2) + '%';
}

function posteriorColor(p: number): string {
  if (p >= 0.5) return 'text-red-600 dark:text-red-400';
  if (p >= 0.1) return 'text-amber-600 dark:text-amber-400';
  return 'text-emerald-600 dark:text-emerald-400';
}

export default function BayesCalculatorViz() {
  const [prior, setPrior] = useState(0.01);
  const [sensitivity, setSensitivity] = useState(0.95);
  const [fpr, setFpr] = useState(0.10);

  const { posterior, pPositive, tp, fp } = useMemo(() => {
    const pPos = sensitivity * prior + fpr * (1 - prior);
    const post = (sensitivity * prior) / pPos;
    const tpCount = sensitivity * prior;
    const fpCount = fpr * (1 - prior);
    return { posterior: post, pPositive: pPos, tp: tpCount, fp: fpCount };
  }, [prior, sensitivity, fpr]);

  const iconArray = useMemo(() => {
    const total = 100;
    const tpIcons = Math.round((tp / (tp + fp)) * total);
    const fpIcons = total - tpIcons;
    return { tpIcons, fpIcons, total };
  }, [tp, fp]);

  const applyPreset = (p: Preset) => {
    setPrior(p.prior);
    setSensitivity(p.sensitivity);
    setFpr(p.fpr);
  };

  return (
    <div className="rounded-lg border border-border bg-card p-4 my-6 space-y-5">
      {/* Presets */}
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <Button
            key={p.label}
            variant="outline"
            size="sm"
            onClick={() => applyPreset(p)}
          >
            {p.label}
          </Button>
        ))}
      </div>

      {/* Sliders */}
      <div className="space-y-4">
        <SliderRow
          label="Prior P(Disease)"
          value={prior}
          min={0.0001}
          max={0.5}
          step={0.0001}
          onChange={setPrior}
          display={fmt(prior)}
        />
        <SliderRow
          label="Sensitivity P(+|Disease)"
          value={sensitivity}
          min={0.5}
          max={1.0}
          step={0.001}
          onChange={setSensitivity}
          display={fmt(sensitivity)}
        />
        <SliderRow
          label="False Positive Rate P(+|¬Disease)"
          value={fpr}
          min={0.001}
          max={0.5}
          step={0.001}
          onChange={setFpr}
          display={fmt(fpr)}
        />
      </div>

      {/* Posterior result */}
      <div className="text-center py-3 rounded-md bg-muted/50 border border-border">
        <div className="text-sm text-muted-foreground mb-1">
          <M>{'P(\\text{Disease} \\mid +)'}</M>
        </div>
        <div className={`text-4xl font-bold tabular-nums ${posteriorColor(posterior)}`}>
          {pct(posterior)}
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          <M>{`P(+) = ${fmt(pPositive)}`}</M>
        </div>
      </div>

      {/* Formula with substituted values */}
      <div className="overflow-x-auto">
        <BlockMath>
          {`P(D \\mid +) = \\frac{P(+ \\mid D) \\cdot P(D)}{P(+ \\mid D) \\cdot P(D) + P(+ \\mid \\neg D) \\cdot P(\\neg D)} = \\frac{${fmt(sensitivity)} \\times ${fmt(prior)}}{${fmt(sensitivity)} \\times ${fmt(prior)} + ${fmt(fpr)} \\times ${fmt(1 - prior)}} = ${fmt(posterior)}`}
        </BlockMath>
      </div>

      {/* Icon array */}
      <div>
        <p className="text-sm text-muted-foreground mb-2 text-center">
          Among {iconArray.total} people who test positive:
        </p>
        <div className="flex flex-wrap gap-1 justify-center">
          {Array.from({ length: iconArray.total }, (_, i) => {
            const isTP = i < iconArray.tpIcons;
            return (
              <div
                key={i}
                className={`w-3 h-3 rounded-sm transition-colors ${
                  isTP
                    ? 'bg-red-500 dark:bg-red-400'
                    : 'bg-sky-400 dark:bg-sky-500'
                }`}
              />
            );
          })}
        </div>
        <div className="flex justify-center gap-4 mt-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-sm bg-red-500 dark:bg-red-400" />
            True positive ({iconArray.tpIcons})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-sm bg-sky-400 dark:bg-sky-500" />
            False positive ({iconArray.fpIcons})
          </span>
        </div>
      </div>
    </div>
  );
}

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  onChange,
  display,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  display: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <label className="text-sm text-muted-foreground w-56 shrink-0">{label}</label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 accent-primary h-2"
      />
      <Badge variant="secondary" className="font-mono min-w-[5rem] justify-center">
        {display}
      </Badge>
    </div>
  );
}
