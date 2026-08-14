import { useRef, useState, useEffect } from 'react';
import { useContainerSize } from '@/hooks/useContainerSize';

// ---- World-space constants ----
const WORLD_W = 700;
const WORLD_H = 500;

const HEADER_LEFT = 80;
const HEADER_TOP = 50;
const GRID_W = WORLD_W - HEADER_LEFT - 30; // 590
const GRID_H = WORLD_H - HEADER_TOP - 30; // 420
const CELL_W = GRID_W / 2; // 295
const CELL_H = GRID_H / 2; // 210
const CELL_PAD = 8;

// ---- Quadrant data ----
interface Quadrant {
  row: number;
  col: number;
  label1: string;
  label2: string;
  description: string;
}

const QUADRANTS: Quadrant[] = [
  {
    row: 0,
    col: 0,
    label1: 'GPS',
    label2: 'Cognitive Science',
    description:
      'Thinking Humanly: Systems that model human cognitive processes. The General Problem Solver (GPS) by Newell & Simon attempted to mimic human reasoning steps.',
  },
  {
    row: 0,
    col: 1,
    label1: 'Expert Systems',
    label2: 'Logic Engines',
    description:
      'Thinking Rationally: Systems based on formal logic and inference rules. Expert systems encode domain knowledge as logical rules to derive conclusions.',
  },
  {
    row: 1,
    col: 0,
    label1: 'ELIZA',
    label2: 'Turing Test',
    description:
      'Acting Humanly: Systems that behave indistinguishably from humans. ELIZA simulated a therapist using pattern matching, inspiring the Turing Test benchmark.',
  },
  {
    row: 1,
    col: 1,
    label1: 'Deep Blue',
    label2: 'Self-driving Cars',
    description:
      'Acting Rationally: Rational agents that act to achieve optimal outcomes. Deep Blue defeated Kasparov through brute-force search and evaluation.',
  },
];

const ROW_HEADERS = ['Thinking', 'Acting'];
const COL_HEADERS = ['Humanly', 'Rationally'];

export default function ApproachesMatrixViz() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { width: containerW } = useContainerSize(containerRef, {
    width: WORLD_W,
    height: WORLD_H,
  });

  const [selected, setSelected] = useState<number | null>(null);
  const [animReady, setAnimReady] = useState(false);

  // Trigger intro animation after mount
  useEffect(() => {
    const id = requestAnimationFrame(() => setAnimReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const svgWidth = Math.min(containerW - 16, WORLD_W);

  return (
    <div
      className="rounded-lg border bg-card p-4 my-6 overflow-hidden"
      ref={containerRef}
    >
      <div className="text-sm font-medium text-muted-foreground mb-3">
        Four Approaches to AI (Russell &amp; Norvig)
      </div>

      <svg
        viewBox={`0 0 ${WORLD_W} ${WORLD_H}`}
        width={svgWidth}
        style={{ display: 'block', maxWidth: '100%', height: 'auto' }}
      >
        {/* Column headers */}
        {COL_HEADERS.map((label, c) => {
          const cx = HEADER_LEFT + c * CELL_W + CELL_W / 2;
          return (
            <text
              key={`col-${c}`}
              x={cx}
              y={24}
              textAnchor="middle"
              dominantBaseline="central"
              className="fill-foreground"
              style={{
                fontSize: 18,
                fontWeight: 'bold',
                fontFamily: 'var(--font-sans, system-ui, sans-serif)',
              }}
            >
              {label}
            </text>
          );
        })}

        {/* Row headers (vertical text) */}
        {ROW_HEADERS.map((label, r) => {
          const cy = HEADER_TOP + r * CELL_H + CELL_H / 2;
          return (
            <text
              key={`row-${r}`}
              x={0}
              y={0}
              textAnchor="middle"
              dominantBaseline="central"
              className="fill-foreground"
              transform={`translate(30, ${cy}) rotate(-90)`}
              style={{
                fontSize: 18,
                fontWeight: 'bold',
                fontFamily: 'var(--font-sans, system-ui, sans-serif)',
              }}
            >
              {label}
            </text>
          );
        })}

        {/* Outer border */}
        <rect
          x={HEADER_LEFT}
          y={HEADER_TOP}
          width={GRID_W}
          height={GRID_H}
          className="fill-none stroke-border"
          strokeWidth={1.5}
          rx={2}
        />

        {/* Horizontal divider */}
        <line
          x1={HEADER_LEFT}
          y1={HEADER_TOP + CELL_H}
          x2={HEADER_LEFT + GRID_W}
          y2={HEADER_TOP + CELL_H}
          className="stroke-border"
          strokeWidth={1.5}
        />

        {/* Vertical divider */}
        <line
          x1={HEADER_LEFT + CELL_W}
          y1={HEADER_TOP}
          x2={HEADER_LEFT + CELL_W}
          y2={HEADER_TOP + GRID_H}
          className="stroke-border"
          strokeWidth={1.5}
        />

        {/* Quadrants */}
        {QUADRANTS.map((q, i) => {
          const x = HEADER_LEFT + q.col * CELL_W + CELL_PAD;
          const y = HEADER_TOP + q.row * CELL_H + CELL_PAD;
          const w = CELL_W - CELL_PAD * 2;
          const h = CELL_H - CELL_PAD * 2;
          const cx = x + w / 2;
          const cy = y + h / 2;
          const isSelected = selected === i;

          return (
            <g
              key={i}
              style={{
                transformOrigin: `${cx}px ${cy}px`,
                transform: animReady
                  ? `scale(${isSelected ? 1.04 : 1})`
                  : 'scale(0)',
                opacity: animReady ? 1 : 0,
                transition: [
                  `transform 500ms cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 100}ms`,
                  `opacity 400ms ease ${i * 100}ms`,
                ].join(', '),
                cursor: 'pointer',
              }}
              onClick={() =>
                setSelected((prev) => (prev === i ? null : i))
              }
            >
              {/* Background */}
              <rect
                x={x}
                y={y}
                width={w}
                height={h}
                rx={12}
                className={
                  isSelected
                    ? 'fill-primary/10 stroke-primary'
                    : 'fill-card stroke-border'
                }
                strokeWidth={isSelected ? 2 : 1}
                style={
                  isSelected
                    ? {
                        filter:
                          'drop-shadow(0 4px 20px hsl(var(--primary) / 0.3))',
                      }
                    : undefined
                }
              />

              {/* Label 1 (main example) */}
              <text
                x={cx}
                y={cy - 14}
                textAnchor="middle"
                dominantBaseline="central"
                className={isSelected ? 'fill-primary' : 'fill-foreground'}
                style={{
                  fontSize: 16,
                  fontWeight: 'bold',
                  fontFamily: 'var(--font-sans, system-ui, sans-serif)',
                  pointerEvents: 'none',
                }}
              >
                {q.label1}
              </text>

              {/* Label 2 (secondary) */}
              <text
                x={cx}
                y={cy + 14}
                textAnchor="middle"
                dominantBaseline="central"
                className={
                  isSelected ? 'fill-primary' : 'fill-muted-foreground'
                }
                style={{
                  fontSize: 13,
                  fontFamily: 'var(--font-sans, system-ui, sans-serif)',
                  pointerEvents: 'none',
                }}
              >
                {q.label2}
              </text>
            </g>
          );
        })}
      </svg>

      {selected !== null && (
        <div className="mt-3 text-sm text-muted-foreground leading-relaxed transition-opacity duration-200">
          {QUADRANTS[selected].description}
        </div>
      )}
    </div>
  );
}
