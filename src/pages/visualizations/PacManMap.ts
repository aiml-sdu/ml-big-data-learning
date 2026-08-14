// Pac-Man tile-based maps
// 0 = wall, 1 = path (pellet), 2 = empty (no pellet), 3 = pac-man start, 4 = ghost start

export type TileMap = number[][];

export interface PacManLevel {
  name: string;
  map: TileMap;
  pacStart: [number, number]; // [row, col]
  ghostStarts: [number, number][];
}

// Level 1: Simple corridors
const MAP1: TileMap = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 3, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 4, 0],
  [0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0],
  [0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0],
  [0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 1, 0, 0, 1, 0, 0, 2, 0, 0, 1, 0, 0, 1, 0],
  [0, 1, 1, 1, 1, 0, 4, 2, 4, 0, 1, 1, 1, 1, 0],
  [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0],
  [0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0],
  [0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

function extractPositions(map: TileMap): { pac: [number, number]; ghosts: [number, number][] } {
  let pac: [number, number] = [1, 1];
  const ghosts: [number, number][] = [];
  for (let r = 0; r < map.length; r++) {
    for (let c = 0; c < map[r].length; c++) {
      if (map[r][c] === 3) pac = [r, c];
      if (map[r][c] === 4) ghosts.push([r, c]);
    }
  }
  return { pac, ghosts };
}

const pos1 = extractPositions(MAP1);

export const LEVELS: PacManLevel[] = [
  {
    name: 'Classic Maze',
    map: MAP1,
    pacStart: pos1.pac,
    ghostStarts: pos1.ghosts,
  },
];

export function isWalkable(map: TileMap, row: number, col: number): boolean {
  if (row < 0 || row >= map.length || col < 0 || col >= map[0].length) return false;
  return map[row][col] !== 0;
}

export function getNeighborTiles(map: TileMap, row: number, col: number): [number, number][] {
  const dirs: [number, number][] = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  const result: [number, number][] = [];
  for (const [dr, dc] of dirs) {
    const nr = row + dr;
    const nc = col + dc;
    if (isWalkable(map, nr, nc)) result.push([nr, nc]);
  }
  return result;
}
