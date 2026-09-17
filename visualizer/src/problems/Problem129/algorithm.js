import { binaryTreeLayout } from '../../components/shared/binaryTreeLayout.js';

export const CODE = [
  'def sumNumbers(root):',
  '    def dfs(node, current_sum):',
  '        if not node: return 0',
  '        current_sum = current_sum * 10 + node.val',
  '        if not node.left and not node.right:',
  '            return current_sum',
  '        return dfs(node.left, current_sum) + dfs(node.right, current_sum)',
  '    return dfs(root, 0)',
];
CODE.toString = () => CODE.join('\n');
CODE.valueOf = () => CODE.join('\n');

function parseToken(s) {
  const t = s.trim().toLowerCase();
  if (t === '' || t === 'null' || t === 'none' || t === '#' || t === 'nil') {
    return null;
  }
  const n = Number(s.trim());
  if (!Number.isFinite(n) || !Number.isInteger(n)) {
    throw new Error(`Invalid node value: "${s.trim()}". Expected single digit integer (0-9) or null.`);
  }
  if (n < 0 || n > 9) {
    throw new Error(`Invalid node value: ${n}. Node digits must be integers between 0 and 9.`);
  }
  return n;
}

function validateNodeValue(val, index = null) {
  const atDesc = index !== null ? ` at index ${index}` : '';
  if (typeof val !== 'number' || !Number.isSafeInteger(val)) {
    throw new Error(`Invalid node value${atDesc}: "${val}". Expected integer between 0 and 9 or null.`);
  }
  if (val < 0 || val > 9) {
    throw new Error(`Invalid node value${atDesc}: ${val}. Node digits must be between 0 and 9.`);
  }
}

function assignIdsAndValidateTreeObject(node, counter = { id: 0 }) {
  if (!node) return null;
  validateNodeValue(node.val);
  const id = typeof node.id === 'number' ? node.id : counter.id++;
  return {
    id,
    val: node.val,
    left: assignIdsAndValidateTreeObject(node.left, counter),
    right: assignIdsAndValidateTreeObject(node.right, counter),
  };
}

/**
 * Parses a level-order binary tree representation.
 * Accepts:
 *  - JSON string (e.g. "[1, 2, 3]", "[4, 9, 0, 5, 1]")
 *  - Comma-separated string (e.g. "1, 2, 3")
 *  - Array of digit integers and nulls (e.g. [1, 2, 3])
 *  - Existing tree object with { val, left, right }
 *
 * Strict validation:
 *  - Rejects empty trees or missing input
 *  - Verifies node digits 0-9
 *  - Rejects orphan nodes (values provided beyond tree structure)
 */
export function parseTreeInput(input) {
  if (input === null || input === undefined) {
    throw new Error('Tree input cannot be empty. Please provide a binary tree.');
  }

  // Already parsed TreeNode
  if (typeof input === 'object' && !Array.isArray(input) && 'val' in input) {
    return assignIdsAndValidateTreeObject(input);
  }

  let values;
  if (Array.isArray(input)) {
    values = [...input];
  } else if (typeof input === 'string') {
    const trimmed = input.trim();
    if (!trimmed) {
      throw new Error('Tree input cannot be empty. Please provide a binary tree.');
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
          throw new Error('Tree cannot be empty. Problem 129 requires at least one node.');
        }
        values = inner.split(',').map(parseToken);
      }
    } else {
      values = trimmed.split(',').map(parseToken);
    }
  } else {
    throw new Error('Invalid input format. Expected a level-order array or string.');
  }

  if (values.length === 0) {
    throw new Error('Tree cannot be empty. Problem 129 requires at least one node.');
  }
  if (values[0] === null || values[0] === undefined) {
    throw new Error('Root node cannot be null. Problem 129 requires at least one valid node.');
  }

  // Validate elements
  for (let i = 0; i < values.length; i++) {
    const v = values[i];
    if (v === null || v === undefined) continue;
    validateNodeValue(v, i);
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

  // Reject orphan nodes beyond tree capacity
  if (cursor < values.length) {
    const remaining = values.slice(cursor);
    if (remaining.some((v) => v !== null && v !== undefined)) {
      throw new Error('Orphan node detected: values provided beyond tree structure without a parent.');
    }
  }

  return root;
}

/**
 * Builds the visual story for Problem 129: Sum Root to Leaf Numbers.
 * Returns: { tree, totalSum, paths: [{ path, value }], frames: [...], positions, nodes, edges, width, height }
 */
export function buildSumNumbersStory(input) {
  const root = parseTreeInput(input);
  const layout = binaryTreeLayout(root);

  const frames = [];
  const completedPaths = [];
  let accumulatedSum = 0;
  const callStack = [];

  // Frame 0: Init
  frames.push({
    activeLine: 8,
    relatedLines: [1, 8],
    phase: 'init',
    nodeId: root.id,
    nodeVal: root.val,
    currentSum: 0,
    currentPath: [],
    currentPathValues: [],
    pathString: '',
    accumulatedSum: 0,
    completedPaths: [],
    callStack: ['sumNumbers(root)'],
    calculation: 'dfs(root, 0)',
    message: `Initialize: begin DFS traversal at root node #${root.id} (val: ${root.val}) with current_sum = 0.`,
    explanation: 'Start execution at line 8 by invoking dfs(root, 0). Running sum accumulator is 0.',
  });

  function dfs(node, currentSum, pathIds, pathVals) {
    if (!node) {
      frames.push({
        activeLine: 3,
        relatedLines: [3],
        phase: 'null',
        nodeId: null,
        nodeVal: null,
        currentSum,
        currentPath: [...pathIds],
        currentPathValues: [...pathVals],
        pathString: pathVals.join(' → '),
        accumulatedSum,
        completedPaths: [...completedPaths],
        callStack: [...callStack, 'dfs(null)'],
        calculation: 'node is None → return 0',
        message: 'Reached null child node. Return 0.',
        explanation: 'Line 3: Base case if not node: return 0. This empty branch contributes 0 to the sum.',
      });
      return 0;
    }

    const prevSum = currentSum;
    const newSum = prevSum * 10 + node.val;
    const newPathIds = [...pathIds, node.id];
    const newPathVals = [...pathVals, node.val];
    const frameName = `dfs(node #${node.id}[${node.val}], ${prevSum})`;
    callStack.push(frameName);

    // Line 4: Compute new current_sum
    frames.push({
      activeLine: 4,
      relatedLines: [4],
      phase: 'compute',
      nodeId: node.id,
      nodeVal: node.val,
      prevSum,
      currentSum: newSum,
      currentPath: newPathIds,
      currentPathValues: newPathVals,
      pathString: newPathVals.join(' → '),
      accumulatedSum,
      completedPaths: [...completedPaths],
      callStack: [...callStack],
      calculation: `${prevSum} × 10 + ${node.val} = ${newSum}`,
      message: `Node #${node.id} (${node.val}): current_sum = ${prevSum} × 10 + ${node.val} = ${newSum}.`,
      explanation: `Line 4: Shift existing digits left (* 10) and append current node value ${node.val} to form number ${newSum}.`,
    });

    // Lines 5-6: Check if leaf
    if (!node.left && !node.right) {
      accumulatedSum += newSum;
      const leafRecord = {
        path: [...newPathVals],
        pathNodeIds: [...newPathIds],
        value: newSum,
        pathString: newPathVals.join(' → '),
        leafNodeId: node.id,
      };
      completedPaths.push(leafRecord);

      frames.push({
        activeLine: 6,
        relatedLines: [5, 6],
        phase: 'leaf',
        nodeId: node.id,
        nodeVal: node.val,
        prevSum,
        currentSum: newSum,
        currentPath: newPathIds,
        currentPathValues: newPathVals,
        pathString: newPathVals.join(' → '),
        accumulatedSum,
        completedPaths: [...completedPaths],
        callStack: [...callStack],
        isLeaf: true,
        leafValue: newSum,
        calculation: `Leaf reached: ${newPathVals.join('')} = ${newSum} (Total: ${accumulatedSum})`,
        message: `Leaf node #${node.id} (${node.val}) reached! Root-to-leaf path is ${newPathVals.join(' → ')} = ${newSum}. Running total: ${accumulatedSum}.`,
        explanation: `Lines 5-6: Node #${node.id} has no children. Return current_sum (${newSum}). Running total sum is now ${accumulatedSum}.`,
      });

      callStack.pop();
      return newSum;
    }

    // Line 7: Internal node - recurse left
    frames.push({
      activeLine: 7,
      relatedLines: [7],
      phase: 'recurse-left',
      nodeId: node.id,
      nodeVal: node.val,
      prevSum,
      currentSum: newSum,
      currentPath: newPathIds,
      currentPathValues: newPathVals,
      pathString: newPathVals.join(' → '),
      accumulatedSum,
      completedPaths: [...completedPaths],
      callStack: [...callStack],
      calculation: `dfs(left, ${newSum})`,
      message: `Node #${node.id} (${node.val}): Recurse into left child with current_sum = ${newSum}.`,
      explanation: `Line 7: Evaluate left child branch carrying forward current_sum = ${newSum}.`,
    });

    const leftResult = dfs(node.left, newSum, newPathIds, newPathVals);

    // Line 7: Internal node - recurse right
    frames.push({
      activeLine: 7,
      relatedLines: [7],
      phase: 'recurse-right',
      nodeId: node.id,
      nodeVal: node.val,
      prevSum,
      currentSum: newSum,
      currentPath: newPathIds,
      currentPathValues: newPathVals,
      pathString: newPathVals.join(' → '),
      accumulatedSum,
      completedPaths: [...completedPaths],
      callStack: [...callStack],
      leftResult,
      calculation: `dfs(right, ${newSum})`,
      message: `Node #${node.id} (${node.val}): Left branch returned ${leftResult}. Recurse into right child with current_sum = ${newSum}.`,
      explanation: `Line 7: Left child exploration returned ${leftResult}. Now evaluate right child branch with current_sum = ${newSum}.`,
    });

    const rightResult = dfs(node.right, newSum, newPathIds, newPathVals);

    const branchSum = leftResult + rightResult;

    // Line 7: Combine both child returns
    frames.push({
      activeLine: 7,
      relatedLines: [7],
      phase: 'combine',
      nodeId: node.id,
      nodeVal: node.val,
      prevSum,
      currentSum: newSum,
      currentPath: newPathIds,
      currentPathValues: newPathVals,
      pathString: newPathVals.join(' → '),
      accumulatedSum,
      completedPaths: [...completedPaths],
      callStack: [...callStack],
      leftResult,
      rightResult,
      branchSum,
      calculation: `${leftResult} + ${rightResult} = ${branchSum}`,
      message: `Node #${node.id} (${node.val}): Combine subtrees (${leftResult} + ${rightResult} = ${branchSum}). Return ${branchSum}.`,
      explanation: `Line 7: Both subtrees of node #${node.id} are resolved. Return their sum (${leftResult} + ${rightResult} = ${branchSum}) to parent caller.`,
    });

    callStack.pop();
    return branchSum;
  }

  const totalSum = dfs(root, 0, [], []);

  // Frame Done
  frames.push({
    activeLine: 8,
    relatedLines: [1, 8],
    phase: 'done',
    nodeId: null,
    nodeVal: null,
    currentSum: totalSum,
    currentPath: [],
    currentPathValues: [],
    pathString: '',
    accumulatedSum: totalSum,
    completedPaths: [...completedPaths],
    callStack: [],
    totalSum,
    calculation: `Total = ${completedPaths.map((p) => p.value).join(' + ')} = ${totalSum}`,
    message: `DFS complete! Total sum of all root-to-leaf numbers is ${totalSum}.`,
    explanation: `Line 8: All paths explored. Discovered ${completedPaths.length} path(s) summing to ${totalSum}.`,
  });

  return {
    tree: root,
    totalSum,
    paths: completedPaths.map((p) => ({
      path: [...p.path],
      value: p.value,
      pathNodeIds: [...p.pathNodeIds],
      pathString: p.pathString,
    })),
    frames,
    positions: layout.positions,
    nodes: layout.nodes,
    edges: layout.edges,
    width: layout.width,
    height: layout.height,
  };
}
