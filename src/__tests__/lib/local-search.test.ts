import {
  nQueensFitness,
  generateLandscape,
  hillClimb,
  simulatedAnnealing,
  type LocalSearchState,
} from '@/lib/local-search';

function runToEnd(gen: Generator<LocalSearchState>): LocalSearchState {
  let last: LocalSearchState | undefined;
  for (const state of gen) last = state;
  return last!;
}

describe('nQueensFitness', () => {
  test('known 8-queens solution = 28 (no attacks)', () => {
    expect(nQueensFitness([0, 4, 7, 5, 2, 6, 1, 3])).toBe(28);
  });

  test('all same column = 0 (max attacks)', () => {
    expect(nQueensFitness([0, 0, 0, 0, 0, 0, 0, 0])).toBe(0);
  });
});

describe('generateLandscape', () => {
  test('same seed → same output (deterministic)', () => {
    const f1 = generateLandscape(5, 100, 42);
    const f2 = generateLandscape(5, 100, 42);
    for (const x of [0, 10, 25, 50, 75, 100]) {
      expect(f1(x)).toBe(f2(x));
    }
  });
});

describe('hillClimb', () => {
  test('terminates with stuck or last accept', () => {
    const landscape = generateLandscape(3, 100, 42);
    const result = runToEnd(hillClimb(landscape, 10, 2));
    expect(['stuck', 'accept']).toContain(result.type);
  });
});

describe('simulatedAnnealing', () => {
  test('same seed → same final state (deterministic)', () => {
    const landscape = generateLandscape(3, 100, 42);
    const r1 = runToEnd(simulatedAnnealing(landscape, 10, 5, 100, 0.95, 100, 123));
    const r2 = runToEnd(simulatedAnnealing(landscape, 10, 5, 100, 0.95, 100, 123));
    expect(r1.current).toBe(r2.current);
    expect(r1.currentValue).toBe(r2.currentValue);
  });
});
