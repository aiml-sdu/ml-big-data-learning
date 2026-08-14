import { lazy, Suspense, useCallback, type ReactNode } from 'react';
import LessonStepper from '@/components/LessonStepper';
import LessonCard from '@/components/LessonCard';
import QuizCard from '@/components/QuizCard';
import CalloutBox from '@/components/CalloutBox';
import CodeBlock from '@/components/CodeBlock';
import ExerciseCard from '@/components/ExerciseCard';
import PropertiesTable from '@/components/PropertiesTable';
import { M, BlockMath } from '@/components/Math';
import {
  CARDS, SECTIONS,
  QUIZ_61, QUIZ_62, QUIZ_63, QUIZ_64, QUIZ_65,
} from '@/data/topic-06-cards';

// Lazy-load heavy visualizations
const GameTaxonomyViz = lazy(() => import('./visualizations/GameTaxonomyViz'));
const GameTreeViz = lazy(() => import('./visualizations/GameTreeViz'));
const MinimaxPropagationGame = lazy(() => import('./visualizations/MinimaxPropagationGame'));
const AlphaBetaStepViz = lazy(() => import('./visualizations/AlphaBetaStepViz'));
const CoinsGameViz = lazy(() => import('./visualizations/CoinsGameViz'));
const ExpectiminimaxViz = lazy(() => import('./visualizations/ExpectiminimaxViz'));
const TicTacToeViz = lazy(() => import('./visualizations/TicTacToeViz'));
const AdversarialTimelineViz = lazy(() => import('./visualizations/AdversarialTimelineViz'));
const Exercise1TicTacToeMinimax = lazy(() => import('./visualizations/lab/Exercise1TicTacToeMinimax'));
const Exercise2NimAlphaBeta = lazy(() => import('./visualizations/lab/Exercise2NimAlphaBeta'));
const Exercise3Breakthrough = lazy(() => import('./visualizations/lab/Exercise3Breakthrough'));

function VizLoading() {
  return <div className="animate-pulse rounded-lg bg-muted h-64 flex items-center justify-center text-muted-foreground text-sm">Loading visualization...</div>;
}

const ALGO_COMPARISON = [
  { name: 'Minimax',        complete: 'Yes (finite)', optimal: 'Yes', time: 'O(b^m)',     space: 'O(bm)' },
  { name: 'Alpha-Beta',     complete: 'Yes',          optimal: 'Yes', time: 'O(b^{m/2})', space: 'O(bm)' },
  { name: 'Depth-Limited',  complete: 'No',           optimal: 'No',  time: 'O(b^d)',      space: 'O(bd)' },
];

export default function Topic06AdversarialPage() {
  const renderCard = useCallback((index: number, _onComplete: () => void): ReactNode => {
    const card = CARDS[index];
    const section = SECTIONS.find((s) => s.id === card.sectionId);

    switch (card.component) {
      // ===== Section 1: Games & Competition =====

      case 'WhyGames':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              What do chess masters, poker pros, and self-driving cars share?
              They all operate in <strong>adversarial environments</strong>&mdash;settings where
              the outcome depends not just on your actions, but on what your opponent does.
            </p>
            <div className="grid grid-cols-2 gap-4 not-prose my-4">
              <div className="rounded-lg border p-4 text-center">
                <div className="text-2xl font-bold text-blue-500">b &asymp; 35</div>
                <div className="text-xs text-muted-foreground mt-1">branching factor in chess</div>
              </div>
              <div className="rounded-lg border p-4 text-center">
                <div className="text-2xl font-bold text-blue-500">b &asymp; 250</div>
                <div className="text-xs text-muted-foreground mt-1">branching factor in Go</div>
              </div>
            </div>
            <p>
              Games have been the fruit fly of AI research since the field&rsquo;s inception.
              They provide clean, well-defined environments with clear success criteria&mdash;perfect
              testbeds for intelligent decision-making.
            </p>
            <CalloutBox type="key-idea" title="Adversarial Search">
              <p>
                <strong>Adversarial search</strong> is planning against an opponent who is actively
                trying to defeat you. Instead of finding a single path to a goal, you need
                a <em>strategy</em> that works no matter what the opponent does.
              </p>
            </CalloutBox>
          </LessonCard>
        );

      case 'GameTaxonomy':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              Games come in many flavors. Click each quadrant to explore the different types:
            </p>
            <Suspense fallback={<VizLoading />}>
              <GameTaxonomyViz />
            </Suspense>
            <CalloutBox type="info" title="Our Focus">
              <p>
                This topic focuses on <strong>deterministic, perfect-information, zero-sum,
                two-player games</strong>&mdash;the simplest setting that still requires adversarial reasoning.
                Chess, checkers, Go, and tic-tac-toe all fall in this category.
              </p>
            </CalloutBox>
          </LessonCard>
        );

      case 'QuizGames':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <QuizCard questions={QUIZ_61} />
          </LessonCard>
        );

      // ===== Section 2: Game Trees & Minimax =====

      case 'VsSearch':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              In single-agent search, we find a <em>path</em> from start to goal. In games,
              we need a <em>strategy</em>&mdash;a plan that accounts for every possible opponent response.
            </p>
            <table className="mt-4">
              <thead>
                <tr><th></th><th>Single-Agent Search</th><th>Game Search</th></tr>
              </thead>
              <tbody>
                <tr><td><strong>Goal</strong></td><td>Find a path</td><td>Find a strategy</td></tr>
                <tr><td><strong>Control</strong></td><td>Full control</td><td>Alternating turns</td></tr>
                <tr><td><strong>Opponent</strong></td><td>None</td><td>Adversary</td></tr>
                <tr><td><strong>Evaluation</strong></td><td>Path cost</td><td>Utility at terminal</td></tr>
              </tbody>
            </table>
            <CalloutBox type="key-idea" title="Strategy vs Path">
              <p>
                A <strong>strategy</strong> (or policy) maps every possible game state to a move.
                For chess, a full game tree has roughly <M>{'35^{80} \\approx 10^{120}'}</M> nodes&mdash;more
                than atoms in the observable universe.
              </p>
            </CalloutBox>
          </LessonCard>
        );

      case 'TTTTree':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              Let&rsquo;s start small with tic-tac-toe. The game tree shows all possible sequences
              of moves from the current state. Click nodes to expand:
            </p>
            <Suspense fallback={<VizLoading />}>
              <GameTreeViz />
            </Suspense>
            <CalloutBox type="info" title="TTT Complexity">
              <p>
                Tic-tac-toe has about 255,168 possible games (ignoring symmetry). Small enough to
                solve completely&mdash;making it the perfect playground for adversarial search algorithms.
              </p>
            </CalloutBox>
          </LessonCard>
        );

      case 'MinimaxIdea':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              The <strong>minimax algorithm</strong> computes the optimal value of each node in the game tree:
            </p>
            <BlockMath>{`\\text{minimax}(s) = \\begin{cases} \\text{utility}(s) & \\text{if terminal} \\\\ \\max_{a} \\text{minimax}(\\text{result}(s,a)) & \\text{if MAX's turn} \\\\ \\min_{a} \\text{minimax}(\\text{result}(s,a)) & \\text{if MIN's turn} \\end{cases}`}</BlockMath>
            <CodeBlock language="pseudocode" code={`function Minimax(state):
  if IsTerminal(state):
    return Utility(state)
  if IsMaxPlayer(state):
    value = -∞
    for each action in Actions(state):
      value = max(value, Minimax(Result(state, action)))
    return value
  else:  // MIN player
    value = +∞
    for each action in Actions(state):
      value = min(value, Minimax(Result(state, action)))
    return value`} />
            <CalloutBox type="key-idea" title="Minimax Optimality">
              <p>
                Minimax is <strong>optimal against an optimal opponent</strong>. It computes the best
                achievable outcome assuming the opponent also plays perfectly.
              </p>
            </CalloutBox>
            <CalloutBox type="tip" title="Complexity">
              <p>
                Time: <M>{'O(b^m)'}</M>, Space: <M>{'O(bm)'}</M> where <M>{'b'}</M> is the branching
                factor and <M>{'m'}</M> is the maximum depth. For chess: totally impractical.
              </p>
            </CalloutBox>
          </LessonCard>
        );

      case 'BeMinimax':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              Your turn! Assign minimax values to this tree by clicking nodes bottom-up.
              Start with the leaves (already filled), then work your way up.
            </p>
            <Suspense fallback={<VizLoading />}>
              <MinimaxPropagationGame />
            </Suspense>
          </LessonCard>
        );

      case 'QuizMinimax':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <QuizCard questions={QUIZ_62} />
          </LessonCard>
        );

      // ===== Section 3: Alpha-Beta Pruning =====

      case 'ABMotivation':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              Minimax explores every node in the game tree. For chess, that&rsquo;s roughly{' '}
              <M>{'10^{120}'}</M> nodes&mdash;at a billion nodes per second, that would take about{' '}
              <M>{'10^{107}'}</M> years. We need to be smarter.
            </p>
            <p>
              <strong>Analogy:</strong> Imagine house-shopping. You walk into the first room and
              the floor is missing. Do you check every other room? Of course not&mdash;you
              skip the rest and move on.
            </p>
            <CalloutBox type="key-idea" title="Alpha-Beta Pruning">
              <p>
                Alpha-beta pruning returns the <strong>exact same result</strong> as minimax, but
                skips branches that provably cannot affect the final decision. With perfect move
                ordering, it examines only <M>{'O(b^{m/2})'}</M> nodes&mdash;effectively
                doubling the searchable depth.
              </p>
            </CalloutBox>
          </LessonCard>
        );

      case 'ABAlgorithm':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <CodeBlock language="pseudocode" code={`function AlphaBeta(state, α, β):
  if IsTerminal(state):
    return Utility(state)
  if IsMaxPlayer(state):
    value = -∞
    for each action in Actions(state):
      value = max(value, AlphaBeta(Result(state, action), α, β))
      α = max(α, value)
      if α ≥ β: break        // β cutoff (prune!)
    return value
  else:
    value = +∞
    for each action in Actions(state):
      value = min(value, AlphaBeta(Result(state, action), α, β))
      β = min(β, value)
      if α ≥ β: break        // α cutoff (prune!)
    return value

// Initial call: AlphaBeta(root, -∞, +∞)`} />
            <CalloutBox type="info" title="The α and β Window">
              <p>
                <strong>α</strong> = best value MAX can guarantee so far (lower bound).<br />
                <strong>β</strong> = best value MIN can guarantee so far (upper bound).<br />
                When <M>{'\\alpha \\geq \\beta'}</M>, the current branch is provably irrelevant&mdash;prune it.
              </p>
            </CalloutBox>
            <BlockMath>{'\\text{Perfect ordering: } O(b^{m/2}) \\text{ nodes} \\Rightarrow \\text{effective branching factor} = \\sqrt{b}'}</BlockMath>
          </LessonCard>
        );

      case 'ABWalkthrough':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              Watch alpha-beta pruning in action. Step through the algorithm and see how
              it skips entire subtrees:
            </p>
            <Suspense fallback={<VizLoading />}>
              <AlphaBetaStepViz />
            </Suspense>
          </LessonCard>
        );

      case 'CoinsGame':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              Test your adversarial thinking! Take 1&ndash;3 coins per turn. Whoever takes the
              <strong> last coin loses</strong>. Can you beat the AI?
            </p>
            <Suspense fallback={<VizLoading />}>
              <CoinsGameViz />
            </Suspense>
          </LessonCard>
        );

      case 'QuizAB':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <QuizCard questions={QUIZ_63} />
          </LessonCard>
        );

      // ===== Section 4: Beyond Perfect Play =====

      case 'DepthLimits':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              For real games like chess, we can&rsquo;t search to terminal states. Instead,
              we use <strong>depth-limited minimax</strong> with an <strong>evaluation function</strong>{' '}
              <M>{'h(s)'}</M> that estimates utility at the cutoff depth.
            </p>
            <CodeBlock language="pseudocode" code={`function DepthLimitedMinimax(state, depth, α, β):
  if IsTerminal(state):
    return Utility(state)
  if depth == 0:
    return Evaluate(state)   // h(s) replaces utility
  // ... same as alpha-beta with depth-1`} />
            <CalloutBox type="key-idea" title="Evaluation Functions">
              <p>
                The evaluation function estimates how favorable a position is. In chess, a common
                approach uses <strong>material values</strong>: Queen=9, Rook=5, Bishop/Knight=3, Pawn=1.
                Add your pieces, subtract the opponent&rsquo;s.
              </p>
            </CalloutBox>
            <p>
              Other techniques: <strong>transposition tables</strong> (cache seen positions),
              <strong> move ordering</strong> (try best moves first for better pruning),
              <strong> quiescence search</strong> (don&rsquo;t evaluate in the middle of a capture sequence).
            </p>
            <PropertiesTable data={ALGO_COMPARISON} />
          </LessonCard>
        );

      case 'ChanceNodes':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              Some games (backgammon, Monopoly) involve dice or cards&mdash;elements of chance.
              We extend minimax with <strong>chance nodes</strong> that compute <em>expected values</em>:
            </p>
            <BlockMath>{'\\text{expectiminimax}(s) = \\sum_i P(d_i) \\cdot \\text{expectiminimax}(\\text{result}(s, d_i))'}</BlockMath>
            <Suspense fallback={<VizLoading />}>
              <ExpectiminimaxViz />
            </Suspense>
            <CalloutBox type="info" title="Impact on Pruning">
              <p>
                Alpha-beta is <strong>less effective</strong> with chance nodes because expected values
                shrink differences between branches. Modern approaches like
                <strong> Monte Carlo Tree Search</strong> (MCTS) handle stochastic games much better.
              </p>
            </CalloutBox>
          </LessonCard>
        );

      case 'TTTPlay':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              Put it all together! Play tic-tac-toe against a minimax AI. The AI plays
              perfectly&mdash;can you force a draw?
            </p>
            <Suspense fallback={<VizLoading />}>
              <TicTacToeViz />
            </Suspense>
          </LessonCard>
        );

      case 'QuizBeyond':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <QuizCard questions={QUIZ_64} />
          </LessonCard>
        );

      // ===== Section 5: Historical Milestones =====

      case 'History':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              The story of adversarial search spans over a century of AI breakthroughs:
            </p>
            <Suspense fallback={<VizLoading />}>
              <AdversarialTimelineViz />
            </Suspense>
            <CalloutBox type="key-idea" title="The Evolution of Game AI">
              <p>
                From brute-force search (<strong>Deep Blue</strong>, 1997) to learned evaluation +
                search (<strong>AlphaGo</strong>, 2016) to end-to-end learning
                (<strong>AlphaStar</strong>, 2019). Each generation combined search with increasingly
                powerful evaluation.
              </p>
            </CalloutBox>
          </LessonCard>
        );

      case 'QuizMastery':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <QuizCard questions={QUIZ_65} />
          </LessonCard>
        );

      // ===== Section 6: Lab 5 =====

      case 'Lab5':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              Put your knowledge into practice with three hands-on exercises.
            </p>
            <ExerciseCard exerciseId="lab5-ex1" number={1} title="Tic-Tac-Toe Minimax" totalSteps={4} defaultOpen>
              <Suspense fallback={<VizLoading />}>
                <Exercise1TicTacToeMinimax />
              </Suspense>
            </ExerciseCard>
            <ExerciseCard exerciseId="lab5-ex2" number={2} title="Nim Pile-Splitting" totalSteps={4}>
              <Suspense fallback={<VizLoading />}>
                <Exercise2NimAlphaBeta />
              </Suspense>
            </ExerciseCard>
            <ExerciseCard exerciseId="lab5-ex3" number={3} title="Breakthrough" totalSteps={3}>
              <Suspense fallback={<VizLoading />}>
                <Exercise3Breakthrough />
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
      <h1 className="text-3xl font-bold tracking-tight mb-2">Topic 6: Adversarial Search</h1>
      <p className="text-muted-foreground mb-4">
        When your opponent is trying to defeat you, you need a strategy that works no matter what they do.
      </p>
      <LessonStepper
        cards={CARDS}
        sections={SECTIONS}
        storagePrefix="lesson-t06"
        renderCard={renderCard}
      />
    </div>
  );
}
