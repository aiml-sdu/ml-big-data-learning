import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  createAustraliaMapCSP,
  getAssignmentViolations,
  solveBacktracking,
  type Assignment,
  type AustraliaColor,
  type AustraliaVariable,
} from '@/lib/csp';
import {
  AustraliaAssignmentList,
  AustraliaColorPalette,
  AustraliaConstraintGraph,
  AustraliaMapBoard,
  colorLabel,
} from './CSPShared';

type AustraliaAssignment = Partial<Record<AustraliaVariable, AustraliaColor>>;

export default function AustraliaMapCSPViz() {
  const problem = useMemo(() => createAustraliaMapCSP(), []);
  const [assignment, setAssignment] = useState<AustraliaAssignment>({});
  const [selectedColor, setSelectedColor] = useState<AustraliaColor | null>('red');
  const [activeRegion, setActiveRegion] = useState<AustraliaVariable | null>('SA');
  const [shakenRegion, setShakenRegion] = useState<AustraliaVariable | null>(null);
  const [rejectionMessage, setRejectionMessage] = useState<string | null>(null);

  const violations = useMemo(
    () => getAssignmentViolations(problem, assignment),
    [problem, assignment],
  );

  const allAssigned = problem.variables.every((variable) => assignment[variable as AustraliaVariable]);
  const solved = allAssigned && violations.length === 0;

  const handleRegionClick = (region: AustraliaVariable) => {
    setActiveRegion(region);

    if (selectedColor === null) {
      setRejectionMessage(null);
      setAssignment((prev) => {
        const next = { ...prev };
        delete next[region];
        return next;
      });
      return;
    }

    if (assignment[region] === selectedColor) return;

    const neighbors = problem.neighbors[region] ?? [];
    const conflictingNeighbor = neighbors.find(
      (n) => assignment[n as AustraliaVariable] === selectedColor,
    );

    if (conflictingNeighbor) {
      setShakenRegion(region);
      setRejectionMessage(
        `${conflictingNeighbor} is already ${colorLabel(selectedColor)}! Adjacent regions can't share a color.`,
      );
      setTimeout(() => setShakenRegion(null), 500);
      return;
    }

    setRejectionMessage(null);
    setAssignment((prev) => ({ ...prev, [region]: selectedColor }));
  };

  const handleSolve = () => {
    const solution = solveBacktracking(problem, { useMRV: false, useLCV: false }) as Assignment<AustraliaColor> | null;
    if (solution) {
      setAssignment(solution);
      setActiveRegion('SA');
      setRejectionMessage(null);
    }
  };

  const clearBoard = () => {
    setAssignment({});
    setActiveRegion('SA');
    setSelectedColor('red');
    setRejectionMessage(null);
    setShakenRegion(null);
  };

  return (
    <div className="my-6 rounded-xl border bg-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold">Color the map with only 3 colors</h3>
          <p className="text-sm text-muted-foreground">
            Adjacent regions must have different colors. Tasmania is isolated.
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={clearBoard}>
            Reset
          </Button>
          <Button size="sm" onClick={handleSolve}>
            Show one solution
          </Button>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <AustraliaColorPalette selectedColor={selectedColor} onSelect={setSelectedColor} />
        <div className="grid gap-4 lg:grid-cols-2">
          <AustraliaMapBoard
            assignment={assignment}
            onRegionClick={handleRegionClick}
            activeRegion={activeRegion}
            violations={violations}
            shakenRegion={shakenRegion}
          />
          <AustraliaConstraintGraph
            assignment={assignment}
            problem={problem}
            activeRegion={activeRegion}
            onNodeClick={setActiveRegion}
            violations={violations}
          />
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <AustraliaAssignmentList assignment={assignment} />
        <div className="rounded-xl border bg-muted/30 p-4 text-sm">
          <div className="font-semibold">Status</div>
          <div className="mt-2 space-y-1 text-muted-foreground">
            <p>Assigned regions: {Object.keys(assignment).length} / 7</p>
            <p>
              Active color:{' '}
              <span className="font-medium text-foreground">
                {selectedColor ? colorLabel(selectedColor) : 'erase'}
              </span>
            </p>
          </div>
          {solved ? (
            <div className="mt-3 rounded-lg border border-green-500/40 bg-green-500/10 px-3 py-2 font-medium text-green-700 dark:text-green-300">
              Solved! Every neighboring pair has different colors.
            </div>
          ) : rejectionMessage ? (
            <div className="mt-3 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-red-700 dark:text-red-300">
              {rejectionMessage}
            </div>
          ) : (
            <div className="mt-3 rounded-lg border bg-card px-3 py-2 font-medium">
              {Object.keys(assignment).length === 0
                ? 'Select a color, then click a region.'
                : 'No conflicts so far. Keep going!'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
