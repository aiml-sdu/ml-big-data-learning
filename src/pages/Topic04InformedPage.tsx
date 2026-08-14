import { lazy, Suspense, useCallback, type ReactNode } from 'react';
import LessonStepper from '@/components/LessonStepper';
import LessonCard from '@/components/LessonCard';
import QuizCard from '@/components/QuizCard';
import CalloutBox from '@/components/CalloutBox';
import CodeBlock from '@/components/CodeBlock';
import ExerciseCard from '@/components/ExerciseCard';
import { M, BlockMath } from '@/components/Math';
import PropertiesTable, { type AlgoProperty } from '@/components/PropertiesTable';
import {
  CARDS, SECTIONS,
  QUIZ_41, QUIZ_42, QUIZ_43, QUIZ_44, QUIZ_45, QUIZ_47,
} from '@/data/topic-04-cards';

// Lazy-load heavy visualizations
const D3RomaniaMap = lazy(() => import('./visualizations/D3RomaniaMap'));
const D3SplitSearch = lazy(() => import('./visualizations/D3SplitSearch'));
const BeTheAStarGame = lazy(() => import('./visualizations/BeTheAStarGame'));
const FormulaBuilder = lazy(() => import('./visualizations/FormulaBuilder'));
const AdmissibilityChecker = lazy(() => import('./visualizations/AdmissibilityChecker'));
const WeightSliderViz = lazy(() => import('./visualizations/WeightSliderViz'));
const EightPuzzleViz = lazy(() => import('./visualizations/EightPuzzleViz'));
const PathfindingGridViz = lazy(() => import('./visualizations/PathfindingGridViz'));
const Exercise1AStarGraph = lazy(() => import('./visualizations/lab/Exercise1AStarGraph'));
const Exercise2VacuumAStar = lazy(() => import('./visualizations/lab/Exercise2VacuumAStar'));
const Exercise3HeuristicDesign = lazy(() => import('./visualizations/lab/Exercise3HeuristicDesign'));
const PacManGame = lazy(() => import('./visualizations/PacManGame'));

const ALGO_PROPERTIES: AlgoProperty[] = [
  { name: 'Greedy Best-First', complete: 'No*', optimal: 'No', time: 'O(b^m)', space: 'O(b^m)' },
  { name: 'A*', complete: 'Yes', optimal: 'Yes (if h admissible)', time: 'O(b^m)', space: 'O(b^m)' },
  { name: 'Weighted A* (W>1)', complete: 'Yes', optimal: 'Bounded suboptimal', time: 'O(b^m)', space: 'O(b^m)' },
  { name: 'IDA*', complete: 'Yes', optimal: 'Yes (if h admissible)', time: 'O(b^m)', space: 'O(bd)' },
];

function VizLoading() {
  return <div className="animate-pulse rounded-lg bg-muted h-64 flex items-center justify-center text-muted-foreground text-sm">Loading visualization...</div>;
}


export default function Topic04InformedPage() {
  const renderCard = useCallback((index: number, _onComplete: () => void): ReactNode => {
    const card = CARDS[index];
    const section = SECTIONS.find((s) => s.id === card.sectionId);

    switch (card.component) {
      // ===== Card 1: The Lost Tourist =====
      case 'LostTourist':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              Imagine you're a tourist in Romania, trying to drive from <strong>Arad</strong> to{' '}
              <strong>Bucharest</strong>. You have no GPS, no map&mdash;just a list of cities and
              roads connecting them.
            </p>
            <p>
              Using blind search (BFS or DFS), you'd have to explore city after city with no sense
              of direction. You might head <em>away</em> from Bucharest before eventually stumbling
              toward it.
            </p>
            <CalloutBox type="info" title="The Problem with Blind Search">
              <p>
                Uninformed search algorithms know nothing about where the goal is. They explore
                systematically but wastefully&mdash;like knocking on every door in a city to find
                your friend's house.
              </p>
            </CalloutBox>
            <p>
              What if you had some hint about which direction to go? Even a rough estimate could
              save enormous effort. That's exactly what <strong>informed search</strong> gives us.
            </p>
          </LessonCard>
        );

      // ===== Card 2: What If You Had a Compass? =====
      case 'Compass':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              What if you could look at a map and measure the <strong>straight-line distance</strong>{' '}
              from your current city to Bucharest? That straight-line distance won't tell you the
              road distance, but it gives you a <em>direction</em>.
            </p>
            <CalloutBox type="key-idea" title="Heuristic Function">
              <p>
                A <strong>heuristic function</strong> h(n) estimates the cost of the cheapest
                path from node n to the goal. It encodes domain knowledge that the search
                algorithm can exploit to find solutions faster.
              </p>
            </CalloutBox>
            <CodeBlock language="pseudocode" code={`function h_SLD(city):
  return straight_line_distance(city, Bucharest)

// Examples:
h_SLD(Arad)      = 366
h_SLD(Sibiu)     = 253
h_SLD(Fagaras)   = 176
h_SLD(Bucharest) = 0`} />
            <p>
              The key question is: <em>how</em> should we use h(n)? There are two main
              approaches&mdash;greedy search and A* search.
            </p>
          </LessonCard>
        );

      // ===== Card 3: Quiz Heuristic Basics =====
      case 'QuizHeuristic':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <QuizCard questions={QUIZ_41} />
          </LessonCard>
        );

      // ===== Card 4: Be Greedy =====
      case 'BeGreedy':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              The simplest way to use a heuristic: always expand the node that{' '}
              <em>appears</em> closest to the goal. This is <strong>Greedy Best-First
              Search</strong>&mdash;it picks the node with the smallest h(n).
            </p>
            <CodeBlock language="pseudocode" code={`function GreedyBestFirst(start, goal, h):
  fringe = PriorityQueue ordered by h(n)
  fringe.insert(start, h(start))

  while fringe is not empty:
    node = fringe.pop()         // lowest h(n)
    if node == goal: return path
    for each neighbor of node:
      if neighbor not explored:
        fringe.insert(neighbor, h(neighbor))`} />
            <Suspense fallback={<VizLoading />}>
              <BeTheAStarGame mode="greedy" />
            </Suspense>
          </LessonCard>
        );

      // ===== Card 5: Greedy Step-Through =====
      case 'GreedyStepThrough':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              Watch Greedy Best-First Search in action on the Romania map. Notice how it
              follows the "compass" directly toward Bucharest.
            </p>
            <Suspense fallback={<VizLoading />}>
              <D3RomaniaMap mode="greedy" />
            </Suspense>
          </LessonCard>
        );

      // ===== Card 6: Greedy's Flaw =====
      case 'GreedyFlaw':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              Greedy found Bucharest, but is this the <em>cheapest</em> path? Let's compare:
            </p>
            <div className="grid grid-cols-2 gap-4 not-prose my-4">
              <div className="rounded-lg border p-4 text-center">
                <div className="text-sm font-medium text-muted-foreground mb-1">Greedy Path</div>
                <div className="text-2xl font-bold text-red-500">450</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Arad &rarr; Sibiu &rarr; Fagaras &rarr; Bucharest
                </div>
              </div>
              <div className="rounded-lg border p-4 text-center">
                <div className="text-sm font-medium text-muted-foreground mb-1">Optimal Path</div>
                <div className="text-2xl font-bold text-green-500">418</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Arad &rarr; Sibiu &rarr; R. Vilcea &rarr; Pitesti &rarr; Bucharest
                </div>
              </div>
            </div>
            <CalloutBox type="warning" title="Greedy Is Not Optimal">
              <p>
                Greedy Best-First Search only cares about h(n)&mdash;the estimated remaining
                cost&mdash;and completely ignores g(n)&mdash;the cost already paid. It can take
                an expensive detour that <em>looks</em> close to the goal.
              </p>
            </CalloutBox>
          </LessonCard>
        );

      // ===== Card 7: Quiz Greedy =====
      case 'QuizGreedy':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <QuizCard questions={QUIZ_42} />
          </LessonCard>
        );

      // ===== Card 8: The Missing Ingredient =====
      case 'MissingIngredient':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              Greedy ignores the past. UCS ignores the future. What if we combined both?
            </p>
            <CalloutBox type="key-idea" title="The A* Evaluation Function">
              <p>
                A* evaluates each node by:
              </p>
              <BlockMath>{'f(n) = g(n) + h(n)'}</BlockMath>
              <p>
                where <M>{'g(n)'}</M> is the actual cost from start to <M>{'n'}</M>, and <M>{'h(n)'}</M> is the estimated cost
                from <M>{'n'}</M> to the goal.
              </p>
            </CalloutBox>
            <p>
              <M>{'f(n)'}</M> estimates the <em>total cost of the cheapest solution that passes
              through <M>{'n'}</M></em>. By always expanding the node with the lowest <M>{'f(n)'}</M>,
              A* combines the optimality guarantee of UCS with the speed of informed search.
            </p>
            <Suspense fallback={<VizLoading />}>
              <FormulaBuilder />
            </Suspense>
          </LessonCard>
        );

      // ===== Card 9: Be A-Star =====
      case 'BeAStar':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              Now it's your turn. Pick the next city to expand at each step, choosing the
              one with the lowest <strong>f(n) = g(n) + h(n)</strong>.
            </p>
            <Suspense fallback={<VizLoading />}>
              <BeTheAStarGame mode="astar" />
            </Suspense>
          </LessonCard>
        );

      // ===== Card 10: A* vs Greedy Race =====
      case 'AStarVsGreedy':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              Compare A* and Greedy side-by-side on the Romania map. A* explores more nodes
              but finds the <em>optimal</em> path.
            </p>
            <Suspense fallback={<VizLoading />}>
              <D3SplitSearch />
            </Suspense>
            <table className="mt-4">
              <thead>
                <tr><th>Step</th><th>City</th><th>g(n)</th><th>h(n)</th><th>f(n)</th></tr>
              </thead>
              <tbody>
                <tr><td>1</td><td>Arad</td><td>0</td><td>366</td><td>366</td></tr>
                <tr><td>2</td><td>Sibiu</td><td>140</td><td>253</td><td>393</td></tr>
                <tr><td>3</td><td>Rimnicu Vilcea</td><td>220</td><td>193</td><td>413</td></tr>
                <tr><td>4</td><td>Pitesti</td><td>317</td><td>100</td><td>417</td></tr>
                <tr><td>5</td><td>Bucharest</td><td>418</td><td>0</td><td>418</td></tr>
              </tbody>
            </table>
          </LessonCard>
        );

      // ===== Card 11: Quiz A* =====
      case 'QuizAStar':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <QuizCard questions={QUIZ_43} />
          </LessonCard>
        );

      // ===== Card 12: Why A* Works =====
      case 'WhyAStarWorks':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              A* is optimal&mdash;but only if the heuristic is <strong>admissible</strong>:
              it must never overestimate the true cost to reach the goal.
            </p>
            <CalloutBox type="key-idea" title="Admissibility">
              <p>
                A heuristic <M>{'h(n)'}</M> is <strong>admissible</strong> if for every node <M>{'n'}</M>:
              </p>
              <BlockMath>{'h(n) \\leq h^*(n)'}</BlockMath>
              <p>
                where <M>{'h^*(n)'}</M> is the true cheapest cost from <M>{'n'}</M> to the goal. An admissible
                heuristic is <em>optimistic</em>.
              </p>
            </CalloutBox>
            <p>
              For Romania, <M>{'h_{\\text{SLD}}'}</M> is admissible because a straight line is always
              shorter than any road path.
            </p>
            <h3>Consistency (Monotonicity)</h3>
            <p>
              A stronger condition: for every node <M>{'n'}</M> and successor <M>{"n'"}</M> with step cost <M>{"c(n,n')"}</M>:
            </p>
            <BlockMath>{"h(n) \\leq c(n,n') + h(n')"}</BlockMath>
            <p>
              Consistency implies admissibility. If h is consistent, f-values along any path
              are non-decreasing, so A* never re-expands a node.
            </p>
            <p>
              Use the Romania map below as a reference. The checker lets you verify
              whether the straight-line heuristic values are admissible for each city.
            </p>
            <Suspense fallback={<VizLoading />}>
              <D3RomaniaMap static />
            </Suspense>
            <Suspense fallback={<VizLoading />}>
              <AdmissibilityChecker />
            </Suspense>
          </LessonCard>
        );

      // ===== Card 13: Quiz Admissibility =====
      case 'QuizAdmissibility':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <QuizCard questions={QUIZ_44} />
          </LessonCard>
        );

      // ===== Card 14: 8-Puzzle Heuristic Lab =====
      case 'EightPuzzleLab':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              The 8-puzzle is a classic testbed for heuristics. Two natural heuristics:
            </p>
            <ul>
              <li><strong>h1: Misplaced Tiles</strong> &mdash; Count tiles not in goal position.</li>
              <li><strong>h2: Manhattan Distance</strong> &mdash; Sum of minimum moves per tile.</li>
            </ul>
            <p>
              Both are admissible. h2 <strong>dominates</strong> h1: h2(n) &ge; h1(n) always.
              Try the interactive puzzle below and watch both heuristics update.
            </p>
            <Suspense fallback={<VizLoading />}>
              <EightPuzzleViz />
            </Suspense>
          </LessonCard>
        );

      // ===== Card 15: Heuristic Design =====
      case 'HeuristicDesign':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <h3>How to Invent Heuristics: Relaxation</h3>
            <p>
              Remove some constraints from the problem and solve the easier version:
            </p>
            <ul>
              <li>
                If a tile could move to any adjacent square (even if occupied),
                the solution cost is the Manhattan distance &rarr; <strong>h2</strong>.
              </li>
              <li>
                If a tile could teleport to its goal position in one step,
                the solution cost is the number of misplaced tiles &rarr; <strong>h1</strong>.
              </li>
            </ul>
            <CalloutBox type="key-idea" title="Dominance">
              <p>
                If <M>{'h_2(n) \\geq h_1(n)'}</M> for all <M>{'n'}</M> and both are admissible, <M>{'h_2'}</M>{' '}
                <strong>dominates</strong> <M>{'h_1'}</M>. A dominating heuristic is more informative,
                so A* with <M>{'h_2'}</M> never expands more nodes than A* with <M>{'h_1'}</M>.
              </p>
            </CalloutBox>
            <CalloutBox type="tip">
              <p>
                The cost of the optimal solution to a <em>relaxed</em> problem is always a
                lower bound on the original&mdash;making it automatically admissible.
              </p>
            </CalloutBox>
          </LessonCard>
        );

      // ===== Card 16: Quiz Design =====
      case 'QuizDesign':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <QuizCard questions={QUIZ_45} />
          </LessonCard>
        );

      // ===== Card 17: Pathfinding Playground =====
      case 'Pathfinding':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              Draw walls on the grid and run BFS, Greedy, or A*. Notice
              how each algorithm trades off exploration vs. optimality.
            </p>
            <Suspense fallback={<VizLoading />}>
              <PathfindingGridViz />
            </Suspense>
          </LessonCard>
        );

      // ===== Card 18: Pac-Man =====
      case 'PacMan':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              See search algorithms in action! Toggle between BFS, Greedy, and A* for
              each ghost and watch how they hunt differently.
            </p>
            <Suspense fallback={<VizLoading />}>
              <PacManGame />
            </Suspense>
          </LessonCard>
        );

      // ===== Card 19: Beyond A* =====
      case 'BeyondAStar':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              A* is optimal but expensive. For real-time applications, you might prefer a{' '}
              <em>nearly</em> optimal solution found much faster.
            </p>
            <h3>Weighted A*</h3>
            <BlockMath>{'f(n) = g(n) + W \\cdot h(n) \\quad \\text{where } W \\geq 1'}</BlockMath>
            <ul>
              <li><M>{'W = 1'}</M> — standard A*</li>
              <li><M>{'W > 1'}</M> — more aggressive, faster, bounded suboptimal</li>
              <li><M>{'W \\to \\infty'}</M> — approaches Greedy</li>
            </ul>
            <CalloutBox type="info" title="Bounded Suboptimality">
              <p>
                With weight <M>{'W'}</M>, the solution cost <M>{'C'}</M> satisfies:
              </p>
              <BlockMath>{'C \\leq W \\cdot C^*'}</BlockMath>
              <p>
                where <M>{'C^*'}</M> is the optimal cost.
              </p>
            </CalloutBox>
            <h3>Other Variants</h3>
            <ul>
              <li><strong>IDA*</strong> &mdash; A* with iterative deepening. Linear space O(bd).</li>
              <li><strong>SMA*</strong> &mdash; Drops worst node when memory is full.</li>
              <li><strong>RBFS</strong> &mdash; Recursive best-first with linear space.</li>
            </ul>
            <PropertiesTable data={ALGO_PROPERTIES} />
            <p className="text-xs text-muted-foreground">
              * Greedy is complete on finite spaces with cycle detection. b = branching factor,
              m = maximum depth, d = solution depth.
            </p>
            <Suspense fallback={<VizLoading />}>
              <WeightSliderViz />
            </Suspense>
          </LessonCard>
        );

      // ===== Card 20: Quiz Weighted =====
      case 'QuizWeighted':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <QuizCard questions={QUIZ_47} />
          </LessonCard>
        );

      // ===== Card 21: Lab 3 =====
      case 'Lab3':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              Put your knowledge into practice with three hands-on exercises.
            </p>
            <ExerciseCard exerciseId="lab3-ex1" number={1} title="A* on the A-L Graph" totalSteps={6} defaultOpen>
              <Suspense fallback={<VizLoading />}>
                <Exercise1AStarGraph />
              </Suspense>
            </ExerciseCard>
            <ExerciseCard exerciseId="lab3-ex2" number={2} title="Vacuum World A*" totalSteps={4}>
              <Suspense fallback={<VizLoading />}>
                <Exercise2VacuumAStar />
              </Suspense>
            </ExerciseCard>
            <ExerciseCard exerciseId="lab3-ex3" number={3} title="Heuristic Design" totalSteps={3}>
              <Suspense fallback={<VizLoading />}>
                <Exercise3HeuristicDesign />
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
      <h1 className="text-3xl font-bold tracking-tight mb-2">Topic 4: Informed Search</h1>
      <p className="text-muted-foreground mb-4">
        Use domain knowledge to search smarter, not harder.
      </p>
      <LessonStepper
        cards={CARDS}
        sections={SECTIONS}
        storagePrefix="lesson-t04"
        renderCard={renderCard}
      />
    </div>
  );
}
