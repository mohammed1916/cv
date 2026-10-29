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

const MAX_SLOTS = 60
const withMessages = frames => frames.map(frame => ({ ...frame, message: frame.message ?? frame.explanation ?? "" }))

// Level-order array with null for missing children, e.g. {"root": [-10,9,20,null,null,15,7]}.
export function parseInput(text) {
  let data = text
  if (typeof text === "string") {
    try { data = JSON.parse(text.trim()) } catch { throw new Error('Input must be JSON, e.g. {"root": [-10,9,20,null,null,15,7]}.') }
  }
  if (!data || typeof data !== "object" || !Array.isArray(data.root)) throw new Error('Input must be an object with a "root" array.')
  const root = data.root
  if (root.length < 1 || root.length > MAX_SLOTS) throw new Error(`Use between 1 and ${MAX_SLOTS} root slots for this trace.`)
  if (root[0] === null) throw new Error("root slot cannot be null: the tree needs a root value.")
  for (const value of root) {
    if (value !== null && (!Number.isInteger(value) || value < -1000 || value > 1000)) throw new Error("Node values must be integers from -1000 to 1000.")
  }
  return { root }
}

// The scene's story builder runs unchanged; its frames carry phase, activeLine and message.
export function buildTrace(input) {
  const story = buildMaxPathStory(JSON.stringify(input.root))
  return { ...story, input, result: story.maxSum, frames: withMessages(story.frames) }
}

export const code = CODE.map((text, index) => ({ line: index + 1, text }))

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

// Python playback: pseudocode activeLine -> Python line doing the same step.
export const pythonLineMap = { 2: 20, 6: 25, 7: 26, 8: 27, 9: 27, 10: 28, 12: 31 }
