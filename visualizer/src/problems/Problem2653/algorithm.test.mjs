import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, k, x) => buildTrace(parseInput(JSON.stringify({ nums, k, x }))).result

test('2653 official examples', () => {
  assert.deepEqual(solve([1, -1, -3, -2, 3], 3, 2), [-1, -2, -2])
  assert.deepEqual(solve([-1, -2, -3, -4, -5], 2, 2), [-1, -2, -3, -4])
  assert.deepEqual(solve([-3, 1, 2, -3, 0, -3], 2, 1), [-3, 0, -3, -3, -3])
})

test('2653 a window with too few negatives has beauty 0', () => {
  assert.deepEqual(solve([4, -2, 7], 2, 2), [0, 0])
})

test('2653 rejects x greater than k', () => {
  assert.throws(() => parseInput('{"nums":[1,2],"k":1,"x":2}'))
})

// Independent oracle: sort the negative values of each window and read position x.
function oracle(nums, k, x) {
  const out = []
  for (let start = 0; start + k <= nums.length; start++) {
    const negatives = nums.slice(start, start + k).filter(v => v < 0).sort((a, b) => a - b)
    out.push(negatives.length >= x ? negatives[x - 1] : 0)
  }
  return out
}

test('2653 random arrays match a sort-per-window oracle', () => {
  let seed = 2653
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const len = 1 + rnd(14)
    const nums = Array.from({ length: len }, () => rnd(101) - 50)
    const k = 1 + rnd(len)
    const x = 1 + rnd(k)
    assert.deepEqual(solve(nums, k, x), oracle(nums, k, x), JSON.stringify({ nums, k, x }))
  }
})
