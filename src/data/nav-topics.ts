export interface NavSection {
  id: string;
  number: string;
  title: string;
}

export interface NavTopic {
  id: string;
  number: number;
  title: string;
  sections: NavSection[];
  locked?: boolean;
  countInProgress?: boolean;
}

export const NAV_TOPICS: NavTopic[] = [
  {
    id: 'welcome',
    number: 0,
    title: 'Welcome',
    sections: [],
  },
  {
    id: 'topic-01',
    number: 1,
    title: 'Introduction to AI',
    sections: [
      { id: 'hook', number: '1.1', title: 'The AI Pattern' },
      { id: 'approaches', number: '1.2', title: 'Four Approaches' },
      { id: 'turing', number: '1.3', title: 'Turing & Critics' },
      { id: 'history', number: '1.4', title: 'AI History' },
      { id: 'today', number: '1.5', title: 'AI Today' },
      { id: 'lab', number: 'Lab', title: 'Lab 1a' },
    ],
  },
  {
    id: 'topic-02',
    number: 2,
    title: 'Intelligent Agents',
    sections: [
      { id: 'hook', number: '2.1', title: 'Introduction' },
      { id: 'design', number: '2.2', title: 'Rationality & Design' },
      { id: 'environments', number: '2.3', title: 'Environments' },
      { id: 'architectures', number: '2.4', title: 'Architectures' },
      { id: 'synthesis', number: '2.5', title: 'Synthesis' },
      { id: 'lab', number: 'Lab', title: 'Lab 1b' },
    ],
  },
  {
    id: 'topic-03',
    number: 3,
    title: 'Solving Problems by Searching',
    sections: [
      { id: 'challenge', number: '3.1', title: 'The Challenge' },
      { id: 'skeleton', number: '3.2', title: 'Search Skeleton' },
      { id: 'bfs', number: '3.3', title: 'BFS' },
      { id: 'dfs', number: '3.4', title: 'DFS & IDS' },
      { id: 'ucs', number: '3.5', title: 'UCS' },
      { id: 'bigpicture', number: '3.6', title: 'The Big Picture' },
      { id: 'lab', number: 'Lab', title: 'Lab 2' },
    ],
  },
  {
    id: 'topic-04',
    number: 4,
    title: 'Informed Search',
    sections: [
      { id: 'heuristics', number: '4.1', title: 'Heuristics' },
      { id: 'greedy', number: '4.2', title: 'Greedy Best-First' },
      { id: 'astar', number: '4.3', title: 'A* Search' },
      { id: 'admissibility', number: '4.4', title: 'Admissibility' },
      { id: 'design', number: '4.5', title: 'Heuristic Design' },
      { id: 'playground', number: '4.6', title: 'Playground' },
      { id: 'beyond', number: '4.7', title: 'Beyond A*' },
      { id: 'lab', number: 'Lab', title: 'Lab 3' },
    ],
  },
  {
    id: 'topic-05',
    number: 5,
    title: 'Local Search',
    locked: false,
    sections: [
      { id: 'motivation', number: '5.1', title: 'Beyond Search Trees' },
      { id: 'hill-climb', number: '5.2', title: 'Hill Climbing' },
      { id: 'sa', number: '5.3', title: 'Simulated Annealing' },
      { id: 'ga', number: '5.4', title: 'Genetic Algorithms' },
      { id: 'ga-practice', number: '5.5', title: 'GA in Practice' },
      { id: 'lab', number: 'Lab', title: 'Lab 4' },
    ],
  },
  {
    id: 'topic-06',
    number: 6,
    title: 'Adversarial Search',
    locked: false,
    sections: [
      { id: 'games', number: '6.1', title: 'Games & Competition' },
      { id: 'minimax', number: '6.2', title: 'Game Trees & Minimax' },
      { id: 'alpha-beta', number: '6.3', title: 'Alpha-Beta Pruning' },
      { id: 'beyond', number: '6.4', title: 'Beyond Perfect Play' },
      { id: 'history', number: '6.5', title: 'Historical Milestones' },
      { id: 'lab', number: 'Lab', title: 'Lab 5' },
    ],
  },
  {
    id: 'topic-07',
    number: 7,
    title: 'Constraint Satisfaction Problems',
    locked: false,
    sections: [
      { id: 'intro', number: '7.1', title: 'A New Kind of Problem' },
      { id: 'map-coloring', number: '7.2', title: 'Map Coloring' },
      { id: 'backtracking', number: '7.3', title: 'Backtracking Search' },
      { id: 'smarter', number: '7.4', title: 'Smarter Backtracking' },
      { id: 'real-world', number: '7.5', title: 'CSP in the Real World' },
      { id: 'lab', number: 'Lab', title: 'Lab 6' },
    ],
  },
  {
    id: 'topic-08',
    number: 8,
    title: 'Probability & Bayesian Networks',
    locked: false,
    sections: [
      { id: 'uncertainty', number: '8.1', title: 'Uncertainty in AI' },
      { id: 'bayes', number: '8.2', title: "Bayes' Rule" },
      { id: 'joint', number: '8.3', title: 'Joint Distributions' },
      { id: 'independence', number: '8.4', title: 'Independence' },
      { id: 'bayesnets', number: '8.5', title: 'Bayesian Networks' },
      { id: 'lab', number: 'Lab', title: 'Lab 7' },
    ],
  },
  {
    id: 'topic-09',
    number: 9,
    title: 'Hidden Markov Models',
    locked: false,
    sections: [
      { id: 'markov', number: '9.1', title: 'Markov Chains' },
      { id: 'hmm', number: '9.2', title: 'Hidden Markov Models' },
      { id: 'forward', number: '9.3', title: 'Forward Algorithm' },
      { id: 'viterbi', number: '9.4', title: 'Viterbi Algorithm' },
      { id: 'summary', number: '9.5', title: 'Three Problems' },
      { id: 'lab', number: 'Lab', title: 'Lab 9' },
    ],
  },
  {
    id: 'topic-10',
    number: 10,
    title: 'Introduction to ML and Classification',
    locked: false,
    sections: [
      { id: 'why', number: '10.1', title: 'Introduction to ML' },
      { id: 'classification', number: '10.2', title: 'Classification' },
    ],
  },
  {
    id: 'topic-11',
    number: 11,
    title: 'Regression',
    sections: [
      { id: 'basics', number: '11.1', title: 'Regression Basics' },
      { id: 'multi', number: '11.2', title: 'Multiple Regression' },
      { id: 'fit', number: '11.3', title: 'Fit Quality' },
    ],
  },
  {
    id: 'topic-12',
    number: 12,
    title: 'Clustering',
    locked: false,
    sections: [
      { id: 'seeing', number: '12.1', title: 'Seeing Clusters' },
      { id: 'kmeans', number: '12.2', title: 'K-Means' },
      { id: 'hierarchical', number: '12.3', title: 'Hierarchical Clustering' },
      { id: 'dbscan', number: '12.4', title: 'DBSCAN' },
      { id: 'validity', number: '12.5', title: 'Validating Clusters' },
    ],
  },
  {
    id: 'ml-setup',
    number: 0,
    title: 'ML Setup (Conda)',
    countInProgress: false,
    sections: [
      { id: 'why', number: '1', title: 'Why Environments Matter' },
      { id: 'env', number: '2', title: 'Create and Activate' },
      { id: 'packages', number: '3', title: 'Install Notebook Tools' },
      { id: 'notebook', number: '4', title: 'Launch the Notebook' },
    ],
  },
];
