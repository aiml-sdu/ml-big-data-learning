import { lazy, Suspense, useCallback, type ReactNode } from 'react';
import LessonStepper from '@/components/LessonStepper';
import LessonCard from '@/components/LessonCard';
import QuizCard from '@/components/QuizCard';
import CalloutBox from '@/components/CalloutBox';
import CodeBlock from '@/components/CodeBlock';
import ExerciseCard from '@/components/ExerciseCard';
import { BlockMath } from '@/components/Math';
import VacuumWorldViz from './visualizations/VacuumWorldViz';
import PEASBuilder from './visualizations/PEASBuilder';
import EnvironmentClassifier from './visualizations/EnvironmentClassifier';
import {
  CARDS, SECTIONS,
  QUIZ_AGENT_BASICS, QUIZ_RATIONALITY_PEAS, QUIZ_ENVIRONMENTS,
  QUIZ_ARCHITECTURES, QUIZ_SYNTHESIS,
} from '@/data/topic-02-cards';

// Lazy-load heavy visualizations
const AgentFunctionTableViz = lazy(() => import('./visualizations/AgentFunctionTableViz'));
const AgentArchitectureDiagramViz = lazy(() => import('./visualizations/AgentArchitectureDiagramViz'));
const EnvironmentComparisonViz = lazy(() => import('./visualizations/EnvironmentComparisonViz'));
const AgentArchitectGame = lazy(() => import('./visualizations/AgentArchitectGame'));
const VacuumSimulationViz = lazy(() => import('./visualizations/VacuumSimulationViz'));
const Exercise1PEASChallenge = lazy(() => import('./visualizations/lab/Exercise1PEASChallenge'));
const Exercise2EnvironmentDetective = lazy(() => import('./visualizations/lab/Exercise2EnvironmentDetective'));
const Exercise3PickAgent = lazy(() => import('./visualizations/lab/Exercise3PickAgent'));

function VizLoading() {
  return <div className="animate-pulse rounded-lg bg-muted h-64 flex items-center justify-center text-muted-foreground text-sm">Loading visualization...</div>;
}

export default function Topic02AgentsPage() {
  const renderCard = useCallback((index: number, _onComplete: () => void): ReactNode => {
    const card = CARDS[index];
    const section = SECTIONS.find((s) => s.id === card.sectionId);

    switch (card.component) {
      // ===== Card 0: Is Your Roomba Intelligent? =====
      case 'RoombaHook':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              Your Roomba bumps into a wall, turns, vacuums dirt, returns to its dock.
              It senses, decides, acts&mdash;but is it <em>intelligent</em>?
            </p>
            <p>
              To answer that, let&rsquo;s strip the problem down: two rooms (A and B),
              each either clean or dirty. Three actions: <strong>move left</strong>,
              <strong> move right</strong>, or <strong>suck</strong>.
            </p>
            <VacuumWorldViz />
            <CalloutBox type="info">
              <p>
                Every real-world intelligent system&mdash;from self-driving cars to medical
                diagnosis&mdash;is a more elaborate version of this vacuum cleaner.
              </p>
            </CalloutBox>
            <p>
              This toy world turns out to be enough to formalize what &ldquo;agent&rdquo;
              really means.
            </p>
          </LessonCard>
        );

      // ===== Card 1: The Agent Function =====
      case 'AgentFunction':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              An agent perceives its environment through sensors and acts upon it through
              actuators. The mapping from what it has seen to what it does next is called
              the <strong>agent function</strong>.
            </p>
            <CalloutBox type="key-idea" title="Agent Function">
              <BlockMath>{'f : \\mathcal{P}^* \\to \\mathcal{A}'}</BlockMath>
              <p>
                where <strong>P*</strong> is the set of all possible percept sequences
                and <strong>A</strong> is the set of available actions.
              </p>
            </CalloutBox>
            <CodeBlock language="pseudocode" code={`function VACUUM-AGENT(percept):
  location, status = percept
  if status == Dirty: return Suck
  if location == A:   return Right
  if location == B:   return Left`} />
            <Suspense fallback={<VizLoading />}>
              <AgentFunctionTableViz />
            </Suspense>
            <CalloutBox type="key-idea">
              <p>
                The <strong>function</strong> is the specification&mdash;what the perfect
                agent would do. The <strong>program</strong> is the implementation&mdash;what
                we can actually build given finite resources.
              </p>
            </CalloutBox>
            <p>
              But does this simple program make good decisions? That depends on what we
              mean by &ldquo;good.&rdquo;
            </p>
          </LessonCard>
        );

      // ===== Card 2: Quiz: Agent Basics =====
      case 'QuizAgentBasics':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <QuizCard questions={QUIZ_AGENT_BASICS} />
          </LessonCard>
        );

      // ===== Card 3: Rational != Perfect =====
      case 'Rationality':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              A rational agent does not always win&mdash;but it always makes the best bet
              given what it knows.
            </p>
            <CalloutBox type="key-idea" title="Rationality">
              <p>
                For each possible percept sequence, a rational agent selects the action that
                is expected to maximize its performance measure, given the evidence provided
                by the percept sequence and whatever built-in knowledge the agent has.
              </p>
            </CalloutBox>
            <h3>The Four Ingredients</h3>
            <ol>
              <li><strong>Performance measure</strong>&mdash;How do we evaluate success?</li>
              <li><strong>Prior knowledge</strong>&mdash;What does the agent already know?</li>
              <li><strong>Possible actions</strong>&mdash;What can the agent do?</li>
              <li><strong>Percept sequence</strong>&mdash;What has the agent observed so far?</li>
            </ol>
            <CalloutBox type="warning" title="Rationality vs Perfection">
              <p>
                A poker player who goes all-in with pocket aces and loses to a lucky river
                card still made the rational choice. Rationality maximizes expected
                performance&mdash;it cannot guarantee outcomes in a stochastic world.
              </p>
            </CalloutBox>
            <p>
              Knowing what &ldquo;rational&rdquo; means is one thing. Designing an agent is
              another&mdash;and that starts with four letters: P-E-A-S.
            </p>
          </LessonCard>
        );

      // ===== Card 4: The PEAS Framework =====
      case 'PEASFramework':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              Before writing a single line of code, specify four things:
              <strong> Performance</strong> measure, <strong>Environment</strong>,
              <strong> Actuators</strong>, and <strong>Sensors</strong>.
            </p>
            <CalloutBox type="key-idea" title="PEAS">
              <ul>
                <li><strong>P</strong>erformance measure&mdash;What counts as success?</li>
                <li><strong>E</strong>nvironment&mdash;What world does the agent operate in?</li>
                <li><strong>A</strong>ctuators&mdash;How does the agent affect the world?</li>
                <li><strong>S</strong>ensors&mdash;How does the agent perceive the world?</li>
              </ul>
            </CalloutBox>
            <PEASBuilder />
            <CalloutBox type="tip">
              <p>
                Start with P. A vague performance measure leads to agents that optimize the
                wrong thing. Everything else follows from what success looks like.
              </p>
            </CalloutBox>
            <p>
              PEAS tells you <em>what</em> to build. But the environment determines
              <em> how hard</em> the build will be.
            </p>
          </LessonCard>
        );

      // ===== Card 5: Quiz: Rationality & PEAS =====
      case 'QuizRationalityPEAS':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <QuizCard questions={QUIZ_RATIONALITY_PEAS} />
          </LessonCard>
        );

      // ===== Card 6: Why Chess != Poker =====
      case 'EnvDimensions':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              Chess and poker are both games with clear rules. But they create fundamentally
              different challenges for an AI agent. Every environment can be described along
              six dimensions:
            </p>
            <ul>
              <li><strong>Fully vs. partially observable</strong>&mdash;Can the agent see the entire state?</li>
              <li><strong>Deterministic vs. stochastic</strong>&mdash;Are outcomes predictable?</li>
              <li><strong>Episodic vs. sequential</strong>&mdash;Do decisions affect future ones?</li>
              <li><strong>Static vs. dynamic</strong>&mdash;Does the world change while deliberating?</li>
              <li><strong>Discrete vs. continuous</strong>&mdash;Is the state/action space finite?</li>
              <li><strong>Single-agent vs. multi-agent</strong>&mdash;Are there other agents?</li>
            </ul>
            <CalloutBox type="key-idea" title="The Difficulty Spectrum">
              <p>
                The hardest environments are partially observable, stochastic, sequential,
                dynamic, continuous, and multi-agent. This is why self-driving cars are so
                much harder than chess.
              </p>
            </CalloutBox>
            <p>
              These six dimensions are easier to see than to remember. Let&rsquo;s compare
              some environments visually.
            </p>
          </LessonCard>
        );

      // ===== Card 7: Comparing Worlds =====
      case 'EnvComparison':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              Select two environments and compare their profiles. Notice how the six
              dimensions interact.
            </p>
            <Suspense fallback={<VizLoading />}>
              <EnvironmentComparisonViz />
            </Suspense>
            <CalloutBox type="info">
              <p>
                A self-driving car scores &ldquo;hard&rdquo; on nearly every dimension.
                Poker is hard mainly because of partial observability and stochasticity. The
                shape of the profile tells you what kind of agent you need.
              </p>
            </CalloutBox>
            <p>
              Now it&rsquo;s your turn to classify. Can you identify each dimension for
              real-world scenarios?
            </p>
          </LessonCard>
        );

      // ===== Card 8: Environment Detective =====
      case 'EnvClassifier':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              For each scenario, classify the environment along all six dimensions.
            </p>
            <EnvironmentClassifier />
          </LessonCard>
        );

      // ===== Card 9: Quiz: Environments =====
      case 'QuizEnvironments':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <QuizCard questions={QUIZ_ENVIRONMENTS} />
          </LessonCard>
        );

      // ===== Card 10: Four Flavors of Intelligence =====
      case 'ArchSpectrum':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              A thermostat and a self-driving car are both agents. Both sense and act. But a
              thermostat follows one rule while a self-driving car builds a model of the world
              and plans ahead.
            </p>
            <p>
              This gap reveals a spectrum of four architectures, each trading simplicity for
              capability:
            </p>
            <Suspense fallback={<VizLoading />}>
              <AgentArchitectureDiagramViz />
            </Suspense>
            <CalloutBox type="key-idea" title="Design Principle">
              <p>
                Don&rsquo;t build a utility-based agent when a simple reflex agent would do.
                Over-engineering wastes resources; under-engineering produces fragile systems.
              </p>
            </CalloutBox>
            <p>
              Let&rsquo;s look at the two simplest architectures head-to-head&mdash;and see
              why memory matters.
            </p>
          </LessonCard>
        );

      // ===== Card 11: Reflex: Simple vs Model-Based =====
      case 'ReflexAgents':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              A simple reflex agent acts on the current percept only. A model-based agent
              remembers what it cannot currently see.
            </p>
            <h3>Simple Reflex Agent</h3>
            <CodeBlock language="pseudocode" code={`function SIMPLE-REFLEX-AGENT(percept):
  state  = INTERPRET-INPUT(percept)
  rule   = RULE-MATCH(state, rules)
  action = rule.ACTION
  return action`} />
            <h3>Model-Based Reflex Agent</h3>
            <CodeBlock language="pseudocode" code={`function MODEL-BASED-AGENT(percept):
  state  = UPDATE-STATE(state, action, percept, model)
  rule   = RULE-MATCH(state, rules)
  action = rule.ACTION
  return action`} />
            <Suspense fallback={<VizLoading />}>
              <VacuumSimulationViz />
            </Suspense>
            <CalloutBox type="warning">
              <p>
                A simple reflex agent in a partially observable environment will loop
                forever. The vacuum keeps bouncing between rooms because it has no memory
                of what it already cleaned.
              </p>
            </CalloutBox>
            <p>
              Memory helps, but it&rsquo;s still reactive. What if the agent needs to plan
              for the future?
            </p>
          </LessonCard>
        );

      // ===== Card 12: Goals and Utility =====
      case 'GoalUtility':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              Model-based agents remember the past. Goal-based agents plan for the future.
              Utility-based agents choose the <em>best</em> plan.
            </p>
            <h3>Goal-Based Agent</h3>
            <p>
              Has an explicit goal and plans action sequences to achieve it&mdash;reasoning
              about consequences, not just reacting to the present.
            </p>
            <h3>Utility-Based Agent</h3>
            <p>
              Ranks outcomes by desirability with a utility function, not binary goal
              satisfaction.
            </p>
            <BlockMath>{'U : S \\to \\mathbb{R}'}</BlockMath>
            <CalloutBox type="tip">
              <p>
                Think of goals as pass/fail and utility as a score. A goal-based agent
                knows if a destination is reachable. A utility-based agent picks the route
                with the best tradeoff of speed, fuel, and comfort.
              </p>
            </CalloutBox>
            <Suspense fallback={<VizLoading />}>
              <VacuumSimulationViz />
            </Suspense>
            <CalloutBox type="key-idea" title="The Complexity Tradeoff">
              <p>
                Simple reflex &rarr; model-based &rarr; goal-based &rarr; utility-based.
                Each layer adds capability (memory, planning, optimization) and complexity.
                The right choice depends on the environment.
              </p>
            </CalloutBox>
            <p>
              So which architecture wins? That depends entirely on the environment.
            </p>
          </LessonCard>
        );

      // ===== Card 13: Quiz: Architectures =====
      case 'QuizArchitectures':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <QuizCard questions={QUIZ_ARCHITECTURES} />
          </LessonCard>
        );

      // ===== Card 14: Match the Agent to the World =====
      case 'MatchPrinciple':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              The environment determines the agent. A simple reflex agent thrives in a fully
              observable, deterministic world&mdash;but collapses in a partially observable,
              stochastic one.
            </p>
            <div className="not-prose my-4 overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 pr-4 font-semibold">Environment Property</th>
                    <th className="text-left py-2 font-semibold">Demands</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr><td className="py-2 pr-4">Partially observable</td><td className="py-2">Model-based (needs internal state)</td></tr>
                  <tr><td className="py-2 pr-4">Stochastic</td><td className="py-2">Goal/Utility-based (needs planning under uncertainty)</td></tr>
                  <tr><td className="py-2 pr-4">Sequential</td><td className="py-2">At least model-based (history matters)</td></tr>
                  <tr><td className="py-2 pr-4">Dynamic</td><td className="py-2">Fast reaction or planning ahead</td></tr>
                  <tr><td className="py-2 pr-4">Continuous</td><td className="py-2">Utility-based (fine-grained optimization)</td></tr>
                  <tr><td className="py-2 pr-4">Multi-agent</td><td className="py-2">Utility-based (must model other agents)</td></tr>
                </tbody>
              </table>
            </div>
            <CalloutBox type="key-idea" title="The Core Design Principle">
              <p>
                Match the simplest architecture to the environment&rsquo;s complexity.
                Every dimension that increases difficulty&mdash;partial observability,
                stochasticity, multi-agent competition&mdash;demands a more sophisticated
                architecture.
              </p>
            </CalloutBox>
            <p>
              Put this principle to the test. Given a real-world scenario, can you pick the
              right architecture?
            </p>
          </LessonCard>
        );

      // ===== Card 15: Architect Challenge =====
      case 'ArchitectGame':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              For each scenario, pick the simplest agent architecture that will succeed.
            </p>
            <Suspense fallback={<VizLoading />}>
              <AgentArchitectGame />
            </Suspense>
          </LessonCard>
        );

      // ===== Card 16: Quiz: Tying It Together =====
      case 'QuizSynthesis':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <QuizCard questions={QUIZ_SYNTHESIS} />
          </LessonCard>
        );

      // ===== Card 17: Lab 1b: Exercises =====
      case 'LabExercises':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>Put your knowledge into practice with three hands-on exercises.</p>
            <ExerciseCard exerciseId="lab-t02-ex1" number={1} title="PEAS Challenge" totalSteps={3} defaultOpen>
              <Suspense fallback={<VizLoading />}>
                <Exercise1PEASChallenge />
              </Suspense>
            </ExerciseCard>
            <ExerciseCard exerciseId="lab-t02-ex2" number={2} title="Environment Detective" totalSteps={3}>
              <Suspense fallback={<VizLoading />}>
                <Exercise2EnvironmentDetective />
              </Suspense>
            </ExerciseCard>
            <ExerciseCard exerciseId="lab-t02-ex3" number={3} title="Pick the Agent" totalSteps={3}>
              <Suspense fallback={<VizLoading />}>
                <Exercise3PickAgent />
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
      <h1 className="text-3xl font-bold tracking-tight mb-2">Topic 2: Intelligent Agents</h1>
      <p className="text-muted-foreground mb-4">
        From thermostats to self-driving cars: perceive, decide, act.
      </p>
      <LessonStepper
        cards={CARDS}
        sections={SECTIONS}
        storagePrefix="lesson-t02"
        renderCard={renderCard}
      />
    </div>
  );
}
