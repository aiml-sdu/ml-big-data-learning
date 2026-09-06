import type { PropsWithChildren } from 'react';
import { ArrowLeft, ArrowRight, Check, Clock3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useModuleSequence } from '@/course/ModuleSequenceContext';
import { useCourseProgress } from '@/hooks/useCourseProgress';
import type { LearningModule } from '@/course/types';

interface LearningModuleLayoutProps extends PropsWithChildren {
  module: LearningModule;
  manualCompletion?: boolean;
}

export function LearningModuleLayout({ module, children, manualCompletion = true }: LearningModuleLayoutProps) {
  const { isCompleted, setCompleted } = useCourseProgress();
  const { previous, next } = useModuleSequence();
  const complete = isCompleted(module.slug);
  const moduleLabel = module.kind === 'practice' ? 'Practice' : 'Lecture';

  return (
    <article className="module-page">
      <header className="module-hero">
        <div className="module-number">{moduleLabel} {String(module.number).padStart(2, '0')}</div>
        <h1>{module.title}</h1>
        <p className="module-summary">{module.summary}</p>
        <div className="module-meta">
          <span><Clock3 size={16} /> {module.estimatedMinutes} min</span>
        </div>
      </header>

      <details className="objective-card"><summary>What you will learn</summary>
        <p className="eyebrow">Learning objectives</p>
        <h2 id="objectives-title">After this module, you can…</h2>
        <ul>
          {module.objectives.map((objective) => <li key={objective}><Check size={17} /> <span>{objective}</span></li>)}
        </ul>
      </details>

      <div className="lesson-content">{children}</div>

      <footer className="module-footer">
        <div>
          <p className="eyebrow">Your progress</p>
          <h2>{complete ? 'Lecture completed' : manualCompletion ? 'Ready to mark this complete?' : 'Finish all challenge rounds to complete this lecture'}</h2>
        </div>
        <button
          className={`button ${complete ? 'button-complete' : 'button-primary'}`}
          disabled={!complete && !manualCompletion}
          onClick={() => {
            if (complete || manualCompletion) setCompleted(module.slug, !complete);
          }}
        >
          <Check size={17} /> {complete ? 'Completed, undo' : manualCompletion ? 'Mark as complete' : 'Complete the challenge rounds'}
        </button>
      </footer>

      <nav className="module-sequence" aria-label="Lecture sequence">
        <Link
          className="sequence-link sequence-previous"
          to={previous ? `/lectures/${previous.slug}` : '/'}
        >
          <ArrowLeft size={18} aria-hidden="true" />
          <span>
            <small>{previous ? 'Previous lecture' : 'Course overview'}</small>
            <strong>{previous?.title ?? 'Back to the course map'}</strong>
          </span>
        </Link>

        <span className="sequence-position" aria-label={`Current lecture ${module.number}`}>
          {String(module.number).padStart(2, '0')}
        </span>

        <Link
          className="sequence-link sequence-next"
          to={next ? `/lectures/${next.slug}` : '/'}
        >
          <span>
            <small>{next ? 'Next lecture' : 'Course complete'}</small>
            <strong>{next?.title ?? 'Review the course map'}</strong>
          </span>
          <ArrowRight size={18} aria-hidden="true" />
        </Link>
      </nav>
    </article>
  );
}
