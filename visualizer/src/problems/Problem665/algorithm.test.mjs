import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('665 official examples', () => {
  assert.equal(buildTrace([4, 2, 3]).result, true)
  assert.equal(buildTrace([4, 2, 1]).result, false)
  assert.equal(buildTrace([3, 4, 2, 3]).result, false)
  assert.equal(buildTrace([1]).result, true)
})

// Oracle: some single position, set to some value in a small range, must make the array sorted.
test('665 random arrays match a single-replacement search', () => {
  let state = 37
  const rand = k => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % k }
  const sorted = a => a.every((v, i) => i === 0 || a[i - 1] <= v)
  for (let t = 0; t < 400; t++) {
    const nums = Array.from({ length: 1 + rand(6) }, () => rand(7))
    let expected = sorted(nums)
    for (let i = 0; i < nums.length && !expected; i++) for (let v = -1; v <= 7 && !expected; v++) {
      const copy = [...nums]
      copy[i] = v
      if (sorted(copy)) expected = true
    }
    assert.equal(buildTrace(nums).result, expected, JSON.stringify(nums))
  }
})

test('665 rejects non-integer input', () => {
  assert.throws(() => parseInput('[1.5]'))
})
