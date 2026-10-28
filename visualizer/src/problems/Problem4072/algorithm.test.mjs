import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace({ nums }).result

test('4072 official examples', () => {
  assert.equal(solve([5, -5, 1]), 11)
  assert.equal(solve([10, -5, -100]), 110)
  assert.equal(solve([4, 7]), 7)
})

test('4072 a single element is its own alternating sum', () => {
  assert.equal(solve([-9]), -9)
})

test('4072 rejects an empty array', () => {
  assert.throws(() => parseInput('{"nums":[]}'))
})

// Independent oracle: every contiguous range, with each possible single deletion inside it (or none),
// scored directly by its alternating sum.
function altSum(seq) {
  return seq.reduce((sum, v, idx) => sum + (idx % 2 === 0 ? v : -v), 0)
}

function oracle(nums) {
  const n = nums.length
  let best = -Infinity
  for (let l = 0; l < n; l++) {
    for (let r = l; r < n; r++) {
      best = Math.max(best, altSum(nums.slice(l, r + 1)))
      for (let s = l + 1; s < r; s++) {
        best = Math.max(best, altSum(nums.slice(l, r + 1).filter((_, idx) => l + idx !== s)))
      }
    }
  }
  return best
}

test('4072 random arrays match a range-and-deletion oracle', () => {
  let seed = 4072
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(9) }, () => rnd(41) - 20)
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
