import { parseLevelOrderTree } from "../../components/shared/levelOrderTree.js";
import { binaryTreeLayout } from "../../components/shared/binaryTreeLayout.js";
const VALUE_LIMIT = 10000

export function generateSteps(pArr, qArr) {
  const pRoot = parseLevelOrderTree(JSON.stringify(pArr), "p");
  const qRoot = parseLevelOrderTree(JSON.stringify(qArr), "q");

  const pSnap = binaryTreeLayout(pRoot);
  const qSnap = binaryTreeLayout(qRoot);

  const steps = [];

  // Tracks node state: 'match' | 'mismatch' | 'null-match' | 'null-mismatch'
  const nodeStates = {}; // id -> 'match'|'mismatch'

  function push(activeLine, activePId, activeQId, message, finalResult = null) {
    steps.push({
      activeLine,
      activePId,
      activeQId,
      nodeStates: { ...nodeStates },
      pPositions: pSnap.positions,
      pEdges: pSnap.edges,
      pNodes: pSnap.nodes,
      qPositions: qSnap.positions,
      qEdges: qSnap.edges,
      qNodes: qSnap.nodes,
      message,
      finalResult,
    });
  }

  push(2, null, null, "Call isSameTree(p, q). Begin recursive DFS.");

  // Returns boolean
  function dfs(p, q) {
    const pId = p ? p.id : null;
    const qId = q ? q.id : null;

    // Both null
    push(
      3,
      pId,
      qId,
      `Check: p=${p ? p.val : "null"}, q=${q ? q.val : "null"} — both null?`,
    );
    if (!p && !q) {
      push(4, pId, qId, "Both nodes are null → return True (base case)");
      return true;
    }

    // One null
    push(5, pId, qId, `One of p/q is null — structural mismatch?`);
    if (!p || !q) {
      if (pId) nodeStates[pId] = "mismatch";
      if (qId) nodeStates[qId] = "mismatch";
      push(
        6,
        pId,
        qId,
        `One node is null, other is ${p ? p.val : q.val} → return False`,
      );
      return false;
    }

    // Value check
    push(7, pId, qId, `Compare values: p.val=${p.val} vs q.val=${q.val}`);
    if (p.val !== q.val) {
      nodeStates[pId] = "mismatch";
      nodeStates[qId] = "mismatch";
      push(8, pId, qId, `p.val (${p.val}) ≠ q.val (${q.val}) → return False`);
      return false;
    }

    // Values match — mark tentatively; will confirm after children
    nodeStates[pId] = "match";
    nodeStates[qId] = "match";
    push(
      9,
      pId,
      qId,
      `Values match (${p.val}=${q.val}) — recurse into left subtrees`,
    );

    const leftOk = dfs(p.left, q.left);

    push(
      10,
      pId,
      qId,
      `Left subtrees ${leftOk ? "match" : "differ"} — recurse into right subtrees`,
    );

    const rightOk = dfs(p.right, q.right);

    if (!leftOk || !rightOk) {
      nodeStates[pId] = "mismatch";
      nodeStates[qId] = "mismatch";
    }

    const result = leftOk && rightOk;
    push(11, pId, qId, `Return ${result} for node ${p.val}`);
    return result;
  }

  const result = dfs(pRoot, qRoot);

  push(
    11,
    null,
    null,
    result
      ? "Trees are identical! isSameTree returns True."
      : "Trees differ. isSameTree returns False.",
    result,
  );

  return steps;
}

// ---- Same Tree (statement-sourced; see scratch statements/100.md) ----

export function parseInput(text) {
  let obj = text
  if (typeof obj === 'string') {
    try { obj = JSON.parse(obj) } catch { throw new Error('Use a JSON object with level-order arrays p and q.') }
  }
  if (!obj || typeof obj !== 'object' || !Array.isArray(obj.p) || !Array.isArray(obj.q)) throw new Error('Use an object with level-order arrays p and q.')
  for (const arr of [obj.p, obj.q]) {
    if (arr.length > 15) throw new Error('Each tree may have at most 15 entries in this visualization.')
    if (arr.length && arr[0] === null) throw new Error('A level-order array must start with a value or be empty.')
    if (arr.some(v => v !== null && (!Number.isInteger(v) || Math.abs(v) > VALUE_LIMIT))) throw new Error('Values are integers from -10000 to 10000, or null.')
  }
  return { p: obj.p, q: obj.q }
}

// generateSteps owns the tree snapshots and comparisons. Each frame gets a phase and the pseudocode line it performs.
const PHASE_FOR_LEGACY = { 2: 'start', 3: 'check', 4: 'both-empty', 5: 'one-empty', 6: 'mismatch', 7: 'match', 8: 'mismatch', 9: 'left', 10: 'right', 11: 'return' }
const PSEUDO_LINE_FOR_LEGACY = { 2: 2, 3: 2, 4: 2, 5: 3, 6: 3, 7: 4, 8: 4, 9: 5, 10: 6, 11: 7 }

export function buildTrace(input) {
  const { p, q } = parseInput(input)
  const legacy = generateSteps(p, q)
  const frames = legacy.map((frame, index) => ({
    ...frame,
    phase: index === legacy.length - 1 ? 'done' : PHASE_FOR_LEGACY[frame.activeLine],
    activeLine: PSEUDO_LINE_FOR_LEGACY[frame.activeLine],
    explanation: frame.message,
  }))
  return { input: { p, q }, result: legacy.at(-1).finalResult, frames }
}

export const code = `same tree (p, q):
  if both p and q are empty then return true
  if exactly one of p and q is empty then return false
  if the values of p and q differ then return false
  check the left children of p and q
  check the right children of p and q
  return true only when both checks are true`.split('\n').map((text, index) => ({ line: index + 1, text }))

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

def is_same_tree(p, q):
    def same(a, b):
        if a is None and b is None:
            return True
        if a is None or b is None:
            return False
        return a.val == b.val and same(a.left, b.left) and same(a.right, b.right)
    return same(build(p), build(q))
`

// Maps each pseudocode activeLine to the Python line that performs the same action.
export const pythonLineMap = {
  2: 26,
  3: 28,
  4: 30,
  5: 30,
  6: 30,
  7: 30,
}
