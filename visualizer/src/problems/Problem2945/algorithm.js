const MAX_LENGTH = 8
const MAX_VALUE = 6

export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > MAX_LENGTH) throw new Error(`Use an array of 1 to ${MAX_LENGTH} integers.`)
  if (nums.some(v => !Number.isInteger(v) || v < 1 || v > MAX_VALUE)) throw new Error(`Values are integers from 1 to ${MAX_VALUE}.`)
  return nums
}

export const code = `maximum number of pieces whose sums never decrease, where pieces are contiguous
  set prefix[i] to the sum of the first i numbers
  set ways[i][0] to 1 for each i from 1 to n, a single piece covering the first i numbers
  for each end i from 1 to n
    for each start j from 1 to i minus 1
      for each earlier start k from 0 to j minus 1
        if ways[j][k] is set and the piece sum of nums[k..j) is at most the sum of nums[j..i) then
          set ways[i][j] to the larger of ways[i][j] and ways[j][k] plus 1
  return the largest ways[n][j]`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export function buildTrace(nums) {
  const n = nums.length
  const prefix = [0]
  nums.forEach((v, i) => prefix.push(prefix[i] + v))
  const ways = Array.from({ length: n + 1 }, () => Array(n + 1).fill(null))
  for (let i = 1; i <= n; i++) ways[i][0] = 1
  const snapshot = () => ways.map(row => [...row])
  const frames = [{ phase: 'start', end: 0, start: null, ways: snapshot(), activeLine: L('set prefix[i]'), message: 'Each prefix can be one piece, so ways[i][0] is 1.' }]
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j < i; j++) {
      for (let k = 0; k < j; k++) {
        if (ways[j][k] !== null && prefix[j] - prefix[k] <= prefix[i] - prefix[j]) {
          const candidate = ways[j][k] + 1
          if (ways[i][j] === null || candidate > ways[i][j]) {
            ways[i][j] = candidate
            frames.push({ phase: 'extend', end: i, start: j, ways: snapshot(), activeLine: L('set ways[i][j] to the larger'), message: `Last piece nums[${j}..${i}) can follow nums[${k}..${j}); ways[${i}][${j}] is ${candidate}.` })
          }
        }
      }
    }
  }
  let result = 0
  for (let j = 0; j < n; j++) if (ways[n][j] !== null && ways[n][j] > result) result = ways[n][j]
  frames.push({ phase: 'done', end: n, start: null, ways: snapshot(), activeLine: L('return the largest ways'), message: `Longest non-decreasing array: ${result} pieces.` })
  return { input: nums, result, frames }
}

export const python = `def find_maximum_non_decreasing_length(nums):
    n = len(nums)
    prefix = [0] * (n + 1)
    for i, v in enumerate(nums):
        prefix[i + 1] = prefix[i] + v
    ways = [[None] * (n + 1) for _ in range(n + 1)]
    for i in range(1, n + 1):
        ways[i][0] = 1
    for i in range(1, n + 1):
        for j in range(1, i):
            for k in range(j):
                if ways[j][k] is not None and prefix[j] - prefix[k] <= prefix[i] - prefix[j]:
                    cand = ways[j][k] + 1
                    if ways[i][j] is None or cand > ways[i][j]:
                        ways[i][j] = cand
    return max(v for v in ways[n] if v is not None)
`
