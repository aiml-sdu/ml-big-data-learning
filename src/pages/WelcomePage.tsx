import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Lock, TerminalSquare } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import { useCourseProgress } from '@/hooks/useCourseProgress';
import { NAV_TOPICS } from '@/data/nav-topics';
import { useCallback, useEffect, useState } from 'react';

// Derive topics from the single source of truth
const ALL_TOPICS = NAV_TOPICS.filter((t) => t.number > 0);

const DESCRIPTIONS: Record<string, string> = {
  'topic-01': 'What AI is, its history, and where it stands today',
  'topic-02': 'How agents sense, think, and act in their environments',
  'topic-03': 'BFS, DFS, and uniform-cost search on graph problems',
  'topic-04': 'Heuristics, greedy best-first, and A* search',
  'topic-05': 'Hill climbing, simulated annealing, and genetic algorithms',
  'topic-06': 'Game playing, minimax, and alpha-beta pruning',
  'topic-07': 'CSPs, backtracking, and constraint propagation',
  'topic-08': 'Probability, Bayes\' rule, and Bayesian Networks',
  'topic-09': 'Temporal models and sequence prediction',
  'topic-10': 'Introduction to machine learning plus student-success classification with trees, forests, and confusion matrices',
  'topic-11': 'Continuous prediction with regression models',
  'topic-12': 'Interactive clustering with K-means, dendrograms, DBSCAN, and cluster validity',
};

const NODE_SIZE = 64;
const ROW_HEIGHT = 160;
const TEXT_OFFSET = 44; // gap from circle edge to text

function useIsSmall() {
  const [small, setSmall] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)');
    setSmall(mq.matches);
    const handler = (e: MediaQueryListEvent) => setSmall(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return small;
}

// Snake: center → right → center → left → repeat
function getOffset(i: number): number {
  const phase = i % 4;
  return phase === 0 ? 0 : phase === 1 ? 1 : phase === 2 ? 0 : -1;
}

export default function WelcomePage() {
  const { isSignedIn } = useAuth();
  const progress = useCourseProgress();
  const isSmall = useIsSmall();
  const AMP = isSmall ? 40 : 100;
  const plannedTopicCount = NAV_TOPICS.filter((t) => t.number > 0).length;
  const unlockedTopicCount = NAV_TOPICS.filter((t) => t.number > 0 && !t.locked).length;

  // Review mode: enabled if user is signed in OR if VITE_REVIEW_MODE env var is set
  const reviewMode = isSignedIn || !!import.meta.env.VITE_REVIEW_MODE;

  let totalVisited = 0;
  let totalSections = 0;
  for (const t of NAV_TOPICS) {
    if (t.locked || t.sections.length === 0) continue;
    const tp = progress.get(t.id);
    if (tp) {
      totalVisited += tp.visited;
      totalSections += tp.total;
    }
  }
  const overallPct =
    totalSections > 0 ? Math.round((totalVisited / totalSections) * 100) : 0;

  const nodes = ALL_TOPICS.map((topic) => {
    const accessible = !topic.locked || reviewMode;
    const tp = accessible ? progress.get(topic.id) : undefined;
    const isComplete = tp?.pct === 100;
    const inProgress = !!(tp && tp.visited > 0 && !isComplete);
    const offsetX = getOffset(topic.number - 1) * AMP;
    const y = (topic.number - 1) * ROW_HEIGHT;
    const textSide: 'left' | 'right' = (topic.number - 1) % 2 === 0 ? 'right' : 'left';
    return { topic, accessible, tp, isComplete, inProgress, offsetX, y, textSide };
  });

  const containerHeight = (ALL_TOPICS.length - 1) * ROW_HEIGHT + NODE_SIZE;

  // "Not released yet" popup state
  const [tappedId, setTappedId] = useState<string | null>(null);
  const handleLockedClick = useCallback((id: string) => {
    setTappedId(id);
    setTimeout(() => setTappedId(null), 1500);
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Hero */}
      <section className="text-center mb-6">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-2">AI101</h1>
        <p className="text-lg text-muted-foreground mb-1">
          An Interactive Course in Artificial Intelligence
        </p>
        <p className="text-xs text-muted-foreground/70 mt-3 max-w-md mx-auto leading-relaxed">
          {plannedTopicCount} topics planned &middot; {unlockedTopicCount} unlocked now. Built with Claude Opus 4.6.
          <br />
          Content reviewed and verified by TAs and Professor.
          <br />
          Bugs or feedback? Email{' '}
          <a
            href="mailto:phkon23@student.sdu.dk"
            className="underline underline-offset-2 hover:text-foreground transition-colors"
          >
            phkon23@student.sdu.dk
          </a>
        </p>
      </section>

      <section className="mb-8">
        <Link
          to="/ml-setup"
          className="not-prose block rounded-2xl border bg-card p-5 transition-colors hover:bg-muted/30"
        >
          <div className="flex items-start gap-4">
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <TerminalSquare className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Optional Local Setup
              </p>
              <h2 className="mt-1 text-lg font-semibold tracking-tight">
                Set up Conda and Jupyter for ML notebooks
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                A short setup lesson with the exact commands students need if they want to run the
                student-success classification notebook locally instead of using Google Colab.
              </p>
            </div>
          </div>
        </Link>
      </section>

      {/* Overall progress */}
      {totalVisited > 0 && (
        <div className="mb-8 rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">
              {totalVisited} of {totalSections} sections completed
            </span>
            <span className="text-sm text-muted-foreground">{overallPct}%</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${overallPct}%` }}
            />
          </div>
        </div>
      )}

      {/* Winding path */}
      <div className="relative" style={{ height: containerHeight }}>
        {/* SVG connectors */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
          viewBox={`${-(AMP + NODE_SIZE)} 0 ${(AMP + NODE_SIZE) * 2} ${containerHeight}`}
          preserveAspectRatio="xMidYMin meet"
          aria-hidden
        >
          {nodes.slice(0, -1).map((node, i) => {
            const next = nodes[i + 1];
            const x1 = node.offsetX;
            const y1 = node.y + NODE_SIZE / 2;
            const x2 = next.offsetX;
            const y2 = next.y + NODE_SIZE / 2;
            const midY = (y1 + y2) / 2;
            return (
              <path
                key={i}
                d={`M ${x1} ${y1} Q ${x1} ${midY}, ${x2} ${y2}`}
                fill="none"
                className={next.accessible ? 'stroke-primary/40' : 'stroke-muted-foreground/30'}
                strokeWidth={2.5}
                strokeDasharray={next.accessible ? 'none' : '6 4'}
              />
            );
          })}
        </svg>

        {/* Nodes — circle center anchored at (50% + offsetX, y + NODE_SIZE/2) */}
        {nodes.map((node, i) => {
          const { topic, accessible, tp, isComplete, inProgress, offsetX, y, textSide } = node;

          const circleClasses = isComplete
            ? 'bg-green-600 text-white shadow-lg shadow-green-600/30'
            : inProgress
              ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
              : accessible
                ? 'border-2 border-primary bg-card text-primary shadow-md hover:shadow-lg hover:scale-105'
                : 'border-2 border-muted bg-muted/50 text-muted-foreground';

          const content = (
            <motion.div
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1, duration: 0.4, ease: 'easeOut' }}
              className="relative"
              style={{ width: NODE_SIZE, height: NODE_SIZE }}
            >
              {/* Pulse ring */}
              {inProgress && (
                <span className="absolute inset-0 rounded-full animate-ping bg-primary/20" />
              )}
              {/* Progress arc */}
              {inProgress && tp && (
                <svg className="absolute -inset-1 pointer-events-none" viewBox="0 0 68 68" aria-hidden>
                  <circle cx="34" cy="34" r="31" fill="none" className="stroke-muted" strokeWidth="3" />
                  <circle
                    cx="34" cy="34" r="31" fill="none"
                    className="stroke-primary" strokeWidth="3" strokeLinecap="round"
                    strokeDasharray={`${(tp.pct / 100) * 2 * Math.PI * 31} ${2 * Math.PI * 31}`}
                    transform="rotate(-90 34 34)"
                  />
                </svg>
              )}
              {/* Circle */}
              <div
                className={`relative z-10 w-full h-full flex items-center justify-center rounded-full transition-all duration-300 ${circleClasses}`}
              >
                {isComplete ? (
                  <Check className="size-6" strokeWidth={3} />
                ) : !accessible ? (
                  <Lock className="size-5" />
                ) : (
                  <span className="text-lg font-bold">{topic.number}</span>
                )}
              </div>

              {/* Text label — absolutely positioned relative to circle */}
              <div
                className="absolute top-1/2 -translate-y-1/2 w-36 sm:w-44 hidden sm:block"
                style={
                  textSide === 'right'
                    ? { left: NODE_SIZE + TEXT_OFFSET }
                    : { right: NODE_SIZE + TEXT_OFFSET }
                }
              >
                <div className={textSide === 'left' ? 'text-right' : 'text-left'}>
                  <p className="text-sm font-semibold text-foreground leading-tight">
                    {topic.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                    {DESCRIPTIONS[topic.id]}
                  </p>
                  {inProgress && tp && (
                    <p className="text-xs text-primary mt-1">
                      {tp.visited}/{tp.total} sections
                    </p>
                  )}
                </div>
              </div>

              {/* Mobile text — below circle */}
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-40 text-center sm:hidden">
                <p className="text-xs font-semibold text-foreground leading-tight">
                  {topic.title}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                  {DESCRIPTIONS[topic.id]}
                </p>
              </div>
            </motion.div>
          );

          return (
            <div
              key={topic.id}
              className="absolute"
              style={{
                top: y,
                left: `calc(50% + ${offsetX}px - ${NODE_SIZE / 2}px)`,
              }}
            >
              {accessible ? (
                <Link to={`/${topic.id}`} className="no-underline block">
                  {content}
                </Link>
              ) : (
                <button
                  type="button"
                  className="appearance-none bg-transparent border-none p-0 relative"
                  onClick={() => handleLockedClick(topic.id)}
                >
                  {content}
                  {tappedId === topic.id && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="absolute left-1/2 -translate-x-1/2 -top-10 z-20 whitespace-nowrap rounded-md bg-foreground text-background px-3 py-1.5 text-xs font-medium shadow-lg"
                    >
                      Not released yet :)
                    </motion.div>
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
