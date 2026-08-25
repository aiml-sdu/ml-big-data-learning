import DataArchitectureModule from './DataArchitectureModule';
import DataPreparationModule from './DataPreparationModule';
import FeatureSpaceModule from './FeatureSpaceModule';
import LearningSignalModule from './LearningSignalModule';
import LectureOnePracticeModule from './LectureOnePracticeModule';
import LectureTwoPracticeModule from './LectureTwoPracticeModule';
import type { LearningModule } from '../types';

export const COURSE_MODULES: LearningModule[] = [
  {
    slug: 'choose-learning-signal',
    number: 1,
    title: 'Choose the learning signal',
    summary: 'Look past the application and identify whether labels, structure, or rewards are teaching the model.',
    estimatedMinutes: 14,
    objectives: [
      'classify a task from the signal available during learning',
      'distinguish regression from classification and recognise multivariate outputs',
      'explain why an application domain does not determine the learning paradigm',
    ],
    sourceRefs: [
      {
        label: 'Learning paradigms and output types',
        path: 'materials/slides/Lecture1-Introduction to Big Data Analytics.pptx',
        locator: 'slides 7-44',
      },
    ],
    status: 'draft',
    Component: LearningSignalModule,
  },
  {
    slug: 'data-changes-architecture',
    number: 2,
    title: 'When data changes the architecture',
    summary: 'Change the workload pressure, then match transactions, analytical scans, batch work, and streams to the decision.',
    estimatedMinutes: 17,
    objectives: [
      'diagnose volume, velocity, and variety as different pressures',
      'match OLTP, OLAP, distributed batch, and streaming workloads',
      'separate the requested computation from runtime coordination',
    ],
    sourceRefs: [
      {
        label: 'Big data pressures, workloads, and architectures',
        path: 'materials/slides/Lecture1-Introduction to Big Data Analytics.pptx',
        locator: 'slides 45-92',
      },
    ],
    status: 'draft',
    Component: DataArchitectureModule,
  },
  {
    slug: 'lecture-one-field-check',
    number: 3,
    kind: 'practice',
    title: 'Lecture 1 field check',
    summary: 'Retrieve the rules, then use the learning signal or decision deadline on a fresh case.',
    estimatedMinutes: 11,
    objectives: [
      'retrieve the core learning-signal and workload distinctions',
      'apply the decisive signal or latency constraint to a new case',
    ],
    sourceRefs: [
      {
        label: 'Lecture 1 formative practice boundary',
        path: 'materials/slides/Lecture1-Introduction to Big Data Analytics.pptx',
        locator: 'slides 7-92',
      },
    ],
    status: 'draft',
    Component: LectureOnePracticeModule,
  },
  {
    slug: 'diagnose-before-transform',
    number: 4,
    title: 'Diagnose before you transform',
    summary: 'Separate missing, invalid, inconsistent, and redundant data before comparing normalization choices.',
    estimatedMinutes: 18,
    objectives: [
      'diagnose common data-quality failures',
      'choose a remedy from the cause rather than a fixed recipe',
      'calculate and interpret min-max and z-score normalization',
    ],
    sourceRefs: [
      {
        label: 'Data exploration, cleaning, integration, and transformation',
        path: 'materials/slides/Lecture2-Data Preprocessing and Feature Engineering.pptx',
        locator: 'slides 3-30',
      },
    ],
    status: 'draft',
    Component: DataPreparationModule,
  },
  {
    slug: 'compress-feature-space',
    number: 5,
    title: 'Compress a feature space',
    summary: 'See sparsity grow, distinguish reduction families, and rotate a PCA projection to retain variance.',
    estimatedMinutes: 20,
    objectives: [
      'explain why feature spaces become sparse as dimensions grow',
      'distinguish selection, extraction, and numerosity reduction',
      'interpret PCA as a variance-preserving projection',
    ],
    sourceRefs: [
      {
        label: 'Dimensionality reduction and PCA',
        path: 'materials/slides/Lecture2-Data Preprocessing and Feature Engineering.pptx',
        locator: 'slides 31-66',
      },
    ],
    status: 'draft',
    Component: FeatureSpaceModule,
  },
  {
    slug: 'lecture-two-pipeline-check',
    number: 6,
    kind: 'practice',
    title: 'Lecture 2 pipeline check',
    summary: 'Choose the next preprocessing operation, then protect the meaning of variance before PCA.',
    estimatedMinutes: 12,
    objectives: [
      'choose a preprocessing operation from a failure or objective',
      'explain why validation and scale control precede PCA when units differ',
    ],
    sourceRefs: [
      {
        label: 'Lecture 2 formative practice boundary',
        path: 'materials/slides/Lecture2-Data Preprocessing and Feature Engineering.pptx',
        locator: 'slides 3-67',
      },
    ],
    status: 'draft',
    Component: LectureTwoPracticeModule,
  },
];
