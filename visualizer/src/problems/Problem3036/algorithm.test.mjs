import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, pattern) => buildTrace({ nums, pattern }).result

test('3036 worked examples', () => {
  assert.equal(solve([1, 4, 4, 1, 3, 5, 5, 3], [1, 0, -1]), 2)
  assert.equal(solve([1, 2, 3, 4, 5], [1, 1]), 3)
  assert.equal(solve([1, 2], [-1]), 0)
})

test('3036 overlapping occurrences are all counted', () => {
  assert.equal(solve([1, 2, 3, 4, 5], [1, 1, 1]), 2)
  assert.equal(solve([5, 5, 5, 5], [0, 0]), 2)
})

test('3036 rejects a pattern entry outside -1, 0, 1', () => {
  assert.throws(() => parseInput('{"nums":[1,2,3],"pattern":[2]}'))
})

// Independent oracle: compare every window of length pattern + 1 directly, with no failure table.
function oracle(nums, pattern) {
  const cmp = (a, b) => (b > a ? 1 : b < a ? -1 : 0)
  let count = 0
  for (let i = 0; i + pattern.length < nums.length; i++) {
    let ok = true
    for (let j = 0; j < pattern.length && ok; j++) ok = cmp(nums[i + j], nums[i + j + 1]) === pattern[j]
    if (ok) count++
  }
  return count
}

test('3036 random inputs match a window-by-window oracle', () => {
  let seed = 3036
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 2 + rnd(9) }, () => rnd(7) - 3)
    const pattern = Array.from({ length: 1 + rnd(nums.length - 1) }, () => rnd(3) - 1)
    assert.equal(solve(nums, pattern), oracle(nums, pattern), JSON.stringify({ nums, pattern }))
  }
})
