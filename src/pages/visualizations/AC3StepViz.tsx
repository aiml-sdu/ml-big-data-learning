import { useEffect, useMemo, useRef, useState } from 'react';
import AlgoControls from '@/components/AlgoControls';
import { cn } from '@/lib/utils';
import {
  collectAC3Steps,
  createAustraliaMapCSP,
  type AC3Arc,
  type AustraliaColor,
  type AustraliaVariable,
  type DomainMap,
} from '@/lib/csp';
import { AustraliaConstraintGraph } from './CSPShared';

function initialDomains(): DomainMap<AustraliaColor> {
  return {
    WA: ['red'],
    NT: ['green'],
    SA: ['red', 'green', 'blue'],
    Q: ['red', 'green', 'blue'],
    NSW: ['red', 'green', 'blue'],
    V: ['red', 'green', 'blue'],
    T: ['red', 'green', 'blue'],
  };
}

const INITIAL_QUEUE: AC3Arc[] = [
  { from: 'SA', to: 'WA' },
  { from: 'SA', to: 'NT' },
  { from: 'Q', to: 'NT' },
];

export default function AC3StepViz() {
  const problem = useMemo(() => createAustraliaMapCSP(), []);
  const { steps } = useMemo(
    () => collectAC3Steps(problem, initialDomains(), INITIAL_QUEUE),
    [problem],
  );

  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!playing) {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
      return;
    }

    timerRef.current = setInterval(() => {
      setIndex((prev) => {
        if (prev >= steps.length - 1) {
          setPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, Math.max(200, 850 / speed));

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [playing, speed, steps.length]);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: 'smooth' });
  }, [index]);

  const step = steps[index];
  const activeRegion = (step.arc?.from ?? 'SA') as AustraliaVariable;
  const assignment = Object.fromEntries(
    Object.entries(step.domains).flatMap(([variable, values]) => values.length === 1 ? [[variable, values[0]]] : []),
  ) as Partial<Record<AustraliaVariable, AustraliaColor>>;

  return (
    <div className="my-6 rounded-xl border bg-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold">AC-3 propagation trace</h3>
          <p className="text-sm text-muted-foreground">
            Start with two fixed regions, then watch arc consistency prune the remaining domains.
          </p>
        </div>
        <div className="rounded-full border px-3 py-1 text-xs font-medium">
          Step {index + 1} / {steps.length}
        </div>
      </div>

      <AlgoControls
        playing={playing}
        canStepBack={index > 0}
        canStepForward={index < steps.length - 1}
        speed={speed}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onStep={() => setIndex((prev) => Math.min(prev + 1, steps.length - 1))}
        onStepBack={() => setIndex((prev) => Math.max(prev - 1, 0))}
        onReset={() => {
          setPlaying(false);
          setIndex(0);
        }}
        onSpeedChange={setSpeed}
      />

      <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <AustraliaConstraintGraph
          assignment={assignment}
          problem={problem}
          domains={step.domains}
          activeRegion={activeRegion}
          highlightedEdge={step.arc ?? undefined}
        />

        <div className="space-y-3">
          <div className="rounded-xl border bg-muted/30 p-4 text-sm">
            <div className="flex items-center justify-between">
              <div className="font-semibold">Action log</div>
              <span className="text-xs text-muted-foreground">
                Revisions: {step.revisions} | Checks: {step.checks}
              </span>
            </div>
            <div ref={logRef} className="mt-2 max-h-36 overflow-y-auto space-y-0.5">
              {index === 0 ? (
                <p className="text-xs text-muted-foreground py-1">Step forward to build the log.</p>
              ) : steps.slice(1, index + 1).map((s, i) => {
                const stepIdx = i + 1;
                const isCurrent = stepIdx === index;
                return (
                  <div key={stepIdx} className={cn(
                    'flex items-baseline gap-2 text-xs rounded px-1.5 py-0.5',
                    isCurrent ? 'bg-primary/10 text-foreground font-medium' : 'text-muted-foreground',
                  )}>
                    <span className="w-4 text-right shrink-0 font-mono text-[10px]">{stepIdx}</span>
                    {s.arc && <span className="font-mono shrink-0">{s.arc.from}→{s.arc.to}</span>}
                    {s.pruned ? (
                      <span className="text-red-500 dark:text-red-400">
                        −{s.pruned.removed.join(', ')} from {s.pruned.variable}
                      </span>
                    ) : s.arc ? (
                      <span>no change</span>
                    ) : (
                      <span>{s.message}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl border bg-card p-4 text-sm">
            <div className="font-semibold">Queue</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {step.arc && (
                <span className="rounded-full bg-primary px-2 py-1 text-xs font-medium text-primary-foreground">
                  Processing: {step.arc.from} → {step.arc.to}
                </span>
              )}
              {step.queue.length > 0 ? step.queue.map((arc, arcIndex) => (
                <span key={`${arc.from}-${arc.to}-${arcIndex}`} className="rounded-full border px-2 py-1 text-xs">
                  {arc.from} → {arc.to}
                </span>
              )) : !step.arc && (
                <span className="text-muted-foreground">Queue empty</span>
              )}
            </div>
          </div>

          <div className="rounded-xl border bg-card p-4 text-sm">
            <div className="font-semibold">Domains</div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {(Object.entries(step.domains) as [AustraliaVariable, AustraliaColor[]][])
                .map(([variable, values]) => {
                  const wasPruned = step.pruned?.variable === variable;
                  return (
                    <div key={variable} className={cn('rounded-lg border bg-muted/20 px-3 py-2', wasPruned && 'border-red-500/30')}>
                      <div className="font-semibold text-xs mb-1">{variable}</div>
                      <div className="flex flex-wrap gap-1">
                        {values.length === 0 ? (
                          <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-xs font-bold text-red-600 dark:text-red-300">∅</span>
                        ) : values.map((v) => (
                          <span key={v} className="rounded-full bg-muted px-1.5 py-0.5 text-[11px]">{v}</span>
                        ))}
                        {wasPruned && step.pruned!.removed.map((v) => (
                          <span key={v} className="rounded-full bg-red-500/15 border border-red-500/30 px-1.5 py-0.5 text-[11px] text-red-500 line-through decoration-2">{v}</span>
                        ))}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
