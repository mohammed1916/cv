const MOD = 1000000007

export function parseInput(text) {
  const data = JSON.parse(text)
  const nums = data?.nums
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 6 || nums.some(v => !Number.isInteger(v) || v < 0 || v > 6)) {
    throw new Error('nums must be 1 to 6 integers, each from 0 to 6.')
  }
  return { nums }
}

export const code = `count monotonic pairs(nums)
  ways = table with one row per index and columns for values 0 to max(nums), filled with 0
  ways[0][v] = 1 for each v from 0 to nums[0]
  for i from 1 to n - 1
    step = max(0, nums[i] - nums[i - 1])
    for w from 0 to nums[i]
      ways[i][w] = sum of ways[i - 1][v] for v from 0 to min(nums[i - 1], w - step)
  return sum of ways[n - 1][w] over all w, modulo 1000000007`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

const copy = table => table.map(row => [...row])

// ways[i][w] counts the first i+1 values of arr1 with arr1[i] = w. Arr1 must not decrease and arr2 must not increase, so w - v >= nums[i] - nums[i-1] when that difference is positive.
export function buildTrace({ nums }) {
  const n = nums.length
  const top = Math.max(...nums)
  const ways = Array.from({ length: n }, () => Array(top + 1).fill(0))
  for (let v = 0; v <= nums[0]; v++) ways[0][v] = 1
  const frames = [{ phase: 'start', cell: [0, 0], table: copy(ways), activeLine: L('ways[0][v] = 1'), message: `The first value of arr1 can be any value from 0 to ${nums[0]}.` }]
  for (let i = 1; i < n; i++) {
    const step = Math.max(0, nums[i] - nums[i - 1])
    for (let w = 0; w <= nums[i]; w++) {
      let sum = 0
      for (let v = 0; v <= Math.min(nums[i - 1], w - step); v++) sum += ways[i - 1][v]
      ways[i][w] = sum % MOD
      frames.push({ phase: 'cell', cell: [i, w], table: copy(ways), activeLine: L('ways[i][w] = sum'), message: `arr1[${i}] = ${w}: ${ways[i][w]} ways for the prefix.` })
    }
  }
  let result = 0
  for (let w = 0; w <= top; w++) result = (result + ways[n - 1][w]) % MOD
  frames.push({ phase: 'done', cell: null, table: copy(ways), activeLine: L('return sum of ways'), message: `Monotonic pairs: ${result}.` })
  return { input: { nums }, result, frames }
}

export const python = `def count_monotonic_pairs(nums):
    MOD = 1000000007
    ways = [1 if v <= nums[0] else 0 for v in range(nums[0] + 1)]
    for i in range(1, len(nums)):
        step = max(0, nums[i] - nums[i - 1])
        prefix = [0]
        for count in ways:
            prefix.append((prefix[-1] + count) % MOD)
        new_ways = []
        for w in range(nums[i] + 1):
            hi = min(nums[i - 1], w - step)
            new_ways.append(prefix[hi + 1] if hi >= 0 else 0)
        ways = new_ways
    return sum(ways) % MOD
`
