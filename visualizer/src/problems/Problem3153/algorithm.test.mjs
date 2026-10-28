import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(parseInput(JSON.stringify({ nums }))).result

test('3153 worked examples', () => {
  // 13 and 23 differ in one column, 13 and 12 in one, and 23 and 12 in two.
  assert.equal(solve([13, 23, 12]), 4)
  assert.equal(solve([10, 10, 10, 10]), 0)
})

test('3153 rejects numbers with different digit counts', () => {
  assert.throws(() => parseInput('{"nums":[1,23]}'))
})

// Independent oracle: compare every pair of numbers digit by digit as strings.
function oracle(nums) {
  let total = 0
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      const a = String(nums[i]), b = String(nums[j])
      for (let p = 0; p < a.length; p++) if (a[p] !== b[p]) total++
    }
  }
  return total
}

test('3153 random arrays match a pairwise oracle', () => {
  let seed = 3153
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const len = 1 + rnd(5)
    const low = 10 ** (len - 1), span = 9 * 10 ** (len - 1)
    const nums = Array.from({ length: 2 + rnd(12) }, () => low + rnd(span))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
