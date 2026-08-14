import StepChallenge, { type StepDef } from '@/components/StepChallenge';
import RegressionMultipleChoiceStep from './RegressionMultipleChoiceStep';

interface Exercise3FitDiagnosisProps {
  onComplete?: () => void;
}

export default function Exercise3FitDiagnosis({ onComplete }: Exercise3FitDiagnosisProps) {
  const steps: StepDef[] = [
    {
      id: 1,
      title: 'Find the underfit model',
      content: (markStepComplete) => (
        <RegressionMultipleChoiceStep
          prompt="In the polynomial demo, which model is underfitting the curved MedInc → house value pattern?"
          choices={[
            {
              label: 'Degree 1 straight line',
              correct: true,
              explanation: 'Correct. A straight line is too simple for the curved pattern in the notebook.',
            },
            {
              label: 'Degree 3 gentle curve',
              correct: false,
              explanation: 'Degree 3 is the notebook’s good-fit example, not the underfit one.',
            },
            {
              label: 'Degree 10 wiggly curve',
              correct: false,
              explanation: 'Degree 10 is flexible enough to overfit, not underfit.',
            },
          ]}
          onComplete={markStepComplete}
        />
      ),
    },
    {
      id: 2,
      title: 'Find the balanced model',
      content: (markStepComplete) => (
        <RegressionMultipleChoiceStep
          prompt="Which choice best represents the notebook’s good fit?"
          choices={[
            {
              label: 'A gentle degree 2–3 curve that follows the trend',
              correct: true,
              explanation: 'Correct. The best-fit model captures the broad curve without chasing every point.',
            },
            {
              label: 'The flattest possible line',
              correct: false,
              explanation: 'That misses the shape of the data and underfits.',
            },
            {
              label: 'A curve that twists sharply through individual points',
              correct: false,
              explanation: 'That is the overfit behavior the notebook warns against.',
            },
          ]}
          onComplete={markStepComplete}
        />
      ),
    },
    {
      id: 3,
      title: 'Spot the overfitting signal',
      content: (markStepComplete) => (
        <RegressionMultipleChoiceStep
          prompt="Which train/test pattern is the clearest overfitting warning?"
          choices={[
            {
              label: 'Train R² is very high but test R² gets worse',
              correct: true,
              explanation: 'Correct. A growing train/test gap means the model is fitting noise instead of the underlying pattern.',
            },
            {
              label: 'Train and test R² improve together',
              correct: false,
              explanation: 'That is what we want: better fit without losing generalization.',
            },
            {
              label: 'Both train and test R² stay low',
              correct: false,
              explanation: 'That points to underfitting, not overfitting.',
            },
          ]}
          onComplete={markStepComplete}
        />
      ),
    },
  ];

  return (
    <div>
      <p className="mb-3 text-sm text-muted-foreground">
        Use the same degree-1, degree-3, and degree-10 story from the notebook to diagnose underfitting and overfitting.
      </p>
      <StepChallenge exerciseId="lab10-ex3" steps={steps} onAllComplete={onComplete} />
    </div>
  );
}
