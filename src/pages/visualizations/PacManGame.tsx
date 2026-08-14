import { useRef, useState, useEffect, useCallback } from 'react';
import { setupCanvas } from '@/visualizations/canvas-utils';
import { useContainerSize } from '@/hooks/useContainerSize';
import { LEVELS, type TileMap } from './PacManMap';
import {
  createInitialState,
  tickGame,
  type GameState,
  type SearchAlgo,
} from '@/lib/pacman';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const CELL = 28;
const TICK_MS = 200;
const GHOST_ALGO_OPTIONS: { value: SearchAlgo; label: string }[] = [
  { value: 'bfs', label: 'BFS' },
  { value: 'greedy', label: 'Greedy' },
  { value: 'astar', label: 'A*' },
];

function drawGame(
  ctx: CanvasRenderingContext2D,
  map: TileMap,
  state: GameState,
  showFrontier: boolean,
) {
  const rows = map.length;
  const cols = map[0].length;
  const w = cols * CELL;
  const h = rows * CELL;

  // Background
  ctx.fillStyle = '#111827';
  ctx.fillRect(0, 0, w, h);

  // Walls
  ctx.fillStyle = '#1e40af';
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (map[r][c] === 0) {
        ctx.fillRect(c * CELL + 1, r * CELL + 1, CELL - 2, CELL - 2);
      }
    }
  }

  // Ghost frontiers (search visualization)
  if (showFrontier) {
    for (const ghost of state.ghosts) {
      ctx.globalAlpha = 0.15;
      ctx.fillStyle = ghost.color;
      for (const fk of ghost.frontier) {
        const [fr, fc] = fk.split(',').map(Number);
        ctx.fillRect(fc * CELL, fr * CELL, CELL, CELL);
      }
      ctx.globalAlpha = 1;

      // Ghost path
      if (ghost.path.length > 1) {
        ctx.strokeStyle = ghost.color;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.4;
        ctx.beginPath();
        ctx.moveTo(ghost.path[0][1] * CELL + CELL / 2, ghost.path[0][0] * CELL + CELL / 2);
        for (let i = 1; i < ghost.path.length; i++) {
          ctx.lineTo(ghost.path[i][1] * CELL + CELL / 2, ghost.path[i][0] * CELL + CELL / 2);
        }
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    }
  }

  // Pellets
  ctx.fillStyle = '#fbbf24';
  for (const pk of state.pellets) {
    const [pr, pc] = pk.split(',').map(Number);
    ctx.beginPath();
    ctx.arc(pc * CELL + CELL / 2, pr * CELL + CELL / 2, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  // Pac-Man
  const [pacR, pacC] = state.pacPos;
  ctx.fillStyle = '#facc15';
  ctx.beginPath();
  ctx.arc(pacC * CELL + CELL / 2, pacR * CELL + CELL / 2, CELL / 2 - 3, 0.2, Math.PI * 2 - 0.2);
  ctx.lineTo(pacC * CELL + CELL / 2, pacR * CELL + CELL / 2);
  ctx.closePath();
  ctx.fill();

  // Ghosts
  for (const ghost of state.ghosts) {
    const [gr, gc] = ghost.pos;
    const cx = gc * CELL + CELL / 2;
    const cy = gr * CELL + CELL / 2;

    // Body
    ctx.fillStyle = ghost.color;
    ctx.beginPath();
    ctx.arc(cx, cy - 2, CELL / 2 - 3, Math.PI, 0);
    ctx.lineTo(cx + CELL / 2 - 3, cy + CELL / 2 - 5);
    // Wavy bottom
    const halfR = CELL / 2 - 3;
    for (let i = 0; i < 3; i++) {
      const x1 = cx + halfR - (i * halfR * 2) / 3;
      const x2 = cx + halfR - ((i + 1) * halfR * 2) / 3;
      ctx.quadraticCurveTo((x1 + x2) / 2, cy + CELL / 2 - 10, x2, cy + CELL / 2 - 5);
    }
    ctx.closePath();
    ctx.fill();

    // Eyes
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(cx - 4, cy - 4, 3, 0, Math.PI * 2);
    ctx.arc(cx + 4, cy - 4, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.arc(cx - 3, cy - 4, 1.5, 0, Math.PI * 2);
    ctx.arc(cx + 5, cy - 4, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Game over overlay
  if (state.gameOver) {
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = state.won ? '#22c55e' : '#ef4444';
    ctx.font = 'bold 24px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(state.won ? 'YOU WIN!' : 'GAME OVER', w / 2, h / 2 - 10);
    ctx.fillStyle = 'white';
    ctx.font = '14px system-ui, sans-serif';
    ctx.fillText(`Score: ${state.score}`, w / 2, h / 2 + 15);
  }
}

export default function PacManGame() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { width: containerW } = useContainerSize(containerRef, { width: 500, height: 500 });

  const level = LEVELS[0];
  const cols = level.map[0].length;
  const rows = level.map.length;
  const canvasW = Math.min(containerW - 32, cols * CELL);
  const cellScale = canvasW / (cols * CELL);
  const canvasH = Math.round(rows * CELL * cellScale);

  const [state, setState] = useState<GameState>(() =>
    createInitialState(level.map, level.pacStart, level.ghostStarts),
  );
  const [showFrontier, setShowFrontier] = useState(true);
  const [running, setRunning] = useState(false);
  const dirRef = useRef<[number, number]>([0, 0]);

  // Keyboard input
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      switch (e.key) {
        case 'ArrowUp': case 'w': e.preventDefault(); dirRef.current = [-1, 0]; break;
        case 'ArrowDown': case 's': e.preventDefault(); dirRef.current = [1, 0]; break;
        case 'ArrowLeft': case 'a': e.preventDefault(); dirRef.current = [0, -1]; break;
        case 'ArrowRight': case 'd': e.preventDefault(); dirRef.current = [0, 1]; break;
      }
      if (!running) setRunning(true);
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [running]);

  // Game tick
  useEffect(() => {
    if (!running || state.gameOver) return;
    const id = setInterval(() => {
      setState((prev) => tickGame(level.map, prev, dirRef.current));
    }, TICK_MS);
    return () => clearInterval(id);
  }, [running, state.gameOver, level.map]);

  // Draw
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || canvasW <= 0) return;
    const ctx = setupCanvas(canvas, canvasW, canvasH);
    ctx.save();
    ctx.scale(cellScale, cellScale);
    drawGame(ctx, level.map, state, showFrontier);
    ctx.restore();
  }, [state, showFrontier, canvasW, canvasH, cellScale, level.map]);

  const handleReset = useCallback(() => {
    setState(createInitialState(level.map, level.pacStart, level.ghostStarts));
    dirRef.current = [0, 0];
    setRunning(false);
  }, [level]);

  const setGhostAlgo = useCallback((ghostIdx: number, algo: SearchAlgo) => {
    setState((prev) => {
      const ghosts = prev.ghosts.map((g, i) =>
        i === ghostIdx ? { ...g, algo } : g,
      );
      return { ...prev, ghosts };
    });
  }, []);

  return (
    <div className="rounded-lg border bg-card p-4 my-4 overflow-hidden" ref={containerRef}>
      <div className="text-sm font-medium text-muted-foreground mb-2">
        Pac-Man: Search Algorithms in Action
      </div>

      <div className="flex justify-center">
        <canvas ref={canvasRef} className="rounded" />
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2 mt-3 flex-wrap">
        <Button variant="outline" size="sm" onClick={handleReset}>
          Restart
        </Button>
        <label className="flex items-center gap-1.5 text-xs">
          <input
            type="checkbox"
            checked={showFrontier}
            onChange={(e) => setShowFrontier(e.target.checked)}
            className="accent-primary"
          />
          Show search frontiers
        </label>
        <span className="text-xs text-muted-foreground ml-auto">
          Score: <strong>{state.score}</strong>
        </span>
      </div>

      {/* Ghost algorithm selectors */}
      <div className="grid grid-cols-3 gap-2 mt-3">
        {state.ghosts.map((ghost, i) => (
          <div key={i} className="rounded border p-2">
            <div className="flex items-center gap-1.5 mb-1">
              <div
                className="size-3 rounded-full"
                style={{ background: ghost.color }}
              />
              <span className="text-xs font-medium">{ghost.name}</span>
            </div>
            <div className="flex gap-1">
              {GHOST_ALGO_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setGhostAlgo(i, opt.value)}
                  className={cn(
                    'px-2 py-0.5 rounded text-xs font-medium transition-colors',
                    ghost.algo === opt.value
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted-foreground/10',
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {!running && !state.gameOver && (
        <div className="text-center text-xs text-muted-foreground mt-2">
          Press arrow keys or WASD to start
        </div>
      )}
    </div>
  );
}
