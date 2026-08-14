import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, StepForward, EyeOff, Eye } from 'lucide-react';

// Same ice-cream HMM parameters used across Topic 9
type StateId = 'HOT' | 'COLD';
const INITIAL: Record<StateId, number> = { HOT: 0.8, COLD: 0.2 };
const A: Record<StateId, Record<StateId, number>> = {
  HOT:  { HOT: 0.7, COLD: 0.3 },
  COLD: { HOT: 0.4, COLD: 0.6 },
};
const B: Record<StateId, number[]> = {
  HOT:  [0.2, 0.4, 0.4], // P(1|H), P(2|H), P(3|H)
  COLD: [0.5, 0.4, 0.1],
};

function sampleState(dist: Record<StateId, number>): StateId {
  const r = Math.random();
  let acc = 0;
  for (const k of ['HOT', 'COLD'] as const) {
    acc += dist[k];
    if (r < acc) return k;
  }
  return 'COLD';
}

function sampleObs(state: StateId): number {
  const r = Math.random();
  let acc = 0;
  for (let i = 0; i < 3; i++) {
    acc += B[state][i];
    if (r < acc) return i + 1;
  }
  return 3;
}

interface Step {
  state: StateId;
  obs: number;
}

const STATE_STYLE: Record<StateId, { bg: string; text: string; ring: string }> = {
  HOT:  { bg: '#fb923c', text: '#7c2d12', ring: '#ea580c' },
  COLD: { bg: '#60a5fa', text: '#1e3a8a', ring: '#2563eb' },
};

export default function HMMSamplerViz() {
  const [steps, setSteps] = useState<Step[]>([]);
  const [playing, setPlaying] = useState(false);
  const [revealStates, setRevealStates] = useState(false);
  const playingRef = useRef(playing);
  playingRef.current = playing;

  const addStep = () => {
    setSteps((prev) => {
      if (prev.length >= 20) {
        setPlaying(false);
        return prev;
      }
      const prevState = prev[prev.length - 1]?.state;
      const newState: StateId = prevState ? sampleState(A[prevState]) : sampleState(INITIAL);
      const obs = sampleObs(newState);
      return [...prev, { state: newState, obs }];
    });
  };

  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => {
      if (!playingRef.current) return;
      addStep();
    }, 650);
    return () => window.clearInterval(id);
  }, [playing]);

  const reset = () => {
    setPlaying(false);
    setSteps([]);
  };

  return (
    <div className="rounded-lg border border-border bg-card p-4 my-6 space-y-4">
      <div className="text-sm text-muted-foreground">
        Generate a sequence from the HMM. You <em>always</em> see the ice cream count — the weather can be
        hidden or revealed with the eye button, so you can feel the decoding problem for yourself.
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button size="sm" variant={playing ? 'secondary' : 'default'} onClick={() => setPlaying((p) => !p)}>
          {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
          {playing ? 'Pause' : 'Play'}
        </Button>
        <Button size="sm" variant="outline" onClick={addStep} disabled={steps.length >= 20}>
          <StepForward className="size-4" />
          Step
        </Button>
        <Button size="sm" variant="ghost" onClick={reset}>
          <RotateCcw className="size-4" />
          Reset
        </Button>
        <Button size="sm" variant="outline" onClick={() => setRevealStates((r) => !r)}>
          {revealStates ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          {revealStates ? 'Hide weather' : 'Reveal weather'}
        </Button>
      </div>

      {/* Two stacked tracks */}
      <div className="space-y-3">
        {/* Hidden states row */}
        <div>
          <div className="text-xs font-semibold text-muted-foreground mb-1">
            Hidden state (Q) {revealStates ? '' : '— hidden from you'}
          </div>
          <div className="flex flex-wrap gap-1.5 min-h-[36px] items-center">
            <AnimatePresence initial={false}>
              {steps.map((s, i) => {
                const style = STATE_STYLE[s.state];
                return (
                  <motion.div
                    key={i}
                    layout
                    initial={{ opacity: 0, scale: 0.6, y: -8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className="rounded-md px-2.5 py-1 text-[11px] font-bold tabular-nums"
                    style={
                      revealStates
                        ? { backgroundColor: style.bg, color: style.text, border: `2px solid ${style.ring}` }
                        : {
                            backgroundColor: 'var(--muted)',
                            color: 'var(--muted-foreground)',
                            border: '2px dashed var(--border)',
                          }
                    }
                  >
                    {revealStates ? s.state : '?'}
                  </motion.div>
                );
              })}
            </AnimatePresence>
            {steps.length === 0 && (
              <div className="text-xs text-muted-foreground italic">Press Play or Step to start sampling…</div>
            )}
          </div>
        </div>

        {/* Observations row */}
        <div>
          <div className="text-xs font-semibold text-muted-foreground mb-1">Observation (O) — ice creams eaten</div>
          <div className="flex flex-wrap gap-1.5 min-h-[36px] items-center">
            <AnimatePresence initial={false}>
              {steps.map((s, i) => (
                <motion.div
                  key={i}
                  layout
                  initial={{ opacity: 0, scale: 0.6, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: 0.1 }}
                  className="rounded-md px-3 py-1 text-[11px] font-bold tabular-nums bg-primary/10 text-primary border-2 border-primary/40"
                >
                  {s.obs}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="text-xs text-muted-foreground italic">
        Tip: try running a few sequences with the weather hidden and guess it yourself. Then reveal — how close
        were you? That is exactly the task of the Viterbi algorithm.
      </div>
    </div>
  );
}
