const MAX_ITEMS = 12
const ERROR = 'Enter {"rectangles":[[length,height],...],"points":[[x,y],...]} with 1 to 12 of each. Lengths and x are 1 to 100, heights are 1 to 100, and y is 0 to 100.'

export function parseInput(text) {
  const value = JSON.parse(text)
  if (!value || typeof value !== 'object' || !Array.isArray(value.rectangles) || !Array.isArray(value.points)) throw new Error(ERROR)
  const { rectangles, points } = value
  if (rectangles.length < 1 || rectangles.length > MAX_ITEMS || points.length < 1 || points.length > MAX_ITEMS) throw new Error(ERROR)
  const rectanglesOk = rectangles.every(r => Array.isArray(r) && r.length === 2 && Number.isInteger(r[0]) && Number.isInteger(r[1]) && r[0] >= 1 && r[0] <= 100 && r[1] >= 1 && r[1] <= 100)
  const pointsOk = points.every(p => Array.isArray(p) && p.length === 2 && Number.isInteger(p[0]) && Number.isInteger(p[1]) && p[0] >= 1 && p[0] <= 100 && p[1] >= 0 && p[1] <= 100)
  if (!rectanglesOk || !pointsOk) throw new Error(ERROR)
  return { rectangles, points }
}

export const code = `count rectangles containing each point
make 101 empty buckets, one for each height
for each rectangle (length, height)
  add the length to its height bucket
sort every bucket
for each point (x, y)
  total = 0
  for each height from y to 100
    add the lengths in that bucket that are at least x to total
  record total
return the recorded totals`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export function buildTrace({ rectangles, points }) {
  const buckets = Array.from({ length: 101 }, () => [])
  const frames = [{ phase: 'start', activeLine: L('make 101 empty buckets'), rect: -1, point: -1, placed: [], counts: [], message: 'Give each height its own bucket. A rectangle with height h can contain a point only if its height is at least the point’s y.' }]
  const placed = []
  rectangles.forEach(([length, height], i) => {
    buckets[height].push(length)
    placed.push([length, height])
    frames.push({ phase: 'bucket', activeLine: L('add the length to its height bucket'), rect: i, point: -1, placed: [...placed], counts: [], message: `Rectangle ${i} (length ${length}, height ${height}) goes into bucket ${height}.` })
  })
  for (const bucket of buckets) bucket.sort((a, b) => a - b)
  frames.push({ phase: 'bucket', activeLine: L('sort every bucket'), rect: -1, point: -1, placed: [...placed], counts: [], message: 'Sort each bucket by length so a binary search can find the first length that reaches a given x.' })
  const counts = []
  points.forEach(([x, y], i) => {
    let total = 0
    for (let height = y; height <= 100; height++) {
      const bucket = buckets[height]
      total += bucket.length - lowerBound(bucket, x)
    }
    counts.push(total)
    frames.push({ phase: 'point', activeLine: L('record total'), rect: -1, point: i, placed: [...placed], counts: [...counts], message: `Point (${x}, ${y}) lies in ${total} rectangle(s): those with length at least ${x} and height at least ${y}.` })
  })
  frames.push({ phase: 'done', activeLine: L('return the recorded totals'), rect: -1, point: -1, placed: [...placed], counts: [...counts], message: `Counts for each point: [${counts.join(', ')}].` })
  return { input: { rectangles, points }, result: counts, frames }
}

function lowerBound(sorted, value) {
  let lo = 0, hi = sorted.length
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    if (sorted[mid] < value) lo = mid + 1
    else hi = mid
  }
  return lo
}

export const python = `from bisect import bisect_left

def count_rectangles_with_points(rectangles, points):
    buckets = [[] for _ in range(101)]
    for length, height in rectangles:
        buckets[height].append(length)
    for bucket in buckets:
        bucket.sort()
    answer = []
    for x, y in points:
        total = 0
        for height in range(y, 101):
            bucket = buckets[height]
            total += len(bucket) - bisect_left(bucket, x)
        answer.append(total)
    return answer
`
