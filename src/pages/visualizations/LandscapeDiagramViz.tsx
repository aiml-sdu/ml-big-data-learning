import { useRef } from 'react';
import { useContainerSize } from '@/hooks/useContainerSize';

const VB_W = 700;
const VB_H = 350;

const PAD = { top: 30, right: 24, bottom: 48, left: 52 };
const PLOT_W = VB_W - PAD.left - PAD.right;
const PLOT_H = VB_H - PAD.top - PAD.bottom;

function px(xFrac: number) {
  return PAD.left + xFrac * PLOT_W;
}
function py(yFrac: number) {
  return PAD.top + PLOT_H - yFrac * PLOT_H;
}

const pts = {
  start:        { x: 0.00, y: 0.04 },
  localPeak:    { x: 0.25, y: 0.58 },
  plateauStart: { x: 0.42, y: 0.44 },
  plateauMid:   { x: 0.50, y: 0.46 },
  plateauEnd:   { x: 0.57, y: 0.44 },
  shoulder:     { x: 0.64, y: 0.52 },
  globalPeak:   { x: 0.75, y: 0.90 },
  end:          { x: 1.00, y: 0.06 },
};

function buildCurvePath(): string {
  const P = (p: { x: number; y: number }) => `${px(p.x).toFixed(1)},${py(p.y).toFixed(1)}`;
  return [
    `M ${P(pts.start)}`,
    `C ${px(0.08).toFixed(1)},${py(0.06).toFixed(1)} ${px(0.17).toFixed(1)},${py(0.62).toFixed(1)} ${P(pts.localPeak)}`,
    `C ${px(0.30).toFixed(1)},${py(0.52).toFixed(1)} ${px(0.36).toFixed(1)},${py(0.36).toFixed(1)} ${P(pts.plateauStart)}`,
    `C ${px(0.46).toFixed(1)},${py(0.48).toFixed(1)} ${px(0.54).toFixed(1)},${py(0.48).toFixed(1)} ${P(pts.plateauEnd)}`,
    `C ${px(0.60).toFixed(1)},${py(0.44).toFixed(1)} ${px(0.61).toFixed(1)},${py(0.56).toFixed(1)} ${P(pts.shoulder)}`,
    `C ${px(0.67).toFixed(1)},${py(0.48).toFixed(1)} ${px(0.70).toFixed(1)},${py(0.92).toFixed(1)} ${P(pts.globalPeak)}`,
    `C ${px(0.82).toFixed(1)},${py(0.88).toFixed(1)} ${px(0.93).toFixed(1)},${py(0.10).toFixed(1)} ${P(pts.end)}`,
  ].join(' ');
}

function buildAreaPath(): string {
  const curve = buildCurvePath();
  return `${curve} L ${px(1).toFixed(1)},${py(0).toFixed(1)} L ${px(0).toFixed(1)},${py(0).toFixed(1)} Z`;
}

interface Annotation {
  label: string;
  subLabel?: string;
  dotX: number;
  dotY: number;
  textX: number;
  textY: number;
  anchor: 'start' | 'middle' | 'end';
}

const ANNOTATIONS: Annotation[] = [
  {
    label: 'Global Maximum',
    subLabel: 'highest point in space',
    dotX: px(pts.globalPeak.x), dotY: py(pts.globalPeak.y),
    textX: px(pts.globalPeak.x) + 56, textY: py(pts.globalPeak.y) - 10,
    anchor: 'start',
  },
  {
    label: 'Local Maximum',
    subLabel: 'peak within neighborhood',
    dotX: px(pts.localPeak.x), dotY: py(pts.localPeak.y),
    textX: px(pts.localPeak.x) - 50, textY: py(pts.localPeak.y) - 14,
    anchor: 'end',
  },
  {
    label: 'Flat Plateau',
    subLabel: 'no gradient to follow',
    dotX: px(pts.plateauMid.x), dotY: py(pts.plateauMid.y),
    textX: px(pts.plateauMid.x), textY: py(pts.plateauMid.y) - 42,
    anchor: 'middle',
  },
  {
    label: 'Shoulder',
    subLabel: 'slope flattens briefly',
    dotX: px(pts.shoulder.x), dotY: py(pts.shoulder.y),
    textX: px(pts.shoulder.x) + 46, textY: py(pts.shoulder.y) + 32,
    anchor: 'start',
  },
];

const CURVE_PATH = buildCurvePath();
const AREA_PATH = buildAreaPath();
const Y_TICKS = [0, 0.25, 0.5, 0.75, 1.0];

export default function LandscapeDiagramViz() {
  const containerRef = useRef<HTMLDivElement>(null);
  useContainerSize(containerRef, { width: VB_W, height: VB_H });

  return (
    <div ref={containerRef} className="rounded-lg border bg-[var(--viz-bg)] p-4 my-4">
      <svg viewBox={`0 0 ${VB_W} ${VB_H}`} width="100%" style={{ display: 'block' }}>
        <defs>
          <linearGradient id="lsf" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.03" />
          </linearGradient>
        </defs>

        {/* Grid */}
        {Y_TICKS.map((t) => (
          <line key={t} x1={PAD.left} x2={PAD.left + PLOT_W} y1={py(t)} y2={py(t)}
            stroke="var(--viz-border)" strokeWidth={t === 0 ? 1.5 : 0.6}
            strokeDasharray={t === 0 ? undefined : '4,4'} opacity={0.5} />
        ))}

        {/* Filled area */}
        <path d={AREA_PATH} fill="url(#lsf)" />

        {/* Curve */}
        <path d={CURVE_PATH} fill="none" stroke="var(--primary)" strokeWidth={2.5}
          strokeLinecap="round" strokeLinejoin="round" />

        {/* Axes */}
        <line x1={PAD.left} y1={py(0)} x2={PAD.left + PLOT_W} y2={py(0)}
          stroke="var(--viz-text)" strokeWidth={1.5} opacity={0.5} />
        <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={py(0)}
          stroke="var(--viz-text)" strokeWidth={1.5} opacity={0.5} />

        {/* Axis labels */}
        <text x={PAD.left + PLOT_W / 2} y={VB_H - 8} textAnchor="middle"
          fontSize={13} fontWeight={500} fill="var(--viz-text)" opacity={0.7}>
          State space
        </text>
        <text x={14} y={PAD.top + PLOT_H / 2} textAnchor="middle"
          fontSize={13} fontWeight={500} fill="var(--viz-text)" opacity={0.7}
          transform={`rotate(-90, 14, ${PAD.top + PLOT_H / 2})`}>
          Objective function
        </text>

        {/* Annotations */}
        {ANNOTATIONS.map((ann) => (
          <g key={ann.label}>
            <line x1={ann.dotX} y1={ann.dotY} x2={ann.textX + (ann.anchor === 'end' ? 10 : ann.anchor === 'start' ? -10 : 0)}
              y2={ann.textY + 4} stroke="var(--viz-text)" strokeWidth={1} opacity={0.4} />
            <circle cx={ann.dotX} cy={ann.dotY} r={5}
              fill="var(--viz-bg)" stroke="var(--primary)" strokeWidth={2} />
            <text x={ann.textX} y={ann.textY} textAnchor={ann.anchor}
              fontSize={11.5} fontWeight={700} fill="var(--viz-text)">
              {ann.label}
            </text>
            {ann.subLabel && (
              <text x={ann.textX} y={ann.textY + 14} textAnchor={ann.anchor}
                fontSize={10} fill="var(--viz-text)" opacity={0.55}>
                {ann.subLabel}
              </text>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}
