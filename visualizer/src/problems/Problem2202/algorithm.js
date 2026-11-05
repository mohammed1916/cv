// LeetCode 2202: Maximize the Topmost Element After K Moves.
// After k moves the top can be any value that was removed and put back, or the original value at index k
// when it is still in place. With k = 1 the only option is to pull out the top and put back a different value.
// Taking the maximum of nums[0 .. k-2] covers every value we could have removed and returned in k-1 moves; if k is
// smaller than the length, nums[k] is also reachable (it is exposed by k pops and then placed on top).

const MAX_LEN = 10
const MAX_VALUE = 9
const MAX_K = 12

export function parseInput(text) {
  let spec
  try { spec = JSON.parse(text) } catch { throw new Error('Use JSON like {"nums":[5,2,2,4,0,6],"k":4}.') }
  if (!spec || !Array.isArray(spec.nums) || !Number.isInteger(spec.k)) throw new Error('Give a nums array and an integer k.')
  if (spec.nums.length < 1 || spec.nums.length > MAX_LEN) throw new Error(`Use 1 to ${MAX_LEN} values. The visualization caps the length there.`)
  if (!spec.nums.every(v => Number.isInteger(v) && v >= 0 && v <= MAX_VALUE)) throw new Error(`Each value is an integer from 0 to ${MAX_VALUE}.`)
  if (spec.k < 0 || spec.k > MAX_K) throw new Error(`k is an integer from 0 to ${MAX_K}.`)
  return { nums: spec.nums, k: spec.k }
}

export const code = `FUNCTION maximumTop(nums, k)
    IF k = 0 THEN RETURN nums[0]
    n ← length of nums
    IF n = 1 THEN
        IF k is odd THEN RETURN -1
        RETURN nums[0]
    ans ← max of nums[0 .. k - 2], or -1 if that range is empty
    IF k < n THEN ans ← max(ans, nums[k])
    RETURN ans`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def maximum_top(nums, k):
    if k == 0:
        return nums[0]
    n = len(nums)
    if n == 1:
        if k % 2:
            return -1
        return nums[0]
    ans = max(nums[: k - 1], default=-1)
    if k < n:
        ans = max(ans, nums[k])
    return ans
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
  { id: 'start', label: 'Pile', description: 'Read the pile and the number of moves.' },
  { id: 'scan', label: 'Candidates', description: 'Each value we can expose and return within k moves is a candidate.' },
  { id: 'done', label: 'Result', description: 'The best value that can sit on top.' },
]

export function buildTrace({ nums, k }) {
  const n = nums.length
  const frames = []
  const push = (phase, index, activeLine, pythonLine, message, extra = {}) => frames.push({ phase, index, activeLine, pythonLine, message, nums, k, ...extra })
  push('start', -1, L('IF k = 0'), P('if k == 0'), `The pile has ${n} value(s) and ${k} move(s).`)
  if (k === 0) {
    push('done', -1, L('RETURN nums[0]'), P('return nums[0]'), `No moves, so the top stays ${nums[0]}.`, { result: nums[0] })
    return { input: { nums, k }, result: nums[0], frames }
  }
  if (n === 1) {
    const result = k % 2 ? -1 : nums[0]
    push('done', -1, L('RETURN -1'), P('return -1'), k % 2 ? 'One value and an odd number of moves leaves the pile empty.' : 'Moves that undo themselves leave the single value on top.', { result })
    return { input: { nums, k }, result, frames }
  }
  let ans = -1
  const candidates = []
  for (let i = 0; i <= k - 2 && i < n; i++) candidates.push(i)
  for (const i of candidates) {
    ans = Math.max(ans, nums[i])
    push('scan', i, L('ans ← max of nums'), P('max(nums[: k - 1]'),
      `Candidate nums[${i}] = ${nums[i]}. Best so far ${ans}.`, { candidate: i, ans })
  }
  if (k < n) {
    ans = Math.max(ans, nums[k])
    push('scan', k, L('IF k < n THEN'), P('if k < n'), `nums[${k}] = ${nums[k]} is also reachable. Best ${ans}.`, { candidate: k, ans })
  }
  push('done', -1, L('RETURN ans'), P('return ans'), `The largest top value possible is ${ans}.`, { result: ans, ans })
  return { input: { nums, k }, result: ans, frames }
}
