import { useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CalloutBox from '@/components/CalloutBox';
import {
  assignPoints,
  BAD_CENTROIDS,
  CLUSTER_COLORS,
  GOOD_CENTROIDS,
  KMEANS_POINTS,
  kmeansLoss,
  moveCentroids,
  type Centroid,
} from '@/lib/clustering';
import { CentroidsLayer, MetricPill, MiniFeedback, PointsLayer, VIEW_H, VIEW_W } from './ClusteringShared';

type Phase = 'place' | 'assigned' | 'moved';

export default function KMeansClusterGame({ onComplete }: { onComplete: () => void }) {
  const [centroids, setCentroids] = useState<Centroid[]>(BAD_CENTROIDS);
  const [assignments, setAssignments] = useState<Record<string, number>>({});
  const [phase, setPhase] = useState<Phase>('place');
  const [iterations, setIterations] = useState(0);
  const [dragging, setDragging] = useState<string | null>(null);
  const completedRef = useRef(false);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const loss = useMemo(() => Math.round(kmeansLoss(KMEANS_POINTS, centroids)), [centroids]);
  const assigned = Object.keys(assignments).length > 0;
  const stageTitle = phase === 'moved' ? 'After one update' : phase === 'assigned' ? 'Nearest-centroid assignment' : 'Crowded start';
  const stageDetail = phase === 'moved'
    ? 'The left blob kept two centroids, while the other visible groups must share the last one.'
    : phase === 'assigned'
      ? 'Dashed lines reveal which centroid each point chooses before the centroids move.'
      : 'All three seeds begin near one blob, so the first assignments will be biased.';

  const completeOnce = () => {
    if (!completedRef.current) {
      completedRef.current = true;
      onComplete();
    }
  };

  const assign = () => {
    setAssignments(assignPoints(KMEANS_POINTS, centroids));
    setPhase('assigned');
    completeOnce();
  };

  const update = () => {
    const nextAssignments = assigned ? assignments : assignPoints(KMEANS_POINTS, centroids);
    setCentroids(moveCentroids(KMEANS_POINTS, centroids, nextAssignments));
    setAssignments({});
    setPhase('moved');
    setIterations((value) => value + 1);
    completeOnce();
  };

  const reset = (kind: 'bad' | 'good') => {
    setCentroids(kind === 'bad' ? BAD_CENTROIDS : GOOD_CENTROIDS);
    setAssignments({});
    setIterations(0);
    setPhase('place');
  };

  const pointerPosition = (event: React.PointerEvent<SVGSVGElement>) => {
    if (!svgRef.current) return null;
    const rect = svgRef.current.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * VIEW_W,
      y: ((event.clientY - rect.top) / rect.height) * VIEW_H,
    };
  };

  const onPointerMove = (event: React.PointerEvent<SVGSVGElement>) => {
    if (!dragging) return;
    const point = pointerPosition(event);
    if (!point) return;
    setCentroids((current) => current.map((centroid) => centroid.id === dragging ? { ...centroid, ...point } : centroid));
    setAssignments({});
    setPhase('place');
  };

  return (
    <div className="space-y-5">
      <p className="text-lg leading-8">
        Play the two moves K-means repeats: assign each point to its nearest centroid, then move each centroid to the mean.
      </p>

      <div className="grid gap-3 md:grid-cols-3">
        <MetricPill label="Objective" value={loss.toLocaleString()} />
        <MetricPill label="Iterations" value={String(iterations)} />
        <MetricPill label="State" value={phase === 'assigned' ? 'assigned' : phase === 'moved' ? 'updated' : 'place'} />
      </div>

      <div className="not-prose overflow-hidden rounded-lg border bg-card shadow-sm">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          className="block w-full touch-none select-none"
          onPointerMove={onPointerMove}
          onPointerUp={() => setDragging(null)}
          onPointerCancel={() => setDragging(null)}
          onPointerLeave={() => setDragging(null)}
        >
          <rect width={VIEW_W} height={VIEW_H} fill="var(--muted)" opacity={0.11} />
          <g opacity={0.18}>
            {Array.from({ length: 7 }, (_, i) => (
              <line key={`v-${i}`} x1={60 + i * 86} y1={28} x2={60 + i * 86} y2={330} stroke="var(--border)" strokeWidth={1} />
            ))}
            {Array.from({ length: 4 }, (_, i) => (
              <line key={`h-${i}`} x1={34} y1={70 + i * 72} x2={606} y2={70 + i * 72} stroke="var(--border)" strokeWidth={1} />
            ))}
          </g>
          <circle cx={133} cy={135} r={84} fill={CLUSTER_COLORS[0]} opacity={0.055} stroke={CLUSTER_COLORS[0]} strokeWidth={2} strokeDasharray="8 8" />
          <circle cx={332} cy={138} r={82} fill={CLUSTER_COLORS[1]} opacity={0.045} stroke={phase === 'moved' ? CLUSTER_COLORS[1] : 'var(--border)'} strokeWidth={2} strokeDasharray="8 8" />
          <circle cx={514} cy={262} r={86} fill={CLUSTER_COLORS[2]} opacity={0.045} stroke={phase === 'moved' ? CLUSTER_COLORS[2] : 'var(--border)'} strokeWidth={2} strokeDasharray="8 8" />
          <text x={32} y={46} fill="var(--foreground)" fontSize={18} fontWeight={800}>
            {stageTitle}
          </text>
          <text x={32} y={70} fill="var(--muted-foreground)" fontSize={13}>
            {stageDetail}
          </text>
          {assigned && KMEANS_POINTS.map((point) => {
            const centroid = centroids[assignments[point.id]];
            return centroid ? (
              <motion.line
                key={`line-${point.id}`}
                x1={point.x}
                y1={point.y}
                x2={centroid.x}
                y2={centroid.y}
                stroke={CLUSTER_COLORS[assignments[point.id] % CLUSTER_COLORS.length]}
                strokeWidth={1.5}
                strokeDasharray="5 5"
                opacity={0.36}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
              />
            ) : null;
          })}
          <PointsLayer points={KMEANS_POINTS} assignments={assigned ? assignments : undefined} />
          <CentroidsLayer
            centroids={centroids}
            activeId={dragging}
            onPointerDown={(event, id) => {
              event.currentTarget.setPointerCapture(event.pointerId);
              setDragging(id);
            }}
          />
        </svg>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={assign}>1. Assign points</Button>
        <Button size="sm" variant="outline" onClick={update}>2. Move centroids</Button>
        <Button size="sm" variant="outline" onClick={() => reset('good')}>Use spread-out start</Button>
        <Button size="sm" variant="ghost" onClick={() => reset('bad')} className="gap-1.5">
          <RotateCcw className="size-4" />
          Reset
        </Button>
      </div>

      {phase === 'assigned' && (
        <MiniFeedback tone="neutral" title="Assignment step">
          Every point has chosen the closest centroid. The dashed lines make the distance comparison visible.
        </MiniFeedback>
      )}
      {phase === 'moved' && (
        <MiniFeedback tone="good" title="Update step">
          Each centroid moved to the mean of its assigned points. Repeat the loop until the movement stops.
        </MiniFeedback>
      )}
      <CalloutBox type="key-idea" title="What K-means optimizes">
        <p>
          K-means tries to reduce squared distance from points to their assigned centroids. The objective usually falls, but it can settle into a bad local optimum.
        </p>
      </CalloutBox>
    </div>
  );
}
