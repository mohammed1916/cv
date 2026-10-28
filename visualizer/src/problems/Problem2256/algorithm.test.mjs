import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(parseInput(JSON.stringify({ nums }))).result

test('2256 official examples', () => {
  assert.equal(solve([2, 5, 3, 9, 5, 3]), 3)
  assert.equal(solve([0]), 0)
})

test('2256 a tie keeps the smallest index', () => {
  assert.equal(solve([1, 1, 1]), 0)
})

test('2256 rejects a negative value', () => {
  assert.throws(() => parseInput('{"nums":[-1]}'))
})

// Independent oracle: recompute both floored averages from slices for every split.
function oracle(nums) {
  const n = nums.length
  const avg = part => (part.length === 0 ? 0 : Math.floor(part.reduce((a, b) => a + b, 0) / part.length))
  let best = Infinity
  let index = -1
  for (let i = 0; i < n; i++) {
    const diff = Math.abs(avg(nums.slice(0, i + 1)) - avg(nums.slice(i + 1)))
    if (diff < best) {
      best = diff
      index = i
    }
  }
  return index
}

test('2256 seeded random arrays match a slice-based oracle', () => {
  let seed = 2256
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(12) }, () => rnd(21))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
