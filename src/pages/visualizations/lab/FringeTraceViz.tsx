import { useCallback, useMemo, useRef, useState } from 'react';
import {
  ReactFlow,
  type Node,
  type Edge,
  type NodeMouseHandler,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useResolvedColors } from '@/hooks/useResolvedColors';
import {
  LAB_TREE,
  LAB_TREE_GOAL,
  LAB_TREE_ROOT,
  getDFSOrder,
  getBFSOrder,
} from './exercise1-data';
import { contrastText } from '../tree-drawing';

// ---------- constants ----------

const COL_UNSEEN = '#9ca3af';
const COL_FRINGE = '#fbbf24';
const COL_CURRENT = '#ef4444';
const COL_EXPLORED = '#22c55e';
const COL_GOAL = '#3b82f6';

const NODE_PX = 44;

type LabNodeState = 'unseen' | 'fringe' | 'current' | 'explored' | 'goal';

interface LabNodeData {
  label: string;
  isGoal: boolean;
  state: LabNodeState;
  clickable: boolean;
  shake: boolean;
  [key: string]: unknown;
}

// ---------- custom node ----------

const STATE_BG: Record<LabNodeState, string> = {
  unseen: COL_UNSEEN,
  fringe: COL_FRINGE,
  current: COL_CURRENT,
  explored: COL_EXPLORED,
  goal: COL_GOAL,
};

function LabTreeNode({ data }: NodeProps) {
  const { label, isGoal, state, clickable, shake } = data as LabNodeData;

  const shakeKeyframes = shake
    ? 'lab-shake 0.35s ease-in-out'
    : undefined;

  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-transparent !border-0 !w-0 !h-0"
      />
      <div
        style={{
          width: NODE_PX,
          height: NODE_PX,
          borderRadius: '50%',
          backgroundColor: STATE_BG[state],
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: contrastText(STATE_BG[state]),
          fontSize: 14,
          fontWeight: 700,
          userSelect: 'none',
          cursor: clickable ? 'pointer' : 'default',
          outline: state === 'fringe' ? '2px dashed rgba(251,191,36,0.7)' : 'none',
          outlineOffset: state === 'fringe' ? 4 : 0,
          transition: 'all 300ms ease-in-out',
          transform: state === 'current' ? 'scale(1.1)' : 'scale(1)',
          animation: shakeKeyframes,
        }}
      >
        {label}
        {isGoal ? ' (G)' : ''}
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-transparent !border-0 !w-0 !h-0"
      />
    </>
  );
}

const nodeTypes = { labTreeNode: LabTreeNode };

// ---------- shake keyframes (injected once) ----------

const SHAKE_CSS = `
@keyframes lab-shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-6px); }
  40% { transform: translateX(6px); }
  60% { transform: translateX(-4px); }
  80% { transform: translateX(4px); }
}
`;

let shakeInjected = false;
function ensureShakeCSS() {
  if (shakeInjected) return;
  shakeInjected = true;
  const style = document.createElement('style');
  style.textContent = SHAKE_CSS;
  document.head.appendChild(style);
}

// ---------- static edges ----------

const staticEdges: Edge[] = Object.values(LAB_TREE).flatMap((node) =>
  node.children.map((childId) => ({
    id: `${node.id}-${childId}`,
    source: node.id,
    target: childId,
    type: 'straight',
    selectable: false,
    focusable: false,
  })),
);

// ---------- props ----------

interface FringeTraceVizProps {
  mode: 'dfs' | 'bfs';
  onComplete: () => void;
}

// ---------- component ----------

export default function FringeTraceViz({ mode, onComplete }: FringeTraceVizProps) {
  ensureShakeCSS();
  const resolvedColors = useResolvedColors();

  const expectedOrder = useMemo(
    () => (mode === 'dfs' ? getDFSOrder() : getBFSOrder()),
    [mode],
  );

  const [explored, setExplored] = useState<Set<string>>(() => new Set());
  const [fringe, setFringe] = useState<string[]>([LAB_TREE_ROOT]);
  const [current, setCurrent] = useState<string | null>(null);
  const [expandIdx, setExpandIdx] = useState(0);
  const [wrongNode, setWrongNode] = useState<string | null>(null);
  const [complete, setComplete] = useState(false);
  const [message, setMessage] = useState<string>(
    `Click the correct fringe node to expand. ${mode === 'dfs' ? 'DFS uses a stack (LIFO).' : 'BFS uses a queue (FIFO).'}`,
  );

  const wrongTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const completedRef = useRef(false);

  // Build fringe set for quick lookup
  const fringeSet = useMemo(() => new Set(fringe), [fringe]);

  // Build edges with explored highlighting
  const edges: Edge[] = useMemo(() => {
    return staticEdges.map((e) => {
      const parentExplored = explored.has(e.source);
      const childExplored = explored.has(e.target) || e.target === current;
      const highlight = parentExplored && childExplored;
      return {
        ...e,
        style: {
          stroke: highlight ? COL_EXPLORED : resolvedColors.border,
          strokeWidth: highlight ? 2.5 : 1.5,
          transition: 'all 300ms ease-in-out',
        },
      };
    });
  }, [explored, current]);

  // Build nodes
  const nodes: Node[] = useMemo(() => {
    return Object.values(LAB_TREE).map((treeNode) => {
      let state: LabNodeState = 'unseen';
      if (complete && treeNode.id === LAB_TREE_GOAL) state = 'goal';
      else if (treeNode.id === current) state = 'current';
      else if (explored.has(treeNode.id)) state = 'explored';
      else if (fringeSet.has(treeNode.id)) state = 'fringe';

      return {
        id: treeNode.id,
        type: 'labTreeNode',
        position: {
          x: treeNode.x - NODE_PX / 2,
          y: treeNode.y - NODE_PX / 2,
        },
        data: {
          label: treeNode.id,
          isGoal: treeNode.id === LAB_TREE_GOAL,
          state,
          clickable: !complete && !current && fringeSet.has(treeNode.id),
          shake: wrongNode === treeNode.id,
        } satisfies LabNodeData,
        draggable: false,
        selectable: false,
        connectable: false,
      };
    });
  }, [explored, fringe, fringeSet, current, wrongNode, complete]);

  const onNodeClick: NodeMouseHandler = useCallback(
    (_event, node) => {
      if (complete || current) return;
      if (!fringeSet.has(node.id)) return;

      const expectedNode = expectedOrder[expandIdx];

      // Wrong choice
      if (node.id !== expectedNode) {
        // Clear previous timer
        if (wrongTimerRef.current) clearTimeout(wrongTimerRef.current);
        setWrongNode(node.id);
        setMessage(
          mode === 'dfs'
            ? `Not quite -- DFS expands the most recently added node (top of stack). Try "${expectedNode}".`
            : `Not quite -- BFS expands the earliest added node (front of queue). Try "${expectedNode}".`,
        );
        wrongTimerRef.current = setTimeout(() => setWrongNode(null), 400);
        return;
      }

      // Correct choice -- transition to current
      setCurrent(node.id);
      setMessage(`Expanding ${node.id}...`);

      // After brief current highlight, transition to explored and add children
      if (currentTimerRef.current) clearTimeout(currentTimerRef.current);
      currentTimerRef.current = setTimeout(() => {
        const newExplored = new Set(explored);
        newExplored.add(node.id);

        // Remove from fringe
        const newFringe = fringe.filter((n) => n !== node.id);

        // Check if goal
        if (node.id === LAB_TREE_GOAL) {
          setExplored(newExplored);
          setFringe(newFringe);
          setCurrent(null);
          setComplete(true);
          setExpandIdx((i) => i + 1);
          setMessage(`Goal ${LAB_TREE_GOAL} found! ${mode.toUpperCase()} expanded ${newExplored.size} nodes to reach the goal.`);
          if (!completedRef.current) {
            completedRef.current = true;
            onComplete();
          }
          return;
        }

        // Add children to fringe
        const children = LAB_TREE[node.id].children.filter((c) => !newExplored.has(c));

        let updatedFringe: string[];
        if (mode === 'dfs') {
          // Stack: add to front (children will be at top)
          // Reverse so that the first child ends up at top of stack
          updatedFringe = [...children, ...newFringe];
        } else {
          // Queue: add to back
          updatedFringe = [...newFringe, ...children];
        }

        setExplored(newExplored);
        setFringe(updatedFringe);
        setCurrent(null);
        setExpandIdx((i) => i + 1);

        const childStr = children.length > 0 ? ` Children [${children.join(', ')}] added to ${mode === 'dfs' ? 'stack' : 'queue'}.` : '';
        setMessage(`Expanded ${node.id}.${childStr}`);
      }, 300);
    },
    [complete, current, fringeSet, expectedOrder, expandIdx, explored, fringe, mode, onComplete],
  );

  const handleReset = useCallback(() => {
    if (wrongTimerRef.current) clearTimeout(wrongTimerRef.current);
    if (currentTimerRef.current) clearTimeout(currentTimerRef.current);
    setExplored(new Set());
    setFringe([LAB_TREE_ROOT]);
    setCurrent(null);
    setExpandIdx(0);
    setWrongNode(null);
    setComplete(false);
    completedRef.current = false;
    setMessage(
      `Click the correct fringe node to expand. ${mode === 'dfs' ? 'DFS uses a stack (LIFO).' : 'BFS uses a queue (FIFO).'}`,
    );
  }, [mode]);

  return (
    <div className="rounded-lg border bg-card overflow-hidden my-4">
      <div className="flex flex-col lg:flex-row">
        {/* Left: ReactFlow tree */}
        <div className="flex-1 min-w-0" style={{ minHeight: 350 }}>
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

        {/* Right: Fringe panel */}
        <div className="lg:w-48 border-t lg:border-t-0 lg:border-l p-4 flex flex-col gap-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {mode === 'dfs' ? 'Stack (LIFO)' : 'Queue (FIFO)'}
          </div>

          {mode === 'dfs' ? (
            /* DFS: vertical list, top = next to expand */
            <div className="flex flex-col gap-1.5 min-h-[60px]">
              <AnimatePresence mode="popLayout">
                {fringe.map((nodeId) => (
                  <motion.div
                    key={nodeId}
                    layout
                    initial={{ opacity: 0, scale: 0.8, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: 10 }}
                    transition={{ duration: 0.25 }}
                    className={`flex items-center justify-center rounded-md border text-sm font-bold px-3 py-1.5 ${
                      nodeId === fringe[0]
                        ? 'bg-yellow-400/20 border-yellow-400/50 text-yellow-700 dark:text-yellow-300'
                        : 'bg-muted/50 text-muted-foreground'
                    }`}
                  >
                    {nodeId}
                    {nodeId === fringe[0] && (
                      <span className="ml-1.5 text-[10px] font-normal opacity-70">
                        &larr; top
                      </span>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
              {fringe.length === 0 && (
                <div className="text-xs text-muted-foreground italic">empty</div>
              )}
            </div>
          ) : (
            /* BFS: horizontal list, left = next to expand */
            <div className="flex flex-wrap gap-1.5 min-h-[36px]">
              <AnimatePresence mode="popLayout">
                {fringe.map((nodeId, i) => (
                  <motion.div
                    key={nodeId}
                    layout
                    initial={{ opacity: 0, scale: 0.8, x: 10 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.8, x: -10 }}
                    transition={{ duration: 0.25 }}
                    className={`flex items-center justify-center rounded-md border text-sm font-bold px-2.5 py-1 ${
                      i === 0
                        ? 'bg-yellow-400/20 border-yellow-400/50 text-yellow-700 dark:text-yellow-300'
                        : 'bg-muted/50 text-muted-foreground'
                    }`}
                  >
                    {nodeId}
                    {i === 0 && (
                      <span className="ml-1 text-[10px] font-normal opacity-70">
                        &larr; front
                      </span>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
              {fringe.length === 0 && (
                <div className="text-xs text-muted-foreground italic">empty</div>
              )}
            </div>
          )}

          {/* Legend */}
          <div className="mt-auto pt-3 border-t space-y-1.5">
            <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">
              Legend
            </div>
            {[
              { color: COL_UNSEEN, label: 'Unseen' },
              { color: COL_FRINGE, label: 'Fringe' },
              { color: COL_CURRENT, label: 'Current' },
              { color: COL_EXPLORED, label: 'Explored' },
              { color: COL_GOAL, label: 'Goal' },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-2 text-xs text-muted-foreground">
                <div
                  className="size-3 rounded-full shrink-0"
                  style={{ backgroundColor: color }}
                />
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Message area */}
      <div className="border-t px-4 py-3 flex items-center justify-between gap-3">
        <div className="text-sm text-muted-foreground min-h-5 flex-1">
          {complete ? (
            <span className="font-semibold text-primary">{message}</span>
          ) : (
            message
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs gap-1 shrink-0"
          onClick={handleReset}
        >
          <RotateCcw className="size-3" />
          Reset
        </Button>
      </div>
    </div>
  );
}
