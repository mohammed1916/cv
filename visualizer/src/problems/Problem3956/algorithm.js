export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || !Array.isArray(data.nums) || ![data.m, data.l, data.r].every(Number.isInteger)) throw new Error('Use {"nums": [...], "m": m, "l": l, "r": r}.')
  const { nums, m, l, r } = data
  if (nums.length < 1 || nums.length > 8) throw new Error('nums must have 1 to 8 entries for the visualization.')
  if (nums.some(v => !Number.isInteger(v) || v < -20 || v > 20)) throw new Error('nums entries are integers from -20 to 20.')
  const n = nums.length
  if (m < 1 || m > n) throw new Error('m is an integer from 1 to n.')
  if (l < 1 || r < l || r > n) throw new Error('Need 1 <= l <= r <= n.')
  return { nums, m, l, r }
}

export function buildTrace(input) {
  const { nums, m, l, r } = input
  const n = nums.length
  const top = Math.min(m, n)
  const prefix = [0]
  for (const x of nums) prefix.push(prefix[prefix.length - 1] + x)
  const best = Array.from({ length: n + 1 }, () => Array(top + 1).fill(-Infinity))
  for (let i = 0; i <= n; i++) best[i][0] = 0
  const frames = [{ phase: 'start', activeLine: L('let prefix be'), i: 0, row: [...best[0]], message: `Build the table best[i][j]: the most total using j subarrays in the first i values.` }]
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= top; j++) {
      let option = best[i - 1][j]
      for (let length = l; length <= Math.min(r, i); length++) {
        const start = i - length
        const candidate = best[start][j - 1] + (prefix[i] - prefix[start])
        if (candidate > option) option = candidate
      }
      best[i][j] = option
    }
    frames.push({ phase: 'row', activeLine: L('for each end position i'), i, row: [...best[i]], message: `After ${i} value(s): ${best[i].slice(1).map((v, idx) => `${idx + 1} subarray(s) give ${v}`).join(', ')}.` })
  }
  let result = -Infinity
  for (let j = 1; j <= top; j++) if (best[n][j] > result) result = best[n][j]
  frames.push({ phase: 'done', activeLine: L('return the largest'), i: n, row: [...best[n]], message: `Best total with 1 to ${top} subarrays: ${result}.` })
  return { input, result, frames }
}

export const code = `maximum total of 1 to m non-overlapping subarrays with lengths in [l, r]
  let prefix be the running sums of nums
  let best be a table with best[i][j] for the first i values and j subarrays, best[i][0] is 0
  for each end position i from 1 to n
    for each count j from 1 to m
      let option be best[i-1][j], which skips value i
      for each length from l to r that fits ending at i
        let start be i minus length
        let candidate be best[start][j-1] plus the sum from start to i
        if candidate is larger than option then set option to candidate
      set best[i][j] to option
  return the largest best[n][j] for j from 1 to m`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_sum_m_non_overlapping_subarrays(nums, m, l, r):
    n = len(nums)
    top = min(m, n)
    prefix = [0]
    for x in nums:
        prefix.append(prefix[-1] + x)
    NEG = float('-inf')
    best = [[NEG] * (top + 1) for _ in range(n + 1)]
    for i in range(n + 1):
        best[i][0] = 0
    for i in range(1, n + 1):
        for j in range(1, top + 1):
            option = best[i - 1][j]
            for length in range(l, min(r, i) + 1):
                start = i - length
                candidate = best[start][j - 1] + (prefix[i] - prefix[start])
                if candidate > option:
                    option = candidate
            best[i][j] = option
    return max(best[n][j] for j in range(1, top + 1))
`
