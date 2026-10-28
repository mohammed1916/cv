import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(parseInput(JSON.stringify({ nums }))).result

test('2574 official examples', () => {
  assert.deepEqual(solve([10, 4, 8, 3]), [15, 1, 11, 22])
  assert.deepEqual(solve([1]), [0])
})

test('2574 a single element always differs by zero', () => {
  assert.deepEqual(solve([20]), [0])
})

test('2574 rejects an empty array', () => {
  assert.throws(() => parseInput('{"nums":[]}'))
})

// Independent oracle: sum the left and right parts directly for every index.
function oracle(nums) {
  return nums.map((_, i) => {
    const left = nums.slice(0, i).reduce((a, b) => a + b, 0)
    const right = nums.slice(i + 1).reduce((a, b) => a + b, 0)
    return Math.abs(left - right)
  })
}

test('2574 seeded random arrays match a direct-sum oracle', () => {
  let seed = 2574
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(12) }, () => 1 + rnd(20))
    assert.deepEqual(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
