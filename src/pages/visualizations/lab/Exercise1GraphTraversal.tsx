import { useMemo, useState, useCallback } from 'react';
import {
  ReactFlow,
  type Node,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ExerciseCard from '@/components/ExerciseCard';
import StepChallenge, { type StepDef } from '@/components/StepChallenge';
import CodePlayground, { type TestCase } from '@/components/CodePlayground';
import HintPanel from '@/components/HintPanel';
import { useResolvedColors } from '@/hooks/useResolvedColors';
import FringeTraceViz from './FringeTraceViz';
import {
  LAB_TREE,
  LAB_TREE_GOAL,
  LEAF_COUNT,
  getDFSOrder,
  getBFSOrder,
} from './exercise1-data';

// ---------- Read-only tree node for Step 1 ----------

const NODE_PX = 44;

interface ReadOnlyNodeData {
  label: string;
  isGoal: boolean;
  [key: string]: unknown;
}

function ReadOnlyTreeNode({ data }: NodeProps) {
  const { label, isGoal } = data as ReadOnlyNodeData;
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
          backgroundColor: '#9ca3af',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: 14,
          fontWeight: 700,
          userSelect: 'none',
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

const readOnlyNodeTypes = { readOnlyTreeNode: ReadOnlyTreeNode };

// Static data for the read-only tree
const readOnlyNodes: Node[] = Object.values(LAB_TREE).map((n) => ({
  id: n.id,
  type: 'readOnlyTreeNode',
  position: { x: n.x - NODE_PX / 2, y: n.y - NODE_PX / 2 },
  data: {
    label: n.id,
    isGoal: n.id === LAB_TREE_GOAL,
  } satisfies ReadOnlyNodeData,
  draggable: false,
  selectable: false,
  connectable: false,
}));

const readOnlyEdges: Edge[] = Object.values(LAB_TREE).flatMap((node) =>
  node.children.map((childId) => ({
    id: `ro-${node.id}-${childId}`,
    source: node.id,
    target: childId,
    type: 'straight',
    selectable: false,
    focusable: false,
  })),
);

// ---------- Step 1: Understand the Tree ----------

function Step1Content({ onComplete }: { onComplete: () => void }) {
  const resolvedColors = useResolvedColors();
  const [answer, setAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [wrongCount, setWrongCount] = useState(0);

  const handleSubmit = useCallback(() => {
    const num = parseInt(answer.trim(), 10);
    const isCorrect = num === LEAF_COUNT;
    setSubmitted(true);
    setCorrect(isCorrect);
    if (isCorrect) {
      onComplete();
    } else {
      setWrongCount((c) => c + 1);
    }
  }, [answer, onComplete]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && answer.trim() && !correct) {
        handleSubmit();
      }
    },
    [answer, correct, handleSubmit],
  );

  return (
    <div>
      <p className="text-sm text-muted-foreground mb-3">
        Study the A-J tree below. Node A is the root and node J (marked G) is
        the goal. Each node's children are ordered left-to-right alphabetically.
      </p>

      <div className="rounded-lg border bg-card overflow-hidden" style={{ height: 350 }}>
        <ReactFlow
          nodes={readOnlyNodes}
          edges={readOnlyEdges}
          nodeTypes={readOnlyNodeTypes}
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

      <div className="mt-4 flex items-center gap-3">
        <label className="text-sm font-medium" htmlFor="leaf-count">
          How many leaf nodes does this tree have?
        </label>
        <input
          id="leaf-count"
          type="number"
          min={0}
          max={20}
          value={answer}
          onChange={(e) => {
            setAnswer(e.target.value);
            setSubmitted(false);
          }}
          onKeyDown={handleKeyDown}
          disabled={correct}
          className="w-16 rounded-md border bg-transparent px-2 py-1 text-sm text-center outline-none focus:ring-2 focus:ring-primary/40"
          placeholder="?"
        />
        <Button
          size="sm"
          className="h-8 text-xs"
          onClick={handleSubmit}
          disabled={!answer.trim() || correct}
        >
          Check
        </Button>
      </div>

      {submitted && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-2 flex items-center gap-1.5 text-sm font-medium ${
            correct
              ? 'text-green-700 dark:text-green-400'
              : 'text-red-700 dark:text-red-400'
          }`}
        >
          {correct ? (
            <>
              <Check className="size-4" />
              Correct! The leaf nodes are F, G, I, and J.
            </>
          ) : (
            <>
              <X className="size-4" />
              Not quite. Leaf nodes have no children -- count them carefully.
            </>
          )}
        </motion.div>
      )}

      {!correct && (
        <HintPanel
          hints={[
            { label: 'Nudge', content: 'A leaf node is any node with no children — look at the bottom of each branch.' },
            { label: 'Strategy', content: 'Trace each path from A downward. Nodes that don\'t branch further are leaves.' },
            { label: 'Answer', content: 'The four leaf nodes are D, F, H, and J. Count: 4.' },
          ]}
          failCount={wrongCount}
        />
      )}
    </div>
  );
}

// ---------- Step 2: CodePlayground ----------

const TEMPLATE_CODE = `function insert(queue, node, insertFirst) {
  // Insert node into queue
  // If insertFirst is true, add to front (DFS behavior)
  // If insertFirst is false, add to back (BFS behavior)
  // Return the modified queue
}

function removeFirst(queue) {
  // Remove and return the first element
}

function insertAll(queue, nodes, insertFirst) {
  // Insert all nodes into queue
  // Return the modified queue
}`;

const TEST_CASES: TestCase[] = [
  {
    label: 'insert(["B"], "C", false) -> ["B","C"]',
    call: 'insert(["B"], "C", false)',
    expected: '["B","C"]',
  },
  {
    label: 'insert(["B"], "C", true) -> ["C","B"]',
    call: 'insert(["B"], "C", true)',
    expected: '["C","B"]',
  },
  {
    label: 'removeFirst(["A","B","C"]) -> "A"',
    call: 'removeFirst(["A","B","C"])',
    expected: '"A"',
  },
  {
    label: 'insertAll(["A"], ["B","C"], false) -> ["A","B","C"]',
    call: 'insertAll(["A"], ["B","C"], false)',
    expected: '["A","B","C"]',
  },
  {
    label: 'insertAll(["A"], ["B","C"], true) -> ["B","C","A"]',
    call: 'insertAll(["A"], ["B","C"], true)',
    expected: '["B","C","A"]',
  },
];

const CODE_HINTS = [
  { label: 'Nudge', content: 'JavaScript arrays have push(), unshift(), and shift() — those are the only methods you need.' },
  { label: 'Strategy', content: 'insert: use insertFirst ? unshift() : push(). removeFirst: use shift(). insertAll: loop over nodes calling insert.' },
  { label: 'Full solution', content: 'insert → insertFirst ? (queue.unshift(node), queue) : (queue.push(node), queue). removeFirst → queue.shift(). insertAll → for each node, call insert.' },
];

function Step2Content({ onComplete }: { onComplete: () => void }) {
  return (
    <div>
      <p className="text-sm text-muted-foreground mb-3">
        Implement the basic fringe operations. These work for both DFS (stack)
        and BFS (queue) -- the only difference is whether new nodes go to the
        front or back.
      </p>
      <CodePlayground
        templateCode={TEMPLATE_CODE}
        testCases={TEST_CASES}
        hints={CODE_HINTS}
        onAllPass={onComplete}
      />
    </div>
  );
}

// ---------- Summary comparison ----------

function SummaryCard() {
  const dfsOrder = useMemo(() => getDFSOrder(), []);
  const bfsOrder = useMemo(() => getBFSOrder(), []);

  // Find goal index (inclusive) for path length
  const dfsToGoal = dfsOrder.slice(0, dfsOrder.indexOf(LAB_TREE_GOAL) + 1);
  const bfsToGoal = bfsOrder.slice(0, bfsOrder.indexOf(LAB_TREE_GOAL) + 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="rounded-lg border bg-card p-5 mt-6"
    >
      <h4 className="text-sm font-semibold mb-4">
        Comparison: DFS vs BFS on the A-J Tree
      </h4>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-md border p-3 space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            DFS (Depth-First)
          </div>
          <div className="text-sm">
            <span className="font-medium">Expansion order:</span>{' '}
            <span className="font-mono text-xs">
              {dfsToGoal.join(' -> ')}
            </span>
          </div>
          <div className="text-sm">
            <span className="font-medium">Nodes expanded:</span>{' '}
            {dfsToGoal.length}
          </div>
        </div>

        <div className="rounded-md border p-3 space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            BFS (Breadth-First)
          </div>
          <div className="text-sm">
            <span className="font-medium">Expansion order:</span>{' '}
            <span className="font-mono text-xs">
              {bfsToGoal.join(' -> ')}
            </span>
          </div>
          <div className="text-sm">
            <span className="font-medium">Nodes expanded:</span>{' '}
            {bfsToGoal.length}
          </div>
        </div>
      </div>

      <p className="text-sm text-muted-foreground mt-4">
        DFS found the goal after expanding only{' '}
        <strong>{dfsToGoal.length}</strong> nodes by diving deep along the
        left branch. BFS had to expand{' '}
        <strong>{bfsToGoal.length}</strong> nodes, exploring every level
        before reaching J. In this tree, DFS is more efficient -- but that is
        not always the case!
      </p>
    </motion.div>
  );
}

// ---------- main export ----------

export default function Exercise1GraphTraversal() {
  const [dfsComplete, setDfsComplete] = useState(false);
  const [bfsComplete, setBfsComplete] = useState(false);

  const steps: StepDef[] = useMemo(
    () => [
      {
        id: 1,
        title: 'Understand the Tree',
        content: (onComplete: () => void) => (
          <Step1Content onComplete={onComplete} />
        ),
      },
      {
        id: 2,
        title: 'Implement the Fringe',
        content: (onComplete: () => void) => (
          <Step2Content onComplete={onComplete} />
        ),
      },
      {
        id: 3,
        title: 'Trace DFS',
        content: (onComplete: () => void) => (
          <div>
            <p className="text-sm text-muted-foreground mb-3">
              Depth-First Search uses a <strong>stack</strong> (LIFO). Click
              fringe nodes in the correct DFS expansion order to reach the goal.
            </p>
            <FringeTraceViz
              mode="dfs"
              onComplete={() => {
                setDfsComplete(true);
                onComplete();
              }}
            />
            <HintPanel
              hints={[
                { label: 'Nudge', content: 'DFS always expands the most recently added node — think LIFO (last in, first out).' },
                { label: 'Strategy', content: 'When a node is expanded, its children go on top of the stack. Always pick the top of the stack next.' },
                { label: 'Full order', content: 'A → B → D → E → F → C → G → H → I → J. DFS dives deep before backtracking.' },
              ]}
            />
          </div>
        ),
      },
      {
        id: 4,
        title: 'Trace BFS',
        content: (onComplete: () => void) => (
          <div>
            <p className="text-sm text-muted-foreground mb-3">
              Breadth-First Search uses a <strong>queue</strong> (FIFO). Click
              fringe nodes in the correct BFS expansion order to reach the goal.
            </p>
            <FringeTraceViz
              mode="bfs"
              onComplete={() => {
                setBfsComplete(true);
                onComplete();
              }}
            />
            <HintPanel
              hints={[
                { label: 'Nudge', content: 'BFS always expands the oldest node in the fringe — think FIFO (first in, first out).' },
                { label: 'Strategy', content: 'New children go to the back of the queue. Always pick the front of the queue next.' },
                { label: 'Full order', content: 'A → B → C → D → E → G → H → F → I → J. BFS explores level by level.' },
              ]}
            />
            {dfsComplete && bfsComplete && <SummaryCard />}
          </div>
        ),
      },
    ],
    [dfsComplete, bfsComplete],
  );

  return (
    <ExerciseCard
      exerciseId="lab-t03-ex1"
      number={1}
      title="Graph Traversal: The A-J Tree"
      totalSteps={4}
      defaultOpen
    >
      <StepChallenge exerciseId="lab-t03-ex1" steps={steps} />
    </ExerciseCard>
  );
}
