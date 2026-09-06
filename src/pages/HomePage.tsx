import { ArrowRight, BookOpenCheck, FlaskConical, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CourseJourney } from '@/components/CourseJourney';
import { COURSE_MODULES } from '@/course/modules';
import { useCourseProgress } from '@/hooks/useCourseProgress';

export default function HomePage(){
  const {completedSlugs}=useCourseProgress();
  const completed=COURSE_MODULES.filter(l=>completedSlugs.includes(l.slug)).length;
  const next=COURSE_MODULES.find(l=>!completedSlugs.includes(l.slug))??COURSE_MODULES[0];
  return <div className="home-page">
    <section className="course-welcome">
      <div><p className="eyebrow">Machine Learning and Big Data Analytics</p><h1>Your learning journey</h1><p>Experiment with the ideas. Test your reasoning. Build confidence for the labs.</p></div>
      <Link className="button button-primary" to={`/lectures/${next.slug}`}>{completed===3?'Review a lecture':completed>0?'Continue learning':'Start lecture 1'}<ArrowRight size={18}/></Link>
    </section>
    <div className="journey-strip"><span><BookOpenCheck size={19}/><strong>3</strong> lectures</span><span><FlaskConical size={19}/><strong>9</strong> challenge rounds</span><span><Trophy size={19}/><strong>{completed} / 3</strong> lectures completed</span></div>
    <section className="module-catalog journey-section" id="lectures"><div className="section-heading"><div><p className="eyebrow">Choose your next challenge</p><h2>Follow the lecture path</h2></div><p>Explore freely. Each round ends with a fresh problem to solve.</p></div><CourseJourney modules={COURSE_MODULES} completedSlugs={completedSlugs}/></section>
    <div className="course-footnote"><strong>Learn at your own pace.</strong> Quizzes include explanations and retries. Your progress stays in this browser.</div>
  </div>;
}
