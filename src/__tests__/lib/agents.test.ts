import {
  simpleReflexAgent,
  ModelBasedAgent,
  GoalBasedAgent,
  UtilityBasedAgent,
  runSimulation,
  type VacuumState,
} from '@/lib/agents';

describe('simpleReflexAgent', () => {
  test('dirty → Suck', () => {
    expect(simpleReflexAgent({ location: 'A', dirty: true }).action).toBe('Suck');
    expect(simpleReflexAgent({ location: 'B', dirty: true }).action).toBe('Suck');
  });

  test('clean A → Right', () => {
    expect(simpleReflexAgent({ location: 'A', dirty: false }).action).toBe('Right');
  });

  test('clean B → Left', () => {
    expect(simpleReflexAgent({ location: 'B', dirty: false }).action).toBe('Left');
  });
});

describe('ModelBasedAgent', () => {
  test('dirty A → Suck, then moves to B, B clean → NoOp', () => {
    const agent = new ModelBasedAgent();
    expect(agent.act({ location: 'A', dirty: true }).action).toBe('Suck');
    expect(agent.act({ location: 'A', dirty: false }).action).toBe('Right');
    expect(agent.act({ location: 'B', dirty: false }).action).toBe('NoOp');
  });
});

describe('GoalBasedAgent', () => {
  test('dirty → Suck then plans move to other room', () => {
    const agent = new GoalBasedAgent();
    const first = agent.act({ location: 'A', dirty: true });
    expect(first.action).toBe('Suck');
    // Plan should include moving to the other room
    const second = agent.act({ location: 'A', dirty: false });
    expect(second.action).toBe('Right');
  });
});

describe('UtilityBasedAgent', () => {
  test('dirty → Suck', () => {
    const agent = new UtilityBasedAgent();
    const state: VacuumState = { position: 'A', dirtA: true, dirtB: true };
    expect(agent.act({ location: 'A', dirty: true }, state).action).toBe('Suck');
  });

  test('both clean → NoOp', () => {
    const agent = new UtilityBasedAgent();
    const state: VacuumState = { position: 'A', dirtA: false, dirtB: false };
    expect(agent.act({ location: 'A', dirty: false }, state).action).toBe('NoOp');
  });
});

describe('runSimulation', () => {
  const initial: VacuumState = { position: 'A', dirtA: true, dirtB: true };

  test('simple-reflex returns log with score > 0', () => {
    const log = runSimulation('simple-reflex', initial);
    expect(log.length).toBeGreaterThan(0);
    expect(log[log.length - 1].score).toBeGreaterThan(0);
  });

  test('model-based ends with NoOp', () => {
    const log = runSimulation('model-based', initial);
    expect(log[log.length - 1].action).toBe('NoOp');
  });
});
