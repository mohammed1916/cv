export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data) || Object.keys(data).sort().join() !== 'k,nums') {
    throw new Error('Use an object with exactly the keys nums and k.')
  }
  const { nums, k } = data
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 8) throw new Error('Use 1 to 8 numbers.')
  if (nums.some(v => !Number.isInteger(v) || v < -20 || v > 20)) throw new Error('Numbers are integers from -20 to 20.')
  if (!Number.isInteger(k) || k < 1 || k > nums.length) throw new Error('k is an integer from 1 to the length of nums.')
  return data
}

export function buildTrace(data) {
  const { nums, k } = data
  // The j-th chosen subarray (1-based, left to right) contributes sign(j) * (k - j + 1) * its sum.
  const weight = j => (j % 2 === 1 ? 1 : -1) * (k - j + 1)
  // closed[j]: best strength with j subarrays chosen and the last element not in the j-th.
  // open[j]: best strength with j subarrays chosen and the last element inside the j-th.
  let closed = Array(k + 1).fill(-Infinity)
  closed[0] = 0
  let open = Array(k + 1).fill(-Infinity)
  const frames = [{ pythonLine: 4, phase: 'start', activeLine: L('closed[0] = 0'), i: -1, closed: [...closed], open: [...open], message: 'Nothing chosen yet: zero subarrays and strength 0.' }]
  for (let i = 0; i < nums.length; i++) {
    const x = nums[i]
    const nextClosed = closed.map((value, j) => Math.max(value, open[j]))
    const nextOpen = Array(k + 1).fill(-Infinity)
    for (let j = 1; j <= k; j++) {
      const continued = open[j] + weight(j) * x
      const started = Math.max(closed[j - 1], open[j - 1]) + weight(j) * x
      nextOpen[j] = Math.max(continued, started)
    }
    closed = nextClosed
    open = nextOpen
    frames.push({ pythonLine: 15, phase: 'element', activeLine: L('const nextClosed'), i, closed: [...closed], open: [...open], message: `Element ${i} is ${x}: each count either keeps its subarray going or starts a new one here.` })
  }
  const result = Math.max(closed[k], open[k])
  frames.push({ pythonLine: 17, phase: 'done', activeLine: L('return Math.max(closed[k]'), i: nums.length - 1, closed: [...closed], open: [...open], message: `The maximum strength of ${k} disjoint subarrays is ${result}.` })
  return { input: data, result, frames }
}

export const code = `function maxStrength(nums, k) {
  const neg = -Infinity
  let closed = Array(k + 1).fill(neg)
  closed[0] = 0
  let open = Array(k + 1).fill(neg)
  for (const x of nums) {
    const nextClosed = closed.map((value, j) => Math.max(value, open[j]))
    const nextOpen = Array(k + 1).fill(neg)
    for (let j = 1; j <= k; j++) {
      const w = (j % 2 === 1 ? 1 : -1) * (k - j + 1)
      nextOpen[j] = Math.max(open[j] + w * x, Math.max(closed[j - 1], open[j - 1]) + w * x)
    }
    closed = nextClosed
    open = nextOpen
  }
  return Math.max(closed[k], open[k])
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_strength(nums, k):
    neg = float('-inf')
    closed = [neg] * (k + 1)
    closed[0] = 0
    open_ = [neg] * (k + 1)
    for x in nums:
        next_closed = [max(closed[j], open_[j]) for j in range(k + 1)]
        next_open = [neg] * (k + 1)
        for j in range(1, k + 1):
            sign = 1 if j % 2 == 1 else -1
            w = sign * (k - j + 1)
            continued = open_[j] + w * x
            started = max(closed[j - 1], open_[j - 1]) + w * x
            next_open[j] = max(continued, started)
        closed = next_closed
        open_ = next_open
    return max(closed[k], open_[k])
`
