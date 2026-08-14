import { useRef, useState, useEffect, useCallback } from 'react';
import { useContainerSize } from '@/hooks/useContainerSize';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const WORLD_W = 700;
const WORLD_H = 350;
const TOTAL_STEPS = 6; // 0..5

// Layout
const ROOM_X = 220;
const ROOM_Y = 50;
const ROOM_W = 260;
const ROOM_H = 200;
const ROOM_R = 14;

const INPUT_START_X = 40;
const INPUT_Y = 150;
const INPUT_ENTER_X = ROOM_X + 40;

const OUTPUT_EXIT_X = ROOM_X + ROOM_W - 40;
const OUTPUT_END_X = 560;
const OUTPUT_Y = 150;

const OBSERVER_X = 630;
const OBSERVER_Y = 140;

const CARD_W = 60;
const CARD_H = 36;

const PERSON_X = ROOM_X + ROOM_W / 2 - 40;
const PERSON_Y = ROOM_Y + 100;

const BOOK_X = ROOM_X + ROOM_W / 2 + 20;
const BOOK_Y = ROOM_Y + 80;
const BOOK_W = 50;
const BOOK_H = 64;

const BUBBLE_X = OBSERVER_X - 90;
const BUBBLE_Y = OBSERVER_Y - 72;
const BUBBLE_W = 130;
const BUBBLE_H = 34;

const INSIGHT_Y = ROOM_Y + ROOM_H + 40;

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StickFigure({
  x,
  y,
  headClass,
  label,
}: {
  x: number;
  y: number;
  headClass: string;
  label: string;
}) {
  return (
    <g>
      {/* Head */}
      <circle cx={x} cy={y - 22} r={12} className={`${headClass} stroke-foreground`} strokeWidth={2} />
      {/* Body */}
      <line x1={x} y1={y - 10} x2={x} y2={y + 20} className="stroke-foreground" strokeWidth={2} />
      {/* Arms */}
      <line x1={x - 14} y1={y + 2} x2={x + 14} y2={y + 2} className="stroke-foreground" strokeWidth={2} />
      {/* Legs */}
      <line x1={x} y1={y + 20} x2={x - 10} y2={y + 36} className="stroke-foreground" strokeWidth={2} />
      <line x1={x} y1={y + 20} x2={x + 10} y2={y + 36} className="stroke-foreground" strokeWidth={2} />
      {/* Label */}
      <text
        x={x}
        y={y + 50}
        textAnchor="middle"
        dominantBaseline="middle"
        className="fill-muted-foreground"
        style={{ fontSize: 11, fontFamily: 'var(--font-sans, system-ui, sans-serif)' }}
      >
        {label}
      </text>
    </g>
  );
}

function SpeechBubble({ opacity }: { opacity: number }) {
  return (
    <g
      style={{
        opacity,
        transition: 'opacity 0.5s ease-out',
      }}
    >
      {/* Bubble rect */}
      <rect
        x={BUBBLE_X}
        y={BUBBLE_Y}
        width={BUBBLE_W}
        height={BUBBLE_H}
        rx={8}
        className="fill-card stroke-foreground"
        strokeWidth={1}
      />
      {/* Tail */}
      <polygon
        points={`${OBSERVER_X - 10},${BUBBLE_Y + BUBBLE_H} ${OBSERVER_X - 4},${BUBBLE_Y + BUBBLE_H + 10} ${OBSERVER_X + 4},${BUBBLE_Y + BUBBLE_H}`}
        className="fill-card stroke-foreground"
        strokeWidth={1}
        strokeLinejoin="round"
      />
      {/* Cover border under tail */}
      <rect
        x={OBSERVER_X - 9}
        y={BUBBLE_Y + BUBBLE_H - 1}
        width={12}
        height={2}
        className="fill-card"
      />
      {/* Text */}
      <text
        x={BUBBLE_X + BUBBLE_W / 2}
        y={BUBBLE_Y + BUBBLE_H / 2}
        textAnchor="middle"
        dominantBaseline="middle"
        className="fill-foreground"
        style={{
          fontSize: 11,
          fontWeight: 'bold',
          fontFamily: 'var(--font-sans, system-ui, sans-serif)',
        }}
      >
        It speaks Chinese!
      </text>
    </g>
  );
}

// ---------------------------------------------------------------------------
// Keyframes for rulebook pulse
// ---------------------------------------------------------------------------

const pulseKeyframes = `
@keyframes rulebook-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.08); }
}
`;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ChineseRoomViz() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { width: containerW } = useContainerSize(containerRef, {
    width: WORLD_W,
    height: WORLD_H,
  });

  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const playTimerRef = useRef(0);

  // Derived animation state from step
  const inputX = step === 0 ? INPUT_START_X : step === 1 ? ROOM_X - CARD_W / 2 - 10 : INPUT_ENTER_X;
  const inputEffectiveOpacity = step >= 3 || step === 0 ? 0 : step === 2 ? 0 : 1;
  const rulebookPulsing = step === 2;
  const outputX = step >= 3 ? OUTPUT_END_X : OUTPUT_EXIT_X;
  const outputOpacity = step >= 3 ? 1 : 0;

  const bubbleOpacity = step >= 4 ? 1 : 0;
  const insightOpacity = step >= 5 ? 1 : 0;

  // Auto-play timer
  useEffect(() => {
    if (!playing) {
      clearTimeout(playTimerRef.current);
      return;
    }

    const delay = step === 0 ? 600 : step === 2 ? 2000 : 1400;

    playTimerRef.current = window.setTimeout(() => {
      setStep((prev) => {
        const next = prev + 1;
        if (next >= TOTAL_STEPS) {
          setPlaying(false);
          return prev;
        }
        return next;
      });
    }, delay);

    return () => clearTimeout(playTimerRef.current);
  }, [playing, step]);

  const handleStep = useCallback(() => {
    setStep((prev) => {
      const next = prev + 1;
      if (next >= TOTAL_STEPS) return prev;
      return next;
    });
    setPlaying(false);
  }, []);

  const handleReset = useCallback(() => {
    setPlaying(false);
    setStep(0);
  }, []);

  const handlePlayPause = useCallback(() => {
    setPlaying((prev) => {
      if (!prev && step === 0) {
        setStep(1);
      }
      return !prev;
    });
  }, [step]);

  const displayW = Math.min(containerW - 16, WORLD_W);

  return (
    <div className="rounded-lg border bg-card p-4 my-6 overflow-hidden" ref={containerRef}>
      <style>{pulseKeyframes}</style>
      <svg
        width={displayW}
        height={Math.round(displayW * (WORLD_H / WORLD_W))}
        viewBox={`0 0 ${WORLD_W} ${WORLD_H}`}
        className="block mx-auto"
        style={{ overflow: 'visible' }}
      >
        {/* ---- Room ---- */}
        <rect
          x={ROOM_X}
          y={ROOM_Y}
          width={ROOM_W}
          height={ROOM_H}
          rx={ROOM_R}
          className="fill-card stroke-border"
          strokeWidth={2}
        />
        <text
          x={ROOM_X + ROOM_W / 2}
          y={ROOM_Y + 22}
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-foreground"
          style={{
            fontSize: 15,
            fontWeight: 'bold',
            fontFamily: 'var(--font-sans, system-ui, sans-serif)',
          }}
        >
          Chinese Room
        </text>

        {/* ---- Person (inside room) ---- */}
        <StickFigure x={PERSON_X} y={PERSON_Y} headClass="fill-primary" label="Person" />

        {/* ---- Rulebook ---- */}
        <g
          style={{
            transformOrigin: `${BOOK_X + BOOK_W / 2}px ${BOOK_Y + BOOK_H / 2}px`,
            animation: rulebookPulsing
              ? 'rulebook-pulse 0.4s ease-in-out infinite'
              : 'none',
            transition: rulebookPulsing ? 'none' : 'transform 0.3s ease-out',
          }}
        >
          <rect
            x={BOOK_X}
            y={BOOK_Y}
            width={BOOK_W}
            height={BOOK_H}
            rx={4}
            className="fill-yellow-400 stroke-foreground"
            strokeWidth={1.5}
          />
          <text
            x={BOOK_X + BOOK_W / 2}
            y={BOOK_Y + BOOK_H / 2 - 8}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-foreground"
            style={{
              fontSize: 11,
              fontWeight: 'bold',
              fontFamily: 'var(--font-sans, system-ui, sans-serif)',
            }}
          >
            Rule
          </text>
          <text
            x={BOOK_X + BOOK_W / 2}
            y={BOOK_Y + BOOK_H / 2 + 8}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-foreground"
            style={{
              fontSize: 11,
              fontWeight: 'bold',
              fontFamily: 'var(--font-sans, system-ui, sans-serif)',
            }}
          >
            Book
          </text>
        </g>

        {/* ---- Arrows ---- */}
        <text
          x={ROOM_X - 16}
          y={INPUT_Y}
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-muted-foreground"
          style={{ fontSize: 20, fontFamily: 'var(--font-sans, system-ui, sans-serif)' }}
        >
          {'\u2192'}
        </text>
        <text
          x={ROOM_X + ROOM_W + 6}
          y={OUTPUT_Y}
          textAnchor="start"
          dominantBaseline="middle"
          className="fill-muted-foreground"
          style={{ fontSize: 20, fontFamily: 'var(--font-sans, system-ui, sans-serif)' }}
        >
          {'\u2192'}
        </text>

        {/* ---- Input card ---- */}
        <g
          style={{
            opacity: inputEffectiveOpacity,
            transform: `translateX(${inputX - INPUT_START_X}px)`,
            transition: 'transform 0.7s ease-out, opacity 0.5s ease-out',
          }}
        >
          <rect
            x={INPUT_START_X - CARD_W / 2}
            y={INPUT_Y - CARD_H / 2}
            width={CARD_W}
            height={CARD_H}
            rx={6}
            className="fill-red-500"
            stroke="currentColor"
            strokeWidth={1}
          />
          <text
            x={INPUT_START_X}
            y={INPUT_Y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="white"
            style={{
              fontSize: 16,
              fontWeight: 'bold',
              fontFamily: 'var(--font-sans, system-ui, sans-serif)',
            }}
          >
            {'\u4f60\u597d'}
          </text>
        </g>

        {/* ---- Input label ---- */}
        {step >= 1 && (
          <text
            x={INPUT_START_X}
            y={INPUT_Y - 30}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-muted-foreground"
            style={{ fontSize: 11, fontFamily: 'var(--font-sans, system-ui, sans-serif)' }}
          >
            Input
          </text>
        )}

        {/* ---- Output card ---- */}
        <g
          style={{
            opacity: outputOpacity,
            transform: `translateX(${outputX - OUTPUT_EXIT_X}px)`,
            transition: 'transform 0.7s ease-out, opacity 0.3s ease-out',
          }}
        >
          <rect
            x={OUTPUT_EXIT_X - CARD_W / 2}
            y={OUTPUT_Y - CARD_H / 2}
            width={CARD_W}
            height={CARD_H}
            rx={6}
            className="fill-green-500"
            stroke="currentColor"
            strokeWidth={1}
          />
          <text
            x={OUTPUT_EXIT_X}
            y={OUTPUT_Y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="white"
            style={{
              fontSize: 14,
              fontWeight: 'bold',
              fontFamily: 'var(--font-sans, system-ui, sans-serif)',
            }}
          >
            {'\u4f60\u597d\u4e16\u754c'}
          </text>
        </g>

        {/* ---- Output label ---- */}
        {step >= 3 && (
          <text
            x={OUTPUT_END_X}
            y={OUTPUT_Y - 30}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-muted-foreground"
            style={{ fontSize: 11, fontFamily: 'var(--font-sans, system-ui, sans-serif)' }}
          >
            Output
          </text>
        )}

        {/* ---- Observer ---- */}
        <StickFigure x={OBSERVER_X} y={OBSERVER_Y} headClass="fill-muted-foreground" label="Observer" />

        {/* ---- Speech bubble ---- */}
        <SpeechBubble opacity={bubbleOpacity} />

        {/* ---- Insight banner ---- */}
        <g
          style={{
            opacity: insightOpacity,
            transition: 'opacity 0.6s ease-out',
          }}
        >
          <rect
            x={WORLD_W / 2 - 190}
            y={INSIGHT_Y - 16}
            width={380}
            height={36}
            rx={8}
            className="fill-primary"
          />
          <text
            x={WORLD_W / 2}
            y={INSIGHT_Y + 2}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="white"
            style={{
              fontSize: 14,
              fontWeight: 'bold',
              fontFamily: 'var(--font-sans, system-ui, sans-serif)',
            }}
          >
            But nobody inside understands Chinese
          </text>
        </g>

        {/* ---- Step indicator ---- */}
        <text
          x={WORLD_W / 2}
          y={WORLD_H - 16}
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-muted-foreground"
          style={{ fontSize: 12, fontFamily: 'var(--font-sans, system-ui, sans-serif)' }}
        >
          {`Step ${step} / ${TOTAL_STEPS - 1}`}
        </text>
      </svg>

      {/* ---- Controls ---- */}
      <div className="flex items-center justify-center gap-2 mt-3">
        <button
          onClick={handlePlayPause}
          className="px-3 py-1.5 text-sm rounded-md border bg-background hover:bg-muted transition-colors"
        >
          {playing ? 'Pause' : 'Play'}
        </button>
        <button
          onClick={handleStep}
          disabled={step >= TOTAL_STEPS - 1}
          className="px-3 py-1.5 text-sm rounded-md border bg-background hover:bg-muted transition-colors disabled:opacity-40"
        >
          Step
        </button>
        <button
          onClick={handleReset}
          className="px-3 py-1.5 text-sm rounded-md border bg-background hover:bg-muted transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
