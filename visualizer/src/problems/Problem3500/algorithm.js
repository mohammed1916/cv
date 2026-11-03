const line = (text) => text.split('\n').map((t, index) => ({ line: index + 1, text: t }))

export const code = line(`read the prefix sums P of nums and C of cost
dp[0][0] = 0, every other entry infinite
for each number of subarrays i from 1 to n
  for each end r from 1 to n
    dp[i][r] = smallest dp[i-1][l] + (P[r] + k*i) * (C[r] - C[l]) over starts l < r
return the smallest dp[i][n] over all i`)

const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_cost(nums, cost, k):
    n = len(nums)
    P = [0]
    C = [0]
    for x, c in zip(nums, cost):
        P.append(P[-1] + x)
        C.append(C[-1] + c)
    INF = float('inf')
    prev = [0] + [INF] * n
    best = INF
    for i in range(1, n + 1):
        cur = [INF] * (n + 1)
        for r in range(1, n + 1):
            for l in range(r):
                if prev[l] < INF:
                    cand = prev[l] + (P[r] + k * i) * (C[r] - C[l])
                    cur[r] = min(cur[r], cand)
        best = min(best, cur[n])
        prev = cur
    return best`

const MAX_LENGTH = 8
const MAX_VALUE = 9

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums, cost and k.')
  const { nums, cost, k } = input
  const valid = list => Array.isArray(list) && list.length >= 1 && list.length <= MAX_LENGTH
    && list.every(v => Number.isInteger(v) && v >= 1 && v <= MAX_VALUE)
  if (!valid(nums)) throw new Error(`nums has 1 to ${MAX_LENGTH} integers from 1 to ${MAX_VALUE}.`)
  if (!valid(cost) || cost.length !== nums.length) throw new Error('cost must have the same length as nums, with the same value range.')
  if (!Number.isInteger(k) || k < 1 || k > MAX_VALUE) throw new Error(`k is an integer from 1 to ${MAX_VALUE}.`)
  return { nums, cost, k }
}

const shown = v => (v === Infinity ? '∞' : String(v))

// Knowledge-derived model: layer i holds the best cost of splitting a prefix into i subarrays.
// The i-th subarray adds k*i to the prefix sum of nums at its end, multiplied by its cost sum.
export function buildTrace({ nums, cost, k }) {
  const n = nums.length
  const P = [0]
  const C = [0]
  for (let idx = 0; idx < n; idx++) { P.push(P[idx] + nums[idx]); C.push(C[idx] + cost[idx]) }
  const frames = []
  let prev = Array.from({ length: n + 1 }, (_, r) => (r === 0 ? 0 : Infinity))
  let best = Infinity
  frames.push({ pythonLine: 3, phase: 'setup', activeLine: L('read the prefix'), layer: 0, end: -1, start: -1, cur: prev, P, C, candidate: null, result: null,
    message: `Prefix sums of nums: ${P.join(', ')}. Prefix sums of cost: ${C.join(', ')}.` })
  for (let i = 1; i <= n; i++) {
    const cur = Array.from({ length: n + 1 }, () => Infinity)
    frames.push({ pythonLine: 11, phase: 'layer', activeLine: L('for each number of subarrays'), layer: i, end: -1, start: -1, cur: [...cur], P, C, candidate: null, result: null,
      message: `Layer ${i}: split the prefix into ${i} subarray${i === 1 ? '' : 's'}.` })
    for (let r = 1; r <= n; r++) {
      for (let l = 0; l < r; l++) {
        if (prev[l] === Infinity) continue
        const candidate = prev[l] + (P[r] + k * i) * (C[r] - C[l])
        if (candidate < cur[r]) cur[r] = candidate
        frames.push({ pythonLine: 16, phase: 'cut', activeLine: L('dp[i][r] ='), layer: i, end: r, start: l, cur: [...cur], P, C, candidate, result: null,
          message: `End ${r}, start ${l}: ${prev[l]} + (${P[r]} + ${k}*${i}) * ${C[r] - C[l]} = ${candidate}.` })
      }
    }
    best = Math.min(best, cur[n])
    prev = cur
  }
  const result = best
  frames.push({ pythonLine: 20, phase: 'done', activeLine: L('return the smallest'), layer: n, end: n, start: -1, cur: prev, P, C, candidate: null, result,
    message: `Smallest total over every number of subarrays: ${shown(result)}.` })
  return { input: { nums, cost, k }, frames, result }
}
