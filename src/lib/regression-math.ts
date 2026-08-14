/**
 * Pure math utilities for regression visualizations.
 * No React, no DOM — just numeric functions.
 */

export interface Point {
  x: number;
  y: number;
}

// ---------------------------------------------------------------------------
// Seeded PRNG (mulberry32)
// ---------------------------------------------------------------------------

function mulberry32(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function boxMullerNormal(rng: () => number): number {
  const u1 = rng();
  const u2 = rng();
  return Math.sqrt(-2 * Math.log(u1 + 1e-10)) * Math.cos(2 * Math.PI * u2);
}

// ---------------------------------------------------------------------------
// Data generation
// ---------------------------------------------------------------------------

export function generateLinearData(
  n: number,
  trueW: number,
  trueB: number,
  noise: number,
  seed = 42,
): Point[] {
  const rng = mulberry32(seed);
  const points: Point[] = [];
  for (let i = 0; i < n; i++) {
    const x = rng() * 10;
    const y = trueW * x + trueB + boxMullerNormal(rng) * noise;
    points.push({ x, y });
  }
  return points;
}

export function trainTestSplit(
  points: Point[],
  trainRatio: number,
  seed = 0,
): { train: Point[]; test: Point[] } {
  const rng = mulberry32(seed);
  const shuffled = [...points].sort(() => rng() - 0.5);
  const split = Math.round(shuffled.length * trainRatio);
  return { train: shuffled.slice(0, split), test: shuffled.slice(split) };
}

// ---------------------------------------------------------------------------
// Ordinary Least Squares (simple linear regression)
// ---------------------------------------------------------------------------

export function olsFit(points: Point[]): { w: number; b: number } {
  const n = points.length;
  if (n === 0) return { w: 0, b: 0 };
  let sx = 0, sy = 0, sxy = 0, sx2 = 0;
  for (const p of points) {
    sx += p.x;
    sy += p.y;
    sxy += p.x * p.y;
    sx2 += p.x * p.x;
  }
  const denom = n * sx2 - sx * sx;
  if (Math.abs(denom) < 1e-12) return { w: 0, b: sy / n };
  const w = (n * sxy - sx * sy) / denom;
  const b = (sy - w * sx) / n;
  return { w, b };
}

// ---------------------------------------------------------------------------
// Error metrics
// ---------------------------------------------------------------------------

export function mse(points: Point[], w: number, b: number): number {
  if (points.length === 0) return 0;
  let sum = 0;
  for (const p of points) {
    const err = p.y - (w * p.x + b);
    sum += err * err;
  }
  return sum / points.length;
}

export function mae(points: Point[], w: number, b: number): number {
  if (points.length === 0) return 0;
  let sum = 0;
  for (const p of points) {
    sum += Math.abs(p.y - (w * p.x + b));
  }
  return sum / points.length;
}

export function rSquared(points: Point[], w: number, b: number): number {
  if (points.length === 0) return 0;
  let meanY = 0;
  for (const p of points) meanY += p.y;
  meanY /= points.length;
  let ssTot = 0, ssRes = 0;
  for (const p of points) {
    ssTot += (p.y - meanY) ** 2;
    ssRes += (p.y - (w * p.x + b)) ** 2;
  }
  if (ssTot < 1e-12) return 1;
  return 1 - ssRes / ssTot;
}

// ---------------------------------------------------------------------------
// Gradient descent
// ---------------------------------------------------------------------------

export function mseGradient(
  points: Point[],
  w: number,
  b: number,
): { dw: number; db: number } {
  const n = points.length;
  if (n === 0) return { dw: 0, db: 0 };
  let dw = 0, db = 0;
  for (const p of points) {
    const err = (w * p.x + b) - p.y;
    dw += err * p.x;
    db += err;
  }
  return { dw: (2 / n) * dw, db: (2 / n) * db };
}

export function gradientDescentStep(
  points: Point[],
  w: number,
  b: number,
  lr: number,
): { w: number; b: number; dw: number; db: number } {
  const { dw, db } = mseGradient(points, w, b);
  return { w: w - lr * dw, b: b - lr * db, dw, db };
}

export interface GDTrajectoryPoint {
  w: number;
  b: number;
  loss: number;
}

export function precomputeTrajectory(
  points: Point[],
  startW: number,
  startB: number,
  lr: number,
  maxSteps: number,
): GDTrajectoryPoint[] {
  const trajectory: GDTrajectoryPoint[] = [];
  let w = startW, b = startB;
  for (let i = 0; i <= maxSteps; i++) {
    const loss = mse(points, w, b);
    trajectory.push({ w, b, loss });
    // Stop if diverged
    if (!isFinite(loss) || loss > 1e10) break;
    const step = gradientDescentStep(points, w, b, lr);
    w = step.w;
    b = step.b;
  }
  return trajectory;
}

// ---------------------------------------------------------------------------
// Loss surface computation
// ---------------------------------------------------------------------------

export interface LossSurface {
  grid: number[][];
  wMin: number;
  wMax: number;
  bMin: number;
  bMax: number;
  minLoss: number;
  maxLoss: number;
}

export function computeLossSurface(
  points: Point[],
  wRange: [number, number],
  bRange: [number, number],
  gridSize: number,
): LossSurface {
  const [wMin, wMax] = wRange;
  const [bMin, bMax] = bRange;
  const grid: number[][] = [];
  let minLoss = Infinity, maxLoss = 0;
  for (let i = 0; i < gridSize; i++) {
    const row: number[] = [];
    const w = wMin + (wMax - wMin) * (i / (gridSize - 1));
    for (let j = 0; j < gridSize; j++) {
      const b = bMin + (bMax - bMin) * (j / (gridSize - 1));
      const loss = mse(points, w, b);
      row.push(loss);
      if (loss < minLoss) minLoss = loss;
      if (loss > maxLoss) maxLoss = loss;
    }
    grid.push(row);
  }
  return { grid, wMin, wMax, bMin, bMax, minLoss, maxLoss };
}

// ---------------------------------------------------------------------------
// Polynomial regression
// ---------------------------------------------------------------------------

export function polynomialFeatures(x: number, degree: number): number[] {
  const features: number[] = [1];
  let xi = 1;
  for (let d = 1; d <= degree; d++) {
    xi *= x;
    features.push(xi);
  }
  return features;
}

export function evaluatePolynomial(x: number, coeffs: number[]): number {
  let result = 0;
  let xi = 1;
  for (let i = 0; i < coeffs.length; i++) {
    result += coeffs[i] * xi;
    if (i < coeffs.length - 1) xi *= x;
  }
  return result;
}

export function polynomialMSE(points: Point[], coeffs: number[]): number {
  if (points.length === 0) return 0;
  let sum = 0;
  for (const p of points) {
    const err = p.y - evaluatePolynomial(p.x, coeffs);
    sum += err * err;
  }
  return sum / points.length;
}

// ---------------------------------------------------------------------------
// Matrix utilities (small matrices for polynomial fitting)
// ---------------------------------------------------------------------------

function matCreate(rows: number, cols: number, fill = 0): number[][] {
  return Array.from({ length: rows }, () => Array(cols).fill(fill));
}

function matMul(A: number[][], B: number[][]): number[][] {
  const m = A.length, n = B[0].length, k = B.length;
  const C = matCreate(m, n);
  for (let i = 0; i < m; i++)
    for (let j = 0; j < n; j++)
      for (let p = 0; p < k; p++)
        C[i][j] += A[i][p] * B[p][j];
  return C;
}

function matTranspose(A: number[][]): number[][] {
  const m = A.length, n = A[0].length;
  const T = matCreate(n, m);
  for (let i = 0; i < m; i++)
    for (let j = 0; j < n; j++)
      T[j][i] = A[i][j];
  return T;
}

function matInverse(A: number[][]): number[][] {
  const n = A.length;
  // Augment with identity
  const aug = matCreate(n, 2 * n);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) aug[i][j] = A[i][j];
    aug[i][n + i] = 1;
  }
  // Gauss-Jordan
  for (let col = 0; col < n; col++) {
    // Partial pivoting
    let maxRow = col;
    for (let row = col + 1; row < n; row++)
      if (Math.abs(aug[row][col]) > Math.abs(aug[maxRow][col])) maxRow = row;
    [aug[col], aug[maxRow]] = [aug[maxRow], aug[col]];

    const pivot = aug[col][col];
    if (Math.abs(pivot) < 1e-12) {
      // Singular — return identity as fallback (regularization will help)
      return matCreate(n, n).map((row, i) => { row[i] = 1; return row; });
    }
    for (let j = 0; j < 2 * n; j++) aug[col][j] /= pivot;
    for (let row = 0; row < n; row++) {
      if (row === col) continue;
      const factor = aug[row][col];
      for (let j = 0; j < 2 * n; j++) aug[row][j] -= factor * aug[col][j];
    }
  }
  return aug.map(row => row.slice(n));
}

/**
 * Fit polynomial of given degree using normal equation with Tikhonov regularization.
 * Returns coefficients [β₀, β₁, ..., β_degree].
 */
export function fitPolynomial(
  points: Point[],
  degree: number,
  lambda = 1e-8,
): number[] {
  const n = points.length;
  const d = degree + 1;

  // Center and scale x for numerical stability
  let meanX = 0, stdX = 0;
  for (const p of points) meanX += p.x;
  meanX /= n;
  for (const p of points) stdX += (p.x - meanX) ** 2;
  stdX = Math.sqrt(stdX / n) || 1;

  // Build design matrix X and target vector y
  const X = matCreate(n, d);
  const Y = matCreate(n, 1);
  for (let i = 0; i < n; i++) {
    const xNorm = (points[i].x - meanX) / stdX;
    X[i] = polynomialFeatures(xNorm, degree);
    Y[i][0] = points[i].y;
  }

  // Normal equation: β = (X^T X + λI)^{-1} X^T y
  const Xt = matTranspose(X);
  const XtX = matMul(Xt, X);
  // Add regularization to diagonal (skip intercept term)
  for (let i = 1; i < d; i++) XtX[i][i] += lambda;
  const XtXinv = matInverse(XtX);
  const XtY = matMul(Xt, Y);
  const betaNorm = matMul(XtXinv, XtY);

  // Convert coefficients back to original x scale
  // If we fitted in normalized space, we need to un-normalize
  // ŷ = Σ βk * ((x - μ)/σ)^k
  // Expand to get coefficients in original x space
  const betaOrig = unscaleCoeffs(
    betaNorm.map(r => r[0]),
    meanX,
    stdX,
  );

  return betaOrig;
}

/**
 * Convert polynomial coefficients from normalized space back to original x space.
 * Given coefficients for ((x-μ)/σ)^k, compute coefficients for x^k.
 */
function unscaleCoeffs(beta: number[], meanX: number, stdX: number): number[] {
  const d = beta.length;
  // Build coefficients using binomial expansion
  // ((x - μ) / σ)^k = (1/σ^k) * Σ C(k,j) * x^j * (-μ)^(k-j)
  const result = new Array(d).fill(0);

  for (let k = 0; k < d; k++) {
    const coeff = beta[k];
    const invSigmaK = 1 / (stdX ** k);
    // Binomial expansion of (x - μ)^k
    for (let j = 0; j <= k; j++) {
      const binom = binomial(k, j);
      const sign = ((k - j) % 2 === 0) ? 1 : -1;
      result[j] += coeff * invSigmaK * binom * sign * (meanX ** (k - j));
    }
  }

  return result;
}

function binomial(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;
  let result = 1;
  for (let i = 0; i < k; i++) {
    result = result * (n - i) / (i + 1);
  }
  return result;
}

/**
 * Fit Ridge regression polynomial.
 */
export function fitRidge(
  points: Point[],
  degree: number,
  lambda: number,
): number[] {
  return fitPolynomial(points, degree, lambda);
}
