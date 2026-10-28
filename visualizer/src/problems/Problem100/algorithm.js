import { treeFromLevelOrder as buildTreeFromLevels } from '../../components/shared/treeLayout.js'
import { parseLevelOrderTree } from "../../components/shared/levelOrderTree.js";
import { binaryTreeLayout } from "../../components/shared/binaryTreeLayout.js";
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
const VALUE_LIMIT = 10000

export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || !Array.isArray(obj.p) || !Array.isArray(obj.q)) throw new Error('Use an object with level-order arrays p and q.')
  for (const arr of [obj.p, obj.q]) {
    if (arr.length > 15) throw new Error('Each tree may have at most 15 entries in this visualization.')
    if (arr.length && arr[0] === null) throw new Error('A level-order array must start with a value or be empty.')
    if (arr.some(v => v !== null && (!Number.isInteger(v) || Math.abs(v) > VALUE_LIMIT))) throw new Error('Values are integers from -10000 to 10000, or null.')
  }
  return { p: obj.p, q: obj.q }
}

export function buildTrace({ p, q }) {
  const a0 = buildTreeFromLevels(p)
  const b0 = buildTreeFromLevels(q)
  const frames = [{ phase: 'start', activeLine: L('if both p and q are empty then return true'), node: null, message: 'Compare the two trees from the roots down.' }]
  const walk = (a, b) => {
    if (!a && !b) {
      frames.push({ phase: 'both-empty', activeLine: L('return true'), node: null, message: 'Both positions are empty, so they match.' })
      return true
    }
    if (!a || !b) {
      frames.push({ phase: 'mismatch', activeLine: L('return false'), node: null, message: 'One tree has a node here and the other does not.' })
      return false
    }
    if (a.value !== b.value) {
      frames.push({ phase: 'mismatch', activeLine: L('if the values of p and q differ then return false'), node: a.id, message: `Values ${a.value} and ${b.value} differ.` })
      return false
    }
    frames.push({ phase: 'match', activeLine: L('check the left children'), node: a.id, message: `Values ${a.value} match. Check the left pair, then the right pair.` })
    return walk(a.left, b.left) && walk(a.right, b.right)
  }
  const result = walk(a0, b0)
  frames.push({ phase: 'done', activeLine: L('return'), node: null, message: result ? 'Every position matches.' : 'The trees differ.' })
  return { input: { p, q }, result, frames }
}

export const code = `same tree (p, q):
  if both p and q are empty then return true
  if exactly one of p and q is empty then return false
  if the values of p and q differ then return false
  check the left children of p and q
  check the right children of p and q
  return true only when both checks are true`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

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
