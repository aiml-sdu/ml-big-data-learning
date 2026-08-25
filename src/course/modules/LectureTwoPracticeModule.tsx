import { CategoryChallenge } from '@/components/CategoryChallenge';
import { KnowledgeCheck } from '@/components/KnowledgeCheck';
import { LearningFlow, type LearningFlowStep } from '@/components/LearningFlow';
import { LearningModuleLayout } from '@/components/LearningModuleLayout';
import type { ModulePageProps } from '@/course/types';
import { useCourseProgress } from '@/hooks/useCourseProgress';

const pipelineCases = [
  {
    id: 'sensor-outage',
    prompt: 'A temperature sensor is blank for every device during the same network outage.',
    answer: 'Investigate missingness',
    explanation: 'The shared pattern may carry information about the collection process. Imputing first would erase evidence about why the values are absent.',
  },
  {
    id: 'age-conflict',
    prompt: 'Age and birth year disagree in records imported from two systems.',
    answer: 'Validate inconsistency',
    explanation: 'Choose a source of truth and a reference date. An average of the conflicting values has no useful meaning.',
  },
  {
    id: 'knn-scale',
    prompt: 'A distance-based model uses age in years and income in kroner, so income dominates the distance.',
    answer: 'Normalize scale',
    explanation: 'The units, not the intended importance, are controlling the distance. Scaling makes the features comparable before fitting the model.',
  },
  {
    id: 'keep-originals',
    prompt: 'From 500 sensor variables, retain the 12 original variables with the strongest validated signal.',
    answer: 'Feature selection',
    explanation: 'The resulting variables are a subset of the originals, which preserves their direct interpretation.',
  },
  {
    id: 'five-components',
    prompt: 'Replace 80 correlated measurements with five principal components.',
    answer: 'Feature extraction',
    explanation: 'PCA constructs five new axes from combinations of the original measurements.',
  },
  {
    id: 'store-centroids',
    prompt: 'Replace ten million similar location records with representative cluster centroids and counts.',
    answer: 'Numerosity reduction',
    explanation: 'The representation stores summaries of many records rather than selecting or constructing feature columns.',
  },
];

export default function LectureTwoPracticeModule({ module }: ModulePageProps) {
  const { setCompleted } = useCourseProgress();

  const steps: LearningFlowStep[] = [
    {
      id: 'choose-step',
      title: 'Choose the operation from the failure or objective',
      sectionLabel: 'Pipeline decisions',
      render: ({ completeStep }) => (
        <CategoryChallenge
          title="What should this pipeline do next?"
          introduction="Select the operation that follows from the evidence. More than one step may eventually be useful, but one is decisive now."
          categories={['Investigate missingness', 'Validate inconsistency', 'Normalize scale', 'Feature selection', 'Feature extraction', 'Numerosity reduction']}
          items={pipelineCases}
          storageKey="lecture-two-pipeline-cases"
          onComplete={completeStep}
        />
      ),
    },
    {
      id: 'pca-order',
      title: 'Protect the meaning of variance',
      sectionLabel: 'Transfer',
      render: ({ completeStep }) => (
        <>
          <p>
            PCA follows directions with large variance. If one feature is measured in thousands and another in small
            decimals, units can decide the first component before the data relationship does.
          </p>
          <KnowledgeCheck
            storageKey="lecture-two-pca-order"
            onCorrect={completeStep}
            question="A dataset mixes income in kroner, age in years, and a ratio between 0 and 1. What should happen before fitting PCA?"
            options={[
              {
                id: 'pca-raw',
                label: 'Fit PCA directly because principal components are automatically independent of measurement units.',
                feedback: 'PCA is driven by variance. A feature with a larger numerical scale can dominate the covariance structure.',
              },
              {
                id: 'scale-first',
                label: 'Validate the variables, then place the numeric features on a comparable scale before fitting PCA.',
                correct: true,
                feedback: 'Scaling prevents units alone from deciding which direction appears most variable. The validation step still comes first because scaling does not repair invalid data.',
              },
              {
                id: 'drop-small',
                label: 'Drop every feature whose numbers are smaller than the income values.',
                feedback: 'Numerical magnitude reflects units, not importance. A ratio can carry strong signal even though its raw values are small.',
              },
            ]}
          />
        </>
      ),
    },
  ];

  return (
    <LearningModuleLayout module={module} manualCompletion={false}>
      <LearningFlow
        storageKey="lecture-two-practice-flow"
        steps={steps}
        onFinish={() => setCompleted(module.slug, true)}
      />
    </LearningModuleLayout>
  );
}
