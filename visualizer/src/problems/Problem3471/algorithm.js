export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || !Array.isArray(data.nums) || data.nums.length < 1 || data.nums.length > 20) throw new Error('Use an array nums of 1 to 20 integers.')
  if (data.nums.some(v => !Number.isInteger(v) || v < 0 || v > 50)) throw new Error('Values are integers from 0 to 50.')
  if (!Number.isInteger(data.k) || data.k < 1 || data.k > data.nums.length) throw new Error('Use an integer k from 1 to the length of nums.')
  return { nums: data.nums, k: data.k }
}

export function buildTrace({ nums, k }) {
  const n = nums.length
  const windows = new Map()
  const frames = [{ phase: 'start', activeLine: L('set best to minus one'), index: -1, window: [], key: null, counts: [], best: -1, message: `Slide a window of length ${k} across nums.` }]
  for (let i = 0; i + k <= n; i++) {
    const values = [...new Set(nums.slice(i, i + k))]
    for (const v of values) windows.set(v, (windows.get(v) || 0) + 1)
    frames.push({ phase: 'window', activeLine: L('add one to the window count'), index: i, window: values, key: null, counts: [...windows].sort((a, b) => a[0] - b[0]), best: -1, message: `Window ${i} to ${i + k - 1} contains ${values.join(', ')}.` })
  }
  let best = -1
  for (const [v, count] of [...windows].sort((a, b) => a[0] - b[0])) {
    if (count === 1 && v > best) {
      best = v
      frames.push({ phase: 'pick', activeLine: L('set best to v'), index: -1, window: [], key: v, counts: [...windows].sort((a, b) => a[0] - b[0]), best, message: `${v} is in exactly one window and is the largest so far.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return best'), index: -1, window: [], key: null, counts: [...windows].sort((a, b) => a[0] - b[0]), best, result: best, message: best === -1 ? 'No value appears in exactly one window.' : `The largest almost missing integer is ${best}.` })
  return { input: { nums, k }, result: best, frames }
}

export const code = `largest almost missing integer
  set best to minus one
  set window counts to an empty count
  for each window of k consecutive values starting at i
    for each distinct value v in the window
      add one to the window count of v
  for each value v with window count exactly one
    if v is larger than best then
      set best to v
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def largest_almost_missing(nums, k):
    n = len(nums)
    windows = {}
    for i in range(n - k + 1):
        for v in set(nums[i:i + k]):
            windows[v] = windows.get(v, 0) + 1
    best = -1
    for v, c in windows.items():
        if c == 1 and v > best:
            best = v
    return best
`
