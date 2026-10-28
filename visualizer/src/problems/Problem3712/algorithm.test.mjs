import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, k) => buildTrace(parseInput(JSON.stringify({ nums, k }))).result

test('3712 official examples', () => {
  assert.equal(solve([1, 2, 2, 3, 3, 3, 3, 4], 2), 16)
  assert.equal(solve([1, 2, 3, 4, 5], 2), 0)
  assert.equal(solve([4, 4, 4, 1, 2, 3], 3), 12)
})

test('3712 k equal to 1 sums the whole array', () => {
  assert.equal(solve([5, 6, 7], 1), 18)
})

test('3712 rejects k below 1', () => {
  assert.throws(() => parseInput('{"nums":[1],"k":0}'))
})

// Independent oracle: for each element, count its occurrences by scanning the whole array again.
function oracle(nums, k) {
  return nums.filter(x => nums.filter(y => y === x).length % k === 0).reduce((a, b) => a + b, 0)
}

let seed = 3712
const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }

test('3712 seeded random against rescan oracle', () => {
  for (let t = 0; t < 150; t++) {
    const nums = Array.from({ length: 1 + rnd(10) }, () => 1 + rnd(5))
    const k = 1 + rnd(4)
    assert.equal(solve(nums, k), oracle(nums, k), JSON.stringify({ nums, k }))
  }
})
