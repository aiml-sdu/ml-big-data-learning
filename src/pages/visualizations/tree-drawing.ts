// ---- Color constants ----
export const COL_UNSEEN = '#9ca3af';
export const COL_FRINGE = '#fbbf24';
export const COL_CURRENT = '#ef4444';
export const COL_EXPLORED = '#22c55e';
export const COL_GOAL = '#3b82f6';
export const COL_PATH = '#8b5cf6';

/** Return black or white text depending on background luminance. */
export function contrastText(bg: string): string {
  // Parse hex color
  const hex = bg.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  // Relative luminance (sRGB)
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.55 ? '#000' : '#fff';
}

// ---- Tree data ----

export interface TreeNode {
  id: string;
  x: number;
  y: number;
  children: string[];
}

export const TREE_NODES: Record<string, TreeNode> = {
  A: { id: 'A', x: 350, y: 40, children: ['B', 'C'] },
  B: { id: 'B', x: 175, y: 130, children: ['D', 'E'] },
  C: { id: 'C', x: 525, y: 130, children: ['F', 'G'] },
  D: { id: 'D', x: 100, y: 220, children: [] },
  E: { id: 'E', x: 250, y: 220, children: [] },
  F: { id: 'F', x: 450, y: 220, children: [] },
  G: { id: 'G', x: 600, y: 220, children: [] },
};

export const TREE_GOAL = 'G';

export function getTreeNeighbors(node: string): { city: string; cost: number }[] {
  const n = TREE_NODES[node];
  if (!n) return [];
  return n.children.map((c) => ({ city: c, cost: 1 }));
}

