import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  SUDOKU_EASY_PUZZLE,
  assignmentToSudokuGrid,
  collectBacktrackingSteps,
  createSudokuCSP,
  domainsFromAssignment,
  domainsToSudokuGrid,
  parseSudokuGrid,
  runAC3,
} from '@/lib/csp';
import { SudokuBoard } from './CSPShared';

type Phase = 'start' | 'ac3' | 'solve';

export default function SudokuCSPViz() {
  const puzzle = useMemo(() => parseSudokuGrid(SUDOKU_EASY_PUZZLE), []);
  const problem = useMemo(() => createSudokuCSP(puzzle.grid), [puzzle.grid]);
  const ac3 = useMemo(() => runAC3(problem, problem.domains), [problem]);
  const trace = useMemo(
    () => collectBacktrackingSteps(problem, {
      useMRV: true,
      useLCV: true,
      forwardChecking: true,
      useAC3: true,
    }),
    [problem],
  );

  const [phase, setPhase] = useState<Phase>('start');
  const [selectedCell, setSelectedCell] = useState<string | null>('r0c2');

  const solutionDomains = useMemo(
    () => trace.solution ? domainsFromAssignment(problem, trace.solution, problem.domains) : problem.domains,
    [problem, trace.solution],
  );

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
      Object.entries(solutionDomains)
        .filter(([cell, values]) => values.length === 1 && !puzzle.givens.has(cell) && (ac3.domains[cell] ?? []).length > 1)
        .map(([cell]) => cell),
    ),
    [solutionDomains, puzzle.givens, ac3.domains],
  );

  const phaseState = useMemo(() => {
    if (phase === 'start') {
      return {
        grid: puzzle.grid,
        domains: problem.domains,
        title: 'Original puzzle',
        description: 'Given digits are singleton domains. Blank cells still allow 1–9.',
        highlights: new Set<string>(),
        soft: new Set<string>(),
      };
    }

    if (phase === 'ac3') {
      return {
        grid: domainsToSudokuGrid(ac3.domains),
        domains: ac3.domains,
        title: 'After AC-3 propagation',
        description: 'Arc consistency tightens domains first. Green cells were solved by propagation alone.',
        highlights: ac3SolvedCells,
        soft: new Set<string>(),
      };
    }

    return {
      grid: assignmentToSudokuGrid(trace.solution ?? {}),
      domains: solutionDomains,
      title: 'After backtracking search',
      description: 'Green cells needed search after propagation stalled. Yellow cells were already settled by AC-3.',
      highlights: searchSolvedCells,
      soft: ac3SolvedCells,
    };
  }, [phase, puzzle, problem.domains, ac3.domains, trace.solution, solutionDomains, ac3SolvedCells, searchSolvedCells]);

  const selectedDomain = selectedCell ? phaseState.domains[selectedCell] ?? [] : [];
  const searchSummary = trace.steps[trace.steps.length - 1]?.stats;

  return (
    <div className="my-6 rounded-xl border bg-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold">Sudoku as a CSP</h3>
          <p className="text-sm text-muted-foreground">
            Cells are variables, digits are domains, and row/column/box uniqueness rules are the constraints.
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant={phase === 'start' ? 'default' : 'outline'} onClick={() => setPhase('start')}>
            Puzzle
          </Button>
          <Button size="sm" variant={phase === 'ac3' ? 'default' : 'outline'} onClick={() => setPhase('ac3')}>
            Run AC-3
          </Button>
          <Button size="sm" variant={phase === 'solve' ? 'default' : 'outline'} onClick={() => setPhase('solve')}>
            Solve
          </Button>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_0.9fr]">
        <SudokuBoard
          grid={phaseState.grid}
          givens={puzzle.givens}
          domains={phaseState.domains}
          selectedCell={selectedCell}
          highlightCells={phaseState.highlights}
          softHighlightCells={phaseState.soft}
          onCellClick={(row, col) => setSelectedCell(`r${row}c${col}`)}
        />

        <div className="space-y-3">
          <div className="rounded-xl border bg-muted/30 p-4 text-sm">
            <div className="font-semibold">{phaseState.title}</div>
            <p className="mt-2 text-muted-foreground">{phaseState.description}</p>
          </div>

          <div className="rounded-xl border bg-card p-4 text-sm">
            <div className="font-semibold">Selected cell</div>
            <p className="mt-2 font-medium">{selectedCell ?? 'none'}</p>
            <p className="mt-1 text-muted-foreground">
              Domain: {selectedDomain.length > 0 ? `{${selectedDomain.join(', ')}}` : '∅'}
            </p>
            <p className="mt-2 text-muted-foreground">
              Givens stay fixed; every other cell must be inferred or searched.
            </p>
          </div>

          <div className="rounded-xl border bg-card p-4 text-sm">
            <div className="font-semibold">Counts</div>
            <div className="mt-2 space-y-1 text-muted-foreground">
              <p>Given cells: {puzzle.givens.size}</p>
              <p>New cells solved by AC-3: {ac3SolvedCells.size}</p>
              <p>Remaining cells solved by search: {searchSolvedCells.size}</p>
            </div>
            {searchSummary && (
              <div className="mt-3 rounded-lg border bg-muted/20 px-3 py-2">
                <div>Assignments tried: {searchSummary.assignmentsTried}</div>
                <div>Backtracks: {searchSummary.backtracks}</div>
                <div>Values pruned: {searchSummary.prunedValues}</div>
                <div>Search trace steps: {trace.steps.length}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
