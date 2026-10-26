export function parseInput(text) {
  const ops = JSON.parse(text)
  if (!Array.isArray(ops) || ops.length < 1 || ops.length > 500) throw new Error('Enter 1–500 bookings as [start, end) pairs.')
  for (const op of ops) {
    if (!Array.isArray(op) || op.length !== 2 || !Number.isInteger(op[0]) || !Number.isInteger(op[1]) || op[0] < 0 || op[1] > 1000000000 || op[0] >= op[1]) throw new Error('Each booking is [start, end) with 0 ≤ start < end ≤ 1e9.')
  }
  return ops
}

// Keep the bookings that are already double-booked. A new booking is refused if it overlaps any of those overlaps.
export function buildTrace(ops) {
  const booked = []
  const doubled = []
  const results = []
  const frames = [{ phase: 'start', booked: [], doubled: [], op: null, activeLine: 2, message: 'No bookings; no double bookings.' }]
  ops.forEach(([s, e], i) => {
    const clash = doubled.find(([ds, de]) => s < de && ds < e) ?? null
    if (clash) {
      results.push(false)
      frames.push({ phase: 'reject', op: i, booked: booked.map(x => [...x]), doubled: doubled.map(x => [...x]), attempt: [s, e], result: results.slice(), activeLine: 6, message: `[${s}, ${e}) would make a triple booking inside [${clash[0]}, ${clash[1]}).` })
      return
    }
    for (const [bs, be] of booked) {
      const os = Math.max(s, bs), oe = Math.min(e, be)
      if (os < oe) doubled.push([os, oe])
    }
    booked.push([s, e])
    results.push(true)
    frames.push({ phase: 'accept', op: i, booked: booked.map(x => [...x]), doubled: doubled.map(x => [...x]), attempt: [s, e], result: results.slice(), activeLine: 8, message: `[${s}, ${e}) accepted; ${doubled.length} double-booked span${doubled.length === 1 ? '' : 's'}.` })
  })
  frames.push({ phase: 'done', op: ops.length - 1, booked: booked.map(x => [...x]), doubled: doubled.map(x => [...x]), result: results, activeLine: 11, message: `Results: [${results.join(', ')}].` })
  return { input: ops, result: results, frames }
}

export const code = `class MyCalendarTwo:
    def __init__(self):
        self.books, self.overlaps = [], []
    def book(self, start, end):
        for s, e in self.overlaps:
            if start < e and s < end: return False
        for s, e in self.books:
            if start < e and s < end:
                self.overlaps.append((max(s, start), min(e, end)))
        self.books.append((start, end))
        return True`.split('\n').map((text, index) => ({ line: index + 1, text }))
