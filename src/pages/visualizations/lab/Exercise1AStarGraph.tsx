import { useState, useMemo, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import StepChallenge, { type StepDef } from '@/components/StepChallenge';

// A-L graph from lab handout
// Graph: A--B--C--D--E--F--G--H--I--J--K--L
// with cross-links and heuristics
const GRAPH: Record<string, { neighbors: { node: string; cost: number }[]; h: number }> = {
  A: { neighbors: [{ node: 'B', cost: 3 }, { node: 'D', cost: 5 }], h: 11 },
  B: { neighbors: [{ node: 'A', cost: 3 }, { node: 'C', cost: 2 }, { node: 'D', cost: 1 }], h: 9 },
  C: { neighbors: [{ node: 'B', cost: 2 }, { node: 'G', cost: 6 }], h: 8 },
  D: { neighbors: [{ node: 'A', cost: 5 }, { node: 'B', cost: 1 }, { node: 'E', cost: 4 }], h: 7 },
  E: { neighbors: [{ node: 'D', cost: 4 }, { node: 'F', cost: 2 }, { node: 'H', cost: 3 }], h: 5 },
  F: { neighbors: [{ node: 'E', cost: 2 }, { node: 'G', cost: 1 }], h: 3 },
  G: { neighbors: [{ node: 'C', cost: 6 }, { node: 'F', cost: 1 }, { node: 'L', cost: 4 }], h: 4 },
  H: { neighbors: [{ node: 'E', cost: 3 }, { node: 'I', cost: 2 }], h: 3 },
  I: { neighbors: [{ node: 'H', cost: 2 }, { node: 'J', cost: 3 }], h: 2 },
  J: { neighbors: [{ node: 'I', cost: 3 }, { node: 'K', cost: 1 }], h: 3 },
  K: { neighbors: [{ node: 'J', cost: 1 }, { node: 'L', cost: 2 }], h: 1 },
  L: { neighbors: [{ node: 'G', cost: 4 }, { node: 'K', cost: 2 }], h: 0 },
};

// Run A* from A to L to get the correct trace
interface TraceEntry {
  node: string;
  g: number;
  h: number;
  f: number;
}

function computeAStarTrace(): TraceEntry[] {
  const trace: TraceEntry[] = [];
  const open: { node: string; g: number; f: number; parent: string | null }[] = [
    { node: 'A', g: 0, f: GRAPH['A'].h, parent: null },
  ];
  const closed = new Set<string>();

  while (open.length > 0) {
    open.sort((a, b) => a.f - b.f || a.node.localeCompare(b.node));
    const current = open.shift()!;
    if (closed.has(current.node)) continue;
    closed.add(current.node);

    const h = GRAPH[current.node].h;
    trace.push({ node: current.node, g: current.g, h, f: current.f });

    if (current.node === 'L') break;

    for (const n of GRAPH[current.node].neighbors) {
      if (!closed.has(n.node)) {
        const g = current.g + n.cost;
        const f = g + GRAPH[n.node].h;
        open.push({ node: n.node, g, f, parent: current.node });
      }
    }
  }

  return trace;
}

export default function Exercise1AStarGraph() {
  const correctTrace = useMemo(computeAStarTrace, []);

  const steps: StepDef[] = correctTrace.map((entry, i) => ({
    id: i + 1,
    title: `Expand node ${i + 1}`,
    content: (onComplete: () => void) => (
      <TraceStep
        correctNode={entry.node}
        correctG={entry.g}
        correctH={entry.h}
        correctF={entry.f}
        previousNodes={correctTrace.slice(0, i).map((e) => e.node)}
        onComplete={onComplete}
      />
    ),
  }));

  return (
    <div>
      <p className="text-sm mb-3">
        Trace A* search from <strong>A</strong> to <strong>L</strong> on the graph below.
        At each step, identify which node gets expanded next.
      </p>
      {/* Graph visualization */}
      <div className="rounded border bg-muted/30 p-3 mb-4 text-xs font-mono overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b"><th className="text-left py-1">Node</th><th className="py-1">h(n)</th><th className="py-1">Neighbors</th></tr>
          </thead>
          <tbody>
            {Object.entries(GRAPH).map(([node, data]) => (
              <tr key={node} className="border-b border-border/30">
                <td className="py-1 font-bold">{node}</td>
                <td className="py-1 text-center">{data.h}</td>
                <td className="py-1">{data.neighbors.map((n) => `${n.node}(${n.cost})`).join(', ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <StepChallenge exerciseId="lab3-ex1" steps={steps} />
    </div>
  );
}

function TraceStep({
  correctNode,
  correctG,
  correctH,
  correctF,
  previousNodes,
  onComplete,
}: {
  correctNode: string;
  correctG: number;
  correctH: number;
  correctF: number;
  previousNodes: string[];
  onComplete: () => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const isCorrect = selected === correctNode;

  const availableNodes = Object.keys(GRAPH).filter((n) => !previousNodes.includes(n));

  const handleSubmit = useCallback(() => {
    setSubmitted(true);
    if (selected === correctNode) {
      setTimeout(onComplete, 400);
    }
  }, [selected, correctNode, onComplete]);

  return (
    <div>
      <p className="text-sm mb-2">
        Already expanded: <strong>{previousNodes.join(', ') || 'none'}</strong>
      </p>
      <p className="text-sm mb-2">Which node should A* expand next?</p>
      <div className="flex gap-1.5 flex-wrap mb-3">
        {availableNodes.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => !submitted && setSelected(n)}
            disabled={submitted}
            className={cn(
              'px-3 py-1.5 rounded border text-sm font-mono font-bold transition-colors',
              selected === n && !submitted && 'border-primary bg-primary/10',
              submitted && n === correctNode && 'border-green-500 bg-green-500/10',
              submitted && selected === n && n !== correctNode && 'border-red-500 bg-red-500/10',
              !submitted && selected !== n && 'hover:bg-muted',
            )}
          >
            {n}
          </button>
        ))}
      </div>
      {!submitted ? (
        <Button size="sm" onClick={handleSubmit} disabled={!selected}>
          Check
        </Button>
      ) : (
        <div className={cn(
          'rounded p-2 text-sm',
          isCorrect ? 'bg-green-500/10 text-green-700 dark:text-green-400' : 'bg-red-500/10 text-red-700 dark:text-red-400',
        )}>
          {isCorrect ? (
            <>Correct! {correctNode} has f = g + h = {correctG} + {correctH} = {correctF}</>
          ) : (
            <>Not quite. The correct answer is <strong>{correctNode}</strong> with f = {correctG} + {correctH} = {correctF}. Try the next step.</>
          )}
        </div>
      )}
    </div>
  );
}
