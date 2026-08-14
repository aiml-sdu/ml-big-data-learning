import { useRef, useEffect } from 'react';
import type { VacuumState } from '../../lib/agents.ts';
import {
  setupCanvas,
  drawCircle,
  drawRoundRect,
  drawText,
  getThemeColors,
  easeInOut,
} from '../../visualizations/canvas-utils.ts';
import { useContainerSize } from '../../hooks/useContainerSize.ts';

// ---------------------------------------------------------------------------
// Canvas: draw the 2-room vacuum world
// ---------------------------------------------------------------------------

export function drawVacuumWorld(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  state: VacuumState,
  animProgress = 1,
  prevPosition?: 'A' | 'B',
) {
  const colors = getThemeColors();
  const roomW = w * 0.38;
  const roomH = h * 0.55;
  const gap = w * 0.06;
  const roomY = h * 0.22;

  const roomAx = (w - 2 * roomW - gap) / 2;
  const roomBx = roomAx + roomW + gap;

  ctx.clearRect(0, 0, w, h);

  // Room labels
  drawText(ctx, 'Room A', roomAx + roomW / 2, roomY - 14, {
    color: colors.secondary,
    font: 'bold 14px var(--font-sans, system-ui, sans-serif)',
  });
  drawText(ctx, 'Room B', roomBx + roomW / 2, roomY - 14, {
    color: colors.secondary,
    font: 'bold 14px var(--font-sans, system-ui, sans-serif)',
  });

  // Room backgrounds
  const roomAcolor = state.dirtA ? '#d4a574' : '#a8d5a2';
  const roomBcolor = state.dirtB ? '#d4a574' : '#a8d5a2';
  drawRoundRect(ctx, roomAx, roomY, roomW, roomH, 10, roomAcolor, colors.border);
  drawRoundRect(ctx, roomBx, roomY, roomW, roomH, 10, roomBcolor, colors.border);

  // Dirt particles + status labels
  if (state.dirtA) {
    const cx = roomAx + roomW / 2;
    const cy = roomY + roomH * 0.65;
    for (const [dx, dy] of [[-18, -8], [12, 5], [-5, 12], [20, -12], [-12, 6]]) {
      drawCircle(ctx, cx + dx, cy + dy, 4, '#8B6914');
    }
    drawText(ctx, 'Dirty', roomAx + roomW / 2, roomY + roomH + 18, {
      color: '#8B6914',
      font: 'bold 12px var(--font-sans, system-ui, sans-serif)',
    });
  } else {
    drawText(ctx, 'Clean', roomAx + roomW / 2, roomY + roomH + 18, {
      color: '#2d8a3e',
      font: 'bold 12px var(--font-sans, system-ui, sans-serif)',
    });
  }

  if (state.dirtB) {
    const cx = roomBx + roomW / 2;
    const cy = roomY + roomH * 0.65;
    for (const [dx, dy] of [[-15, -5], [10, 8], [-8, 10], [18, -10], [-10, 3]]) {
      drawCircle(ctx, cx + dx, cy + dy, 4, '#8B6914');
    }
    drawText(ctx, 'Dirty', roomBx + roomW / 2, roomY + roomH + 18, {
      color: '#8B6914',
      font: 'bold 12px var(--font-sans, system-ui, sans-serif)',
    });
  } else {
    drawText(ctx, 'Clean', roomBx + roomW / 2, roomY + roomH + 18, {
      color: '#2d8a3e',
      font: 'bold 12px var(--font-sans, system-ui, sans-serif)',
    });
  }

  // Vacuum agent position (interpolate with easing for smooth movement)
  const posAx = roomAx + roomW / 2;
  const posBx = roomBx + roomW / 2;
  const posY = roomY + roomH * 0.35;

  let vacX: number;
  if (prevPosition && prevPosition !== state.position && animProgress < 1) {
    const fromX = prevPosition === 'A' ? posAx : posBx;
    const toX = state.position === 'A' ? posAx : posBx;
    const easedT = easeInOut(animProgress);
    vacX = fromX + (toX - fromX) * easedT;
  } else {
    vacX = state.position === 'A' ? posAx : posBx;
  }

  // Agent body
  drawCircle(ctx, vacX, posY, 22, colors.primary, colors.text);
  // Eyes
  drawCircle(ctx, vacX - 7, posY - 5, 3, 'white');
  drawCircle(ctx, vacX + 7, posY - 5, 3, 'white');
  // Mouth
  ctx.beginPath();
  ctx.arc(vacX, posY + 3, 8, 0.1 * Math.PI, 0.9 * Math.PI);
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Label
  drawText(ctx, 'Agent', vacX, posY + 34, {
    color: colors.primary,
    font: 'bold 12px var(--font-sans, system-ui, sans-serif)',
  });
}

// ---------------------------------------------------------------------------
// React component: looping vacuum animation (section 2.1)
// ---------------------------------------------------------------------------

export default function VacuumWorldViz() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { width: containerW } = useContainerSize(containerRef, { width: 520, height: 220 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || containerW <= 0) return;

    const cw = Math.min(containerW - 32, 520);
    const ch = 220;
    const ctx = setupCanvas(canvas, cw, ch);

    const state: VacuumState = {
      position: 'A',
      dirtA: Math.random() > 0.4,
      dirtB: Math.random() > 0.4,
    };

    drawVacuumWorld(ctx, cw, ch, state);

    let step = 0;
    let animFrame = 0;
    const FRAMES_PER_STEP = 60;
    let prevPos = state.position;
    let rafId = 0;

    function tick() {
      animFrame++;
      if (animFrame >= FRAMES_PER_STEP) {
        animFrame = 0;
        prevPos = state.position;
        step = (step + 1) % 6;

        if (step === 0) {
          state.position = 'A';
          state.dirtA = Math.random() > 0.3;
          state.dirtB = Math.random() > 0.3;
        } else if (step === 1) {
          if (state.position === 'A' && state.dirtA) state.dirtA = false;
          else if (state.position === 'B' && state.dirtB) state.dirtB = false;
        } else if (step === 2) {
          prevPos = state.position;
          state.position = state.position === 'A' ? 'B' : 'A';
        } else if (step === 3) {
          // Observe
        } else if (step === 4) {
          if (state.position === 'A' && state.dirtA) state.dirtA = false;
          else if (state.position === 'B' && state.dirtB) state.dirtB = false;
        } else if (step === 5) {
          prevPos = state.position;
          state.position = 'A';
        }
      }

      const progress = animFrame / FRAMES_PER_STEP;
      const needsAnim = (step === 2 || step === 5) && prevPos !== state.position;
      drawVacuumWorld(ctx, cw, ch, state, needsAnim ? progress : 1, needsAnim ? prevPos : undefined);
      rafId = requestAnimationFrame(tick);
    }
    rafId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafId);
  }, [containerW]);

  return (
    <div className="rounded-lg border bg-card p-4 my-6 overflow-hidden" ref={containerRef}>
      <div className="text-sm font-medium text-muted-foreground mb-3">The Two-Room Vacuum World</div>
      <canvas ref={canvasRef} />
    </div>
  );
}
