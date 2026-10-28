import { treeFromLevelOrder } from '../../components/shared/treeLayout.js'

export function parseInput(text) {
  const input = JSON.parse(text)
  const values = input?.values
  if (!Array.isArray(values) || values.length < 1 || values.length > 15 || values[0] === null) throw new Error('Use {"values": [...]} with 1 to 15 level-order entries and a non-null root.')
  if (values.some(v => v !== null && (!Number.isInteger(v) || v < 1 || v > 9))) throw new Error('Node values are digits from 1 to 9, or null for a missing child.')
  return { values }
}

export function buildTrace(input) {
  const root = treeFromLevelOrder(input.values)
  const frames = [{ phase: 'start', activeLine: L('call walk on the root'), node: null, odd: [], count: 0, message: 'Start at the root with no digits seen yet.' }]
  let count = 0
  // mask has bit d set when digit d has appeared an odd number of times on the path so far.
  const walk = (node, mask) => {
    if (!node) return
    const next = mask ^ (1 << node.value)
    const odd = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(d => next & (1 << d))
    frames.push({ phase: 'flip', activeLine: L('flip the parity'), node: node.id, odd, count, message: `Flip digit ${node.value}. Odd-count digits now: ${odd.join(', ') || 'none'}.` })
    if (!node.left && !node.right) {
      const ok = (next & (next - 1)) === 0
      if (ok) count++
      frames.push({ phase: ok ? 'count' : 'reject', activeLine: L('if odd has at most one set bit'), node: node.id, odd, count, message: ok ? `Leaf path can form a palindrome. Count is now ${count}.` : 'More than one digit has an odd count, so this path is not pseudo-palindromic.' })
      return
    }
    walk(node.left, next)
    walk(node.right, next)
  }
  walk(root, 0)
  frames.push({ phase: 'done', activeLine: L('return count'), node: null, odd: [], count, message: `Pseudo-palindromic root-to-leaf paths: ${count}.` })
  return { input, root, result: count, frames }
}

export const code = `count root-to-leaf paths that can be rearranged into a palindrome
  set count to zero
  call walk on the root with no odd digits
  return count
walk(node, odd)
  if node is empty then stop
  flip the parity of node value in odd
  if node is a leaf then
    if odd has at most one set bit then add one to count
  otherwise
    walk the left child with odd
    walk the right child with odd`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_pseudo_palindromic(values):
    if not values or values[0] is None:
        return 0
    def make(v):
        return {'val': v, 'left': None, 'right': None}
    root = make(values[0])
    queue = [root]
    cursor = 1
    for node in queue:
        if cursor < len(values) and values[cursor] is not None:
            node['left'] = make(values[cursor])
            queue.append(node['left'])
        cursor += 1
        if cursor < len(values) and values[cursor] is not None:
            node['right'] = make(values[cursor])
            queue.append(node['right'])
        cursor += 1
    count = 0
    stack = [(root, 0)]
    while stack:
        node, odd = stack.pop()
        odd ^= 1 << node['val']
        if node['left'] is None and node['right'] is None:
            if (odd & (odd - 1)) == 0:
                count += 1
        for child in (node['right'], node['left']):
            if child is not None:
                stack.append((child, odd))
    return count
`
