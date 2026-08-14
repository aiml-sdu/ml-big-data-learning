import {
  BAD_CENTROIDS,
  classifyDBSCAN,
  clusterCenters,
  compactness,
  GOOD_CENTROIDS,
  horizontalBandAssignments,
  KMEANS_POINTS,
  minimumCenterSeparation,
  runKMeans,
  type Point,
} from '@/lib/clustering';

describe('runKMeans', () => {
  test('spread-out initialization reaches a better solution than crowded initialization', () => {
    const good = runKMeans(KMEANS_POINTS, GOOD_CENTROIDS);
    const bad = runKMeans(KMEANS_POINTS, BAD_CENTROIDS);

    expect(good.loss).toBeLessThan(bad.loss);
  });

  test('assigns every point after convergence', () => {
    const result = runKMeans(KMEANS_POINTS, GOOD_CENTROIDS);

    expect(Object.keys(result.assignments)).toHaveLength(KMEANS_POINTS.length);
  });
});

describe('cluster validity helpers', () => {
  const points: Point[] = [
    { id: 'a', x: 0, y: 0 },
    { id: 'b', x: 2, y: 0 },
    { id: 'c', x: 10, y: 0 },
    { id: 'd', x: 12, y: 0 },
  ];
  const assignments = { a: 0, b: 0, c: 1, d: 1 };

  test('computes cluster centers from assignments', () => {
    expect(clusterCenters(points, assignments)).toEqual([
      { id: 'cluster-0', x: 1, y: 0 },
      { id: 'cluster-1', x: 11, y: 0 },
    ]);
  });

  test('computes nearest center separation', () => {
    expect(minimumCenterSeparation(points, assignments)).toBe(10);
  });

  test('validity demo contrasts natural blobs with forced horizontal bands', () => {
    const natural = runKMeans(KMEANS_POINTS, GOOD_CENTROIDS).assignments;
    const forcedBands = horizontalBandAssignments(KMEANS_POINTS);

    expect(compactness(KMEANS_POINTS, natural)).toBeLessThan(compactness(KMEANS_POINTS, forcedBands));
    expect(minimumCenterSeparation(KMEANS_POINTS, natural)).toBeGreaterThan(minimumCenterSeparation(KMEANS_POINTS, forcedBands));
  });
});

describe('classifyDBSCAN', () => {
  test('forms density-connected clusters and leaves isolated points as noise', () => {
    const points: Point[] = [
      { id: 'a', x: 0, y: 0 },
      { id: 'b', x: 1, y: 0 },
      { id: 'c', x: 10, y: 0 },
    ];
    const result = classifyDBSCAN(points, 2, 2);

    expect(result.clusterCount).toBe(1);
    expect(result.core).toEqual(new Set(['a', 'b']));
    expect(result.border.size).toBe(0);
    expect(result.clusterMap.c).toBeUndefined();
  });
});
