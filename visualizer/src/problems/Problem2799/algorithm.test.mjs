import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(parseInput(JSON.stringify({ nums }))).result

test('2799 official examples', () => {
  assert.equal(solve([1, 3, 1, 2, 2]), 4)
  assert.equal(solve([5, 5, 5, 5]), 10)
})

test('2799 rejects a value outside 1 to 6', () => {
  assert.throws(() => parseInput('{"nums":[7]}'))
})

// Independent oracle: compare each subarray's distinct count with the whole array's.
function oracle(nums) {
  const whole = new Set(nums).size
  let count = 0
  for (let i = 0; i < nums.length; i++) {
    for (let j = i; j < nums.length; j++) {
      if (new Set(nums.slice(i, j + 1)).size === whole) count++
    }
  }
  return count
}

test('2799 seeded random arrays match subarray enumeration', () => {
  let seed = 2799
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(10) }, () => 1 + rnd(6))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
