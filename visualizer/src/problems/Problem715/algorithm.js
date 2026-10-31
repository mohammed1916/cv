import { SegTree } from '../../components/shared/segtreeModel.js'

export function parseInput(text) {
  const ops = JSON.parse(text)
  if (!Array.isArray(ops) || ops.length < 1 || ops.length > 500) throw new Error('Enter 1–500 operations: ["addRange", l, r], ["queryRange", l, r] or ["removeRange", l, r].')
  for (const [name, l, r] of ops) {
    if (!['addRange', 'queryRange', 'removeRange'].includes(name) || !Number.isInteger(l) || !Number.isInteger(r) || l < 0 || r > 50 || l >= r) throw new Error('Ranges are half-open [l, r) with 0 ≤ l < r ≤ 50.')
  }
  return ops
}

// Maintain a sorted list of disjoint half-open intervals. Add and remove merge or split neighbours.
export function buildTrace(ops) {
  let intervals = []
  const log = []
  // The same operations on a lazy cover/uncover segment tree over the compressed endpoints (value = covered leaves).
  const xs = [...new Set(ops.flatMap(([, l, r]) => [l, r]))].sort((a, b) => a - b)
  const seg = new SegTree(Math.max(1, xs.length - 1), 'cover-assign')
  const segView = () => ({ seg: { ...seg.snapshot(), coords: xs, title: 'Segment tree of covered pieces (lazy cover / clear)' } })
  const frames = [{ phase: 'start', pythonLine: 2, intervals: [], ...segView(), op: null, activeLine: L('intervals = empty sorted list'), message: 'No tracked ranges yet.' }]
  ops.forEach(([name, l, r], i) => {
    let returned = null
    if (name === 'addRange') {
      const kept = []
      let nl = l, nr = r
      for (const [a, b] of intervals) {
        if (b < nl || a > nr) kept.push([a, b])
        else { nl = Math.min(nl, a); nr = Math.max(nr, b) }
      }
      intervals = [...kept, [nl, nr]].sort((x, y) => x[0] - y[0])
    } else if (name === 'removeRange') {
      const next = []
      for (const [a, b] of intervals) {
        if (b <= l || a >= r) next.push([a, b])
        else {
          if (a < l) next.push([a, l])
          if (b > r) next.push([r, b])
        }
      }
      intervals = next
    } else {
      returned = intervals.some(([a, b]) => a <= l && r <= b)
    }
    const from = xs.indexOf(l), to = xs.indexOf(r) - 1
    let segReturned = null
    if (name === 'queryRange') segReturned = seg.query(from, to) === to - from + 1
    else seg.update(from, to, name === 'addRange' ? 1 : 0)
    if (segReturned !== null && segReturned !== returned) throw new Error('segment tree disagrees with interval list')
    log.push({ name, args: [l, r], returned })
    frames.push({ phase: name, pythonLine: name === 'addRange' ? 13 : name === 'removeRange' ? 24 : 26, op: i, intervals: intervals.map(x => [...x]), log: log.map(x => ({ ...x })), returned, ...segView(), activeLine: name === 'addRange' ? L('if it does not touch merged') : name === 'removeRange' ? L('keep only its parts outside') : L('append whether one interval covers'),
      message: `${name}[${l}, ${r})${returned === null ? '' : ` → ${returned}`}: ${intervals.length} interval${intervals.length === 1 ? '' : 's'} tracked.` })
  })
  frames.push({ phase: 'done', pythonLine: 27, op: ops.length - 1, intervals: intervals.map(x => [...x]), log, ...segView(), activeLine: L('return results'), message: 'All operations complete.' })
  return { input: ops, result: log.filter(x => x.name === 'queryRange').map(x => x.returned), log, frames }
}

export const code = `rangeModuleOperations(ops):
  intervals = empty sorted list of disjoint [start, end) ranges
  results = empty list
  for each [name, l, r] in ops
    if name is addRange
      merged = [l, r]
      for each interval [a, b] in intervals
        if it does not touch merged, keep it; otherwise absorb it into merged
      intervals = kept intervals plus merged, sorted by start
    if name is removeRange
      for each interval [a, b] in intervals
        if it misses [l, r), keep it; otherwise keep only its parts outside [l, r)
    if name is queryRange
      append whether one interval covers [l, r) to results
  return results`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def range_module_operations(ops):
    intervals = []
    results = []
    for name, l, r in ops:
        if name == 'addRange':
            merged = [l, r]
            kept = []
            for a, b in intervals:
                if b < merged[0] or a > merged[1]:
                    kept.append([a, b])
                else:
                    merged = [min(a, merged[0]), max(b, merged[1])]
            intervals = sorted(kept + [merged])
        elif name == 'removeRange':
            nxt = []
            for a, b in intervals:
                if b <= l or a >= r:
                    nxt.append([a, b])
                else:
                    if a < l:
                        nxt.append([a, l])
                    if b > r:
                        nxt.append([r, b])
            intervals = nxt
        else:
            results.append(any(a <= l and r <= b for a, b in intervals))
    return results`
