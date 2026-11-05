// LeetCode 2263: Make Array Non-decreasing or Non-increasing.
// Each element can move by one per operation, so the cost of setting nums[i] to v is |nums[i] - v|.
// An optimal target value can always be chosen among the original values. For each orientation a
// DP runs over those candidate values: dp[v] is the cheapest cost so far ending at candidate v.

const MAX_LEN = 12
const MAX_ABS = 50

export function parseInput(text) {
  let nums
  try { nums = JSON.parse(text) } catch { throw new Error('Use a JSON array of integers, e.g. [3,1,2].') }
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > MAX_LEN) throw new Error(`Use 1 to ${MAX_LEN} integers. The visualization caps the length at ${MAX_LEN}.`)
  if (!nums.every(v => Number.isInteger(v) && Math.abs(v) <= MAX_ABS)) throw new Error(`Each value is an integer from -${MAX_ABS} to ${MAX_ABS}.`)
  return { nums }
}

export const code = `function minOperations(nums) {
  const values = [...new Set(nums)].sort((a, b) => a - b);
  const bestCost = decreasing => {
    let dp = values.map(v => Math.abs(nums[0] - v));
    for (const x of nums.slice(1)) {
      const next = values.map((v, idx) => {
        const prev = decreasing ? Math.min(...dp.slice(idx)) : Math.min(...dp.slice(0, idx + 1));
        return Math.abs(x - v) + prev;
      });
      dp = next;
    }
    return Math.min(...dp);
  };
  return Math.min(bestCost(false), bestCost(true));
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def min_operations(nums):
    values = sorted(set(nums))
    def best_cost(decreasing):
        dp = [abs(nums[0] - v) for v in values]
        for x in nums[1:]:
            nxt = []
            for idx, v in enumerate(values):
                prev = min(dp[idx:]) if decreasing else min(dp[:idx + 1])
                nxt.append(abs(x - v) + prev)
            dp = nxt
        return min(dp)
    return min(best_cost(False), best_cost(True))
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
  { id: 'start', label: 'Candidates', description: 'Use the distinct original values as targets.' },
  { id: 'row', label: 'Element', description: 'Extend the DP table by one element.' },
  { id: 'orient', label: 'Orientation', description: 'Finish one orientation and record its cost.' },
  { id: 'done', label: 'Result', description: 'The cheaper orientation.' },
]

function bestCost(nums, values, decreasing, frames, label) {
  const m = values.length
  let dp = values.map(v => Math.abs(nums[0] - v))
  frames.push({ phase: 'row', orientation: label, activeLine: L('let dp = values.map'), pythonLine: P('dp = [abs(nums[0] - v)'), message: `${label}: element 0 costs ${dp.join(', ')} for targets ${values.join(', ')}.`, index: 0, table: [dp.slice()], values, costs: dp.slice(), result: null })
  const table = [dp.slice()]
  for (let i = 1; i < nums.length; i++) {
    const next = Array(m).fill(0)
    for (let v = 0; v < m; v++) {
      const prev = decreasing ? Math.min(...dp.slice(v)) : Math.min(...dp.slice(0, v + 1))
      next[v] = Math.abs(nums[i] - values[v]) + prev
    }
    dp = next
    table.push(dp.slice())
    frames.push({ phase: 'row', orientation: label, activeLine: L('const next = values.map'), pythonLine: P('nxt.append('), message: `${label}: element ${i} (${nums[i]}) row added; ${decreasing ? 'earlier targets are at least as large' : 'earlier targets are at most as large'}.`, index: i, table: table.map(r => r.slice()), values, costs: dp.slice(), result: null })
  }
  const result = Math.min(...dp)
  frames.push({ phase: 'orient', orientation: label, activeLine: L('return Math.min(...dp)'), pythonLine: P('return min(best_cost(False)') , message: `${label} costs ${result} at best.`, index: nums.length - 1, table: table.map(r => r.slice()), values, costs: dp.slice(), result })
  return result
}

export function buildTrace({ nums }) {
  const values = [...new Set(nums)].sort((a, b) => a - b)
  const frames = []
  frames.push({ phase: 'start', activeLine: L('const values ='), pythonLine: P('values = sorted(set(nums))'), message: `Candidate targets: ${values.join(', ')}.`, orientation: null, index: -1, table: [], values, costs: [], result: null })
  const up = bestCost(nums, values, false, frames, 'non-decreasing')
  const down = bestCost(nums, values, true, frames, 'non-increasing')
  const result = Math.min(up, down)
  frames.push({ phase: 'done', activeLine: L('return Math.min(bestCost'), pythonLine: P('return min(best_cost(False), best_cost(True))'), message: `Non-decreasing costs ${up}, non-increasing costs ${down}: the answer is ${result}.`, orientation: null, index: nums.length - 1, table: [], values, costs: [], result, up, down })
  return { input: { nums }, result, frames }
}
