// LeetCode 1976: Dijkstra from intersection 0 that also counts shortest routes. A shorter route resets the count; an equal route adds to it.
const MOD = 1000000007
const SOURCE = [
  'function countPaths(n, roads) {',
  '  const adj = Array.from({ length: n }, () => [])',
  '  for (const [u, v, w] of roads) { adj[u].push([v, w]); adj[v].push([u, w]) }',
  '  const dist = new Array(n).fill(Infinity), ways = new Array(n).fill(0)',
  '  const done = new Array(n).fill(false)',
  '  dist[0] = 0; ways[0] = 1',
  '  for (let step = 0; step < n; step++) {',
  '    let u = -1',
  '    for (let x = 0; x < n; x++) if (!done[x] && dist[x] < Infinity && (u === -1 || dist[x] < dist[u])) u = x',
  '    if (u === -1) break',
  '    done[u] = true',
  '    for (const [v, w] of adj[u]) {',
  '      if (dist[u] + w < dist[v]) { dist[v] = dist[u] + w; ways[v] = ways[u] }',
  '      else if (dist[u] + w === dist[v]) ways[v] = (ways[v] + ways[u]) % 1000000007',
  '    }',
  '  }',
  '  return ways[n - 1]',
  '}',
]

export const code = SOURCE.map((text, index) => ({ line: index + 1, text }))

export const python = `def count_paths(n, roads):
    MOD = 10**9 + 7
    adj = [[] for _ in range(n)]
    for u, v, w in roads:
        adj[u].append((v, w))
        adj[v].append((u, w))
    INF = float("inf")
    dist = [INF] * n
    ways = [0] * n
    done = [False] * n
    dist[0] = 0
    ways[0] = 1
    for step in range(n):
        u = -1
        for x in range(n):
            if not done[x] and dist[x] < INF and (u == -1 or dist[x] < dist[u]):
                u = x
        if u == -1:
            break
        done[u] = True
        for v, w in adj[u]:
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
                ways[v] = ways[u]
            elif dist[u] + w == dist[v]:
                ways[v] = (ways[v] + ways[u]) % MOD
    return ways[n - 1]
`

const L = text => { const i = SOURCE.findIndex(line => line.includes(text)); if (i < 0) throw new Error(`no code line: ${text}`); return i + 1 }
const P = text => { const i = python.split('\n').findIndex(line => line.includes(text)); if (i < 0) throw new Error(`no python line: ${text}`); return i + 1 }

export const phases = [
  { id: 'settle', label: 'Settle node', description: 'Pick the closest unsettled intersection.' },
  { id: 'relax', label: 'Relax roads', description: 'Compare each road with the best known time.' },
  { id: 'done', label: 'Result', description: 'Routes that achieve the shortest time to the last intersection.' },
]

export function parseInput(text) {
  let input
  try { input = JSON.parse(text) } catch { throw new Error('Enter JSON like {"n":4,"roads":[[0,1,2],[1,3,2],[0,2,3],[2,3,1]]}.') }
  const { n, roads } = input || {}
  if (!Number.isInteger(n) || n < 2 || n > 8) throw new Error('n is an integer from 2 to 8 for the visualization.')
  if (!Array.isArray(roads) || roads.length < 1 || roads.length > 14) throw new Error('roads holds 1 to 14 entries.')
  const seen = new Set()
  for (const r of roads) {
    if (!Array.isArray(r) || r.length !== 3 || !r.every(Number.isInteger)) throw new Error('Each road is [u, v, time].')
    const [u, v, w] = r
    if (u < 0 || u >= n || v < 0 || v >= n || u === v || w < 1 || w > 10) throw new Error('Roads join distinct intersections below n with time 1 to 10.')
    const key = u < v ? `${u},${v}` : `${v},${u}`
    if (seen.has(key)) throw new Error('At most one road between two intersections.')
    seen.add(key)
  }
  return { n, roads }
}

export function buildTrace({ n, roads }) {
  const adj = Array.from({ length: n }, () => [])
  for (const [u, v, w] of roads) { adj[u].push([v, w]); adj[v].push([u, w]) }
  const dist = new Array(n).fill(Infinity), ways = new Array(n).fill(0)
  const done = new Array(n).fill(false)
  dist[0] = 0
  ways[0] = 1
  const frames = []
  const snapshot = () => dist.map((d, i) => ({ d: d === Infinity ? null : d, w: ways[i] }))
  for (let step = 0; step < n; step++) {
    let u = -1
    for (let x = 0; x < n; x++) if (!done[x] && dist[x] < Infinity && (u === -1 || dist[x] < dist[u])) u = x
    if (u === -1) break
    done[u] = true
    frames.push({ phase: 'settle', activeLine: L('let u = -1'), pythonLine: P('u = -1'), message: `Settle intersection ${u} at time ${dist[u]} with ${ways[u]} shortest route(s).`, current: u, neighbour: null, settled: done.map((d, i) => (d ? i : -1)).filter(i => i >= 0), tags: snapshot() })
    for (const [v, w] of adj[u]) {
      if (dist[u] + w < dist[v]) { dist[v] = dist[u] + w; ways[v] = ways[u] }
      else if (dist[u] + w === dist[v]) ways[v] = (ways[v] + ways[u]) % MOD
      const kind = dist[u] + w === dist[v] ? 'equal' : 'other'
      frames.push({ phase: 'relax', activeLine: L('if (dist[u] + w < dist[v])'), pythonLine: P('if dist[u] + w < dist[v]'), message: `Road ${u}–${v} (${w}): best to ${v} is ${dist[v]} with ${ways[v]} route(s)${kind === 'equal' ? ' (ties add routes)' : ''}.`, current: u, neighbour: v, settled: done.map((d, i) => (d ? i : -1)).filter(i => i >= 0), tags: snapshot() })
    }
  }
  const result = ways[n - 1]
  frames.push({ phase: 'done', activeLine: L('return ways[n - 1]'), pythonLine: P('return ways[n - 1]'), message: `${result} shortest route(s) reach intersection ${n - 1}.`, current: null, neighbour: null, settled: done.map((d, i) => (d ? i : -1)).filter(i => i >= 0), tags: snapshot(), result })
  return { input: { n, roads }, result, frames }
}
