// ---------------------------------------------------------------------------
// agents.ts – Vacuum agent implementations for Topic 2 demonstrations
// ---------------------------------------------------------------------------

export interface VacuumState {
  position: 'A' | 'B';
  dirtA: boolean;
  dirtB: boolean;
}

export interface AgentAction {
  action: 'Left' | 'Right' | 'Suck' | 'NoOp';
  reasoning: string;
}

export interface PerceptLog {
  step: number;
  percept: { location: string; dirty: boolean };
  action: string;
  reasoning: string;
  state: VacuumState;
  score: number;
}

// ---------------------------------------------------------------------------
// Simple Reflex Agent
// Rule: if dirty -> suck; if A -> move right; if B -> move left.
// ---------------------------------------------------------------------------

export function simpleReflexAgent(percept: {
  location: 'A' | 'B';
  dirty: boolean;
}): AgentAction {
  if (percept.dirty) {
    return { action: 'Suck', reasoning: 'Current location is dirty — clean it.' };
  }
  if (percept.location === 'A') {
    return { action: 'Right', reasoning: 'Location A is clean — move to B.' };
  }
  return { action: 'Left', reasoning: 'Location B is clean — move to A.' };
}

// ---------------------------------------------------------------------------
// Model-Based Reflex Agent
// Tracks internal model of which rooms have been cleaned.
// ---------------------------------------------------------------------------

export class ModelBasedAgent {
  private model: { cleanedA: boolean; cleanedB: boolean };

  constructor() {
    this.model = { cleanedA: false, cleanedB: false };
  }

  act(percept: { location: 'A' | 'B'; dirty: boolean }): AgentAction {
    // Update model based on percept
    if (percept.location === 'A' && !percept.dirty) {
      this.model.cleanedA = true;
    }
    if (percept.location === 'B' && !percept.dirty) {
      this.model.cleanedB = true;
    }

    if (percept.dirty) {
      if (percept.location === 'A') this.model.cleanedA = true;
      if (percept.location === 'B') this.model.cleanedB = true;
      return { action: 'Suck', reasoning: 'Current location is dirty — clean it.' };
    }

    // Both clean — no need to move
    if (this.model.cleanedA && this.model.cleanedB) {
      return {
        action: 'NoOp',
        reasoning: 'Model shows both rooms are clean — nothing to do.',
      };
    }

    // Move toward the uncleaned room
    if (percept.location === 'A' && !this.model.cleanedB) {
      return { action: 'Right', reasoning: 'A is clean, B status unknown — move to check B.' };
    }
    if (percept.location === 'B' && !this.model.cleanedA) {
      return { action: 'Left', reasoning: 'B is clean, A status unknown — move to check A.' };
    }

    return { action: 'NoOp', reasoning: 'All known rooms are clean.' };
  }

  reset(): void {
    this.model = { cleanedA: false, cleanedB: false };
  }
}

// ---------------------------------------------------------------------------
// Goal-Based Agent
// Explicit goal: "all rooms clean". Plans a sequence of actions.
// ---------------------------------------------------------------------------

export class GoalBasedAgent {
  private goal = 'all rooms clean';
  private plan: string[] = [];

  act(percept: { location: 'A' | 'B'; dirty: boolean }): AgentAction {
    // If there's a plan in progress, execute next action
    if (this.plan.length > 0) {
      const next = this.plan.shift()!;
      return {
        action: next as AgentAction['action'],
        reasoning: `Executing plan step: ${next} (goal: ${this.goal}).`,
      };
    }

    // Replan based on current percept
    if (percept.dirty) {
      // Clean current, then check the other room
      const otherRoom = percept.location === 'A' ? 'Right' : 'Left';
      this.plan = [otherRoom]; // After sucking, go check the other room
      return {
        action: 'Suck',
        reasoning: `Current room dirty — clean it, then plan to check the other room (goal: ${this.goal}).`,
      };
    }

    // Current room is clean; plan to check the other
    const otherRoom = percept.location === 'A' ? 'Right' : 'Left';
    return {
      action: otherRoom as AgentAction['action'],
      reasoning: `Current room clean — moving to check other room (goal: ${this.goal}).`,
    };
  }

  reset(): void {
    this.plan = [];
  }
}

// ---------------------------------------------------------------------------
// Utility-Based Agent
// Considers the cost of movement. Maximizes: +100 per clean room, -1 per move.
// ---------------------------------------------------------------------------

export class UtilityBasedAgent {
  private cleanedRooms = new Set<string>();
  private totalMoves = 0;

  act(
    percept: { location: 'A' | 'B'; dirty: boolean },
    state: VacuumState,
  ): AgentAction {
    // If current room is dirty, always suck (utility gain: +100, cost: 0 movement)
    if (percept.dirty) {
      this.cleanedRooms.add(percept.location);
      return {
        action: 'Suck',
        reasoning: `Dirty room detected — cleaning yields +100 utility.`,
      };
    }

    this.cleanedRooms.add(percept.location);

    // Check if the other room might be dirty
    const otherDirty =
      (percept.location === 'A' && state.dirtB) ||
      (percept.location === 'B' && state.dirtA);

    if (otherDirty) {
      // Moving costs -1 but cleaning yields +100, net = +99
      this.totalMoves++;
      const moveDir = percept.location === 'A' ? 'Right' : 'Left';
      return {
        action: moveDir,
        reasoning: `Other room is dirty — moving costs -1 but cleaning gains +100 (net utility: +99).`,
      };
    }

    // Both rooms clean — moving would only cost utility
    return {
      action: 'NoOp',
      reasoning: `Both rooms are clean — any move costs -1 with no utility gain. Staying put.`,
    };
  }

  reset(): void {
    this.cleanedRooms.clear();
    this.totalMoves = 0;
  }
}

// ---------------------------------------------------------------------------
// Simulation runner
// ---------------------------------------------------------------------------

export function runSimulation(
  agentType: 'simple-reflex' | 'model-based' | 'goal-based' | 'utility-based',
  initialState: VacuumState,
  maxSteps: number = 20,
): PerceptLog[] {
  const state: VacuumState = { ...initialState };
  const log: PerceptLog[] = [];
  let score = 0;

  // Instantiate agent
  const modelAgent = new ModelBasedAgent();
  const goalAgent = new GoalBasedAgent();
  const utilityAgent = new UtilityBasedAgent();

  for (let step = 1; step <= maxSteps; step++) {
    const percept = {
      location: state.position,
      dirty: state.position === 'A' ? state.dirtA : state.dirtB,
    };

    let result: AgentAction;
    switch (agentType) {
      case 'simple-reflex':
        result = simpleReflexAgent(percept);
        break;
      case 'model-based':
        result = modelAgent.act(percept);
        break;
      case 'goal-based':
        result = goalAgent.act(percept);
        break;
      case 'utility-based':
        result = utilityAgent.act(percept, state);
        break;
    }

    // Apply action to state
    switch (result.action) {
      case 'Suck':
        if (state.position === 'A') state.dirtA = false;
        else state.dirtB = false;
        score += 100;
        break;
      case 'Left':
        state.position = 'A';
        score -= 1;
        break;
      case 'Right':
        state.position = 'B';
        score -= 1;
        break;
      case 'NoOp':
        // No cost, no benefit
        break;
    }

    log.push({
      step,
      percept: { location: percept.location, dirty: percept.dirty },
      action: result.action,
      reasoning: result.reasoning,
      state: { ...state },
      score,
    });

    // Stop early if agent chose NoOp (it thinks it's done)
    if (result.action === 'NoOp') break;
  }

  return log;
}
