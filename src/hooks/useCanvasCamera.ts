import { useCallback, useEffect, useRef, useState } from 'react';
import {
  type Camera,
  type CameraOptions,
  createCamera,
  clampZoom,
  fitToView,
  applyTransform,
  screenToWorld,
} from '../visualizations/camera';

export interface UseCanvasCameraOptions extends CameraOptions {
  /** Initial camera (if not provided, defaults to identity) */
  initial?: Partial<Camera>;
  /** Which mouse button triggers pan (0=left, 2=right). Default 0. */
  panButton?: number;
  /** Disable pan entirely */
  panDisabled?: boolean;
  /** Disable zoom entirely */
  zoomDisabled?: boolean;
}

export function useCanvasCamera(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  opts: UseCanvasCameraOptions = {},
) {
  const optsRef = useRef(opts);
  optsRef.current = opts;

  const [camera, setCamera] = useState<Camera>(() =>
    createCamera(opts.initial),
  );
  const cameraRef = useRef(camera);
  cameraRef.current = camera;

  const isPanningRef = useRef(false);
  const panStartRef = useRef({ x: 0, y: 0, camX: 0, camY: 0 });

  // Touch state for pinch zoom
  const touchRef = useRef<{
    startDist: number;
    startZoom: number;
    startMid: { x: number; y: number };
    startCam: { x: number; y: number };
  } | null>(null);

  // Mouse pan
  const handleMouseDown = useCallback((e: MouseEvent) => {
    const o = optsRef.current;
    if (o.panDisabled) return;
    const btn = o.panButton ?? 0;
    if (e.button !== btn) return;

    isPanningRef.current = true;
    panStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      camX: cameraRef.current.x,
      camY: cameraRef.current.y,
    };
    e.preventDefault();
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isPanningRef.current) return;
    const dx = e.clientX - panStartRef.current.x;
    const dy = e.clientY - panStartRef.current.y;
    setCamera((prev) => ({
      ...prev,
      x: panStartRef.current.camX + dx,
      y: panStartRef.current.camY + dy,
    }));
  }, []);

  const handleMouseUp = useCallback(() => {
    isPanningRef.current = false;
  }, []);

  // Scroll zoom — requires Ctrl/Meta so page scroll isn't hijacked
  const handleWheel = useCallback((e: WheelEvent) => {
    const o = optsRef.current;
    if (o.zoomDisabled) return;
    if (!e.ctrlKey && !e.metaKey) return; // let page scroll through
    e.preventDefault();

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    // Mouse position in CSS-pixel canvas space
    const mx = (e.clientX - rect.left) * (canvas.width / dpr / rect.width);
    const my = (e.clientY - rect.top) * (canvas.height / dpr / rect.height);

    const zoomFactor = e.deltaY < 0 ? 1.08 : 1 / 1.08;

    setCamera((prev) => {
      const newZoom = clampZoom(prev.zoom * zoomFactor, o);
      const scale = newZoom / prev.zoom;
      return {
        x: mx - (mx - prev.x) * scale,
        y: my - (my - prev.y) * scale,
        zoom: newZoom,
      };
    });
  }, [canvasRef]);

  // Touch handlers for pinch zoom + pan
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const t0 = e.touches[0];
      const t1 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY);
      touchRef.current = {
        startDist: dist,
        startZoom: cameraRef.current.zoom,
        startMid: {
          x: (t0.clientX + t1.clientX) / 2,
          y: (t0.clientY + t1.clientY) / 2,
        },
        startCam: { x: cameraRef.current.x, y: cameraRef.current.y },
      };
    } else if (e.touches.length === 1 && !optsRef.current.panDisabled) {
      isPanningRef.current = true;
      panStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        camX: cameraRef.current.x,
        camY: cameraRef.current.y,
      };
    }
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (e.touches.length === 2 && touchRef.current) {
      e.preventDefault();
      const t0 = e.touches[0];
      const t1 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY);
      const o = optsRef.current;
      const newZoom = clampZoom(
        touchRef.current.startZoom * (dist / touchRef.current.startDist),
        o,
      );

      const midX = (t0.clientX + t1.clientX) / 2;
      const midY = (t0.clientY + t1.clientY) / 2;
      const dx = midX - touchRef.current.startMid.x;
      const dy = midY - touchRef.current.startMid.y;

      setCamera({
        x: touchRef.current.startCam.x + dx,
        y: touchRef.current.startCam.y + dy,
        zoom: newZoom,
      });
    } else if (e.touches.length === 1 && isPanningRef.current) {
      const dx = e.touches[0].clientX - panStartRef.current.x;
      const dy = e.touches[0].clientY - panStartRef.current.y;
      setCamera((prev) => ({
        ...prev,
        x: panStartRef.current.camX + dx,
        y: panStartRef.current.camY + dy,
      }));
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    touchRef.current = null;
    isPanningRef.current = false;
  }, []);

  // Context menu prevention for right-click pan
  const handleContextMenu = useCallback((e: MouseEvent) => {
    if (optsRef.current.panButton === 2) {
      e.preventDefault();
    }
  }, []);

  // Attach / detach
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd);
    canvas.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('wheel', handleWheel);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
      canvas.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [canvasRef, handleMouseDown, handleMouseMove, handleMouseUp, handleWheel, handleTouchStart, handleTouchMove, handleTouchEnd, handleContextMenu]);

  const doFitToView = useCallback(
    (
      screenW: number,
      screenH: number,
      worldBounds: { x: number; y: number; w: number; h: number },
    ) => {
      const cam = fitToView(screenW, screenH, worldBounds, optsRef.current);
      setCamera(cam);
    },
    [],
  );

  const doScreenToWorld = useCallback(
    (sx: number, sy: number) => screenToWorld(sx, sy, cameraRef.current),
    [],
  );

  return {
    camera,
    setCamera,
    applyTransform: (ctx: CanvasRenderingContext2D) =>
      applyTransform(ctx, cameraRef.current),
    screenToWorld: doScreenToWorld,
    fitToView: doFitToView,
  };
}
