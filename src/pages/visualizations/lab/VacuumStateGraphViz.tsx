import { useCallback, useEffect, useMemo, useRef, useState, memo } from 'react';
import {
  ReactFlow,
  Handle,
  Position,
  type Node,
  type Edge,
  type NodeProps,
  type NodeMouseHandler,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { motion, AnimatePresence } from 'framer-motion';
import AlgoControls from '@/components/AlgoControls';
import CalloutBox from '@/components/CalloutBox';
import { Button } from '@/components/ui/button';
import { useResolvedColors } from '@/hooks/useResolvedColors';
import { AnimationController } from '@/visualizations/animation-loop';
import { bfs, dfs, type SearchState, type FringeEntry } from '@/lib/search';
import {
  ALL_STATES,
  getVacuumNeighbors,
  getVacuumSearchNeighbors,
  isGoal,
  STATE_POSITIONS,
  decodeState,
} from '@/lib/vacuum-search';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface VacuumStateGraphVizProps {
  mode: 'explore' | 'bfs' | 'dfs-loop';
  onComplete?: () => void;
}

type VacuumNodeState = 'default' | 'current' | 'fringe' | 'explored' | 'solution';

interface VacuumNodeData {
  stateId: string;
  pos: string;
  roomA: string;
  roomB: string;
  isGoalState: boolean;
  nodeState: VacuumNodeState;
  clickable: boolean;
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const POSITION_SCALE = 1.4;

const NODE_BG: Record<VacuumNodeState, string> = {
  default: 'var(--muted)',
  current: 'var(--muted)',
  fringe: '#fef08a',
  explored: '#bbf7d0',
  solution: '#93c5fd',
};

const NODE_OUTLINE: Record<VacuumNodeState, string> = {
  default: 'transparent',
  current: '#ef4444',
  fringe: 'transparent',
  explored: 'transparent',
  solution: '#3b82f6',
};

const ROOM_COLORS = { D: '#d4a574', C: '#86efac' } as const;

// ---------------------------------------------------------------------------
// Custom VacuumNode component
// ---------------------------------------------------------------------------

function VacuumNodeComponent({ data }: NodeProps) {
  const { pos, roomA, roomB, isGoalState, nodeState, clickable } =
    data as VacuumNodeData;

  const bgColor = NODE_BG[nodeState];
  const outlineColor = NODE_OUTLINE[nodeState];
  const pulsing = nodeState === 'current';

  const label = `(${pos}, ${roomA === 'D' ? 'Dirty' : 'Clean'}, ${roomB === 'D' ? 'Dirty' : 'Clean'})`;

  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-transparent !border-0 !w-0 !h-0"
      />
      <motion.div
        animate={
          pulsing
            ? {
                boxShadow: [
                  '0 0 0 0px rgba(239,68,68,0.4)',
                  '0 0 0 6px rgba(239,68,68,0)',
                ],
              }
            : { boxShadow: '0 0 0 0px rgba(0,0,0,0)' }
        }
        transition={pulsing ? { duration: 0.8, repeat: Infinity } : { duration: 0.2 }}
        style={{
          width: 120,
          height: 80,
          backgroundColor: bgColor,
          border: isGoalState
            ? '2px solid #22c55e'
            : `2px solid ${outlineColor}`,
          borderRadius: 8,
          cursor: clickable ? 'pointer' : 'default',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4,
          transition: 'background-color 300ms',
          padding: '4px 0',
        }}
      >
        {/* Mini vacuum world: two rooms side-by-side */}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {/* Room A */}
          <div
            style={{
              width: 36,
              height: 28,
              backgroundColor: ROOM_COLORS[roomA as 'D' | 'C'],
              borderRadius: 4,
              position: 'relative',
              border: '1px solid rgba(0,0,0,0.15)',
            }}
          >
            <span
              style={{
                position: 'absolute',
                top: -8,
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: 8,
                fontWeight: 600,
                color: 'var(--muted-foreground)',
              }}
            >
              A
            </span>
            {pos === 'A' && (
              <div
                style={{
                  position: 'absolute',
                  bottom: 3,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: '#1a1a1a',
                  border: '1.5px solid #555',
                }}
              />
            )}
          </div>
          {/* Room B */}
          <div
            style={{
              width: 36,
              height: 28,
              backgroundColor: ROOM_COLORS[roomB as 'D' | 'C'],
              borderRadius: 4,
              position: 'relative',
              border: '1px solid rgba(0,0,0,0.15)',
            }}
          >
            <span
              style={{
                position: 'absolute',
                top: -8,
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: 8,
                fontWeight: 600,
                color: 'var(--muted-foreground)',
              }}
            >
              B
            </span>
            {pos === 'B' && (
              <div
                style={{
                  position: 'absolute',
                  bottom: 3,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: '#1a1a1a',
                  border: '1.5px solid #555',
                }}
              />
            )}
          </div>
        </div>
        {/* Label */}
        <div
          style={{
            fontSize: 9,
            fontWeight: 500,
            color: 'var(--muted-foreground)',
            whiteSpace: 'nowrap',
            lineHeight: 1,
          }}
        >
          {label}
        </div>
      </motion.div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-transparent !border-0 !w-0 !h-0"
      />
    </>
  );
}

const MemoVacuumNode = memo(VacuumNodeComponent);

const nodeTypes = { vacuumNode: MemoVacuumNode };

// ---------------------------------------------------------------------------
// Edge helpers
// ---------------------------------------------------------------------------

function buildAllEdges(): Edge[] {
  const seen = new Set<string>();
  const edges: Edge[] = [];

  for (const state of ALL_STATES) {
    const neighbors = getVacuumNeighbors(state);
    for (const { city, action } of neighbors) {
      const edgeKey = [state, city].sort().join('::');
      const id = `${state}-${city}-${action}`;
      if (seen.has(edgeKey + action)) continue;
      seen.add(edgeKey + action);

      edges.push({
        id,
        source: state,
        target: city,
        label: action,
        type: 'default',
        labelBgPadding: [4, 2] as [number, number],
      });
    }
  }

  return edges;
}

const ALL_EDGES = buildAllEdges();

/** Apply resolved CSS colors to edge styles (for SVG rendering). */
function styleEdges(
  edges: Edge[],
  colors: { border: string; mutedForeground: string; card: string },
): Edge[] {
  return edges.map((e) => ({
    ...e,
    style: { stroke: colors.border, strokeWidth: 1.5, ...e.style },
    labelStyle: { fontSize: 10, fill: colors.mutedForeground, ...e.labelStyle },
    labelBgStyle: { fill: colors.card, fillOpacity: 0.85, ...e.labelBgStyle },
  }));
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function collectStates(gen: Generator<SearchState>): SearchState[] {
  const states: SearchState[] = [];
  for (const s of gen) states.push(s);
  return states;
}

function formatFringe(fringe: FringeEntry[]): string {
  if (fringe.length === 0) return '';
  return fringe.map((e) => e.node).join(' -> ');
}

function makeNodes(
  nodeStates: Record<string, VacuumNodeState>,
  clickableSet?: Set<string>,
): Node[] {
  return ALL_STATES.map((stateId) => {
    const decoded = decodeState(stateId);
    const pos = STATE_POSITIONS[stateId];
    return {
      id: stateId,
      type: 'vacuumNode',
      position: { x: pos.x * POSITION_SCALE, y: pos.y * POSITION_SCALE },
      data: {
        stateId,
        pos: decoded.pos,
        roomA: decoded.roomA,
        roomB: decoded.roomB,
        isGoalState: isGoal(stateId),
        nodeState: nodeStates[stateId] ?? 'default',
        clickable: clickableSet?.has(stateId) ?? false,
      } satisfies VacuumNodeData,
      draggable: false,
      selectable: false,
      connectable: false,
    };
  });
}

// ---------------------------------------------------------------------------
// DFS Tree Search generator (no explored set -- loops forever)
// ---------------------------------------------------------------------------

interface DFSTreeState {
  type: 'expand' | 'check' | 'solution';
  current: string;
  fringe: string[];
  visited: string[]; // order of visits, may have duplicates
  message: string;
  path?: string[];
}

function* dfsTreeSearch(start: string): Generator<DFSTreeState> {
  const fringe = [start];
  const visited: string[] = [];

  while (fringe.length > 0) {
    const node = fringe.pop()!;
    visited.push(node);

    yield {
      type: 'expand',
      current: node,
      fringe: [...fringe],
      visited: [...visited],
      message: `Expanding ${node} (visit #${visited.length})`,
    };

    if (isGoal(node)) {
      yield {
        type: 'solution',
        current: node,
        fringe: [...fringe],
        visited: [...visited],
        message: `Goal found at ${node}!`,
        path: visited,
      };
      return;
    }

    const neighbors = getVacuumSearchNeighbors(node);
    // Add in reverse so first neighbor is popped first
    for (let i = neighbors.length - 1; i >= 0; i--) {
      fringe.push(neighbors[i].city);
      yield {
        type: 'check',
        current: node,
        fringe: [...fringe],
        visited: [...visited],
        message: `Adding ${neighbors[i].city} to stack`,
      };
    }
  }
}

// ---------------------------------------------------------------------------
// Explore Mode
// ---------------------------------------------------------------------------

function ExploreMode({ onComplete }: { onComplete?: () => void }) {
  const resolvedColors = useResolvedColors();
  const [discovered, setDiscovered] = useState<Set<string>>(() => new Set());
  const [message, setMessage] = useState('Click any state node to reveal its transitions.');
  const completedRef = useRef(false);

  const visibleEdgeIds = useMemo(() => {
    const ids = new Set<string>();
    for (const state of discovered) {
      const neighbors = getVacuumNeighbors(state);
      for (const { city, action } of neighbors) {
        ids.add(`${state}-${city}-${action}`);
      }
    }
    return ids;
  }, [discovered]);

  const edges = useMemo(() => {
    return styleEdges(
      ALL_EDGES.filter((e) => visibleEdgeIds.has(e.id)).map((e) => ({
        ...e,
        animated: true,
      })),
      resolvedColors,
    );
  }, [visibleEdgeIds, resolvedColors]);

  const nodeStates = useMemo(() => {
    const s: Record<string, VacuumNodeState> = {};
    for (const state of ALL_STATES) {
      s[state] = discovered.has(state) ? 'explored' : 'default';
    }
    return s;
  }, [discovered]);

  const nodes = useMemo(
    () => makeNodes(nodeStates, new Set(ALL_STATES)),
    [nodeStates],
  );

  const onNodeClick: NodeMouseHandler = useCallback(
    (_event, node) => {
      setDiscovered((prev) => {
        const next = new Set(prev);
        next.add(node.id);

        const remaining = ALL_STATES.length - next.size;
        if (remaining === 0) {
          setMessage('All states discovered! You can see the complete state graph.');
          if (!completedRef.current) {
            completedRef.current = true;
            setTimeout(() => onComplete?.(), 600);
          }
        } else {
          const neighborCount = getVacuumNeighbors(node.id).length;
          setMessage(
            `Discovered ${node.id} with ${neighborCount} transition${neighborCount === 1 ? '' : 's'}. ${remaining} state${remaining === 1 ? '' : 's'} remaining.`,
          );
        }

        return next;
      });
    },
    [onComplete],
  );

  return (
    <div>
      <div style={{ height: 400 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodeClick={onNodeClick}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          preventScrolling={false}
          proOptions={{ hideAttribution: true }}
          defaultEdgeOptions={{
            style: { stroke: resolvedColors.border, strokeWidth: 1.5 },
          }}
          style={{ background: 'transparent' }}
        />
      </div>
      <div className="mt-3 text-sm min-h-6">
        <span className="text-muted-foreground font-medium">
          Discovered: {discovered.size}/{ALL_STATES.length}
        </span>
      </div>
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-2 text-xs text-muted-foreground italic min-h-5"
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>
      {discovered.size === ALL_STATES.length && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-3"
        >
          <CalloutBox type="tip" title="Complete!">
            <p>
              The vacuum world has {ALL_STATES.length} states and{' '}
              {ALL_EDGES.length} transitions. Each state represents a
              combination of robot position (A or B) and room cleanliness
              (Dirty or Clean).
            </p>
          </CalloutBox>
        </motion.div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// BFS Mode
// ---------------------------------------------------------------------------

function BFSMode({ onComplete }: { onComplete?: () => void }) {
  const resolvedColors = useResolvedColors();
  const controllerRef = useRef<AnimationController | null>(null);
  const statesRef = useRef<SearchState[]>([]);
  const completedRef = useRef(false);

  const [playing, setPlaying] = useState(false);
  const [canStepForward, setCanStepForward] = useState(true);
  const [canStepBack, setCanStepBack] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [currentSearchState, setCurrentSearchState] = useState<SearchState | null>(null);

  // Generate all BFS states once
  useEffect(() => {
    statesRef.current = collectStates(
      bfs('A-D-D', 'A-C-C', getVacuumSearchNeighbors),
    );

    const states = statesRef.current;
    if (states.length === 0) return;

    setCurrentSearchState(states[0]);

    const controller = new AnimationController({
      onStepChange: (step) => {
        setCanStepForward(step < states.length);
        setCanStepBack(step > 0);
        setPlaying(controller.isPlaying());
      },
    });

    const stepFns = states.map((_, i) => () => {
      setCurrentSearchState(states[i]);
      if (states[i].type === 'solution' && !completedRef.current) {
        completedRef.current = true;
        setTimeout(() => onComplete?.(), 800);
      }
    });
    controller.setSteps(stepFns);
    controllerRef.current = controller;

    return () => controller.destroy();
  }, [onComplete]);

  const nodeStates = useMemo(() => {
    const s: Record<string, VacuumNodeState> = {};
    for (const state of ALL_STATES) s[state] = 'default';

    if (!currentSearchState) return s;

    const { explored, fringe, current, path, type } = currentSearchState;

    // Mark explored
    for (const e of explored) s[e] = 'explored';

    // Mark fringe
    for (const f of fringe) {
      if (!explored.has(f.node)) s[f.node] = 'fringe';
    }

    // Mark current
    if (current) s[current] = 'current';

    // Mark solution path
    if (type === 'solution' && path) {
      for (const p of path) s[p] = 'solution';
    }

    return s;
  }, [currentSearchState]);

  const edges = useMemo(() => {
    if (
      currentSearchState?.type === 'solution' &&
      currentSearchState.path
    ) {
      const pathSet = new Set<string>();
      const p = currentSearchState.path;
      for (let i = 0; i < p.length - 1; i++) {
        pathSet.add(`${p[i]}::${p[i + 1]}`);
        pathSet.add(`${p[i + 1]}::${p[i]}`);
      }
      return styleEdges(
        ALL_EDGES.map((e) => {
          const key = `${e.source}::${e.target}`;
          if (pathSet.has(key)) {
            return {
              ...e,
              style: { stroke: '#3b82f6', strokeWidth: 3 },
              animated: true,
            };
          }
          return e;
        }),
        resolvedColors,
      );
    }
    return styleEdges(ALL_EDGES, resolvedColors);
  }, [currentSearchState, resolvedColors]);

  const nodes = useMemo(() => makeNodes(nodeStates), [nodeStates]);

  const handlePlay = useCallback(() => controllerRef.current?.play(), []);
  const handlePause = useCallback(() => controllerRef.current?.pause(), []);
  const handleStep = useCallback(() => controllerRef.current?.step(), []);
  const handleStepBack = useCallback(() => {
    const c = controllerRef.current;
    if (!c) return;
    const target = Math.max(0, c.getCurrentStep() - 1);
    c.reset();
    setCurrentSearchState(statesRef.current[0]);
    for (let i = 0; i <= target; i++) c.step();
  }, []);
  const handleReset = useCallback(() => {
    controllerRef.current?.reset();
    setCurrentSearchState(statesRef.current[0]);
    completedRef.current = false;
  }, []);
  const handleSpeedChange = useCallback((s: number) => {
    setSpeed(s);
    controllerRef.current?.setSpeed(s);
  }, []);

  return (
    <div>
      <div style={{ height: 400 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          preventScrolling={false}
          proOptions={{ hideAttribution: true }}
          defaultEdgeOptions={{
            style: { stroke: resolvedColors.border, strokeWidth: 1.5 },
          }}
          style={{ background: 'transparent' }}
        />
      </div>
      <AlgoControls
        playing={playing}
        canStepForward={canStepForward}
        canStepBack={canStepBack}
        speed={speed}
        onPlay={handlePlay}
        onPause={handlePause}
        onStep={handleStep}
        onStepBack={handleStepBack}
        onReset={handleReset}
        onSpeedChange={handleSpeedChange}
      />
      <div className="mt-3 text-sm font-mono leading-relaxed min-h-6">
        <strong>Fringe (Queue):</strong>{' '}
        {currentSearchState && currentSearchState.fringe.length > 0 ? (
          formatFringe(currentSearchState.fringe)
        ) : (
          <em className="text-muted-foreground">empty</em>
        )}
      </div>
      <div className="mt-2 text-xs text-muted-foreground italic min-h-5">
        {currentSearchState?.message ?? ''}
      </div>
      {/* Legend */}
      <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: '#fef08a' }} />
          Fringe
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: '#bbf7d0' }} />
          Explored
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-sm border-2 border-red-500" />
          Current
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: '#93c5fd' }} />
          Solution
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// DFS Loop Mode
// ---------------------------------------------------------------------------

const DFS_LOOP_LIMIT = 15;

function DFSLoopMode({ onComplete }: { onComplete?: () => void }) {
  const resolvedColors = useResolvedColors();
  const controllerRef = useRef<AnimationController | null>(null);
  const treeStatesRef = useRef<DFSTreeState[]>([]);
  const graphStatesRef = useRef<SearchState[]>([]);
  const completedRef = useRef(false);

  const [playing, setPlaying] = useState(false);
  const [canStepForward, setCanStepForward] = useState(true);
  const [canStepBack, setCanStepBack] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [stuck, setStuck] = useState(false);
  const [useExploredSet, setUseExploredSet] = useState(false);
  const [currentTreeState, setCurrentTreeState] = useState<DFSTreeState | null>(null);
  const [currentSearchState, setCurrentSearchState] = useState<SearchState | null>(null);
  const [visitCount, setVisitCount] = useState<Record<string, number>>({});

  // Generate tree-search DFS states (will loop)
  useEffect(() => {
    const gen = dfsTreeSearch('A-D-D');
    const states: DFSTreeState[] = [];
    let count = 0;
    for (const s of gen) {
      states.push(s);
      count++;
      // Cut off after enough steps to show the loop
      if (count >= DFS_LOOP_LIMIT * 3) break;
    }
    treeStatesRef.current = states;

    // Take only the first DFS_LOOP_LIMIT expand/check states
    const limited = states.slice(0, DFS_LOOP_LIMIT * 2);

    if (limited.length === 0) return;
    setCurrentTreeState(limited[0]);

    const controller = new AnimationController({
      onStepChange: (step) => {
        setCanStepForward(step < limited.length);
        setCanStepBack(step > 0);
        setPlaying(controller.isPlaying());
      },
    });

    const stepFns = limited.map((_, i) => () => {
      const state = limited[i];
      setCurrentTreeState(state);

      // Track visit counts for showing duplicates
      if (state.type === 'expand') {
        setVisitCount((prev) => ({
          ...prev,
          [state.current]: (prev[state.current] ?? 0) + 1,
        }));
      }

      // If we're at the end, pause and show the "stuck" message
      if (i === limited.length - 1) {
        controller.pause();
        setStuck(true);
      }
    });

    controller.setSteps(stepFns);
    controllerRef.current = controller;

    return () => controller.destroy();
  }, []);

  // When user enables explored set, switch to proper graph-search DFS
  useEffect(() => {
    if (!useExploredSet) return;

    graphStatesRef.current = collectStates(
      dfs('A-D-D', 'A-C-C', getVacuumSearchNeighbors),
    );

    const states = graphStatesRef.current;
    if (states.length === 0) return;

    setCurrentTreeState(null);
    setCurrentSearchState(states[0]);
    setVisitCount({});

    const controller = new AnimationController({
      onStepChange: (step) => {
        setCanStepForward(step < states.length);
        setCanStepBack(step > 0);
        setPlaying(controller.isPlaying());
      },
    });

    const stepFns = states.map((_, i) => () => {
      setCurrentSearchState(states[i]);
      if (states[i].type === 'solution' && !completedRef.current) {
        completedRef.current = true;
        setTimeout(() => onComplete?.(), 800);
      }
    });

    controller.setSteps(stepFns);
    controllerRef.current?.destroy();
    controllerRef.current = controller;

    // Auto-play to show the difference
    setTimeout(() => controller.play(), 300);

    return () => controller.destroy();
  }, [useExploredSet, onComplete]);

  // Build node states from either tree-search or graph-search state
  const nodeStates = useMemo(() => {
    const s: Record<string, VacuumNodeState> = {};
    for (const state of ALL_STATES) s[state] = 'default';

    if (useExploredSet && currentSearchState) {
      const { explored, fringe, current, path, type } = currentSearchState;
      for (const e of explored) s[e] = 'explored';
      for (const f of fringe) {
        if (!explored.has(f.node)) s[f.node] = 'fringe';
      }
      if (current) s[current] = 'current';
      if (type === 'solution' && path) {
        for (const p of path) s[p] = 'solution';
      }
    } else if (currentTreeState) {
      // For tree search, mark visited nodes
      const visitedSet = new Set(currentTreeState.visited);
      for (const v of visitedSet) s[v] = 'explored';
      // Mark fringe
      for (const f of currentTreeState.fringe) s[f] = 'fringe';
      // Mark current
      if (currentTreeState.current) s[currentTreeState.current] = 'current';
    }

    return s;
  }, [currentTreeState, currentSearchState, useExploredSet]);

  const edges = useMemo(() => {
    if (useExploredSet && currentSearchState?.type === 'solution' && currentSearchState.path) {
      const pathSet = new Set<string>();
      const p = currentSearchState.path;
      for (let i = 0; i < p.length - 1; i++) {
        pathSet.add(`${p[i]}::${p[i + 1]}`);
        pathSet.add(`${p[i + 1]}::${p[i]}`);
      }
      return styleEdges(
        ALL_EDGES.map((e) => {
          const key = `${e.source}::${e.target}`;
          if (pathSet.has(key)) {
            return {
              ...e,
              style: { stroke: '#3b82f6', strokeWidth: 3 },
              animated: true,
            };
          }
          return e;
        }),
        resolvedColors,
      );
    }
    return styleEdges(ALL_EDGES, resolvedColors);
  }, [currentSearchState, useExploredSet, resolvedColors]);

  const nodes = useMemo(() => makeNodes(nodeStates), [nodeStates]);

  const handlePlay = useCallback(() => controllerRef.current?.play(), []);
  const handlePause = useCallback(() => controllerRef.current?.pause(), []);
  const handleStep = useCallback(() => controllerRef.current?.step(), []);
  const handleStepBack = useCallback(() => {
    const c = controllerRef.current;
    if (!c) return;
    const target = Math.max(0, c.getCurrentStep() - 1);
    c.reset();
    if (useExploredSet) {
      setCurrentSearchState(graphStatesRef.current[0]);
    } else {
      setCurrentTreeState(treeStatesRef.current[0]);
      setVisitCount({});
    }
    for (let i = 0; i <= target; i++) c.step();
  }, [useExploredSet]);
  const handleReset = useCallback(() => {
    controllerRef.current?.reset();
    if (useExploredSet) {
      setCurrentSearchState(graphStatesRef.current[0]);
    } else {
      setCurrentTreeState(treeStatesRef.current[0]);
      setVisitCount({});
      setStuck(false);
    }
    completedRef.current = false;
  }, [useExploredSet]);
  const handleSpeedChange = useCallback((s: number) => {
    setSpeed(s);
    controllerRef.current?.setSpeed(s);
  }, []);

  const activeMessage = useExploredSet
    ? currentSearchState?.message ?? ''
    : currentTreeState?.message ?? '';

  const activeFringe = useExploredSet
    ? currentSearchState
      ? formatFringe(currentSearchState.fringe)
      : ''
    : currentTreeState
      ? currentTreeState.fringe.join(' -> ')
      : '';

  // Show which nodes have been visited multiple times
  const duplicates = Object.entries(visitCount).filter(([, c]) => c > 1);

  return (
    <div>
      <div style={{ height: 400 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          preventScrolling={false}
          proOptions={{ hideAttribution: true }}
          defaultEdgeOptions={{
            style: { stroke: resolvedColors.border, strokeWidth: 1.5 },
          }}
          style={{ background: 'transparent' }}
        />
      </div>
      <AlgoControls
        playing={playing}
        canStepForward={canStepForward}
        canStepBack={canStepBack}
        speed={speed}
        onPlay={handlePlay}
        onPause={handlePause}
        onStep={handleStep}
        onStepBack={handleStepBack}
        onReset={handleReset}
        onSpeedChange={handleSpeedChange}
      />
      <div className="mt-3 text-sm font-mono leading-relaxed min-h-6">
        <strong>Stack:</strong>{' '}
        {activeFringe || <em className="text-muted-foreground">empty</em>}
      </div>
      <div className="mt-2 text-xs text-muted-foreground italic min-h-5">
        {activeMessage}
      </div>

      {/* Show duplicate visits for tree search */}
      {!useExploredSet && duplicates.length > 0 && (
        <div className="mt-2 text-xs font-mono text-orange-600 dark:text-orange-400">
          Revisited: {duplicates.map(([node, count]) => `${node} (x${count})`).join(', ')}
        </div>
      )}

      {/* Stuck callout */}
      <AnimatePresence>
        {stuck && !useExploredSet && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <CalloutBox type="warning" title="DFS is stuck in a loop!">
              <p>
                Without tracking visited states, DFS keeps revisiting the same
                nodes. It will never terminate on a graph with cycles.
              </p>
            </CalloutBox>
            <Button
              className="mt-2"
              onClick={() => setUseExploredSet(true)}
            >
              Enable explored set
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success callout after graph-search DFS finds solution */}
      {useExploredSet && currentSearchState?.type === 'solution' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-3"
        >
          <CalloutBox type="tip" title="Problem solved!">
            <p>
              With the explored set, DFS avoids revisiting states and finds the
              goal. Graph search turns an infinite loop into a tractable search.
            </p>
          </CalloutBox>
        </motion.div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function VacuumStateGraphViz({
  mode,
  onComplete,
}: VacuumStateGraphVizProps) {
  switch (mode) {
    case 'explore':
      return <ExploreMode onComplete={onComplete} />;
    case 'bfs':
      return <BFSMode onComplete={onComplete} />;
    case 'dfs-loop':
      return <DFSLoopMode onComplete={onComplete} />;
  }
}
