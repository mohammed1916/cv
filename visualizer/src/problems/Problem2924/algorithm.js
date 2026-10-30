const CODE = [
  "FUNCTION findChampion(n, edges)",
  "    indegree ← zero for every team",
  "    FOR each edge [a, b]",
  "        indegree[b] ← indegree[b] + 1",
  "    candidates ← teams with indegree 0",
  "    IF exactly one candidate, RETURN it",
  "    RETURN -1",
]
export const code = CODE.map((text, index) => ({ line: index + 1, text }))
export const python = `def findChampion(n, edges):
    indegree = [0] * n
    for a, b in edges:
        indegree[b] += 1
    candidates = [t for t in range(n) if indegree[t] == 0]
    if len(candidates) == 1:
        return candidates[0]
    return -1
`

export function parseInput(text) {
  let data
  try { data = JSON.parse(text) } catch { throw new Error('Input must be a JSON object such as {"n": 3, "edges": [[0,1],[1,2]]}') }
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Input must be a JSON object with keys n and edges')
  const { n, edges } = data
  if (!Number.isInteger(n) || n < 1 || n > 24) throw new Error('n must be an integer from 1 to 24 for the visualization')
  if (!Array.isArray(edges)) throw new Error('edges must be an array of [a, b] pairs')
  edges.forEach((e, idx) => {
    if (!Array.isArray(e) || e.length !== 2) throw new Error(`edge ${idx} must be a pair [a, b]`)
    const [a, b] = e
    if (![a, b].every(v => Number.isInteger(v) && v >= 0 && v < n)) throw new Error(`edge ${idx} endpoints must be integers from 0 to ${n - 1}`)
    if (a === b) throw new Error(`edge ${idx} must not connect a team to itself`)
  })
  return { n, edges }
}

export function buildTrace({ n, edges }) {
  const indegree = Array(n).fill(0)
  const frames = []
  const tags = () => Object.fromEntries(indegree.map((d, t) => [t, `in-degree ${d}`]))
  const emit = (phase, activeLine, pythonLine, message, extra = {}) => frames.push({
    phase, activeLine, pythonLine, message, n, edges, directed: true, tags: tags(), current: null, neighbour: null, done: [], ...extra,
  })
  emit('setup', 2, 2, `n = ${n}, every in-degree starts at 0`)
  edges.forEach(([a, b], idx) => {
    indegree[b] += 1
    emit('edge', 4, 4, `edge ${idx}: ${a} is stronger than ${b}, so in-degree of ${b} becomes ${indegree[b]}`, { current: b, neighbour: a, done: edges.slice(0, idx + 1).map(e => e[1]) })
  })
  const candidates = indegree.map((d, t) => (d === 0 ? t : -1)).filter(t => t >= 0)
  emit('candidates', 5, 5, `teams with in-degree 0: [${candidates.join(', ')}]`, { done: candidates })
  const result = candidates.length === 1 ? candidates[0] : -1
  emit('result', candidates.length === 1 ? 6 : 7, candidates.length === 1 ? 7 : 8,
    candidates.length === 1 ? `team ${result} is the champion` : 'there is not exactly one candidate, return -1', { current: result >= 0 ? result : null, done: candidates })
  return { input: { n, edges }, result, frames }
}
