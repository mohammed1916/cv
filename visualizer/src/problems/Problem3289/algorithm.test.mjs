import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(parseInput(JSON.stringify({ nums }))).result

test('3289 official-style examples', () => {
  assert.deepEqual(solve([0, 1, 1, 0]), [0, 1])
  assert.deepEqual(solve([0, 3, 2, 1, 3, 2]), [2, 3])
  assert.deepEqual(solve([7, 1, 5, 4, 3, 4, 6, 0, 9, 5, 8, 2]), [4, 5])
})

test('3289 the two duplicates may be adjacent or far apart', () => {
  assert.deepEqual(solve([1, 1, 0, 2, 3, 3]), [1, 3])
})

test('3289 rejects a triple or a missing value', () => {
  assert.throws(() => parseInput(JSON.stringify({ nums: [0, 0, 0, 1, 2] })))
  assert.throws(() => parseInput(JSON.stringify({ nums: [0, 1, 1, 5] })))
})

// Independent oracle: count occurrences in a Map and keep the values whose count is two.
function oracle(nums) {
  const counts = new Map()
  for (const v of nums) counts.set(v, (counts.get(v) ?? 0) + 1)
  return [...counts.entries()].filter(([, c]) => c === 2).map(([v]) => v).sort((a, b) => a - b)
}

test('3289 random valid lists match a counting oracle', () => {
  let seed = 3289
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 2 + rnd(12)
    const nums = Array.from({ length: n }, (_, i) => i)
    const a = rnd(n)
    let b = rnd(n)
    while (b === a) b = rnd(n)
    nums.push(a, b)
    for (let i = nums.length - 1; i > 0; i--) {
      const j = rnd(i + 1)
      ;[nums[i], nums[j]] = [nums[j], nums[i]]
    }
    assert.deepEqual(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
