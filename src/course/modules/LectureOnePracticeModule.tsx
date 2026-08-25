import { CategoryChallenge } from '@/components/CategoryChallenge';
import { FlashcardDeck } from '@/components/FlashcardDeck';
import { LearningFlow, type LearningFlowStep } from '@/components/LearningFlow';
import { LearningModuleLayout } from '@/components/LearningModuleLayout';
import type { ModulePageProps } from '@/course/types';
import { useCourseProgress } from '@/hooks/useCourseProgress';

const recallCards = [
  {
    id: 'supervised-signal',
    prompt: 'What evidence defines supervised learning?',
    answer: 'Each training input is paired with the target value or class.',
    explanation: 'The target can be continuous, discrete, single, or multivariate.',
  },
  {
    id: 'unsupervised-signal',
    prompt: 'What must be absent for a task to be an unlabeled unsupervised problem?',
    answer: 'A supplied target answer for each example.',
    explanation: 'The model may find groups, outliers, missing structure, or a distribution without class labels.',
  },
  {
    id: 'reinforcement-signal',
    prompt: 'What connects an action to learning in reinforcement learning?',
    answer: 'A reward linked to the state transition and later consequences.',
    explanation: 'The reward can be delayed or stochastic, which makes credit assignment difficult.',
  },
  {
    id: 'self-supervised-target',
    prompt: 'Where does a self-supervised target come from?',
    answer: 'It is constructed from the data itself.',
    explanation: 'A model can hide or transform part of an example and learn to recover it without manual labels.',
  },
  {
    id: 'oltp-olap',
    prompt: 'What is the shortest useful distinction between OLTP and OLAP?',
    answer: 'OLTP serves small concurrent transactions; OLAP scans and aggregates historical data.',
    explanation: 'Separating them prevents analytical workloads from delaying user-facing operations.',
  },
  {
    id: 'batch-stream',
    prompt: 'What makes a streaming path necessary?',
    answer: 'The answer loses value if it waits for a batch window.',
    explanation: 'Streaming supports seconds or milliseconds while events continue to arrive.',
  },
];

const fieldCases = [
  {
    id: 'demand-history',
    prompt: 'A utility predicts next-hour electricity demand from historical examples paired with the demand that occurred.',
    answer: 'Labels',
    explanation: 'Past demand is the continuous target paired with each feature set. This is supervised regression.',
  },
  {
    id: 'unknown-segments',
    prompt: 'A team searches purchase histories for natural groups without naming any segment in advance.',
    answer: 'Unlabeled structure',
    explanation: 'No target segment is supplied. The task asks the data to reveal grouping structure.',
  },
  {
    id: 'delivery-policy',
    prompt: 'A routing agent chooses a move and receives a larger reward when the delivery finishes sooner.',
    answer: 'Rewards',
    explanation: 'Actions are evaluated by consequences, so the reward is the learning signal.',
  },
  {
    id: 'monthly-close',
    prompt: 'A finance team scans the full ledger once each night to rebuild an aggregate report used the next morning.',
    answer: 'Hours or days',
    explanation: 'The decision window fits batch analytics. Continuous processing would add complexity without increasing the report value.',
  },
  {
    id: 'card-fraud',
    prompt: 'A card transaction must be blocked before authorization completes, usually within 300 milliseconds.',
    answer: 'Seconds or milliseconds',
    explanation: 'A late answer is useless. Events need a buffered streaming path and low-latency processing.',
  },
];

export default function LectureOnePracticeModule({ module }: ModulePageProps) {
  const { setCompleted } = useCourseProgress();

  const steps: LearningFlowStep[] = [
    {
      id: 'recall',
      title: 'Retrieve the rule before seeing it again',
      sectionLabel: 'Recall',
      render: ({ completeStep }) => (
        <FlashcardDeck
          title="Lecture 1 core distinctions"
          cards={recallCards}
          storageKey="lecture-one-recall"
          onComplete={completeStep}
        />
      ),
    },
    {
      id: 'apply',
      title: 'Use the signal or deadline on a fresh case',
      sectionLabel: 'Apply',
      render: ({ completeStep }) => (
        <CategoryChallenge
          title="Which clue should control the decision?"
          introduction="Classify each case by the evidence or decision window that matters most."
          categories={['Labels', 'Unlabeled structure', 'Rewards', 'Hours or days', 'Seconds or milliseconds']}
          items={fieldCases}
          storageKey="lecture-one-field-check"
          onComplete={completeStep}
        />
      ),
    },
  ];

  return (
    <LearningModuleLayout module={module} manualCompletion={false}>
      <LearningFlow
        storageKey="lecture-one-practice-flow"
        steps={steps}
        onFinish={() => setCompleted(module.slug, true)}
      />
    </LearningModuleLayout>
  );
}
