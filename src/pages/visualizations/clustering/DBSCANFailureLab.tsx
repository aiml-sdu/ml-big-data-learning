import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChallengeChoice, MiniFeedback } from './ClusteringShared';

type Case = 'works' | 'fails';

function ShapeSketch({ mode }: { mode: Case }) {
  return (
    <svg viewBox="0 0 640 320" className="h-72 w-full rounded-xl border bg-muted/20">
      {mode === 'works' ? (
        <>
          {Array.from({ length: 14 }, (_, i) => <circle key={`a-${i}`} cx={95 + i * 22} cy={145 - Math.sin(i / 13 * Math.PI) * 58} r={7} fill="var(--chart-1)" />)}
          {Array.from({ length: 14 }, (_, i) => <circle key={`b-${i}`} cx={115 + i * 22} cy={177 + Math.sin(i / 13 * Math.PI) * 50} r={7} fill="var(--chart-2)" />)}
          <circle cx={545} cy={74} r={7} fill="var(--muted-foreground)" opacity={0.6} />
          <circle cx={512} cy={260} r={7} fill="var(--muted-foreground)" opacity={0.6} />
          <text x={34} y={44} fill="var(--foreground)" fontSize={18} fontWeight={800}>Non-round shapes plus noise</text>
        </>
      ) : (
        <>
          {Array.from({ length: 24 }, (_, i) => <circle key={`dense-${i}`} cx={98 + (i % 6) * 18} cy={86 + Math.floor(i / 6) * 20} r={7} fill="var(--chart-1)" />)}
          {Array.from({ length: 11 }, (_, i) => <circle key={`sparse-${i}`} cx={320 + (i % 4) * 56} cy={90 + Math.floor(i / 4) * 56} r={7} fill="var(--chart-2)" />)}
          <text x={34} y={44} fill="var(--foreground)" fontSize={18} fontWeight={800}>One Eps, two densities</text>
        </>
      )}
    </svg>
  );
}

export default function DBSCANFailureLab({ onComplete }: { onComplete: () => void }) {
  const [mode, setMode] = useState<Case>('works');
  const [picked, setPicked] = useState<Case | null>(null);
  const correct = picked === mode;

  useEffect(() => {
    if (correct) onComplete();
  }, [correct, onComplete]);

  return (
    <div className="space-y-5">
      <p className="text-lg leading-8">
        DBSCAN is excellent when “dense region” matches the structure. It is weak when one parameter setting cannot describe the whole dataset.
      </p>

      <div className="grid gap-3 md:grid-cols-2">
        <ChallengeChoice
          value="works"
          selected={mode}
          title="Case A"
          detail="curved dense regions and outliers"
          onSelect={(value) => {
            setMode(value);
            setPicked(null);
          }}
        />
        <ChallengeChoice
          value="fails"
          selected={mode}
          title="Case B"
          detail="different densities in different regions"
          onSelect={(value) => {
            setMode(value);
            setPicked(null);
          }}
        />
      </div>
      <ShapeSketch mode={mode} />
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant={picked === 'works' ? 'default' : 'outline'} onClick={() => setPicked('works')}>DBSCAN works well here</Button>
        <Button size="sm" variant={picked === 'fails' ? 'default' : 'outline'} onClick={() => setPicked('fails')}>DBSCAN is fragile here</Button>
      </div>
      {picked && (
        <MiniFeedback tone={correct ? 'good' : 'bad'} title={correct ? 'Good diagnosis' : 'Check the density assumption'}>
          Case A is a natural DBSCAN win. Case B is hard because a small Eps fragments the sparse group, while a large Eps over-merges the dense group.
        </MiniFeedback>
      )}
    </div>
  );
}
