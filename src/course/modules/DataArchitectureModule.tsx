import { useMemo, useState } from 'react';
import { CategoryChallenge } from '@/components/CategoryChallenge';
import { KnowledgeCheck } from '@/components/KnowledgeCheck';
import { LearningFlow, type LearningFlowStep } from '@/components/LearningFlow';
import { LearningModuleLayout } from '@/components/LearningModuleLayout';
import type { ModulePageProps } from '@/course/types';
import { useCourseProgress } from '@/hooks/useCourseProgress';

const rates = [
  { label: '100 events/s', value: 100 },
  { label: '10 thousand/s', value: 10_000 },
  { label: '1 million/s', value: 1_000_000 },
  { label: '100 million/s', value: 100_000_000 },
  { label: '1 billion/s', value: 1_000_000_000 },
];

const windows = [
  { label: '24 hours', seconds: 86_400 },
  { label: '1 hour', seconds: 3_600 },
  { label: '1 minute', seconds: 60 },
  { label: '1 second', seconds: 1 },
  { label: '100 ms', seconds: 0.1 },
];

function ScalePressureExplorer() {
  const [rateIndex, setRateIndex] = useState(2);
  const [windowIndex, setWindowIndex] = useState(2);
  const [formats, setFormats] = useState(3);
  const rate = rates[rateIndex];
  const window = windows[windowIndex];

  const recommendation = useMemo(() => {
    if (window.seconds <= 1) {
      return {
        title: 'Streaming path',
        detail: 'Buffer events, process continuously, and write results to a store that supports immediate queries.',
      };
    }
    if (window.seconds <= 60) {
      return {
        title: 'Fast-data path',
        detail: 'A streaming or micro-batch engine can trade a small delay for simpler aggregation and recovery.',
      };
    }
    if (rate.value >= 1_000_000) {
      return {
        title: 'Distributed batch path',
        detail: 'Partition the work across a cluster and let the execution framework schedule, retry, and combine it.',
      };
    }
    return {
      title: 'Analytical warehouse path',
      detail: 'A separate OLAP system can scan and aggregate the data without competing with user-facing transactions.',
    };
  }, [rate.value, window.seconds]);

  return (
    <section className="visual-lab" aria-labelledby="scale-pressure-title">
      <div className="visual-lab-heading">
        <div>
          <p className="eyebrow">Pressure explorer</p>
          <h3 id="scale-pressure-title">Change the workload before choosing the architecture</h3>
        </div>
        <div className="live-readout" aria-live="polite">
          <span>Likely starting point</span>
          <strong>{recommendation.title}</strong>
        </div>
      </div>
      <div className="control-grid">
        <label>
          <span>Arrival rate <strong>{rate.label}</strong></span>
          <input
            aria-label="Event arrival rate"
            type="range"
            min="0"
            max={rates.length - 1}
            value={rateIndex}
            onChange={(event) => setRateIndex(Number(event.target.value))}
          />
          <small>Higher rates increase storage and parallel-processing pressure.</small>
        </label>
        <label>
          <span>Decision window <strong>{window.label}</strong></span>
          <input
            aria-label="Decision window"
            type="range"
            min="0"
            max={windows.length - 1}
            value={windowIndex}
            onChange={(event) => setWindowIndex(Number(event.target.value))}
          />
          <small>Move right to require a result sooner.</small>
        </label>
        <label>
          <span>Data forms <strong>{formats}</strong></span>
          <input
            aria-label="Number of data forms"
            type="range"
            min="1"
            max="6"
            value={formats}
            onChange={(event) => setFormats(Number(event.target.value))}
          />
          <small>Tables, text, graphs, sensor streams, and media add integration work.</small>
        </label>
      </div>
      <div className="pressure-result" aria-live="polite">
        <div><span>Volume pressure</span><strong>{rateIndex >= 3 ? 'high' : rateIndex >= 1 ? 'medium' : 'low'}</strong></div>
        <div><span>Velocity pressure</span><strong>{windowIndex >= 3 ? 'high' : windowIndex >= 1 ? 'medium' : 'low'}</strong></div>
        <div><span>Variety pressure</span><strong>{formats >= 5 ? 'high' : formats >= 3 ? 'medium' : 'low'}</strong></div>
        <p>{recommendation.detail}</p>
      </div>
    </section>
  );
}

const architectureCases = [
  {
    id: 'bank-transfer',
    prompt: 'A banking service must update one account balance and confirm the transaction immediately for many concurrent users.',
    answer: 'OLTP',
    explanation:
      'This is a small, user-facing transaction with random reads and writes. Low latency and concurrency matter more than scanning the full history.',
  },
  {
    id: 'quarterly-report',
    prompt: 'An analyst scans five years of sales to compare total units by country and brand. The query is complex but does not update orders.',
    answer: 'OLAP warehouse',
    explanation:
      'The task scans and aggregates a large amount of historical data. Keeping it in an analytical system prevents it from competing with live transactions.',
  },
  {
    id: 'etl-overrun',
    prompt: 'A nightly ETL job needs more than 24 hours to process one day of new logs, and the input can be split into independent partitions.',
    answer: 'Distributed batch',
    explanation:
      'The deadline is measured in hours and the work can be partitioned. A distributed batch framework can add workers, retry failed tasks, and combine partial results.',
  },
  {
    id: 'fraud-alert',
    prompt: 'A payment must be flagged within 200 milliseconds while events continue to arrive.',
    answer: 'Streaming and real-time',
    explanation:
      'The value of the decision disappears if it waits for a nightly batch. A streaming path buffers events, processes them continuously, and exposes recent results quickly.',
  },
];

export default function DataArchitectureModule({ module }: ModulePageProps) {
  const { setCompleted } = useCourseProgress();

  const steps: LearningFlowStep[] = [
    {
      id: 'change-pressure',
      title: 'Big data changes the decision, not only the storage bill',
      sectionLabel: 'Explore the pressure',
      autoComplete: true,
      render: () => (
        <>
          <p>
            A large table is not the only reason an architecture changes. Many data forms increase integration work.
            Short decision windows turn yesterday's correct answer into today's missed opportunity. Analytical scans can
            also interfere with the transactions that keep a service running.
          </p>
          <ScalePressureExplorer />
        </>
      ),
    },
    {
      id: 'match-workload',
      title: 'Match the workload before naming a product',
      sectionLabel: 'Choose an architecture',
      render: ({ completeStep }) => (
        <CategoryChallenge
          title="What kind of work must the system perform?"
          introduction="Choose the workload pattern that should guide the first architecture decision."
          categories={['OLTP', 'OLAP warehouse', 'Distributed batch', 'Streaming and real-time']}
          items={architectureCases}
          storageKey="data-architecture-cases"
          onComplete={completeStep}
        />
      ),
    },
    {
      id: 'separate-what-how',
      title: 'The useful abstraction separates what from how',
      sectionLabel: 'Transfer the idea',
      render: ({ completeStep }) => (
        <>
          <p>
            Parallel work becomes difficult when workers fail, finish in an unknown order, or need to combine partial
            results. The developer should describe the computation. The runtime should decide where tasks run, notice
            failures, repeat work when needed, and assemble the result.
          </p>
          <KnowledgeCheck
            storageKey="data-architecture-transfer"
            onCorrect={completeStep}
            question="Which responsibility belongs to a distributed execution framework rather than the analyst's computation?"
            options={[
              {
                id: 'define-metric',
                label: 'Define which business metric the analysis should calculate.',
                feedback: 'The analyst owns the meaning of the computation and the result it should produce.',
              },
              {
                id: 'retry-worker',
                label: 'Reschedule a partition when a worker fails and combine the surviving partial results.',
                correct: true,
                feedback: 'Scheduling, failure recovery, and aggregation are system-level details that the runtime can hide behind a stable computation model.',
              },
              {
                id: 'choose-question',
                label: 'Decide whether the original question requires a batch answer or a 200 millisecond alert.',
                feedback: 'Latency is part of the problem definition. The framework can execute the choice, but it cannot decide the value of a late answer.',
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
        storageKey="data-architecture-flow"
        steps={steps}
        onFinish={() => setCompleted(module.slug, true)}
      />
    </LearningModuleLayout>
  );
}
