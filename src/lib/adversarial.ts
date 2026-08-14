// ---------------------------------------------------------------------------
// adversarial.ts – Game algorithms as generator functions + game logic
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Player = 'MAX' | 'MIN' | 'CHANCE';

export interface GameNode {
  id: string;
  player: Player;
  children: GameNode[];
  utility?: number;       // terminal value
  minimaxValue?: number;  // computed minimax value
  alpha?: number;
  beta?: number;
  pruned?: boolean;
  chanceProb?: number;    // probability for chance nodes
}

export interface MinimaxStep {
  type: 'visit' | 'backtrack' | 'done';
  nodeId: string;
  value?: number;
  message: string;
}

export interface AlphaBetaStep {
  type: 'visit' | 'update' | 'prune' | 'backtrack' | 'done';
  nodeId: string;
  alpha: number;
  beta: number;
  value?: number;
  prunedChildren?: string[];
  message: string;
  evaluated: number;
  totalLeaves: number;
  pruned: number;
}

// ---------------------------------------------------------------------------
// Minimax (generator-based for animation)
// ---------------------------------------------------------------------------

export function* minimaxGen(node: GameNode): Generator<MinimaxStep> {
  let evaluated = 0;

  function* recurse(n: GameNode): Generator<MinimaxStep, number> {
    yield { type: 'visit', nodeId: n.id, message: `Visiting ${n.id} (${n.player})` };

    if (n.children.length === 0) {
      evaluated++;
      const val = n.utility ?? 0;
      yield { type: 'backtrack', nodeId: n.id, value: val, message: `Leaf ${n.id} = ${val}` };
      return val;
    }

    let best: number;
    if (n.player === 'MAX') {
      best = -Infinity;
      for (const child of n.children) {
        const childVal = yield* recurse(child);
        best = Math.max(best, childVal);
      }
    } else {
      best = Infinity;
      for (const child of n.children) {
        const childVal = yield* recurse(child);
        best = Math.min(best, childVal);
      }
    }

    yield { type: 'backtrack', nodeId: n.id, value: best, message: `${n.id} (${n.player}) = ${best}` };
    return best;
  }

  const finalValue = yield* recurse(node);
  yield { type: 'done', nodeId: node.id, value: finalValue, message: `Minimax value: ${finalValue}` };
}

// ---------------------------------------------------------------------------
// Alpha-Beta Pruning (generator-based for animation)
// ---------------------------------------------------------------------------

function countLeaves(node: GameNode): number {
  if (node.children.length === 0) return 1;
  return node.children.reduce((s, c) => s + countLeaves(c), 0);
}

export function* alphaBetaGen(root: GameNode): Generator<AlphaBetaStep> {
  let evaluated = 0;
  let pruned = 0;
  const totalLeaves = countLeaves(root);

  function* recurse(
    n: GameNode,
    alpha: number,
    beta: number,
  ): Generator<AlphaBetaStep, number> {
    yield {
      type: 'visit', nodeId: n.id, alpha, beta,
      message: `Visit ${n.id} (${n.player}) [α=${alpha === -Infinity ? '-∞' : alpha}, β=${beta === Infinity ? '∞' : beta}]`,
      evaluated, totalLeaves, pruned,
    };

    if (n.children.length === 0) {
      evaluated++;
      const val = n.utility ?? 0;
      yield {
        type: 'backtrack', nodeId: n.id, alpha, beta, value: val,
        message: `Leaf ${n.id} = ${val}`,
        evaluated, totalLeaves, pruned,
      };
      return val;
    }

    if (n.player === 'MAX') {
      let value = -Infinity;
      for (let i = 0; i < n.children.length; i++) {
        const child = n.children[i];
        const childVal = yield* recurse(child, alpha, beta);
        value = Math.max(value, childVal);
        alpha = Math.max(alpha, value);
        yield {
          type: 'update', nodeId: n.id, alpha, beta, value,
          message: `${n.id}: value=${value}, α=${alpha}`,
          evaluated, totalLeaves, pruned,
        };
        if (alpha >= beta) {
          const prunedIds = n.children.slice(i + 1).map(c => c.id);
          pruned += countRemainingLeaves(n.children.slice(i + 1));
          yield {
            type: 'prune', nodeId: n.id, alpha, beta, value,
            prunedChildren: prunedIds,
            message: `Prune at ${n.id}: α(${alpha}) ≥ β(${beta})`,
            evaluated, totalLeaves, pruned,
          };
          break;
        }
      }
      yield {
        type: 'backtrack', nodeId: n.id, alpha, beta, value,
        message: `${n.id} (MAX) = ${value}`,
        evaluated, totalLeaves, pruned,
      };
      return value;
    } else {
      let value = Infinity;
      for (let i = 0; i < n.children.length; i++) {
        const child = n.children[i];
        const childVal = yield* recurse(child, alpha, beta);
        value = Math.min(value, childVal);
        beta = Math.min(beta, value);
        yield {
          type: 'update', nodeId: n.id, alpha, beta, value,
          message: `${n.id}: value=${value}, β=${beta}`,
          evaluated, totalLeaves, pruned,
        };
        if (alpha >= beta) {
          const prunedIds = n.children.slice(i + 1).map(c => c.id);
          pruned += countRemainingLeaves(n.children.slice(i + 1));
          yield {
            type: 'prune', nodeId: n.id, alpha, beta, value,
            prunedChildren: prunedIds,
            message: `Prune at ${n.id}: α(${alpha}) ≥ β(${beta})`,
            evaluated, totalLeaves, pruned,
          };
          break;
        }
      }
      yield {
        type: 'backtrack', nodeId: n.id, alpha, beta, value,
        message: `${n.id} (MIN) = ${value}`,
        evaluated, totalLeaves, pruned,
      };
      return value;
    }
  }

  function countRemainingLeaves(nodes: GameNode[]): number {
    return nodes.reduce((s, n) => s + countLeaves(n), 0);
  }

  const finalValue = yield* recurse(root, -Infinity, Infinity);
  yield {
    type: 'done', nodeId: root.id, alpha: finalValue, beta: finalValue, value: finalValue,
    message: `Alpha-Beta value: ${finalValue} (evaluated ${evaluated}/${totalLeaves} leaves, pruned ${pruned})`,
    evaluated, totalLeaves, pruned,
  };
}

// ---------------------------------------------------------------------------
// Expectiminimax (non-generator, direct computation for viz)
// ---------------------------------------------------------------------------

export function expectiminimax(node: GameNode): number {
  if (node.children.length === 0) return node.utility ?? 0;

  if (node.player === 'MAX') {
    return Math.max(...node.children.map(c => expectiminimax(c)));
  } else if (node.player === 'MIN') {
    return Math.min(...node.children.map(c => expectiminimax(c)));
  } else {
    // CHANCE node
    const prob = 1 / node.children.length;
    return node.children.reduce((s, c) => s + (c.chanceProb ?? prob) * expectiminimax(c), 0);
  }
}

// ---------------------------------------------------------------------------
// Tic-Tac-Toe
// ---------------------------------------------------------------------------

export type TTTCell = 'X' | 'O' | null;
export type TTTBoard = TTTCell[];

export function tttEmpty(): TTTBoard {
  return Array(9).fill(null);
}

const WIN_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
  [0, 4, 8], [2, 4, 6],             // diags
];

export function tttWinner(board: TTTBoard): TTTCell {
  for (const [a, b, c] of WIN_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
}

export function tttWinLine(board: TTTBoard): number[] | null {
  for (const line of WIN_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return line;
    }
  }
  return null;
}

export function tttIsTerminal(board: TTTBoard): boolean {
  return tttWinner(board) !== null || board.every(c => c !== null);
}

export function tttUtility(board: TTTBoard): number {
  const w = tttWinner(board);
  if (w === 'X') return 1;
  if (w === 'O') return -1;
  return 0;
}

export function tttSuccessors(board: TTTBoard, player: TTTCell): { board: TTTBoard; move: number }[] {
  const moves: { board: TTTBoard; move: number }[] = [];
  for (let i = 0; i < 9; i++) {
    if (board[i] === null) {
      const next = [...board];
      next[i] = player;
      moves.push({ board: next, move: i });
    }
  }
  return moves;
}

export function tttCurrentPlayer(board: TTTBoard): TTTCell {
  const xCount = board.filter(c => c === 'X').length;
  const oCount = board.filter(c => c === 'O').length;
  return xCount <= oCount ? 'X' : 'O';
}

function tttMinimax(board: TTTBoard, isMax: boolean): number {
  if (tttIsTerminal(board)) return tttUtility(board);
  const player = isMax ? 'X' : 'O';
  const succs = tttSuccessors(board, player);
  if (isMax) {
    return Math.max(...succs.map(s => tttMinimax(s.board, false)));
  } else {
    return Math.min(...succs.map(s => tttMinimax(s.board, true)));
  }
}

export function tttBestMove(board: TTTBoard, player: TTTCell): number {
  const isMax = player === 'X';
  const succs = tttSuccessors(board, player);
  let bestVal = isMax ? -Infinity : Infinity;
  let bestMove = succs[0]?.move ?? -1;

  for (const s of succs) {
    const val = tttMinimax(s.board, !isMax);
    if (isMax ? val > bestVal : val < bestVal) {
      bestVal = val;
      bestMove = s.move;
    }
  }
  return bestMove;
}

export function tttMovesWithValues(board: TTTBoard, player: TTTCell): { move: number; value: number }[] {
  const isMax = player === 'X';
  return tttSuccessors(board, player).map(s => ({
    move: s.move,
    value: tttMinimax(s.board, !isMax),
  }));
}

// ---------------------------------------------------------------------------
// Coins game (last coin loses): alpha-beta for optimal play
// ---------------------------------------------------------------------------

export function coinsMinimaxValue(remaining: number, isMaxTurn: boolean): number {
  if (remaining <= 0) return isMaxTurn ? 1 : -1; // last player to take loses → opponent wins
  if (isMaxTurn) {
    let best = -Infinity;
    for (let take = 1; take <= Math.min(3, remaining); take++) {
      best = Math.max(best, coinsMinimaxValue(remaining - take, false));
    }
    return best;
  } else {
    let best = Infinity;
    for (let take = 1; take <= Math.min(3, remaining); take++) {
      best = Math.min(best, coinsMinimaxValue(remaining - take, true));
    }
    return best;
  }
}

export function coinsBestMove(remaining: number, isMaxTurn: boolean): number {
  let bestTake = 1;
  let bestVal = isMaxTurn ? -Infinity : Infinity;
  for (let take = 1; take <= Math.min(3, remaining); take++) {
    const val = coinsMinimaxValue(remaining - take, !isMaxTurn);
    if (isMaxTurn ? val > bestVal : val < bestVal) {
      bestVal = val;
      bestTake = take;
    }
  }
  return bestTake;
}

// ---------------------------------------------------------------------------
// Sample trees for visualizations
// ---------------------------------------------------------------------------

function leaf(id: string, utility: number): GameNode {
  return { id, player: 'MAX', children: [], utility };
}

function node(id: string, player: Player, children: GameNode[], chanceProb?: number): GameNode {
  return { id, player, children, chanceProb };
}

export function sampleMinimaxTree(): GameNode {
  return node('A', 'MAX', [
    node('B', 'MIN', [
      node('D', 'MAX', [leaf('H', 3), leaf('I', 5)]),
      node('E', 'MAX', [leaf('J', 6), leaf('K', 9)]),
    ]),
    node('C', 'MIN', [
      node('F', 'MAX', [leaf('L', 1), leaf('M', 2)]),
      node('G', 'MAX', [leaf('N', 0), leaf('O', -1)]),
    ]),
  ]);
}

export function sampleAlphaBetaTree(): GameNode {
  return node('A', 'MAX', [
    node('B', 'MIN', [
      node('E', 'MAX', [leaf('K', 3), leaf('L', 5)]),
      node('F', 'MAX', [leaf('M', 6), leaf('N', 9)]),
    ]),
    node('C', 'MIN', [
      node('G', 'MAX', [leaf('O', 1), leaf('P', 2)]),
      node('H', 'MAX', [leaf('Q', 0), leaf('R', -1)]),
    ]),
    node('D', 'MIN', [
      node('I', 'MAX', [leaf('S', 7), leaf('T', 4)]),
      node('J', 'MAX', [leaf('U', 8), leaf('V', 2)]),
    ]),
  ]);
}

export function sampleExpectiminimax(): GameNode {
  return node('A', 'MAX', [
    node('B', 'CHANCE', [
      node('D', 'MIN', [leaf('H', 3), leaf('I', 12)]),
      node('E', 'MIN', [leaf('J', 8), leaf('K', 2)]),
    ]),
    node('C', 'CHANCE', [
      node('F', 'MIN', [leaf('L', 4), leaf('M', 6)]),
      node('G', 'MIN', [leaf('N', 14), leaf('O', 2)]),
    ]),
  ]);
}

// Build a minimax propagation game tree (fixed leaves for consistent puzzle)
export function samplePropagationTree(): GameNode {
  return node('R', 'MAX', [
    node('A', 'MIN', [
      node('C', 'MAX', [leaf('c1', 3), leaf('c2', 12), leaf('c3', 8)]),
      node('D', 'MAX', [leaf('d1', 2), leaf('d2', 4), leaf('d3', 6)]),
    ]),
    node('B', 'MIN', [
      node('E', 'MAX', [leaf('e1', 14), leaf('e2', 5), leaf('e3', 2)]),
      node('F', 'MAX', [leaf('f1', 7), leaf('f2', 11), leaf('f3', 1)]),
    ]),
  ]);
}

// Correct minimax values for the propagation tree (for validation)
export function propagationAnswers(): Record<string, number> {
  return {
    c1: 3, c2: 12, c3: 8, C: 12,
    d1: 2, d2: 4, d3: 6, D: 6,
    e1: 14, e2: 5, e3: 2, E: 14,
    f1: 7, f2: 11, f3: 1, F: 11,
    A: 6, B: 11, R: 11,
  };
}

// ---------------------------------------------------------------------------
// Nim (pile-splitting) game logic for Lab Exercise 2
// ---------------------------------------------------------------------------

export type NimState = number[]; // array of pile sizes

export function nimIsTerminal(piles: NimState): boolean {
  return piles.every(p => p <= 2);
}

export function nimSuccessors(piles: NimState): { piles: NimState; desc: string }[] {
  const moves: { piles: NimState; desc: string }[] = [];
  for (let i = 0; i < piles.length; i++) {
    if (piles[i] > 2) {
      // Split pile i into two non-empty sub-piles
      for (let a = 1; a < piles[i]; a++) {
        const b = piles[i] - a;
        if (a <= b) { // avoid duplicates
          const next = [...piles];
          next.splice(i, 1, a, b);
          next.sort((x, y) => y - x);
          // Check we haven't already generated this state
          const key = next.join(',');
          if (!moves.some(m => m.piles.join(',') === key)) {
            moves.push({ piles: next, desc: `Split ${piles[i]} → ${a}+${b}` });
          }
        }
      }
    }
  }
  return moves;
}

export function nimMinimax(piles: NimState, isMax: boolean): number {
  if (nimIsTerminal(piles)) return isMax ? -1 : 1; // player who can't move loses
  const succs = nimSuccessors(piles);
  if (succs.length === 0) return isMax ? -1 : 1;
  if (isMax) {
    return Math.max(...succs.map(s => nimMinimax(s.piles, false)));
  } else {
    return Math.min(...succs.map(s => nimMinimax(s.piles, true)));
  }
}

export function nimBestMove(piles: NimState, isMax: boolean): NimState {
  const succs = nimSuccessors(piles);
  let bestVal = isMax ? -Infinity : Infinity;
  let best = succs[0]?.piles ?? piles;
  for (const s of succs) {
    const val = nimMinimax(s.piles, !isMax);
    if (isMax ? val > bestVal : val < bestVal) {
      bestVal = val;
      best = s.piles;
    }
  }
  return best;
}

// ---------------------------------------------------------------------------
// Breakthrough game logic (5x5 board) for Lab Exercise 3
// ---------------------------------------------------------------------------

export type BtPiece = 'W' | 'B' | null;
export type BtBoard = BtPiece[][];

export function btInitBoard(size = 5): BtBoard {
  const board: BtBoard = [];
  for (let r = 0; r < size; r++) {
    const row: BtPiece[] = [];
    for (let c = 0; c < size; c++) {
      if (r < 2) row.push('B');
      else if (r >= size - 2) row.push('W');
      else row.push(null);
    }
    board.push(row);
  }
  return board;
}

export function btClone(board: BtBoard): BtBoard {
  return board.map(row => [...row]);
}

export function btWinner(board: BtBoard): BtPiece {
  const size = board.length;
  // W wins if any W piece reaches row 0
  if (board[0].some(c => c === 'W')) return 'W';
  // B wins if any B piece reaches last row
  if (board[size - 1].some(c => c === 'B')) return 'B';
  // Also win if opponent has no pieces
  const hasW = board.some(row => row.some(c => c === 'W'));
  const hasB = board.some(row => row.some(c => c === 'B'));
  if (!hasW) return 'B';
  if (!hasB) return 'W';
  return null;
}

export interface BtMove {
  fromR: number; fromC: number;
  toR: number; toC: number;
  capture: boolean;
}

export function btMoves(board: BtBoard, player: BtPiece): BtMove[] {
  const size = board.length;
  const dir = player === 'W' ? -1 : 1;
  const moves: BtMove[] = [];

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (board[r][c] !== player) continue;
      const nr = r + dir;
      if (nr < 0 || nr >= size) continue;

      // Forward move (no capture)
      if (board[nr][c] === null) {
        moves.push({ fromR: r, fromC: c, toR: nr, toC: c, capture: false });
      }
      // Diagonal captures
      for (const dc of [-1, 1]) {
        const nc = c + dc;
        if (nc < 0 || nc >= size) continue;
        const target = board[nr][nc];
        if (target === null || target !== player) {
          // Can move diagonally to empty or capture opponent
          moves.push({
            fromR: r, fromC: c, toR: nr, toC: nc,
            capture: target !== null && target !== player,
          });
        }
      }
    }
  }
  return moves;
}

export function btApplyMove(board: BtBoard, move: BtMove): BtBoard {
  const next = btClone(board);
  next[move.toR][move.toC] = next[move.fromR][move.fromC];
  next[move.fromR][move.fromC] = null;
  return next;
}

// Simple evaluation for Breakthrough AI (positive = good for W)
function btEval(board: BtBoard): number {
  const size = board.length;
  let score = 0;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (board[r][c] === 'W') score += 10 + (size - 1 - r) * 3; // closer to top = better
      if (board[r][c] === 'B') score -= 10 + r * 3;
    }
  }
  return score;
}

export function btBestMove(board: BtBoard, player: BtPiece, depth = 3): BtMove | null {
  const moves = btMoves(board, player);
  if (moves.length === 0) return null;

  const isMax = player === 'W';
  let bestVal = isMax ? -Infinity : Infinity;
  let best = moves[0];

  for (const m of moves) {
    const next = btApplyMove(board, m);
    const val = btMinimaxSearch(next, depth - 1, -Infinity, Infinity, !isMax);
    if (isMax ? val > bestVal : val < bestVal) {
      bestVal = val;
      best = m;
    }
  }
  return best;
}

function btMinimaxSearch(board: BtBoard, depth: number, alpha: number, beta: number, isMax: boolean): number {
  const w = btWinner(board);
  if (w === 'W') return 1000;
  if (w === 'B') return -1000;
  if (depth === 0) return btEval(board);

  const player = isMax ? 'W' : 'B';
  const moves = btMoves(board, player);
  if (moves.length === 0) return isMax ? -1000 : 1000;

  if (isMax) {
    let value = -Infinity;
    for (const m of moves) {
      value = Math.max(value, btMinimaxSearch(btApplyMove(board, m), depth - 1, alpha, beta, false));
      alpha = Math.max(alpha, value);
      if (alpha >= beta) break;
    }
    return value;
  } else {
    let value = Infinity;
    for (const m of moves) {
      value = Math.min(value, btMinimaxSearch(btApplyMove(board, m), depth - 1, alpha, beta, true));
      beta = Math.min(beta, value);
      if (alpha >= beta) break;
    }
    return value;
  }
}
