import { M } from '@/components/Math';

// ── Ice Cream HMM from Jurafsky/Martin (Chapter 9) ─────────────────
// States: HOT, COLD
// Observations: 1, 2, 3 ice creams
//
// Transitions (with implicit start/final as non-emitting states):
//   start → HOT: 0.8, start → COLD: 0.2
//   HOT → HOT: 0.7, HOT → COLD: 0.3
//   COLD → HOT: 0.4, COLD → COLD: 0.6
//
// Emissions:
//   HOT:  P(1)=0.2  P(2)=0.4  P(3)=0.4
//   COLD: P(1)=0.5  P(2)=0.4  P(3)=0.1

const HOT_POS = { x: 170, y: 150 };
const COLD_POS = { x: 430, y: 150 };
const START_POS = { x: 300, y: 40 };
const R = 40;

const HOT_EMIT = [0.2, 0.4, 0.4];
const COLD_EMIT = [0.5, 0.4, 0.1];

export default function IceCreamHMMViz() {
  return (
    <div className="rounded-lg border border-border bg-card p-4 my-6 space-y-5">
      {/* HMM diagram */}
      <div className="flex justify-center">
        <svg viewBox="0 0 600 460" className="w-full max-w-[600px] h-auto" role="img">
          <defs>
            <marker
              id="hmm-arrow"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted-foreground)" />
            </marker>
          </defs>

          {/* start → HOT */}
          <line
            x1={START_POS.x - 12}
            y1={START_POS.y + 18}
            x2={HOT_POS.x + R * 0.65}
            y2={HOT_POS.y - R * 0.75}
            stroke="var(--muted-foreground)"
            strokeWidth={1.5}
            markerEnd="url(#hmm-arrow)"
          />
          <text x={215} y={85} className="fill-foreground text-[11px] font-mono font-semibold">
            .8
          </text>

          {/* start → COLD */}
          <line
            x1={START_POS.x + 12}
            y1={START_POS.y + 18}
            x2={COLD_POS.x - R * 0.65}
            y2={COLD_POS.y - R * 0.75}
            stroke="var(--muted-foreground)"
            strokeWidth={1.5}
            markerEnd="url(#hmm-arrow)"
          />
          <text x={380} y={85} className="fill-foreground text-[11px] font-mono font-semibold">
            .2
          </text>

          {/* HOT self-loop */}
          <path
            d={`M ${HOT_POS.x - R - 4} ${HOT_POS.y - 8}
                A 24 24 0 1 1 ${HOT_POS.x - R - 4} ${HOT_POS.y + 8}`}
            fill="none"
            stroke="var(--muted-foreground)"
            strokeWidth={1.5}
            markerEnd="url(#hmm-arrow)"
          />
          <text x={80} y={150} className="fill-foreground text-[11px] font-mono font-semibold">
            .7
          </text>

          {/* COLD self-loop */}
          <path
            d={`M ${COLD_POS.x + R + 4} ${COLD_POS.y + 8}
                A 24 24 0 1 1 ${COLD_POS.x + R + 4} ${COLD_POS.y - 8}`}
            fill="none"
            stroke="var(--muted-foreground)"
            strokeWidth={1.5}
            markerEnd="url(#hmm-arrow)"
          />
          <text x={510} y={150} className="fill-foreground text-[11px] font-mono font-semibold">
            .6
          </text>

          {/* HOT → COLD */}
          <path
            d={`M ${HOT_POS.x + R} ${HOT_POS.y - 12} Q 300 110 ${COLD_POS.x - R} ${COLD_POS.y - 12}`}
            fill="none"
            stroke="var(--muted-foreground)"
            strokeWidth={1.5}
            markerEnd="url(#hmm-arrow)"
          />
          <text x={300} y={120} textAnchor="middle" className="fill-foreground text-[11px] font-mono font-semibold">
            .3
          </text>

          {/* COLD → HOT */}
          <path
            d={`M ${COLD_POS.x - R} ${COLD_POS.y + 12} Q 300 195 ${HOT_POS.x + R} ${HOT_POS.y + 12}`}
            fill="none"
            stroke="var(--muted-foreground)"
            strokeWidth={1.5}
            markerEnd="url(#hmm-arrow)"
          />
          <text x={300} y={205} textAnchor="middle" className="fill-foreground text-[11px] font-mono font-semibold">
            .4
          </text>

          {/* start node */}
          <circle
            cx={START_POS.x}
            cy={START_POS.y}
            r={22}
            fill="var(--muted)"
            stroke="var(--muted-foreground)"
            strokeWidth={2}
            strokeDasharray="3 3"
          />
          <text
            x={START_POS.x}
            y={START_POS.y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-foreground text-[11px] font-bold"
          >
            start
          </text>

          {/* HOT node */}
          <circle cx={HOT_POS.x} cy={HOT_POS.y} r={R} fill="#fb923c" stroke="#ea580c" strokeWidth={3} />
          <text
            x={HOT_POS.x}
            y={HOT_POS.y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-[#7c2d12] text-lg font-bold pointer-events-none"
          >
            HOT
          </text>

          {/* COLD node */}
          <circle cx={COLD_POS.x} cy={COLD_POS.y} r={R} fill="#60a5fa" stroke="#2563eb" strokeWidth={3} />
          <text
            x={COLD_POS.x}
            y={COLD_POS.y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-[#1e3a8a] text-lg font-bold pointer-events-none"
          >
            COLD
          </text>

          {/* Emission arrows */}
          <line
            x1={HOT_POS.x}
            y1={HOT_POS.y + R}
            x2={HOT_POS.x}
            y2={HOT_POS.y + R + 60}
            stroke="var(--muted-foreground)"
            strokeWidth={1.5}
            strokeDasharray="4 3"
          />
          <line
            x1={COLD_POS.x}
            y1={COLD_POS.y + R}
            x2={COLD_POS.x}
            y2={COLD_POS.y + R + 60}
            stroke="var(--muted-foreground)"
            strokeWidth={1.5}
            strokeDasharray="4 3"
          />

          {/* Emission boxes */}
          <rect
            x={HOT_POS.x - 90}
            y={HOT_POS.y + R + 60}
            width={180}
            height={150}
            rx={8}
            fill="#fff7ed"
            stroke="#ea580c"
            strokeWidth={1.5}
          />
          <text
            x={HOT_POS.x}
            y={HOT_POS.y + R + 80}
            textAnchor="middle"
            className="fill-[#7c2d12] text-xs font-semibold"
          >
            B(o | HOT)
          </text>
          {HOT_EMIT.map((p, i) => (
            <g key={i}>
              <text
                x={HOT_POS.x - 50}
                y={HOT_POS.y + R + 108 + i * 22}
                className="fill-[#7c2d12] text-[11px] font-mono"
              >
                P({i + 1} | HOT)
              </text>
              <text
                x={HOT_POS.x + 55}
                y={HOT_POS.y + R + 108 + i * 22}
                className="fill-[#7c2d12] text-[11px] font-mono font-bold"
                textAnchor="end"
              >
                {p.toFixed(1)}
              </text>
            </g>
          ))}

          <rect
            x={COLD_POS.x - 90}
            y={COLD_POS.y + R + 60}
            width={180}
            height={150}
            rx={8}
            fill="#eff6ff"
            stroke="#2563eb"
            strokeWidth={1.5}
          />
          <text
            x={COLD_POS.x}
            y={COLD_POS.y + R + 80}
            textAnchor="middle"
            className="fill-[#1e3a8a] text-xs font-semibold"
          >
            B(o | COLD)
          </text>
          {COLD_EMIT.map((p, i) => (
            <g key={i}>
              <text
                x={COLD_POS.x - 50}
                y={COLD_POS.y + R + 108 + i * 22}
                className="fill-[#1e3a8a] text-[11px] font-mono"
              >
                P({i + 1} | COLD)
              </text>
              <text
                x={COLD_POS.x + 55}
                y={COLD_POS.y + R + 108 + i * 22}
                className="fill-[#1e3a8a] text-[11px] font-mono font-bold"
                textAnchor="end"
              >
                {p.toFixed(1)}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <div className="rounded-md bg-muted/40 border border-border p-3 text-sm space-y-2">
        <div className="font-semibold">What you're looking at:</div>
        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
          <li>
            <strong className="text-foreground">Hidden states</strong>: HOT &amp; COLD (the weather — we never see these)
          </li>
          <li>
            <strong className="text-foreground">Observations</strong>: 1, 2, or 3 ice creams (what we do see from Jason's diary)
          </li>
          <li>
            <strong className="text-foreground">Transitions A</strong>: solid arrows between states
          </li>
          <li>
            <strong className="text-foreground">Emissions B</strong>: dashed arrows from each state to its emission box
          </li>
        </ul>
        <div className="pt-1 text-xs text-muted-foreground">
          Intuition: if we see <strong>3 ice creams</strong>, HOT is 4× more likely to emit that than COLD
          (<M>{'P(3\\mid\\text{HOT})=0.4'}</M> vs <M>{'P(3\\mid\\text{COLD})=0.1'}</M>) — but the transition
          model also matters.
        </div>
      </div>
    </div>
  );
}
