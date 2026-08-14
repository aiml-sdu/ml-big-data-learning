import type { Flashcard, ClozeTextExercise } from '@/types/study';

export const TOPIC_03_FLASHCARDS: Flashcard[] = [
  { id: 'fc-t03-01', topicId: 'topic-03', front: 'What is a state space?', back: 'The set of all possible states reachable from the initial state by any sequence of actions. Search algorithms explore this space to find a path from the initial state to a goal state.' },
  { id: 'fc-t03-02', topicId: 'topic-03', front: 'What are the five components of a search problem?', back: 'Initial state, actions (or successor function), transition model, goal test, and path cost function.' },
  { id: 'fc-t03-03', topicId: 'topic-03', front: 'What is the fringe (frontier)?', back: 'The set of nodes that have been generated but not yet expanded. The choice of which fringe node to expand next defines the search strategy.' },
  { id: 'fc-t03-04', topicId: 'topic-03', front: 'Tree search vs. graph search', back: 'Tree search can revisit states (risk of infinite loops). Graph search maintains an "explored set" (closed list) to avoid revisiting states, using more memory but guaranteeing termination on finite spaces.' },
  { id: 'fc-t03-05', topicId: 'topic-03', front: 'What is Breadth-First Search (BFS)?', back: 'Expands the shallowest unexpanded node first using a FIFO queue. Complete (finds a solution if one exists) and optimal for uniform-cost edges.' },
  { id: 'fc-t03-06', topicId: 'topic-03', front: 'BFS time and space complexity', back: 'Both $O(b^d)$, where $b$ is the branching factor and $d$ is the depth of the shallowest solution. Space is the main bottleneck.' },
  { id: 'fc-t03-07', topicId: 'topic-03', front: 'What is Depth-First Search (DFS)?', back: 'Expands the deepest unexpanded node first using a LIFO stack (or recursion). Uses $O(bm)$ memory (linear in max depth $m$), but is neither complete nor optimal in general.' },
  { id: 'fc-t03-08', topicId: 'topic-03', front: 'DFS time and space complexity', back: 'Time: $O(b^m)$ where $m$ is the maximum depth. Space: $O(bm)$ — only stores nodes along the current path plus their siblings.' },
  { id: 'fc-t03-09', topicId: 'topic-03', front: 'When does DFS fail?', back: 'In infinite state spaces (can go down forever without finding a goal) or when cycles exist without graph search. Not optimal — may find a deeper solution before a shallower one.' },
  { id: 'fc-t03-10', topicId: 'topic-03', front: 'What is Iterative Deepening Search (IDS)?', back: 'Repeatedly runs depth-limited search with increasing depth limit (0, 1, 2, ...). Combines BFS optimality/completeness with DFS memory efficiency — $O(bd)$ space.' },
  { id: 'fc-t03-11', topicId: 'topic-03', front: 'Why isn\'t IDS wasteful?', back: 'Most nodes are at the deepest level, so re-expanding shallower levels adds only $O(b^d)$ overhead — the same order as BFS. The extra cost factor is $\\frac{b}{b-1}$, which is small for typical $b$.' },
  { id: 'fc-t03-12', topicId: 'topic-03', front: 'What is Uniform-Cost Search (UCS)?', back: 'Expands the node with the lowest total path cost $g(n)$ using a priority queue. Optimal and complete (given non-negative step costs). Equivalent to BFS when all step costs are equal.' },
  { id: 'fc-t03-13', topicId: 'topic-03', front: 'UCS time and space complexity', back: '$O(b^{1+\\lfloor C^*/\\varepsilon \\rfloor})$ where $C^*$ is the optimal solution cost and $\\varepsilon$ is the minimum step cost. Can be much worse than BFS if there are many low-cost steps.' },
  { id: 'fc-t03-14', topicId: 'topic-03', front: 'What is "completeness" in search?', back: 'A search algorithm is complete if it is guaranteed to find a solution when one exists (given sufficient time and memory).' },
  { id: 'fc-t03-15', topicId: 'topic-03', front: 'What is "optimality" in search?', back: 'A search algorithm is optimal if it always finds a least-cost solution among all solutions.' },
  { id: 'fc-t03-16', topicId: 'topic-03', front: 'Queue (FIFO) vs. Stack (LIFO)', back: 'Queue (FIFO) is used by BFS — first generated, first expanded. Stack (LIFO) is used by DFS — last generated, first expanded. Priority queue (sorted by cost) is used by UCS.' },
  { id: 'fc-t03-17', topicId: 'topic-03', front: 'What is a "node" vs. a "state"?', back: 'A state is a representation of a configuration of the world. A node is a data structure in the search tree containing a state, parent pointer, action, path cost, and depth.' },
  { id: 'fc-t03-18', topicId: 'topic-03', front: 'What is the branching factor $b$?', back: 'The maximum number of successors of any node in the search tree. Higher branching factors lead to exponentially larger search spaces.' },
  { id: 'fc-t03-19', topicId: 'topic-03', front: 'Depth-limited search', back: 'DFS with a predetermined depth limit $l$ — nodes at depth $l$ are treated as having no successors. Solves DFS\'s incompleteness on infinite spaces but requires choosing the right limit.' },
  { id: 'fc-t03-20', topicId: 'topic-03', front: 'What is the explored set (closed list)?', back: 'A set of all previously expanded states in graph search. Before expanding a node, check if its state is in the explored set — if so, discard it to avoid infinite loops.' },
];

export const TOPIC_03_CLOZE: ClozeTextExercise[] = [
  {
    id: 'cz-t03-01',
    topicId: 'topic-03',
    template: 'BFS uses a {{b1}} queue and expands the {{b2}} node first. It is {{b3}} and optimal for uniform-cost edges, but requires {{b4}} memory.',
    blanks: [
      { id: 'b1', answer: 'FIFO' },
      { id: 'b2', answer: 'shallowest' },
      { id: 'b3', answer: 'complete' },
      { id: 'b4', answer: '$O(b^d)$' },
    ],
    distractors: ['LIFO', 'deepest', 'incomplete', '$O(bm)$', '$O(bd)$'],
  },
  {
    id: 'cz-t03-02',
    topicId: 'topic-03',
    template: 'DFS uses a {{b1}} stack and expands the {{b2}} node first. Its space complexity is only {{b3}}, but it is not {{b4}} and not optimal.',
    blanks: [
      { id: 'b1', answer: 'LIFO' },
      { id: 'b2', answer: 'deepest' },
      { id: 'b3', answer: '$O(bm)$' },
      { id: 'b4', answer: 'complete' },
    ],
    distractors: ['FIFO', 'shallowest', '$O(b^d)$', 'optimal'],
  },
  {
    id: 'cz-t03-03',
    topicId: 'topic-03',
    template: 'Uniform-Cost Search expands the node with the lowest {{b1}} using a {{b2}}. It is optimal when all step costs are {{b3}}. When all step costs are equal, UCS behaves identically to {{b4}}.',
    blanks: [
      { id: 'b1', answer: 'path cost' },
      { id: 'b2', answer: 'priority queue' },
      { id: 'b3', answer: 'non-negative' },
      { id: 'b4', answer: 'BFS' },
    ],
    distractors: ['heuristic', 'FIFO queue', 'positive', 'DFS', 'IDS'],
  },
  {
    id: 'cz-t03-04',
    topicId: 'topic-03',
    template: 'Iterative Deepening Search combines the {{b1}} of BFS with the {{b2}} of DFS. It runs depth-limited search with limits $0, 1, 2, \\ldots$ and uses only {{b3}} memory. The overhead of re-expanding nodes is a factor of {{b4}}, which is small.',
    blanks: [
      { id: 'b1', answer: 'completeness' },
      { id: 'b2', answer: 'space efficiency' },
      { id: 'b3', answer: '$O(bd)$' },
      { id: 'b4', answer: '$\\frac{b}{b-1}$' },
    ],
    distractors: ['optimality', 'speed', '$O(b^d)$', '$O(bm)$', '$b^2$'],
  },
  {
    id: 'cz-t03-05',
    topicId: 'topic-03',
    template: 'A search problem is defined by five components: {{b1}} state, actions, {{b2}} model, goal test, and {{b3}} function. The {{b4}} is the set of generated but not yet expanded nodes.',
    blanks: [
      { id: 'b1', answer: 'initial' },
      { id: 'b2', answer: 'transition' },
      { id: 'b3', answer: 'path cost' },
      { id: 'b4', answer: 'fringe' },
    ],
    distractors: ['goal', 'state', 'heuristic', 'explored set', 'branching factor'],
  },
];
