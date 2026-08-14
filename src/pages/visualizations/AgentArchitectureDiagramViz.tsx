import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type ArchKey = 'simple' | 'model' | 'goal' | 'utility';

interface Box {
  id: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  isNew?: boolean;
}

interface Arrow {
  from: string;
  to: string;
  feedback?: boolean;
}

interface Architecture {
  key: ArchKey;
  label: string;
  subtitle: string;
  boxes: Box[];
  arrows: Arrow[];
  whatsNew: string;
}

const ARCHS: Architecture[] = [
  {
    key: 'simple',
    label: 'Simple Reflex',
    subtitle: 'Current percept only',
    whatsNew: 'Baseline: condition-action rules map directly from percept to action',
    boxes: [
      { id: 'sensors', label: 'Sensors', x: 20, y: 50, w: 80, h: 36 },
      { id: 'rules', label: 'Condition-\nAction Rules', x: 160, y: 50, w: 100, h: 36 },
      { id: 'actuators', label: 'Actuators', x: 320, y: 50, w: 80, h: 36 },
    ],
    arrows: [
      { from: 'sensors', to: 'rules' },
      { from: 'rules', to: 'actuators' },
    ],
  },
  {
    key: 'model',
    label: 'Model-Based',
    subtitle: 'Tracks world state',
    whatsNew: '+ Internal model that tracks unobservable state',
    boxes: [
      { id: 'sensors', label: 'Sensors', x: 20, y: 70, w: 80, h: 36 },
      { id: 'state', label: 'State\nEstimator', x: 130, y: 20, w: 90, h: 36, isNew: true },
      { id: 'model', label: 'World\nModel', x: 130, y: 70, w: 90, h: 36, isNew: true },
      { id: 'rules', label: 'Rules', x: 260, y: 70, w: 70, h: 36 },
      { id: 'actuators', label: 'Actuators', x: 360, y: 70, w: 80, h: 36 },
    ],
    arrows: [
      { from: 'sensors', to: 'state' },
      { from: 'sensors', to: 'model' },
      { from: 'state', to: 'model' },
      { from: 'model', to: 'rules' },
      { from: 'rules', to: 'actuators' },
      { from: 'actuators', to: 'state', feedback: true },
    ],
  },
  {
    key: 'goal',
    label: 'Goal-Based',
    subtitle: 'Plans toward explicit goals',
    whatsNew: '+ Explicit goal + search/planning to reach it',
    boxes: [
      { id: 'sensors', label: 'Sensors', x: 20, y: 70, w: 80, h: 36 },
      { id: 'model', label: 'World\nModel', x: 130, y: 70, w: 90, h: 36 },
      { id: 'goal', label: 'Goal', x: 255, y: 20, w: 70, h: 36, isNew: true },
      { id: 'plan', label: 'Search /\nPlan', x: 255, y: 70, w: 80, h: 36, isNew: true },
      { id: 'actuators', label: 'Actuators', x: 370, y: 70, w: 80, h: 36 },
    ],
    arrows: [
      { from: 'sensors', to: 'model' },
      { from: 'model', to: 'plan' },
      { from: 'goal', to: 'plan' },
      { from: 'plan', to: 'actuators' },
    ],
  },
  {
    key: 'utility',
    label: 'Utility-Based',
    subtitle: 'Maximizes expected utility',
    whatsNew: '+ Utility function that ranks outcomes by desirability',
    boxes: [
      { id: 'sensors', label: 'Sensors', x: 10, y: 70, w: 76, h: 36 },
      { id: 'model', label: 'World\nModel', x: 110, y: 70, w: 86, h: 36 },
      { id: 'utility', label: 'Utility\nFunction', x: 222, y: 20, w: 86, h: 36, isNew: true },
      { id: 'maximize', label: 'Maximize\nE[Utility]', x: 222, y: 70, w: 86, h: 36, isNew: true },
      { id: 'actuators', label: 'Actuators', x: 340, y: 70, w: 80, h: 36 },
    ],
    arrows: [
      { from: 'sensors', to: 'model' },
      { from: 'model', to: 'maximize' },
      { from: 'utility', to: 'maximize' },
      { from: 'maximize', to: 'actuators' },
    ],
  },
];

function getCenter(box: Box) {
  return { x: box.x + box.w / 2, y: box.y + box.h / 2 };
}

function getEdgePoint(box: Box, target: { x: number; y: number }) {
  const cx = box.x + box.w / 2;
  const cy = box.y + box.h / 2;
  const dx = target.x - cx;
  const dy = target.y - cy;
  const scaleX = Math.abs(dx) / (box.w / 2 + 4) || 0.001;
  const scaleY = Math.abs(dy) / (box.h / 2 + 4) || 0.001;
  const scale = Math.max(scaleX, scaleY);
  return { x: cx + dx / scale, y: cy + dy / scale };
}

function ArrowLine({ fromBox, toBox, feedback, index }: { fromBox: Box; toBox: Box; feedback?: boolean; index: number }) {
  const fromC = getCenter(fromBox);
  const toC = getCenter(toBox);
  const start = getEdgePoint(fromBox, toC);
  const end = getEdgePoint(toBox, fromC);

  if (feedback) {
    // Curved feedback arrow going below
    const midY = Math.max(start.y, end.y) + 30;
    return (
      <g>
        <defs>
          <marker id={`arch-fb-${index}`} markerWidth="7" markerHeight="5" refX="6" refY="2.5" orient="auto">
            <path d="M0,0 L7,2.5 L0,5" fill="currentColor" className="text-muted-foreground" />
          </marker>
        </defs>
        <motion.path
          d={`M ${start.x} ${start.y} Q ${(start.x + end.x) / 2} ${midY} ${end.x} ${end.y}`}
          fill="none" stroke="currentColor" className="text-muted-foreground" strokeWidth={1.2}
          strokeDasharray="4,3"
          markerEnd={`url(#arch-fb-${index})`}
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 0.3 + index * 0.08 }}
        />
      </g>
    );
  }

  return (
    <g>
      <defs>
        <marker id={`arch-arr-${index}`} markerWidth="7" markerHeight="5" refX="6" refY="2.5" orient="auto">
          <path d="M0,0 L7,2.5 L0,5" fill="currentColor" className="text-muted-foreground" />
        </marker>
      </defs>
      <motion.line
        x1={start.x} y1={start.y} x2={end.x} y2={end.y}
        stroke="currentColor" className="text-muted-foreground" strokeWidth={1.5}
        markerEnd={`url(#arch-arr-${index})`}
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
        transition={{ duration: 0.4, delay: 0.2 + index * 0.08 }}
      />
    </g>
  );
}

export default function AgentArchitectureDiagramViz() {
  const [activeIdx, setActiveIdx] = useState(0);
  const arch = ARCHS[activeIdx];

  const boxMap = Object.fromEntries(arch.boxes.map((b) => [b.id, b]));

  return (
    <div className="not-prose my-6 rounded-lg border border-border bg-card p-4">
      <h3 className="mb-1 text-lg font-semibold text-foreground">Agent Architectures</h3>
      <p className="mb-3 text-sm text-muted-foreground">
        Each architecture adds one layer of sophistication. New components are highlighted.
      </p>

      {/* Tabs */}
      <div className="mb-4 flex flex-wrap gap-1.5">
        {ARCHS.map((a, i) => (
          <button
            key={a.key}
            onClick={() => setActiveIdx(i)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              i === activeIdx
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-accent'
            }`}
          >
            {i + 1}. {a.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={arch.key}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* "What's new" badge */}
          <div className="mb-2 flex items-start gap-2">
            <span className="shrink-0 rounded bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
              What&rsquo;s new
            </span>
            <span className="text-sm text-foreground">{arch.whatsNew}</span>
          </div>

          {/* SVG diagram */}
          <svg viewBox="0 0 460 130" className="w-full max-w-lg">
            {/* Arrows */}
            {arch.arrows.map((arrow, i) => {
              const fromBox = boxMap[arrow.from];
              const toBox = boxMap[arrow.to];
              if (!fromBox || !toBox) return null;
              return <ArrowLine key={`${arrow.from}-${arrow.to}`} fromBox={fromBox} toBox={toBox} feedback={arrow.feedback} index={i} />;
            })}

            {/* Boxes */}
            {arch.boxes.map((box) => (
              <motion.g
                key={box.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <rect
                  x={box.x} y={box.y} width={box.w} height={box.h} rx={6}
                  fill={box.isNew ? 'currentColor' : 'currentColor'}
                  className={box.isNew ? 'text-primary' : 'text-muted'}
                  opacity={box.isNew ? 0.2 : 0.3}
                  stroke={box.isNew ? 'currentColor' : 'currentColor'}
                  strokeWidth={box.isNew ? 2 : 1}
                />
                {box.label.split('\n').map((line, li) => (
                  <text
                    key={li}
                    x={box.x + box.w / 2}
                    y={box.y + box.h / 2 + (li - (box.label.split('\n').length - 1) / 2) * 12}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="currentColor"
                    className="text-foreground"
                    fontSize={10}
                    fontWeight={box.isNew ? 700 : 500}
                  >
                    {line}
                  </text>
                ))}
              </motion.g>
            ))}
          </svg>

          <p className="mt-1 text-xs text-muted-foreground">
            <strong>{arch.label}:</strong> {arch.subtitle}
          </p>
        </motion.div>
      </AnimatePresence>

      <p className="mt-3 text-xs text-muted-foreground italic">
        Each architecture adds one component: memory (model), goals, or utility. More capability, more complexity — always a trade-off.
      </p>
    </div>
  );
}
