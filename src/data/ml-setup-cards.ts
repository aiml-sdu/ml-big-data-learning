import type { QuizQuestion } from '@/hooks/useQuizState';

export interface CardSection {
  id: string;
  label: string;
  cardRange: [number, number];
}

export const SECTIONS: CardSection[] = [
  { id: 'why', label: 'Why Environments Matter', cardRange: [0, 1] },
  { id: 'env', label: 'Create and Activate', cardRange: [2, 3] },
  { id: 'packages', label: 'Install Notebook Tools', cardRange: [4, 5] },
  { id: 'notebook', label: 'Launch the Notebook', cardRange: [6, 7] },
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
  { id: 'setup-intro', title: 'Why Use Conda Here?', sectionId: 'why', component: 'SetupIntro', autoComplete: true },
  { id: 'choose-safe-setup', title: 'Choose the Safe Setup', sectionId: 'why', component: 'ChooseSafeSetup', requiresCompletion: true },

  { id: 'create-env-command', title: 'Create the Environment', sectionId: 'env', component: 'CreateEnvCommand', requiresCompletion: true },
  { id: 'activate-env-command', title: 'Activate the Environment', sectionId: 'env', component: 'ActivateEnvCommand', requiresCompletion: true },

  { id: 'install-tools-command', title: 'Install the Notebook Tools', sectionId: 'packages', component: 'InstallToolsCommand', requiresCompletion: true },
  { id: 'kernel-registration', title: 'Register the Notebook Kernel', sectionId: 'packages', component: 'KernelRegistration', autoComplete: true },

  { id: 'launch-notebook', title: 'Open the Notebook', sectionId: 'notebook', component: 'LaunchNotebook', requiresCompletion: true },
  { id: 'setup-quiz', title: 'Quiz: Ready for the Notebook', sectionId: 'notebook', component: 'SetupQuiz', requiresCompletion: true },
];

export const QUIZ_SETUP: QuizQuestion[] = [
  {
    id: 'mlsetup-q01',
    question: 'Why is a dedicated conda environment better than installing everything into base for these notebooks?',
    options: [
      'It isolates the notebook dependencies so they do not collide with other projects',
      'It makes classification mathematically simpler',
      'It removes the need to activate anything',
      'It guarantees every model will generalize well',
    ],
    correctIndex: 0,
    explanation: 'A separate environment is about isolation and reproducibility. It keeps the notebook packages from interfering with other Python work.',
  },
  {
    id: 'mlsetup-q02',
    question: 'After launching Jupyter, which kernel should students select for the ML notebook?',
    options: [
      'Python (base)',
      'Python (ai101-ml)',
      'No kernel is needed',
      'The browser decides automatically',
    ],
    correctIndex: 1,
    explanation: 'The notebook should run in the environment you created for the lab, so the correct kernel is `Python (ai101-ml)`.',
  },
];
