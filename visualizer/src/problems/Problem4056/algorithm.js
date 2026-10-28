export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || !Array.isArray(obj.intervals)) throw new Error('Use an object with an intervals array.')
  const { intervals } = obj
  if (intervals.length < 2 || intervals.length > 12) throw new Error('Use 2 to 12 intervals for the visualization.')
  intervals.forEach((pair, i) => {
    if (!Array.isArray(pair) || pair.length !== 2) throw new Error(`intervals[${i}] must be [start, end].`)
    const [s, e] = pair
    if (!Number.isInteger(s) || !Number.isInteger(e) || s < 0 || e > 100 || s > e) throw new Error(`intervals[${i}] needs integers with 0 <= start <= end <= 100.`)
  })
  return { intervals }
}

export function buildTrace(input) {
  const { intervals } = input
  const n = intervals.length
  const frames = []
  let count = 0
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const [s1, e1] = intervals[i]
      const [s2, e2] = intervals[j]
      const hit = Math.max(s1, s2) <= Math.min(e1, e2)
      if (hit) count++
      frames.push({ phase: 'pair', activeLine: L('for each interval j after i'), i, j, hit, count, message: `[${s1}, ${e1}] and [${s2}, ${e2}] ${hit ? 'share a point' : 'do not meet'}.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return count'), i: -1, j: -1, hit: null, count, message: `Intersecting pairs: ${count}.` })
  return { input, result: count, frames }
}

export const code = `count intersecting interval pairs(intervals)
  set count to 0
  for each interval i from the first to the second to last do
    for each interval j after i do
      if the larger start is at most the smaller end then
        add 1 to count
  return count`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_intersecting_pairs(intervals):
    n = len(intervals)
    count = 0
    for i in range(n):
        for j in range(i + 1, n):
            a_start, a_end = intervals[i]
            b_start, b_end = intervals[j]
            if max(a_start, b_start) <= min(a_end, b_end):
                count += 1
    return count
`
