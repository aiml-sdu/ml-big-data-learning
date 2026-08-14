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
  QUIZ_MARKOV,
  QUIZ_HMM,
  QUIZ_FORWARD,
  QUIZ_VITERBI,
  QUIZ_SUMMARY,
} from '@/data/topic-09-cards';

const WeatherMarkovChainViz = lazy(() => import('./visualizations/WeatherMarkovChainViz'));
const IceCreamHMMViz = lazy(() => import('./visualizations/IceCreamHMMViz'));
const HMMSamplerViz = lazy(() => import('./visualizations/HMMSamplerViz'));
const ForwardTrellisViz = lazy(() => import('./visualizations/ForwardTrellisViz'));
const ViterbiTrellisViz = lazy(() => import('./visualizations/ViterbiTrellisViz'));
const Lab9Ex1ForwardBuilder = lazy(() => import('./visualizations/lab/Lab9Ex1ForwardBuilder'));
const Lab9Ex2ViterbiDecoder = lazy(() => import('./visualizations/lab/Lab9Ex2ViterbiDecoder'));

function VizLoading() {
  return (
    <div className="flex h-64 items-center justify-center rounded-lg bg-muted text-sm text-muted-foreground animate-pulse">
      Loading visualization...
    </div>
  );
}

export default function Topic09HMMPage() {
  const renderCard = useCallback((index: number, _onComplete: () => void): ReactNode => {
    const card = CARDS[index];
    const section = SECTIONS.find((s) => s.id === card.sectionId);

    switch (card.component) {
      /* ------------------------------------------------------------------ */
      /* 9.1 Markov Chains                                                  */
      /* ------------------------------------------------------------------ */
      case 'HookDetective':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              It's the year 2799. You're a climatologist studying a heat wave from the summer of 2008 in Baltimore,
              but the weather records are gone. All you have is Jason Eisner's diary, which records only how many
              ice creams he ate each day:
            </p>
            <div className="my-4 flex flex-wrap gap-2">
              {[3, 3, 1, 1, 2, 2, 3, 1, 3].map((n, i) => (
                <div
                  key={i}
                  className="flex size-11 items-center justify-center rounded-md border-2 border-primary/30 bg-primary/10 text-lg font-bold text-primary"
                >
                  {n}
                </div>
              ))}
            </div>
            <p>
              The actual weather — <strong>hot</strong> or <strong>cold</strong> — is hidden. But you know something:
              people eat more ice cream on hot days. Can you work backwards from the observations to the most likely
              weather sequence?
            </p>
            <CalloutBox type="key-idea" title="This is the core HMM task">
              <p>
                Given a sequence of <strong>observations</strong>, we want to infer the sequence of{' '}
                <strong>hidden states</strong> that most likely produced them. Hidden Markov Models give us the math
                and algorithms to do this efficiently.
              </p>
            </CalloutBox>
            <p className="text-sm text-muted-foreground">
              We will build up to this problem in four steps: Markov chains → hidden states → the forward algorithm
              for likelihood → the Viterbi algorithm for decoding.
            </p>
          </LessonCard>
        );

      case 'MarkovChainDef':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              A <strong>Markov chain</strong> is a stochastic process that moves between a finite set of states. It
              has two ingredients:
            </p>
            <div className="my-4 grid gap-3 md:grid-cols-2 not-prose">
              <div className="rounded-xl border p-4">
                <div className="font-semibold text-sm">Initial distribution π</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  <M>{'\\pi_i = P(q_1 = i)'}</M> — how likely is each state at time 1?
                </div>
              </div>
              <div className="rounded-xl border p-4">
                <div className="font-semibold text-sm">Transition matrix A</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  <M>{'a_{ij} = P(q_t = j \\mid q_{t-1} = i)'}</M> — how do we hop from one state to the next?
                </div>
              </div>
            </div>
            <CalloutBox type="key-idea" title="The Markov assumption">
              <BlockMath>{'P(q_i \\mid q_1, \\ldots, q_{i-1}) = P(q_i \\mid q_{i-1})'}</BlockMath>
              <p className="mt-1">
                The future depends on the past only through the <em>current</em> state. All earlier history is
                forgotten.
              </p>
            </CalloutBox>
            <p>
              The probability of any specific sequence of states factorizes into a product of the initial probability
              and the transitions:
            </p>
            <BlockMath>
              {
                'P(q_1, q_2, \\ldots, q_T) = \\pi_{q_1} \\cdot a_{q_1 q_2} \\cdot a_{q_2 q_3} \\cdots a_{q_{T-1} q_T}'
              }
            </BlockMath>
            <p className="text-sm text-muted-foreground">
              Rows of the transition matrix must sum to 1 — from any state, you have to go <em>somewhere</em>.
            </p>
          </LessonCard>
        );

      case 'WeatherMarkovChain':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              This is the weather Markov chain from the Jurafsky &amp; Martin textbook. Three states — HOT, COLD,
              WARM — with the transition probabilities from the slides. Press <strong>Play</strong> to sample a
              trajectory and watch the probability of the whole sequence shrink as it grows.
            </p>
            <Suspense fallback={<VizLoading />}>
              <WeatherMarkovChainViz />
            </Suspense>
            <CalloutBox type="info" title="Try this">
              <p>
                Notice how WARM has a self-loop of 0.6 — runs of WARM days are more likely than constant switching.
                That's the kind of structure a Markov chain encodes.
              </p>
            </CalloutBox>
          </LessonCard>
        );

      case 'QuizMarkov':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <QuizCard questions={QUIZ_MARKOV} />
          </LessonCard>
        );

      /* ------------------------------------------------------------------ */
      /* 9.2 Hidden Markov Models                                           */
      /* ------------------------------------------------------------------ */
      case 'WhyHidden':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              In a Markov chain we can see the state directly — if the state is HOT, we observe HOT. But most
              interesting real-world problems aren't like that:
            </p>
            <div className="my-4 grid gap-3 md:grid-cols-3 not-prose">
              <div className="rounded-xl border p-4">
                <div className="text-sm font-semibold">Speech recognition</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Observations: audio frames. Hidden state: phonemes / words.
                </div>
              </div>
              <div className="rounded-xl border p-4">
                <div className="text-sm font-semibold">Part-of-speech tagging</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Observations: the words we see. Hidden state: the grammatical tag.
                </div>
              </div>
              <div className="rounded-xl border p-4">
                <div className="text-sm font-semibold">Bioinformatics</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Observations: DNA bases. Hidden state: gene / non-gene regions.
                </div>
              </div>
            </div>
            <CalloutBox type="key-idea" title="The extension">
              <p>
                A <strong>Hidden Markov Model</strong> is a Markov chain where the states are hidden. Instead, each
                state stochastically <em>emits</em> an observation via an emission distribution{' '}
                <M>{'b_j(o) = P(o \\mid q = j)'}</M>. We only see the emissions — never the state.
              </p>
            </CalloutBox>
          </LessonCard>
        );

      case 'HMMParams':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>An HMM is fully specified by the tuple <M>{'\\lambda = (A, B, \\pi)'}</M>:</p>
            <div className="my-4 space-y-3 not-prose">
              <div className="rounded-xl border p-4">
                <div className="font-semibold text-sm">
                  Q = <M>{'\\{q_1, \\ldots, q_N\\}'}</M>
                </div>
                <div className="mt-1 text-sm text-muted-foreground">The set of <em>hidden</em> states.</div>
              </div>
              <div className="rounded-xl border p-4">
                <div className="font-semibold text-sm">A — transition matrix</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  <M>{'a_{ij} = P(q_t = j \\mid q_{t-1} = i)'}</M>, with <M>{'\\sum_j a_{ij} = 1'}</M>.
                </div>
              </div>
              <div className="rounded-xl border p-4">
                <div className="font-semibold text-sm">B — emission (observation) matrix</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  <M>{'b_j(o_t) = P(o_t \\mid q_t = j)'}</M> — probability of observation <M>{'o_t'}</M> given state j.
                </div>
              </div>
              <div className="rounded-xl border p-4">
                <div className="font-semibold text-sm">π — initial distribution</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  <M>{'\\pi_i = P(q_1 = i)'}</M>. Equivalently, a dedicated start state <M>{'q_0'}</M> with
                  transitions out.
                </div>
              </div>
            </div>
            <CalloutBox type="info" title="Two assumptions that make HMMs tractable">
              <ul className="list-disc list-inside space-y-1 mt-1">
                <li>
                  <strong>Markov assumption</strong> (on states):{' '}
                  <M>{'P(q_i \\mid q_1 \\ldots q_{i-1}) = P(q_i \\mid q_{i-1})'}</M>
                </li>
                <li>
                  <strong>Output independence</strong> (on emissions):{' '}
                  <M>{'P(o_i \\mid q_1 \\ldots q_T, o_1 \\ldots o_T) = P(o_i \\mid q_i)'}</M>
                </li>
              </ul>
            </CalloutBox>
          </LessonCard>
        );

      case 'IceCreamHMM':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              Here's the classic Jurafsky &amp; Martin ice-cream HMM we'll use throughout the rest of this topic —
              and in the lab.
            </p>
            <Suspense fallback={<VizLoading />}>
              <IceCreamHMMViz />
            </Suspense>
            <CalloutBox type="tip" title="Read it like this">
              <p>
                "If the weather is HOT right now, there's a 0.7 chance tomorrow is still HOT and a 0.3 chance it
                flips to COLD. Given it's HOT, the diary will show 1, 2, or 3 ice creams with probabilities 0.2,
                0.4, 0.4."
              </p>
            </CalloutBox>
          </LessonCard>
        );

      case 'HMMSampler':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              To really feel the "hidden" part, sample sequences from the HMM below. The observation track is always
              visible (you're Jason's reader). The state track can be hidden — try to guess the weather from the ice
              creams alone, then reveal.
            </p>
            <Suspense fallback={<VizLoading />}>
              <HMMSamplerViz />
            </Suspense>
          </LessonCard>
        );

      case 'QuizHMM':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <QuizCard questions={QUIZ_HMM} />
          </LessonCard>
        );

      /* ------------------------------------------------------------------ */
      /* 9.3 Forward Algorithm                                              */
      /* ------------------------------------------------------------------ */
      case 'ThreeProblems':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>Once we have the HMM specification, three natural questions arise:</p>
            <div className="my-4 grid gap-3 md:grid-cols-3 not-prose">
              <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-4">
                <div className="font-semibold text-sm">1. Evaluation</div>
                <div className="mt-2 text-sm text-muted-foreground">
                  Given <M>{'\\lambda'}</M> and O, compute <M>{'P(O \\mid \\lambda)'}</M>. <br />
                  <span className="text-foreground font-medium">→ Forward algorithm</span>
                </div>
              </div>
              <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-4">
                <div className="font-semibold text-sm">2. Decoding</div>
                <div className="mt-2 text-sm text-muted-foreground">
                  Given <M>{'\\lambda'}</M> and O, find the best hidden state sequence{' '}
                  <M>{'Q^* = \\arg\\max_Q P(Q \\mid O, \\lambda)'}</M>. <br />
                  <span className="text-foreground font-medium">→ Viterbi algorithm</span>
                </div>
              </div>
              <div className="rounded-xl border-2 border-muted-foreground/30 bg-muted/20 p-4">
                <div className="font-semibold text-sm">3. Learning</div>
                <div className="mt-2 text-sm text-muted-foreground">
                  Given O, learn the parameters <M>{'\\lambda = (A, B, \\pi)'}</M> that maximize{' '}
                  <M>{'P(O \\mid \\lambda)'}</M>. <br />
                  <span className="text-foreground font-medium">→ Baum-Welch (not in this lab)</span>
                </div>
              </div>
            </div>
            <p>We'll tackle the first two. Both share the same <strong>trellis</strong> data structure.</p>
          </LessonCard>
        );

      case 'ForwardMotivation':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              The naive way to compute <M>{'P(O \\mid \\lambda)'}</M> is to sum over every possible hidden state
              sequence:
            </p>
            <BlockMath>{'P(O \\mid \\lambda) = \\sum_{Q} P(O, Q \\mid \\lambda)'}</BlockMath>
            <p>How many hidden sequences are there?</p>
            <CalloutBox type="warning" title="Exponential blow-up">
              <p>
                For <M>N</M> states and a sequence of length <M>T</M>, there are <M>{'N^T'}</M> state sequences. With
                just 10 hidden states and 20 time steps, that's <M>{'10^{20}'}</M> — more sequences than atoms in a
                grain of sand. Brute force is hopeless.
              </p>
            </CalloutBox>
            <p>
              The <strong>forward algorithm</strong> rescues us with dynamic programming. Instead of enumerating full
              paths, it builds a <strong>trellis</strong> table <M>{'\\alpha_t(j)'}</M>:
            </p>
            <BlockMath>{'\\alpha_t(j) = P(o_1, o_2, \\ldots, o_t,\\; q_t = j \\mid \\lambda)'}</BlockMath>
            <p>
              Each cell stores the total probability of every path that arrives at state <M>j</M> after emitting the
              first <M>t</M> observations. New cells are built from the previous column:
            </p>
            <BlockMath>{'\\alpha_t(j) = \\left[\\sum_{i=1}^{N} \\alpha_{t-1}(i)\\, a_{ij}\\right] b_j(o_t)'}</BlockMath>
            <p>
              The total cost is <strong>O(N²T)</strong> — polynomial, no matter how long the sequence gets.
            </p>
          </LessonCard>
        );

      case 'ForwardTrellis':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              Step through the forward algorithm on the ice-cream HMM with observation sequence <strong>3 1 3</strong>.
              Each click reveals the next column of the trellis and shows exactly where the numbers come from.
            </p>
            <Suspense fallback={<VizLoading />}>
              <ForwardTrellisViz />
            </Suspense>
            <CalloutBox type="tip" title="What to notice">
              <p>
                Each cell is built from both cells in the previous column. The forward algorithm silently sums over
                all <M>{'2^3 = 8'}</M> possible hidden state sequences for this example, without ever listing them
                explicitly.
              </p>
            </CalloutBox>
          </LessonCard>
        );

      case 'QuizForward':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <QuizCard questions={QUIZ_FORWARD} />
          </LessonCard>
        );

      /* ------------------------------------------------------------------ */
      /* 9.4 Viterbi Algorithm                                              */
      /* ------------------------------------------------------------------ */
      case 'DecodingProblem':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              The forward algorithm tells us <em>how likely</em> an observation sequence is, but not <em>which</em>{' '}
              hidden states produced it. For that, we need the decoding problem:
            </p>
            <BlockMath>{'Q^* = \\arg\\max_{Q} P(Q \\mid O, \\lambda)'}</BlockMath>
            <p>
              That is: "of all possible hidden state sequences, which one best explains the observations?" For the
              ice-cream example, this is "what was the actual weather that summer?"
            </p>
            <CalloutBox type="info" title="Why not just run the forward algorithm?">
              <p>
                The forward algorithm <em>sums</em> over all paths. To find the best one we need to pick it out — and
                the natural dynamic programming trick is to keep the <strong>maximum</strong> contribution at each
                cell instead of the sum.
              </p>
            </CalloutBox>
          </LessonCard>
        );

      case 'ViterbiIntuition':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              The Viterbi algorithm uses the same trellis as forward, with <strong>two changes</strong>:
            </p>
            <div className="my-4 grid gap-3 md:grid-cols-2 not-prose">
              <div className="rounded-xl border p-4">
                <div className="font-semibold text-sm">1. max instead of sum</div>
                <div className="mt-2">
                  <BlockMath>{'v_t(j) = \\max_{i} v_{t-1}(i)\\, a_{ij}\\, b_j(o_t)'}</BlockMath>
                </div>
                <div className="text-xs text-muted-foreground">
                  Each cell stores the probability of the <em>best</em> path reaching state j at time t — not the
                  total.
                </div>
              </div>
              <div className="rounded-xl border p-4">
                <div className="font-semibold text-sm">2. backpointers</div>
                <div className="mt-2">
                  <BlockMath>{'bt_t(j) = \\arg\\max_{i} v_{t-1}(i)\\, a_{ij}\\, b_j(o_t)'}</BlockMath>
                </div>
                <div className="text-xs text-muted-foreground">
                  For each cell, remember <em>which</em> previous state won, so we can reconstruct the full path at
                  the end.
                </div>
              </div>
            </div>
            <p>After filling the trellis, start from the best final state and walk the backpointers backwards:</p>
            <BlockMath>{'q_T^* = \\arg\\max_{i} v_T(i), \\quad q_t^* = bt_{t+1}(q_{t+1}^*)'}</BlockMath>
          </LessonCard>
        );

      case 'ViterbiTrellis':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              Step through Viterbi on the same ice-cream sequence. Notice how solid arrows show the winning
              predecessor at each cell (the backpointers), and the final backtrace highlights the single best hidden
              path in purple.
            </p>
            <Suspense fallback={<VizLoading />}>
              <ViterbiTrellisViz />
            </Suspense>
            <CalloutBox type="key-idea" title="Forward vs Viterbi">
              <p>
                Same trellis. Same recursion shape. Swap <M>{'\\sum'}</M> for <M>{'\\max'}</M> and add backpointers
                — that's the whole story.
              </p>
            </CalloutBox>
          </LessonCard>
        );

      case 'QuizViterbi':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <QuizCard questions={QUIZ_VITERBI} />
          </LessonCard>
        );

      /* ------------------------------------------------------------------ */
      /* 9.5 Summary & Applications                                         */
      /* ------------------------------------------------------------------ */
      case 'ProblemsSummary':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 pr-4">Problem</th>
                    <th className="text-left py-2 pr-4">Input</th>
                    <th className="text-left py-2 pr-4">Output</th>
                    <th className="text-left py-2">Algorithm</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2 pr-4 font-semibold">Evaluation</td>
                    <td className="py-2 pr-4 font-mono text-xs">λ, O</td>
                    <td className="py-2 pr-4 font-mono text-xs">P(O | λ)</td>
                    <td className="py-2 font-mono text-xs">Forward</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 pr-4 font-semibold">Decoding</td>
                    <td className="py-2 pr-4 font-mono text-xs">λ, O</td>
                    <td className="py-2 pr-4 font-mono text-xs">argmax_Q P(Q | O, λ)</td>
                    <td className="py-2 font-mono text-xs">Viterbi</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-semibold">Learning</td>
                    <td className="py-2 pr-4 font-mono text-xs">O (and state space)</td>
                    <td className="py-2 pr-4 font-mono text-xs">λ = argmax P(O | λ)</td>
                    <td className="py-2 font-mono text-xs">Baum-Welch (EM)</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <CalloutBox type="key-idea" title="Both Forward and Viterbi are O(N²T)">
              <p>
                The same trellis powers both algorithms. Forward sums, Viterbi maxes. For any realistic sequence
                length this is massively cheaper than enumerating <M>{'N^T'}</M> paths.
              </p>
            </CalloutBox>
          </LessonCard>
        );

      case 'Applications':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>HMMs were the workhorse of sequential modeling before deep learning — and are still widely used:</p>
            <div className="my-4 grid gap-3 md:grid-cols-2 not-prose">
              <div className="rounded-xl border p-4">
                <div className="font-semibold">Speech recognition</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Hidden states = phones / sub-phones. Observations = acoustic feature vectors. Classical ASR
                  pipelines used HMM-GMM systems for decades.
                </div>
              </div>
              <div className="rounded-xl border p-4">
                <div className="font-semibold">Part-of-speech tagging</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Hidden states = tags (NOUN, VERB, …). Observations = words. Viterbi decodes the tag sequence.
                </div>
              </div>
              <div className="rounded-xl border p-4">
                <div className="font-semibold">Bioinformatics</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Gene finding, protein secondary structure, pairwise alignment with profile HMMs.
                </div>
              </div>
              <div className="rounded-xl border p-4">
                <div className="font-semibold">Activity &amp; gesture recognition</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Sensor time series → hidden activity labels (walking / sitting / running).
                </div>
              </div>
            </div>
            <CalloutBox type="info" title="HMMs vs RNNs / Transformers">
              <p>
                Modern deep models can learn richer representations without hand-designed states. But HMMs remain
                valuable when you want <strong>interpretable latent states</strong>, <strong>small data</strong>, or
                exact probabilistic reasoning — which is why they're still taught as the foundation for sequence
                modeling.
              </p>
            </CalloutBox>
          </LessonCard>
        );

      case 'QuizSummary':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <QuizCard questions={QUIZ_SUMMARY} />
          </LessonCard>
        );

      /* ------------------------------------------------------------------ */
      /* Lab 9                                                              */
      /* ------------------------------------------------------------------ */
      case 'Lab9Ex1':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p className="text-sm text-muted-foreground mb-3">
              Walk through the forward algorithm on the exact HMM from the Lab 9 handout. Seven steps: two for
              initialization, four for recursion, one for termination. Enter the α values yourself — tolerance is
              ±0.001 so three decimals of precision is enough.
            </p>
            <ExerciseCard exerciseId="lab9-ex1" number={1} title="Build the Forward Algorithm" totalSteps={7}>
              <Suspense fallback={<VizLoading />}>
                <Lab9Ex1ForwardBuilder />
              </Suspense>
            </ExerciseCard>
          </LessonCard>
        );

      case 'Lab9Ex2':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p className="text-sm text-muted-foreground mb-3">
              Now decode the same observation sequence with Viterbi. Fill in both the v values and the backpointers,
              then reconstruct the best hidden path.
            </p>
            <ExerciseCard exerciseId="lab9-ex2" number={2} title="Decode with Viterbi" totalSteps={11}>
              <Suspense fallback={<VizLoading />}>
                <Lab9Ex2ViterbiDecoder />
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
      <h1 className="text-3xl font-bold tracking-tight mb-2">Topic 9: Hidden Markov Models</h1>
      <p className="text-muted-foreground mb-4">
        Reasoning about hidden state from a sequence of noisy observations — the forward &amp; Viterbi algorithms.
      </p>
      <LessonStepper cards={CARDS} sections={SECTIONS} storagePrefix="lesson-t09" renderCard={renderCard} />
    </div>
  );
}
