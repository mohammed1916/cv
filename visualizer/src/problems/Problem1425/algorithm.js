export const phases = [
  { id: 'start', label: 'Start', description: 'Set up the best-sum table and an empty monotonic window of candidate indices.' },
  { id: 'expire', label: 'Expire window', description: 'Remove indices that are too far back to be a valid previous pick.' },
  { id: 'extend', label: 'Extend sum', description: 'The best sum ending here is this value plus the best valid earlier sum, or just this value if that is larger.' },
  { id: 'store', label: 'Keep monotonic', description: 'Drop weaker candidates from the back, then append this index so the window stays in decreasing order of best sum.' },
  { id: 'done', label: 'Complete', description: 'The answer is the largest best-sum value seen at any index.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object such as {"nums": [4, -1, 3], "k": 2}.')
  const { nums, k } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 16 || !nums.every(v => Number.isInteger(v) && Math.abs(v) <= 100)) throw new Error('nums is a list of 1 to 16 integers from -100 to 100.')
  if (!Number.isInteger(k) || k < 1 || k > nums.length) throw new Error('k is an integer from 1 to the length of nums.')
  return { nums, k }
}

export function buildTrace({ nums, k }) {
  const n = nums.length
  const dp = []
  let window = []
  let answer = -Infinity
  const snap = (current, extra = {}) => ({ current, window: [...window], dp: dp.slice(), answer: answer === -Infinity ? null : answer, ...extra })
  const frames = [{ phase: 'start', activeLine: L('const dp = Array'), pythonLine: P('dp = [0]'), snapshot: snap(null), message: `Window size k = ${k}. Each index can extend a pick made at most ${k} places earlier.` }]
  for (let i = 0; i < n; i++) {
    const dropped = []
    while (window.length && window[0] < i - k) dropped.push(window.shift())
    if (dropped.length) frames.push({ phase: 'expire', activeLine: L('window.shift()'), pythonLine: P('window.pop(0)'), snapshot: snap(i, { dropped }), message: `Indices ${dropped.join(', ')} are more than ${k} places back, so they cannot precede index ${i}.` })
    const best = window.length ? Math.max(0, dp[window[0]]) : 0
    dp[i] = nums[i] + best
    answer = Math.max(answer, dp[i])
    frames.push({ phase: 'extend', activeLine: L('dp[i] = nums[i] + best'), pythonLine: P('dp[i] = value + best'), snapshot: snap(i, { best }), message: `Index ${i} has value ${nums[i]} and best earlier extension ${best}, so dp[${i}] = ${dp[i]}. Answer so far: ${answer}.` })
    const popped = []
    while (window.length && dp[window[window.length - 1]] <= dp[i]) popped.push(window.pop())
    window.push(i)
    frames.push({ phase: 'store', activeLine: L('window.push(i)'), pythonLine: P('window.append(i)'), snapshot: snap(i, { popped }), message: `${popped.length ? `Removed weaker candidates ${popped.join(', ')} from the back. ` : ''}Index ${i} joins the window with dp ${dp[i]}.` })
  }
  const result = answer
  frames.push({ phase: 'done', activeLine: L('return answer'), pythonLine: P('return answer'), snapshot: snap(null, { result }), message: `The largest valid subsequence sum is ${result}.` })
  return { input: { nums, k }, result, frames }
}

export const code = `function constrainedSubsetSum(nums, k) {
  const dp = Array(nums.length).fill(0)
  const window = []
  let answer = -Infinity
  for (let i = 0; i < nums.length; i++) {
    while (window.length && window[0] < i - k) window.shift()
    const best = window.length ? Math.max(0, dp[window[0]]) : 0
    dp[i] = nums[i] + best
    while (window.length && dp[window[window.length - 1]] <= dp[i]) window.pop()
    window.push(i)
    answer = Math.max(answer, dp[i])
  }
  return answer
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def constrained_subset_sum(nums, k):
    dp = [0] * len(nums)
    window = []
    answer = float("-inf")
    for i, value in enumerate(nums):
        while window and window[0] < i - k:
            window.pop(0)
        best = max(0, dp[window[0]]) if window else 0
        dp[i] = value + best
        while window and dp[window[-1]] <= dp[i]:
            window.pop()
        window.append(i)
        answer = max(answer, dp[i])
    return answer`
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1
