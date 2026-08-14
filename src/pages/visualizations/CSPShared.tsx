import { Fragment } from 'react';
import { cn } from '@/lib/utils';
import {
  AUSTRALIA_GRAPH_POSITIONS,
  AUSTRALIA_REGION_SHAPES,
  COLOR_SWATCH,
  getAssignmentViolations,
  type AC3Arc,
  type AustraliaColor,
  type AustraliaVariable,
  type CSPProblem,
  type DomainMap,
} from '@/lib/csp';

type AustraliaAssignment = Partial<Record<AustraliaVariable, AustraliaColor>>;

function hasViolation(
  region: AustraliaVariable,
  violations: AC3Arc[],
): boolean {
  return violations.some((edge) => edge.from === region || edge.to === region);
}

function isActiveNeighbor(
  region: AustraliaVariable,
  activeRegion: AustraliaVariable | null,
  problem?: Pick<CSPProblem<AustraliaColor>, 'neighbors'>,
): boolean {
  if (!activeRegion || !problem) return false;
  return (problem.neighbors[activeRegion] ?? []).includes(region);
}

export function colorLabel(color: AustraliaColor): string {
  return color[0].toUpperCase() + color.slice(1);
}

export function domainLabel<T extends string | number>(values: T[] | undefined): string {
  if (!values || values.length === 0) return '∅';
  return `{${values.join(', ')}}`;
}

export function AustraliaColorPalette({
  selectedColor,
  onSelect,
  allowClear = true,
}: {
  selectedColor: AustraliaColor | null;
  onSelect: (color: AustraliaColor | null) => void;
  allowClear?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {(['red', 'green', 'blue'] as AustraliaColor[]).map((color) => (
        <button
          key={color}
          type="button"
          onClick={() => onSelect(color)}
          className={cn(
            'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors',
            selectedColor === color ? 'border-primary bg-primary/10' : 'hover:bg-muted',
          )}
        >
          <span
            className="inline-block size-3 rounded-full border border-black/10"
            style={{ backgroundColor: COLOR_SWATCH[color] }}
          />
          {colorLabel(color)}
        </button>
      ))}
      {allowClear && (
        <button
          type="button"
          onClick={() => onSelect(null)}
          className="rounded-full border px-3 py-1.5 text-sm hover:bg-muted"
        >
          Erase
        </button>
      )}
    </div>
  );
}

export function AustraliaMapBoard({
  assignment,
  onRegionClick,
  activeRegion = null,
  highlightRegions = [],
  violations = [],
  shakenRegion = null,
}: {
  assignment: AustraliaAssignment;
  onRegionClick?: (region: AustraliaVariable) => void;
  activeRegion?: AustraliaVariable | null;
  highlightRegions?: AustraliaVariable[];
  violations?: AC3Arc[];
  shakenRegion?: AustraliaVariable | null;
}) {
  const highlighted = new Set(highlightRegions);

  return (
    <svg viewBox="0 0 370 360" className="w-full max-w-[26rem] rounded-xl border bg-muted/20 p-2">
      <defs>
        <filter id="csp-violation-glow-map" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <text x={20} y={18} className="fill-muted-foreground" style={{ fontSize: 11 }}>
        Click a region to assign a color
      </text>
      {AUSTRALIA_REGION_SHAPES.map((region) => {
        const fill = assignment[region.id] ? COLOR_SWATCH[assignment[region.id]!] : 'oklch(0.97 0 0)';
        const active = region.id === activeRegion;
        const hasError = hasViolation(region.id, violations);
        return (
          <g key={region.id} style={region.id === shakenRegion ? { animation: 'shake 0.5s ease-in-out' } : undefined}>
            <polygon
              points={region.points}
              fill={fill}
              stroke={hasError ? '#dc2626' : active || highlighted.has(region.id) ? 'oklch(0.62 0.18 250)' : 'oklch(0.74 0 0)'}
              strokeWidth={hasError ? 5 : active ? 4 : highlighted.has(region.id) ? 3 : 2}
              filter={hasError ? 'url(#csp-violation-glow-map)' : undefined}
              className={cn(
                onRegionClick && 'cursor-pointer transition-opacity hover:opacity-90',
                hasError && 'csp-violation-pulse',
              )}
              onClick={() => onRegionClick?.(region.id)}
            />
            <text
              x={region.center.x}
              y={region.center.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="select-none fill-foreground"
              style={{ fontSize: 13, fontWeight: 700 }}
            >
              {region.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function AustraliaConstraintGraph({
  assignment,
  problem,
  domains,
  activeRegion = null,
  onNodeClick,
  violations,
  highlightedEdge,
}: {
  assignment: AustraliaAssignment;
  problem: Pick<CSPProblem<AustraliaColor>, 'variables' | 'neighbors' | 'isConsistent'>;
  domains?: DomainMap<AustraliaColor>;
  activeRegion?: AustraliaVariable | null;
  onNodeClick?: (region: AustraliaVariable) => void;
  violations?: AC3Arc[];
  highlightedEdge?: AC3Arc;
}) {
  const computedViolations = violations ?? getAssignmentViolations(problem, assignment);
  const seen = new Set<string>();
  const edges = problem.variables.flatMap((variable) =>
    (problem.neighbors[variable] ?? []).flatMap((neighbor) => {
      const key = [variable, neighbor].sort().join('|');
      if (seen.has(key)) return [];
      seen.add(key);
      return [{ from: variable as AustraliaVariable, to: neighbor as AustraliaVariable }];
    }),
  );

  return (
    <svg viewBox="0 0 380 360" className="w-full max-w-[26rem] rounded-xl border bg-card p-2">
      <defs>
        <filter id="csp-violation-glow-graph" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {edges.map((edge) => {
        const from = AUSTRALIA_GRAPH_POSITIONS[edge.from];
        const to = AUSTRALIA_GRAPH_POSITIONS[edge.to];
        const highlighted = activeRegion && (edge.from === activeRegion || edge.to === activeRegion);
        const violated = computedViolations.some((item) => (
          (item.from === edge.from && item.to === edge.to)
          || (item.from === edge.to && item.to === edge.from)
        ));
        const isHighlightedArc = highlightedEdge && (
          (edge.from === highlightedEdge.from && edge.to === highlightedEdge.to)
          || (edge.from === highlightedEdge.to && edge.to === highlightedEdge.from)
        );
        return (
          <line
            key={`${edge.from}-${edge.to}`}
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            stroke={violated ? '#dc2626' : isHighlightedArc ? '#f59e0b' : highlighted ? 'oklch(0.62 0.18 250)' : 'oklch(0.76 0 0)'}
            strokeWidth={violated ? 4 : isHighlightedArc ? 4 : highlighted ? 3 : 2}
            filter={violated ? 'url(#csp-violation-glow-graph)' : undefined}
            className={violated ? 'csp-violation-pulse' : undefined}
          />
        );
      })}

      {problem.variables.map((variable) => {
        const region = variable as AustraliaVariable;
        const { x, y } = AUSTRALIA_GRAPH_POSITIONS[region];
        const active = region === activeRegion;
        const neighbor = isActiveNeighbor(region, activeRegion, problem);
        const fill = assignment[region] ? COLOR_SWATCH[assignment[region]!] : 'white';
        const regionViolated = hasViolation(region, computedViolations);
        const stroke = regionViolated
          ? '#dc2626'
          : active
            ? 'oklch(0.62 0.18 250)'
            : neighbor
              ? 'oklch(0.68 0.14 150)'
              : 'oklch(0.74 0 0)';
        return (
          <Fragment key={region}>
            <circle
              cx={x}
              cy={y}
              r={22}
              fill={fill}
              stroke={stroke}
              strokeWidth={regionViolated ? 4 : active ? 4 : neighbor ? 3 : 2}
              filter={regionViolated ? 'url(#csp-violation-glow-graph)' : undefined}
              className={cn(
                onNodeClick && 'cursor-pointer hover:opacity-90',
                regionViolated && 'csp-violation-pulse',
              )}
              onClick={() => onNodeClick?.(region)}
            />
            <text
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-foreground select-none"
              style={{ fontSize: 12, fontWeight: 700 }}
            >
              {region}
            </text>
            {domains?.[region] && (
              <text
                x={x}
                y={y + 37}
                textAnchor="middle"
                className="fill-muted-foreground"
                style={{ fontSize: 10 }}
              >
                {domainLabel(domains[region])}
              </text>
            )}
          </Fragment>
        );
      })}
    </svg>
  );
}

export function AustraliaAssignmentList({
  assignment,
  domains,
  highlightVariable,
}: {
  assignment: Partial<Record<AustraliaVariable, AustraliaColor>>;
  domains?: DomainMap<AustraliaColor>;
  highlightVariable?: AustraliaVariable;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 text-sm">
      {(['WA', 'NT', 'SA', 'Q', 'NSW', 'V', 'T'] as AustraliaVariable[]).map((region) => {
        const value = assignment[region];
        return (
          <div key={region} className={cn('rounded-lg border bg-card px-3 py-2', region === highlightVariable && 'border-primary bg-primary/10')}>
            <div className="font-semibold">{region}</div>
            <div className="text-muted-foreground">
              {value ? colorLabel(value) : domains ? domainLabel(domains[region]) : 'unassigned'}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function SudokuBoard({
  grid,
  givens = new Set<string>(),
  domains,
  selectedCell = null,
  highlightCells = new Set<string>(),
  softHighlightCells = new Set<string>(),
  onCellClick,
}: {
  grid: number[][];
  givens?: Set<string>;
  domains?: DomainMap<number>;
  selectedCell?: string | null;
  highlightCells?: Set<string>;
  softHighlightCells?: Set<string>;
  onCellClick?: (row: number, col: number) => void;
}) {
  return (
    <div className="grid grid-cols-9 overflow-hidden rounded-xl border bg-card">
      {grid.flatMap((rowValues, row) =>
        rowValues.map((value, col) => {
          const cellId = `r${row}c${col}`;
          const strong = highlightCells.has(cellId);
          const soft = softHighlightCells.has(cellId);
          const candidates = domains?.[cellId] ?? [];
          return (
            <button
              key={cellId}
              type="button"
              onClick={() => onCellClick?.(row, col)}
              className={cn(
                'relative flex aspect-square items-center justify-center border text-sm transition-colors',
                row % 3 === 0 && 'border-t-2',
                col % 3 === 0 && 'border-l-2',
                row === 8 && 'border-b-2',
                col === 8 && 'border-r-2',
                selectedCell === cellId && 'bg-primary/15',
                strong && 'bg-emerald-500/15',
                soft && 'bg-amber-500/10',
                !selectedCell && !strong && !soft && 'hover:bg-muted/60',
              )}
              disabled={!onCellClick}
            >
              {value > 0 ? (
                <span className={cn('text-lg font-semibold', givens.has(cellId) && 'text-blue-600 dark:text-blue-300')}>
                  {value}
                </span>
              ) : (
                <span className="px-1 text-center text-[10px] leading-tight text-muted-foreground">
                  {candidates.length > 0 ? candidates.join(' ') : '∅'}
                </span>
              )}
            </button>
          );
        }),
      )}
    </div>
  );
}
