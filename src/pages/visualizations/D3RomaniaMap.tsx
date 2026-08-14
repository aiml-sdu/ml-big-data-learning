import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import * as d3 from 'd3';
import { CITIES, EDGES, getNeighbors } from '@/lib/romania-graph';
import { astar, greedy, bfs, dfs, ucs, type SearchState, type FringeEntry } from '@/lib/search';
import { useContainerSize } from '@/hooks/useContainerSize';
import AlgoControls from '@/components/AlgoControls';

type AlgoMode = 'astar' | 'greedy' | 'bfs' | 'dfs' | 'ucs';

const WORLD_W = 820;
const WORLD_H = 520;
const NODE_R = 14;

function hSLD(node: string): number {
  return CITIES[node]?.hSLD ?? 0;
}

function collectSteps(mode: AlgoMode): SearchState[] {
  let gen: Generator<SearchState>;
  switch (mode) {
    case 'bfs':
      gen = bfs('Arad', 'Bucharest', getNeighbors);
      break;
    case 'dfs':
      gen = dfs('Arad', 'Bucharest', getNeighbors);
      break;
    case 'ucs':
      gen = ucs('Arad', 'Bucharest', getNeighbors);
      break;
    case 'greedy':
      gen = greedy('Arad', 'Bucharest', getNeighbors, hSLD);
      break;
    case 'astar':
    default:
      gen = astar('Arad', 'Bucharest', getNeighbors, hSLD);
      break;
  }
  const steps: SearchState[] = [];
  for (const s of gen) steps.push(s);
  return steps;
}

const MODE_LABELS: Record<AlgoMode, string> = {
  astar: 'A* Search',
  greedy: 'Greedy BFS',
  bfs: 'BFS',
  dfs: 'DFS',
  ucs: 'UCS',
};

interface D3RomaniaMapProps {
  mode?: AlgoMode;
  interactive?: boolean;
  onCityClick?: (city: string) => void;
  highlightCities?: Set<string>;
  /** Static mode: show the map with start/goal highlighted, no stepping controls */
  static?: boolean;
}

export default function D3RomaniaMap({
  mode = 'astar',
  interactive = false,
  onCityClick,
  highlightCities,
  static: staticMode = false,
}: D3RomaniaMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const { width: containerW } = useContainerSize(containerRef, { width: WORLD_W, height: WORLD_H });

  const displayW = Math.min(containerW - 16, WORLD_W);
  const displayH = Math.round(displayW * (WORLD_H / WORLD_W));
  const scale = displayW / WORLD_W;

  const steps = useMemo(() => staticMode ? [] : collectSteps(mode), [mode, staticMode]);
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Reset on mode change
  useEffect(() => {
    setStepIdx(0);
    setPlaying(false);
  }, [mode]);

  // Auto-play
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (playing) {
      intervalRef.current = setInterval(() => {
        setStepIdx((prev) => {
          if (prev >= steps.length - 1) {
            setPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 800 / speed);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [playing, speed, steps.length]);

  const state = steps[stepIdx] ?? null;

  // D3 rendering
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    if (!svgRef.current || displayW <= 0) return;

    svg.attr('width', displayW).attr('height', displayH);
    svg.selectAll('*').remove();

    const g = svg.append('g').attr('transform', `scale(${scale})`);

    const explored = state?.explored ?? new Set<string>();
    const current = state?.current;
    const pathSet = new Set(state?.path ?? []);
    const fringeNodes = new Set((state?.fringe ?? []).map((e) => e.node));

    const fringeMap: Record<string, FringeEntry> = {};
    for (const entry of state?.fringe ?? []) {
      if (!fringeMap[entry.node]) fringeMap[entry.node] = entry;
    }

    // In static mode, highlight start and goal
    const staticHighlights = staticMode ? new Set(['Arad', 'Bucharest']) : null;

    // Check if edge is on path
    function isEdgeOnPath(from: string, to: string): boolean {
      if (!state?.path) return false;
      const p = state.path;
      for (let i = 0; i < p.length - 1; i++) {
        if ((p[i] === from && p[i + 1] === to) || (p[i] === to && p[i + 1] === from)) {
          return true;
        }
      }
      return false;
    }

    // Draw edges
    for (const edge of EDGES) {
      const from = CITIES[edge.from];
      const to = CITIES[edge.to];
      const onPath = isEdgeOnPath(edge.from, edge.to);

      g.append('line')
        .attr('x1', from.x).attr('y1', from.y)
        .attr('x2', to.x).attr('y2', to.y)
        .attr('class', onPath ? 'stroke-green-500' : 'stroke-border')
        .attr('stroke-width', onPath ? 3 : 1)
        .attr('opacity', 0.7);

      // Edge cost label
      const mx = (from.x + to.x) / 2;
      const my = (from.y + to.y) / 2;
      g.append('text')
        .attr('x', mx).attr('y', my - 6)
        .attr('text-anchor', 'middle')
        .attr('class', 'fill-muted-foreground')
        .attr('font-size', 10)
        .text(edge.cost);
    }

    // Draw nodes
    const cities = Object.entries(CITIES);
    for (const [key, city] of cities) {
      const isPath = pathSet.has(key) && state?.type === 'solution';
      const isCurrent = key === current;
      const isExplored = explored.has(key);
      const isFringe = fringeNodes.has(key);
      const isHighlighted = highlightCities?.has(key);

      const isStaticHighlight = staticHighlights?.has(key);

      let fillClass = 'fill-card';
      let strokeClass = 'stroke-border';

      if (isPath) {
        fillClass = 'fill-green-500';
        strokeClass = 'stroke-green-600';
      } else if (isCurrent) {
        fillClass = 'fill-primary';
        strokeClass = 'stroke-primary';
      } else if (isHighlighted || isStaticHighlight) {
        fillClass = key === 'Arad' ? 'fill-green-400' : key === 'Bucharest' ? 'fill-red-400' : 'fill-blue-400';
        strokeClass = key === 'Arad' ? 'stroke-green-500' : key === 'Bucharest' ? 'stroke-red-500' : 'stroke-blue-500';
      } else if (isExplored) {
        fillClass = 'fill-muted-foreground/30';
        strokeClass = 'stroke-border';
      } else if (isFringe) {
        fillClass = 'fill-yellow-400';
        strokeClass = 'stroke-yellow-500';
      }

      const nodeG = g.append('g')
        .attr('transform', `translate(${city.x},${city.y})`)
        .attr('class', interactive || onCityClick ? 'cursor-pointer' : '');

      if (onCityClick) {
        nodeG.on('click', () => onCityClick(key));
      }

      // Circle
      nodeG.append('circle')
        .attr('r', NODE_R)
        .attr('class', `${fillClass} ${strokeClass}`)
        .attr('stroke-width', 2);

      // Pulse effect for current node
      if (isCurrent) {
        nodeG.append('circle')
          .attr('r', NODE_R + 4)
          .attr('class', 'stroke-primary')
          .attr('fill', 'none')
          .attr('stroke-width', 2)
          .attr('opacity', 0.5);
      }

      // City name
      nodeG.append('text')
        .attr('y', -NODE_R - 8)
        .attr('text-anchor', 'middle')
        .attr('class', 'fill-foreground')
        .attr('font-size', 10)
        .attr('font-weight', 'bold')
        .text(city.name);

      // h(SLD) label — only for heuristic-based modes
      if (mode === 'astar' || mode === 'greedy') {
        nodeG.append('text')
          .attr('y', NODE_R + 12)
          .attr('text-anchor', 'middle')
          .attr('class', 'fill-muted-foreground')
          .attr('font-size', 9)
          .text(`h=${city.hSLD}`);
      }

      // f value for fringe nodes
      const fEntry = fringeMap[key];
      if (fEntry?.f != null) {
        nodeG.append('text')
          .attr('y', NODE_R + 22)
          .attr('text-anchor', 'middle')
          .attr('class', 'fill-yellow-600 dark:fill-yellow-400')
          .attr('font-size', 9)
          .attr('font-weight', 'bold')
          .text(`f=${Math.round(fEntry.f)}`);
      }
    }

    // Legend
    const legendData = [
      { label: 'Current', cls: 'fill-primary' },
      { label: 'Explored', cls: 'fill-muted-foreground/30' },
      { label: 'Fringe', cls: 'fill-yellow-400' },
      { label: 'Path', cls: 'fill-green-500' },
    ];
    const legend = g.append('g').attr('transform', `translate(15,${WORLD_H - 25})`);
    legendData.forEach((d, i) => {
      const x = i * 90;
      legend.append('circle').attr('cx', x).attr('cy', 0).attr('r', 5).attr('class', d.cls);
      legend.append('text')
        .attr('x', x + 10).attr('y', 0)
        .attr('text-anchor', 'start').attr('dominant-baseline', 'middle')
        .attr('class', 'fill-foreground').attr('font-size', 11)
        .text(d.label);
    });

    // Mode label
    const modeLabel = staticMode ? 'Romania Map' : MODE_LABELS[mode];
    const badge = g.append('g').attr('transform', `translate(${WORLD_W - 110},12)`);
    badge.append('rect')
      .attr('width', 100).attr('height', 24).attr('rx', 6)
      .attr('class', 'fill-primary');
    badge.append('text')
      .attr('x', 50).attr('y', 12)
      .attr('text-anchor', 'middle').attr('dominant-baseline', 'middle')
      .attr('fill', 'white').attr('font-size', 12).attr('font-weight', 'bold')
      .text(modeLabel);
  }, [state, mode, displayW, displayH, scale, interactive, onCityClick, highlightCities, staticMode]);

  const handlePlay = useCallback(() => setPlaying(true), []);
  const handlePause = useCallback(() => setPlaying(false), []);
  const handleStep = useCallback(() => {
    setPlaying(false);
    setStepIdx((prev) => Math.min(prev + 1, steps.length - 1));
  }, [steps.length]);
  const handleStepBack = useCallback(() => {
    setPlaying(false);
    setStepIdx((prev) => Math.max(prev - 1, 0));
  }, []);
  const handleReset = useCallback(() => {
    setPlaying(false);
    setStepIdx(0);
  }, []);

  const fringeDisplay = (state?.fringe ?? []).slice(0, 8);

  function formatFringeEntry(entry: FringeEntry): string {
    switch (mode) {
      case 'astar':
        return `${entry.node} f=${Math.round(entry.f ?? 0)} (g=${entry.cost}, h=${Math.round((entry.f ?? 0) - entry.cost)})`;
      case 'greedy':
        return `${entry.node} h=${Math.round(entry.f ?? 0)}`;
      case 'ucs':
        return `${entry.node} (g=${entry.cost})`;
      case 'bfs':
      case 'dfs':
      default:
        return entry.node;
    }
  }

  const fringeLabel = mode === 'bfs' ? 'Queue' : mode === 'dfs' ? 'Stack' : 'Fringe';

  if (staticMode) {
    return (
      <div className="rounded-lg border bg-card p-4 my-4 overflow-hidden" ref={containerRef}>
        <svg ref={svgRef} className="w-full" />
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card p-4 my-4 overflow-hidden" ref={containerRef}>
      <svg ref={svgRef} className="w-full" />
      <AlgoControls
        playing={playing}
        canStepForward={stepIdx < steps.length - 1}
        canStepBack={stepIdx > 0}
        speed={speed}
        onPlay={handlePlay}
        onPause={handlePause}
        onStep={handleStep}
        onStepBack={handleStepBack}
        onReset={handleReset}
        onSpeedChange={setSpeed}
      />
      <div className="px-1 py-1 text-sm">
        <strong>Step {stepIdx + 1}/{steps.length}:</strong>{' '}
        {state?.message}
      </div>
      {state?.path && state.type === 'solution' && (
        <div className="px-1 py-1 text-sm text-green-600 dark:text-green-400">
          <strong>Path:</strong> {state.path.join(' \u2192 ')} | <strong>Cost:</strong> {state.cost}
        </div>
      )}
      {fringeDisplay.length > 0 && (
        <div className="px-1 py-1 text-xs">
          <strong>{fringeLabel}</strong> ({state?.fringe.length}):
          <div className="flex gap-1.5 mt-1 flex-wrap">
            {fringeDisplay.map((entry: FringeEntry, i: number) => (
              <span key={i} className="px-2 py-0.5 rounded bg-muted border text-xs font-mono">
                {formatFringeEntry(entry)}
              </span>
            ))}
            {(state?.fringe.length ?? 0) > 8 && (
              <span className="text-muted-foreground">...{(state?.fringe.length ?? 0) - 8} more</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
