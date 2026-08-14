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
  { id: 'intro', label: 'A New Kind of Problem', cardRange: [0, 2] },
  { id: 'map-coloring', label: 'Map Coloring', cardRange: [3, 5] },
  { id: 'backtracking', label: 'Backtracking Search', cardRange: [6, 10] },
  { id: 'smarter', label: 'Smarter Backtracking', cardRange: [11, 15] },
  { id: 'real-world', label: 'CSP in the Real World', cardRange: [16, 18] },
  { id: 'lab', label: 'Lab 6', cardRange: [19, 19] },
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
  { id: 'why-csp', title: 'Why Constraint Satisfaction?', sectionId: 'intro', component: 'WhyCSP' },
  { id: 'csp-anatomy', title: 'Variables, Domains, Constraints', sectionId: 'intro', component: 'CSPAnatomy', autoComplete: true },
  { id: 'quiz-intro', title: 'Quiz: CSP Basics', sectionId: 'intro', component: 'QuizIntro' },

  { id: 'australia-map', title: 'Australia Map Coloring', sectionId: 'map-coloring', component: 'AustraliaMap' },
  { id: 'constraint-graph', title: 'Constraint Graphs', sectionId: 'map-coloring', component: 'ConstraintGraph', autoComplete: true },
  { id: 'quiz-map', title: 'Quiz: Map Coloring', sectionId: 'map-coloring', component: 'QuizMapColoring' },

  { id: 'naive-vs-backtrack', title: 'Generate-and-Test vs Backtracking', sectionId: 'backtracking', component: 'NaiveVsBacktrack' },
  { id: 'backtracking-algo', title: 'Recursive Backtracking', sectionId: 'backtracking', component: 'BacktrackingAlgo' },
  { id: 'backtracking-game', title: 'Game: Be the Backtracking Solver', sectionId: 'backtracking', component: 'BacktrackingGame' },
  { id: 'backtracking-tree', title: 'The Backtracking Search Tree', sectionId: 'backtracking', component: 'BacktrackingTree', autoComplete: true },
  { id: 'quiz-backtrack', title: 'Quiz: Backtracking', sectionId: 'backtracking', component: 'QuizBacktrack' },

  { id: 'variable-ordering', title: 'MRV: Pick the Hardest Variable First', sectionId: 'smarter', component: 'VariableOrdering' },
  { id: 'value-ordering', title: 'LCV: Try the Least Disruptive Value', sectionId: 'smarter', component: 'ValueOrdering' },
  { id: 'forward-checking', title: 'Forward Checking', sectionId: 'smarter', component: 'ForwardChecking' },
  { id: 'ac3', title: 'Arc Consistency and AC-3', sectionId: 'smarter', component: 'AC3' },
  { id: 'quiz-heuristics', title: 'Quiz: Smarter Backtracking', sectionId: 'smarter', component: 'QuizHeuristics' },

  { id: 'sudoku-csp', title: 'Sudoku as a CSP', sectionId: 'real-world', component: 'SudokuCSP' },
  { id: 'real-world-csps', title: 'CSPs Beyond Puzzles', sectionId: 'real-world', component: 'RealWorldCSPs' },
  { id: 'quiz-mastery', title: 'Quiz: Topic Mastery', sectionId: 'real-world', component: 'QuizMastery' },

  { id: 'lab6', title: 'Lab 6: Constraint Satisfaction', sectionId: 'lab', component: 'Lab6' },
];

// ---------------------------------------------------------------------------
// Quiz data
// ---------------------------------------------------------------------------

export const QUIZ_71: QuizQuestion[] = [
  {
    id: 't07-q01',
    question: 'A CSP is defined by which three ingredients?',
    options: [
      'Variables, domains, constraints',
      'States, actions, goals',
      'Nodes, edges, weights',
      'Players, utilities, strategies',
    ],
    correctIndex: 0,
    explanation: 'A constraint satisfaction problem is specified by variables, a domain of allowed values for each variable, and constraints describing which combinations are legal.',
  },
  {
    id: 't07-q02',
    question: 'Why are CSPs usually easier than brute-force search on the same task?',
    options: [
      'Constraints let us prune impossible partial assignments early',
      'CSPs always have polynomial-time solutions',
      'They never need backtracking',
      'They ignore the problem structure',
    ],
    correctIndex: 0,
    explanation: 'CSP algorithms exploit structure. They can reject inconsistent partial assignments long before a full assignment is built.',
  },
];

export const QUIZ_72: QuizQuestion[] = [
  {
    id: 't07-q03',
    question: 'In Australia map coloring, an edge in the constraint graph means:',
    options: [
      'Two regions share a border and must have different colors',
      'A region can use any color',
      'Two regions must use the same color',
      'The regions are visited in alphabetical order',
    ],
    correctIndex: 0,
    explanation: 'Each edge encodes a binary inequality constraint: adjacent regions must not share the same color.',
  },
  {
    id: 't07-q04',
    question: 'Which Australian region in the classic example has no neighbors?',
    options: ['SA', 'NSW', 'T', 'NT'],
    correctIndex: 2,
    explanation: 'Tasmania is isolated in the AIMA map-coloring example, so it has no adjacency constraints with the mainland states.',
  },
];

export const QUIZ_73: QuizQuestion[] = [
  {
    id: 't07-q05',
    question: 'Backtracking search differs from generate-and-test because it:',
    options: [
      'Checks constraints after each partial assignment',
      'Enumerates only complete assignments',
      'Never revisits a choice',
      'Requires heuristic functions',
    ],
    correctIndex: 0,
    explanation: 'Backtracking incrementally builds a solution and stops exploring a branch as soon as a partial assignment violates a constraint.',
  },
  {
    id: 't07-q06',
    question: 'If WA = red and NT = red in Australia map coloring, the solver should:',
    options: [
      'Backtrack immediately',
      'Wait until all regions are assigned',
      'Ignore the conflict because SA is unassigned',
      'Add another color to the domain',
    ],
    correctIndex: 0,
    explanation: 'WA and NT are adjacent, so that partial assignment already violates a constraint and should be pruned immediately.',
  },
];

export const QUIZ_74: QuizQuestion[] = [
  {
    id: 't07-q07',
    question: 'MRV stands for:',
    options: [
      'Minimum Remaining Values',
      'Maximum Reachable Variables',
      'Most Recent Value',
      'Minimum Revision Visits',
    ],
    correctIndex: 0,
    explanation: 'MRV selects the unassigned variable with the fewest legal values left, following the fail-first principle.',
  },
  {
    id: 't07-q08',
    question: 'LCV prefers a value that:',
    options: [
      'Rules out the fewest options for neighboring variables',
      'Appears first alphabetically',
      'Makes the current variable singleton',
      'Maximizes the branching factor',
    ],
    correctIndex: 0,
    explanation: 'Least Constraining Value keeps the future as flexible as possible by preserving options for neighbors.',
  },
  {
    id: 't07-q09',
    question: 'Forward checking does what after each assignment?',
    options: [
      'Prunes inconsistent values from neighbors’ domains',
      'Explores every remaining branch completely',
      'Computes utility values at terminal nodes',
      'Sorts variables by depth only',
    ],
    correctIndex: 0,
    explanation: 'Forward checking looks one step ahead: once a variable is assigned, it removes neighbor values that now violate constraints.',
  },
];

export const QUIZ_75: QuizQuestion[] = [
  {
    id: 't07-q10',
    question: 'Sudoku can be modeled as a CSP because:',
    options: [
      'Each cell is a variable with row, column, and box constraints',
      'It is best solved with minimax',
      'Only complete boards matter',
      'The puzzle has no structure',
    ],
    correctIndex: 0,
    explanation: 'Each Sudoku cell is a variable, digits 1–9 form the domains, and row/column/box uniqueness rules define the constraints.',
  },
  {
    id: 't07-q11',
    question: 'Which of the following is a real-world CSP application?',
    options: [
      'Course timetabling',
      'Alpha-beta pruning in chess',
      'Image convolution',
      'Gradient descent on a neural network',
    ],
    correctIndex: 0,
    explanation: 'Scheduling and timetabling are classic CSPs: variables must be assigned slots while satisfying resource and conflict constraints.',
  },
];
