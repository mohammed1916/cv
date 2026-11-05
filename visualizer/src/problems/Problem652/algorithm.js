import { treeFromLevelOrder } from '../../components/shared/treeLayout.js'

export function parseInput(text) {
  const values = JSON.parse(text)
  if (!Array.isArray(values) || values.length < 1 || values.length > 5000 || values.some(v => v !== null && (!Number.isInteger(v) || Math.abs(v) > 200))) throw new Error('Enter a LeetCode level-order array of up to 5,000 items: integers from −200 to 200 or null.')
  if (values[0] === null) throw new Error('The root cannot be null.')
  return values
}

// Serialize every subtree in post-order as "value(left)(right)". Equal strings mean equal subtrees.
// The first node whose serialization is seen for the second time is reported.
export function buildTrace(values) {
  const root = treeFromLevelOrder(values)
  const counts = new Map()
  const found = []
  const frames = [{ phase: 'start', current: null, key: null, counts: [], found: [], activeLine: L('const counts = new Map()'), pythonLine: P('seen = {}'), message: 'Serialize each subtree after visiting its children.' }]
  const visit = node => {
    if (!node) return '#'
    const left = visit(node.left)
    const right = visit(node.right)
    const key = `${node.value},${left},${right}`
    const count = (counts.get(key) ?? 0) + 1
    counts.set(key, count)
    if (count === 2) found.push(node.id)
    frames.push({ phase: 'serialize', current: node.id, key, count, counts: [...counts].map(([k, c]) => ({ key: k, count: c })), found: [...found], activeLine: L('const key = '), pythonLine: P('key = f'), message: `Subtree at ${node.value}: serialized as ${key}, seen ${count} time(s).${count === 2 ? ' It is a duplicate; report its root.' : ''}` })
    return key
  }
  visit(root)
  const result = found.map(id => nodeValue(root, id))
  frames.push({ phase: 'done', current: null, key: null, counts: [...counts].map(([k, c]) => ({ key: k, count: c })), found: [...found], result, activeLine: L('return result'), pythonLine: P('return result'), message: `${result.length} duplicate subtree(s).` })
  return { input: values, root, result, frames }
}

function nodeValue(root, id) {
  const stack = [root]
  while (stack.length) {
    const node = stack.pop()
    if (!node) continue
    if (node.id === id) return node.value
    stack.push(node.left, node.right)
  }
  return null
}

const SOURCE = `function findDuplicateSubtrees(root) {
  const counts = new Map()
  const result = []
  const visit = node => {
    if (!node) return '#'
    const left = visit(node.left)
    const right = visit(node.right)
    const key = \`\${node.val},\${left},\${right}\`
    const count = (counts.get(key) ?? 0) + 1
    counts.set(key, count)
    if (count === 2) result.push(node.val)
    return key
  }
  visit(root)
  return result
}`
export const code = SOURCE.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def find_duplicate_subtrees(root):
    seen = {}
    result = []

    def visit(node):
        if node is None:
            return '#'
        left = visit(node.left)
        right = visit(node.right)
        key = f"{node.val},{left},{right}"
        seen[key] = seen.get(key, 0) + 1
        if seen[key] == 2:
            result.append(node.val)
        return key

    visit(root)
    return result`
const P = s => python.split('\n').findIndex(t => t.includes(s)) + 1
