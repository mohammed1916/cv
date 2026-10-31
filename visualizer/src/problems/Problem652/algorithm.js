import { treeFromLevelOrder } from '../../components/shared/treeLayout.js'

export function parseInput(text) {
  const values = JSON.parse(text)
  if (!Array.isArray(values) || values.length < 1 || values.length > 5000 || values.some(v => v !== null && (!Number.isInteger(v) || Math.abs(v) > 200))) throw new Error('Enter a LeetCode level-order array of 1–5,000 items: integers from −200 to 200 or null.')
  if (values[0] === null) throw new Error('The root cannot be null.')
  return values
}

// Post-order: a subtree's signature is its value plus its children's signatures. The first time a signature
// reaches a second copy, its root is reported.
export function buildTrace(values) {
  const root = treeFromLevelOrder(values)
  const seen = new Map()
  const reported = []
  const frames = [{ phase: 'start', current: null, signatures: [], duplicates: [], pythonLine: P('seen = Counter()'), activeLine: L('seen = empty counter'), message: 'Serialize each subtree bottom-up and count the serializations.' }]
  function signature(node) {
    if (!node) return '#'
    const s = `${node.value}(${signature(node.left)})(${signature(node.right)})`
    const count = (seen.get(s) ?? 0) + 1
    seen.set(s, count)
    if (count === 2) { reported.push({ id: node.id, value: node.value }); frames.push({ phase: 'duplicate', current: node.id, signatures: [...seen.keys()], duplicates: reported.map(r => r.value), pythonLine: P('if seen[s] == 2'), activeLine: L('if seen[s] equals 2'), message: `Subtree rooted at ${node.value} repeats: ${s}.` }) }
    else frames.push({ phase: 'visit', current: node.id, signatures: [...seen.keys()], duplicates: reported.map(r => r.value), pythonLine: P('seen[s] += 1'), activeLine: L('seen[s] += 1'), message: `Subtree ${node.value} gives ${s}.` })
    return s
  }
  signature(root)
  const result = reported.map(r => r.value)
  frames.push({ phase: 'done', current: null, signatures: [...seen.keys()], duplicates: result, result, pythonLine: P('return out'), activeLine: L('return out'), message: `Duplicate subtree roots: [${result.join(', ')}].` })
  return { input: values, root, result, frames, duplicateIds: new Set(reported.map(r => r.id)) }
}

export const code = `seen = empty counter, out = empty list
serialize(node):
  if node is empty: return "#"
  s = value of node, then "(", serialize(left), ")(", serialize(right), ")"
  seen[s] += 1
  if seen[s] equals 2: append the value of node to out
  return s
serialize(root)
return out`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export const python = `from collections import Counter


class TreeNode:
    def __init__(self, val):
        self.val = val
        self.left = None
        self.right = None


def find_duplicate_subtrees(values):
    if not values or values[0] is None:
        return []
    root = TreeNode(values[0])
    queue = [root]
    cursor = 1
    for node in queue:
        if cursor < len(values) and values[cursor] is not None:
            node.left = TreeNode(values[cursor])
            queue.append(node.left)
        cursor += 1
        if cursor < len(values) and values[cursor] is not None:
            node.right = TreeNode(values[cursor])
            queue.append(node.right)
        cursor += 1
    seen = Counter()
    out = []

    def serialize(node):
        if node is None:
            return '#'
        s = f"{node.val}({serialize(node.left)})({serialize(node.right)})"
        seen[s] += 1
        if seen[s] == 2:
            out.append(node.val)
        return s

    serialize(root)
    return out`
