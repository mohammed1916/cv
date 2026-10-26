import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('697 official examples', () => {
  assert.equal(buildTrace([1, 2, 2, 3, 1]).result, 2)
  assert.equal(buildTrace([1, 2, 2, 3, 1, 4, 2]).result, 6)
})

test('697 random arrays match a brute force over every subarray', () => {
  let state = 5
  const rand = k => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % k }
  for (let t = 0; t < 400; t++) {
    const nums = Array.from({ length: 1 + rand(10) }, () => rand(4))
    const degreeOf = a => { const c = {}; for (const v of a) c[v] = (c[v] ?? 0) + 1; return Math.max(...Object.values(c)) }
    const D = degreeOf(nums)
    let best = Infinity
    for (let i = 0; i < nums.length; i++) for (let j = i; j < nums.length; j++) {
      const sub = nums.slice(i, j + 1)
      if (degreeOf(sub) === D) best = Math.min(best, sub.length)
    }
    assert.equal(buildTrace(nums).result, best, JSON.stringify(nums))
  }
})

test('697 rejects values out of range', () => {
  assert.throws(() => parseInput('[50000]'))
})
