import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(parseInput(JSON.stringify({ nums }))).result

test('2826 hand-checked examples', () => {
  // Keep 1, 2 (or 1, 3, or 2, 2): at most two values survive in order, so delete 3.
  assert.equal(solve([2, 1, 3, 2, 1]), 3)
  // Keep 1, 1, 3, 3 and delete 2 values.
  assert.equal(solve([1, 3, 2, 1, 3, 3]), 2)
  assert.equal(solve([1, 1, 1]), 0)
})

test('2826 rejects values other than 1, 2 and 3', () => {
  assert.throws(() => parseInput('{"nums":[1,4]}'))
  assert.throws(() => parseInput('{"nums":[]}'))
})

// Independent oracle: try every subset of kept positions and keep the largest non-decreasing one.
function oracle(nums) {
  const n = nums.length
  let kept = 0
  for (let mask = 0; mask < 1 << n; mask++) {
    const seq = nums.filter((_, i) => mask & (1 << i))
    if (seq.every((v, i) => i === 0 || seq[i - 1] <= v)) kept = Math.max(kept, seq.length)
  }
  return n - kept
}

test('2826 random cases match the subset oracle', () => {
  let seed = 2826
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = rnd(10) + 1
    const nums = Array.from({ length: n }, () => rnd(3) + 1)
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
