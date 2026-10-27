import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('1283 official examples', () => {
  assert.equal(solve({ nums: [1, 2, 5, 9], threshold: 6 }), 5)
  assert.equal(solve({ nums: [44, 22, 33, 11, 1], threshold: 5 }), 44)
  assert.equal(solve({ nums: [2, 3, 5, 7, 11], threshold: 11 }), 3)
})

test('1283 rejects a threshold below the array length', () => {
  assert.throws(() => parseInput('{"nums":[1,2,3],"threshold":2}'))
})

// Independent oracle: try every divisor from 1 upward and return the first that fits.
function oracle({ nums, threshold }) {
  for (let d = 1; ; d++) {
    const sum = nums.reduce((acc, v) => acc + Math.ceil(v / d), 0)
    if (sum <= threshold) return d
  }
}

test('1283 seeded random cases match a linear scan', () => {
  let seed = 1283
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const length = 1 + rnd(8)
    const nums = Array.from({ length }, () => 1 + rnd(50))
    const input = { nums, threshold: length + rnd(51 - length) }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
