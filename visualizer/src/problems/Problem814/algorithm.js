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
  const push = (phase, activeLine, message) => frames.push({ phase, activeLine, message, current, ...snapshot(), treeShape: levelOrderFromTree(tree) })
  let tree = root
  const markPruned = node => { if (!node) return; roles[node.id] = 'pruned'; markPruned(node.left); markPruned(node.right) }
  push('start', 2, 'Prune bottom-up: a node can only be judged after both its subtrees are known to contain a 1 or not.')
  function dfs(node) {
    if (!node) return false
    current = node.id
    roles[node.id] = 'active'
    push('visit', 4, `Enter node ${node.value}: first resolve its left and right subtrees.`)
    const left = dfs(node.left)
    const right = dfs(node.right)
    current = node.id
    roles[node.id] = 'active'
    const hasOne = node.value === 1 || left || right
    if (!left && node.left) { markPruned(node.left); node.left = null; push('prune', 6, `Left subtree of node ${node.value} has no 1: cut it off.`) }
    if (!right && node.right) { markPruned(node.right); node.right = null; push('prune', 7, `Right subtree of node ${node.value} has no 1: cut it off.`) }
    roles[node.id] = 'match'
    tags[node.id] = hasOne ? 'keep' : 'drop'
    push('decide', 8, hasOne ? `Node ${node.value} is 1 or has a 1 below it, so its subtree stays.` : `Node ${node.value} is 0 with nothing useful below, so the parent will cut it.`)
    return hasOne
  }
  const keep = dfs(root)
  if (!keep) { markPruned(root); tree = null }
  current = null
  push('done', 9, keep ? 'Root kept: the pruned tree is the result.' : 'No 1 anywhere, so the whole tree disappears.')
  return { input: arr, display, result: tree ? levelOrderFromTree(tree) : [], frames }
}
export const code = `def pruneTree(root):
    def dfs(node):
        if not node:
            return False
        left = dfs(node.left)
        right = dfs(node.right)
        if not left: node.left = None
        if not right: node.right = None
        return node.val == 1 or left or right
    return root if dfs(root) else None`.split('\n').map((text, index) => ({ line: index + 1, text }))
