const MOD = 1000000007
const MAX_VALUES = 7

export function parseInput(text) {
  const data = JSON.parse(text)
  const nums = data?.nums
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > MAX_VALUES) throw new Error(`nums must list 1 to ${MAX_VALUES} values.`)
  if (nums.some(v => !Number.isInteger(v) || v < 1 || v > 20)) throw new Error('Values are integers from 1 to 20.')
  if (new Set(nums).size !== nums.length) throw new Error('Values must be distinct.')
  return { nums }
}

export const code = `ways to reorder(nums)
  set pascal[i][j] to the binomial coefficients C(i, j), modulo the prime
  define count(arr)
    if arr is empty then return 1
    let root be the first value of arr
    split the rest of arr into left, the smaller values, and right, the larger, keeping order
    return C(len(arr)-1, len(left)) * count(left) * count(right), modulo the prime
  return count(nums) - 1, modulo the prime`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

// A reordering keeps the same tree when its root is the first value and the left and right parts keep their own order.
// The interleaving of the two parts is free, which gives the binomial coefficient.
export function buildTrace({ nums }) {
  const n = nums.length
  const pascal = Array.from({ length: n + 1 }, () => Array(n + 1).fill(0))
  for (let i = 0; i <= n; i++) {
    pascal[i][0] = 1
    for (let j = 1; j <= i; j++) pascal[i][j] = (pascal[i - 1][j - 1] + pascal[i - 1][j]) % MOD
  }
  const frames = [{ phase: 'start', segment: [...nums], root: null, value: null, activeLine: L('set pascal'), message: `Split ${nums.join(', ')} around its first value ${nums[0]}.` }]
  const count = arr => {
    if (arr.length === 0) return 1
    const root = arr[0]
    const left = arr.slice(1).filter(v => v < root)
    const right = arr.slice(1).filter(v => v > root)
    const choose = pascal[arr.length - 1][left.length]
    const value = (((choose * count(left)) % MOD) * count(right)) % MOD
    if (arr.length >= 2) {
      frames.push({ phase: 'combine', segment: [...arr], root, value, activeLine: L('return C(len(arr)-1'), message: `${arr.join(', ')} with root ${root}: C(${arr.length - 1}, ${left.length}) interleavings times the two sides gives ${value}.` })
    }
    return value
  }
  const total = count(nums)
  const result = (total - 1 + MOD) % MOD
  frames.push({ phase: 'done', segment: [...nums], root: null, value: result, activeLine: L('return count(nums)'), result, message: `Orderings with the same tree, excluding the original: ${result}.` })
  return { input: { nums }, result, frames }
}

export const python = `def num_of_ways(nums):
    MOD = 1000000007
    n = len(nums)
    C = [[0] * (n + 1) for _ in range(n + 1)]
    for i in range(n + 1):
        C[i][0] = 1
        for j in range(1, i + 1):
            C[i][j] = (C[i - 1][j - 1] + C[i - 1][j]) % MOD

    def count(arr):
        if not arr:
            return 1
        root = arr[0]
        left = [v for v in arr[1:] if v < root]
        right = [v for v in arr[1:] if v > root]
        return C[len(arr) - 1][len(left)] * count(left) % MOD * count(right) % MOD

    return (count(nums) - 1) % MOD
`
