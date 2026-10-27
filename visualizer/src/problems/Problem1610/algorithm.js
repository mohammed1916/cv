const toDegrees = rad => rad * (180 / Math.PI)

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Enter an object with points, angle, and location.')
  const { points, angle, location } = input
  if (!Array.isArray(points) || points.length < 1 || points.length > 12) throw new Error('Enter 1 to 12 points as [x, y] pairs.')
  for (const p of points) if (!Array.isArray(p) || p.length !== 2 || !p.every(v => Number.isInteger(v) && Math.abs(v) <= 10)) throw new Error('Each point is [x, y] with integers from -10 to 10.')
  if (!Number.isInteger(angle) || angle < 0 || angle > 360) throw new Error('angle is an integer from 0 to 360.')
  if (!Array.isArray(location) || location.length !== 2 || !location.every(v => Number.isInteger(v) && Math.abs(v) <= 10)) throw new Error('location is [x, y] with integers from -10 to 10.')
  return { points, angle, location }
}

const EPS = 1e-9

export function buildTrace({ points, angle, location }) {
  const [lx, ly] = location
  let same = 0
  const raw = []
  for (const [x, y] of points) {
    if (x === lx && y === ly) same++
    else raw.push(toDegrees(Math.atan2(y - ly, x - lx)))
  }
  const angles = raw.slice().sort((a, b) => a - b)
  const doubled = [...angles, ...angles.map(a => a + 360)]
  const n = angles.length
  let best = 0, left = 0
  const frames = [{ phase: 'start', left: 0, right: -1, start: null, count: 0, best, same, activeLine: L('set best to 0'), message: `${same} point(s) sit exactly at the viewer and are always visible.` }]
  for (let right = 0; right < doubled.length; right++) {
    while (doubled[right] - doubled[left] > angle + EPS) left++
    const count = Math.min(right - left + 1, n)
    best = Math.max(best, count)
    frames.push({ phase: 'window', left, right, start: n ? ((doubled[left] % 360) + 360) % 360 : null, count, best, same, activeLine: L('set best to the larger'), message: `Window from angle ${doubled[left].toFixed(1)} to ${doubled[right].toFixed(1)} holds ${count} point(s). Best so far: ${best}.` })
  }
  const result = best + same
  frames.push({ phase: 'done', left: null, right: null, start: null, count: best, best, same, activeLine: L('return best plus'), message: `Most visible points: ${result}.` })
  return { input: { points, angle, location }, result, frames }
}

export const code = `maximum visible points from a location within a view angle
  set same to the number of points at the location
  set angles to an empty list
  for each other point, add its angle from the location in degrees to angles
  sort angles, then append each angle plus 360 to the end
  set best to 0 and left to 0
  for right from 0 to the last index
    while angles[right] minus angles[left] is more than the view angle
      move left forward by one
    set best to the larger of best and the window size, capped at the point count
  return best plus same`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `import math

def max_visible_points(points, angle, location):
    same = 0
    lx, ly = location
    angles = []
    for x, y in points:
        if x == lx and y == ly:
            same += 1
        else:
            angles.append(math.degrees(math.atan2(y - ly, x - lx)))
    angles.sort()
    n = len(angles)
    doubled = angles + [a + 360 for a in angles]
    best = left = 0
    for right in range(len(doubled)):
        while doubled[right] - doubled[left] > angle + 1e-9:
            left += 1
        best = max(best, min(right - left + 1, n))
    return best + same
`
