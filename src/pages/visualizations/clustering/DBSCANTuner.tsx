import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { classifyDBSCAN, CLUSTER_COLORS, DBSCAN_POINTS } from '@/lib/clustering';
import { ClusterStage, MetricPill, MiniFeedback } from './ClusteringShared';

export default function DBSCANTuner({ onComplete }: { onComplete: () => void }) {
  const [eps, setEps] = useState(48);
  const [minPts, setMinPts] = useState(4);
  const [showPath, setShowPath] = useState(false);
  const [touched, setTouched] = useState(false);
  const result = useMemo(() => classifyDBSCAN(DBSCAN_POINTS, eps, minPts), [eps, minPts]);
  const noise = DBSCAN_POINTS.length - result.core.size - result.border.size;

  useEffect(() => {
    if (touched) onComplete();
  }, [onComplete, touched]);

  const path = ['d1', 'd3', 'd5', 'd7', 'd9', 'd11', 'd13']
    .map((id) => DBSCAN_POINTS.find((point) => point.id === id))
    .filter(Boolean);

  return (
    <div className="space-y-5">
      <p className="text-lg leading-8">
        DBSCAN asks two questions: how wide is the neighborhood, and how many neighbors make it dense?
      </p>

      <ClusterStage>
        {DBSCAN_POINTS.map((point) => {
          const assignment = result.clusterMap[point.id];
          const isCore = result.core.has(point.id);
          const isBorder = result.border.has(point.id);
          const color = assignment === undefined ? 'var(--muted-foreground)' : CLUSTER_COLORS[assignment % CLUSTER_COLORS.length];
          return (
            <g key={point.id}>
              {isCore && <circle cx={point.x} cy={point.y} r={eps} fill={color} opacity={0.055} />}
              <circle
                cx={point.x}
                cy={point.y}
                r={isCore ? 8.5 : isBorder ? 6.5 : 5}
                fill={color}
                opacity={assignment === undefined ? 0.55 : 0.94}
                stroke={isBorder ? 'var(--foreground)' : 'var(--background)'}
                strokeWidth={isBorder ? 3 : 2}
              />
            </g>
          );
        })}
        {showPath && path.map((point, index) => {
          const next = path[index + 1];
          return point && next ? (
            <line key={point.id} x1={point.x} y1={point.y} x2={next.x} y2={next.y} stroke="var(--color-key-idea)" strokeWidth={5} strokeLinecap="round" opacity={0.72} />
          ) : null;
        })}
        <text x={32} y={48} fill="var(--foreground)" fontSize={18} fontWeight={800}>
          Core, border, noise
        </text>
      </ClusterStage>

      <div className="grid gap-3 md:grid-cols-4">
        <MetricPill label="Clusters" value={String(result.clusterCount)} />
        <MetricPill label="Core" value={String(result.core.size)} />
        <MetricPill label="Border" value={String(result.border.size)} />
        <MetricPill label="Noise" value={String(noise)} />
      </div>

      <div className="rounded-xl border bg-card p-4 space-y-4">
        <label className="block text-sm font-medium">
          Eps radius: {eps}
          <input
            type="range"
            min={26}
            max={76}
            value={eps}
            onChange={(event) => {
              setEps(Number(event.target.value));
              setTouched(true);
            }}
            className="mt-2 w-full"
          />
        </label>
        <label className="block text-sm font-medium">
          MinPts: {minPts}
          <input
            type="range"
            min={3}
            max={7}
            value={minPts}
            onChange={(event) => {
              setMinPts(Number(event.target.value));
              setTouched(true);
            }}
            className="mt-2 w-full"
          />
        </label>
      </div>

      <Button
        size="sm"
        variant={showPath ? 'default' : 'outline'}
        onClick={() => {
          setShowPath((value) => !value);
          setTouched(true);
        }}
      >
        Trace density-connected path
      </Button>

      <MiniFeedback tone="neutral" title="DBSCAN does not need K">
        It grows connected dense regions. Border points attach to nearby cores; isolated points remain noise.
      </MiniFeedback>
    </div>
  );
}
