import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace({ nums }).result

test('4037 hand-checked arrays', () => {
  assert.equal(solve([5, 5, 5]), 2)
  assert.equal(solve([2, 4, 6]), 1)
  assert.equal(solve([6, 3, 9, 12]), 1)
  assert.equal(solve([7, 11]), 0)
})

test('4037 rejects bad input', () => {
  assert.throws(() => parseInput('{"nums":[3]}'))
  assert.throws(() => parseInput('{"nums":[0,2]}'))
})

// Oracle: try every removal (and none) with gcd computed by reduction over explicit slices.
function oracle(nums) {
  const g = list => list.reduce((a, b) => { let x = a, y = b; while (y) [x, y] = [y, x % y]; return x }, 0)
  const countSplits = arr => {
    let c = 0
    for (let i = 1; i < arr.length; i++) if (g(arr.slice(0, i)) === g(arr.slice(i))) c++
    return c
  }
  let best = countSplits(nums)
  for (let r = 0; r < nums.length; r++) best = Math.max(best, countSplits(nums.filter((_, i) => i !== r)))
  return best
}

test('4037 random arrays match the brute-force oracle', () => {
  let seed = 4037
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  for (let t = 0; t < 300; t++) {
    const n = 2 + rnd(7)
    const nums = Array.from({ length: n }, () => 1 + rnd(24))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
