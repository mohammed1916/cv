export const phases = [
  { id: 'start', label: 'Boundaries', description: 'Each building adds its height and a count at its start, and removes them at its end.' },
  { id: 'sweep', label: 'Sweep', description: 'Between two boundaries the covering buildings are fixed; their floored average is the segment height.' },
  { id: 'merge', label: 'Merge neighbours', description: 'Touching segments with the same average are merged into one segment.' },
  { id: 'done', label: 'Result', description: 'Return the segments that have at least one building.' },
]

export const code = `function averageHeightSegments(buildings) {
  const change = new Map()
  for (const [start, end, height] of buildings) {
    const a = change.get(start) ?? [0, 0]
    a[0] += height
    a[1] += 1
    change.set(start, a)
    const b = change.get(end) ?? [0, 0]
    b[0] -= height
    b[1] -= 1
    change.set(end, b)
  }
  const points = [...change.keys()].sort((x, y) => x - y)
  const segments = []
  let sum = 0
  let count = 0
  for (let i = 0; i < points.length; i++) {
    const p = points[i]
    sum += change.get(p)[0]
    count += change.get(p)[1]
    if (count > 0 && i + 1 < points.length) {
      const avg = Math.floor(sum / count)
      const right = points[i + 1]
      const last = segments[segments.length - 1]
      if (last && last[1] === p && last[2] === avg) last[1] = right
      else segments.push([p, right, avg])
    }
  }
  return segments
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def average_height_segments(buildings):
    change = {}
    for start, end, height in buildings:
        a = change.get(start, [0, 0])
        a[0] += height
        a[1] += 1
        change[start] = a
        b = change.get(end, [0, 0])
        b[0] -= height
        b[1] -= 1
        change[end] = b
    points = sorted(change)
    segments = []
    total = 0
    count = 0
    for i, p in enumerate(points):
        total += change[p][0]
        count += change[p][1]
        if count > 0 and i + 1 < len(points):
            avg = total // count
            right = points[i + 1]
            if segments and segments[-1][1] == p and segments[-1][2] == avg:
                segments[-1][1] = right
            else:
                segments.append([p, right, avg])
    return segments
`

const C = fragment => code.findIndex(c => c.text.includes(fragment)) + 1
const P = fragment => python.split('\n').findIndex(line => line.includes(fragment)) + 1

export function parseInput(text) {
  let buildings
  try { buildings = JSON.parse(text) } catch { throw new Error('Use a JSON array of [start, end, height] triples.') }
  if (!Array.isArray(buildings) || buildings.length < 1 || buildings.length > 10) throw new Error('Give 1 to 10 buildings here.')
  for (const b of buildings) {
    if (!Array.isArray(b) || b.length !== 3 || !b.every(Number.isInteger)) throw new Error('Each building is [start, end, height] with whole numbers.')
    if (b[0] < 1 || b[1] > 30 || b[0] >= b[1] || b[2] < 1 || b[2] > 30) throw new Error('Use 1 <= start < end <= 30 and heights from 1 to 30.')
  }
  return buildings
}

export function buildTrace(buildings) {
  const frames = []
  const change = new Map()
  for (const [start, end, height] of buildings) {
    const a = change.get(start) ?? [0, 0]
    a[0] += height
    a[1] += 1
    change.set(start, a)
    const b = change.get(end) ?? [0, 0]
    b[0] -= height
    b[1] -= 1
    change.set(end, b)
  }
  const points = [...change.keys()].sort((x, y) => x - y)
  const segments = []
  let sum = 0
  let count = 0
  const add = (phase, c, p, message, point, segs) => frames.push({
    phase, activeLine: C(c), pythonLine: P(p), message,
    snapshot: { buildings, points, point, segments: segs, sum, count },
  })
  add('start', 'const change = new Map', 'change = {}', `${points.length} boundary positions to sweep.`, null, segments.slice())
  for (let i = 0; i < points.length; i++) {
    const p = points[i]
    sum += change.get(p)[0]
    count += change.get(p)[1]
    add('sweep', 'sum += change.get(p)', 'total += change[p][0]', `At ${p}: ${count} building(s) cover the next stretch.`, p, segments.slice())
    if (count > 0 && i + 1 < points.length) {
      const avg = Math.floor(sum / count)
      const right = points[i + 1]
      const last = segments[segments.length - 1]
      if (last && last[1] === p && last[2] === avg) {
        last[1] = right
        add('merge', 'last[1] = right', 'segments[-1][1] = right', `Extend the segment to ${right}; its average stays ${avg}.`, p, segments.slice())
      } else {
        segments.push([p, right, avg])
        add('merge', 'segments.push', 'segments.append', `New segment [${p}, ${right}) with average ${avg}.`, p, segments.slice())
      }
    }
  }
  add('done', 'return segments', 'return segments', `${segments.length} segment(s) describe the street.`, null, segments.slice())
  return { input: buildings, result: segments, frames }
}
