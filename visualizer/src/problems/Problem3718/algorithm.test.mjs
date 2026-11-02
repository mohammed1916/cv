import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, k) => buildTrace({ nums, k }).result

test('3718 worked examples', () => {
  assert.equal(solve([3, 4, 6, 8], 2), 2)
  assert.equal(solve([2, 4, 3], 2), 6)
  assert.equal(solve([1, 2, 3], 1), 4)
  assert.equal(solve([5], 3), 3)
})

test('3718 rejects invalid input', () => {
  assert.throws(() => parseInput('{"nums":[1],"k":0}'))
  assert.throws(() => parseInput('{"nums":[],"k":2}'))
})

function oracle(nums, k) {
  for (let m = k; ; m += k) if (!nums.includes(m)) return m
}

test('3718 random inputs match a linear-scan oracle', () => {
  let seed = 3718
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(10) }, () => 1 + rnd(30))
    const k = 1 + rnd(6)
    assert.equal(solve(nums, k), oracle(nums, k), JSON.stringify({ nums, k }))
  }
})
