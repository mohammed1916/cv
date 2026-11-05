import { treeFromLevelOrder } from '../../components/shared/treeLayout.js'

export function parseInput(text) {
  const data = JSON.parse(text)
  const { root, k } = data ?? {}
  if (!Array.isArray(root) || root.length < 1 || root.length > 10000 || root.some(v => v !== null && (!Number.isInteger(v) || Math.abs(v) > 10000))) throw new Error('root must be a level-order array of up to 10,000 items: integers from −10,000 to 10,000 or null.')
  if (root[0] === null) throw new Error('The root cannot be null.')
  if (!Number.isInteger(k) || Math.abs(k) > 100000) throw new Error('k must be an integer from −100,000 to 100,000.')
  return { root, k }
}

// An in-order walk of a BST lists the values in sorted order. Two pointers then search for a pair summing to k.
export function buildTrace({ root, k }) {
  const tree = treeFromLevelOrder(root)
  const sorted = []
  const walk = node => {
    if (!node) return
    walk(node.left)
    sorted.push(node.value)
    walk(node.right)
  }
  walk(tree)
  let l = 0
  let r = sorted.length - 1
  let found = false
  const frames = [{ phase: 'start', sorted, l, r, sum: null, k, found, activeLine: L('const sorted = []'), pythonLine: P('values = inorder'), message: `In-order values are sorted: [${sorted.join(', ')}]. Put l on the smallest and r on the largest.` }]
  while (l < r) {
    const sum = sorted[l] + sorted[r]
    if (sum === k) { found = true; frames.push({ phase: 'hit', sorted, l, r, sum, k, found, activeLine: L('return true'), pythonLine: P('return True'), message: `${sorted[l]} + ${sorted[r]} = ${k}: a pair exists.` }); break }
    if (sum < k) { l++; frames.push({ phase: 'move', sorted, l, r, sum, k, found, activeLine: L('l++'), pythonLine: P('l += 1'), message: `${sum} is below ${k}: move l up to ${sorted[l]}.` }) }
    else { r--; frames.push({ phase: 'move', sorted, l, r, sum, k, found, activeLine: L('r--'), pythonLine: P('r -= 1'), message: `${sum} is above ${k}: move r down to ${sorted[r]}.` }) }
  }
  frames.push({ phase: 'done', sorted, l, r, sum: null, k, found, result: found, activeLine: L('return false'), pythonLine: P('return False'), message: found ? 'Found a pair.' : 'The pointers met without a pair.' })
  return { input: { root, k }, result: found, frames }
}

const SOURCE = `function findTarget(root, k) {
  const sorted = []
  const walk = node => {
    if (!node) return
    walk(node.left)
    sorted.push(node.val)
    walk(node.right)
  }
  walk(root)
  let l = 0
  let r = sorted.length - 1
  while (l < r) {
    const sum = sorted[l] + sorted[r]
    if (sum === k) return true
    if (sum < k) l++
    else r--
  }
  return false
}`
export const code = SOURCE.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def find_target(root, k):
    values = inorder(root)
    l, r = 0, len(values) - 1
    while l < r:
        total = values[l] + values[r]
        if total == k:
            return True
        if total < k:
            l += 1
        else:
            r -= 1
    return False`
const P = s => python.split('\n').findIndex(t => t.includes(s)) + 1
