import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, k) => buildTrace(parseInput(JSON.stringify({ nums, k }))).result

test('3095 official examples', () => {
  assert.equal(solve([1, 2, 3], 2), 1)
  assert.equal(solve([2, 1, 8], 10), 3)
  assert.equal(solve([1, 2], 4), -1)
})

test('3095 edge cases', () => {
  assert.equal(solve([0, 0, 7], 7), 1)
  assert.equal(solve([1, 1, 1, 2], 3), 2)
})

test('3095 rejects out of range values', () => {
  assert.throws(() => parseInput('{"nums":[256],"k":1}'))
  assert.throws(() => parseInput('{"nums":[1],"k":0}'))
})

// Independent oracle: list every subarray with its OR computed by reduction, then keep the shortest that qualifies.
function oracle(nums, k) {
  const lengths = []
  for (let i = 0; i < nums.length; i++) {
    for (let j = i; j < nums.length; j++) {
      const or = nums.slice(i, j + 1).reduce((a, b) => a | b, 0)
      if (or >= k) lengths.push(j - i + 1)
    }
  }
  return lengths.length ? Math.min(...lengths) : -1
}

test('3095 random arrays match a list-every-subarray oracle', () => {
  let seed = 3095
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(12) }, () => rnd(64))
    const k = 1 + rnd(64)
    assert.equal(solve(nums, k), oracle(nums, k), JSON.stringify({ nums, k }))
  }
})
