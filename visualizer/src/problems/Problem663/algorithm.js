import { treeFromLevelOrder } from '../../components/shared/treeLayout.js'

export function parseInput(text) {
  const values = JSON.parse(text)
  if (!Array.isArray(values) || values.length < 1 || values.length > 10000 || values.some(v => v !== null && (!Number.isInteger(v) || Math.abs(v) > 100000))) throw new Error('Enter a LeetCode level-order array of up to 10,000 items: integers from −100,000 to 100,000 or null.')
  if (values[0] === null) throw new Error('The root cannot be null.')
  return values
}

// Cutting one edge splits the tree into a subtree and the rest. The whole sum must be even, and some
// non-root subtree must add up to half of it. Subtree sums are gathered bottom-up in one pass.
export function buildTrace(values) {
  const root = treeFromLevelOrder(values)
  const sums = []
  const frames = [{ phase: 'start', node: null, sum: null, sums: [], target: null, activeLine: L('const sums = []'), pythonLine: P('sums = []'), message: 'Collect the sum of every subtree, bottom-up.' }]
  const subtree = node => {
    if (!node) return 0
    const left = subtree(node.left)
    const right = subtree(node.right)
    const total = node.value + left + right
    sums.push({ id: node.id, total })
    frames.push({ phase: 'subtree', node: node.id, sum: total, sums: sums.map(s => ({ ...s })), target: null, activeLine: L('sums.push('), pythonLine: P('sums.append('), message: `Subtree at ${node.value}: ${node.value} + ${left} + ${right} = ${total}.` })
    return total
  }
  const total = subtree(root)
  const rootId = root ? root.id : null
  let result
  if (total % 2 !== 0) {
    result = false
    frames.push({ phase: 'check', node: null, sum: total, sums: sums.map(s => ({ ...s })), target: null, result, activeLine: L('if (total % 2'), pythonLine: P('if total % 2'), message: `Total ${total} is odd, so no cut can split it evenly.` })
  } else {
    const target = total / 2
    const candidates = sums.filter(s => s.id !== rootId)
    result = candidates.some(s => s.total === target)
    frames.push({ phase: 'check', node: null, sum: total, sums: sums.map(s => ({ ...s })), target, result, activeLine: L('return sums.includes'), pythonLine: P('return total // 2 in sums'), message: `Total ${total}: look for a non-root subtree summing to ${target}. ${result ? 'Found one.' : 'None.'}` })
  }
  frames.push({ phase: 'done', node: null, sum: total, sums: sums.map(s => ({ ...s })), target: null, result, activeLine: L(total % 2 !== 0 ? 'return false' : 'return sums.includes'), pythonLine: P(total % 2 !== 0 ? 'return False' : 'return total // 2'), message: result ? 'Cutting above that subtree gives two equal halves.' : 'No single cut gives two equal halves.' })
  return { input: values, root, result, frames }
}

const SOURCE = `function checkEqualTree(root) {
  const sums = []
  const subtree = node => {
    if (!node) return 0
    const total = node.value + subtree(node.left) + subtree(node.right)
    sums.push(total)
    return total
  }
  const total = subtree(root)
  if (total % 2 !== 0) return false
  sums.pop()
  return sums.includes(total / 2)
}`
export const code = SOURCE.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def check_equal_tree(root):
    sums = []

    def subtree(node):
        if node is None:
            return 0
        total = node["val"] + subtree(node["left"]) + subtree(node["right"])
        sums.append(total)
        return total

    total = subtree(root)
    if total % 2 != 0:
        return False
    sums.pop()
    return total // 2 in sums`
const P = s => python.split('\n').findIndex(t => t.includes(s)) + 1
