import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, m, k) => buildTrace(parseInput(JSON.stringify({ nums, m, k }))).result

test('2841 official examples', () => {
  assert.equal(solve([2, 6, 7, 3, 1, 7], 3, 4), 18)
  assert.equal(solve([5, 9, 9, 2, 4, 5, 4], 1, 3), 23)
  assert.equal(solve([1, 2, 1, 2, 1, 2, 1], 3, 3), 0)
})

test('2841 m greater than k is rejected', () => {
  assert.throws(() => parseInput('{"nums":[1,2,3],"m":3,"k":2}'))
})

// Independent oracle: build a Set for every window and compare its size with m.
function oracle(nums, m, k) {
  let best = 0
  for (let start = 0; start + k <= nums.length; start++) {
    const part = nums.slice(start, start + k)
    if (new Set(part).size >= m) best = Math.max(best, part.reduce((a, b) => a + b, 0))
  }
  return best
}

test('2841 random arrays match a per-window Set oracle', () => {
  let seed = 2841
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const len = 1 + rnd(14)
    const nums = Array.from({ length: len }, () => 1 + rnd(6))
    const k = 1 + rnd(len)
    const m = 1 + rnd(k)
    assert.equal(solve(nums, m, k), oracle(nums, m, k), JSON.stringify({ nums, m, k }))
  }
})
