import { lazy, Suspense, useCallback, type ReactNode } from 'react';
import LessonStepper from '@/components/LessonStepper';
import LessonCard from '@/components/LessonCard';
import QuizCard from '@/components/QuizCard';
import CalloutBox from '@/components/CalloutBox';
import CodeBlock from '@/components/CodeBlock';
import ExerciseCard from '@/components/ExerciseCard';
import ConceptReveal, { type ConceptCard } from '@/components/ConceptReveal';
import { BlockMath } from '@/components/Math';
import {
  CARDS, SECTIONS,
  QUIZ_Q1, QUIZ_Q2, QUIZ_Q3, QUIZ_Q4, QUIZ_Q5,
} from '@/data/topic-01-cards';

// Lazy-load heavy visualizations
const SenseDecideActViz = lazy(() => import('./visualizations/SenseDecideActViz'));
const SpotTheIntelligenceGame = lazy(() => import('./visualizations/SpotTheIntelligenceGame'));
const ApproachesMatrixViz = lazy(() => import('./visualizations/ApproachesMatrixViz'));
const ChineseRoomViz = lazy(() => import('./visualizations/ChineseRoomViz'));
const AITimelineViz = lazy(() => import('./visualizations/AITimelineViz'));
const AIHypeCycleViz = lazy(() => import('./visualizations/AIHypeCycleViz'));
const CapabilitySpectrumViz = lazy(() => import('./visualizations/CapabilitySpectrumViz'));
const Exercise1ClassifyApproach = lazy(() => import('./visualizations/lab/Exercise1ClassifyApproach'));
const Exercise2TimelineOrder = lazy(() => import('./visualizations/lab/Exercise2TimelineOrder'));
const Exercise3TuringJudge = lazy(() => import('./visualizations/lab/Exercise3TuringJudge'));

const CONCEPT_CARDS: ConceptCard[] = [
  {
    title: 'Thinking Humanly',
    brief: 'Cognitive modeling approach',
    detail: 'Build systems that think the way humans think. Uses cognitive science and experimental psychology to model human reasoning. Example: GPS (General Problem Solver) tried to match human problem-solving steps.',
    icon: '\u{1F9E0}',
  },
  {
    title: 'Thinking Rationally',
    brief: 'Laws of thought approach',
    detail: 'Build systems that think logically and correctly. Uses formal logic to represent knowledge and derive conclusions. Example: Expert systems using if-then rules. Challenge: not all intelligence is logical reasoning.',
    icon: '\u{1F4D0}',
  },
  {
    title: 'Acting Humanly',
    brief: 'The Turing Test approach',
    detail: "Build systems that act indistinguishably from humans. Alan Turing proposed: if a machine can fool a human evaluator, it's intelligent. Requires NLP, knowledge representation, reasoning, and learning.",
    icon: '\u{1F3AD}',
  },
  {
    title: 'Acting Rationally',
    brief: 'The rational agent approach',
    detail: 'Build systems that act to achieve the best expected outcome. This is the dominant approach in modern AI. An agent perceives and acts; a rational agent does so optimally. This is what this course focuses on.',
    icon: '\u{1F3AF}',
  },
];

function VizLoading() {
  return <div className="animate-pulse rounded-lg bg-muted h-64 flex items-center justify-center text-muted-foreground text-sm">Loading visualization...</div>;
}

export default function Topic01IntroPage() {
  const renderCard = useCallback((index: number, _onComplete: () => void): ReactNode => {
    const card = CARDS[index];
    const section = SECTIONS.find((s) => s.id === card.sectionId);

    switch (card.component) {
      // ===== Card 0: AI Hides in Plain Sight =====
      case 'AIHides':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              You unlocked your phone with your face this morning. Your email sorted itself.
              Your bank flagged a suspicious transaction before you noticed. Every one of these
              systems does the same thing.
            </p>
            <CalloutBox type="info" title="Strip Away the Buzzwords">
              <p>
                Every AI system takes in information, makes a decision, and acts on it.
                The techniques vary&mdash;neural networks, rules, probabilistic models&mdash;but
                the skeleton is always the same.
              </p>
            </CalloutBox>
            <CodeBlock language="pseudocode" code={`loop forever:
  input  = perceive(environment)
  action = decide(input)
  act(action)`} />
            <p>
              That three-line loop is the skeleton of every AI system in this course.
              Let&rsquo;s see it in motion.
            </p>
          </LessonCard>
        );

      // ===== Card 1: Sense, Decide, Act =====
      case 'SenseDecideAct':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              Every AI system&mdash;from a thermostat to a self-driving car&mdash;runs this
              loop continuously.
            </p>
            <Suspense fallback={<VizLoading />}>
              <SenseDecideActViz />
            </Suspense>
            <CalloutBox type="key-idea" title="The Perceive-Decide-Act Loop">
              <p>
                An AI agent continuously (1) perceives its environment through sensors,
                (2) selects an action using its decision function, and (3) executes the
                action through actuators.
              </p>
            </CalloutBox>
            <p>
              But what counts as &ldquo;intelligent&rdquo; behavior? A calculator decides fast.
              A dog learns from experience. Where&rsquo;s the line?
            </p>
          </LessonCard>
        );

      // ===== Card 2: Quiz: The AI Pattern =====
      case 'QuizPattern':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <QuizCard questions={QUIZ_Q1} />
          </LessonCard>
        );

      // ===== Card 3: Can You Spot Intelligence? =====
      case 'SpotIntelligence':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              Before we define intelligence formally, test your gut. Classify each system
              below as intelligent or not.
            </p>
            <Suspense fallback={<VizLoading />}>
              <SpotTheIntelligenceGame />
            </Suspense>
            <p>
              If the edge cases stumped you, good&mdash;researchers have debated this for
              decades. Russell &amp; Norvig&rsquo;s textbook frames the debate along two
              clean axes.
            </p>
          </LessonCard>
        );

      // ===== Card 4: Four Ways to Define AI =====
      case 'FourApproaches':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              Russell and Norvig organize AI research along two dimensions: what you optimize
              (<em>thinking</em> vs. <em>acting</em>) and what standard you measure against
              (<em>humanly</em> vs. <em>rationally</em>).
            </p>
            <table>
              <thead>
                <tr><th></th><th>Humanly</th><th>Rationally</th></tr>
              </thead>
              <tbody>
                <tr><td><strong>Thinking</strong></td><td>Cognitive modeling</td><td>Laws of thought</td></tr>
                <tr><td><strong>Acting</strong></td><td>Turing Test</td><td>Rational agents</td></tr>
              </tbody>
            </table>
            <p>Click each card below to explore the four approaches in detail:</p>
            <ConceptReveal cards={CONCEPT_CARDS} />
            <CalloutBox type="tip">
              <p>
                Real systems often blend quadrants. A self-driving car uses human-like
                perception (acting humanly) with rational planning (acting rationally).
              </p>
            </CalloutBox>
          </LessonCard>
        );

      // ===== Card 5: The 2x2 in Action =====
      case 'TwoByTwo':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              Each quadrant spawned entire research programs. Cognitive science, expert systems,
              chatbots, rational agents&mdash;each came from a different corner of the matrix.
            </p>
            <Suspense fallback={<VizLoading />}>
              <ApproachesMatrixViz />
            </Suspense>
            <CalloutBox type="key-idea" title="The Rational Agent Paradigm">
              <p>
                This course adopts the bottom-right quadrant: <strong>acting rationally</strong>.
                We build agents that maximize expected performance&mdash;without needing to first
                solve human cognition.
              </p>
            </CalloutBox>
            <BlockMath>{'\\text{agent} : \\text{percepts} \\to \\text{actions}'}</BlockMath>
            <p>
              That one-line definition&mdash;an agent is a function from percepts to
              actions&mdash;is deceptively powerful. But is optimal behavior enough to call
              something intelligent?
            </p>
          </LessonCard>
        );

      // ===== Card 6: Quiz: Defining AI =====
      case 'QuizApproaches':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <QuizCard questions={QUIZ_Q2} />
          </LessonCard>
        );

      // ===== Card 7: The Imitation Game =====
      case 'ImitationGame':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              In 1950, Alan Turing sidestepped the question &ldquo;can machines think?&rdquo;
              with a brilliantly practical alternative: can a machine fool you?
            </p>
            <p>
              Place a human evaluator in one room, a machine in the other, and communicate
              only through text. If the evaluator can&rsquo;t reliably tell which is the
              machine, it passes.
            </p>
            <CalloutBox type="key-idea" title="The Turing Test">
              <p>
                If a human evaluator, after posing written questions, cannot reliably
                distinguish the machine from a human, the machine passes. The test is about
                behavior, not internal mechanisms.
              </p>
            </CalloutBox>
            <p>To pass, a machine would need:</p>
            <ul>
              <li><strong>Natural language processing</strong>&mdash;to understand and generate human language</li>
              <li><strong>Knowledge representation</strong>&mdash;to store what it knows about the world</li>
              <li><strong>Automated reasoning</strong>&mdash;to draw conclusions from its knowledge</li>
              <li><strong>Machine learning</strong>&mdash;to adapt to new situations and detect patterns</li>
            </ul>
            <CodeBlock language="pseudocode" code={`function TuringTest(evaluator, candidate):
  for round in 1..N:
    question = evaluator.ask()
    answer   = candidate.respond(question)
    evaluator.observe(answer)
  return evaluator.verdict()  // "human" or "machine"`} />
            <p>
              Modern LLMs routinely fool people in short conversations. Does that mean they
              <em> understand</em>? A philosopher named Searle said no&mdash;emphatically.
            </p>
          </LessonCard>
        );

      // ===== Card 8: The Chinese Room =====
      case 'ChineseRoom':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              Imagine you&rsquo;re locked in a room with a rulebook for manipulating Chinese
              symbols. Questions slide in, you follow the rules, and perfect Chinese answers
              slide out. You understand <em>nothing</em>.
            </p>
            <Suspense fallback={<VizLoading />}>
              <ChineseRoomViz />
            </Suspense>
            <CalloutBox type="warning" title="Syntax vs. Semantics">
              <p>
                Searle&rsquo;s argument: symbol manipulation can produce correct outputs
                without any comprehension. Passing the Turing Test does not prove
                understanding&mdash;it proves syntax, not semantics.
              </p>
            </CalloutBox>
            <p>
              Whether or not you buy Searle&rsquo;s argument, it reveals something important:
              defining intelligence is hard. The field has been wrestling with these questions
              since the 1950s&mdash;through booms, winters, and revolutions.
            </p>
          </LessonCard>
        );

      // ===== Card 9: Quiz: Turing & Critics =====
      case 'QuizTuring':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <QuizCard questions={QUIZ_Q3} />
          </LessonCard>
        );

      // ===== Card 10: A Brief History of AI =====
      case 'AITimeline':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              AI isn&rsquo;t new&mdash;researchers have been chasing this dream since the 1950s.
              The field swings between optimism and disappointment.
            </p>
            <Suspense fallback={<VizLoading />}>
              <AITimelineViz />
            </Suspense>
            <CalloutBox type="info" title="Key Milestones">
              <ul>
                <li><strong>1943</strong> &mdash; McCulloch &amp; Pitts: first neuron model</li>
                <li><strong>1950</strong> &mdash; Turing&rsquo;s &ldquo;Can machines think?&rdquo;</li>
                <li><strong>1956</strong> &mdash; Dartmouth Conference: AI born as a field</li>
                <li><strong>1966</strong> &mdash; ELIZA: first chatbot</li>
                <li><strong>1997</strong> &mdash; Deep Blue beats Kasparov</li>
                <li><strong>2012</strong> &mdash; AlexNet: deep learning era begins</li>
                <li><strong>2016</strong> &mdash; AlphaGo defeats Go champion</li>
                <li><strong>2020s</strong> &mdash; Large language models transform NLP</li>
              </ul>
            </CalloutBox>
            <p>
              Notice the gaps. Between the 1960s optimism and the 2012 deep learning explosion
              lie two brutal funding droughts&mdash;the AI winters.
            </p>
          </LessonCard>
        );

      // ===== Card 11: Hype, Winters, and Comebacks =====
      case 'HypeWinters':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              AI has a pattern: grand promises, followed by the sobering realization that the
              hard problems are <em>much</em> harder than anyone thought. In the 1960s,
              researchers predicted machines would match human intelligence within a decade.
              Instead, funding collapsed (1974&ndash;1980).
            </p>
            <Suspense fallback={<VizLoading />}>
              <AIHypeCycleViz />
            </Suspense>
            <CalloutBox type="warning" title="Are We in Another Hype Cycle?">
              <p>
                Today&rsquo;s AI boom is powered by real capabilities&mdash;deep learning,
                massive compute. But the gap between &ldquo;impressive demo&rdquo; and
                &ldquo;reliable system&rdquo; remains. History suggests healthy skepticism.
              </p>
            </CalloutBox>
            <p>
              Understanding this cycle is a superpower: it lets you evaluate AI claims without
              being swept up in either hype or cynicism.
            </p>
          </LessonCard>
        );

      // ===== Card 12: Quiz: AI History =====
      case 'QuizHistory':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <QuizCard questions={QUIZ_Q4} />
          </LessonCard>
        );

      // ===== Card 13: What AI Can (and Can't) Do =====
      case 'Capabilities':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              Every AI system you use today is a specialist. AlphaGo can beat any human at Go
              but can&rsquo;t play tic-tac-toe without retraining. GPT writes essays but
              can&rsquo;t reliably count letters in a word.
            </p>
            <Suspense fallback={<VizLoading />}>
              <CapabilitySpectrumViz />
            </Suspense>
            <CalloutBox type="key-idea" title="Narrow AI vs. AGI">
              <p>
                <strong>Narrow AI (ANI):</strong> Excels at one specific task; zero ability
                outside that domain. All current AI.<br />
                <strong>Artificial General Intelligence (AGI):</strong> Human-level reasoning
                across all domains. Does not yet exist.
              </p>
            </CalloutBox>
            <BlockMath>{'\\text{Narrow: } f : \\mathcal{X}_{\\text{task}} \\to \\mathcal{Y}_{\\text{task}} \\quad \\text{vs.} \\quad \\text{AGI: } f : \\mathcal{X}_{\\text{any}} \\to \\mathcal{Y}_{\\text{any}}'}</BlockMath>
            <p>
              This distinction matters: when someone claims &ldquo;AI can do X,&rdquo; ask&mdash;narrow
              or general? The answer changes everything.
            </p>
          </LessonCard>
        );

      // ===== Card 14: The Rational Agent =====
      case 'RationalAgent':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              Let&rsquo;s connect the dots. We&rsquo;ve seen four definitions, the Turing
              debate, historical swings, and the narrow/general divide. This course takes a
              pragmatic stance.
            </p>
            <CodeBlock language="pseudocode" code={`function RationalAgent(percepts, model, utility):
  state   = model.update(percepts)
  actions = model.possible_actions(state)
  best    = argmax(a in actions, expected_utility(a, state))
  return best`} />
            <CalloutBox type="key-idea" title="The Course Framework">
              <p>
                Every algorithm we study&mdash;from search to machine learning&mdash;is a
                tool for building better rational agents: systems that perceive, reason, and
                act to maximize expected utility.
              </p>
            </CalloutBox>
            <BlockMath>{'a^* = \\arg\\max_{a \\in A} \\mathbb{E}[U(a, s)]'}</BlockMath>
            <p>
              From search algorithms that plan optimal paths to learning algorithms that
              improve from experience&mdash;it all comes back to this equation.
            </p>
          </LessonCard>
        );

      // ===== Card 15: Quiz: AI Today =====
      case 'QuizToday':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <QuizCard questions={QUIZ_Q5} />
          </LessonCard>
        );

      // ===== Card 16: Lab: Classify the Approach =====
      case 'LabClassify':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>Classify each real AI system into the correct quadrant.</p>
            <ExerciseCard exerciseId="lab-t01-ex1" number={1} title="Classify the Approach" totalSteps={3} defaultOpen>
              <Suspense fallback={<VizLoading />}>
                <Exercise1ClassifyApproach />
              </Suspense>
            </ExerciseCard>
          </LessonCard>
        );

      // ===== Card 17: Lab: Order the Milestones =====
      case 'LabTimeline':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>Place these AI milestones in chronological order.</p>
            <ExerciseCard exerciseId="lab-t01-ex2" number={2} title="Order the Milestones" totalSteps={3}>
              <Suspense fallback={<VizLoading />}>
                <Exercise2TimelineOrder />
              </Suspense>
            </ExerciseCard>
          </LessonCard>
        );

      // ===== Card 18: Lab: Be a Turing Judge =====
      case 'LabTuring':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>Read each conversation excerpt and decide: human or machine?</p>
            <ExerciseCard exerciseId="lab-t01-ex3" number={3} title="Be a Turing Judge" totalSteps={3}>
              <Suspense fallback={<VizLoading />}>
                <Exercise3TuringJudge />
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
      <h1 className="text-3xl font-bold tracking-tight mb-2">Topic 1: Introduction to AI</h1>
      <p className="text-muted-foreground mb-4">
        What is artificial intelligence, and why can&rsquo;t even the experts agree?
      </p>
      <LessonStepper
        cards={CARDS}
        sections={SECTIONS}
        storagePrefix="lesson-t01"
        renderCard={renderCard}
      />
    </div>
  );
}
