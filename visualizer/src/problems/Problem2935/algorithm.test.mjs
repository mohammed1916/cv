import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(parseInput(JSON.stringify(nums))).result

test('2935 examples', () => {
  assert.equal(solve([1, 2, 3, 4, 5]), 7)
  assert.equal(solve([10, 20]), 30)
  assert.equal(solve([7]), 0)
})

test('2935 a number pairs with itself, giving xor 0', () => {
  assert.equal(solve([5, 5, 5]), 0)
})

test('2935 rejects values outside 1 to 30', () => {
  assert.throws(() => parseInput('[0,3]'))
})

// Independent oracle: test every ordered pair, including a number with itself.
function oracle(nums) {
  let best = 0
  for (const x of nums) {
    for (const y of nums) {
      if (Math.abs(x - y) <= Math.min(x, y)) best = Math.max(best, x ^ y)
    }
  }
  return best
}

test('2935 random arrays match an all-pairs oracle', () => {
  let seed = 2935
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(12) }, () => 1 + rnd(30))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
