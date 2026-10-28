import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, queries) => buildTrace(parseInput(JSON.stringify({ nums, queries }))).result

test('3569 official examples', () => {
  assert.deepEqual(solve([2, 1, 3, 1, 2], [[1, 2], [3, 3]]), [3, 4])
  assert.deepEqual(solve([2, 1, 4], [[0, 1]]), [0])
})

test('3569 updates persist for later queries', () => {
  assert.deepEqual(solve([4, 4], [[0, 2], [1, 2]]), [1, 2])
})

test('3569 rejects an index outside the array', () => {
  assert.throws(() => parseInput('{"nums":[1,2],"queries":[[2,3]]}'))
})

// Independent oracle: sieve the primes up to 50 once, then score every split by counting distinct primes with a filter.
function oracle(nums0, queries) {
  const sieve = Array(51).fill(true)
  sieve[0] = false
  sieve[1] = false
  for (let p = 2; p <= 50; p++) if (sieve[p]) for (let q = 2 * p; q <= 50; q += p) sieve[q] = false
  const nums = [...nums0]
  return queries.map(([idx, val]) => {
    nums[idx] = val
    let best = 0
    for (let k = 1; k < nums.length; k++) {
      const count = part => new Set(part.filter(x => sieve[x])).size
      best = Math.max(best, count(nums.slice(0, k)) + count(nums.slice(k)))
    }
    return best
  })
}

test('3569 random arrays match a sieve oracle', () => {
  let seed = 3569
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let trial = 0; trial < 150; trial++) {
    const n = 2 + rnd(8)
    const nums = Array.from({ length: n }, () => 1 + rnd(50))
    const queries = Array.from({ length: 1 + rnd(5) }, () => [rnd(n), 1 + rnd(50)])
    assert.deepEqual(solve(nums, queries), oracle(nums, queries), JSON.stringify({ nums, queries }))
  }
})
