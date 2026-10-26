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
  const frames = [{ phase: 'start', delta: [], best: 0, op: null, activeLine: 2, message: 'Empty calendar: maximum overlap 0.' }]
  ops.forEach(([s, e], i) => {
    delta.set(s, (delta.get(s) ?? 0) + 1)
    delta.set(e, (delta.get(e) ?? 0) - 1)
    const points = [...delta.keys()].sort((a, b) => a - b)
    let running = 0, best = 0
    for (const p of points) { running += delta.get(p); best = Math.max(best, running) }
    results.push(best)
    frames.push({ phase: 'add', op: i, attempt: [s, e], delta: points.map(p => [p, delta.get(p)]), best, result: results.slice(), activeLine: 6, message: `[${s}, ${e}) added: the maximum overlap is now ${best}.` })
  })
  frames.push({ phase: 'done', op: ops.length - 1, delta: [...delta.keys()].sort((a, b) => a - b).map(p => [p, delta.get(p)]), best: results.at(-1), result: results, activeLine: 9, message: `Maximum overlaps: [${results.join(', ')}].` })
  return { input: ops, result: results, frames }
}

export const code = `class MyCalendarThree:
    def __init__(self):
        self.delta = defaultdict(int)
    def book(self, start, end):
        self.delta[start] += 1
        self.delta[end] -= 1
        best = running = 0
        for p in sorted(self.delta):
            running += self.delta[p]
            best = max(best, running)
        return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
