import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, queries) => buildTrace(parseInput(JSON.stringify({ nums, queries }))).result

test('1906 official examples', () => {
  assert.deepEqual(solve([1, 3, 4, 8], [[0, 1], [1, 2], [2, 3], [0, 3]]), [2, 1, 4, 1])
  assert.deepEqual(solve([4, 5, 2, 2, 7, 10], [[2, 3], [0, 2], [0, 5]]), [-1, 1, 1])
})

test('1906 a range with a single repeated value has no difference', () => {
  assert.deepEqual(solve([7, 7, 7], [[0, 2], [1, 1]]), [-1, -1])
})

test('1906 rejects a value outside 1 to 100', () => {
  assert.throws(() => parseInput('{"nums":[101],"queries":[[0,0]]}'))
})

// Independent oracle: compare every pair of positions in the range and keep the smallest positive gap.
function oracle(nums, queries) {
  return queries.map(([l, r]) => {
    let best = -1
    for (let i = l; i <= r; i++) {
      for (let j = i + 1; j <= r; j++) {
        const gap = Math.abs(nums[i] - nums[j])
        if (gap > 0 && (best === -1 || gap < best)) best = gap
      }
    }
    return best
  })
}

test('1906 seeded random inputs match a pairwise oracle', () => {
  let seed = 1906
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(12) }, () => 1 + rnd(30))
    const queries = Array.from({ length: 1 + rnd(5) }, () => { const a = rnd(nums.length); const b = rnd(nums.length); return [Math.min(a, b), Math.max(a, b)] })
    assert.deepEqual(solve(nums, queries), oracle(nums, queries), JSON.stringify({ nums, queries }))
  }
})
