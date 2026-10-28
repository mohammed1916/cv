import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(parseInput(JSON.stringify(nums))).result

test('3467 official-style examples', () => {
  assert.deepEqual(solve([4, 3, 2, 1]), [0, 0, 1, 1])
  assert.deepEqual(solve([1, 5, 1, 4, 2]), [0, 0, 1, 1, 1])
})

test('3467 rejects a negative value', () => {
  assert.throws(() => parseInput('[-1]'))
})

// Independent oracle: count the even and odd values and build the sorted result from the counts.
function oracle(nums) {
  const evens = nums.filter(v => v % 2 === 0).length
  const odds = nums.length - evens
  return [...Array(evens).fill(0), ...Array(odds).fill(1)]
}

test('3467 random arrays match a count-based oracle', () => {
  let seed = 3467
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(12)
    const nums = Array.from({ length: n }, () => rnd(1001))
    assert.deepEqual(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
