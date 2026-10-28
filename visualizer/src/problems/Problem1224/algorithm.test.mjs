import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(nums).result

test('1224 official examples', () => {
  assert.equal(solve([2, 2, 1, 1, 5, 3, 3, 5]), 7)
  assert.equal(solve([1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4, 5]), 13)
  assert.equal(solve([1, 1, 1, 2, 2, 2]), 5)
})

test('1224 edge cases: a single element and a pair of equal values', () => {
  assert.equal(solve([1]), 1)
  assert.equal(solve([1, 1]), 2)
})

test('1224 rejects an empty array and an out-of-range value', () => {
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput('[6]'))
})

// Independent oracle: for each prefix, try removing each present value once and check the counts.
function oracle(nums) {
  let best = 0
  for (let p = 1; p <= nums.length; p++) {
    const counts = new Map()
    for (const v of nums.slice(0, p)) counts.set(v, (counts.get(v) ?? 0) + 1)
    const fixable = [...counts.keys()].some(x => {
      const after = new Map(counts)
      if (after.get(x) === 1) after.delete(x)
      else after.set(x, after.get(x) - 1)
      const values = [...after.values()]
      return values.every(v => v === values[0])
    })
    if (fixable) best = p
  }
  return best
}

test('1224 random arrays match a remove-and-check oracle', () => {
  let seed = 1224
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(12) }, () => 1 + rnd(5))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
