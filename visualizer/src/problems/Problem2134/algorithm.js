// LeetCode 2134: Minimum Swaps to Group All 1's Together II.
// Let k be the number of ones. The ones can gather in some circular window of length k; each 1 that sits
// outside the window costs one swap. Slide the window around the circle and keep the most ones inside.

export function parseInput(text) {
  let nums
  try { nums = JSON.parse(text) } catch { throw new Error('Use a JSON array of 0s and 1s, e.g. [1,0,1,0,1].') }
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 30 || nums.some(v => v !== 0 && v !== 1)) {
    throw new Error('Use 1 to 30 values, each 0 or 1.')
  }
  return { nums }
}

export const code = `function minSwaps(nums) {
  const n = nums.length
  const k = nums.reduce((sum, v) => sum + v, 0)
  if (k === 0 || k === n) return 0
  let inside = 0
  for (let i = 0; i < k; i++) inside += nums[i]
  let best = inside
  for (let l = 1; l < n; l++) {
    const r = (l + k - 1) % n
    inside = inside - nums[l - 1] + nums[r]
    best = Math.max(best, inside)
  }
  return k - best
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `# entry: min_swaps
def min_swaps(nums):
    n = len(nums)
    k = sum(nums)
    if k == 0 or k == n:
        return 0
    inside = sum(nums[:k])
    best = inside
    for l in range(1, n):
        r = (l + k - 1) % n
        inside = inside - nums[l - 1] + nums[r]
        best = max(best, inside)
    return k - best
`

const L = text => {
  const index = code.findIndex(line => line.text.includes(text))
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return index + 1
}
const P = text => {
  const index = python.split('\n').findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing python line: ${text}`)
  return index + 1
}

export const phases = [
  { id: 'count', label: 'Window size', description: 'The window must be as long as the number of ones.' },
  { id: 'start', label: 'First window', description: 'Count the ones inside the first window.' },
  { id: 'slide', label: 'Slide', description: 'Drop the left value and add the value that enters on the right.' },
  { id: 'done', label: 'Result', description: 'Ones outside the best window must each be swapped in.' },
]

export function buildTrace({ nums }) {
  const frames = []
  const n = nums.length
  const k = nums.reduce((sum, v) => sum + v, 0)
  if (k === 0 || k === n) {
    frames.push({ phase: 'count', activeLine: L('if (k === 0'), pythonLine: P('if k == 0'), message: 'All values are equal, so no swaps are needed.', nums, l: 0, r: n - 1, inside: k, best: k, result: 0 })
    return { input: { nums }, result: 0, frames }
  }
  frames.push({ phase: 'count', activeLine: L('const k ='), pythonLine: P('k = sum'), message: `${k} ones, so the window has length ${k}.`, nums, l: 0, r: k - 1, inside: 0, best: 0, result: null })
  let inside = 0
  for (let i = 0; i < k; i++) inside += nums[i]
  let best = inside
  frames.push({ phase: 'start', activeLine: L('let best = inside'), pythonLine: P('best = inside'), message: `The first window holds ${inside} ones.`, nums, l: 0, r: k - 1, inside, best, result: null })
  for (let l = 1; l < n; l++) {
    const r = (l + k - 1) % n
    inside = inside - nums[l - 1] + nums[r]
    best = Math.max(best, inside)
    frames.push({ phase: 'slide', activeLine: L('inside = inside - nums[l - 1]'), pythonLine: P('inside = inside - nums[l - 1]'), message: `Window starts at ${l}, wraps to ${r}: ${inside} ones inside; best ${best}.`, nums, l, r, inside, best, result: null })
  }
  const result = k - best
  frames.push({ phase: 'done', activeLine: L('return k - best'), pythonLine: P('return k - best'), message: `Best window holds ${best} ones, so ${result} swaps are needed.`, nums, l: -1, r: -1, inside: best, best, result })
  return { input: { nums }, result, frames }
}
