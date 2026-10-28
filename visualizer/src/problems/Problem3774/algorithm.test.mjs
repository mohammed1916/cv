import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(input).result

test('3774 official examples', () => {
  assert.equal(solve({ nums: [5, 2, 2, 4], k: 2 }), 5)
  assert.equal(solve({ nums: [100], k: 1 }), 0)
})

test('3774 edge case: k equal to n makes both sums the total', () => {
  assert.equal(solve({ nums: [3, 1, 4], k: 3 }), 0)
})

test('3774 rejects k of zero', () => {
  assert.throws(() => parseInput('{"nums":[1,2],"k":0}'))
})

// Independent oracle: repeatedly remove the current maximum and minimum instead of sorting.
function oracle({ nums, k }) {
  const rest = [...nums]
  let large = 0
  let small = 0
  for (let i = 0; i < k; i++) {
    let hi = 0
    for (let j = 1; j < rest.length; j++) if (rest[j] > rest[hi]) hi = j
    large += rest[hi]
    rest.splice(hi, 1)
  }
  const pool = [...nums]
  for (let i = 0; i < k; i++) {
    let lo = 0
    for (let j = 1; j < pool.length; j++) if (pool[j] < pool[lo]) lo = j
    small += pool[lo]
    pool.splice(lo, 1)
  }
  return Math.abs(large - small)
}

test('3774 random inputs match a remove-extreme oracle', () => {
  let seed = 3774
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = rnd(12) + 1
    const input = { nums: Array.from({ length: n }, () => rnd(100) + 1), k: rnd(n) + 1 }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
