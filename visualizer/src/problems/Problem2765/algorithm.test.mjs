import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(parseInput(JSON.stringify({ nums }))).result

test('2765 hand-checked examples', () => {
  // The run 3,4,3,4 rises and falls by 1 each step.
  assert.equal(solve([2, 3, 4, 3, 4]), 4)
  assert.equal(solve([4, 5, 6]), 2)
  // No pair rises by exactly 1 in order, so the answer is -1.
  assert.equal(solve([9, 8, 7]), -1)
})

test('2765 rejects arrays shorter than 2 or values outside 1 to 20', () => {
  assert.throws(() => parseInput('{"nums":[5]}'))
  assert.throws(() => parseInput('{"nums":[1,21]}'))
})

// Independent oracle: test every subarray directly for the rise-then-alternate pattern.
function isAlternating(seq) {
  if (seq.length < 2 || seq[1] - seq[0] !== 1) return false
  for (let i = 2; i < seq.length; i++) {
    const want = i % 2 === 1 ? 1 : -1
    if (seq[i] - seq[i - 1] !== want) return false
  }
  return true
}

function oracle(nums) {
  let best = -1
  for (let l = 0; l < nums.length; l++) {
    for (let r = l + 1; r < nums.length; r++) {
      if (isAlternating(nums.slice(l, r + 1))) best = Math.max(best, r - l + 1)
    }
  }
  return best
}

test('2765 random cases match the subarray oracle', () => {
  let seed = 2765
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = rnd(11) + 2
    const nums = Array.from({ length: n }, () => rnd(6) + 1)
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
