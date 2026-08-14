// Farmer/Wolf/Goat/Cabbage river crossing puzzle for Lab Exercise 3
// State: "FWGC" where each char is 'W' (west) or 'E' (east)
// Index: 0=farmer, 1=wolf, 2=goat, 3=cabbage

export type Side = 'W' | 'E';

export interface RiverState {
  farmer: Side;
  wolf: Side;
  goat: Side;
  cabbage: Side;
}

export function encodeState(s: RiverState): string {
  return `${s.farmer}${s.wolf}${s.goat}${s.cabbage}`;
}

export function decodeState(str: string): RiverState {
  return {
    farmer: str[0] as Side,
    wolf: str[1] as Side,
    goat: str[2] as Side,
    cabbage: str[3] as Side,
  };
}

const otherSide = (s: Side): Side => (s === 'W' ? 'E' : 'W');

export function isValid(farmer: Side, wolf: Side, goat: Side, cabbage: Side): boolean {
  // Wolf eats goat if they're together without farmer
  if (wolf === goat && wolf !== farmer) return false;
  // Goat eats cabbage if they're together without farmer
  if (goat === cabbage && goat !== farmer) return false;
  return true;
}

export function isGoal(state: string): boolean {
  return state === 'EEEE';
}

export const INITIAL_STATE = 'WWWW';

export type Entity = 'farmer' | 'wolf' | 'goat' | 'cabbage';
export const ENTITIES: Entity[] = ['farmer', 'wolf', 'goat', 'cabbage'];
export const ENTITY_LABELS: Record<Entity, string> = {
  farmer: 'Farmer',
  wolf: 'Wolf',
  goat: 'Goat',
  cabbage: 'Cabbage',
};
export const ENTITY_ICONS: Record<Entity, string> = {
  farmer: '👨‍🌾',
  wolf: '🐺',
  goat: '🐐',
  cabbage: '🥬',
};

export function getNeighbors(state: string): { city: string; cost: number; action: string }[] {
  const s = decodeState(state);
  const neighbors: { city: string; cost: number; action: string }[] = [];
  const farmerSide = s.farmer;

  // Farmer crosses alone
  const alone: RiverState = { ...s, farmer: otherSide(farmerSide) };
  if (isValid(alone.farmer, alone.wolf, alone.goat, alone.cabbage)) {
    neighbors.push({ city: encodeState(alone), cost: 1, action: 'Farmer crosses alone' });
  }

  // Farmer crosses with each entity on the same side
  const items: Entity[] = ['wolf', 'goat', 'cabbage'];
  for (const item of items) {
    if (s[item] === farmerSide) {
      const next: RiverState = {
        ...s,
        farmer: otherSide(farmerSide),
        [item]: otherSide(farmerSide),
      };
      if (isValid(next.farmer, next.wolf, next.goat, next.cabbage)) {
        neighbors.push({
          city: encodeState(next),
          cost: 1,
          action: `Farmer takes ${ENTITY_LABELS[item]}`,
        });
      }
    }
  }

  return neighbors;
}

// Adapter for search.ts GetNeighbors interface
export function getSearchNeighbors(state: string): { city: string; cost: number }[] {
  return getNeighbors(state).map(({ city, cost }) => ({ city, cost }));
}

// Get action label between two states
export function getActionBetween(from: string, to: string): string {
  const neighbors = getNeighbors(from);
  const match = neighbors.find((n) => n.city === to);
  return match?.action ?? '';
}
