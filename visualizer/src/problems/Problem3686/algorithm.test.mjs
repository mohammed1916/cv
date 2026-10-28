import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(nums).result

test('3686 official examples', () => {
  assert.equal(solve([1, 3, 5]), 6)
  assert.equal(solve([2, 3, 4, 2]), 14)
})

test('3686 a single element and a mixed pair', () => {
  assert.equal(solve([7]), 1)
  assert.equal(solve([2, 4]), 3)
})

test('3686 rejects a non-integer element', () => {
  assert.throws(() => parseInput('[1.5]'))
  assert.throws(() => parseInput('[]'))
})

// Independent oracle: enumerate every non-empty subset of positions and test each subsequence directly.
function oracle(nums) {
  let count = 0
  for (let mask = 1; mask < 1 << nums.length; mask++) {
    const seq = nums.filter((_, i) => mask & (1 << i)).map(v => v % 2)
    let stable = true
    for (let i = 2; i < seq.length; i++) {
      if (seq[i] === seq[i - 1] && seq[i - 1] === seq[i - 2]) { stable = false; break }
    }
    if (stable) count++
  }
  return count
}

test('3686 random arrays match a subset-enumeration oracle', () => {
  let seed = 3686
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(10) }, () => 1 + rnd(50))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
