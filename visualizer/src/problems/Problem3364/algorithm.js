export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums, l and r.')
  const { nums, l, r } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 12) throw new Error('nums has 1 to 12 integers.')
  if (!nums.every(v => Number.isInteger(v) && v >= -100 && v <= 100)) throw new Error('Each value is an integer from -100 to 100.')
  if (!Number.isInteger(l) || !Number.isInteger(r) || l < 1 || r < l || r > nums.length) throw new Error('Use 1 <= l <= r <= nums.length.')
  return { nums, l, r }
}

export function buildTrace({ nums, l, r }) {
  const frames = []
  let best = -1
  frames.push({ pythonLine: PY('best = -1'), phase: 'start', activeLine: L('let best = -1'), window: null, total: null, best, message: `Look at subarrays with length from ${l} to ${r}.` })
  for (let length = l; length <= r; length++) {
    for (let start = 0; start + length <= nums.length; start++) {
      let total = 0
      for (let i = start; i < start + length; i++) total += nums[i]
      const positive = total > 0
      const improves = positive && (best === -1 || total < best)
      frames.push({ pythonLine: PY('total = sum'), phase: 'window', activeLine: L('let total = 0'), window: [start, start + length], total, best, positive,
        message: `Window [${start}, ${start + length - 1}] has sum ${total}${positive ? ', positive' : ''}.` })
      if (improves) {
        best = total
        frames.push({ pythonLine: PY('best = total'), phase: 'better', activeLine: L('best = total'), window: [start, start + length], total, best, positive,
          message: `New smallest positive sum ${best}.` })
      }
    }
  }
  frames.push({ pythonLine: PY('return best'), phase: 'done', activeLine: L('return best'), window: null, total: null, best, result: best, message: `Answer: ${best}.` })
  return { input: { nums, l, r }, result: best, frames }
}

export const code = `function minimumPositiveSum(nums, l, r) {
  let best = -1
  for (let length = l; length <= r; length++) {
    for (let start = 0; start + length <= nums.length; start++) {
      let total = 0
      for (let i = start; i < start + length; i++) total += nums[i]
      if (total > 0 && (best === -1 || total < best)) best = total
    }
  }
  return best
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def minimum_positive_sum_subarray(nums, l, r):
    best = -1
    for length in range(l, r + 1):
        for start in range(len(nums) - length + 1):
            total = sum(nums[start:start + length])
            if total > 0 and (best == -1 or total < best):
                best = total
    return best
`
const PY = s => python.split('\n').findIndex(line => line.includes(s)) + 1
