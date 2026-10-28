import { treeFromLevelOrder } from '../../components/shared/treeLayout.js'

export function parseInput(text) {
  const arr = JSON.parse(text)
  if (!Array.isArray(arr) || arr.length < 1 || arr.length > 15 || arr[0] === null) throw new Error('Use a level-order array of 1 to 15 entries with a non-null root.')
  if (arr.some(v => v !== null && (!Number.isInteger(v) || v < 1 || v > 1000))) throw new Error('Values are integers from 1 to 1000, or null.')
  return arr
}

export function buildTrace(arr) {
  const root = treeFromLevelOrder(arr)
  const frames = [{ phase: 'start', activeLine: L('set level to the root'), ids: [], depth: 0, values: [], ok: true, message: 'Check each level from the root down. Even depths need odd values that increase; odd depths need even values that decrease.' }]
  let level = [root]
  let depth = 0
  let ok = true
  while (level.length) {
    const values = level.map(n => n.value)
    const parityOk = values.every(v => (depth % 2 === 0 ? v % 2 === 1 : v % 2 === 0))
    const ordered = values.every((v, i) => i === 0 || (depth % 2 === 0 ? values[i - 1] < v : values[i - 1] > v))
    ok = parityOk && ordered
    frames.push({ phase: 'level', activeLine: L('if depth is even'), ids: level.map(n => n.id), depth, values, ok, message: `Depth ${depth}: ${values.join(', ')} ${ok ? 'follows' : 'breaks'} the rule.` })
    if (!ok) break
    level = level.flatMap(n => [n.left, n.right].filter(Boolean))
    depth++
  }
  frames.push({ phase: 'done', activeLine: L(ok ? 'return true' : 'return false'), ids: [], depth, values: [], ok, message: ok ? 'Every level follows the rule.' : 'A level breaks the rule.' })
  return { input: arr, root, result: ok, frames }
}

export const code = `check the even odd tree rule:
  set level to the root and depth to zero
  while level is not empty
    if depth is even then every value must be odd and strictly increasing
    otherwise every value must be even and strictly decreasing
    if the level breaks the rule then return false
    set level to the children of this level and add one to depth
  return true`.split('\n').map((text, index) => ({ line: index + 1, text }))
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

def is_even_odd_tree(arr):
    level = [build(arr)]
    depth = 0
    while level:
        values = [n.val for n in level]
        if depth % 2 == 0:
            ok = all(v % 2 == 1 for v in values) and all(a < b for a, b in zip(values, values[1:]))
        else:
            ok = all(v % 2 == 0 for v in values) and all(a > b for a, b in zip(values, values[1:]))
        if not ok:
            return False
        level = [child for n in level for child in (n.left, n.right) if child is not None]
        depth += 1
    return True
`
