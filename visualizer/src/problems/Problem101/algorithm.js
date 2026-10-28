import { treeFromLevelOrder as buildTreeFromLevels } from '../../components/shared/treeLayout.js'
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
  const arr = JSON.parse(text)
  if (!Array.isArray(arr) || arr.length < 1 || arr.length > 15) throw new Error('Use a level-order array of 1 to 15 entries.')
  if (arr[0] === null) throw new Error('The root must have a value.')
  if (arr.some(v => v !== null && (!Number.isInteger(v) || Math.abs(v) > 100))) throw new Error('Values are integers from -100 to 100, or null.')
  return arr
}

export function buildTrace(arr) {
  const root = buildTreeFromLevels(arr)
  const frames = [{ phase: 'start', activeLine: L('if the root is empty'), node: root ? root.id : null, message: 'The tree is symmetric when its left side mirrors its right side.' }]
  const mirror = (a, b) => {
    if (!a && !b) {
      frames.push({ phase: 'both-empty', activeLine: L('return true'), node: null, message: 'Both positions are empty, so they mirror each other.' })
      return true
    }
    if (!a || !b) {
      frames.push({ phase: 'mismatch', activeLine: L('return false'), node: null, message: 'Only one side has a node here, so the pair is not mirrored.' })
      return false
    }
    if (a.value !== b.value) {
      frames.push({ phase: 'mismatch', activeLine: L('if the values of a and b differ then return false'), node: a.id, message: `Values ${a.value} and ${b.value} differ.` })
      return false
    }
    frames.push({ phase: 'pair', activeLine: L('check that a.left mirrors b.right'), node: a.id, message: `Values ${a.value} match. Compare left-outer with right-outer, then left-inner with right-inner.` })
    return mirror(a.left, b.right) && mirror(a.right, b.left)
  }
  const result = root ? mirror(root.left, root.right) : true
  frames.push({ phase: 'done', activeLine: L('return'), node: null, message: result ? 'The tree is symmetric.' : 'The tree is not symmetric.' })
  return { input: arr, result, frames }
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
