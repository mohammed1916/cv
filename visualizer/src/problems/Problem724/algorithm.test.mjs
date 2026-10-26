import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('724 official examples', () => {
  assert.equal(buildTrace([1, 7, 3, 6, 5, 6]).result, 3)
  assert.equal(buildTrace([1, 2, 3]).result, -1)
  assert.equal(buildTrace([2, 1, -1]).result, 0)
})

test('724 random arrays match the first index with equal side sums', () => {
  let state = 241
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 400; t++) {
    const nums = Array.from({ length: 1 + rand(8) }, () => rand(9) - 4)
    let expected = -1
    for (let i = 0; i < nums.length && expected < 0; i++) {
      const l = nums.slice(0, i).reduce((a, b) => a + b, 0), r = nums.slice(i + 1).reduce((a, b) => a + b, 0)
      if (l === r) expected = i
    }
    assert.equal(buildTrace(nums).result, expected, JSON.stringify(nums))
  }
})

test('724 rejects non-integers', () => {
  assert.throws(() => parseInput('[1.5]'))
})
