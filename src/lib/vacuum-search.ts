// Vacuum world state space for Lab Exercise 2
// State encoding: "pos-roomA-roomB" e.g. "A-D-D" = robot at A, room A dirty, room B dirty

export type RoomStatus = 'D' | 'C'; // Dirty or Clean
export type Position = 'A' | 'B';

export interface VacuumState {
  pos: Position;
  roomA: RoomStatus;
  roomB: RoomStatus;
}

export function encodeState(s: VacuumState): string {
  return `${s.pos}-${s.roomA}-${s.roomB}`;
}

export function decodeState(str: string): VacuumState {
  const [pos, roomA, roomB] = str.split('-');
  return { pos: pos as Position, roomA: roomA as RoomStatus, roomB: roomB as RoomStatus };
}

// All 8 possible states
export const ALL_STATES: string[] = [
  'A-D-D', 'A-D-C', 'A-C-D', 'A-C-C',
  'B-D-D', 'B-D-C', 'B-C-D', 'B-C-C',
];

export function isGoal(state: string): boolean {
  const s = decodeState(state);
  return s.roomA === 'C' && s.roomB === 'C';
}

export function getVacuumNeighbors(state: string): { city: string; cost: number; action: string }[] {
  const s = decodeState(state);
  const neighbors: { city: string; cost: number; action: string }[] = [];

  // Suck action
  if (s.pos === 'A' && s.roomA === 'D') {
    neighbors.push({ city: encodeState({ ...s, roomA: 'C' }), cost: 1, action: 'Suck' });
  } else if (s.pos === 'B' && s.roomB === 'D') {
    neighbors.push({ city: encodeState({ ...s, roomB: 'C' }), cost: 1, action: 'Suck' });
  }

  // Move actions
  if (s.pos === 'A') {
    neighbors.push({ city: encodeState({ ...s, pos: 'B' }), cost: 1, action: 'Right' });
  } else {
    neighbors.push({ city: encodeState({ ...s, pos: 'A' }), cost: 1, action: 'Left' });
  }

  return neighbors;
}

// Adapter for search.ts GetNeighbors interface (drops action field)
export function getVacuumSearchNeighbors(state: string): { city: string; cost: number }[] {
  return getVacuumNeighbors(state).map(({ city, cost }) => ({ city, cost }));
}

// Layout positions for the 8-node state graph
// Arranged in 2 rows: top = A states, bottom = B states
export const STATE_POSITIONS: Record<string, { x: number; y: number }> = {
  'A-D-D': { x: 0, y: 0 },
  'A-D-C': { x: 200, y: 0 },
  'A-C-D': { x: 400, y: 0 },
  'A-C-C': { x: 600, y: 0 },
  'B-D-D': { x: 0, y: 200 },
  'B-D-C': { x: 200, y: 200 },
  'B-C-D': { x: 400, y: 200 },
  'B-C-C': { x: 600, y: 200 },
};
