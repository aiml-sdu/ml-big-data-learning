import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface DataPoint {
  year: number;
  hype: number;
  reality: number;
}

interface Label {
  year: number;
  y: number;
  text: string;
  detail: string;
  type: 'peak' | 'valley';
}

// Hype: volatile boom/bust. Reality: steady exponential growth.
const DATA: DataPoint[] = [
  { year: 1950, hype: 10, reality: 2 },
  { year: 1956, hype: 30, reality: 4 },
  { year: 1965, hype: 70, reality: 8 },
  { year: 1973, hype: 15, reality: 12 },
  { year: 1980, hype: 20, reality: 15 },
  { year: 1987, hype: 65, reality: 20 },
  { year: 1993, hype: 12, reality: 24 },
  { year: 2000, hype: 25, reality: 30 },
  { year: 2012, hype: 55, reality: 50 },
  { year: 2016, hype: 70, reality: 60 },
  { year: 2020, hype: 85, reality: 72 },
  { year: 2025, hype: 95, reality: 80 },
];

const LABELS: Label[] = [
  { year: 1965, y: 70, text: 'Early Optimism', detail: '1960s: Researchers predicted human-level AI within 20 years. Early successes on toy problems fueled wild optimism.', type: 'peak' },
  { year: 1973, y: 15, text: '1st AI Winter', detail: '1970s: The Lighthill Report (UK) and funding cuts after failed promises. The gap between toy demos and real-world problems proved vast.', type: 'valley' },
  { year: 1987, y: 65, text: 'Expert Systems Boom', detail: '1980s: Rule-based expert systems found commercial success. Companies invested billions — then discovered maintenance costs were unsustainable.', type: 'peak' },
  { year: 1993, y: 12, text: '2nd AI Winter', detail: 'Late 1980s–90s: Expert systems collapsed under their own weight. DARPA cut funding. AI became a dirty word in grant proposals.', type: 'valley' },
  { year: 2012, y: 55, text: 'Deep Learning', detail: '2012+: AlexNet won ImageNet. GPUs + big data + deep nets = breakthrough after breakthrough. AI funding exploded again.', type: 'peak' },
  { year: 2025, y: 95, text: 'LLM Era', detail: '2020s: Large language models (GPT, Claude) transform every industry. Are we in another hype cycle, or is this different?', type: 'peak' },
];

const W = 600;
const H = 250;
const PAD = { top: 20, right: 20, bottom: 35, left: 45 };
const PLOT_W = W - PAD.left - PAD.right;
const PLOT_H = H - PAD.top - PAD.bottom;

function xScale(year: number) {
  return PAD.left + ((year - 1950) / 75) * PLOT_W;
}
function yScale(val: number) {
  return PAD.top + PLOT_H - (val / 100) * PLOT_H;
}

function toPath(data: DataPoint[], key: 'hype' | 'reality'): string {
  return data.map((d, i) => {
    const x = xScale(d.year);
    const y = yScale(d[key]);
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');
}

function toAreaPath(data: DataPoint[], key: 'hype' | 'reality'): string {
  const line = toPath(data, key);
  const lastX = xScale(data[data.length - 1].year);
  const firstX = xScale(data[0].year);
  const baseY = yScale(0);
  return `${line} L ${lastX} ${baseY} L ${firstX} ${baseY} Z`;
}

export default function AIHypeCycleViz() {
  const [activeLabel, setActiveLabel] = useState<number | null>(null);
  const [drawn, setDrawn] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setDrawn(true); observer.disconnect(); } },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const hypePath = toPath(DATA, 'hype');
  const realityPath = toPath(DATA, 'reality');
  const hypeArea = toAreaPath(DATA, 'hype');
  const realityArea = toAreaPath(DATA, 'reality');

  // Approximate path length for animation
  const pathLen = 1200;

  return (
    <div ref={ref} className="not-prose my-6 rounded-lg border border-border bg-card p-4">
      <h3 className="mb-1 text-lg font-semibold text-foreground">AI Hype vs. Reality</h3>
      <p className="mb-3 text-sm text-muted-foreground">
        Expectations boom and bust, but actual capability keeps accumulating. Hover over labeled points for details.
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="AI hype vs reality chart">
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map((v) => (
          <line key={v} x1={PAD.left} x2={W - PAD.right} y1={yScale(v)} y2={yScale(v)}
            stroke="currentColor" className="text-border" strokeWidth={0.5} strokeDasharray={v === 0 ? undefined : '3,3'} />
        ))}

        {/* Area fills */}
        <motion.path
          d={hypeArea}
          fill="#f59e0b"
          opacity={drawn ? 0.1 : 0}
          initial={{ opacity: 0 }}
          animate={drawn ? { opacity: 0.1 } : {}}
          transition={{ duration: 1, delay: 1 }}
        />
        <motion.path
          d={realityArea}
          fill="#3b82f6"
          opacity={drawn ? 0.1 : 0}
          initial={{ opacity: 0 }}
          animate={drawn ? { opacity: 0.1 } : {}}
          transition={{ duration: 1, delay: 1 }}
        />

        {/* Lines with draw animation */}
        <motion.path
          d={hypePath}
          fill="none"
          stroke="#f59e0b"
          strokeWidth={2}
          strokeDasharray="4,4"
          initial={{ strokeDashoffset: pathLen, pathLength: 0 }}
          animate={drawn ? { strokeDashoffset: 0, pathLength: 1 } : {}}
          transition={{ duration: 2, ease: 'easeInOut' }}
          style={{ strokeDasharray: drawn ? '4,4' : pathLen }}
        />
        <motion.path
          d={realityPath}
          fill="none"
          stroke="#3b82f6"
          strokeWidth={2.5}
          initial={{ pathLength: 0 }}
          animate={drawn ? { pathLength: 1 } : {}}
          transition={{ duration: 2, ease: 'easeInOut' }}
        />

        {/* X-axis labels */}
        {[1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020].map((yr) => (
          <text key={yr} x={xScale(yr)} y={H - 8} textAnchor="middle" fill="currentColor" className="text-muted-foreground" fontSize={10}>
            {yr}
          </text>
        ))}

        {/* Y-axis label */}
        <text x={12} y={PAD.top + PLOT_H / 2} textAnchor="middle" fill="currentColor" className="text-muted-foreground" fontSize={10}
          transform={`rotate(-90, 12, ${PAD.top + PLOT_H / 2})`}>
          Activity Level
        </text>

        {/* Labeled points */}
        {LABELS.map((lbl, i) => {
          const x = xScale(lbl.year);
          const y = yScale(lbl.y);
          const isActive = activeLabel === i;
          return (
            <g key={i}
              onMouseEnter={() => setActiveLabel(i)}
              onMouseLeave={() => setActiveLabel(null)}
              onClick={() => setActiveLabel(isActive ? null : i)}
              className="cursor-pointer"
            >
              <circle cx={x} cy={y} r={isActive ? 7 : 5}
                fill={lbl.type === 'peak' ? '#f59e0b' : '#ef4444'}
                stroke="white" strokeWidth={1.5}
                className="transition-all"
              />
              <text x={x} y={y - 10} textAnchor="middle" fill="currentColor" className="text-foreground" fontSize={8} fontWeight={600}>
                {lbl.text}
              </text>
            </g>
          );
        })}

        {/* Legend */}
        <line x1={W - 160} x2={W - 140} y1={12} y2={12} stroke="#f59e0b" strokeWidth={2} strokeDasharray="4,4" />
        <text x={W - 136} y={15} fill="currentColor" className="text-muted-foreground" fontSize={10}>Hype / Expectations</text>
        <line x1={W - 160} x2={W - 140} y1={26} y2={26} stroke="#3b82f6" strokeWidth={2.5} />
        <text x={W - 136} y={29} fill="currentColor" className="text-muted-foreground" fontSize={10}>Actual Capability</text>
      </svg>

      {/* Tooltip detail */}
      {activeLabel !== null && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 rounded-md border border-border bg-muted/50 px-3 py-2 text-sm text-foreground"
        >
          {LABELS[activeLabel].detail}
        </motion.div>
      )}

      <p className="mt-3 text-xs text-muted-foreground italic">
        Hype is cyclical, but actual capability has been steadily accumulating. Each "winter" left behind real advances that the next wave built upon.
      </p>
    </div>
  );
}
