import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(parseInput(JSON.stringify({ nums }))).result

test('1862 official examples', () => {
  assert.equal(solve([2, 5, 9]), 10)
  assert.equal(solve([7, 7, 7, 7, 7, 7, 7]), 49)
})

test('1862 edge cases and validation', () => {
  assert.equal(solve([1]), 1)
  assert.throws(() => parseInput('{"nums":[]}'))
  assert.throws(() => parseInput('{"nums":[0]}'))
  assert.throws(() => parseInput('{"nums":[101]}'))
})

// Independent oracle: compare every ordered pair directly.
function oracle(nums) {
  let total = 0
  for (const a of nums) for (const b of nums) total += Math.floor(a / b)
  return total % 1000000007
}

test('1862 seeded random lists match a pairwise oracle', () => {
  let seed = 1862
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(12) }, () => 1 + rnd(100))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
