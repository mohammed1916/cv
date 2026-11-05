const MOD = 1000000007n

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums and queries.')
  const { nums, queries } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 12 || !nums.every(v => Number.isInteger(v) && v >= 1 && v <= 1e9)) throw new Error('nums has 1 to 12 integers from 1 to 1000000000.')
  if (!Array.isArray(queries) || queries.length < 1 || queries.length > 6) throw new Error('queries has 1 to 6 entries.')
  const n = nums.length
  for (const q of queries) {
    if (!Array.isArray(q) || q.length !== 4 || !q.every(Number.isInteger)) throw new Error('Each query is [l, r, k, v] with integers.')
    const [l, r, k, v] = q
    if (l < 0 || r >= n || l > r) throw new Error('Each query needs 0 <= l <= r < n.')
    if (k < 1 || k > n) throw new Error('Each k is from 1 to n.')
    if (v < 1 || v > 100000) throw new Error('Each v is from 1 to 100000.')
  }
  return { nums, queries }
}

export function buildTrace({ nums, queries }) {
  const values = nums.map(BigInt)
  const snapshot = () => values.map(String)
  const frames = [{ phase: 'start', query: null, at: -1, values: snapshot(), pythonLine: P('for l, r, k, v'), activeLine: L('for each query [l, r, k, v]'), message: 'Start with the array as given.' }]
  queries.forEach((q, qi) => {
    const [l, r, k, v] = q
    const query = { index: qi, l, r, k, v }
    frames.push({ phase: 'query', query, at: -1, values: snapshot(), pythonLine: P('for l, r, k, v'), activeLine: L('set idx to l'), message: `Query ${qi + 1} visits indices ${l} to ${r} in steps of ${k}, multiplying by ${v}.` })
    for (let idx = l; idx <= r; idx += k) {
      values[idx] = values[idx] * BigInt(v) % MOD
      frames.push({ phase: 'update', query, at: idx, values: snapshot(), pythonLine: P('nums[idx] = '), activeLine: L('multiply nums at idx'), message: `nums[${idx}] is now ${values[idx]} modulo 1000000007.` })
    }
  })
  const result = values.reduce((acc, x) => acc ^ x, 0n)
  frames.push({ phase: 'done', query: null, at: -1, values: snapshot(), pythonLine: P('return result'), activeLine: L('return the XOR'), message: `XOR over all values is ${result}.` })
  return { input: { nums, queries }, result: Number(result), frames }
}

export const code = `function xorAfterRangeMultiplication(nums, queries) {
  const MOD = 1000000007n
  const values = nums.map(BigInt)
  for (const [l, r, k, v] of queries) { // for each query [l, r, k, v]
    for (let idx = l; idx <= r; idx += k) { // set idx to l, then step by k while idx is at most r
      values[idx] = (values[idx] * BigInt(v)) % MOD // multiply nums at idx by v modulo 1000000007
    }
  }
  return values.reduce((acc, x) => acc ^ x, 0n) // return the XOR over all nums
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def xor_after_range_multiplication(nums, queries):
    MOD = 1000000007
    for l, r, k, v in queries:
        idx = l
        while idx <= r:
            nums[idx] = nums[idx] * v % MOD
            idx += k
    result = 0
    for x in nums:
        result ^= x
    return result
`
const P = s => python.split('\n').findIndex(line => line.includes(s)) + 1
