export const phases = [
  { id: 'start', label: 'Setup', description: 'Collect the starting triples.' },
  { id: 'generation', label: 'Generation', description: 'Pair every distinct known triple and take floored midpoints.' },
  { id: 'add', label: 'Grow pool', description: 'Keep the new triples for later generations.' },
  { id: 'found', label: 'Found', description: 'The target appears in the current generation.' },
  { id: 'stop', label: 'Stop', description: 'No new triple can appear.' },
]

const key = p => p.join(',')

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with points and target.')
  const { points, target } = input
  const isTriple = p => Array.isArray(p) && p.length === 3 && p.every(v => Number.isInteger(v) && v >= 0 && v <= 6)
  if (!Array.isArray(points) || points.length < 1 || points.length > 20 || !points.every(isTriple)) throw new Error('points has 1 to 20 triples with coordinates 0 to 6.')
  if (new Set(points.map(key)).size !== points.length) throw new Error('Initial points must be distinct.')
  if (!isTriple(target)) throw new Error('target is one triple with coordinates 0 to 6.')
  return { points, target }
}

export function buildTrace({ points, target }) {
  const pool = new Map(points.map(p => [key(p), 0]))
  const goal = key(target)
  const snapshot = () => [...pool.keys()]
  const frames = []
  frames.push({ phase: 'start', activeLine: L('let pool be'), pythonLine: P('pool = set('), message: `Start with ${pool.size} distinct triple${pool.size === 1 ? '' : 's'} in generation 0.`, generation: 0, produced: [], fresh: [], pool: snapshot(), target: goal, found: pool.has(goal) })
  if (pool.has(goal)) {
    frames.push({ phase: 'found', activeLine: L('if target is in pool'), pythonLine: P('return 0'), message: 'The target is already a starting point.', generation: 0, produced: [], fresh: [], pool: snapshot(), target: goal, found: true })
    return { input: { points, target }, result: 0, frames }
  }
  let generation = 0
  for (;;) {
    generation += 1
    const items = snapshot().map(k => k.split(',').map(Number))
    const produced = new Map()
    for (let a = 0; a < items.length; a++) {
      for (let b = a + 1; b < items.length; b++) {
        const mid = items[a].map((v, i) => Math.floor((v + items[b][i]) / 2))
        produced.set(key(mid), mid)
      }
    }
    const producedKeys = [...produced.keys()]
    const fresh = producedKeys.filter(k => !pool.has(k))
    const found = produced.has(goal)
    frames.push({ phase: 'generation', activeLine: L('for each distinct pair'), pythonLine: P('for a in range(len(items))'), message: `Generation ${generation} pairs ${items.length} known triples and produces ${producedKeys.length} midpoints.`, generation, produced: producedKeys, fresh, pool: snapshot(), target: goal, found })
    if (found) {
      frames.push({ phase: 'found', activeLine: L('if target is in produced'), pythonLine: P('if goal in produced'), message: `The target appears in generation ${generation}.`, generation, produced: producedKeys, fresh, pool: snapshot(), target: goal, found: true })
      return { input: { points, target }, result: generation, frames }
    }
    if (fresh.length === 0) {
      frames.push({ phase: 'stop', activeLine: L('if produced adds nothing new'), pythonLine: P('if not (produced - pool)'), message: 'Nothing new appears, so the target can never be produced.', generation, produced: producedKeys, fresh, pool: snapshot(), target: goal, found: false })
      return { input: { points, target }, result: -1, frames }
    }
    for (const k of fresh) pool.set(k, generation)
    frames.push({ phase: 'add', activeLine: L('add produced to pool'), pythonLine: P('pool |= produced'), message: `${fresh.length} new triple${fresh.length === 1 ? '' : 's'} join the pool for the next generation.`, generation, produced: producedKeys, fresh, pool: snapshot(), target: goal, found: false })
  }
}

export const code = `earliest generation that contains the target
  let pool be the distinct starting triples
  if target is in pool then return 0
  repeat
    the generation number increases by one
    let produced be empty
    for each distinct pair (p, q) in pool
      add the floored midpoint of p and q to produced
    if target is in produced then return the generation number
    if produced adds nothing new to pool then return -1
    add produced to pool`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = s => {
  const index = code.findIndex(line => line.text.includes(s))
  if (index < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return index + 1
}

export const python = `def min_generations(points, target):
    pool = set(tuple(p) for p in points)
    goal = tuple(target)
    if goal in pool:
        return 0
    generation = 0
    while True:
        generation += 1
        items = list(pool)
        produced = set()
        for a in range(len(items)):
            for b in range(a + 1, len(items)):
                mid = tuple((items[a][i] + items[b][i]) // 2 for i in range(3))
                produced.add(mid)
        if goal in produced:
            return generation
        if not (produced - pool):
            return -1
        pool |= produced`

const pyLines = python.split('\n')
const P = s => {
  const index = pyLines.findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`Missing python line: ${s}`)
  return index + 1
}
