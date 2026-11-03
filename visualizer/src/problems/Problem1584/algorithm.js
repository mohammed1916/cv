export const phases = [
  { id: 'start', label: 'Start', description: 'Grow one tree from point 0; every other point starts at infinite distance.' },
  { id: 'pick', label: 'Pick nearest', description: 'Choose the point outside the tree that is closest to it.' },
  { id: 'attach', label: 'Attach', description: 'Add that point and its connecting edge to the tree.' },
  { id: 'relax', label: 'Update distances', description: 'Check whether the new point gives a shorter link to each remaining point.' },
  { id: 'done', label: 'Result', description: 'Return the total weight of the tree.' },
]

export const code = `FUNCTION minCostConnectPoints(points)
    n ← number of points
    dist ← infinity for every point; dist[0] ← 0
    inTree ← false for every point
    total ← 0
    REPEAT n times
        u ← point outside the tree with the smallest dist
        inTree[u] ← true; total ← total + dist[u]
        FOR each v outside the tree
            dist[v] ← min(dist[v], manhattan(u, v))
    RETURN total`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def minCostConnectPoints(points):
    n = len(points)
    dist = [float('inf')] * n
    dist[0] = 0
    in_tree = [False] * n
    total = 0
    for _ in range(n):
        u = -1
        for v in range(n):
            if not in_tree[v] and (u == -1 or dist[v] < dist[u]):
                u = v
        in_tree[u] = True
        total += dist[u]
        for v in range(n):
            if not in_tree[v]:
                d = abs(points[u][0] - points[v][0]) + abs(points[u][1] - points[v][1])
                dist[v] = min(dist[v], d)
    return total`

export const pythonLineMap = { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 7, 7: 8, 8: 12, 9: 14, 10: 17, 11: 18 }

export function parseInput(text) {
  let input
  try { input = JSON.parse(text) } catch (error) { throw new Error(`Input must be valid JSON: ${error.message}`) }
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object such as {"points": [[0, 0], [2, 2], [3, 10]]}.')
  const { points } = input
  if (!Array.isArray(points) || points.length < 1 || points.length > 15) throw new Error('points must list between 1 and 15 points.')
  if (!points.every(p => Array.isArray(p) && p.length === 2 && p.every(v => Number.isInteger(v) && Math.abs(v) <= 100))) {
    throw new Error('Each point is [x, y] with integer coordinates from -100 to 100.')
  }
  const seen = new Set(points.map(p => p.join(',')))
  if (seen.size !== points.length) throw new Error('Points must be distinct.')
  return { points }
}

export function buildTrace({ points }) {
  const n = points.length
  const dist = Array(n).fill(Infinity)
  const parent = Array(n).fill(-1)
  const inTree = Array(n).fill(false)
  const edges = []
  let total = 0
  dist[0] = 0
  const manhattan = (a, b) => Math.abs(points[a][0] - points[b][0]) + Math.abs(points[a][1] - points[b][1])
  const snap = extra => ({ dist: dist.map(d => (d === Infinity ? null : d)), inTree: inTree.slice(), edges: edges.map(e => e.slice()), u: -1, total, ...extra })
  const frames = [{ phase: 'start', activeLine: 3, message: 'Point 0 joins the tree at distance 0. Everything else is unreached.', snapshot: snap() }]
  for (let round = 0; round < n; round++) {
    let u = -1
    for (let v = 0; v < n; v++) if (!inTree[v] && (u === -1 || dist[v] < dist[u])) u = v
    frames.push({ phase: 'pick', activeLine: 7, message: `Closest point outside the tree is ${u} at distance ${dist[u]}.`, snapshot: snap({ u }) })
    inTree[u] = true
    total += dist[u]
    if (parent[u] !== -1) edges.push([parent[u], u])
    frames.push({ phase: 'attach', activeLine: 8, message: parent[u] === -1 ? `Point ${u} starts the tree.` : `Attach ${u} through edge ${parent[u]}-${u} (weight ${dist[u]}). Total ${total}.`, snapshot: snap({ u }) })
    for (let v = 0; v < n; v++) {
      if (inTree[v]) continue
      const d = manhattan(u, v)
      if (d < dist[v]) {
        dist[v] = d
        parent[v] = u
        frames.push({ phase: 'relax', activeLine: 10, message: `Point ${u} gives point ${v} a shorter link of ${d}.`, snapshot: snap({ u }) })
      }
    }
  }
  frames.push({ phase: 'done', activeLine: 11, message: `Return ${total}.`, snapshot: snap({ u: -1 }) })
  return { input: { points }, result: total, frames }
}
