import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (arr, target) => buildTrace({ arr, target }).result

test('1521 official-style examples', () => {
  assert.equal(solve([9, 12, 3, 7, 1], 5), 2)
  assert.equal(solve([1, 2, 4, 8, 16], 0), 0)
  assert.equal(solve([1, 2, 4, 8, 16], 1), 0)
})

test('1521 a single element can be the closest value', () => {
  assert.equal(solve([7], 2), 5)
  assert.equal(solve([6, 6], 6), 0)
})

test('1521 rejects malformed input', () => {
  assert.throws(() => parseInput('[1,2]'))
  assert.throws(() => parseInput('{"arr":[],"target":1}'))
  assert.throws(() => parseInput('{"arr":[1],"target":-1}'))
})

// Independent oracle: every subarray's AND, computed directly.
function oracle(arr, target) {
  let best = Infinity
  for (let l = 0; l < arr.length; l++) {
    let value = -1
    for (let r = l; r < arr.length; r++) {
      value = value === -1 ? arr[r] : value & arr[r]
      best = Math.min(best, Math.abs(value - target))
    }
  }
  return best
}

test('1521 random arrays match a brute-force subarray oracle', () => {
  let seed = 521
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 400; t++) {
    const arr = Array.from({ length: 1 + rnd(12) }, () => rnd(1024))
    const target = rnd(1024)
    assert.equal(solve(arr, target), oracle(arr, target), JSON.stringify({ arr, target }))
  }
})
