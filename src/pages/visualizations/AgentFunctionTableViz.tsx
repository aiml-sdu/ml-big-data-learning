import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { M } from '../../components/Math.tsx';

type AgentMode = 'simple' | 'ideal';

interface Row {
  location: string;
  dirty: boolean;
  simpleAction: string;
  idealAction: string;
  idealNote: string;
}

const ROWS: Row[] = [
  { location: 'A', dirty: true, simpleAction: 'Suck', idealAction: 'Suck', idealNote: 'Dirt detected — clean it' },
  { location: 'A', dirty: false, simpleAction: 'Move Right', idealAction: 'Move Right (if B unseen)', idealNote: 'A is clean, check B' },
  { location: 'B', dirty: true, simpleAction: 'Suck', idealAction: 'Suck', idealNote: 'Dirt detected — clean it' },
  { location: 'B', dirty: false, simpleAction: 'Move Left', idealAction: 'Move Left (if A unseen)', idealNote: 'B is clean, check A' },
  { location: 'A', dirty: false, simpleAction: 'Move Right', idealAction: 'Stop (if B already clean)', idealNote: 'Both clean — no need to move' },
  { location: 'B', dirty: false, simpleAction: 'Move Left', idealAction: 'Stop (if A already clean)', idealNote: 'Both clean — no need to move' },
];

export default function AgentFunctionTableViz() {
  const [mode, setMode] = useState<AgentMode>('simple');
  const [activeRow, setActiveRow] = useState<number | null>(null);

  return (
    <div className="not-prose my-6 rounded-lg border border-border bg-card p-4">
      <h3 className="mb-1 text-lg font-semibold text-foreground">Agent Function Table</h3>
      <p className="mb-3 text-sm text-muted-foreground">
        The agent function is just a lookup table: percept <M>{'\\to'}</M> action. Click a row to see the mapping animated.
      </p>

      {/* Mode toggle */}
      <div className="mb-4 flex gap-1.5">
        {(['simple', 'ideal'] as const).map((m) => (
          <button
            key={m}
            onClick={() => { setMode(m); setActiveRow(null); }}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              mode === m
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-accent'
            }`}
          >
            {m === 'simple' ? 'Simple Reflex' : 'Ideal (with memory)'}
          </button>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        {/* Table */}
        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-2 text-xs font-semibold text-muted-foreground">Location</th>
                <th className="text-left py-2 px-2 text-xs font-semibold text-muted-foreground">Dirty?</th>
                <th className="text-left py-2 px-2 text-xs font-semibold text-muted-foreground">Action</th>
                {mode === 'ideal' && <th className="text-left py-2 px-2 text-xs font-semibold text-muted-foreground">Note</th>}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row, i) => {
                const isActive = activeRow === i;
                // In simple mode, skip the "history-dependent" rows (index 4,5) that only differ for ideal
                if (mode === 'simple' && i >= 4) return null;
                return (
                  <motion.tr
                    key={`${mode}-${i}`}
                    onClick={() => setActiveRow(isActive ? null : i)}
                    className={`cursor-pointer border-b border-border transition-colors ${
                      isActive ? 'bg-primary/10' : 'hover:bg-muted/50'
                    }`}
                    layout
                  >
                    <td className="py-2 px-2 font-mono font-semibold">{row.location}</td>
                    <td className="py-2 px-2">
                      <span className={`inline-block rounded px-1.5 py-0.5 text-xs font-medium ${
                        row.dirty ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      }`}>
                        {row.dirty ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="py-2 px-2 font-medium">
                      {mode === 'simple' ? row.simpleAction : row.idealAction}
                    </td>
                    {mode === 'ideal' && (
                      <td className="py-2 px-2 text-xs text-muted-foreground">{row.idealNote}</td>
                    )}
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Animation panel */}
        <AnimatePresence mode="wait">
          {activeRow !== null && (
            <motion.div
              key={`anim-${activeRow}-${mode}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="w-full lg:w-56 shrink-0"
            >
              <svg viewBox="0 0 200 120" className="w-full">
                {/* Percept box */}
                <rect x={10} y={10} width={60} height={40} rx={6} fill="currentColor" className="text-primary" opacity={0.15} stroke="currentColor" strokeWidth={1.5} />
                <text x={40} y={26} textAnchor="middle" fill="currentColor" className="text-foreground" fontSize={9} fontWeight={600}>Percept</text>
                <text x={40} y={40} textAnchor="middle" fill="currentColor" className="text-muted-foreground" fontSize={8}>
                  [{ROWS[activeRow].location}, {ROWS[activeRow].dirty ? 'Dirty' : 'Clean'}]
                </text>

                {/* Arrow */}
                <motion.line
                  x1={74} y1={30} x2={120} y2={30}
                  stroke="currentColor" className="text-muted-foreground" strokeWidth={1.5}
                  markerEnd="url(#aft-arrow)"
                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                />
                <defs>
                  <marker id="aft-arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                    <path d="M0,0 L8,3 L0,6" fill="currentColor" className="text-muted-foreground" />
                  </marker>
                </defs>

                {/* Agent function box */}
                <rect x={80} y={55} width={48} height={28} rx={6} fill="currentColor" className="text-muted" opacity={0.3} stroke="currentColor" strokeWidth={1} />
                <foreignObject x={80} y={59} width={48} height={22}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
                    <span style={{ fontSize: 7, lineHeight: 1 }}><M>{'f(\\mathcal{P}^*) \\to \\mathcal{A}'}</M></span>
                  </div>
                </foreignObject>
                <motion.line
                  x1={97} y1={34} x2={97} y2={53}
                  stroke="currentColor" className="text-border" strokeWidth={1} strokeDasharray="3,2"
                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                />

                {/* Action box */}
                <motion.g
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <rect x={124} y={10} width={66} height={40} rx={6} fill="#22c55e" opacity={0.15} stroke="#22c55e" strokeWidth={1.5} />
                  <text x={157} y={26} textAnchor="middle" fill="currentColor" className="text-foreground" fontSize={9} fontWeight={600}>Action</text>
                  <text x={157} y={40} textAnchor="middle" fill="currentColor" className="text-foreground" fontSize={8}>
                    {mode === 'simple' ? ROWS[activeRow].simpleAction : ROWS[activeRow].idealAction}
                  </text>
                </motion.g>
              </svg>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <p className="mt-3 text-xs text-muted-foreground italic">
        Every agent, no matter how complex, can be described as a (potentially enormous) table mapping percept histories to actions.
        {mode === 'ideal' && ' The ideal agent uses memory of past percepts to avoid unnecessary moves.'}
      </p>
    </div>
  );
}
