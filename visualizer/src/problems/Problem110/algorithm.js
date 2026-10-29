import { binaryTreeLayout } from '../../components/shared/binaryTreeLayout.js'
import { parseLevelOrderTree as parseBalancedTree } from "../../components/shared/levelOrderTree.js";
export { parseBalancedTree };

export function traceBalance(root) {
  const frames = [], heights = new Map(), unbalancedIds = new Set();
  let firstFailure = null;
  const emit = (node, phase, activeLine, message, extra = {}) => frames.push({
    activeId: node?.id ?? -1, phase, activeLine, message,
    heights: new Map(heights), unbalancedIds: new Set(unbalancedIds), firstFailure, result: null, ...extra,
  });
  const stack = root ? [{ node: root, stage: 0 }] : [];
  const returned = new Map();
  while (stack.length) {
    const work = stack.at(-1), node = work.node;
    if (work.stage === 0) {
      emit(node, 'recurse-left', 4, `Node ${node.val}: ask the left subtree for its height. Missing children return 0.`);
      work.stage = 1;
      if (node.left) stack.push({ node: node.left, stage: 0 });
      continue;
    }
    const left = node.left ? returned.get(node.left.id) : 0;
    if (work.stage === 1 && left !== -1) {
      emit(node, 'recurse-right', 6, `Left height ${left}. Now measure the right subtree.`, { left });
      work.stage = 2;
      if (node.right) stack.push({ node: node.right, stage: 0 });
      continue;
    }
    const right = work.stage === 2 ? (node.right ? returned.get(node.right.id) : 0) : null;
    if (left === -1 || right === -1) {
      unbalancedIds.add(node.id);
      returned.set(node.id, -1);
      emit(node, 'propagate', left === -1 ? 5 : 7,
        `Child subtree already failed. Return -1${left === -1 ? '; skip the right subtree' : ''}. This is not a new height comparison.`, { left, right });
    } else {
      const difference = Math.abs(left - right);
      emit(node, 'compare', 8, `Compare child heights: |${left} - ${right}| = ${difference}. Allowed difference: at most 1.`, { left, right, difference });
      if (difference > 1) {
        firstFailure ??= node.id;
        unbalancedIds.add(node.id);
        returned.set(node.id, -1);
        emit(node, 'unbalanced', 8, `First imbalance at node ${node.val}: difference ${difference} exceeds 1. Return -1.`, { left, right, difference });
      } else {
        const height = Math.max(left, right) + 1;
        heights.set(node.id, height);
        returned.set(node.id, height);
        emit(node, 'balanced', 9, `Return height ${height} = max(${left}, ${right}) + 1 to the parent.`, { left, right, difference });
      }
    }
    stack.pop();
  }
  const result = !root || returned.get(root.id) !== -1;
  emit(null, 'done', 10, result ? 'Every subtree is balanced.' : 'An unbalanced subtree makes the whole tree unbalanced.', { result });
  return frames;
}

// ---- Balanced Binary Tree (statement-sourced; see scratch statements/110.md) ----
export function parseInput(text) {
  let arr = text
  if (typeof arr === 'string') {
    try { arr = JSON.parse(arr) } catch { throw new Error('Use a JSON level-order array, such as [3,9,20,null,null,15,7].') }
  }
  if (arr && typeof arr === 'object' && !Array.isArray(arr) && 'arr' in arr) arr = arr.arr
  if (!Array.isArray(arr) || arr.length > 15) throw new Error('Use a level-order array of at most 15 entries.')
  if (arr.length && arr[0] === null) throw new Error('A level-order array must start with a value or be empty.')
  if (arr.some(v => v !== null && (!Number.isInteger(v) || Math.abs(v) > 100))) throw new Error('Values are integers from -100 to 100, or null.')
  return arr
}

// traceBalance owns the bottom-up walk; each frame gets the tree layout and the pseudocode line it performs.
const PSEUDO_LINE_FOR_LEGACY = { 4: 6, 6: 8, 5: 7, 7: 9, 8: 10, 9: 11, 10: 2 }

export function buildTrace(input) {
  const arr = parseInput(input)
  const root = parseBalancedTree(JSON.stringify(arr))
  const { positions, edges, nodes: allNodes } = binaryTreeLayout(root)
  const legacy = traceBalance(root)
  const frames = legacy.map((frame, index) => ({
    ...frame,
    index,
    positions,
    edges,
    allNodes,
    legacyLine: frame.activeLine,
    activeLine: PSEUDO_LINE_FOR_LEGACY[frame.activeLine],
    explanation: frame.message,
  }))
  return { input: arr, result: legacy.at(-1).result, frames }
}

export const code = `is balanced (root):
  return whether height(root) is not -1

height(node):
  if node is empty then return 0
  set left to height(left child)
  if left is -1 then return -1
  set right to height(right child)
  if right is -1 then return -1
  if the difference between left and right is more than 1 then return -1
  return 1 plus the larger of left and right`.split('\n').map((text, index) => ({ line: index + 1, text }))

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

def is_balanced(root):
    def height(node):
        if node is None:
            return 0
        left = height(node.left)
        if left == -1:
            return -1
        right = height(node.right)
        if right == -1:
            return -1
        if abs(left - right) > 1:
            return -1
        return 1 + max(left, right)
    return height(build(root)) != -1
`

// Maps each pseudocode activeLine to the Python line that performs the same action.
export const pythonLineMap = {
  2: 37,
  4: 25,
  5: 26,
  6: 28,
  7: 29,
  8: 31,
  9: 32,
  10: 34,
  11: 36,
}
