import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('2530 official examples', () => {
  assert.equal(solve({ nums: [10, 10, 10, 10, 10], k: 5 }), 50)
  assert.equal(solve({ nums: [1, 10, 3, 3, 3], k: 3 }), 17)
})

test('2530 a single number is divided by three each time', () => {
  // 7 gives 7, then 3, then 1.
  assert.equal(solve({ nums: [7], k: 3 }), 11)
})

test('2530 rejects an empty list and a zero k', () => {
  assert.throws(() => parseInput('{"nums":[],"k":1}'))
  assert.throws(() => parseInput('{"nums":[4],"k":0}'))
})

// Independent oracle: sort a copy in descending order each round and replace the first element.
function oracle({ nums, k }) {
  const values = [...nums]
  let score = 0
  for (let round = 0; round < k; round++) {
    const sorted = [...values].sort((a, b) => b - a)
    const x = sorted[0]
    score += x
    values.splice(values.indexOf(x), 1)
    values.push(Math.ceil(x / 3))
  }
  return score
}

test('2530 random inputs match a sort-based oracle', () => {
  let seed = 2530
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const input = { nums: Array.from({ length: 1 + rnd(6) }, () => 1 + rnd(30)), k: 1 + rnd(8) }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
