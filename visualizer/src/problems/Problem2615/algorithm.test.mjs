import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(parseInput(JSON.stringify({ nums }))).result

test('2615 official examples', () => {
  assert.deepEqual(solve([1, 3, 1, 1, 2]), [5, 0, 3, 4, 0])
  assert.deepEqual(solve([0, 5, 3]), [0, 0, 0])
})

test('2615 a single element has no distance', () => {
  assert.deepEqual(solve([7 - 2]), [0])
})

test('2615 rejects a value above 5', () => {
  assert.throws(() => parseInput('{"nums":[6]}'))
})

// Independent oracle: compare every pair of indices directly.
function oracle(nums) {
  return nums.map((v, i) => nums.reduce((sum, w, j) => (w === v && j !== i ? sum + Math.abs(i - j) : sum), 0))
}

test('2615 seeded random arrays match a pairwise oracle', () => {
  let seed = 2615
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(12) }, () => rnd(6))
    assert.deepEqual(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
