import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useLabProgress } from '@/hooks/useLabProgress';
import {
  SUDOKU_EASY_PUZZLE,
  assignmentToSudokuGrid,
  createSudokuCSP,
  domainsFromAssignment,
  domainsToSudokuGrid,
  parseSudokuGrid,
  runAC3,
  solveBacktracking,
} from '@/lib/csp';
import { cn } from '@/lib/utils';
import { SudokuBoard } from '../CSPShared';

export default function Exercise3SudokuSolver() {
  const { markStepComplete, isStepComplete } = useLabProgress('lab6-ex3', 3);
  const puzzle = useMemo(() => parseSudokuGrid(SUDOKU_EASY_PUZZLE), []);
  const problem = useMemo(() => createSudokuCSP(puzzle.grid), [puzzle.grid]);
  const ac3 = useMemo(() => runAC3(problem, problem.domains), [problem]);
  const solution = useMemo(
    () => solveBacktracking(problem, {
      useMRV: true,
      useLCV: true,
      forwardChecking: true,
      useAC3: true,
    }),
    [problem],
  );

  const step1Done = isStepComplete(1) || isStepComplete(2) || isStepComplete(3);
  const step2Done = isStepComplete(2) || isStepComplete(3);
  const step3Done = isStepComplete(3);
  const initialPhase = step3Done ? 'solve' : step1Done ? 'ac3' : 'start';
  const [phase, setPhase] = useState<'start' | 'ac3' | 'solve'>(initialPhase);
  const [selectedCell, setSelectedCell] = useState<string | null>(null);

  const ac3SolvedCells = useMemo(
    () => new Set(
      Object.entries(ac3.domains)
        .filter(([cell, values]) => values.length === 1 && !puzzle.givens.has(cell))
        .map(([cell]) => cell),
    ),
    [ac3.domains, puzzle.givens],
  );

  const searchSolvedCells = useMemo(
    () => new Set(
      solution
        ? Object.keys(solution).filter((cell) => !puzzle.givens.has(cell) && (ac3.domains[cell] ?? []).length > 1)
        : [],
    ),
    [solution, puzzle.givens, ac3.domains],
  );

  const boardState = phase === 'start'
    ? {
        grid: puzzle.grid,
        domains: problem.domains,
        highlights: new Set<string>(),
        soft: new Set<string>(),
      }
    : phase === 'ac3'
      ? {
          grid: domainsToSudokuGrid(ac3.domains),
          domains: ac3.domains,
          highlights: ac3SolvedCells,
          soft: new Set<string>(),
        }
      : {
          grid: assignmentToSudokuGrid(solution ?? {}),
          domains: solution ? domainsFromAssignment(problem, solution, problem.domains) : problem.domains,
          highlights: searchSolvedCells,
          soft: ac3SolvedCells,
        };

  const tasks = [
    { id: 1, label: 'Run AC-3 on the puzzle' },
    { id: 2, label: 'Click one green cell solved by propagation' },
    { id: 3, label: 'Finish the puzzle with backtracking search' },
  ] as const;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Use the same CSP pipeline as the lesson: propagation first, then search only for the remaining ambiguous cells.
      </p>

      <div className="space-y-2 rounded-xl border bg-card p-4">
        {tasks.map((task) => (
          <div key={task.id} className="flex items-center gap-3 text-sm">
            <div className={cn(
              'flex size-6 items-center justify-center rounded-full border text-xs font-semibold',
              (
                (task.id === 1 && step1Done)
                || (task.id === 2 && step2Done)
                || (task.id === 3 && step3Done)
              ) ? 'border-green-600 bg-green-500 text-white' : 'border-border',
            )}>
              {(
                (task.id === 1 && step1Done)
                || (task.id === 2 && step2Done)
                || (task.id === 3 && step3Done)
              ) ? '✓' : task.id}
            </div>
            <span className={(
              (task.id === 1 && step1Done)
              || (task.id === 2 && step2Done)
              || (task.id === 3 && step3Done)
            ) ? 'text-muted-foreground line-through' : ''}>
              {task.label}
            </span>
          </div>
        ))}
      </div>

      {initialPhase !== 'start' && (
        <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-2 text-sm text-blue-700 dark:text-blue-300">
          Resuming from where you left off.{initialPhase === 'ac3' ? ' AC-3 has already been run.' : ' AC-3 and search have been completed.'}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={phase !== 'start' ? 'outline' : 'default'}
          disabled={phase !== 'start'}
          onClick={() => {
            setPhase('ac3');
            if (!step1Done) markStepComplete(1);
          }}
        >
          {phase !== 'start' ? '✓ AC-3 Done' : 'Run AC-3'}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setPhase('solve');
            if (!step1Done) markStepComplete(1);
            if (!step3Done) markStepComplete(3);
          }}
          disabled={phase === 'solve' || !solution || !step2Done}
        >
          {phase === 'solve' ? '✓ Search Complete' : 'Finish Search'}
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_0.95fr]">
        <SudokuBoard
          grid={boardState.grid}
          givens={puzzle.givens}
          domains={boardState.domains}
          selectedCell={selectedCell}
          highlightCells={boardState.highlights}
          softHighlightCells={boardState.soft}
          onCellClick={(row, col) => {
            const cellId = `r${row}c${col}`;
            setSelectedCell(cellId);
            if (phase === 'ac3' && ac3SolvedCells.has(cellId) && !step2Done) {
              markStepComplete(2);
            }
          }}
        />

        <div className="space-y-3">
          <div className="rounded-xl border bg-muted/30 p-4 text-sm">
            <div className="font-semibold">
              {phase === 'start' ? 'Original puzzle' : phase === 'ac3' ? 'After AC-3' : 'Solved puzzle'}
            </div>
            <p className="mt-2 text-muted-foreground">
              {phase === 'start'
                ? 'Blank cells still carry multiple candidates.'
                : phase === 'ac3'
                  ? 'Green cells are newly forced by propagation alone.'
                  : 'Green cells required search after propagation was exhausted.'}
            </p>
          </div>

          <div className="rounded-xl border bg-card p-4 text-sm">
            <div className="font-semibold">Selected cell</div>
            <p className="mt-2 font-medium">{selectedCell ?? 'none'}</p>
            {selectedCell && (
              <p className="mt-1 text-muted-foreground">
                Domain: {`{${(boardState.domains[selectedCell] ?? []).join(', ')}}`}
              </p>
            )}
          </div>

          <div className="rounded-xl border bg-card p-4 text-sm">
            <div className="font-semibold">Progress snapshot</div>
            <div className="mt-2 space-y-1 text-muted-foreground">
              <p>Given cells: {puzzle.givens.size}</p>
              <p>AC-3 singleton cells: {ac3SolvedCells.size}</p>
              <p>Cells finished by search: {searchSolvedCells.size}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
