export const phases = [
  { id: 'start', label: 'Start', description: 'Begin at the root with no previous node and no saved right child.' },
  { id: 'turn', label: 'Turn one node', description: 'The left child becomes the next node to turn. The node itself takes the previous node as its right child and the saved right child as its left child.' },
  { id: 'done', label: 'Complete', description: 'The last node turned is the new root of the upside-down tree.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object such as {"values": [1, 2, 3, 4, 5]}.')
  const { values } = input
  if (!Array.isArray(values) || values.length < 1 || values.length > 31) throw new Error('values is a level-order list of 1 to 31 entries, with null for a missing child.')
  if (!Number.isInteger(values[0])) throw new Error('The first entry is the root value, an integer.')
  if (!values.every(v => v === null || Number.isInteger(v))) throw new Error('Entries are integers or null.')
  const present = values.filter(v => v !== null)
  if (new Set(present).size !== present.length) throw new Error('Node values must be unique.')
  makeTree(values) // throws when a right child has no left sibling
  return { values }
}

// Level-order builder: each non-null node consumes the next two entries as its left and right children.
function makeTree(values) {
  const nodes = []
  const make = v => {
    if (v === null) return null
    const node = { val: v, left: null, right: null }
    nodes.push(node)
    return node
  }
  const root = make(values[0])
  const queue = [root]
  let i = 1
  for (let head = 0; head < queue.length && i < values.length; head++) {
    const node = queue[head]
    node.left = make(values[i++])
    if (i < values.length) node.right = make(values[i++])
    if (node.left) queue.push(node.left)
    if (node.right) queue.push(node.right)
    if (node.right && !node.left) throw new Error('A right child needs a left sibling in an upside-down tree.')
  }
  return { root, nodes }
}

function serialize(root) {
  if (!root) return []
  const out = []
  const queue = [root]
  for (let head = 0; head < queue.length; head++) {
    const node = queue[head]
    if (!node) { out.push(null); continue }
    out.push(node.val)
    queue.push(node.left, node.right)
  }
  while (out.length && out[out.length - 1] === null) out.pop()
  return out
}

export function buildTrace({ values }) {
  const { root, nodes } = makeTree(values)
  const links = () => nodes.map(n => ({ val: n.val, left: n.left?.val ?? null, right: n.right?.val ?? null }))
  let cur = root
  let prev = null
  let prevRight = null
  const snap = message => ({ links: links(), cur: cur?.val ?? null, prev: prev?.val ?? null, prevRight: prevRight?.val ?? null })
  const frames = [{
    phase: 'start', activeLine: L('cur = root'), pythonLine: P('cur, prev, prev_right'),
    snapshot: snap(), message: `Start at the root ${root.val}. Its left spine will become the new right-hand spine.`,
  }]
  while (cur) {
    const next = cur.left
    const oldRight = cur.right
    cur.left = prevRight
    prevRight = oldRight
    cur.right = prev
    prev = cur
    cur = next
    frames.push({
      phase: 'turn', activeLine: L('cur.right = prev'), pythonLine: P('cur.right = prev'),
      snapshot: snap(),
      message: `Node ${prev.val} now has ${prev.right ? `right child ${prev.right.val}` : 'no right child'} and ${prev.left ? `left child ${prev.left.val}` : 'no left child'}. ${cur ? `Next node to turn: ${cur.val}.` : 'No nodes remain on the spine.'}`,
    })
  }
  const result = serialize(prev)
  frames.push({
    phase: 'done', activeLine: L('return prev'), pythonLine: P('return prev'),
    snapshot: snap(), message: `New root ${prev ? prev.val : 'none'}. Level order: [${result.map(v => v === null ? 'null' : v).join(', ')}].`,
  })
  return { input: { values }, result, frames }
}

export const code = `upside down (root):
  cur = root, prev = none, prev_right = none
  while cur is not none:
    nxt = cur.left
    cur.left = prev_right
    prev_right = cur.right
    cur.right = prev
    prev = cur
    cur = nxt
  return prev`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export const python = `def upside_down(root):
    cur, prev, prev_right = root, None, None
    while cur:
        nxt = cur.left
        cur.left = prev_right
        prev_right = cur.right
        cur.right = prev
        prev = cur
        cur = nxt
    return prev
`
