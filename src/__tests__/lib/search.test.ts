import { bfs, dfs, ucs, astar, greedy, ids, type SearchState } from '@/lib/search';
import { getNeighbors, CITIES } from '@/lib/romania-graph';

function runToEnd(gen: Generator<SearchState>): SearchState {
  let last: SearchState | undefined;
  for (const state of gen) last = state;
  return last!;
}

const sldHeuristic = (node: string) => CITIES[node]?.hSLD ?? Infinity;

describe('search algorithms on Romania graph', () => {
  test('BFS Arad→Bucharest finds shallowest path', () => {
    const result = runToEnd(bfs('Arad', 'Bucharest', getNeighbors));
    expect(result.type).toBe('solution');
    expect(result.path).toEqual(['Arad', 'Sibiu', 'Fagaras', 'Bucharest']);
  });

  test('DFS Arad→Bucharest finds a valid path', () => {
    const result = runToEnd(dfs('Arad', 'Bucharest', getNeighbors));
    expect(result.type).toBe('solution');
    expect(result.path![0]).toBe('Arad');
    expect(result.path![result.path!.length - 1]).toBe('Bucharest');
  });

  test('UCS Arad→Bucharest optimal cost = 418', () => {
    const result = runToEnd(ucs('Arad', 'Bucharest', getNeighbors));
    expect(result.type).toBe('solution');
    expect(result.cost).toBe(418);
    expect(result.path).toEqual(['Arad', 'Sibiu', 'Rimnicu Vilcea', 'Pitesti', 'Bucharest']);
  });

  test('A* with SLD heuristic optimal cost = 418', () => {
    const result = runToEnd(astar('Arad', 'Bucharest', getNeighbors, sldHeuristic));
    expect(result.type).toBe('solution');
    expect(result.cost).toBe(418);
  });

  test('IDS Arad→Sibiu finds solution at depth 1', () => {
    const result = runToEnd(ids('Arad', 'Sibiu', getNeighbors));
    expect(result.type).toBe('solution');
    expect(result.path).toEqual(['Arad', 'Sibiu']);
  });

  test('BFS on disconnected graph yields failure', () => {
    const isolated = (_node: string) => [] as { city: string; cost: number }[];
    const result = runToEnd(bfs('Arad', 'Bucharest', isolated));
    expect(result.type).toBe('failure');
  });

  test('Greedy cost >= 418 (known suboptimal with SLD heuristic)', () => {
    const result = runToEnd(greedy('Arad', 'Bucharest', getNeighbors, sldHeuristic));
    expect(result.type).toBe('solution');
    expect(result.cost!).toBeGreaterThanOrEqual(418);
  });
});
