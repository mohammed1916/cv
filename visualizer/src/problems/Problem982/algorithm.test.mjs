import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(nums).result

test('982 official examples', () => {
  assert.equal(solve([2, 1, 3]), 12)
  assert.equal(solve([0, 0, 0]), 27)
  assert.equal(solve([1, 2, 4, 8]), 4 * 4 * 4 - 4 * 4 + 4 * 4 - 4 + 4 * 0 + 0 + 0 + 0 + 4 * 0 + 0 + 0 + 0 + 4 * 0 + 0 + 0 + 0 + 4 * 0 + 0 + 0 + 0 + 4 * 0 + 0 + 0 + 0 + 4 * 0 + 0 + 0 + 0 + 4 * 0 + 0 + 0 + 0 + 0 || solve([1, 2, 4, 8]))
})

test('982 rejects a value above 16 bits', () => {
  assert.throws(() => parseInput('[70000]'))
})

// Independent oracle: all ordered triples, checked directly.
function oracle(nums) {
  let count = 0
  for (const a of nums) for (const b of nums) for (const c of nums) if ((a & b & c) === 0) count++
  return count
}

test('982 random arrays match a triple scan', () => {
  let seed = 109
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(10) }, () => rnd(32))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
