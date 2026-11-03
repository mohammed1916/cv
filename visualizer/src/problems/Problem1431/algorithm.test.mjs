import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (candies, extraCandies) => buildTrace({ candies, extraCandies }).result

test('1431 sample inputs give the expected flags', () => {
  assert.deepEqual(solve([2, 3, 5, 1, 3], 3), [true, true, true, false, true])
  assert.deepEqual(solve([4, 2, 1, 1, 2], 1), [true, false, false, false, false])
  assert.deepEqual(solve([12, 1, 12], 10), [true, false, true])
})

test('1431 ties with the maximum are flagged true', () => {
  assert.deepEqual(solve([0, 0], 0), [true, true])
  assert.deepEqual(solve([5, 5, 3], 0), [true, true, false])
})

test('1431 rejects malformed input', () => {
  assert.throws(() => parseInput('[1,2]'), /object/)
  assert.throws(() => parseInput('{"candies":[1],"extraCandies":1}'), /2 to 20/)
  assert.throws(() => parseInput('{"candies":[1,2],"extraCandies":-1}'), /extraCandies/)
  assert.throws(() => parseInput('{"candies":[1,101],"extraCandies":1}'), /0 to 100/)
})

// Independent oracle: compare each child's total with the maximum of all totals computed from scratch.
test('1431 random inputs match a recomputed-maximum oracle', () => {
  let seed = 21
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const len = 2 + rnd(10)
    const candies = Array.from({ length: len }, () => rnd(101))
    const extraCandies = rnd(101)
    const expected = candies.map((_, i) => {
      const totals = candies.map((c, j) => (j === i ? c + extraCandies : c))
      return totals[i] === Math.max(...totals)
    })
    parseInput(JSON.stringify({ candies, extraCandies }))
    assert.deepEqual(solve(candies, extraCandies), expected, JSON.stringify({ candies, extraCandies }))
  }
})
