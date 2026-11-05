import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

function brute(nums, k) {
  // Try every way to cut into exactly k groups.
  const n = nums.length
  const rec = (start, groups) => {
    if (groups === 1) { const s = nums.slice(start); return s.reduce((x, y) => x + y, 0) / s.length }
    let best = -Infinity
    for (let end = start + 1; end <= n - (groups - 1); end++) {
      const s = nums.slice(start, end)
      best = Math.max(best, s.reduce((x, y) => x + y, 0) / s.length + rec(end, groups - 1))
    }
    return best
  }
  return rec(0, k)
}

test('813 worked examples', () => {
  assert.ok(Math.abs(buildTrace({ nums: [9, 1, 2, 3, 9], k: 3 }).result - 20) < 1e-9)
  assert.ok(Math.abs(buildTrace({ nums: [1, 2, 3, 4, 5, 6, 7], k: 4 }).result - 20.5) < 1e-9)
})

test('813 small arrays match an exhaustive partition search', () => {
  let state = 813
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rand(6)
    const nums = Array.from({ length: n }, () => rand(20))
    const k = 1 + rand(n)
    assert.ok(Math.abs(buildTrace({ nums, k }).result - brute(nums, k)) < 1e-9, JSON.stringify({ nums, k }))
  }
})

test('813 rejects k above the length', () => {
  assert.throws(() => parseInput('{"nums":[1],"k":2}'))
})
