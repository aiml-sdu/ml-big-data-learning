import { useState } from 'react';
import { motion } from 'framer-motion';

interface AlgoComplexity {
  label: string;
  color: string;
  time: (b: number, d: number, m: number) => number;
  space: (b: number, d: number, m: number) => number;
  timeLabel: string;
  spaceLabel: string;
}

const ALGOS: AlgoComplexity[] = [
  {
    label: 'BFS',
    color: '#3b82f6',
    time: (b, d) => Math.pow(b, d),
    space: (b, d) => Math.pow(b, d),
    timeLabel: 'b^d',
    spaceLabel: 'b^d',
  },
  {
    label: 'DFS',
    color: '#ef4444',
    time: (b, _d, m) => Math.pow(b, m),
    space: (b, _d, m) => b * m,
    timeLabel: 'b^m',
    spaceLabel: 'b·m',
  },
  {
    label: 'IDS',
    color: '#8b5cf6',
    time: (b, d) => Math.pow(b, d),
    space: (b, d) => b * d,
    timeLabel: 'b^d',
    spaceLabel: 'b·d',
  },
  {
    label: 'UCS',
    color: '#f59e0b',
    time: (b, d) => Math.pow(b, d),
    space: (b, d) => Math.pow(b, d),
    timeLabel: 'b^d',
    spaceLabel: 'b^d',
  },
];

function formatNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

export default function ComplexityExplorerViz() {
  const [b, setB] = useState(2);
  const [d, setD] = useState(3);
  const m = d + 2;

  // Find max value for scaling (use log for visual, but show actual)
  const allTimeValues = ALGOS.map((a) => a.time(b, d, m));
  const allSpaceValues = ALGOS.map((a) => a.space(b, d, m));
  const maxTime = Math.max(...allTimeValues);
  const maxSpace = Math.max(...allSpaceValues);

  // Log-scale percentage for bar width (min 3% so bars are visible)
  const logPct = (val: number, max: number) => {
    if (max <= 1) return 100;
    const logVal = Math.log10(Math.max(val, 1));
    const logMax = Math.log10(Math.max(max, 1));
    return Math.max(3, (logVal / logMax) * 100);
  };

  // Memory ratio callout
  const bfsSpace = ALGOS[0].space(b, d, m);
  const idsSpace = ALGOS[2].space(b, d, m);
  const memoryRatio = bfsSpace / Math.max(idsSpace, 1);

  return (
    <div className="not-prose my-6 rounded-lg border border-border bg-card p-4">
      <h3 className="mb-3 text-lg font-semibold text-foreground">
        Complexity Explorer
      </h3>
      <p className="mb-4 text-sm text-muted-foreground">
        Drag the sliders to see how branching factor and solution depth affect each algorithm&rsquo;s time and space.
      </p>

      {/* Sliders */}
      <div className="mb-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="flex items-center justify-between text-sm text-muted-foreground mb-1">
            <span>Branching factor <strong className="text-foreground">b = {b}</strong></span>
          </label>
          <input
            type="range" min={2} max={5} value={b}
            onChange={(e) => setB(Number(e.target.value))}
            className="w-full accent-primary"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
            <span>2</span><span>3</span><span>4</span><span>5</span>
          </div>
        </div>
        <div>
          <label className="flex items-center justify-between text-sm text-muted-foreground mb-1">
            <span>Solution depth <strong className="text-foreground">d = {d}</strong></span>
            <span className="text-xs">(m = {m})</span>
          </label>
          <input
            type="range" min={1} max={7} value={d}
            onChange={(e) => setD(Number(e.target.value))}
            className="w-full accent-primary"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
            {[1, 2, 3, 4, 5, 6, 7].map((v) => <span key={v}>{v}</span>)}
          </div>
        </div>
      </div>

      {/* Bar charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Time */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">Time Complexity (nodes expanded)</p>
          <div className="space-y-2">
            {ALGOS.map((algo) => {
              const val = algo.time(b, d, m);
              const pct = logPct(val, maxTime);
              return (
                <div key={algo.label} className="flex items-center gap-2">
                  <span className="w-8 text-xs font-semibold text-foreground">{algo.label}</span>
                  <div className="flex-1 h-6 rounded bg-muted overflow-hidden relative">
                    <motion.div
                      className="h-full rounded"
                      style={{ backgroundColor: algo.color }}
                      animate={{ width: `${pct}%` }}
                      transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                    />
                    <span className="absolute inset-0 flex items-center px-2 text-[10px] font-mono text-foreground pointer-events-none">
                      {algo.timeLabel} = {formatNum(val)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Space */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">Space Complexity (max memory)</p>
          <div className="space-y-2">
            {ALGOS.map((algo) => {
              const val = algo.space(b, d, m);
              const pct = logPct(val, maxSpace);
              return (
                <div key={algo.label} className="flex items-center gap-2">
                  <span className="w-8 text-xs font-semibold text-foreground">{algo.label}</span>
                  <div className="flex-1 h-6 rounded bg-muted overflow-hidden relative">
                    <motion.div
                      className="h-full rounded"
                      style={{ backgroundColor: algo.color }}
                      animate={{ width: `${pct}%` }}
                      transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                    />
                    <span className="absolute inset-0 flex items-center px-2 text-[10px] font-mono text-foreground pointer-events-none">
                      {algo.spaceLabel} = {formatNum(val)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Callout */}
      {memoryRatio >= 5 && (
        <motion.div
          key={`${b}-${d}`}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 rounded-md border border-purple-300 bg-purple-50 px-3 py-2 text-sm text-purple-800 dark:border-purple-800 dark:bg-purple-950 dark:text-purple-200"
        >
          IDS uses <strong>{formatNum(memoryRatio)}x</strong> less memory than BFS — same time complexity, but O(bd) vs O(b<sup>d</sup>) space!
        </motion.div>
      )}
    </div>
  );
}
