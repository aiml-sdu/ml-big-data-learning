// ---------------------------------------------------------------------------
// romania-graph.ts – Romania map data for search algorithm demonstrations
// Based on Russell & Norvig "Artificial Intelligence: A Modern Approach"
// ---------------------------------------------------------------------------

export interface City {
  name: string;
  x: number; // canvas x position (0-800 range)
  y: number; // canvas y position (0-500 range)
  hSLD: number; // straight-line distance to Bucharest
}

export interface Edge {
  from: string;
  to: string;
  cost: number;
}

export const CITIES: Record<string, City> = {
  Arad: { name: 'Arad', x: 91, y: 192, hSLD: 366 },
  Bucharest: { name: 'Bucharest', x: 575, y: 388, hSLD: 0 },
  Craiova: { name: 'Craiova', x: 385, y: 450, hSLD: 160 },
  Drobeta: { name: 'Drobeta', x: 253, y: 450, hSLD: 242 },
  Eforie: { name: 'Eforie', x: 740, y: 438, hSLD: 161 },
  Fagaras: { name: 'Fagaras', x: 415, y: 215, hSLD: 176 },
  Giurgiu: { name: 'Giurgiu', x: 545, y: 475, hSLD: 77 },
  Hirsova: { name: 'Hirsova', x: 715, y: 350, hSLD: 151 },
  Iasi: { name: 'Iasi', x: 620, y: 115, hSLD: 226 },
  Lugoj: { name: 'Lugoj', x: 195, y: 305, hSLD: 244 },
  Mehadia: { name: 'Mehadia', x: 215, y: 375, hSLD: 241 },
  Neamt: { name: 'Neamt', x: 540, y: 55, hSLD: 234 },
  Oradea: { name: 'Oradea', x: 131, y: 65, hSLD: 380 },
  Pitesti: { name: 'Pitesti', x: 475, y: 355, hSLD: 100 },
  'Rimnicu Vilcea': { name: 'Rimnicu Vilcea', x: 340, y: 310, hSLD: 193 },
  Sibiu: { name: 'Sibiu', x: 270, y: 205, hSLD: 253 },
  Timisoara: { name: 'Timisoara', x: 105, y: 290, hSLD: 329 },
  Urziceni: { name: 'Urziceni', x: 650, y: 340, hSLD: 80 },
  Vaslui: { name: 'Vaslui', x: 680, y: 195, hSLD: 199 },
  Zerind: { name: 'Zerind', x: 108, y: 120, hSLD: 374 },
};

export const EDGES: Edge[] = [
  // Arad connections
  { from: 'Arad', to: 'Zerind', cost: 75 },
  { from: 'Arad', to: 'Sibiu', cost: 140 },
  { from: 'Arad', to: 'Timisoara', cost: 118 },
  // Zerind connections
  { from: 'Zerind', to: 'Oradea', cost: 71 },
  // Oradea connections
  { from: 'Oradea', to: 'Sibiu', cost: 151 },
  // Timisoara connections
  { from: 'Timisoara', to: 'Lugoj', cost: 111 },
  // Lugoj connections
  { from: 'Lugoj', to: 'Mehadia', cost: 70 },
  // Mehadia connections
  { from: 'Mehadia', to: 'Drobeta', cost: 75 },
  // Drobeta connections
  { from: 'Drobeta', to: 'Craiova', cost: 120 },
  // Craiova connections
  { from: 'Craiova', to: 'Rimnicu Vilcea', cost: 146 },
  { from: 'Craiova', to: 'Pitesti', cost: 138 },
  // Sibiu connections
  { from: 'Sibiu', to: 'Fagaras', cost: 99 },
  { from: 'Sibiu', to: 'Rimnicu Vilcea', cost: 80 },
  // Fagaras connections
  { from: 'Fagaras', to: 'Bucharest', cost: 211 },
  // Rimnicu Vilcea connections
  { from: 'Rimnicu Vilcea', to: 'Pitesti', cost: 97 },
  // Pitesti connections
  { from: 'Pitesti', to: 'Bucharest', cost: 101 },
  // Bucharest connections
  { from: 'Bucharest', to: 'Giurgiu', cost: 90 },
  { from: 'Bucharest', to: 'Urziceni', cost: 85 },
  // Urziceni connections
  { from: 'Urziceni', to: 'Hirsova', cost: 98 },
  { from: 'Urziceni', to: 'Vaslui', cost: 142 },
  // Hirsova connections
  { from: 'Hirsova', to: 'Eforie', cost: 86 },
  // Vaslui connections
  { from: 'Vaslui', to: 'Iasi', cost: 92 },
  // Iasi connections
  { from: 'Iasi', to: 'Neamt', cost: 87 },
];

// Pre-build adjacency list for fast neighbor lookups
const adjacency: Record<string, { city: string; cost: number }[]> = {};

for (const city of Object.keys(CITIES)) {
  adjacency[city] = [];
}

for (const edge of EDGES) {
  adjacency[edge.from].push({ city: edge.to, cost: edge.cost });
  adjacency[edge.to].push({ city: edge.from, cost: edge.cost });
}

// Sort each adjacency list alphabetically for deterministic iteration
for (const city of Object.keys(adjacency)) {
  adjacency[city].sort((a, b) => a.city.localeCompare(b.city));
}

export function getNeighbors(city: string): { city: string; cost: number }[] {
  return adjacency[city] ?? [];
}
