import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw, Play } from 'lucide-react';

// Grid config
const COLS = 20;
const ROWS = 12;
const CELL_PX = 28;

interface Cell { row: number; col: number }

function key(r: number, c: number) { return `${r},${c}`; }
function cellKey(c: Cell) { return key(c.row, c.col); }

const START: Cell = { row: 1, col: 1 };
const GOAL: Cell = { row: ROWS - 2, col: COLS - 2 };

// Heuristic
function manhattan(a: Cell, b: Cell) { return Math.abs(a.row - b.row) + Math.abs(a.col - b.col); }

// Maze generation (randomized)
function generateMaze(density = 0.25): Set<string> {
  const walls = new Set<string>();
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (r === START.row && c === START.col) continue;
      if (r === GOAL.row && c === GOAL.col) continue;
      // Keep a path-clear zone around start/goal
      if (manhattan({ row: r, col: c }, START) <= 2) continue;
      if (manhattan({ row: r, col: c }, GOAL) <= 2) continue;
      if (Math.random() < density) walls.add(key(r, c));
    }
  }
  return walls;
}

// Grid pathfinding
interface PathNode {
  row: number; col: number;
  g: number; f: number;
  parent: PathNode | null;
}

type AlgoType = 'bfs' | 'greedy' | 'astar';

function runSearch(walls: Set<string>, algo: AlgoType): { visited: string[]; path: Cell[]; explored: number } {
  const visited: string[] = [];
  const cameFrom = new Map<string, PathNode>();
  const dirs = [[-1,0],[1,0],[0,-1],[0,1]];

  const startNode: PathNode = {
    row: START.row, col: START.col, g: 0,
    f: algo === 'bfs' ? 0 : manhattan(START, GOAL),
    parent: null,
  };

  const fringe: PathNode[] = [startNode];
  cameFrom.set(cellKey(START), startNode);
  const closed = new Set<string>();

  while (fringe.length > 0) {
    if (algo !== 'bfs') fringe.sort((a, b) => a.f - b.f);

    const current = algo === 'bfs' ? fringe.shift()! : fringe.shift()!;
    const ck = key(current.row, current.col);

    if (closed.has(ck)) continue;
    closed.add(ck);
    visited.push(ck);

    if (current.row === GOAL.row && current.col === GOAL.col) {
      const path: Cell[] = [];
      let n: PathNode | null = current;
      while (n) { path.unshift({ row: n.row, col: n.col }); n = n.parent; }
      return { visited, path, explored: visited.length };
    }

    for (const [dr, dc] of dirs) {
      const nr = current.row + dr;
      const nc = current.col + dc;
      if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) continue;
      const nk = key(nr, nc);
      if (walls.has(nk) || closed.has(nk)) continue;

      const g = current.g + 1;
      const existing = cameFrom.get(nk);
      if (existing && g >= existing.g) continue;

      const h = manhattan({ row: nr, col: nc }, GOAL);
      const f = algo === 'bfs' ? g : algo === 'greedy' ? h : g + h;
      const node: PathNode = { row: nr, col: nc, g, f, parent: current };
      cameFrom.set(nk, node);
      fringe.push(node);
    }
  }

  return { visited, path: [], explored: visited.length };
}

// Ghost algorithm colors
const ALGO_CONFIG: Record<AlgoType, { label: string; color: string; visitColor: string }> = {
  bfs:    { label: 'BFS',    color: '#3b82f6', visitColor: '#93c5fd' },
  greedy: { label: 'Greedy', color: '#f97316', visitColor: '#fdba74' },
  astar:  { label: 'A*',     color: '#22c55e', visitColor: '#86efac' },
};

type Phase = 'draw' | 'racing' | 'results';

export default function HeuristicHustleGame() {
  const [walls, setWalls] = useState<Set<string>>(() => generateMaze());
  const [phase, setPhase] = useState<Phase>('draw');
  const [playerPath, setPlayerPath] = useState<string[]>([cellKey(START)]);
  const [playerDone, setPlayerDone] = useState(false);

  // Ghost state: how many visited cells to reveal so far
  const [ghostProgress, setGhostProgress] = useState(0);
  const ghostTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Pre-compute ghost results
  const ghostResults = useMemo(() => ({
    bfs: runSearch(walls, 'bfs'),
    greedy: runSearch(walls, 'greedy'),
    astar: runSearch(walls, 'astar'),
  }), [walls]);

  const maxGhostSteps = Math.max(
    ghostResults.bfs.visited.length,
    ghostResults.greedy.visited.length,
    ghostResults.astar.visited.length,
  );

  // Player click handler
  const handleCellClick = useCallback((row: number, col: number) => {
    if (phase !== 'racing' || playerDone) return;
    const ck = key(row, col);
    if (walls.has(ck)) return;

    // Must be adjacent to last cell in path
    const lastKey = playerPath[playerPath.length - 1];
    const [lr, lc] = lastKey.split(',').map(Number);
    const dist = Math.abs(row - lr) + Math.abs(col - lc);
    if (dist !== 1) return;

    // Don't revisit
    if (playerPath.includes(ck)) return;

    const newPath = [...playerPath, ck];
    setPlayerPath(newPath);

    if (row === GOAL.row && col === GOAL.col) {
      setPlayerDone(true);
    }
  }, [phase, playerDone, walls, playerPath]);

  // Start race
  const startRace = useCallback(() => {
    setPhase('racing');
    setPlayerPath([cellKey(START)]);
    setPlayerDone(false);
    setGhostProgress(0);

    // Animate ghosts
    let step = 0;
    ghostTimerRef.current = setInterval(() => {
      step++;
      setGhostProgress(step);
      if (step >= maxGhostSteps) {
        if (ghostTimerRef.current) clearInterval(ghostTimerRef.current);
      }
    }, 40);
  }, [maxGhostSteps]);

  // Player gives up or all ghosts done → show results
  const showResults = useCallback(() => {
    if (ghostTimerRef.current) clearInterval(ghostTimerRef.current);
    // Fast-forward ghosts
    setGhostProgress(maxGhostSteps);
    setPhase('results');
    if (playerDone && playerPath.length <= ghostResults.astar.path.length + 2) {
      confetti({ particleCount: 100, spread: 60, origin: { y: 0.6 } });
    }
  }, [maxGhostSteps, playerDone, playerPath.length, ghostResults.astar.path.length]);

  // Auto-advance to results when player + ghosts both done
  useEffect(() => {
    if (phase === 'racing' && playerDone && ghostProgress >= maxGhostSteps) {
      setTimeout(showResults, 500);
    }
  }, [phase, playerDone, ghostProgress, maxGhostSteps, showResults]);

  // New maze
  const newMaze = useCallback(() => {
    if (ghostTimerRef.current) clearInterval(ghostTimerRef.current);
    setWalls(generateMaze());
    setPhase('draw');
    setPlayerPath([cellKey(START)]);
    setPlayerDone(false);
    setGhostProgress(0);
  }, []);

  useEffect(() => {
    return () => { if (ghostTimerRef.current) clearInterval(ghostTimerRef.current); };
  }, []);

  // Build sets for rendering
  const playerPathSet = useMemo(() => new Set(playerPath), [playerPath]);

  const ghostVisitedSets = useMemo(() => {
    const sets: Record<AlgoType, Set<string>> = { bfs: new Set(), greedy: new Set(), astar: new Set() };
    for (const algo of ['bfs', 'greedy', 'astar'] as const) {
      const visited = ghostResults[algo].visited;
      for (let i = 0; i < Math.min(ghostProgress, visited.length); i++) {
        sets[algo].add(visited[i]);
      }
    }
    return sets;
  }, [ghostResults, ghostProgress]);

  const ghostPathSets = useMemo(() => {
    if (phase !== 'results') return { bfs: new Set<string>(), greedy: new Set<string>(), astar: new Set<string>() };
    const sets: Record<AlgoType, Set<string>> = { bfs: new Set(), greedy: new Set(), astar: new Set() };
    for (const algo of ['bfs', 'greedy', 'astar'] as const) {
      for (const c of ghostResults[algo].path) sets[algo].add(cellKey(c));
    }
    return sets;
  }, [phase, ghostResults]);

  return (
    <div className="not-prose my-6 rounded-lg border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">
          Heuristic Hustle
        </h3>
        <button onClick={newMaze}
          className="flex items-center gap-1 rounded-md border border-border px-2 py-1 text-sm text-muted-foreground hover:bg-accent transition-colors">
          <RotateCcw size={14} /> New Maze
        </button>
      </div>

      {phase === 'draw' && (
        <div className="mb-3">
          <p className="text-sm text-muted-foreground mb-2">
            Race against A*, Greedy, and BFS! Click <strong>GO</strong> to start, then click cells to draw
            your path from <strong>S</strong> to <strong>E</strong>.
          </p>
          <button onClick={startRace}
            className="flex items-center gap-1 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
            <Play size={16} /> GO!
          </button>
        </div>
      )}

      {phase === 'racing' && (
        <div className="mb-3 flex flex-wrap items-center gap-3 text-sm">
          <span className="text-muted-foreground">Click adjacent cells to draw your path!</span>
          {!playerDone && (
            <button onClick={showResults}
              className="rounded-md border border-border px-3 py-1 text-xs text-muted-foreground hover:bg-accent transition-colors">
              Give up
            </button>
          )}
        </div>
      )}

      {/* Scoreboard */}
      {phase === 'racing' && (
        <div className="mb-3 flex flex-wrap gap-3 text-xs">
          <span className="font-medium">You: {playerPath.length - 1} steps</span>
          {(['astar', 'greedy', 'bfs'] as const).map((algo) => (
            <span key={algo} style={{ color: ALGO_CONFIG[algo].color }}>
              {ALGO_CONFIG[algo].label}: {Math.min(ghostProgress, ghostResults[algo].visited.length)} explored
            </span>
          ))}
        </div>
      )}

      {/* Grid */}
      <div className="overflow-x-auto mb-3">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${COLS}, ${CELL_PX}px)`,
            gap: '1px',
            width: 'fit-content',
          }}
        >
          {Array.from({ length: ROWS }).map((_, r) =>
            Array.from({ length: COLS }).map((_, c) => {
              const ck = key(r, c);
              const isWall = walls.has(ck);
              const isStart = r === START.row && c === START.col;
              const isGoal = r === GOAL.row && c === GOAL.col;
              const isPlayerPath = playerPathSet.has(ck);
              const isPlayerHead = playerPath[playerPath.length - 1] === ck;

              // Ghost colors (show as subtle background)
              let ghostBg: string | null = null;
              if (phase === 'results') {
                if (ghostPathSets.astar.has(ck)) ghostBg = ALGO_CONFIG.astar.color + '60';
                else if (ghostPathSets.greedy.has(ck)) ghostBg = ALGO_CONFIG.greedy.color + '40';
                else if (ghostPathSets.bfs.has(ck)) ghostBg = ALGO_CONFIG.bfs.color + '30';
              } else if (phase === 'racing') {
                if (ghostVisitedSets.astar.has(ck)) ghostBg = ALGO_CONFIG.astar.visitColor + '40';
                else if (ghostVisitedSets.greedy.has(ck)) ghostBg = ALGO_CONFIG.greedy.visitColor + '40';
                else if (ghostVisitedSets.bfs.has(ck)) ghostBg = ALGO_CONFIG.bfs.visitColor + '40';
              }

              // Determine adjacency for clickability
              const lastKey = playerPath[playerPath.length - 1];
              const [lr, lc] = lastKey.split(',').map(Number);
              const isAdjacent = Math.abs(r - lr) + Math.abs(c - lc) === 1;
              const isClickable = phase === 'racing' && !playerDone && !isWall && isAdjacent && !playerPathSet.has(ck);

              let bg = 'var(--muted)';
              if (isWall) bg = 'var(--foreground)';
              else if (isStart) bg = '#3b82f6';
              else if (isGoal) bg = '#ef4444';
              else if (isPlayerHead) bg = '#8b5cf6';
              else if (isPlayerPath) bg = '#c4b5fd';
              else if (ghostBg) bg = ghostBg;

              return (
                <div
                  key={ck}
                  onClick={() => isClickable && handleCellClick(r, c)}
                  style={{
                    width: CELL_PX,
                    height: CELL_PX,
                    backgroundColor: bg,
                    cursor: isClickable ? 'pointer' : 'default',
                    borderRadius: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    color: 'white',
                    border: isClickable ? '1px solid var(--primary)' : '1px solid transparent',
                  }}
                >
                  {isStart && 'S'}
                  {isGoal && 'E'}
                </div>
              );
            }),
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="mb-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <span style={{ display: 'inline-block', width: 10, height: 10, background: '#c4b5fd', borderRadius: 2 }} /> Your path
        </span>
        {(['astar', 'greedy', 'bfs'] as const).map((algo) => (
          <span key={algo} className="flex items-center gap-1">
            <span style={{ display: 'inline-block', width: 10, height: 10, background: ALGO_CONFIG[algo].color, borderRadius: 2 }} />
            {ALGO_CONFIG[algo].label}
          </span>
        ))}
      </div>

      {/* Results */}
      <AnimatePresence>
        {phase === 'results' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-md border border-green-300 bg-green-50 px-4 py-3 dark:border-green-800 dark:bg-green-950"
          >
            <div className="flex items-center gap-2 text-green-800 dark:text-green-200 mb-2">
              <Trophy size={18} />
              <span className="font-semibold">Race complete!</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground">
                    <th className="pb-1 pr-4 font-medium">Runner</th>
                    <th className="pb-1 pr-4 font-medium">Path Length</th>
                    <th className="pb-1 font-medium">Cells Explored</th>
                  </tr>
                </thead>
                <tbody className="text-green-800 dark:text-green-200">
                  <tr>
                    <td className="pr-4 py-0.5 font-semibold">You</td>
                    <td className="pr-4">{playerDone ? playerPath.length - 1 : 'DNF'}</td>
                    <td>{playerPath.length - 1}</td>
                  </tr>
                  {(['astar', 'greedy', 'bfs'] as const).map((algo) => (
                    <tr key={algo}>
                      <td className="pr-4 py-0.5" style={{ color: ALGO_CONFIG[algo].color }}>
                        {ALGO_CONFIG[algo].label}
                      </td>
                      <td className="pr-4">{ghostResults[algo].path.length > 0 ? ghostResults[algo].path.length - 1 : 'No path'}</td>
                      <td>{ghostResults[algo].explored}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-3 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200">
              <strong>Insight:</strong> Your intuition IS a heuristic. A* combines that intuition
              (h — estimated distance to goal) with tracking how far you&rsquo;ve actually walked (g).
              Notice how BFS explores the most cells, Greedy is fast but may find longer paths,
              and A* finds the optimal path efficiently.
            </div>

            <button onClick={newMaze}
              className="mt-2 rounded-md border border-green-300 dark:border-green-700 px-3 py-1 text-sm text-green-800 dark:text-green-200 hover:bg-green-100 dark:hover:bg-green-900 transition-colors">
              New Maze
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
