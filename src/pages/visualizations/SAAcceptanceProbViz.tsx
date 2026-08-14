import { useState, useMemo } from 'react';
import { M } from '@/components/Math';

const REF_ROWS = [-5, -10, -20];
const REF_TEMPS = [100, 10, 1, 0.01];

function calcProb(de: number, t: number): number {
  return Math.exp(de / t);
}

function fmt(p: number): string {
  if (p < 0.0001) return '≈0';
  return p.toFixed(3);
}

export default function SAAcceptanceProbViz() {
  const [deltaE, setDeltaE] = useState(-5);
  const [temp, setTemp] = useState(10);

  const prob = useMemo(() => calcProb(deltaE, temp), [deltaE, temp]);
  const pct = (prob * 100).toFixed(1);
  const hue = Math.round(prob * 120);

  return (
    <div className="rounded-lg border bg-[var(--viz-bg)] p-4 my-4 space-y-4">
      <div>
        <div className="text-sm font-semibold text-foreground mb-1">SA Acceptance Probability</div>
        <div className="text-sm text-muted-foreground">
          <M>{'P = e^{\\Delta E / T}'}</M> — probability of accepting a worse move
        </div>
      </div>

      {/* Sliders */}
      <div className="space-y-3">
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span><M>{'\\Delta E'}</M> (energy difference)</span>
            <span className="font-mono font-semibold text-foreground">{deltaE.toFixed(1)}</span>
          </div>
          <input type="range" min="-20" max="0" step="0.5" value={deltaE}
            onChange={(e) => setDeltaE(Number(e.target.value))} className="w-full accent-[var(--primary)]" />
          <div className="flex justify-between text-[10px] text-muted-foreground/60">
            <span>−20 (much worse)</span><span>0 (same)</span>
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span><M>{'T'}</M> (temperature)</span>
            <span className="font-mono font-semibold text-foreground">{temp.toFixed(1)}</span>
          </div>
          <input type="range" min="0.1" max="100" step="0.1" value={temp}
            onChange={(e) => setTemp(Number(e.target.value))} className="w-full accent-[var(--primary)]" />
          <div className="flex justify-between text-[10px] text-muted-foreground/60">
            <span>0.1 (cold)</span><span>100 (hot)</span>
          </div>
        </div>
      </div>

      {/* Probability readout */}
      <div className="space-y-2">
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-bold font-mono tabular-nums"
            style={{ color: `hsl(${hue} 65% 42%)` }}>
            {prob.toFixed(3)}
          </span>
          <span className="text-lg font-semibold text-muted-foreground">{pct}%</span>
        </div>
        <div className="relative h-6 w-full rounded-full overflow-hidden bg-muted">
          <div className="absolute inset-0 opacity-15 rounded-full"
            style={{ background: 'linear-gradient(to right, rgb(239,68,68), rgb(234,179,8), rgb(34,197,94))' }} />
          <div className="absolute left-0 top-0 h-full rounded-full transition-all duration-150"
            style={{ width: `${Math.max(prob * 100, 0.5)}%`,
              background: `linear-gradient(to right, rgb(239,68,68), hsl(${hue} 65% 48%))` }} />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-xs font-bold text-white drop-shadow-sm">{pct}%</span>
          </div>
        </div>
      </div>

      {/* Reference table */}
      <div>
        <div className="text-[10px] font-semibold text-muted-foreground/70 mb-2 uppercase tracking-wider">
          Reference values
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-1.5 pr-4 font-semibold text-muted-foreground"><M>{'\\Delta E'}</M></th>
                {REF_TEMPS.map((t) => (
                  <th key={t} className="text-right py-1.5 px-2 font-semibold text-muted-foreground">
                    <M>{`T=${t}`}</M>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {REF_ROWS.map((de) => (
                <tr key={de} className="border-b border-border/40">
                  <td className="py-1.5 pr-4 font-mono font-semibold text-muted-foreground">{de}</td>
                  {REF_TEMPS.map((t) => (
                    <td key={t} className="text-right py-1.5 px-2 font-mono tabular-nums text-muted-foreground">
                      {fmt(calcProb(de, t))}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
