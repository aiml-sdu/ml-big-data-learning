import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useLabProgress } from '@/hooks/useLabProgress';
import { nQueensGA, type GAState } from '@/lib/local-search';

const N = 8;
const MAX_FITNESS = 28;

function MiniBoard({ queens }: { queens: number[] }) {
  const cell = 24;
  const size = cell * N;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="border rounded">
      {Array.from({ length: N }, (_, r) =>
        Array.from({ length: N }, (_, c) => (
          <rect key={`${r}-${c}`} x={c * cell} y={r * cell} width={cell} height={cell}
            fill={(r + c) % 2 === 1 ? '#b58863' : '#f0d9b5'} />
        ))
      )}
      {queens.map((col, row) => (
        <text key={row} x={col * cell + cell / 2} y={row * cell + cell / 2 + 1}
          textAnchor="middle" dominantBaseline="middle" fontSize={cell * 0.6}>
          &#9819;
        </text>
      ))}
    </svg>
  );
}

export default function Exercise3NQueensGA() {
  const { markStepComplete, isStepComplete } = useLabProgress('lab4-ex3', 3);
  const [popSize, setPopSize] = useState(100);
  const [mutRate, setMutRate] = useState(0.05);
  const [crossRate, setCrossRate] = useState(0.8);
  const [result, setResult] = useState<GAState | null>(null);
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState('');

  const runGA = useCallback(() => {
    setRunning(true);
    setResult(null);
    setMessage('Running...');

    // Run in a timeout to avoid blocking UI
    setTimeout(() => {
      const gen = nQueensGA(N, popSize, mutRate, crossRate, 500, Date.now() & 0xffff);
      let last: GAState | null = null;
      for (const state of gen) {
        last = state;
        if (state.type === 'solution') break;
      }

      setResult(last);
      setRunning(false);

      if (!last) {
        setMessage('No result');
        return;
      }

      if (last.type === 'solution') {
        setMessage(`Solution found in generation ${last.generation}!`);

        // Step 1: any solution with defaults
        if (!isStepComplete(1)) {
          markStepComplete(1);
        }

        // Step 3: solution in under 50 generations
        if (last.generation < 50 && !isStepComplete(3)) {
          markStepComplete(3);
        }
      } else {
        setMessage(`Reached max generations. Best fitness: ${last.bestFitness}/${MAX_FITNESS}`);
      }

      // Step 2: ran with high mutation
      if (mutRate >= 0.15 && !isStepComplete(2)) {
        markStepComplete(2);
      }
    }, 50);
  }, [popSize, mutRate, crossRate, isStepComplete, markStepComplete]);

  const allDone = isStepComplete(1) && isStepComplete(2) && isStepComplete(3);

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Run the 8-Queens GA with different parameters. Complete all three tasks below.
      </p>

      {/* Parameters */}
      <div className="grid grid-cols-3 gap-3 text-xs">
        <div>
          <label className="text-muted-foreground">Population: {popSize}</label>
          <input type="range" min="50" max="200" step="10" value={popSize}
            onChange={e => setPopSize(Number(e.target.value))} className="w-full accent-[var(--primary)]" />
        </div>
        <div>
          <label className="text-muted-foreground">Mutation: {mutRate.toFixed(2)}</label>
          <input type="range" min="0.01" max="0.2" step="0.01" value={mutRate}
            onChange={e => setMutRate(Number(e.target.value))} className="w-full accent-[var(--primary)]" />
        </div>
        <div>
          <label className="text-muted-foreground">Crossover: {crossRate.toFixed(2)}</label>
          <input type="range" min="0.5" max="1.0" step="0.05" value={crossRate}
            onChange={e => setCrossRate(Number(e.target.value))} className="w-full accent-[var(--primary)]" />
        </div>
      </div>

      <Button size="sm" onClick={runGA} disabled={running}>
        {running ? 'Running...' : 'Run GA'}
      </Button>

      {/* Result */}
      {result && (
        <div className="flex flex-wrap items-start gap-4">
          <MiniBoard queens={result.bestIndividual} />
          <div className="text-sm space-y-1">
            <p><strong>Generation:</strong> {result.generation}</p>
            <p><strong>Fitness:</strong> {result.bestFitness}/{MAX_FITNESS}</p>
            <p><strong>Attacks:</strong> {MAX_FITNESS - result.bestFitness}</p>
            <p><strong>Chromosome:</strong> [{result.bestIndividual.join(',')}]</p>
            <p className={result.type === 'solution' ? 'text-green-600 dark:text-green-400 font-semibold' : 'text-muted-foreground'}>
              {message}
            </p>
          </div>
        </div>
      )}

      {/* Tasks checklist */}
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <div className={`w-5 h-5 rounded border flex items-center justify-center text-xs ${isStepComplete(1) ? 'bg-green-500 text-white border-green-600' : 'border-border'}`}>
            {isStepComplete(1) ? '✓' : '1'}
          </div>
          <span className={isStepComplete(1) ? 'line-through text-muted-foreground' : ''}>
            Run with default settings and find a solution
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-5 h-5 rounded border flex items-center justify-center text-xs ${isStepComplete(2) ? 'bg-green-500 text-white border-green-600' : 'border-border'}`}>
            {isStepComplete(2) ? '✓' : '2'}
          </div>
          <span className={isStepComplete(2) ? 'line-through text-muted-foreground' : ''}>
            Try mutation rate ≥ 0.15 and run. What happens to convergence?
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-5 h-5 rounded border flex items-center justify-center text-xs ${isStepComplete(3) ? 'bg-green-500 text-white border-green-600' : 'border-border'}`}>
            {isStepComplete(3) ? '✓' : '3'}
          </div>
          <span className={isStepComplete(3) ? 'line-through text-muted-foreground' : ''}>
            Find settings that solve it in under 50 generations
          </span>
        </div>
      </div>

      {allDone && (
        <div className="rounded-md bg-green-500/10 border border-green-500/30 px-3 py-2 text-sm">
          <strong>All tasks complete!</strong> You've explored how GA parameters affect N-Queens solving performance.
        </div>
      )}
    </div>
  );
}
