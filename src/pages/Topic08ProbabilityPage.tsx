import { lazy, Suspense, useCallback, type ReactNode } from 'react';
import LessonStepper from '@/components/LessonStepper';
import LessonCard from '@/components/LessonCard';
import QuizCard from '@/components/QuizCard';
import CalloutBox from '@/components/CalloutBox';
import ExerciseCard from '@/components/ExerciseCard';
import { M, BlockMath } from '@/components/Math';
import {
  CARDS,
  SECTIONS,
  QUIZ_81,
  QUIZ_82,
  QUIZ_83,
  QUIZ_84,
  QUIZ_85,
} from '@/data/topic-08-cards';

const BayesCalculatorViz = lazy(() => import('./visualizations/BayesCalculatorViz'));
const BaseRateGameViz = lazy(() => import('./visualizations/BaseRateGameViz'));
const JointDistributionExplorerViz = lazy(() => import('./visualizations/JointDistributionExplorerViz'));
const BayesNetBuilderViz = lazy(() => import('./visualizations/BayesNetBuilderViz'));
const BayesNetInferenceViz = lazy(() => import('./visualizations/BayesNetInferenceViz'));
const ExplainingAwayViz = lazy(() => import('./visualizations/ExplainingAwayViz'));
const Exercise1BayesCompare = lazy(() => import('./visualizations/lab/Exercise1BayesCompare'));
const Exercise2RareDisease = lazy(() => import('./visualizations/lab/Exercise2RareDisease'));
const Exercise3JointTable = lazy(() => import('./visualizations/lab/Exercise3JointTable'));

function VizLoading() {
  return (
    <div className="flex h-64 items-center justify-center rounded-lg bg-muted text-sm text-muted-foreground animate-pulse">
      Loading visualization...
    </div>
  );
}

export default function Topic08ProbabilityPage() {
  const renderCard = useCallback((index: number, _onComplete: () => void): ReactNode => {
    const card = CARDS[index];
    const section = SECTIONS.find((s) => s.id === card.sectionId);

    switch (card.component) {
      /* ------------------------------------------------------------------ */
      /* 8.1 Uncertainty in AI                                              */
      /* ------------------------------------------------------------------ */
      case 'WhyUncertainty':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              In the real world, AI agents almost never have complete, certain knowledge.
              Sensors are noisy, environments are partially observable, and outcomes are stochastic.
            </p>
            <div className="my-4 grid gap-4 md:grid-cols-3 not-prose">
              <div className="rounded-xl border p-4">
                <div className="text-sm font-semibold">Sensor Noise</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  A camera might misread a sign. A thermometer has measurement error.
                </div>
              </div>
              <div className="rounded-xl border p-4">
                <div className="text-sm font-semibold">Partial Observability</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  A doctor cannot directly see whether a patient has a disease — only test results.
                </div>
              </div>
              <div className="rounded-xl border p-4">
                <div className="text-sm font-semibold">Stochastic Outcomes</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Rolling dice, weather patterns, or stock markets are inherently random.
                </div>
              </div>
            </div>
            <CalloutBox type="key-idea" title="Why Probability?">
              <p>
                Probability provides a mathematically rigorous framework for reasoning under uncertainty.
                An agent that uses probability can make <strong>rational decisions</strong> even when it
                does not know everything.
              </p>
            </CalloutBox>
          </LessonCard>
        );

      case 'ProbabilityBasics':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              Probability is built on three axioms (Kolmogorov, 1933):
            </p>
            <div className="my-4 space-y-3 not-prose">
              <div className="rounded-xl border p-4">
                <div className="font-semibold">1. Non-negativity</div>
                <div className="mt-2"><BlockMath>{'P(A) \\geq 0'}</BlockMath></div>
              </div>
              <div className="rounded-xl border p-4">
                <div className="font-semibold">2. Normalization</div>
                <div className="mt-2"><BlockMath>{'P(\\Omega) = 1'}</BlockMath></div>
                <div className="text-sm text-muted-foreground mt-1">
                  The probability of the entire sample space is 1.
                </div>
              </div>
              <div className="rounded-xl border p-4">
                <div className="font-semibold">3. Additivity (for mutually exclusive events)</div>
                <div className="mt-2"><BlockMath>{'P(A \\lor B) = P(A) + P(B) \\quad \\text{if } A \\cap B = \\emptyset'}</BlockMath></div>
              </div>
            </div>
            <p>
              From these, we derive the <strong>inclusion-exclusion principle</strong> for
              any two events:
            </p>
            <BlockMath>{'P(A \\lor B) = P(A) + P(B) - P(A \\land B)'}</BlockMath>
            <p className="mt-2">
              And the complement rule: <M>{'P(\\lnot A) = 1 - P(A)'}</M>.
            </p>
          </LessonCard>
        );

      case 'QuizUncertainty':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <QuizCard questions={QUIZ_81} />
          </LessonCard>
        );

      /* ------------------------------------------------------------------ */
      /* 8.2 Bayes' Rule                                                    */
      /* ------------------------------------------------------------------ */
      case 'ConditionalProb':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              The conditional probability of <M>A</M> given <M>B</M> is the probability
              of <M>A</M> when we know <M>B</M> has occurred:
            </p>
            <BlockMath>{'P(A \\mid B) = \\frac{P(A \\land B)}{P(B)} \\quad \\text{where } P(B) > 0'}</BlockMath>
            <p className="mt-4">
              Think of it as <strong>restricting the sample space</strong> to only outcomes
              where <M>B</M> is true, then asking how often <M>A</M> also holds.
            </p>
            <CalloutBox type="info" title="Example">
              <p>
                If 20% of patients have both a cavity and a toothache, and 40% have a cavity,
                then <M>{'P(\\text{toothache} \\mid \\text{cavity}) = 0.20 / 0.40 = 0.50'}</M>.
              </p>
            </CalloutBox>
          </LessonCard>
        );

      case 'BayesTheorem':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              From the definition of conditional probability, we can derive the most
              important formula in probability:
            </p>
            <BlockMath>{'P(H \\mid E) = \\frac{P(E \\mid H) \\cdot P(H)}{P(E)}'}</BlockMath>
            <div className="my-4 grid gap-3 md:grid-cols-2 not-prose">
              <div className="rounded-xl border p-4">
                <div className="font-semibold text-sm"><M>{'P(H)'}</M> — Prior</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Our belief in <M>H</M> before seeing evidence.
                </div>
              </div>
              <div className="rounded-xl border p-4">
                <div className="font-semibold text-sm"><M>{'P(E \\mid H)'}</M> — Likelihood</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  How likely the evidence is if <M>H</M> is true.
                </div>
              </div>
              <div className="rounded-xl border p-4">
                <div className="font-semibold text-sm"><M>{'P(E)'}</M> — Evidence</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Total probability of seeing this evidence (normalizing constant).
                </div>
              </div>
              <div className="rounded-xl border p-4">
                <div className="font-semibold text-sm"><M>{'P(H \\mid E)'}</M> — Posterior</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Our updated belief after seeing evidence.
                </div>
              </div>
            </div>
            <p>
              The denominator is often expanded using the <strong>law of total probability</strong>:
            </p>
            <BlockMath>{'P(E) = P(E \\mid H) \\cdot P(H) + P(E \\mid \\lnot H) \\cdot P(\\lnot H)'}</BlockMath>
          </LessonCard>
        );

      case 'BayesCalculator':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              Adjust the sliders to see how prior probability, sensitivity, and false positive
              rate affect the posterior. Try the presets from Lab 7.
            </p>
            <Suspense fallback={<VizLoading />}>
              <BayesCalculatorViz />
            </Suspense>
            <CalloutBox type="tip" title="Key Insight">
              <p>
                When the disease is rare, the <strong>false positive rate</strong> matters
                far more than the sensitivity. Most positive tests come from the large
                healthy population, not the small sick population.
              </p>
            </CalloutBox>
          </LessonCard>
        );

      case 'BaseRateGame':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              Most people dramatically overestimate the probability of having a disease
              after a positive test. Can you beat the base rate trap?
            </p>
            <Suspense fallback={<VizLoading />}>
              <BaseRateGameViz />
            </Suspense>
          </LessonCard>
        );

      case 'QuizBayes':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <QuizCard questions={QUIZ_82} />
          </LessonCard>
        );

      /* ------------------------------------------------------------------ */
      /* 8.3 Joint Distributions                                            */
      /* ------------------------------------------------------------------ */
      case 'JointTable':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              A <strong>joint probability distribution</strong> assigns a probability to
              every combination of values for a set of random variables. All entries sum to 1.
            </p>
            <div className="my-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th></th>
                    <th colSpan={2} className="text-center border-b">toothache</th>
                    <th colSpan={2} className="text-center border-b">¬toothache</th>
                  </tr>
                  <tr>
                    <th></th>
                    <th className="text-center px-3">catch</th>
                    <th className="text-center px-3">¬catch</th>
                    <th className="text-center px-3">catch</th>
                    <th className="text-center px-3">¬catch</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="font-medium pr-4">cavity</td>
                    <td className="text-center px-3">0.108</td>
                    <td className="text-center px-3">0.012</td>
                    <td className="text-center px-3">0.072</td>
                    <td className="text-center px-3">0.008</td>
                  </tr>
                  <tr>
                    <td className="font-medium pr-4">¬cavity</td>
                    <td className="text-center px-3">0.016</td>
                    <td className="text-center px-3">0.064</td>
                    <td className="text-center px-3">0.144</td>
                    <td className="text-center px-3">0.576</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>
              This table encodes the full joint distribution <M>{'P(\\text{cavity}, \\text{toothache}, \\text{catch})'}</M> — every
              question about these three variables can be answered from it.
            </p>
          </LessonCard>
        );

      case 'Marginalization':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              To compute the probability of a single variable from a joint distribution,
              <strong> sum out</strong> (marginalize) the other variables:
            </p>
            <BlockMath>{'P(X) = \\sum_{y} P(X, Y = y)'}</BlockMath>
            <p className="mt-4">
              For example, from the dental table:
            </p>
            <BlockMath>
              {'P(\\text{toothache}) = 0.108 + 0.012 + 0.016 + 0.064 = 0.2'}
            </BlockMath>
            <p className="mt-2">
              We summed over all combinations of cavity and catch where toothache is true.
            </p>
            <CalloutBox type="info" title="Why 'Marginalization'?">
              <p>
                The name comes from writing the sums in the <strong>margins</strong> of the
                table — row totals and column totals.
              </p>
            </CalloutBox>
          </LessonCard>
        );

      case 'JointExplorer':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              Click a query to see which cells contribute and how the formula is computed.
            </p>
            <Suspense fallback={<VizLoading />}>
              <JointDistributionExplorerViz />
            </Suspense>
          </LessonCard>
        );

      case 'QuizJoint':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <QuizCard questions={QUIZ_83} />
          </LessonCard>
        );

      /* ------------------------------------------------------------------ */
      /* 8.4 Independence                                                   */
      /* ------------------------------------------------------------------ */
      case 'IndependenceDef':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              Two events <M>A</M> and <M>B</M> are <strong>independent</strong> if
              knowing one tells you nothing about the other:
            </p>
            <BlockMath>{'P(A, B) = P(A) \\cdot P(B)'}</BlockMath>
            <p className="mt-2">
              Equivalently: <M>{'P(A \\mid B) = P(A)'}</M>.
            </p>
            <CalloutBox type="info" title="Example">
              <p>
                Two fair coin flips are independent: knowing the first flip landed heads
                does not change the probability of the second flip.
              </p>
            </CalloutBox>
            <CalloutBox type="warning" title="Common Confusion">
              <p>
                Independent ≠ mutually exclusive. Mutually exclusive events are maximally
                <em>dependent</em>: if one occurs, the other definitely does not.
              </p>
            </CalloutBox>
          </LessonCard>
        );

      case 'CondIndependence':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              <M>A</M> and <M>B</M> are <strong>conditionally independent</strong> given <M>C</M> if:
            </p>
            <BlockMath>{'P(A \\mid B, C) = P(A \\mid C)'}</BlockMath>
            <p className="mt-2">
              Once you know <M>C</M>, learning <M>B</M> gives no additional information about <M>A</M>.
            </p>
            <p className="mt-4">
              From the dental table: <M>{'P(\\text{toothache} \\mid \\text{cavity}, \\text{catch}) = 0.6'}</M> and{' '}
              <M>{'P(\\text{toothache} \\mid \\text{cavity}) = 0.6'}</M>. They are equal, so toothache
              is conditionally independent of catch given cavity.
            </p>
            <CalloutBox type="warning" title="Neither Implies the Other">
              <p>
                Marginal independence does not imply conditional independence, and vice versa.
                These are separate properties that must be checked independently.
              </p>
            </CalloutBox>
          </LessonCard>
        );

      case 'QuizIndependence':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <QuizCard questions={QUIZ_84} />
          </LessonCard>
        );

      /* ------------------------------------------------------------------ */
      /* 8.5 Bayesian Networks                                              */
      /* ------------------------------------------------------------------ */
      case 'BNIntro':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              A full joint distribution over <M>n</M> binary variables needs <M>{'2^n'}</M> entries.
              For 20 variables, that is over a million numbers. Bayesian networks provide a
              <strong> compact representation</strong> by exploiting conditional independence.
            </p>
            <div className="my-4 grid gap-4 md:grid-cols-3 not-prose">
              <div className="rounded-xl border p-4">
                <div className="font-semibold">Structure</div>
                <div className="mt-2 text-sm text-muted-foreground">
                  A directed acyclic graph (DAG) where nodes are random variables and edges represent direct influence.
                </div>
              </div>
              <div className="rounded-xl border p-4">
                <div className="font-semibold">Parameters</div>
                <div className="mt-2 text-sm text-muted-foreground">
                  Each node has a conditional probability table (CPT) conditioned on its parents.
                </div>
              </div>
              <div className="rounded-xl border p-4">
                <div className="font-semibold">Semantics</div>
                <div className="mt-2 text-sm text-muted-foreground">
                  A node is conditionally independent of its non-descendants given its parents.
                </div>
              </div>
            </div>
            <CalloutBox type="key-idea" title="The Chain Rule for Bayesian Networks">
              <BlockMath>{'P(X_1, \\ldots, X_n) = \\prod_{i=1}^{n} P(X_i \\mid \\text{Parents}(X_i))'}</BlockMath>
              <p className="mt-1">
                The full joint is the product of all local CPTs — no need to store the exponentially large table.
              </p>
            </CalloutBox>
          </LessonCard>
        );

      case 'BNStructure':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              Consider the classic <strong>Alarm</strong> network:
            </p>
            <ul>
              <li><strong>Burglary</strong> and <strong>Earthquake</strong> can each cause the <strong>Alarm</strong> to go off.</li>
              <li><strong>John</strong> and <strong>Mary</strong> might call if they hear the alarm.</li>
            </ul>
            <p className="mt-4">
              The DAG encodes: John calling depends on the Alarm, but is conditionally independent of Burglary
              given the Alarm state. The full joint over 5 binary variables needs <M>{'2^5 = 32'}</M> entries,
              but the BN only stores <M>{'1 + 1 + 4 + 2 + 2 = 10'}</M> parameters.
            </p>
            <CalloutBox type="info" title="Conditional Probability Tables">
              <p>
                Each node stores <M>{'P(X_i \\mid \\text{Parents}(X_i))'}</M>. A node with <M>k</M> binary
                parents has <M>{'2^k'}</M> rows in its CPT. Root nodes (no parents) just store <M>{'P(X_i)'}</M>.
              </p>
            </CalloutBox>
          </LessonCard>
        );

      case 'BNBuilder':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              Explore the Alarm network. Click nodes to view their CPTs, and toggle edges
              to see how the structure affects the number of parameters.
            </p>
            <Suspense fallback={<VizLoading />}>
              <BayesNetBuilderViz />
            </Suspense>
          </LessonCard>
        );

      case 'BNInference':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              <strong>Variable elimination</strong> computes posterior probabilities by
              systematically multiplying factors and summing out variables.
              Set evidence and step through the algorithm.
            </p>
            <Suspense fallback={<VizLoading />}>
              <BayesNetInferenceViz />
            </Suspense>
          </LessonCard>
        );

      case 'BNExplaining':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              <strong>Explaining away</strong> is a key pattern: when two independent causes
              share a common effect, observing the effect makes the causes compete.
            </p>
            <Suspense fallback={<VizLoading />}>
              <ExplainingAwayViz />
            </Suspense>
            <CalloutBox type="key-idea" title="D-Separation Intuition">
              <p>
                Burglary and Earthquake are marginally independent. But if you observe the
                Alarm, learning about Earthquake changes your belief in Burglary — they
                become conditionally <em>dependent</em> given Alarm.
              </p>
            </CalloutBox>
          </LessonCard>
        );

      case 'QuizBN':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <QuizCard questions={QUIZ_85} />
          </LessonCard>
        );

      /* ------------------------------------------------------------------ */
      /* Lab 7                                                              */
      /* ------------------------------------------------------------------ */
      case 'Lab7Ex1':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <ExerciseCard exerciseId="lab7-ex1" number={1} title="Two Medical Tests" totalSteps={4}>
              <Suspense fallback={<VizLoading />}>
                <Exercise1BayesCompare />
              </Suspense>
            </ExerciseCard>
          </LessonCard>
        );

      case 'Lab7Ex2':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <ExerciseCard exerciseId="lab7-ex2" number={2} title="The Rare Disease" totalSteps={3}>
              <Suspense fallback={<VizLoading />}>
                <Exercise2RareDisease />
              </Suspense>
            </ExerciseCard>
          </LessonCard>
        );

      case 'Lab7Ex3':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <ExerciseCard exerciseId="lab7-ex3" number={3} title="Joint Distribution Table" totalSteps={8}>
              <Suspense fallback={<VizLoading />}>
                <Exercise3JointTable />
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
      <h1 className="text-3xl font-bold tracking-tight mb-2">
        Topic 8: Probability &amp; Bayesian Networks
      </h1>
      <p className="text-muted-foreground mb-4">
        Reasoning under uncertainty with probability theory, Bayes&apos; rule, and graphical models.
      </p>
      <LessonStepper
        cards={CARDS}
        sections={SECTIONS}
        storagePrefix="lesson-t08"
        renderCard={renderCard}
      />
    </div>
  );
}
