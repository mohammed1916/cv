import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(parseInput(JSON.stringify({ nums }))).result

test('3423 official examples', () => {
  assert.equal(solve([1, 2, 4]), 3)
  assert.equal(solve([-5, -10, -5]), 5)
})

test('3423 the wrap-around pair can be the largest', () => {
  // The pair (last, first) = (9, 1) has gap 8, larger than any other neighbour pair.
  assert.equal(solve([1, 2, 3, 9]), 8)
})

test('3423 rejects a single number', () => {
  assert.throws(() => parseInput('{"nums":[4]}'))
})

// Independent oracle: build the list of every index pair (i, i+1 mod n) and take the maximum absolute gap.
function oracle(nums) {
  const n = nums.length
  const pairs = nums.map((_, i) => [i, (i + 1) % n])
  return Math.max(...pairs.map(([a, b]) => Math.abs(nums[a] - nums[b])))
}

test('3423 random arrays match a pair-list oracle', () => {
  let seed = 3423
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 2 + rnd(11) }, () => rnd(201) - 100)
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
