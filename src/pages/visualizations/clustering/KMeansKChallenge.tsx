import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { CLUSTER_COLORS, KMEANS_POINTS, runKMeans, type Centroid } from '@/lib/clustering';
import { ChallengeChoice, ClusterStage, MetricPill, MiniFeedback, PointsLayer } from './ClusteringShared';

type KChoice = '2' | '3' | '5';

const STARTS: Record<KChoice, Centroid[]> = {
  '2': [
    { id: 'c1', x: 145, y: 140 },
    { id: 'c2', x: 510, y: 255 },
  ],
  '3': [
    { id: 'c1', x: 135, y: 130 },
    { id: 'c2', x: 335, y: 130 },
    { id: 'c3', x: 515, y: 260 },
  ],
  '5': [
    { id: 'c1', x: 115, y: 118 },
    { id: 'c2', x: 164, y: 170 },
    { id: 'c3', x: 327, y: 130 },
    { id: 'c4', x: 489, y: 236 },
    { id: 'c5', x: 542, y: 292 },
  ],
};

export default function KMeansKChallenge({ onComplete }: { onComplete: () => void }) {
  const [choice, setChoice] = useState<KChoice>('2');
  const [submitted, setSubmitted] = useState(false);
  const result = useMemo(() => runKMeans(KMEANS_POINTS, STARTS[choice]), [choice]);
  const isCorrect = choice === '3';

  useEffect(() => {
    if (submitted && isCorrect) onComplete();
  }, [isCorrect, onComplete, submitted]);

  const choose = (value: KChoice) => {
    setChoice(value);
    setSubmitted(false);
  };

  return (
    <div className="space-y-5">
      <p className="text-lg leading-8">
        K-means makes you choose K before it starts. Try each option, then commit to the clustering that explains the structure without over-splitting.
      </p>
      <ClusterStage>
        <PointsLayer points={KMEANS_POINTS} assignments={result.assignments} />
        {result.centroids.map((centroid, index) => (
          <circle key={centroid.id} cx={centroid.x} cy={centroid.y} r={11} fill={CLUSTER_COLORS[index]} stroke="var(--background)" strokeWidth={3} />
        ))}
        <text x={32} y={48} fill="var(--foreground)" fontSize={18} fontWeight={800}>
          K = {choice}
        </text>
      </ClusterStage>

      <div className="grid gap-3 md:grid-cols-3">
        <MetricPill label="Squared loss" value={Math.round(result.loss).toLocaleString()} />
        <MetricPill label="Clusters" value={choice} />
        <MetricPill label="Question" value="useful?" />
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <ChallengeChoice value="2" selected={choice} title="K = 2" detail="low detail, merges two blobs" onSelect={choose} submitted={submitted && isCorrect} correct={false} />
        <ChallengeChoice value="3" selected={choice} title="K = 3" detail="matches the three visible groups" onSelect={choose} submitted={submitted && isCorrect} correct />
        <ChallengeChoice value="5" selected={choice} title="K = 5" detail="lower loss but fragmented story" onSelect={choose} submitted={submitted && isCorrect} correct={false} />
      </div>

      <Button size="sm" onClick={() => setSubmitted(true)} disabled={submitted}>Commit answer</Button>
      {submitted && (
        <MiniFeedback tone={isCorrect ? 'good' : 'bad'} title={isCorrect ? 'K = 3 is the useful choice' : 'Loss alone can mislead'}>
          K = 5 reduces the objective by adding more centers, but it splits natural blobs. Choosing K is a modeling decision, not just a score-minimization trick.
        </MiniFeedback>
      )}
    </div>
  );
}
