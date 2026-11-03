import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(parseInput(JSON.stringify(nums))).result

test('154 sample inputs return the minimum', () => {
  assert.equal(solve([4, 4, 6, 1, 4]), 1)
  assert.equal(solve([2, 2, 2, 2, 0, 2]), 0)
  assert.equal(solve([1, 1, 2, 3]), 1)
})

test('154 equal boundary values still find the minimum', () => {
  assert.equal(solve([3, 1, 1]), 1)
  assert.equal(solve([1, 3, 3]), 1)
  assert.equal(solve([7]), 7)
})

test('154 rejects arrays that are not rotated sorted arrays', () => {
  assert.throws(() => parseInput('[1,3,2]'), /rotated/)
  assert.throws(() => parseInput('[1,2,3,2]'), /rotated/)
  assert.throws(() => parseInput('[1.5]'), /integers/)
})

test('154 random rotated arrays with duplicates match Math.min', () => {
  let seed = 3
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 400; t++) {
    const len = 1 + rnd(12)
    const sorted = Array.from({ length: len }, () => rnd(5)).sort((a, b) => a - b)
    const shift = rnd(len)
    const nums = [...sorted.slice(shift), ...sorted.slice(0, shift)]
    assert.equal(solve(nums), Math.min(...nums), JSON.stringify(nums))
  }
})
