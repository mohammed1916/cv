import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('674 official examples', () => {
  assert.equal(buildTrace([1, 3, 5, 4, 7]).result, 3)
  assert.equal(buildTrace([2, 2, 2, 2, 2]).result, 1)
})

test('674 random arrays match every contiguous window scan', () => {
  let state = 66
  const rand = k => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % k }
  for (let t = 0; t < 400; t++) {
    const nums = Array.from({ length: 1 + rand(9) }, () => rand(5))
    let best = 0
    for (let i = 0; i < nums.length; i++) for (let j = i; j < nums.length; j++) {
      const window = nums.slice(i, j + 1)
      if (window.every((v, k) => k === 0 || v > window[k - 1])) best = Math.max(best, window.length)
    }
    assert.equal(buildTrace(nums).result, best, JSON.stringify(nums))
  }
})

test('674 rejects empty input', () => {
  assert.throws(() => parseInput('[]'))
})
