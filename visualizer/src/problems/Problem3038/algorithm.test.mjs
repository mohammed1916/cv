import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(nums).result

test('3038 official examples', () => {
  assert.equal(solve([3, 2, 1, 4, 5]), 2)
  assert.equal(solve([3, 2, 6, 1, 4]), 1)
})

test('3038 a single leftover number is ignored', () => {
  assert.equal(solve([2, 2, 2]), 1)
  assert.equal(solve([1, 1]), 1)
})

test('3038 rejects a list with fewer than two numbers', () => {
  assert.throws(() => parseInput('[5]'))
})

// Independent oracle: try every possible score and count the operations that can all use it.
function oracle(nums) {
  let best = 0
  for (let t = 2; t <= 2000; t++) {
    const rest = [...nums]
    let count = 0
    while (rest.length >= 2 && rest[0] + rest[1] === t) {
      rest.splice(0, 2)
      count++
    }
    best = Math.max(best, count)
  }
  return best
}

test('3038 random lists match a try-every-score oracle', () => {
  let seed = 3038
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 2 + rnd(9) }, () => 1 + rnd(5))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
