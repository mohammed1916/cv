import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = nums => buildTrace(nums).result

test('3511 worked presets', () => {
  assert.equal(solve([2, -3, 1, 4, -5, 2]), 1)
  assert.equal(solve([3, 1, 2, 5]), 0)
  assert.equal(solve([1, 1, -7, 1, 1]), 1)
})

test('3511 edge cases', () => {
  assert.equal(solve([5]), 0)
  assert.equal(solve([0, 0, 0]), 1)
  assert.equal(solve([-1, -1, -1, -1]), 1)
})

test('3511 rejects bad input', () => {
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput('[10]'))
  assert.throws(() => parseInput('{"nums":[1]}'))
})

// Oracle: a replaced position can be set to a huge positive value, which only raises window sums.
// So a set R works exactly when every window of length >= 3 with no index in R has a positive sum.
// Check every subset R in order of size, with the replaced values set to 1000000.
function oracle(nums) {
  const n = nums.length
  for (let size = 0; size <= n; size++) {
    for (let mask = 0; mask < 1 << n; mask++) {
      let bits = 0
      for (let i = 0; i < n; i++) if (mask & (1 << i)) bits++
      if (bits !== size) continue
      const values = nums.map((v, i) => (mask & (1 << i) ? 1000000 : v))
      let ok = true
      for (let l = 0; l < n && ok; l++) {
        let sum = 0
        for (let r = l; r < n; r++) {
          sum += values[r]
          if (r - l + 1 >= 3 && sum <= 0) { ok = false; break }
        }
      }
      if (ok) return size
    }
  }
  return n
}

test('3511 random inputs match a subset oracle', () => {
  let seed = 3511
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(7) }, () => rnd(19) - 9)
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})

test('3511 frames keep pseudocode and python line references inside range', () => {
  const pyLines = python.trim().split('\n').length
  const run = buildTrace([2, -3, 1, 4, -5, 2])
  assert.equal(run.frames.at(-1).phase, 'done')
  for (const frame of run.frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyLines)
  }
})
