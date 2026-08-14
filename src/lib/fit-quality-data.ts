import type { Point } from './regression-math';

function mulberry32(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gaussian(rng: () => number): number {
  const u1 = Math.max(rng(), 1e-9);
  const u2 = rng();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

export function fitQualityTrueFn(x: number): number {
  return Math.sin(2 * Math.PI * x);
}

export function makeFitQualityData(n: number, seed: number, noise = 0.28): Point[] {
  const rng = mulberry32(seed);
  const points: Point[] = [];
  for (let i = 0; i < n; i += 1) {
    const x = 0.03 + (0.94 * i) / (n - 1) + (rng() - 0.5) * 0.02;
    const y = fitQualityTrueFn(x) + gaussian(rng) * noise;
    points.push({ x, y });
  }
  return points;
}

export const FIT_QUALITY_TRAIN_SEED = 7;
export const FIT_QUALITY_TEST_SEED = 91;
export const FIT_QUALITY_N = 25;
