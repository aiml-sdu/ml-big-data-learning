import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  createAustraliaMapCSP,
  type AustraliaColor,
  type AustraliaVariable,
  type DomainMap,
} from '@/lib/csp';
import { AustraliaAssignmentList, AustraliaConstraintGraph } from './CSPShared';

type AustraliaAssignment = Partial<Record<AustraliaVariable, AustraliaColor>>;

const TRACE: { assignment: AustraliaAssignment; plainMessage: string; fcMessage: string }[] = [
  {
    assignment: { WA: 'red', NT: 'green' },
    plainMessage: 'Plain backtracking just stores the two assignments and keeps going.',
    fcMessage: 'Forward checking removes red and green from SA, so SA is already forced to blue.',
  },
  {
    assignment: { WA: 'red', NT: 'green', Q: 'blue' },
    plainMessage: 'Still no explicit conflict, so plain backtracking continues exploring.',
    fcMessage: 'Now SA loses blue as well. Forward checking detects SA = ∅ immediately.',
  },
  {
    assignment: { WA: 'red', NT: 'green', Q: 'blue', NSW: 'red' },
    plainMessage: 'Plain backtracking spends another step extending a branch that is already doomed.',
    fcMessage: 'Forward checking would have already backtracked before exploring NSW at all.',
  },
  {
    assignment: { WA: 'red', NT: 'green', Q: 'blue', NSW: 'red', V: 'green' },
    plainMessage: 'The branch keeps growing, but the hidden contradiction remains.',
    fcMessage: 'This assignment never happens with forward checking because the branch was cut earlier.',
  },
  {
    assignment: { WA: 'red', NT: 'green', Q: 'blue', NSW: 'red', V: 'green' },
    plainMessage: 'Only when SA is selected does plain backtracking discover there is no legal color.',
    fcMessage: 'Forward checking saved these wasted expansions by noticing the empty domain right away.',
  },
];

function domainsAfterAssignment(assignment: AustraliaAssignment): DomainMap<AustraliaColor> {
  const problem = createAustraliaMapCSP();
  const domains: DomainMap<AustraliaColor> = {
    WA: ['red', 'green', 'blue'],
    NT: ['red', 'green', 'blue'],
    SA: ['red', 'green', 'blue'],
    Q: ['red', 'green', 'blue'],
    NSW: ['red', 'green', 'blue'],
    V: ['red', 'green', 'blue'],
    T: ['red', 'green', 'blue'],
  };

  for (const [variable, value] of Object.entries(assignment) as [AustraliaVariable, AustraliaColor][]) {
    domains[variable] = [value];
    for (const neighbor of problem.neighbors[variable] as AustraliaVariable[]) {
      if (assignment[neighbor]) continue;
      domains[neighbor] = domains[neighbor].filter((candidate) => candidate !== value);
    }
  }

  return domains;
}

function domainWipeouts(domains: DomainMap<AustraliaColor>): AustraliaVariable[] {
  return (Object.entries(domains) as [AustraliaVariable, AustraliaColor[]][])
    .filter(([, values]) => values.length === 0)
    .map(([variable]) => variable);
}

export default function ForwardCheckingViz() {
  const problem = useMemo(() => createAustraliaMapCSP(), []);
  const [index, setIndex] = useState(0);

  const current = TRACE[index];
  const forwardDomains = domainsAfterAssignment(current.assignment);
  const wipeouts = domainWipeouts(forwardDomains);
  const prevDomains = index > 0 ? domainsAfterAssignment(TRACE[index - 1].assignment) : null;
  const prevAssignment = index > 0 ? TRACE[index - 1].assignment : {};
  const newlyAssigned = (Object.keys(current.assignment) as AustraliaVariable[]).find(
    (k) => !(k in prevAssignment),
  );

  return (
    <div className="my-6 rounded-xl border bg-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold">Plain backtracking vs forward checking</h3>
          <p className="text-sm text-muted-foreground">
            Both methods make assignments. Only forward checking actively prunes future domains after each move.
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setIndex((prev) => Math.max(prev - 1, 0))} disabled={index === 0}>
            Previous
          </Button>
          <Button size="sm" onClick={() => setIndex((prev) => Math.min(prev + 1, TRACE.length - 1))} disabled={index === TRACE.length - 1}>
            Next
          </Button>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        {TRACE.map((_, i) => (
          <div
            key={i}
            className={cn(
              'size-2.5 rounded-full transition-colors',
              i < index ? 'bg-primary' : i === index ? 'bg-primary ring-2 ring-primary ring-offset-2 ring-offset-card' : 'bg-muted-foreground/30',
            )}
          />
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border bg-muted/20 p-4">
          <div className="font-semibold text-muted-foreground">Plain Backtracking</div>
          <p className="mt-2 text-sm text-muted-foreground">{current.plainMessage}</p>
          <div className="mt-4">
            <AustraliaAssignmentList assignment={current.assignment} highlightVariable={newlyAssigned} />
          </div>
        </div>

        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
          <div className="font-semibold">Forward Checking</div>
          <p className="mt-2 text-sm text-muted-foreground">{current.fcMessage}</p>
          <div className="mt-4 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
            <AustraliaConstraintGraph
              assignment={current.assignment}
              problem={problem}
              domains={forwardDomains}
              activeRegion={newlyAssigned ?? wipeouts[0] ?? 'SA'}
            />
            <div className="space-y-2.5 rounded-xl border bg-card p-4 text-sm">
              {(Object.entries(forwardDomains) as [AustraliaVariable, AustraliaColor[]][])
                .map(([variable, values]) => {
                  const pruned = prevDomains ? (prevDomains[variable as AustraliaVariable] ?? []).filter((v) => !values.includes(v)) : [];
                  return (
                    <div key={variable} className="flex items-center gap-2">
                      <span className="font-semibold w-8 shrink-0">{variable}</span>
                      <div className="flex flex-wrap gap-1">
                        {values.length === 0 ? (
                          <span className="rounded-full bg-red-500/20 px-2.5 py-0.5 text-xs font-bold text-red-600 dark:text-red-300">∅</span>
                        ) : values.map((v) => (
                          <span key={v} className="rounded-full bg-muted px-2.5 py-0.5 text-xs">{v}</span>
                        ))}
                        {pruned.map((v) => (
                          <span key={v} className="rounded-full bg-red-500/15 border border-red-500/30 px-2.5 py-0.5 text-xs text-red-500 line-through decoration-2">
                            {v}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              {wipeouts.length > 0 && (
                <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-red-700 dark:text-red-300">
                  Empty domain detected: {wipeouts.join(', ')}.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
