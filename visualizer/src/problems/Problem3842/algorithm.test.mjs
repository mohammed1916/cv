import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = bulbs => buildTrace({ bulbs }).result

test('3842 worked examples', () => {
  assert.deepEqual(solve([10, 30, 20, 10, 20, 40]), [30, 40])
  assert.deepEqual(solve([1, 2, 2, 3]), [1, 3])
})

test('3842 edge cases', () => {
  assert.deepEqual(solve([5, 5]), [])
  assert.deepEqual(solve([100]), [100])
  assert.deepEqual(solve([1, 1, 1]), [1])
  assert.deepEqual(solve([7, 3, 7, 3, 7]), [7])
})

test('3842 rejects out of range entries', () => {
  assert.throws(() => parseInput('{"bulbs":[0]}'))
  assert.throws(() => parseInput('{"bulbs":[101]}'))
  assert.throws(() => parseInput('{"bulbs":[]}'))
})

// Oracle: a bulb is on exactly when it appears an odd number of times.
function oracle(bulbs) {
  const out = []
  for (let b = 1; b <= 100; b++) {
    const count = bulbs.filter(x => x === b).length
    if (count % 2 === 1) out.push(b)
  }
  return out
}

test('3842 random inputs match a parity oracle', () => {
  let seed = 3842
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const bulbs = Array.from({ length: 1 + rnd(20) }, () => 1 + rnd(12))
    assert.deepEqual(solve(bulbs), oracle(bulbs), JSON.stringify(bulbs))
  }
})
