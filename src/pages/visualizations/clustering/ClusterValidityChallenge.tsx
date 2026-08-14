import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { compactness, GOOD_CENTROIDS, horizontalBandAssignments, KMEANS_POINTS, minimumCenterSeparation, runKMeans } from '@/lib/clustering';
import { ChallengeChoice, ClusterStage, MetricPill, MiniFeedback, PointsLayer } from './ClusteringShared';

type Choice = 'a' | 'b';

export default function ClusterValidityChallenge({ onComplete }: { onComplete: () => void }) {
  const [choice, setChoice] = useState<Choice | null>(null);
  const [showScores, setShowScores] = useState(false);
  const good = useMemo(() => runKMeans(KMEANS_POINTS, GOOD_CENTROIDS).assignments, []);
  const bad = useMemo(() => horizontalBandAssignments(KMEANS_POINTS), []);
  const goodScore = useMemo(() => Math.round(compactness(KMEANS_POINTS, good)), [good]);
  const badScore = useMemo(() => Math.round(compactness(KMEANS_POINTS, bad)), [bad]);
  const goodSeparation = useMemo(() => Math.round(minimumCenterSeparation(KMEANS_POINTS, good)), [good]);
  const badSeparation = useMemo(() => Math.round(minimumCenterSeparation(KMEANS_POINTS, bad)), [bad]);

  useEffect(() => {
    if (choice && showScores) onComplete();
  }, [choice, onComplete, showScores]);

  return (
    <div className="space-y-5">
      <p className="text-lg leading-8">
        Cluster validity is the guardrail: before trusting clusters, compare whether they are compact, separated, and better than a forced pattern.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        <button
          type="button"
          onClick={() => setChoice('a')}
          className={`rounded-xl border p-3 text-left transition-colors ${choice === 'a' ? 'border-primary bg-primary/10' : 'hover:bg-muted/50'}`}
        >
          <ClusterStage>
            <PointsLayer points={KMEANS_POINTS} assignments={good} />
            <text x={32} y={48} fill="var(--foreground)" fontSize={18} fontWeight={800}>A</text>
          </ClusterStage>
          <div className="mt-3 px-1 text-sm font-semibold">Compact, separated blobs</div>
        </button>
        <button
          type="button"
          onClick={() => setChoice('b')}
          className={`rounded-xl border p-3 text-left transition-colors ${choice === 'b' ? 'border-primary bg-primary/10' : 'hover:bg-muted/50'}`}
        >
          <ClusterStage>
            <PointsLayer points={KMEANS_POINTS} assignments={bad} />
            <text x={32} y={48} fill="var(--foreground)" fontSize={18} fontWeight={800}>B</text>
          </ClusterStage>
          <div className="mt-3 px-1 text-sm font-semibold">Awkward cuts through groups</div>
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <ChallengeChoice value="a" selected={choice} title="Trust A" detail="clusters are tighter and more separated" onSelect={setChoice} />
        <ChallengeChoice value="b" selected={choice} title="Trust B" detail="clusters are imposed by rough thresholds" onSelect={setChoice} />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button size="sm" disabled={!choice} onClick={() => setShowScores(true)}>Reveal compactness scores</Button>
      </div>

      {showScores && (
        <>
          <div className="grid gap-3 md:grid-cols-2">
            <MetricPill label="A compactness" value={goodScore.toLocaleString()} />
            <MetricPill label="B compactness" value={badScore.toLocaleString()} />
            <MetricPill label="A separation" value={goodSeparation.toLocaleString()} />
            <MetricPill label="B separation" value={badSeparation.toLocaleString()} />
          </div>
          <MiniFeedback tone={choice === 'a' ? 'good' : 'bad'} title={choice === 'a' ? 'A is the defensible choice' : 'B has a weaker structure'}>
            Internal validity uses the data itself. Lower within-cluster spread and higher center separation are not the whole story, but here both match the visual structure.
          </MiniFeedback>
        </>
      )}
    </div>
  );
}
