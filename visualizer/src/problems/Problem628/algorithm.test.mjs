import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('628 official examples', () => {
  assert.equal(buildTrace([1, 2, 3]).result, 6)
  assert.equal(buildTrace([1, 2, 3, 4]).result, 24)
  assert.equal(buildTrace([-1, -2, -3]).result, -6)
  assert.equal(buildTrace([-100, -2, 3, 4]).result, 800)
})

test('628 random arrays match a sort-based oracle', () => {
  let state = 61
  const rand = k => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % k }
  for (let t = 0; t < 1000; t++) {
    const nums = Array.from({ length: 3 + rand(6) }, () => rand(41) - 20)
    const s = [...nums].sort((a, b) => a - b), n = s.length
    const expected = Math.max(s[n - 1] * s[n - 2] * s[n - 3], s[0] * s[1] * s[n - 1])
    assert.equal(buildTrace(nums).result, expected, JSON.stringify(nums))
  }
})

test('628 rejects arrays shorter than three', () => {
  assert.throws(() => parseInput('[1,2]'))
})
