import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { CITIES, EDGES, getNeighbors } from '@/lib/romania-graph';
import { astar, greedy, type SearchState } from '@/lib/search';
import { useContainerSize } from '@/hooks/useContainerSize';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const WORLD_W = 820;
const WORLD_H = 520;
const NODE_R = 14;

function hSLD(node: string): number {
  return CITIES[node]?.hSLD ?? 0;
}

/** Collect only the 'expand' steps (the ones where a city is chosen to expand) */
function collectExpandSequence(mode: 'astar' | 'greedy'): { city: string; state: SearchState }[] {
  const gen = mode === 'astar'
    ? astar('Arad', 'Bucharest', getNeighbors, hSLD)
    : greedy('Arad', 'Bucharest', getNeighbors, hSLD);
  const result: { city: string; state: SearchState }[] = [];
  for (const s of gen) {
    if (s.type === 'expand' && s.current) {
      result.push({ city: s.current, state: s });
    }
    if (s.type === 'solution') {
      result.push({ city: s.current!, state: s });
    }
  }
  return result;
}

interface BeTheAStarGameProps {
  mode: 'astar' | 'greedy';
}

export default function BeTheAStarGame({ mode }: BeTheAStarGameProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const { width: containerW } = useContainerSize(containerRef, { width: WORLD_W, height: WORLD_H });

  const displayW = Math.min(containerW - 16, WORLD_W);
  const displayH = Math.round(displayW * (WORLD_H / WORLD_W));
  const scale = displayW / WORLD_W;

  const expandSequence = useMemo(() => collectExpandSequence(mode), [mode]);

  const [currentStep, setCurrentStep] = useState(0);
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'wrong'; city: string } | null>(null);
  const [shake, setShake] = useState(false);
  const [completed, setCompleted] = useState(false);

  // Track expanded cities so far
  const expandedCities = useMemo(() => {
    const set = new Set<string>();
    for (let i = 0; i < currentStep; i++) {
      set.add(expandSequence[i].city);
    }
    return set;
  }, [currentStep, expandSequence]);

  // Get fringe cities (neighbors of expanded that aren't expanded yet)
  const fringeCities = useMemo(() => {
    const fringe = new Set<string>();
    for (const city of expandedCities) {
      for (const n of getNeighbors(city)) {
        if (!expandedCities.has(n.city)) fringe.add(n.city);
      }
    }
    // Also add start if step 0
    if (currentStep === 0) fringe.add('Arad');
    return fringe;
  }, [expandedCities, currentStep]);

  const correctCity = currentStep < expandSequence.length ? expandSequence[currentStep].city : null;

  const handleCityClick = useCallback((city: string) => {
    if (completed || !correctCity) return;

    if (city === correctCity) {
      setFeedback({ type: 'correct', city });
      setShake(false);
      setTimeout(() => {
        setFeedback(null);
        const next = currentStep + 1;
        if (next >= expandSequence.length) {
          setCompleted(true);
        } else {
          setCurrentStep(next);
        }
      }, 600);
    } else {
      setFeedback({ type: 'wrong', city });
      setShake(true);
      setTimeout(() => { setFeedback(null); setShake(false); }, 800);
    }
  }, [correctCity, currentStep, expandSequence.length, completed]);

  const handleReset = useCallback(() => {
    setCurrentStep(0);
    setFeedback(null);
    setShake(false);
    setCompleted(false);
  }, []);

  // Compute g/h/f for fringe for display
  const fringeInfo = useMemo(() => {
    if (currentStep === 0) return [{ city: 'Arad', g: 0, h: hSLD('Arad'), f: hSLD('Arad') }];
    // Use the state from the last expand step to get fringe info
    const lastState = expandSequence[currentStep - 1]?.state;
    if (!lastState) return [];
    return lastState.fringe
      .filter((e) => !expandedCities.has(e.node))
      .map((e) => ({
        city: e.node,
        g: e.cost,
        h: hSLD(e.node),
        f: e.f ?? e.cost + hSLD(e.node),
      }))
      .sort((a, b) => (mode === 'astar' ? a.f - b.f : a.h - b.h));
  }, [currentStep, expandSequence, expandedCities, mode]);

  // SVG rendering
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    if (!svgRef.current || displayW <= 0) return;

    svg.attr('width', displayW).attr('height', displayH);
    svg.selectAll('*').remove();

    const g = svg.append('g').attr('transform', `scale(${scale})`);

    // Edges
    for (const edge of EDGES) {
      const from = CITIES[edge.from];
      const to = CITIES[edge.to];
      g.append('line')
        .attr('x1', from.x).attr('y1', from.y)
        .attr('x2', to.x).attr('y2', to.y)
        .attr('class', 'stroke-border')
        .attr('stroke-width', 1).attr('opacity', 0.6);

      const mx = (from.x + to.x) / 2;
      const my = (from.y + to.y) / 2;
      g.append('text')
        .attr('x', mx).attr('y', my - 6)
        .attr('text-anchor', 'middle')
        .attr('class', 'fill-muted-foreground')
        .attr('font-size', 9)
        .text(edge.cost);
    }

    // Nodes
    for (const [key, city] of Object.entries(CITIES)) {
      const isExpanded = expandedCities.has(key);
      const isFringe = fringeCities.has(key);
      const isFeedback = feedback?.city === key;

      let fillClass = 'fill-card';
      let strokeClass = 'stroke-border';

      if (isExpanded) {
        fillClass = 'fill-muted-foreground/30';
      } else if (isFringe) {
        fillClass = 'fill-yellow-400';
        strokeClass = 'stroke-yellow-500';
      }

      if (isFeedback && feedback?.type === 'correct') {
        fillClass = 'fill-green-500';
        strokeClass = 'stroke-green-600';
      } else if (isFeedback && feedback?.type === 'wrong') {
        fillClass = 'fill-red-500';
        strokeClass = 'stroke-red-600';
      }

      const nodeG = g.append('g')
        .attr('transform', `translate(${city.x},${city.y})`)
        .attr('class', isFringe && !completed ? 'cursor-pointer' : '');

      if (isFringe && !completed) {
        nodeG.on('click', () => handleCityClick(key));
      }

      nodeG.append('circle')
        .attr('r', NODE_R)
        .attr('class', `${fillClass} ${strokeClass}`)
        .attr('stroke-width', 2);

      // Pulse for clickable fringe nodes
      if (isFringe && !isExpanded && !completed) {
        nodeG.append('circle')
          .attr('r', NODE_R + 3)
          .attr('class', 'stroke-yellow-500')
          .attr('fill', 'none')
          .attr('stroke-width', 1.5)
          .attr('opacity', 0.4);
      }

      nodeG.append('text')
        .attr('y', -NODE_R - 8)
        .attr('text-anchor', 'middle')
        .attr('class', 'fill-foreground')
        .attr('font-size', 10).attr('font-weight', 'bold')
        .text(city.name);

      nodeG.append('text')
        .attr('y', NODE_R + 12)
        .attr('text-anchor', 'middle')
        .attr('class', 'fill-muted-foreground')
        .attr('font-size', 9)
        .text(`h=${city.hSLD}`);
    }
  }, [expandedCities, fringeCities, feedback, completed, displayW, displayH, scale, handleCityClick]);

  return (
    <div className="rounded-lg border bg-card p-4 my-4 overflow-hidden" ref={containerRef}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium">
          {completed ? (
            <span className="text-green-600 dark:text-green-400 font-bold">
              Correct! You found the path!
            </span>
          ) : (
            <>
              Step {currentStep + 1}: Pick the city with the lowest{' '}
              <strong>{mode === 'astar' ? 'f(n)' : 'h(n)'}</strong>
            </>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={handleReset}>Reset</Button>
      </div>

      <div className={cn(shake && 'animate-[shake_0.3s_ease-in-out]')}>
        <svg ref={svgRef} className="w-full" />
      </div>

      {feedback?.type === 'wrong' && (
        <div className="text-sm text-red-600 dark:text-red-400 mt-1">
          Not quite! <strong>{feedback.city}</strong> isn't the lowest{' '}
          {mode === 'astar' ? 'f(n)' : 'h(n)'}. Try again.
        </div>
      )}

      {/* Priority queue panel */}
      {!completed && fringeInfo.length > 0 && (
        <div className="mt-3 text-xs">
          <div className="font-semibold mb-1">Priority Queue (Fringe):</div>
          <div className="flex gap-1.5 flex-wrap">
            {fringeInfo.map((info) => (
              <button
                key={info.city}
                type="button"
                onClick={() => handleCityClick(info.city)}
                className="px-2 py-1 rounded border bg-muted hover:bg-primary/10 transition-colors font-mono text-xs cursor-pointer"
              >
                {info.city}{' '}
                {mode === 'astar'
                  ? `f=${Math.round(info.f)} (g=${info.g}, h=${info.h})`
                  : `h=${info.h}`}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
