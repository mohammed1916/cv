// Jump game VI: dp[i] = nums[i] + the best dp in the last k positions, found with a monotonic deque.
const JS_LINES = [
  { text: 'const n = nums.length', py: 'n = len(nums)' },
  { text: 'const dp = new Array(n).fill(0)', py: 'dp = [0] * n' },
  { text: 'dp[0] = nums[0]', py: 'dp[0] = nums[0]' },
  { text: 'const dq = [0]', py: 'dq = deque' },
  { text: 'for (let i = 1; i < n; i++) {', py: 'for i in range(1, n)' },
  { text: 'while (dq[0] < i - k) dq.shift()', py: 'while dq[0] < i - k' },
  { text: 'dp[i] = nums[i] + dp[dq[0]]', py: 'dp[i] = nums[i]' },
  { text: 'while (dq.length && dp[dq[dq.length - 1]] <= dp[i]) dq.pop()', py: 'while dq and dp[dq[-1]]' },
  { text: 'dq.push(i)', py: 'dq.append(i)' },
  { text: '}', py: null },
  { text: 'return dp[n - 1]', py: 'return dp[n - 1]' },
]

export const code = JS_LINES.map(({ text }, i) => ({ line: i + 1, text }))

export const python = `from collections import deque

def maxResult(nums, k):
    n = len(nums)
    dp = [0] * n
    dp[0] = nums[0]
    dq = deque([0])
    for i in range(1, n):
        while dq[0] < i - k:
            dq.popleft()
        dp[i] = nums[i] + dp[dq[0]]
        while dq and dp[dq[-1]] <= dp[i]:
            dq.pop()
        dq.append(i)
    return dp[n - 1]
`

const PY = python.split('\n')
const pyAt = needle => {
  const index = PY.findIndex(line => line.includes(needle))
  if (index < 0) throw new Error(`python line missing: ${needle}`)
  return index + 1
}
export const pythonLineMap = Object.fromEntries(JS_LINES.map((line, i) => [i + 1, pyAt(line.py ?? 'return dp[n - 1]')]))

export const phases = [
  { id: 'start', label: 'Start', description: 'Index 0 is the start, so its score is nums[0].' },
  { id: 'pick', label: 'Pick best', description: 'The deque front is the best score among the last k positions.' },
  { id: 'push', label: 'Keep deque', description: 'Drop smaller scores from the back: they can never be the best again.' },
  { id: 'done', label: 'Result', description: 'The score at the last index is the answer.' },
]

export const examples = [
  { label: 'Window of two', input: '{"nums":[3,-2,4,1,5],"k":2}' },
  { label: 'Jump of one', input: '{"nums":[2,6,-1,4],"k":1}' },
  { label: 'Large window', input: '{"nums":[-4,-3,2,-6,5],"k":4}' },
  { label: 'Single item window', input: '{"nums":[5],"k":1}' },
  { label: 'Whole array window', input: '{"nums":[-1,-2,-3],"k":3}' },
  { label: 'Equal values', input: '{"nums":[7,7,7,7],"k":2}' },
  { label: 'Long run: 16 numbers', input: '{"nums":[79,-78,-83,-11,42,48,-24,-13,-42,-98,-37,-65,-26,-67,-50,-98],"k":5}' },
]

export const complexity = 'O(n) time and O(n) space for n positions: each index enters and leaves the deque once.'

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.nums) || !Number.isInteger(input.k)) throw new Error('Use an object with nums and k.')
  const { nums, k } = input
  if (nums.length < 1 || nums.length > 16) throw new Error('nums has 1 to 16 integers (visual cap).')
  if (!nums.every(v => Number.isInteger(v) && Math.abs(v) <= 100)) throw new Error('nums values are integers from -100 to 100.')
  if (k < 1 || k > nums.length) throw new Error('k is from 1 to the length of nums.')
  return { nums, k }
}

export function buildTrace({ nums, k }) {
  const n = nums.length
  const dp = new Array(n).fill(0)
  const frames = []
  const deque = [0]
  dp[0] = nums[0]
  const snap = extra => ({ dp: [...dp], deque: [...deque], ...extra })
  frames.push({ phase: 'start', activeLine: 3, i: 0, message: `dp[0] = ${dp[0]}.`, snapshot: snap({}) })
  for (let i = 1; i < n; i++) {
    while (deque[0] < i - k) deque.shift()
    dp[i] = nums[i] + dp[deque[0]]
    frames.push({ phase: 'pick', activeLine: 7, i, from: deque[0], message: `dp[${i}] = ${nums[i]} + dp[${deque[0]}] = ${dp[i]}.`, snapshot: snap({ window: [Math.max(0, i - k), i - 1] }) })
    while (deque.length && dp[deque[deque.length - 1]] <= dp[i]) deque.pop()
    deque.push(i)
    frames.push({ phase: 'push', activeLine: 9, i, message: `Deque now holds indices [${deque.join(', ')}].`, snapshot: snap({ window: [Math.max(0, i - k), i - 1] }) })
  }
  frames.push({ phase: 'done', activeLine: 11, i: n - 1, result: dp[n - 1], message: `Answer is dp[${n - 1}] = ${dp[n - 1]}.`, snapshot: snap({ result: dp[n - 1] }) })
  return { input: { nums, k }, result: dp[n - 1], frames }
}
