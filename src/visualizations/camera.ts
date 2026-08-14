/**
 * Camera type + transform math for pan/zoom canvas visualizations.
 */

export interface Camera {
  x: number; // translation X (world offset)
  y: number; // translation Y (world offset)
  zoom: number; // scale factor
}

export interface CameraOptions {
  minZoom?: number;
  maxZoom?: number;
  boundsPadding?: number;
}

const DEFAULTS: Required<CameraOptions> = {
  minZoom: 0.3,
  maxZoom: 5,
  boundsPadding: 40,
};

export function createCamera(overrides?: Partial<Camera>): Camera {
  return { x: 0, y: 0, zoom: 1, ...overrides };
}

export function applyTransform(
  ctx: CanvasRenderingContext2D,
  camera: Camera,
): void {
  ctx.translate(camera.x, camera.y);
  ctx.scale(camera.zoom, camera.zoom);
}

export function screenToWorld(
  sx: number,
  sy: number,
  camera: Camera,
): { x: number; y: number } {
  return {
    x: (sx - camera.x) / camera.zoom,
    y: (sy - camera.y) / camera.zoom,
  };
}

export function worldToScreen(
  wx: number,
  wy: number,
  camera: Camera,
): { x: number; y: number } {
  return {
    x: wx * camera.zoom + camera.x,
    y: wy * camera.zoom + camera.y,
  };
}

/**
 * Calculate a camera that fits the given world-space bounding box
 * into the given screen dimensions.
 */
export function fitToView(
  screenW: number,
  screenH: number,
  worldBounds: { x: number; y: number; w: number; h: number },
  opts?: CameraOptions,
): Camera {
  const o = { ...DEFAULTS, ...opts };
  const pad = o.boundsPadding;

  const scaleX = (screenW - pad * 2) / worldBounds.w;
  const scaleY = (screenH - pad * 2) / worldBounds.h;
  const zoom = Math.max(o.minZoom, Math.min(o.maxZoom, Math.min(scaleX, scaleY)));

  const cx = worldBounds.x + worldBounds.w / 2;
  const cy = worldBounds.y + worldBounds.h / 2;

  return {
    x: screenW / 2 - cx * zoom,
    y: screenH / 2 - cy * zoom,
    zoom,
  };
}

export function clampZoom(zoom: number, opts?: CameraOptions): number {
  const o = { ...DEFAULTS, ...opts };
  return Math.max(o.minZoom, Math.min(o.maxZoom, zoom));
}
