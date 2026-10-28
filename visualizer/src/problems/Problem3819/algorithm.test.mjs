import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, k) => buildTrace({ nums, k }).result

test('3819 official examples', () => {
  assert.deepEqual(solve([1, -2, 3, -4], 3), [3, -2, 1, -4])
  assert.deepEqual(solve([-3, -2, 7], 1), [-3, -2, 7])
  assert.deepEqual(solve([5, 4, -9, 6], 2), [6, 5, -9, 4])
})

test('3819 edge case: no non-negative values leaves the array unchanged', () => {
  assert.deepEqual(solve([-1, -2], 5), [-1, -2])
})

test('3819 rejects a value outside the cap', () => {
  assert.throws(() => parseInput('{"nums":[10],"k":0}'))
})

// Independent oracle: rotate the list of non-negative values one step at a time, k times, then write it back.
function oracle(nums, k) {
  const out = [...nums]
  const pos = []
  for (let i = 0; i < nums.length; i++) if (nums[i] >= 0) pos.push(i)
  let vals = pos.map(i => nums[i])
  for (let t = 0; t < k && vals.length > 0; t++) vals = [...vals.slice(1), vals[0]]
  pos.forEach((p, j) => { out[p] = vals[j] })
  return out
}

test('3819 random arrays match a step-by-step rotation oracle', () => {
  let seed = 3819
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = rnd(12) + 1
    const nums = Array.from({ length: n }, () => rnd(19) - 9)
    const k = rnd(21)
    assert.deepEqual(solve(nums, k), oracle(nums, k), JSON.stringify({ nums, k }))
  }
})
