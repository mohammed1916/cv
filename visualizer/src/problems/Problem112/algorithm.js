export function parsePathSum(rootText, targetText) {
  const values = JSON.parse(rootText);
  if (!Array.isArray(values) || values.some(value => value !== null && !Number.isSafeInteger(value))) {
    throw new Error('Use a level-order array of integers and nulls.');
  }
  const target = Number(targetText);
  if (String(targetText).trim() === '' || !Number.isSafeInteger(target)) throw new Error('Target must be an integer.');
  return { values, target };
}

export function buildPathSum(values, target) {
  const nodes = [];
  if (values.length && values[0] !== null) {
    nodes.push({ id: 0, value: values[0], parent: null, depth: 0, left: null, right: null, visitAt: Infinity });
    let cursor = 1;
    for (let head = 0; head < nodes.length && cursor < values.length; head++) {
      for (const side of ['left', 'right']) {
        if (cursor >= values.length) break;
        const value = values[cursor++];
        if (value === null) continue;
        const id = nodes.length;
        nodes[head][side] = id;
        nodes.push({ id, value, parent: head, depth: nodes[head].depth + 1, left: null, right: null, visitAt: Infinity });
      }
    }
    if (values.slice(cursor).some(value => value !== null)) throw new Error('Some values have no parent. Check the level-order input.');
  } else if (values.slice(1).some(value => value !== null)) {
    throw new Error('An empty root cannot have children.');
  }
  // Inorder positions keep left and right children visually distinct, even
  // when several nodes have the same value. IDs never depend on node values.
  const layoutStack = [];
  let current = nodes.length ? 0 : null;
  let column = 0;
  while (current !== null || layoutStack.length) {
    while (current !== null) { layoutStack.push(current); current = nodes[current].left; }
    current = layoutStack.pop();
    nodes[current].x = 40 + column++ * 64;
    nodes[current].y = 40 + nodes[current].depth * 90;
    current = nodes[current].right;
  }
  const frames = [{ phase: 'init', activeLine: 1, nodeId: null, sum: 0, message: `Find a root-to-leaf route totaling ${target}.` }];
  const stack = nodes.length ? [{ id: 0, sum: 0, exit: false }] : [];
  let result = false;
  let winningId = null;
  while (stack.length) {
    const work = stack.pop();
    const node = nodes[work.id];
    if (work.exit) {
      frames.push({ phase: 'backtrack', activeLine: 7, nodeId: node.parent, fromId: node.id,
        sum: work.sum, message: `No matching leaf below ${node.value}. Return to its parent and try another branch.` });
      continue;
    }
    const sum = work.sum + node.value;
    node.visitAt = frames.length;
    frames.push({ phase: 'visit', activeLine: 3, nodeId: node.id, sum,
      message: `Visit ${node.value}: route total ${sum}; remaining target ${target - sum}.` });
    const leaf = node.left === null && node.right === null;
    if (leaf) {
      const matches = sum === target;
      frames.push({ phase: matches ? 'found' : 'reject', activeLine: 4, nodeId: node.id, sum,
        message: matches ? `Leaf reached with total ${target}. This route is a solution.` : `Leaf reached with total ${sum}, not ${target}. Backtrack.` });
      if (matches) { result = true; winningId = node.id; break; }
    } else {
      frames.push({ phase: 'descend', activeLine: 5, nodeId: node.id, sum,
        message: sum === target ? 'The total matches, but this is not a leaf. Continue: a valid route must end at a leaf.'
          : `Carry ${target - sum} into the children. Negative values can change the total, so do not prune by sum.` });
    }
    stack.push({ id: node.id, sum: work.sum, exit: true });
    if (node.right !== null) stack.push({ id: node.right, sum, exit: false });
    if (node.left !== null) stack.push({ id: node.left, sum, exit: false });
  }
  frames.push({ phase: 'done', activeLine: nodes.length ? (result ? 4 : 7) : 2,
    nodeId: winningId, sum: result ? target : 0, result,
    message: result ? 'Return True. Stop exploring: the left-or-right search already found a route.' : 'Return False. No root-to-leaf route reaches the target.' });
  return { nodes, frames, target, result, width: Math.max(280, nodes.length * 64 + 16), height: Math.max(160, ...nodes.map(node => node.y + 45)) };
}

export function getRoute(nodes, nodeId) {
  const route = [];
  for (let id = nodeId; id !== null && id !== undefined; id = nodes[id].parent) route.push(nodes[id]);
  return route.reverse();
}

// ---- Path Sum (statement-sourced; see scratch statements/112.md) ----
export function parseInput(text) {
  let obj = text
  if (typeof obj === 'string') {
    try { obj = JSON.parse(obj) } catch { throw new Error('Use a JSON object with a level-order array root and an integer target_sum.') }
  }
  if (!obj || typeof obj !== 'object' || Array.isArray(obj) || !Array.isArray(obj.root) || !Number.isInteger(obj.target_sum)) throw new Error('Use an object with a level-order array root and an integer target_sum.')
  const { root, target_sum: targetSum } = obj
  if (root.length > 15) throw new Error('The tree may have at most 15 entries in this visualization.')
  if (root.length && root[0] === null) throw new Error('A level-order array must start with a value or be empty.')
  if (root.some(v => v !== null && (!Number.isInteger(v) || Math.abs(v) > 1000))) throw new Error('Values are integers from -1000 to 1000, or null.')
  if (Math.abs(targetSum) > 1000) throw new Error('target_sum is an integer from -1000 to 1000.')
  return { root, target_sum: targetSum }
}

// buildPathSum owns the route frames and the running sums. Each frame is mapped to the pseudocode line in `code`.
const PSEUDO_LINE_FOR_LEGACY = { 1: 1, 3: 7, 4: 8, 5: 9, 7: 9 }

export function buildTrace(input) {
  const { root, target_sum: target } = parseInput(input)
  const run = buildPathSum(root, target)
  const frames = run.frames.map((frame, index) => ({
    ...frame,
    index,
    legacyLine: frame.activeLine,
    activeLine: frame.phase === 'done' ? (run.nodes.length ? 3 : 2) : PSEUDO_LINE_FOR_LEGACY[frame.activeLine],
    explanation: frame.message,
  }))
  return { ...run, input: { root, target_sum: target }, result: run.result, frames }
}

export const code = `has path sum (root, target_sum):
  if the root is empty then return false
  return walk(root, target_sum)

walk(node, remaining):
  if node is empty then return false
  set left to remaining minus the node value
  if node is a leaf then return whether left is zero
  return walk on the left child with left, or walk on the right child with left`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def build(arr):
    if not arr or arr[0] is None:
        return None
    root = TreeNode(arr[0])
    queue = [root]
    cursor = 1
    for node in queue:
        if cursor < len(arr) and arr[cursor] is not None:
            node.left = TreeNode(arr[cursor])
            queue.append(node.left)
        cursor += 1
        if cursor < len(arr) and arr[cursor] is not None:
            node.right = TreeNode(arr[cursor])
            queue.append(node.right)
        cursor += 1
    return root

def has_path_sum(root, target_sum):
    def walk(node, remaining):
        if node is None:
            return False
        left = remaining - node.val
        if node.left is None and node.right is None:
            return left == 0
        return walk(node.left, left) or walk(node.right, left)
    return walk(build(root), target_sum)
`

// Maps each pseudocode activeLine to the Python line that performs the same action.
export const pythonLineMap = {
  1: 24,
  2: 26,
  3: 32,
  5: 25,
  6: 26,
  7: 28,
  8: 29,
  9: 31,
}
