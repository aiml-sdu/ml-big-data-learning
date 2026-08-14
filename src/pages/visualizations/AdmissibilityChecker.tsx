import { useState, useMemo } from 'react';
import { CITIES, getNeighbors } from '@/lib/romania-graph';
import { cn } from '@/lib/utils';
import { Check, X } from 'lucide-react';

/** Compute true shortest-path cost from each city to Bucharest using Dijkstra */
function computeTrueCosts(): Record<string, number> {
  const costs: Record<string, number> = {};
  const visited = new Set<string>();
  // Min-heap via sorted array (small graph, ok)
  const pq: { city: string; cost: number }[] = [{ city: 'Bucharest', cost: 0 }];
  costs['Bucharest'] = 0;

  while (pq.length > 0) {
    pq.sort((a, b) => a.cost - b.cost);
    const { city, cost } = pq.shift()!;
    if (visited.has(city)) continue;
    visited.add(city);
    costs[city] = cost;

    for (const n of getNeighbors(city)) {
      if (!visited.has(n.city)) {
        const newCost = cost + n.cost;
        if (newCost < (costs[n.city] ?? Infinity)) {
          costs[n.city] = newCost;
          pq.push({ city: n.city, cost: newCost });
        }
      }
    }
  }

  return costs;
}

// Pick interesting cities (ones on or near the A* path + a few others)
const DISPLAY_CITIES = [
  'Arad', 'Sibiu', 'Fagaras', 'Rimnicu Vilcea', 'Pitesti', 'Bucharest',
  'Timisoara', 'Oradea', 'Craiova', 'Lugoj',
];

export default function AdmissibilityChecker() {
  const trueCosts = useMemo(computeTrueCosts, []);
  const [answers, setAnswers] = useState<Record<string, boolean | null>>({});
  const [revealed, setRevealed] = useState(false);

  const cities = DISPLAY_CITIES.map((name) => ({
    name,
    hSLD: CITIES[name].hSLD,
    hStar: trueCosts[name],
    admissible: CITIES[name].hSLD <= trueCosts[name],
  }));

  const toggleAnswer = (city: string) => {
    if (revealed) return;
    setAnswers((prev) => ({
      ...prev,
      [city]: prev[city] === true ? false : prev[city] === false ? null : true,
    }));
  };

  const allAnswered = cities.every((c) => answers[c.name] != null);
  const score = revealed
    ? cities.filter((c) => answers[c.name] === c.admissible).length
    : 0;

  return (
    <div className="rounded-lg border bg-card p-4 my-4">
      <div className="text-sm font-medium mb-3">
        For each city, is h<sub>SLD</sub> admissible? (h(n) &le; h*(n))
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 pr-4">City</th>
              <th className="text-right py-2 px-3">h<sub>SLD</sub></th>
              <th className="text-right py-2 px-3">h*(n)</th>
              <th className="text-center py-2 px-3">Admissible?</th>
            </tr>
          </thead>
          <tbody>
            {cities.map((c) => {
              const userAnswer = answers[c.name];
              const isCorrect = revealed && userAnswer === c.admissible;
              const isWrong = revealed && userAnswer !== c.admissible;

              return (
                <tr
                  key={c.name}
                  className={cn(
                    'border-b transition-colors',
                    isCorrect && 'bg-green-500/5',
                    isWrong && 'bg-red-500/5',
                  )}
                >
                  <td className="py-2 pr-4 font-medium">{c.name}</td>
                  <td className="text-right py-2 px-3 font-mono">{c.hSLD}</td>
                  <td className="text-right py-2 px-3 font-mono">
                    {revealed ? c.hStar : '???'}
                  </td>
                  <td className="text-center py-2 px-3">
                    <button
                      type="button"
                      onClick={() => toggleAnswer(c.name)}
                      disabled={revealed}
                      className={cn(
                        'inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-all',
                        userAnswer === true && 'bg-green-500/20 text-green-700 dark:text-green-400',
                        userAnswer === false && 'bg-red-500/20 text-red-700 dark:text-red-400',
                        userAnswer == null && 'bg-muted text-muted-foreground',
                        !revealed && 'cursor-pointer hover:bg-muted',
                      )}
                    >
                      {userAnswer === true && <Check className="size-3" />}
                      {userAnswer === false && <X className="size-3" />}
                      {userAnswer === true ? 'Yes' : userAnswer === false ? 'No' : 'Tap'}
                    </button>
                    {revealed && (
                      <span className={cn('ml-2 text-xs font-bold', isCorrect ? 'text-green-600' : 'text-red-600')}>
                        {isCorrect ? '\u2713' : '\u2717'}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex items-center gap-3">
        {!revealed ? (
          <button
            type="button"
            onClick={() => setRevealed(true)}
            disabled={!allAnswered}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-all',
              allAnswered
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'bg-muted text-muted-foreground cursor-not-allowed',
            )}
          >
            Check Answers
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold">
              Score: {score}/{cities.length}
            </span>
            {score === cities.length && (
              <span className="text-green-600 dark:text-green-400 text-sm font-bold">
                Perfect! h<sub>SLD</sub> is always admissible.
              </span>
            )}
            <button
              type="button"
              onClick={() => { setAnswers({}); setRevealed(false); }}
              className="text-xs text-primary underline"
            >
              Try again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
