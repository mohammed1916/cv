export const phases = [
  { id: 'setup', label: 'Setup', description: 'Read the well costs and the pipe list.' },
  { id: 'build', label: 'Edges', description: 'Add a virtual source with one edge per house well, plus every pipe.' },
  { id: 'sort', label: 'Sort', description: 'Order all candidate edges from cheapest to most expensive.' },
  { id: 'union', label: 'Connect', description: 'Keep an edge only when it joins two groups that are not yet connected.' },
  { id: 'done', label: 'Result', description: 'Report the total cost of the chosen wells and pipes.' },
]

const CODE_LINES = [
  'FUNCTION minCostToSupplyWater(n, wells, pipes)',
  '  edges <- a source edge to each house (its well cost) plus each pipe',
  '  sort edges by cost',
  '  every house and the source starts as its own group',
  '  total <- 0',
  '  FOR each edge (u, v, cost) in sorted order',
  '    IF u and v are in different groups THEN join them, total <- total + cost',
  '  RETURN total',
]

const PYTHON_LINES = [
  'def minCostToSupplyWater(n, wells, pipes):',
  '    edges = [(cost, 0, house) for house, cost in enumerate(wells, start=1)]',
  '    edges += [(cost, a, b) for a, b, cost in pipes]',
  '    edges.sort()',
  '    parent = list(range(n + 1))',
  '    total = 0',
  '    def find(x):',
  '        while parent[x] != x:',
  '            x = parent[x]',
  '        return x',
  '    for cost, u, v in edges:',
  '        ru, rv = find(u), find(v)',
  '        if ru != rv:',
  '            parent[ru] = rv',
  '            total += cost',
  '    return total',
]

const py = text => PYTHON_LINES.findIndex(line => line.includes(text)) + 1

export const python = PYTHON_LINES.join('\n')
export const code = CODE_LINES.map((text, index) => ({ line: index + 1, text }))
export const pythonLineMap = {
  1: py('def minCost'), 2: py('edges = [(cost, 0'), 3: py('edges += '), 4: py('edges.sort'), 5: py('parent = list'),
  6: py('total = 0'), 7: py('for cost'), 8: py('if ru != rv'), 9: py('return total'),
}

const HOUSE_LIMIT = 20
const PIPE_LIMIT = 40
const COST_LIMIT = 1000

export function parseInput(text) {
  let obj
  try {
    obj = typeof text === 'string' ? JSON.parse(text) : text
  } catch {
    throw new Error('Input must be JSON such as {"wells":[5,4,6],"pipes":[[1,2,1],[2,3,2]]}')
  }
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) throw new Error('Input must be a JSON object with wells and pipes keys')
  const { wells, pipes } = obj
  if (!Array.isArray(wells) || wells.length < 1 || wells.length > HOUSE_LIMIT) {
    throw new Error(`wells must be an array of 1-${HOUSE_LIMIT} costs, one per house`)
  }
  wells.forEach((cost, index) => {
    if (!Number.isInteger(cost) || cost < 1 || cost > COST_LIMIT) throw new Error(`wells[${index}] must be an integer from 1 to ${COST_LIMIT}`)
  })
  if (!Array.isArray(pipes) || pipes.length > PIPE_LIMIT) throw new Error(`pipes must be an array of up to ${PIPE_LIMIT} [house, house, cost] triples`)
  pipes.forEach((pipe, index) => {
    if (!Array.isArray(pipe) || pipe.length !== 3) throw new Error(`pipes[${index}] must be [house, house, cost]`)
    const [a, b, cost] = pipe
    if (![a, b].every(h => Number.isInteger(h) && h >= 1 && h <= wells.length) || a === b) {
      throw new Error(`pipes[${index}] must join two different houses from 1 to ${wells.length}`)
    }
    if (!Number.isInteger(cost) || cost < 1 || cost > COST_LIMIT) throw new Error(`pipes[${index}] cost must be an integer from 1 to ${COST_LIMIT}`)
  })
  return { wells: [...wells], pipes: pipes.map(pipe => [...pipe]) }
}

export function buildTrace(text) {
  const { wells, pipes } = parseInput(text)
  const n = wells.length
  const frames = []

  // Node 0 is the virtual water source; houses are numbered 1..n.
  const raw = [
    ...wells.map((cost, i) => ({ u: 0, v: i + 1, cost, kind: 'well' })),
    ...pipes.map(([a, b, cost]) => ({ u: a, v: b, cost, kind: 'pipe' })),
  ]
  const order = raw.map((_, index) => index)
  const parent = Array.from({ length: n + 1 }, (_, i) => i)
  const find = x => { while (parent[x] !== x) x = parent[x]; return x }
  const groups = () => Array.from({ length: n + 1 }, (_, i) => find(i))

  let total = 0
  let sorted = []
  let states = []
  let current = -1
  const snap = (phase, activeLine, message, extra = {}) => frames.push({
    phase, activeLine, message,
    snapshot: { edges: sorted, states: [...states], current, total, groups: groups(), ...extra },
  })

  snap('setup', 1, `There are ${n} houses and ${pipes.length} pipes. Node 0 stands for the water source.`)
  snap('build', 2, `Each house can get a well from the source. That gives ${n} source edges, plus ${pipes.length} pipes.`)
  sorted = order.map(index => ({ ...raw[index], id: index }))
  sorted.sort((x, y) => x.cost - y.cost || x.id - y.id)
  states = sorted.map(() => 'pending')
  snap('sort', 3, `Sorted ${sorted.length} candidate edges by cost. Ties keep their listed order.`)
  snap('sort', 4, 'Every house and the source starts in its own group.')
  snap('sort', 5, 'The total cost starts at 0.')

  for (let k = 0; k < sorted.length; k++) {
    const edge = sorted[k]
    current = k
    const label = edge.kind === 'well' ? `well at house ${edge.v}` : `pipe ${edge.u}-${edge.v}`
    snap('union', 6, `Consider the ${label} with cost ${edge.cost}.`)
    const ru = find(edge.u)
    const rv = find(edge.v)
    if (ru !== rv) {
      parent[ru] = rv
      total += edge.cost
      states[k] = 'taken'
      snap('union', 7, `The two groups differ, so take ${label}. Total ${total}.`)
    } else {
      states[k] = 'skipped'
      snap('union', 7, `Both ends are already connected, so skip ${label}.`)
    }
  }
  current = -1
  snap('done', 8, `Every house is supplied. The total cost is ${total}.`, { total })
  return { input: { wells, pipes }, result: total, frames }
}
