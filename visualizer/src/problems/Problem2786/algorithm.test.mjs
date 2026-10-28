import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, x) => buildTrace(parseInput(JSON.stringify({ nums, x }))).result

test('2786 hand-checked examples', () => {
  // Visit 2, 6, 1, 9 (positions 0, 2, 3, 4): 18 minus one parity penalty of 5 gives 13.
  assert.equal(solve([2, 3, 6, 1, 9, 2], 5), 13)
  // All values are even, so there are no penalties.
  assert.equal(solve([2, 4, 6], 1), 12)
  assert.equal(solve([7], 3), 7)
})

test('2786 rejects values outside 1 to 20', () => {
  assert.throws(() => parseInput('{"nums":[],"x":2}'))
  assert.throws(() => parseInput('{"nums":[1,21],"x":2}'))
  assert.throws(() => parseInput('{"nums":[1,2],"x":0}'))
})

// Independent oracle: try every set of visited positions that starts at 0, scoring each path directly.
function oracle(nums, x) {
  const n = nums.length
  let best = -Infinity
  for (let mask = 0; mask < 1 << (n - 1); mask++) {
    const path = [0]
    for (let i = 1; i < n; i++) if (mask & (1 << (i - 1))) path.push(i)
    let score = nums[0]
    for (let t = 1; t < path.length; t++) {
      const a = nums[path[t - 1]]
      const b = nums[path[t]]
      score += b - ((a - b) % 2 !== 0 ? x : 0)
    }
    best = Math.max(best, score)
  }
  return best
}

test('2786 random cases match the path oracle', () => {
  let seed = 2786
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = rnd(9) + 1
    const nums = Array.from({ length: n }, () => rnd(20) + 1)
    const x = rnd(20) + 1
    assert.equal(solve(nums, x), oracle(nums, x), JSON.stringify({ nums, x }))
  }
})
