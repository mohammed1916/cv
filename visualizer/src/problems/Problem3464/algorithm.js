const MAX_POINTS = 8

const onBoundary = (side, [x, y]) => x === 0 || x === side || y === 0 || y === side

export function parseInput(text) {
  const data = JSON.parse(text)
  const { side, points, k } = data ?? {}
  if (!Number.isInteger(side) || side < 1 || side > 10) throw new Error('side must be an integer from 1 to 10.')
  if (!Array.isArray(points) || points.length < 2 || points.length > MAX_POINTS) throw new Error(`points must list 2 to ${MAX_POINTS} pairs.`)
  for (const p of points) {
    if (!Array.isArray(p) || p.length !== 2 || p.some(v => !Number.isInteger(v) || v < 0 || v > side)) throw new Error('Each point is [x, y] with coordinates from 0 to side.')
    if (!onBoundary(side, p)) throw new Error('Every point must lie on the boundary of the square.')
  }
  if (new Set(points.map(p => `${p[0]},${p[1]}`)).size !== points.length) throw new Error('Points must be distinct.')
  if (!Number.isInteger(k) || k < 2 || k > points.length) throw new Error('k must be an integer from 2 to the number of points.')
  return { side, points, k }
}

export const code = `maximum minimum distance(side, points, k)
  set candidates to the sorted distinct Manhattan distances between pairs of points
  set lo to 0 and hi to the last candidate index
  while lo is at most hi
    let mid be the middle candidate index
    if some k points are pairwise at least candidates[mid] apart then
      remember candidates[mid] and set lo to mid + 1
    otherwise set hi to mid - 1
  return the remembered candidate`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

const manhattan = (a, b) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1])

// The answer is always a pairwise distance, and feasibility only gets harder as the target grows, so binary search applies.
export function buildTrace({ side, points, k }) {
  const n = points.length
  const candidates = [...new Set(points.flatMap((p, i) => points.slice(i + 1).map(q => manhattan(p, q))))].sort((a, b) => a - b)
  const findSpread = d => {
    const pick = (start, chosen) => {
      if (chosen.length === k) return chosen
      for (let i = start; i < n; i++) {
        if (chosen.every(c => manhattan(points[i], points[c]) >= d)) {
          const found = pick(i + 1, [...chosen, i])
          if (found) return found
        }
      }
      return null
    }
    return pick(0, [])
  }
  let lo = 0
  let hi = candidates.length - 1
  let best = candidates[0]
  let bestWitness = []
  const frames = [{ phase: 'start', distance: null, witness: [], lo, hi, activeLine: L('set candidates to'), message: `${candidates.length} distinct Manhattan distance(s) are possible answers.` }]
  while (lo <= hi) {
    const mid = (lo + hi) >> 1
    const d = candidates[mid]
    const witness = findSpread(d)
    if (witness) {
      best = d
      bestWitness = witness
      lo = mid + 1
      frames.push({ phase: 'check', distance: d, feasible: true, witness, lo, hi, activeLine: L('remember candidates[mid]'), message: `${k} points can all be at least ${d} apart, so try a larger distance.` })
    } else {
      hi = mid - 1
      frames.push({ phase: 'check', distance: d, feasible: false, witness: [], lo, hi, activeLine: L('otherwise set hi'), message: `No ${k} points are all at least ${d} apart, so try a smaller distance.` })
    }
  }
  frames.push({ phase: 'done', distance: best, feasible: true, witness: bestWitness, lo, hi, activeLine: L('return the remembered'), result: best, message: `Largest achievable minimum distance: ${best}.` })
  return { input: { side, points, k }, result: best, frames }
}

export const python = `def max_min_distance(side, points, k):
    n = len(points)

    def dist(a, b):
        return abs(a[0] - b[0]) + abs(a[1] - b[1])

    candidates = sorted({dist(points[i], points[j]) for i in range(n) for j in range(i + 1, n)})

    def feasible(d):
        def pick(start, chosen):
            if len(chosen) == k:
                return True
            for i in range(start, n):
                if all(dist(points[i], points[c]) >= d for c in chosen):
                    if pick(i + 1, chosen + [i]):
                        return True
            return False
        return pick(0, [])

    lo, hi, best = 0, len(candidates) - 1, candidates[0]
    while lo <= hi:
        mid = (lo + hi) // 2
        if feasible(candidates[mid]):
            best = candidates[mid]
            lo = mid + 1
        else:
            hi = mid - 1
    return best
`
