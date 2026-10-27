import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(parseInput(JSON.stringify({ nums }))).result

test('2289 official examples', () => {
  assert.equal(solve([5, 3, 4, 4, 7, 3, 6, 11, 8, 5, 11]), 3)
  assert.equal(solve([4, 5, 7, 7, 13]), 0)
})

test('2289 edge cases', () => {
  assert.equal(solve([7]), 0)
  assert.equal(solve([3, 2, 1]), 1)
  assert.equal(solve([10, 1, 9, 8]), 2)
})

test('2289 rejects zero and too many values', () => {
  assert.throws(() => parseInput('{"nums":[0]}'))
  assert.throws(() => parseInput(JSON.stringify({ nums: Array(31).fill(1) })))
})

// Independent oracle: simulate the rounds directly, removing every element that is smaller than its left neighbour.
function oracle(nums) {
  let arr = [...nums]
  let rounds = 0
  for (;;) {
    const kept = arr.filter((v, i) => i === 0 || arr[i - 1] <= v)
    if (kept.length === arr.length) return rounds
    arr = kept
    rounds++
  }
}

test('2289 random arrays match a round-by-round simulation', () => {
  let seed = 2289
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(14) }, () => 1 + rnd(9))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
