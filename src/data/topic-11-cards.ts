import type { QuizQuestion } from '@/hooks/useQuizState';

export interface CardSection {
  id: string;
  label: string;
  cardRange: [number, number];
}

export const SECTIONS: CardSection[] = [
  { id: 'basics', label: '11.1 Regression Basics', cardRange: [0, 4] },
  { id: 'multi', label: '11.2 Multiple Regression', cardRange: [5, 8] },
  { id: 'fit', label: '11.3 Fit Quality', cardRange: [9, 11] },
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
  { id: 'price-guess-hook', title: 'Can You Guess the Price?', sectionId: 'basics', component: 'PriceGuessHook', requiresCompletion: true },
  { id: 'fit-the-line', title: 'Fit the Line', sectionId: 'basics', component: 'FitTheLine', requiresCompletion: true },
  { id: 'residual-squares', title: 'Residuals and Error', sectionId: 'basics', component: 'ResidualSquares', autoComplete: true },
  { id: 'regression-equation', title: 'The Regression Equation', sectionId: 'basics', component: 'RegressionEquation', autoComplete: true },
  { id: 'quiz-line', title: 'Quiz: Fitting a Line', sectionId: 'basics', component: 'QuizLine', requiresCompletion: true },

  { id: 'housing-dataset', title: 'The California Housing Data', sectionId: 'multi', component: 'HousingDataset', autoComplete: true },
  { id: 'housing-explorer', title: 'Explore the Dataset', sectionId: 'multi', component: 'HousingExplorer', autoComplete: true },
  { id: 'multiple-regression', title: 'Multiple Regression', sectionId: 'multi', component: 'MultipleRegression', autoComplete: true },
  { id: 'quiz-multi', title: 'Quiz: Multiple Regression', sectionId: 'multi', component: 'QuizMulti', requiresCompletion: true },

  { id: 'fit-diagnosis', title: 'Underfit, Good Fit, Overfit', sectionId: 'fit', component: 'FitDiagnosis', requiresCompletion: true },
  { id: 'generalization-gap', title: 'What Generalizes?', sectionId: 'fit', component: 'GeneralizationGap', autoComplete: true },
  { id: 'quiz-fit-quality', title: 'Quiz: Fit Quality', sectionId: 'fit', component: 'QuizFitQuality', requiresCompletion: true },
];

export const QUIZ_111: QuizQuestion[] = [
  {
    id: 't11r-q01',
    question: 'In the equation ŷ = wx + b, increasing w mainly changes the:',
    options: [
      'Steepness of the line',
      'Number of data points',
      'Meaning of the target variable',
      'Size of the test split',
    ],
    correctIndex: 0,
    explanation: 'The weight w is the slope. Bigger w means the prediction changes more quickly as x changes.',
  },
  {
    id: 't11r-q02',
    question: 'Why does MSE punish large mistakes more strongly than MAE?',
    options: [
      'It removes the residual sign before averaging',
      'It squares each residual before averaging',
      'It only looks at the training set',
      'It ignores small residuals completely',
    ],
    correctIndex: 1,
    explanation: 'Squaring the residual turns a big miss into a much larger contribution, which is why MSE reacts strongly to outliers.',
  },
];

export const QUIZ_112: QuizQuestion[] = [
  {
    id: 't11r-q03',
    question: 'If a multiple regression model uses 8 input features, how many learned parameters does it have including the bias?',
    options: ['8', '9', '16', '64'],
    correctIndex: 1,
    explanation: 'There is one weight per feature plus one bias term, so 8 features means 9 parameters total.',
  },
  {
    id: 't11r-q04',
    question: 'In the regression notebook, which single feature is the strongest standalone predictor of house value?',
    options: ['Population', 'AveRooms', 'MedInc', 'HouseAge'],
    correctIndex: 2,
    explanation: 'Median income (`MedInc`) is the strongest single-feature baseline in the notebook and has the clearest relationship with house value.',
  },
];

export const QUIZ_113: QuizQuestion[] = [
  {
    id: 't11r-q05',
    question: 'Which pattern is the clearest sign of overfitting?',
    options: [
      'Training and test error are both high',
      'Training error is low but test error is much worse',
      'Training and test error are both low',
      'The model uses only one feature',
    ],
    correctIndex: 1,
    explanation: 'Overfitting shows up when the model performs very well on training data but fails to generalize to new examples.',
  },
  {
    id: 't11r-q06',
    question: 'If a degree-1 model misses a curved pattern, the most likely problem is:',
    options: [
      'Overfitting',
      'Underfitting',
      'Data leakage',
      'Too many parameters',
    ],
    correctIndex: 1,
    explanation: 'A straight line can be too simple for a curved relationship. That is underfitting.',
  },
];
