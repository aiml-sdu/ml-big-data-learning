import StepChallenge, { type StepDef } from '@/components/StepChallenge';
import RegressionMultipleChoiceStep from './RegressionMultipleChoiceStep';

interface Exercise1HousingExploreProps {
  onComplete?: () => void;
}

export default function Exercise1HousingExplore({ onComplete }: Exercise1HousingExploreProps) {
  const steps: StepDef[] = [
    {
      id: 1,
      title: 'Pick the target',
      content: (markStepComplete) => (
        <RegressionMultipleChoiceStep
          prompt="In the California housing notebook, what are we trying to predict?"
          choices={[
            {
              label: 'Median house value',
              correct: true,
              explanation: 'Correct. The regression target is median house value for each California block group.',
            },
            {
              label: 'Latitude',
              correct: false,
              explanation: 'Latitude is an input feature, not the target we want the model to predict.',
            },
            {
              label: 'Population',
              correct: false,
              explanation: 'Population is also an input feature. The notebook predicts value, not headcount.',
            },
          ]}
          onComplete={markStepComplete}
        />
      ),
    },
    {
      id: 2,
      title: 'Spot the strongest feature',
      content: (markStepComplete) => (
        <RegressionMultipleChoiceStep
          prompt="Which single feature is the strongest standalone predictor in Lab 1?"
          choices={[
            {
              label: 'MedInc',
              correct: true,
              explanation: 'Correct. Median income has the clearest relationship with house value, so it becomes the single-feature baseline.',
            },
            {
              label: 'HouseAge',
              correct: false,
              explanation: 'House age matters, but it is much weaker than median income in this dataset.',
            },
            {
              label: 'AveBedrms',
              correct: false,
              explanation: 'Average bedrooms is not the strongest single predictor in the notebook.',
            },
          ]}
          onComplete={markStepComplete}
        />
      ),
    },
    {
      id: 3,
      title: 'Read the map',
      content: (markStepComplete) => (
        <RegressionMultipleChoiceStep
          prompt="What geographic pattern does the notebook emphasize when plotting price by longitude and latitude?"
          choices={[
            {
              label: 'Coastal areas have the highest prices',
              correct: true,
              explanation: 'Correct. The Bay Area and Los Angeles coastline stand out immediately, which shows location is a major signal.',
            },
            {
              label: 'Northern inland areas are always the most expensive',
              correct: false,
              explanation: 'That is the opposite of what the map shows. Inland regions are generally cheaper than the coast.',
            },
            {
              label: 'Price is unrelated to geography',
              correct: false,
              explanation: 'The map is there to show the opposite: geography matters a lot.',
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
        Mirror the first part of `lab1-regression`: inspect the target, the strongest feature, and the map-level pattern.
      </p>
      <StepChallenge exerciseId="lab10-ex1" steps={steps} onAllComplete={onComplete} />
    </div>
  );
}
