import {
  GOAL_STATE,
  isGoal,
  getMoves,
  h1MisplacedTiles,
  h2ManhattanDistance,
  isSolvable,
  swap,
} from '@/lib/puzzles';

describe('8-puzzle logic', () => {
  test('isGoal recognizes the goal state', () => {
    expect(isGoal(GOAL_STATE)).toBe(true);
  });

  test('isGoal rejects a non-goal state', () => {
    expect(isGoal([1, 2, 3, 4, 0, 5, 6, 7, 8])).toBe(false);
  });

  test('getMoves from center (index 4) = 4 moves', () => {
    // blank at index 4: [1,2,3,4,0,5,6,7,8]
    const state = [1, 2, 3, 4, 0, 5, 6, 7, 8];
    expect(getMoves(state)).toHaveLength(4);
  });

  test('getMoves from corner (index 0) = 2 moves', () => {
    // blank at index 0: [0,1,2,3,4,5,6,7,8]
    const state = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    expect(getMoves(state)).toHaveLength(2);
  });

  test('h1MisplacedTiles = 0 for goal', () => {
    expect(h1MisplacedTiles(GOAL_STATE)).toBe(0);
  });

  test('h1MisplacedTiles for known scrambled state', () => {
    // [1,3,2,4,5,6,7,8,0] — tiles 3 and 2 are swapped → 2 misplaced
    expect(h1MisplacedTiles([1, 3, 2, 4, 5, 6, 7, 8, 0])).toBe(2);
  });

  test('h2ManhattanDistance = 0 for goal', () => {
    expect(h2ManhattanDistance(GOAL_STATE)).toBe(0);
  });

  test('h2ManhattanDistance for known scrambled state', () => {
    // [1,3,2,4,5,6,7,8,0]: tile 3 at pos 1 (goal pos 2) = 1, tile 2 at pos 2 (goal pos 1) = 1 → total = 2
    expect(h2ManhattanDistance([1, 3, 2, 4, 5, 6, 7, 8, 0])).toBe(2);
  });

  test('isSolvable for goal state = true', () => {
    expect(isSolvable(GOAL_STATE)).toBe(true);
  });

  test('isSolvable for unsolvable state = false', () => {
    // Swapping 7 and 8 creates odd inversions
    expect(isSolvable([1, 2, 3, 4, 5, 6, 8, 7, 0])).toBe(false);
  });

  test('swap produces correct result', () => {
    const state = [1, 2, 3, 4, 5, 6, 7, 8, 0];
    const swapped = swap(state, 0, 1);
    expect(swapped).toEqual([2, 1, 3, 4, 5, 6, 7, 8, 0]);
    // Original unchanged
    expect(state[0]).toBe(1);
  });
});
