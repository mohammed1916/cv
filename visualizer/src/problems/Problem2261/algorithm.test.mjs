import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('2261 official-style examples', () => {
  assert.equal(solve({ nums: [2, 3, 3, 2, 2], k: 2, p: 2 }), 11)
  assert.equal(solve({ nums: [1, 2, 3, 4], k: 4, p: 1 }), 10)
})

test('2261 rejects k larger than the array and a bad p', () => {
  assert.throws(() => parseInput('{"nums":[1,2],"k":3,"p":1}'))
  assert.throws(() => parseInput('{"nums":[1,2],"k":1,"p":0}'))
})

// Independent oracle: list every subarray, count its multiples of p from scratch, and keep the qualifying ones.
function oracle({ nums, k, p }) {
  const keys = new Set()
  const n = nums.length
  for (let i = 0; i < n; i++) {
    for (let j = i; j < n; j++) {
      const sub = nums.slice(i, j + 1)
      const multiples = sub.filter(v => v % p === 0).length
      if (multiples <= k) keys.add(sub.join(','))
    }
  }
  return keys.size
}

test('2261 random arrays match an enumerate-everything oracle', () => {
  let seed = 2261
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(8)
    const nums = Array.from({ length: n }, () => 1 + rnd(6))
    const input = { nums, k: 1 + rnd(n), p: 1 + rnd(6) }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
