export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use a JSON object with n, edges and k.')
  const { n, edges, k } = input
  if (!Number.isInteger(n) || n < 2 || n > 12) throw new Error('n must be an integer from 2 to 12.')
  if (!Array.isArray(edges) || edges.length > 20) throw new Error('edges must be an array of at most 20 [u, v, time] triples.')
  for (const e of edges) {
    if (!Array.isArray(e) || e.length !== 3) throw new Error('Each edge is [u, v, time].')
    const [u, v, t] = e
    if (!Number.isInteger(u) || !Number.isInteger(v) || u < 0 || v < 0 || u >= n || v >= n || u === v) throw new Error('Edge endpoints must be different nodes from 0 to n-1.')
    if (!Number.isInteger(t) || t < 1 || t > 1000000000) throw new Error('Edge times are integers from 1 to 1000000000.')
  }
  if (!Number.isInteger(k) || k < 1 || k > n) throw new Error('k must be an integer from 1 to n.')
  return { n, edges, k }
}

export function buildTrace(input) {
  const { n, edges, k } = input
  const parent = Array.from({ length: n }, (_, i) => i)
  const find = x => { while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x] } return x }
  let comps = n
  const countAt = new Map()
  const times = [...new Set(edges.map(e => e[2]))].sort((a, b) => b - a)
  const frames = [{ phase: 'start', activeLine: L('start with every node'), time: null, comps, message: `${n} nodes, each its own component. Need at least ${k}.` }]
  for (const t of times) {
    countAt.set(t, comps)
    frames.push({ phase: 'group', activeLine: L('for each time t from the largest'), time: t, comps, message: `Edges with time above ${t} are kept: ${comps} components.` })
    for (const [u, v, w] of edges) {
      if (w !== t) continue
      const ru = find(u)
      const rv = find(v)
      if (ru !== rv) { parent[ru] = rv; comps -= 1 }
    }
  }
  countAt.set(0, comps)
  let answer = -1
  for (const t of [0, ...[...times].reverse()]) {
    const count = countAt.get(t)
    if (count >= k) {
      answer = t
      frames.push({ phase: 'answer', activeLine: L('then return t'), time: t, comps: count, message: `Time ${t} leaves ${count} components, at least ${k}.` })
      break
    }
    frames.push({ phase: 'scan', activeLine: L('if the count for t'), time: t, comps: count, message: `Time ${t} leaves ${count} components, short of ${k}.` })
  }
  return { input: { n, edges, k }, result: answer, frames }
}

export const code = `minimum time for k components (n, edges, k):
  start with every node in its own component
  sort the distinct edge times from largest to smallest
  for each time t from the largest do
    save count of t before the union
    union the endpoints of every edge with time t
  save count of time 0 at the end
  for each candidate t from 0 upward do
    if the count for t is at least k then return t
  return -1`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_time_to_k_components(n, edges, k):
    parent = list(range(n))

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    comps = n
    count_at = {}
    by_time = {}
    for u, v, t in edges:
        by_time.setdefault(t, []).append((u, v))
    for t in sorted(by_time, reverse=True):
        count_at[t] = comps
        for u, v in by_time[t]:
            ru, rv = find(u), find(v)
            if ru != rv:
                parent[ru] = rv
                comps -= 1
    count_at[0] = comps
    for t in [0] + sorted(by_time):
        if count_at[t] >= k:
            return t
    return -1
`
