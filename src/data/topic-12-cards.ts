import type { QuizQuestion } from '@/hooks/useQuizState';

export interface CardSection {
  id: string;
  label: string;
  cardRange: [number, number];
}

export const SECTIONS: CardSection[] = [
  { id: 'seeing', label: '12.1 Seeing Clusters', cardRange: [0, 2] },
  { id: 'kmeans', label: '12.2 K-Means', cardRange: [3, 6] },
  { id: 'hierarchical', label: '12.3 Hierarchical Clustering', cardRange: [7, 8] },
  { id: 'dbscan', label: '12.4 DBSCAN', cardRange: [9, 10] },
  { id: 'validity', label: '12.5 Validating Clusters', cardRange: [11, 12] },
];

export interface LessonCardDef {
  id: string;
  title: string;
  sectionId: string;
  component: string;
  autoComplete?: boolean;
  requiresCompletion?: boolean;
}

export const CARDS: LessonCardDef[] = [
  { id: 'cluster-ambiguity-lab', title: 'How Many Clusters Are There?', sectionId: 'seeing', component: 'ClusterAmbiguity', requiresCompletion: true },
  { id: 'clustering-family-lab', title: 'Pick the Right Clustering Mindset', sectionId: 'seeing', component: 'ClusteringFamilies', requiresCompletion: true },
  { id: 'quiz-seeing-clusters', title: 'Checkpoint: Seeing Structure', sectionId: 'seeing', component: 'QuizSeeing', requiresCompletion: true },

  { id: 'kmeans-loop-game', title: 'Be the K-Means Algorithm', sectionId: 'kmeans', component: 'KMeansLoop', requiresCompletion: true },
  { id: 'choose-k-challenge', title: 'Choose K Without Overthinking It', sectionId: 'kmeans', component: 'ChooseK', requiresCompletion: true },
  { id: 'initial-centroids-challenge', title: 'Bad Starts, Bad Endings', sectionId: 'kmeans', component: 'Initialization', requiresCompletion: true },
  { id: 'quiz-kmeans', title: 'Checkpoint: K-Means', sectionId: 'kmeans', component: 'QuizKMeans', requiresCompletion: true },

  { id: 'dendrogram-builder', title: 'Build the Tree from the Bottom Up', sectionId: 'hierarchical', component: 'DendrogramBuilder', requiresCompletion: true },
  { id: 'linkage-and-cut', title: 'Cut the Tree, Change the Story', sectionId: 'hierarchical', component: 'DendrogramCut', requiresCompletion: true },

  { id: 'dbscan-tuner', title: 'Find Dense Regions with DBSCAN', sectionId: 'dbscan', component: 'DBSCANTuner', requiresCompletion: true },
  { id: 'dbscan-failure-lab', title: 'When Density Stops Helping', sectionId: 'dbscan', component: 'DBSCANFailure', requiresCompletion: true },

  { id: 'cluster-validity-challenge', title: 'Which Clustering Would You Trust?', sectionId: 'validity', component: 'ClusterValidity', requiresCompletion: true },
  { id: 'quiz-clustering-final', title: 'Final Check: Cluster Analysis', sectionId: 'validity', component: 'QuizFinal', requiresCompletion: true },
];

export const QUIZ_121: QuizQuestion[] = [
  {
    id: 't12-q01',
    question: 'What is the core goal of cluster analysis?',
    options: [
      'Predict a known label for each example',
      'Find groups with high similarity inside groups and low similarity between groups',
      'Fit a line that minimizes residual error',
      'Choose actions that maximize reward over time',
    ],
    correctIndex: 1,
    explanation: 'Cluster analysis looks for low within-cluster distance and high between-cluster distance.',
  },
  {
    id: 't12-q02',
    question: 'Why can clustering be ambiguous?',
    options: [
      'The same point cloud can support multiple useful groupings',
      'Clustering always uses labels',
      'Every clustering algorithm returns the same answer',
      'Distance never affects cluster structure',
    ],
    correctIndex: 0,
    explanation: 'The lecture shows the same data interpreted at multiple granularities. The right clustering depends on the question.',
  },
];

export const QUIZ_122: QuizQuestion[] = [
  {
    id: 't12-q03',
    question: 'In K-means, each point is assigned to the cluster with the:',
    options: ['Most labels', 'Closest centroid', 'Tallest dendrogram branch', 'Largest Eps radius'],
    correctIndex: 1,
    explanation: 'K-means alternates between nearest-centroid assignment and moving centroids to cluster means.',
  },
  {
    id: 't12-q04',
    question: 'Which issue is a core limitation of K-means?',
    options: [
      'It is sensitive to K and initial centroid positions',
      'It cannot color points',
      'It never converges on simple blobs',
      'It requires a dendrogram before it starts',
    ],
    correctIndex: 0,
    explanation: 'The slides emphasize initial centers, choosing K, outliers, shape, density, and size as major K-means issues.',
  },
];

export const QUIZ_123: QuizQuestion[] = [
  {
    id: 't12-q05',
    question: 'Agglomerative hierarchical clustering begins by:',
    options: [
      'Putting all points in one cluster',
      'Making each point its own cluster',
      'Deleting all border points',
      'Guessing K random centroids',
    ],
    correctIndex: 1,
    explanation: 'Agglomerative clustering is bottom-up: singleton clusters first, then repeated closest-cluster merges.',
  },
  {
    id: 't12-q06',
    question: 'In DBSCAN, a core point is a point that:',
    options: [
      'Has enough neighbors within Eps',
      'Is the nearest centroid',
      'Appears above the dendrogram cut',
      'Has the largest squared error',
    ],
    correctIndex: 0,
    explanation: 'DBSCAN defines density with Eps and MinPts. A core point has at least MinPts points in its Eps-neighborhood.',
  },
  {
    id: 't12-q07',
    question: 'Why evaluate cluster validity?',
    options: [
      'To avoid trusting patterns in noise and to compare clusterings',
      'To turn clustering into supervised classification',
      'To guarantee one universally correct answer',
      'To remove all parameter choices',
    ],
    correctIndex: 0,
    explanation: 'Validity is how we check clustering tendency, compare algorithms, and reason about whether clusters fit the data.',
  },
];
