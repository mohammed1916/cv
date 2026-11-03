export const phases = [
  { id: 'start', label: 'Start', description: 'The root is the leftmost node of level 0, and no next pointers exist yet.' },
  { id: 'level', label: 'Next level', description: 'Move the leftmost pointer down one level; its links are complete.' },
  { id: 'link', label: 'Link children', description: 'Each node links its left child to its right child, and its right child to the next node’s left child.' },
  { id: 'done', label: 'Result', description: 'Every node points to its right neighbour on the same level.' },
]

const SOURCE = [
  ['head', 'function connect(root):', 'def connect(root):'],
  ['start', '  leftmost = root', '    leftmost = root'],
  ['cond', '  while leftmost has a left child:', '    while leftmost has a left child:'],
  ['node', '    node = leftmost', '        node = leftmost'],
  ['inner', '    while node is not null:', '        while node is not None:'],
  ['l', '      node.left.next = node.right', '            node.left.next = node.right'],
  ['r', '      if node.next is not null: node.right.next = node.next.left', '            if node.next: node.right.next = node.next.left'],
  ['adv', '      node = node.next', '            node = node.next'],
  ['down', '    leftmost = leftmost.left', '        leftmost = leftmost.left'],
  ['ret', '  return root', '    return root'],
]
export const code = SOURCE.map(row => row[1]).join('\n')
export const python = SOURCE.map(row => row[2]).join('\n')
export const pythonLineMap = Object.fromEntries(SOURCE.map((_, index) => [index + 1, index + 1]))
const L = Object.fromEntries(SOURCE.map((row, index) => [row[0], index + 1]))

export function parseInput(text) {
  let values
  try { values = JSON.parse(text) } catch { throw new Error('Enter the tree as a JSON array in level order, e.g. [1,2,3].') }
  if (!Array.isArray(values) || ![1, 3, 7, 15].includes(values.length)) throw new Error('A perfect tree has 1, 3, 7 or 15 nodes in level order.')
  if (!values.every(v => Number.isInteger(v) && v >= 0 && v <= 99)) throw new Error('Node values must be integers from 0 to 99.')
  return values
}

// Index arithmetic: node i has children 2i+1 and 2i+2; -1 means no next pointer.
export function buildTrace(values) {
  const n = values.length
  const nxt = Array(n).fill(-1)
  const frames = []
  const valueOf = i => (i === -1 ? null : values[i])
  const snap = (extra = {}) => ({ values, nxt: [...nxt], node: null, left: null, right: null, leftmost: 0, ...extra })
  frames.push({ phase: 'start', activeLine: L.start, message: `The root (${values[0]}) is the leftmost node of level 0. No next pointers exist yet.`, snapshot: snap() })

  let leftmost = 0
  while (2 * leftmost + 1 < n) {
    frames.push({ phase: 'level', activeLine: L.cond, message: `Leftmost node of this level is ${values[leftmost]} (index ${leftmost}). Its children are on the next level.`, snapshot: snap({ leftmost }) })
    let node = leftmost
    while (node !== -1) {
      const left = 2 * node + 1, right = 2 * node + 2
      nxt[left] = right
      frames.push({ phase: 'link', activeLine: L.l, message: `Link ${values[left]} to its sibling ${values[right]}.`, snapshot: snap({ leftmost, node, left, right }) })
      if (nxt[node] !== -1) {
        nxt[right] = 2 * nxt[node] + 1
        frames.push({ phase: 'link', activeLine: L.r, message: `${values[node]} has next ${values[nxt[node]]}, so ${values[right]} links to ${values[nxt[right]]}.`, snapshot: snap({ leftmost, node, left, right }) })
      }
      node = nxt[node]
      if (node !== -1) frames.push({ phase: 'link', activeLine: L.adv, message: `Move along the level to ${values[node]}.`, snapshot: snap({ leftmost, node }) })
    }
    leftmost = 2 * leftmost + 1
  }
  const result = nxt.map(valueOf)
  frames.push({ phase: 'done', activeLine: L.ret, message: `Every node now points to its right neighbour on its level, or to nothing at the end.`, snapshot: snap({ leftmost: null }) })
  return { input: values, result, frames }
}
