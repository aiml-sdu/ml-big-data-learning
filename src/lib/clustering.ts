export interface Point {
  id: string;
  x: number;
  y: number;
}

export interface Centroid {
  id: string;
  x: number;
  y: number;
}

export interface KMeansState {
  centroids: Centroid[];
  assignments: Record<string, number>;
  loss: number;
}

export const CLUSTER_COLORS = [
  'var(--chart-1, #2563eb)',
  'var(--chart-2, #059669)',
  'var(--chart-3, #d97706)',
  'var(--chart-4, #7c3aed)',
  'var(--chart-5, #dc2626)',
  'var(--color-key-idea, #8b5cf6)',
];

export const AMBIGUOUS_POINTS: Point[] = [
  { id: 'a1', x: 92, y: 88 }, { id: 'a2', x: 126, y: 107 }, { id: 'a3', x: 83, y: 132 }, { id: 'a4', x: 142, y: 146 },
  { id: 'b1', x: 251, y: 89 }, { id: 'b2', x: 286, y: 109 }, { id: 'b3', x: 238, y: 138 }, { id: 'b4', x: 309, y: 153 },
  { id: 'c1', x: 88, y: 244 }, { id: 'c2', x: 126, y: 226 }, { id: 'c3', x: 141, y: 284 }, { id: 'c4', x: 75, y: 296 },
  { id: 'd1', x: 254, y: 244 }, { id: 'd2', x: 287, y: 229 }, { id: 'd3', x: 235, y: 294 }, { id: 'd4', x: 312, y: 288 },
  { id: 'e1', x: 454, y: 93 }, { id: 'e2', x: 500, y: 119 }, { id: 'e3', x: 431, y: 148 }, { id: 'e4', x: 520, y: 163 },
  { id: 'f1', x: 450, y: 250 }, { id: 'f2', x: 505, y: 230 }, { id: 'f3', x: 428, y: 293 }, { id: 'f4', x: 524, y: 289 },
];

export const KMEANS_POINTS: Point[] = [
  { id: 'p1', x: 109, y: 119 }, { id: 'p2', x: 138, y: 86 }, { id: 'p3', x: 165, y: 132 },
  { id: 'p4', x: 103, y: 166 }, { id: 'p5', x: 149, y: 174 }, { id: 'p6', x: 318, y: 87 },
  { id: 'p7', x: 352, y: 119 }, { id: 'p8', x: 293, y: 142 }, { id: 'p9', x: 377, y: 165 },
  { id: 'p10', x: 322, y: 178 }, { id: 'p11', x: 471, y: 235 }, { id: 'p12', x: 521, y: 218 },
  { id: 'p13', x: 553, y: 261 }, { id: 'p14', x: 489, y: 292 }, { id: 'p15', x: 535, y: 306 },
];

export const GOOD_CENTROIDS: Centroid[] = [
  { id: 'c1', x: 135, y: 130 },
  { id: 'c2', x: 335, y: 130 },
  { id: 'c3', x: 515, y: 260 },
];

export const BAD_CENTROIDS: Centroid[] = [
  { id: 'c1', x: 90, y: 102 },
  { id: 'c2', x: 132, y: 126 },
  { id: 'c3', x: 172, y: 162 },
];

export const HIERARCHICAL_POINTS: Point[] = [
  { id: 'A', x: 86, y: 230 },
  { id: 'B', x: 143, y: 218 },
  { id: 'C', x: 244, y: 137 },
  { id: 'D', x: 303, y: 128 },
  { id: 'E', x: 454, y: 227 },
  { id: 'F', x: 513, y: 209 },
];

export const DBSCAN_POINTS: Point[] = [
  { id: 'd1', x: 108, y: 129 }, { id: 'd2', x: 137, y: 111 }, { id: 'd3', x: 157, y: 142 },
  { id: 'd4', x: 123, y: 168 }, { id: 'd5', x: 181, y: 176 }, { id: 'd6', x: 219, y: 202 },
  { id: 'd7', x: 253, y: 234 }, { id: 'd8', x: 292, y: 248 }, { id: 'd9', x: 332, y: 231 },
  { id: 'd10', x: 366, y: 204 }, { id: 'd11', x: 408, y: 171 }, { id: 'd12', x: 449, y: 145 },
  { id: 'd13', x: 490, y: 128 }, { id: 'd14', x: 527, y: 149 }, { id: 'd15', x: 503, y: 181 },
  { id: 'd16', x: 461, y: 185 }, { id: 'd17', x: 431, y: 219 }, { id: 'd18', x: 383, y: 247 },
  { id: 'd19', x: 118, y: 268 }, { id: 'd20', x: 550, y: 283 }, { id: 'd21', x: 311, y: 96 },
];

export function distance(a: Point | Centroid, b: Point | Centroid) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function nearestCentroid(point: Point, centroids: Centroid[]) {
  let best = 0;
  let bestDistance = Number.POSITIVE_INFINITY;
  centroids.forEach((centroid, index) => {
    const d = distance(point, centroid);
    if (d < bestDistance) {
      best = index;
      bestDistance = d;
    }
  });
  return best;
}

export function assignPoints(points: Point[], centroids: Centroid[]) {
  return Object.fromEntries(points.map((point) => [point.id, nearestCentroid(point, centroids)]));
}

export function moveCentroids(points: Point[], centroids: Centroid[], assignments: Record<string, number>) {
  return centroids.map((centroid, index) => {
    const assigned = points.filter((point) => assignments[point.id] === index);
    if (assigned.length === 0) return centroid;
    return {
      ...centroid,
      x: assigned.reduce((sum, point) => sum + point.x, 0) / assigned.length,
      y: assigned.reduce((sum, point) => sum + point.y, 0) / assigned.length,
    };
  });
}

export function kmeansLoss(points: Point[], centroids: Centroid[]) {
  return points.reduce((sum, point) => {
    const centroid = centroids[nearestCentroid(point, centroids)];
    return sum + distance(point, centroid) ** 2;
  }, 0);
}

export function runKMeans(points: Point[], start: Centroid[], steps = 8): KMeansState {
  let centroids = start.map((centroid) => ({ ...centroid }));
  for (let i = 0; i < steps; i += 1) {
    const assignments = assignPoints(points, centroids);
    centroids = moveCentroids(points, centroids, assignments);
  }
  const assignments = assignPoints(points, centroids);
  return { centroids, assignments, loss: kmeansLoss(points, centroids) };
}

export function compactness(points: Point[], assignments: Record<string, number>) {
  const groups = new Map<number, Point[]>();
  points.forEach((point) => {
    const key = assignments[point.id] ?? 0;
    groups.set(key, [...(groups.get(key) ?? []), point]);
  });
  let total = 0;
  groups.forEach((group) => {
    const center = {
      x: group.reduce((sum, point) => sum + point.x, 0) / group.length,
      y: group.reduce((sum, point) => sum + point.y, 0) / group.length,
    };
    total += group.reduce((sum, point) => sum + distance(point, { id: 'center', ...center }), 0);
  });
  return total;
}

export function clusterCenters(points: Point[], assignments: Record<string, number>) {
  const groups = new Map<number, Point[]>();
  points.forEach((point) => {
    const key = assignments[point.id] ?? 0;
    groups.set(key, [...(groups.get(key) ?? []), point]);
  });

  return [...groups.entries()].map(([cluster, group]) => ({
    id: `cluster-${cluster}`,
    x: group.reduce((sum, point) => sum + point.x, 0) / group.length,
    y: group.reduce((sum, point) => sum + point.y, 0) / group.length,
  }));
}

export function minimumCenterSeparation(points: Point[], assignments: Record<string, number>) {
  const centers = clusterCenters(points, assignments);
  if (centers.length < 2) return 0;

  let nearest = Number.POSITIVE_INFINITY;
  centers.forEach((center, index) => {
    centers.slice(index + 1).forEach((other) => {
      nearest = Math.min(nearest, distance(center, other));
    });
  });
  return nearest;
}

export function horizontalBandAssignments(points: Point[]) {
  return Object.fromEntries(points.map((point) => [point.id, point.y < 145 ? 0 : point.y < 220 ? 1 : 2]));
}

export function classifyDBSCAN(points: Point[], eps: number, minPts: number) {
  const neighbors = new Map<string, Point[]>();
  points.forEach((point) => {
    neighbors.set(point.id, points.filter((other) => distance(point, other) <= eps));
  });

  const core = new Set(points.filter((point) => (neighbors.get(point.id)?.length ?? 0) >= minPts).map((point) => point.id));
  const border = new Set<string>();
  points.forEach((point) => {
    if (core.has(point.id)) return;
    if (neighbors.get(point.id)?.some((other) => core.has(other.id))) border.add(point.id);
  });

  const clusterMap: Record<string, number> = {};
  const visited = new Set<string>();
  let clusterIndex = 0;

  points.forEach((point) => {
    if (!core.has(point.id) || visited.has(point.id)) return;
    const queue = [point];
    visited.add(point.id);
    while (queue.length > 0) {
      const current = queue.shift();
      if (!current) continue;
      clusterMap[current.id] = clusterIndex;
      for (const next of neighbors.get(current.id) ?? []) {
        if (core.has(next.id) && !visited.has(next.id)) {
          visited.add(next.id);
          queue.push(next);
        }
      }
    }
    clusterIndex += 1;
  });

  points.forEach((point) => {
    if (!border.has(point.id)) return;
    const closestCore = (neighbors.get(point.id) ?? [])
      .filter((other) => core.has(other.id) && clusterMap[other.id] !== undefined)
      .sort((a, b) => distance(point, a) - distance(point, b))[0];
    if (closestCore) clusterMap[point.id] = clusterMap[closestCore.id];
  });

  return { core, border, clusterMap, clusterCount: clusterIndex };
}
