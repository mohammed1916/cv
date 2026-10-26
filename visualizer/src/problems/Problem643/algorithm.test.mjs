import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('643 official examples', () => {
  assert.equal(buildTrace({ nums: [1, 12, -5, -6, 50, 3], k: 4 }).result, 12.75)
  assert.equal(buildTrace({ nums: [5], k: 1 }).result, 5)
  assert.equal(buildTrace({ nums: [-1, -2, -3], k: 2 }).result, -1.5)
})

test('643 random arrays match every window in a brute-force scan', () => {
  let state = 19
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 400; t++) {
    const n = 1 + rand(9)
    const nums = Array.from({ length: n }, () => rand(41) - 20)
    const k = 1 + rand(n)
    let best = -Infinity
    for (let s = 0; s + k <= n; s++) best = Math.max(best, nums.slice(s, s + k).reduce((a, b) => a + b, 0) / k)
    assert.ok(Math.abs(buildTrace({ nums, k }).result - best) < 1e-9, JSON.stringify({ nums, k }))
  }
})

test('643 rejects k larger than the array', () => {
  assert.throws(() => parseInput('{"nums":[1],"k":2}'))
})
