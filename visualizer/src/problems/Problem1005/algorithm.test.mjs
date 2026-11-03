import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, k) => buildTrace({ nums, k }).result

test('1005 hand-checked cases', () => {
  assert.equal(solve([3, -7, -2, 6], 3), 14)
  assert.equal(solve([5, -1, 2], 2), 6)
  assert.equal(solve([-3], 2), -3)
  assert.equal(solve([4, 0], 1), 4)
})

test('1005 every frame points at real code and Python lines', () => {
  for (const frame of buildTrace({ nums: [3, -7, -2, 6], k: 3 }).frames) {
    assert.ok(frame.activeLine >= 1, frame.message)
    assert.ok(frame.pythonLine >= 1, frame.message)
  }
})

test('1005 rejects malformed input', () => {
  assert.throws(() => parseInput('{"nums":[],"k":1}'), /nums/)
  assert.throws(() => parseInput('{"nums":[1],"k":0}'), /k is/)
})

// Independent oracle: apply all k flips by search, choosing any index each time.
function oracle(nums, k) {
  let best = -Infinity
  const walk = (arr, left) => {
    if (left === 0) {
      best = Math.max(best, arr.reduce((a, b) => a + b, 0))
      return
    }
    for (let i = 0; i < arr.length; i++) {
      const next = [...arr]
      next[i] = -next[i]
      walk(next, left - 1)
    }
  }
  walk(nums, k)
  return best
}

test('1005 random small inputs match an exhaustive flip search', () => {
  let seed = 1005
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const nums = Array.from({ length: 1 + rnd(4) }, () => rnd(21) - 10)
    const k = 1 + rnd(4)
    assert.equal(solve(nums, k), oracle(nums, k), JSON.stringify({ nums, k }))
  }
})
