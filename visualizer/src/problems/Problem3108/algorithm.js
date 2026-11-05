// Every weight fits in 5 bits, so 31 is the all-ones starting mask for a component.
const FULL = 31

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with n, edges and queries.')
  const { n, edges, queries } = input
  if (!Number.isInteger(n) || n < 2 || n > 8) throw new Error('n is an integer from 2 to 8 in this view.')
  if (!Array.isArray(edges) || edges.length > 12) throw new Error('edges has at most 12 [u, v, w] entries.')
  for (const edge of edges) {
    if (!Array.isArray(edge) || edge.length !== 3) throw new Error('Each edge is [u, v, w].')
    const [u, v, w] = edge
    if (![u, v, w].every(Number.isInteger) || u < 0 || v < 0 || u >= n || v >= n || u === v) throw new Error('Edge endpoints are distinct nodes from 0 to n - 1.')
    if (w < 0 || w > FULL) throw new Error('Edge weights are integers from 0 to 31 in this view.')
  }
  if (!Array.isArray(queries) || queries.length < 1 || queries.length > 6) throw new Error('queries has 1 to 6 [s, t] pairs.')
  for (const query of queries) {
    if (!Array.isArray(query) || query.length !== 2) throw new Error('Each query is [s, t].')
    const [s, t] = query
    if (![s, t].every(Number.isInteger) || s < 0 || t < 0 || s >= n || t >= n || s === t) throw new Error('Query endpoints are different nodes from 0 to n - 1.')
  }
  return { n, edges, queries }
}

export function buildTrace({ n, edges, queries }) {
  const parent = Array.from({ length: n }, (_, i) => i)
  const cost = Array(n).fill(FULL)
  const find = x => {
    let at = x
    while (parent[at] !== at) at = parent[at]
    return at
  }
  const frames = []
  const snap = extra => ({ parent: [...parent], cost: [...cost], edge: -1, merged: null, query: null, answer: null, ...extra })
  frames.push(snap({ phase: 'setup', activeLine: L('const parent'), pythonLine: P('parent = list'), message: `${n} nodes start as separate components; every component cost begins as all ones (${FULL}).` }))
  edges.forEach(([u, v, w], index) => {
    const a = find(u)
    const b = find(v)
    if (a === b) {
      cost[a] &= w
      frames.push(snap({ phase: 'same', activeLine: L('cost[a] &= w'), pythonLine: P('cost[a] &= w'), edge: index, merged: null, message: `Edge ${u}-${v} (${w}) stays inside one component; its cost becomes ${cost[a]}.` }))
      return
    }
    parent[b] = a
    cost[a] = cost[a] & cost[b] & w
    frames.push(snap({ phase: 'merge', activeLine: L('parent[b] = a'), pythonLine: P('parent[b] = a'), edge: index, merged: [u, v], message: `Edge ${u}-${v} (${w}) joins two components; the shared cost is ${cost[a]}.` }))
  })
  const answers = queries.map(([s, t], index) => {
    const same = find(s) === find(t)
    const answer = same ? cost[find(s)] : -1
    frames.push(snap({ phase: 'query', activeLine: L('return queries.map'), pythonLine: P('return [cost'), query: [s, t], answer, message: same ? `Query ${index + 1}: ${s} and ${t} share a component, so the cheapest walk costs ${answer}.` : `Query ${index + 1}: ${s} and ${t} are not connected, so the answer is -1.` }))
    return answer
  })
  frames.push(snap({ phase: 'done', activeLine: L('return queries.map'), pythonLine: P('return [cost'), answer: answers.join(', '), message: `Answers: [${answers.join(', ')}].` }))
  return { input: { n, edges, queries }, result: answers, frames }
}

export const code = `function minimumCostWalks(n, edges, queries) {
  const parent = Array.from({ length: n }, (_, i) => i)
  const cost = Array(n).fill(31)
  const find = x => {
    let at = x
    while (parent[at] !== at) at = parent[at]
    return at
  }
  for (const [u, v, w] of edges) {
    const a = find(u)
    const b = find(v)
    if (a === b) {
      cost[a] &= w
      continue
    }
    parent[b] = a
    cost[a] = cost[a] & cost[b] & w
  }
  return queries.map(([s, t]) => (find(s) === find(t) ? cost[find(s)] : -1))
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def minimum_cost_walks(n, edges, queries):
    parent = list(range(n))
    cost = [31] * n

    def find(x):
        while parent[x] != x:
            x = parent[x]
        return x

    for u, v, w in edges:
        a, b = find(u), find(v)
        if a == b:
            cost[a] &= w
            continue
        parent[b] = a
        cost[a] = cost[a] & cost[b] & w
    return [cost[find(s)] if find(s) == find(t) else -1 for s, t in queries]
`
const PY = python.split('\n')
const P = text => {
  const index = PY.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Python line not found: ${text}`)
  return index + 1
}
