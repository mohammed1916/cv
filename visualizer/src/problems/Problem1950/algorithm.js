// LeetCode 1950: for each element, the widest window where it is the minimum gives a length; a monotonic stack finds those boundaries.
const SOURCE = [
  "function findMaximumMinimums(nums) {",
  "  const n = nums.length",
  "  const left = new Array(n), right = new Array(n)",
  "  let stack = []",
  "  for (let i = 0; i < n; i++) {",
  "    while (stack.length && nums[stack[stack.length - 1]] >= nums[i]) stack.pop()",
  "    left[i] = stack.length ? stack[stack.length - 1] : -1",
  "    stack.push(i)",
  "  }",
  "  stack = []",
  "  for (let i = n - 1; i >= 0; i--) {",
  "    while (stack.length && nums[stack[stack.length - 1]] >= nums[i]) stack.pop()",
  "    right[i] = stack.length ? stack[stack.length - 1] : n",
  "    stack.push(i)",
  "  }",
  "  const best = new Array(n + 2).fill(0)",
  "  for (let i = 0; i < n; i++) {",
  "    const len = right[i] - left[i] - 1",
  "    best[len] = Math.max(best[len], nums[i])",
  "  }",
  "  for (let len = n - 1; len >= 1; len--) best[len] = Math.max(best[len], best[len + 1])",
  "  return best.slice(1, n + 1)",
  "}",
]

export const code = SOURCE.map((text, index) => ({ line: index + 1, text }))

export const python = `def find_maximum_minimums(nums):
    n = len(nums)
    left = [0] * n
    right = [0] * n
    stack = []
    for i in range(n):
        while stack and nums[stack[-1]] >= nums[i]:
            stack.pop()
        left[i] = stack[-1] if stack else -1
        stack.append(i)
    stack = []
    for i in range(n - 1, -1, -1):
        while stack and nums[stack[-1]] >= nums[i]:
            stack.pop()
        right[i] = stack[-1] if stack else n
        stack.append(i)
    best = [0] * (n + 2)
    for i in range(n):
        length = right[i] - left[i] - 1
        best[length] = max(best[length], nums[i])
    for length in range(n - 1, 0, -1):
        best[length] = max(best[length], best[length + 1])
    return best[1:n + 1]
`

const L = text => { const i = SOURCE.findIndex(line => line.includes(text)); if (i < 0) throw new Error(`no code line: ${text}`); return i + 1 }
const P = text => { const i = python.split('\n').findIndex(line => line.includes(text)); if (i < 0) throw new Error(`no python line: ${text}`); return i + 1 }

export const phases = [
  { id: 'left', label: 'Left borders', description: 'Find the nearest smaller value on the left.' },
  { id: 'right', label: 'Right borders', description: 'Find the nearest smaller value on the right.' },
  { id: 'spans', label: 'Record spans', description: 'Record the best minimum for each window length.' },
  { id: 'spread', label: 'Spread', description: 'A longer window also serves shorter lengths.' },
  { id: 'done', label: 'Result', description: 'Answer for every window size.' },
]

export function parseInput(text) {
  let nums
  try { nums = JSON.parse(text) } catch { throw new Error('Enter a JSON array of integers, for example [3,1,2].') }
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 12 || !nums.every(v => Number.isInteger(v) && Math.abs(v) <= 100000)) throw new Error('Use 1 to 12 integers up to 100000 in size.')
  return { nums }
}

export function buildTrace({ nums }) {
  const n = nums.length
  const left = new Array(n), right = new Array(n)
  const frames = []
  let stack = []
  for (let i = 0; i < n; i++) {
    while (stack.length && nums[stack[stack.length - 1]] >= nums[i]) stack.pop()
    left[i] = stack.length ? stack[stack.length - 1] : -1
    stack.push(i)
    frames.push({ phase: 'left', activeLine: L('left[i] = stack.length'), pythonLine: P('left[i] = stack'), message: `Nearest smaller value on the left of index ${i}: ${left[i] === -1 ? 'none' : 'index ' + left[i]}.`, i, left: [...left.slice(0, i + 1)], right: [], best: null })
  }
  stack = []
  for (let i = n - 1; i >= 0; i--) {
    while (stack.length && nums[stack[stack.length - 1]] >= nums[i]) stack.pop()
    right[i] = stack.length ? stack[stack.length - 1] : n
    stack.push(i)
    frames.push({ phase: 'right', activeLine: L('right[i] = stack.length'), pythonLine: P('right[i] = stack'), message: `Nearest smaller value on the right of index ${i}: ${right[i] === n ? 'none' : 'index ' + right[i]}.`, i, left: [...left], right: [...right].map((v, k) => (k >= i ? v : undefined)), best: null })
  }
  const best = new Array(n + 2).fill(0)
  for (let i = 0; i < n; i++) {
    const len = right[i] - left[i] - 1
    best[len] = Math.max(best[len], nums[i])
    frames.push({ phase: 'spans', activeLine: L('best[len] = Math.max'), pythonLine: P('best[length] = max'), message: `Index ${i} is the minimum of windows of length ${len}; candidate ${nums[i]}.`, i, left: [...left], right: [...right], span: [left[i] + 1, right[i] - 1], len, best: [...best] })
  }
  for (let len = n - 1; len >= 1; len--) {
    best[len] = Math.max(best[len], best[len + 1])
    frames.push({ phase: 'spread', activeLine: L('for (let len = n - 1'), pythonLine: P('for length in range(n - 1'), message: `Length ${len} can use any longer window's minimum: best ${best[len]}.`, i: -1, left: [...left], right: [...right], span: null, len, best: [...best] })
  }
  const result = best.slice(1, n + 1)
  frames.push({ phase: 'done', activeLine: L('return best.slice'), pythonLine: P('return best[1:'), message: `Answers by window size: ${result.join(', ')}.`, i: -1, left: [...left], right: [...right], span: null, len: null, best: [...best], result })
  return { input: { nums }, result, frames }
}
