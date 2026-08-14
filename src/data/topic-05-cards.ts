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
  { id: 'motivation',  label: 'Beyond Search Trees',   cardRange: [0, 2]   },
  { id: 'hill-climb',  label: 'Hill Climbing',         cardRange: [3, 7]   },
  { id: 'sa',          label: 'Simulated Annealing',   cardRange: [8, 11]  },
  { id: 'ga',          label: 'Genetic Algorithms',    cardRange: [12, 16] },
  { id: 'ga-practice', label: 'GA in Practice',        cardRange: [17, 18] },
  { id: 'lab',         label: 'Lab 4',                 cardRange: [19, 19] },
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
  // --- Beyond Search Trees ---
  { id: 'why-local',        title: 'When Search Trees Fail',          sectionId: 'motivation',  component: 'WhyLocal' },
  { id: 'state-landscape',  title: 'The State-Space Landscape',       sectionId: 'motivation',  component: 'StateLandscape', autoComplete: true },
  { id: 'quiz-motivation',  title: 'Quiz: Local Search Basics',       sectionId: 'motivation',  component: 'QuizMotivation' },

  // --- Hill Climbing ---
  { id: 'everest-fog',      title: 'Everest in Thick Fog',            sectionId: 'hill-climb',  component: 'EverestFog' },
  { id: 'landscape-game',   title: 'Game: Climb the Landscape',       sectionId: 'hill-climb',  component: 'LandscapeGame' },
  { id: 'hc-algorithm',     title: 'The Hill Climbing Algorithm',     sectionId: 'hill-climb',  component: 'HCAlgorithm' },
  { id: 'hc-problems',      title: 'Getting Stuck',                   sectionId: 'hill-climb',  component: 'HCProblems' },
  { id: 'quiz-hc',          title: 'Quiz: Hill Climbing',             sectionId: 'hill-climb',  component: 'QuizHC' },

  // --- Simulated Annealing ---
  { id: 'sa-intro',         title: 'Escape the Local Optimum',        sectionId: 'sa',          component: 'SAIntro' },
  { id: 'sa-temperature',   title: 'The Temperature Schedule',        sectionId: 'sa',          component: 'SATemperature' },
  { id: 'sa-viz',           title: 'Annealing in Action',             sectionId: 'sa',          component: 'SAViz' },
  { id: 'quiz-sa',          title: 'Quiz: Simulated Annealing',       sectionId: 'sa',          component: 'QuizSA' },

  // --- Genetic Algorithms ---
  { id: 'ga-darwin',        title: 'Darwin Meets Optimization',       sectionId: 'ga',          component: 'GADarwin' },
  { id: 'ga-mechanics',     title: 'Selection, Crossover, Mutation',  sectionId: 'ga',          component: 'GAMechanics' },
  { id: 'ga-evolution-game',title: 'Game: Evolve a Solution',         sectionId: 'ga',          component: 'GAEvolutionGame' },
  { id: 'ga-algorithm',     title: 'The Full GA Loop',                sectionId: 'ga',          component: 'GAAlgorithm' },
  { id: 'quiz-ga',          title: 'Quiz: Genetic Algorithms',        sectionId: 'ga',          component: 'QuizGA' },

  // --- GA in Practice ---
  { id: 'ga-nqueens',       title: 'GA for N-Queens',                 sectionId: 'ga-practice', component: 'GANQueens' },
  { id: 'quiz-mastery',     title: 'Quiz: Mastery',                   sectionId: 'ga-practice', component: 'QuizMastery' },

  // --- Lab 4 ---
  { id: 'lab4',             title: 'Lab 4: Exercises',                sectionId: 'lab',         component: 'Lab4' },
];

// ---------------------------------------------------------------------------
// Quiz data
// ---------------------------------------------------------------------------

export const QUIZ_51: QuizQuestion[] = [
  {
    id: 't05-q01',
    question: 'Local search algorithms do NOT maintain a:',
    options: [
      'Current state',
      'Search tree',
      'Objective function value',
      'Neighbor function',
    ],
    correctIndex: 1,
    explanation: 'Local search algorithms only keep track of the current state (and sometimes the best state seen). They do not build or store a search tree, which is what makes them memory-efficient — using O(1) space.',
  },
  {
    id: 't05-q02',
    question: 'Which problem is BEST suited for local search?',
    options: [
      'Finding the shortest path in a small graph',
      'Solving a 4-puzzle',
      'Placing 1,000 queens on a 1,000×1,000 board with no attacks',
      'Counting all nodes in a tree',
    ],
    correctIndex: 2,
    explanation: 'Local search excels when the state space is enormous and you only care about the goal state, not the path. Placing 1,000 queens has roughly 10^3000 states — tree search is infeasible, but local search can solve it in under a minute.',
  },
];

export const QUIZ_52: QuizQuestion[] = [
  {
    id: 't05-q03',
    question: 'Hill climbing is guaranteed to find the global optimum.',
    options: ['True', 'False'],
    correctIndex: 1,
    explanation: 'Hill climbing can get stuck at local optima, plateaus, and ridges. It is a greedy algorithm that only moves to neighbors with better values, so it has no mechanism to escape local optima.',
  },
  {
    id: 't05-q04',
    question: 'Random-restart hill climbing addresses the problem of:',
    options: [
      'High memory usage',
      'Slow computation',
      'Getting stuck at local optima',
      'Not having a heuristic function',
    ],
    correctIndex: 2,
    explanation: 'By running hill climbing from multiple random starting points, random-restart HC increases the chance of starting in the basin of the global optimum. If each run has probability p of finding the global optimum, the expected number of restarts is 1/p.',
  },
];

export const QUIZ_53: QuizQuestion[] = [
  {
    id: 't05-q05',
    question: 'As T → 0, simulated annealing behaves like:',
    options: [
      'Random walk',
      'Breadth-first search',
      'Hill climbing',
      'Genetic algorithm',
    ],
    correctIndex: 2,
    explanation: 'When temperature T is very low, the acceptance probability exp(ΔE/T) for worse moves approaches 0. The algorithm only accepts improving moves — exactly like hill climbing.',
  },
  {
    id: 't05-q06',
    question: 'What is P(accept) for ΔE = −5, T = 10?',
    options: [
      '≈ 0.01',
      '≈ 0.37',
      '≈ 0.61',
      '≈ 0.95',
    ],
    correctIndex: 2,
    explanation: 'P(accept) = exp(ΔE/T) = exp(−5/10) = exp(−0.5) ≈ 0.607. At this temperature, there is about a 61% chance of accepting a move that is 5 units worse.',
  },
];

export const QUIZ_54: QuizQuestion[] = [
  {
    id: 't05-q07',
    question: 'In roulette wheel selection, an individual with fitness 30 in a population with total fitness 100 has selection probability:',
    options: ['10%', '30%', '50%', '70%'],
    correctIndex: 1,
    explanation: 'Roulette wheel (fitness-proportionate) selection gives each individual a probability equal to its fitness divided by the total fitness: 30/100 = 30%.',
  },
  {
    id: 't05-q08',
    question: 'Single-point crossover at position 3 on parents [1,0,1,1,0] and [0,1,0,0,1] produces:',
    options: [
      '[1,0,1,0,1] and [0,1,0,1,0]',
      '[0,1,0,1,0] and [1,0,1,0,1]',
      '[1,0,0,0,1] and [0,1,1,1,0]',
      '[1,1,1,1,1] and [0,0,0,0,0]',
    ],
    correctIndex: 0,
    explanation: 'Crossover at position 3 takes the first 3 bits from one parent and the remaining 2 from the other: [1,0,1] + [0,1] = [1,0,1,0,1] and [0,1,0] + [1,0] = [0,1,0,1,0].',
  },
  {
    id: 't05-q09',
    question: 'The primary purpose of mutation in a GA is to:',
    options: [
      'Speed up convergence',
      'Maintain genetic diversity',
      'Improve crossover results',
      'Reduce population size',
    ],
    correctIndex: 1,
    explanation: 'Mutation introduces random changes that prevent the population from converging prematurely to a local optimum. It ensures that the GA can explore regions of the search space that crossover alone might miss.',
  },
];

export const QUIZ_55: QuizQuestion[] = [
  {
    id: 't05-q10',
    question: 'Which local search algorithm maintains a population of solutions?',
    options: [
      'Hill climbing',
      'Simulated annealing',
      'Genetic algorithm',
      'Random restart',
    ],
    correctIndex: 2,
    explanation: 'Genetic algorithms are unique among these algorithms in maintaining an entire population of candidate solutions that evolve together through selection, crossover, and mutation.',
  },
  {
    id: 't05-q11',
    question: 'Simulated annealing is guaranteed to find the global optimum if:',
    options: [
      'The initial temperature is very high',
      'The cooling schedule is slow enough (theoretically)',
      'The step size is very small',
      'It runs for exactly 1000 iterations',
    ],
    correctIndex: 1,
    explanation: 'Theoretically, SA finds the global optimum with probability approaching 1 if the temperature decreases slowly enough (logarithmically). In practice, this would take impractically long, so we use faster cooling schedules that trade optimality for speed.',
  },
  {
    id: 't05-q12',
    question: 'For 8-Queens GA, single-point crossover at position 4 on [3,1,6,2,7,4,0,5] and [5,2,0,6,4,7,1,3] produces a child starting with:',
    options: [
      '[3,1,6,2,4,7,1,3]',
      '[5,2,0,6,7,4,0,5]',
      '[3,1,6,2,7,4,1,3]',
      '[5,2,6,2,7,4,0,5]',
    ],
    correctIndex: 0,
    explanation: 'Crossover at position 4 takes the first 4 genes from parent 1 [3,1,6,2] and the last 4 genes from parent 2 [4,7,1,3], producing child [3,1,6,2,4,7,1,3].',
  },
];
