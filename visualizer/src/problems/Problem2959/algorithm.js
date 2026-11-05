export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Number.isInteger(input.n) || input.n < 1 || input.n > 6) throw new Error('n is an integer from 1 to 6.')
  if (!Number.isInteger(input.maxDistance) || input.maxDistance < 1 || input.maxDistance > 60) throw new Error('maxDistance is an integer from 1 to 60.')
  if (!Array.isArray(input.roads) || input.roads.length > 15) throw new Error('roads holds at most 15 triples.')
  input.roads.forEach(r => {
    if (!Array.isArray(r) || r.length !== 3 || !Number.isInteger(r[0]) || !Number.isInteger(r[1]) || r[0] < 0 || r[1] < 0 || r[0] >= input.n || r[1] >= input.n || r[0] === r[1]) throw new Error('Each road is [u, v, w] between two different branches.')
    if (!Number.isInteger(r[2]) || r[2] < 1 || r[2] > 20) throw new Error('Each road length is an integer from 1 to 20.')
  })
  return { n: input.n, maxDistance: input.maxDistance, roads: input.roads }
}

export const code = `function numberOfSets(n, maxDistance, roads) {
  let count = 0
  for (let mask = 0; mask < 1 << n; mask++) {
    const dist = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 0 : Infinity)))
    for (const [u, v, w] of roads) {
      if ((mask >> u) & 1 && (mask >> v) & 1) {
        dist[u][v] = Math.min(dist[u][v], w)
        dist[v][u] = Math.min(dist[v][u], w)
      }
    }
    for (let k = 0; k < n; k++) {
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) dist[i][j] = Math.min(dist[i][j], dist[i][k] + dist[k][j])
      }
    }
    const open = [...Array(n).keys()].filter(i => (mask >> i) & 1)
    if (open.every(i => open.every(j => dist[i][j] <= maxDistance))) count += 1
  }
  return count
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const CL = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }

export const python = `def number_of_sets(n, max_distance, roads):
    INF = float("inf")
    count = 0
    for mask in range(1 << n):
        dist = [[0 if i == j else INF for j in range(n)] for i in range(n)]
        for u, v, w in roads:
            if (mask >> u) & 1 and (mask >> v) & 1:
                dist[u][v] = min(dist[u][v], w)
                dist[v][u] = min(dist[v][u], w)
        for k in range(n):
            for i in range(n):
                for j in range(n):
                    dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j])
        open_ = [i for i in range(n) if (mask >> i) & 1]
        if all(dist[i][j] <= max_distance for i in open_ for j in open_):
            count += 1
    return count
`
const PY = python.split('\n')
const PL = s => { const i = PY.findIndex(l => l.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }

// Each subset of branches is tested on its own: only roads between two open branches exist in that subset.
export function buildTrace({ n, maxDistance, roads }) {
  const frames = []
  let count = 0
  frames.push({ phase: 'start', activeLine: CL('let count = 0'), pythonLine: PL('count = 0'), n, roads, mask: -1, open: [], worst: null, valid: null, count, message: `Test every subset of the ${n} branches as the open set.` })
  for (let mask = 0; mask < 1 << n; mask++) {
    const dist = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 0 : Infinity)))
    const used = []
    for (const [u, v, w] of roads) {
      if ((mask >> u) & 1 && (mask >> v) & 1) {
        dist[u][v] = Math.min(dist[u][v], w)
        dist[v][u] = Math.min(dist[v][u], w)
        used.push([u, v, w])
      }
    }
    for (let k = 0; k < n; k++) for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) dist[i][j] = Math.min(dist[i][j], dist[i][k] + dist[k][j])
    const open = [...Array(n).keys()].filter(i => (mask >> i) & 1)
    let worst = 0
    for (const i of open) for (const j of open) worst = Math.max(worst, dist[i][j])
    const valid = open.every(i => open.every(j => dist[i][j] <= maxDistance))
    if (valid) count += 1
    const label = open.length ? `{${open.join(', ')}}` : 'the empty set'
    frames.push({ phase: 'subset', activeLine: CL('if (open.every'), pythonLine: PL('if all(dist[i][j]'), n, roads, used, mask, open, worst: Number.isFinite(worst) ? worst : null, valid, count, message: `${label} open: ${valid ? 'every pair is within' : 'some pair is too far apart'} ${maxDistance} (worst ${Number.isFinite(worst) ? worst : 'unreachable'}).` })
  }
  frames.push({ phase: 'done', activeLine: CL('return count'), pythonLine: PL('return count'), n, roads, mask: -1, open: [], worst: null, valid: null, count, result: count, message: `${count} valid set${count === 1 ? '' : 's'} of open branches.` })
  return { input: { n, maxDistance, roads }, result: count, frames }
}
