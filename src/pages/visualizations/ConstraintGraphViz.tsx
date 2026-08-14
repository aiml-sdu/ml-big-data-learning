import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  createAustraliaMapCSP,
  type AustraliaColor,
  type AustraliaVariable,
  type DomainMap,
} from '@/lib/csp';
import {
  AustraliaConstraintGraph,
  AustraliaMapBoard,
  colorLabel,
  domainLabel,
} from './CSPShared';

const SAMPLE_DOMAINS: DomainMap<AustraliaColor> = {
  WA: ['red'],
  NT: ['green'],
  SA: ['blue'],
  Q: ['red', 'blue'],
  NSW: ['green', 'blue'],
  V: ['red', 'green'],
  T: ['red', 'green', 'blue'],
};

const SAMPLE_ASSIGNMENT: Partial<Record<AustraliaVariable, AustraliaColor>> = {
  WA: 'red',
  NT: 'green',
  SA: 'blue',
};

export default function ConstraintGraphViz() {
  const problem = useMemo(() => createAustraliaMapCSP(), []);
  const [activeRegion, setActiveRegion] = useState<AustraliaVariable>('SA');
  const [showMap, setShowMap] = useState(false);

  const neighbors = (problem.neighbors[activeRegion] ?? []) as AustraliaVariable[];
  const currentDomain = SAMPLE_DOMAINS[activeRegion];

  return (
    <div className="my-6 rounded-xl border bg-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold">Same problem, different view</h3>
          <p className="text-sm text-muted-foreground">
            In a constraint graph, nodes are variables and edges mean two variables constrain each other.
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={() => setShowMap((prev) => !prev)}>
          {showMap ? 'Show graph only' : 'Compare with map'}
        </Button>
      </div>

      <div className={`mt-4 grid gap-4 ${showMap ? 'lg:grid-cols-2' : ''}`}>
        <AustraliaConstraintGraph
          assignment={SAMPLE_ASSIGNMENT}
          problem={problem}
          domains={SAMPLE_DOMAINS}
          activeRegion={activeRegion}
          onNodeClick={setActiveRegion}
        />
        {showMap && (
          <AustraliaMapBoard
            assignment={SAMPLE_ASSIGNMENT}
            activeRegion={activeRegion}
            highlightRegions={neighbors}
          />
        )}
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-xl border bg-muted/30 p-4 text-sm">
          <div className="font-semibold">{activeRegion}</div>
          <p className="mt-1 text-muted-foreground">
            Degree: {neighbors.length} {neighbors.length === 1 ? 'neighbor' : 'neighbors'}
          </p>
          <p className="mt-2 text-muted-foreground">
            Current domain: <span className="font-medium text-foreground">{domainLabel(currentDomain)}</span>
          </p>
          <p className="mt-2 text-muted-foreground">
            Fixed color:{' '}
            <span className="font-medium text-foreground">
              {SAMPLE_ASSIGNMENT[activeRegion] ? colorLabel(SAMPLE_ASSIGNMENT[activeRegion]!) : 'not fixed yet'}
            </span>
          </p>
        </div>
        <div className="rounded-xl border bg-card p-4 text-sm">
          <div className="font-semibold">Constraints touching {activeRegion}</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {neighbors.map((neighbor) => (
              <button
                key={neighbor}
                type="button"
                onClick={() => setActiveRegion(neighbor as AustraliaVariable)}
                className="rounded-full border px-3 py-1.5 hover:bg-muted"
              >
                {activeRegion} ≠ {neighbor}
              </button>
            ))}
          </div>
          <p className="mt-4 text-muted-foreground">
            Click a node to trace its local neighborhood. SA sits in the center of the mainland graph, which makes it the most constrained variable.
          </p>
        </div>
      </div>
    </div>
  );
}
