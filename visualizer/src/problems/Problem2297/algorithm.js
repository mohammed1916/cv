const MAX_LENGTH = 12
const MAX_VALUE = 99
const MAX_COST = 99

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums and costs.')
  const { nums, costs } = input
  for (const [name, list, max] of [['nums', nums, MAX_VALUE], ['costs', costs, MAX_COST]]) {
    if (!Array.isArray(list) || list.length < 2 || list.length > MAX_LENGTH) throw new Error(`${name} has 2 to ${MAX_LENGTH} entries.`)
    for (const v of list) {
      if (!Number.isInteger(v) || v < 0 || v > max) throw new Error(`${name} holds whole numbers from 0 to ${max}.`)
    }
  }
  if (nums.length !== costs.length) throw new Error('nums and costs need the same length.')
  return { nums, costs }
}

export const code = `minimum total cost to reach the last index from index 0
dp[0] = 0, since the starting cost is not paid
peaks = [0] (indices whose value beats everything after them so far, values strictly decreasing)
valleys = [0] (indices whose value is at most everything after them so far, values non-decreasing)
for j from 1 to the last index
  best = infinity
  while peaks is not empty and nums[peaks top] is at most nums[j]
    best = min(best, dp[peaks top]) and pop it
  while valleys is not empty and nums[valleys top] is greater than nums[j]
    best = min(best, dp[valleys top]) and pop it
  dp[j] = best + costs[j]
  push j onto peaks and onto valleys
return dp[last index]`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def min_jump_cost(nums, costs):
    n = len(nums)
    dp = [0] * n
    peaks = [0]
    valleys = [0]
    for j in range(1, n):
        best = float('inf')
        while peaks and nums[peaks[-1]] <= nums[j]:
            best = min(best, dp[peaks.pop()])
        while valleys and nums[valleys[-1]] > nums[j]:
            best = min(best, dp[valleys.pop()])
        dp[j] = best + costs[j]
        peaks.append(j)
        valleys.append(j)
    return dp[n - 1]
`

const L = text => {
  const index = code.findIndex(line => line.text.includes(text))
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return index + 1
}
const PY_LINES = python.split('\n')
const PL = text => {
  const index = PY_LINES.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing python line: ${text}`)
  return index + 1
}

// Jumps are shown as arcs: kind 'peak' means nums[i] <= nums[j] (case 1), 'valley' means nums[i] > nums[j] (case 2).
export function buildTrace({ nums, costs }) {
  const n = nums.length
  const dp = Array(n).fill(null)
  dp[0] = 0
  let peaks = [0]
  let valleys = [0]
  const frames = []
  const snap = extra => ({
    nums, costs, n, dp: dp.slice(), peaks: peaks.slice(), valleys: valleys.slice(),
    ...extra,
  })

  frames.push(snap({
    phase: 'start', activeLine: L('dp[0] = 0'), pythonLine: PL('dp = [0] * n'),
    j: 0, arcs: [], best: null, bestFrom: null, bestKind: null,
    message: 'Index 0 costs nothing to stand on. Both stacks start with index 0.',
  }))

  for (let j = 1; j < n; j++) {
    let best = Infinity
    let bestFrom = null
    let bestKind = null
    const arcs = []
    frames.push(snap({
      phase: 'scan', activeLine: L('for j from 1'), pythonLine: PL('for j in range(1, n)'),
      j, arcs: [], best: null, bestFrom: null, bestKind: null,
      message: `Index ${j} (value ${nums[j]}, cost ${costs[j]}). Look at the candidate sources still on the stacks.`,
    }))
    while (peaks.length && nums[peaks[peaks.length - 1]] <= nums[j]) {
      const i = peaks.pop()
      arcs.push({ from: i, kind: 'peak' })
      if (dp[i] < best) { best = dp[i]; bestFrom = i; bestKind = 'peak' }
      frames.push(snap({
        phase: 'peak', activeLine: L('while peaks is not empty'), pythonLine: PL('while peaks and'),
        j, arcs: arcs.map(a => ({ ...a })), best, bestFrom, bestKind,
        message: `Peak ${i} (value ${nums[i]}) is at most ${nums[j]} with only smaller values between, so jump ${i} to ${j} is allowed.`,
      }))
    }
    while (valleys.length && nums[valleys[valleys.length - 1]] > nums[j]) {
      const i = valleys.pop()
      arcs.push({ from: i, kind: 'valley' })
      if (dp[i] < best) { best = dp[i]; bestFrom = i; bestKind = 'valley' }
      frames.push(snap({
        phase: 'valley', activeLine: L('while valleys is not empty'), pythonLine: PL('while valleys and'),
        j, arcs: arcs.map(a => ({ ...a })), best, bestFrom, bestKind,
        message: `Valley ${i} (value ${nums[i]}) is above ${nums[j]} with only values at least ${nums[i]} between, so jump ${i} to ${j} is allowed.`,
      }))
    }
    dp[j] = best + costs[j]
    peaks.push(j)
    valleys.push(j)
    frames.push(snap({
      phase: 'store', activeLine: L('dp[j] = best + costs[j]'), pythonLine: PL('dp[j] = best + costs[j]'),
      j, arcs: arcs.map(a => ({ ...a })), best, bestFrom, bestKind,
      message: `dp[${j}] = ${best} + ${costs[j]} = ${dp[j]}. Index ${j} is now on both stacks.`,
    }))
  }

  frames.push(snap({
    phase: 'done', activeLine: L('return dp[last index]'), pythonLine: PL('return dp[n - 1]'),
    j: n - 1, arcs: [], best: null, bestFrom: null, bestKind: null,
    message: `The minimum cost to reach index ${n - 1} is ${dp[n - 1]}.`,
  }))
  return { input: { nums, costs }, result: dp[n - 1], dp: dp.slice(), frames }
}
