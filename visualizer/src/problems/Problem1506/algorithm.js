const CODE_LINES = [
  'acc is 0',
  'for each node in the supplied list',
  'acc = acc XOR value of the node',
  'for each child of the node',
  'acc = acc XOR value of the child',
  'return the supplied node whose value is acc',
]

export const code = CODE_LINES.map((text, index) => ({ line: index + 1, text }))
const L = text => {
  const index = CODE_LINES.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`pseudocode line missing: ${text}`)
  return index + 1
}

export const python = `def find_root(vals, children):
    acc = 0
    for v, kids in zip(vals, children):
        acc ^= v
        for c in kids:
            acc ^= c
    return vals.index(acc)
`
const PY_LINES = python.split('\n')
const P = text => {
  const index = PY_LINES.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`python line missing: ${text}`)
  return index + 1
}

export const phases = [
  { id: 'start', label: 'Zero', description: 'Start the running XOR at 0.' },
  { id: 'node', label: 'Node', description: 'XOR this node value into the running result.' },
  { id: 'child', label: 'Child', description: 'XOR each listed child value as well.' },
  { id: 'done', label: 'Root', description: 'The value left over belongs to the root.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with vals and children arrays.')
  const { vals, children } = input
  if (!Array.isArray(vals) || !Array.isArray(children) || vals.length !== children.length) throw new Error('vals and children must have the same length.')
  const n = vals.length
  if (n < 1 || n > 12) throw new Error('The tree has 1 to 12 nodes (visualization cap).')
  if (!vals.every(v => Number.isInteger(v) && v >= 0 && v <= 99)) throw new Error('Values are integers from 0 to 99 (visualization cap).')
  if (new Set(vals).size !== n) throw new Error('Node values are distinct, which the XOR method relies on.')
  const indexOf = new Map(vals.map((v, i) => [v, i]))
  const parents = Array(n).fill(0)
  for (const kids of children) {
    if (!Array.isArray(kids)) throw new Error('Each children entry is a list of node values.')
    for (const c of kids) {
      if (!indexOf.has(c)) throw new Error('Each child must be one of the supplied values.')
      parents[indexOf.get(c)]++
    }
  }
  const roots = parents.map((count, i) => (count === 0 ? i : -1)).filter(i => i >= 0)
  if (roots.length !== 1 || parents.some(count => count > 1)) throw new Error('Exactly one node is never a child, and every other node is a child exactly once.')
  const seen = new Set()
  const walk = i => { if (seen.has(i)) return; seen.add(i); children[i].forEach(c => walk(indexOf.get(c))) }
  walk(roots[0])
  if (seen.size !== n) throw new Error('Every node must be reachable from the root.')
  return { vals, children }
}

export function buildTrace({ vals, children }) {
  const frames = []
  let acc = 0
  const tally = new Map(vals.map(v => [v, 0]))
  const frame = (phase, activeLine, pythonLine, node, message, extra = {}) => frames.push({
    phase, activeLine, pythonLine, node, message, acc, tally: new Map(tally), vals, children, ...extra,
  })
  frame('start', L('acc is 0'), P('acc = 0'), -1, 'The running XOR starts at 0.')
  vals.forEach((v, i) => {
    acc ^= v
    frame('node', L('acc = acc XOR value of the node'), P('acc ^= v'), i, `XOR node ${v}: running value ${acc}.`, { operand: v, role: 'node' })
    for (const c of children[i]) {
      acc ^= c
      tally.set(c, tally.get(c) + 1)
      frame('child', L('acc = acc XOR value of the child'), P('acc ^= c'), i, `XOR child ${c}: running value ${acc}.`, { operand: c, role: 'child' })
    }
  })
  const result = vals.indexOf(acc)
  frame('done', L('return the supplied node whose value is acc'), P('return vals.index(acc)'), result, `The leftover value ${acc} is the root, node ${result} in the list.`)
  return { input: { vals, children }, result, frames }
}
