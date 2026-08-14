import { useState, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Button } from '@/components/ui/button';
import { useContainerSize } from '@/hooks/useContainerSize';
import { gameplayLandscape, hillClimb, type LocalSearchState } from '@/lib/local-search';

const VB_W = 700;
const VB_H = 360;
const PAD = { top: 20, right: 20, bottom: 30, left: 20 };
const PLOT_W = VB_W - PAD.left - PAD.right;
const PLOT_H = VB_H - PAD.top - PAD.bottom;

const landscape = gameplayLandscape(PLOT_W);

function toSvgY(val: number): number {
  return PAD.top + PLOT_H - val * PLOT_H * 0.9;
}

function toSvgX(x: number): number {
  return PAD.left + x;
}

function buildLandscapePath(): string {
  const pts: string[] = [];
  for (let x = 0; x <= PLOT_W; x += 2) {
    const y = toSvgY(landscape(x));
    pts.push(`${x === 0 ? 'M' : 'L'} ${toSvgX(x).toFixed(1)},${y.toFixed(1)}`);
  }
  return pts.join(' ');
}

function buildAreaPath(): string {
  const curve = buildLandscapePath();
  return `${curve} L ${toSvgX(PLOT_W)},${toSvgY(0)} L ${toSvgX(0)},${toSvgY(0)} Z`;
}

// Find global max
function findGlobalMax(): { x: number; val: number } {
  let bestX = 0;
  let bestVal = 0;
  for (let x = 0; x <= PLOT_W; x += 1) {
    const v = landscape(x);
    if (v > bestVal) { bestX = x; bestVal = v; }
  }
  return { x: bestX, val: bestVal };
}

const CURVE_PATH = buildLandscapePath();
const AREA_PATH = buildAreaPath();
const GLOBAL_MAX = findGlobalMax();

type Phase = 'place' | 'climb' | 'stuck' | 'restart' | 'done';

export default function HillClimbingLandscapeGame() {
  const containerRef = useRef<HTMLDivElement>(null);
  useContainerSize(containerRef, { width: VB_W, height: VB_H });

  const [phase, setPhase] = useState<Phase>('place');
  const [startX, setStartX] = useState<number | null>(null);
  const [trail, setTrail] = useState<{ x: number; val: number }[]>([]);
  const [currentState, setCurrentState] = useState<LocalSearchState | null>(null);
  const generatorRef = useRef<Generator<LocalSearchState> | null>(null);
  const [message, setMessage] = useState('Click on the landscape to place your starting position.');

  // Random restart results
  const [restartResults, setRestartResults] = useState<{ x: number; val: number; trail: { x: number; val: number }[] }[]>([]);

  const handleLandscapeClick = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (phase !== 'place') return;
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const scaleX = VB_W / rect.width;
    const clickX = (e.clientX - rect.left) * scaleX - PAD.left;
    const x = Math.max(0, Math.min(PLOT_W, clickX));
    const val = landscape(x);

    setStartX(x);
    setTrail([{ x, val }]);
    generatorRef.current = hillClimb(landscape, x, 5, 200);
    // Get the init state
    const init = generatorRef.current.next();
    if (!init.done) setCurrentState(init.value);
    setPhase('climb');
    setMessage(`Starting at x=${x.toFixed(0)}. Click "Step" to climb!`);
  }, [phase]);

  const handleStep = useCallback(() => {
    if (!generatorRef.current) return;
    const result = generatorRef.current.next();
    if (result.done) return;
    const state = result.value;
    setCurrentState(state);
    setTrail(prev => [...prev, { x: state.current, val: state.currentValue }]);
    setMessage(state.message);
    if (state.type === 'stuck') {
      setPhase('stuck');
    }
  }, []);

  const handleRandomRestart = useCallback(() => {
    setPhase('restart');
    const results: typeof restartResults = [];
    const seeds = [0.1, 0.3, 0.5, 0.7, 0.9].map(f => f * PLOT_W);

    for (const sx of seeds) {
      const gen = hillClimb(landscape, sx, 5, 200);
      const trail: { x: number; val: number }[] = [{ x: sx, val: landscape(sx) }];
      let finalX = sx;
      let finalVal = landscape(sx);

      for (const state of gen) {
        if (state.type === 'accept' || state.type === 'stuck') {
          trail.push({ x: state.current, val: state.currentValue });
          finalX = state.current;
          finalVal = state.currentValue;
        }
      }
      results.push({ x: finalX, val: finalVal, trail });
    }

    setRestartResults(results);

    const best = results.reduce((a, b) => a.val > b.val ? a : b);
    const isGlobal = Math.abs(best.x - GLOBAL_MAX.x) < 20;

    if (isGlobal) {
      setMessage(`Random restart found the global maximum! Best: x=${best.x.toFixed(0)} (value=${best.val.toFixed(3)})`);
      setPhase('done');
      setTimeout(() => confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } }), 200);
    } else {
      setMessage(`Best restart reached x=${best.x.toFixed(0)} (value=${best.val.toFixed(3)}). Try again!`);
      setPhase('done');
    }
  }, []);

  const handleReset = useCallback(() => {
    setPhase('place');
    setStartX(null);
    setTrail([]);
    setCurrentState(null);
    setRestartResults([]);
    generatorRef.current = null;
    setMessage('Click on the landscape to place your starting position.');
  }, []);

  const currentX = currentState?.current ?? startX;
  const currentVal = currentX != null ? landscape(currentX) : null;

  return (
    <div ref={containerRef} className="rounded-lg border bg-[var(--viz-bg)] p-4 my-4">
      <svg viewBox={`0 0 ${VB_W} ${VB_H}`} width="100%"
        style={{ display: 'block', cursor: phase === 'place' ? 'crosshair' : 'default' }}
        onClick={handleLandscapeClick}>
        <defs>
          <linearGradient id="hcg-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.2" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Landscape */}
        <path d={AREA_PATH} fill="url(#hcg-fill)" />
        <path d={CURVE_PATH} fill="none" stroke="var(--primary)" strokeWidth={2} />

        {/* Global max indicator */}
        <line x1={toSvgX(GLOBAL_MAX.x)} y1={toSvgY(GLOBAL_MAX.val) - 15}
          x2={toSvgX(GLOBAL_MAX.x)} y2={toSvgY(GLOBAL_MAX.val) - 5}
          stroke="var(--primary)" strokeWidth={1.5} opacity={0.4} />
        <text x={toSvgX(GLOBAL_MAX.x)} y={toSvgY(GLOBAL_MAX.val) - 18}
          textAnchor="middle" fontSize={9} fill="var(--primary)" opacity={0.5}>
          Global Max
        </text>

        {/* Trail dots */}
        {trail.map((pt, i) => (
          <circle key={i} cx={toSvgX(pt.x)} cy={toSvgY(pt.val)} r={3}
            fill="var(--primary)" opacity={0.4} />
        ))}

        {/* Random restart trails */}
        {restartResults.map((result, ri) => {
          const isBest = result.val === Math.max(...restartResults.map(r => r.val));
          return (
            <g key={ri}>
              {result.trail.map((pt, i) => (
                <circle key={i} cx={toSvgX(pt.x)} cy={toSvgY(pt.val)} r={2.5}
                  fill={isBest ? 'rgb(34,197,94)' : 'rgb(156,163,175)'} opacity={0.6} />
              ))}
              <circle cx={toSvgX(result.x)} cy={toSvgY(result.val)} r={6}
                fill={isBest ? 'rgb(34,197,94)' : 'rgb(156,163,175)'}
                stroke="white" strokeWidth={1.5} />
            </g>
          );
        })}

        {/* Current position */}
        {currentX != null && currentVal != null && phase !== 'restart' && phase !== 'done' && (
          <g>
            <circle cx={toSvgX(currentX)} cy={toSvgY(currentVal)} r={7}
              fill={phase === 'stuck' ? 'rgb(239,68,68)' : 'var(--primary)'}
              stroke="white" strokeWidth={2}>
              {phase === 'climb' && (
                <animate attributeName="r" values="6;8;6" dur="1s" repeatCount="indefinite" />
              )}
            </circle>
          </g>
        )}
      </svg>

      {/* Status */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <p className={`text-sm ${phase === 'stuck' ? 'text-red-500 font-semibold' : 'text-muted-foreground'}`}>
          {message}
        </p>
        <div className="flex gap-2">
          {phase === 'climb' && (
            <Button size="sm" onClick={handleStep}>Step</Button>
          )}
          {phase === 'stuck' && (
            <Button size="sm" variant="default" onClick={handleRandomRestart}>
              Random Restart (5 starts)
            </Button>
          )}
          {phase !== 'place' && (
            <Button size="sm" variant="outline" onClick={handleReset}>Reset</Button>
          )}
        </div>
      </div>
    </div>
  );
}
