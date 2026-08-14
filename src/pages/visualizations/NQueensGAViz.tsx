import { useState, useCallback, useRef, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Button } from '@/components/ui/button';
import { nQueensGA, type GAState } from '@/lib/local-search';

const N = 8;
const MAX_FITNESS = (N * (N - 1)) / 2; // 28
const CELL = 40;
const BOARD = CELL * N;

function getAttackingPairs(queens: number[]): [number, number][] {
  const pairs: [number, number][] = [];
  for (let i = 0; i < N; i++) {
    for (let j = i + 1; j < N; j++) {
      if (queens[i] === queens[j] || Math.abs(queens[i] - queens[j]) === Math.abs(i - j)) {
        pairs.push([i, j]);
      }
    }
  }
  return pairs;
}

export default function NQueensGAViz() {
  const [popSize, setPopSize] = useState(100);
  const [mutRate, setMutRate] = useState(0.05);
  const [crossRate, setCrossRate] = useState(0.8);
  const [history, setHistory] = useState<GAState[]>([]);
  const [autoPlay, setAutoPlay] = useState(false);
  const [solved, setSolved] = useState(false);
  const genRef = useRef<Generator<GAState> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const seedRef = useRef(Math.floor(Math.random() * 10000));

  const initGA = useCallback(() => {
    seedRef.current = Math.floor(Math.random() * 10000);
    genRef.current = nQueensGA(N, popSize, mutRate, crossRate, 500, seedRef.current);
    const init = genRef.current.next();
    if (!init.done) {
      setHistory([init.value]);
      setSolved(false);
    }
  }, [popSize, mutRate, crossRate]);

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
      setTimeout(() => confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } }), 100);
    }
  }, [solved]);

  useEffect(() => {
    if (autoPlay && !solved) {
      intervalRef.current = setInterval(step, 100);
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

  const queens = current.bestIndividual;
  const attacks = getAttackingPairs(queens);
  const fitness = current.bestFitness;

  // Chart
  const chartW = 280;
  const chartH = 140;
  const maxGen = Math.max(history.length - 1, 1);
  const toChartX = (gen: number) => (gen / maxGen) * (chartW - 40) + 30;
  const toChartY = (val: number) => chartH - 12 - (val / MAX_FITNESS) * (chartH - 30);

  return (
    <div className="rounded-lg border bg-[var(--viz-bg)] p-4 my-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <Button size="sm" onClick={step} disabled={solved || autoPlay}>Next Gen</Button>
        <Button size="sm" variant={autoPlay ? 'destructive' : 'default'}
          onClick={() => setAutoPlay(p => !p)} disabled={solved}>
          {autoPlay ? 'Stop' : 'Auto-Run'}
        </Button>
        <Button size="sm" variant="outline" onClick={handleReset}>Reset</Button>
        <span className="text-xs font-mono text-muted-foreground ml-auto">
          Gen {current.generation} | Fitness: {fitness}/{MAX_FITNESS}
        </span>
      </div>

      {solved && (
        <div className="rounded-md bg-green-500/10 border border-green-500/30 px-3 py-2 mb-3 text-sm font-semibold text-green-600 dark:text-green-400">
          Solution found in generation {current.generation}! No attacking pairs.
        </div>
      )}

      {/* Param sliders */}
      <div className="grid grid-cols-3 gap-3 mb-4 text-xs">
        <div>
          <label className="text-muted-foreground">Pop: {popSize}</label>
          <input type="range" min="50" max="200" step="10" value={popSize}
            onChange={e => setPopSize(Number(e.target.value))} className="w-full accent-[var(--primary)]" />
        </div>
        <div>
          <label className="text-muted-foreground">Mut: {mutRate.toFixed(2)}</label>
          <input type="range" min="0.01" max="0.2" step="0.01" value={mutRate}
            onChange={e => setMutRate(Number(e.target.value))} className="w-full accent-[var(--primary)]" />
        </div>
        <div>
          <label className="text-muted-foreground">Cross: {crossRate.toFixed(2)}</label>
          <input type="range" min="0.5" max="1.0" step="0.05" value={crossRate}
            onChange={e => setCrossRate(Number(e.target.value))} className="w-full accent-[var(--primary)]" />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 items-start">
        {/* Chessboard */}
        <div className="flex-shrink-0">
          <svg width={BOARD} height={BOARD} viewBox={`0 0 ${BOARD} ${BOARD}`} className="border rounded">
            {/* Squares */}
            {Array.from({ length: N }, (_, row) =>
              Array.from({ length: N }, (_, col) => {
                const isDark = (row + col) % 2 === 1;
                return (
                  <rect key={`${row}-${col}`} x={col * CELL} y={row * CELL}
                    width={CELL} height={CELL}
                    fill={isDark ? 'rgb(148,124,100)' : 'rgb(234,218,194)'} />
                );
              })
            )}

            {/* Attack lines */}
            {attacks.map(([i, j], idx) => (
              <line key={idx}
                x1={queens[i] * CELL + CELL / 2} y1={i * CELL + CELL / 2}
                x2={queens[j] * CELL + CELL / 2} y2={j * CELL + CELL / 2}
                stroke="rgb(239,68,68)" strokeWidth={2} opacity={0.6} />
            ))}

            {/* Queens */}
            {queens.map((col, row) => (
              <text key={row} x={col * CELL + CELL / 2} y={row * CELL + CELL / 2 + 2}
                textAnchor="middle" dominantBaseline="middle" fontSize={CELL * 0.6}>
                &#9819;
              </text>
            ))}
          </svg>
          <p className="text-xs text-muted-foreground mt-1 text-center">
            Attacks: {attacks.length} | Chromosome: [{queens.join(',')}]
          </p>
        </div>

        {/* Fitness chart */}
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-muted-foreground mb-2">Fitness over Generations</div>
          <svg width="100%" viewBox={`0 0 ${chartW} ${chartH}`} className="overflow-visible">
            {/* Grid */}
            {[0, 7, 14, 21, 28].map(v => (
              <g key={v}>
                <line x1={30} x2={chartW} y1={toChartY(v)} y2={toChartY(v)}
                  stroke="var(--viz-border)" strokeWidth={0.5} opacity={0.4} />
                <text x={26} y={toChartY(v) + 3} textAnchor="end" fontSize={9}
                  fill="var(--viz-text)" opacity={0.5}>{v}</text>
              </g>
            ))}

            {/* Target line */}
            <line x1={30} x2={chartW} y1={toChartY(28)} y2={toChartY(28)}
              stroke="rgb(34,197,94)" strokeWidth={1} strokeDasharray="6,3" opacity={0.5} />
            <text x={chartW + 2} y={toChartY(28) + 3} fontSize={8}
              fill="rgb(34,197,94)" opacity={0.7}>target</text>

            {/* Best fitness */}
            {history.length > 1 && (
              <polyline fill="none" stroke="rgb(34,197,94)" strokeWidth={2}
                points={history.map((s, i) => `${toChartX(i)},${toChartY(s.bestFitness)}`).join(' ')} />
            )}

            {/* Avg fitness */}
            {history.length > 1 && (
              <polyline fill="none" stroke="rgb(59,130,246)" strokeWidth={1.5} strokeDasharray="4,3"
                points={history.map((s, i) => `${toChartX(i)},${toChartY(s.avgFitness)}`).join(' ')} />
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
