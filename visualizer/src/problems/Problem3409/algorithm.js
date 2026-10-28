export function parseInput(text) {
  const data = JSON.parse(text)
  const nums = data?.nums
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 7 || nums.some(v => !Number.isInteger(v) || v < 1 || v > 100)) {
    throw new Error('nums must be 1 to 7 integers, each from 1 to 100.')
  }
  return { nums }
}

export const code = `longest decreasing difference subsequence(nums)
  n = length of nums
  best = the smaller of n and 2
  length = table of n by n, filled with 0
  for i from 0 to n - 1
    for j from 0 to i - 1
      length[j][i] = 2
      for k from 0 to j - 1
        if |nums[j] - nums[k]| > |nums[i] - nums[j]| then length[j][i] = max(length[j][i], length[k][j] + 1)
      best = max(best, length[j][i])
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

const copy = table => table.map(row => [...row])

// length[j][i] is the longest valid subsequence whose last two positions are j and i, so the difference before j must be larger than the one from j to i.
export function buildTrace({ nums }) {
  const n = nums.length
  const length = Array.from({ length: n }, () => Array(n).fill(0))
  let best = Math.min(n, 2)
  const frames = [{ phase: 'start', cell: null, table: copy(length), activeLine: L('best = the smaller'), message: `Pairs of positions form the shortest valid subsequences.` }]
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < i; j++) {
      length[j][i] = 2
      for (let k = 0; k < j; k++) {
        if (Math.abs(nums[j] - nums[k]) > Math.abs(nums[i] - nums[j])) length[j][i] = Math.max(length[j][i], length[k][j] + 1)
      }
      best = Math.max(best, length[j][i])
      frames.push({ phase: 'pair', cell: [j, i], table: copy(length), activeLine: L('length[j][i] = 2'), message: `Ending at positions ${j} and ${i}, the longest valid subsequence has length ${length[j][i]}.` })
    }
  }
  frames.push({ phase: 'done', cell: null, table: copy(length), activeLine: L('return best'), message: `Longest subsequence: ${best}.` })
  return { input: { nums }, result: best, frames }
}

export const python = `def longest_decreasing_difference(nums):
    n = len(nums)
    best = min(n, 2)
    length = [[0] * n for _ in range(n)]
    for i in range(n):
        for j in range(i):
            length[j][i] = 2
            for k in range(j):
                if abs(nums[j] - nums[k]) > abs(nums[i] - nums[j]):
                    length[j][i] = max(length[j][i], length[k][j] + 1)
            best = max(best, length[j][i])
    return best
`
