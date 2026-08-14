import type { QuizQuestion } from '@/hooks/useQuizState';

// ---------------------------------------------------------------------------
// Section groupings
// ---------------------------------------------------------------------------

export interface CardSection {
  id: string;
  label: string;
  cardRange: [number, number];
}

export const SECTIONS: CardSection[] = [
  { id: 'uncertainty', label: 'Uncertainty in AI', cardRange: [0, 2] },
  { id: 'bayes', label: "Bayes' Rule", cardRange: [3, 7] },
  { id: 'joint', label: 'Joint Distributions', cardRange: [8, 11] },
  { id: 'independence', label: 'Independence', cardRange: [12, 14] },
  { id: 'bayesnets', label: 'Bayesian Networks', cardRange: [15, 20] },
  { id: 'lab', label: 'Lab 7', cardRange: [21, 23] },
];

// ---------------------------------------------------------------------------
// Card definitions
// ---------------------------------------------------------------------------

export interface LessonCardDef {
  id: string;
  title: string;
  sectionId: string;
  component: string;
  autoComplete?: boolean;
}

export const CARDS: LessonCardDef[] = [
  // 8.1 Uncertainty in AI
  { id: 'why-uncertainty', title: 'Why Uncertainty?', sectionId: 'uncertainty', component: 'WhyUncertainty' },
  { id: 'probability-basics', title: 'Probability Axioms', sectionId: 'uncertainty', component: 'ProbabilityBasics', autoComplete: true },
  { id: 'quiz-uncertainty', title: 'Quiz: Probability Basics', sectionId: 'uncertainty', component: 'QuizUncertainty' },

  // 8.2 Bayes' Rule
  { id: 'conditional-prob', title: 'Conditional Probability', sectionId: 'bayes', component: 'ConditionalProb', autoComplete: true },
  { id: 'bayes-theorem', title: "Bayes' Theorem", sectionId: 'bayes', component: 'BayesTheorem', autoComplete: true },
  { id: 'bayes-calculator', title: 'Medical Test Calculator', sectionId: 'bayes', component: 'BayesCalculator' },
  { id: 'base-rate-game', title: 'Game: The Base Rate Trap', sectionId: 'bayes', component: 'BaseRateGame' },
  { id: 'quiz-bayes', title: "Quiz: Bayes' Rule", sectionId: 'bayes', component: 'QuizBayes' },

  // 8.3 Joint Distributions
  { id: 'joint-table', title: 'Joint Probability Tables', sectionId: 'joint', component: 'JointTable', autoComplete: true },
  { id: 'marginalization', title: 'Marginalization', sectionId: 'joint', component: 'Marginalization', autoComplete: true },
  { id: 'joint-explorer', title: 'Joint Distribution Explorer', sectionId: 'joint', component: 'JointExplorer' },
  { id: 'quiz-joint', title: 'Quiz: Joint Distributions', sectionId: 'joint', component: 'QuizJoint' },

  // 8.4 Independence
  { id: 'independence-def', title: 'Independence', sectionId: 'independence', component: 'IndependenceDef', autoComplete: true },
  { id: 'cond-independence', title: 'Conditional Independence', sectionId: 'independence', component: 'CondIndependence', autoComplete: true },
  { id: 'quiz-independence', title: 'Quiz: Independence', sectionId: 'independence', component: 'QuizIndependence' },

  // 8.5 Bayesian Networks
  { id: 'bn-intro', title: 'What is a Bayesian Network?', sectionId: 'bayesnets', component: 'BNIntro', autoComplete: true },
  { id: 'bn-structure', title: 'Structure & CPTs', sectionId: 'bayesnets', component: 'BNStructure', autoComplete: true },
  { id: 'bn-builder', title: 'Build a Bayesian Network', sectionId: 'bayesnets', component: 'BNBuilder' },
  { id: 'bn-inference', title: 'Variable Elimination', sectionId: 'bayesnets', component: 'BNInference' },
  { id: 'bn-explaining', title: 'Explaining Away', sectionId: 'bayesnets', component: 'BNExplaining' },
  { id: 'quiz-bn', title: 'Quiz: Bayesian Networks', sectionId: 'bayesnets', component: 'QuizBN' },

  // Lab 7
  { id: 'lab7-ex1', title: 'Exercise 1: Two Medical Tests', sectionId: 'lab', component: 'Lab7Ex1' },
  { id: 'lab7-ex2', title: 'Exercise 2: The Rare Disease', sectionId: 'lab', component: 'Lab7Ex2' },
  { id: 'lab7-ex3', title: 'Exercise 3: Joint Distribution Table', sectionId: 'lab', component: 'Lab7Ex3' },
];

// ---------------------------------------------------------------------------
// Quiz data
// ---------------------------------------------------------------------------

export const QUIZ_81: QuizQuestion[] = [
  {
    id: 't08-q01',
    question: 'Which axiom states that the probability of the entire sample space is 1?',
    options: [
      'Normalization (unitarity)',
      'Non-negativity',
      'Additivity',
      'Complementarity',
    ],
    correctIndex: 0,
    explanation: 'The normalization axiom requires P(Ω) = 1 — all possible outcomes together have probability 1.',
  },
  {
    id: 't08-q02',
    question: 'P(A ∨ B) = P(A) + P(B) − P(A ∧ B) is called:',
    options: [
      'The chain rule',
      'The inclusion-exclusion principle',
      "Bayes' theorem",
      'The law of total probability',
    ],
    correctIndex: 1,
    explanation: 'Inclusion-exclusion corrects for double-counting the overlap P(A ∧ B) when adding P(A) and P(B).',
  },
];

export const QUIZ_82: QuizQuestion[] = [
  {
    id: 't08-q03',
    question: "In Bayes' theorem P(H|E) = P(E|H)·P(H) / P(E), the term P(H) is called the:",
    options: [
      'Likelihood',
      'Prior probability',
      'Posterior probability',
      'Evidence',
    ],
    correctIndex: 1,
    explanation: "P(H) is the prior — our belief in the hypothesis before seeing evidence. P(H|E) is the posterior, and P(E|H) is the likelihood.",
  },
  {
    id: 't08-q04',
    question: 'A 99% accurate test for a disease affecting 1 in 10,000 people comes back positive. The probability you actually have the disease is closest to:',
    options: [
      '99%',
      '50%',
      '1%',
      '10%',
    ],
    correctIndex: 2,
    explanation: "This is the base rate fallacy. Using Bayes' theorem: P(D|+) = (0.99 × 0.0001) / (0.99 × 0.0001 + 0.01 × 0.9999) ≈ 0.98%. The low prior dominates.",
  },
];

export const QUIZ_83: QuizQuestion[] = [
  {
    id: 't08-q05',
    question: 'To compute P(X) from a joint distribution P(X, Y), you:',
    options: [
      'Sum over all values of Y (marginalize)',
      'Divide by P(Y)',
      'Multiply by P(Y|X)',
      'Take the maximum over Y',
    ],
    correctIndex: 0,
    explanation: 'Marginalization sums out the unwanted variable: P(X) = Σ_y P(X, Y=y).',
  },
  {
    id: 't08-q06',
    question: 'P(A | B) = P(A, B) / P(B) requires that:',
    options: [
      'A and B are independent',
      'P(B) > 0',
      'P(A) > P(B)',
      'A and B are mutually exclusive',
    ],
    correctIndex: 1,
    explanation: 'Conditional probability is only defined when we condition on an event with non-zero probability — we cannot divide by zero.',
  },
];

export const QUIZ_84: QuizQuestion[] = [
  {
    id: 't08-q07',
    question: 'A and B are independent if and only if:',
    options: [
      'P(A, B) = P(A) · P(B)',
      'P(A ∨ B) = 0',
      'P(A | B) = P(B | A)',
      'P(A) + P(B) = 1',
    ],
    correctIndex: 0,
    explanation: 'Independence means knowing B gives no information about A: P(A, B) = P(A)·P(B), equivalently P(A|B) = P(A).',
  },
  {
    id: 't08-q08',
    question: 'A and B are conditionally independent given C means:',
    options: [
      'P(A | B, C) = P(A | C)',
      'P(A | B) = P(A)',
      'P(A, B) = P(A) · P(B)',
      'P(C | A, B) = P(C)',
    ],
    correctIndex: 0,
    explanation: 'Conditional independence means that once C is known, B provides no additional information about A.',
  },
];

export const QUIZ_85: QuizQuestion[] = [
  {
    id: 't08-q09',
    question: 'An arrow from A → B in a Bayesian network means:',
    options: [
      "A directly influences B (B's CPT is conditioned on A)",
      'B causes A',
      'A and B are independent',
      'A and B always have the same value',
    ],
    correctIndex: 0,
    explanation: "An edge A → B means A is a parent of B, and B's conditional probability table includes A as a conditioning variable.",
  },
  {
    id: 't08-q10',
    question: 'The key advantage of Bayesian networks over full joint distributions is:',
    options: [
      'Compact representation via conditional independence',
      'They always give exact answers',
      'They require no probability values',
      'They only work for binary variables',
    ],
    correctIndex: 0,
    explanation: 'A full joint over n binary variables needs 2^n entries. A Bayesian network exploits conditional independence to store far fewer parameters.',
  },
  {
    id: 't08-q11',
    question: '"Explaining away" occurs when:',
    options: [
      'Observing a common effect makes its causes compete to explain it',
      'A variable has no parents',
      'Two variables are marginally dependent',
      'The network has no directed cycles',
    ],
    correctIndex: 0,
    explanation: 'If Burglary and Earthquake both cause Alarm, observing that the alarm went off makes them compete: learning one cause is present reduces belief in the other.',
  },
];
