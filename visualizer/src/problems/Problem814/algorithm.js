import { treeFromLevelOrder, levelOrderFromTree } from '../../components/shared/treeLayout.js'

export function parseInput(text) {
  const arr = JSON.parse(text)
  const bad = () => new Error('Enter a LeetCode level-order JSON array of 1-31 entries (visualization cap) with a non-null root; each value is 0, 1 or null, and null entries have no children.')
  if (!Array.isArray(arr) || arr.length < 1 || arr.length > 31 || arr[0] === null || !arr.every(v => v === null || v === 0 || v === 1)) throw bad()
  let slots = 1
  for (const v of arr) {
    if (slots === 0) throw bad()
    slots -= 1
    if (v !== null) slots += 2
  }
  return [...arr]
}
export function buildTrace(arr) {
  const root = treeFromLevelOrder(arr)
  const display = treeFromLevelOrder(arr) // untouched copy with the same ids, so pruned nodes stay visible
  const roles = {}, tags = {}
  const frames = []
  let current = null
  const snapshot = () => ({ roles: { ...roles }, tags: { ...tags } })
  const push = (phase, activeLine, message, extra = {}) => frames.push({ phase, activeLine, message, current, ...snapshot(), treeShape: levelOrderFromTree(tree), ...extra })
  let tree = root
  const markPruned = node => { if (!node) return; roles[node.id] = 'pruned'; markPruned(node.left); markPruned(node.right) }
  push('start', L('build the tree'), 'Prune bottom-up: a node can only be judged after both its subtrees are known to contain a 1 or not.', { pythonLine: 49 })
  function dfs(node) {
    if (!node) return false
    current = node.id
    roles[node.id] = 'active'
    push('visit', L('enter node'), `Enter node ${node.value}: first resolve its left and right subtrees.`, { pythonLine: 40 })
    const left = dfs(node.left)
    const right = dfs(node.right)
    current = node.id
    roles[node.id] = 'active'
    const hasOne = node.value === 1 || left || right
    if (!left && node.left) { markPruned(node.left); node.left = null; push('prune', L('cut off node.left'), `Left subtree of node ${node.value} has no 1: cut it off.`, { pythonLine: 45 }) }
    if (!right && node.right) { markPruned(node.right); node.right = null; push('prune', L('cut off node.right'), `Right subtree of node ${node.value} has no 1: cut it off.`, { pythonLine: 47 }) }
    roles[node.id] = 'match'
    tags[node.id] = hasOne ? 'keep' : 'drop'
    push('decide', L('return node.value is 1'), hasOne ? `Node ${node.value} is 1 or has a 1 below it, so its subtree stays.` : `Node ${node.value} is 0 with nothing useful below, so the parent will cut it.`, { pythonLine: 48 })
    return hasOne
  }
  const keep = dfs(root)
  if (!keep) { markPruned(root); tree = null }
  current = null
  push('done', L('return the level-order'), keep ? 'Root kept: the pruned tree is the result.' : 'No 1 anywhere, so the whole tree disappears.', { pythonLine: 50 })
  return { input: arr, display, result: tree ? levelOrderFromTree(tree) : [], frames }
}
export const code = `build the tree from the level-order list, whose root is the first entry
define dfs(node) to return whether the subtree of node contains a 1
  if node is empty, return false
  enter node: first resolve its left and right subtrees
  set left to dfs(node.left)
  set right to dfs(node.right)
  if left is false, cut off node.left
  if right is false, cut off node.right
  return node.value is 1, or left, or right
set keep to dfs(root)
return the level-order list of the pruned tree, or an empty list if keep is false`.split('\n').map((text, index) => ({ line: index + 1, text }))
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

def level_order(root):
    out = []
    queue = [root]
    for node in queue:
        if node is None:
            out.append(None)
        else:
            out.append(node.val)
            queue.append(node.left)
            queue.append(node.right)
    while out and out[-1] is None:
        out.pop()
    return out

def prune_tree(arr):
    def dfs(cur):
        if cur is None:
            return False
        left = dfs(cur.left)
        right = dfs(cur.right)
        if not left:
            cur.left = None
        if not right:
            cur.right = None
        return cur.val == 1 or left or right
    root = build(arr)
    return level_order(root if dfs(root) else None)
`
