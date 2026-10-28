export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || !Array.isArray(obj.nums)) throw new Error('Use a JSON object with a "nums" array.')
  const { nums } = obj
  if (nums.length < 2 || nums.length > 30) throw new Error('nums must have 2 to 30 entries for this visualization.')
  if (nums.some(v => !Number.isInteger(v) || v < 1 || v > 100000)) throw new Error('Each value must be an integer from 1 to 100000.')
  return { nums }
}

// Longest alternating run: consecutive steps must go up, down, up, ... with no equal neighbours.
function longestRun(arr) {
  if (arr.length === 0) return 0
  let best = 1
  let cur = 1
  let prev = 0
  for (let i = 1; i < arr.length; i++) {
    const s = Math.sign(arr[i] - arr[i - 1])
    if (s === 0) { cur = 1; prev = 0 }
    else if (prev === 0 || s === prev) { cur = 2; prev = s }
    else { cur += 1; prev = s }
    best = Math.max(best, cur)
  }
  return best
}

export function buildTrace({ nums }) {
  const n = nums.length
  const frames = []
  let best = longestRun(nums)
  let bestAt = -1
  frames.push({ phase: 'start', activeLine: L('set best to the longest'), index: -1, run: best, best, bestAt, message: `Keeping every element gives a longest alternating run of ${best}.` })
  for (let i = 0; i < n; i++) {
    const rest = [...nums.slice(0, i), ...nums.slice(i + 1)]
    const run = longestRun(rest)
    if (run > best) { best = run; bestAt = i }
    frames.push({ phase: 'remove', activeLine: L('remove nums'), index: i, run, best, bestAt, message: `Removing ${nums[i]} at index ${i} leaves a longest alternating run of ${run}.${bestAt === i ? ' New best.' : ''}` })
  }
  frames.push({ phase: 'done', activeLine: L('return best'), index: bestAt, run: best, best, bestAt, message: `Longest alternating subarray after at most one removal: ${best}.` })
  return { input: { nums }, result: best, frames }
}

export const code = `longest alternating subarray after removing at most one element (nums):
  set best to the longest alternating run in nums with nothing removed
  for each index i in nums
    remove nums[i] to get the remaining array
    set run to the longest alternating run in the remaining array
    if run is larger than best then
      set best to run
  return best

a run is alternating when each step goes up and then down, or down and then up
equal neighbours break the run`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def longest_alternating_after_removal(nums):
    def longest_run(arr):
        if not arr:
            return 0
        best = cur = 1
        prev = 0
        for i in range(1, len(arr)):
            s = (arr[i] > arr[i - 1]) - (arr[i] < arr[i - 1])
            if s == 0:
                cur, prev = 1, 0
            elif prev == 0 or s == prev:
                cur, prev = 2, s
            else:
                cur, prev = cur + 1, s
            best = max(best, cur)
        return best

    best = longest_run(nums)
    for i in range(len(nums)):
        best = max(best, longest_run(nums[:i] + nums[i + 1:]))
    return best
`
