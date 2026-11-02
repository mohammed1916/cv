import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(nums).result

test('3069 worked examples', () => {
  assert.deepEqual(solve([2, 1, 3]), [2, 3, 1])
  assert.deepEqual(solve([5, 4, 3, 8]), [5, 3, 4, 8])
})

test('3069 edge cases', () => {
  assert.deepEqual(solve([1, 2, 3]), [1, 2, 3])
  assert.deepEqual(solve([3, 2, 1]), [3, 1, 2])
  assert.throws(() => parseInput('[1,2]'))
  assert.throws(() => parseInput('[1,1,2]'))
})

// Independent oracle: keep both arrays as a map from name to list, choosing with a ternary.
function oracle(nums) {
  const groups = { first: [nums[0]], second: [nums[1]] }
  for (const x of nums.slice(2)) {
    const lastFirst = groups.first.at(-1), lastSecond = groups.second.at(-1)
    const target = lastFirst > lastSecond ? 'first' : 'second'
    groups[target] = [...groups[target], x]
  }
  return [...groups.first, ...groups.second]
}

test('3069 random distinct arrays match the oracle', () => {
  let seed = 3069
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const len = 3 + rnd(10)
    const pool = Array.from({ length: 50 }, (_, i) => i + 1)
    const nums = []
    for (let i = 0; i < len; i++) nums.push(pool.splice(rnd(pool.length), 1)[0])
    assert.deepEqual(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
