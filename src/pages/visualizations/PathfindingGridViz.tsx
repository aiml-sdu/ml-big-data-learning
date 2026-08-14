import { useRef, useEffect, useState, useCallback } from 'react';
import { setupCanvas, drawGrid, getThemeColors } from '../../visualizations/canvas-utils.ts';
import { useContainerSize } from '../../hooks/useContainerSize.ts';
import { useCanvasCamera } from '../../hooks/useCanvasCamera.ts';

// ---------------------------------------------------------------------------
// Grid pathfinding types
// ---------------------------------------------------------------------------

type CellType = 'empty' | 'wall' | 'start' | 'end';
type AlgoChoice = 'bfs' | 'astar' | 'greedy';

interface Cell {
  row: number;
  col: number;
}

const COLS = 25;
const ROWS = 15;
const CELL_SIZE = 28;
const WORLD_W = COLS * CELL_SIZE;
const WORLD_H = ROWS * CELL_SIZE;

const DEFAULT_START: Cell = { row: 7, col: 2 };
const DEFAULT_END: Cell = { row: 7, col: 22 };

// ---------------------------------------------------------------------------
// Heuristic & pathfinding
// ---------------------------------------------------------------------------

function manhattan(a: Cell, b: Cell): number {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
}

interface PathNode {
  row: number;
  col: number;
  g: number;
  f: number;
  parent: PathNode | null;
}

function neighbors(node: PathNode, grid: CellType[][]): PathNode[] {
  const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  const result: PathNode[] = [];
  for (const [dr, dc] of dirs) {
    const r = node.row + dr;
    const c = node.col + dc;
    if (r >= 0 && r < ROWS && c >= 0 && c < COLS && grid[r][c] !== 'wall') {
      result.push({ row: r, col: c, g: 0, f: 0, parent: null });
    }
  }
  return result;
}

interface SearchStep {
  visited: Set<string>;
  current: Cell;
  fringe: Cell[];
  path: Cell[] | null;
  done: boolean;
}

function key(r: number, c: number): string {
  return `${r},${c}`;
}

function* gridSearch(
  grid: CellType[][],
  start: Cell,
  end: Cell,
  algo: AlgoChoice,
): Generator<SearchStep> {
  const visited = new Set<string>();
  const cameFrom = new Map<string, PathNode>();

  const startNode: PathNode = {
    row: start.row,
    col: start.col,
    g: 0,
    f: algo === 'bfs' ? 0 : manhattan(start, end),
    parent: null,
  };

  const fringe: PathNode[] = [startNode];
  cameFrom.set(key(start.row, start.col), startNode);

  while (fringe.length > 0) {
    if (algo === 'astar' || algo === 'greedy') {
      fringe.sort((a, b) => a.f - b.f);
    }

    const current = fringe.shift()!;
    const ck = key(current.row, current.col);

    if (visited.has(ck)) continue;
    visited.add(ck);

    yield {
      visited: new Set(visited),
      current: { row: current.row, col: current.col },
      fringe: fringe.map((n) => ({ row: n.row, col: n.col })),
      path: null,
      done: false,
    };

    if (current.row === end.row && current.col === end.col) {
      const path: Cell[] = [];
      let node: PathNode | null = current;
      while (node) {
        path.unshift({ row: node.row, col: node.col });
        node = node.parent;
      }
      yield {
        visited: new Set(visited),
        current: { row: current.row, col: current.col },
        fringe: [],
        path,
        done: true,
      };
      return;
    }

    for (const nb of neighbors(current, grid)) {
      const nk = key(nb.row, nb.col);
      if (visited.has(nk)) continue;

      const g = current.g + 1;
      const existing = cameFrom.get(nk);
      if (existing && g >= existing.g) continue;

      nb.g = g;
      if (algo === 'bfs') nb.f = g;
      else if (algo === 'greedy') nb.f = manhattan(nb, end);
      else nb.f = g + manhattan(nb, end);

      nb.parent = current;
      cameFrom.set(nk, nb);
      fringe.push(nb);
    }
  }

  yield {
    visited: new Set(visited),
    current: start,
    fringe: [],
    path: null,
    done: true,
  };
}

// ---------------------------------------------------------------------------
// Drawing
// ---------------------------------------------------------------------------

function drawScene(
  ctx: CanvasRenderingContext2D,
  grid: CellType[][],
  start: Cell,
  end: Cell,
  searchStep: SearchStep | null,
) {
  const colors = getThemeColors();

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const x = c * CELL_SIZE;
      const y = r * CELL_SIZE;
      const cellKey = key(r, c);

      let fill = colors.bg;
      if (grid[r][c] === 'wall') {
        fill = colors.text;
      } else if (searchStep?.path?.some((p) => p.row === r && p.col === c)) {
        fill = colors.success;
      } else if (searchStep?.visited.has(cellKey)) {
        fill = '#93c5fd';
      } else if (searchStep?.fringe.some((f) => f.row === r && f.col === c)) {
        fill = '#fcd34d';
      }

      ctx.fillStyle = fill;
      ctx.fillRect(x + 0.5, y + 0.5, CELL_SIZE - 1, CELL_SIZE - 1);
    }
  }

  // Start and end cells
  const sx = start.col * CELL_SIZE;
  const sy = start.row * CELL_SIZE;
  ctx.fillStyle = colors.primary;
  ctx.fillRect(sx + 0.5, sy + 0.5, CELL_SIZE - 1, CELL_SIZE - 1);
  ctx.fillStyle = 'white';
  ctx.font = 'bold 12px var(--font-sans, system-ui, sans-serif)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('S', sx + CELL_SIZE / 2, sy + CELL_SIZE / 2);

  const ex = end.col * CELL_SIZE;
  const ey = end.row * CELL_SIZE;
  ctx.fillStyle = colors.error;
  ctx.fillRect(ex + 0.5, ey + 0.5, CELL_SIZE - 1, CELL_SIZE - 1);
  ctx.fillStyle = 'white';
  ctx.fillText('E', ex + CELL_SIZE / 2, ey + CELL_SIZE / 2);

  drawGrid(ctx, WORLD_W, WORLD_H, CELL_SIZE, colors.border);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const COMPARE_ALGOS: { key: AlgoChoice; label: string }[] = [
  { key: 'bfs', label: 'BFS' },
  { key: 'astar', label: 'A*' },
  { key: 'greedy', label: 'Greedy' },
];

interface CompareResult {
  step: SearchStep | null;
  stats: { visited: number; pathLen: number } | null;
}

function CompareCanvas({
  grid, start, end, step, label, stats, width,
}: {
  grid: CellType[][]; start: Cell; end: Cell;
  step: SearchStep | null; label: string;
  stats: { visited: number; pathLen: number } | null;
  width: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const h = Math.round(width * (WORLD_H / WORLD_W));

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || width <= 0) return;
    const ctx = setupCanvas(canvas, width, h);
    const scale = width / WORLD_W;
    ctx.save();
    ctx.scale(scale, scale);
    drawScene(ctx, grid, start, end, step);
    ctx.restore();
  }, [grid, start, end, step, width, h]);

  return (
    <div style={{ minWidth: 200 }}>
      <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '4px', textAlign: 'center' }}>{label}</div>
      <canvas ref={ref} style={{ borderRadius: '6px', display: 'block', width: '100%' }} />
      {stats && (
        <div style={{ fontSize: '11px', color: 'var(--muted-foreground)', textAlign: 'center', marginTop: '4px' }}>
          Visited: {stats.visited} &middot; Path: {stats.pathLen || '—'}
        </div>
      )}
    </div>
  );
}

function makeGrid(): CellType[][] {
  return Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => 'empty' as CellType),
  );
}

export default function PathfindingGridViz() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { width: containerW } = useContainerSize(containerRef, { width: WORLD_W, height: WORLD_H });
  const displayW = Math.min(containerW - 24, WORLD_W);
  const displayH = Math.round(displayW * (WORLD_H / WORLD_W));

  // Right-click pan (left-click draws walls)
  const { camera, fitToView, screenToWorld } = useCanvasCamera(canvasRef, { panButton: 2 });
  const fitDoneRef = useRef(false);

  const [grid, setGrid] = useState<CellType[][]>(makeGrid);
  const [start] = useState<Cell>(DEFAULT_START);
  const [end] = useState<Cell>(DEFAULT_END);
  const [algo, setAlgo] = useState<AlgoChoice>('astar');
  const [searchStep, setSearchStep] = useState<SearchStep | null>(null);
  const [running, setRunning] = useState(false);
  const [delay, setDelay] = useState(20);
  const [drawing, setDrawing] = useState(false);
  const stepsRef = useRef<SearchStep[]>([]);
  const animRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [stats, setStats] = useState<{ visited: number; pathLen: number } | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [compareResults, setCompareResults] = useState<Record<AlgoChoice, CompareResult>>({
    bfs: { step: null, stats: null },
    astar: { step: null, stats: null },
    greedy: { step: null, stats: null },
  });
  const compareAnimRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (displayW > 0 && !fitDoneRef.current) {
      fitToView(displayW, displayH, { x: 0, y: 0, w: WORLD_W, h: WORLD_H });
      fitDoneRef.current = true;
    }
  }, [displayW, displayH, fitToView]);

  // Redraw canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || displayW <= 0) return;
    const ctx = setupCanvas(canvas, displayW, displayH);

    ctx.save();
    ctx.translate(camera.x, camera.y);
    ctx.scale(camera.zoom, camera.zoom);

    drawScene(ctx, grid, start, end, searchStep);

    ctx.restore();
  }, [grid, start, end, searchStep, displayW, displayH, camera]);

  // Mouse handling for drawing walls — convert screen to world coords
  const getCell = useCallback((e: React.MouseEvent<HTMLCanvasElement>): Cell | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const sx = (e.clientX - rect.left) * (canvas.width / dpr / rect.width);
    const sy = (e.clientY - rect.top) * (canvas.height / dpr / rect.height);
    const { x: wx, y: wy } = screenToWorld(sx, sy);

    const col = Math.floor(wx / CELL_SIZE);
    const row = Math.floor(wy / CELL_SIZE);
    if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return null;
    return { row, col };
  }, [screenToWorld]);

  const toggleWall = useCallback((row: number, col: number) => {
    if ((row === start.row && col === start.col) || (row === end.row && col === end.col)) return;
    setGrid((prev) => {
      const next = prev.map((r) => [...r]);
      next[row][col] = next[row][col] === 'wall' ? 'empty' : 'wall';
      return next;
    });
  }, [start, end]);

  const paintWall = useCallback((row: number, col: number) => {
    if ((row === start.row && col === start.col) || (row === end.row && col === end.col)) return;
    setGrid((prev) => {
      if (prev[row][col] === 'wall') return prev;
      const next = prev.map((r) => [...r]);
      next[row][col] = 'wall';
      return next;
    });
  }, [start, end]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (running || e.button !== 0) return; // Only left-click draws
    const cell = getCell(e);
    if (!cell) return;
    setDrawing(true);
    toggleWall(cell.row, cell.col);
  }, [running, getCell, toggleWall]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawing || running) return;
    const cell = getCell(e);
    if (!cell) return;
    paintWall(cell.row, cell.col);
  }, [drawing, running, getCell, paintWall]);

  const handleMouseUp = useCallback(() => {
    setDrawing(false);
  }, []);

  // Run search
  const handleRun = useCallback(() => {
    if (running) return;
    setSearchStep(null);
    setStats(null);

    const steps: SearchStep[] = [];
    for (const step of gridSearch(grid, start, end, algo)) {
      steps.push(step);
    }
    stepsRef.current = steps;

    if (steps.length === 0) return;

    setRunning(true);
    let idx = 0;

    animRef.current = setInterval(() => {
      if (idx >= steps.length) {
        if (animRef.current) clearInterval(animRef.current);
        setRunning(false);
        const last = steps[steps.length - 1];
        setStats({
          visited: last.visited.size,
          pathLen: last.path?.length ?? 0,
        });
        return;
      }
      setSearchStep(steps[idx]);
      idx++;
    }, delay);
  }, [running, grid, start, end, algo, delay]);

  const clearCompare = useCallback(() => {
    if (compareAnimRef.current) clearInterval(compareAnimRef.current);
    setCompareMode(false);
    setCompareResults({
      bfs: { step: null, stats: null },
      astar: { step: null, stats: null },
      greedy: { step: null, stats: null },
    });
  }, []);

  const handleCompare = useCallback(() => {
    if (running) return;
    // Clear single-run state
    if (animRef.current) clearInterval(animRef.current);
    setSearchStep(null);
    setStats(null);

    // Pre-compute all 3 algo step arrays
    const allSteps: Record<AlgoChoice, SearchStep[]> = { bfs: [], astar: [], greedy: [] };
    for (const a of COMPARE_ALGOS) {
      for (const step of gridSearch(grid, start, end, a.key)) {
        allSteps[a.key].push(step);
      }
    }

    const maxLen = Math.max(...COMPARE_ALGOS.map((a) => allSteps[a.key].length));
    if (maxLen === 0) return;

    setCompareMode(true);
    setRunning(true);
    let idx = 0;

    compareAnimRef.current = setInterval(() => {
      if (idx >= maxLen) {
        if (compareAnimRef.current) clearInterval(compareAnimRef.current);
        setRunning(false);
        // Set final stats
        setCompareResults((prev) => {
          const next = { ...prev };
          for (const a of COMPARE_ALGOS) {
            const steps = allSteps[a.key];
            const last = steps[steps.length - 1];
            if (last) {
              next[a.key] = {
                step: last,
                stats: { visited: last.visited.size, pathLen: last.path?.length ?? 0 },
              };
            }
          }
          return next;
        });
        return;
      }

      setCompareResults((prev) => {
        const next = { ...prev };
        for (const a of COMPARE_ALGOS) {
          const steps = allSteps[a.key];
          if (idx < steps.length) {
            next[a.key] = { ...next[a.key], step: steps[idx] };
          } else if (steps.length > 0) {
            // Algo finished — show final state with stats
            const last = steps[steps.length - 1];
            next[a.key] = {
              step: last,
              stats: { visited: last.visited.size, pathLen: last.path?.length ?? 0 },
            };
          }
        }
        return next;
      });
      idx++;
    }, delay);
  }, [running, grid, start, end, delay]);

  const handleClear = useCallback(() => {
    if (animRef.current) clearInterval(animRef.current);
    clearCompare();
    setRunning(false);
    setGrid(makeGrid());
    setSearchStep(null);
    setStats(null);
  }, [clearCompare]);

  const handleClearSearch = useCallback(() => {
    if (animRef.current) clearInterval(animRef.current);
    clearCompare();
    setRunning(false);
    setSearchStep(null);
    setStats(null);
  }, [clearCompare]);

  const handleMaze = useCallback(() => {
    if (running) return;
    const newGrid = makeGrid();
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if ((r === start.row && c === start.col) || (r === end.row && c === end.col)) continue;
        if (Math.random() < 0.28) newGrid[r][c] = 'wall';
      }
    }
    setGrid(newGrid);
    setSearchStep(null);
    setStats(null);
  }, [running, start, end]);

  return (
    <div className="rounded-lg border bg-card p-4 my-6 overflow-hidden" ref={containerRef}>
      <div className="text-sm font-medium text-muted-foreground mb-3">Pathfinding Playground</div>

      {/* Controls */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '8px 12px', alignItems: 'center' }}>
        <select
          value={algo}
          onChange={(e) => { setAlgo(e.target.value as AlgoChoice); handleClearSearch(); }}
          style={{
            padding: '6px 10px',
            borderRadius: '6px',
            border: '1px solid var(--border)',
            background: 'var(--card)',
            color: 'var(--foreground)',
            fontSize: '13px',
          }}
        >
          <option value="bfs">BFS</option>
          <option value="astar">A* Search</option>
          <option value="greedy">Greedy Best-First</option>
        </select>
        <button type="button" className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50" onClick={handleRun} disabled={running}>
          {running ? 'Running...' : 'Run'}
        </button>
        <button type="button" className="inline-flex items-center rounded-md border bg-card px-4 py-2 text-sm font-medium hover:bg-muted transition-colors" onClick={handleClearSearch}>
          Clear Search
        </button>
        <button type="button" className="inline-flex items-center rounded-md border bg-card px-4 py-2 text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50" onClick={handleMaze} disabled={running}>
          Random Maze
        </button>
        <button type="button" className="inline-flex items-center rounded-md border bg-card px-4 py-2 text-sm font-medium hover:bg-muted transition-colors" onClick={handleClear}>
          Clear All
        </button>
        <button type="button" className="inline-flex items-center rounded-md border border-primary/50 bg-card px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 transition-colors disabled:opacity-50" onClick={handleCompare} disabled={running}>
          Compare All
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto', fontSize: '12px', color: 'var(--muted-foreground)' }}>
          <span>Fast</span>
          <input
            type="range"
            min={1}
            max={200}
            value={delay}
            onChange={(e) => setDelay(Number(e.target.value))}
            style={{ width: '80px', accentColor: 'var(--primary)' }}
          />
          <span>Slow</span>
        </div>
      </div>

      {/* Canvas */}
      <div style={{ overflowX: 'auto', padding: '0 12px 8px' }}>
        <canvas
          ref={canvasRef}
          style={{ cursor: running ? 'default' : 'crosshair', borderRadius: '6px', display: 'block' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
      </div>

      {/* Stats */}
      <div style={{ padding: '4px 12px 12px', fontSize: '12px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <span>
          <span style={{ display: 'inline-block', width: '12px', height: '12px', background: '#93c5fd', borderRadius: '2px', verticalAlign: 'middle', marginRight: '4px' }} />
          Visited {stats ? `(${stats.visited})` : ''}
        </span>
        <span>
          <span style={{ display: 'inline-block', width: '12px', height: '12px', background: '#fcd34d', borderRadius: '2px', verticalAlign: 'middle', marginRight: '4px' }} />
          Fringe
        </span>
        <span>
          <span style={{ display: 'inline-block', width: '12px', height: '12px', background: 'var(--color-success)', borderRadius: '2px', verticalAlign: 'middle', marginRight: '4px' }} />
          Path {stats?.pathLen ? `(${stats.pathLen} cells)` : ''}
        </span>
        <span>
          <span style={{ display: 'inline-block', width: '12px', height: '12px', background: 'var(--foreground)', borderRadius: '2px', verticalAlign: 'middle', marginRight: '4px' }} />
          Wall (click to draw)
        </span>
      </div>
      {stats && !stats.pathLen && (
        <div style={{ padding: '4px 12px 8px', fontSize: '13px', color: 'var(--color-error)' }}>
          No path found. Try removing some walls.
        </div>
      )}

      {/* Compare All view */}
      {compareMode && (
        <div style={{ padding: '8px 12px 12px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px',
          }}>
            {COMPARE_ALGOS.map((a) => (
              <CompareCanvas
                key={a.key}
                grid={grid}
                start={start}
                end={end}
                step={compareResults[a.key].step}
                stats={compareResults[a.key].stats}
                label={a.label}
                width={Math.max(200, Math.floor((displayW - 48) / 3))}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
