import type { LearningModule } from '../types';
import CourseLesson from './CourseLesson';
import { lessons } from './lessonContent';
export const lectureTopics: Record<string,string[]> = {
  'lecture-1': ['learning-paradigms','big-data-systems'],
  'lecture-2': ['clean-transform','pca','exploration-lab'],
  'lecture-3': ['kmeans','density-hierarchy','cluster-validation','clustering-lab'],
};
const titles = ['Learning & big data','Preprocessing & exploration','Clustering & validation'];
const summaries = [
  'Sort learning problems and choose an architecture. Two challenge rounds.',
  'Transform data, rotate a PCA projection, and explore distributions. Three challenge rounds.',
  'Move centroids, uncover dense regions, and judge your clusters. Four challenge rounds.',
];
export const COURSE_MODULES: LearningModule[] = Object.entries(lectureTopics).map(([slug,topics],index)=>({
  slug, number:index+1,title:titles[index],summary:summaries[index],
  estimatedMinutes:lessons.filter(l=>topics.includes(l.slug)).reduce((sum,l)=>sum+l.minutes,0),
  objectives:lessons.filter(l=>topics.includes(l.slug)).map(l=>l.objectives[0]),
  sourceRefs:lessons.filter(l=>topics.includes(l.slug)).flatMap(l=>l.sources),
  status:'ready', Component:CourseLesson,
}));
