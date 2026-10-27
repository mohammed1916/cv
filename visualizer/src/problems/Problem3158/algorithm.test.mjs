import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(parseInput(JSON.stringify({ nums }))).result

test('3158 official examples', () => {
  assert.equal(solve([1, 2, 1, 3]), 1)
  assert.equal(solve([1, 2, 3]), 0)
  assert.equal(solve([1, 2, 2, 1]), 3)
})

test('3158 a value seen three times is not counted', () => {
  assert.equal(solve([4, 4, 4]), 0)
})

test('3158 rejects zero', () => {
  assert.throws(() => parseInput('{"nums":[0]}'))
})

// Independent oracle: for each distinct value, count its occurrences with a filter, then xor the ones seen exactly twice.
function oracle(nums) {
  const distinct = [...new Set(nums)]
  let result = 0
  for (const v of distinct) {
    if (nums.filter(x => x === v).length === 2) result ^= v
  }
  return result
}

test('3158 random arrays match the filter oracle', () => {
  let seed = 3158
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(12) }, () => 1 + rnd(8))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
