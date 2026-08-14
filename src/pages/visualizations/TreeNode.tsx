import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { COL_UNSEEN, COL_FRINGE, COL_EXPLORED, COL_GOAL, contrastText } from './tree-drawing.ts';

export type TreeNodeState = 'unseen' | 'fringe' | 'explored' | 'goal';

export interface TreeNodeData {
  label: string;
  isGoal: boolean;
  state: TreeNodeState;
  clickable: boolean;
  [key: string]: unknown;
}

const STATE_COLORS: Record<TreeNodeState, string> = {
  unseen: COL_UNSEEN,
  fringe: COL_FRINGE,
  explored: COL_EXPLORED,
  goal: COL_GOAL,
};

function TreeNodeComponent({ data }: NodeProps) {
  const { label, isGoal, state, clickable } = data as TreeNodeData;

  return (
    <>
      <Handle type="target" position={Position.Top} className="!bg-transparent !border-0 !w-0 !h-0" />
      <div
        className="flex items-center justify-center rounded-full text-sm font-bold select-none"
        style={{
          width: 48,
          height: 48,
          backgroundColor: STATE_COLORS[state],
          color: contrastText(STATE_COLORS[state]),
          cursor: clickable ? 'pointer' : 'default',
          outline: clickable ? '2px dashed var(--foreground)' : 'none',
          outlineOffset: '4px',
          transition: 'background-color 200ms, outline 200ms',
        }}
      >
        {label}{isGoal ? ' (G)' : ''}
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-transparent !border-0 !w-0 !h-0" />
    </>
  );
}

export default memo(TreeNodeComponent);
