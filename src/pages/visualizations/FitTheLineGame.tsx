import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { generateLinearData, olsFit, mse, type Point } from '@/lib/regression-math';

const VB_W = 700;
const VB_H = 420;
const PAD = { top: 30, right: 30, bottom: 50, left: 60 };
const PLOT_W = VB_W - PAD.left - PAD.right;
const PLOT_H = VB_H - PAD.top - PAD.bottom;
const HANDLE_R = 10;

interface FitTheLineGameProps {
  onSolved?: () => void;
}

function dataBounds(points: Point[]) {
  let xMin = Infinity, xMax = -Infinity, yMin = Infinity, yMax = -Infinity;
  for (const p of points) {
    if (p.x < xMin) xMin = p.x;
    if (p.x > xMax) xMax = p.x;
    if (p.y < yMin) yMin = p.y;
    if (p.y > yMax) yMax = p.y;
  }
  const xPad = (xMax - xMin) * 0.1 || 1;
  const yPad = (yMax - yMin) * 0.15 || 1;
  return { xMin: xMin - xPad, xMax: xMax + xPad, yMin: yMin - yPad, yMax: yMax + yPad };
}

export default function FitTheLineGame({ onSolved }: FitTheLineGameProps) {
  const [seed, setSeed] = useState(42);
  const points = useMemo(() => generateLinearData(20, 2.5, 15, 10, seed), [seed]);
  const bounds = useMemo(() => dataBounds(points), [points]);

  const ols = useMemo(() => olsFit(points), [points]);
  const olsMSE = useMemo(() => mse(points, ols.w, ols.b), [points, ols]);

  const [userW, setUserW] = useState(0.5);
  const [userB, setUserB] = useState(25);
  const [showBest, setShowBest] = useState(false);
  const [animating, setAnimating] = useState(false);
  const solvedRef = useRef(false);

  const currentMSE = useMemo(() => mse(points, userW, userB), [points, userW, userB]);

  // Coordinate transforms
  const sx = useCallback((x: number) => PAD.left + ((x - bounds.xMin) / (bounds.xMax - bounds.xMin)) * PLOT_W, [bounds]);
  const sy = useCallback((y: number) => PAD.top + PLOT_H - ((y - bounds.yMin) / (bounds.yMax - bounds.yMin)) * PLOT_H, [bounds]);
  const invSy = useCallback((svgY: number) => bounds.yMin + ((PAD.top + PLOT_H - svgY) / PLOT_H) * (bounds.yMax - bounds.yMin), [bounds]);

  // Line endpoints in data space
  const lineY = useCallback((x: number) => userW * x + userB, [userW, userB]);
  const leftX = bounds.xMin;
  const rightX = bounds.xMax;

  // Drag state
  const dragRef = useRef<{ type: 'left' | 'right' | 'body'; startSvgY: number; startW: number; startB: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const svgCoords = useCallback((e: React.PointerEvent) => {
    const svg = svgRef.current!;
    const rect = svg.getBoundingClientRect();
    const scale = VB_W / rect.width;
    return { x: (e.clientX - rect.left) * scale, y: (e.clientY - rect.top) * scale };
  }, []);

  const handlePointerDown = useCallback((type: 'left' | 'right' | 'body') => (e: React.PointerEvent) => {
    if (animating) return;
    e.preventDefault();
    (e.target as Element).setPointerCapture(e.pointerId);
    const { y } = svgCoords(e);
    dragRef.current = { type, startSvgY: y, startW: userW, startB: userB };
  }, [svgCoords, userW, userB, animating]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    const drag = dragRef.current;
    if (!drag) return;
    const { y: svgY } = svgCoords(e);

    if (drag.type === 'body') {
      // Translate line up/down
      const dy = invSy(svgY) - invSy(drag.startSvgY);
      setUserB(drag.startB + dy);
    } else if (drag.type === 'left') {
      // Move left handle up/down → change intercept
      const dataY = invSy(svgY);
      setUserB(dataY - userW * leftX);
    } else if (drag.type === 'right') {
      // Move right handle → change slope (pivot around left handle)
      const dataY = invSy(svgY);
      const leftY = lineY(leftX);
      const newW = (dataY - leftY) / (rightX - leftX);
      setUserW(newW);
      // Keep left handle fixed: b = leftY - newW * leftX
      setUserB(leftY - newW * leftX);
    }
  }, [svgCoords, invSy, leftX, rightX, lineY, userW]);

  const handlePointerUp = useCallback(() => {
    dragRef.current = null;
  }, []);

  // Show Best Fit animation
  const handleShowBest = useCallback(() => {
    if (animating) return;
    setShowBest(true);
    setAnimating(true);
    const startW = userW, startB = userB;
    const targetW = ols.w, targetB = ols.b;
    const duration = 600;
    const start = performance.now();

    const animate = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1);
      // Ease in-out cubic
      const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      setUserW(startW + (targetW - startW) * e);
      setUserB(startB + (targetB - startB) * e);
      if (t < 1) {
        requestAnimationFrame(animate);
      } else {
        setAnimating(false);
        // Confetti if student was within 15%
        if (mse(points, startW, startB) < olsMSE * 1.15) {
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        }
      }
    };
    requestAnimationFrame(animate);
  }, [animating, userW, userB, ols, olsMSE, points]);

  const handleNewData = useCallback(() => {
    setSeed(s => s + 1);
    setShowBest(false);
    setUserW(0.5);
    setUserB(25);
  }, []);

  // Reset when data changes
  useEffect(() => {
    setShowBest(false);
    solvedRef.current = false;
  }, [seed]);

  useEffect(() => {
    const closeEnough = currentMSE <= olsMSE * 1.35;
    if ((showBest || closeEnough) && !solvedRef.current) {
      solvedRef.current = true;
      onSolved?.();
    }
  }, [currentMSE, olsMSE, onSolved, showBest]);

  // Axis ticks
  const xTicks = useMemo(() => {
    const ticks: number[] = [];
    const step = Math.ceil((bounds.xMax - bounds.xMin) / 6);
    for (let x = Math.ceil(bounds.xMin); x <= bounds.xMax; x += step) ticks.push(x);
    return ticks;
  }, [bounds]);

  const yTicks = useMemo(() => {
    const ticks: number[] = [];
    const range = bounds.yMax - bounds.yMin;
    const step = Math.pow(10, Math.floor(Math.log10(range))) || 5;
    const nice = range / step > 8 ? step * 2 : step;
    for (let y = Math.ceil(bounds.yMin / nice) * nice; y <= bounds.yMax; y += nice) ticks.push(y);
    return ticks;
  }, [bounds]);

  const pctAway = olsMSE > 0 ? Math.round(((currentMSE - olsMSE) / olsMSE) * 100) : 0;

  return (
    <div className="rounded-lg border border-border bg-card p-4 my-6 space-y-4">
      <div className="rounded-lg border border-border overflow-hidden bg-muted/20">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          className="w-full select-none"
          style={{ touchAction: 'none' }}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          {/* Grid */}
          {xTicks.map(x => (
            <g key={`gx-${x}`}>
              <line x1={sx(x)} y1={PAD.top} x2={sx(x)} y2={PAD.top + PLOT_H} stroke="var(--border)" strokeWidth={0.5} />
              <text x={sx(x)} y={PAD.top + PLOT_H + 18} textAnchor="middle" fill="var(--muted-foreground)" fontSize={11}>{x}</text>
            </g>
          ))}
          {yTicks.map(y => (
            <g key={`gy-${y}`}>
              <line x1={PAD.left} y1={sy(y)} x2={PAD.left + PLOT_W} y2={sy(y)} stroke="var(--border)" strokeWidth={0.5} />
              <text x={PAD.left - 8} y={sy(y) + 4} textAnchor="end" fill="var(--muted-foreground)" fontSize={11}>{y}</text>
            </g>
          ))}

          {/* Axes */}
          <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={PAD.top + PLOT_H} stroke="var(--foreground)" strokeWidth={1} opacity={0.3} />
          <line x1={PAD.left} y1={PAD.top + PLOT_H} x2={PAD.left + PLOT_W} y2={PAD.top + PLOT_H} stroke="var(--foreground)" strokeWidth={1} opacity={0.3} />

          {/* Residuals */}
          {points.map((p, i) => {
            const predY = userW * p.x + userB;
            return (
              <line
                key={`r-${i}`}
                x1={sx(p.x)} y1={sy(p.y)}
                x2={sx(p.x)} y2={sy(predY)}
                stroke="var(--color-error)"
                strokeWidth={1.2}
                strokeDasharray="4 3"
                opacity={0.5}
              />
            );
          })}

          {/* Regression line (draggable body) */}
          <line
            x1={sx(leftX)} y1={sy(lineY(leftX))}
            x2={sx(rightX)} y2={sy(lineY(rightX))}
            stroke="var(--primary)"
            strokeWidth={2.5}
            opacity={0.9}
          />
          {/* Invisible thick line for easier grabbing */}
          <line
            x1={sx(leftX)} y1={sy(lineY(leftX))}
            x2={sx(rightX)} y2={sy(lineY(rightX))}
            stroke="transparent"
            strokeWidth={20}
            className="cursor-grab active:cursor-grabbing"
            onPointerDown={handlePointerDown('body')}
          />

          {/* Left handle */}
          <circle
            cx={sx(leftX)} cy={sy(lineY(leftX))}
            r={HANDLE_R}
            fill="var(--primary)"
            stroke="white"
            strokeWidth={2}
            className="cursor-ns-resize"
            onPointerDown={handlePointerDown('left')}
          />

          {/* Right handle */}
          <circle
            cx={sx(rightX)} cy={sy(lineY(rightX))}
            r={HANDLE_R}
            fill="var(--primary)"
            stroke="white"
            strokeWidth={2}
            className="cursor-ns-resize"
            onPointerDown={handlePointerDown('right')}
          />

          {/* Data points (on top of everything) */}
          {points.map((p, i) => (
            <circle
              key={`p-${i}`}
              cx={sx(p.x)} cy={sy(p.y)}
              r={5}
              fill="var(--foreground)"
              opacity={0.7}
            />
          ))}

          {/* MSE badge */}
          <foreignObject x={VB_W - 190} y={6} width={180} height={60}>
            <div className="text-right">
              <div className="inline-block rounded-md bg-card border border-border px-3 py-1.5 shadow-sm">
                <div className="text-xs text-muted-foreground">Your MSE</div>
                <div className="text-lg font-bold tabular-nums text-foreground">{currentMSE.toFixed(1)}</div>
              </div>
            </div>
          </foreignObject>
        </svg>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <Button onClick={handleShowBest} disabled={showBest || animating} size="sm">
            Show Best Fit
          </Button>
          <Button onClick={handleNewData} variant="outline" size="sm">
            New Data
          </Button>
        </div>

        <div className="flex items-center gap-3 text-sm">
          <span className="text-muted-foreground">
            Best MSE: <span className="font-mono font-semibold text-foreground">{olsMSE.toFixed(1)}</span>
          </span>
          {showBest ? (
            <Badge variant="default" className="bg-emerald-600">Optimal!</Badge>
          ) : (
            <Badge variant="secondary" className="font-mono">
              {pctAway > 0 ? `${pctAway}% away` : 'Perfect!'}
            </Badge>
          )}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Drag the <strong>handles</strong> at the ends to change slope and intercept.
        Drag the <strong>line body</strong> to shift up/down. Watch residuals (dashed lines) shrink!
      </p>
    </div>
  );
}
