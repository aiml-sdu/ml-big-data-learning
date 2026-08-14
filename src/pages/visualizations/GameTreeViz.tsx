import { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  tttEmpty,
  tttSuccessors,
  tttIsTerminal,
  tttUtility,
  tttCurrentPlayer,
} from '@/lib/adversarial';
import type { TTTBoard } from '@/lib/adversarial';

// ---------------------------------------------------------------------------
// Tree node type
// ---------------------------------------------------------------------------

interface TreeNode {
  id: string;
  board: TTTBoard;
  player: 'MAX' | 'MIN';
  terminal: boolean;
  utility: number;
  children: TreeNode[];
  move: number; // index of the move that led here (-1 for root)
  hiddenCount: number; // how many siblings are hidden
}

const MAX_CHILDREN = 3;

function buildTree(board: TTTBoard, depth: number, maxDepth: number, parentId: string, move: number): TreeNode {
  const player = tttCurrentPlayer(board);
  const isMax = player === 'X';
  const terminal = tttIsTerminal(board);
  const id = parentId ? `${parentId}-${move}` : 'root';

  const node: TreeNode = {
    id,
    board,
    player: isMax ? 'MAX' : 'MIN',
    terminal,
    utility: terminal ? tttUtility(board) : 0,
    children: [],
    move,
    hiddenCount: 0,
  };

  if (!terminal && depth < maxDepth) {
    const successors = tttSuccessors(board, player);
    const shown = successors.slice(0, MAX_CHILDREN);
    node.hiddenCount = Math.max(0, successors.length - MAX_CHILDREN);
    node.children = shown.map(s => buildTree(s.board, depth + 1, maxDepth, id, s.move));
  }

  return node;
}

// ---------------------------------------------------------------------------
// Layout constants
// ---------------------------------------------------------------------------

const NODE_W = 64;
const NODE_H = 72;
const H_GAP = 16;
const V_GAP = 56;
const BOARD_SIZE = 36;
const CELL = BOARD_SIZE / 3;

// ---------------------------------------------------------------------------
// Compute layout positions (recursive, bottom-up width)
// ---------------------------------------------------------------------------

interface LayoutNode {
  node: TreeNode;
  x: number;
  y: number;
  width: number;
  children: LayoutNode[];
}

function layoutTree(node: TreeNode, expandedSet: Set<string>, depth: number): LayoutNode {
  const isExpanded = expandedSet.has(node.id);
  const hasVisibleChildren = isExpanded && node.children.length > 0;

  const childLayouts: LayoutNode[] = [];
  let totalChildWidth = 0;

  if (hasVisibleChildren) {
    for (let i = 0; i < node.children.length; i++) {
      const cl = layoutTree(node.children[i], expandedSet, depth + 1);
      childLayouts.push(cl);
      totalChildWidth += cl.width;
    }
    // Add "..." indicator width if there are hidden children
    if (node.hiddenCount > 0) {
      totalChildWidth += NODE_W + H_GAP;
    }
    if (childLayouts.length > 1) {
      totalChildWidth += (childLayouts.length - 1) * H_GAP;
      if (node.hiddenCount > 0) {
        // Already added gap above
      }
    } else if (childLayouts.length === 1 && node.hiddenCount > 0) {
      totalChildWidth += H_GAP;
    }
  }

  const myWidth = Math.max(NODE_W, totalChildWidth);
  const y = depth * (NODE_H + V_GAP);

  // Position children within this node's width
  let cx = 0;
  for (const cl of childLayouts) {
    cl.x = cx + cl.width / 2;
    cx += cl.width + H_GAP;
    cl.y = (depth + 1) * (NODE_H + V_GAP);
  }

  return {
    node,
    x: myWidth / 2,
    y,
    width: myWidth,
    children: childLayouts,
  };
}

function flattenLayout(ln: LayoutNode, offsetX: number): { nodes: Array<{ node: TreeNode; x: number; y: number }>; edges: Array<{ x1: number; y1: number; x2: number; y2: number }>; moreIndicators: Array<{ x: number; y: number; count: number }> } {
  const nodes: Array<{ node: TreeNode; x: number; y: number }> = [];
  const edges: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];
  const moreIndicators: Array<{ x: number; y: number; count: number }> = [];

  const myX = offsetX + ln.x;
  const myY = ln.y;
  nodes.push({ node: ln.node, x: myX, y: myY });

  const childBaseX = offsetX + ln.x - (ln.children.reduce((s, c) => s + c.width + H_GAP, 0) + (ln.node.hiddenCount > 0 ? NODE_W + H_GAP : 0) - H_GAP) / 2;

  let cx = childBaseX;
  for (const cl of ln.children) {
    const childX = cx + cl.width / 2;
    edges.push({ x1: myX, y1: myY + NODE_H, x2: childX, y2: cl.y });

    const sub = flattenLayout(cl, cx);
    nodes.push(...sub.nodes);
    edges.push(...sub.edges);
    moreIndicators.push(...sub.moreIndicators);
    cx += cl.width + H_GAP;
  }

  if (ln.node.hiddenCount > 0 && ln.children.length > 0) {
    const moreX = cx + NODE_W / 2;
    const moreY = (ln.y + NODE_H + V_GAP);
    edges.push({ x1: myX, y1: myY + NODE_H, x2: moreX, y2: moreY });
    moreIndicators.push({ x: moreX, y: moreY, count: ln.node.hiddenCount });
  }

  return { nodes, edges, moreIndicators };
}

// ---------------------------------------------------------------------------
// Mini TTT Board (SVG)
// ---------------------------------------------------------------------------

function MiniBoard({ board, x, y }: { board: TTTBoard; x: number; y: number }) {
  const ox = x - BOARD_SIZE / 2;
  const oy = y - BOARD_SIZE / 2;

  return (
    <g>
      {/* Grid lines */}
      <line x1={ox + CELL} y1={oy} x2={ox + CELL} y2={oy + BOARD_SIZE} className="stroke-muted-foreground/40" strokeWidth={0.5} />
      <line x1={ox + CELL * 2} y1={oy} x2={ox + CELL * 2} y2={oy + BOARD_SIZE} className="stroke-muted-foreground/40" strokeWidth={0.5} />
      <line x1={ox} y1={oy + CELL} x2={ox + BOARD_SIZE} y2={oy + CELL} className="stroke-muted-foreground/40" strokeWidth={0.5} />
      <line x1={ox} y1={oy + CELL * 2} x2={ox + BOARD_SIZE} y2={oy + CELL * 2} className="stroke-muted-foreground/40" strokeWidth={0.5} />

      {/* Pieces */}
      {board.map((cell, i) => {
        if (!cell) return null;
        const r = Math.floor(i / 3);
        const c = i % 3;
        const cx = ox + c * CELL + CELL / 2;
        const cy = oy + r * CELL + CELL / 2;
        const s = CELL * 0.32;

        if (cell === 'X') {
          return (
            <g key={i}>
              <line x1={cx - s} y1={cy - s} x2={cx + s} y2={cy + s} stroke="#3b82f6" strokeWidth={1.5} strokeLinecap="round" />
              <line x1={cx + s} y1={cy - s} x2={cx - s} y2={cy + s} stroke="#3b82f6" strokeWidth={1.5} strokeLinecap="round" />
            </g>
          );
        }
        return (
          <circle key={i} cx={cx} cy={cy} r={s} fill="none" stroke="#ef4444" strokeWidth={1.5} />
        );
      })}
    </g>
  );
}

// ---------------------------------------------------------------------------
// Player indicator (triangle)
// ---------------------------------------------------------------------------

function PlayerTriangle({ x, y, player }: { x: number; y: number; player: 'MAX' | 'MIN' }) {
  const size = 8;
  if (player === 'MAX') {
    // Upward triangle (blue)
    const points = `${x},${y - size} ${x - size},${y + size * 0.6} ${x + size},${y + size * 0.6}`;
    return <polygon points={points} fill="#3b82f6" opacity={0.9} />;
  }
  // Downward triangle (red)
  const points = `${x},${y + size} ${x - size},${y - size * 0.6} ${x + size},${y - size * 0.6}`;
  return <polygon points={points} fill="#ef4444" opacity={0.9} />;
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function GameTreeViz() {
  const MAX_DEPTH = 3;

  const tree = useMemo(() => buildTree(tttEmpty(), 0, MAX_DEPTH, '', -1), []);

  // Start with root expanded
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(['root']));

  const toggleNode = useCallback((id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        // Collapse: remove this node and all descendants
        for (const key of prev) {
          if (key === id || key.startsWith(id + '-')) {
            next.delete(key);
          }
        }
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const root = useMemo(() => layoutTree(tree, expanded, 0), [tree, expanded]);
  const { nodes, edges, moreIndicators } = useMemo(() => flattenLayout(root, 0), [root]);

  const PADDING = 40;
  const minX = Math.min(...nodes.map(n => n.x), ...moreIndicators.map(m => m.x)) - NODE_W / 2 - PADDING;
  const maxX = Math.max(...nodes.map(n => n.x), ...moreIndicators.map(m => m.x)) + NODE_W / 2 + PADDING;
  const maxY = Math.max(...nodes.map(n => n.y), ...moreIndicators.map(m => m.y)) + NODE_H + PADDING;
  const svgW = maxX - minX;
  const svgH = maxY + PADDING;

  return (
    <div className="rounded-lg border border-border bg-card p-4 my-6">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-muted-foreground">
          Tic-Tac-Toe Game Tree — click nodes to expand/collapse
        </p>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 12 12"><polygon points="6,1 1,10 11,10" fill="#3b82f6" /></svg>
            MAX (X)
          </span>
          <span className="flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 12 12"><polygon points="6,11 1,2 11,2" fill="#ef4444" /></svg>
            MIN (O)
          </span>
        </div>
      </div>

      <div className="overflow-x-auto -mx-4 px-4">
        <svg
          viewBox={`${minX} 0 ${svgW} ${svgH}`}
          width={svgW}
          style={{ display: 'block', minWidth: svgW, height: 'auto', maxHeight: 600 }}
        >
          {/* Edges */}
          {edges.map((e, i) => (
            <motion.line
              key={`e-${i}`}
              x1={e.x1}
              y1={e.y1}
              x2={e.x2}
              y2={e.y2}
              className="stroke-muted-foreground/30"
              strokeWidth={1.5}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
          ))}

          {/* "...and N more" indicators */}
          {moreIndicators.map((m, i) => (
            <g key={`more-${i}`}>
              <text
                x={m.x}
                y={m.y + 20}
                textAnchor="middle"
                className="fill-muted-foreground"
                style={{ fontSize: 11, fontFamily: 'var(--font-sans, system-ui, sans-serif)' }}
              >
                +{m.count} more
              </text>
            </g>
          ))}

          {/* Nodes */}
          {nodes.map(({ node: n, x, y }) => {
            const canExpand = !n.terminal && n.children.length > 0;
            const isExpanded = expanded.has(n.id);
            const clickable = canExpand;

            return (
              <motion.g
                key={n.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25, type: 'spring', stiffness: 300, damping: 25 }}
                style={{ cursor: clickable ? 'pointer' : 'default' }}
                onClick={() => clickable && toggleNode(n.id)}
              >
                {/* Node background */}
                <rect
                  x={x - NODE_W / 2}
                  y={y}
                  width={NODE_W}
                  height={NODE_H}
                  rx={8}
                  className={`
                    ${isExpanded ? 'fill-accent stroke-primary' : 'fill-card stroke-border'}
                    ${clickable ? 'hover:stroke-primary' : ''}
                  `}
                  strokeWidth={isExpanded ? 1.5 : 1}
                />

                {/* Player triangle */}
                <PlayerTriangle x={x} y={y + 10} player={n.player} />

                {/* Mini board */}
                <MiniBoard board={n.board} x={x} y={y + 38} />

                {/* Terminal utility value */}
                {n.terminal && (
                  <text
                    x={x}
                    y={y + NODE_H + 14}
                    textAnchor="middle"
                    style={{ fontSize: 12, fontWeight: 'bold', fontFamily: 'var(--font-mono, monospace)' }}
                    className={n.utility > 0 ? 'fill-blue-500' : n.utility < 0 ? 'fill-red-500' : 'fill-muted-foreground'}
                  >
                    {n.utility > 0 ? '+1' : n.utility < 0 ? '-1' : '0'}
                  </text>
                )}

                {/* Expand indicator for non-terminal collapsed nodes */}
                {canExpand && !isExpanded && (
                  <text
                    x={x}
                    y={y + NODE_H + 14}
                    textAnchor="middle"
                    className="fill-muted-foreground"
                    style={{ fontSize: 10, fontFamily: 'var(--font-sans, system-ui, sans-serif)' }}
                  >
                    click to expand
                  </text>
                )}
              </motion.g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
