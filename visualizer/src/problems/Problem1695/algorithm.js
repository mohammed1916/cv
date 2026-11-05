// Maximum erasure value: a sliding window [l, r] of distinct values; keep the largest window sum.
const JS_LINES = [
  { text: 'const seen = new Set()', py: 'seen = set()' },
  { text: 'let l = 0, sum = 0, best = 0', py: 'l = total = best = 0' },
  { text: 'for (let r = 0; r < nums.length; r++) {', py: 'for r, x in enumerate' },
  { text: 'while (seen.has(nums[r])) {', py: 'while x in seen' },
  { text: 'seen.delete(nums[l]); sum -= nums[l]; l++', py: 'seen.remove(nums[l])' },
  { text: '}', py: null },
  { text: 'seen.add(nums[r]); sum += nums[r]', py: 'seen.add(x)' },
  { text: 'best = Math.max(best, sum)', py: 'best = max(best' },
  { text: '}', py: null },
  { text: 'return best', py: 'return best' },
]

export const code = JS_LINES.map(({ text }, i) => ({ line: i + 1, text }))

export const python = `def maximumUniqueSubarray(nums):
    seen = set()
    l = total = best = 0
    for r, x in enumerate(nums):
        while x in seen:
            seen.remove(nums[l])
            total -= nums[l]
            l += 1
        seen.add(x)
        total += x
        best = max(best, total)
    return best
`

const PY = python.split('\n')
const pyAt = needle => {
  const index = PY.findIndex(line => line.includes(needle))
  if (index < 0) throw new Error(`python line missing: ${needle}`)
  return index + 1
}
export const pythonLineMap = Object.fromEntries(JS_LINES.map((line, i) => [i + 1, pyAt(line.py ?? 'return best')]))

export const phases = [
  { id: 'start', label: 'Start', description: 'The window is empty; l and r both sit at the start.' },
  { id: 'extend', label: 'Extend r', description: 'Move r right and add nums[r] when it is not already in the window.' },
  { id: 'shrink', label: 'Shrink l', description: 'A repeated value is in the window: move l right until the repeat is gone.' },
  { id: 'record', label: 'Record', description: 'The window has distinct values: compare its sum with the best so far.' },
  { id: 'done', label: 'Result', description: 'The best window sum over all windows.' },
]

export const examples = [
  { label: 'Repeat in the middle', input: '[7,3,7,2,9]' },
  { label: 'Several repeats', input: '[6,1,6,2,3,1]' },
  { label: 'All distinct', input: '[3,1,2]' },
]

export const complexity = 'O(n) time and O(n) space for n numbers: l and r each move at most n times.'

export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 20) throw new Error('Use a JSON array of 1 to 20 positive integers (visual cap).')
  if (!nums.every(v => Number.isInteger(v) && v >= 1 && v <= 10000)) throw new Error('Values are integers from 1 to 10000.')
  return nums
}

export function buildTrace(nums) {
  const frames = []
  const seen = new Set()
  let l = 0
  let sum = 0
  let best = 0
  const snap = extra => ({ l, sum, best, window: nums.slice(l, l + seen.size), ...extra })
  frames.push({ phase: 'start', activeLine: 2, l: 0, r: -1, message: 'Empty window; sum 0.', snapshot: snap({}) })
  for (let r = 0; r < nums.length; r++) {
    while (seen.has(nums[r])) {
      seen.delete(nums[l]); sum -= nums[l]; l++
      frames.push({ phase: 'shrink', activeLine: 5, l, r, message: `Repeated ${nums[r]}: drop the left value; window is [${l}, ${r}].`, snapshot: snap({}) })
    }
    seen.add(nums[r]); sum += nums[r]
    frames.push({ phase: 'extend', activeLine: 7, l, r, message: `Add ${nums[r]}; window [${l}, ${r}] has sum ${sum}.`, snapshot: snap({}) })
    best = Math.max(best, sum)
    frames.push({ phase: 'record', activeLine: 8, l, r, message: `Best so far ${best}.`, snapshot: snap({}) })
  }
  frames.push({ phase: 'done', activeLine: 10, l: -1, r: -1, result: best, message: `Maximum erasure value ${best}.`, snapshot: snap({ result: best }) })
  return { input: nums, result: best, frames }
}
