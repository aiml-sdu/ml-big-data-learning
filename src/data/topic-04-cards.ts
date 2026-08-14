import type { QuizQuestion } from '@/hooks/useQuizState';

// ---------------------------------------------------------------------------
// Section groupings for progress bar
// ---------------------------------------------------------------------------

export interface CardSection {
  id: string;
  label: string;
  cardRange: [number, number]; // inclusive start/end indices
}

export const SECTIONS: CardSection[] = [
  { id: 'heuristics', label: 'Heuristics', cardRange: [0, 2] },
  { id: 'greedy', label: 'Greedy', cardRange: [3, 6] },
  { id: 'astar', label: 'A*', cardRange: [7, 10] },
  { id: 'admissibility', label: 'Admissibility', cardRange: [11, 12] },
  { id: 'design', label: 'Design', cardRange: [13, 15] },
  { id: 'playground', label: 'Playground', cardRange: [16, 17] },
  { id: 'beyond', label: 'Beyond', cardRange: [18, 19] },
  { id: 'lab', label: 'Lab 3', cardRange: [20, 20] },
];

// ---------------------------------------------------------------------------
// Card definitions
// ---------------------------------------------------------------------------

export interface LessonCardDef {
  id: string;
  title: string;
  sectionId: string;
  /** Component key — maps to lazy-loaded component in the stepper */
  component: string;
  /** If true, card auto-completes when rendered (no interaction needed) */
  autoComplete?: boolean;
  /** If true, the learner must finish the interaction before continuing */
  requiresCompletion?: boolean;
}

export const CARDS: LessonCardDef[] = [
  // --- Heuristics ---
  { id: 'lost-tourist', title: 'The Lost Tourist', sectionId: 'heuristics', component: 'LostTourist' },
  { id: 'compass', title: 'What If You Had a Compass?', sectionId: 'heuristics', component: 'Compass' },
  { id: 'quiz-heuristic', title: 'Quiz: Heuristic Basics', sectionId: 'heuristics', component: 'QuizHeuristic' },

  // --- Greedy ---
  { id: 'be-greedy', title: 'Be Greedy', sectionId: 'greedy', component: 'BeGreedy' },
  { id: 'greedy-step', title: 'Greedy Step-Through', sectionId: 'greedy', component: 'GreedyStepThrough' },
  { id: 'greedy-flaw', title: "Greedy's Flaw", sectionId: 'greedy', component: 'GreedyFlaw' },
  { id: 'quiz-greedy', title: 'Quiz: Greedy', sectionId: 'greedy', component: 'QuizGreedy' },

  // --- A* ---
  { id: 'missing-ingredient', title: 'The Missing Ingredient', sectionId: 'astar', component: 'MissingIngredient' },
  { id: 'be-astar', title: 'Be A-Star', sectionId: 'astar', component: 'BeAStar' },
  { id: 'astar-vs-greedy', title: 'A* vs Greedy: The Race', sectionId: 'astar', component: 'AStarVsGreedy' },
  { id: 'quiz-astar', title: 'Quiz: A-Star', sectionId: 'astar', component: 'QuizAStar' },

  // --- Admissibility ---
  { id: 'why-astar-works', title: 'Why A* Works', sectionId: 'admissibility', component: 'WhyAStarWorks' },
  { id: 'quiz-admissibility', title: 'Quiz: Admissibility', sectionId: 'admissibility', component: 'QuizAdmissibility' },

  // --- Heuristic Design ---
  { id: 'eight-puzzle-lab', title: '8-Puzzle Heuristic Lab', sectionId: 'design', component: 'EightPuzzleLab' },
  { id: 'heuristic-design', title: 'Heuristic Design', sectionId: 'design', component: 'HeuristicDesign' },
  { id: 'quiz-design', title: 'Quiz: Heuristic Design', sectionId: 'design', component: 'QuizDesign' },

  // --- Playground ---
  { id: 'pathfinding', title: 'Pathfinding Playground', sectionId: 'playground', component: 'Pathfinding' },
  { id: 'pacman', title: 'Pac-Man: Search in Action', sectionId: 'playground', component: 'PacMan' },

  // --- Beyond ---
  { id: 'beyond-astar', title: 'Beyond A*', sectionId: 'beyond', component: 'BeyondAStar' },
  { id: 'quiz-weighted', title: 'Quiz: Weighted A*', sectionId: 'beyond', component: 'QuizWeighted' },

  // --- Lab ---
  { id: 'lab3', title: 'Lab 3: Exercises', sectionId: 'lab', component: 'Lab3' },
];

// ---------------------------------------------------------------------------
// Quiz data (moved from Topic04InformedPage.tsx)
// ---------------------------------------------------------------------------

export const QUIZ_41: QuizQuestion[] = [
  {
    id: 't04-q01',
    question: 'A heuristic function h(n) estimates:',
    options: [
      'The cost of the path from the start to n',
      'The cost of the cheapest path from n to the goal',
      'The total number of nodes in the search tree',
      'The depth of node n in the search tree',
    ],
    correctIndex: 1,
    explanation: 'A heuristic h(n) provides an estimate of the cost of the cheapest path from node n to the goal. It gives the search algorithm a sense of "direction" without computing the exact cost.',
  },
  {
    id: 't04-q02',
    question: 'For the Romania map problem, the heuristic hSLD (straight-line distance to Bucharest) is useful because:',
    options: [
      'It gives the exact road distance',
      'It is always zero',
      'The straight line is never longer than the actual road',
      'It counts the number of cities on the path',
    ],
    correctIndex: 2,
    explanation: 'The straight-line distance to Bucharest is always less than or equal to the actual road distance (a straight line is the shortest distance between two points). This makes it a useful lower bound.',
  },
];

export const QUIZ_42: QuizQuestion[] = [
  {
    id: 't04-q03',
    question: 'Greedy Best-First Search expands the node with:',
    options: [
      'The lowest g(n) (path cost so far)',
      'The lowest h(n) (estimated cost to goal)',
      'The lowest f(n) = g(n) + h(n)',
      'The highest h(n) (estimated cost to goal)',
    ],
    correctIndex: 1,
    explanation: 'Greedy Best-First Search is "greedy" because it always expands whichever node appears closest to the goal according to h(n), completely ignoring the cost already incurred (g(n)).',
  },
  {
    id: 't04-q04',
    question: 'Why is Greedy Best-First Search not guaranteed to find the optimal path?',
    options: [
      'It explores too many nodes',
      'It only considers the estimated cost to the goal, ignoring the cost so far',
      'It uses a FIFO queue instead of a priority queue',
      'It never reaches the goal',
    ],
    correctIndex: 1,
    explanation: 'Greedy ignores g(n) entirely. A node might look close to the goal (low h) but require an expensive detour to reach. This can lead greedy search down a suboptimal path.',
  },
];

export const QUIZ_43: QuizQuestion[] = [
  {
    id: 't04-q05',
    question: 'In A* search, f(n) = g(n) + h(n). What does g(n) represent?',
    options: [
      'The estimated cost from n to the goal',
      'The actual cost of the path from start to n',
      'The heuristic value at node n',
      'The number of nodes expanded so far',
    ],
    correctIndex: 1,
    explanation: 'g(n) is the actual cost of the path found so far from the start node to n. Combined with h(n) (the estimated remaining cost), f(n) estimates the total cost of the cheapest solution through n.',
  },
  {
    id: 't04-q06',
    question: 'A* search on the Romania map from Arad to Bucharest finds the optimal path with cost:',
    options: ['366', '418', '450', '504'],
    correctIndex: 1,
    explanation: 'The optimal path is Arad \u2192 Sibiu \u2192 Rimnicu Vilcea \u2192 Pitesti \u2192 Bucharest with cost 140 + 80 + 97 + 101 = 418.',
  },
];

export const QUIZ_44: QuizQuestion[] = [
  {
    id: 't04-q07',
    question: 'A heuristic is admissible if it:',
    options: [
      'Always overestimates the true cost to the goal',
      'Never overestimates the true cost to the goal',
      'Equals the true cost to the goal for every node',
      'Returns zero for every node',
    ],
    correctIndex: 1,
    explanation: 'An admissible heuristic never overestimates \u2014 it is always optimistic. This ensures that A* never skips over a cheaper path, guaranteeing optimality.',
  },
  {
    id: 't04-q08',
    question: 'Consistency (monotonicity) requires that for every node n and successor n\u2032 with step cost c(n,n\u2032):',
    options: [
      'h(n) \u2265 h(n\u2032)',
      'h(n) \u2264 c(n,n\u2032) + h(n\u2032)',
      'h(n) = c(n,n\u2032) + h(n\u2032)',
      'g(n) \u2264 h(n)',
    ],
    correctIndex: 1,
    explanation: 'The consistency (or triangle inequality) condition says the estimated cost from n can\'t exceed the step cost to n\u2032 plus the estimate from n\u2032. This is a stronger condition than admissibility and ensures f(n) values never decrease along a path.',
  },
];

export const QUIZ_45: QuizQuestion[] = [
  {
    id: 't04-q09',
    question: 'For the 8-puzzle, h2 (Manhattan distance) dominates h1 (misplaced tiles). This means:',
    options: [
      'h2(n) \u2264 h1(n) for all states n',
      'h2(n) \u2265 h1(n) for all states n',
      'h2 is inadmissible',
      'h1 expands fewer nodes than h2',
    ],
    correctIndex: 1,
    explanation: 'Dominance means h2(n) \u2265 h1(n) for all n, while both remain admissible. A dominating heuristic is always at least as informative, so A* with h2 never expands more nodes than A* with h1.',
  },
  {
    id: 't04-q10',
    question: 'Which of the following is NOT a valid heuristic for the 8-puzzle?',
    options: [
      'Number of misplaced tiles',
      'Sum of Manhattan distances',
      'Number of tiles (always 8)',
      'Maximum of h1 and h2',
    ],
    correctIndex: 2,
    explanation: 'A constant function h(n) = 8 overestimates the cost for states near the goal (which may need only 1 move), so it is inadmissible. The maximum of two admissible heuristics is also admissible and more informed.',
  },
];

export const QUIZ_47: QuizQuestion[] = [
  {
    id: 't04-q11',
    question: 'Weighted A* with f(n) = g(n) + W \u00b7 h(n), where W > 1, trades:',
    options: [
      'Completeness for speed',
      'Optimality for speed',
      'Speed for optimality',
      'Space for time',
    ],
    correctIndex: 1,
    explanation: 'With W > 1, the heuristic is amplified, making the search more "greedy" and faster. The resulting path cost is at most W times the optimal cost \u2014 you get a bounded suboptimal solution in less time.',
  },
  {
    id: 't04-q12',
    question: 'When W = 1 in weighted A*, the algorithm is equivalent to:',
    options: ['BFS', 'Greedy Best-First Search', 'Standard A*', 'Uniform-Cost Search'],
    correctIndex: 2,
    explanation: 'When W = 1, f(n) = g(n) + 1 \u00b7 h(n) = g(n) + h(n), which is exactly standard A*. As W increases toward \u221e, it approaches Greedy Best-First Search.',
  },
];
