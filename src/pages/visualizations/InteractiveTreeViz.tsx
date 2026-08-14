import { useCallback, useMemo, useState } from 'react';
import {
  ReactFlow,
  type Node,
  type Edge,
  type NodeMouseHandler,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { TREE_NODES, TREE_GOAL } from './tree-drawing.ts';
import TreeNodeComponent, { type TreeNodeData, type TreeNodeState } from './TreeNode.tsx';
import { useResolvedColors } from '@/hooks/useResolvedColors';

const nodeTypes = { treeNode: TreeNodeComponent };

const NODE_SIZE = 48;

const edges: Edge[] = Object.values(TREE_NODES).flatMap((node) =>
  node.children.map((childId) => ({
    id: `${node.id}-${childId}`,
    source: node.id,
    target: childId,
    type: 'straight',
    selectable: false,
    focusable: false,
  })),
);

export default function InteractiveTreeViz() {
  const resolvedColors = useResolvedColors();
  const [explored, setExplored] = useState<Set<string>>(() => new Set());
  const [fringeSet, setFringeSet] = useState<Set<string>>(() => new Set(['A']));
  const [goalFound, setGoalFound] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  const nodes: Node[] = useMemo(() => {
    return Object.values(TREE_NODES).map((treeNode) => {
      let state: TreeNodeState = 'unseen';
      if (goalFound === treeNode.id) state = 'goal';
      else if (explored.has(treeNode.id)) state = 'explored';
      else if (fringeSet.has(treeNode.id)) state = 'fringe';

      return {
        id: treeNode.id,
        type: 'treeNode',
        position: { x: treeNode.x - NODE_SIZE / 2, y: treeNode.y - NODE_SIZE / 2 },
        data: {
          label: treeNode.id,
          isGoal: treeNode.id === TREE_GOAL,
          state,
          clickable: !goalFound && fringeSet.has(treeNode.id),
        } satisfies TreeNodeData,
        draggable: false,
        selectable: false,
        connectable: false,
      };
    });
  }, [explored, fringeSet, goalFound]);

  const onNodeClick: NodeMouseHandler = useCallback(
    (_event, node) => {
      if (goalFound) return;
      if (!fringeSet.has(node.id)) return;

      const newFringe = new Set(fringeSet);
      const newExplored = new Set(explored);

      newFringe.delete(node.id);
      newExplored.add(node.id);

      if (node.id === TREE_GOAL) {
        setGoalFound(node.id);
        setMessage(`Goal ${TREE_GOAL} found!`);
      } else {
        for (const child of TREE_NODES[node.id].children) {
          if (!newExplored.has(child)) {
            newFringe.add(child);
          }
        }
        setMessage(`Expanded ${node.id}. Children added to fringe.`);
      }

      setFringeSet(newFringe);
      setExplored(newExplored);
    },
    [fringeSet, explored, goalFound],
  );

  const handleReset = useCallback(() => {
    setExplored(new Set());
    setFringeSet(new Set(['A']));
    setGoalFound(null);
    setMessage('');
  }, []);

  const fringeText = fringeSet.size > 0 ? [...fringeSet].join(', ') : null;

  return (
    <div className="rounded-lg border bg-card p-4 my-6 overflow-hidden">
      <div className="text-sm font-medium text-muted-foreground mb-3">
        Interactive Tree Exploration
      </div>
      <div style={{ height: 280 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodeClick={onNodeClick}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          panOnDrag={false}
          zoomOnScroll={false}
          zoomOnPinch={false}
          zoomOnDoubleClick={false}
          preventScrolling={false}
          proOptions={{ hideAttribution: true }}
          defaultEdgeOptions={{
            style: { stroke: resolvedColors.border, strokeWidth: 1.5 },
          }}
          style={{ background: 'transparent' }}
        />
      </div>
      <div className="mt-3 text-sm font-mono leading-relaxed min-h-6">
        <strong>Fringe:</strong>{' '}
        {fringeText ?? <em className="text-muted-foreground">empty</em>}
      </div>
      {message && (
        <div className="mt-2 text-xs text-muted-foreground italic min-h-5">
          {message}
        </div>
      )}
      <button
        className="mt-2 inline-flex items-center rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors"
        type="button"
        onClick={handleReset}
      >
        Reset
      </button>
    </div>
  );
}
