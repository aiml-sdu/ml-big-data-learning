import type { QuizQuestion } from '@/hooks/useQuizState';
import type { LessonCardDef, CardSection } from './topic-04-cards';

// ---------------------------------------------------------------------------
// Section groupings for progress bar
// ---------------------------------------------------------------------------

export const SECTIONS: CardSection[] = [
  { id: 'hook', label: 'Introduction', cardRange: [0, 2] },
  { id: 'design', label: 'Rationality & Design', cardRange: [3, 5] },
  { id: 'environments', label: 'Environments', cardRange: [6, 9] },
  { id: 'architectures', label: 'Architectures', cardRange: [10, 13] },
  { id: 'synthesis', label: 'Synthesis', cardRange: [14, 16] },
  { id: 'lab', label: 'Lab 1b', cardRange: [17, 17] },
];

// ---------------------------------------------------------------------------
// Card definitions
// ---------------------------------------------------------------------------

export const CARDS: LessonCardDef[] = [
  // --- Introduction ---
  { id: 'roomba-hook', title: 'Is Your Roomba Intelligent?', sectionId: 'hook', component: 'RoombaHook' },
  { id: 'agent-function', title: 'The Agent Function', sectionId: 'hook', component: 'AgentFunction' },
  { id: 'quiz-agent-basics', title: 'Quiz: Agent Basics', sectionId: 'hook', component: 'QuizAgentBasics' },

  // --- Rationality & Design ---
  { id: 'rationality', title: 'Rational \u2260 Perfect', sectionId: 'design', component: 'Rationality', autoComplete: true },
  { id: 'peas-framework', title: 'The PEAS Framework', sectionId: 'design', component: 'PEASFramework' },
  { id: 'quiz-rationality-peas', title: 'Quiz: Rationality & PEAS', sectionId: 'design', component: 'QuizRationalityPEAS' },

  // --- Environments ---
  { id: 'env-dimensions', title: 'Why Chess \u2260 Poker', sectionId: 'environments', component: 'EnvDimensions', autoComplete: true },
  { id: 'env-comparison', title: 'Comparing Worlds', sectionId: 'environments', component: 'EnvComparison' },
  { id: 'env-classifier', title: 'Environment Detective', sectionId: 'environments', component: 'EnvClassifier' },
  { id: 'quiz-environments', title: 'Quiz: Environments', sectionId: 'environments', component: 'QuizEnvironments' },

  // --- Architectures ---
  { id: 'arch-spectrum', title: 'Four Flavors of Intelligence', sectionId: 'architectures', component: 'ArchSpectrum' },
  { id: 'reflex-agents', title: 'Reflex: Simple vs Model-Based', sectionId: 'architectures', component: 'ReflexAgents' },
  { id: 'goal-utility', title: 'Goals and Utility', sectionId: 'architectures', component: 'GoalUtility' },
  { id: 'quiz-architectures', title: 'Quiz: Architectures', sectionId: 'architectures', component: 'QuizArchitectures' },

  // --- Synthesis ---
  { id: 'match-principle', title: 'Match the Agent to the World', sectionId: 'synthesis', component: 'MatchPrinciple', autoComplete: true },
  { id: 'architect-game', title: 'Architect Challenge', sectionId: 'synthesis', component: 'ArchitectGame' },
  { id: 'quiz-synthesis', title: 'Quiz: Tying It Together', sectionId: 'synthesis', component: 'QuizSynthesis' },

  // --- Lab 1b ---
  { id: 'lab-exercises', title: 'Lab 1b: Exercises', sectionId: 'lab', component: 'LabExercises' },
];

// ---------------------------------------------------------------------------
// Quiz data — 5 quizzes, 2 questions each
// ---------------------------------------------------------------------------

export const QUIZ_AGENT_BASICS: QuizQuestion[] = [
  {
    id: 't02-q01',
    question: "An agent's 'percept sequence' refers to:",
    options: [
      'The current sensor reading',
      'The complete history of all sensor readings',
      'The list of available actions',
      "The agent's internal state",
    ],
    correctIndex: 1,
    explanation: "The percept sequence is the complete history of everything the agent has perceived. Rational decisions may depend on past observations, not just the current one. This distinction is what separates simple reflex agents from more sophisticated ones.",
  },
  {
    id: 't02-q02',
    question: 'The vacuum agent program above uses condition-action rules. This means it is an example of:',
    options: [
      'A utility-based agent',
      'A goal-based agent',
      'A simple reflex agent',
      'A model-based agent',
    ],
    correctIndex: 2,
    explanation: "The vacuum program maps the current percept directly to an action using if-then rules, with no memory of the past. This is the hallmark of a simple reflex agent\u2014fast and simple, but blind to history.",
  },
];

export const QUIZ_RATIONALITY_PEAS: QuizQuestion[] = [
  {
    id: 't02-q03',
    question: 'A rational agent must:',
    options: [
      'Always succeed at its task',
      'Know everything about its environment',
      'Act to maximize its expected performance',
      'Never make mistakes',
    ],
    correctIndex: 2,
    explanation: "Rationality means maximizing expected performance given available information. A rational agent does not need to be omniscient or always succeed\u2014it just needs to make the best decisions possible with what it has.",
  },
  {
    id: 't02-q04',
    question: "For a chess-playing agent, which of these is an actuator?",
    options: [
      'The chess clock',
      "The opponent's moves",
      'Moving a piece on the board',
      'The current board position',
    ],
    correctIndex: 2,
    explanation: "Actuators are the means by which an agent acts on its environment. In chess, the actuator is the ability to move pieces. The board position is a percept, the opponent's moves are part of the environment, and the clock is a constraint.",
  },
];

export const QUIZ_ENVIRONMENTS: QuizQuestion[] = [
  {
    id: 't02-q05',
    question: 'Chess is best described as:',
    options: [
      'Fully observable, deterministic, sequential',
      'Partially observable, stochastic, episodic',
      'Fully observable, stochastic, sequential',
      'Partially observable, deterministic, episodic',
    ],
    correctIndex: 0,
    explanation: 'In chess, you can see the entire board (fully observable), moves have predictable outcomes (deterministic), and current moves affect future positions (sequential).',
  },
  {
    id: 't02-q06',
    question: 'Which property makes poker fundamentally harder than chess for an AI agent?',
    options: [
      "It's multi-agent",
      "It's partially observable",
      "It's sequential",
      "It's discrete",
    ],
    correctIndex: 1,
    explanation: "Both games are multi-agent and sequential. The key difference is that in poker, you cannot see your opponents' cards. This partial observability forces the agent to reason under uncertainty, which is a fundamentally harder problem.",
  },
];

export const QUIZ_ARCHITECTURES: QuizQuestion[] = [
  {
    id: 't02-q07',
    question: 'A simple reflex agent decides what to do based on:',
    options: [
      'The current percept only',
      'The complete percept history',
      'An explicit goal',
      'A utility function',
    ],
    correctIndex: 0,
    explanation: "Simple reflex agents use condition-action rules based only on the current percept. They have no memory of past percepts and no representation of future goals.",
  },
  {
    id: 't02-q08',
    question: 'A utility-based agent differs from a goal-based agent because it:',
    options: [
      'Has no goals',
      'Can compare different ways of achieving a goal',
      'Does not need sensors',
      'Only works in deterministic environments',
    ],
    correctIndex: 1,
    explanation: "A goal-based agent knows whether a state satisfies its goal (binary yes/no). A utility-based agent ranks states by desirability, letting it choose the best among multiple plans that all achieve the goal.",
  },
];

export const QUIZ_SYNTHESIS: QuizQuestion[] = [
  {
    id: 't02-q09',
    question: 'A medical diagnosis system operates in a partially observable, stochastic environment. The minimum agent architecture it needs is:',
    options: [
      'Simple reflex',
      'Model-based reflex',
      'Goal-based',
      'No architecture can handle this',
    ],
    correctIndex: 2,
    explanation: "Partial observability requires at least a model (to track hidden patient state). Stochasticity requires planning under uncertainty (to choose among treatments with probabilistic outcomes). A goal-based agent is the minimum architecture that combines internal state with planning toward an explicit goal.",
  },
  {
    id: 't02-q10',
    question: "An agent's environment is fully observable, deterministic, episodic, and single-agent. A smart engineer would choose:",
    options: [
      'A utility-based agent for maximum capability',
      'A simple reflex agent\u2014it\u2019s sufficient and simplest',
      'A goal-based agent to plan ahead',
      'A model-based agent for internal state tracking',
    ],
    correctIndex: 1,
    explanation: "In a fully observable, deterministic, episodic world, the agent can see everything, outcomes are predictable, and decisions don't affect the future. A simple reflex agent with condition-action rules is sufficient. Using a more complex architecture would be over-engineering.",
  },
];
