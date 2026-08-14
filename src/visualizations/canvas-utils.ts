/**
 * Shared Canvas 2D drawing utilities — DPI-aware, theme-respectful helpers.
 */

// ---------- DPI-aware canvas setup ----------

export function setupCanvas(
  canvas: HTMLCanvasElement,
  width: number,
  height: number,
): CanvasRenderingContext2D {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  const ctx = canvas.getContext('2d')!;
  ctx.scale(dpr, dpr);
  return ctx;
}

// ---------- Drawing helpers ----------

export function drawCircle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  fill: string,
  stroke?: string,
): void {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.stroke();
  }
}

export function drawLine(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string,
  width = 1,
): void {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.stroke();
}

export function drawArrow(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string,
  width = 1,
): void {
  const headLen = 10;
  const angle = Math.atan2(y2 - y1, x2 - x1);

  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.stroke();

  // Arrowhead
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(
    x2 - headLen * Math.cos(angle - Math.PI / 6),
    y2 - headLen * Math.sin(angle - Math.PI / 6),
  );
  ctx.lineTo(
    x2 - headLen * Math.cos(angle + Math.PI / 6),
    y2 - headLen * Math.sin(angle + Math.PI / 6),
  );
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

export function drawText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  options: {
    color?: string;
    font?: string;
    align?: CanvasTextAlign;
    baseline?: CanvasTextBaseline;
  } = {},
): void {
  ctx.fillStyle = options.color ?? getThemeColors().text;
  ctx.font = options.font ?? '14px var(--font-sans, system-ui, sans-serif)';
  ctx.textAlign = options.align ?? 'center';
  ctx.textBaseline = options.baseline ?? 'middle';
  ctx.fillText(text, x, y);
}

export function drawRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  fill: string,
  stroke?: string,
): void {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.stroke();
  }
}

// ---------- Theme colors ----------

function resolveOklch(raw: string, fallback: string): string {
  // If the value is an oklch() string, resolve it to a hex/rgb color via a temp element
  if (raw.startsWith('oklch(')) {
    const el = document.createElement('div');
    el.style.color = raw;
    document.body.appendChild(el);
    const resolved = getComputedStyle(el).color;
    document.body.removeChild(el);
    return resolved || fallback;
  }
  return raw || fallback;
}

export function getThemeColors(): {
  bg: string;
  surface: string;
  text: string;
  primary: string;
  secondary: string;
  success: string;
  error: string;
  warning: string;
  border: string;
} {
  const style = getComputedStyle(document.documentElement);
  const get = (prop: string, fallback: string) => {
    const raw = style.getPropertyValue(prop).trim();
    return resolveOklch(raw, fallback);
  };

  return {
    bg:        get('--background', '#ffffff'),
    surface:   get('--card', '#ffffff'),
    text:      get('--foreground', '#111827'),
    primary:   get('--primary', '#4f46e5'),
    secondary: get('--muted-foreground', '#6b7280'),
    success:   get('--color-success', '#10b981'),
    error:     get('--color-error', '#ef4444'),
    warning:   get('--color-warning', '#f59e0b'),
    border:    get('--border', '#e5e7eb'),
  };
}

// ---------- Grid drawing ----------

export function drawGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  cellSize: number,
  color?: string,
): void {
  const c = color ?? getThemeColors().border;
  ctx.strokeStyle = c;
  ctx.lineWidth = 0.5;

  for (let x = 0; x <= width; x += cellSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  for (let y = 0; y <= height; y += cellSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
}

// ---------- Animation easing ----------

export function easeInOut(t: number): number {
  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}
