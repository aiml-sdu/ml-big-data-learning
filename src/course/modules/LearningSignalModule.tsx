import { CategoryChallenge } from '@/components/CategoryChallenge';
import { KnowledgeCheck } from '@/components/KnowledgeCheck';
import { LearningFlow, type LearningFlowStep } from '@/components/LearningFlow';
import { LearningModuleLayout } from '@/components/LearningModuleLayout';
import type { ModulePageProps } from '@/course/types';
import { useCourseProgress } from '@/hooks/useCourseProgress';

const signalCases = [
  {
    id: 'rent-price',
    prompt: 'A model sees apartment features paired with the rent that each apartment achieved. It must predict rent for a new listing.',
    answer: 'Supervised',
    explanation:
      'Each example includes the target value. The model learns a mapping from apartment features to a continuous rent, so this is supervised regression.',
  },
  {
    id: 'customer-groups',
    prompt: 'A retailer has purchase histories but no segment labels. It wants to discover groups of customers with similar behaviour.',
    answer: 'Unsupervised',
    explanation:
      'No target group is supplied. The task asks the model to expose structure in unlabeled data, which is the role of unsupervised learning.',
  },
  {
    id: 'warehouse-policy',
    prompt: 'A warehouse robot chooses a movement, observes the next state, and receives a reward for fast, collision-free delivery.',
    answer: 'Reinforcement',
    explanation:
      'The learning signal is a reward produced after an action. The robot must connect choices over time to later consequences.',
  },
  {
    id: 'masked-text',
    prompt: 'A language model hides words in raw text and learns to reconstruct them before it is adapted to a labelled task.',
    answer: 'Self-supervised',
    explanation:
      'The target is constructed from the data itself. The text supplies both the input context and the word to recover, so no manual label is needed for pretraining.',
  },
];

export default function LearningSignalModule({ module }: ModulePageProps) {
  const { setCompleted } = useCourseProgress();

  const steps: LearningFlowStep[] = [
    {
      id: 'find-signal',
      title: 'Start with the evidence, not the application',
      sectionLabel: 'Frame the learning problem',
      autoComplete: true,
      render: () => (
        <>
          <p>
            Four teams can all say they are building an intelligent system. That description does not tell us how the
            system learns. First ask what information reaches the model while it is learning.
          </p>
          <div className="signal-board" aria-label="Three learning signals">
            <div>
              <span className="signal-number">01</span>
              <h3>Paired answers</h3>
              <p>Inputs arrive with the value or class the model should learn to predict.</p>
              <strong>Supervised learning</strong>
            </div>
            <div>
              <span className="signal-number">02</span>
              <h3>Structure in examples</h3>
              <p>The data has no supplied answer, so the model looks for patterns, groups, or a data distribution.</p>
              <strong>Unsupervised learning</strong>
            </div>
            <div>
              <span className="signal-number">03</span>
              <h3>Consequences of actions</h3>
              <p>An agent acts, reaches another state, and receives a reward that may arrive later.</p>
              <strong>Reinforcement learning</strong>
            </div>
          </div>
          <p>
            Self-supervised learning uses a useful variation on the second case. It creates a target from the data
            itself, such as hiding a word and asking the model to reconstruct it.
          </p>
        </>
      ),
    },
    {
      id: 'classify-signal',
      title: 'Which signal is doing the teaching?',
      sectionLabel: 'Make the distinction',
      render: ({ completeStep }) => (
        <CategoryChallenge
          title="Read the evidence before naming the method"
          introduction="Classify each task from the information available during learning. The industry or model architecture is a distraction unless it changes that signal."
          categories={['Supervised', 'Unsupervised', 'Reinforcement', 'Self-supervised']}
          items={signalCases}
          storageKey="learning-signal-cases"
          onComplete={completeStep}
        />
      ),
    },
    {
      id: 'read-output',
      title: 'Now inspect the shape of the answer',
      sectionLabel: 'Transfer the rule',
      render: ({ completeStep }) => (
        <>
          <p>
            After you identify supervised learning, ask what the paired answer looks like. A continuous number is a
            regression target. A discrete category is a classification target. One output is univariate. Many outputs
            make the problem multivariate.
          </p>
          <div className="output-contrast" aria-label="Output type comparison">
            <div><span>Continuous</span><strong>Regression</strong><small>rent, temperature, depth</small></div>
            <div><span>Discrete</span><strong>Classification</strong><small>spam, genre, land-cover class</small></div>
            <div><span>Many at once</span><strong>Multivariate</strong><small>one prediction for every pixel</small></div>
          </div>
          <KnowledgeCheck
            storageKey="learning-signal-transfer"
            onCorrect={completeStep}
            question="A satellite model is trained on images paired with a land-cover class for every pixel. What output is it learning?"
            options={[
              {
                id: 'single-image-class',
                label: 'One class for the entire image.',
                feedback:
                  'That would be univariate image classification. Here the training data supplies a separate class for every pixel.',
              },
              {
                id: 'continuous-depth-map',
                label: 'A continuous depth value for every pixel.',
                feedback:
                  'Many continuous pixel values would form multivariate regression. Land-cover labels are discrete categories.',
              },
              {
                id: 'pixel-class-map',
                label: 'One discrete class for each pixel.',
                correct: true,
                feedback:
                  'The task is supervised because labelled outputs are paired with each image. It is multivariate classification because it predicts many discrete pixel classes.',
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
        storageKey="choose-learning-signal-flow"
        steps={steps}
        onFinish={() => setCompleted(module.slug, true)}
      />
    </LearningModuleLayout>
  );
}
