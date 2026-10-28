import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('2926 official examples', () => {
  assert.equal(solve([3, 3, 5, 6]), 14)
  assert.equal(solve([5, -1, -3, 8]), 13)
  assert.equal(solve([-2, -1]), -1)
})

test('2926 rejects a value outside the visual range', () => {
  assert.throws(() => parseInput('[11]'))
  assert.throws(() => parseInput('[]'))
})

// Independent oracle: enumerate every non-empty subsequence and check the balance rule for consecutive picks.
function oracle(nums) {
  const n = nums.length
  let best = -Infinity
  for (let mask = 1; mask < 1 << n; mask++) {
    const picks = []
    for (let i = 0; i < n; i++) if ((mask >> i) & 1) picks.push(i)
    let balanced = true
    for (let k = 1; k < picks.length; k++) {
      const a = picks[k - 1]
      const b = picks[k]
      if (nums[b] - nums[a] < b - a) balanced = false
    }
    if (balanced) best = Math.max(best, picks.reduce((sum, i) => sum + nums[i], 0))
  }
  return best
}

test('2926 random arrays match a subset oracle', () => {
  let seed = 2926
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(8) }, () => rnd(21) - 10)
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
