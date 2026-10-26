import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('673 official examples', () => {
  assert.equal(buildTrace([1, 3, 5, 4, 7]).result, 2)
  assert.equal(buildTrace([2, 2, 2, 2, 2]).result, 5)
})

// Oracle: enumerate every index subset (up to 10 elements) and keep strictly increasing ones of maximum length.
test('673 small arrays match subset enumeration', () => {
  let state = 45
  const rand = k => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % k }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rand(9) }, () => rand(6))
    let best = 0, count = 0
    for (let mask = 1; mask < 1 << nums.length; mask++) {
      const picked = nums.filter((_, i) => mask & (1 << i))
      if (picked.some((v, i) => i && v <= picked[i - 1])) continue
      if (picked.length > best) { best = picked.length; count = 1 } else if (picked.length === best) count++
    }
    assert.equal(buildTrace(nums).result, count, JSON.stringify(nums))
  }
})

test('673 rejects non-integers', () => {
  assert.throws(() => parseInput('[1.5]'))
})
