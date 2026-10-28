import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(parseInput(JSON.stringify(nums))).result

test('2404 official examples', () => {
  assert.equal(solve([0, 1, 2, 2, 4, 4, 1]), 2)
  assert.equal(solve([1, 3, 5]), -1)
  assert.equal(solve([29, 47, 21, 41, 13, 37, 25, 7]), -1)
})

test('2404 a tie between even values goes to the smaller one', () => {
  assert.equal(solve([8, 4, 8, 4]), 4)
  assert.equal(solve([6]), 6)
})

test('2404 rejects values outside 0 to 100', () => {
  assert.throws(() => parseInput('[101]'))
  assert.throws(() => parseInput('[-2]'))
  assert.throws(() => parseInput('[]'))
})

// Independent oracle: list the distinct even values, sort by count then value, take the first.
function oracle(nums) {
  const distinct = [...new Set(nums.filter(v => v % 2 === 0))]
  if (distinct.length === 0) return -1
  const countOf = v => nums.filter(x => x === v).length
  distinct.sort((a, b) => countOf(b) - countOf(a) || a - b)
  return distinct[0]
}

test('2404 random arrays match a sort-based oracle', () => {
  let seed = 2404
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 400; t++) {
    const nums = Array.from({ length: 1 + rnd(16) }, () => rnd(9))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
