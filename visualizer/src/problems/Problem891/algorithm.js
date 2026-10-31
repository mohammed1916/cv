const MOD = 1000000007

export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 200 || nums.some(v => !Number.isInteger(v) || v < 1 || v > 100000)) {
    throw new Error('Enter a JSON array of 1–200 integers (visualization cap), each between 1 and 100,000.')
  }
  return nums
}

const mod = x => ((x % MOD) + MOD) % MOD

export function buildTrace(input) {
  const n = input.length
  const nums = [...input].sort((a, b) => a - b)
  const pow2 = Array(n).fill(1)
  for (let i = 1; i < n; i++) pow2[i] = (pow2[i - 1] * 2) % MOD
  let ans = 0
  const frames = [{ phase: 'start', pythonLine: 3, index: -1, ans, nums: [...input], contributions: [], activeLine: L('a subsequence'), message: 'A subsequence width is max - min, and order does not matter, so sort first.' }]
  frames.push({ phase: 'sort', pythonLine: 3, index: -1, ans, nums, contributions: [], activeLine: L('sort nums into ascending'), message: `Sorted: [${nums.join(', ')}]. Now element i is the maximum of exactly 2^i subsequences and the minimum of exactly 2^(n-1-i).` })
  frames.push({ phase: 'powers', pythonLine: 7, index: -1, ans, nums, contributions: [], activeLine: L('precompute pow2'), message: `Precompute powers of two modulo 1e9+7 for 0..${n - 1}.` })
  const contributions = []
  for (let i = 0; i < n; i++) {
    const coef = mod(pow2[i] - pow2[n - 1 - i])
    ans = mod(ans + nums[i] * coef)
    contributions.push(coef)
    frames.push({
      phase: 'term', pythonLine: 10, index: i, ans, nums, contributions: [...contributions], activeLine: L('add sorted[i] * coef'),
      message: `nums[${i}] = ${nums[i]} is max of 2^${i} = ${pow2[i]} subsequences and min of 2^${n - 1 - i} = ${pow2[n - 1 - i]}: contributes ${nums[i]} * (${pow2[i]} - ${pow2[n - 1 - i]}) mod p. Running total: ${ans}.`,
    })
  }
  frames.push({ phase: 'done', pythonLine: 11, index: n - 1, ans, nums, contributions: [...contributions], activeLine: L('return ans'), message: `Return ${ans}.` })
  return { input: [...input], sorted: nums, pow2, result: ans, frames }
}

export const code = `a subsequence's width is its max minus its min, and order does not matter
sort nums into ascending order, giving sorted
let n be the length, and precompute pow2[i] = 2^i mod p for each i
let ans be 0
for each index i of sorted, do
  let coef be (pow2[i] - pow2[n - 1 - i]) mod p
  add sorted[i] * coef to ans, modulo p
return ans`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def sum_subseq_widths(nums):
    MOD = 10**9 + 7
    srt = sorted(nums)
    n = len(srt)
    pow2 = [1] * n
    for i in range(1, n):
        pow2[i] = pow2[i - 1] * 2 % MOD
    ans = 0
    for i, x in enumerate(srt):
        ans = (ans + x * (pow2[i] - pow2[n - 1 - i])) % MOD
    return ans
`
