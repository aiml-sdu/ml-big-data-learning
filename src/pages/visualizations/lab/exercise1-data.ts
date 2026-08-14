// A-J tree for Lab Exercise 1: Graph Traversal
// 10 nodes, binary-ish tree, goal = J

export interface LabTreeNode {
  id: string;
  x: number;
  y: number;
  children: string[];
}

//            A
//          /   \
//         B     C
//        / \   / \
//       D   E F   G
//      /     |
//     H      I
//    /
//   J (goal)

export const LAB_TREE: Record<string, LabTreeNode> = {
  A: { id: 'A', x: 400, y: 30, children: ['B', 'C'] },
  B: { id: 'B', x: 200, y: 110, children: ['D', 'E'] },
  C: { id: 'C', x: 600, y: 110, children: ['F', 'G'] },
  D: { id: 'D', x: 100, y: 190, children: ['H'] },
  E: { id: 'E', x: 300, y: 190, children: ['I'] },
  F: { id: 'F', x: 500, y: 190, children: [] },
  G: { id: 'G', x: 700, y: 190, children: [] },
  H: { id: 'H', x: 100, y: 270, children: ['J'] },
  I: { id: 'I', x: 300, y: 270, children: [] },
  J: { id: 'J', x: 100, y: 350, children: [] },
};

export const LAB_TREE_GOAL = 'J';
export const LAB_TREE_ROOT = 'A';

export function getLabTreeNeighbors(node: string): { city: string; cost: number }[] {
  const n = LAB_TREE[node];
  if (!n) return [];
  return n.children.map((c) => ({ city: c, cost: 1 }));
}

// Count leaf nodes (nodes with no children)
export const LEAF_COUNT = Object.values(LAB_TREE).filter((n) => n.children.length === 0).length;
// Answer: F, G, I, J = 4

// Pre-compute correct DFS and BFS expansion orders
export function getDFSOrder(): string[] {
  // DFS (LIFO, reverse children so alphabetical first is popped first)
  const stack = ['A'];
  const order: string[] = [];
  const visited = new Set<string>();

  while (stack.length > 0) {
    const node = stack.pop()!;
    if (visited.has(node)) continue;
    visited.add(node);
    order.push(node);
    const children = [...LAB_TREE[node].children].reverse();
    for (const c of children) {
      if (!visited.has(c)) stack.push(c);
    }
  }
  return order;
}

export function getBFSOrder(): string[] {
  const queue = ['A'];
  const order: string[] = [];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const node = queue.shift()!;
    if (visited.has(node)) continue;
    visited.add(node);
    order.push(node);
    for (const c of LAB_TREE[node].children) {
      if (!visited.has(c)) queue.push(c);
    }
  }
  return order;
}
