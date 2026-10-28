import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace({ nums }).result

// Independent oracle: list every pair x < y with different counts, sort the list, and take the first pair.
function oracle(nums) {
  const count = v => nums.filter(w => w === v).length
  const distinct = [...new Set(nums)]
  const pairs = []
  for (const x of distinct) for (const y of distinct) if (x < y && count(x) !== count(y)) pairs.push([x, y])
  pairs.sort((a, b) => a[0] - b[0] || a[1] - b[1])
  return pairs.length ? pairs[0] : [-1, -1]
}

test('3852 official examples', () => {
  assert.deepEqual(solve([1, 1, 2, 2, 3, 4]), [1, 3])
  assert.deepEqual(solve([1, 5]), [-1, -1])
  assert.deepEqual(solve([7]), [-1, -1])
})

test('3852 rejects a value above 100', () => {
  assert.throws(() => parseInput('{"nums":[101]}'))
})

test('3852 random arrays match the sorted-pairs oracle', () => {
  let seed = 3852
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(12) }, () => 1 + rnd(6))
    assert.deepEqual(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
