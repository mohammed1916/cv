const MOD = 1000000007

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with nums and queries.')
  const { nums, queries } = data
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 12) throw new Error('nums holds 1 to 12 values.')
  if (nums.some(v => !Number.isInteger(v) || v < 1 || v > 100)) throw new Error('Each value is an integer from 1 to 100.')
  if (!Array.isArray(queries) || queries.length < 1 || queries.length > 8) throw new Error('queries holds 1 to 8 entries.')
  const n = nums.length
  queries.forEach(q => {
    if (!Array.isArray(q) || q.length !== 4) throw new Error('Each query is [l, r, k, v].')
    const [l, r, k, v] = q
    if (![l, r, k, v].every(Number.isInteger)) throw new Error('Query values are integers.')
    if (l < 0 || r < l || r >= n) throw new Error('Each query needs 0 <= l <= r < n.')
    if (k < 1 || k > n) throw new Error('Each step k is from 1 to n.')
    if (v < 1 || v > 100) throw new Error('Each multiplier v is from 1 to 100.')
  })
  return { nums, queries }
}

export function buildTrace(input) {
  const nums = [...input.nums]
  const frames = [{ phase: 'start', activeLine: L('for each query'), index: -1, nums: [...nums], touched: [], answer: null, message: 'Apply the queries in order, then XOR everything.' }]
  const touched = new Set()
  input.queries.forEach((q, qi) => {
    const [l, r, k, v] = q
    for (let idx = l; idx <= r; idx += k) {
      nums[idx] = (nums[idx] * v) % MOD
      touched.add(idx)
      frames.push({ phase: 'multiply', activeLine: L('set nums[idx]'), index: idx, nums: [...nums], touched: [...touched], answer: null,
        message: `Query ${qi + 1} multiplies index ${idx} by ${v}, giving ${nums[idx]}.` })
    }
  })
  let answer = 0
  for (const value of nums) answer ^= value
  frames.push({ phase: 'done', activeLine: L('return answer'), index: -1, nums: [...nums], touched: [...touched], answer, message: `The XOR of all values is ${answer}.` })
  return { input, result: answer, frames }
}

export const code = `find the xor after the range multiplications
  for each query [l, r, k, v] in order
    for each index idx from l to r, stepping by k
      set nums[idx] to nums[idx] times v modulo 1000000007
  set answer to 0
  for each value in nums
    set answer to answer xor value
  return answer`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def xor_after_queries(nums, queries):
    MOD = 10 ** 9 + 7
    nums = list(nums)
    for l, r, k, v in queries:
        for idx in range(l, r + 1, k):
            nums[idx] = nums[idx] * v % MOD
    answer = 0
    for value in nums:
        answer ^= value
    return answer
`
