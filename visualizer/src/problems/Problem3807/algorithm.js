export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with n, k and edges.')
  const { n, k, edges } = input
  if (!Number.isInteger(n) || n < 2 || n > 10) throw new Error('n is an integer from 2 to 10.')
  if (!Number.isInteger(k) || k < 0 || k > 10) throw new Error('k is an integer from 0 to 10.')
  if (!Array.isArray(edges) || edges.length < 1 || edges.length > 20) throw new Error('edges lists 1 to 20 triples.')
  for (const e of edges) {
    if (!Array.isArray(e) || e.length !== 3) throw new Error('Each edge is [u, v, cost].')
    const [u, v, c] = e
    if (![u, v, c].every(Number.isInteger) || u < 0 || v < 0 || u >= n || v >= n || u === v) throw new Error('Edge endpoints must be distinct nodes below n.')
    if (c < 0 || c > 100) throw new Error('Repair costs are integers from 0 to 100.')
  }
  return { n, k, edges }
}

export const code = `minimum repair threshold for a short enough path
  candidates = sorted distinct values of {0} plus every edge cost
  function usable(t)
    keep edges with cost at most t
    hops = bfs distance from 0 to n-1 over kept edges
    return hops exists and hops at most k
  if not usable(largest candidate) then return -1
  lo = 0, hi = last index of candidates
  while lo < hi
    mid = floor((lo + hi) / 2)
    if usable(candidates[mid]) then hi = mid else lo = mid + 1
  return candidates[lo]`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error(`missing pseudocode: ${s}`); return i + 1 }

export const python = `def min_repair_threshold(n, k, edges):
    def usable(t):
        graph = [[] for _ in range(n)]
        for u, v, c in edges:
            if c <= t:
                graph[u].append(v)
                graph[v].append(u)
        dist = [-1] * n
        dist[0] = 0
        queue = [0]
        head = 0
        while head < len(queue):
            u = queue[head]
            head += 1
            for v in graph[u]:
                if dist[v] < 0:
                    dist[v] = dist[u] + 1
                    queue.append(v)
        return dist[n - 1] != -1 and dist[n - 1] <= k
    candidates = sorted(set([0] + [c for _, _, c in edges]))
    if not usable(candidates[-1]):
        return -1
    lo, hi = 0, len(candidates) - 1
    while lo < hi:
        mid = (lo + hi) // 2
        if usable(candidates[mid]):
            hi = mid
        else:
            lo = mid + 1
    return candidates[lo]`
const PY = python.split('\n')
const Q = s => { const i = PY.findIndex(l => l.includes(s)); if (i < 0) throw new Error(`missing python: ${s}`); return i + 1 }

export function buildTrace({ n, k, edges }) {
  const frames = []
  const hopsFor = t => {
    const graph = Array.from({ length: n }, () => [])
    for (const [u, v, c] of edges) if (c <= t) { graph[u].push(v); graph[v].push(u) }
    const dist = Array(n).fill(-1)
    dist[0] = 0
    const queue = [0]
    let head = 0
    while (head < queue.length) {
      const u = queue[head++]
      for (const v of graph[u]) if (dist[v] < 0) { dist[v] = dist[u] + 1; queue.push(v) }
    }
    return dist
  }
  const candidates = [...new Set([0, ...edges.map(e => e[2])])].sort((a, b) => a - b)
  const check = (t, phase, extra) => {
    const dist = hopsFor(t)
    const hops = dist[n - 1]
    const ok = hops !== -1 && hops <= k
    frames.push({ phase, threshold: t, repaired: edges.filter(e => e[2] <= t).map(e => [...e]), dist, hops, ok, candidates, lo: extra.lo, hi: extra.hi, mid: extra.mid ?? null, pythonLine: Q(phase === 'top' ? 'if not usable' : 'if usable(candidates[mid])'), activeLine: L(phase === 'top' ? 'if not usable' : 'if usable(candidates[mid])'), message: `Threshold ${t}: ${hops === -1 ? 'no path' : `${hops} edge${hops === 1 ? '' : 's'} to node ${n - 1}`} ${ok ? 'fits' : 'is too long or missing'}.` })
    return ok
  }
  frames.push({ phase: 'start', threshold: null, repaired: [], dist: Array(n).fill(null), hops: null, ok: null, candidates, lo: 0, hi: candidates.length - 1, mid: null, pythonLine: Q('candidates = sorted'), activeLine: L('candidates = sorted'), message: `Candidate thresholds: ${candidates.join(', ')}.` })
  if (!check(candidates[candidates.length - 1], 'top', { lo: 0, hi: candidates.length - 1 })) {
    frames.push({ phase: 'done', threshold: null, repaired: edges.map(e => [...e]), dist: Array(n).fill(null), hops: null, ok: false, candidates, lo: null, hi: null, mid: null, pythonLine: Q('return -1'), activeLine: L('then return -1'), message: 'Even repairing every edge cannot give a short enough path: answer -1.' })
    return { input: { n, k, edges }, result: -1, frames }
  }
  let lo = 0, hi = candidates.length - 1
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2)
    frames.push({ phase: 'mid', threshold: candidates[mid], repaired: [], dist: Array(n).fill(null), hops: null, ok: null, candidates, lo, hi, mid, pythonLine: Q('mid = (lo + hi)'), activeLine: L('mid = floor'), message: `Try threshold ${candidates[mid]} at index ${mid}.` })
    if (check(candidates[mid], 'test', { lo, hi, mid })) hi = mid
    else lo = mid + 1
  }
  const result = candidates[lo]
  frames.push({ phase: 'done', threshold: result, repaired: edges.filter(e => e[2] <= result).map(e => [...e]), dist: hopsFor(result), hops: hopsFor(result)[n - 1], ok: true, candidates, lo, hi, mid: null, pythonLine: Q('return candidates[lo]'), activeLine: L('return candidates[lo]'), message: `Smallest workable threshold: ${result}.` })
  return { input: { n, k, edges }, result, frames }
}
