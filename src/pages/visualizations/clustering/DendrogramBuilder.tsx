import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { HIERARCHICAL_POINTS } from '@/lib/clustering';
import { ClusterStage, MiniFeedback, PointsLayer } from './ClusteringShared';

const MERGE_STEPS = [
  { label: 'Start with six singletons', groups: [['A'], ['B'], ['C'], ['D'], ['E'], ['F']], merge: null },
  { label: 'A and B are closest', groups: [['A', 'B'], ['C'], ['D'], ['E'], ['F']], merge: 'A-B' },
  { label: 'C and D merge next', groups: [['A', 'B'], ['C', 'D'], ['E'], ['F']], merge: 'C-D' },
  { label: 'E and F become a cluster', groups: [['A', 'B'], ['C', 'D'], ['E', 'F']], merge: 'E-F' },
  { label: 'The two left branches merge', groups: [['A', 'B', 'C', 'D'], ['E', 'F']], merge: 'AB-CD' },
  { label: 'Finally, the two big branches merge', groups: [['A', 'B', 'C', 'D', 'E', 'F']], merge: 'ABCD-EF' },
] as const;

function assignmentsFor(step: number) {
  return Object.fromEntries(MERGE_STEPS[step].groups.flatMap((group, index) => group.map((id) => [id, index])));
}

function DendrogramPreview({ step }: { step: number }) {
  const visibleLineCount = [0, 3, 6, 9, 12, 15][step];
  const lines = [
    [80, 280, 80, 222], [142, 280, 142, 222], [80, 222, 142, 222],
    [250, 280, 250, 220], [312, 280, 312, 220], [250, 220, 312, 220],
    [452, 280, 452, 218], [514, 280, 514, 218], [452, 218, 514, 218],
    [111, 222, 111, 144], [281, 220, 281, 144], [111, 144, 281, 144],
    [196, 144, 196, 82], [483, 218, 483, 82], [196, 82, 483, 82],
  ];

  return (
    <svg viewBox="0 0 600 320" className="h-72 w-full rounded-xl border bg-muted/20">
      {lines.map(([x1, y1, x2, y2], index) => (
        <line
          key={index}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="var(--foreground)"
          strokeWidth={3}
          strokeLinecap="round"
          opacity={index < visibleLineCount ? 0.9 : 0.12}
          strokeDasharray={index < visibleLineCount ? undefined : '7 7'}
        />
      ))}
      <text x={42} y={42} fill="var(--foreground)" fontSize={16} fontWeight={800}>
        Dendrogram preview
      </text>
      {step === 0 && (
        <text x={42} y={68} fill="var(--muted-foreground)" fontSize={13}>
          Merges will darken as you build the tree.
        </text>
      )}
      {['A', 'B', 'C', 'D', 'E', 'F'].map((label, index) => (
        <text key={label} x={80 + index * 86} y={304} textAnchor="middle" fill="var(--foreground)" fontSize={16} fontWeight={700}>
          {label}
        </text>
      ))}
    </svg>
  );
}

export default function DendrogramBuilder({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const assignments = useMemo(() => assignmentsFor(step), [step]);
  const done = step === MERGE_STEPS.length - 1;
  const mergeOrder = ['A-B', 'C-D', 'E-F', 'AB-CD', 'ABCD-EF'];

  useEffect(() => {
    if (done) onComplete();
  }, [done, onComplete]);

  return (
    <div className="space-y-5">
      <p className="text-lg leading-8">
        Agglomerative clustering is a sequence of choices. At each step, merge the closest clusters and record that merge in the tree.
      </p>

      <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <ClusterStage>
          <PointsLayer points={HIERARCHICAL_POINTS} assignments={assignments} radius={10} />
          {HIERARCHICAL_POINTS.map((point) => (
            <text key={`${point.id}-label`} x={point.x} y={point.y - 20} textAnchor="middle" fill="var(--foreground)" fontSize={17} fontWeight={800}>
              {point.id}
            </text>
          ))}
          <text x={32} y={48} fill="var(--foreground)" fontSize={18} fontWeight={800}>
            {MERGE_STEPS[step].label}
          </text>
        </ClusterStage>
        <DendrogramPreview step={step} />
      </div>

      <div className="grid gap-2 sm:grid-cols-5">
        {mergeOrder.map((pair, index) => {
          const isMerged = step > index;
          const isNext = step === index && !done;
          return (
          <div
            key={pair}
            className={`rounded-lg border p-3 text-sm ${
              isNext
                ? 'border-primary bg-primary/10'
                : isMerged
                  ? 'border-green-500/40 bg-green-500/10'
                  : 'bg-card'
            }`}
          >
            <div className="font-semibold">{pair}</div>
            <div className="text-muted-foreground">
              {isNext ? 'next merge' : isMerged ? 'merged' : 'later'}
            </div>
          </div>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button size="sm" disabled={done} onClick={() => setStep((value) => Math.min(value + 1, MERGE_STEPS.length - 1))}>
          {done ? 'Tree complete' : 'Merge closest pair'}
        </Button>
        <Button size="sm" variant="outline" onClick={() => setStep(0)}>Reset tree</Button>
      </div>

      {done && (
        <MiniFeedback tone="good" title="You built the hierarchy">
          A dendrogram is not one clustering. It is a record of nested clusterings that you can cut at different heights.
        </MiniFeedback>
      )}
    </div>
  );
}

export function DendrogramCutChallenge({ onComplete }: { onComplete: () => void }) {
  const [height, setHeight] = useState(158);
  const [linkage, setLinkage] = useState<'single' | 'complete' | 'ward'>('ward');
  const [touched, setTouched] = useState(false);
  const clusters = height < 82 ? 1 : height < 144 ? 2 : height < 218 ? 3 : 6;

  useEffect(() => {
    if (touched) onComplete();
  }, [onComplete, touched]);

  return (
    <div className="space-y-5">
      <p className="text-lg leading-8">
        Now cut the tree. The cut height turns one merge history into a flat clustering.
      </p>

      <div className="grid gap-4 lg:grid-cols-[1fr_0.85fr]">
        <div className="rounded-xl border bg-card p-4">
          <svg viewBox="0 0 600 320" className="h-72 w-full rounded-xl bg-muted/20">
            <DendrogramTree />
            <line x1={44} y1={height} x2={560} y2={height} stroke="var(--color-warning)" strokeWidth={4} strokeDasharray="10 8" />
            <text x={370} y={height - 12} fill="var(--foreground)" fontSize={16} fontWeight={800}>
              cut gives {clusters} clusters
            </text>
          </svg>
          <input
            aria-label="Dendrogram cut height"
            type="range"
            min={70}
            max={235}
            value={height}
            onChange={(event) => {
              setHeight(Number(event.target.value));
              setTouched(true);
            }}
            className="mt-4 w-full"
          />
        </div>

        <div className="space-y-3">
          <div className="rounded-xl border bg-card p-4">
            <div className="text-sm font-semibold">Linkage rule</div>
            <div className="mt-3 grid gap-2">
              {[
                ['single', 'MIN / single', 'nearest pair; can chain'],
                ['complete', 'MAX / complete', 'farthest pair; tighter clusters'],
                ['ward', "Ward's method", 'least squared-error increase'],
              ].map(([id, title, detail]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setLinkage(id as 'single' | 'complete' | 'ward');
                    setTouched(true);
                  }}
                  className={`rounded-lg border p-3 text-left text-sm ${linkage === id ? 'border-primary bg-primary/10' : 'hover:bg-muted/50'}`}
                >
                  <div className="font-medium">{title}</div>
                  <div className="text-xs text-muted-foreground">{detail}</div>
                </button>
              ))}
            </div>
          </div>
          <MiniFeedback tone="neutral" title="The tree is a choice too">
            {linkage === 'ward'
              ? 'Ward is the hierarchical analogue of K-means and prefers compact globular clusters.'
              : 'Changing linkage changes what “closest clusters” means, so the merge history can change.'}
          </MiniFeedback>
        </div>
      </div>
    </div>
  );
}

function DendrogramTree() {
  const lines = [
    [80, 280, 80, 222], [142, 280, 142, 222], [80, 222, 142, 222],
    [250, 280, 250, 220], [312, 280, 312, 220], [250, 220, 312, 220],
    [452, 280, 452, 218], [514, 280, 514, 218], [452, 218, 514, 218],
    [111, 222, 111, 144], [281, 220, 281, 144], [111, 144, 281, 144],
    [196, 144, 196, 82], [483, 218, 483, 82], [196, 82, 483, 82],
  ];
  return (
    <>
      {lines.map(([x1, y1, x2, y2], index) => (
        <line key={index} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--foreground)" strokeWidth={3} strokeLinecap="round" />
      ))}
      {['A', 'B', 'C', 'D', 'E', 'F'].map((label, index) => (
        <text key={label} x={80 + index * 86} y={304} textAnchor="middle" fill="var(--foreground)" fontSize={16} fontWeight={700}>
          {label}
        </text>
      ))}
    </>
  );
}
