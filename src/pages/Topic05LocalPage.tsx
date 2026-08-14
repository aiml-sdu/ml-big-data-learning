import { lazy, Suspense, useCallback, type ReactNode } from 'react';
import LessonStepper from '@/components/LessonStepper';
import LessonCard from '@/components/LessonCard';
import QuizCard from '@/components/QuizCard';
import CalloutBox from '@/components/CalloutBox';
import CodeBlock from '@/components/CodeBlock';
import ExerciseCard from '@/components/ExerciseCard';
import { M, BlockMath } from '@/components/Math';
import {
  CARDS, SECTIONS,
  QUIZ_51, QUIZ_52, QUIZ_53, QUIZ_54, QUIZ_55,
} from '@/data/topic-05-cards';

// Lazy-load heavy visualizations
const LandscapeDiagramViz = lazy(() => import('./visualizations/LandscapeDiagramViz'));
const HillClimbingLandscapeGame = lazy(() => import('./visualizations/HillClimbingLandscapeGame'));
const SAAcceptanceProbViz = lazy(() => import('./visualizations/SAAcceptanceProbViz'));
const SimulatedAnnealingViz = lazy(() => import('./visualizations/SimulatedAnnealingViz'));
const GACrossoverDiagramViz = lazy(() => import('./visualizations/GACrossoverDiagramViz'));
const GAEvolutionGame = lazy(() => import('./visualizations/GAEvolutionGame'));
const NQueensGAViz = lazy(() => import('./visualizations/NQueensGAViz'));
const Exercise1RouletteSelection = lazy(() => import('./visualizations/lab/Exercise1RouletteSelection'));
const Exercise2CrossoverMutation = lazy(() => import('./visualizations/lab/Exercise2CrossoverMutation'));
const Exercise3NQueensGA = lazy(() => import('./visualizations/lab/Exercise3NQueensGA'));

function VizLoading() {
  return <div className="animate-pulse rounded-lg bg-muted h-64 flex items-center justify-center text-muted-foreground text-sm">Loading visualization...</div>;
}

export default function Topic05LocalPage() {
  const renderCard = useCallback((index: number, _onComplete: () => void): ReactNode => {
    const card = CARDS[index];
    const section = SECTIONS.find((s) => s.id === card.sectionId);

    switch (card.component) {
      // ===== Section 1: Beyond Search Trees =====

      case 'WhyLocal':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              So far, our search algorithms (BFS, DFS, A*) build a <strong>search tree</strong> and
              find a <em>path</em> from start to goal. This works beautifully for small
              problems&mdash;but what happens when the state space is enormous?
            </p>
            <div className="grid grid-cols-2 gap-4 not-prose my-4">
              <div className="rounded-lg border p-4 text-center">
                <div className="text-2xl font-bold text-red-500">10<sup>3000</sup></div>
                <div className="text-xs text-muted-foreground mt-1">states for 1000-Queens</div>
              </div>
              <div className="rounded-lg border p-4 text-center">
                <div className="text-2xl font-bold text-red-500">10<sup>25</sup></div>
                <div className="text-xs text-muted-foreground mt-1">cities in large TSP</div>
              </div>
            </div>
            <p>
              No search tree can handle this. We need a completely different approach:
              start with a <strong>complete state</strong> (even if it's bad) and
              iteratively <strong>improve</strong> it.
            </p>
            <CalloutBox type="key-idea" title="Local Search">
              <p>
                <strong>Local search</strong> algorithms operate on a single current state
                and move to neighboring states. They don't track paths or build trees&mdash;just
                keep the current state and try to improve it. This uses <M>{'O(1)'}</M> memory!
              </p>
            </CalloutBox>
            <table className="mt-4">
              <thead>
                <tr><th></th><th>Tree Search</th><th>Local Search</th></tr>
              </thead>
              <tbody>
                <tr><td><strong>Tracks</strong></td><td>Path + goal</td><td>Goal state only</td></tr>
                <tr><td><strong>Memory</strong></td><td><M>{'O(b^d)'}</M></td><td><M>{'O(1)'}</M></td></tr>
                <tr><td><strong>Best for</strong></td><td>Small, path-matters</td><td>Huge, goal-only</td></tr>
              </tbody>
            </table>
          </LessonCard>
        );

      case 'StateLandscape':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              To understand local search, think of the state space as a <strong>landscape</strong>.
              Each state has a height (the value of an objective function), and we want to find
              the highest peak.
            </p>
            <Suspense fallback={<VizLoading />}>
              <LandscapeDiagramViz />
            </Suspense>
            <p>
              The landscape has <strong>global maxima</strong> (the best answer),
              <strong> local maxima</strong> (peaks that aren't the best),
              <strong> flat plateaus</strong> (where the gradient gives no direction), and
              <strong> shoulders</strong> (where progress stalls temporarily).
            </p>
            <p>
              Local search algorithms try to navigate this landscape to find the global maximum.
              The challenge: how do you reach the top when you can only see your immediate neighbors?
            </p>
          </LessonCard>
        );

      case 'QuizMotivation':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <QuizCard questions={QUIZ_51} />
          </LessonCard>
        );

      // ===== Section 2: Hill Climbing =====

      case 'EverestFog':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              Imagine climbing Everest in thick fog with amnesia. You can't see the summit,
              you can't remember where you've been. All you can do is feel the ground around
              you and step uphill.
            </p>
            <CalloutBox type="key-idea" title="Hill Climbing">
              <p>
                <strong>Hill climbing</strong> (steepest-ascent): always move to the neighboring
                state with the highest value. If no neighbor is better, stop.
                It's greedy, memoryless, and surprisingly effective.
              </p>
            </CalloutBox>
            <CodeBlock language="pseudocode" code={`function HillClimbing(problem):
  current = initial_state
  loop:
    neighbor = best_neighbor(current)
    if value(neighbor) ≤ value(current):
      return current          // stuck!
    current = neighbor`} />
            <p>
              <strong>N-Queens example:</strong> place all queens on the board (one per column).
              Define <M>{'h'}</M> = number of attacking pairs. Goal: <M>{'h = 0'}</M>.
              Each step: move one queen within its column to minimize <M>{'h'}</M>.
            </p>
          </LessonCard>
        );

      case 'LandscapeGame':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              Try hill climbing yourself! Click to place a starting position, then step through
              the algorithm. When you get stuck, use <strong>random restart</strong> to escape.
            </p>
            <Suspense fallback={<VizLoading />}>
              <HillClimbingLandscapeGame />
            </Suspense>
          </LessonCard>
        );

      case 'HCAlgorithm':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              Hill climbing is deceptively simple. Here's the formal algorithm:
            </p>
            <CodeBlock language="pseudocode" code={`function SteepestAscentHillClimbing(problem):
  current = make_initial_state(problem)

  while true:
    neighbors = get_all_neighbors(current)
    best = argmax(neighbors, key=value)

    if value(best) ≤ value(current):
      return current          // local optimum reached

    current = best            // move uphill`} />
            <p>
              For 8-Queens, a "neighbor" is any state reachable by moving a single queen
              to a different row in the same column. That gives 8 × 7 = 56 neighbors per state.
            </p>
            <CalloutBox type="info" title="8-Queens Performance">
              <p>
                Steepest-ascent HC solves 8-Queens about 14% of the time from random starts,
                averaging only 4 steps when it succeeds. When it fails, it gets stuck after
                about 3 steps on average.
              </p>
            </CalloutBox>
          </LessonCard>
        );

      case 'HCProblems':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              Hill climbing can get stuck in three ways:
            </p>
            <ul>
              <li><strong>Local maximum:</strong> A peak that isn't the global maximum. All neighbors are worse.</li>
              <li><strong>Plateau:</strong> A flat area where all neighbors have the same value. No gradient to follow.</li>
              <li><strong>Ridge:</strong> A narrow elevated region. The algorithm oscillates without making progress.</li>
            </ul>
            <CalloutBox type="tip" title="Random-Restart Hill Climbing">
              <p>
                The fix is simple: run HC multiple times from random starting states.
                If each run has probability <M>{'p'}</M> of finding the global maximum,
                the expected number of restarts needed is <M>{'1/p'}</M>.
              </p>
            </CalloutBox>
            <p>
              For 8-Queens with <M>{'p \\approx 0.14'}</M>, random restart needs about
              7 attempts on average&mdash;roughly 22 steps total. This solves even
              1,000,000-Queens in under a minute!
            </p>
          </LessonCard>
        );

      case 'QuizHC':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <QuizCard questions={QUIZ_52} />
          </LessonCard>
        );

      // ===== Section 3: Simulated Annealing =====

      case 'SAIntro':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              Hill climbing never goes downhill&mdash;that's its weakness. What if we
              <em> sometimes</em> allowed bad moves, especially early on when we're still exploring?
            </p>
            <p>
              This is the idea behind <strong>Simulated Annealing</strong>, inspired by metallurgy:
              heating metal and then slowly cooling it allows atoms to settle into a low-energy
              crystalline structure.
            </p>
            <CalloutBox type="key-idea" title="Simulated Annealing">
              <p>
                Accept a <em>worse</em> neighbor with probability{' '}
                <M>{'P = e^{\\Delta E / T}'}</M>, where <M>{'\\Delta E'}</M> is
                the change in value (negative = worse) and <M>{'T'}</M> is the "temperature."
              </p>
              <p className="mt-2">
                High <M>{'T'}</M> → almost any move accepted (exploration).
                Low <M>{'T'}</M> → only good moves accepted (exploitation).
              </p>
            </CalloutBox>
            <CodeBlock language="pseudocode" code={`function SimulatedAnnealing(problem, schedule):
  current = initial_state
  for t = 1, 2, ...
    T = schedule(t)
    if T == 0: return current
    next = random_neighbor(current)
    ΔE = value(next) - value(current)
    if ΔE > 0:
      current = next          // always accept better
    else if random() < exp(ΔE/T):
      current = next          // sometimes accept worse`} />
          </LessonCard>
        );

      case 'SATemperature':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              The key to SA is the <strong>cooling schedule</strong>. The temperature
              starts high and gradually decreases. Explore the acceptance probability below:
            </p>
            <Suspense fallback={<VizLoading />}>
              <SAAcceptanceProbViz />
            </Suspense>
            <p>
              Notice: at high temperature, even large downhill moves are accepted frequently.
              As <M>{'T \\to 0'}</M>, SA converges to pure hill climbing.
            </p>
            <CalloutBox type="info" title="Theoretical Guarantee">
              <p>
                If the temperature decreases slowly enough (logarithmically), SA is guaranteed
                to find the global optimum with probability approaching 1. In practice, we use
                faster geometric cooling: <M>{'T_{t+1} = \\alpha \\cdot T_t'}</M> where{' '}
                <M>{'\\alpha \\approx 0.95\\text{--}0.99'}</M>.
              </p>
            </CalloutBox>
          </LessonCard>
        );

      case 'SAViz':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              Watch SA navigate the same landscape. Green dots are accepted good moves,
              orange dots are accepted <em>bad</em> moves (SA's superpower!), and gray dots are rejected.
            </p>
            <Suspense fallback={<VizLoading />}>
              <SimulatedAnnealingViz />
            </Suspense>
          </LessonCard>
        );

      case 'QuizSA':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <QuizCard questions={QUIZ_53} />
          </LessonCard>
        );

      // ===== Section 4: Genetic Algorithms =====

      case 'GADarwin':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              What if instead of improving one solution, we evolved a whole <em>population</em> of solutions?
              <strong> Genetic Algorithms</strong> (GAs) borrow from Darwinian evolution:
              the fittest survive, reproduce, and occasionally mutate.
            </p>
            <p>Developed by John Holland in the 1970s, GAs use this vocabulary:</p>
            <ul>
              <li><strong>Gene:</strong> a single value in the solution encoding</li>
              <li><strong>Chromosome:</strong> the full solution (a string of genes)</li>
              <li><strong>Population:</strong> a set of chromosomes</li>
              <li><strong>Fitness:</strong> how good a chromosome is (objective function value)</li>
              <li><strong>Generation:</strong> one cycle of selection → crossover → mutation</li>
            </ul>
            <CalloutBox type="key-idea" title="Genetic Algorithm">
              <p>
                Maintain a <strong>population</strong> of candidate solutions.
                Each generation: <strong>select</strong> the fittest,
                <strong> crossover</strong> pairs to create offspring, and
                <strong> mutate</strong> randomly. Over time, the population evolves toward
                optimal solutions.
              </p>
            </CalloutBox>
          </LessonCard>
        );

      case 'GAMechanics':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <h3>1. Selection (Roulette Wheel)</h3>
            <p>
              Each individual is selected with probability proportional to its fitness.
              Higher fitness → bigger slice of the "wheel" → more likely to be picked as a parent.
            </p>
            <BlockMath>{'P(\\text{select } i) = \\frac{f_i}{\\sum_j f_j}'}</BlockMath>

            <h3>2. Crossover (Single-Point)</h3>
            <p>
              Pick a random crossover point. Child 1 gets the first part from Parent 1 and
              the rest from Parent 2. Child 2 gets the opposite combination. Try it below:
            </p>
            <Suspense fallback={<VizLoading />}>
              <GACrossoverDiagramViz />
            </Suspense>

            <h3>3. Mutation (Bit Flip)</h3>
            <p>
              Each gene has a small probability (e.g., 5%) of being randomly changed.
              Mutation maintains <strong>genetic diversity</strong>, preventing the population
              from converging prematurely to a local optimum.
            </p>
          </LessonCard>
        );

      case 'GAEvolutionGame':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              Evolve a population of 8-bit strings to maximize the number of 1s (the "OneMax" problem).
              Adjust the mutation and crossover rates to see how they affect evolution!
            </p>
            <Suspense fallback={<VizLoading />}>
              <GAEvolutionGame />
            </Suspense>
          </LessonCard>
        );

      case 'GAAlgorithm':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>Putting it all together, here's the complete GA loop:</p>
            <CodeBlock language="pseudocode" code={`function GeneticAlgorithm(pop_size, fitness_fn, max_gens):
  population = random_population(pop_size)

  for gen = 1 to max_gens:
    // Selection
    parents = roulette_select(population, fitness_fn)

    // Crossover
    offspring = []
    for (p1, p2) in pairs(parents):
      if random() < crossover_rate:
        c1, c2 = crossover(p1, p2)
      else:
        c1, c2 = p1, p2
      offspring.append(c1, c2)

    // Mutation
    for individual in offspring:
      for each gene:
        if random() < mutation_rate:
          gene = random_value()

    population = offspring

  return best(population, fitness_fn)`} />
            <CalloutBox type="info" title="Typical Parameters">
              <p>
                Population size: 50&ndash;200. Crossover rate: 0.7&ndash;0.95.
                Mutation rate: 0.01&ndash;0.05. These are problem-dependent&mdash;experimentation is key!
              </p>
            </CalloutBox>
          </LessonCard>
        );

      case 'QuizGA':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <QuizCard questions={QUIZ_54} />
          </LessonCard>
        );

      // ===== Section 5: GA in Practice =====

      case 'GANQueens':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              Let's apply the GA to a real problem: <strong>8-Queens</strong>. Each chromosome
              is an array of 8 numbers, where <code>chromosome[i]</code> = column of the queen
              in row <code>i</code>. Fitness = 28 minus the number of attacking pairs.
            </p>
            <Suspense fallback={<VizLoading />}>
              <NQueensGAViz />
            </Suspense>
            <p>
              This is exactly the GA you'll implement in Python for Lab 4!
            </p>
          </LessonCard>
        );

      case 'QuizMastery':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <QuizCard questions={QUIZ_55} />
          </LessonCard>
        );

      // ===== Section 6: Lab 4 =====

      case 'Lab4':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              Put your knowledge into practice with three hands-on exercises.
            </p>
            <ExerciseCard exerciseId="lab4-ex1" number={1} title="Roulette Wheel Selection" totalSteps={4} defaultOpen>
              <Suspense fallback={<VizLoading />}>
                <Exercise1RouletteSelection />
              </Suspense>
            </ExerciseCard>
            <ExerciseCard exerciseId="lab4-ex2" number={2} title="Crossover & Mutation" totalSteps={4}>
              <Suspense fallback={<VizLoading />}>
                <Exercise2CrossoverMutation />
              </Suspense>
            </ExerciseCard>
            <ExerciseCard exerciseId="lab4-ex3" number={3} title="8-Queens GA" totalSteps={3}>
              <Suspense fallback={<VizLoading />}>
                <Exercise3NQueensGA />
              </Suspense>
            </ExerciseCard>
          </LessonCard>
        );

      default:
        return (
          <LessonCard title={card.title}>
            <p>Card content coming soon.</p>
          </LessonCard>
        );
    }
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight mb-2">Topic 5: Local Search</h1>
      <p className="text-muted-foreground mb-4">
        When the state space is too large for trees, search locally and improve iteratively.
      </p>
      <LessonStepper
        cards={CARDS}
        sections={SECTIONS}
        storagePrefix="lesson-t05"
        renderCard={renderCard}
      />
    </div>
  );
}
