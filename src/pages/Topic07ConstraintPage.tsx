import { lazy, Suspense, useCallback, type ReactNode } from 'react';
import LessonStepper from '@/components/LessonStepper';
import LessonCard from '@/components/LessonCard';
import QuizCard from '@/components/QuizCard';
import CalloutBox from '@/components/CalloutBox';
import CodeBlock from '@/components/CodeBlock';
import ExerciseCard from '@/components/ExerciseCard';
import {
  CARDS,
  SECTIONS,
  QUIZ_71,
  QUIZ_72,
  QUIZ_73,
  QUIZ_74,
  QUIZ_75,
} from '@/data/topic-07-cards';

const AustraliaMapCSPViz = lazy(() => import('./visualizations/AustraliaMapCSPViz'));
const ConstraintGraphViz = lazy(() => import('./visualizations/ConstraintGraphViz'));
const BacktrackingCSPGame = lazy(() => import('./visualizations/BacktrackingCSPGame'));
const BacktrackingTreeViz = lazy(() => import('./visualizations/BacktrackingTreeViz'));
const ForwardCheckingViz = lazy(() => import('./visualizations/ForwardCheckingViz'));
const AC3StepViz = lazy(() => import('./visualizations/AC3StepViz'));
const SudokuCSPViz = lazy(() => import('./visualizations/SudokuCSPViz'));
const Exercise1MapColoring = lazy(() => import('./visualizations/lab/Exercise1MapColoring'));
const Exercise2ForwardChecking = lazy(() => import('./visualizations/lab/Exercise2ForwardChecking'));
const Exercise3SudokuSolver = lazy(() => import('./visualizations/lab/Exercise3SudokuSolver'));

function VizLoading() {
  return (
    <div className="flex h-64 items-center justify-center rounded-lg bg-muted text-sm text-muted-foreground animate-pulse">
      Loading visualization...
    </div>
  );
}

export default function Topic07ConstraintPage() {
  const renderCard = useCallback((index: number, _onComplete: () => void): ReactNode => {
    const card = CARDS[index];
    const section = SECTIONS.find((item) => item.id === card.sectionId);

    switch (card.component) {
      case 'WhyCSP':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              Some problems are not about finding a path through a graph. They are about assigning
              values to many interdependent variables without breaking the rules.
            </p>
            <div className="my-4 grid gap-4 md:grid-cols-3 not-prose">
              <div className="rounded-xl border p-4">
                <div className="text-sm font-semibold">Scheduling</div>
                <div className="mt-1 text-sm text-muted-foreground">Who can be in which room, at which time?</div>
              </div>
              <div className="rounded-xl border p-4">
                <div className="text-sm font-semibold">Map Coloring</div>
                <div className="mt-1 text-sm text-muted-foreground">Adjacent regions cannot share a color.</div>
              </div>
              <div className="rounded-xl border p-4">
                <div className="text-sm font-semibold">Sudoku</div>
                <div className="mt-1 text-sm text-muted-foreground">Every row, column, and box must stay consistent.</div>
              </div>
            </div>
            <CalloutBox type="key-idea" title="Why CSPs Matter">
              <p>
                A CSP exposes the <strong>structure</strong> of a problem. Instead of blindly searching
                through complete candidates, we can prune impossible partial assignments early.
              </p>
            </CalloutBox>
          </LessonCard>
        );

      case 'CSPAnatomy':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              A constraint satisfaction problem has three parts:
            </p>
            <div className="my-4 grid gap-4 md:grid-cols-3 not-prose">
              <div className="rounded-xl border p-4">
                <div className="font-semibold">Variables</div>
                <div className="mt-2 text-sm text-muted-foreground">The things we must assign.</div>
                <div className="mt-2 text-sm">Australia example: WA, NT, SA, Q, NSW, V, T</div>
              </div>
              <div className="rounded-xl border p-4">
                <div className="font-semibold">Domains</div>
                <div className="mt-2 text-sm text-muted-foreground">The legal values for each variable.</div>
                <div className="mt-2 text-sm">{'{red, green, blue}'}</div>
              </div>
              <div className="rounded-xl border p-4">
                <div className="font-semibold">Constraints</div>
                <div className="mt-2 text-sm text-muted-foreground">Rules that restrict combinations.</div>
                <div className="mt-2 text-sm">For every adjacent pair: region<sub>i</sub> ≠ region<sub>j</sub></div>
              </div>
            </div>
            <CalloutBox type="info" title="Running Example">
              <p>
                We will use Australia map coloring throughout the topic because the structure is easy to see
                and it matches your Lab 6 Python exercise.
              </p>
            </CalloutBox>
          </LessonCard>
        );

      case 'QuizIntro':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <QuizCard questions={QUIZ_71} />
          </LessonCard>
        );

      case 'AustraliaMap':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              Try to color Australia with just three colors. Every border on the map corresponds to a constraint in the graph.
            </p>
            <Suspense fallback={<VizLoading />}>
              <AustraliaMapCSPViz />
            </Suspense>
          </LessonCard>
        );

      case 'ConstraintGraph':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              CSPs are often easier to reason about as graphs: nodes are variables, and edges mean two variables constrain each other.
            </p>
            <Suspense fallback={<VizLoading />}>
              <ConstraintGraphViz />
            </Suspense>
            <CalloutBox type="tip" title="Important Pattern">
              <p>
                Highly connected nodes tend to be harder to assign, which is why heuristics like MRV often focus attention there first.
              </p>
            </CalloutBox>
          </LessonCard>
        );

      case 'QuizMapColoring':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <QuizCard questions={QUIZ_72} />
          </LessonCard>
        );

      case 'NaiveVsBacktrack':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              Generate-and-test waits until a complete assignment is built before checking legality. Backtracking checks constraints after each decision.
            </p>
            <table className="mt-4">
              <thead>
                <tr>
                  <th></th>
                  <th>Generate-and-Test</th>
                  <th>Backtracking</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>When constraints are checked</strong></td>
                  <td>Only at the end</td>
                  <td>After every assignment</td>
                </tr>
                <tr>
                  <td><strong>Waste</strong></td>
                  <td>Explores many hopeless full candidates</td>
                  <td>Prunes dead branches early</td>
                </tr>
                <tr>
                  <td><strong>Typical behavior</strong></td>
                  <td>Blind enumeration</td>
                  <td>Structured search</td>
                </tr>
              </tbody>
            </table>
            <CalloutBox type="key-idea" title="Partial Assignments Matter">
              <p>
                The whole point of backtracking is that a partial assignment can already be inconsistent. Once that happens, the rest of the branch is useless.
              </p>
            </CalloutBox>
          </LessonCard>
        );

      case 'BacktrackingAlgo':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              This is the core recursive pattern you will implement in Lab 6:
            </p>
            <CodeBlock language="pseudocode" code={`function Backtrack(assignment, csp):
  if assignment is complete:
    return assignment

  variable = SelectUnassignedVariable(csp, assignment)

  for each value in OrderDomainValues(variable, csp, assignment):
    if Consistent(variable, value, assignment, csp):
      assignment[variable] = value
      result = Backtrack(assignment, csp)
      if result != failure:
        return result
      remove variable from assignment

  return failure`} />
            <CalloutBox type="info" title="Same Skeleton, Better Choices">
              <p>
                MRV, LCV, forward checking, and AC-3 do not replace backtracking. They make each recursive step smarter.
              </p>
            </CalloutBox>
          </LessonCard>
        );

      case 'BacktrackingGame':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              Predict the solver&rsquo;s next move on a branch that eventually fails.
            </p>
            <Suspense fallback={<VizLoading />}>
              <BacktrackingCSPGame />
            </Suspense>
          </LessonCard>
        );

      case 'BacktrackingTree':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              Here the same process is shown as a tree of partial assignments.
            </p>
            <Suspense fallback={<VizLoading />}>
              <BacktrackingTreeViz />
            </Suspense>
          </LessonCard>
        );

      case 'QuizBacktrack':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <QuizCard questions={QUIZ_73} />
          </LessonCard>
        );

      case 'VariableOrdering':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              <strong>MRV</strong> means Minimum Remaining Values. Choose the unassigned variable with the smallest domain.
            </p>
            <div className="my-4 rounded-xl border p-4 not-prose">
              <div className="font-semibold">Example after some assignments</div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <div className="rounded-lg border px-3 py-2">SA: {'{blue}'}</div>
                <div className="rounded-lg border px-3 py-2">NSW: {'{red, green}'}</div>
                <div className="rounded-lg border px-3 py-2">V: {'{red, blue}'}</div>
                <div className="rounded-lg border px-3 py-2">T: {'{red, green, blue}'}</div>
              </div>
            </div>
            <CalloutBox type="key-idea" title="Fail First">
              <p>
                If a variable is going to fail, it is better to discover that immediately than after many more choices.
              </p>
            </CalloutBox>
          </LessonCard>
        );

      case 'ValueOrdering':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              <strong>LCV</strong> means Least Constraining Value. Prefer the value that removes the fewest options from neighboring variables.
            </p>
            <div className="my-4 rounded-xl border p-4 not-prose">
              <div className="font-semibold">Example scores for SA</div>
              <div className="mt-3 space-y-2 text-sm">
                <div className="rounded-lg border px-3 py-2">blue: removes 1 neighbor value</div>
                <div className="rounded-lg border px-3 py-2">red: removes 3 neighbor values</div>
                <div className="rounded-lg border px-3 py-2">green: removes 4 neighbor values</div>
              </div>
            </div>
            <CalloutBox type="tip" title="Keep the Future Flexible">
              <p>
                LCV does not ask “what works for me right now?” It asks “what preserves the most freedom for everyone else?”
              </p>
            </CalloutBox>
          </LessonCard>
        );

      case 'ForwardChecking':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              Forward checking prunes neighbors immediately after every assignment.
            </p>
            <Suspense fallback={<VizLoading />}>
              <ForwardCheckingViz />
            </Suspense>
          </LessonCard>
        );

      case 'AC3':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              AC-3 repeatedly revises arcs until every value in every domain has support in each neighboring domain.
            </p>
            <CodeBlock language="pseudocode" code={`function AC3(csp):
  queue = all arcs in the constraint graph

  while queue is not empty:
    (Xi, Xj) = pop(queue)
    if Revise(Xi, Xj):
      if domain[Xi] is empty:
        return failure
      for each Xk in Neighbors(Xi) - {Xj}:
        add (Xk, Xi) to queue

  return success`} />
            <Suspense fallback={<VizLoading />}>
              <AC3StepViz />
            </Suspense>
          </LessonCard>
        );

      case 'QuizHeuristics':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <QuizCard questions={QUIZ_74} />
          </LessonCard>
        );

      case 'SudokuCSP':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              Sudoku is a CSP with 81 variables, domains 1–9, and all-different constraints across rows, columns, and 3×3 boxes.
            </p>
            <Suspense fallback={<VizLoading />}>
              <SudokuCSPViz />
            </Suspense>
          </LessonCard>
        );

      case 'RealWorldCSPs':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              CSP ideas show up anywhere many choices interact through hard rules.
            </p>
            <div className="my-4 grid gap-4 md:grid-cols-3 not-prose">
              <div className="rounded-xl border p-4">
                <div className="font-semibold">Timetabling</div>
                <div className="mt-2 text-sm text-muted-foreground">Avoid room clashes, instructor clashes, and impossible schedules.</div>
              </div>
              <div className="rounded-xl border p-4">
                <div className="font-semibold">Circuit Layout</div>
                <div className="mt-2 text-sm text-muted-foreground">Place components while respecting spacing and routing constraints.</div>
              </div>
              <div className="rounded-xl border p-4">
                <div className="font-semibold">Resource Allocation</div>
                <div className="mt-2 text-sm text-muted-foreground">Assign people, machines, or bandwidth without overcommitting anything.</div>
              </div>
            </div>
            <CalloutBox type="key-idea" title="Structured Search">
              <p>
                A CSP is still a search problem, but one with rich structure that lets us prune, propagate, and order choices intelligently.
              </p>
            </CalloutBox>
          </LessonCard>
        );

      case 'QuizMastery':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <QuizCard questions={QUIZ_75} />
          </LessonCard>
        );

      case 'Lab6':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              Practice the exact ideas from the lesson: plain backtracking, forward checking, and Sudoku as a larger CSP.
            </p>
            <ExerciseCard exerciseId="lab6-ex1" number={1} title="Australia Map Coloring" totalSteps={4} defaultOpen>
              <Suspense fallback={<VizLoading />}>
                <Exercise1MapColoring />
              </Suspense>
            </ExerciseCard>
            <ExerciseCard exerciseId="lab6-ex2" number={2} title="Forward Checking" totalSteps={3}>
              <Suspense fallback={<VizLoading />}>
                <Exercise2ForwardChecking />
              </Suspense>
            </ExerciseCard>
            <ExerciseCard exerciseId="lab6-ex3" number={3} title="Sudoku Solver" totalSteps={3}>
              <Suspense fallback={<VizLoading />}>
                <Exercise3SudokuSolver />
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
      <h1 className="mb-2 text-3xl font-bold tracking-tight">Topic 7: Constraint Satisfaction Problems</h1>
      <p className="mb-4 text-muted-foreground">
        Assign values under constraints, prune impossible branches early, and use smarter inference to search less.
      </p>
      <LessonStepper
        cards={CARDS}
        sections={SECTIONS}
        storagePrefix="lesson-t07"
        renderCard={renderCard}
      />
    </div>
  );
}
