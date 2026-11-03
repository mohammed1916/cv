export const phases = [
  { id: 'start', label: 'Start', description: 'Start with every city at degree 0 and no roads recorded.' },
  { id: 'count', label: 'Count roads', description: 'Each road adds one to the degree of both of its cities.' },
  { id: 'pair', label: 'Pair rank', description: 'Add the degrees of a pair of cities. Each road attached to either city is counted once per city.' },
  { id: 'direct', label: 'Shared road', description: 'A direct road between the pair was counted twice, so subtract it once.' },
  { id: 'best', label: 'Update best', description: 'Keep the larger of the best rank so far and this pair rank.' },
  { id: 'done', label: 'Complete', description: 'After every pair is checked, the best rank is returned.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object such as {"n": 4, "roads": [[0, 1], [1, 2]]}.')
  const { n, roads } = input
  if (!Number.isInteger(n) || n < 2 || n > 10) throw new Error('n is an integer from 2 to 10.')
  if (!Array.isArray(roads) || roads.length > 20) throw new Error('roads lists at most 20 pairs.')
  const seen = new Set()
  for (const road of roads) {
    if (!Array.isArray(road) || road.length !== 2 || !road.every(c => Number.isInteger(c) && c >= 0 && c < n) || road[0] === road[1]) {
      throw new Error('Each road is two different city numbers from 0 to n - 1.')
    }
    const key = [Math.min(...road), Math.max(...road)].join('-')
    if (seen.has(key)) throw new Error('Each pair of cities can have at most one road.')
    seen.add(key)
  }
  return { n, roads }
}

export const code = `maximal rank (n, roads):
  degree = zeros for each city
  linked = empty set of city pairs
  for each road (a, b):
    degree[a] += 1 ; degree[b] += 1
    linked add sorted pair (a, b)
  best = 0
  for each pair a < b:
    rank = degree[a] + degree[b]
    if (a, b) is in linked:
      rank -= 1
    best = max(best, rank)
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def maximal_network_rank(n, roads):
    degree = [0] * n
    linked = set()
    for a, b in roads:
        degree[a] += 1
        degree[b] += 1
        linked.add((min(a, b), max(a, b)))
    best = 0
    for a in range(n):
        for b in range(a + 1, n):
            rank = degree[a] + degree[b]
            if (a, b) in linked:
                rank -= 1
            best = max(best, rank)
    return best
`

const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1
const at = (phase, pseudo, py, message, snapshot) => ({ phase, activeLine: L(pseudo), pythonLine: P(py), message, snapshot })

export function buildTrace({ n, roads }) {
  const degree = Array(n).fill(0)
  const linked = new Set()
  const snap = (pair, rank, shared) => ({ n, degree: [...degree], pair, rank, shared, best, roads: roads.length })
  let best = 0
  const frames = [at('start', 'degree = zeros', 'degree = [0]', `${n} cities and ${roads.length} roads. Start with every degree at 0.`, snap(null, null, null))]
  for (const [a, b] of roads) {
    degree[a] += 1
    degree[b] += 1
    linked.add(`${Math.min(a, b)}-${Math.max(a, b)}`)
    frames.push(at('count', 'degree[a] += 1', 'degree[a] += 1', `Road ${a}-${b}: city ${a} has degree ${degree[a]} and city ${b} has degree ${degree[b]}.`, snap(null, null, null)))
  }
  for (let a = 0; a < n; a++) {
    for (let b = a + 1; b < n; b++) {
      let rank = degree[a] + degree[b]
      frames.push(at('pair', 'rank = degree[a]', 'rank = degree[a]', `Pair ${a} and ${b}: degrees ${degree[a]} + ${degree[b]} give ${rank}.`, snap([a, b], rank, null)))
      const shared = linked.has(`${a}-${b}`)
      if (shared) {
        rank -= 1
        frames.push(at('direct', 'rank -= 1', 'rank -= 1', `Cities ${a} and ${b} share a road. It was counted in both degrees, so the rank becomes ${rank}.`, snap([a, b], rank, true)))
      }
      best = Math.max(best, rank)
      frames.push(at('best', 'best = max', 'best = max', `Best rank after pair ${a}-${b} is ${best}.`, snap([a, b], rank, shared)))
    }
  }
  frames.push(at('done', 'return best', 'return best', `The largest rank over all pairs is ${best}.`, snap(null, null, null)))
  return { input: { n, roads }, result: best, frames }
}
