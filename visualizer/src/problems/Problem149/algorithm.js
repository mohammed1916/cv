export const phases = [
  { id: 'start', label: 'Start', description: 'Check the small cases, where every point lies on some line.' },
  { id: 'anchor', label: 'Choose anchor', description: 'Fix one point and group the later points by their direction from it.' },
  { id: 'direction', label: 'Count direction', description: 'Reduce the offset to a canonical direction and add one to its bucket.' },
  { id: 'best', label: 'Best for anchor', description: 'The largest bucket plus the anchor is the most points on one line through this anchor.' },
  { id: 'done', label: 'Complete', description: 'Return the largest count found over all anchors.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object such as {"points": [[1, 1], [2, 3]]}.')
  const { points } = input
  if (!Array.isArray(points) || points.length < 1 || points.length > 30 || !points.every(p => Array.isArray(p) && p.length === 2 && p.every(v => Number.isInteger(v) && Math.abs(v) <= 100))) throw new Error('points is a list of 1 to 30 [x, y] integer pairs with coordinates from -100 to 100.')
  if (new Set(points.map(p => p.join(','))).size !== points.length) throw new Error('Each point must be distinct in this model.')
  return { points }
}

const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b))

export function buildTrace({ points }) {
  const at = n => ({ activeLine: n, pythonLine: n })
  const snap = (anchor, other, key, slopes, best) => ({ anchor, other, key, slopes: [...slopes].map(([k, count]) => ({ key: k, count })), best })
  if (points.length <= 2) {
    const small = snap(null, null, null, new Map(), points.length)
    return {
      input: { points }, result: points.length,
      frames: [
        { phase: 'start', ...at(3), snapshot: small, message: `Only ${points.length} point(s), so every point lies on a line.` },
        { phase: 'done', ...at(4), snapshot: small, message: `Return ${points.length}.` },
      ],
    }
  }
  let best = 2
  const frames = [{ phase: 'start', ...at(5), snapshot: snap(null, null, null, new Map(), best), message: 'Any two distinct points define a line, so the best is at least 2.' }]
  points.forEach(([x1, y1], i) => {
    const slopes = new Map()
    frames.push({ phase: 'anchor', ...at(7), snapshot: snap(i, null, null, slopes, best), message: `Anchor ${i} at (${x1}, ${y1}). Group the later points by direction from it.` })
    points.slice(i + 1).forEach(([x2, y2], offset) => {
      const other = i + 1 + offset
      let dx = x2 - x1
      let dy = y2 - y1
      const g = gcd(Math.abs(dx), Math.abs(dy))
      dx /= g
      dy /= g
      if (dx < 0 || (dx === 0 && dy < 0)) { dx = -dx; dy = -dy }
      const key = `${dx},${dy}`
      slopes.set(key, (slopes.get(key) ?? 0) + 1)
      frames.push({ phase: 'direction', ...at(14), snapshot: snap(i, other, key, slopes, best), message: `Point ${other} lies in direction ${key} from anchor ${i}. That bucket now holds ${slopes.get(key)}.` })
    })
    const top = Math.max(0, ...slopes.values())
    best = Math.max(best, top + 1)
    frames.push({ phase: 'best', ...at(15), snapshot: snap(i, null, null, slopes, best), message: `Largest bucket plus the anchor is ${top + 1}. Best so far: ${best}.` })
  })
  frames.push({ phase: 'done', ...at(16), snapshot: snap(null, null, null, new Map(), best), message: `Return ${best}.` })
  return { input: { points }, result: best, frames }
}

const pseudo = [
  'use gcd from the math library',
  'max points on line(points):',
  '  if there are at most two points:',
  '    return their count',
  '  best = 2',
  '  for each anchor index i with point p:',
  '    slopes = empty map',
  '    for each later point q after p:',
  '      dx, dy = q - p',
  '      g = gcd(|dx|, |dy|)',
  '      dx, dy = dx / g, dy / g',
  '      if dx < 0 or (dx == 0 and dy < 0):',
  '        negate dx and dy',
  '      slopes[(dx, dy)] += 1',
  '    best = max(best, largest slopes count + 1)',
  '  return best',
]

const pythonLines = [
  'import math',
  'def max_points(points):',
  '    if len(points) <= 2:',
  '        return len(points)',
  '    best = 2',
  '    for i, (x1, y1) in enumerate(points):',
  '        slopes = {}',
  '        for x2, y2 in points[i + 1:]:',
  '            dx, dy = x2 - x1, y2 - y1',
  '            g = math.gcd(abs(dx), abs(dy))',
  '            dx, dy = dx // g, dy // g',
  '            if dx < 0 or (dx == 0 and dy < 0):',
  '                dx, dy = -dx, -dy',
  '            slopes[(dx, dy)] = slopes.get((dx, dy), 0) + 1',
  '        best = max(best, max(slopes.values(), default=0) + 1)',
  '    return best',
]

export const code = pseudo.map((text, index) => ({ line: index + 1, text }))
export const python = pythonLines.join('\n')
