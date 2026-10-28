import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = grades => buildTrace({ grades }).result

test('2358 official examples', () => {
  assert.equal(solve([10, 6, 12]), 2)
  assert.equal(solve([8, 8]), 1)
})

test('2358 six students make exactly three groups', () => {
  assert.equal(solve([1, 1, 1, 1, 1, 1]), 3)
})

test('2358 rejects an empty grade list', () => {
  assert.throws(() => parseInput(JSON.stringify({ grades: [] })))
})

// Independent oracle: over all subsets of group sizes, the largest number of distinct sizes whose total fits in n.
function oracle(n) {
  let best = 0
  for (let mask = 1; mask < 1 << n; mask++) {
    let sum = 0
    let count = 0
    for (let size = 1; size <= n; size++) {
      if (mask & (1 << (size - 1))) { sum += size; count++ }
    }
    if (sum <= n) best = Math.max(best, count)
  }
  return best
}

test('2358 random class sizes match a subset-of-sizes oracle', () => {
  let seed = 2358
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(12)
    const grades = Array.from({ length: n }, () => 1 + rnd(100))
    assert.equal(solve(grades), oracle(n), JSON.stringify(grades))
  }
})
