import { Check, Clock3 } from 'lucide-react';
import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import type { LearningModule } from '@/course/types';

interface CourseJourneyProps {
  modules: LearningModule[];
  completedSlugs: string[];
}

const ROW_HEIGHT = 210;
const NODE_SIZE = 68;
const MAP_PADDING = 24;

type JourneyPosition = 'center' | 'right' | 'left';

export function getJourneyPosition(index: number): JourneyPosition {
  const phase = index % 4;
  return phase === 1 ? 'right' : phase === 3 ? 'left' : 'center';
}

export function CourseJourney({ modules, completedSlugs }: CourseJourneyProps) {
  if (modules.length === 0) {
    return <p className="journey-empty">No modules are ready yet.</p>;
  }

  const points = modules.map((module, index) => ({
    module,
    position: getJourneyPosition(index),
    x: getJourneyPosition(index) === 'right' ? 100 : getJourneyPosition(index) === 'left' ? -100 : 0,
    y: MAP_PADDING + index * ROW_HEIGHT + NODE_SIZE / 2,
  }));
  const height = MAP_PADDING * 2 + (modules.length - 1) * ROW_HEIGHT + NODE_SIZE;

  return (
    <div
      className="journey-map"
      style={{ '--journey-height': `${height}px` } as CSSProperties}
    >
      <svg
        className="journey-paths"
        viewBox={`-180 0 360 ${height}`}
        preserveAspectRatio="xMidYMin meet"
        aria-hidden="true"
      >
        {points.slice(0, -1).map((point, index) => {
          const next = points[index + 1];
          const x1 = point.x;
          const x2 = next.x;
          const middleY = (point.y + next.y) / 2;
          const completed = completedSlugs.includes(point.module.slug);

          return (
            <path
              key={point.module.slug}
              className={completed ? 'journey-connector is-complete' : 'journey-connector'}
              d={`M ${x1} ${point.y} Q ${x1} ${middleY}, ${x2} ${next.y}`}
            />
          );
        })}
      </svg>

      <ol className="journey-stops">
        {points.map(({ module, position, y }, index) => {
          const complete = completedSlugs.includes(module.slug);
          const labelSide = index % 2 === 0 ? 'right' : 'left';
          const moduleLabel = module.kind === 'practice' ? 'Practice' : 'Module';

          return (
            <li
              className={`journey-stop position-${position} label-${labelSide}`}
              key={module.slug}
              style={{ top: y - NODE_SIZE / 2 }}
            >
              <Link className="journey-link" to={`/modules/${module.slug}`}>
                <span className={`journey-node ${complete ? 'is-complete' : ''}`}>
                  {complete ? <Check size={26} strokeWidth={3} /> : String(module.number).padStart(2, '0')}
                </span>
                <span className="journey-copy">
                  <small>{complete ? `${moduleLabel} completed` : `${moduleLabel} ${String(module.number).padStart(2, '0')}`}</small>
                  <strong>{module.title}</strong>
                  <span className="journey-summary">{module.summary}</span>
                  <span className="journey-time"><Clock3 size={13} /> {module.estimatedMinutes} min</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
