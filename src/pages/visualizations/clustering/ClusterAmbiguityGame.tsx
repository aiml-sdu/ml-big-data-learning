import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import CalloutBox from '@/components/CalloutBox';
import { AMBIGUOUS_POINTS } from '@/lib/clustering';
import { ChallengeChoice, ClusterStage, MiniFeedback, PointsLayer } from './ClusteringShared';

type ClusterCount = '2' | '4' | '6';

function assignmentsFor(count: ClusterCount) {
  if (count === '6') {
    return Object.fromEntries(AMBIGUOUS_POINTS.map((point, index) => [point.id, Math.floor(index / 4)]));
  }
  if (count === '4') {
    return Object.fromEntries(AMBIGUOUS_POINTS.map((point) => [point.id, point.x > 380 ? 2 + Number(point.y > 200) : Number(point.y > 200)]));
  }
  return Object.fromEntries(AMBIGUOUS_POINTS.map((point) => [point.id, point.x > 380 ? 1 : 0]));
}

export default function ClusterAmbiguityGame({ onComplete }: { onComplete: () => void }) {
  const [prediction, setPrediction] = useState<ClusterCount | null>(null);
  const [revealed, setRevealed] = useState(false);
  const overlay = useMemo(() => assignmentsFor(prediction ?? '4'), [prediction]);

  useEffect(() => {
    if (revealed) onComplete();
  }, [revealed, onComplete]);

  return (
    <div className="space-y-5">
      <p className="text-lg leading-8">
        Before an algorithm touches the data, make the human call: how many groups do you see?
      </p>
      <ClusterStage>
        <PointsLayer points={AMBIGUOUS_POINTS} assignments={revealed ? overlay : undefined} radius={7.5} />
        <text x={32} y={48} fill="var(--foreground)" fontSize={18} fontWeight={800}>
          Same points, multiple defensible stories
        </text>
      </ClusterStage>

      <div className="grid gap-3 md:grid-cols-3">
        <ChallengeChoice value="2" selected={prediction} title="2 clusters" detail="left system vs right system" onSelect={setPrediction} />
        <ChallengeChoice value="4" selected={prediction} title="4 clusters" detail="quadrants / coarse regions" onSelect={setPrediction} />
        <ChallengeChoice value="6" selected={prediction} title="6 clusters" detail="fine local pockets" onSelect={setPrediction} />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button size="sm" disabled={!prediction} onClick={() => setRevealed(true)}>
          Reveal that interpretation
        </Button>
        <Button size="sm" variant="outline" onClick={() => { setPrediction(null); setRevealed(false); }}>
          Try again
        </Button>
      </div>

      {revealed && (
        <MiniFeedback tone="neutral" title={`${prediction} clusters can be reasonable here`}>
          The point of clustering is not “find the one true answer.” The useful answer depends on the scale and decision you care about.
        </MiniFeedback>
      )}

      <CalloutBox type="key-idea" title="Definition to keep">
        <p>
          A good clustering keeps intra-cluster distances small and inter-cluster distances large. The hard part is deciding what “good” means for the task.
        </p>
      </CalloutBox>
    </div>
  );
}
