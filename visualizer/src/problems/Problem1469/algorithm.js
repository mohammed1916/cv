const CODE_LINES = [
  'result is an empty list',
  'build the children of each node from the level-order array',
  'for each node v in breadth-first order',
  'if v has exactly one child c then append the value of c to result',
  'return result',
]

export const code = CODE_LINES.map((text, index) => ({ line: index + 1, text }))
const L = text => {
  const index = CODE_LINES.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`pseudocode line missing: ${text}`)
  return index + 1
}

export const python = `def find_lonely_nodes(tree):
    kids = {}
    order = [0]
    nxt = 1
    for i in order:
        kids[i] = []
        for _ in range(2):
            if nxt < len(tree):
                if tree[nxt] is not None:
                    kids[i].append(nxt)
                    order.append(nxt)
                nxt += 1
    result = []
    for v in order:
        if len(kids[v]) == 1:
            result.append(tree[kids[v][0]])
    return result
`
const PY_LINES = python.split('\n')
const P = text => {
  const index = PY_LINES.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`python line missing: ${text}`)
  return index + 1
}

export const phases = [
  { id: 'start', label: 'Start', description: 'Begin with an empty result.' },
  { id: 'build', label: 'Children', description: 'Turn the level-order array into child lists.' },
  { id: 'skip', label: 'Not alone', description: 'This node has zero or two children.' },
  { id: 'lonely', label: 'Lonely', description: 'This node has exactly one child, which is lonely.' },
  { id: 'done', label: 'Result', description: 'Return every lonely value.' },
]

// LeetCode level-order array with nulls: the children of the k-th non-null node take the next two positions.
export function buildKids(tree) {
  const kids = {}
  const order = [0]
  let next = 1
  for (let p = 0; p < order.length; p++) {
    const i = order[p]
    kids[i] = []
    for (let side = 0; side < 2; side++) {
      if (next < tree.length) {
        if (tree[next] !== null) {
          kids[i].push(next)
          order.push(next)
        }
        next++
      }
    }
  }
  if (order.length !== tree.filter(value => value !== null).length) throw new Error('tree is not a valid level-order array.')
  return { kids, order }
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with a tree array.')
  const { tree } = input
  if (!Array.isArray(tree) || tree.length < 1 || tree.length > 15 || tree[0] === null) throw new Error('tree is a level-order array of 1 to 15 entries, starting with a non-null root (visualization cap).')
  if (!tree.every(value => value === null || (Number.isInteger(value) && value >= 0 && value <= 9))) throw new Error('Tree values are integers from 0 to 9 (visualization cap).')
  buildKids(tree)
  return { tree }
}

export function buildTrace({ tree }) {
  const { kids, order } = buildKids(tree)
  const frames = []
  const result = []
  const snap = (index, extra = {}) => ({ index, result: [...result], kids, ...extra })
  frames.push({ phase: 'start', activeLine: L('result is an empty list'), pythonLine: P('result = []'), message: 'No lonely nodes found yet.', ...snap(-1) })
  frames.push({ phase: 'build', activeLine: L('build the children'), pythonLine: P('kids = {}'), message: 'Each non-null node claims the next two array positions as children.', ...snap(-1) })
  for (const v of order) {
    if (kids[v].length === 1) {
      const child = kids[v][0]
      result.push(tree[child])
      frames.push({ phase: 'lonely', activeLine: L('if v has exactly one child'), pythonLine: P('if len(kids[v]) == 1'), message: `Node ${v} has one child, so ${tree[child]} is lonely.`, ...snap(v, { child }) })
    } else {
      frames.push({ phase: 'skip', activeLine: L('if v has exactly one child'), pythonLine: P('if len(kids[v]) == 1'), message: `Node ${v} has ${kids[v].length} child${kids[v].length === 1 ? '' : 'ren'}; nothing is lonely here.`, ...snap(v, { child: -1 }) })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return result'), pythonLine: P('return result'), message: `${result.length} lonely node${result.length === 1 ? '' : 's'} found.`, ...snap(-1) })
  return { input: { tree }, result, frames, kids }
}
