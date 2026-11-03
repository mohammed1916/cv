// Teaching model derived from general graph-coloring and binary-search knowledge; not verified against the official statement.
const MAX_POINTS = 8
const LIMIT = 100

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with points.')
  const { points } = input
  if (!Array.isArray(points) || points.length < 2 || points.length > MAX_POINTS) throw new Error(`points has 2 to ${MAX_POINTS} entries in this visual.`)
  for (const p of points) {
    if (!Array.isArray(p) || p.length !== 2 || !p.every(v => Number.isInteger(v) && Math.abs(v) <= LIMIT)) throw new Error(`Each point is [x, y] with integers from -${LIMIT} to ${LIMIT}.`)
  }
  return { points }
}

const dist = (points, i, j) => Math.abs(points[i][0] - points[j][0]) + Math.abs(points[i][1] - points[j][1])

// Edges join pairs closer than d: those pairs must land in different groups.
function twoColor(points, d) {
  const n = points.length
  const color = Array(n).fill(-1)
  for (let start = 0; start < n; start++) {
    if (color[start] !== -1) continue
    color[start] = 0
    const stack = [start]
    while (stack.length) {
      const u = stack.pop()
      for (let v = 0; v < n; v++) {
        if (v === u || dist(points, u, v) >= d) continue
        if (color[v] === -1) { color[v] = 1 - color[u]; stack.push(v) } else if (color[v] === color[u]) return { ok: false, color: null }
      }
    }
  }
  return { ok: true, color }
}

export function buildTrace({ points }) {
  const n = points.length
  const frames = []
  if (n === 2) {
    frames.push({ pythonLine: 4, phase: 'done', activeLine: L('return 0'), points, colors: [0, 1], candidates: [], probe: null, ok: true, total: 0, message: 'Two points give two singleton groups with no intra-group pairs: the factor is 0.' })
    return { input: { points }, result: 0, frames }
  }
  const candidates = [...new Set(points.flatMap((_, i) => points.slice(i + 1).map((__, j) => dist(points, i, i + 1 + j))))].sort((a, b) => a - b)
  frames.push({ pythonLine: 25, phase: 'start', activeLine: L('sort the distinct'), points, colors: null, candidates, probe: null, ok: null, total: candidates.length, message: `${candidates.length} distinct distance${candidates.length === 1 ? '' : 's'} are possible answers.` })
  let lo = 0, hi = candidates.length - 1
  while (lo < hi) {
    const mid = Math.floor((lo + hi + 1) / 2)
    const { ok, color } = twoColor(points, candidates[mid])
    frames.push({ pythonLine: 29, phase: 'probe', activeLine: L('binary search'), points, colors: color, candidates, probe: candidates[mid], ok, total: candidates.length, message: `Try factor ${candidates[mid]}: ${ok ? 'the conflict graph splits into two groups' : 'a conflict cycle appears'}.` })
    if (ok) lo = mid
    else hi = mid - 1
  }
  const best = candidates[lo]
  let { color } = twoColor(points, best)
  if (color.every(c => c === color[0])) color = color.map((c, i) => (i === 0 ? 1 - c : c))
  frames.push({ pythonLine: 33, phase: 'done', activeLine: L('return the largest'), points, colors: color, candidates, probe: best, ok: true, total: candidates.length, message: `Maximum partition factor: ${best}.` })
  return { input: { points }, result: best, frames }
}

export const code = `maximum partition factor over splits into two non-empty groups
  if there are exactly two points then return 0
  sort the distinct pairwise Manhattan distances as candidates
  binary search the largest candidate d that keeps the conflict graph bipartite
  conflict edges join pairs closer than d and must cross the split
  2-color the conflict graph; a clash means d is too large
  return the largest candidate that passes`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_partition_factor(points):
    n = len(points)
    if n == 2:
        return 0
    def dist(i, j):
        return abs(points[i][0] - points[j][0]) + abs(points[i][1] - points[j][1])
    def bipartite(d):
        color = [-1] * n
        for start in range(n):
            if color[start] != -1:
                continue
            color[start] = 0
            stack = [start]
            while stack:
                u = stack.pop()
                for v in range(n):
                    if v == u or dist(u, v) >= d:
                        continue
                    if color[v] == -1:
                        color[v] = 1 - color[u]
                        stack.append(v)
                    elif color[v] == color[u]:
                        return False
        return True
    candidates = sorted({dist(i, j) for i in range(n) for j in range(i + 1, n)})
    lo, hi = 0, len(candidates) - 1
    while lo < hi:
        mid = (lo + hi + 1) // 2
        if bipartite(candidates[mid]):
            lo = mid
        else:
            hi = mid - 1
    return candidates[lo]
`
