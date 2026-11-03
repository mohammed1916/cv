export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with points and k.')
  const { points, k } = input
  if (!Array.isArray(points) || points.length < 1 || points.length > 8) throw new Error('points lists 1 to 8 [x, y] entries in this visualization.')
  for (const p of points) {
    if (!Array.isArray(p) || p.length !== 2 || !p.every(v => Number.isInteger(v) && v >= -10 && v <= 10)) throw new Error('Each point is an integer [x, y] with coordinates from -10 to 10.')
  }
  if (!Number.isInteger(k) || k < 1 || k > points.length) throw new Error('k is an integer from 1 to the number of points.')
  return { points, k }
}

export function buildTrace({ points, k }) {
  const xs = points.map(([x]) => x), ys = points.map(([, y]) => y)
  const box = { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) }
  const frames = []
  let low = 0
  let high = (box.x1 - box.x0) + (box.y1 - box.y0)
  frames.push({
    pythonLine: P('low, high ='), phase: 'start', activeLine: L('set low to 0'), points, k, box,
    low, high, mid: null, day: null, cell: null, members: [], count: null, covered: null,
    message: `Days from ${low} to ${high} are possible. Every variant reaches a cell within a bounding-box diagonal of ${high} days.`,
  })
  let result = high
  while (low < high) {
    const mid = Math.floor((low + high) / 2)
    frames.push({
      pythonLine: P('mid ='), phase: 'probe', activeLine: L('set mid to'), points, k, box,
      low, high, mid, day: mid, cell: null, members: [], count: null, covered: null,
      message: `Test day ${mid}: can k variants share one cell by then?`,
    })
    let covered = false
    let bestCell = null, bestCount = -1, bestMembers = []
    cells: for (let cx = box.x0; cx <= box.x1; cx += 1) {
      for (let cy = box.y0; cy <= box.y1; cy += 1) {
        const members = []
        points.forEach(([px, py], i) => { if (Math.abs(cx - px) + Math.abs(cy - py) <= mid) members.push(i) })
        const count = members.length
        if (count > bestCount) { bestCount = count; bestCell = [cx, cy]; bestMembers = members }
        const hit = count >= k
        frames.push({
          pythonLine: P('count = 0'), phase: hit ? 'hit' : 'cell', activeLine: L('count the variants whose'), points, k, box,
          low, high, mid, day: mid, cell: [cx, cy], members, count, covered: hit,
          message: `Cell (${cx}, ${cy}) is within ${mid} steps of ${count} variant${count === 1 ? '' : 's'}${hit ? `, which reaches ${k}.` : `, short of ${k}.`}`,
        })
        if (hit) { covered = true; bestCell = [cx, cy]; bestCount = count; bestMembers = members; break cells }
      }
    }
    if (covered) {
      high = mid
      frames.push({
        pythonLine: P('high = mid'), phase: 'covered', activeLine: L('then high = mid'), points, k, box,
        low, high, mid, day: mid, cell: bestCell, members: bestMembers, count: bestCount, covered: true,
        message: `Day ${mid} works, so the answer is at most ${mid}.`,
      })
    } else {
      low = mid + 1
      frames.push({
        pythonLine: P('low = mid + 1'), phase: 'short', activeLine: L('otherwise low = mid plus 1'), points, k, box,
        low, high, mid, day: mid, cell: bestCell, members: bestMembers, count: bestCount, covered: false,
        message: `No cell gathers ${k} variants by day ${mid}. The answer is later than ${mid}.`,
      })
    }
  }
  result = low
  frames.push({
    pythonLine: P('return low'), phase: 'done', activeLine: L('return low'), points, k, box,
    low, high, mid: null, day: result, cell: null, members: [], count: null, covered: null,
    message: `The earliest day is ${result}.`,
  })
  return { input: { points, k }, result, frames }
}

export const code = `minimum day for k variants to share a cell
  set the bounding box of all points
  set low to 0 and high to the box width plus the box height
  while low is less than high
    set mid to the floor of the average of low and high
    covered is false
    for each cell in the bounding box
      count the variants whose Manhattan distance to the cell is at most mid
      if the count is at least k then covered is true and stop scanning
    if covered then high = mid
    otherwise low = mid plus 1
  return low`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = s => {
  const i = code.findIndex(c => c.text.includes(s))
  if (i < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return i + 1
}

export const python = `def min_day_for_k_variants(points, k):
    xs = [x for x, _ in points]
    ys = [y for _, y in points]
    x0, x1, y0, y1 = min(xs), max(xs), min(ys), max(ys)
    low, high = 0, (x1 - x0) + (y1 - y0)
    while low < high:
        mid = (low + high) // 2
        if covers(points, k, mid, x0, x1, y0, y1):
            high = mid
        else:
            low = mid + 1
    return low

def covers(points, k, day, x0, x1, y0, y1):
    for cx in range(x0, x1 + 1):
        for cy in range(y0, y1 + 1):
            count = 0
            for px, py in points:
                if abs(cx - px) + abs(cy - py) <= day:
                    count += 1
            if count >= k:
                return True
    return False
`
const pyLines = python.split('\n')
function P(s) {
  const i = pyLines.findIndex(c => c.includes(s))
  if (i < 0) throw new Error(`Missing python line: ${s}`)
  return i + 1
}
