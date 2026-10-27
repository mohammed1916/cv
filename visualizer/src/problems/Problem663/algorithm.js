import { treeFromLevelOrder } from '../../components/shared/treeLayout.js'

export function parseInput(text) {
  const arr = JSON.parse(text)
  if (!Array.isArray(arr) || arr.length < 1 || arr.length > 30) throw new Error('Enter a level-order JSON array with 1 to 30 entries (null = missing).')
  if (arr.some(v => v !== null && (!Number.isInteger(v) || Math.abs(v) > 1000))) throw new Error('Values must be integers from -1000 to 1000, or null.')
  if (arr[0] === null) throw new Error('The root cannot be null.')
  return arr
}

export function buildTrace(arr) {
  const root = treeFromLevelOrder(arr)
  const subtree = new Map()
  const visited = []
  const frames = []
  // Post-order: a node's subtree sum is known once both children have been summed.
  const visit = node => {
    if (!node) return 0
    const sum = node.value + visit(node.left) + visit(node.right)
    subtree.set(node.id, sum)
    visited.push(node.id)
    frames.push({ phase: 'visit', activeLine: L('sums.append(s)'), node: node.id, sums: Object.fromEntries(subtree), visited: [...visited], total: null, result: null, message: `Subtree of ${node.value} sums to ${sum}.` })
    return sum
  }
  const total = visit(root)
  const half = total / 2
  const hit = total % 2 === 0 ? [...subtree].find(([id, sum]) => id !== root.id && sum === half) : undefined
  const result = Boolean(hit)
  frames.push({
    phase: 'done', activeLine: L('return total % 2'), node: null, sums: Object.fromEntries(subtree), visited: [...visited], total, result,
    message: result
      ? `The total is ${total}. Cutting above the subtree that sums to ${half} leaves two halves of equal sum.`
      : total % 2 ? `The total ${total} is odd, so it cannot split into two equal sums.` : `No non-root subtree sums to ${half}, so no cut works.`,
  })
  return { input: arr, root, result, frames }
}

export const code = `def checkEqualTree(root):
    sums = []
    def subtree(node):
        if node is None:
            return 0
        s = node.val + subtree(node.left) + subtree(node.right)
        sums.append(s)
        return s
    total = subtree(root)
    return total % 2 == 0 and total // 2 in sums[:-1]`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
