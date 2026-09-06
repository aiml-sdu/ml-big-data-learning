import type { CourseConfig } from './types';

/**
 * This is the first code file an instructor or agent should customize.
 * Keep course content in modules; keep course-wide identity here.
 */
export const COURSE: CourseConfig = {
  institution: 'University of Southern Denmark',
  code: 'ML / BIG DATA',
  title: 'Machine Learning and Big Data Analytics',
  shortTitle: 'ML & Big Data',
  term: 'Lectures 01–03',
  description:
    'Connect the ideas in your lectures to the decisions you make with data. Predict, experiment, and work through the labs at your own pace.',
  contact: 'Serkan Ayvaz · Maximilian von Zastrow',
  // Change this when creating a course. It keeps browser progress separate from other courses.
  storageNamespace: 'sdu-ml-big-data-2026',
  theme: {
    // This neutral starter must be replaced during onboarding with roles derived from representative material.
    primary: '#112d4e',
    accent: '#0067b9',
    light: {
      background: '#ffffff',
      surface: '#ffffff',
      surfaceSoft: '#edf3fa',
      surfaceMuted: '#e7eff8',
      text: '#1d2635',
      bodyCopy: '#505968',
      mutedText: '#596373',
      line: '#d2deeb',
      accentText: '#005aa3',
    },
    dark: {
      background: '#0c1321',
      surface: '#182238',
      surfaceSoft: '#111a2b',
      surfaceMuted: '#121c2e',
      text: '#eef2fb',
      bodyCopy: '#b7c0d1',
      mutedText: '#a8b2c5',
      line: '#2c3850',
      accentText: '#7bc3ff',
    },
    typography: {
      body: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      heading: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    },
    geometry: 'balanced',
    rationale: 'White teaching surfaces from Lecture 1 page 1 and blue concept emphasis from Lecture 3 page 35. System fonts and labelled plots keep technical material readable.',
    sourceRefs: [
      {
        label: 'Course visual direction',
        path: 'materials/course-info.md',
        locator: 'Course visual direction',
      },
    ],
  },
};
