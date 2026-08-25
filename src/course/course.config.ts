import type { CourseConfig } from './types';

export const COURSE: CourseConfig = {
  institution: 'University of Southern Denmark',
  code: 'ML-BDA',
  title: 'Machine Learning and Big Data Analytics',
  shortTitle: 'ML + Big Data',
  term: '2026',
  description:
    'Build intuition by making a prediction, watching the system respond, and testing the same rule on a fresh case.',
  storageNamespace: 'sdu-ml-big-data-2026',
  theme: {
    primary: '#172a3a',
    accent: '#1f6feb',
    light: {
      background: '#ffffff',
      surface: '#ffffff',
      surfaceSoft: '#edf1f3',
      surfaceMuted: '#e8ebed',
      text: '#101820',
      bodyCopy: '#43515d',
      mutedText: '#5c6974',
      line: '#d7dee3',
      accentText: '#1454b8',
    },
    dark: {
      background: '#0b141c',
      surface: '#15222d',
      surfaceSoft: '#101b24',
      surfaceMuted: '#121e28',
      text: '#f4f7f9',
      bodyCopy: '#bfccd5',
      mutedText: '#aab8c2',
      line: '#2b3c49',
      accentText: '#7eb0ff',
    },
    typography: {
      body: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      heading: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    },
    geometry: 'balanced',
    rationale:
      'Representative slides use strong dark type, generous white space, and simple blue quantitative marks. The platform adapts those cues into an accessible technical interface without reproducing slide layouts or assets.',
    sourceRefs: [
      {
        label: 'Lecture 1 visual direction',
        path: 'materials/slides/Lecture1-Introduction to Big Data Analytics.pptx',
        locator: 'slides 1 and 64',
      },
      {
        label: 'Lecture 2 visual direction',
        path: 'materials/slides/Lecture2-Data Preprocessing and Feature Engineering.pptx',
        locator: 'slides 14, 31, and 59',
      },
    ],
  },
};
