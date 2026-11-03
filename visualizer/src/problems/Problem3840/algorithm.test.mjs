import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, solve } from './algorithm.js'

// Brute force: every set of houses; a set is valid when no two consecutive chosen houses share a colour.
function brute({ nums, colors }) {
  const n = nums.length
  let best = 0
  for (let mask = 0; mask < 1 << n; mask++) {
    let ok = true
    let total = 0
    for (let i = 0; i < n && ok; i++) {
      if (!(mask & (1 << i))) continue
      total += nums[i]
      if (i > 0 && (mask & (1 << (i - 1))) && colors[i] === colors[i - 1]) ok = false
    }
    if (ok) best = Math.max(best, total)
  }
  return best
}

test('3840 worked cases', () => {
  assert.equal(solve({ nums: [1, 4, 3, 5], colors: [1, 1, 2, 2] }), 9)
  assert.equal(solve({ nums: [3, 1, 2, 4], colors: [2, 3, 2, 2] }), 8)
  assert.equal(solve({ nums: [10, 1, 3, 9], colors: [1, 1, 1, 2] }), 22)
})

test('3840 matches a brute force on fixed inputs', () => {
  const cases = [
    { nums: [5, 5, 5, 5], colors: [1, 1, 1, 1] },
    { nums: [2, 7, 9, 3, 1], colors: [1, 2, 2, 3, 3] },
    { nums: [0, 4, 0, 6, 1, 8], colors: [2, 2, 1, 1, 1, 2] },
  ]
  for (const input of cases) assert.equal(solve(input), brute(input))
})

test('3840 every frame names a Python and pseudocode line', () => {
  for (const frame of buildTrace({ nums: [1, 2], colors: [1, 1] }).frames) assert.ok(frame.pythonLine > 0 && frame.activeLine > 0)
})

test('3840 rejects mismatched lengths', () => {
  assert.throws(() => parseInput('{"nums":[1,2],"colors":[1]}'))
})
