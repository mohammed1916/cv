// Largest subarray of length k: the largest one starts at the position of the largest value among the valid starts.
const JS_LINES = [
  { text: 'let best = 0', py: 'best = 0' },
  { text: 'for (let i = 1; i <= nums.length - k; i++) {', py: 'for i in range' },
  { text: 'if (nums[i] > nums[best]) best = i', py: 'if nums[i] > nums[best]' },
  { text: '}', py: null },
  { text: 'return nums.slice(best, best + k)', py: 'return nums[best' },
]

export const code = JS_LINES.map(({ text }, i) => ({ line: i + 1, text }))

export const python = `def largestSubarray(nums, k):
    best = 0
    for i in range(1, len(nums) - k + 1):
        if nums[i] > nums[best]:
            best = i
    return nums[best:best + k]
`

const PY = python.split('\n')
const pyAt = needle => {
  const index = PY.findIndex(line => line.includes(needle))
  if (index < 0) throw new Error(`python line missing: ${needle}`)
  return index + 1
}
export const pythonLineMap = Object.fromEntries(JS_LINES.map((line, i) => [i + 1, pyAt(line.py ?? 'return nums')]))

export const phases = [
  { id: 'start', label: 'First start', description: 'The subarray starting at index 0 is the first candidate.' },
  { id: 'compare', label: 'Compare starts', description: 'Two subarrays are compared at their first difference; with distinct values that is the first element.' },
  { id: 'done', label: 'Result', description: 'The subarray that starts at the best position.' },
]

export const examples = [
  { label: 'Largest start in the middle', input: '{"nums":[3,8,1,6,5],"k":3}' },
  { label: 'Whole array', input: '{"nums":[2,9,4],"k":3}' },
  { label: 'Short window', input: '{"nums":[5,1,7,2,6],"k":2}' },
  { label: 'Single value', input: '{"nums":[42],"k":1}' },
  { label: 'Descending order', input: '{"nums":[9,7,4,2],"k":2}' },
  { label: 'Largest values', input: '{"nums":[100,99,98,1],"k":3}' },
  { label: 'Long run: 16 values', input: '{"nums":[67,100,38,1,24,8,43,60,78,58,14,5,80,46,91,42],"k":8}' },
]

export const complexity = 'O(n) time and O(k) extra space for the answer, with n the array length.'

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.nums) || !Number.isInteger(input.k)) throw new Error('Use an object with nums and k.')
  const { nums, k } = input
  if (nums.length < 1 || nums.length > 16) throw new Error('nums has 1 to 16 values (visual cap).')
  if (new Set(nums).size !== nums.length || !nums.every(v => Number.isInteger(v) && v >= 1 && v <= 100)) throw new Error('nums holds distinct integers from 1 to 100.')
  if (k < 1 || k > nums.length) throw new Error('k is from 1 to the length of nums.')
  return { nums, k }
}

export function buildTrace({ nums, k }) {
  const frames = []
  let best = 0
  const snap = extra => ({ best, ...extra })
  frames.push({ phase: 'start', activeLine: 1, start: 0, message: `Candidate start 0: [${nums.slice(0, k).join(', ')}].`, snapshot: snap({}) })
  for (let i = 1; i <= nums.length - k; i++) {
    const better = nums[i] > nums[best]
    frames.push({ phase: 'compare', activeLine: 3, start: i, better, message: `Candidate start ${i}: [${nums.slice(i, i + k).join(', ')}] ${better ? 'is larger' : 'is not larger'}.`, snapshot: snap({ current: i }) })
    if (better) best = i
  }
  const result = nums.slice(best, best + k)
  frames.push({ phase: 'done', activeLine: 5, start: best, result, message: `Largest: [${result.join(', ')}].`, snapshot: snap({ result }) })
  return { input: { nums, k }, result, frames }
}
