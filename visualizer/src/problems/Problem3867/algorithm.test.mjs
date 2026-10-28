import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace({ nums }).result

// Independent oracle: recompute each prefix maximum from scratch, then repeatedly remove the smallest and largest remaining values.
function euclid(a, b) { return b === 0 ? a : euclid(b, a % b) }
function oracle(nums) {
  const values = nums.map((v, i) => euclid(v, Math.max(...nums.slice(0, i + 1))))
  let total = 0
  while (values.length >= 2) {
    const lo = Math.min(...values)
    values.splice(values.indexOf(lo), 1)
    const hi = Math.max(...values)
    values.splice(values.indexOf(hi), 1)
    total += euclid(lo, hi)
  }
  return total
}

test('3867 official examples', () => {
  assert.equal(solve([2, 6, 4]), 2)
  assert.equal(solve([3, 6, 2, 8]), 5)
})

test('3867 a single value leaves nothing to pair', () => {
  assert.equal(solve([7]), 0)
})

test('3867 rejects a zero value', () => {
  assert.throws(() => parseInput('{"nums":[0,4]}'))
})

test('3867 random arrays match the remove-min-and-max oracle', () => {
  let seed = 3867
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(10) }, () => 1 + rnd(60))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
