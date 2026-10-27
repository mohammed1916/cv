export function parseInput(text) {
  const points = JSON.parse(text)
  if (!Array.isArray(points) || points.length < 1 || points.length > 30) throw new Error('Enter 1 to 30 points as [x, y] pairs.')
  const seen = new Set()
  for (const p of points) {
    if (!Array.isArray(p) || p.length !== 2 || !p.every(v => Number.isInteger(v) && v >= 0 && v <= 20)) throw new Error('Each point is [x, y] with integers from 0 to 20.')
    const key = p.join(',')
    if (seen.has(key)) throw new Error('Points must be distinct.')
    seen.add(key)
  }
  return points
}

export function buildTrace(points) {
  const at = new Set(points.map(p => p.join(',')))
  let best = -1
  const frames = [{ phase: 'start', pair: null, corners: null, blocked: null, best, activeLine: L('set best to -1'), message: 'Try each pair of points as opposite corners of a rectangle with sides parallel to the axes.' }]
  for (const [px, py] of points) {
    for (const [qx, qy] of points) {
      if (!(px < qx && py < qy)) continue
      const corners = [[px, py], [qx, qy], [px, qy], [qx, py]]
      if (!at.has(`${px},${qy}`) || !at.has(`${qx},${py}`)) {
        frames.push({ phase: 'pair', pair: [[px, py], [qx, qy]], corners: null, blocked: null, best, activeLine: L('two other corners'), message: `Corners (${px}, ${py}) and (${qx}, ${qy}) need points at (${px}, ${qy}) and (${qx}, ${py}); one is missing.` })
        continue
      }
      const cornerKeys = new Set(corners.map(c => c.join(',')))
      const intruder = points.find(([x, y]) => x >= px && x <= qx && y >= py && y <= qy && !cornerKeys.has(`${x},${y}`))
      if (intruder) {
        frames.push({ phase: 'blocked', pair: [[px, py], [qx, qy]], corners, blocked: intruder, best, activeLine: L('no other point'), message: `Point (${intruder[0]}, ${intruder[1]}) lies on or inside this rectangle, so it is rejected.` })
        continue
      }
      const area = (qx - px) * (qy - py)
      best = Math.max(best, area)
      frames.push({ phase: 'accept', pair: [[px, py], [qx, qy]], corners, blocked: null, best, activeLine: L('set best to the larger'), message: `Rectangle with corners (${px}, ${py}) and (${qx}, ${qy}) is empty of other points; area ${area}.` })
    }
  }
  frames.push({ phase: 'done', pair: null, corners: null, blocked: null, best, activeLine: L('return best'), message: `Largest empty rectangle area: ${best}.` })
  return { input: points, result: best, frames }
}

export const code = `largest rectangle with no other points on or inside its border
  set best to -1
  for each point p and each point q
    if p is strictly left of q and strictly below q then
      if the two other corners of the rectangle are both points then
        if no other point lies inside or on the border then
          set best to the larger of best and the area
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_rectangle_area(points):
    point_set = {(x, y) for x, y in points}
    best = -1
    for px, py in points:
        for qx, qy in points:
            if px < qx and py < qy and (px, qy) in point_set and (qx, py) in point_set:
                corners = {(px, py), (qx, qy), (px, qy), (qx, py)}
                blocked = any(px <= x <= qx and py <= y <= qy and (x, y) not in corners for x, y in points)
                if not blocked:
                    best = max(best, (qx - px) * (qy - py))
    return best
`
