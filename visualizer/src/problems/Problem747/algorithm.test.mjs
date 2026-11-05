import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

function brute(nums) {
  const mx = Math.max(...nums)
  const idx = nums.indexOf(mx)
  return nums.every((v, i) => i === idx || mx >= 2 * v) ? idx : -1
}

test('747 worked examples', () => {
  assert.equal(buildTrace([4, 12, 3, 1]).result, 1)
  assert.equal(buildTrace([9, 5, 8]).result, -1)
  assert.equal(buildTrace([0, 0, 3]).result, 2)
  assert.equal(buildTrace([5]).result, 0)
})

test('747 random arrays match a direct maximum check', () => {
  let state = 747
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 1000; t++) {
    const nums = Array.from({ length: 1 + rand(7) }, () => rand(12))
    assert.equal(buildTrace(nums).result, brute(nums), JSON.stringify(nums))
  }
})

test('747 rejects values above 100', () => {
  assert.throws(() => parseInput('[101]'))
})
