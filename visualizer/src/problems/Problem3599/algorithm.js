export function parseInput(text) {
  const data = JSON.parse(text)
  const { nums, k } = data ?? {}
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 6 || nums.some(v => !Number.isInteger(v) || v < 1 || v > 15)) {
    throw new Error('nums must be 1 to 6 integers, each from 1 to 15.')
  }
  if (!Number.isInteger(k) || k < 1 || k > nums.length) throw new Error('k must be an integer from 1 to the length of nums.')
  return { nums, k }
}

export const code = `minimum sum of xor parts(nums, k)
  n = length of nums
  best = table of k + 1 rows and n + 1 columns, filled with infinity
  best[0][0] = 0
  for parts from 1 to k
    for end from 1 to n
      xor = 0
      for start from end - 1 down to 0
        xor = xor of nums[start] into the running value
        best[parts][end] = min(best[parts][end], best[parts - 1][start] + xor)
  return best[k][n]`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

// best[p][e] is the least total for splitting the first e values into p non-empty pieces, each costing the XOR of its values.
export function buildTrace({ nums, k }) {
  const n = nums.length
  const best = Array.from({ length: k + 1 }, () => Array(n + 1).fill(Infinity))
  best[0][0] = 0
  const show = () => best.map(row => row.map(v => (Number.isFinite(v) ? v : '∞')))
  const frames = [{ phase: 'start', cell: [0, 0], table: show(), activeLine: L('best[0][0] = 0'), message: 'Zero values split into zero pieces at cost zero.' }]
  for (let parts = 1; parts <= k; parts++) {
    for (let end = 1; end <= n; end++) {
      let xor = 0
      for (let start = end - 1; start >= 0; start--) {
        xor ^= nums[start]
        const candidate = best[parts - 1][start] + xor
        if (candidate < best[parts][end]) best[parts][end] = candidate
      }
      frames.push({ phase: 'cell', cell: [parts, end], table: show(), activeLine: L('for start from end - 1'), message: `${end} values in ${parts} piece${parts === 1 ? '' : 's'}: cheapest total ${best[parts][end]}.` })
    }
  }
  const result = best[k][n]
  frames.push({ phase: 'done', cell: [k, n], table: show(), activeLine: L('return best[k][n]'), message: `Minimum total XOR: ${result}.` })
  return { input: { nums, k }, result, frames }
}

export const python = `def min_xor_partition(nums, k):
    n = len(nums)
    INF = float('inf')
    best = [[INF] * (n + 1) for _ in range(k + 1)]
    best[0][0] = 0
    for parts in range(1, k + 1):
        for end in range(1, n + 1):
            xor = 0
            for start in range(end - 1, -1, -1):
                xor ^= nums[start]
                best[parts][end] = min(best[parts][end], best[parts - 1][start] + xor)
    return best[k][n]
`
