export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums and threshold.')
  const { nums, threshold } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 12) throw new Error('nums has 1 to 12 values.')
  if (!nums.every(x => Number.isInteger(x) && x >= 1 && x <= 20)) throw new Error('Each value is an integer from 1 to 20.')
  if (!Number.isInteger(threshold) || threshold < 1 || threshold > 100) throw new Error('threshold is an integer from 1 to 100.')
  return { nums, threshold }
}

export function buildTrace({ nums, threshold }) {
  const n = nums.length
  const left = Array(n).fill(-1)
  const right = Array(n).fill(n)
  const stack = []
  const frames = []
  for (let i = 0; i < n; i++) {
    while (stack.length && nums[stack[stack.length - 1]] > nums[i]) {
      right[stack.pop()] = i
    }
    left[i] = stack.length ? stack[stack.length - 1] : -1
    stack.push(i)
    frames.push({ phase: 'bounds', activeLine: CL('left[i] ='), pythonLine: PL('left[i] ='), i, l: left[i] + 1, r: i, found: null, message: `Element ${nums[i]} at ${i}: the nearest smaller value on the left is at ${left[i] === -1 ? 'the start' : left[i]}. Bounds are still growing.` })
  }
  let result = -1
  for (let i = 0; i < n; i++) {
    const length = right[i] - left[i] - 1
    const ok = nums[i] * length > threshold
    frames.push({ phase: 'check', activeLine: CL('if (nums[i] * length'), pythonLine: PL('if nums[i] * length'), i, l: left[i] + 1, r: right[i] - 1, found: ok, message: `Element ${nums[i]} stays the smallest over ${length} positions, ${nums[i]} x ${length} = ${nums[i] * length}, ${ok ? 'above' : 'not above'} ${threshold}.` })
    if (ok) {
      result = length
      frames.push({ phase: 'done', activeLine: CL('return length'), pythonLine: PL('return length'), i, l: left[i] + 1, r: right[i] - 1, found: true, message: `A subarray of length ${length} works: every element is above ${threshold} / ${length}.` })
      break
    }
  }
  if (result === -1) frames.push({ phase: 'done', activeLine: CL('return -1'), pythonLine: PL('return -1'), i: -1, l: -1, r: -1, found: false, message: 'No element gives a long enough span, so return -1.' })
  return { input: { nums, threshold }, result, frames }
}

export const code = `function longestSubarrayAbove(nums, threshold) {
  const n = nums.length;
  const left = Array(n).fill(-1);
  const right = Array(n).fill(n);
  const stack = [];
  for (let i = 0; i < n; i++) {
    while (stack.length && nums[stack[stack.length - 1]] > nums[i]) {
      right[stack.pop()] = i;
    }
    left[i] = stack.length ? stack[stack.length - 1] : -1;
    stack.push(i);
  }
  for (let i = 0; i < n; i++) {
    const length = right[i] - left[i] - 1;
    if (nums[i] * length > threshold) return length;
  }
  return -1;
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const CL = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }

export const python = `def longest_subarray_above(nums, threshold):
    n = len(nums)
    left = [-1] * n
    right = [n] * n
    stack = []
    for i in range(n):
        while stack and nums[stack[-1]] > nums[i]:
            right[stack.pop()] = i
        left[i] = stack[-1] if stack else -1
        stack.append(i)
    for i in range(n):
        length = right[i] - left[i] - 1
        if nums[i] * length > threshold:
            return length
    return -1
`
const PY = python.split('\n')
const PL = s => { const i = PY.findIndex(l => l.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }
