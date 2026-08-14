import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import * as d3 from 'd3';
import { bfs, dfs, type SearchState, type FringeEntry } from '@/lib/search';
import { TREE_NODES, TREE_GOAL, getTreeNeighbors } from './tree-drawing';
import { useContainerSize } from '@/hooks/useContainerSize';
import AlgoControls from '@/components/AlgoControls';

const WORLD_W = 700;
const WORLD_H = 280;
const NODE_R = 22;

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

// Node colors matching the old tree-drawing.ts constants
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

interface D3SearchTreeProps {
  algorithm: 'bfs' | 'dfs';
  label: string;
  fringeLabel: string;
}

export default function D3SearchTree({ algorithm, label, fringeLabel }: D3SearchTreeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const { width: containerW } = useContainerSize(containerRef, { width: WORLD_W, height: WORLD_H });

  const displayW = Math.min(containerW - 16, WORLD_W);
  const displayH = Math.round(displayW * (WORLD_H / WORLD_W));
  const scale = displayW / WORLD_W;

  const steps = useMemo(() => collectSteps(algorithm), [algorithm]);
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setStepIdx(0);
    setPlaying(false);
  }, [algorithm]);

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

    // Draw edges
    for (const node of Object.values(TREE_NODES)) {
      for (const childId of node.children) {
        const child = TREE_NODES[childId];
        const onPath = pathSet.has(node.id) && pathSet.has(childId);

        g.append('line')
          .attr('x1', node.x).attr('y1', node.y)
          .attr('x2', child.x).attr('y2', child.y)
          .attr('stroke', onPath ? COL_PATH : 'currentColor')
          .attr('class', onPath ? '' : 'text-border')
          .attr('stroke-width', onPath ? 3 : 1.5)
          .attr('opacity', 0.7);
      }
    }

    // Draw nodes
    for (const node of Object.values(TREE_NODES)) {
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

      const nodeG = g.append('g')
        .attr('transform', `translate(${node.x},${node.y})`);

      nodeG.append('circle')
        .attr('r', NODE_R)
        .attr('fill', fill)
        .attr('stroke', 'currentColor')
        .attr('class', 'text-foreground')
        .attr('stroke-width', 2);

      // Pulse effect for current node
      if (isCurrent && !isGoalFound) {
        nodeG.append('circle')
          .attr('r', NODE_R + 4)
          .attr('fill', 'none')
          .attr('stroke', COL_CURRENT)
          .attr('stroke-width', 2)
          .attr('opacity', 0.5);
      }

      const isGoal = node.id === TREE_GOAL;
      nodeG.append('text')
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('fill', contrastText(fill))
        .attr('font-size', 14)
        .attr('font-weight', 'bold')
        .text(node.id + (isGoal ? ' (G)' : ''));
    }
  }, [state, displayW, displayH, scale]);

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

  const fringeText = formatFringe(state?.fringe ?? [], algorithm);

  return (
    <div className="rounded-lg border bg-card p-4 my-6 overflow-hidden" ref={containerRef}>
      <div className="text-sm font-medium text-muted-foreground mb-3">{label}</div>
      <svg ref={svgRef} className="w-full" />
      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-[10px] text-muted-foreground">
        {[
          { color: COL_UNSEEN, label: 'Unseen' },
          { color: COL_FRINGE, label: 'Fringe' },
          { color: COL_CURRENT, label: 'Current' },
          { color: COL_EXPLORED, label: 'Explored' },
          { color: COL_GOAL, label: 'Goal' },
          { color: COL_PATH, label: 'Path' },
        ].map(({ color, label: l }) => (
          <span key={l} className="inline-flex items-center gap-1">
            <span className="inline-block size-2.5 rounded-full" style={{ backgroundColor: color }} />
            {l}
          </span>
        ))}
      </div>
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
      <div className="mt-3 text-sm font-mono leading-relaxed min-h-6">
        <strong>{fringeLabel}:</strong>{' '}
        {fringeText || <em className="text-muted-foreground">empty</em>}
      </div>
      <div className="mt-2 text-xs text-muted-foreground italic min-h-5">
        {state?.message}
      </div>
    </div>
  );
}
