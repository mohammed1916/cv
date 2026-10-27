export function parseInput(text) {
  const o = JSON.parse(text)
  if (!o || !Array.isArray(o.points)) throw new Error('Use an object with an array points of [x, y] pairs.')
  const { points } = o
  if (points.length < 3 || points.length > 8) throw new Error('points must have 3 to 8 entries.')
  if (points.some(p => !Array.isArray(p) || p.length !== 2 || p.some(v => !Number.isInteger(v) || v < -20 || v > 20))) throw new Error('Each point is [x, y] with integers from -20 to 20.')
  if (new Set(points.map(p => p.join(','))).size !== points.length) throw new Error('Points must be distinct.')
  return { points }
}

// Two smallest and two largest indices of a list, so the extremes survive removing one entry.
const extremes = vals => {
  const order = vals.map((_, i) => i).sort((a, b) => vals[a] - vals[b])
  return { lo1: order[0], lo2: order[1], hi1: order[order.length - 1], hi2: order[order.length - 2] }
}
const spreadWithout = (vals, e, i) => vals[i === e.hi1 ? e.hi2 : e.hi1] - vals[i === e.lo1 ? e.lo2 : e.lo1]

export function buildTrace({ points }) {
  const s = points.map(([x, y]) => x + y)
  const t = points.map(([x, y]) => x - y)
  const es = extremes(s)
  const et = extremes(t)
  let best = null
  const frames = [{ phase: 'start', activeLine: L('set best to nothing'), removed: -1, distance: null, best: null, message: 'Rotate each point to s = x + y and t = x - y.' }]
  for (let i = 0; i < points.length; i++) {
    const distance = Math.max(spreadWithout(s, es, i), spreadWithout(t, et, i))
    if (best === null || distance < best) best = distance
    frames.push({ phase: 'remove', activeLine: L('for each point i to remove'), removed: i, distance, best, message: `Remove point ${i} (${points[i]}): the largest Manhattan distance left is ${distance}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return best'), removed: -1, distance: null, best, message: `Smallest possible maximum distance: ${best}.` })
  return { input: { points }, result: best, frames, s, t }
}

export const code = `minimum over removals of the largest Manhattan distance among the rest
  let s[j] be x plus y and t[j] be x minus y for each point j
  find the two smallest and two largest indices of s and of t
  set best to nothing
  for each point i to remove
    spread is the larger of (max s minus min s) and (max t minus min t) over the points other than i
    set best to the smaller of best and spread
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def minimize_manhattan_distances(points):
    s = [x + y for x, y in points]
    t = [x - y for x, y in points]

    def extremes(values):
        order = sorted(range(len(values)), key=lambda i: values[i])
        return order[0], order[1], order[-1], order[-2]

    def spread_without(values, info, i):
        lo1, lo2, hi1, hi2 = info
        hi = values[hi2] if i == hi1 else values[hi1]
        lo = values[lo2] if i == lo1 else values[lo1]
        return hi - lo

    info_s = extremes(s)
    info_t = extremes(t)
    best = None
    for i in range(len(points)):
        spread = max(spread_without(s, info_s, i), spread_without(t, info_t, i))
        if best is None or spread < best:
            best = spread
    return best
`
