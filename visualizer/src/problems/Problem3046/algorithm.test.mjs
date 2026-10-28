import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(parseInput(JSON.stringify(nums))).result

test('3046 official examples', () => {
  assert.equal(solve([1, 1, 2, 2, 3, 4]), true)
  assert.equal(solve([1, 1, 1, 1]), false)
})

test('3046 a value appearing exactly twice is allowed', () => {
  assert.equal(solve([5, 5, 6, 6]), true)
  assert.equal(solve([3, 3, 3, 4, 5, 6]), false)
})

test('3046 rejects odd lengths and values outside 1 to 6', () => {
  assert.throws(() => parseInput('[1,2,3]'))
  assert.throws(() => parseInput('[7,7]'))
  assert.throws(() => parseInput('[]'))
})

// Independent oracle: try every way to choose half of the positions for the first half,
// and check that neither half repeats a value.
function oracle(nums) {
  const n = nums.length
  const half = n / 2
  for (let mask = 0; mask < 1 << n; mask++) {
    let bits = 0
    for (let i = 0; i < n; i++) if ((mask >> i) & 1) bits++
    if (bits !== half) continue
    const first = nums.filter((_, i) => (mask >> i) & 1)
    const second = nums.filter((_, i) => !((mask >> i) & 1))
    if (new Set(first).size === half && new Set(second).size === half) return true
  }
  return false
}

test('3046 random arrays match a split-enumeration oracle', () => {
  let seed = 3046
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 400; t++) {
    const nums = Array.from({ length: 2 * (1 + rnd(4)) }, () => 1 + rnd(4))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
