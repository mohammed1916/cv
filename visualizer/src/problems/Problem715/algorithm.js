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
  const frames = [{ phase: 'start', intervals: [], op: null, activeLine: 2, message: 'No tracked ranges yet.' }]
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
    log.push({ name, args: [l, r], returned })
    frames.push({ phase: name, op: i, intervals: intervals.map(x => [...x]), log: log.map(x => ({ ...x })), returned, activeLine: name === 'addRange' ? 5 : name === 'removeRange' ? 8 : 11,
      message: `${name}[${l}, ${r})${returned === null ? '' : ` → ${returned}`}: ${intervals.length} interval${intervals.length === 1 ? '' : 's'} tracked.` })
  })
  frames.push({ phase: 'done', op: ops.length - 1, intervals: intervals.map(x => [...x]), log, activeLine: 13, message: 'All operations complete.' })
  return { input: ops, result: log.filter(x => x.name === 'queryRange').map(x => x.returned), log, frames }
}

export const code = `class RangeModule:
    def __init__(self):
        self.ranges = []  # sorted, disjoint [start, end)
    def addRange(self, left, right):
        merged, out = [left, right], []
        for a, b in self.ranges:
            if b < merged[0] or a > merged[1]: out.append([a, b])
            else: merged = [min(a, merged[0]), max(b, merged[1])]
        self.ranges = sorted(out + [merged])
    def queryRange(self, left, right):
        return any(a <= left and right <= b for a, b in self.ranges)`.split('\n').map((text, index) => ({ line: index + 1, text }))
