import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

// Independent oracle: test every ordered pair, including a number with itself, against the strong-pair rule.
function oracle(nums) {
  let best = 0
  for (const x of nums) {
    for (const y of nums) {
      if (Math.abs(x - y) <= Math.min(x, y)) best = Math.max(best, x ^ y)
    }
  }
  return best
}

test('2932 official-style examples', () => {
  assert.equal(solve({ nums: [1, 2, 3, 4, 5] }), 7)
  assert.equal(solve({ nums: [10] }), 0)
  assert.equal(solve({ nums: [1, 100] }), 0)
})

test('2932 rejects a value outside 1 to 100', () => {
  assert.throws(() => parseInput('{"nums":[0,3]}'))
})

test('2932 random lists match a pairwise oracle', () => {
  let seed = 2932
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(12) }, () => 1 + rnd(100))
    assert.equal(solve({ nums }), oracle(nums), JSON.stringify(nums))
  }
})
