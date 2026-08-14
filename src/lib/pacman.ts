// Pac-Man ghost AI using grid search algorithms
import { getNeighborTiles, type TileMap } from '@/pages/visualizations/PacManMap';

export type SearchAlgo = 'bfs' | 'greedy' | 'astar';

interface PathNode {
  pos: [number, number];
  parent: PathNode | null;
  g: number;
  f: number;
}

function key(r: number, c: number): string {
  return `${r},${c}`;
}

function manhattan(a: [number, number], b: [number, number]): number {
  return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
}

/** Find path from ghost to target using specified algorithm. Returns list of cells explored (frontier) and the next step. */
export function ghostSearch(
  map: TileMap,
  start: [number, number],
  goal: [number, number],
  algo: SearchAlgo,
): { path: [number, number][]; frontier: Set<string> } {
  const frontier = new Set<string>();
  const visited = new Set<string>();

  const startNode: PathNode = {
    pos: start,
    parent: null,
    g: 0,
    f: algo === 'bfs' ? 0 : manhattan(start, goal),
  };

  const open: PathNode[] = [startNode];

  while (open.length > 0) {
    // Sort by priority
    if (algo === 'bfs') {
      // FIFO — shift from front (already in insertion order)
    } else {
      open.sort((a, b) => a.f - b.f);
    }

    const current = algo === 'bfs' ? open.shift()! : open.shift()!;
    const k = key(current.pos[0], current.pos[1]);

    if (visited.has(k)) continue;
    visited.add(k);

    // Goal reached
    if (current.pos[0] === goal[0] && current.pos[1] === goal[1]) {
      // Reconstruct path
      const path: [number, number][] = [];
      let node: PathNode | null = current;
      while (node) {
        path.unshift(node.pos);
        node = node.parent;
      }
      return { path, frontier };
    }

    const neighbors = getNeighborTiles(map, current.pos[0], current.pos[1]);
    for (const n of neighbors) {
      const nk = key(n[0], n[1]);
      if (visited.has(nk)) continue;
      frontier.add(nk);

      const g = current.g + 1;
      const h = manhattan(n, goal);
      let f: number;

      switch (algo) {
        case 'bfs': f = g; break;
        case 'greedy': f = h; break;
        case 'astar': f = g + h; break;
      }

      open.push({ pos: n, parent: current, g, f });
    }
  }

  return { path: [start], frontier };
}

export interface Ghost {
  pos: [number, number];
  algo: SearchAlgo;
  color: string;
  name: string;
  path: [number, number][];
  frontier: Set<string>;
}

export interface GameState {
  pacPos: [number, number];
  ghosts: Ghost[];
  pellets: Set<string>;
  score: number;
  gameOver: boolean;
  won: boolean;
}

export function createInitialState(
  map: TileMap,
  pacStart: [number, number],
  ghostStarts: [number, number][],
): GameState {
  const pellets = new Set<string>();
  for (let r = 0; r < map.length; r++) {
    for (let c = 0; c < map[r].length; c++) {
      if (map[r][c] === 1 || map[r][c] === 3) {
        pellets.add(key(r, c));
      }
    }
  }

  const ghostColors = ['#ff0000', '#ffb8ff', '#00ffff'];
  const ghostNames = ['Blinky', 'Pinky', 'Inky'];
  const defaultAlgos: SearchAlgo[] = ['bfs', 'greedy', 'astar'];

  const ghosts: Ghost[] = ghostStarts.map((pos, i) => ({
    pos,
    algo: defaultAlgos[i % 3],
    color: ghostColors[i % 3],
    name: ghostNames[i % 3],
    path: [],
    frontier: new Set(),
  }));

  return { pacPos: pacStart, ghosts, pellets, score: 0, gameOver: false, won: false };
}

export function tickGame(
  map: TileMap,
  state: GameState,
  pacDir: [number, number],
): GameState {
  if (state.gameOver) return state;

  // Move pac-man
  const newPacR = state.pacPos[0] + pacDir[0];
  const newPacC = state.pacPos[1] + pacDir[1];
  let newPacPos = state.pacPos;

  if (newPacR >= 0 && newPacR < map.length && newPacC >= 0 && newPacC < map[0].length && map[newPacR][newPacC] !== 0) {
    newPacPos = [newPacR, newPacC];
  }

  // Collect pellet
  const newPellets = new Set(state.pellets);
  let newScore = state.score;
  const pk = key(newPacPos[0], newPacPos[1]);
  if (newPellets.has(pk)) {
    newPellets.delete(pk);
    newScore += 10;
  }

  // Move ghosts
  const newGhosts = state.ghosts.map((ghost) => {
    const { path, frontier } = ghostSearch(map, ghost.pos, newPacPos, ghost.algo);
    const nextPos = path.length > 1 ? path[1] : ghost.pos;
    return { ...ghost, pos: nextPos, path, frontier };
  });

  // Check collision
  const gameOver = newGhosts.some((g) => g.pos[0] === newPacPos[0] && g.pos[1] === newPacPos[1]);
  const won = newPellets.size === 0;

  return {
    pacPos: newPacPos,
    ghosts: newGhosts,
    pellets: newPellets,
    score: newScore,
    gameOver: gameOver || won,
    won,
  };
}
