import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, k) => buildTrace({ nums, k }).result

test('3865 hand-checked presets', () => {
  assert.deepEqual(solve([1, 2, 3, 4, 5, 6, 7, 8], 2), [4, 3, 2, 1, 8, 7, 6, 5])
  assert.deepEqual(solve([5, -1, 0, 3, 9, 9], 3), [-1, 5, 3, 0, 9, 9])
})

test('3865 k equal to length leaves the array unchanged', () => {
  assert.deepEqual(solve([4, 4, 1], 3), [4, 4, 1])
})

test('3865 a single block reverses the whole array', () => {
  assert.deepEqual(solve([1, 2, 3], 1), [3, 2, 1])
})

test('3865 frames end with the result and the input is not mutated', () => {
  const nums = [1, 2, 3, 4]
  const run = buildTrace({ nums, k: 2 })
  assert.deepEqual(nums, [1, 2, 3, 4])
  assert.deepEqual(run.frames.at(-1).arr, run.result)
})

test('3865 rejects k that does not divide the length', () => {
  assert.throws(() => parseInput('{"nums":[1,2,3],"k":2}'))
})

test('3865 matches a slice-reversal oracle on random inputs', () => {
  let seed = 3865
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const k = 1 + rnd(4)
    const size = 1 + rnd(4)
    const nums = Array.from({ length: k * size }, () => rnd(19) - 9)
    const expected = []
    for (let b = 0; b < k; b++) expected.push(...nums.slice(b * size, (b + 1) * size).reverse())
    assert.deepEqual(solve(nums, k), expected, JSON.stringify({ nums, k }))
  }
})
