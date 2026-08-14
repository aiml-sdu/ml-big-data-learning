import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { BAD_CENTROIDS, CLUSTER_COLORS, GOOD_CENTROIDS, KMEANS_POINTS, runKMeans } from '@/lib/clustering';
import { ChallengeChoice, ClusterStage, MetricPill, MiniFeedback, PointsLayer } from './ClusteringShared';

type StartChoice = 'bad' | 'good';

export default function KMeansInitializationChallenge({ onComplete }: { onComplete: () => void }) {
  const [choice, setChoice] = useState<StartChoice>('bad');
  const [submitted, setSubmitted] = useState(false);
  const result = useMemo(() => runKMeans(KMEANS_POINTS, choice === 'good' ? GOOD_CENTROIDS : BAD_CENTROIDS), [choice]);
  const other = useMemo(() => runKMeans(KMEANS_POINTS, choice === 'good' ? BAD_CENTROIDS : GOOD_CENTROIDS), [choice]);
  const isCorrect = choice === 'good';

  useEffect(() => {
    if (submitted && isCorrect) onComplete();
  }, [isCorrect, onComplete, submitted]);

  const choose = (value: StartChoice) => {
    setChoice(value);
    setSubmitted(false);
  };

  return (
    <div className="space-y-5">
      <p className="text-lg leading-8">
        Same algorithm, same data, different starts. Predict which initialization will land in the better basin.
      </p>
      <ClusterStage>
        <PointsLayer points={KMEANS_POINTS} assignments={result.assignments} />
        {result.centroids.map((centroid, index) => (
          <circle key={centroid.id} cx={centroid.x} cy={centroid.y} r={11} fill={CLUSTER_COLORS[index]} stroke="var(--background)" strokeWidth={3} />
        ))}
        <text x={32} y={48} fill="var(--foreground)" fontSize={18} fontWeight={800}>
          {choice === 'good' ? 'Spread-out start' : 'Crowded start'}
        </text>
      </ClusterStage>

      <div className="grid gap-3 md:grid-cols-3">
        <MetricPill label="This run loss" value={Math.round(result.loss).toLocaleString()} />
        <MetricPill label="Other run loss" value={Math.round(other.loss).toLocaleString()} />
        <MetricPill label="Gap" value={Math.abs(Math.round(result.loss - other.loss)).toLocaleString()} />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <ChallengeChoice value="bad" selected={choice} title="Crowded start" detail="all centroids begin near one blob" onSelect={choose} submitted={submitted && isCorrect} correct={false} />
        <ChallengeChoice value="good" selected={choice} title="Spread-out start" detail="one seed near each visible blob" onSelect={choose} submitted={submitted && isCorrect} correct />
      </div>
      <Button size="sm" onClick={() => setSubmitted(true)} disabled={submitted}>Lock prediction</Button>
      {submitted && (
        <MiniFeedback tone={isCorrect ? 'good' : 'bad'} title={isCorrect ? 'Right: initialization matters' : 'This is the trap'}>
          Multiple runs and smarter initialization are practical fixes because K-means can converge to a local optimum.
        </MiniFeedback>
      )}
    </div>
  );
}
