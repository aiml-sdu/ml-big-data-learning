import { useState, useCallback, useRef, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Button } from '@/components/ui/button';
import { geneticAlgorithm, type GAState } from '@/lib/local-search';

function countOnes(chrom: number[]): number {
  return chrom.reduce((s, b) => s + b, 0);
}

const CHROM_LEN = 8;

export default function GAEvolutionGame() {
  const [mutRate, setMutRate] = useState(0.05);
  const [crossRate, setCrossRate] = useState(0.9);
  const [popSize, setPopSize] = useState(10);
  const [history, setHistory] = useState<GAState[]>([]);
  const [autoPlay, setAutoPlay] = useState(false);
  const [solved, setSolved] = useState(false);
  const genRef = useRef<Generator<GAState> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const seedRef = useRef(Math.floor(Math.random() * 10000));

  const initGA = useCallback(() => {
    seedRef.current = Math.floor(Math.random() * 10000);
    genRef.current = geneticAlgorithm(popSize, CHROM_LEN, countOnes, mutRate, crossRate, 500, CHROM_LEN, seedRef.current);
    const init = genRef.current.next();
    if (!init.done) {
      setHistory([init.value]);
      setSolved(false);
    }
  }, [popSize, mutRate, crossRate]);

  // Init on mount & param change
  useEffect(() => { initGA(); }, [initGA]);

  const step = useCallback(() => {
    if (!genRef.current || solved) return;
    const result = genRef.current.next();
    if (result.done) { setAutoPlay(false); return; }
    const state = result.value;
    setHistory(prev => [...prev, state]);
    if (state.type === 'solution') {
      setSolved(true);
      setAutoPlay(false);
      setTimeout(() => confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } }), 100);
    }
  }, [solved]);

  // Auto-play
  useEffect(() => {
    if (autoPlay && !solved) {
      intervalRef.current = setInterval(step, 300);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [autoPlay, step, solved]);

  const handleReset = useCallback(() => {
    setAutoPlay(false);
    setSolved(false);
    initGA();
  }, [initGA]);

  const current = history[history.length - 1];
  if (!current) return null;

  // Fitness chart data
  const bestLine = history.map((s, i) => ({ gen: i, val: s.bestFitness }));
  const avgLine = history.map((s, i) => ({ gen: i, val: s.avgFitness }));
  const chartW = 300;
  const chartH = 120;
  const maxGen = Math.max(history.length - 1, 1);

  const toChartX = (gen: number) => (gen / maxGen) * (chartW - 40) + 30;
  const toChartY = (val: number) => chartH - 10 - (val / CHROM_LEN) * (chartH - 30);

  return (
    <div className="rounded-lg border bg-[var(--viz-bg)] p-4 my-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Button size="sm" onClick={step} disabled={solved || autoPlay}>Next Generation</Button>
        <Button size="sm" variant={autoPlay ? 'destructive' : 'default'}
          onClick={() => setAutoPlay(p => !p)} disabled={solved}>
          {autoPlay ? 'Stop' : 'Auto-Evolve'}
        </Button>
        <Button size="sm" variant="outline" onClick={handleReset}>Reset</Button>
        <span className="text-xs font-mono text-muted-foreground ml-auto">
          Gen: {current.generation}
        </span>
      </div>

      {solved && (
        <div className="rounded-md bg-green-500/10 border border-green-500/30 px-3 py-2 mb-4 text-sm font-semibold text-green-600 dark:text-green-400">
          Solution Found! All 1s achieved in generation {current.generation}.
        </div>
      )}

      {/* Param sliders */}
      <div className="grid grid-cols-3 gap-3 mb-4 text-xs">
        <div>
          <label className="text-muted-foreground">Mutation: {mutRate.toFixed(2)}</label>
          <input type="range" min="0.01" max="0.3" step="0.01" value={mutRate}
            onChange={e => setMutRate(Number(e.target.value))} className="w-full accent-[var(--primary)]" />
        </div>
        <div>
          <label className="text-muted-foreground">Crossover: {crossRate.toFixed(2)}</label>
          <input type="range" min="0.5" max="1.0" step="0.05" value={crossRate}
            onChange={e => setCrossRate(Number(e.target.value))} className="w-full accent-[var(--primary)]" />
        </div>
        <div>
          <label className="text-muted-foreground">Pop size: {popSize}</label>
          <input type="range" min="6" max="12" step="2" value={popSize}
            onChange={e => setPopSize(Number(e.target.value))} className="w-full accent-[var(--primary)]" />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        {/* Population display */}
        <div className="flex-1 space-y-1.5">
          <div className="text-xs font-semibold text-muted-foreground mb-2">Population (sorted by fitness)</div>
          {current.population.slice(0, popSize).map((ind, i) => {
            const isBest = i === 0;
            return (
              <div key={i} className={`flex items-center gap-2 rounded-md px-2 py-1 ${isBest ? 'ring-1 ring-primary bg-primary/5' : ''}`}>
                <div className="flex gap-0.5">
                  {ind.chromosome.map((bit, j) => (
                    <div key={j} className={`w-6 h-6 rounded text-xs font-mono font-bold flex items-center justify-center ${
                      bit === 1 ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'
                    }`}>
                      {bit}
                    </div>
                  ))}
                </div>
                <span className="text-xs font-mono text-muted-foreground ml-auto">
                  fit={ind.fitness}
                </span>
              </div>
            );
          })}
        </div>

        {/* Fitness chart */}
        <div className="flex-shrink-0">
          <div className="text-xs font-semibold text-muted-foreground mb-2">Fitness over Generations</div>
          <svg width={chartW} height={chartH} className="overflow-visible">
            {/* Grid */}
            {[0, 2, 4, 6, 8].map(v => (
              <g key={v}>
                <line x1={30} x2={chartW} y1={toChartY(v)} y2={toChartY(v)}
                  stroke="var(--viz-border)" strokeWidth={0.5} opacity={0.4} />
                <text x={26} y={toChartY(v) + 3} textAnchor="end" fontSize={9}
                  fill="var(--viz-text)" opacity={0.5}>{v}</text>
              </g>
            ))}

            {/* Best line */}
            {bestLine.length > 1 && (
              <polyline fill="none" stroke="rgb(34,197,94)" strokeWidth={2}
                points={bestLine.map(p => `${toChartX(p.gen)},${toChartY(p.val)}`).join(' ')} />
            )}

            {/* Avg line */}
            {avgLine.length > 1 && (
              <polyline fill="none" stroke="rgb(59,130,246)" strokeWidth={1.5} strokeDasharray="4,3"
                points={avgLine.map(p => `${toChartX(p.gen)},${toChartY(p.val)}`).join(' ')} />
            )}

            {/* Legend */}
            <circle cx={35} cy={chartH - 2} r={3} fill="rgb(34,197,94)" />
            <text x={42} y={chartH + 1} fontSize={9} fill="var(--viz-text)" opacity={0.6}>Best</text>
            <circle cx={80} cy={chartH - 2} r={3} fill="rgb(59,130,246)" />
            <text x={87} y={chartH + 1} fontSize={9} fill="var(--viz-text)" opacity={0.6}>Avg</text>
          </svg>
        </div>
      </div>
    </div>
  );
}
