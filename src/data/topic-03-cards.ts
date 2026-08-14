import type { QuizQuestion } from '@/hooks/useQuizState';
import type { LessonCardDef, CardSection } from './topic-04-cards';
import type { AlgoProperty } from '@/components/PropertiesTable';
import type { ClozeLine } from '@/components/ClozeCodeExercise';

// ---------------------------------------------------------------------------
// Section groupings for progress bar
// ---------------------------------------------------------------------------

export const SECTIONS: CardSection[] = [
  { id: 'challenge', label: 'The Challenge', cardRange: [0, 2] },
  { id: 'skeleton', label: 'The Search Skeleton', cardRange: [3, 5] },
  { id: 'bfs', label: 'Breadth-First Search', cardRange: [6, 9] },
  { id: 'dfs', label: 'Depth-First Search', cardRange: [10, 12] },
  { id: 'ucs', label: 'Uniform-Cost Search', cardRange: [13, 15] },
  { id: 'bigpicture', label: 'The Big Picture', cardRange: [16, 19] },
  { id: 'lab', label: 'Lab 2', cardRange: [20, 22] },
];

// ---------------------------------------------------------------------------
// Card definitions
// ---------------------------------------------------------------------------

export const CARDS: LessonCardDef[] = [
  // --- The Challenge ---
  { id: 'lost-in-romania', title: 'Lost in Romania', sectionId: 'challenge', component: 'LostInRomania' },
  { id: 'search-anatomy', title: 'Anatomy of a Search Problem', sectionId: 'challenge', component: 'SearchAnatomy', autoComplete: true },
  { id: 'quiz-formulation', title: 'Quiz: Problem Formulation', sectionId: 'challenge', component: 'QuizFormulation' },

  // --- The Search Skeleton ---
  { id: 'meet-the-fringe', title: 'Meet the Fringe', sectionId: 'skeleton', component: 'MeetTheFringe' },
  { id: 'tree-search-template', title: 'The Universal Search Template', sectionId: 'skeleton', component: 'TreeSearchTemplate' },
  { id: 'quiz-foundations', title: 'Quiz: Search Foundations', sectionId: 'skeleton', component: 'QuizFoundations' },

  // --- Breadth-First Search ---
  { id: 'bfs-wave', title: 'BFS: The Wave', sectionId: 'bfs', component: 'BFSWave' },
  { id: 'be-bfs', title: 'Be the BFS', sectionId: 'bfs', component: 'BeBFS' },
  { id: 'bfs-properties', title: 'BFS Properties', sectionId: 'bfs', component: 'BFSProperties', autoComplete: true },
  { id: 'quiz-bfs', title: 'Quiz: BFS', sectionId: 'bfs', component: 'QuizBFS' },

  // --- Depth-First Search ---
  { id: 'dfs-plunge', title: 'DFS: The Plunge', sectionId: 'dfs', component: 'DFSPlunge' },
  { id: 'bfs-vs-dfs', title: 'BFS vs DFS: Side by Side', sectionId: 'dfs', component: 'BFSvsDFS' },
  { id: 'quiz-dfs', title: 'Quiz: DFS & IDS', sectionId: 'dfs', component: 'QuizDFS' },

  // --- Uniform-Cost Search ---
  { id: 'when-costs-differ', title: 'When Costs Differ', sectionId: 'ucs', component: 'WhenCostsDiffer', autoComplete: true },
  { id: 'ucs-in-action', title: 'UCS in Action', sectionId: 'ucs', component: 'UCSInAction' },
  { id: 'quiz-ucs', title: 'Quiz: UCS', sectionId: 'ucs', component: 'QuizUCS' },

  // --- The Big Picture ---
  { id: 'big-four', title: 'The Big Four', sectionId: 'bigpicture', component: 'BigFour', autoComplete: true },
  { id: 'algorithm-race', title: 'Algorithm Race', sectionId: 'bigpicture', component: 'AlgorithmRace' },
  { id: 'feel-exponential', title: 'Feel the Exponential', sectionId: 'bigpicture', component: 'FeelExponential' },
  { id: 'quiz-mastery', title: 'Quiz: Mastery', sectionId: 'bigpicture', component: 'QuizMastery' },

  // --- Lab 2 ---
  { id: 'lab-graph', title: 'Lab: Graph Traversal', sectionId: 'lab', component: 'LabGraph' },
  { id: 'lab-vacuum', title: 'Lab: Vacuum World', sectionId: 'lab', component: 'LabVacuum' },
  { id: 'lab-river', title: 'Lab: River Crossing', sectionId: 'lab', component: 'LabRiver' },
];

// ---------------------------------------------------------------------------
// Properties table data
// ---------------------------------------------------------------------------

export const BFS_PROPS: AlgoProperty[] = [
  { name: 'BFS', complete: 'Yes', optimal: 'Yes*', time: 'O(b^d)', space: 'O(b^d)' },
];

export const DFS_PROPS: AlgoProperty[] = [
  { name: 'DFS', complete: 'No', optimal: 'No', time: 'O(b^m)', space: 'O(bm)' },
];

export const UCS_PROPS: AlgoProperty[] = [
  { name: 'UCS', complete: 'Yes', optimal: 'Yes', time: 'O(b^{1+\\lfloor C^*/\\varepsilon \\rfloor})', space: 'O(b^{1+\\lfloor C^*/\\varepsilon \\rfloor})' },
];

export const ALL_PROPS: AlgoProperty[] = [
  { name: 'BFS', complete: 'Yes', optimal: 'Yes*', time: 'O(b^d)', space: 'O(b^d)' },
  { name: 'DFS', complete: 'No', optimal: 'No', time: 'O(b^m)', space: 'O(bm)' },
  { name: 'IDS', complete: 'Yes', optimal: 'Yes*', time: 'O(b^d)', space: 'O(bd)' },
  { name: 'UCS', complete: 'Yes', optimal: 'Yes', time: 'O(b^{1+\\lfloor C^*/\\varepsilon \\rfloor})', space: 'O(b^{1+\\lfloor C^*/\\varepsilon \\rfloor})' },
];

// ---------------------------------------------------------------------------
// Cloze exercise data
// ---------------------------------------------------------------------------

export const CLOZE_TREE_SEARCH: ClozeLine[] = [
  { type: 'static', content: 'function TREE-SEARCH(problem, fringe):' },
  { type: 'blank', id: 'ct-l1', answer: '  fringe.INSERT(MAKE-NODE(problem.initial-state))' },
  { type: 'static', content: '  loop:' },
  { type: 'blank', id: 'ct-l2', answer: '    if fringe is empty: return failure' },
  { type: 'blank', id: 'ct-l3', answer: '    node \u2190 fringe.REMOVE-FRONT()' },
  { type: 'blank', id: 'ct-l4', answer: '    if problem.GOAL-TEST(node.state): return node' },
  { type: 'blank', id: 'ct-l5', answer: '    fringe.INSERT-ALL(EXPAND(node, problem))' },
];

// ---------------------------------------------------------------------------
// Quiz data — 6 quizzes, 2 questions each
// ---------------------------------------------------------------------------

export const QUIZ_01: QuizQuestion[] = [
  {
    id: 't03-q01',
    question: "In a search problem, the 'state space' is:",
    options: [
      'The initial state only',
      'The set of all reachable states',
      'The goal state',
      'The set of actions',
    ],
    correctIndex: 1,
    explanation: 'The state space is the complete graph of all states reachable from the initial state through any sequence of actions.',
  },
  {
    id: 't03-q02',
    question: "For the Romania road trip problem, an 'action' is:",
    options: [
      'Arriving at Bucharest',
      'Driving from one city to a connected city',
      'The total distance traveled',
      'The straight-line distance to the goal',
    ],
    correctIndex: 1,
    explanation: 'Actions move the agent from one state to another. In this problem, each action is driving along a road from one city to a directly connected city.',
  },
];

export const QUIZ_02: QuizQuestion[] = [
  {
    id: 't03-q03',
    question: 'The fringe (frontier) in tree search contains:',
    options: [
      'All nodes in the tree',
      'Nodes that have been expanded',
      'Nodes that are waiting to be expanded',
      'Only the goal node',
    ],
    correctIndex: 2,
    explanation: 'The fringe contains nodes that have been generated but not yet expanded. These are the candidates for the next expansion step.',
  },
  {
    id: 't03-q04',
    question: 'What determines the difference between BFS, DFS, and UCS?',
    options: [
      'The tree structure',
      'How the next node is selected from the fringe',
      'The number of nodes in the tree',
      'The goal test function',
    ],
    correctIndex: 1,
    explanation: 'All uninformed search algorithms use the same basic tree search skeleton. The only difference is the order in which they select nodes from the fringe.',
  },
];

export const QUIZ_03: QuizQuestion[] = [
  {
    id: 't03-q05',
    question: 'In BFS, the fringe is implemented as:',
    options: [
      'A stack (LIFO)',
      'A queue (FIFO)',
      'A priority queue',
      'A random bag',
    ],
    correctIndex: 1,
    explanation: 'BFS uses a FIFO queue. New nodes go to the back of the queue, so shallower nodes are always expanded before deeper ones.',
  },
  {
    id: 't03-q06',
    question: 'BFS is optimal when:',
    options: [
      'All step costs are equal',
      'The tree is balanced',
      'The branching factor is small',
      'The goal is at maximum depth',
    ],
    correctIndex: 0,
    explanation: 'BFS finds the shallowest solution first. This is only guaranteed to be optimal when all step costs are equal (cost = 1 per step). With unequal costs, a deeper path might be cheaper.',
  },
];

export const QUIZ_04: QuizQuestion[] = [
  {
    id: 't03-q07',
    question: 'DFS can fail to find a solution when:',
    options: [
      'The goal is at the root',
      'The tree has infinite branches',
      'All step costs are equal',
      'The branching factor is 2',
    ],
    correctIndex: 1,
    explanation: 'DFS follows a single path to its maximum depth before backtracking. If a branch is infinitely deep, DFS can get stuck and never reach the goal on another branch.',
  },
  {
    id: 't03-q08',
    question: 'Iterative Deepening Search combines:',
    options: [
      "BFS's optimality with DFS's speed",
      "BFS's completeness and optimality with DFS's space efficiency",
      "DFS's completeness with BFS's memory",
      'Random search with systematic search',
    ],
    correctIndex: 1,
    explanation: "IDS runs DFS with increasing depth limits (1, 2, 3...). It finds the shallowest solution (like BFS) while using only O(bd) memory (like DFS).",
  },
];

export const QUIZ_05: QuizQuestion[] = [
  {
    id: 't03-q09',
    question: 'UCS selects the next node to expand based on:',
    options: [
      'Depth in the tree',
      'The heuristic estimate h(n)',
      'The total path cost g(n)',
      'Random selection',
    ],
    correctIndex: 2,
    explanation: 'UCS uses a priority queue ordered by g(n), the total cost of the path from the start to node n. This ensures it always expands the cheapest unexpanded node.',
  },
  {
    id: 't03-q10',
    question: 'UCS is guaranteed to find the optimal solution because:',
    options: [
      'It uses a heuristic',
      'It expands nodes in order of increasing path cost',
      'It explores all nodes',
      'It uses depth-first search',
    ],
    correctIndex: 1,
    explanation: 'By always expanding the node with the lowest path cost, UCS guarantees that when it first reaches the goal, no unexpanded path could be cheaper.',
  },
];

export const QUIZ_06: QuizQuestion[] = [
  {
    id: 't03-q11',
    question: 'If memory is your primary concern, which algorithm should you use?',
    options: ['BFS', 'DFS', 'IDS', 'UCS'],
    correctIndex: 2,
    explanation: "IDS uses O(bd) space\u2014the best of all four algorithms. It combines BFS's completeness with DFS's memory efficiency.",
  },
  {
    id: 't03-q12',
    question: 'All uninformed search algorithms share what limitation?',
    options: [
      'They use too much memory',
      "They can't handle weighted graphs",
      'They explore without any sense of direction toward the goal',
      'They always find suboptimal solutions',
    ],
    correctIndex: 2,
    explanation: "Uninformed search algorithms have no information about which direction the goal lies. They explore blindly, which leads to exponential time complexity. This motivates informed search (next topic).",
  },
];
