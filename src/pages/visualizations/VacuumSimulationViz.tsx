import { useRef, useEffect, useState, useCallback } from 'react';
import {
  runSimulation,
  type VacuumState,
  type PerceptLog,
} from '../../lib/agents.ts';
import { setupCanvas } from '../../visualizations/canvas-utils.ts';
import { useContainerSize } from '../../hooks/useContainerSize.ts';
import AlgoControls from '../../components/AlgoControls.tsx';
import { drawVacuumWorld } from './VacuumWorldViz.tsx';

type AgentType = 'simple-reflex' | 'model-based' | 'goal-based' | 'utility-based';

const AGENT_OPTIONS: { value: AgentType; label: string }[] = [
  { value: 'simple-reflex', label: 'Simple Reflex' },
  { value: 'model-based', label: 'Model-Based' },
  { value: 'goal-based', label: 'Goal-Based' },
  { value: 'utility-based', label: 'Utility-Based' },
];

const INITIAL_STATE: VacuumState = { position: 'A', dirtA: true, dirtB: true };

export default function VacuumSimulationViz() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const logContainerRef = useRef<HTMLDivElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const cwRef = useRef(520);
  const chRef = useRef(220);
  const playIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { width: containerW } = useContainerSize(containerRef, { width: 520, height: 220 });

  const [agentType, setAgentType] = useState<AgentType>('simple-reflex');
  const [simLog, setSimLog] = useState<PerceptLog[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [displayedLog, setDisplayedLog] = useState<PerceptLog[]>([]);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  // Setup canvas on size change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || containerW <= 0) return;

    const cw = Math.min(containerW - 32, 520);
    const ch = 220;
    cwRef.current = cw;
    chRef.current = ch;
    ctxRef.current = setupCanvas(canvas, cw, ch);
  }, [containerW]);

  // Initialize / reset simulation when agentType changes
  useEffect(() => {
    clearPlayInterval();
    setPlaying(false);
    const log = runSimulation(agentType, { ...INITIAL_STATE }, 20);
    setSimLog(log);
    setCurrentStep(0);
    setDisplayedLog([]);
    if (ctxRef.current) {
      drawVacuumWorld(ctxRef.current, cwRef.current, chRef.current, INITIAL_STATE);
    }
  }, [agentType]);

  // Render current step on canvas whenever currentStep changes
  useEffect(() => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    if (currentStep === 0) {
      drawVacuumWorld(ctx, cwRef.current, chRef.current, INITIAL_STATE);
    } else {
      const entry = simLog[currentStep - 1];
      if (entry) {
        drawVacuumWorld(ctx, cwRef.current, chRef.current, entry.state);
      }
    }
  }, [currentStep, simLog]);

  // Auto-scroll log
  useEffect(() => {
    const el = logContainerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [displayedLog]);

  function clearPlayInterval() {
    if (playIntervalRef.current !== null) {
      clearInterval(playIntervalRef.current);
      playIntervalRef.current = null;
    }
  }

  const stepForward = useCallback(() => {
    setCurrentStep((prev) => {
      setSimLog((log) => {
        if (prev >= log.length) return log;
        const entry = log[prev];
        setDisplayedLog((dl) => [...dl, entry]);
        return log;
      });
      return prev + 1;
    });
  }, []);

  const stepForwardRef = useRef(stepForward);
  stepForwardRef.current = stepForward;

  const currentStepRef = useRef(currentStep);
  currentStepRef.current = currentStep;

  const simLogRef = useRef(simLog);
  simLogRef.current = simLog;

  const handlePlay = useCallback(() => {
    if (currentStepRef.current >= simLogRef.current.length) return;
    setPlaying(true);
    const ms = 800 / speed;
    playIntervalRef.current = setInterval(() => {
      if (currentStepRef.current >= simLogRef.current.length) {
        clearPlayInterval();
        setPlaying(false);
        return;
      }
      stepForwardRef.current();
    }, ms);
  }, [speed]);

  const handlePause = useCallback(() => {
    clearPlayInterval();
    setPlaying(false);
  }, []);

  const handleStep = useCallback(() => {
    if (currentStep >= simLog.length) return;
    stepForward();
  }, [currentStep, simLog.length, stepForward]);

  const handleStepBack = useCallback(() => {
    if (currentStep <= 0) return;
    const newStep = currentStep - 1;
    setCurrentStep(newStep);
    setDisplayedLog(simLog.slice(0, newStep));
  }, [currentStep, simLog]);

  const handleReset = useCallback(() => {
    clearPlayInterval();
    setPlaying(false);
    const log = runSimulation(agentType, { ...INITIAL_STATE }, 20);
    setSimLog(log);
    setCurrentStep(0);
    setDisplayedLog([]);
  }, [agentType]);

  const handleSpeedChange = useCallback((s: number) => {
    setSpeed(s);
    if (playIntervalRef.current !== null) {
      clearPlayInterval();
      const ms = 800 / s;
      playIntervalRef.current = setInterval(() => {
        if (currentStepRef.current >= simLogRef.current.length) {
          clearPlayInterval();
          setPlaying(false);
          return;
        }
        stepForwardRef.current();
      }, ms);
    }
  }, []);

  // Stop playing when we reach the end
  useEffect(() => {
    if (currentStep >= simLog.length && simLog.length > 0 && playing) {
      clearPlayInterval();
      setPlaying(false);
    }
  }, [currentStep, simLog.length, playing]);

  const canStepForward = currentStep < simLog.length;
  const canStepBack = currentStep > 0;

  return (
    <div className="rounded-lg border bg-card p-4 my-6 overflow-hidden" ref={containerRef}>
      <div className="controls-bar">
        <label style={{ fontSize: 14, fontWeight: 600, color: 'var(--foreground)' }}>
          Agent:
        </label>
        <select
          value={agentType}
          onChange={(e) => setAgentType(e.target.value as AgentType)}
          style={{
            padding: '4px 10px',
            fontSize: 14,
            background: 'var(--card)',
            color: 'var(--foreground)',
            border: '1px solid var(--border)',
            borderRadius: 6,
          }}
        >
          {AGENT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <canvas ref={canvasRef} style={{ marginTop: 8 }} />

      <AlgoControls
        playing={playing}
        canStepForward={canStepForward}
        canStepBack={canStepBack}
        speed={speed}
        onPlay={handlePlay}
        onPause={handlePause}
        onStep={handleStep}
        onStepBack={handleStepBack}
        onReset={handleReset}
        onSpeedChange={handleSpeedChange}
      />

      <div
        ref={logContainerRef}
        style={{
          maxHeight: 200,
          overflowY: 'auto',
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: 13,
          lineHeight: 1.6,
          padding: '8px 0',
          color: 'var(--foreground)',
        }}
      >
        {displayedLog.map((entry) => {
          const perceptStr = entry.percept.dirty ? 'Dirty' : 'Clean';
          return (
            <div
              key={entry.step}
              style={{
                padding: '4px 8px',
                borderBottom: '1px solid var(--border, #e5e7eb)',
              }}
            >
              <strong>Step {entry.step}</strong>:
              {' '}Percept=[{entry.percept.location}, {perceptStr}]
              {' '}&rarr;{' '}
              <span style={{ color: 'var(--primary)', fontWeight: 600 }}>
                {entry.action}
              </span>
              {' '}| Score: {entry.score}
              <br />
              <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>
                {entry.reasoning}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
