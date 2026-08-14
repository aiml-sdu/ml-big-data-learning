// ---------------------------------------------------------------------------
// local-search.ts – Local search algorithms as generator functions
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Seeded PRNG (xorshift32)
// ---------------------------------------------------------------------------

function xorshift32(seed: number): () => number {
  let s = seed | 0 || 1;
  return () => {
    s ^= s << 13;
    s ^= s >> 17;
    s ^= s << 5;
    return (s >>> 0) / 4294967296;
  };
}

// ---------------------------------------------------------------------------
// Landscape generator (sum of Gaussians)
// ---------------------------------------------------------------------------

export function generateLandscape(
  numPeaks: number,
  width: number,
  seed = 42,
): (x: number) => number {
  const rng = xorshift32(seed);
  const peaks: { cx: number; h: number; w: number }[] = [];
  for (let i = 0; i < numPeaks; i++) {
    peaks.push({
      cx: rng() * width,
      h: 0.3 + rng() * 0.7, // height 0.3–1.0
      w: width * (0.04 + rng() * 0.08), // width 4–12% of total
    });
  }
  return (x: number) => {
    let y = 0;
    for (const p of peaks) {
      const dx = (x - p.cx) / p.w;
      y += p.h * Math.exp(-0.5 * dx * dx);
    }
    return y;
  };
}

// Preset landscape with known features for the Hill Climbing game
export function gameplayLandscape(width: number): (x: number) => number {
  // Hand-tuned peaks: global max at ~75%, local max at ~25%, plateau ~50%
  const peaks = [
    { cx: width * 0.25, h: 0.6, w: width * 0.07 },
    { cx: width * 0.48, h: 0.45, w: width * 0.12 }, // plateau-ish
    { cx: width * 0.50, h: 0.44, w: width * 0.11 },
    { cx: width * 0.75, h: 1.0, w: width * 0.06 }, // global max
    { cx: width * 0.90, h: 0.35, w: width * 0.05 },
  ];
  return (x: number) => {
    let y = 0;
    for (const p of peaks) {
      const dx = (x - p.cx) / p.w;
      y += p.h * Math.exp(-0.5 * dx * dx);
    }
    return y;
  };
}

// ---------------------------------------------------------------------------
// Hill Climbing
// ---------------------------------------------------------------------------

export interface LocalSearchState {
  type: 'init' | 'step' | 'accept' | 'reject' | 'stuck' | 'solution';
  current: number;
  currentValue: number;
  candidate?: number;
  candidateValue?: number;
  temperature?: number;
  iteration: number;
  bestSoFar: number;
  bestValue: number;
  message: string;
}

export function* hillClimb(
  landscape: (x: number) => number,
  start: number,
  stepSize: number,
  maxIter = 200,
): Generator<LocalSearchState> {
  let current = start;
  let currentVal = landscape(current);
  let best = current;
  let bestVal = currentVal;

  yield {
    type: 'init',
    current,
    currentValue: currentVal,
    iteration: 0,
    bestSoFar: best,
    bestValue: bestVal,
    message: `Starting hill climb at x=${current.toFixed(1)}`,
  };

  for (let i = 1; i <= maxIter; i++) {
    const left = current - stepSize;
    const right = current + stepSize;
    const leftVal = landscape(left);
    const rightVal = landscape(right);

    let candidate: number;
    let candidateVal: number;
    if (leftVal > rightVal) {
      candidate = left;
      candidateVal = leftVal;
    } else {
      candidate = right;
      candidateVal = rightVal;
    }

    if (candidateVal > currentVal) {
      current = candidate;
      currentVal = candidateVal;
      if (currentVal > bestVal) {
        best = current;
        bestVal = currentVal;
      }
      yield {
        type: 'accept',
        current,
        currentValue: currentVal,
        candidate,
        candidateValue: candidateVal,
        iteration: i,
        bestSoFar: best,
        bestValue: bestVal,
        message: `Step ${i}: moved to x=${current.toFixed(1)} (value=${currentVal.toFixed(3)})`,
      };
    } else {
      yield {
        type: 'stuck',
        current,
        currentValue: currentVal,
        candidate,
        candidateValue: candidateVal,
        iteration: i,
        bestSoFar: best,
        bestValue: bestVal,
        message: `Stuck at local optimum x=${current.toFixed(1)} (value=${currentVal.toFixed(3)})`,
      };
      return;
    }
  }
}

// ---------------------------------------------------------------------------
// Simulated Annealing
// ---------------------------------------------------------------------------

export function* simulatedAnnealing(
  landscape: (x: number) => number,
  start: number,
  stepSize: number,
  initialTemp: number,
  coolingRate: number,
  maxIter = 500,
  seed = 123,
): Generator<LocalSearchState> {
  const rng = xorshift32(seed);
  let current = start;
  let currentVal = landscape(current);
  let best = current;
  let bestVal = currentVal;
  let temp = initialTemp;

  yield {
    type: 'init',
    current,
    currentValue: currentVal,
    temperature: temp,
    iteration: 0,
    bestSoFar: best,
    bestValue: bestVal,
    message: `Starting SA at x=${current.toFixed(1)}, T=${temp.toFixed(1)}`,
  };

  for (let i = 1; i <= maxIter; i++) {
    // Random neighbor
    const delta = (rng() - 0.5) * 2 * stepSize;
    const candidate = current + delta;
    const candidateVal = landscape(candidate);
    const deltaE = candidateVal - currentVal;

    if (deltaE > 0) {
      // Better — always accept
      current = candidate;
      currentVal = candidateVal;
      if (currentVal > bestVal) {
        best = current;
        bestVal = currentVal;
      }
      yield {
        type: 'accept',
        current,
        currentValue: currentVal,
        candidate,
        candidateValue: candidateVal,
        temperature: temp,
        iteration: i,
        bestSoFar: best,
        bestValue: bestVal,
        message: `Step ${i}: accepted better move (ΔE=+${deltaE.toFixed(3)}, T=${temp.toFixed(2)})`,
      };
    } else {
      // Worse — accept with probability exp(deltaE / temp)
      const prob = temp > 0.001 ? Math.exp(deltaE / temp) : 0;
      if (rng() < prob) {
        current = candidate;
        currentVal = candidateVal;
        yield {
          type: 'reject', // using 'reject' to mark "accepted bad move" for viz coloring
          current,
          currentValue: currentVal,
          candidate,
          candidateValue: candidateVal,
          temperature: temp,
          iteration: i,
          bestSoFar: best,
          bestValue: bestVal,
          message: `Step ${i}: accepted WORSE move (ΔE=${deltaE.toFixed(3)}, P=${prob.toFixed(3)}, T=${temp.toFixed(2)})`,
        };
      } else {
        yield {
          type: 'step',
          current,
          currentValue: currentVal,
          candidate,
          candidateValue: candidateVal,
          temperature: temp,
          iteration: i,
          bestSoFar: best,
          bestValue: bestVal,
          message: `Step ${i}: rejected worse move (ΔE=${deltaE.toFixed(3)}, P=${prob.toFixed(3)}, T=${temp.toFixed(2)})`,
        };
      }
    }

    temp *= coolingRate;
    if (temp < 0.001) {
      yield {
        type: 'stuck',
        current,
        currentValue: currentVal,
        temperature: temp,
        iteration: i,
        bestSoFar: best,
        bestValue: bestVal,
        message: `Temperature frozen. Best found: x=${best.toFixed(1)} (value=${bestVal.toFixed(3)})`,
      };
      return;
    }
  }
}

// ---------------------------------------------------------------------------
// Genetic Algorithm
// ---------------------------------------------------------------------------

export interface GAIndividual {
  chromosome: number[];
  fitness: number;
}

export interface GAState {
  type: 'init' | 'generation' | 'solution';
  population: GAIndividual[];
  generation: number;
  bestFitness: number;
  avgFitness: number;
  bestIndividual: number[];
  message: string;
}

export function* geneticAlgorithm(
  popSize: number,
  chromLen: number,
  fitnessFn: (chrom: number[]) => number,
  mutationRate: number,
  crossoverRate: number,
  maxGens: number,
  targetFitness?: number,
  seed = 42,
): Generator<GAState> {
  const rng = xorshift32(seed);

  // Initialize random population
  let population: GAIndividual[] = [];
  for (let i = 0; i < popSize; i++) {
    const chrom = Array.from({ length: chromLen }, () => (rng() < 0.5 ? 1 : 0));
    population.push({ chromosome: chrom, fitness: fitnessFn(chrom) });
  }
  population.sort((a, b) => b.fitness - a.fitness);

  const avg = population.reduce((s, ind) => s + ind.fitness, 0) / popSize;
  yield {
    type: 'init',
    population: population.map((p) => ({ ...p, chromosome: [...p.chromosome] })),
    generation: 0,
    bestFitness: population[0].fitness,
    avgFitness: avg,
    bestIndividual: [...population[0].chromosome],
    message: `Initial population (best fitness: ${population[0].fitness})`,
  };

  for (let gen = 1; gen <= maxGens; gen++) {
    // Selection (roulette wheel)
    const totalFitness = population.reduce((s, ind) => s + Math.max(ind.fitness, 0.01), 0);
    const select = (): GAIndividual => {
      let r = rng() * totalFitness;
      for (const ind of population) {
        r -= Math.max(ind.fitness, 0.01);
        if (r <= 0) return ind;
      }
      return population[population.length - 1];
    };

    const newPop: GAIndividual[] = [];
    while (newPop.length < popSize) {
      const p1 = select();
      const p2 = select();

      let c1 = [...p1.chromosome];
      let c2 = [...p2.chromosome];

      // Crossover
      if (rng() < crossoverRate) {
        const point = Math.floor(rng() * (chromLen - 1)) + 1;
        const t1 = [...c1.slice(0, point), ...c2.slice(point)];
        const t2 = [...c2.slice(0, point), ...c1.slice(point)];
        c1 = t1;
        c2 = t2;
      }

      // Mutation
      for (let i = 0; i < chromLen; i++) {
        if (rng() < mutationRate) c1[i] = 1 - c1[i];
        if (rng() < mutationRate) c2[i] = 1 - c2[i];
      }

      newPop.push({ chromosome: c1, fitness: fitnessFn(c1) });
      if (newPop.length < popSize) {
        newPop.push({ chromosome: c2, fitness: fitnessFn(c2) });
      }
    }

    population = newPop.sort((a, b) => b.fitness - a.fitness);
    const avgFit = population.reduce((s, ind) => s + ind.fitness, 0) / popSize;
    const best = population[0];

    if (targetFitness !== undefined && best.fitness >= targetFitness) {
      yield {
        type: 'solution',
        population: population.map((p) => ({ ...p, chromosome: [...p.chromosome] })),
        generation: gen,
        bestFitness: best.fitness,
        avgFitness: avgFit,
        bestIndividual: [...best.chromosome],
        message: `Solution found in generation ${gen}! Fitness: ${best.fitness}`,
      };
      return;
    }

    yield {
      type: 'generation',
      population: population.map((p) => ({ ...p, chromosome: [...p.chromosome] })),
      generation: gen,
      bestFitness: best.fitness,
      avgFitness: avgFit,
      bestIndividual: [...best.chromosome],
      message: `Generation ${gen}: best=${best.fitness}, avg=${avgFit.toFixed(2)}`,
    };
  }
}

// ---------------------------------------------------------------------------
// N-Queens GA helpers
// ---------------------------------------------------------------------------

export function nQueensFitness(queens: number[]): number {
  const n = queens.length;
  let attacks = 0;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (queens[i] === queens[j]) attacks++;
      if (Math.abs(queens[i] - queens[j]) === Math.abs(i - j)) attacks++;
    }
  }
  // Max possible attacking pairs for 8-queens = 28
  const maxPairs = (n * (n - 1)) / 2;
  return maxPairs - attacks;
}

export function* nQueensGA(
  n: number,
  popSize: number,
  mutationRate: number,
  crossoverRate: number,
  maxGens: number,
  seed = 42,
): Generator<GAState> {
  const rng = xorshift32(seed);
  const maxFitness = (n * (n - 1)) / 2; // 28 for 8-queens

  // Initialize: each chromosome is an array of column positions (0 to n-1)
  let population: GAIndividual[] = [];
  for (let i = 0; i < popSize; i++) {
    const chrom = Array.from({ length: n }, () => Math.floor(rng() * n));
    population.push({ chromosome: chrom, fitness: nQueensFitness(chrom) });
  }
  population.sort((a, b) => b.fitness - a.fitness);

  const avg = population.reduce((s, ind) => s + ind.fitness, 0) / popSize;
  yield {
    type: 'init',
    population: population.map((p) => ({ ...p, chromosome: [...p.chromosome] })),
    generation: 0,
    bestFitness: population[0].fitness,
    avgFitness: avg,
    bestIndividual: [...population[0].chromosome],
    message: `Initial population (best: ${population[0].fitness}/${maxFitness} non-attacking)`,
  };

  for (let gen = 1; gen <= maxGens; gen++) {
    const totalFitness = population.reduce((s, ind) => s + Math.max(ind.fitness, 0.1), 0);
    const select = (): GAIndividual => {
      let r = rng() * totalFitness;
      for (const ind of population) {
        r -= Math.max(ind.fitness, 0.1);
        if (r <= 0) return ind;
      }
      return population[population.length - 1];
    };

    const newPop: GAIndividual[] = [];
    while (newPop.length < popSize) {
      const p1 = select();
      const p2 = select();
      let c1 = [...p1.chromosome];
      let c2 = [...p2.chromosome];

      // Single-point crossover
      if (rng() < crossoverRate) {
        const point = Math.floor(rng() * (n - 1)) + 1;
        const t1 = [...c1.slice(0, point), ...c2.slice(point)];
        const t2 = [...c2.slice(0, point), ...c1.slice(point)];
        c1 = t1;
        c2 = t2;
      }

      // Mutation: random column for a random row
      for (let i = 0; i < n; i++) {
        if (rng() < mutationRate) c1[i] = Math.floor(rng() * n);
        if (rng() < mutationRate) c2[i] = Math.floor(rng() * n);
      }

      newPop.push({ chromosome: c1, fitness: nQueensFitness(c1) });
      if (newPop.length < popSize) {
        newPop.push({ chromosome: c2, fitness: nQueensFitness(c2) });
      }
    }

    population = newPop.sort((a, b) => b.fitness - a.fitness);
    const avgFit = population.reduce((s, ind) => s + ind.fitness, 0) / popSize;
    const best = population[0];

    if (best.fitness >= maxFitness) {
      yield {
        type: 'solution',
        population: population.map((p) => ({ ...p, chromosome: [...p.chromosome] })),
        generation: gen,
        bestFitness: best.fitness,
        avgFitness: avgFit,
        bestIndividual: [...best.chromosome],
        message: `Solution found in generation ${gen}! All ${maxFitness} pairs non-attacking.`,
      };
      return;
    }

    yield {
      type: 'generation',
      population: population.map((p) => ({ ...p, chromosome: [...p.chromosome] })),
      generation: gen,
      bestFitness: best.fitness,
      avgFitness: avgFit,
      bestIndividual: [...best.chromosome],
      message: `Gen ${gen}: best=${best.fitness}/${maxFitness}, avg=${avgFit.toFixed(1)}`,
    };
  }
}
