export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 50000 || nums.some(v => !Number.isInteger(v) || v < 0 || v > 49999)) throw new Error('Enter a JSON array of 1–50,000 integers from 0 to 49,999.')
  return nums
}

// The degree is the largest frequency. For each value, the shortest subarray with that degree spans its first to last occurrence.
export function buildTrace(nums) {
  const first = new Map(), last = new Map(), count = new Map()
  const frames = [{ phase: 'start', index: -1, degree: 0, best: null, activeLine: 2, message: 'Record first and last positions and counts.' }]
  nums.forEach((v, i) => {
    if (!first.has(v)) first.set(v, i)
    last.set(v, i)
    count.set(v, (count.get(v) ?? 0) + 1)
  })
  const degree = Math.max(...count.values())
  let best = null
  for (const [v, c] of count) {
    if (c !== degree) continue
    const len = last.get(v) - first.get(v) + 1
    if (best === null || len < best) best = len
    frames.push({ phase: 'candidate', index: last.get(v), value: v, degree, span: [first.get(v), last.get(v)], best, activeLine: 7, message: `${v} occurs ${c} times; its span is ${len} long.` })
  }
  frames.push({ phase: 'done', index: nums.length - 1, degree, best, result: best, activeLine: 9, message: `Degree ${degree}; shortest span ${best}.` })
  return { input: nums, result: best, frames }
}

export const code = `set the count, first-index, and last-index maps to empty; set degree and shortest to 0
for each index i with value v in nums
  record the first index of v if new, set its last index to i, and increase its count
  if the count of v is above degree, set degree to it and shortest to the span of v
  otherwise if the count of v equals degree, set shortest to the smaller of shortest and the span of v
return shortest`.split('\n').map((text, index) => ({ line: index + 1, text }))

// Family lines 1-5 are setup, the loop header, the per-value update, the span comparison and the return.
export const LINE_MAP = { 1: 1, 2: 2, 3: 3, 4: 4, 5: 6 }

export const python = `def find_shortest_subarray(nums):
    first = {}
    last = {}
    count = {}
    for i, value in enumerate(nums):
        if value not in first:
            first[value] = i
        last[value] = i
        count[value] = count.get(value, 0) + 1
    degree = max(count.values())
    return min(last[v] - first[v] + 1 for v in count if count[v] == degree)`
