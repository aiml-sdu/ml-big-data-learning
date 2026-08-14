import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
  ReactFlow,
  type Node,
  type Edge,
  Handle,
  Position,
  type NodeProps,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { motion } from 'framer-motion';
import ExerciseCard from '@/components/ExerciseCard';
import StepChallenge, { type StepDef } from '@/components/StepChallenge';
import HintPanel from '@/components/HintPanel';
import RiverCrossingGameViz from './RiverCrossingGameViz';
import CodePlayground from '@/components/CodePlayground';
import AlgoControls from '@/components/AlgoControls';
import { useResolvedColors } from '@/hooks/useResolvedColors';
import { AnimationController } from '@/visualizations/animation-loop';
import { bfs } from '@/lib/search';
import {
  getSearchNeighbors,
  getActionBetween,
  decodeState,
  ENTITY_ICONS,
} from '@/lib/river-crossing';

// ---------------------------------------------------------------------------
// Step 3: BFS Tree Visualization
// ---------------------------------------------------------------------------

interface TreeNode {
  id: string;
  state: string;
  children: string[];
  depth: number;
  parent: string | null;
}

interface BfsSnapshot {
  exploredNodes: Set<string>;
  currentNode: string | null;
  fringeNodes: Set<string>;
  solutionPath: string[] | null;
  message: string;
}

function collectBfsSteps(): { snapshots: BfsSnapshot[]; tree: Map<string, TreeNode> } {
  const gen = bfs('WWWW', 'EEEE', getSearchNeighbors);
  const snapshots: BfsSnapshot[] = [];
  const tree = new Map<string, TreeNode>();
  const parentMap = new Map<string, string | null>();
  const depthMap = new Map<string, number>();

  // Initialize root
  tree.set('WWWW', { id: 'WWWW', state: 'WWWW', children: [], depth: 0, parent: null });
  parentMap.set('WWWW', null);
  depthMap.set('WWWW', 0);

  const exploredSoFar = new Set<string>();
  let solutionPath: string[] | null = null;

  for (const step of gen) {
    const fringeSet = new Set(step.fringe.map((f) => f.node));

    // Track tree structure from fringe entries
    for (const entry of step.fringe) {
      const node = entry.node;
      if (!tree.has(node) && entry.path.length > 1) {
        const parent = entry.path[entry.path.length - 2];
        const depth = entry.path.length - 1;
        tree.set(node, { id: node, state: node, children: [], depth, parent });
        parentMap.set(node, parent);
        depthMap.set(node, depth);
        const parentNode = tree.get(parent);
        if (parentNode && !parentNode.children.includes(node)) {
          parentNode.children.push(node);
        }
      }
    }

    if (step.type === 'expand' && step.current) {
      exploredSoFar.add(step.current);
    }

    if (step.type === 'solution' && step.path) {
      solutionPath = step.path;
    }

    snapshots.push({
      exploredNodes: new Set(exploredSoFar),
      currentNode: step.current ?? null,
      fringeNodes: fringeSet,
      solutionPath: solutionPath ? [...solutionPath] : null,
      message: step.message,
    });
  }

  return { snapshots, tree };
}

// State mini visualization: show 4 tiny dots (W side left, E side right)
function StateMini({ state }: { state: string }) {
  const s = decodeState(state);
  const entities = ['farmer', 'wolf', 'goat', 'cabbage'] as const;
  const west = entities.filter((e) => s[e] === 'W');
  const east = entities.filter((e) => s[e] === 'E');

  return (
    <div className="flex items-center gap-0.5 text-[8px] leading-none mt-0.5">
      <div className="flex gap-px min-w-[20px] justify-end">
        {west.map((e) => (
          <span key={e}>{ENTITY_ICONS[e]}</span>
        ))}
      </div>
      <div className="w-px h-3 bg-blue-400 mx-0.5" />
      <div className="flex gap-px min-w-[20px]">
        {east.map((e) => (
          <span key={e}>{ENTITY_ICONS[e]}</span>
        ))}
      </div>
    </div>
  );
}

// Custom ReactFlow node for BFS tree
interface BfsNodeData {
  state: string;
  status: 'unseen' | 'fringe' | 'current' | 'explored' | 'solution';
  [key: string]: unknown;
}

function BfsTreeNode({ data }: NodeProps) {
  const { state, status } = data as BfsNodeData;

  const bgColor: Record<string, string> = {
    unseen: 'bg-muted border-border',
    fringe: 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-400',
    current: 'bg-red-100 dark:bg-red-900/30 border-red-500',
    explored: 'bg-green-100 dark:bg-green-900/30 border-green-500',
    solution: 'bg-blue-100 dark:bg-blue-900/30 border-blue-500',
  };

  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-transparent !border-0 !w-0 !h-0"
      />
      <div
        className={`rounded-md border-2 px-2 py-1.5 flex flex-col items-center transition-all duration-300 ${bgColor[status] ?? bgColor.unseen}`}
        style={{ minWidth: 60 }}
      >
        <div className="text-[11px] font-mono font-bold leading-none">{state}</div>
        <StateMini state={state} />
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-transparent !border-0 !w-0 !h-0"
      />
    </>
  );
}

const bfsNodeTypes = { bfsNode: BfsTreeNode };

// Compute tree layout positions
function layoutTree(tree: Map<string, TreeNode>): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>();
  const NODE_W = 80;
  const NODE_H = 70;
  const H_GAP = 20;
  const V_GAP = 30;

  function assignPositions(nodeId: string, xStart: number, depth: number): number {
    const node = tree.get(nodeId);
    if (!node) return xStart;

    if (node.children.length === 0) {
      positions.set(nodeId, {
        x: xStart,
        y: depth * (NODE_H + V_GAP),
      });
      return xStart + NODE_W + H_GAP;
    }

    let currentX = xStart;
    const childXPositions: number[] = [];

    for (const childId of node.children) {
      currentX = assignPositions(childId, currentX, depth + 1);
      const cp = positions.get(childId);
      if (cp) childXPositions.push(cp.x);
    }

    // Center parent over children
    const centerX =
      childXPositions.length > 0
        ? (childXPositions[0] + childXPositions[childXPositions.length - 1]) / 2
        : xStart;

    positions.set(nodeId, {
      x: centerX,
      y: depth * (NODE_H + V_GAP),
    });

    return currentX;
  }

  if (tree.has('WWWW')) {
    assignPositions('WWWW', 0, 0);
  }

  return positions;
}

// BFS Search Tree Viz component
function BfsSearchTreeViz({ onComplete }: { onComplete: () => void }) {
  const resolvedColors = useResolvedColors();
  const { snapshots, tree } = useMemo(() => collectBfsSteps(), []);
  const positions = useMemo(() => layoutTree(tree), [tree]);

  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const completedRef = useRef(false);

  const controllerRef = useRef<AnimationController | null>(null);

  // Initialize animation controller
  useEffect(() => {
    const controller = new AnimationController({
      onStepChange: (step) => {
        setStepIndex(step);
      },
      onComplete: () => {
        setPlaying(false);
        if (!completedRef.current) {
          completedRef.current = true;
          onComplete();
        }
      },
    });

    const steps = snapshots.map((_, i) => () => {
      setStepIndex(i);
    });
    controller.setSteps(steps);
    controllerRef.current = controller;

    return () => controller.destroy();
  }, [snapshots, onComplete]);

  const currentSnapshot: BfsSnapshot = snapshots[Math.min(stepIndex, snapshots.length - 1)] ?? {
    exploredNodes: new Set<string>(),
    currentNode: null,
    fringeNodes: new Set(['WWWW']),
    solutionPath: null,
    message: 'Ready to start BFS',
  };

  // Determine which nodes are visible (explored, in fringe, or current up to this step)
  const visibleNodes = useMemo(() => {
    const visible = new Set<string>();
    visible.add('WWWW'); // root is always visible
    for (const n of currentSnapshot.exploredNodes) visible.add(n);
    for (const n of currentSnapshot.fringeNodes) visible.add(n);
    if (currentSnapshot.currentNode) visible.add(currentSnapshot.currentNode);
    return visible;
  }, [currentSnapshot]);

  // Build ReactFlow nodes
  const rfNodes: Node[] = useMemo(() => {
    const nodes: Node[] = [];
    for (const [id] of tree) {
      if (!visibleNodes.has(id)) continue;
      const pos = positions.get(id);
      if (!pos) continue;

      let status: BfsNodeData['status'] = 'unseen';
      if (currentSnapshot.solutionPath?.includes(id)) {
        status = 'solution';
      } else if (id === currentSnapshot.currentNode) {
        status = 'current';
      } else if (currentSnapshot.exploredNodes.has(id)) {
        status = 'explored';
      } else if (currentSnapshot.fringeNodes.has(id)) {
        status = 'fringe';
      }

      nodes.push({
        id,
        type: 'bfsNode',
        position: { x: pos.x, y: pos.y },
        data: { state: id, status } satisfies BfsNodeData,
        draggable: false,
        selectable: false,
        connectable: false,
      });
    }
    return nodes;
  }, [tree, positions, visibleNodes, currentSnapshot]);

  // Build ReactFlow edges
  const rfEdges: Edge[] = useMemo(() => {
    const edges: Edge[] = [];
    for (const [id, node] of tree) {
      if (!visibleNodes.has(id)) continue;
      for (const childId of node.children) {
        if (!visibleNodes.has(childId)) continue;

        const isSolutionEdge =
          currentSnapshot.solutionPath?.includes(id) &&
          currentSnapshot.solutionPath?.includes(childId) &&
          Math.abs(
            (currentSnapshot.solutionPath?.indexOf(id) ?? -1) -
            (currentSnapshot.solutionPath?.indexOf(childId) ?? -1),
          ) === 1;

        edges.push({
          id: `${id}-${childId}`,
          source: id,
          target: childId,
          type: 'straight',
          style: {
            stroke: isSolutionEdge ? '#3b82f6' : resolvedColors.border,
            strokeWidth: isSolutionEdge ? 3 : 1.5,
            transition: 'all 300ms ease-in-out',
          },
          selectable: false,
          focusable: false,
        });
      }
    }
    return edges;
  }, [tree, visibleNodes, currentSnapshot, resolvedColors]);

  // Solution steps text
  const solutionSteps = useMemo(() => {
    if (!currentSnapshot.solutionPath) return null;
    const path = currentSnapshot.solutionPath;
    const steps: string[] = [];
    for (let i = 0; i < path.length - 1; i++) {
      const action = getActionBetween(path[i], path[i + 1]);
      steps.push(`${i + 1}. ${action}`);
    }
    return steps;
  }, [currentSnapshot.solutionPath]);

  const handlePlay = useCallback(() => {
    setPlaying(true);
    controllerRef.current?.play();
  }, []);

  const handlePause = useCallback(() => {
    setPlaying(false);
    controllerRef.current?.pause();
  }, []);

  const handleStep = useCallback(() => {
    controllerRef.current?.step();
  }, []);

  const handleStepBack = useCallback(() => {
    // Re-execute from beginning up to step-1
    const controller = controllerRef.current;
    if (!controller || stepIndex <= 0) return;
    const targetStep = stepIndex - 1;
    setStepIndex(targetStep);
    // Since steps just call setStepIndex, we can directly set it
    controller.stepBack();
  }, [stepIndex]);

  const handleReset = useCallback(() => {
    setPlaying(false);
    setStepIndex(0);
    completedRef.current = false;
    controllerRef.current?.reset();
  }, []);

  const handleSpeedChange = useCallback((s: number) => {
    setSpeed(s);
    controllerRef.current?.setSpeed(s);
  }, []);

  return (
    <div className="rounded-lg border bg-card overflow-hidden my-4">
      <div className="px-4 pt-3">
        <AlgoControls
          playing={playing}
          canStepForward={stepIndex < snapshots.length - 1}
          canStepBack={stepIndex > 0}
          speed={speed}
          onPlay={handlePlay}
          onPause={handlePause}
          onStep={handleStep}
          onStepBack={handleStepBack}
          onReset={handleReset}
          onSpeedChange={handleSpeedChange}
        />
      </div>

      {/* ReactFlow tree */}
      <div style={{ minHeight: 400 }}>
        <ReactFlow
          nodes={rfNodes}
          edges={rfEdges}
          nodeTypes={bfsNodeTypes}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          panOnDrag={true}
          zoomOnScroll={true}
          zoomOnPinch={true}
          zoomOnDoubleClick={false}
          preventScrolling={false}
          proOptions={{ hideAttribution: true }}
          defaultEdgeOptions={{
            style: { stroke: resolvedColors.border, strokeWidth: 1.5 },
          }}
          style={{ background: 'transparent' }}
        />
      </div>

      {/* Status message */}
      <div className="border-t px-4 py-2.5 text-sm text-muted-foreground">
        <span className="font-mono text-xs">
          Step {stepIndex + 1}/{snapshots.length}
        </span>
        {' \u2014 '}
        {currentSnapshot.message}
      </div>

      {/* Legend */}
      <div className="border-t px-4 py-2.5 flex flex-wrap items-center gap-3">
        {[
          { label: 'Fringe', cls: 'bg-yellow-400' },
          { label: 'Current', cls: 'bg-red-500' },
          { label: 'Explored', cls: 'bg-green-500' },
          { label: 'Solution', cls: 'bg-blue-500' },
        ].map(({ label, cls }) => (
          <div key={label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <div className={`size-2.5 rounded-full ${cls}`} />
            {label}
          </div>
        ))}
      </div>

      {/* Solution steps */}
      {solutionSteps && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="border-t px-4 py-3"
        >
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Optimal Solution (7 moves)
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            {solutionSteps.map((step, i) => (
              <span
                key={i}
                className="text-sm font-medium text-blue-600 dark:text-blue-400"
              >
                {step}
                {i < solutionSteps.length - 1 && (
                  <span className="text-muted-foreground ml-3">{'\u2192'}</span>
                )}
              </span>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Exercise Component
// ---------------------------------------------------------------------------

export default function Exercise3RiverCrossing() {
  const steps: StepDef[] = [
    {
      id: 1,
      title: 'Play the Puzzle',
      content: (onComplete) => (
        <div>
          <p className="text-sm text-muted-foreground mb-4">
            Get the farmer, wolf, goat, and cabbage across the river. The farmer can carry
            one item at a time. But beware: the wolf eats the goat, and the goat eats the
            cabbage!
          </p>
          <RiverCrossingGameViz onComplete={onComplete} />
          <HintPanel
            hints={[
              { label: 'Nudge', content: 'The goat is the troublemaker — it conflicts with both the wolf and the cabbage. Start by moving the goat first.' },
              { label: 'Strategy', content: 'Move the goat across, come back alone, move the wolf across, bring the goat back, move the cabbage across, come back alone, move the goat across.' },
              { label: 'Full solution', content: 'Goat→E, Alone→W, Wolf→E, Goat→W, Cabbage→E, Alone→W, Goat→E. 7 moves total.' },
            ]}
          />
        </div>
      ),
    },
    {
      id: 2,
      title: 'Define Valid States',
      content: (onComplete) => (
        <div>
          <p className="text-sm text-muted-foreground mb-4">
            Now that you've solved it by hand, write the validity check. Given positions of
            all four characters, return <code className="text-xs bg-muted px-1 py-0.5 rounded">true</code> if
            no one gets eaten.
          </p>
          <CodePlayground
            templateCode={`function isValid(farmer, wolf, goat, cabbage) {
  // Each parameter is 'W' (west) or 'E' (east)
  // Return true if no one gets eaten
  // Wolf eats goat if they're together without farmer
  // Goat eats cabbage if they're together without farmer

}`}
            testCases={[
              { label: 'All on west', call: 'isValid("W","W","W","W")', expected: 'true' },
              { label: 'Wolf+goat alone (west)', call: 'isValid("E","W","W","W")', expected: 'false' },
              { label: 'Farmer+goat east, wolf+cabbage west', call: 'isValid("E","W","E","W")', expected: 'true' },
              { label: 'Goat+cabbage alone (west)', call: 'isValid("E","E","W","W")', expected: 'false' },
              { label: 'All on east (goal)', call: 'isValid("E","E","E","E")', expected: 'true' },
              { label: 'Wolf+goat east, no farmer', call: 'isValid("W","E","E","W")', expected: 'false' },
            ]}
            hints={[
              { label: 'Nudge', content: 'There are exactly two dangerous pairings. Think about which animals can\'t be left alone together.' },
              { label: 'Strategy', content: 'Check: wolf===goat && farmer!==wolf → bad. goat===cabbage && farmer!==goat → bad. Everything else is safe.' },
              { label: 'Full solution', content: 'if (wolf === goat && farmer !== wolf) return false; if (goat === cabbage && farmer !== goat) return false; return true;' },
            ]}
            onAllPass={onComplete}
          />
        </div>
      ),
    },
    {
      id: 3,
      title: 'Let BFS Solve It',
      content: (onComplete) => (
        <div>
          <p className="text-sm text-muted-foreground mb-4">
            Watch BFS systematically explore the state space and find the optimal 7-move
            solution. Each node shows a state (e.g. EWEW = farmer+goat east, wolf+cabbage west).
            Use the controls to step through or play the animation.
          </p>
          <BfsSearchTreeViz onComplete={onComplete} />
          <HintPanel
            hints={[{ label: 'Hint', content: 'BFS guarantees the shortest solution because it explores all states at depth d before depth d+1. The 7-move solution is optimal — no shorter path exists.' }]}
          />
        </div>
      ),
    },
  ];

  return (
    <ExerciseCard
      exerciseId="lab-t03-ex3"
      number={3}
      title="River Crossing: The Classic Puzzle"
      totalSteps={3}
    >
      <StepChallenge exerciseId="lab-t03-ex3" steps={steps} />
    </ExerciseCard>
  );
}
