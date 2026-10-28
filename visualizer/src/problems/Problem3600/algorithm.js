export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with n, edges and k, for example {"n":3,"edges":[[0,1,2,1],[1,2,3,0]],"k":1}.')
  const { n, edges, k } = data
  if (!Number.isInteger(n) || n < 2 || n > 6) throw new Error('n must be an integer from 2 to 6.')
  if (!Array.isArray(edges) || edges.length < 1 || edges.length > 8) throw new Error('edges must have 1 to 8 entries.')
  if (!Number.isInteger(k) || k < 0 || k > n) throw new Error('k must be an integer from 0 to n.')
  const seen = new Set()
  for (const e of edges) {
    if (!Array.isArray(e) || e.length !== 4 || e.some(x => !Number.isInteger(x))) throw new Error('Each edge is [u, v, s, must].')
    const [u, v, s, must] = e
    if (u < 0 || v < 0 || u >= n || v >= n || u === v) throw new Error('Edge endpoints must be different labels from 0 to n - 1.')
    if (s < 1 || s > 20) throw new Error('Strengths are integers from 1 to 20.')
    if (must !== 0 && must !== 1) throw new Error('must is 0 or 1.')
    const id = u < v ? `${u},${v}` : `${v},${u}`
    if (seen.has(id)) throw new Error('Duplicate edges are not allowed.')
    seen.add(id)
  }
  return { n, edges: edges.map(e => [...e]), k }
}

// Can a spanning tree reach stability at least T? Mandatory edges must already be at least T; optional edges
// cost one upgrade when only their doubled strength reaches T, and Kruskal with cheap edges first finds the fewest upgrades.
function feasible(n, edges, k, T) {
  for (const [, , s, must] of edges) if (must === 1 && s < T) return { ok: false, upgrades: 0 }
  const parent = Array.from({ length: n }, (_, i) => i)
  const find = x => (parent[x] === x ? x : (parent[x] = find(parent[x])))
  for (const [u, v, , must] of edges) {
    if (must !== 1) continue
    const a = find(u)
    const b = find(v)
    if (a === b) return { ok: false, upgrades: 0 }
    parent[a] = b
  }
  const optional = edges.filter(([, , s, must]) => must === 0 && 2 * s >= T).map(([u, v, s]) => ({ u, v, cost: s >= T ? 0 : 1 }))
  optional.sort((x, y) => x.cost - y.cost)
  let upgrades = 0
  for (const { u, v, cost } of optional) {
    const a = find(u)
    const b = find(v)
    if (a === b) continue
    parent[a] = b
    upgrades += cost
  }
  const components = new Set(Array.from({ length: n }, (_, i) => find(i))).size
  return { ok: components === 1 && upgrades <= k, upgrades }
}

export function buildTrace(input) {
  const { n, edges, k } = input
  const candidates = [...new Set(edges.flatMap(([, , s]) => [s, 2 * s]))].sort((a, b) => a - b)
  const frames = [{ phase: 'start', activeLine: L('set candidates'), T: null, ok: null, best: null, message: 'The answer is one of the strengths, or double a strength. Test each candidate from the largest down.' }]
  let best = -1
  for (let i = candidates.length - 1; i >= 0; i--) {
    const T = candidates[i]
    const result = feasible(n, edges, k, T)
    frames.push({ phase: 'try', activeLine: L('for each candidate T from the largest'), T, ok: result.ok, best, message: `Stability ${T}: ${result.ok ? 'a spanning tree reaches it.' : 'no spanning tree reaches it.'}` })
    if (result.ok) { best = T; break }
  }
  frames.push({ phase: 'done', activeLine: L('return best'), T: null, ok: null, best, message: best === -1 ? 'No spanning tree exists, so the answer is -1.' : `The largest achievable stability is ${best}.` })
  return { input, result: best, frames }
}

export const code = `maximum spanning tree stability (n, edges, k)
  set candidates to every strength s and every doubled strength 2s, sorted
  set best to -1
  for each candidate T from the largest down
    if feasible(T) then set best to T and stop
  return best

feasible(T):
  every mandatory edge must have strength at least T, and mandatory edges must not form a cycle
  join the mandatory edges, then add optional edges that reach T, with those needing no upgrade first
  count the upgrades used, and succeed when all nodes are joined and upgrades are at most k`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_stability(n, edges, k):
    def feasible(T):
        for u, v, s, must in edges:
            if must == 1 and s < T:
                return False
        parent = list(range(n))

        def find(x):
            while parent[x] != x:
                parent[x] = parent[parent[x]]
                x = parent[x]
            return x

        for u, v, s, must in edges:
            if must == 1:
                a, b = find(u), find(v)
                if a == b:
                    return False
                parent[a] = b
        optional = sorted(
            ((0 if s >= T else 1), u, v) for u, v, s, must in edges if must == 0 and 2 * s >= T
        )
        upgrades = 0
        for cost, u, v in optional:
            a, b = find(u), find(v)
            if a != b:
                parent[a] = b
                upgrades += cost
        components = len(set(find(i) for i in range(n)))
        return components == 1 and upgrades <= k

    candidates = sorted(set(x for _, _, s, _ in edges for x in (s, 2 * s)))
    for T in reversed(candidates):
        if feasible(T):
            return T
    return -1
`
