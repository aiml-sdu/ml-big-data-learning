import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChallengeChoice, ClusterStage, MiniFeedback, PointsLayer } from './ClusteringShared';
import { CLUSTER_COLORS, type Point } from '@/lib/clustering';

type Family = 'partitional' | 'hierarchical' | 'density';
type Scenario = {
  prompt: string;
  answer: Family;
  options: Record<Family, string>;
};

const SCENARIOS: Scenario[] = [
  {
    prompt: 'You need exactly three non-overlapping customer segments for a dashboard.',
    answer: 'partitional',
    options: {
      partitional: 'Choose K and assign every point once',
      hierarchical: 'Build nested groups first',
      density: 'Ignore K and follow dense regions',
    },
  },
  {
    prompt: 'Your professor wants to inspect coarse and fine groupings from the same data.',
    answer: 'hierarchical',
    options: {
      partitional: 'Return one flat split',
      hierarchical: 'Use a tree that can be cut at many levels',
      density: 'Only keep dense connected regions',
    },
  },
  {
    prompt: 'The data has weird shapes and scattered outliers that should become noise.',
    answer: 'density',
    options: {
      partitional: 'Force every point into K groups',
      hierarchical: 'Merge points into a tree',
      density: 'Trace dense neighborhoods and leave noise out',
    },
  },
];

const PARTITIONAL_POINTS: Point[] = [
  { id: 'p1', x: 112, y: 112 }, { id: 'p2', x: 146, y: 94 }, { id: 'p3', x: 168, y: 126 }, { id: 'p4', x: 118, y: 154 }, { id: 'p5', x: 160, y: 166 },
  { id: 'p6', x: 318, y: 100 }, { id: 'p7', x: 352, y: 126 }, { id: 'p8', x: 292, y: 148 }, { id: 'p9', x: 380, y: 162 }, { id: 'p10', x: 332, y: 178 },
  { id: 'p11', x: 486, y: 218 }, { id: 'p12', x: 528, y: 204 }, { id: 'p13', x: 552, y: 244 }, { id: 'p14', x: 502, y: 278 }, { id: 'p15', x: 544, y: 292 },
];

const HIERARCHY_POINTS: Point[] = [
  { id: 'A', x: 82, y: 242 }, { id: 'B', x: 130, y: 225 }, { id: 'C', x: 190, y: 180 },
  { id: 'D', x: 245, y: 164 }, { id: 'E', x: 318, y: 222 }, { id: 'F', x: 362, y: 198 },
];

const DENSITY_POINTS: Point[] = [
  { id: 'd1', x: 92, y: 232 }, { id: 'd2', x: 112, y: 194 }, { id: 'd3', x: 146, y: 164 }, { id: 'd4', x: 188, y: 144 },
  { id: 'd5', x: 232, y: 154 }, { id: 'd6', x: 270, y: 184 }, { id: 'd7', x: 310, y: 218 }, { id: 'd8', x: 354, y: 236 },
  { id: 'd9', x: 410, y: 214 }, { id: 'd10', x: 450, y: 184 }, { id: 'd11', x: 488, y: 156 }, { id: 'd12', x: 532, y: 132 },
];

const NOISE_POINTS: Point[] = [
  { id: 'n1', x: 132, y: 292 },
  { id: 'n2', x: 548, y: 270 },
];

function partitionalAssignments() {
  return Object.fromEntries(PARTITIONAL_POINTS.map((point, index) => [point.id, Math.floor(index / 5)]));
}

function StageTitle({ children }: { children: React.ReactNode }) {
  return (
    <text x={32} y={46} fill="var(--foreground)" fontSize={18} fontWeight={800}>
      {children}
    </text>
  );
}

function FamilySketch({ round }: { round: number }) {
  if (round === 0) {
    return (
      <>
        <StageTitle>Round 1: flat K-way partition</StageTitle>
        <PointsLayer points={PARTITIONAL_POINTS} assignments={partitionalAssignments()} radius={7.5} />
        {[
          [132, 132, 78],
          [336, 138, 84],
          [520, 248, 86],
        ].map(([x, y, r], index) => (
          <circle key={index} cx={x} cy={y} r={r} fill={CLUSTER_COLORS[index]} opacity={0.09} stroke={CLUSTER_COLORS[index]} strokeWidth={2} strokeDasharray="7 7" />
        ))}
        <text x={32} y={322} fill="var(--muted-foreground)" fontSize={13}>
          Partitional methods return one flat assignment: each point belongs to exactly one group.
        </text>
      </>
    );
  }

  if (round === 1) {
    return (
      <>
        <StageTitle>Round 2: nested hierarchy</StageTitle>
        <g opacity={0.42} stroke="var(--foreground)" strokeWidth={2}>
          <line x1={82} y1={242} x2={130} y2={225} />
          <line x1={190} y1={180} x2={245} y2={164} />
          <line x1={318} y1={222} x2={362} y2={198} />
        </g>
        <g>
          <ellipse cx={106} cy={234} rx={58} ry={38} fill={CLUSTER_COLORS[0]} opacity={0.1} />
          <ellipse cx={218} cy={172} rx={62} ry={38} fill={CLUSTER_COLORS[1]} opacity={0.1} />
          <ellipse cx={340} cy={210} rx={58} ry={38} fill={CLUSTER_COLORS[2]} opacity={0.1} />
        </g>
        <PointsLayer points={HIERARCHY_POINTS} radius={8} />
        {HIERARCHY_POINTS.map((point) => (
          <text key={`${point.id}-label`} x={point.x} y={point.y - 17} textAnchor="middle" fill="var(--foreground)" fontSize={12} fontWeight={800}>
            {point.id}
          </text>
        ))}
        <g transform="translate(392 82)" stroke="var(--foreground)" strokeWidth={3} strokeLinecap="round" fill="none">
          <line x1={8} y1={190} x2={8} y2={150} />
          <line x1={38} y1={190} x2={38} y2={150} />
          <line x1={8} y1={150} x2={38} y2={150} />
          <line x1={78} y1={190} x2={78} y2={140} />
          <line x1={108} y1={190} x2={108} y2={140} />
          <line x1={78} y1={140} x2={108} y2={140} />
          <line x1={148} y1={190} x2={148} y2={148} />
          <line x1={178} y1={190} x2={178} y2={148} />
          <line x1={148} y1={148} x2={178} y2={148} />
          <line x1={23} y1={150} x2={23} y2={92} />
          <line x1={93} y1={140} x2={93} y2={92} />
          <line x1={23} y1={92} x2={93} y2={92} />
          <line x1={58} y1={92} x2={58} y2={54} />
          <line x1={163} y1={148} x2={163} y2={54} />
          <line x1={58} y1={54} x2={163} y2={54} />
        </g>
        {['A', 'B', 'C', 'D', 'E', 'F'].map((label, index) => (
          <text key={label} x={400 + [0, 30, 70, 100, 140, 170][index]} y={292} textAnchor="middle" fill="var(--foreground)" fontSize={12} fontWeight={700}>
            {label}
          </text>
        ))}
        <text x={392} y={322} fill="var(--muted-foreground)" fontSize={12}>
          Cut height sets granularity.
        </text>
      </>
    );
  }

  return (
    <>
      <StageTitle>Round 3: dense regions plus noise</StageTitle>
      <path
        d="M92 232 C148 122, 235 118, 310 218 S462 202, 532 132"
        fill="none"
        stroke={CLUSTER_COLORS[0]}
        strokeWidth={34}
        strokeLinecap="round"
        opacity={0.13}
      />
      <path
        d="M92 232 C148 122, 235 118, 310 218 S462 202, 532 132"
        fill="none"
        stroke={CLUSTER_COLORS[0]}
        strokeWidth={4}
        strokeLinecap="round"
        opacity={0.52}
      />
      {DENSITY_POINTS.map((point) => (
        <circle key={`${point.id}-eps`} cx={point.x} cy={point.y} r={28} fill={CLUSTER_COLORS[0]} opacity={0.055} />
      ))}
      <PointsLayer points={DENSITY_POINTS} assignments={Object.fromEntries(DENSITY_POINTS.map((point) => [point.id, 0]))} radius={7.5} />
      <PointsLayer points={NOISE_POINTS} radius={7.5} muted />
      <text x={32} y={322} fill="var(--muted-foreground)" fontSize={13}>
        Density methods grow connected neighborhoods and leave isolated points as noise.
      </text>
    </>
  );
}

export default function ClusteringFamiliesGame({ onComplete }: { onComplete: () => void }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [round, setRound] = useState(0);
  const [choice, setChoice] = useState<Family | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const scenario = SCENARIOS[round];
  const correct = choice === scenario.answer;

  useEffect(() => {
    if (round === SCENARIOS.length - 1 && submitted && correct) onComplete();
  }, [correct, onComplete, round, submitted]);

  const choose = (value: Family) => {
    setChoice(value);
    setSubmitted(false);
  };

  const next = () => {
    if (!choice) return;
    setSubmitted(true);
    if (choice === scenario.answer && round < SCENARIOS.length - 1) {
      window.setTimeout(() => {
        setRound((value) => value + 1);
        setChoice(null);
        setSubmitted(false);
        requestAnimationFrame(() => {
          rootRef.current?.closest('[data-lesson-card]')?.scrollIntoView({ block: 'start' });
        });
      }, 650);
    }
  };

  return (
    <div ref={rootRef} className="space-y-5">
      <ClusterStage>
        <FamilySketch round={round} />
      </ClusterStage>

      <div className="rounded-xl border bg-card p-4 text-base font-medium">{scenario.prompt}</div>
      <div className="grid gap-3 md:grid-cols-3">
        <ChallengeChoice value="partitional" selected={choice} title="Partitional" detail={scenario.options.partitional} onSelect={choose} submitted={submitted && correct} correct={scenario.answer === 'partitional'} />
        <ChallengeChoice value="hierarchical" selected={choice} title="Hierarchical" detail={scenario.options.hierarchical} onSelect={choose} submitted={submitted && correct} correct={scenario.answer === 'hierarchical'} />
        <ChallengeChoice value="density" selected={choice} title="Density-based" detail={scenario.options.density} onSelect={choose} submitted={submitted && correct} correct={scenario.answer === 'density'} />
      </div>
      <Button size="sm" onClick={next} disabled={!choice || submitted}>
        {round === SCENARIOS.length - 1 ? 'Check' : 'Check and continue'}
      </Button>
      {submitted && (
        <MiniFeedback tone={correct ? 'good' : 'bad'} title={correct ? 'Right family' : 'Not for this scenario'}>
          {correct ? 'The algorithm family matches the structure of the task.' : 'Look at what the scenario requires: fixed K, nested levels, or dense regions with noise.'}
        </MiniFeedback>
      )}
    </div>
  );
}
