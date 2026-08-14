import type { QuizQuestion } from '@/hooks/useQuizState';

// ---------------------------------------------------------------------------
// Section groupings
// ---------------------------------------------------------------------------

export interface CardSection {
  id: string;
  label: string;
  cardRange: [number, number];
}

export const SECTIONS: CardSection[] = [
  { id: 'markov', label: 'Markov Chains', cardRange: [0, 3] },
  { id: 'hmm', label: 'Hidden Markov Models', cardRange: [4, 8] },
  { id: 'forward', label: 'Forward Algorithm', cardRange: [9, 12] },
  { id: 'viterbi', label: 'Viterbi Algorithm', cardRange: [13, 16] },
  { id: 'summary', label: 'Three Problems', cardRange: [17, 19] },
  { id: 'lab', label: 'Lab 9', cardRange: [20, 21] },
];

// ---------------------------------------------------------------------------
// Card definitions
// ---------------------------------------------------------------------------

export interface LessonCardDef {
  id: string;
  title: string;
  sectionId: string;
  component: string;
  autoComplete?: boolean;
}

export const CARDS: LessonCardDef[] = [
  // 9.1 Markov Chains
  { id: 'hook-detective', title: 'The Ice Cream Detective', sectionId: 'markov', component: 'HookDetective', autoComplete: true },
  { id: 'markov-chain-def', title: 'Markov Chains', sectionId: 'markov', component: 'MarkovChainDef', autoComplete: true },
  { id: 'weather-markov-viz', title: 'Interactive Weather Chain', sectionId: 'markov', component: 'WeatherMarkovChain' },
  { id: 'quiz-markov', title: 'Quiz: Markov Chains', sectionId: 'markov', component: 'QuizMarkov' },

  // 9.2 Hidden Markov Models
  { id: 'why-hidden', title: 'Why "Hidden"?', sectionId: 'hmm', component: 'WhyHidden', autoComplete: true },
  { id: 'hmm-params', title: 'HMM Parameters', sectionId: 'hmm', component: 'HMMParams', autoComplete: true },
  { id: 'ice-cream-hmm', title: 'The Ice Cream HMM', sectionId: 'hmm', component: 'IceCreamHMM' },
  { id: 'hmm-sampler', title: 'Sampling from an HMM', sectionId: 'hmm', component: 'HMMSampler' },
  { id: 'quiz-hmm', title: 'Quiz: HMMs', sectionId: 'hmm', component: 'QuizHMM' },

  // 9.3 Forward Algorithm
  { id: 'three-problems', title: 'The Three HMM Problems', sectionId: 'forward', component: 'ThreeProblems', autoComplete: true },
  { id: 'forward-motivation', title: 'Why Not Brute Force?', sectionId: 'forward', component: 'ForwardMotivation', autoComplete: true },
  { id: 'forward-trellis', title: 'Forward Trellis', sectionId: 'forward', component: 'ForwardTrellis' },
  { id: 'quiz-forward', title: 'Quiz: Forward Algorithm', sectionId: 'forward', component: 'QuizForward' },

  // 9.4 Viterbi Algorithm
  { id: 'decoding-problem', title: 'The Decoding Problem', sectionId: 'viterbi', component: 'DecodingProblem', autoComplete: true },
  { id: 'viterbi-intuition', title: 'Viterbi: max instead of sum', sectionId: 'viterbi', component: 'ViterbiIntuition', autoComplete: true },
  { id: 'viterbi-trellis', title: 'Viterbi Trellis', sectionId: 'viterbi', component: 'ViterbiTrellis' },
  { id: 'quiz-viterbi', title: 'Quiz: Viterbi', sectionId: 'viterbi', component: 'QuizViterbi' },

  // 9.5 Summary & Applications
  { id: 'problems-summary', title: 'Problems in a Nutshell', sectionId: 'summary', component: 'ProblemsSummary', autoComplete: true },
  { id: 'applications', title: 'Where HMMs Are Used', sectionId: 'summary', component: 'Applications', autoComplete: true },
  { id: 'quiz-summary', title: 'Quiz: Putting it Together', sectionId: 'summary', component: 'QuizSummary' },

  // Lab 9
  { id: 'lab9-ex1', title: 'Exercise 1: Build the Forward Algorithm', sectionId: 'lab', component: 'Lab9Ex1' },
  { id: 'lab9-ex2', title: 'Exercise 2: Decode with Viterbi', sectionId: 'lab', component: 'Lab9Ex2' },
];

// ---------------------------------------------------------------------------
// Quiz data
// ---------------------------------------------------------------------------

export const QUIZ_MARKOV: QuizQuestion[] = [
  {
    id: 't09-q01',
    question: 'The Markov assumption states that:',
    options: [
      'All states are independent of each other',
      'The current state depends only on the previous state, not the full history',
      'Every transition has the same probability',
      'States can change instantly at any time',
    ],
    correctIndex: 1,
    explanation:
      'The first-order Markov assumption says P(qᵢ | q₁…qᵢ₋₁) = P(qᵢ | qᵢ₋₁). The future depends on the past only through the current state — everything else is "forgotten".',
  },
  {
    id: 't09-q02',
    question:
      'In a weather Markov chain with π = [0.5, 0.3, 0.2] for [HOT, COLD, WARM] and a₃₃ (WARM→WARM) = 0.6, what is the probability of the sequence WARM WARM WARM WARM?',
    options: ['0.6 × 0.6 × 0.6 = 0.216', '0.2 × 0.6³ = 0.0432', '0.2 × 0.6⁴ = 0.02592', '0.2 + 3 × 0.6 = 2.0'],
    correctIndex: 1,
    explanation:
      'Start with π₃ = 0.2 (probability of starting in WARM), then multiply by a₃₃ three times for each stay: 0.2 × (0.6)³ = 0.0432.',
  },
  {
    id: 't09-q03',
    question: 'In a Markov chain, the rows of the transition matrix must:',
    options: [
      'Sum to 0',
      'Sum to 1 (each row is a probability distribution over next states)',
      'All be equal',
      'Be symmetric',
    ],
    correctIndex: 1,
    explanation:
      'From any state, the next-state probabilities must form a valid distribution. Σⱼ aᵢⱼ = 1 for every row i.',
  },
];

export const QUIZ_HMM: QuizQuestion[] = [
  {
    id: 't09-q04',
    question: 'What distinguishes a Hidden Markov Model from a regular Markov chain?',
    options: [
      'HMMs use more states',
      'In an HMM the states are hidden — we see only emitted observations that depend on the state',
      'HMMs are non-Markovian',
      'HMMs never have self-loops',
    ],
    correctIndex: 1,
    explanation:
      'In a Markov chain the state is the observation. In an HMM each hidden state stochastically emits an observation through B(o|q), and we only see the emissions.',
  },
  {
    id: 't09-q05',
    question: 'An HMM is specified by which of the following?',
    options: [
      'Only the transition matrix A',
      'Only the emission matrix B',
      'A transition matrix A, an emission matrix B, and initial/final states (or π)',
      'The observation sequence alone',
    ],
    correctIndex: 2,
    explanation:
      'The full HMM λ = (A, B, π) has three pieces: how states evolve (A), how states emit observations (B), and how we start (π or q₀).',
  },
  {
    id: 't09-q06',
    question:
      'In the Ice Cream HMM with P(3|HOT) = 0.4 and P(3|COLD) = 0.1, observing "3 ice creams eaten" alone tells us:',
    options: [
      'The weather was definitely HOT',
      'The weather was definitely COLD',
      'HOT is more likely than COLD given this observation (before combining with prior)',
      'Nothing — emissions contain no information about state',
    ],
    correctIndex: 2,
    explanation:
      'HOT emits "3" four times more often than COLD does (0.4 vs 0.1). That makes HOT a more likely explanation, but it is not certain — we must still factor in the prior / transition probabilities.',
  },
  {
    id: 't09-q07',
    question: 'The output-independence assumption of an HMM says:',
    options: [
      'Observations are independent of each other',
      'Observations at time t depend only on the state at time t (not on other states or observations)',
      'States and observations are always independent',
      'Observations happen before states',
    ],
    correctIndex: 1,
    explanation:
      'P(oₜ | q₁…q_T, o₁…o_T) = P(oₜ | qₜ). Given the current state, the emission is independent of everything else in the sequence.',
  },
];

export const QUIZ_FORWARD: QuizQuestion[] = [
  {
    id: 't09-q08',
    question:
      'For an HMM with N hidden states and a sequence of T observations, how many possible hidden state sequences are there?',
    options: ['N × T', 'N + T', 'Nᵀ', 'T!'],
    correctIndex: 2,
    explanation:
      'Each of the T time steps can be in any of N states, independently, so there are N^T possible state sequences. This exponential blow-up is why we need dynamic programming.',
  },
  {
    id: 't09-q09',
    question: 'Each cell αₜ(j) of the forward trellis represents:',
    options: [
      'The probability of being in state j at time t, summed over all paths that could have led there',
      'The probability of the single best path ending in state j at time t',
      'The emission probability for state j at time t',
      'The transition probability from state j at time t−1',
    ],
    correctIndex: 0,
    explanation:
      'αₜ(j) = P(o₁, o₂, …, oₜ, qₜ = j | λ). It sums the probability of all paths that land in state j at time t.',
  },
  {
    id: 't09-q10',
    question: 'The forward recursion is αₜ(j) = Σᵢ αₜ₋₁(i) · aᵢⱼ · bⱼ(oₜ). What is the time complexity?',
    options: ['O(T)', 'O(N²T) — far better than the O(Nᵀ) brute force', 'O(Nᵀ)', 'O(N!)'],
    correctIndex: 1,
    explanation:
      'Each of the N·T cells takes O(N) work (summing over the N previous states), giving O(N²T) — polynomial instead of exponential.',
  },
];

export const QUIZ_VITERBI: QuizQuestion[] = [
  {
    id: 't09-q11',
    question: 'The Viterbi algorithm solves which problem?',
    options: [
      'Compute P(O | λ) — the total probability of an observation sequence',
      'Find the single most likely hidden state sequence given the observations',
      'Learn the HMM parameters A, B from data',
      'Sample a new observation sequence',
    ],
    correctIndex: 1,
    explanation:
      'Viterbi solves the decoding problem: argmax_Q P(Q | O, λ). It returns the best state sequence, not a probability over sequences.',
  },
  {
    id: 't09-q12',
    question: 'The difference between the Forward and Viterbi recursions is:',
    options: [
      'Forward uses sum, Viterbi uses max',
      'Forward uses max, Viterbi uses sum',
      'Viterbi does not use dynamic programming',
      'They are identical',
    ],
    correctIndex: 0,
    explanation:
      'Forward: αₜ(j) = Σᵢ αₜ₋₁(i)·aᵢⱼ·bⱼ(oₜ) (total probability). Viterbi: vₜ(j) = maxᵢ vₜ₋₁(i)·aᵢⱼ·bⱼ(oₜ) (best-path probability). Everything else — trellis, init, termination — mirrors between the two.',
  },
  {
    id: 't09-q13',
    question: 'Why does Viterbi need backpointers?',
    options: [
      'To speed up the forward pass',
      'To recover the actual state sequence after computing the max probabilities',
      'To compute emission probabilities',
      'To verify the Markov assumption',
    ],
    correctIndex: 1,
    explanation:
      'The max gives you the probability of the best path, but not the path itself. Backpointers btₜ(j) = argmax record which previous state led to the best score in j at time t, so you can walk back from the final state to reconstruct the sequence.',
  },
];

export const QUIZ_SUMMARY: QuizQuestion[] = [
  {
    id: 't09-q14',
    question: 'Match the problem to the algorithm: Given observations, find the most likely hidden state sequence.',
    options: [
      'Evaluation → Forward',
      'Decoding → Viterbi',
      'Learning → Baum-Welch',
      'Sampling → Gibbs',
    ],
    correctIndex: 1,
    explanation:
      'Decoding is the "what was the path" question, and Viterbi is the standard dynamic-programming algorithm for it.',
  },
  {
    id: 't09-q15',
    question: 'Which real-world task is NOT a classic HMM application?',
    options: [
      'Part-of-speech tagging (words → tags)',
      'Speech recognition (audio frames → phonemes)',
      'Biological sequence analysis (DNA → gene regions)',
      'Training a deep convolutional image classifier from scratch',
    ],
    correctIndex: 3,
    explanation:
      'HMMs shine on sequential data with latent structure. Pure image classification has no explicit sequence of hidden states and is better handled by CNNs/transformers.',
  },
];
