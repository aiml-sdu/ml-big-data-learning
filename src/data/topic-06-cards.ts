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
  { id: 'games',        label: 'Games & Competition',       cardRange: [0, 2]   },
  { id: 'minimax',      label: 'Game Trees & Minimax',      cardRange: [3, 7]   },
  { id: 'alpha-beta',   label: 'Alpha-Beta Pruning',        cardRange: [8, 12]  },
  { id: 'beyond',       label: 'Beyond Perfect Play',       cardRange: [13, 16] },
  { id: 'history',      label: 'Historical Milestones',     cardRange: [17, 18] },
  { id: 'lab',          label: 'Lab 5',                     cardRange: [19, 19] },
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
  // --- Games & Competition ---
  { id: 'why-games',      title: 'Why Study Games?',                sectionId: 'games',      component: 'WhyGames' },
  { id: 'game-taxonomy',  title: 'A Taxonomy of Games',             sectionId: 'games',      component: 'GameTaxonomy', autoComplete: true },
  { id: 'quiz-games',     title: 'Quiz: Game Foundations',          sectionId: 'games',      component: 'QuizGames' },

  // --- Game Trees & Minimax ---
  { id: 'vs-search',      title: 'Games vs Single-Agent Search',    sectionId: 'minimax',    component: 'VsSearch' },
  { id: 'ttt-tree',       title: 'The Tic-Tac-Toe Game Tree',      sectionId: 'minimax',    component: 'TTTTree', autoComplete: true },
  { id: 'minimax-idea',   title: 'The Minimax Algorithm',           sectionId: 'minimax',    component: 'MinimaxIdea' },
  { id: 'be-minimax',     title: 'Game: Be the Minimax',            sectionId: 'minimax',    component: 'BeMinimax' },
  { id: 'quiz-minimax',   title: 'Quiz: Minimax',                   sectionId: 'minimax',    component: 'QuizMinimax' },

  // --- Alpha-Beta Pruning ---
  { id: 'ab-motivation',  title: 'The Cost of Perfection',          sectionId: 'alpha-beta', component: 'ABMotivation' },
  { id: 'ab-algorithm',   title: 'Alpha-Beta Pruning',              sectionId: 'alpha-beta', component: 'ABAlgorithm' },
  { id: 'ab-walkthrough', title: 'Step-by-Step Pruning',            sectionId: 'alpha-beta', component: 'ABWalkthrough' },
  { id: 'coins-game',     title: 'Game: Coins Duel',                sectionId: 'alpha-beta', component: 'CoinsGame' },
  { id: 'quiz-ab',        title: 'Quiz: Alpha-Beta',                sectionId: 'alpha-beta', component: 'QuizAB' },

  // --- Beyond Perfect Play ---
  { id: 'depth-limits',   title: 'Depth-Limited Search & Eval',     sectionId: 'beyond',     component: 'DepthLimits' },
  { id: 'chance-nodes',   title: 'Games of Chance',                 sectionId: 'beyond',     component: 'ChanceNodes', autoComplete: true },
  { id: 'ttt-play',       title: 'Play: Tic-Tac-Toe vs AI',        sectionId: 'beyond',     component: 'TTTPlay' },
  { id: 'quiz-beyond',    title: 'Quiz: Beyond Minimax',            sectionId: 'beyond',     component: 'QuizBeyond' },

  // --- Historical Milestones ---
  { id: 'history',        title: 'From Zermelo to AlphaGo',         sectionId: 'history',    component: 'History', autoComplete: true },
  { id: 'quiz-mastery',   title: 'Quiz: Mastery',                   sectionId: 'history',    component: 'QuizMastery' },

  // --- Lab 5 ---
  { id: 'lab5',           title: 'Lab 5: Exercises',                sectionId: 'lab',        component: 'Lab5' },
];

// ---------------------------------------------------------------------------
// Quiz data
// ---------------------------------------------------------------------------

export const QUIZ_61: QuizQuestion[] = [
  {
    id: 't06-q01',
    question: 'Which of the following is NOT a property of chess?',
    options: [
      'Deterministic',
      'Perfect information',
      'Imperfect information',
      'Zero-sum',
    ],
    correctIndex: 2,
    explanation: 'Chess is deterministic, has perfect information (both players see the full board), and is zero-sum (one player\'s gain is the other\'s loss). It does NOT have imperfect information.',
  },
  {
    id: 't06-q02',
    question: 'In a zero-sum game, if Player 1 receives utility +5, Player 2 receives:',
    options: ['+5', '0', '-5', 'It depends on the game'],
    correctIndex: 2,
    explanation: 'In a zero-sum game, the utilities sum to zero. If Player 1 gets +5, Player 2 must get -5.',
  },
];

export const QUIZ_62: QuizQuestion[] = [
  {
    id: 't06-q03',
    question: 'The MAX player in minimax always:',
    options: [
      'Picks the move with the highest minimax value',
      'Picks the move with the lowest minimax value',
      'Picks a random move',
      'Picks the move closest to zero',
    ],
    correctIndex: 0,
    explanation: 'The MAX player maximizes utility, so it always picks the child with the highest minimax value.',
  },
  {
    id: 't06-q04',
    question: 'Given a MAX node with two MIN children whose minimax values are 3 and 7, the MAX node\'s value is:',
    options: ['3', '5', '7', '10'],
    correctIndex: 2,
    explanation: 'MAX picks the child with the highest value: max(3, 7) = 7.',
  },
  {
    id: 't06-q05',
    question: 'Minimax is optimal against:',
    options: [
      'A random opponent',
      'Any opponent',
      'An optimal opponent',
      'Only a suboptimal opponent',
    ],
    correctIndex: 2,
    explanation: 'Minimax computes the optimal strategy assuming the opponent also plays optimally. Against a suboptimal opponent, minimax might not be the most exploitative strategy, but it\'s never worse than optimal.',
  },
];

export const QUIZ_63: QuizQuestion[] = [
  {
    id: 't06-q06',
    question: 'Alpha-beta pruning always returns the same result as minimax.',
    options: ['True', 'False'],
    correctIndex: 0,
    explanation: 'Alpha-beta pruning is an optimization of minimax — it prunes branches that cannot affect the final decision, so the result is always identical to full minimax.',
  },
  {
    id: 't06-q07',
    question: 'With perfect move ordering, alpha-beta reduces the effective branching factor from b to approximately:',
    options: [
      'b/2',
      '√b',
      'b²',
      'log(b)',
    ],
    correctIndex: 1,
    explanation: 'With perfect ordering, alpha-beta examines O(b^(m/2)) nodes instead of O(b^m), effectively reducing the branching factor to √b. This doubles the searchable depth for the same computation.',
  },
];

export const QUIZ_64: QuizQuestion[] = [
  {
    id: 't06-q08',
    question: 'Depth-limited minimax replaces utility at the cutoff with:',
    options: [
      'A random value',
      'An evaluation function h(s)',
      'The depth limit itself',
      'Zero',
    ],
    correctIndex: 1,
    explanation: 'When the depth limit is reached, the algorithm uses an evaluation function h(s) to estimate the utility of non-terminal states, rather than searching deeper.',
  },
  {
    id: 't06-q09',
    question: 'At a chance node with two equally likely outcomes having values 4 and 10, the node\'s value is:',
    options: ['4', '7', '10', '14'],
    correctIndex: 1,
    explanation: 'Chance nodes compute the expected value: (0.5 × 4) + (0.5 × 10) = 7.',
  },
  {
    id: 't06-q10',
    question: 'In chess material evaluation, what is the value of a position with an extra Queen (9) and missing a Rook (5)?',
    options: ['+4', '+5', '+9', '+14'],
    correctIndex: 0,
    explanation: 'Material advantage = gain - loss = 9 - 5 = +4 for the side with the extra Queen.',
  },
];

export const QUIZ_65: QuizQuestion[] = [
  {
    id: 't06-q11',
    question: 'Deep Blue\'s primary approach to chess was:',
    options: [
      'Pure neural network evaluation',
      'Massive alpha-beta search with handcrafted evaluation',
      'Monte Carlo Tree Search',
      'Reinforcement learning',
    ],
    correctIndex: 1,
    explanation: 'Deep Blue (1997) used specialized hardware to perform massive alpha-beta search (200 million positions/second) combined with handcrafted evaluation functions tuned by chess grandmasters.',
  },
  {
    id: 't06-q12',
    question: 'With perfect play from both sides, tic-tac-toe always ends in:',
    options: [
      'X wins',
      'O wins',
      'A draw',
      'It depends on who goes first',
    ],
    correctIndex: 2,
    explanation: 'Tic-tac-toe is a solved game. With perfect play from both sides, it always ends in a draw. The minimax value of the root is 0.',
  },
];
