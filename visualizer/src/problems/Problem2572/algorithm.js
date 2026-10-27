const MOD = 1000000007
const PRIMES = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29]
const MAX_NUMS = 8

export function parseInput(text) {
  const data = JSON.parse(text)
  const nums = data?.nums
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > MAX_NUMS) throw new Error(`nums must list 1 to ${MAX_NUMS} values.`)
  if (nums.some(v => !Number.isInteger(v) || v < 1 || v > 30)) throw new Error('Values are integers from 1 to 30.')
  return { nums }
}

export const code = `square free subsets(nums)
  set ways[0] to 1 for the empty subset, and every other ways to 0
  for each number x in nums
    if x has a repeated prime factor then skip it
    set primes to the set of primes that divide x
    for each mask of primes already used by some subset
      if that mask shares no prime with x, add ways[mask] to ways[mask plus x]
  return the sum of ways minus 1 for the empty subset`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

// Each subset of primes is a bitmask. A square-free number adds its primes as a bit pattern that must be unused.
export function buildTrace({ nums }) {
  const ways = Array(1 << PRIMES.length).fill(0)
  ways[0] = 1
  const total = () => ways.reduce((a, b) => (a + b) % MOD, 0)
  const frames = [{ phase: 'start', index: -1, mask: 0, skipped: false, total: total(), activeLine: L('set ways[0] to 1'), message: 'Only the empty subset exists so far.' }]
  nums.forEach((x, index) => {
    let mask = 0
    let squareFree = true
    PRIMES.forEach((p, b) => {
      if (x % (p * p) === 0) squareFree = false
      else if (x % p === 0) mask |= 1 << b
    })
    if (!squareFree) {
      frames.push({ phase: 'skip', index, mask, skipped: true, total: total(), activeLine: L('if x has a repeated'), message: `${x} has a squared prime factor, so no subset containing it is square-free.` })
      return
    }
    const snapshot = [...ways]
    let added = 0
    for (let used = 0; used < snapshot.length; used++) {
      if (snapshot[used] === 0 || (used & mask) !== 0) continue
      ways[used | mask] = (ways[used | mask] + snapshot[used]) % MOD
      added++
    }
    frames.push({ phase: 'number', index, mask, skipped: false, total: total(), activeLine: L('add ways[mask] to'), message: `${x} adds to ${added} earlier prime pattern(s); square-free subsets so far, including empty: ${total()}.` })
  })
  const result = (total() - 1 + MOD) % MOD
  frames.push({ phase: 'done', index: nums.length - 1, mask: 0, skipped: false, total: total(), activeLine: L('return the sum of ways'), result, message: `${result} non-empty square-free subsets.` })
  return { input: { nums }, result, frames }
}

export const python = `def square_free_subsets(nums):
    MOD = 1000000007
    primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29]
    ways = [0] * (1 << len(primes))
    ways[0] = 1
    for x in nums:
        mask = 0
        square_free = True
        for b, p in enumerate(primes):
            if x % (p * p) == 0:
                square_free = False
            elif x % p == 0:
                mask |= 1 << b
        if not square_free:
            continue
        snapshot = ways[:]
        for used in range(len(snapshot)):
            if snapshot[used] and used & mask == 0:
                ways[used | mask] = (ways[used | mask] + snapshot[used]) % MOD
    return (sum(ways) - 1) % MOD
`
