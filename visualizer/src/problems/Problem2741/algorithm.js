const MOD = 1000000007

export function parseInput(text) {
  const o = JSON.parse(text)
  if (!o || !Array.isArray(o.nums)) throw new Error('Use an object with an array nums.')
  const { nums } = o
  if (nums.length < 2 || nums.length > 8) throw new Error('nums must have 2 to 8 entries.')
  if (nums.some(v => !Number.isInteger(v) || v < 1 || v > 100)) throw new Error('Values are integers from 1 to 100.')
  if (new Set(nums).size !== nums.length) throw new Error('Values must be distinct.')
  return { nums }
}

const linked = (a, b) => a % b === 0 || b % a === 0

export function buildTrace({ nums }) {
  const n = nums.length
  const full = (1 << n) - 1
  const ways = Array.from({ length: 1 << n }, () => new Array(n).fill(0))
  for (let i = 0; i < n; i++) ways[1 << i][i] = 1
  const frames = [{ phase: 'start', activeLine: L('start each number alone'), mask: 0, total: 0, message: 'Each single number is a permutation of length one.' }]
  for (let mask = 1; mask <= full; mask++) {
    let here = 0
    for (let last = 0; last < n; last++) {
      const count = ways[mask][last]
      if (!count) continue
      here += count
      for (let next = 0; next < n; next++) {
        if (mask & (1 << next)) continue
        if (linked(nums[last], nums[next])) ways[mask | (1 << next)][next] += count
      }
    }
    if (here) frames.push({ phase: 'extend', activeLine: L('for each last number'), mask, total: here, message: `Arrangements of subset ${mask} that are valid so far: ${here}.` })
  }
  const result = ways[full].reduce((a, b) => a + b, 0) % MOD
  frames.push({ phase: 'done', activeLine: L('return the sum'), mask: full, total: result, message: `Special permutations: ${result}.` })
  return { input: { nums }, result, frames }
}

export const code = `count special permutations with dynamic programming over subsets
  let ways[mask][last] be the arrangements of the numbers in mask that end with last
  start each number alone with one arrangement
  for each subset mask in increasing order
    for each last number in mask with ways greater than zero
      for each number next that is not in mask
        if last divides next or next divides last then
          add ways[mask][last] to ways[mask plus next][next]
  return the sum of ways[full][last] over all last, modulo 1000000007`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def special_permutations(nums):
    MOD = 10 ** 9 + 7
    n = len(nums)
    full = (1 << n) - 1
    ways = [[0] * n for _ in range(1 << n)]
    for i in range(n):
        ways[1 << i][i] = 1
    for mask in range(1, full + 1):
        for last in range(n):
            count = ways[mask][last]
            if count == 0:
                continue
            for nxt in range(n):
                if mask >> nxt & 1:
                    continue
                if nums[last] % nums[nxt] == 0 or nums[nxt] % nums[last] == 0:
                    ways[mask | 1 << nxt][nxt] = (ways[mask | 1 << nxt][nxt] + count) % MOD
    return sum(ways[full]) % MOD
`
