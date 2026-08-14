import type { QuizQuestion } from '@/hooks/useQuizState';
import type { LessonCardDef, CardSection } from './topic-04-cards';

// ---------------------------------------------------------------------------
// Section groupings for progress bar
// ---------------------------------------------------------------------------

export const SECTIONS: CardSection[] = [
  { id: 'hook', label: 'The AI Pattern', cardRange: [0, 2] },
  { id: 'approaches', label: 'Four Approaches', cardRange: [3, 6] },
  { id: 'turing', label: 'Turing & Critics', cardRange: [7, 9] },
  { id: 'history', label: 'AI History', cardRange: [10, 12] },
  { id: 'today', label: 'AI Today', cardRange: [13, 15] },
  { id: 'lab', label: 'Lab 1a', cardRange: [16, 18] },
];

// ---------------------------------------------------------------------------
// Card definitions
// ---------------------------------------------------------------------------

export const CARDS: LessonCardDef[] = [
  // --- The AI Pattern ---
  { id: 'ai-hides', title: 'AI Hides in Plain Sight', sectionId: 'hook', component: 'AIHides', autoComplete: true },
  { id: 'sense-decide-act', title: 'Sense, Decide, Act', sectionId: 'hook', component: 'SenseDecideAct' },
  { id: 'quiz-pattern', title: 'Quiz: The AI Pattern', sectionId: 'hook', component: 'QuizPattern' },

  // --- Four Approaches ---
  { id: 'spot-intelligence', title: 'Can You Spot Intelligence?', sectionId: 'approaches', component: 'SpotIntelligence' },
  { id: 'four-approaches', title: 'Four Ways to Define AI', sectionId: 'approaches', component: 'FourApproaches', autoComplete: true },
  { id: 'two-by-two', title: 'The 2\u00d72 in Action', sectionId: 'approaches', component: 'TwoByTwo' },
  { id: 'quiz-approaches', title: 'Quiz: Defining AI', sectionId: 'approaches', component: 'QuizApproaches' },

  // --- Turing & Critics ---
  { id: 'imitation-game', title: 'The Imitation Game', sectionId: 'turing', component: 'ImitationGame', autoComplete: true },
  { id: 'chinese-room', title: 'The Chinese Room', sectionId: 'turing', component: 'ChineseRoom' },
  { id: 'quiz-turing', title: 'Quiz: Turing & Critics', sectionId: 'turing', component: 'QuizTuring' },

  // --- AI History ---
  { id: 'ai-timeline', title: 'A Brief History of AI', sectionId: 'history', component: 'AITimeline' },
  { id: 'hype-winters', title: 'Hype, Winters, and Comebacks', sectionId: 'history', component: 'HypeWinters' },
  { id: 'quiz-history', title: 'Quiz: AI History', sectionId: 'history', component: 'QuizHistory' },

  // --- AI Today ---
  { id: 'capabilities', title: 'What AI Can (and Can\'t) Do', sectionId: 'today', component: 'Capabilities' },
  { id: 'rational-agent', title: 'The Rational Agent', sectionId: 'today', component: 'RationalAgent', autoComplete: true },
  { id: 'quiz-today', title: 'Quiz: AI Today', sectionId: 'today', component: 'QuizToday' },

  // --- Lab 1a ---
  { id: 'lab-classify', title: 'Lab: Classify the Approach', sectionId: 'lab', component: 'LabClassify' },
  { id: 'lab-timeline', title: 'Lab: Order the Milestones', sectionId: 'lab', component: 'LabTimeline' },
  { id: 'lab-turing', title: 'Lab: Be a Turing Judge', sectionId: 'lab', component: 'LabTuring' },
];

// ---------------------------------------------------------------------------
// Quiz data — 5 quizzes, 2 questions each
// ---------------------------------------------------------------------------

export const QUIZ_Q1: QuizQuestion[] = [
  {
    id: 't01-q01',
    question: 'A spam filter examines incoming email and moves suspicious messages to a junk folder. In the perceive-decide-act framework, what is the "perceive" step?',
    options: [
      'Moving the email to the junk folder',
      'Reading the email content and metadata',
      'The machine-learning model that classifies spam',
      'The user opening their inbox',
    ],
    correctIndex: 1,
    explanation: 'Perceiving means taking in information from the environment. The spam filter perceives by reading the email\u2019s content, sender, headers, and metadata. The classification model is the \u201cdecide\u201d step, and moving to junk is the \u201cact\u201d step.',
  },
  {
    id: 't01-q02',
    question: 'Which of the following systems does NOT fit the perceive-decide-act pattern?',
    options: [
      'A voice assistant answering a question',
      'A wall clock displaying the current time',
      'A recommendation engine suggesting a movie',
      'A chess engine choosing a move',
    ],
    correctIndex: 1,
    explanation: 'A wall clock is a passive mechanical device\u2014it doesn\u2019t perceive its environment, make decisions, or take actions based on input. The other three all sense input, process it, and produce an output action.',
  },
];

export const QUIZ_Q2: QuizQuestion[] = [
  {
    id: 't01-q03',
    question: 'A chess engine evaluates millions of positions per second using brute-force search and picks the move with the highest win probability. Which approach best describes this?',
    options: [
      'Thinking humanly',
      'Thinking rationally',
      'Acting humanly',
      'Acting rationally',
    ],
    correctIndex: 3,
    explanation: 'The engine acts to maximize its chance of winning (a performance measure) without mimicking how humans think about chess. This is the rational agent approach\u2014achieving the best expected outcome.',
  },
  {
    id: 't01-q04',
    question: 'Why does this course adopt the \u201cacting rationally\u201d approach rather than \u201cthinking humanly\u201d?',
    options: [
      'Human cognition is too simple to model',
      'It provides a crisp engineering goal without requiring us to solve human cognition first',
      'Rational agents are always faster than human-like systems',
      'The Turing Test proved that acting humanly is impossible',
    ],
    correctIndex: 1,
    explanation: 'Acting rationally gives a clear objective\u2014maximize expected performance\u2014that we can engineer toward directly. The \u201cthinking humanly\u201d approach requires first understanding human cognition, which remains an unsolved scientific problem.',
  },
];

export const QUIZ_Q3: QuizQuestion[] = [
  {
    id: 't01-q05',
    question: 'The Chinese Room argument challenges the Turing Test by suggesting that:',
    options: [
      'No machine can ever pass the test',
      'Passing the test does not prove understanding',
      'The test is too easy for modern AI',
      'Only biological brains can be intelligent',
    ],
    correctIndex: 1,
    explanation: 'Searle\u2019s Chinese Room shows that a system can produce perfectly correct outputs by following rules (syntax) without any comprehension of meaning (semantics). The Turing Test measures behavior, not understanding.',
  },
  {
    id: 't01-q06',
    question: 'A chatbot designed to pass the Turing Test must have all of the following EXCEPT:',
    options: [
      'Natural language processing',
      'The ability to genuinely feel emotions',
      'Knowledge representation',
      'Machine learning',
    ],
    correctIndex: 1,
    explanation: 'The Turing Test requires NLP, knowledge representation, reasoning, and learning\u2014but only to produce convincing behavior. It does not require the machine to actually feel emotions, only to simulate them convincingly.',
  },
];

export const QUIZ_Q4: QuizQuestion[] = [
  {
    id: 't01-q07',
    question: 'The 1956 Dartmouth Conference is significant because it:',
    options: [
      'Invented the first neural network',
      'Formally established AI as a field and coined the term',
      'Demonstrated the first chatbot',
      'Triggered the first AI winter',
    ],
    correctIndex: 1,
    explanation: 'The Dartmouth Conference, organized by McCarthy, Minsky, Shannon, and Rochester, coined \u201cartificial intelligence\u201d and established it as a formal research discipline. Neural network models (McCulloch & Pitts) predated it by over a decade.',
  },
  {
    id: 't01-q08',
    question: 'AI winters were primarily caused by:',
    options: [
      'Hardware becoming too expensive',
      'The gap between promises and actual capabilities',
      'Governments banning AI research',
      'Scientists losing interest in the field',
    ],
    correctIndex: 1,
    explanation: 'AI winters occurred when the field overpromised and underdelivered. Researchers claimed imminent breakthroughs, but real-world problems proved far harder than toy examples. Funding agencies lost patience and cut investment.',
  },
];

export const QUIZ_Q5: QuizQuestion[] = [
  {
    id: 't01-q09',
    question: 'AlphaGo defeated the world Go champion but cannot play chess without being retrained. This is an example of:',
    options: [
      'Artificial General Intelligence',
      'Narrow AI',
      'The Chinese Room problem',
      'An AI winter',
    ],
    correctIndex: 1,
    explanation: 'AlphaGo is narrow AI\u2014superhuman at one specific task (Go) with zero capability outside its domain. AGI would be a single system that handles any intellectual task, which does not yet exist.',
  },
  {
    id: 't01-q10',
    question: 'In the rational agent framework, a* = argmax E[U(a,s)] means the agent chooses the action that:',
    options: [
      'Mimics what a human would do',
      'Passes the Turing Test',
      'Maximizes expected utility given its current state',
      'Minimizes the number of computations needed',
    ],
    correctIndex: 2,
    explanation: 'The rational agent selects the action that maximizes expected utility\u2014the best expected outcome given what it knows about the current state. This is the engineering objective that drives every algorithm in this course.',
  },
];
