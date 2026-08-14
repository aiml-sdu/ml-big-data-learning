import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import * as d3 from 'd3';
import { bfs, dfs, type SearchState, type FringeEntry } from '@/lib/search';
import { TREE_NODES, TREE_GOAL, getTreeNeighbors } from './tree-drawing';
import { useContainerSize } from '@/hooks/useContainerSize';
import AlgoControls from '@/components/AlgoControls';

const WORLD_W = 700;
const WORLD_H = 260;
const NODE_R = 16;
const GAP = 16;

const COL_UNSEEN = '#9ca3af';
const COL_FRINGE = '#fbbf24';
const COL_CURRENT = '#ef4444';
const COL_EXPLORED = '#22c55e';
const COL_GOAL = '#3b82f6';
const COL_PATH = '#8b5cf6';

function contrastText(bg: string): string {
  const hex = bg.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.55 ? '#000' : '#fff';
}

function collectSteps(algorithm: 'bfs' | 'dfs'): SearchState[] {
  const gen = algorithm === 'bfs'
    ? bfs('A', TREE_GOAL, getTreeNeighbors)
    : dfs('A', TREE_GOAL, getTreeNeighbors);
  const steps: SearchState[] = [];
  for (const s of gen) steps.push(s);
  return steps;
}

function formatFringe(fringe: FringeEntry[], algorithm: 'bfs' | 'dfs'): string {
  if (fringe.length === 0) return '';
  const entries = algorithm === 'dfs' ? [...fringe].reverse() : fringe;
  return entries.map((e) => e.node).join(' \u2192 ');
}

function drawHalf(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  w: number, h: number,
  state: SearchState | null,
  label: string,
) {
  const scaleX = w / WORLD_W;
  const scaleY = h / WORLD_H;
  const explored = state?.explored ?? new Set<string>();
  const current = state?.current;
  const pathSet = new Set(state?.path ?? []);
  const fringeNodes = new Set((state?.fringe ?? []).map((e) => e.node));

  // Draw edges
  for (const node of Object.values(TREE_NODES)) {
    for (const childId of node.children) {
      const child = TREE_NODES[childId];
      const onPath = pathSet.has(node.id) && pathSet.has(childId);

      g.append('line')
        .attr('x1', node.x * scaleX).attr('y1', node.y * scaleY)
        .attr('x2', child.x * scaleX).attr('y2', child.y * scaleY)
        .attr('stroke', onPath ? COL_PATH : 'currentColor')
        .attr('class', onPath ? '' : 'text-border')
        .attr('stroke-width', onPath ? 2.5 : 1)
        .attr('opacity', 0.6);
    }
  }

  // Draw nodes
  const r = NODE_R * Math.min(scaleX, scaleY);
  for (const node of Object.values(TREE_NODES)) {
    const x = node.x * scaleX;
    const y = node.y * scaleY;
    const isGoalFound = state?.type === 'solution' && node.id === current;
    const isOnPath = state?.type === 'solution' && pathSet.has(node.id);
    const isCurrent = node.id === current;
    const isExplored = explored.has(node.id);
    const isFringe = fringeNodes.has(node.id);

    let fill = COL_UNSEEN;
    if (isGoalFound) fill = COL_GOAL;
    else if (isOnPath) fill = COL_PATH;
    else if (isCurrent) fill = COL_CURRENT;
    else if (isExplored) fill = COL_EXPLORED;
    else if (isFringe) fill = COL_FRINGE;

    g.append('circle')
      .attr('cx', x).attr('cy', y).attr('r', r)
      .attr('fill', fill)
      .attr('stroke', 'currentColor')
      .attr('class', 'text-foreground')
      .attr('stroke-width', 1.5);

    const isGoal = node.id === TREE_GOAL;
    g.append('text')
      .attr('x', x).attr('y', y)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('fill', contrastText(fill))
      .attr('font-size', Math.round(11 * Math.min(scaleX, scaleY)))
      .attr('font-weight', 'bold')
      .text(node.id + (isGoal ? ' (G)' : ''));
  }

  // Label badge
  g.append('rect')
    .attr('x', 4).attr('y', 4).attr('width', 50).attr('height', 20).attr('rx', 4)
    .attr('class', 'fill-primary');
  g.append('text')
    .attr('x', 29).attr('y', 14)
    .attr('text-anchor', 'middle').attr('dominant-baseline', 'middle')
    .attr('fill', 'white').attr('font-size', 11).attr('font-weight', 'bold')
    .text(label);
}

export default function D3SplitTree() {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const { width: containerW } = useContainerSize(containerRef, { width: WORLD_W + GAP, height: WORLD_H });

  const totalW = Math.min(containerW - 16, WORLD_W + GAP);
  const halfW = (totalW - GAP) / 2;
  const halfH = Math.round(halfW * (WORLD_H / WORLD_W));

  const bfsSteps = useMemo(() => collectSteps('bfs'), []);
  const dfsSteps = useMemo(() => collectSteps('dfs'), []);
  const maxLen = Math.max(bfsSteps.length, dfsSteps.length);

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

    svg.attr('width', totalW).attr('height', halfH);
    svg.selectAll('*').remove();

    const bfsIdx = Math.min(stepIdx, bfsSteps.length - 1);
    const dfsIdx = Math.min(stepIdx, dfsSteps.length - 1);

    const gLeft = svg.append('g');
    drawHalf(gLeft, halfW, halfH, bfsSteps[bfsIdx], 'BFS');

    const gRight = svg.append('g').attr('transform', `translate(${halfW + GAP},0)`);
    drawHalf(gRight, halfW, halfH, dfsSteps[dfsIdx], 'DFS');

    // Divider
    svg.append('line')
      .attr('x1', halfW + GAP / 2).attr('y1', 0)
      .attr('x2', halfW + GAP / 2).attr('y2', halfH)
      .attr('class', 'stroke-border')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '4,4');
  }, [stepIdx, bfsSteps, dfsSteps, halfW, halfH, totalW]);

  const bfsState = bfsSteps[Math.min(stepIdx, bfsSteps.length - 1)];
  const dfsState = dfsSteps[Math.min(stepIdx, dfsSteps.length - 1)];

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
    <div>
      <div className="rounded-lg border bg-card p-4 my-6 overflow-hidden" ref={containerRef}>
        <svg ref={svgRef} className="w-full" />
        <div className="grid grid-cols-2 gap-4 mt-3">
          <div className="text-sm font-mono leading-relaxed min-h-6">
            <strong>Queue:</strong>{' '}
            {formatFringe(bfsState?.fringe ?? [], 'bfs') || <em className="text-muted-foreground">empty</em>}
          </div>
          <div className="text-sm font-mono leading-relaxed min-h-6">
            <strong>Stack:</strong>{' '}
            {formatFringe(dfsState?.fringe ?? [], 'dfs') || <em className="text-muted-foreground">empty</em>}
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 mb-2 text-[10px] text-muted-foreground justify-center">
        {[
          { color: COL_UNSEEN, label: 'Unseen' },
          { color: COL_FRINGE, label: 'Fringe' },
          { color: COL_CURRENT, label: 'Current' },
          { color: COL_EXPLORED, label: 'Explored' },
          { color: COL_GOAL, label: 'Goal' },
          { color: COL_PATH, label: 'Path' },
        ].map(({ color, label }) => (
          <span key={label} className="inline-flex items-center gap-1">
            <span className="inline-block size-2.5 rounded-full" style={{ backgroundColor: color }} />
            {label}
          </span>
        ))}
      </div>
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
    </div>
  );
}
