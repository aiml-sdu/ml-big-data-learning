import { ArrowRight, BookOpenCheck, Clock3, Layers3, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CourseJourney } from '@/components/CourseJourney';
import { COURSE } from '@/course/course.config';
import { COURSE_MODULES } from '@/course/modules';
import { useCourseProgress } from '@/hooks/useCourseProgress';

export default function HomePage() {
  const { completedSlugs } = useCourseProgress();
  const completed = COURSE_MODULES.filter((module) => completedSlugs.includes(module.slug)).length;
  const percentage = COURSE_MODULES.length === 0 ? 0 : Math.round((completed / COURSE_MODULES.length) * 100);

  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="hero-copy">
          <p className="eyebrow"><Sparkles size={16} /> Interactive course companion</p>
          <h1>Build intuition for<br /><em>machine learning and big data.</em></h1>
          <p className="hero-lead">{COURSE.description}</p>
          <div className="hero-actions">
            {COURSE_MODULES[0] && (
              <Link className="button button-primary" to={`/modules/${COURSE_MODULES[0].slug}`}>
                Start learning <ArrowRight size={16} />
              </Link>
            )}
            <a
              className="button button-secondary"
              href="#modules"
              onClick={(event) => {
                event.preventDefault();
                document.getElementById('modules')?.scrollIntoView();
              }}
            >
              Browse modules
            </a>
          </div>
        </div>
        <aside className="course-snapshot" aria-label="Course overview">
          <div className="snapshot-top"><span>{COURSE.code}</span><span>{COURSE.term}</span></div>
          <h2>{COURSE.title}</h2>
          <div className="snapshot-stats">
            <div><Layers3 size={20} /><strong>{COURSE_MODULES.length}</strong><span>module{COURSE_MODULES.length === 1 ? '' : 's'}</span></div>
            <div><Clock3 size={20} /><strong>{COURSE_MODULES.reduce((sum, item) => sum + item.estimatedMinutes, 0)}</strong><span>minutes</span></div>
            <div><BookOpenCheck size={20} /><strong>{completed}</strong><span>completed</span></div>
          </div>
          <div className="progress-label"><span>Your progress</span><strong>{percentage}%</strong></div>
          <div className="progress-track"><span style={{ width: `${percentage}%` }} /></div>
        </aside>
      </section>

      <section className="module-catalog journey-section" id="modules">
        <div className="section-heading">
          <div><p className="eyebrow">Your course journey</p><h2>Follow the path</h2></div>
          <p>Lectures 1 and 2 are rebuilt as short investigations: make a choice, inspect the result, and transfer the rule.</p>
        </div>
        <CourseJourney modules={COURSE_MODULES} completedSlugs={completedSlugs} />
      </section>
    </div>
  );
}
