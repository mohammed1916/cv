const MOD = 1000000007

export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 8) throw new Error('Use an array of 1 to 8 numbers.')
  if (nums.some(v => !Number.isInteger(v) || v < 1 || v > 40)) throw new Error('Numbers are integers from 1 to 40.')
  return nums
}

const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b))
const key = (a, b) => `${a},${b}`

export function buildTrace(nums) {
  // ways["a,b"]: number of ways, after the numbers so far, that the first sequence has gcd a and the second has gcd b.
  // A gcd of 0 means that sequence is still empty.
  let ways = new Map([[key(0, 0), 1]])
  const frames = [{ phase: 'start', activeLine: L('set ways[0][0] to 1'), index: -1, value: null, equal: 0, message: 'Both sequences start empty, so there is one way.' }]
  nums.forEach((x, index) => {
    const next = new Map(ways)
    for (const [k, count] of ways) {
      const [a, b] = k.split(',').map(Number)
      const withFirst = key(gcd(a, x), b)
      next.set(withFirst, ((next.get(withFirst) ?? 0) + count) % MOD)
      const withSecond = key(a, gcd(b, x))
      next.set(withSecond, ((next.get(withSecond) ?? 0) + count) % MOD)
    }
    ways = next
    let equal = 0
    for (const [k, count] of ways) {
      const [a, b] = k.split(',').map(Number)
      if (a === b && a > 0) equal = (equal + count) % MOD
    }
    frames.push({ phase: 'element', activeLine: L('for each pair of gcds'), index, value: x, equal, message: `Number ${x}: pairs with equal non-empty gcds so far: ${equal}.` })
  })
  let result = 0
  for (const [k, count] of ways) {
    const [a, b] = k.split(',').map(Number)
    if (a === b && a > 0) result = (result + count) % MOD
  }
  frames.push({ phase: 'done', activeLine: L('return the sum'), index: nums.length - 1, value: null, equal: result, message: `Ordered pairs of disjoint non-empty subsequences with equal gcd: ${result}.` })
  return { input: nums, result, frames }
}

export const code = `count pairs of disjoint non-empty subsequences with equal gcd:
  set ways[0][0] to 1 for two empty sequences
  for each number x in nums:
    copy the ways, which skips x
    for each pair of gcds (a, b) with ways:
      add x to the first sequence, giving gcd(a, x) in the first slot
      add x to the second sequence, giving gcd(b, x) in the second slot
  sum ways[g][g] for each g at least 1
  return the sum modulo 1000000007`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `from math import gcd


def count_equal_gcd_pairs(nums):
    mod = 1000000007
    ways = {(0, 0): 1}
    for x in nums:
        nxt = dict(ways)
        for (a, b), count in ways.items():
            with_first = (gcd(a, x), b)
            nxt[with_first] = (nxt.get(with_first, 0) + count) % mod
            with_second = (a, gcd(b, x))
            nxt[with_second] = (nxt.get(with_second, 0) + count) % mod
        ways = nxt
    total = 0
    for (a, b), count in ways.items():
        if a == b and a > 0:
            total = (total + count) % mod
    return total
`
