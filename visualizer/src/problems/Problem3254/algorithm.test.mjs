import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, k) => buildTrace(parseInput(JSON.stringify({ nums, k }))).result

test('3254 official examples', () => {
  assert.deepEqual(solve([1, 2, 3, 4, 3, 2, 5], 3), [3, 4, -1, -1, -1])
  assert.deepEqual(solve([2, 2, 2, 2, 2], 4), [-1, -1])
  assert.deepEqual(solve([3, 2, 3, 2, 3, 2], 2), [-1, 3, -1, 3, -1])
})

test('3254 a window of one value always has power itself', () => {
  assert.deepEqual(solve([7, 1, 9], 1), [7, 1, 9])
})

test('3254 rejects k larger than nums', () => {
  assert.throws(() => parseInput('{"nums":[1,2],"k":3}'))
})

// Independent oracle: sort each window and check that it is a run of consecutive values.
function oracle(nums, k) {
  const out = []
  for (let start = 0; start + k <= nums.length; start++) {
    const window = nums.slice(start, start + k)
    const sorted = [...window].sort((a, b) => a - b)
    const consecutive = sorted.every((v, i) => i === 0 || v === sorted[i - 1] + 1)
    const inOrder = window.every((v, i) => v === sorted[i])
    out.push(consecutive && inOrder ? sorted[sorted.length - 1] : -1)
  }
  return out
}

test('3254 random arrays match a sort-based oracle', () => {
  let seed = 3254
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const len = 1 + rnd(12)
    const nums = Array.from({ length: len }, () => 1 + rnd(6))
    const k = 1 + rnd(len)
    assert.deepEqual(solve(nums, k), oracle(nums, k), JSON.stringify({ nums, k }))
  }
})
