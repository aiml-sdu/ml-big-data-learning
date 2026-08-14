import { useRef, useEffect, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { CITIES, EDGES, getNeighbors } from '@/lib/romania-graph';
import { weightedAstar, type SearchState } from '@/lib/search';
import { useContainerSize } from '@/hooks/useContainerSize';

const WORLD_W = 820;
const WORLD_H = 520;
const NODE_R = 12;

function hSLD(node: string): number {
  return CITIES[node]?.hSLD ?? 0;
}

function runWeighted(w: number): { steps: SearchState[]; cost: number | null; expanded: number } {
  const gen = weightedAstar('Arad', 'Bucharest', getNeighbors, hSLD, w);
  const steps: SearchState[] = [];
  let cost: number | null = null;
  let expanded = 0;
  for (const s of gen) {
    steps.push(s);
    if (s.type === 'expand') expanded++;
    if (s.type === 'solution') cost = s.cost ?? null;
  }
  return { steps, cost, expanded };
}

export default function WeightSliderViz() {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const { width: containerW } = useContainerSize(containerRef, { width: WORLD_W, height: WORLD_H });

  const displayW = Math.min(containerW - 16, WORLD_W);
  const displayH = Math.round(displayW * (WORLD_H / WORLD_W));
  const scale = displayW / WORLD_W;

  const [weight, setWeight] = useState(1.0);

  const result = useMemo(() => runWeighted(weight), [weight]);
  // Show the final state (solution)
  const finalState = result.steps[result.steps.length - 1] ?? null;

  // Draw
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    if (!svgRef.current || displayW <= 0) return;

    svg.attr('width', displayW).attr('height', displayH);
    svg.selectAll('*').remove();

    const g = svg.append('g').attr('transform', `scale(${scale})`);

    const explored = finalState?.explored ?? new Set<string>();
    const pathSet = new Set(finalState?.path ?? []);

    function isEdgeOnPath(from: string, to: string): boolean {
      if (!finalState?.path) return false;
      const p = finalState.path;
      for (let i = 0; i < p.length - 1; i++) {
        if ((p[i] === from && p[i + 1] === to) || (p[i] === to && p[i + 1] === from)) return true;
      }
      return false;
    }

    // Edges
    for (const edge of EDGES) {
      const from = CITIES[edge.from];
      const to = CITIES[edge.to];
      const onPath = isEdgeOnPath(edge.from, edge.to);

      g.append('line')
        .attr('x1', from.x).attr('y1', from.y)
        .attr('x2', to.x).attr('y2', to.y)
        .attr('class', onPath ? 'stroke-green-500' : 'stroke-border')
        .attr('stroke-width', onPath ? 3 : 1)
        .attr('opacity', onPath ? 1 : 0.5);

      if (onPath) {
        const mx = (from.x + to.x) / 2;
        const my = (from.y + to.y) / 2;
        g.append('text')
          .attr('x', mx).attr('y', my - 6)
          .attr('text-anchor', 'middle')
          .attr('class', 'fill-muted-foreground')
          .attr('font-size', 10)
          .text(edge.cost);
      }
    }

    // Nodes
    for (const [key, city] of Object.entries(CITIES)) {
      const isPath = pathSet.has(key);
      const isExplored = explored.has(key);

      let fillClass = 'fill-card';
      if (isPath) fillClass = 'fill-green-500';
      else if (isExplored) fillClass = 'fill-primary/30';

      const nodeG = g.append('g').attr('transform', `translate(${city.x},${city.y})`);
      nodeG.append('circle')
        .attr('r', NODE_R)
        .attr('class', `${fillClass} stroke-border`)
        .attr('stroke-width', 1.5);

      nodeG.append('text')
        .attr('y', -NODE_R - 6)
        .attr('text-anchor', 'middle')
        .attr('class', 'fill-foreground')
        .attr('font-size', 9).attr('font-weight', 'bold')
        .text(city.name);
    }

    // Weight badge
    const badge = g.append('g').attr('transform', `translate(${WORLD_W - 140},12)`);
    badge.append('rect')
      .attr('width', 130).attr('height', 24).attr('rx', 6)
      .attr('class', 'fill-primary');
    badge.append('text')
      .attr('x', 65).attr('y', 12)
      .attr('text-anchor', 'middle').attr('dominant-baseline', 'middle')
      .attr('fill', 'white').attr('font-size', 11).attr('font-weight', 'bold')
      .text(`W = ${weight.toFixed(1)}`);
  }, [finalState, displayW, displayH, scale, weight]);

  return (
    <div className="rounded-lg border bg-card p-4 my-4 overflow-hidden" ref={containerRef}>
      <div className="text-sm font-medium text-muted-foreground mb-2">
        Weighted A*: f(n) = g(n) + W * h(n)
      </div>

      <svg ref={svgRef} className="w-full" />

      {/* Slider */}
      <div className="flex items-center gap-3 mt-3">
        <span className="text-xs font-mono w-12">W = {weight.toFixed(1)}</span>
        <input
          type="range"
          min="1"
          max="5"
          step="0.1"
          value={weight}
          onChange={(e) => setWeight(Number(e.target.value))}
          className="flex-1 accent-primary"
        />
        <span className="text-xs text-muted-foreground w-6">5.0</span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mt-3 text-center">
        <div className="rounded-lg bg-muted p-2">
          <div className="text-xs text-muted-foreground">Path Cost</div>
          <div className="text-lg font-bold font-mono">{result.cost ?? '—'}</div>
        </div>
        <div className="rounded-lg bg-muted p-2">
          <div className="text-xs text-muted-foreground">Nodes Expanded</div>
          <div className="text-lg font-bold font-mono">{result.expanded}</div>
        </div>
        <div className="rounded-lg bg-muted p-2">
          <div className="text-xs text-muted-foreground">Bound</div>
          <div className="text-lg font-bold font-mono">&le; {Math.round(weight * 418)}</div>
        </div>
      </div>

      <div className="text-xs text-muted-foreground mt-2">
        W=1 is standard A* (cost 418). As W increases, search is faster but path cost may increase.
        The cost is always &le; W * C* = W * 418.
      </div>
    </div>
  );
}
