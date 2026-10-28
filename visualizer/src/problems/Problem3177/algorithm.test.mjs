import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, k) => buildTrace(parseInput(JSON.stringify({ nums, k }))).result

test('3177 examples', () => {
  assert.equal(solve([1, 2, 1, 1, 3], 2), 4)
  assert.equal(solve([1, 2, 3, 4, 1], 0), 2)
})

test('3177 a single element', () => {
  assert.equal(solve([4], 3), 1)
})

test('3177 rejects k outside 0 to 3', () => {
  assert.throws(() => parseInput('{"nums":[1,2],"k":-1}'))
})

// Independent oracle: try every subset of positions and count the changes in each.
function oracle(nums, k) {
  let best = 0
  for (let mask = 1; mask < 1 << nums.length; mask++) {
    const picked = nums.filter((_, i) => (mask >> i) & 1)
    let changes = 0
    for (let t = 0; t + 1 < picked.length; t++) if (picked[t] !== picked[t + 1]) changes++
    if (changes <= k) best = Math.max(best, picked.length)
  }
  return best
}

test('3177 random inputs match a subset-search oracle', () => {
  let seed = 3177
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(10) }, () => 1 + rnd(4))
    const k = rnd(4)
    assert.equal(solve(nums, k), oracle(nums, k), JSON.stringify({ nums, k }))
  }
})
