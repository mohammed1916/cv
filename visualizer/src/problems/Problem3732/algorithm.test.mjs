import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace({ nums }).result

test('3732 hand-checked cases', () => {
  assert.equal(solve([-4, 6, 0]), 2400000)
  assert.equal(solve([1, 2, 3]), 600000)
  assert.equal(solve([0, 0, 0]), 0)
  assert.equal(solve([-1, -2, -3]), 600000)
})

// Independent oracle: try many sample replacement values and every triple, without the bound argument.
function oracle(nums) {
  const samples = [-100000, -99999, -50000, -1, 0, 1, 50000, 99999, 100000]
  let best = -Infinity
  for (let i = 0; i < nums.length; i++) {
    for (const x of samples) {
      const m = nums.map((v, j) => (j === i ? x : v))
      for (let a = 0; a < m.length; a++) for (let b = a + 1; b < m.length; b++) for (let c = b + 1; c < m.length; c++) {
        best = Math.max(best, m[a] * m[b] * m[c])
      }
    }
  }
  return best
}

test('3732 is never below the sampled oracle on random small arrays', () => {
  for (let trial = 0; trial < 200; trial++) {
    const n = 3 + Math.floor(Math.random() * 4)
    const nums = Array.from({ length: n }, () => Math.floor(Math.random() * 201) - 100)
    assert.ok(solve(nums) >= oracle(nums))
  }
})

test('3732 rejects arrays shorter than three', () => {
  assert.throws(() => parseInput('{"nums":[1,2]}'))
})
