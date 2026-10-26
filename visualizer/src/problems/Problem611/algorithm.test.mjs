import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('611 official examples', () => {
  assert.equal(buildTrace([2, 2, 3, 4]).result, 3)
  assert.equal(buildTrace([4, 2, 3, 4]).result, 4)
  assert.equal(buildTrace([1, 2, 3]).result, 0)
})

test('611 random arrays match a triple brute force', () => {
  let state = 31
  const rand = k => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % k }
  for (let t = 0; t < 500; t++) {
    const nums = Array.from({ length: 1 + rand(9) }, () => rand(12))
    let expected = 0
    for (let i = 0; i < nums.length; i++) for (let j = i + 1; j < nums.length; j++) for (let k = j + 1; k < nums.length; k++) {
      const [x, y, z] = [nums[i], nums[j], nums[k]].sort((p, q) => p - q)
      if (x + y > z) expected++
    }
    assert.equal(buildTrace(nums).result, expected, JSON.stringify(nums))
  }
})

test('611 rejects values above 1000', () => {
  assert.throws(() => parseInput('[1001]'))
})
