const CODE_LINES = [
  'best is 0',
  'define depth(node) that returns the height of node',
  'first and second are the two tallest child branches, both 0',
  'for each child of node',
  'h = depth(child) + 1, then update first and second with h',
  'best = max(best, first + second)',
  'return first',
  'depth(root)',
  'return best',
]

export const code = CODE_LINES.map((text, index) => ({ line: index + 1, text }))
const L = text => {
  const index = CODE_LINES.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`pseudocode line missing: ${text}`)
  return index + 1
}

export const python = `def diameter(children):
    best = 0

    def depth(node):
        nonlocal best
        first = second = 0
        for child in children[node]:
            h = depth(child) + 1
            if h > first:
                first, second = h, first
            elif h > second:
                second = h
        best = max(best, first + second)
        return first

    depth(0)
    return best
`
const PY_LINES = python.split('\n')
const P = text => {
  const index = PY_LINES.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`python line missing: ${text}`)
  return index + 1
}

export const phases = [
  { id: 'start', label: 'Start', description: 'The best diameter so far is 0.' },
  { id: 'enter', label: 'Enter', description: 'Measure the subtree of this node.' },
  { id: 'branch', label: 'Branch', description: 'A child branch of height h is measured.' },
  { id: 'combine', label: 'Pair', description: 'Two tallest branches form a path through this node.' },
  { id: 'return', label: 'Return', description: 'Report the tallest branch to the parent.' },
  { id: 'done', label: 'Result', description: 'Return the longest path found.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with a children array.')
  const { children } = input
  if (!Array.isArray(children) || children.length < 1 || children.length > 12) throw new Error('children lists 1 to 12 nodes; node 0 is the root (visualization cap).')
  const n = children.length
  const parents = Array(n).fill(0)
  for (const kids of children) {
    if (!Array.isArray(kids)) throw new Error('Each children entry is a list of node indices.')
    for (const c of kids) {
      if (!Number.isInteger(c) || c < 1 || c >= n) throw new Error('Children are node indices from 1 to n-1.')
      parents[c]++
    }
  }
  if (parents.slice(1).some(count => count !== 1) || parents[0] !== 0) throw new Error('Every node except the root must have exactly one parent.')
  const seen = new Set()
  const walk = v => { if (seen.has(v)) return; seen.add(v); children[v].forEach(walk) }
  walk(0)
  if (seen.size !== n) throw new Error('Every node must be reachable from node 0.')
  return { children }
}

export function buildTrace({ children }) {
  const n = children.length
  const frames = []
  const height = Array(n).fill(null)
  let best = 0
  const frame = (phase, activeLine, pythonLine, node, message, extra = {}) => frames.push({
    phase, activeLine, pythonLine, node, message, best, height: [...height], kids: children, ...extra,
  })
  frame('start', L('best is 0'), P('best = 0'), -1, 'The best diameter so far is 0.')
  const depth = node => {
    frame('enter', L('define depth(node)'), P('def depth(node):'), node, `Measure the subtree of node ${node}.`)
    let first = 0
    let second = 0
    let firstChild = -1
    let secondChild = -1
    for (const child of children[node]) {
      const h = depth(child) + 1
      frame('branch', L('for each child of node'), P('for child in children[node]'), node, `Child ${child} gives a branch of height ${h}.`, { child })
      if (h > first) {
        second = first
        secondChild = firstChild
        first = h
        firstChild = child
      } else if (h > second) {
        second = h
        secondChild = child
      }
    }
    best = Math.max(best, first + second)
    height[node] = first
    frame('combine', L('best = max(best, first + second)'), P('best = max(best, first + second)'), node,
      `Two tallest branches at node ${node} give a path of ${first + second} edges.`, { firstChild, secondChild, first, second })
    frame('return', L('return first'), P('return first'), node, `Node ${node} has height ${first}; report it to its parent.`)
    return first
  }
  depth(0)
  frame('done', L('return best'), P('return best'), -1, `Diameter is ${best} edge${best === 1 ? '' : 's'}.`)
  return { input: { children }, result: best, frames }
}
