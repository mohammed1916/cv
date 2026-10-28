import { binaryTreeLayout } from '../../components/shared/binaryTreeLayout.js';

export const CODE = [
  'def maxPathSum(root):',
  "    max_sum = float('-inf')",
  '    def gain(node):',
  '        nonlocal max_sum',
  '        if not node: return 0',
  '        left = max(gain(node.left), 0)',
  '        right = max(gain(node.right), 0)',
  '        path = node.val + left + right',
  '        max_sum = max(max_sum, path)',
  '        return node.val + max(left, right)',
  '    gain(root)',
  '    return max_sum',
];

function parseToken(s) {
  const t = s.trim().toLowerCase();
  if (t === '' || t === 'null' || t === 'none' || t === '#' || t === 'nil') {
    return null;
  }
  const n = Number(s.trim());
  if (!Number.isFinite(n) || !Number.isInteger(n)) {
    throw new Error(`Invalid node value: "${s.trim()}". Expected integer or null.`);
  }
  return n;
}

/**
 * Parses a level-order binary tree representation.
 * Accepts:
 *  - JSON string (e.g. "[-10, 9, 20, null, null, 15, 7]")
 *  - Comma-separated string (e.g. "-10, 9, 20, null, null, 15, 7")
 *  - Array of integers and nulls (e.g. [-10, 9, 20, null, null, 15, 7])
 *
 * Strict validation:
 *  - Rejects empty trees or missing input
 *  - Rejects non-integer values
 *  - Rejects orphan nodes (values provided beyond tree structure)
 */
export function parseTreeInput(input) {
  if (input === null || input === undefined) {
    throw new Error('Tree input cannot be empty. Please provide a binary tree.');
  }

  // Already parsed TreeNode
  if (typeof input === 'object' && !Array.isArray(input) && input !== null && 'val' in input) {
    return input;
  }

  let values;
  if (Array.isArray(input)) {
    values = [...input];
  } else if (typeof input === 'string') {
    const trimmed = input.trim();
    if (!trimmed) {
      throw new Error('Tree input cannot be empty. Problem 124 requires at least one node.');
    }
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (!Array.isArray(parsed)) {
          throw new Error('JSON input must be an array.');
        }
        values = parsed;
      } catch {
        const inner = trimmed.slice(1, -1).trim();
        if (!inner) {
          throw new Error('Tree cannot be empty. Problem 124 requires at least one node.');
        }
        values = inner.split(',').map(parseToken);
      }
    } else {
      values = trimmed.split(',').map(parseToken);
    }
  } else {
    throw new Error('Invalid input format. Expected a level-order array or string.');
  }

  if (values.length === 0 || values[0] === null || values[0] === undefined) {
    throw new Error('Tree cannot be empty. Problem 124 requires at least one node.');
  }

  // Validate elements
  for (let i = 0; i < values.length; i++) {
    const v = values[i];
    if (v === null || v === undefined) continue;
    if (typeof v !== 'number' || !Number.isSafeInteger(v)) {
      throw new Error(`Invalid node value at index ${i}: "${v}". Expected safe integer or null.`);
    }
  }

  const root = { id: 0, val: values[0], left: null, right: null };
  const queue = [root];
  let cursor = 1;
  let nextId = 1;

  while (queue.length > 0 && cursor < values.length) {
    const parent = queue.shift();
    for (const side of ['left', 'right']) {
      if (cursor >= values.length) break;
      const val = values[cursor++];
      if (val !== null && val !== undefined) {
        const child = { id: nextId++, val, left: null, right: null };
        parent[side] = child;
        queue.push(child);
      }
    }
  }

  // Reject orphan nodes
  if (cursor < values.length) {
    const remaining = values.slice(cursor);
    if (remaining.some((v) => v !== null && v !== undefined)) {
      throw new Error('Orphan node detected: values provided beyond tree structure without a parent.');
    }
  }

  return root;
}

/**
 * Builds the visual story for Problem 124: Binary Tree Maximum Path Sum.
 * Returns: { tree, maxSum, bestPathNodes, bestPathValues, frames, positions, nodes, edges, width, height }
 */
export function buildMaxPathStory(input) {
  const root = parseTreeInput(input);
  const layout = binaryTreeLayout(root);
  const nodeMap = new Map(layout.nodes.map((n) => [n.id, n]));

  const frames = [];
  let globalMax = -Infinity;
  const gainMap = new Map(); // nodeId -> number
  const branchMap = new Map(); // nodeId -> number[] (IDs along single branch)
  let bestPathNodes = [];
  let bestPathValues = [];
  let bestApexId = null;

  const snapshotGains = () => Object.fromEntries(gainMap);

  // Frame 0: Init
  frames.push({
    activeLine: 2,
    phase: 'init',
    nodeId: root.id,
    nodeVal: root.val,
    maxSum: -Infinity,
    gainMap: snapshotGains(),
    currentTurnaroundPath: [],
    currentTurnaroundSum: null,
    leftGain: null,
    rightGain: null,
    pathThrough: null,
    singleBranchGain: null,
    bestPathNodes: [],
    bestPathValues: [],
    bestApexId: null,
    message: 'Initialize max_sum = -∞ and start post-order DFS.',
    explanation:
      'Binary Tree Maximum Path Sum evaluates the best turnaround path at every node while returning the optimal single branch upward to its parent.',
  });

  function gain(node) {
    if (!node) return 0;

    // Phase: recurse left
    frames.push({
      activeLine: 6,
      phase: 'recurse',
      nodeId: node.id,
      nodeVal: node.val,
      maxSum: globalMax,
      gainMap: snapshotGains(),
      currentTurnaroundPath: [],
      currentTurnaroundSum: null,
      leftGain: null,
      rightGain: null,
      pathThrough: null,
      singleBranchGain: null,
      bestPathNodes: [...bestPathNodes],
      bestPathValues: [...bestPathValues],
      bestApexId,
      message: `Node ${node.val}: explore left subtree (${node.left ? node.left.val : 'none'}).`,
      explanation: `To compute the path sum through node ${node.val}, we first ask its left subtree for the maximum branch gain it can contribute.`,
    });

    const rawLeft = gain(node.left);
    const left = Math.max(rawLeft, 0);

    // Phase: recurse right
    frames.push({
      activeLine: 7,
      phase: 'recurse',
      nodeId: node.id,
      nodeVal: node.val,
      maxSum: globalMax,
      gainMap: snapshotGains(),
      currentTurnaroundPath: [],
      currentTurnaroundSum: null,
      leftGain: left,
      rawLeftGain: rawLeft,
      rightGain: null,
      pathThrough: null,
      singleBranchGain: null,
      bestPathNodes: [...bestPathNodes],
      bestPathValues: [...bestPathValues],
      bestApexId,
      message: `Node ${node.val}: left gain is ${left} (raw: ${rawLeft}). Explore right subtree (${node.right ? node.right.val : 'none'}).`,
      explanation: `Left subtree returns ${rawLeft}. Because negative branches reduce total sum, we take max(${rawLeft}, 0) = ${left}. Now explore the right subtree.`,
    });

    const rawRight = gain(node.right);
    const right = Math.max(rawRight, 0);

    // Calculate turnaround path through this node
    const leftBranch = left > 0 && node.left ? (branchMap.get(node.left.id) || []) : [];
    const rightBranch = right > 0 && node.right ? (branchMap.get(node.right.id) || []) : [];
    const turnaroundPath = [...leftBranch.slice().reverse(), node.id, ...rightBranch];
    const turnaroundValues = turnaroundPath.map((id) => nodeMap.get(id).val);
    const path = node.val + left + right;

    // Phase: compute
    frames.push({
      activeLine: 8,
      phase: 'compute',
      nodeId: node.id,
      nodeVal: node.val,
      maxSum: globalMax,
      gainMap: snapshotGains(),
      currentTurnaroundPath: [...turnaroundPath],
      currentTurnaroundValues: [...turnaroundValues],
      currentTurnaroundSum: path,
      leftGain: left,
      rawLeftGain: rawLeft,
      rightGain: right,
      rawRightGain: rawRight,
      pathThrough: path,
      singleBranchGain: null,
      bestPathNodes: [...bestPathNodes],
      bestPathValues: [...bestPathValues],
      bestApexId,
      message: `Node ${node.val}: turnaround path = ${node.val} + ${left} (left) + ${right} (right) = ${path}.`,
      explanation: `The turnaround path with apex at node ${node.val} connects the best left branch, node ${node.val}, and the best right branch, summing to ${path}.`,
    });

    // Update global maximum
    const prevMax = globalMax;
    const isNewMax = path > globalMax || globalMax === -Infinity;
    if (isNewMax) {
      globalMax = path;
      bestPathNodes = [...turnaroundPath];
      bestPathValues = [...turnaroundValues];
      bestApexId = node.id;
    }

    // Phase: update
    frames.push({
      activeLine: 9,
      phase: 'update',
      nodeId: node.id,
      nodeVal: node.val,
      maxSum: globalMax,
      gainMap: snapshotGains(),
      currentTurnaroundPath: [...turnaroundPath],
      currentTurnaroundValues: [...turnaroundValues],
      currentTurnaroundSum: path,
      leftGain: left,
      rightGain: right,
      pathThrough: path,
      singleBranchGain: null,
      bestPathNodes: [...bestPathNodes],
      bestPathValues: [...bestPathValues],
      bestApexId,
      message: isNewMax
        ? `max_sum updated: ${prevMax === -Infinity ? '-∞' : prevMax} → ${globalMax} (new global best!).`
        : `Turnaround sum ${path} does not beat current max ${globalMax}.`,
      explanation: isNewMax
        ? `Path [${bestPathValues.join(' → ')}] achieves sum ${globalMax}, setting a new record.`
        : `Current best remains ${globalMax} achieved by [${bestPathValues.join(' → ')}].`,
    });

    // Determine single branch downward from this node to return to parent
    const singleBranchGain = node.val + Math.max(left, right);
    gainMap.set(node.id, singleBranchGain);

    if (left > 0 && left >= right && node.left) {
      branchMap.set(node.id, [node.id, ...(branchMap.get(node.left.id) || [])]);
    } else if (right > 0 && right > left && node.right) {
      branchMap.set(node.id, [node.id, ...(branchMap.get(node.right.id) || [])]);
    } else {
      branchMap.set(node.id, [node.id]);
    }

    // Phase: return
    frames.push({
      activeLine: 10,
      phase: 'return',
      nodeId: node.id,
      nodeVal: node.val,
      maxSum: globalMax,
      gainMap: snapshotGains(),
      currentTurnaroundPath: [...turnaroundPath],
      currentTurnaroundValues: [...turnaroundValues],
      currentTurnaroundSum: path,
      leftGain: left,
      rightGain: right,
      pathThrough: path,
      singleBranchGain,
      bestPathNodes: [...bestPathNodes],
      bestPathValues: [...bestPathValues],
      bestApexId,
      message: `Node ${node.val} returns single-branch gain ${singleBranchGain} = ${node.val} + max(${left}, ${right}).`,
      explanation: `A path extending to the parent can only continue down ONE branch. Node ${node.val} passes ${singleBranchGain} up the call stack.`,
    });

    return singleBranchGain;
  }

  gain(root);

  // Phase: done
  frames.push({
    activeLine: 12,
    phase: 'done',
    nodeId: null,
    nodeVal: null,
    maxSum: globalMax,
    gainMap: snapshotGains(),
    currentTurnaroundPath: [...bestPathNodes],
    currentTurnaroundValues: [...bestPathValues],
    currentTurnaroundSum: globalMax,
    leftGain: null,
    rightGain: null,
    pathThrough: null,
    singleBranchGain: null,
    bestPathNodes: [...bestPathNodes],
    bestPathValues: [...bestPathValues],
    bestApexId,
    message: `Maximum path sum = ${globalMax}. Optimal path witness: [${bestPathValues.join(' → ')}].`,
    explanation: `Post-order DFS complete. The maximum path sum in the binary tree is ${globalMax}, achieved by path [${bestPathValues.join(' → ')}].`,
  });

  return {
    tree: root,
    maxSum: globalMax,
    bestPathNodes,
    bestPathValues,
    bestApexId,
    frames,
    positions: layout.positions,
    nodes: layout.nodes,
    edges: layout.edges,
    width: layout.width,
    height: layout.height,
  };
}

// ─── Statement contract: parseInput / buildTrace / code / python ───
const MAX_SLOTS = 60
export function parseInput(text) {
  let data
  try { data = JSON.parse(text) } catch { throw new Error('Input must be JSON, e.g. {"root": [1,2,3]}.') }
  if (!data || typeof data !== 'object' || !Array.isArray(data.root)) throw new Error('Input must be an object with a "root" array.')
  const root = data.root
  if (root.length < 1 || root.length > MAX_SLOTS) throw new Error(`Use between 1 and ${MAX_SLOTS} slots for this trace.`)
  if (root[0] === null) throw new Error('The root slot cannot be null; a path needs at least one node.')
  for (const v of root) if (v !== null && (!Number.isInteger(v) || v < -1000 || v > 1000)) throw new Error('Values must be integers from -1000 to 1000 or null.')
  return { root }
}

function slotLinks(root) {
  const n = root.length, left = Array(n).fill(null), right = Array(n).fill(null)
  const queue = [0]; let next = 1
  for (let head = 0; head < queue.length; head++) {
    const i = queue[head]
    for (const side of ['left', 'right']) {
      const slot = next++
      if (slot < n && root[slot] !== null) { (side === 'left' ? left : right)[i] = slot; queue.push(slot) }
    }
  }
  return { left, right }
}

export function buildTrace(input) {
  const root = input.root
  const { left, right } = slotLinks(root)
  const frames = []
  let best = -Infinity
  const gain = id => {
    if (id === null) return 0
    frames.push({ activeLine: L('if node is empty'), phase: 'visit', node: id, value: root[id], best, message: `Visit ${root[id]}; first ask its children for their best downward gain.` })
    const leftGain = Math.max(0, gain(left[id]))
    const rightGain = Math.max(0, gain(right[id]))
    const through = root[id] + leftGain + rightGain
    best = Math.max(best, through)
    frames.push({ activeLine: L('best = max(best'), phase: 'combine', node: id, value: through, best, message: `A path through ${root[id]} sums to ${through}; best so far is ${best}.` })
    return root[id] + Math.max(leftGain, rightGain)
  }
  gain(0)
  frames.push({ activeLine: L('return best'), phase: 'done', node: 0, value: best, best, message: `Maximum path sum is ${best}.` })
  return { input, result: best, frames }
}

export const code = [
  { line: 1, text: 'maximum path sum over all paths in the tree' },
  { line: 2, text: 'best = negative infinity' },
  { line: 3, text: 'gain(node) returns the best downward sum from node' },
  { line: 4, text: 'if node is empty return 0' },
  { line: 5, text: 'left = max(0, gain(node.left))' },
  { line: 6, text: 'right = max(0, gain(node.right))' },
  { line: 7, text: 'best = max(best, node.val + left + right)' },
  { line: 8, text: 'return node.val + max(left, right)' },
  { line: 9, text: 'call gain(root) then return best' },
]
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_path_sum(root):
    n = len(root)
    left = [None] * n
    right = [None] * n
    queue = [0]
    nxt = 1
    head = 0
    while head < len(queue):
        i = queue[head]
        head += 1
        for side in ("left", "right"):
            slot = nxt
            nxt += 1
            if slot < n and root[slot] is not None:
                if side == "left":
                    left[i] = slot
                else:
                    right[i] = slot
                queue.append(slot)
    best = [float("-inf")]

    def gain(node):
        if node is None:
            return 0
        left_gain = max(0, gain(left[node]))
        right_gain = max(0, gain(right[node]))
        best[0] = max(best[0], root[node] + left_gain + right_gain)
        return root[node] + max(left_gain, right_gain)

    gain(0)
    return best[0]
`
