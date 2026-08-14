import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BlockMath, M } from '@/components/Math';

interface JointEntry {
  cavity: boolean;
  toothache: boolean;
  catch: boolean;
  prob: number;
}

const DATA: JointEntry[] = [
  { cavity: true, toothache: true, catch: true, prob: 0.108 },
  { cavity: true, toothache: true, catch: false, prob: 0.012 },
  { cavity: true, toothache: false, catch: true, prob: 0.072 },
  { cavity: true, toothache: false, catch: false, prob: 0.008 },
  { cavity: false, toothache: true, catch: true, prob: 0.016 },
  { cavity: false, toothache: true, catch: false, prob: 0.064 },
  { cavity: false, toothache: false, catch: true, prob: 0.144 },
  { cavity: false, toothache: false, catch: false, prob: 0.576 },
];

type QueryId =
  | 'p_toothache'
  | 'p_cavity'
  | 'p_toothache_and_cavity'
  | 'p_toothache_or_cavity'
  | 'p_toothache_given_cavity'
  | 'p_cavity_given_toothache_catch'
  | 'p_toothache_given_cavity_catch'
  | 'cond_indep';

interface Query {
  id: QueryId;
  label: string;
  formula: string;
  numerator: (e: JointEntry) => boolean;
  denominator: (e: JointEntry) => boolean;
  result: number;
  explanation: string;
}

const QUERIES: Query[] = [
  {
    id: 'p_toothache',
    label: 'P(toothache)',
    formula: 'P(\\text{toothache}) = \\sum_{c,k} P(c, \\text{toothache}, k)',
    numerator: (e) => e.toothache,
    denominator: () => false,
    result: 0.2,
    explanation: 'Sum all rows where toothache = true.',
  },
  {
    id: 'p_cavity',
    label: 'P(cavity)',
    formula: 'P(\\text{cavity}) = \\sum_{t,k} P(\\text{cavity}, t, k)',
    numerator: (e) => e.cavity,
    denominator: () => false,
    result: 0.2,
    explanation: 'Sum all rows where cavity = true.',
  },
  {
    id: 'p_toothache_and_cavity',
    label: 'P(toothache ∧ cavity)',
    formula: 'P(\\text{toothache} \\wedge \\text{cavity}) = \\sum_{k} P(\\text{cavity}, \\text{toothache}, k)',
    numerator: (e) => e.toothache && e.cavity,
    denominator: () => false,
    result: 0.12,
    explanation: 'Sum all rows where both toothache and cavity are true.',
  },
  {
    id: 'p_toothache_or_cavity',
    label: 'P(toothache ∨ cavity)',
    formula: 'P(\\text{toothache} \\vee \\text{cavity}) = P(T) + P(C) - P(T \\wedge C) = 0.2 + 0.2 - 0.12 = 0.28',
    numerator: (e) => e.toothache || e.cavity,
    denominator: () => false,
    result: 0.28,
    explanation: 'Sum all rows where toothache or cavity (or both) are true. Equivalently, use inclusion-exclusion.',
  },
  {
    id: 'p_toothache_given_cavity',
    label: 'P(toothache | cavity)',
    formula: 'P(\\text{toothache} \\mid \\text{cavity}) = \\frac{P(\\text{toothache} \\wedge \\text{cavity})}{P(\\text{cavity})} = \\frac{0.12}{0.2} = 0.6',
    numerator: (e) => e.toothache && e.cavity,
    denominator: (e) => e.cavity,
    result: 0.6,
    explanation: 'Numerator: rows with both toothache and cavity. Denominator: all rows with cavity.',
  },
  {
    id: 'p_cavity_given_toothache_catch',
    label: 'P(cavity | toothache, catch)',
    formula: 'P(\\text{cavity} \\mid \\text{toothache}, \\text{catch}) = \\frac{P(\\text{cavity}, \\text{toothache}, \\text{catch})}{P(\\text{toothache}, \\text{catch})} = \\frac{0.108}{0.124} \\approx 0.871',
    numerator: (e) => e.cavity && e.toothache && e.catch,
    denominator: (e) => e.toothache && e.catch,
    result: 0.108 / 0.124,
    explanation: 'Numerator: cavity ∧ toothache ∧ catch. Denominator: toothache ∧ catch (regardless of cavity).',
  },
  {
    id: 'p_toothache_given_cavity_catch',
    label: 'P(toothache | cavity, catch)',
    formula: 'P(\\text{toothache} \\mid \\text{cavity}, \\text{catch}) = \\frac{P(\\text{cavity}, \\text{toothache}, \\text{catch})}{P(\\text{cavity}, \\text{catch})} = \\frac{0.108}{0.18} = 0.6',
    numerator: (e) => e.cavity && e.toothache && e.catch,
    denominator: (e) => e.cavity && e.catch,
    result: 0.108 / 0.18,
    explanation: 'Numerator: cavity ∧ toothache ∧ catch. Denominator: cavity ∧ catch.',
  },
  {
    id: 'cond_indep',
    label: 'Check conditional independence',
    formula: 'P(\\text{toothache} \\mid \\text{cavity}) \\stackrel{?}{=} P(\\text{toothache} \\mid \\text{cavity}, \\text{catch})',
    numerator: () => false,
    denominator: () => false,
    result: 0,
    explanation: '',
  },
];

function varLabel(v: boolean, name: string): string {
  return v ? name : `¬${name}`;
}

export default function JointDistributionExplorerViz() {
  const [activeQuery, setActiveQuery] = useState<QueryId | null>(null);

  const query = QUERIES.find((q) => q.id === activeQuery);
  const isCondIndep = activeQuery === 'cond_indep';

  const getCellHighlight = (entry: JointEntry): string => {
    if (!query || isCondIndep) {
      if (isCondIndep) {
        const isNum1 = entry.toothache && entry.cavity;
        const isDen1 = entry.cavity;
        const isNum2 = entry.cavity && entry.toothache && entry.catch;
        const isDen2 = entry.cavity && entry.catch;
        if (isNum1 || isNum2) return 'bg-primary/20 font-semibold';
        if (isDen1 || isDen2) return 'bg-primary/10';
      }
      return '';
    }
    const isNum = query.numerator(entry);
    const isDen = query.denominator(entry);
    if (isNum) return 'bg-primary/20 font-semibold';
    if (isDen) return 'bg-primary/10';
    return '';
  };

  return (
    <div className="rounded-lg border border-border bg-card p-4 my-6 space-y-4">
      {/* Joint distribution table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-border">
              <th className="px-3 py-2 text-left font-semibold">Cavity</th>
              <th className="px-3 py-2 text-left font-semibold">Toothache</th>
              <th className="px-3 py-2 text-left font-semibold">Catch</th>
              <th className="px-3 py-2 text-right font-semibold">P</th>
            </tr>
          </thead>
          <tbody>
            {DATA.map((entry, i) => {
              const highlight = getCellHighlight(entry);
              return (
                <tr key={i} className={`border-b border-border transition-colors ${highlight}`}>
                  <td className="px-3 py-1.5">{varLabel(entry.cavity, 'cavity')}</td>
                  <td className="px-3 py-1.5">{varLabel(entry.toothache, 'toothache')}</td>
                  <td className="px-3 py-1.5">{varLabel(entry.catch, 'catch')}</td>
                  <td className="px-3 py-1.5 text-right font-mono">{entry.prob.toFixed(3)}</td>
                </tr>
              );
            })}
            <tr className="border-t-2 border-border font-semibold">
              <td colSpan={3} className="px-3 py-1.5 text-right text-muted-foreground">
                Total
              </td>
              <td className="px-3 py-1.5 text-right font-mono">
                {DATA.reduce((s, e) => s + e.prob, 0).toFixed(3)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Query buttons */}
      <div className="flex flex-wrap gap-2">
        {QUERIES.map((q) => (
          <Button
            key={q.id}
            variant={activeQuery === q.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveQuery(activeQuery === q.id ? null : q.id)}
          >
            {q.label}
          </Button>
        ))}
      </div>

      {/* Result display */}
      {query && !isCondIndep && (
        <div className="rounded-md border border-border bg-muted/30 p-3 space-y-2">
          <div className="overflow-x-auto">
            <BlockMath>{query.formula}</BlockMath>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{query.explanation}</p>
            <Badge variant="default" className="text-base font-mono px-3 py-1 ml-3 shrink-0">
              {query.result.toFixed(3)}
            </Badge>
          </div>

          {/* Show which cells contribute */}
          <div className="text-xs text-muted-foreground space-y-1">
            {query.denominator(DATA[0]) || query.denominator(DATA[1]) ? (
              <>
                <p>
                  <span className="inline-block w-3 h-3 bg-primary/20 rounded-sm mr-1 align-middle" />
                  Numerator cells (summed): {DATA.filter(query.numerator).map((e) => e.prob.toFixed(3)).join(' + ')} = {DATA.filter(query.numerator).reduce((s, e) => s + e.prob, 0).toFixed(3)}
                </p>
                <p>
                  <span className="inline-block w-3 h-3 bg-primary/10 rounded-sm mr-1 align-middle" />
                  Denominator cells (summed): {DATA.filter(query.denominator).map((e) => e.prob.toFixed(3)).join(' + ')} = {DATA.filter(query.denominator).reduce((s, e) => s + e.prob, 0).toFixed(3)}
                </p>
              </>
            ) : (
              <p>
                <span className="inline-block w-3 h-3 bg-primary/20 rounded-sm mr-1 align-middle" />
                Highlighted cells (summed): {DATA.filter(query.numerator).map((e) => e.prob.toFixed(3)).join(' + ')} = {DATA.filter(query.numerator).reduce((s, e) => s + e.prob, 0).toFixed(3)}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Conditional independence check */}
      {isCondIndep && (
        <div className="rounded-md border border-border bg-muted/30 p-3 space-y-3">
          <div className="text-sm font-semibold text-foreground">
            Are Toothache and Catch conditionally independent given Cavity?
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded border border-border p-2 bg-card space-y-1">
              <div className="text-sm font-medium text-foreground">
                <M>{'P(\\text{toothache} \\mid \\text{cavity})'}</M>
              </div>
              <div className="text-xs text-muted-foreground">
                = P(toothache, cavity) / P(cavity)
              </div>
              <div className="text-xs text-muted-foreground">
                = 0.120 / 0.200
              </div>
              <Badge variant="secondary" className="font-mono">= 0.600</Badge>
            </div>
            <div className="rounded border border-border p-2 bg-card space-y-1">
              <div className="text-sm font-medium text-foreground">
                <M>{'P(\\text{toothache} \\mid \\text{cavity}, \\text{catch})'}</M>
              </div>
              <div className="text-xs text-muted-foreground">
                = P(toothache, cavity, catch) / P(cavity, catch)
              </div>
              <div className="text-xs text-muted-foreground">
                = 0.108 / 0.180
              </div>
              <Badge variant="secondary" className="font-mono">= 0.600</Badge>
            </div>
          </div>

          <div className="overflow-x-auto">
            <BlockMath>
              {'P(\\text{toothache} \\mid \\text{cavity}) = P(\\text{toothache} \\mid \\text{cavity}, \\text{catch}) = 0.6'}
            </BlockMath>
          </div>

          <div className="rounded-md bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-2 text-sm text-emerald-800 dark:text-emerald-300">
            Yes! Toothache and Catch are <span className="font-semibold">conditionally independent</span> given Cavity. Knowing whether the probe catches does not change the probability of toothache, once we already know the cavity status.
          </div>
        </div>
      )}
    </div>
  );
}
