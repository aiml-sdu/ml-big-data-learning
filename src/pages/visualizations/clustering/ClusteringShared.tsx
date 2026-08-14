import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { CLUSTER_COLORS, type Centroid, type Point } from '@/lib/clustering';

export const VIEW_W = 640;
export const VIEW_H = 360;

export function ClusterStage({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('not-prose overflow-hidden rounded-lg border bg-card shadow-sm', className)}>
      <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="block w-full touch-none select-none">
        <defs>
          <radialGradient id="cluster-stage-glow" cx="50%" cy="45%" r="70%">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.11" />
            <stop offset="100%" stopColor="var(--muted)" stopOpacity="0.05" />
          </radialGradient>
        </defs>
        <rect width={VIEW_W} height={VIEW_H} rx={8} fill="url(#cluster-stage-glow)" />
        <g opacity={0.22}>
          {Array.from({ length: 7 }, (_, i) => (
            <line key={`v-${i}`} x1={60 + i * 86} y1={28} x2={60 + i * 86} y2={330} stroke="var(--border)" strokeWidth={1} />
          ))}
          {Array.from({ length: 4 }, (_, i) => (
            <line key={`h-${i}`} x1={34} y1={70 + i * 72} x2={606} y2={70 + i * 72} stroke="var(--border)" strokeWidth={1} />
          ))}
        </g>
        {children}
      </svg>
    </div>
  );
}

export function PointsLayer({
  points,
  assignments,
  radius = 7,
  muted = false,
}: {
  points: Point[];
  assignments?: Record<string, number>;
  radius?: number;
  muted?: boolean;
}) {
  return (
    <>
      {points.map((point) => {
        const assignment = assignments?.[point.id];
        return (
          <circle
            key={point.id}
            cx={point.x}
            cy={point.y}
            r={radius}
            fill={assignment === undefined ? 'var(--foreground)' : CLUSTER_COLORS[assignment % CLUSTER_COLORS.length]}
            stroke="var(--background)"
            strokeWidth={2}
            opacity={muted ? 0.34 : 0.92}
          />
        );
      })}
    </>
  );
}

export function CentroidsLayer({
  centroids,
  activeId,
  onPointerDown,
}: {
  centroids: Centroid[];
  activeId?: string | null;
  onPointerDown?: (event: React.PointerEvent<SVGCircleElement>, id: string) => void;
}) {
  return (
    <>
      {centroids.map((centroid, index) => {
        const color = CLUSTER_COLORS[index % CLUSTER_COLORS.length];
        return (
          <g key={centroid.id}>
            <circle
              cx={centroid.x}
              cy={centroid.y}
              r={activeId === centroid.id ? 25 : 20}
              fill={color}
              opacity={0.18}
            />
            <circle
              cx={centroid.x}
              cy={centroid.y}
              r={11}
              fill={color}
              stroke="var(--background)"
              strokeWidth={3}
              className={onPointerDown ? 'cursor-grab' : undefined}
              onPointerDown={(event) => onPointerDown?.(event, centroid.id)}
            />
            <text x={centroid.x} y={centroid.y - 28} textAnchor="middle" fill="var(--foreground)" fontSize={12} fontWeight={700}>
              C{index + 1}
            </text>
          </g>
        );
      })}
    </>
  );
}

export function ChallengeChoice<T extends string>({
  value,
  selected,
  title,
  detail,
  onSelect,
  correct,
  submitted,
}: {
  value: T;
  selected: T | null;
  title: string;
  detail: string;
  onSelect: (value: T) => void;
  correct?: boolean;
  submitted?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => !submitted && onSelect(value)}
      className={cn(
        'not-prose rounded-lg border p-4 text-left transition-colors',
        selected === value && !submitted && 'border-primary bg-primary/10',
        submitted && correct && 'border-green-500 bg-green-500/10',
        submitted && selected === value && correct === false && 'border-red-500 bg-red-500/10',
        !submitted && selected !== value && 'hover:bg-muted/50',
      )}
    >
      <div className="text-sm font-semibold">{title}</div>
      <div className="mt-1 text-xs text-muted-foreground">{detail}</div>
    </button>
  );
}

export function MetricPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-card px-4 py-3">
      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-semibold tabular-nums">{value}</div>
    </div>
  );
}

export function MiniFeedback({
  tone,
  title,
  children,
}: {
  tone: 'good' | 'bad' | 'neutral';
  title: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'not-prose rounded-lg border p-4 text-sm',
        tone === 'good' && 'border-green-500/40 bg-green-500/10 text-green-800 dark:text-green-200',
        tone === 'bad' && 'border-red-500/40 bg-red-500/10 text-red-800 dark:text-red-200',
        tone === 'neutral' && 'border-primary/30 bg-primary/10',
      )}
    >
      <div className="font-semibold">{title}</div>
      <div className="mt-1 text-current/80">{children}</div>
    </motion.div>
  );
}
