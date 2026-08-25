import { useMemo, useState } from 'react';
import { CategoryChallenge } from '@/components/CategoryChallenge';
import { KnowledgeCheck } from '@/components/KnowledgeCheck';
import { LearningFlow, type LearningFlowStep } from '@/components/LearningFlow';
import { LearningModuleLayout } from '@/components/LearningModuleLayout';
import type { ModulePageProps } from '@/course/types';
import { useCourseProgress } from '@/hooks/useCourseProgress';

function DimensionExplorer() {
  const [dimensions, setDimensions] = useState(3);
  const binsPerFeature = 3;
  const regions = binsPerFeature ** dimensions;
  const samples = 10_000;
  const samplesPerRegion = samples / regions;

  return (
    <section className="visual-lab" aria-labelledby="dimension-title">
      <div className="visual-lab-heading">
        <div>
          <p className="eyebrow">Dimension explorer</p>
          <h3 id="dimension-title">Adding one feature multiplies the space</h3>
        </div>
        <div className="live-readout" aria-live="polite">
          <span>Regions at 3 bins per feature</span>
          <strong>{regions.toLocaleString()}</strong>
        </div>
      </div>
      <div className="control-grid single-control">
        <label>
          <span>Number of features <strong>{dimensions}</strong></span>
          <input
            aria-label="Number of features"
            type="range"
            min="1"
            max="8"
            value={dimensions}
            onChange={(event) => setDimensions(Number(event.target.value))}
          />
          <small>Each feature adds another direction that must be covered by examples.</small>
        </label>
      </div>
      <div className="dimension-readout" aria-live="polite">
        <div><span>Space</span><strong>3^{dimensions} = {regions.toLocaleString()}</strong></div>
        <div><span>With 10,000 examples</span><strong>{samplesPerRegion.toFixed(samplesPerRegion < 1 ? 2 : 1)} per region</strong></div>
        <p>
          The data has not disappeared. It has been spread across exponentially more combinations, so neighbourhoods
          become sparse and a model needs more evidence to estimate them reliably.
        </p>
      </div>
    </section>
  );
}

const representationCases = [
  {
    id: 'keep-three-columns',
    prompt: 'Keep A1, A4, and A6 from the original six variables and discard the others.',
    answer: 'Feature selection',
    explanation: 'The representation keeps a subset of the original variables. No new axis is constructed.',
  },
  {
    id: 'principal-components',
    prompt: 'Replace 40 correlated measurements with five linear combinations that retain most of their variation.',
    answer: 'Feature extraction',
    explanation: 'The five components are new features constructed from the original measurements.',
  },
  {
    id: 'histogram-buckets',
    prompt: 'Divide a large numeric dataset into buckets and store one count or average per bucket.',
    answer: 'Numerosity reduction',
    explanation: 'The method stores a smaller summary representation of the records rather than a subset or new feature axis.',
  },
  {
    id: 'cluster-centroids',
    prompt: 'Store a centroid and spread for each cluster instead of every original record.',
    answer: 'Numerosity reduction',
    explanation: 'A compact set of prototypes stands in for many records. This reduces the number of represented objects.',
  },
];

const pcaPoints = [
  { x: -3.2, y: -2.1 }, { x: -2.5, y: -1.6 }, { x: -1.8, y: -1.4 }, { x: -1.2, y: -0.6 },
  { x: -0.4, y: -0.5 }, { x: 0.4, y: 0.3 }, { x: 1.1, y: 0.9 }, { x: 1.8, y: 1.0 },
  { x: 2.5, y: 1.9 }, { x: 3.2, y: 2.2 },
];

function PCAProjectionExplorer() {
  const [angle, setAngle] = useState(30);
  const mean = useMemo(() => ({
    x: pcaPoints.reduce((sum, point) => sum + point.x, 0) / pcaPoints.length,
    y: pcaPoints.reduce((sum, point) => sum + point.y, 0) / pcaPoints.length,
  }), []);
  const centered = useMemo(() => pcaPoints.map((point) => ({ x: point.x - mean.x, y: point.y - mean.y })), [mean]);
  const radians = angle * Math.PI / 180;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  const projected = centered.map((point) => {
    const score = point.x * cos + point.y * sin;
    return { ...point, score, px: score * cos, py: score * sin };
  });
  const projectedVariance = projected.reduce((sum, point) => sum + point.score ** 2, 0) / projected.length;
  const totalVariance = centered.reduce((sum, point) => sum + point.x ** 2 + point.y ** 2, 0) / centered.length;
  const retained = Math.min(100, projectedVariance / totalVariance * 100);
  const bestAngle = useMemo(() => {
    let best = { angle: 0, variance: -1 };
    for (let candidate = 0; candidate < 180; candidate += 1) {
      const rad = candidate * Math.PI / 180;
      const variance = centered.reduce((sum, point) => {
        const score = point.x * Math.cos(rad) + point.y * Math.sin(rad);
        return sum + score ** 2;
      }, 0) / centered.length;
      if (variance > best.variance) best = { angle: candidate, variance };
    }
    return best.angle;
  }, [centered]);

  const sx = (value: number) => 210 + value * 42;
  const sy = (value: number) => 140 - value * 42;

  return (
    <section className="visual-lab" aria-labelledby="pca-title">
      <div className="visual-lab-heading">
        <div>
          <p className="eyebrow">Projection explorer</p>
          <h3 id="pca-title">Rotate one axis and watch how much spread it keeps</h3>
        </div>
        <div className="live-readout" aria-live="polite">
          <span>Variance retained</span>
          <strong>{retained.toFixed(1)}%</strong>
        </div>
      </div>
      <div className="control-grid single-control">
        <label>
          <span>Projection direction <strong>{angle}°</strong></span>
          <input
            aria-label="Projection direction in degrees"
            type="range"
            min="0"
            max="179"
            value={angle}
            onChange={(event) => setAngle(Number(event.target.value))}
          />
          <small>The strongest direction for this dataset is near {bestAngle}°.</small>
        </label>
      </div>
      <div className="chart-frame">
        <svg viewBox="0 0 420 280" role="img" aria-labelledby="pca-chart-title pca-chart-desc">
          <title id="pca-chart-title">Points projected onto a rotating one-dimensional axis</title>
          <desc id="pca-chart-desc">The axis is at {angle} degrees and retains {retained.toFixed(1)} percent of total variance. Dashed lines connect each point to its projection.</desc>
          <line className="chart-axis" x1="30" x2="390" y1="140" y2="140" />
          <line className="chart-axis" x1="210" x2="210" y1="20" y2="260" />
          <line className="pca-axis" x1={sx(-4 * cos)} y1={sy(-4 * sin)} x2={sx(4 * cos)} y2={sy(4 * sin)} />
          {projected.map((point, index) => (
            <g key={`${point.x}-${point.y}`}>
              <line className="pca-guide" x1={sx(point.x)} y1={sy(point.y)} x2={sx(point.px)} y2={sy(point.py)} />
              <circle className="pca-projection" cx={sx(point.px)} cy={sy(point.py)} r="4" />
              <circle className="pca-point" cx={sx(point.x)} cy={sy(point.y)} r="6" aria-label={`Data point ${index + 1}`} />
            </g>
          ))}
        </svg>
      </div>
      <p className="formula-strip">
        <span>High retained variance</span><strong>more of the data's spread survives in one dimension</strong>
      </p>
    </section>
  );
}

export default function FeatureSpaceModule({ module }: ModulePageProps) {
  const { setCompleted } = useCourseProgress();

  const steps: LearningFlowStep[] = [
    {
      id: 'sparsity',
      title: 'More features create more places where data could be',
      sectionLabel: 'See the curse',
      autoComplete: true,
      render: () => (
        <>
          <p>
            If every feature is divided into three useful ranges, one feature creates three regions. Two features
            create nine. Eight features create 6,561. The number of examples has to grow quickly if every region should
            contain enough evidence.
          </p>
          <DimensionExplorer />
        </>
      ),
    },
    {
      id: 'choose-reduction',
      title: 'Selection and extraction change different things',
      sectionLabel: 'Choose a representation',
      render: ({ completeStep }) => (
        <CategoryChallenge
          title="What became smaller?"
          introduction="Decide whether the method keeps original variables, constructs new variables, or summarizes records."
          categories={['Feature selection', 'Feature extraction', 'Numerosity reduction']}
          items={representationCases}
          storageKey="feature-reduction-cases"
          onComplete={completeStep}
        />
      ),
    },
    {
      id: 'pca-direction',
      title: 'PCA keeps the direction with the strongest variation',
      sectionLabel: 'Project',
      render: ({ completeStep }) => (
        <>
          <p>
            A one-dimensional projection replaces each point with its position on one axis. PCA chooses the axis that
            keeps the largest possible variation. For centred data, that is also the direction that loses the least
            squared distance during projection.
          </p>
          <PCAProjectionExplorer />
          <KnowledgeCheck
            storageKey="pca-transfer"
            onCorrect={completeStep}
            question="Why does PCA prefer the direction with the greatest projected variance?"
            options={[
              {
                id: 'largest-scale',
                label: 'Because the feature with the largest original unit must always become the first component.',
                feedback: 'Units can dominate if data is not scaled, which is why preprocessing matters. PCA itself uses covariance structure, not a rule that one original feature must win.',
              },
              {
                id: 'retain-spread',
                label: 'Because that direction preserves the most spread and therefore minimises squared projection loss for centred data.',
                correct: true,
                feedback: 'The first principal component is the unit direction with the largest projected variance. Keeping it retains the strongest linear pattern in one dimension.',
              },
              {
                id: 'separate-labels',
                label: 'Because the direction is chosen to separate known class labels as far as possible.',
                feedback: 'PCA does not use class labels. A supervised method such as linear discriminant analysis uses label separation as its objective.',
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
        storageKey="feature-space-flow"
        steps={steps}
        onFinish={() => setCompleted(module.slug, true)}
      />
    </LearningModuleLayout>
  );
}
