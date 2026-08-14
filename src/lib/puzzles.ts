// ---------------------------------------------------------------------------
// puzzles.ts – 8-puzzle logic for search demonstrations
// ---------------------------------------------------------------------------

export type PuzzleState = number[]; // 9 elements, 0 = blank

export const GOAL_STATE: PuzzleState = [1, 2, 3, 4, 5, 6, 7, 8, 0];

// Goal positions lookup: goalPos[tile] = index in GOAL_STATE
const goalPos: number[] = [];
for (let i = 0; i < 9; i++) {
  goalPos[GOAL_STATE[i]] = i;
}

export function getBlankIndex(state: PuzzleState): number {
  return state.indexOf(0);
}

export function swap(state: PuzzleState, i: number, j: number): PuzzleState {
  const next = [...state];
  next[i] = state[j];
  next[j] = state[i];
  return next;
}

export function stateToString(state: PuzzleState): string {
  return state.join(',');
}

export function isGoal(state: PuzzleState): boolean {
  for (let i = 0; i < 9; i++) {
    if (state[i] !== GOAL_STATE[i]) return false;
  }
  return true;
}

/**
 * Returns all states reachable by moving the blank tile one step
 * (up, down, left, right).
 */
export function getMoves(state: PuzzleState): PuzzleState[] {
  const blank = getBlankIndex(state);
  const row = Math.floor(blank / 3);
  const col = blank % 3;
  const moves: PuzzleState[] = [];

  // Up
  if (row > 0) moves.push(swap(state, blank, blank - 3));
  // Down
  if (row < 2) moves.push(swap(state, blank, blank + 3));
  // Left
  if (col > 0) moves.push(swap(state, blank, blank - 1));
  // Right
  if (col < 2) moves.push(swap(state, blank, blank + 1));

  return moves;
}

/**
 * h1: Number of misplaced tiles (excluding the blank).
 */
export function h1MisplacedTiles(state: PuzzleState): number {
  let count = 0;
  for (let i = 0; i < 9; i++) {
    if (state[i] !== 0 && state[i] !== GOAL_STATE[i]) {
      count++;
    }
  }
  return count;
}

/**
 * h2: Sum of Manhattan distances for each tile to its goal position.
 */
export function h2ManhattanDistance(state: PuzzleState): number {
  let total = 0;
  for (let i = 0; i < 9; i++) {
    const tile = state[i];
    if (tile === 0) continue;
    const currentRow = Math.floor(i / 3);
    const currentCol = i % 3;
    const goalIndex = goalPos[tile];
    const goalRow = Math.floor(goalIndex / 3);
    const goalCol = goalIndex % 3;
    total += Math.abs(currentRow - goalRow) + Math.abs(currentCol - goalCol);
  }
  return total;
}

/**
 * Checks if a puzzle state is solvable.
 * An 8-puzzle state is solvable iff the number of inversions is even.
 * An inversion is a pair (a, b) where a appears before b but a > b,
 * ignoring the blank (0).
 */
export function isSolvable(state: PuzzleState): boolean {
  let inversions = 0;
  for (let i = 0; i < 9; i++) {
    if (state[i] === 0) continue;
    for (let j = i + 1; j < 9; j++) {
      if (state[j] === 0) continue;
      if (state[i] > state[j]) inversions++;
    }
  }
  return inversions % 2 === 0;
}

/**
 * Generates a solvable puzzle by making random valid moves from the goal state.
 * @param difficulty Number of random moves: easy ~10, medium ~25, hard ~50.
 */
export function generateSolvablePuzzle(difficulty: number = 25): PuzzleState {
  let state = [...GOAL_STATE];
  let prevBlank = -1;

  for (let i = 0; i < difficulty; i++) {
    const blank = getBlankIndex(state);
    const row = Math.floor(blank / 3);
    const col = blank % 3;
    const candidates: number[] = [];

    if (row > 0) candidates.push(blank - 3); // up
    if (row < 2) candidates.push(blank + 3); // down
    if (col > 0) candidates.push(blank - 1); // left
    if (col < 2) candidates.push(blank + 1); // right

    // Avoid immediately undoing the last move
    const filtered = candidates.filter((c) => c !== prevBlank);
    const target = filtered.length > 0
      ? filtered[Math.floor(Math.random() * filtered.length)]
      : candidates[Math.floor(Math.random() * candidates.length)];

    prevBlank = blank;
    state = swap(state, blank, target);
  }

  return state;
}
