export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || !Array.isArray(obj.intervals)) throw new Error('Use an object with an intervals array.')
  const { intervals } = obj
  if (intervals.length < 2 || intervals.length > 12) throw new Error('Use 2 to 12 intervals for the visualization.')
  intervals.forEach((pair, i) => {
    if (!Array.isArray(pair) || pair.length !== 2) throw new Error(`intervals[${i}] must be [start, end].`)
    const [s, e] = pair
    if (!Number.isInteger(s) || !Number.isInteger(e) || s < 0 || e > 1000000000 || s > e) throw new Error(`intervals[${i}] needs integers with 0 <= start <= end <= 1000000000.`)
  })
  return { intervals }
}

// Number of values in a sorted array that are greater than v.
const countGreater = (sorted, v) => {
  let lo = 0
  let hi = sorted.length
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    if (sorted[mid] <= v) lo = mid + 1
    else hi = mid
  }
  return sorted.length - lo
}

export function buildTrace(input) {
  const { intervals } = input
  const n = intervals.length
  // Two intervals are disjoint exactly when one ends before the other starts, and each disjoint pair is counted once.
  const starts = intervals.map(([s]) => s).sort((a, b) => a - b)
  const frames = [{ pythonLine: 6, phase: 'sort', activeLine: L('const starts = intervals.map'), index: -1, disjoint: 0, message: 'Sort the start values so each end can be compared quickly.' }]
  let disjoint = 0
  intervals.forEach(([, e], index) => {
    const k = countGreater(starts, e)
    disjoint += k
    frames.push({ pythonLine: 9, phase: 'count', activeLine: L('disjoint += n - lo'), index, disjoint, k, message: `${k} interval${k === 1 ? '' : 's'} start after interval ${index} ends.` })
  })
  const result = (n * (n - 1)) / 2 - disjoint
  frames.push({ pythonLine: 10, phase: 'done', activeLine: L('return (n * (n - 1))'), index: -1, disjoint, k: null, message: `Intersecting pairs: ${result}.` })
  return { input, result, frames }
}

export const code = `function countIntersectingPairsSorted(intervals) {
  const n = intervals.length
  const starts = intervals.map(([s]) => s).sort((a, b) => a - b)
  let disjoint = 0
  for (const [, end] of intervals) {
    let lo = 0
    let hi = n
    while (lo < hi) {
      const mid = (lo + hi) >> 1
      if (starts[mid] <= end) lo = mid + 1
      else hi = mid
    }
    disjoint += n - lo
  }
  return (n * (n - 1)) / 2 - disjoint
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `import bisect


def count_intersecting_pairs_sorted(intervals):
    n = len(intervals)
    starts = sorted(s for s, _ in intervals)
    disjoint = 0
    for _, e in intervals:
        disjoint += n - bisect.bisect_right(starts, e)
    return n * (n - 1) // 2 - disjoint
`
