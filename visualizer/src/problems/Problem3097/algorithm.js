const BITS = 8

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with nums and k.')
  const { nums, k } = data
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 30) throw new Error('nums must be an array of 1 to 30 integers.')
  if (nums.some(v => !Number.isInteger(v) || v < 1 || v > 255)) throw new Error('Each value is an integer from 1 to 255.')
  if (!Number.isInteger(k) || k < 1 || k > 255) throw new Error('k must be an integer from 1 to 255.')
  return { nums, k }
}

const windowOr = counts => counts.reduce((acc, c, b) => (c > 0 ? acc | (1 << b) : acc), 0)

export function buildTrace({ nums, k }) {
  const counts = Array(BITS).fill(0)
  const frames = []
  let best = null
  let left = 0
  const frame = (phase, line, right, message) => frames.push({ phase, activeLine: line, left, right, windowOr: windowOr(counts), best, message })
  frame('start', L('set the count of each bit'), -1, 'Start with an empty window.')
  for (let right = 0; right < nums.length; right++) {
    for (let b = 0; b < BITS; b++) if ((nums[right] >> b) & 1) counts[b]++
    frame('add', L('add nums[right]'), right, `Add ${nums[right]} at ${right}. The window OR is ${windowOr(counts)}.`)
    while (left <= right && windowOr(counts) >= k) {
      const length = right - left + 1
      best = best === null ? length : Math.min(best, length)
      frame('record', L('set best to the smaller'), right, `Window ${left}-${right} has OR ${windowOr(counts)} >= ${k}, length ${length}.`)
      for (let b = 0; b < BITS; b++) if ((nums[left] >> b) & 1) counts[b]--
      left++
      frame('shrink', L('remove nums[left]'), right, `Drop ${nums[left - 1]} from the left.`)
    }
  }
  frame('done', L('return best, or -1'), -1, best === null ? 'No subarray reaches k.' : `Shortest length: ${best}.`)
  return { input: { nums, k }, result: best === null ? -1 : best, frames }
}

export const code = `shortest subarray whose OR is at least k
  set best to nothing
  set the count of each bit to 0 and left to 0
  for each index right from 0 to the last index do
    add nums[right] to the bit counts
    while left is at most right and the OR of the window is at least k do
      set best to the smaller of best and the window length
      remove nums[left] from the bit counts
      increase left by one
  return best, or -1 if best is nothing`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error('missing code line: ' + s); return i + 1 }

export const python = `def shortest_subarray_or(nums, k):
    counts = [0] * 8

    def window_or():
        result = 0
        for b in range(8):
            if counts[b] > 0:
                result |= 1 << b
        return result

    best = None
    left = 0
    for right, value in enumerate(nums):
        for b in range(8):
            if (value >> b) & 1:
                counts[b] += 1
        while left <= right and window_or() >= k:
            length = right - left + 1
            if best is None or length < best:
                best = length
            for b in range(8):
                if (nums[left] >> b) & 1:
                    counts[b] -= 1
            left += 1
    return -1 if best is None else best
`
