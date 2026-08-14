import { lazy, Suspense, useCallback, type ReactNode } from 'react';
import LessonStepper from '@/components/LessonStepper';
import LessonCard from '@/components/LessonCard';
import QuizCard from '@/components/QuizCard';
import CalloutBox from '@/components/CalloutBox';
import CodeBlock from '@/components/CodeBlock';
import ExerciseCard from '@/components/ExerciseCard';
import PropertiesTable from '@/components/PropertiesTable';
import ClozeCodeExercise from '@/components/ClozeCodeExercise';
import { M, BlockMath } from '@/components/Math';
import InteractiveTreeViz from './visualizations/InteractiveTreeViz';
import {
  CARDS, SECTIONS,
  QUIZ_01, QUIZ_02, QUIZ_03, QUIZ_04, QUIZ_05, QUIZ_06,
  BFS_PROPS, DFS_PROPS, UCS_PROPS, ALL_PROPS,
  CLOZE_TREE_SEARCH,
} from '@/data/topic-03-cards';

// Lazy-load heavy visualizations
const D3RomaniaMap = lazy(() => import('./visualizations/D3RomaniaMap'));
const D3SearchTree = lazy(() => import('./visualizations/D3SearchTree'));
const D3SplitTree = lazy(() => import('./visualizations/D3SplitTree'));
const BeTheAlgorithmGame = lazy(() => import('./visualizations/BeTheAlgorithmGame'));
const IDSStepViz = lazy(() => import('./visualizations/IDSStepViz'));
const AlgorithmRaceViz = lazy(() => import('./visualizations/AlgorithmRaceViz'));
const ComplexityExplorerViz = lazy(() => import('./visualizations/ComplexityExplorerViz'));
const FringeFrenzyGame = lazy(() => import('./visualizations/FringeFrenzyGame'));
const Exercise1GraphTraversal = lazy(() => import('./visualizations/lab/Exercise1GraphTraversal'));
const Exercise2VacuumWorld = lazy(() => import('./visualizations/lab/Exercise2VacuumWorld'));
const Exercise3RiverCrossing = lazy(() => import('./visualizations/lab/Exercise3RiverCrossing'));

function VizLoading() {
  return <div className="animate-pulse rounded-lg bg-muted h-64 flex items-center justify-center text-muted-foreground text-sm">Loading visualization...</div>;
}

export default function Topic03UninformedPage() {
  const renderCard = useCallback((index: number, _onComplete: () => void): ReactNode => {
    const card = CARDS[index];
    const section = SECTIONS.find((s) => s.id === card.sectionId);

    switch (card.component) {
      // ===== Card 0: Lost in Romania =====
      case 'LostInRomania':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              You&rsquo;re in <strong>Arad</strong>, Romania, and you need to drive to
              <strong> Bucharest</strong>. You have a map showing cities connected by roads,
              each with a distance. How do you find the best route?
            </p>
            <Suspense fallback={<VizLoading />}>
              <D3RomaniaMap static />
            </Suspense>
            <p>
              This seemingly simple question is the foundation of <em>search</em> in
              AI&mdash;and the algorithms we develop here power everything from GPS
              navigation to game-playing programs.
            </p>
          </LessonCard>
        );

      // ===== Card 1: Anatomy of a Search Problem =====
      case 'SearchAnatomy':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              Before we can solve a problem, we need a precise way to describe it.
            </p>
            <CodeBlock language="pseudocode" code={`SearchProblem:
  initial_state   // where we start (e.g., "In Arad")
  actions(state)  // what we can do from any state
  result(s, a)    // the state we reach after action a
  goal_test(s)    // are we done?
  path_cost(path) // total cost of a sequence of actions`} />
            <CalloutBox type="key-idea" title="Universal Formulation">
              <p>
                Once you describe <em>any</em> problem in these five terms, you can apply
                the same search algorithms to solve it&mdash;from route-finding to puzzles
                to robot planning.
              </p>
            </CalloutBox>
            <p>
              The power of this abstraction: one algorithm, many problems. But how does the
              algorithm actually explore the space of possibilities?
            </p>
          </LessonCard>
        );

      // ===== Card 2: Quiz: Problem Formulation =====
      case 'QuizFormulation':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <QuizCard questions={QUIZ_01} />
          </LessonCard>
        );

      // ===== Card 3: Meet the Fringe =====
      case 'MeetTheFringe':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              At the heart of every search algorithm is the <strong>fringe</strong> (also
              called the frontier): a collection of nodes waiting to be expanded. Click
              nodes to expand them and watch the fringe grow.
            </p>
            <InteractiveTreeViz />
            <CalloutBox type="info">
              <p>
                The fringe is where all the action happens. Different algorithms differ
                <em> only</em> in how they pick the next node from the fringe.
              </p>
            </CalloutBox>
            <p>
              This idea is so fundamental that we can write a single algorithm template
              that covers BFS, DFS, and UCS.
            </p>
          </LessonCard>
        );

      // ===== Card 4: The Universal Search Template =====
      case 'TreeSearchTemplate':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <CodeBlock language="pseudocode" code={`function TREE-SEARCH(problem, fringe):
  fringe.INSERT(MAKE-NODE(problem.initial-state))
  loop:
    if fringe is empty: return failure
    node \u2190 fringe.REMOVE-FRONT()
    if problem.GOAL-TEST(node.state):
      return node
    fringe.INSERT-ALL(EXPAND(node, problem))`} />
            <CalloutBox type="key-idea">
              <p>
                BFS, DFS, UCS, A*&mdash;they all use this exact skeleton. The only
                difference is how <code>REMOVE-FRONT</code> picks the next node.
              </p>
            </CalloutBox>
            <p>Complete the algorithm by filling in the blanks:</p>
            <ClozeCodeExercise
              title="Complete the Tree Search Algorithm"
              lines={CLOZE_TREE_SEARCH}
            />
            <p>
              Now let&rsquo;s see what happens when we plug in a FIFO queue.
            </p>
          </LessonCard>
        );

      // ===== Card 5: Quiz: Search Foundations =====
      case 'QuizFoundations':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <QuizCard questions={QUIZ_02} />
          </LessonCard>
        );

      // ===== Card 6: BFS: The Wave =====
      case 'BFSWave':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              BFS explores the tree level by level using a <strong>FIFO queue</strong>.
              Think of it as exploring in concentric waves outward from the start.
            </p>
            <CodeBlock language="pseudocode" code={`function BFS(problem):
  fringe = Queue()             // FIFO
  fringe.enqueue(MAKE-NODE(problem.initial-state))
  loop:
    if fringe is empty: return failure
    node = fringe.dequeue()    // shallowest first
    if problem.GOAL-TEST(node.state): return node
    for child in EXPAND(node, problem):
      fringe.enqueue(child)`} />
            <Suspense fallback={<VizLoading />}>
              <D3SearchTree algorithm="bfs" label="BFS on Tree (Goal: G)" fringeLabel="Fringe (Queue)" />
            </Suspense>
            <p>
              BFS always finds the shallowest solution. But is shallowest the same as
              cheapest? Let&rsquo;s check.
            </p>
          </LessonCard>
        );

      // ===== Card 7: Be the BFS =====
      case 'BeBFS':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              <strong>You</strong> are the algorithm. Click nodes in the exact order that
              BFS would expand them.
            </p>
            <Suspense fallback={<VizLoading />}>
              <BeTheAlgorithmGame />
            </Suspense>
          </LessonCard>
        );

      // ===== Card 8: BFS Properties =====
      case 'BFSProperties':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <PropertiesTable data={BFS_PROPS} />
            <p className="text-xs text-muted-foreground">* Optimal only when all step costs are equal.</p>
            <BlockMath>{'\\text{Time} = O(b^d) \\qquad \\text{Space} = O(b^d)'}</BlockMath>
            <CalloutBox type="warning">
              <p>
                Space is BFS&rsquo;s Achilles heel. It must store every node at the current
                depth, which grows exponentially. With <M>{"b = 10"}</M> and <M>{"d = 10"}</M>,
                that&rsquo;s 10 billion nodes in memory.
              </p>
            </CalloutBox>
            <p>
              What if we could trade optimality for dramatically less memory? Enter DFS.
            </p>
          </LessonCard>
        );

      // ===== Card 9: Quiz: BFS =====
      case 'QuizBFS':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <QuizCard questions={QUIZ_03} />
          </LessonCard>
        );

      // ===== Card 10: DFS: The Plunge =====
      case 'DFSPlunge':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              DFS dives as deep as possible before backtracking, using a <strong>LIFO
              stack</strong>. It races down the leftmost branch, only backtracking when it
              hits a dead end.
            </p>
            <Suspense fallback={<VizLoading />}>
              <D3SearchTree algorithm="dfs" label="DFS on Tree (Goal: G)" fringeLabel="Fringe (Stack, top first)" />
            </Suspense>
            <PropertiesTable data={DFS_PROPS} />
            <div className="grid grid-cols-2 gap-4 not-prose my-4">
              <div className="rounded-lg border p-4 text-center">
                <div className="text-sm font-medium text-muted-foreground mb-1">BFS Space</div>
                <div className="text-2xl font-bold text-red-500"><M>{'O(b^d)'}</M></div>
              </div>
              <div className="rounded-lg border p-4 text-center">
                <div className="text-sm font-medium text-muted-foreground mb-1">DFS Space</div>
                <div className="text-2xl font-bold text-green-500"><M>{'O(bm)'}</M></div>
              </div>
            </div>
            <p>
              Much less memory&mdash;but DFS can get stuck in infinite branches. Can we get
              the best of both?
            </p>
          </LessonCard>
        );

      // ===== Card 11: BFS vs DFS: Side by Side =====
      case 'BFSvsDFS':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              Both algorithms explore the <em>same tree</em> simultaneously. Step through
              to see how BFS expands level-by-level while DFS dives deep first.
            </p>
            <Suspense fallback={<VizLoading />}>
              <D3SplitTree />
            </Suspense>
            <h3>Iterative Deepening Search (IDS)</h3>
            <p>
              IDS runs DFS with increasing depth limits (1, 2, 3&hellip;). Each iteration
              uses <M>{'O(bd)'}</M> memory, but guarantees finding the shallowest solution.
            </p>
            <Suspense fallback={<VizLoading />}>
              <IDSStepViz />
            </Suspense>
            <BlockMath>{'\\text{IDS Time} = O(b^d) \\qquad \\text{IDS Space} = O(bd)'}</BlockMath>
            <CalloutBox type="tip">
              <p>
                IDS is the preferred uninformed search when the solution depth is unknown.
                The repeated work at shallow levels is negligible compared to the exponential
                cost of the deepest level.
              </p>
            </CalloutBox>
          </LessonCard>
        );

      // ===== Card 12: Quiz: DFS & IDS =====
      case 'QuizDFS':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <QuizCard questions={QUIZ_04} />
          </LessonCard>
        );

      // ===== Card 13: When Costs Differ =====
      case 'WhenCostsDiffer':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              What happens when roads have different lengths? BFS treats every step equally,
              but a two-step path through highways might be shorter than a one-step path
              through mountains.
            </p>
            <div className="grid grid-cols-2 gap-4 not-prose my-4">
              <div className="rounded-lg border p-4 text-center">
                <div className="text-sm font-medium text-muted-foreground mb-1">BFS Choice</div>
                <div className="text-lg font-bold">A &rarr; C (1 step)</div>
                <div className="text-2xl font-bold text-red-500 mt-1">cost: 200</div>
              </div>
              <div className="rounded-lg border p-4 text-center">
                <div className="text-sm font-medium text-muted-foreground mb-1">Optimal</div>
                <div className="text-lg font-bold">A &rarr; B &rarr; C (2 steps)</div>
                <div className="text-2xl font-bold text-green-500 mt-1">cost: 50</div>
              </div>
            </div>
            <CalloutBox type="key-idea">
              <p>
                When step costs are unequal, BFS can find suboptimal solutions. We need
                an algorithm that considers the <em>actual cost</em> of each path.
              </p>
            </CalloutBox>
            <p>
              That algorithm is Uniform-Cost Search&mdash;BFS with a priority queue.
            </p>
          </LessonCard>
        );

      // ===== Card 14: UCS in Action =====
      case 'UCSInAction':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              <strong>Uniform-Cost Search</strong> always expands the node with the lowest
              total path cost <M>{'g(n)'}</M>. The fringe is a priority queue ordered
              by <M>{'g(n)'}</M>.
            </p>
            <CodeBlock language="pseudocode" code={`function UCS(problem):
  fringe = PriorityQueue ordered by g(n)
  fringe.insert(MAKE-NODE(problem.initial-state), 0)
  loop:
    if fringe is empty: return failure
    node = fringe.pop()        // lowest g(n)
    if problem.GOAL-TEST(node.state): return node
    for child in EXPAND(node, problem):
      fringe.insert(child, child.path_cost)`} />
            <Suspense fallback={<VizLoading />}>
              <D3RomaniaMap mode="ucs" />
            </Suspense>
            <PropertiesTable data={UCS_PROPS} />
            <p>
              UCS is optimal for any positive step costs. But it still explores
              blindly&mdash;it has no idea which direction the goal is.
            </p>
          </LessonCard>
        );

      // ===== Card 15: Quiz: UCS =====
      case 'QuizUCS':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <QuizCard questions={QUIZ_05} />
          </LessonCard>
        );

      // ===== Card 16: The Big Four =====
      case 'BigFour':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              Let&rsquo;s compare all four uninformed search strategies. Here <M>{'b'}</M> is
              the branching factor, <M>{'d'}</M> is solution depth, and <M>{'m'}</M> is
              maximum depth.
            </p>
            <PropertiesTable data={ALL_PROPS} />
            <p className="text-xs text-muted-foreground">
              * Optimal only when all step costs are equal. b = branching factor,
              d = solution depth, m = maximum depth.
            </p>
            <CalloutBox type="key-idea">
              <p>
                No free lunch&mdash;every strategy trades off completeness, optimality,
                time, and space. But notice that <em>all</em> of them explore blindly.
                What if we could be smarter about where to look?
              </p>
            </CalloutBox>
          </LessonCard>
        );

      // ===== Card 17: Algorithm Race =====
      case 'AlgorithmRace':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              Watch the four algorithms race side by side on the same tree. Each step
              advances all algorithms simultaneously.
            </p>
            <Suspense fallback={<VizLoading />}>
              <AlgorithmRaceViz />
            </Suspense>
          </LessonCard>
        );

      // ===== Card 18: Feel the Exponential =====
      case 'FeelExponential':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              Formulas like <M>{'O(b^d)'}</M> are abstract. Drag the sliders to see how
              quickly time and space explode as branching factor and depth increase.
            </p>
            <Suspense fallback={<VizLoading />}>
              <ComplexityExplorerViz />
            </Suspense>
            <CalloutBox type="warning">
              <p>
                Even modest branching factors create astronomical node counts. This
                exponential wall is <em>the</em> fundamental challenge of search&mdash;and
                the reason informed search exists.
              </p>
            </CalloutBox>
          </LessonCard>
        );

      // ===== Card 19: Quiz: Mastery =====
      case 'QuizMastery':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <QuizCard questions={QUIZ_06} />
            <Suspense fallback={<VizLoading />}>
              <FringeFrenzyGame />
            </Suspense>
            <CalloutBox type="key-idea">
              <p>
                All uninformed algorithms explore without direction. That&rsquo;s
                <strong> informed search</strong>&mdash;the subject of the next topic.
              </p>
            </CalloutBox>
          </LessonCard>
        );

      // ===== Card 20: Lab: Graph Traversal =====
      case 'LabGraph':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>Trace BFS and DFS by hand on a small graph.</p>
            <ExerciseCard exerciseId="lab-t03-ex1" number={1} title="Graph Traversal" totalSteps={4} defaultOpen>
              <Suspense fallback={<VizLoading />}>
                <Exercise1GraphTraversal />
              </Suspense>
            </ExerciseCard>
          </LessonCard>
        );

      // ===== Card 21: Lab: Vacuum World =====
      case 'LabVacuum':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>Formulate the vacuum world as a search problem and find a solution.</p>
            <ExerciseCard exerciseId="lab-t03-ex2" number={2} title="Vacuum World" totalSteps={3}>
              <Suspense fallback={<VizLoading />}>
                <Exercise2VacuumWorld />
              </Suspense>
            </ExerciseCard>
          </LessonCard>
        );

      // ===== Card 22: Lab: River Crossing =====
      case 'LabRiver':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>Frame the farmer-fox-chicken-grain puzzle as a state-space search.</p>
            <ExerciseCard exerciseId="lab-t03-ex3" number={3} title="River Crossing" totalSteps={3}>
              <Suspense fallback={<VizLoading />}>
                <Exercise3RiverCrossing />
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
      <h1 className="text-3xl font-bold tracking-tight mb-2">Topic 3: Solving Problems by Searching</h1>
      <p className="text-muted-foreground mb-4">
        How does an AI find the best route, solve a puzzle, or plan a sequence of moves?
      </p>
      <LessonStepper
        cards={CARDS}
        sections={SECTIONS}
        storagePrefix="lesson-t03"
        renderCard={renderCard}
      />
    </div>
  );
}
