import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, queries) => buildTrace(parseInput(JSON.stringify({ nums, queries }))).result

test('3488 official example', () => {
  assert.deepEqual(solve([1, 3, 1, 4, 1, 3, 2], [0, 3, 5]), [2, -1, 3])
})

test('3488 edge cases: the distance wraps around the circle', () => {
  assert.deepEqual(solve([1, 2, 1, 2], [0, 1, 2, 3]), [2, 2, 2, 2])
  assert.deepEqual(solve([5, 9, 9, 9, 5], [0]), [1])
  assert.deepEqual(solve([7], [0]), [-1])
})

test('3488 rejects a query outside nums', () => {
  assert.throws(() => parseInput('{"nums":[1,2],"queries":[2]}'))
})

// Independent oracle: compare the query with every other index and keep the smallest circular distance.
function oracle({ nums, queries }) {
  const n = nums.length
  return queries.map(q => {
    let best = -1
    for (let j = 0; j < n; j++) {
      if (j === q || nums[j] !== nums[q]) continue
      const straight = Math.abs(q - j)
      const d = Math.min(straight, n - straight)
      if (best === -1 || d < best) best = d
    }
    return best
  })
}

test('3488 random inputs match an all-indices oracle', () => {
  let seed = 3488
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(10) }, () => 1 + rnd(5))
    const queries = Array.from({ length: 1 + rnd(10) }, () => rnd(nums.length))
    const input = { nums, queries }
    assert.deepEqual(solve(nums, queries), oracle(input), JSON.stringify(input))
  }
})
