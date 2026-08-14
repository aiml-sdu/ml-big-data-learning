import StepChallenge, { type StepDef } from '@/components/StepChallenge';
import RegressionMultipleChoiceStep from './RegressionMultipleChoiceStep';

interface Exercise2SimpleVsMultipleRegressionProps {
  onComplete?: () => void;
}

export default function Exercise2SimpleVsMultipleRegression({
  onComplete,
}: Exercise2SimpleVsMultipleRegressionProps) {
  const steps: StepDef[] = [
    {
      id: 1,
      title: 'Hold out evaluation data',
      content: (markStepComplete) => (
        <RegressionMultipleChoiceStep
          prompt="Which split do we keep untouched until evaluation?"
          choices={[
            {
              label: 'Test set',
              correct: true,
              explanation: 'Correct. The test set stays hidden during fitting so it can estimate performance on unseen data.',
            },
            {
              label: 'Training set',
              correct: false,
              explanation: 'The training set is the part we fit on, so it cannot serve as an unbiased final check.',
            },
            {
              label: 'The full dataset',
              correct: false,
              explanation: 'Using everything for both fitting and evaluation hides generalization errors.',
            },
          ]}
          onComplete={markStepComplete}
        />
      ),
    },
    {
      id: 2,
      title: 'Compare model strength',
      content: (markStepComplete) => (
        <RegressionMultipleChoiceStep
          prompt="Which statement matches the notebook results?"
          choices={[
            {
              label: 'The 8-feature model improves R² from about 0.47 to about 0.61',
              correct: true,
              explanation: 'Correct. Adding the other features gives the model more predictive signal than MedInc alone.',
            },
            {
              label: 'The single-feature model beats the 8-feature model by a wide margin',
              correct: false,
              explanation: 'The notebook shows the opposite: the multiple regression model performs better on test R².',
            },
            {
              label: 'Both models always achieve R² very close to 1.0',
              correct: false,
              explanation: 'Real housing data is noisy. Neither model is anywhere near perfect.',
            },
          ]}
          onComplete={markStepComplete}
        />
      ),
    },
    {
      id: 3,
      title: 'Interpret the coefficients',
      content: (markStepComplete) => (
        <RegressionMultipleChoiceStep
          prompt="Which coefficient interpretation is consistent with the lab?"
          choices={[
            {
              label: 'Higher MedInc pushes the prediction up the most',
              correct: true,
              explanation: 'Correct. MedInc is the strongest positive driver in the coefficient table.',
            },
            {
              label: 'Latitude is the strongest positive driver',
              correct: false,
              explanation: 'Latitude is discussed as a negative effect in the notebook, not the strongest positive one.',
            },
            {
              label: 'Coefficients cannot tell us direction of change',
              correct: false,
              explanation: 'In linear regression, the sign and size of each weight tell us direction and strength, assuming the feature scale is understood.',
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
        Stay close to the notebook: compare a one-feature baseline, then read what the full 8-feature model changes.
      </p>
      <StepChallenge exerciseId="lab10-ex2" steps={steps} onAllComplete={onComplete} />
    </div>
  );
}
