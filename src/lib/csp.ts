// ---------------------------------------------------------------------------
// csp.ts – Constraint satisfaction helpers, generators, and sample problems
// ---------------------------------------------------------------------------

export type CSPValue = string | number;
export type Assignment<T extends CSPValue = string> = Record<string, T>;
export type DomainMap<T extends CSPValue = string> = Record<string, T[]>;

export interface CSPProblem<T extends CSPValue = string> {
  name?: string;
  variables: string[];
  domains: DomainMap<T>;
  neighbors: Record<string, string[]>;
  isConsistent: (leftVar: string, leftValue: T, rightVar: string, rightValue: T) => boolean;
}

export interface SolverStats {
  consistencyChecks: number;
  assignmentsTried: number;
  backtracks: number;
  prunedValues: number;
  revisions: number;
}

export interface BacktrackingOptions {
  useMRV?: boolean;
  useLCV?: boolean;
  forwardChecking?: boolean;
  useAC3?: boolean;
}

export interface DomainPrune<T extends CSPValue = string> {
  variable: string;
  removed: T[];
}

export interface AC3Arc {
  from: string;
  to: string;
}

export interface AC3Result<T extends CSPValue = string> {
  consistent: boolean;
  domains: DomainMap<T>;
  revisions: number;
  prunedValues: number;
}

export interface AC3Step<T extends CSPValue = string> {
  type: 'init' | 'dequeue' | 'revise' | 'enqueue' | 'failure' | 'done';
  queue: AC3Arc[];
  domains: DomainMap<T>;
  message: string;
  arc?: AC3Arc;
  pruned?: DomainPrune<T>;
  enqueued?: AC3Arc[];
  revisions: number;
  checks: number;
}

export interface BacktrackingStep<T extends CSPValue = string> {
  type:
    | 'start'
    | 'select-variable'
    | 'order-values'
    | 'try-value'
    | 'reject-value'
    | 'assign'
    | 'prune'
    | 'ac3'
    | 'backtrack'
    | 'solution'
    | 'failure';
  assignment: Assignment<T>;
  domains: DomainMap<T>;
  depth: number;
  message: string;
  stats: SolverStats;
  nodeId: string;
  parentNodeId?: string;
  variable?: string;
  value?: T;
  orderedValues?: T[];
  conflicts?: string[];
  pruned?: DomainPrune<T>[];
}

export interface AustraliaRegionShape {
  id: AustraliaVariable;
  label: string;
  points: string;
  center: { x: number; y: number };
}

export type AustraliaVariable = 'WA' | 'NT' | 'SA' | 'Q' | 'NSW' | 'V' | 'T';
export type AustraliaColor = 'red' | 'green' | 'blue';

export const AUSTRALIA_VARIABLES: AustraliaVariable[] = ['WA', 'NT', 'SA', 'Q', 'NSW', 'V', 'T'];
export const AUSTRALIA_COLORS: AustraliaColor[] = ['red', 'green', 'blue'];

export const AUSTRALIA_NEIGHBORS: Record<AustraliaVariable, AustraliaVariable[]> = {
  WA: ['NT', 'SA'],
  NT: ['WA', 'SA', 'Q'],
  SA: ['WA', 'NT', 'Q', 'NSW', 'V'],
  Q: ['NT', 'SA', 'NSW'],
  NSW: ['Q', 'SA', 'V'],
  V: ['SA', 'NSW'],
  T: [],
};

export const AUSTRALIA_GRAPH_POSITIONS: Record<AustraliaVariable, { x: number; y: number }> = {
  WA: { x: 90, y: 96 },
  NT: { x: 188, y: 74 },
  SA: { x: 190, y: 166 },
  Q: { x: 296, y: 86 },
  NSW: { x: 302, y: 182 },
  V: { x: 266, y: 242 },
  T: { x: 258, y: 324 },
};

export const AUSTRALIA_REGION_SHAPES: AustraliaRegionShape[] = [
  {
    id: 'WA',
    label: 'WA',
    points: '26,28 136,32 134,188 34,194 18,112',
    center: { x: 78, y: 112 },
  },
  {
    id: 'NT',
    label: 'NT',
    points: '136,32 236,34 238,126 132,126',
    center: { x: 184, y: 80 },
  },
  {
    id: 'SA',
    label: 'SA',
    points: '132,126 240,126 246,232 144,230 132,188',
    center: { x: 190, y: 174 },
  },
  {
    id: 'Q',
    label: 'Q',
    points: '236,34 348,40 340,168 242,164 238,126',
    center: { x: 292, y: 98 },
  },
  {
    id: 'NSW',
    label: 'NSW',
    points: '242,164 340,168 336,236 244,234',
    center: { x: 292, y: 198 },
  },
  {
    id: 'V',
    label: 'V',
    points: '226,234 304,236 292,276 236,268',
    center: { x: 264, y: 252 },
  },
  {
    id: 'T',
    label: 'T',
    points: '254,308 286,318 276,346 244,338',
    center: { x: 264, y: 328 },
  },
];

export const COLOR_SWATCH: Record<AustraliaColor, string> = {
  red: '#ef4444',
  green: '#10b981',
  blue: '#3b82f6',
};

const DEFAULT_STATS: SolverStats = {
  consistencyChecks: 0,
  assignmentsTried: 0,
  backtracks: 0,
  prunedValues: 0,
  revisions: 0,
};

export function cloneDomains<T extends CSPValue>(domains: DomainMap<T>): DomainMap<T> {
  const next: DomainMap<T> = {};
  for (const [variable, values] of Object.entries(domains)) {
    next[variable] = [...values];
  }
  return next;
}

export function cloneAssignment<T extends CSPValue>(assignment: Assignment<T>): Assignment<T> {
  return { ...assignment };
}

function cloneStats(stats: SolverStats): SolverStats {
  return { ...stats };
}

export function uniqueEdges(problem: Pick<CSPProblem, 'variables' | 'neighbors'>): AC3Arc[] {
  const seen = new Set<string>();
  const edges: AC3Arc[] = [];
  for (const variable of problem.variables) {
    for (const neighbor of problem.neighbors[variable] ?? []) {
      const key = [variable, neighbor].sort().join('|');
      if (seen.has(key)) continue;
      seen.add(key);
      edges.push({ from: variable, to: neighbor });
    }
  }
  return edges;
}

export function allArcs(problem: Pick<CSPProblem, 'variables' | 'neighbors'>): AC3Arc[] {
  const arcs: AC3Arc[] = [];
  for (const variable of problem.variables) {
    for (const neighbor of problem.neighbors[variable] ?? []) {
      arcs.push({ from: variable, to: neighbor });
    }
  }
  return arcs;
}

export function assignmentFromSingletons<T extends CSPValue>(domains: DomainMap<T>): Assignment<T> {
  const assignment: Assignment<T> = {};
  for (const [variable, values] of Object.entries(domains)) {
    if (values.length === 1) {
      assignment[variable] = values[0];
    }
  }
  return assignment;
}

export function domainsFromAssignment<T extends CSPValue>(
  problem: CSPProblem<T>,
  assignment: Assignment<T>,
  baseDomains: DomainMap<T> = problem.domains,
): DomainMap<T> {
  const domains = cloneDomains(baseDomains);
  for (const variable of problem.variables) {
    const value = assignment[variable];
    if (value !== undefined) {
      domains[variable] = [value];
    }
  }
  return domains;
}

export function getUnassignedVariables<T extends CSPValue>(
  problem: CSPProblem<T>,
  assignment: Assignment<T>,
): string[] {
  return problem.variables.filter((variable) => assignment[variable] === undefined);
}

export function countRemainingValues<T extends CSPValue>(domains: DomainMap<T>): number {
  return Object.values(domains).reduce((sum, values) => sum + values.length, 0);
}

export function getConflictedNeighbors<T extends CSPValue>(
  problem: CSPProblem<T>,
  assignment: Assignment<T>,
  variable: string,
  value: T,
): string[] {
  const conflicts: string[] = [];
  for (const neighbor of problem.neighbors[variable] ?? []) {
    const otherValue = assignment[neighbor];
    if (otherValue === undefined) continue;
    if (!problem.isConsistent(variable, value, neighbor, otherValue)) {
      conflicts.push(neighbor);
    }
  }
  return conflicts;
}

export function isAssignmentComplete<T extends CSPValue>(
  problem: CSPProblem<T>,
  assignment: Assignment<T>,
): boolean {
  return problem.variables.every((variable) => assignment[variable] !== undefined);
}

export function getAssignmentViolations<T extends CSPValue>(
  problem: Pick<CSPProblem<T>, 'variables' | 'neighbors' | 'isConsistent'>,
  assignment: Partial<Record<string, T>>,
): AC3Arc[] {
  const violations: AC3Arc[] = [];
  const seen = new Set<string>();

  for (const variable of problem.variables) {
    const value = assignment[variable];
    if (value === undefined) continue;
    for (const neighbor of problem.neighbors[variable] ?? []) {
      const otherValue = assignment[neighbor];
      if (otherValue === undefined) continue;
      const key = [variable, neighbor].sort().join('|');
      if (seen.has(key)) continue;
      seen.add(key);
      if (!problem.isConsistent(variable, value, neighbor, otherValue)) {
        violations.push({ from: variable, to: neighbor });
      }
    }
  }

  return violations;
}

function selectUnassignedVariable<T extends CSPValue>(
  problem: CSPProblem<T>,
  assignment: Assignment<T>,
  domains: DomainMap<T>,
  useMRV: boolean,
): string {
  const candidates = getUnassignedVariables(problem, assignment);
  if (!useMRV) return candidates[0];

  return candidates.reduce((best, current) => {
    if (!best) return current;
    const currentDomain = domains[current]?.length ?? Infinity;
    const bestDomain = domains[best]?.length ?? Infinity;
    if (currentDomain !== bestDomain) {
      return currentDomain < bestDomain ? current : best;
    }

    const currentDegree = (problem.neighbors[current] ?? []).filter((neighbor) => assignment[neighbor] === undefined).length;
    const bestDegree = (problem.neighbors[best] ?? []).filter((neighbor) => assignment[neighbor] === undefined).length;
    if (currentDegree !== bestDegree) {
      return currentDegree > bestDegree ? current : best;
    }

    return current.localeCompare(best) < 0 ? current : best;
  }, candidates[0] ?? '');
}

function orderDomainValues<T extends CSPValue>(
  problem: CSPProblem<T>,
  assignment: Assignment<T>,
  domains: DomainMap<T>,
  variable: string,
  useLCV: boolean,
): T[] {
  const values = [...(domains[variable] ?? [])];
  if (!useLCV) return values;

  return values.sort((left, right) => {
    const leftPenalty = countValuePenalty(problem, assignment, domains, variable, left);
    const rightPenalty = countValuePenalty(problem, assignment, domains, variable, right);
    if (leftPenalty !== rightPenalty) {
      return leftPenalty - rightPenalty;
    }
    return String(left).localeCompare(String(right));
  });
}

function countValuePenalty<T extends CSPValue>(
  problem: CSPProblem<T>,
  assignment: Assignment<T>,
  domains: DomainMap<T>,
  variable: string,
  value: T,
): number {
  let pruned = 0;
  for (const neighbor of problem.neighbors[variable] ?? []) {
    if (assignment[neighbor] !== undefined) continue;
    for (const neighborValue of domains[neighbor] ?? []) {
      if (!problem.isConsistent(variable, value, neighbor, neighborValue)) {
        pruned++;
      }
    }
  }
  return pruned;
}

function pruneNeighbors<T extends CSPValue>(
  problem: CSPProblem<T>,
  assignment: Assignment<T>,
  domains: DomainMap<T>,
  variable: string,
  value: T,
): { consistent: boolean; domains: DomainMap<T>; pruned: DomainPrune<T>[] } {
  const nextDomains = cloneDomains(domains);
  nextDomains[variable] = [value];

  const pruned: DomainPrune<T>[] = [];
  for (const neighbor of problem.neighbors[variable] ?? []) {
    if (assignment[neighbor] !== undefined) continue;
    const currentValues = nextDomains[neighbor] ?? [];
    const kept = currentValues.filter((neighborValue) => problem.isConsistent(variable, value, neighbor, neighborValue));
    if (kept.length !== currentValues.length) {
      const removed = currentValues.filter((neighborValue) => !kept.includes(neighborValue));
      pruned.push({ variable: neighbor, removed });
      nextDomains[neighbor] = kept;
    }
    if ((nextDomains[neighbor] ?? []).length === 0) {
      return { consistent: false, domains: nextDomains, pruned };
    }
  }

  return { consistent: true, domains: nextDomains, pruned };
}

function reviseArc<T extends CSPValue>(
  problem: CSPProblem<T>,
  domains: DomainMap<T>,
  from: string,
  to: string,
): { revised: boolean; removed: T[]; checks: number } {
  const fromValues = domains[from] ?? [];
  const toValues = domains[to] ?? [];
  const kept: T[] = [];
  const removed: T[] = [];
  let checks = 0;

  for (const leftValue of fromValues) {
    let supported = false;
    for (const rightValue of toValues) {
      checks++;
      if (problem.isConsistent(from, leftValue, to, rightValue)) {
        supported = true;
        break;
      }
    }
    if (supported) {
      kept.push(leftValue);
    } else {
      removed.push(leftValue);
    }
  }

  if (removed.length > 0) {
    domains[from] = kept;
  }

  return { revised: removed.length > 0, removed, checks };
}

function countPrunedValues<T extends CSPValue>(
  before: DomainMap<T>,
  after: DomainMap<T>,
): number {
  let total = 0;
  for (const variable of Object.keys(before)) {
    total += Math.max(0, (before[variable] ?? []).length - (after[variable] ?? []).length);
  }
  return total;
}

export function* ac3Gen<T extends CSPValue>(
  problem: CSPProblem<T>,
  initialDomains: DomainMap<T> = problem.domains,
  initialQueue: AC3Arc[] = allArcs(problem),
): Generator<AC3Step<T>, AC3Result<T>> {
  const domains = cloneDomains(initialDomains);
  const queue = [...initialQueue];
  let revisions = 0;
  let prunedValues = 0;
  let checks = 0;

  yield {
    type: 'init',
    queue: [...queue],
    domains: cloneDomains(domains),
    message: `Initialize AC-3 with ${queue.length} arcs`,
    revisions,
    checks,
  };

  while (queue.length > 0) {
    const arc = queue.shift()!;
    yield {
      type: 'dequeue',
      arc,
      queue: [...queue],
      domains: cloneDomains(domains),
      message: `Process arc ${arc.from} → ${arc.to}`,
      revisions,
      checks,
    };

    const result = reviseArc(problem, domains, arc.from, arc.to);
    checks += result.checks;

    if (result.revised) {
      revisions++;
      prunedValues += result.removed.length;

      yield {
        type: 'revise',
        arc,
        queue: [...queue],
        domains: cloneDomains(domains),
        pruned: { variable: arc.from, removed: result.removed },
        message: `Revise ${arc.from}: remove ${result.removed.join(', ') || 'nothing'}`,
        revisions,
        checks,
      };

      if ((domains[arc.from] ?? []).length === 0) {
        const failureStep: AC3Step<T> = {
          type: 'failure',
          arc,
          queue: [...queue],
          domains: cloneDomains(domains),
          message: `Domain wipeout at ${arc.from}; CSP is inconsistent`,
          revisions,
          checks,
        };
        yield failureStep;
        return {
          consistent: false,
          domains: failureStep.domains,
          revisions,
          prunedValues,
        };
      }

      const enqueued = (problem.neighbors[arc.from] ?? [])
        .filter((neighbor) => neighbor !== arc.to)
        .map((neighbor) => ({ from: neighbor, to: arc.from }));

      if (enqueued.length > 0) {
        queue.push(...enqueued);
        yield {
          type: 'enqueue',
          arc,
          queue: [...queue],
          domains: cloneDomains(domains),
          enqueued,
          message: `Re-enqueue neighbors of ${arc.from}`,
          revisions,
          checks,
        };
      }
    }
  }

  const doneStep: AC3Step<T> = {
    type: 'done',
    queue: [],
    domains: cloneDomains(domains),
    message: 'AC-3 finished; all arcs are consistent',
    revisions,
    checks,
  };
  yield doneStep;
  return {
    consistent: true,
    domains: doneStep.domains,
    revisions,
    prunedValues,
  };
}

export function runAC3<T extends CSPValue>(
  problem: CSPProblem<T>,
  initialDomains: DomainMap<T> = problem.domains,
  initialQueue: AC3Arc[] = allArcs(problem),
): AC3Result<T> {
  const iterator = ac3Gen(problem, initialDomains, initialQueue);
  let next = iterator.next();
  while (!next.done) {
    next = iterator.next();
  }

  return {
    ...next.value,
    prunedValues: next.value.prunedValues ?? countPrunedValues(initialDomains, next.value.domains),
  };
}

export function collectAC3Steps<T extends CSPValue>(
  problem: CSPProblem<T>,
  initialDomains: DomainMap<T> = problem.domains,
  initialQueue: AC3Arc[] = allArcs(problem),
): { steps: AC3Step<T>[]; result: AC3Result<T> } {
  const steps: AC3Step<T>[] = [];
  const iterator = ac3Gen(problem, initialDomains, initialQueue);
  let next = iterator.next();
  while (!next.done) {
    steps.push(next.value);
    next = iterator.next();
  }
  return {
    steps,
    result: {
      ...next.value,
      prunedValues: next.value.prunedValues ?? countPrunedValues(initialDomains, next.value.domains),
    },
  };
}

function makeBacktrackingStep<T extends CSPValue>(
  type: BacktrackingStep<T>['type'],
  assignment: Assignment<T>,
  domains: DomainMap<T>,
  depth: number,
  message: string,
  stats: SolverStats,
  extra: Omit<Partial<BacktrackingStep<T>>, 'type' | 'assignment' | 'domains' | 'depth' | 'message' | 'stats'>,
): BacktrackingStep<T> {
  return {
    type,
    assignment: cloneAssignment(assignment),
    domains: cloneDomains(domains),
    depth,
    message,
    stats: cloneStats(stats),
    nodeId: extra.nodeId ?? 'root',
    parentNodeId: extra.parentNodeId,
    variable: extra.variable,
    value: extra.value,
    orderedValues: extra.orderedValues ? [...extra.orderedValues] : undefined,
    conflicts: extra.conflicts ? [...extra.conflicts] : undefined,
    pruned: extra.pruned?.map((entry) => ({ variable: entry.variable, removed: [...entry.removed] })),
  };
}

export function* backtrackingGen<T extends CSPValue>(
  problem: CSPProblem<T>,
  options: BacktrackingOptions = {},
): Generator<BacktrackingStep<T>, Assignment<T> | null> {
  const stats = cloneStats(DEFAULT_STATS);
  let rootDomains = cloneDomains(problem.domains);
  if (options.useAC3 ?? false) {
    const initialAC3 = runAC3(problem, rootDomains);
    rootDomains = initialAC3.domains;
    stats.revisions += initialAC3.revisions;
    stats.prunedValues += initialAC3.prunedValues;
  }
  const rootAssignment = assignmentFromSingletons(rootDomains);
  let nodeCounter = 0;

  yield makeBacktrackingStep(
    'start',
    rootAssignment,
    domainsFromAssignment(problem, rootAssignment, rootDomains),
    0,
    `${options.useAC3 ? 'Run AC-3, then s' : 'S'}tart CSP search on ${problem.variables.length} variables`,
    stats,
    { nodeId: 'root' },
  );

  if ((options.useAC3 ?? false) && Object.values(rootDomains).some((values) => values.length === 0)) {
    yield makeBacktrackingStep(
      'failure',
      rootAssignment,
      domainsFromAssignment(problem, rootAssignment, rootDomains),
      0,
      'Initial AC-3 preprocessing found an inconsistency',
      stats,
      { nodeId: 'root' },
    );
    return null;
  }

  const search = function* recurse(
    assignment: Assignment<T>,
    domains: DomainMap<T>,
    depth: number,
    parentNodeId: string,
  ): Generator<BacktrackingStep<T>, Assignment<T> | null> {
    if (isAssignmentComplete(problem, assignment)) {
      return assignment;
    }

    const variable = selectUnassignedVariable(problem, assignment, domains, options.useMRV ?? true);
    yield makeBacktrackingStep(
      'select-variable',
      assignment,
      domains,
      depth,
      `${options.useMRV ? 'MRV selects' : 'Select'} ${variable}`,
      stats,
      { nodeId: parentNodeId, variable },
    );

    const orderedValues = orderDomainValues(problem, assignment, domains, variable, options.useLCV ?? false);
    yield makeBacktrackingStep(
      'order-values',
      assignment,
      domains,
      depth,
      `${options.useLCV ? 'LCV orders' : 'Try'} ${variable} as [${orderedValues.join(', ')}]`,
      stats,
      { nodeId: parentNodeId, variable, orderedValues },
    );

    for (const value of orderedValues) {
      stats.consistencyChecks++;
      const conflicts = getConflictedNeighbors(problem, assignment, variable, value);
      yield makeBacktrackingStep(
        'try-value',
        assignment,
        domains,
        depth,
        `Try ${variable} = ${value}`,
        stats,
        { nodeId: parentNodeId, variable, value, conflicts },
      );

      if (conflicts.length > 0) {
        yield makeBacktrackingStep(
          'reject-value',
          assignment,
          domains,
          depth,
          `${variable} = ${value} conflicts with ${conflicts.join(', ')}`,
          stats,
          { nodeId: parentNodeId, variable, value, conflicts },
        );
        continue;
      }

      stats.assignmentsTried++;
      const nextAssignment = { ...assignment, [variable]: value };
      let nextDomains = cloneDomains(domains);
      nextDomains[variable] = [value];
      const nodeId = `node-${++nodeCounter}`;

      yield makeBacktrackingStep(
        'assign',
        nextAssignment,
        nextDomains,
        depth + 1,
        `Assign ${variable} = ${value}`,
        stats,
        { nodeId, parentNodeId, variable, value },
      );

      if (options.forwardChecking ?? false) {
        const pruned = pruneNeighbors(problem, nextAssignment, nextDomains, variable, value);
        nextDomains = pruned.domains;
        stats.prunedValues += pruned.pruned.reduce((sum, entry) => sum + entry.removed.length, 0);

        yield makeBacktrackingStep(
          'prune',
          nextAssignment,
          nextDomains,
          depth + 1,
          pruned.consistent
            ? `Forward checking prunes ${pruned.pruned.reduce((sum, entry) => sum + entry.removed.length, 0)} values`
            : `Forward checking wipes out a domain after ${variable} = ${value}`,
          stats,
          { nodeId, parentNodeId, variable, value, pruned: pruned.pruned },
        );

        if (!pruned.consistent) {
          stats.backtracks++;
          yield makeBacktrackingStep(
            'backtrack',
            nextAssignment,
            nextDomains,
            depth + 1,
            `Backtrack: ${variable} = ${value} leads to an empty domain`,
            stats,
            { nodeId, parentNodeId, variable, value },
          );
          continue;
        }
      }

      if (options.useAC3 ?? false) {
        const relatedArcs = (problem.neighbors[variable] ?? []).map((neighbor) => ({ from: neighbor, to: variable }));
        const ac3 = runAC3(problem, nextDomains, relatedArcs);
        nextDomains = ac3.domains;
        stats.revisions += ac3.revisions;
        stats.prunedValues += ac3.prunedValues;

        yield makeBacktrackingStep(
          'ac3',
          assignmentFromSingletons(nextDomains),
          nextDomains,
          depth + 1,
          ac3.consistent
            ? `AC-3 keeps the CSP consistent after ${variable} = ${value}`
            : `AC-3 detects inconsistency after ${variable} = ${value}`,
          stats,
          { nodeId, parentNodeId, variable, value },
        );

        if (!ac3.consistent) {
          stats.backtracks++;
          yield makeBacktrackingStep(
            'backtrack',
            nextAssignment,
            nextDomains,
            depth + 1,
            `Backtrack: arc consistency fails after ${variable} = ${value}`,
            stats,
            { nodeId, parentNodeId, variable, value },
          );
          continue;
        }
      }

      const result = yield* recurse(nextAssignment, nextDomains, depth + 1, nodeId);
      if (result) {
        return result;
      }

      stats.backtracks++;
      yield makeBacktrackingStep(
        'backtrack',
        nextAssignment,
        nextDomains,
        depth + 1,
        `Backtrack from ${variable} = ${value}`,
        stats,
        { nodeId, parentNodeId, variable, value },
      );
    }

    return null;
  };

  const solution = yield* search(rootAssignment, rootDomains, 0, 'root');
  if (solution) {
    yield makeBacktrackingStep(
      'solution',
      solution,
      domainsFromAssignment(problem, solution, rootDomains),
      problem.variables.length,
      'Solution found',
      stats,
      { nodeId: 'root' },
    );
    return solution;
  }

  yield makeBacktrackingStep(
    'failure',
    rootAssignment,
    domainsFromAssignment(problem, rootAssignment, rootDomains),
    0,
    'No consistent assignment exists',
    stats,
    { nodeId: 'root' },
  );
  return null;
}

export function collectBacktrackingSteps<T extends CSPValue>(
  problem: CSPProblem<T>,
  options: BacktrackingOptions = {},
): { steps: BacktrackingStep<T>[]; solution: Assignment<T> | null } {
  const steps: BacktrackingStep<T>[] = [];
  const iterator = backtrackingGen(problem, options);
  let next = iterator.next();
  while (!next.done) {
    steps.push(next.value);
    next = iterator.next();
  }

  return { steps, solution: next.value };
}

export function solveBacktracking<T extends CSPValue>(
  problem: CSPProblem<T>,
  options: BacktrackingOptions = {},
): Assignment<T> | null {
  return collectBacktrackingSteps(problem, options).solution;
}

export function createAustraliaMapCSP(
  colors: AustraliaColor[] = AUSTRALIA_COLORS,
): CSPProblem<AustraliaColor> {
  const domains: DomainMap<AustraliaColor> = Object.fromEntries(
    AUSTRALIA_VARIABLES.map((variable) => [variable, [...colors]]),
  ) as DomainMap<AustraliaColor>;

  return {
    name: 'Australia Map Coloring',
    variables: [...AUSTRALIA_VARIABLES],
    domains,
    neighbors: AUSTRALIA_NEIGHBORS,
    isConsistent: (_leftVar, leftValue, _rightVar, rightValue) => leftValue !== rightValue,
  };
}

export interface SudokuPuzzle {
  grid: number[][];
  givens: Set<string>;
}

// Chosen for the lesson/lab because AC-3 makes visible progress but does not finish the puzzle.
export const SUDOKU_EASY_PUZZLE = [
  [0, 0, 0, 0, 0, 0, 9, 0, 0],
  [0, 0, 2, 1, 0, 0, 0, 4, 8],
  [0, 9, 0, 3, 0, 2, 0, 0, 0],
  [8, 5, 0, 7, 6, 0, 0, 2, 0],
  [0, 0, 0, 0, 0, 3, 0, 9, 1],
  [0, 0, 3, 0, 0, 4, 0, 0, 0],
  [0, 0, 1, 0, 0, 7, 2, 8, 4],
  [0, 0, 0, 4, 0, 9, 0, 3, 5],
  [0, 4, 0, 0, 8, 0, 0, 7, 0],
];

export function sudokuCellId(row: number, col: number): string {
  return `r${row}c${col}`;
}

export function parseSudokuGrid(grid: number[][]): SudokuPuzzle {
  const givens = new Set<string>();
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] !== 0) {
        givens.add(sudokuCellId(row, col));
      }
    }
  }
  return { grid: grid.map((row) => [...row]), givens };
}

export function sudokuPeers(row: number, col: number): string[] {
  const peers = new Set<string>();
  for (let index = 0; index < 9; index++) {
    if (index !== col) peers.add(sudokuCellId(row, index));
    if (index !== row) peers.add(sudokuCellId(index, col));
  }

  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if (r === row && c === col) continue;
      peers.add(sudokuCellId(r, c));
    }
  }

  return [...peers].sort();
}

export function createSudokuCSP(grid: number[][] = SUDOKU_EASY_PUZZLE): CSPProblem<number> {
  const domains: DomainMap<number> = {};
  const neighbors: Record<string, string[]> = {};
  const variables: string[] = [];

  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const variable = sudokuCellId(row, col);
      variables.push(variable);
      neighbors[variable] = sudokuPeers(row, col);
      domains[variable] = grid[row][col] === 0 ? [1, 2, 3, 4, 5, 6, 7, 8, 9] : [grid[row][col]];
    }
  }

  return {
    name: 'Sudoku',
    variables,
    domains,
    neighbors,
    isConsistent: (_leftVar, leftValue, _rightVar, rightValue) => leftValue !== rightValue,
  };
}

export function domainsToSudokuGrid(domains: DomainMap<number>): number[][] {
  return Array.from({ length: 9 }, (_, row) =>
    Array.from({ length: 9 }, (_, col) => {
      const values = domains[sudokuCellId(row, col)] ?? [];
      return values.length === 1 ? values[0] : 0;
    }),
  );
}

export function assignmentToSudokuGrid(assignment: Assignment<number>): number[][] {
  return Array.from({ length: 9 }, (_, row) =>
    Array.from({ length: 9 }, (_, col) => assignment[sudokuCellId(row, col)] ?? 0),
  );
}
