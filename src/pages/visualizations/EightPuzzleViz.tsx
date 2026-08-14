import { useState, useCallback } from 'react';
import {
  type PuzzleState,
  GOAL_STATE,
  getBlankIndex,
  swap,
  isGoal,
  h1MisplacedTiles,
  h2ManhattanDistance,
  generateSolvablePuzzle,
} from '../../lib/puzzles.ts';

const TILE_SIZE = 80;
const GAP = 4;
const BOARD_SIZE = TILE_SIZE * 3 + GAP * 4;

function canMove(state: PuzzleState, tileIdx: number): boolean {
  const blank = getBlankIndex(state);
  const bRow = Math.floor(blank / 3);
  const bCol = blank % 3;
  const tRow = Math.floor(tileIdx / 3);
  const tCol = tileIdx % 3;
  return (
    (Math.abs(bRow - tRow) === 1 && bCol === tCol) ||
    (Math.abs(bCol - tCol) === 1 && bRow === tRow)
  );
}

export default function EightPuzzleViz() {
  const [state, setState] = useState<PuzzleState>(() => generateSolvablePuzzle(20));
  const [moves, setMoves] = useState(0);

  const handleTileClick = useCallback((idx: number) => {
    setState((prev) => {
      if (prev[idx] === 0) return prev;
      if (!canMove(prev, idx)) return prev;
      const blank = getBlankIndex(prev);
      const next = swap(prev, idx, blank);
      setMoves((m) => m + 1);
      return next;
    });
  }, []);

  const handleShuffle = useCallback(() => {
    setState(generateSolvablePuzzle(25));
    setMoves(0);
  }, []);

  const handleReset = useCallback(() => {
    setState([...GOAL_STATE]);
    setMoves(0);
  }, []);

  const solved = isGoal(state);
  const h1 = h1MisplacedTiles(state);
  const h2 = h2ManhattanDistance(state);

  return (
    <div className="rounded-lg border bg-card p-4 my-6 overflow-hidden">
      <div className="text-sm font-medium text-muted-foreground mb-3">8-Puzzle: Heuristic Comparison</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'flex-start', justifyContent: 'center', padding: '12px' }}>
        {/* Puzzle board */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(3, ${TILE_SIZE}px)`,
            gap: `${GAP}px`,
            padding: `${GAP}px`,
            background: 'var(--border)',
            borderRadius: '8px',
            width: `${BOARD_SIZE}px`,
          }}
        >
          {state.map((tile, idx) => {
            const movable = tile !== 0 && canMove(state, idx);
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleTileClick(idx)}
                disabled={tile === 0}
                style={{
                  width: `${TILE_SIZE}px`,
                  height: `${TILE_SIZE}px`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '28px',
                  fontWeight: 'bold',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: tile === 0 ? 'default' : movable ? 'pointer' : 'not-allowed',
                  transition: 'all 0.15s ease',
                  background: tile === 0
                    ? 'transparent'
                    : tile === GOAL_STATE[idx]
                      ? 'var(--color-success)'
                      : 'var(--primary)',
                  color: tile === 0 ? 'transparent' : 'white',
                  opacity: tile === 0 ? 0 : movable ? 1 : 0.85,
                  transform: movable ? 'scale(1)' : 'scale(1)',
                  boxShadow: movable ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
                }}
              >
                {tile || ''}
              </button>
            );
          })}
        </div>

        {/* Info panel */}
        <div style={{ minWidth: '200px', fontSize: '14px' }}>
          <div style={{
            padding: '12px 16px',
            background: 'var(--card)',
            borderRadius: '8px',
            border: '1px solid var(--border)',
            marginBottom: '12px',
          }}>
            <div style={{ marginBottom: '8px' }}>
              <strong>Moves:</strong> {moves}
            </div>
            <div style={{ marginBottom: '8px', color: 'var(--primary)' }}>
              <strong>h1 (Misplaced tiles):</strong> {h1}
            </div>
            <div style={{ marginBottom: '8px', color: 'var(--color-warning)' }}>
              <strong>h2 (Manhattan distance):</strong> {h2}
            </div>
            <div style={{
              marginBottom: '4px',
              fontSize: '11px',
              color: 'var(--muted-foreground)',
            }}>
              h2 &ge; h1? <strong>{h2 >= h1 ? 'Yes' : 'No'}</strong> (h2 dominates h1)
            </div>
            {solved && (
              <div style={{ marginTop: '8px', color: 'var(--color-success)', fontWeight: 'bold', fontSize: '16px' }}>
                Solved!
              </div>
            )}
          </div>

          {/* Goal state reference */}
          <div style={{
            padding: '8px 16px',
            background: 'var(--card)',
            borderRadius: '8px',
            border: '1px solid var(--border)',
            marginBottom: '12px',
          }}>
            <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '6px', color: 'var(--muted-foreground)' }}>
              Goal State:
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 28px)',
              gap: '2px',
            }}>
              {GOAL_STATE.map((tile, i) => (
                <div key={i} style={{
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  borderRadius: '3px',
                  background: tile === 0 ? 'transparent' : 'var(--border)',
                  color: 'var(--foreground)',
                }}>
                  {tile || ''}
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="button" className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors" onClick={handleShuffle}>
              Shuffle
            </button>
            <button type="button" className="inline-flex items-center rounded-md border bg-card px-4 py-2 text-sm font-medium hover:bg-muted transition-colors" onClick={handleReset}>
              Reset
            </button>
          </div>
          <p style={{ fontSize: '11px', color: 'var(--muted-foreground)', marginTop: '8px' }}>
            Click a tile adjacent to the blank space to move it. Green tiles are in
            the correct position.
          </p>
        </div>
      </div>
    </div>
  );
}
