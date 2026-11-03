import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(nums).result

test('3779 hand-checked small cases', () => {
  assert.equal(solve([7, 7, 1]), 1)
  assert.equal(solve([6, 1, 6, 2, 9, 9, 4]), 2)
  assert.equal(solve([1, 2, 3, 4, 5]), 0)
  assert.equal(solve([9]), 0)
})

// Independent oracle: literally delete three front elements (or all that remain) until nothing repeats.
function oracle(nums) {
  const a = nums.slice()
  let ops = 0
  const distinct = arr => new Set(arr).size === arr.length
  while (a.length > 0 && !distinct(a)) {
    a.splice(0, Math.min(3, a.length))
    ops++
  }
  return ops
}

test('3779 matches the literal-deletion oracle', () => {
  let seed = 5
  const next = m => { seed = (seed * 1103515245 + 12345) % 2147483648; return 1 + (seed % m) }
  for (let t = 0; t < 400; t++) {
    const n = next(12)
    const nums = Array.from({ length: n }, () => next(6))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})

test('3779 rejects values outside 1 to 20', () => {
  assert.throws(() => parseInput('[0, 3]'))
})
