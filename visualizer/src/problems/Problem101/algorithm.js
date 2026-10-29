import { parseLevelOrderTree } from "../../components/shared/levelOrderTree.js";
import { binaryTreeLayout } from "../../components/shared/binaryTreeLayout.js";
export function generateSteps(treeArr) {
  const root = parseLevelOrderTree(JSON.stringify(treeArr), "n");
  const snap = binaryTreeLayout(root);

  const steps = [];
  const nodeStates = {};

  function push(
    activeLine,
    activeLeftId,
    activeRightId,
    message,
    finalResult = null,
  ) {
    steps.push({
      activeLine,
      activeLeftId,
      activeRightId,
      nodeStates: { ...nodeStates },
      positions: snap.positions,
      edges: snap.edges,
      nodes: snap.nodes,
      message,
      finalResult,
    });
  }

  push(12, null, null, "Call isSymmetric(root). Begin mirror check.");

  function isMirror(left, right) {
    const leftId = left ? left.id : null;
    const rightId = right ? right.id : null;

    // Both null
    push(
      4,
      leftId,
      rightId,
      `Check: left=${left ? left.val : "null"}, right=${right ? right.val : "null"} — both null?`,
    );
    if (!left && !right) {
      push(5, leftId, rightId, "Both null → return True (base case)");
      return true;
    }

    // One null
    push(6, leftId, rightId, `One null, other not? Structural mismatch.`);
    if (!left || !right) {
      if (leftId) nodeStates[leftId] = "mirror-fail";
      if (rightId) nodeStates[rightId] = "mirror-fail";
      push(7, leftId, rightId, `One is null → return False`);
      return false;
    }

    // Value check
    push(8, leftId, rightId, `Values: left=${left.val} vs right=${right.val}`);
    if (left.val !== right.val) {
      nodeStates[leftId] = "mirror-fail";
      nodeStates[rightId] = "mirror-fail";
      push(9, leftId, rightId, `Values differ → return False`);
      return false;
    }

    // Values match
    nodeStates[leftId] = "mirror-ok";
    nodeStates[rightId] = "mirror-ok";
    push(
      10,
      leftId,
      rightId,
      `Values match (${left.val}) — recurse into (left.left, right.right)`,
    );

    const outerOk = isMirror(left.left, right.right);
    if (!outerOk) {
      nodeStates[leftId] = 'mirror-fail'; nodeStates[rightId] = 'mirror-fail';
      push(10, leftId, rightId, 'Outer pair failed. Short-circuit: the inner pair is not visited.');
      return false;
    }

    push(
      11,
      leftId,
      rightId,
      `Outer pair ${outerOk ? "ok" : "fail"} — recurse into (left.right, right.left)`,
    );

    const innerOk = isMirror(left.right, right.left);

    if (!outerOk || !innerOk) {
      nodeStates[leftId] = "mirror-fail";
      nodeStates[rightId] = "mirror-fail";
    }

    const result = outerOk && innerOk;
    push(
      11,
      leftId,
      rightId,
      `Return ${result} for pair at (${left.val}, ${right.val})`,
    );
    return result;
  }

  if (!root) {
    push(12, null, null, "Root is null → symmetric (empty tree)", true);
  } else {
    const result = isMirror(root.left, root.right);
    push(
      12,
      null,
      null,
      result
        ? "Tree is symmetric! isSymmetric returns True."
        : "Tree is not symmetric. isSymmetric returns False.",
      result,
    );
  }

  return steps;
}

// ---- Symmetric Tree (statement-sourced; see scratch statements/101.md) ----
export function parseInput(text) {
  let arr = text
  if (typeof arr === 'string') {
    try { arr = JSON.parse(arr) } catch { throw new Error('Use a JSON level-order array, such as [1,2,2,3,4,4,3].') }
  }
  if (arr && typeof arr === 'object' && !Array.isArray(arr) && 'tree' in arr) arr = arr.tree
  if (!Array.isArray(arr) || arr.length < 1 || arr.length > 15) throw new Error('Use a level-order array of 1 to 15 entries.')
  if (arr[0] === null) throw new Error('The root must have a value.')
  if (arr.some(v => v !== null && (!Number.isInteger(v) || Math.abs(v) > 100))) throw new Error('Values are integers from -100 to 100, or null.')
  return arr
}

// generateSteps owns the snapshots and mirror comparisons. Each frame gets a phase and the pseudocode line it performs.
const PSEUDO_LINE_FOR_LEGACY = { 4: 5, 12: 2, 5: 6, 6: 7, 7: 7, 8: 8, 9: 8, 10: 9, 11: 10 }
const PHASE_FOR_LEGACY = { 4: 'pair', 12: 'start', 5: 'both-empty', 6: 'check', 7: 'mismatch', 8: 'compare', 9: 'mismatch', 10: 'pair', 11: 'pair' }

export function buildTrace(input) {
  const arr = parseInput(input)
  const legacy = generateSteps(arr)
  const frames = legacy.map((frame, index) => ({
    ...frame,
    legacyLine: frame.activeLine,
    phase: index === legacy.length - 1 ? 'done' : PHASE_FOR_LEGACY[frame.activeLine],
    activeLine: PSEUDO_LINE_FOR_LEGACY[frame.activeLine],
    explanation: frame.message,
  }))
  return { input: arr, result: legacy.at(-1).finalResult, frames }
}

export const code = `symmetric tree (root):
  if the root is empty then return true
  return mirror(root.left, root.right)

mirror(a, b):
  if both a and b are empty then return true
  if exactly one of a and b is empty then return false
  if the values of a and b differ then return false
  check that a.left mirrors b.right
  check that a.right mirrors b.left
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

def is_symmetric(root):
    def mirror(a, b):
        if a is None and b is None:
            return True
        if a is None or b is None:
            return False
        return a.val == b.val and mirror(a.left, b.right) and mirror(a.right, b.left)
    tree = build(root)
    return True if tree is None else mirror(tree.left, tree.right)
`

// Maps each pseudocode activeLine to the Python line that performs the same action.
export const pythonLineMap = {
  2: 32,
  3: 32,
  5: 25,
  6: 26,
  7: 28,
  8: 30,
  9: 30,
  10: 30,
  11: 30,
}
