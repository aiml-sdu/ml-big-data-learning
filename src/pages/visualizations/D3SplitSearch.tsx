import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import * as d3 from 'd3';
import { CITIES, EDGES, getNeighbors } from '@/lib/romania-graph';
import { astar, greedy, type SearchState } from '@/lib/search';
import { useContainerSize } from '@/hooks/useContainerSize';
import AlgoControls from '@/components/AlgoControls';

const WORLD_W = 410;
const WORLD_H = 320;
const NODE_R = 8;
const GAP = 16;

function hSLD(node: string): number {
  return CITIES[node]?.hSLD ?? 0;
}

function collectSteps(mode: 'astar' | 'greedy'): SearchState[] {
  const gen = mode === 'astar'
    ? astar('Arad', 'Bucharest', getNeighbors, hSLD)
    : greedy('Arad', 'Bucharest', getNeighbors, hSLD);
  const steps: SearchState[] = [];
  for (const s of gen) steps.push(s);
  return steps;
}

function countExpanded(steps: SearchState[], upTo: number): number {
  let n = 0;
  for (let i = 0; i <= upTo && i < steps.length; i++) {
    if (steps[i].type === 'expand') n++;
  }
  return n;
}

function drawHalf(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  w: number,
  h: number,
  state: SearchState | null,
  label: string,
  nodesExpanded: number,
) {
  const explored = state?.explored ?? new Set<string>();
  const current = state?.current;
  const pathSet = new Set(state?.path ?? []);
  const fringeNodes = new Set((state?.fringe ?? []).map((e) => e.node));

  function isEdgeOnPath(from: string, to: string): boolean {
    if (!state?.path) return false;
    const p = state.path;
    for (let i = 0; i < p.length - 1; i++) {
      if ((p[i] === from && p[i + 1] === to) || (p[i] === to && p[i + 1] === from)) return true;
    }
    return false;
  }

  const scaleX = w / 820;
  const scaleY = h / 520;

  // Edges
  for (const edge of EDGES) {
    const from = CITIES[edge.from];
    const to = CITIES[edge.to];
    const onPath = isEdgeOnPath(edge.from, edge.to);

    g.append('line')
      .attr('x1', from.x * scaleX).attr('y1', from.y * scaleY)
      .attr('x2', to.x * scaleX).attr('y2', to.y * scaleY)
      .attr('class', onPath ? 'stroke-green-500' : 'stroke-border')
      .attr('stroke-width', onPath ? 2 : 0.5)
      .attr('opacity', 0.6);
  }

  // Nodes
  for (const [key, city] of Object.entries(CITIES)) {
    const x = city.x * scaleX;
    const y = city.y * scaleY;
    const isPath = pathSet.has(key) && state?.type === 'solution';
    const isCurrent = key === current;
    const isExplored = explored.has(key);
    const isFringe = fringeNodes.has(key);

    let fillClass = 'fill-card';
    if (isPath) fillClass = 'fill-green-500';
    else if (isCurrent) fillClass = 'fill-primary';
    else if (isExplored) fillClass = 'fill-muted-foreground/30';
    else if (isFringe) fillClass = 'fill-yellow-400';

    g.append('circle')
      .attr('cx', x).attr('cy', y).attr('r', NODE_R)
      .attr('class', `${fillClass} stroke-border`)
      .attr('stroke-width', 1);

    // Small city name
    g.append('text')
      .attr('x', x).attr('y', y - NODE_R - 4)
      .attr('text-anchor', 'middle')
      .attr('class', 'fill-foreground')
      .attr('font-size', 7)
      .text(city.name);
  }

  // Label badge
  g.append('rect')
    .attr('x', 4).attr('y', 4).attr('width', 80).attr('height', 20).attr('rx', 4)
    .attr('class', 'fill-primary');
  g.append('text')
    .attr('x', 44).attr('y', 14)
    .attr('text-anchor', 'middle').attr('dominant-baseline', 'middle')
    .attr('fill', 'white').attr('font-size', 10).attr('font-weight', 'bold')
    .text(label);

  // Node counter
  g.append('text')
    .attr('x', w - 8).attr('y', 16)
    .attr('text-anchor', 'end')
    .attr('class', 'fill-foreground')
    .attr('font-size', 11)
    .attr('font-weight', 'bold')
    .text(`Expanded: ${nodesExpanded}`);

  // Cost if solution found
  if (state?.type === 'solution' && state.cost != null) {
    g.append('text')
      .attr('x', w - 8).attr('y', 30)
      .attr('text-anchor', 'end')
      .attr('class', 'fill-green-600 dark:fill-green-400')
      .attr('font-size', 10)
      .text(`Cost: ${state.cost}`);
  }
}

export default function D3SplitSearch() {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const { width: containerW } = useContainerSize(containerRef, { width: WORLD_W * 2 + GAP, height: WORLD_H });

  const totalW = Math.min(containerW - 16, WORLD_W * 2 + GAP);
  const halfW = (totalW - GAP) / 2;
  const halfH = Math.round(halfW * (WORLD_H / WORLD_W));
  const totalH = halfH;

  const greedySteps = useMemo(() => collectSteps('greedy'), []);
  const astarSteps = useMemo(() => collectSteps('astar'), []);
  const maxLen = Math.max(greedySteps.length, astarSteps.length);

  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (playing) {
      intervalRef.current = setInterval(() => {
        setStepIdx((prev) => {
          if (prev >= maxLen - 1) { setPlaying(false); return prev; }
          return prev + 1;
        });
      }, 800 / speed);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [playing, speed, maxLen]);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    if (!svgRef.current || totalW <= 0) return;

    svg.attr('width', totalW).attr('height', totalH);
    svg.selectAll('*').remove();

    const greedyIdx = Math.min(stepIdx, greedySteps.length - 1);
    const astarIdx = Math.min(stepIdx, astarSteps.length - 1);

    const gLeft = svg.append('g');
    drawHalf(gLeft, halfW, halfH, greedySteps[greedyIdx], 'Greedy', countExpanded(greedySteps, greedyIdx));

    const gRight = svg.append('g').attr('transform', `translate(${halfW + GAP},0)`);
    drawHalf(gRight, halfW, halfH, astarSteps[astarIdx], 'A*', countExpanded(astarSteps, astarIdx));

    // Divider
    svg.append('line')
      .attr('x1', halfW + GAP / 2).attr('y1', 0)
      .attr('x2', halfW + GAP / 2).attr('y2', totalH)
      .attr('class', 'stroke-border')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '4,4');

  }, [stepIdx, greedySteps, astarSteps, halfW, halfH, totalW, totalH]);

  const handlePlay = useCallback(() => setPlaying(true), []);
  const handlePause = useCallback(() => setPlaying(false), []);
  const handleStep = useCallback(() => {
    setPlaying(false);
    setStepIdx((prev) => Math.min(prev + 1, maxLen - 1));
  }, [maxLen]);
  const handleStepBack = useCallback(() => {
    setPlaying(false);
    setStepIdx((prev) => Math.max(prev - 1, 0));
  }, []);
  const handleReset = useCallback(() => {
    setPlaying(false);
    setStepIdx(0);
  }, []);

  return (
    <div className="rounded-lg border bg-card p-4 my-4 overflow-hidden" ref={containerRef}>
      <div className="text-sm font-medium text-muted-foreground mb-2">
        Greedy vs A*: Side-by-Side Race
      </div>
      <svg ref={svgRef} className="w-full" />
      <AlgoControls
        playing={playing}
        canStepForward={stepIdx < maxLen - 1}
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
        <strong>Step {stepIdx + 1}/{maxLen}</strong>
      </div>
    </div>
  );
}
