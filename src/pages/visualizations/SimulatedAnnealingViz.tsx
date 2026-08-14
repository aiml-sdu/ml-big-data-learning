import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import AlgoControls from '@/components/AlgoControls';
import { useContainerSize } from '@/hooks/useContainerSize';
import { gameplayLandscape, simulatedAnnealing, type LocalSearchState } from '@/lib/local-search';

const VB_W = 700;
const VB_H = 400;
const PAD = { top: 20, right: 60, bottom: 30, left: 20 };
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
  return `${buildLandscapePath()} L ${toSvgX(PLOT_W)},${toSvgY(0)} L ${toSvgX(0)},${toSvgY(0)} Z`;
}

const CURVE_PATH = buildLandscapePath();
const AREA_PATH = buildAreaPath();

// Pre-collect all SA states
function collectStates(): LocalSearchState[] {
  const gen = simulatedAnnealing(landscape, 150, 30, 50, 0.97, 300, 42);
  const states: LocalSearchState[] = [];
  for (const s of gen) states.push(s);
  return states;
}

export default function SimulatedAnnealingViz() {
  const containerRef = useRef<HTMLDivElement>(null);
  useContainerSize(containerRef, { width: VB_W, height: VB_H });

  const allStates = useMemo(() => collectStates(), []);
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const state = allStates[stepIndex];
  const initialTemp = allStates.find(s => s.temperature)?.temperature ?? 50;

  // Auto-play
  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setStepIndex(prev => {
          if (prev >= allStates.length - 1) {
            setPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 400 / speed);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [playing, speed, allStates.length]);

  const handleStep = useCallback(() => {
    setStepIndex(prev => Math.min(prev + 1, allStates.length - 1));
  }, [allStates.length]);

  const handleStepBack = useCallback(() => {
    setStepIndex(prev => Math.max(prev - 1, 0));
  }, []);

  const handleReset = useCallback(() => {
    setPlaying(false);
    setStepIndex(0);
  }, []);

  // Collect visible dots from states 0..stepIndex
  const dots = useMemo(() => {
    const result: { x: number; val: number; type: string }[] = [];
    for (let i = 0; i <= stepIndex; i++) {
      const s = allStates[i];
      result.push({ x: s.current, val: s.currentValue, type: s.type });
    }
    return result;
  }, [stepIndex, allStates]);

  const tempFrac = state.temperature ? state.temperature / initialTemp : 0;
  const tempBarH = PLOT_H * 0.8;
  const tempBarX = VB_W - 30;
  const tempBarY = PAD.top + PLOT_H * 0.1;

  return (
    <div ref={containerRef} className="rounded-lg border bg-[var(--viz-bg)] p-4 my-4">
      <svg viewBox={`0 0 ${VB_W} ${VB_H}`} width="100%" style={{ display: 'block' }}>
        <defs>
          <linearGradient id="sa-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.15" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.02" />
          </linearGradient>
          <linearGradient id="temp-grad" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="rgb(59,130,246)" />
            <stop offset="100%" stopColor="rgb(239,68,68)" />
          </linearGradient>
        </defs>

        {/* Landscape */}
        <path d={AREA_PATH} fill="url(#sa-fill)" />
        <path d={CURVE_PATH} fill="none" stroke="var(--primary)" strokeWidth={2} opacity={0.7} />

        {/* Trail dots */}
        {dots.map((d, i) => {
          const isLast = i === dots.length - 1;
          let fill = 'rgb(156,163,175)'; // gray = rejected
          if (d.type === 'accept') fill = 'rgb(34,197,94)'; // green
          if (d.type === 'reject') fill = 'rgb(249,115,22)'; // orange = accepted bad move
          if (d.type === 'init') fill = 'var(--primary)';

          return (
            <circle key={i} cx={toSvgX(d.x)} cy={toSvgY(d.val)}
              r={isLast ? 6 : 3} fill={fill} opacity={isLast ? 1 : 0.6}
              stroke={isLast ? 'white' : undefined} strokeWidth={isLast ? 2 : undefined} />
          );
        })}

        {/* Best-so-far star */}
        {state.bestSoFar != null && (
          <g transform={`translate(${toSvgX(state.bestSoFar)},${toSvgY(state.bestValue) - 14})`}>
            <text textAnchor="middle" fontSize={14} fill="rgb(234,179,8)">&#9733;</text>
          </g>
        )}

        {/* Temperature bar */}
        <rect x={tempBarX - 6} y={tempBarY} width={12} height={tempBarH}
          rx={4} fill="var(--viz-border)" opacity={0.3} />
        <rect x={tempBarX - 5} y={tempBarY + tempBarH * (1 - tempFrac)}
          width={10} height={Math.max(tempBarH * tempFrac, 1)} rx={3}
          fill="url(#temp-grad)" opacity={0.8} />
        <text x={tempBarX} y={tempBarY - 6} textAnchor="middle"
          fontSize={9} fill="var(--viz-text)" opacity={0.6}>T</text>
        <text x={tempBarX} y={tempBarY + tempBarH + 14} textAnchor="middle"
          fontSize={9} fill="var(--viz-text)" opacity={0.6} className="font-mono">
          {(state.temperature ?? 0).toFixed(1)}
        </text>

        {/* Legend */}
        <g transform={`translate(${PAD.left + 8}, ${PAD.top + 8})`}>
          {[
            { color: 'rgb(34,197,94)', label: 'Accepted (better)' },
            { color: 'rgb(249,115,22)', label: 'Accepted (worse)' },
            { color: 'rgb(156,163,175)', label: 'Rejected' },
          ].map((item, i) => (
            <g key={i} transform={`translate(0, ${i * 16})`}>
              <circle cx={5} cy={-3} r={4} fill={item.color} />
              <text x={14} y={0} fontSize={10} fill="var(--viz-text)" opacity={0.7}>{item.label}</text>
            </g>
          ))}
        </g>
      </svg>

      {/* Status */}
      <p className="text-xs text-muted-foreground mt-2 mb-1">{state.message}</p>

      <AlgoControls
        playing={playing}
        canStepForward={stepIndex < allStates.length - 1}
        canStepBack={stepIndex > 0}
        speed={speed}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onStep={handleStep}
        onStepBack={handleStepBack}
        onReset={handleReset}
        onSpeedChange={setSpeed}
      />
    </div>
  );
}
