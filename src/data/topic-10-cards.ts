import type { QuizQuestion } from '@/hooks/useQuizState';

export interface CardSection {
  id: string;
  label: string;
  cardRange: [number, number];
}

export const SECTIONS: CardSection[] = [
  { id: 'why', label: '10.1 Introduction to ML', cardRange: [0, 6] },
  { id: 'classification', label: '10.2 Classification', cardRange: [7, 17] },
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
  { id: 'ml-definition-hook', title: 'When Rules Break', sectionId: 'why', component: 'MLDefinitionHook', requiresCompletion: true },
  { id: 'paradigm-playground', title: 'Paradigm Playground', sectionId: 'why', component: 'ParadigmPlayground', requiresCompletion: true },
  { id: 'reinforcement-loop-game', title: 'Rewards, States, Actions', sectionId: 'why', component: 'ReinforcementLoopGame', requiresCompletion: true },
  { id: 'supervised-model-explorer', title: 'What Is a Supervised Model?', sectionId: 'why', component: 'SupervisedModelExplorer', requiresCompletion: true },
  { id: 'output-type-arcade', title: 'Sort the Output Types', sectionId: 'why', component: 'OutputTypeArcade', requiresCompletion: true },
  { id: 'deep-learning-domain-atlas', title: 'Deep Learning Across Domains', sectionId: 'why', component: 'DeepLearningDomainAtlas', requiresCompletion: true },
  { id: 'quiz-intro-ml', title: 'Quiz: Intro to ML', sectionId: 'why', component: 'QuizIntroML', requiresCompletion: true },

  { id: 'classification-task-hook', title: 'Will This Student Pass?', sectionId: 'classification', component: 'ClassificationTaskHook', requiresCompletion: true },
  { id: 'train-test-split', title: 'Train, Then Test', sectionId: 'classification', component: 'TrainTestSplit', requiresCompletion: true },
  { id: 'classification-methods-survey', title: 'Classification Methods at a Glance', sectionId: 'classification', component: 'ClassificationMethodsSurvey', requiresCompletion: true },
  { id: 'decision-tree-path-tracer', title: 'Trace a Student Through the Tree', sectionId: 'classification', component: 'DecisionTreePathTracer', requiresCompletion: true },
  { id: 'tree-depth-playground', title: 'How Deep Should the Tree Grow?', sectionId: 'classification', component: 'TreeDepthPlayground', requiresCompletion: true },
  { id: 'random-forest-ensemble', title: 'Why Random Forests Help', sectionId: 'classification', component: 'RandomForestEnsemble', requiresCompletion: true },
  { id: 'confusion-matrix-explorer', title: 'Read the Confusion Matrix', sectionId: 'classification', component: 'ConfusionMatrixExplorer', requiresCompletion: true },
  { id: 'feature-importance-error-analysis', title: 'Which Features Matter?', sectionId: 'classification', component: 'FeatureImportanceAndErrorAnalysis', requiresCompletion: true },
  { id: 'predict-your-own-success', title: 'Predict Your Own Success', sectionId: 'classification', component: 'PredictYourOwnSuccess', requiresCompletion: true },
  { id: 'quiz-classification', title: 'Quiz: Classification', sectionId: 'classification', component: 'QuizClassification', requiresCompletion: true },
  { id: 'colab-bridge', title: 'Continue in Colab', sectionId: 'classification', component: 'ColabBridge', autoComplete: true },
];

export const QUIZ_101: QuizQuestion[] = [
  {
    id: 't10c-q01',
    question: 'Which lecture example is unsupervised learning?',
    options: [
      'Predicting house prices from labeled examples',
      'Grouping unlabeled examples into clusters',
      'Choosing chess moves from rewards',
      'Evaluating a model on a held-out test split',
    ],
    correctIndex: 1,
    explanation: 'Unsupervised learning works without labels. Clustering, outlier detection, generation, and filling missing data are the slide’s examples.',
  },
  {
    id: 't10c-q02',
    question: 'In supervised learning, each training example contains:',
    options: [
      'A state and a reward',
      'Only raw inputs with no target',
      'A paired input and target output',
      'Only a predicted class label',
    ],
    correctIndex: 2,
    explanation: 'Supervised learning is about learning a mapping from paired input/output examples.',
  },
  {
    id: 't10c-q03',
    question: 'Which task is the clearest example of multiclass classification from the lecture?',
    options: [
      'Predicting a single house price',
      'Predicting sentiment as positive or negative',
      'Assigning a music clip to one of several genres',
      'Predicting house price and rent together',
    ],
    correctIndex: 2,
    explanation: 'Music genre classification has more than two discrete labels, so it is multiclass classification.',
  },
  {
    id: 't10c-q04',
    question: 'Which slide pairing is the best match for NLP / language?',
    options: [
      'Image classification with a convolutional network',
      'Text classification with a transformer network',
      'House price prediction with a fully connected network',
      'Image segmentation with a convolutional encoder-decoder',
    ],
    correctIndex: 1,
    explanation: 'The lecture explicitly pairs text classification with a transformer network, which sits under the NLP / language umbrella.',
  },
];

export const QUIZ_102: QuizQuestion[] = [
  {
    id: 't10c-q05',
    question: 'What makes the student-success task a classification problem?',
    options: [
      'The output is a continuous number',
      'The output is one label chosen from known classes',
      'The model has to explore actions over time',
      'There are no targets during training',
    ],
    correctIndex: 1,
    explanation: 'Classification predicts a discrete label. Here the model chooses between class labels such as `Pass` and `Needs more support`.',
  },
  {
    id: 't10c-q06',
    question: 'Why does the notebook use `stratify=y` when creating the train/test split?',
    options: [
      'To keep the pass/support balance similar in both splits',
      'To make the tree grow deeper automatically',
      'To remove the need for a test set',
      'To force every feature to have the same scale',
    ],
    correctIndex: 0,
    explanation: 'Because this is a class-label problem, the held-out split should keep a similar pass/support balance. Stratification helps preserve that fairness.',
  },
  {
    id: 't10c-q07',
    question: 'What is the main risk of making a decision tree too deep?',
    options: [
      'It becomes unsupervised',
      'It ignores all but one feature',
      'It can memorize training quirks and overfit',
      'It stops producing class labels',
    ],
    correctIndex: 2,
    explanation: 'A very deep tree can chase tiny details in the training set, which often hurts performance on unseen data.',
  },
  {
    id: 't10c-q08',
    question: 'In the student-success confusion matrix, what does an off-diagonal cell represent?',
    options: [
      'A correct prediction',
      'A feature-importance score',
      'A misclassification between actual and predicted labels',
      'The average confidence of the model',
    ],
    correctIndex: 2,
    explanation: 'The diagonal contains correct predictions. Off-diagonal cells show the mistakes, which is why they are useful for error analysis.',
  },
];
