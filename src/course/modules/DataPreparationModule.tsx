import { useState } from 'react';
import { CategoryChallenge } from '@/components/CategoryChallenge';
import { KnowledgeCheck } from '@/components/KnowledgeCheck';
import { LearningFlow, type LearningFlowStep } from '@/components/LearningFlow';
import { LearningModuleLayout } from '@/components/LearningModuleLayout';
import type { ModulePageProps } from '@/course/types';
import { useCourseProgress } from '@/hooks/useCourseProgress';

const MIN_INCOME = 12_000;
const MAX_INCOME = 98_000;
const MEAN_INCOME = 54_000;
const INCOME_SD = 16_000;

function ScalingExplorer() {
  const [income, setIncome] = useState(73_000);
  const minMax = (income - MIN_INCOME) / (MAX_INCOME - MIN_INCOME);
  const zScore = (income - MEAN_INCOME) / INCOME_SD;

  return (
    <section className="visual-lab" aria-labelledby="scaling-title">
      <div className="visual-lab-heading">
        <div>
          <p className="eyebrow">Transformation explorer</p>
          <h3 id="scaling-title">The same value can answer two different questions</h3>
        </div>
        <div className="live-readout" aria-live="polite">
          <span>Income</span>
          <strong>${income.toLocaleString()}</strong>
        </div>
      </div>
      <div className="control-grid single-control">
        <label>
          <span>Observed income <strong>${income.toLocaleString()}</strong></span>
          <input
            aria-label="Observed income"
            type="range"
            min={MIN_INCOME}
            max={MAX_INCOME}
            step="1000"
            value={income}
            onChange={(event) => setIncome(Number(event.target.value))}
          />
          <small>Source range: $12,000 to $98,000. Mean: $54,000. Standard deviation: $16,000.</small>
        </label>
      </div>
      <div className="scale-comparison" aria-live="polite">
        <div>
          <span>Min-max position</span>
          <strong>{minMax.toFixed(3)}</strong>
          <p>{Math.round(minMax * 100)}% of the way from the observed minimum to the observed maximum.</p>
        </div>
        <div>
          <span>Z-score</span>
          <strong>{zScore.toFixed(2)}</strong>
          <p>{Math.abs(zScore).toFixed(2)} standard deviations {zScore >= 0 ? 'above' : 'below'} the mean.</p>
        </div>
      </div>
      <p className="formula-strip">
        <span>Min-max</span><strong>({income.toLocaleString()} - 12,000) / 86,000</strong>
        <span>Z-score</span><strong>({income.toLocaleString()} - 54,000) / 16,000</strong>
      </p>
    </section>
  );
}

const qualityCases = [
  {
    id: 'blank-occupation',
    prompt: 'A customer record has an empty occupation field because the question did not apply at collection time.',
    answer: 'Missing',
    explanation:
      'The value is absent. The next decision is whether the reason for missingness matters, whether to keep a missing indicator, and whether an estimate is defensible.',
  },
  {
    id: 'negative-salary',
    prompt: 'A salary field contains -10 even though the domain permits only non-negative values.',
    answer: 'Invalid or noisy',
    explanation:
      'The value violates a domain rule. Replacing it with a scaled number would hide the problem rather than clean it.',
  },
  {
    id: 'age-birthday-conflict',
    prompt: 'One row says age 42 and birth year 1997. Both fields cannot be correct for the same reference date.',
    answer: 'Inconsistent',
    explanation:
      'Two attributes that should agree conflict. Resolve the source of truth and reference date before deriving or imputing a value.',
  },
  {
    id: 'duplicate-order',
    prompt: 'The same order identifier, customer, time, and amount appear twice after two databases are joined.',
    answer: 'Duplicate or redundant',
    explanation:
      'Integration has repeated the same event. Leaving both rows would inflate totals and change statistics.',
  },
];

export default function DataPreparationModule({ module }: ModulePageProps) {
  const { setCompleted } = useCourseProgress();

  const steps: LearningFlowStep[] = [
    {
      id: 'diagnose',
      title: 'Name the failure before choosing the fix',
      sectionLabel: 'Diagnose',
      render: ({ completeStep }) => (
        <>
          <p>
            Data cleaning is not one operation. A blank value, a measurement error, a contradiction, and a duplicate
            row can all distort a model, but they need different evidence and different remedies.
          </p>
          <CategoryChallenge
            title="What failed in this record?"
            introduction="Choose the diagnosis that should guide the next investigation."
            categories={['Missing', 'Invalid or noisy', 'Inconsistent', 'Duplicate or redundant']}
            items={qualityCases}
            storageKey="data-quality-diagnosis"
            onComplete={completeStep}
          />
        </>
      ),
    },
    {
      id: 'scale',
      title: 'Scaling changes representation, not meaning',
      sectionLabel: 'Transform',
      render: ({ completeStep }) => (
        <>
          <p>
            Min-max normalization reports position inside an observed range. A z-score reports distance from the mean
            in standard-deviation units. Both can help models compare features, but neither repairs an impossible or
            contradictory value.
          </p>
          <ScalingExplorer />
          <KnowledgeCheck
            storageKey="normalization-transfer"
            onCorrect={completeStep}
            question="Using the source range $12,000 to $98,000, what min-max value does $98,000 receive on the interval [0, 1]?"
            options={[
              {
                id: 'range-one',
                label: '1.0',
                correct: true,
                feedback: 'The observed maximum sits at the top of the interval: (98,000 - 12,000) / (98,000 - 12,000) = 1.',
              },
              {
                id: 'z-two-seven-five',
                label: '2.75',
                feedback: '2.75 is the z-score relative to a mean of 54,000 and standard deviation of 16,000. It is not the min-max position.',
              },
              {
                id: 'raw-ratio',
                label: '0.88',
                feedback: 'Dividing by the maximum ignores the lower bound. Min-max scaling first subtracts the observed minimum.',
              },
            ]}
          />
        </>
      ),
    },
    {
      id: 'order-decisions',
      title: 'A transformation cannot rescue a broken definition',
      sectionLabel: 'Transfer',
      render: ({ completeStep }) => (
        <KnowledgeCheck
          storageKey="data-preparation-transfer"
          onCorrect={completeStep}
          question="A pipeline finds salary = -10 and a missing occupation, then immediately normalizes every numeric column. What should happen first?"
          options={[
            {
              id: 'normalize-first',
              label: 'Normalize first because small numeric ranges make errors easier to detect.',
              feedback: 'Scaling would transform the invalid salary into another number and could hide the domain violation.',
            },
            {
              id: 'diagnose-first',
              label: 'Validate the salary rule and investigate the missingness before choosing cleaning and scaling steps.',
              correct: true,
              feedback: 'Diagnosis determines whether a value is wrong, absent for a reason, or informative as missing. Transformation comes after that decision.',
            },
            {
              id: 'drop-row',
              label: 'Drop every row containing any missing or invalid field.',
              feedback: 'Dropping can be defensible, but doing it automatically can remove systematic groups and create bias. The cause and downstream task matter.',
            },
          ]}
        />
      ),
    },
  ];

  return (
    <LearningModuleLayout module={module} manualCompletion={false}>
      <LearningFlow
        storageKey="data-preparation-flow"
        steps={steps}
        onFinish={() => setCompleted(module.slug, true)}
      />
    </LearningModuleLayout>
  );
}
