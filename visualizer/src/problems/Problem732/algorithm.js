import { SegTree } from '../../components/shared/segtreeModel.js'

export function parseInput(text) {
  const ops = JSON.parse(text)
  if (!Array.isArray(ops) || ops.length < 1 || ops.length > 400) throw new Error('Enter 1–400 bookings as [start, end) pairs.')
  for (const op of ops) {
    if (!Array.isArray(op) || op.length !== 2 || !Number.isInteger(op[0]) || !Number.isInteger(op[1]) || op[0] < 0 || op[1] > 1000000000 || op[0] >= op[1]) throw new Error('Each booking is [start, end) with 0 ≤ start < end ≤ 1e9.')
  }
  return ops
}

// Keep a difference map of +1 at starts and −1 at ends; the best overlap is the largest running total.
export function buildTrace(ops) {
  const delta = new Map()
  const results = []
  // The same bookings on a lazy max/add segment tree over the compressed time points (leaf k = [t_k, t_k+1)).
  const xs = [...new Set(ops.flat())].sort((a, b) => a - b)
  const seg = new SegTree(Math.max(1, xs.length - 1), 'max-add')
  const segView = () => ({ seg: { ...seg.snapshot(), coords: xs, title: 'Segment tree of overlap counts (max, lazy add)' } })
  const frames = [{ phase: 'start', delta: [], best: 0, op: null, activeLine: 1, pythonLine: 2, ...segView(), message: 'Empty calendar: maximum overlap 0.' }]
  ops.forEach(([s, e], i) => {
    delta.set(s, (delta.get(s) ?? 0) + 1)
    delta.set(e, (delta.get(e) ?? 0) - 1)
    const points = [...delta.keys()].sort((a, b) => a - b)
    let running = 0, best = 0
    for (const p of points) { running += delta.get(p); best = Math.max(best, running) }
    results.push(best)
    seg.update(xs.indexOf(s), xs.indexOf(e) - 1, 1)
    frames.push({ phase: 'add', op: i, attempt: [s, e], delta: points.map(p => [p, delta.get(p)]), best, result: results.slice(), activeLine: 5, pythonLine: 10, ...segView(), message: `[${s}, ${e}) added: the maximum overlap is now ${best}.` })
  })
  frames.push({ phase: 'done', op: ops.length - 1, delta: [...delta.keys()].sort((a, b) => a - b).map(p => [p, delta.get(p)]), best: results.at(-1), result: results, activeLine: 7, pythonLine: 11, ...segView(), message: `Maximum overlaps: [${results.join(', ')}].` })
  return { input: ops, result: results, frames }
}

export const code = `set delta to an empty map of point changes, and results to an empty list
for each booking [s, e] in order
  add +1 to delta at s
  subtract 1 from delta at e
  sweep the points in sorted order, tracking the running total and its largest value best
  append best to results
return results`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def my_calendar_three(bookings):
    delta, results = {}, []
    for s, e in bookings:
        delta[s] = delta.get(s, 0) + 1
        delta[e] = delta.get(e, 0) - 1
        best = running = 0
        for p in sorted(delta):
            running += delta[p]
            best = max(best, running)
        results.append(best)
    return results`
