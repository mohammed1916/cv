export function parseInput(text) {
  const points = JSON.parse(text)
  if (!Array.isArray(points) || points.length < 2 || points.length > 10) throw new Error('Use a JSON array of 2 to 10 points.')
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
  let count = 0
  frames.push({ pythonLine: 2, phase: 'start', activeLine: L('let count = 0'), a: null, b: null, count, message: `Check every ordered pair of ${points.length} points.` })
  for (const [ax, ay] of points) {
    for (const [bx, by] of points) {
      if (ax === bx && ay === by) continue
      if (!(ax <= bx && ay >= by)) {
        frames.push({ pythonLine: 7, phase: 'skip', activeLine: L('if (ax <= bx && ay >= by)'), a: [ax, ay], b: [bx, by], count, message: `(${ax},${ay}) is not upper-left of (${bx},${by}).` })
        continue
      }
      let blocker = null
      for (const [px, py] of points) {
        if ((px === ax && py === ay) || (px === bx && py === by)) continue
        if (ax <= px && px <= bx && by <= py && py <= ay) { blocker = [px, py]; break }
      }
      if (blocker) {
        frames.push({ pythonLine: 13, phase: 'blocked', activeLine: L('if (ax <= px && px <= bx'), a: [ax, ay], b: [bx, by], blocker, count, message: `(${blocker[0]},${blocker[1]}) lies in the fence, so this pair fails.` })
      } else {
        count += 1
        frames.push({ pythonLine: 16, phase: 'count', activeLine: L('if (!blocked) count += 1'), a: [ax, ay], b: [bx, by], count, message: `The fence from (${ax},${ay}) to (${bx},${by}) is empty; count it.` })
      }
    }
  }
  frames.push({ pythonLine: 17, phase: 'done', activeLine: L('return count'), a: null, b: null, count, message: `${count} valid pairs.` })
  return { input: points, result: count, frames }
}

export const code = `function countPairs(points) {
  let count = 0
  for (const [ax, ay] of points) {
    for (const [bx, by] of points) {
      if (ax === bx && ay === by) continue
      if (ax <= bx && ay >= by) {
        let blocked = false
        for (const [px, py] of points) {
          if ((px === ax && py === ay) || (px === bx && py === by)) continue
          if (ax <= px && px <= bx && by <= py && py <= ay) { blocked = true; break }
        }
        if (!blocked) count += 1
      }
    }
  }
  return count
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_pairs(points):
    count = 0
    for ax, ay in points:
        for bx, by in points:
            if (ax, ay) == (bx, by):
                continue
            if ax <= bx and ay >= by:
                blocked = False
                for px, py in points:
                    if (px, py) in ((ax, ay), (bx, by)):
                        continue
                    if ax <= px <= bx and by <= py <= ay:
                        blocked = True
                        break
                if not blocked:
                    count += 1
    return count
`
