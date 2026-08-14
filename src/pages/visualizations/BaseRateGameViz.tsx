import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BlockMath, M } from '@/components/Math';

interface Round {
  disease: string;
  prevalence: number;
  sensitivity: number;
  fpr: number;
  description: string;
}

const ROUNDS: Round[] = [
  {
    disease: 'Flu',
    prevalence: 0.1,
    sensitivity: 0.9,
    fpr: 0.2,
    description: 'Flu season. 10% of patients have the flu. The rapid test has 90% sensitivity and 20% false positive rate.',
  },
  {
    disease: 'Strep Throat',
    prevalence: 0.05,
    sensitivity: 0.95,
    fpr: 0.1,
    description: 'A patient has a sore throat. 5% of such patients have strep. The test has 95% sensitivity and 10% false positive rate.',
  },
  {
    disease: 'Rare Virus',
    prevalence: 0.01,
    sensitivity: 0.95,
    fpr: 0.1,
    description: 'A new virus affects 1% of the population. The PCR test has 95% sensitivity and 10% false positive rate.',
  },
  {
    disease: 'Ultra-Rare Condition',
    prevalence: 0.0001,
    sensitivity: 0.99,
    fpr: 0.01,
    description: 'An ultra-rare genetic condition affects 0.01% of people. The screening test has 99% sensitivity and 1% false positive rate.',
  },
];

function computePosterior(r: Round): number {
  return (r.sensitivity * r.prevalence) / (r.sensitivity * r.prevalence + r.fpr * (1 - r.prevalence));
}

function pct(n: number): string {
  return (n * 100).toFixed(1) + '%';
}

function scoreDelta(guess: number, correct: number): number {
  const error = Math.abs(guess - correct);
  if (error <= 2) return 100;
  if (error <= 5) return 80;
  if (error <= 10) return 60;
  if (error <= 20) return 40;
  if (error <= 30) return 20;
  return 0;
}

type Phase = 'guess' | 'revealed';

interface RoundState {
  guess: number;
  phase: Phase;
  score: number;
}

export default function BaseRateGameViz() {
  const [currentRound, setCurrentRound] = useState(0);
  const [rounds, setRounds] = useState<RoundState[]>(() =>
    ROUNDS.map(() => ({ guess: 50, phase: 'guess', score: 0 }))
  );

  const finished = rounds.every((r) => r.phase === 'revealed');
  const totalScore = rounds.reduce((s, r) => s + r.score, 0);
  const round = ROUNDS[currentRound];
  const rs = rounds[currentRound];
  const correctPct = computePosterior(round) * 100;

  const handleGuessChange = (v: number) => {
    setRounds((prev) => prev.map((r, i) => (i === currentRound ? { ...r, guess: v } : r)));
  };

  const handleLockIn = () => {
    const pts = scoreDelta(rs.guess, correctPct);
    setRounds((prev) =>
      prev.map((r, i) => (i === currentRound ? { ...r, phase: 'revealed', score: pts } : r))
    );
  };

  const handleNext = () => {
    if (currentRound < ROUNDS.length - 1) setCurrentRound(currentRound + 1);
  };

  const handleRestart = () => {
    setCurrentRound(0);
    setRounds(ROUNDS.map(() => ({ guess: 50, phase: 'guess', score: 0 })));
  };

  return (
    <div className="rounded-lg border border-border bg-card p-4 my-6 space-y-4">
      {/* Progress dots */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {ROUNDS.map((_, i) => (
            <button
              key={i}
              onClick={() => rounds[i].phase === 'revealed' && setCurrentRound(i)}
              className={`w-8 h-8 rounded-full text-xs font-semibold flex items-center justify-center transition-colors ${
                i === currentRound
                  ? 'bg-primary text-primary-foreground'
                  : rounds[i].phase === 'revealed'
                    ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 cursor-pointer'
                    : 'bg-muted text-muted-foreground'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
        <Badge variant="outline" className="font-mono">
          Score: {totalScore}/{ROUNDS.length * 100}
        </Badge>
      </div>

      {/* Scenario */}
      {!finished && (
        <>
          <div className="rounded-md bg-muted/50 border border-border p-3">
            <div className="font-semibold text-foreground mb-1">{round.disease}</div>
            <p className="text-sm text-muted-foreground">{round.description}</p>
            <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
              <span>
                <M>{`P(D) = ${pct(round.prevalence)}`}</M>
              </span>
              <span>
                <M>{`P(+|D) = ${pct(round.sensitivity)}`}</M>
              </span>
              <span>
                <M>{`P(+|\\neg D) = ${pct(round.fpr)}`}</M>
              </span>
            </div>
          </div>

          {/* Guess area */}
          <div className="space-y-3">
            <p className="text-sm text-center text-muted-foreground">
              A patient tests <span className="font-semibold text-foreground">positive</span>. What is <M>{'P(D \\mid +)'}</M>?
            </p>

            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-8 text-right">0%</span>
              <input
                type="range"
                min={0}
                max={100}
                step={0.5}
                value={rs.guess}
                onChange={(e) => handleGuessChange(Number(e.target.value))}
                disabled={rs.phase === 'revealed'}
                className="flex-1 accent-primary h-2"
              />
              <span className="text-xs text-muted-foreground w-8">100%</span>
            </div>

            <div className="text-center">
              <span className="text-2xl font-bold tabular-nums text-foreground">{rs.guess.toFixed(1)}%</span>
            </div>

            {rs.phase === 'guess' && (
              <div className="flex justify-center">
                <Button onClick={handleLockIn}>Lock In</Button>
              </div>
            )}
          </div>

          {/* Reveal */}
          {rs.phase === 'revealed' && (
            <div className="rounded-md border border-border bg-muted/30 p-3 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm text-muted-foreground">Correct answer: </span>
                  <span className="text-lg font-bold text-foreground">{correctPct.toFixed(1)}%</span>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Your guess: </span>
                  <span className="text-lg font-bold text-foreground">{rs.guess.toFixed(1)}%</span>
                </div>
                <Badge
                  variant={rs.score >= 60 ? 'default' : 'secondary'}
                  className={rs.score >= 80 ? 'bg-emerald-600' : ''}
                >
                  +{rs.score} pts
                </Badge>
              </div>

              {/* Visual bar comparing guess vs correct */}
              <div className="relative h-6 rounded bg-muted overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full bg-primary/30 rounded transition-all"
                  style={{ width: `${correctPct}%` }}
                />
                <div
                  className="absolute top-0 h-full w-0.5 bg-primary"
                  style={{ left: `${correctPct}%` }}
                />
                <div
                  className="absolute top-0 h-full w-0.5 bg-destructive"
                  style={{ left: `${Math.min(rs.guess, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>
                  <span className="inline-block w-2 h-2 bg-primary mr-1 rounded-sm" />
                  Correct
                </span>
                <span>
                  <span className="inline-block w-2 h-2 bg-destructive mr-1 rounded-sm" />
                  Your guess
                </span>
              </div>

              <div className="overflow-x-auto text-sm">
                <BlockMath>
                  {`P(D|+) = \\frac{${round.sensitivity} \\times ${round.prevalence}}{${round.sensitivity} \\times ${round.prevalence} + ${round.fpr} \\times ${(1 - round.prevalence).toFixed(4)}} = ${correctPct.toFixed(1)}\\%`}
                </BlockMath>
              </div>

              {currentRound < ROUNDS.length - 1 && (
                <div className="flex justify-center">
                  <Button variant="outline" onClick={handleNext}>
                    Next Round
                  </Button>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Summary */}
      {finished && (
        <div className="rounded-md border border-border bg-muted/30 p-4 space-y-3 text-center">
          <div className="text-lg font-semibold text-foreground">Game Complete</div>
          <div className={`text-4xl font-bold tabular-nums ${totalScore >= 300 ? 'text-emerald-600 dark:text-emerald-400' : totalScore >= 200 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}`}>
            {totalScore} / {ROUNDS.length * 100}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
            {ROUNDS.map((r, i) => (
              <div key={i} className="rounded border border-border p-2 bg-card">
                <div className="font-medium text-foreground text-xs">{r.disease}</div>
                <div className="text-muted-foreground text-xs">
                  Guess: {rounds[i].guess.toFixed(1)}%
                </div>
                <div className="text-muted-foreground text-xs">
                  Actual: {(computePosterior(r) * 100).toFixed(1)}%
                </div>
                <Badge variant="secondary" className="mt-1 text-xs">
                  {rounds[i].score} pts
                </Badge>
              </div>
            ))}
          </div>

          <p className="text-sm text-muted-foreground">
            {totalScore >= 300
              ? 'Excellent! You have strong Bayesian intuition.'
              : totalScore >= 200
                ? 'Good effort! The base rate fallacy tricked you on some rounds.'
                : 'The base rate fallacy is powerful! Low prevalence makes even accurate tests produce mostly false positives.'}
          </p>

          <Button variant="outline" onClick={handleRestart}>
            Play Again
          </Button>
        </div>
      )}
    </div>
  );
}
