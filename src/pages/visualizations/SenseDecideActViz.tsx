import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Example {
  label: string;
  perceive: string;
  decide: string;
  act: string;
  sensor: string;
  actuator: string;
}

const EXAMPLES: Example[] = [
  {
    label: 'Spam Filter',
    perceive: 'Read email text',
    decide: 'Classify spam / not spam',
    act: 'Move to inbox or spam folder',
    sensor: 'Email content, headers, sender',
    actuator: 'Folder placement, flag',
  },
  {
    label: 'Voice Assistant',
    perceive: 'Hear voice command',
    decide: 'Parse intent & select response',
    act: 'Speak answer or execute task',
    sensor: 'Microphone audio stream',
    actuator: 'Speaker, API calls',
  },
  {
    label: 'Self-Driving Car',
    perceive: 'See road, obstacles, signs',
    decide: 'Plan safe trajectory',
    act: 'Steer, accelerate, brake',
    sensor: 'Cameras, lidar, GPS',
    actuator: 'Steering, throttle, brakes',
  },
  {
    label: 'Chess Engine',
    perceive: 'Read board position',
    decide: 'Search best move (minimax)',
    act: 'Place piece on target square',
    sensor: 'Board state (FEN/PGN)',
    actuator: 'Move output',
  },
];

const NODES = [
  { id: 'perceive', label: 'Perceive', angle: 210 },
  { id: 'decide', label: 'Decide', angle: 330 },
  { id: 'act', label: 'Act', angle: 90 },
] as const;

const CX = 160;
const CY = 115;
const R = 65;
const NODE_R = 36;

function getPos(angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: CX + R * Math.cos(rad), y: CY - R * Math.sin(rad) };
}

function CurvedArrow({ from, to, id }: { from: { x: number; y: number }; to: { x: number; y: number }; id: string }) {
  // Curved path between two points, bending outward from center
  const mx = (from.x + to.x) / 2;
  const my = (from.y + to.y) / 2;
  const dx = mx - CX;
  const dy = my - CY;
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;
  const bulge = 28;
  const cpx = mx + (dx / dist) * bulge;
  const cpy = my + (dy / dist) * bulge;

  // Shorten endpoints to not overlap circles
  const shortenFrom = NODE_R + 4;
  const shortenTo = NODE_R + 4;
  const dxFT = to.x - from.x;
  const dyFT = to.y - from.y;
  const lenFT = Math.sqrt(dxFT * dxFT + dyFT * dyFT) || 1;
  const sx = from.x + (dxFT / lenFT) * shortenFrom;
  const sy = from.y + (dyFT / lenFT) * shortenFrom;
  const ex = to.x - (dxFT / lenFT) * shortenTo;
  const ey = to.y - (dyFT / lenFT) * shortenTo;

  return (
    <g>
      <defs>
        <marker id={`arrow-${id}`} markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
          <path d="M0,0 L8,3 L0,6" fill="currentColor" className="text-muted-foreground" />
        </marker>
      </defs>
      <path
        d={`M ${sx} ${sy} Q ${cpx} ${cpy} ${ex} ${ey}`}
        fill="none"
        stroke="currentColor"
        className="text-muted-foreground"
        strokeWidth={1.5}
        markerEnd={`url(#arrow-${id})`}
      />
    </g>
  );
}

function PulsingDot({ from, to, delay }: { from: { x: number; y: number }; to: { x: number; y: number }; delay: number }) {
  const mx = (from.x + to.x) / 2;
  const my = (from.y + to.y) / 2;
  const dx = mx - CX;
  const dy = my - CY;
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;
  const bulge = 28;
  const cpx = mx + (dx / dist) * bulge;
  const cpy = my + (dy / dist) * bulge;

  return (
    <motion.circle
      r={4}
      fill="currentColor"
      className="text-primary"
      initial={{ offsetDistance: '0%' }}
      animate={{ offsetDistance: '100%' }}
      transition={{ duration: 1.2, delay, repeat: Infinity, repeatDelay: 2.4, ease: 'easeInOut' }}
      style={{
        offsetPath: `path("M ${from.x} ${from.y} Q ${cpx} ${cpy} ${to.x} ${to.y}")`,
      }}
    />
  );
}

export default function SenseDecideActViz() {
  const [activeIdx, setActiveIdx] = useState(0);
  const ex = EXAMPLES[activeIdx];

  const positions = NODES.map((n) => ({ ...n, ...getPos(n.angle) }));
  const descriptions = [ex.perceive, ex.decide, ex.act];

  return (
    <div className="not-prose my-6 rounded-lg border border-border bg-card p-4">
      <h3 className="mb-1 text-lg font-semibold text-foreground">Perceive &rarr; Decide &rarr; Act</h3>
      <p className="mb-3 text-sm text-muted-foreground">Same loop, different inputs &amp; outputs. Switch examples to see the pattern.</p>

      {/* Tabs */}
      <div className="mb-4 flex flex-wrap gap-1.5">
        {EXAMPLES.map((e, i) => (
          <button
            key={e.label}
            onClick={() => setActiveIdx(i)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              i === activeIdx
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-accent'
            }`}
          >
            {e.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        {/* SVG cycle diagram */}
        <svg viewBox="0 0 320 230" className="w-full max-w-[320px] shrink-0">
          {/* Arrows */}
          {positions.map((from, i) => {
            const to = positions[(i + 1) % 3];
            return <CurvedArrow key={`${from.id}-${to.id}`} from={from} to={to} id={`${from.id}-${to.id}`} />;
          })}
          {/* Pulsing dots */}
          {positions.map((from, i) => {
            const to = positions[(i + 1) % 3];
            return <PulsingDot key={`dot-${from.id}`} from={from} to={to} delay={i * 1.2} />;
          })}
          {/* Nodes */}
          {positions.map((node) => (
            <g key={node.id}>
              <circle cx={node.x} cy={node.y} r={NODE_R} fill="currentColor" className="text-primary" opacity={0.15} />
              <circle cx={node.x} cy={node.y} r={NODE_R} fill="none" stroke="currentColor" className="text-primary" strokeWidth={2} />
              <text x={node.x} y={node.y} textAnchor="middle" dominantBaseline="central" fill="currentColor" className="text-foreground" fontSize={13} fontWeight={600}>
                {node.label}
              </text>
            </g>
          ))}
          {/* Center label */}
          <text x={CX} y={CY} textAnchor="middle" dominantBaseline="central" fill="currentColor" className="text-muted-foreground" fontSize={10}>
            Agent Loop
          </text>
        </svg>

        {/* Detail panel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIdx}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.25 }}
            className="flex-1 space-y-3 min-w-0"
          >
            <h4 className="text-base font-semibold text-foreground">{ex.label}</h4>
            {positions.map((node, i) => (
              <div key={node.id} className="rounded-md border border-border bg-muted/40 px-3 py-2">
                <div className="text-xs font-semibold text-primary uppercase tracking-wide">{node.label}</div>
                <div className="text-sm text-foreground mt-0.5">{descriptions[i]}</div>
              </div>
            ))}
            <div className="flex gap-4 text-xs text-muted-foreground mt-2">
              <span><strong className="text-foreground">Sensors:</strong> {ex.sensor}</span>
              <span><strong className="text-foreground">Actuators:</strong> {ex.actuator}</span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
