export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 20000 || nums.some(n => !Number.isInteger(n) || Math.abs(n) > 1e9)) throw new Error('Enter a JSON array of 1–20,000 integers with |n| ≤ 1,000,000,000.')
  return nums
}

export function buildTrace(nums) {
  const counts = new Map()
  for (const n of nums) counts.set(n, (counts.get(n) || 0) + 1)
  const values = [...counts.keys()].sort((a, b) => a - b)
  const frames = [{ phase: 'start', index: -1, values, counts: [], best: 0, activeLine: 2, message: `${values.length} distinct values; count each one.` }]
  let best = 0
  const countsSoFar = values.map(v => counts.get(v))
  values.forEach((value, i) => {
    const next = counts.get(value + 1)
    if (next !== undefined) {
      const total = counts.get(value) + next
      best = Math.max(best, total)
      frames.push({ phase: 'pair', index: i, values, counts: countsSoFar, pair: [value, value + 1], total, best, activeLine: 5, message: `${value} and ${value + 1} together give ${total} elements.` })
    } else {
      frames.push({ phase: 'scan', index: i, values, counts: countsSoFar, best, activeLine: 4, message: `${value + 1} is absent, so ${value} cannot pair upward.` })
    }
  })
  frames.push({ phase: 'done', index: values.length - 1, values, counts: countsSoFar, best, result: best, activeLine: 7, message: `Longest harmonious subsequence: ${best}.` })
  return { input: nums, result: best, frames }
}

export const code = `count how many times each value appears
start the best length at zero
for each value in the counts
  look up how many times the next larger value appears
  if that count is positive, consider the two counts together
  keep the larger of the best length and that combined count
return the best length`.split('\n').map((text, index) => ({ line: index + 1, text }))

// The scan-family visualizer reports its own step numbers (1 setup, 3 compare, 4 count, 5 return).
export const LINE_MAP = { 1: 1, 3: 4, 4: 1, 5: 7 }

export const python = `def find_lhs(nums):
    counts = {}
    for value in nums:
        counts[value] = counts.get(value, 0) + 1
    best = 0
    for value, count in counts.items():
        if counts.get(value + 1, 0):
            best = max(best, count + counts[value + 1])
    return best`
