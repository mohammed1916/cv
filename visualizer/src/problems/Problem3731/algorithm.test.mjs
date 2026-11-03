import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace({ nums }).result

test('3731 hand-checked cases', () => {
  assert.deepEqual(solve([6, 2, 9, 3]), [4, 5, 7, 8])
  assert.deepEqual(solve([7, 8, 6, 9]), [])
  assert.deepEqual(solve([7, 4]), [5, 6])
  assert.deepEqual(solve([10, 12]), [11])
})

test('3731 matches a set-difference oracle on small inputs', () => {
  for (let trial = 0; trial < 200; trial++) {
    const pool = Array.from({ length: 15 }, (_, i) => i - 7)
    const nums = pool.filter(() => Math.random() < 0.5)
    if (nums.length < 2) continue
    const lo = Math.min(...nums)
    const hi = Math.max(...nums)
    const expected = []
    for (let v = lo; v <= hi; v++) if (!nums.includes(v)) expected.push(v)
    assert.deepEqual(solve(nums), expected)
  }
})

test('3731 rejects duplicate values', () => {
  assert.throws(() => parseInput('{"nums":[1,1]}'))
})
