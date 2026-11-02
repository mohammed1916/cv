import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace({ nums }).result

test('3766 worked examples', () => {
  assert.equal(solve([1, 2, 3, 4]), 2)
  assert.equal(solve([10]), 1)
  assert.equal(solve([5]), 0)
  assert.equal(solve([1]), 0)
})

test('3766 rejects invalid input', () => {
  assert.throws(() => parseInput('{"nums":[]}'))
  assert.throws(() => parseInput('{"nums":[0]}'))
})

const isPal = v => { const b = v.toString(2); return b === [...b].reverse().join('') }
function oracle(nums) {
  let total = 0
  for (const x of nums) {
    let best = Infinity
    for (let p = 1; p <= 512; p++) if (isPal(p)) best = Math.min(best, Math.abs(p - x))
    total += best
  }
  return total
}

test('3766 random inputs match a brute-force palindrome scan', () => {
  let seed = 3766
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const nums = Array.from({ length: 1 + rnd(5) }, () => 1 + rnd(200))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
