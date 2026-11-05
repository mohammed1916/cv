// LeetCode 2104: Sum of Subarray Ranges.
// Range of a subarray = max - min. Sum over subarrays of max and of min, using monotonic stacks.
// Each element is the maximum of the subarrays between its left and right boundaries.

export function parseInput(text) {
  let nums
  try { nums = JSON.parse(text) } catch { throw new Error('Use a JSON array of integers, e.g. [1,3,2].') }
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 30 || nums.some(v => !Number.isInteger(v) || Math.abs(v) > 1000)) {
    throw new Error('Use 1 to 30 integers between -1000 and 1000.')
  }
  return { nums }
}

export const code = `function subarrayRangeSum(nums) {
  return extremeSum(nums) + extremeSum(nums.map(value => -value))
}

function extremeSum(values) {
  const n = values.length
  const left = new Array(n)
  const right = new Array(n)
  const stack = []
  for (let i = 0; i < n; i++) {
    while (stack.length && values[stack.at(-1)] <= values[i]) stack.pop()
    left[i] = stack.length ? stack.at(-1) : -1
    stack.push(i)
  }
  stack.length = 0
  for (let i = n - 1; i >= 0; i--) {
    while (stack.length && values[stack.at(-1)] < values[i]) stack.pop()
    right[i] = stack.length ? stack.at(-1) : n
    stack.push(i)
  }
  let total = 0
  for (let i = 0; i < n; i++) total += values[i] * (i - left[i]) * (right[i] - i)
  return total
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `# entry: subarray_range_sum
def subarray_range_sum(nums):
    return extreme_sum(nums) + extreme_sum([-v for v in nums])

def extreme_sum(values):
    n = len(values)
    left = [0] * n
    right = [0] * n
    stack = []
    for i in range(n):
        while stack and values[stack[-1]] <= values[i]:
            stack.pop()
        left[i] = stack[-1] if stack else -1
        stack.append(i)
    stack = []
    for i in range(n - 1, -1, -1):
        while stack and values[stack[-1]] < values[i]:
            stack.pop()
        right[i] = stack[-1] if stack else n
        stack.append(i)
    return sum(values[i] * (i - left[i]) * (right[i] - i) for i in range(n))
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
  { id: 'max', label: 'Largest spans', description: 'Each value is the largest in the subarrays from its left boundary to its right boundary.' },
  { id: 'min', label: 'Smallest spans', description: 'The same boundary idea on negated values gives the minimum sums.' },
  { id: 'done', label: 'Result', description: 'Sum of maxima minus sum of minima.' },
]

function boundaries(values) {
  const n = values.length
  const left = new Array(n)
  const right = new Array(n)
  const stack = []
  for (let i = 0; i < n; i++) {
    while (stack.length && values[stack.at(-1)] <= values[i]) stack.pop()
    left[i] = stack.length ? stack.at(-1) : -1
    stack.push(i)
  }
  stack.length = 0
  for (let i = n - 1; i >= 0; i--) {
    while (stack.length && values[stack.at(-1)] < values[i]) stack.pop()
    right[i] = stack.length ? stack.at(-1) : n
    stack.push(i)
  }
  return { left, right }
}

export function buildTrace({ nums }) {
  const frames = []
  const n = nums.length
  let total = 0
  const passes = [
    { phase: 'max', sign: 1, label: 'largest', code: 'left[i] = stack.length' },
    { phase: 'min', sign: -1, label: 'smallest', code: 'left[i] = stack.length' },
  ]
  let maxSum = 0
  let minSum = 0
  for (const pass of passes) {
    const values = nums.map(value => pass.sign * value)
    const { left, right } = boundaries(values)
    let subtotal = 0
    for (let i = 0; i < n; i++) {
      const count = (i - left[i]) * (right[i] - i)
      subtotal += values[i] * count
      const marks = { [i]: 'current' }
      if (left[i] >= 0) marks[left[i]] = 'l'
      if (right[i] < n) marks[right[i]] = 'r'
      frames.push({ phase: pass.phase, activeLine: L(pass.code), pythonLine: P('left[i] = stack[-1]'), message: `${nums[i]} is the ${pass.label} in ${count} subarrays (from after index ${left[i]} to before index ${right[i]}).`, marks, subtotal: subtotal * pass.sign, running: null })
    }
    if (pass.sign === 1) maxSum = subtotal
    else minSum = -subtotal
  }
  total = maxSum - minSum
  frames.push({ phase: 'done', activeLine: L('return extremeSum'), pythonLine: P('return extreme_sum(nums)'), message: `Sum of maxima ${maxSum} minus sum of minima ${minSum} is ${total}.`, marks: {}, subtotal: total, running: total })
  return { input: { nums }, result: total, frames }
}
