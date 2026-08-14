import {
  SUDOKU_EASY_PUZZLE,
  collectBacktrackingSteps,
  createAustraliaMapCSP,
  createSudokuCSP,
  getAssignmentViolations,
  runAC3,
  solveBacktracking,
  type AustraliaColor,
  type CSPValue,
  type DomainMap,
} from '@/lib/csp';

function countSingletons<T extends CSPValue>(domains: DomainMap<T>): number {
  return Object.values(domains).filter((values) => values.length === 1).length;
}

function countSudokuSolutions(grid: number[][]): number {
  const board = grid.map((row) => [...row]);
  const rows = Array.from({ length: 9 }, () => new Set<number>());
  const cols = Array.from({ length: 9 }, () => new Set<number>());
  const boxes = Array.from({ length: 9 }, () => new Set<number>());

  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const value = board[row][col];
      if (value === 0) continue;
      rows[row].add(value);
      cols[col].add(value);
      boxes[Math.floor(row / 3) * 3 + Math.floor(col / 3)].add(value);
    }
  }

  function candidates(row: number, col: number): number[] {
    const box = Math.floor(row / 3) * 3 + Math.floor(col / 3);
    const values: number[] = [];
    for (let value = 1; value <= 9; value++) {
      if (!rows[row].has(value) && !cols[col].has(value) && !boxes[box].has(value)) {
        values.push(value);
      }
    }
    return values;
  }

  let solutions = 0;

  function search() {
    let bestRow = -1;
    let bestCol = -1;
    let bestCandidates: number[] | null = null;

    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col] !== 0) continue;
        const nextCandidates = candidates(row, col);
        if (nextCandidates.length === 0) return;
        if (!bestCandidates || nextCandidates.length < bestCandidates.length) {
          bestRow = row;
          bestCol = col;
          bestCandidates = nextCandidates;
          if (nextCandidates.length === 1) break;
        }
      }
    }

    if (!bestCandidates) {
      solutions++;
      return;
    }

    const box = Math.floor(bestRow / 3) * 3 + Math.floor(bestCol / 3);
    for (const value of bestCandidates) {
      board[bestRow][bestCol] = value;
      rows[bestRow].add(value);
      cols[bestCol].add(value);
      boxes[box].add(value);

      search();
      if (solutions > 1) return;

      board[bestRow][bestCol] = 0;
      rows[bestRow].delete(value);
      cols[bestCol].delete(value);
      boxes[box].delete(value);
    }
  }

  search();
  return solutions;
}

describe('CSP helpers', () => {
  test('AC-3 prunes Australia map domains after WA=red and NT=green', () => {
    const problem = createAustraliaMapCSP();
    const domains: DomainMap<AustraliaColor> = {
      ...problem.domains,
      WA: ['red'],
      NT: ['green'],
    } as DomainMap<AustraliaColor>;

    const result = runAC3<AustraliaColor>(problem, domains);
    expect(result.consistent).toBe(true);
    expect(result.domains.SA).toEqual(['blue']);
    expect(result.domains.Q).toEqual(['red']);
  });

  test('backtracking finds a consistent Australia coloring', () => {
    const problem = createAustraliaMapCSP();
    const solution = solveBacktracking(problem, {
      useMRV: true,
      useLCV: true,
      forwardChecking: true,
    });

    expect(solution).not.toBeNull();
    expect(Object.keys(solution!)).toHaveLength(problem.variables.length);
    expect(getAssignmentViolations<AustraliaColor>(problem, solution!)).toEqual([]);
  });

  test('lesson Sudoku puzzle needs search after AC-3', () => {
    const givens = SUDOKU_EASY_PUZZLE.flat().filter((value) => value !== 0).length;
    const problem = createSudokuCSP(SUDOKU_EASY_PUZZLE);
    const ac3 = runAC3(problem, problem.domains);

    expect(countSingletons(ac3.domains)).toBeGreaterThan(givens);
    expect(countSingletons(ac3.domains)).toBeLessThan(81);
  });

  test('lesson Sudoku puzzle has a unique solution and produces a nontrivial search trace', () => {
    const problem = createSudokuCSP(SUDOKU_EASY_PUZZLE);
    const trace = collectBacktrackingSteps(problem, {
      useMRV: true,
      useLCV: true,
      forwardChecking: true,
      useAC3: true,
    });
    const solution = solveBacktracking(problem, {
      useMRV: true,
      useLCV: true,
      forwardChecking: true,
      useAC3: true,
    });

    expect(solution).not.toBeNull();
    expect(Object.keys(solution!)).toHaveLength(81);
    expect(trace.steps.length).toBeGreaterThan(20);
    expect(countSudokuSolutions(SUDOKU_EASY_PUZZLE)).toBe(1);
  });
});
