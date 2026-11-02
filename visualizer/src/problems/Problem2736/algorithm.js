const PL = s => python.split('\n').findIndex(line => line.trim() === s) + 1

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums1, nums2 and queries.')
  const { nums1, nums2, queries } = input
  const ints = list => Array.isArray(list) && list.length >= 1 && list.length <= 8 && list.every(v => Number.isInteger(v) && v >= 1 && v <= 20)
  if (!ints(nums1) || !ints(nums2) || nums1.length !== nums2.length) throw new Error('nums1 and nums2 are equal-length lists of 1 to 8 integers from 1 to 20.')
  if (!Array.isArray(queries) || queries.length < 1 || queries.length > 6 || !queries.every(q => Array.isArray(q) && q.length === 2 && q.every(v => Number.isInteger(v) && v >= 1 && v <= 20))) throw new Error('queries holds 1 to 6 pairs [x, y] of integers from 1 to 20.')
  return { nums1, nums2, queries }
}

export function buildTrace({ nums1, nums2, queries }) {
  const frames = []
  const points = nums1.map((a, i) => [a, nums2[i]]).sort((p, q) => (q[0] - p[0]) || (q[1] - p[1]))
  const order = queries.map((_, q) => q).sort((p, q) => queries[q][0] - queries[p][0])
  let frontier = []
  const answer = queries.map(() => -1)
  const snapshot = () => frontier.map(([y, s]) => ({ y, s }))
  frames.push({ pythonLine: PL('points = sorted(zip(nums1, nums2), reverse=True)'), phase: 'start', activeLine: L('sort the indices by nums1'), query: -1, point: null, frontier: [], answer: [...answer], message: 'Sort the points by nums1 from largest to smallest, and the queries by x the same way.' })
  let p = 0
  for (const q of order) {
    const [x, y] = queries[q]
    while (p < points.length && points[p][0] >= x) {
      const [a, b] = points[p]
      p += 1
      const sum = a + b
      if (frontier.some(([fy, fs]) => fy >= b && fs >= sum)) {
        frames.push({ pythonLine: PL('continue'), phase: 'insert', activeLine: L('skip it if'), query: q, point: { a, b }, frontier: snapshot(), answer: [...answer], message: `(${a}, ${b}) is dominated by a point already in the frontier; skip it.` })
        continue
      }
      frontier = frontier.filter(([fy, fs]) => !(fy <= b && fs <= sum))
      frontier.push([b, sum])
      frontier.sort((u, v) => u[0] - v[0] || u[1] - v[1])
      frames.push({ pythonLine: PL('frontier.sort()'), phase: 'insert', activeLine: L('otherwise keep'), query: q, point: { a, b }, frontier: snapshot(), answer: [...answer], message: `Add (${a}, ${b}) with sum ${sum} to the frontier.` })
    }
    let found = false
    for (const [fy, fs] of frontier) {
      if (fy >= y) {
        answer[q] = fs
        found = true
        frames.push({ pythonLine: PL('answer[q] = fs'), phase: 'query', activeLine: L('the first point'), query: q, point: null, frontier: snapshot(), answer: [...answer], message: `Query (${x}, ${y}): the best sum is ${fs}.` })
        break
      }
    }
    if (!found) frames.push({ pythonLine: PL('for fy, fs in frontier:'), phase: 'query', activeLine: L('no frontier point'), query: q, point: null, frontier: snapshot(), answer: [...answer], message: `Query (${x}, ${y}): no point qualifies, so the answer is -1.` })
  }
  frames.push({ pythonLine: PL('return answer'), phase: 'done', activeLine: L('return the answers'), query: -1, point: null, frontier: snapshot(), answer: [...answer], result: answer, message: `Answers: [${answer.join(', ')}].` })
  return { input: { nums1, nums2, queries }, result: answer, frames }
}

export const code = `maximum nums1[i] plus nums2[i] for each query
  pair up points (nums1[i], nums2[i]) and sort them by first value, largest first
  sort the query indices by x, largest first
  frontier = empty list of (y, sum) kept sorted by y
  for each query in that order
    add every point with first value at least x to the frontier
      skip a point dominated by one already there
      otherwise drop frontier points it dominates and insert it
    answer is the sum of the first frontier point with y at least the query y, or -1
  return the answers in the original order`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def maximum_sum_queries(nums1, nums2, queries):
    points = sorted(zip(nums1, nums2), reverse=True)
    order = sorted(range(len(queries)), key=lambda q: -queries[q][0])
    frontier = []
    answer = [-1] * len(queries)
    p = 0
    for q in order:
        x, y = queries[q]
        while p < len(points) and points[p][0] >= x:
            a, b = points[p]
            p += 1
            if any(fy >= b and fs >= a + b for fy, fs in frontier):
                continue
            frontier = [(fy, fs) for fy, fs in frontier if not (fy <= b and fs <= a + b)]
            frontier.append((b, a + b))
            frontier.sort()
        for fy, fs in frontier:
            if fy >= y:
                answer[q] = fs
                break
    return answer
`
