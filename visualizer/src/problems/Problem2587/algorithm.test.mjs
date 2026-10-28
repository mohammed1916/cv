import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(input).result

test('2587 official examples', () => {
  assert.equal(solve({ nums: [2, -1, 0, 1, -3, 3, -3] }), 6)
  assert.equal(solve({ nums: [-2, -3, 0] }), 0)
})

test('2587 a single positive number scores one', () => {
  assert.equal(solve({ nums: [4] }), 1)
})

test('2587 rejects a value out of range', () => {
  assert.throws(() => parseInput('{"nums":[11]}'))
})

// Independent oracle: try every arrangement and count the positive prefix sums.
function oracle({ nums }) {
  const n = nums.length
  const used = Array(n).fill(false)
  let best = 0
  const walk = (depth, total, score) => {
    if (depth === n) { best = Math.max(best, score); return }
    for (let i = 0; i < n; i++) {
      if (used[i]) continue
      used[i] = true
      const next = total + nums[i]
      walk(depth + 1, next, score + (next > 0 ? 1 : 0))
      used[i] = false
    }
  }
  walk(0, 0, 0)
  return best
}

test('2587 random arrays match an arrangement oracle', () => {
  let seed = 2587
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const input = { nums: Array.from({ length: 1 + rnd(6) }, () => rnd(21) - 10) }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
