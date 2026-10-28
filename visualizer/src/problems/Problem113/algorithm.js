import { treeFromLevelOrder as buildTreeFromLevels } from '../../components/shared/treeLayout.js'
import { parseLevelOrderTree } from '../../components/shared/levelOrderTree.js';
import { binaryTreeLayout } from '../../components/shared/binaryTreeLayout.js';
export function generateSteps(text, targetSum) {
    const root = parseLevelOrderTree(text)
    const { positions, edges, nodes: allNodes } = binaryTreeLayout(root)
    const steps = []

    if (!root) {
        return [{
            phase: 'done', activeLine: 13, activeId: -1, pathStack: [], completedPaths: [],
            onPathNode: new Set(), positions, edges, allNodes, currentSum: 0, targetSum,
            message: 'Empty tree → return []'
        }]
    }

    const completedPaths = []
    const onPathNode = new Set()

    steps.push({
        phase: 'init', activeLine: 2, activeId: -1, pathStack: [], completedPaths: [],
        onPathNode: new Set(), positions, edges, allNodes, currentSum: 0, targetSum,
        message: `Initialize result list. Target sum: ${targetSum}. Start DFS.`
    })

    function dfs(node, path, remainingSum) {
        if (!node) {
            steps.push({
                phase: 'null', activeLine: 4, activeId: -1,
                pathStack: [...path], completedPaths: [...completedPaths], onPathNode: new Set(onPathNode),
                positions, edges, allNodes, currentSum: targetSum - remainingSum, targetSum,
                message: 'Null node detected. Return from DFS.'
            })
            return
        }

        path.push(node.val)
        onPathNode.add(node.id)
        const currentSum = targetSum - remainingSum + node.val

        steps.push({
            phase: 'visit', activeLine: 5, activeId: node.id,
            pathStack: [...path], completedPaths: [...completedPaths], onPathNode: new Set(onPathNode),
            positions, edges, allNodes, currentSum, targetSum,
            message: `Visit node ${node.val}. Current path: [${path.join(', ')}]. Sum so far: ${currentSum}`
        })

        const isLeaf = !node.left && !node.right
        if (isLeaf) {
            steps.push({
                phase: 'leaf', activeLine: 6, activeId: node.id,
                pathStack: [...path], completedPaths: [...completedPaths], onPathNode: new Set(onPathNode),
                positions, edges, allNodes, currentSum, targetSum,
                message: `Leaf node! Current path sum: ${currentSum}. Target: ${targetSum}`
            })

            if (currentSum === targetSum) {
                completedPaths.push([...path])
                steps.push({
                    phase: 'match', activeLine: 8, activeId: node.id,
                    pathStack: [...path], completedPaths: [...completedPaths], onPathNode: new Set(onPathNode),
                    positions, edges, allNodes, currentSum, targetSum,
                    message: `Sum matches! Save path: [${path.join(', ')}]. Total: ${completedPaths.length}`
                })
            } else {
                steps.push({
                    phase: 'no-match', activeLine: 7, activeId: node.id,
                    pathStack: [...path], completedPaths: [...completedPaths], onPathNode: new Set(onPathNode),
                    positions, edges, allNodes, currentSum, targetSum,
                    message: `Sum doesn't match. ${currentSum} != ${targetSum}`
                })
            }
        } else {
            steps.push({
                phase: 'branch', activeLine: 9, activeId: node.id,
                pathStack: [...path], completedPaths: [...completedPaths], onPathNode: new Set(onPathNode),
                positions, edges, allNodes, currentSum, targetSum,
                message: `Internal node. Continue DFS to children. Remaining: ${remainingSum - node.val}`
            })

            if (node.left) {
                dfs(node.left, path, remainingSum - node.val)
            } else {
                steps.push({
                    phase: 'no-left', activeLine: 10, activeId: node.id,
                    pathStack: [...path], completedPaths: [...completedPaths], onPathNode: new Set(onPathNode),
                    positions, edges, allNodes, currentSum, targetSum,
                    message: `No left child. Skip.`
                })
            }

            if (node.right) {
                dfs(node.right, path, remainingSum - node.val)
            } else {
                steps.push({
                    phase: 'no-right', activeLine: 11, activeId: node.id,
                    pathStack: [...path], completedPaths: [...completedPaths], onPathNode: new Set(onPathNode),
                    positions, edges, allNodes, currentSum, targetSum,
                    message: `No right child. Skip.`
                })
            }
        }

        onPathNode.delete(node.id)
        path.pop()

        steps.push({
            phase: 'backtrack', activeLine: 12, activeId: node.id,
            pathStack: [...path], completedPaths: [...completedPaths], onPathNode: new Set(onPathNode),
            positions, edges, allNodes, currentSum: targetSum - remainingSum, targetSum,
            message: `Backtrack from node ${node.val}. Path: [${path.join(', ')}]`
        })
    }

    dfs(root, [], targetSum)

    steps.push({
        phase: 'done', activeLine: 13, activeId: -1,
        pathStack: [], completedPaths: [...completedPaths], onPathNode: new Set(),
        positions, edges, allNodes, currentSum: 0, targetSum,
        message: completedPaths.length > 0
            ? `Found ${completedPaths.length} path(s): ${JSON.stringify(completedPaths)}`
            : 'No paths found that sum to target.'
    })

    return steps
}

// ---- Path Sum II (statement-sourced; see scratch statements/113.md) ----
export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || Array.isArray(obj) || !Array.isArray(obj.root) || !Number.isInteger(obj.target_sum)) throw new Error('Use an object with a level-order array root and an integer target_sum.')
  const { root, target_sum: targetSum } = obj
  if (root.length > 15) throw new Error('The tree may have at most 15 entries in this visualization.')
  if (root.length && root[0] === null) throw new Error('A level-order array must start with a value or be empty.')
  if (root.some(v => v !== null && (!Number.isInteger(v) || Math.abs(v) > 1000))) throw new Error('Values are integers from -1000 to 1000, or null.')
  if (Math.abs(targetSum) > 1000) throw new Error('target_sum is an integer from -1000 to 1000.')
  return { root, target_sum: targetSum }
}

export function buildTrace({ root: arr, target_sum: target }) {
  const root = buildTreeFromLevels(arr)
  const result = []
  const path = []
  const frames = [{ phase: 'start', activeLine: L('if node is empty then return'), node: root ? root.id : null, path: [], message: `Collect every root-to-leaf path whose values sum to ${target}.` }]
  const walk = (node, remaining) => {
    if (!node) return
    path.push(node.value)
    const left = remaining - node.value
    if (!node.left && !node.right) {
      if (left === 0) {
        result.push([...path])
        frames.push({ phase: 'match', activeLine: L('record a copy of the path'), node: node.id, path: [...path], message: `Leaf ${node.value} completes [${path.join(', ')}], which sums to ${target}.` })
      } else {
        frames.push({ phase: 'leaf', activeLine: L('if node is a leaf then'), node: node.id, path: [...path], message: `Leaf ${node.value} gives [${path.join(', ')}], which misses ${target}.` })
      }
    } else {
      frames.push({ phase: 'visit', activeLine: L('walk the left child'), node: node.id, path: [...path], message: `Extend the path with ${node.value} and walk both children.` })
      walk(node.left, left)
      walk(node.right, left)
    }
    path.pop()
  }
  walk(root, target)
  frames.push({ phase: 'done', activeLine: L('return result'), node: null, path: [], message: `${result.length} path(s) match.` })
  return { input: { root: arr, target_sum: target }, result, frames }
}

export const code = `path sum (root, target_sum):
  set result to an empty list
  call walk with the root and target_sum
  return result

walk(node, remaining):
  if node is empty then return
  add the node value to the path
  set left to remaining minus the node value
  if node is a leaf then
    if left is zero then record a copy of the path
  otherwise
    walk the left child with left
    walk the right child with left
  remove the last value from the path`.split('\n').map((text, index) => ({ line: index + 1, text }))
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

def path_sum(root, target_sum):
    result = []
    path = []
    def walk(node, remaining):
        if node is None:
            return
        path.append(node.val)
        left = remaining - node.val
        if node.left is None and node.right is None:
            if left == 0:
                result.append(list(path))
        else:
            walk(node.left, left)
            walk(node.right, left)
        path.pop()
    walk(build(root), target_sum)
    return result
`
