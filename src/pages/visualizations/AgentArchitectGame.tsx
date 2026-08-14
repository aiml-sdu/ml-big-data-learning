import { useState, useCallback, useMemo } from 'react';
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import { CSS, type Transform } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw, ChevronRight } from 'lucide-react';

type PEASZone = 'P' | 'E' | 'A' | 'S';
type AgentType = 'simple-reflex' | 'model-based' | 'goal-based' | 'utility-based' | 'learning';

interface Chip {
  id: string;
  label: string;
  zone: PEASZone | 'distractor';
}

interface Scenario {
  title: string;
  description: string;
  chips: Chip[];
  correctAgentType: AgentType;
  agentExplanation: string;
}

const SCENARIOS: Scenario[] = [
  {
    title: 'Self-Driving Taxi',
    description: 'Design an autonomous taxi that navigates city streets, picks up passengers, and delivers them safely to their destinations.',
    chips: [
      { id: 'sd-p1', label: 'Safe arrival', zone: 'P' },
      { id: 'sd-p2', label: 'Minimize travel time', zone: 'P' },
      { id: 'sd-p3', label: 'Obey traffic laws', zone: 'P' },
      { id: 'sd-e1', label: 'Roads & intersections', zone: 'E' },
      { id: 'sd-e2', label: 'Other vehicles', zone: 'E' },
      { id: 'sd-e3', label: 'Pedestrians', zone: 'E' },
      { id: 'sd-a1', label: 'Steering wheel', zone: 'A' },
      { id: 'sd-a2', label: 'Accelerator/brake', zone: 'A' },
      { id: 'sd-a3', label: 'Turn signals', zone: 'A' },
      { id: 'sd-s1', label: 'Cameras', zone: 'S' },
      { id: 'sd-s2', label: 'GPS', zone: 'S' },
      { id: 'sd-s3', label: 'Lidar', zone: 'S' },
      { id: 'sd-d1', label: 'Coffee maker', zone: 'distractor' },
      { id: 'sd-d2', label: 'Printer', zone: 'distractor' },
    ],
    correctAgentType: 'utility-based',
    agentExplanation: 'A self-driving taxi must balance multiple objectives (safety, speed, comfort, legality), making it a utility-based agent.',
  },
  {
    title: 'Medical Diagnosis System',
    description: 'Build an AI system that helps doctors diagnose diseases from patient symptoms, lab results, and medical images.',
    chips: [
      { id: 'md-p1', label: 'Diagnostic accuracy', zone: 'P' },
      { id: 'md-p2', label: 'Minimize false negatives', zone: 'P' },
      { id: 'md-e1', label: 'Patient data', zone: 'E' },
      { id: 'md-e2', label: 'Medical databases', zone: 'E' },
      { id: 'md-e3', label: 'Lab test results', zone: 'E' },
      { id: 'md-a1', label: 'Display diagnosis', zone: 'A' },
      { id: 'md-a2', label: 'Recommend tests', zone: 'A' },
      { id: 'md-a3', label: 'Flag urgent cases', zone: 'A' },
      { id: 'md-s1', label: 'Symptom inputs', zone: 'S' },
      { id: 'md-s2', label: 'Medical images (X-ray)', zone: 'S' },
      { id: 'md-s3', label: 'Lab reports', zone: 'S' },
      { id: 'md-d1', label: 'Steering wheel', zone: 'distractor' },
      { id: 'md-d2', label: 'Microphone', zone: 'distractor' },
    ],
    correctAgentType: 'learning',
    agentExplanation: 'A medical diagnosis system must learn from new cases and improve over time, making it a learning agent.',
  },
  {
    title: 'Stock Trading Bot',
    description: 'Create a bot that automatically buys and sells stocks to maximize profit while managing risk.',
    chips: [
      { id: 'st-p1', label: 'Maximize profit', zone: 'P' },
      { id: 'st-p2', label: 'Minimize risk/drawdown', zone: 'P' },
      { id: 'st-e1', label: 'Stock exchange', zone: 'E' },
      { id: 'st-e2', label: 'Market news', zone: 'E' },
      { id: 'st-e3', label: 'Other traders', zone: 'E' },
      { id: 'st-a1', label: 'Buy orders', zone: 'A' },
      { id: 'st-a2', label: 'Sell orders', zone: 'A' },
      { id: 'st-a3', label: 'Set limit prices', zone: 'A' },
      { id: 'st-s1', label: 'Price feeds', zone: 'S' },
      { id: 'st-s2', label: 'News API', zone: 'S' },
      { id: 'st-s3', label: 'Portfolio balance', zone: 'S' },
      { id: 'st-d1', label: 'Camera', zone: 'distractor' },
      { id: 'st-d2', label: 'Temperature sensor', zone: 'distractor' },
    ],
    correctAgentType: 'utility-based',
    agentExplanation: 'A trading bot must weigh profit against risk — a multi-objective optimization problem best modeled as a utility-based agent.',
  },
];

const ZONE_CONFIG: Record<PEASZone, { label: string; color: string; bgColor: string }> = {
  P: { label: 'Performance', color: '#3b82f6', bgColor: '#3b82f620' },
  E: { label: 'Environment', color: '#22c55e', bgColor: '#22c55e20' },
  A: { label: 'Actuators', color: '#f97316', bgColor: '#f9731620' },
  S: { label: 'Sensors', color: '#a855f7', bgColor: '#a855f720' },
};

const AGENT_TYPES: { id: AgentType; label: string }[] = [
  { id: 'simple-reflex', label: 'Simple Reflex' },
  { id: 'model-based', label: 'Model-Based Reflex' },
  { id: 'goal-based', label: 'Goal-Based' },
  { id: 'utility-based', label: 'Utility-Based' },
  { id: 'learning', label: 'Learning' },
];

// Draggable chip
function DragChip({ id, label, disabled }: { id: string; label: string; disabled?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id, disabled });
  const style: React.CSSProperties = {
    transform: transform ? CSS.Translate.toString(transform as Transform) : undefined,
    opacity: isDragging ? 0.3 : disabled ? 0 : 1,
    pointerEvents: disabled ? 'none' : undefined,
  };
  return (
    <span ref={setNodeRef} style={style}
      className="inline-flex cursor-grab items-center rounded-md border bg-secondary px-2.5 py-1 text-xs font-medium select-none touch-none hover:shadow-md active:cursor-grabbing transition-shadow"
      {...listeners} {...attributes}
    >
      {label}
    </span>
  );
}

// Drop zone
function DropZone({ zone, items, feedback }: {
  zone: PEASZone;
  items: { id: string; label: string }[];
  feedback: Record<string, 'correct' | 'wrong'> | null;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: zone });
  const config = ZONE_CONFIG[zone];
  return (
    <div ref={setNodeRef}
      className={`rounded-lg border-2 border-dashed p-3 min-h-[72px] transition-colors ${isOver ? 'border-primary bg-primary/10' : ''}`}
      style={{ borderColor: isOver ? undefined : config.color, backgroundColor: isOver ? undefined : config.bgColor }}
    >
      <div className="text-xs font-semibold mb-1.5" style={{ color: config.color }}>
        {config.label}
      </div>
      <div className="flex flex-wrap gap-1">
        {items.length === 0 && (
          <span className="text-xs text-muted-foreground/40 italic">drop chips here</span>
        )}
        {items.map((item) => (
          <span key={item.id}
            className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${
              feedback?.[item.id] === 'correct' ? 'border-green-500 bg-green-500/10' :
              feedback?.[item.id] === 'wrong' ? 'border-red-500 bg-red-500/10' :
              ''
            }`}
            style={{ borderColor: feedback?.[item.id] ? undefined : config.color }}
          >
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type Phase = 'peas' | 'agent-type' | 'complete';

export default function AgentArchitectGame() {
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [placements, setPlacements] = useState<Record<string, PEASZone>>({});
  const [feedback, setFeedback] = useState<Record<string, 'correct' | 'wrong'> | null>(null);
  const [phase, setPhase] = useState<Phase>('peas');
  const [selectedAgent, setSelectedAgent] = useState<AgentType | null>(null);
  const [agentFeedback, setAgentFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [, setCompletedScenarios] = useState(0);
  const [activeId, setActiveId] = useState<string | null>(null);

  const scenario = SCENARIOS[scenarioIdx];
  const shuffledChips = useMemo(() => shuffle(scenario.chips), [scenario]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
  );

  const handleDragStart = useCallback((e: DragStartEvent) => setActiveId(e.active.id as string), []);

  const handleDragEnd = useCallback((e: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = e;
    if (!over) return;
    const chipId = active.id as string;
    const zone = over.id as string;
    if (!['P', 'E', 'A', 'S'].includes(zone)) return;
    setFeedback(null);
    setPlacements((prev) => {
      const next = { ...prev };
      // Remove from previous zone
      for (const [id] of Object.entries(next)) {
        if (id === chipId) delete next[id];
      }
      next[chipId] = zone as PEASZone;
      return next;
    });
  }, []);

  const placedIds = useMemo(() => new Set(Object.keys(placements)), [placements]);
  const allPlaced = scenario.chips.every((c) => placedIds.has(c.id));

  const checkPEAS = useCallback(() => {
    const fb: Record<string, 'correct' | 'wrong'> = {};
    let allCorrect = true;
    for (const chip of scenario.chips) {
      if (chip.zone === 'distractor') {
        // Distractors placed in any zone are wrong
        if (placements[chip.id]) {
          fb[chip.id] = 'wrong';
          allCorrect = false;
        }
      } else {
        if (placements[chip.id] === chip.zone) {
          fb[chip.id] = 'correct';
        } else {
          fb[chip.id] = 'wrong';
          allCorrect = false;
        }
      }
    }
    setFeedback(fb);
    if (allCorrect) {
      setTimeout(() => setPhase('agent-type'), 800);
    }
  }, [scenario, placements]);

  const checkAgent = useCallback(() => {
    if (!selectedAgent) return;
    if (selectedAgent === scenario.correctAgentType) {
      setAgentFeedback('correct');
      setCompletedScenarios((c) => c + 1);
      confetti({ particleCount: 100, spread: 60, origin: { y: 0.6 } });
      setTimeout(() => setPhase('complete'), 1000);
    } else {
      setAgentFeedback('wrong');
    }
  }, [selectedAgent, scenario]);

  const nextScenario = useCallback(() => {
    const nextIdx = scenarioIdx + 1;
    if (nextIdx >= SCENARIOS.length) return;
    setScenarioIdx(nextIdx);
    setPlacements({});
    setFeedback(null);
    setPhase('peas');
    setSelectedAgent(null);
    setAgentFeedback(null);
  }, [scenarioIdx]);

  const resetGame = useCallback(() => {
    setScenarioIdx(0);
    setPlacements({});
    setFeedback(null);
    setPhase('peas');
    setSelectedAgent(null);
    setAgentFeedback(null);
    setCompletedScenarios(0);
  }, []);

  const zonedItems = (zone: PEASZone) =>
    scenario.chips
      .filter((c) => placements[c.id] === zone)
      .map((c) => ({ id: c.id, label: c.label }));

  const activeChip = shuffledChips.find((c) => c.id === activeId);
  const allDone = scenarioIdx >= SCENARIOS.length - 1 && phase === 'complete';

  return (
    <div className="not-prose my-6 rounded-lg border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">
          Agent Architect
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {scenarioIdx + 1}/{SCENARIOS.length}
          </span>
          <button onClick={resetGame}
            className="flex items-center gap-1 rounded-md border border-border px-2 py-1 text-sm text-muted-foreground hover:bg-accent transition-colors">
            <RotateCcw size={14} /> Reset
          </button>
        </div>
      </div>

      {/* Scenario card */}
      <div className="mb-4 rounded-lg border border-border bg-muted/30 p-4">
        <div className="text-sm font-semibold text-foreground mb-1">{scenario.title}</div>
        <p className="text-sm text-muted-foreground">{scenario.description}</p>
      </div>

      {phase === 'peas' && (
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          {/* PEAS grid */}
          <div className="grid grid-cols-1 gap-2 mb-3 sm:grid-cols-2">
            {(['P', 'E', 'A', 'S'] as const).map((zone) => (
              <DropZone key={zone} zone={zone} items={zonedItems(zone)} feedback={feedback} />
            ))}
          </div>

          {/* Chip bank */}
          <div className="mb-3">
            <p className="text-xs text-muted-foreground mb-1.5">Drag chips into the correct PEAS zone (some are distractors!):</p>
            <div className="flex flex-wrap gap-1.5">
              {shuffledChips.map((chip) => (
                <DragChip key={chip.id} id={chip.id} label={chip.label} disabled={placedIds.has(chip.id)} />
              ))}
            </div>
          </div>

          <DragOverlay>
            {activeChip ? (
              <span className="inline-flex cursor-grabbing items-center rounded-md border bg-secondary px-2.5 py-1 text-xs font-medium shadow-lg">
                {activeChip.label}
              </span>
            ) : null}
          </DragOverlay>

          <button onClick={checkPEAS} disabled={!allPlaced}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50">
            Check
          </button>
          {feedback && Object.values(feedback).some((v) => v === 'wrong') && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
              Some chips are in the wrong zone (or are distractors). Try again!
            </p>
          )}
        </DndContext>
      )}

      {phase === 'agent-type' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <p className="mb-3 text-sm text-foreground font-medium">
            PEAS correct! Now: what type of agent is this?
          </p>
          <div className="flex flex-wrap gap-2 mb-3">
            {AGENT_TYPES.map((at) => (
              <button key={at.id} onClick={() => { setSelectedAgent(at.id); setAgentFeedback(null); }}
                className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                  selectedAgent === at.id
                    ? agentFeedback === 'wrong'
                      ? 'border-red-500 bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300'
                      : agentFeedback === 'correct'
                        ? 'border-green-500 bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300'
                        : 'border-primary bg-primary/10 text-primary'
                    : 'border-border hover:bg-accent text-muted-foreground'
                }`}>
                {at.label}
              </button>
            ))}
          </div>
          <button onClick={checkAgent} disabled={!selectedAgent}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50">
            Check
          </button>
          {agentFeedback === 'wrong' && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
              Not quite. Think about what kind of decision-making this agent needs.
            </p>
          )}
        </motion.div>
      )}

      {phase === 'complete' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-md border border-green-300 bg-green-50 px-4 py-3 dark:border-green-800 dark:bg-green-950"
        >
          <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
            <Trophy size={18} />
            <span className="font-semibold">
              {allDone ? 'All scenarios complete!' : 'Scenario complete!'}
            </span>
          </div>
          <p className="mt-1 text-sm text-green-700 dark:text-green-300">
            {scenario.agentExplanation}
          </p>
          {!allDone && (
            <button onClick={nextScenario}
              className="mt-2 flex items-center gap-1 rounded-md border border-green-300 dark:border-green-700 px-3 py-1 text-sm text-green-800 dark:text-green-200 hover:bg-green-100 dark:hover:bg-green-900 transition-colors">
              Next scenario <ChevronRight size={14} />
            </button>
          )}
          {allDone && (
            <button onClick={resetGame}
              className="mt-2 rounded-md border border-green-300 dark:border-green-700 px-3 py-1 text-sm text-green-800 dark:text-green-200 hover:bg-green-100 dark:hover:bg-green-900 transition-colors">
              Play again
            </button>
          )}
        </motion.div>
      )}
    </div>
  );
}
