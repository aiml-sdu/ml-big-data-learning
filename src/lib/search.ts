// ---------------------------------------------------------------------------
// search.ts – Search algorithms as generator functions yielding step states
// ---------------------------------------------------------------------------

export interface FringeEntry {
  node: string;
  path: string[];
  cost: number;
  f?: number;
}

export interface SearchState {
  type: 'init' | 'expand' | 'check' | 'solution' | 'failure';
  current?: string;
  fringe: FringeEntry[];
  explored: Set<string>;
  path?: string[];
  cost?: number;
  message: string;
}

export type GetNeighbors = (node: string) => { city: string; cost: number }[];
export type Heuristic = (node: string) => number;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function cloneFringe(fringe: FringeEntry[]): FringeEntry[] {
  return fringe.map((e) => ({ ...e, path: [...e.path] }));
}

function makeState(
  type: SearchState['type'],
  fringe: FringeEntry[],
  explored: Set<string>,
  message: string,
  extra?: { current?: string; path?: string[]; cost?: number },
): SearchState {
  return {
    type,
    fringe: cloneFringe(fringe),
    explored: new Set(explored),
    message,
    ...extra,
  };
}

// ---------------------------------------------------------------------------
// BFS – Breadth-First Search (FIFO queue)
// ---------------------------------------------------------------------------

export function* bfs(
  start: string,
  goal: string,
  getNeighbors: GetNeighbors,
): Generator<SearchState> {
  const fringe: FringeEntry[] = [{ node: start, path: [start], cost: 0 }];
  const explored = new Set<string>();

  yield makeState('init', fringe, explored, `Starting BFS from ${start} to ${goal}`);

  while (fringe.length > 0) {
    const entry = fringe.shift()!;
    const { node, path, cost } = entry;

    if (explored.has(node)) continue;

    yield makeState('expand', fringe, explored, `Expanding ${node} (depth: ${path.length - 1}, cost: ${cost})`, {
      current: node,
    });

    if (node === goal) {
      yield makeState('solution', fringe, explored, `Goal ${goal} reached! Path cost: ${cost}`, {
        current: node,
        path,
        cost,
      });
      return;
    }

    explored.add(node);

    const neighbors = getNeighbors(node);
    for (const { city, cost: edgeCost } of neighbors) {
      if (!explored.has(city)) {
        const newEntry: FringeEntry = {
          node: city,
          path: [...path, city],
          cost: cost + edgeCost,
        };
        fringe.push(newEntry);
        yield makeState('check', fringe, explored, `Adding ${city} to fringe (cost: ${cost + edgeCost})`, {
          current: node,
        });
      }
    }
  }

  yield makeState('failure', fringe, explored, `No path found from ${start} to ${goal}`);
}

// ---------------------------------------------------------------------------
// DFS – Depth-First Search (LIFO stack)
// ---------------------------------------------------------------------------

export function* dfs(
  start: string,
  goal: string,
  getNeighbors: GetNeighbors,
): Generator<SearchState> {
  const fringe: FringeEntry[] = [{ node: start, path: [start], cost: 0 }];
  const explored = new Set<string>();

  yield makeState('init', fringe, explored, `Starting DFS from ${start} to ${goal}`);

  while (fringe.length > 0) {
    const entry = fringe.pop()!;
    const { node, path, cost } = entry;

    if (explored.has(node)) continue;

    yield makeState('expand', fringe, explored, `Expanding ${node} (depth: ${path.length - 1}, cost: ${cost})`, {
      current: node,
    });

    if (node === goal) {
      yield makeState('solution', fringe, explored, `Goal ${goal} reached! Path cost: ${cost}`, {
        current: node,
        path,
        cost,
      });
      return;
    }

    explored.add(node);

    // Add neighbors in reverse alphabetical order so alphabetically-first is popped first
    const neighbors = [...getNeighbors(node)].reverse();
    for (const { city, cost: edgeCost } of neighbors) {
      if (!explored.has(city)) {
        const newEntry: FringeEntry = {
          node: city,
          path: [...path, city],
          cost: cost + edgeCost,
        };
        fringe.push(newEntry);
        yield makeState('check', fringe, explored, `Adding ${city} to fringe (cost: ${cost + edgeCost})`, {
          current: node,
        });
      }
    }
  }

  yield makeState('failure', fringe, explored, `No path found from ${start} to ${goal}`);
}

// ---------------------------------------------------------------------------
// IDS – Iterative Deepening Search (repeated depth-limited DFS)
// ---------------------------------------------------------------------------

export function* ids(
  start: string,
  goal: string,
  getNeighbors: GetNeighbors,
  maxLimit = 20,
): Generator<SearchState> {
  let totalExpanded = 0;

  for (let limit = 0; limit <= maxLimit; limit++) {
    const fringe: FringeEntry[] = [{ node: start, path: [start], cost: 0 }];
    const explored = new Set<string>();

    yield makeState('init', fringe, explored, `IDS iteration ${limit} (depth limit = ${limit})`);

    while (fringe.length > 0) {
      const entry = fringe.pop()!;
      const { node, path, cost } = entry;

      if (explored.has(node)) continue;

      totalExpanded++;
      yield makeState('expand', fringe, explored, `[Limit ${limit}] Expanding ${node} (depth: ${path.length - 1}) [total expanded: ${totalExpanded}]`, {
        current: node,
      });

      if (node === goal) {
        yield makeState('solution', fringe, explored, `Goal ${goal} reached at depth ${path.length - 1}! Total nodes expanded across all iterations: ${totalExpanded}`, {
          current: node,
          path,
          cost,
        });
        return;
      }

      explored.add(node);

      if (path.length - 1 < limit) {
        const neighbors = [...getNeighbors(node)].reverse();
        for (const { city, cost: edgeCost } of neighbors) {
          if (!explored.has(city)) {
            fringe.push({ node: city, path: [...path, city], cost: cost + edgeCost });
            yield makeState('check', fringe, explored, `[Limit ${limit}] Adding ${city} to fringe (depth: ${path.length})`, {
              current: node,
            });
          }
        }
      }
    }
  }

  yield makeState('failure', [], new Set(), `No path found from ${start} to ${goal} within depth ${maxLimit}`);
}

// ---------------------------------------------------------------------------
// UCS – Uniform-Cost Search (priority queue sorted by path cost)
// ---------------------------------------------------------------------------

function insertByPriority(fringe: FringeEntry[], entry: FringeEntry, key: (e: FringeEntry) => number) {
  const val = key(entry);
  let i = 0;
  while (i < fringe.length) {
    const fVal = key(fringe[i]);
    if (val < fVal || (val === fVal && entry.node.localeCompare(fringe[i].node) < 0)) {
      break;
    }
    i++;
  }
  fringe.splice(i, 0, entry);
}

export function* ucs(
  start: string,
  goal: string,
  getNeighbors: GetNeighbors,
): Generator<SearchState> {
  const fringe: FringeEntry[] = [{ node: start, path: [start], cost: 0 }];
  const explored = new Set<string>();

  yield makeState('init', fringe, explored, `Starting UCS from ${start} to ${goal}`);

  while (fringe.length > 0) {
    const entry = fringe.shift()!;
    const { node, path, cost } = entry;

    if (explored.has(node)) continue;

    yield makeState('expand', fringe, explored, `Expanding ${node} (cost: ${cost})`, {
      current: node,
    });

    if (node === goal) {
      yield makeState('solution', fringe, explored, `Goal ${goal} reached! Path cost: ${cost}`, {
        current: node,
        path,
        cost,
      });
      return;
    }

    explored.add(node);

    const neighbors = getNeighbors(node);
    for (const { city, cost: edgeCost } of neighbors) {
      if (!explored.has(city)) {
        const newCost = cost + edgeCost;
        const newEntry: FringeEntry = {
          node: city,
          path: [...path, city],
          cost: newCost,
        };
        insertByPriority(fringe, newEntry, (e) => e.cost);
        yield makeState('check', fringe, explored, `Adding ${city} to fringe (cost: ${newCost})`, {
          current: node,
        });
      }
    }
  }

  yield makeState('failure', fringe, explored, `No path found from ${start} to ${goal}`);
}

// ---------------------------------------------------------------------------
// Greedy Best-First Search (priority queue sorted by h(n))
// ---------------------------------------------------------------------------

export function* greedy(
  start: string,
  goal: string,
  getNeighbors: GetNeighbors,
  h: Heuristic,
): Generator<SearchState> {
  const startF = h(start);
  const fringe: FringeEntry[] = [{ node: start, path: [start], cost: 0, f: startF }];
  const explored = new Set<string>();

  yield makeState('init', fringe, explored, `Starting Greedy Best-First Search from ${start} to ${goal} (h=${startF})`);

  while (fringe.length > 0) {
    const entry = fringe.shift()!;
    const { node, path, cost } = entry;

    if (explored.has(node)) continue;

    yield makeState('expand', fringe, explored, `Expanding ${node} (h=${h(node)}, cost: ${cost})`, {
      current: node,
    });

    if (node === goal) {
      yield makeState('solution', fringe, explored, `Goal ${goal} reached! Path cost: ${cost}`, {
        current: node,
        path,
        cost,
      });
      return;
    }

    explored.add(node);

    const neighbors = getNeighbors(node);
    for (const { city, cost: edgeCost } of neighbors) {
      if (!explored.has(city)) {
        const hVal = h(city);
        const newCost = cost + edgeCost;
        const newEntry: FringeEntry = {
          node: city,
          path: [...path, city],
          cost: newCost,
          f: hVal,
        };
        insertByPriority(fringe, newEntry, (e) => e.f!);
        yield makeState('check', fringe, explored, `Adding ${city} to fringe (h=${hVal})`, {
          current: node,
        });
      }
    }
  }

  yield makeState('failure', fringe, explored, `No path found from ${start} to ${goal}`);
}

// ---------------------------------------------------------------------------
// A* Search (priority queue sorted by f(n) = g(n) + h(n))
// ---------------------------------------------------------------------------

export function* astar(
  start: string,
  goal: string,
  getNeighbors: GetNeighbors,
  h: Heuristic,
): Generator<SearchState> {
  const startF = h(start);
  const fringe: FringeEntry[] = [{ node: start, path: [start], cost: 0, f: startF }];
  const explored = new Set<string>();

  yield makeState('init', fringe, explored, `Starting A* Search from ${start} to ${goal} (f=${startF})`);

  while (fringe.length > 0) {
    const entry = fringe.shift()!;
    const { node, path, cost, f } = entry;

    if (explored.has(node)) continue;

    yield makeState('expand', fringe, explored, `Expanding ${node} (g=${cost}, h=${h(node)}, f=${f})`, {
      current: node,
    });

    if (node === goal) {
      yield makeState('solution', fringe, explored, `Goal ${goal} reached! Path cost: ${cost}`, {
        current: node,
        path,
        cost,
      });
      return;
    }

    explored.add(node);

    const neighbors = getNeighbors(node);
    for (const { city, cost: edgeCost } of neighbors) {
      if (!explored.has(city)) {
        const newCost = cost + edgeCost;
        const hVal = h(city);
        const fVal = newCost + hVal;
        const newEntry: FringeEntry = {
          node: city,
          path: [...path, city],
          cost: newCost,
          f: fVal,
        };
        insertByPriority(fringe, newEntry, (e) => e.f!);
        yield makeState('check', fringe, explored, `Adding ${city} to fringe (g=${newCost}, h=${hVal}, f=${fVal})`, {
          current: node,
        });
      }
    }
  }

  yield makeState('failure', fringe, explored, `No path found from ${start} to ${goal}`);
}

// ---------------------------------------------------------------------------
// Weighted A* Search (f(n) = g(n) + alpha * h(n))
// ---------------------------------------------------------------------------

export function* weightedAstar(
  start: string,
  goal: string,
  getNeighbors: GetNeighbors,
  h: Heuristic,
  alpha: number,
): Generator<SearchState> {
  const startH = h(start);
  const startF = alpha * startH;
  const fringe: FringeEntry[] = [{ node: start, path: [start], cost: 0, f: startF }];
  const explored = new Set<string>();

  yield makeState(
    'init',
    fringe,
    explored,
    `Starting Weighted A* (alpha=${alpha}) from ${start} to ${goal} (f=${startF})`,
  );

  while (fringe.length > 0) {
    const entry = fringe.shift()!;
    const { node, path, cost, f } = entry;

    if (explored.has(node)) continue;

    const hVal = h(node);
    yield makeState('expand', fringe, explored, `Expanding ${node} (g=${cost}, h=${hVal}, f=${f?.toFixed(1)})`, {
      current: node,
    });

    if (node === goal) {
      yield makeState('solution', fringe, explored, `Goal ${goal} reached! Path cost: ${cost}`, {
        current: node,
        path,
        cost,
      });
      return;
    }

    explored.add(node);

    const neighbors = getNeighbors(node);
    for (const { city, cost: edgeCost } of neighbors) {
      if (!explored.has(city)) {
        const newCost = cost + edgeCost;
        const neighborH = h(city);
        const fVal = newCost + alpha * neighborH;
        const newEntry: FringeEntry = {
          node: city,
          path: [...path, city],
          cost: newCost,
          f: fVal,
        };
        insertByPriority(fringe, newEntry, (e) => e.f!);
        yield makeState(
          'check',
          fringe,
          explored,
          `Adding ${city} to fringe (g=${newCost}, h=${neighborH}, f=${fVal.toFixed(1)})`,
          { current: node },
        );
      }
    }
  }

  yield makeState('failure', fringe, explored, `No path found from ${start} to ${goal}`);
}
