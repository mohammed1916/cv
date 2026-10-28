import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(parseInput(JSON.stringify({ nums }))).result

test('2740 official examples', () => {
  assert.equal(solve([1, 3, 2, 4]), 1)
  assert.equal(solve([100, 1, 10]), 9)
})

test('2740 equal values give a zero partition value', () => {
  assert.equal(solve([5, 5, 9]), 0)
})

test('2740 rejects a single number', () => {
  assert.throws(() => parseInput('{"nums":[4]}'))
})

// Independent oracle: try every subset as nums1 (both sides non-empty) and take the best split.
function oracle(nums) {
  const n = nums.length
  let best = Infinity
  for (let mask = 1; mask < (1 << n) - 1; mask++) {
    const a = nums.filter((_, i) => mask & (1 << i))
    const b = nums.filter((_, i) => !(mask & (1 << i)))
    best = Math.min(best, Math.abs(Math.max(...a) - Math.min(...b)))
  }
  return best
}

test('2740 random arrays match an all-subsets oracle', () => {
  let seed = 2740
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 2 + rnd(7) }, () => 1 + rnd(50))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
