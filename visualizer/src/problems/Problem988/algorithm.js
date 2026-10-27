import { treeFromLevelOrder } from '../../components/shared/treeLayout.js'

export function parseInput(text) {
  const arr = JSON.parse(text)
  if (!Array.isArray(arr) || arr.length < 1 || arr.length > 15 || arr[0] === null) throw new Error('Use a level-order array of 1 to 15 entries with a non-null root.')
  if (arr.some(v => v !== null && (!Number.isInteger(v) || v < 0 || v > 25))) throw new Error('Values are integers from 0 to 25 (letters a to z), or null.')
  return arr
}

const letter = v => String.fromCharCode(97 + v)

export function buildTrace(arr) {
  const root = treeFromLevelOrder(arr)
  let best = null
  const frames = [{ phase: 'start', activeLine: L('best = None'), node: null, path: '', best: null, message: 'Walk down from the root. At each leaf, the string reads from the leaf up to the root.' }]
  const visit = (node, path) => {
    if (!node) return
    // path holds the letters from the root down to this node; each leaf reads them in reverse.
    const next = path + letter(node.value)
    if (!node.left && !node.right) {
      const word = [...next].reverse().join('')
      if (best === null || word < best) best = word
      frames.push({ phase: 'leaf', activeLine: L('if best is None'), node: node.id, path: next, best, message: `Leaf ${node.value} reads ${word}. Best so far: ${best}.` })
      return
    }
    frames.push({ phase: 'visit', activeLine: L('for child'), node: node.id, path: next, best, message: `Extend the path with ${letter(node.value)}.` })
    visit(node.left, next)
    visit(node.right, next)
  }
  visit(root, '')
  frames.push({ phase: 'done', activeLine: L('return best'), node: null, path: '', best, message: `Smallest string: ${best}.` })
  return { input: arr, root: treeFromLevelOrder(arr), result: best, frames }
}

export const code = `def smallestFromLeaf(root):
    best = None
    def dfs(node, path):
        nonlocal best
        if not node:
            return
        path = chr(97 + node.val) + path
        if not node.left and not node.right:
            if best is None or path < best:
                best = path
            return
        dfs(node.left, path)
        dfs(node.right, path)
    dfs(root, '')
    return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
