const MOD = 1000000007n
export function parseInput(text) {
  const r = JSON.parse(text)
  if (!Array.isArray(r) || r.length < 1 || r.length > 12 || !r.every(q => Array.isArray(q) && q.length === 4 && q.every(v => Number.isInteger(v) && v >= 0 && v <= 1000000000) && q[0] < q[2] && q[1] < q[3])) {
    throw new Error('Enter a JSON array of 1-12 rectangles [x1,y1,x2,y2] with 0 <= coordinates <= 1,000,000,000, x1 < x2 and y1 < y2 (visualization cap: 12 rectangles).')
  }
  return r
}
export function buildTrace(rects) {
  const xs = [...new Set(rects.flatMap(([x1, , x2]) => [x1, x2]))].sort((a, b) => a - b)
  let total = 0n
  const frames = [{ phase: 'start', activeLine: 2, slab: -1, xs, intervals: [], merged: [], covered: 0, total: '0', message: `The ${rects.length} rectangles have ${xs.length} distinct x edges: ${xs.join(', ')}. Between consecutive edges, every rectangle either spans the whole slab or misses it.` }]
  for (let i = 0; i + 1 < xs.length; i++) {
    const x1 = xs[i], x2 = xs[i + 1]
    const intervals = rects.filter(([a, , b]) => a <= x1 && x2 <= b).map(([, y1, , y2]) => [y1, y2]).sort((p, q) => p[0] - q[0] || p[1] - q[1])
    frames.push({ phase: 'slab', activeLine: 6, slab: i, xs, intervals, merged: [], covered: 0, total: String(total), message: `Slab x in [${x1}, ${x2}] (width ${x2 - x1}): ${intervals.length} rectangle${intervals.length === 1 ? '' : 's'} span it, with y-intervals ${intervals.length ? intervals.map(([a, b]) => `[${a},${b}]`).join(' ') : 'none'}.` })
    let covered = 0, top = 0
    const merged = []
    for (const [a, b] of intervals) {
      const lo = Math.max(a, top)
      if (b > lo) { covered += b - lo; top = b; if (merged.length && merged[merged.length - 1][1] === lo) merged[merged.length - 1][1] = b; else merged.push([lo, b]) }
    }
    total += BigInt(covered) * BigInt(x2 - x1)
    frames.push({ phase: 'cover', activeLine: 13, slab: i, xs, intervals, merged: merged.map(m => [...m]), covered, total: String(total), message: `Sorted by y and clipped against the highest y already counted, the union covers ${covered} of the y-axis. Slab area = ${covered} x ${x2 - x1}; running total ${total}.` })
  }
  const result = Number(total % MOD)
  frames.push({ phase: 'done', activeLine: 14, slab: -1, xs, intervals: [], merged: [], covered: 0, total: String(total), message: `Total union area ${total}; modulo 1,000,000,007 gives ${result}.` })
  return { input: rects.map(r => [...r]), result, xs, frames }
}
export const code = `def rectangleArea(rectangles):
    xs = sorted({x for x1, y1, x2, y2 in rectangles for x in (x1, x2)})
    total = 0
    for i in range(len(xs) - 1):
        x1, x2 = xs[i], xs[i + 1]
        intervals = sorted((y1, y2) for a, y1, b, y2 in rectangles if a <= x1 and x2 <= b)
        covered, top = 0, 0
        for y1, y2 in intervals:
            y1 = max(y1, top)
            if y2 > y1:
                covered += y2 - y1
                top = y2
        total += covered * (x2 - x1)
    return total % (10**9 + 7)`.split('\n').map((text, index) => ({ line: index + 1, text }))
