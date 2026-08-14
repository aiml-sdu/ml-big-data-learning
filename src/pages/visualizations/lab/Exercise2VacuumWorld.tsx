import ExerciseCard from '@/components/ExerciseCard';
import StepChallenge, { type StepDef } from '@/components/StepChallenge';
import HintPanel from '@/components/HintPanel';
import VacuumStateGraphViz from './VacuumStateGraphViz';

const steps: StepDef[] = [
  {
    id: 1,
    title: 'Explore the State Space',
    content: (onComplete) => (
      <div>
        <p className="text-sm text-muted-foreground mb-4">
          Click each state to discover its transitions. The vacuum can{' '}
          <strong>Suck</strong> dirt from the current room,{' '}
          <strong>move Left</strong>, or <strong>move Right</strong>.
        </p>
        <VacuumStateGraphViz mode="explore" onComplete={onComplete} />
        <HintPanel
          hints={[{ label: 'Hint', content: 'There are 8 states total: 2 rooms × 2 dirt states per room × 2 vacuum positions. Try to find them all.' }]}
        />
      </div>
    ),
  },
  {
    id: 2,
    title: 'Run BFS',
    content: (onComplete) => (
      <div>
        <p className="text-sm text-muted-foreground mb-4">
          Watch BFS find the shortest path from{' '}
          <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
            (A, Dirty, Dirty)
          </span>{' '}
          to{' '}
          <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
            (A, Clean, Clean)
          </span>
          . Use the controls to step through or play the animation.
        </p>
        <VacuumStateGraphViz mode="bfs" onComplete={onComplete} />
        <HintPanel
          hints={[{ label: 'Hint', content: 'BFS explores states level by level. Notice that it finds the shortest solution — Suck, Right, Suck — because it checks all 1-step paths before 2-step paths.' }]}
        />
      </div>
    ),
  },
  {
    id: 3,
    title: 'DFS Gets Stuck!',
    content: (onComplete) => (
      <div>
        <p className="text-sm text-muted-foreground mb-4">
          See what happens when DFS runs without tracking visited states.
          Play the animation and watch it revisit the same nodes over and
          over.
        </p>
        <VacuumStateGraphViz mode="dfs-loop" onComplete={onComplete} />
        <HintPanel
          hints={[{ label: 'Hint', content: 'Without a "visited" set, DFS can cycle: Left → Right → Left → Right forever. This is why graph search (with visited tracking) is important.' }]}
        />
      </div>
    ),
  },
];

export default function Exercise2VacuumWorld() {
  return (
    <ExerciseCard
      exerciseId="lab-t03-ex2"
      number={2}
      title="Vacuum World: Search in Action"
      totalSteps={3}
    >
      <StepChallenge exerciseId="lab-t03-ex2" steps={steps} />
    </ExerciseCard>
  );
}
