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

export const code = `def findShortestSubArray(nums):
    first, last, count = {}, {}, Counter(nums)
    for i, v in enumerate(nums):
        first.setdefault(v, i)
        last[v] = i
    degree = max(count.values())
    return min(last[v] - first[v] + 1 for v in count if count[v] == degree)`.split('\n').map((text, index) => ({ line: index + 1, text }))
