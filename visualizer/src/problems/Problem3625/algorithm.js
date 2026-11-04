const MAX_POINTS = 10
const MIN_POINTS = 4
const LIMIT = 1000

export const phases = [
  { id: 'start', label: 'Start', description: 'The points, with both tables empty.' },
  { id: 'pair', label: 'Pair', description: 'Reduce a pair of points to its direction and its line.' },
  { id: 'lines', label: 'Line table', description: 'Count the segment under its direction and line.' },
  { id: 'mids', label: 'Midpoint table', description: 'Count the segment under its midpoint and direction.' },
  { id: 'count', label: 'Parallel pairs', description: 'Same direction on different lines gives one trapezoid per pair of segments.' },
  { id: 'subtract', label: 'Parallelograms', description: 'Diagonals share a midpoint; each such shape was counted twice.' },
  { id: 'done', label: 'Result', description: 'Parallel pairs minus parallelograms.' },
]

export const code = `count trapezoids among the points
  for every pair of points
    reduce its direction to lowest terms, pointing a fixed way
    identify its line within that direction by an offset
    add one to the table direction -> line
    add one to the table midpoint -> direction
  for each direction
    seen = 0
    for each line of that direction, holding count segments
      add seen * count to total: each new segment pairs with each earlier one
      add count to seen
  for each midpoint
    seen = 0
    for each direction at that midpoint, holding count segments
      subtract seen * count from total: each such pair is a parallelogram
      add count to seen
  return total`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `from collections import defaultdict
from math import gcd


def count_trapezoids(points):
    lines = defaultdict(lambda: defaultdict(int))
    mids = defaultdict(lambda: defaultdict(int))
    for i in range(len(points)):
        x1, y1 = points[i]
        for j in range(i + 1, len(points)):
            x2, y2 = points[j]
            dx, dy = x2 - x1, y2 - y1
            g = gcd(dx, dy)
            dx, dy = dx // g, dy // g
            if dx < 0 or (dx == 0 and dy < 0):
                dx, dy = -dx, -dy
            offset = dx * y1 - dy * x1
            lines[(dx, dy)][offset] += 1
            mids[(x1 + x2, y1 + y2)][(dx, dy)] += 1
    total = 0
    for groups in lines.values():
        seen = 0
        for count in groups.values():
            total += seen * count
            seen += count
    for groups in mids.values():
        seen = 0
        for count in groups.values():
            total -= seen * count
            seen += count
    return total
`

const lineOf = (lines, s) => {
  const index = lines.findIndex(text => text.includes(s))
  if (index < 0) throw new Error(`Code line missing: ${s}`)
  return index + 1
}
const pythonLines = python.trim().split('\n')
const L = s => lineOf(code.map(c => c.text), s)
const P = s => lineOf(pythonLines, s)

const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a }

function fraction(top, bottom) {
  if (top === 0) return '0'
  const g = gcd(top, bottom)
  const a = top / g, b = bottom / g
  return b === 1 ? `${a}` : `${a}/${b}`
}
const half = value => (value % 2 === 0 ? `${value / 2}` : `${value}/2`)

function describeSlope(dx, dy) {
  if (dx === 0) return 'vertical'
  if (dy === 0) return 'flat (0)'
  return `slope ${fraction(dy, dx)}`
}
function describeLine(dx, dy, offset) {
  if (dx === 0) return `x = ${-offset + 0}`
  const slope = dy === 0 ? '' : `${fraction(dy, dx)}x`
  const shift = fraction(offset, dx)
  if (!slope) return `y = ${shift}`
  if (shift === '0') return `y = ${slope}`
  return shift.startsWith('-') ? `y = ${slope} - ${shift.slice(1)}` : `y = ${slope} + ${shift}`
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with points.')
  const { points } = input
  if (!Array.isArray(points) || points.length < MIN_POINTS || points.length > MAX_POINTS) throw new Error(`points has ${MIN_POINTS} to ${MAX_POINTS} entries here.`)
  const seen = new Set()
  for (const point of points) {
    if (!Array.isArray(point) || point.length !== 2 || !point.every(v => Number.isInteger(v) && Math.abs(v) <= LIMIT)) throw new Error(`Each point is [x, y] with integers from -${LIMIT} to ${LIMIT}.`)
    const key = point.join(',')
    if (seen.has(key)) throw new Error(`Point (${key}) appears twice; points are distinct.`)
    seen.add(key)
  }
  return { points }
}

export function buildTrace({ points }) {
  const frames = []
  const lineTable = new Map()
  const midTable = new Map()
  const segments = []
  let lineRows = []
  let midRows = []
  let total = 0

  const rowsOfLines = () => [...lineTable.values()].flatMap(group => [...group.lines.values()].map(entry => ({ direction: group.label, line: entry.label, segments: entry.members.length, key: entry.key })))
  const rowsOfMids = () => [...midTable.values()].flatMap(group => [...group.slopes.values()].map(entry => ({ midpoint: group.label, direction: entry.label, segments: entry.members.length, key: entry.key })))
  const push = fields => frames.push({ recorded: segments.length, current: null, earlier: [], active: [], extended: [], shapes: [], midpoint: null, lineRows, midRows, activeLineRow: -1, activeMidRow: -1, total, seen: null, count: null, ...fields })

  push({ phase: 'start', activeLine: L('count trapezoids'), pythonLine: P('def count_trapezoids'), message: `${points.length} points give ${points.length * (points.length - 1) / 2} segments to classify.` })

  for (let i = 0; i < points.length; i++) {
    const [x1, y1] = points[i]
    for (let j = i + 1; j < points.length; j++) {
      const [x2, y2] = points[j]
      let dx = x2 - x1, dy = y2 - y1
      const rawDx = dx, rawDy = dy
      const g = gcd(dx, dy)
      dx /= g; dy /= g
      if (dx < 0 || (dx === 0 && dy < 0)) { dx = -dx; dy = -dy }
      dx += 0; dy += 0
      const offset = dx * y1 - dy * x1 + 0
      const slopeKey = `${dx},${dy}`
      const lineKey = `${slopeKey}|${offset}`
      const midKey = `${x1 + x2},${y1 + y2}`
      const segment = { a: i, b: j, dx, dy, offset, slopeKey, lineKey, midKey }
      const slopeLabel = describeSlope(dx, dy)
      const lineLabel = describeLine(dx, dy, offset)
      const midLabel = `(${half(x1 + x2)}, ${half(y1 + y2)})`
      push({ phase: 'pair', current: segment, extended: [segment], activeLine: L('reduce its direction'), pythonLine: P('offset = dx * y1'), message: `P${i} to P${j} moves (${rawDx}, ${rawDy}), which is ${slopeLabel}, on the line ${lineLabel}.` })

      segments.push(segment)
      if (!lineTable.has(slopeKey)) lineTable.set(slopeKey, { label: slopeLabel, lines: new Map() })
      const slopeGroup = lineTable.get(slopeKey)
      if (!slopeGroup.lines.has(lineKey)) slopeGroup.lines.set(lineKey, { label: lineLabel, members: [], key: lineKey })
      slopeGroup.lines.get(lineKey).members.push(segment)
      lineRows = rowsOfLines()
      push({ phase: 'lines', current: segment, activeLineRow: lineRows.findIndex(row => row.key === lineKey), activeLine: L('direction -> line'), pythonLine: P('lines[(dx, dy)][offset] += 1'), message: `The line ${lineLabel} now holds ${slopeGroup.lines.get(lineKey).members.length} segment(s).` })

      if (!midTable.has(midKey)) midTable.set(midKey, { label: midLabel, slopes: new Map() })
      const midGroup = midTable.get(midKey)
      const midSlopeKey = `${midKey}|${slopeKey}`
      if (!midGroup.slopes.has(midSlopeKey)) midGroup.slopes.set(midSlopeKey, { label: slopeLabel, members: [], key: midSlopeKey })
      midGroup.slopes.get(midSlopeKey).members.push(segment)
      midRows = rowsOfMids()
      push({ phase: 'mids', current: segment, midpoint: [(x1 + x2) / 2, (y1 + y2) / 2], activeMidRow: midRows.findIndex(row => row.key === midSlopeKey), activeLine: L('midpoint -> direction'), pythonLine: P('mids[(x1 + x2, y1 + y2)]'), message: `Its midpoint is ${midLabel}.` })
    }
  }

  const singleLine = [...lineTable.values()].filter(group => group.lines.size < 2).length
  push({ phase: 'count', activeLine: L('for each direction'), pythonLine: P('total = 0'), message: singleLine === lineTable.size ? 'No direction has two different lines, so no parallel sides exist.' : `${singleLine} of ${lineTable.size} directions have only one line and add nothing. The rest are walked next.` })
  for (const group of lineTable.values()) {
    if (group.lines.size < 2) continue
    let seen = 0
    let earlier = []
    for (const entry of group.lines.values()) {
      const count = entry.members.length
      const added = seen * count
      total += added
      push({ phase: 'count', active: entry.members, earlier, extended: [...earlier, ...entry.members], activeLineRow: lineRows.findIndex(row => row.key === entry.key), seen, count, activeLine: L('add seen * count to total'), pythonLine: P('total += seen * count'), message: seen === 0 ? `${group.label}: the first line, ${entry.label}, has nothing earlier to pair with.` : `${group.label}: ${count} segment(s) on ${entry.label} pair with ${seen} on earlier lines, adding ${added}. Total ${total}.` })
      seen += count
      earlier = [...earlier, ...entry.members]
    }
  }

  const singleSlope = [...midTable.values()].filter(group => group.slopes.size < 2).length
  push({ phase: 'subtract', activeLine: L('for each midpoint'), pythonLine: P('for groups in mids.values()'), message: singleSlope === midTable.size ? 'No two segments of different directions share a midpoint, so there are no parallelograms.' : `${singleSlope} of ${midTable.size} midpoints hold one direction and subtract nothing. The rest are walked next.` })
  for (const group of midTable.values()) {
    if (group.slopes.size < 2) continue
    let seen = 0
    let earlier = []
    for (const entry of group.slopes.values()) {
      const count = entry.members.length
      const removed = seen * count
      total -= removed
      const shapes = earlier.flatMap(first => entry.members.map(second => [first.a, second.a, first.b, second.b]))
      const [m] = entry.members
      const mid = [(points[m.a][0] + points[m.b][0]) / 2, (points[m.a][1] + points[m.b][1]) / 2]
      push({ phase: 'subtract', active: entry.members, earlier, shapes, midpoint: mid, activeMidRow: midRows.findIndex(row => row.key === entry.key), seen, count, activeLine: L('subtract seen * count'), pythonLine: P('total -= seen * count'), message: seen === 0 ? `At ${group.label}, this is the first direction, so there is no earlier diagonal yet.` : `At ${group.label}, these diagonals bisect ${seen} earlier one(s): ${removed} parallelogram(s), each counted once per pair of parallel sides. Subtract ${removed}. Total ${total}.` })
      seen += count
      earlier = [...earlier, ...entry.members]
    }
  }

  push({ phase: 'done', activeLine: L('return total'), pythonLine: P('return total'), message: `There ${total === 1 ? 'is 1 trapezoid' : `are ${total} trapezoids`}.` })
  return { input: { points }, result: total, frames, segments }
}
