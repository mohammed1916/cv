export function parseInput(text) {
  const points = JSON.parse(text)
  if (!Array.isArray(points) || points.length < 2 || points.length > 12) throw new Error('Use a JSON array of 2 to 12 points in this trace.')
  const seen = new Set()
  for (const p of points) {
    if (!Array.isArray(p) || p.length !== 2 || !p.every(v => Number.isInteger(v) && v >= 0 && v <= 50)) throw new Error('Each point is [x, y] with integers from 0 to 50.')
    const key = p.join(',')
    if (seen.has(key)) throw new Error('Points must be distinct.')
    seen.add(key)
  }
  return points
}

export function buildTrace(points) {
  const frames = []
  const pts = [...points].sort((p, q) => p[0] - q[0] || q[1] - p[1])
  const n = pts.length
  let count = 0
  frames.push({ pythonLine: 2, phase: 'start', activeLine: L('sort the points by x ascending'), a: null, b: null, topBlock: null, count, message: `Sorted by x ascending, then y descending.` })
  for (let i = 0; i < n; i++) {
    const ay = pts[i][1]
    let topBlock = -Infinity
    frames.push({ pythonLine: 7, phase: 'row', activeLine: L('for each later point b'), a: pts[i], b: null, topBlock, count, message: `Alice at (${pts[i][0]},${ay}); sweep the points after it.` })
    for (let j = i + 1; j < n; j++) {
      const by = pts[j][1]
      if (by > ay) {
        frames.push({ pythonLine: 11, phase: 'above', activeLine: L('if b is above a, skip it'), a: pts[i], b: pts[j], topBlock, count, message: `(${pts[j][0]},${by}) is above Alice, so it is skipped.` })
        continue
      }
      if (by > topBlock) {
        count += 1
        frames.push({ pythonLine: 13, phase: 'count', activeLine: L('if b is higher than top_block, count it'), a: pts[i], b: pts[j], topBlock, count, message: `Nothing earlier sits between heights ${by} and ${ay}; count it.` })
      } else {
        frames.push({ pythonLine: 14, phase: 'block', activeLine: L('top_block = the larger'), a: pts[i], b: pts[j], topBlock, count, message: `An earlier point at height ${topBlock} blocks this fence.` })
      }
      topBlock = Math.max(topBlock, by)
    }
  }
  frames.push({ pythonLine: 15, phase: 'done', activeLine: L('return count'), a: null, b: null, topBlock: null, count, message: `${count} valid pairs.` })
  return { input: points, result: count, frames }
}

export const code = `count pairs where Alice is upper-left of Bob with an empty fence
  sort the points by x ascending, then y descending
  count = 0
  for each point a in sorted order
    top_block = negative infinity
    for each later point b
      if b is above a, skip it
      if b is higher than top_block, count it
      top_block = the larger of top_block and b's height
  return count`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_pairs(points):
    pts = sorted(points, key=lambda p: (p[0], -p[1]))
    count = 0
    n = len(pts)
    for i in range(n):
        ay = pts[i][1]
        top_block = float("-inf")
        for j in range(i + 1, n):
            by = pts[j][1]
            if by > ay:
                continue
            if by > top_block:
                count += 1
            top_block = max(top_block, by)
    return count
`
