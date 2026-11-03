export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums and k.')
  const { nums, k } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 14 || !nums.every(v => Number.isInteger(v) && v >= 0 && v <= 9)) {
    throw new Error('nums has 1 to 14 integers from 0 to 9.')
  }
  if (!Number.isInteger(k) || k < 0 || k > 4) throw new Error('k is an integer from 0 to 4.')
  return { nums, k }
}

// A peak is an interior index larger than both neighbours. Each peak owns the window of positions
// strictly between its neighbouring peaks, clipped to k on each side.
export function buildTrace({ nums, k }) {
  const frames = []
  const n = nums.length
  const peaks = []
  for (let i = 1; i < n - 1; i += 1) if (nums[i] > nums[i - 1] && nums[i] > nums[i + 1]) peaks.push(i)
  const snap = extra => ({ peaks: peaks.slice(), ...extra })
  frames.push(snap({ pythonLine: PY('peaks = ['), phase: 'start', activeLine: L('peaks = interior indices'), cur: -1, prev: -1, next: n, left: null, right: null, count: 0, total: 0, message: peaks.length ? `Marked peaks: ${peaks.join(', ')}.` : 'No peaks, so no subarray qualifies.' }))
  let total = 0
  peaks.forEach((i, idx) => {
    const prev = idx > 0 ? peaks[idx - 1] : -1
    const next = idx + 1 < peaks.length ? peaks[idx + 1] : n
    frames.push(snap({ pythonLine: PY('for idx, i in enumerate'), phase: 'peak', activeLine: L('for each peak'), cur: i, prev, next, left: null, right: null, count: 0, total, message: `Peak at ${i}; neighbouring peaks are ${prev < 0 ? 'none' : prev} and ${next >= n ? 'none' : next}.` }))
    const left = Math.max(i - k, prev + 1, 0)
    const right = Math.min(i + k, next - 1, n - 1)
    frames.push(snap({ pythonLine: PY('left = max'), phase: 'bounds', activeLine: L('left end l can be'), cur: i, prev, next, left, right, count: 0, total, message: `Left end ranges over ${left}..${i}, right end over ${i}..${right}.` }))
    const count = (i - left + 1) * (right - i + 1)
    total += count
    frames.push(snap({ pythonLine: PY('total +='), phase: 'add', activeLine: L('add the number of pairs'), cur: i, prev, next, left, right, count, total, message: `${i - left + 1} left ends times ${right - i + 1} right ends adds ${count}.` }))
  })
  frames.push(snap({ pythonLine: PY('return total'), phase: 'done', activeLine: L('return total'), cur: -1, prev: -1, next: n, left: null, right: null, count: 0, total, message: `Valid subarrays: ${total}.` }))
  return { input: { nums, k }, result: total, frames }
}

export const code = `count subarrays with exactly one marked peak close to it
  peaks = interior indices larger than both neighbours
  total = 0
  for each peak i with previous peak p and next peak q
    left end l can be from max(i minus k, p plus 1, 0) up to i
    right end r can be from i up to min(i plus k, q minus 1, n minus 1)
    add the number of pairs (left choices times right choices) to total
  return total`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return index + 1
}

export const python = `def count_valid(nums, k):
    n = len(nums)
    peaks = [i for i in range(1, n - 1) if nums[i] > nums[i - 1] and nums[i] > nums[i + 1]]
    total = 0
    for idx, i in enumerate(peaks):
        prev = peaks[idx - 1] if idx > 0 else -1
        nxt = peaks[idx + 1] if idx + 1 < len(peaks) else n
        left = max(i - k, prev + 1, 0)
        right = min(i + k, nxt - 1, n - 1)
        total += (i - left + 1) * (right - i + 1)
    return total
`

const PY = s => {
  const index = python.split('\n').findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`Missing python line: ${s}`)
  return index + 1
}
