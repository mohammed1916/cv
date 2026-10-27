import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('2386 official examples', () => {
  assert.equal(solve({ nums: [2, 4, -2], k: 5 }), 2)
  assert.equal(solve({ nums: [1, -2, 3, 4, -10, 12], k: 16 }), 10)
})

test('2386 k of 1 is the sum of the positive numbers', () => {
  assert.equal(solve({ nums: [-3, 5, 2], k: 1 }), 7)
})

test('2386 rejects k above the number of subsequences', () => {
  assert.throws(() => parseInput('{"nums":[1,2],"k":5}'))
})

// Independent oracle: list the sum of every subsequence, sort them in descending order, and take the k-th.
function oracle({ nums, k }) {
  const sums = []
  for (let mask = 0; mask < 1 << nums.length; mask++) {
    let s = 0
    for (let i = 0; i < nums.length; i++) if (mask & (1 << i)) s += nums[i]
    sums.push(s)
  }
  sums.sort((a, b) => b - a)
  return sums[k - 1]
}

test('2386 random inputs match an exhaustive subsequence oracle', () => {
  let seed = 2386
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const length = 1 + rnd(6)
    const nums = Array.from({ length }, () => rnd(41) - 20)
    const input = { nums, k: 1 + rnd(2 ** length) }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
