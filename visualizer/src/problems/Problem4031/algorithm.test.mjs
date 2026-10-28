import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, lower, upper) => buildTrace({ nums, lower, upper }).result

test('4031 official examples', () => {
  assert.deepEqual(solve([3, 9, 7], 1, 12), [[1, 2], [4, 6], [8, 8], [10, 12]])
  assert.deepEqual(solve([1, 1], 5, 7), [[5, 7]])
  assert.deepEqual(solve([2, 3, 5], 2, 3), [])
})

test('4031 a missing run at the upper end is closed', () => {
  assert.deepEqual(solve([1], 1, 3), [[2, 3]])
})

test('4031 rejects lower above upper', () => {
  assert.throws(() => parseInput('{"nums":[1],"lower":5,"upper":3}'))
})

// Independent oracle: mark every value in range, then collect runs of unmarked values by comparing neighbours.
function oracle(nums, lower, upper) {
  const seen = new Set(nums)
  const missing = []
  for (let v = lower; v <= upper; v++) if (!seen.has(v)) missing.push(v)
  return missing.reduce((acc, v) => {
    const last = acc[acc.length - 1]
    if (last && last[1] + 1 === v) last[1] = v
    else acc.push([v, v])
    return acc
  }, [])
}

test('4031 random cases match a neighbour-merge oracle', () => {
  let seed = 4031
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const lower = 1 + rnd(20)
    const upper = lower + rnd(30)
    const nums = Array.from({ length: 1 + rnd(12) }, () => 1 + rnd(50))
    assert.deepEqual(solve(nums, lower, upper), oracle(nums, lower, upper), JSON.stringify({ nums, lower, upper }))
  }
})
