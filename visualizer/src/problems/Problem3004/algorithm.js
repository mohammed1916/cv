export const code = [
  'find the largest subtree whose nodes all share one colour, rooted at node 0',
  '  build an adjacency list from the edges',
  '  set best to 0',
  '  call visit(0, none)',
  '  return best',
  'define visit(v, parent)',
  '  set size to 1 and same to true',
  '  for each child c of v other than parent',
  '    call visit(c, v) to get childSize and childSame',
  '    add childSize to size',
  '    if not childSame or colour of c differs from colour of v then set same to false',
  '  if same and size is greater than best then set best to size',
  '  return size and same',
].map((text, index) => ({ line: index + 1, text }))

const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return index + 1
}

export const python = `def max_same_color_subtree(colors, edges):
    n = len(colors)
    adj = [[] for _ in range(n)]
    for a, b in edges:
        adj[a].append(b)
        adj[b].append(a)
    best = 0

    def visit(v, parent):
        nonlocal best
        size = 1
        same = True
        for c in adj[v]:
            if c == parent:
                continue
            child_size, child_same = visit(c, v)
            size += child_size
            if not child_same or colors[c] != colors[v]:
                same = False
        if same and size > best:
            best = size
        return size, same

    visit(0, -1)
    return best
`
const PY = python.split('\n')
const P = s => {
  const index = PY.findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`Missing python line: ${s}`)
  return index + 1
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with colors and edges.')
  const { colors, edges } = input
  if (!Array.isArray(colors) || colors.length < 1 || colors.length > 10) throw new Error('colors has 1 to 10 integers.')
  if (!colors.every(c => Number.isInteger(c) && c >= 1 && c <= 9)) throw new Error('Each colour is an integer from 1 to 9.')
  const n = colors.length
  if (!Array.isArray(edges) || edges.length !== n - 1) throw new Error('A tree with n nodes needs n - 1 edges.')
  const adj = Array.from({ length: n }, () => [])
  for (const edge of edges) {
    if (!Array.isArray(edge) || edge.length !== 2 || !edge.every(x => Number.isInteger(x) && x >= 0 && x < n)) throw new Error('Each edge is a pair of node numbers.')
    if (edge[0] === edge[1]) throw new Error('An edge cannot join a node to itself.')
    adj[edge[0]].push(edge[1])
    adj[edge[1]].push(edge[0])
  }
  const seen = new Set([0])
  const queue = [0]
  while (queue.length) {
    const v = queue.shift()
    for (const c of adj[v]) if (!seen.has(c)) { seen.add(c); queue.push(c) }
  }
  if (seen.size !== n) throw new Error('The edges must connect every node into one tree.')
  return { colors, edges }
}

export function buildTrace({ colors, edges }) {
  const n = colors.length
  const adj = Array.from({ length: n }, () => [])
  for (const [a, b] of edges) {
    adj[a].push(b)
    adj[b].push(a)
  }
  const frames = []
  let best = 0
  const results = {}
  const snap = () => ({ results: { ...results }, best: best })
  const push = (phase, node, child, extra, activeText, pyText, message) => {
    frames.push({
      phase, node, child, ...extra, ...snap(), message,
      activeLine: L(activeText), pythonLine: P(pyText),
    })
  }

  push('start', -1, -1, { size: 0, same: null, changed: false }, 'build an adjacency list', 'adj = [[]', 'Build the adjacency list. Node 0 is the root.')

  function visit(v, parent) {
    let size = 1
    let same = true
    push('enter', v, -1, { size, same, changed: false }, 'set size to 1', 'size = 1', `Enter node ${v}, colour ${colors[v]}. Start its subtree with size 1.`)
    for (const c of adj[v]) {
      if (c === parent) continue
      push('descend', v, c, { size, same, changed: false }, 'call visit(c, v)', 'child_size, child_same = visit', `Descend from ${v} into child ${c}.`)
      const [childSize, childSame] = visit(c, v)
      size += childSize
      const mismatch = !childSame || colors[c] !== colors[v]
      if (mismatch) same = false
      push('merge', v, c, { size, same, changed: mismatch }, 'if not childSame or colour', 'if not child_same or colors[c] != colors[v]',
        mismatch ? `Child ${c} breaks the single colour of node ${v}'s subtree.` : `Child ${c} keeps the colour ${colors[v]} everywhere below it.`)
    }
    results[v] = { size, same }
    const improved = same && size > best
    if (improved) best = size
    push('leave', v, -1, { size, same, changed: improved }, 'if same and size is greater than best', 'if same and size > best',
      improved ? `Subtree of ${v} is one colour with ${size} nodes. Best is now ${best}.` : same ? `Subtree of ${v} is one colour, but ${size} does not beat ${best}.` : `Subtree of ${v} mixes colours.`)
    return [size, same]
  }

  visit(0, -1)
  frames.push({
    phase: 'done', node: -1, child: -1, size: 0, same: null, changed: false, ...snap(),
    message: `Largest monochrome subtree has ${best} node${best === 1 ? '' : 's'}.`,
    activeLine: L('return best'), pythonLine: P('return best'),
  })
  return { input: { colors, edges }, result: best, frames }
}
