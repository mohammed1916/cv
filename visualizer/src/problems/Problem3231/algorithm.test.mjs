import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = nums => buildTrace(nums).result

test('3231 presets and edge cases', () => {
  assert.equal(solve([4, 2, 5, 1, 3]), 3)
  assert.equal(solve([9, 7, 5, 3]), 4)
  assert.equal(solve([1, 2, 3, 4]), 1)
  assert.equal(solve([7]), 1)
  assert.equal(solve([2, 2]), 2)
})

test('3231 rejects bad input', () => {
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput('[100]'))
  assert.throws(() => parseInput('{"a":1}'))
})

// Dilworth: the fewest strictly increasing groups equals the longest non-increasing subsequence.
function longestNonIncreasing(nums) {
  const dp = nums.map(() => 1)
  for (let j = 0; j < nums.length; j++) for (let i = 0; i < j; i++) if (nums[i] >= nums[j]) dp[j] = Math.max(dp[j], dp[i] + 1)
  return Math.max(0, ...dp)
}

// Exhaustive oracle for tiny arrays: try every assignment of elements to groups.
function bruteGroups(nums) {
  const n = nums.length
  let best = n
  const groups = Array(n).fill(0)
  const check = () => {
    const count = Math.max(...groups) + 1
    for (let g = 0; g < count; g++) {
      let last = -Infinity
      for (let i = 0; i < n; i++) {
        if (groups[i] !== g) continue
        if (nums[i] <= last) return false
        last = nums[i]
      }
    }
    best = Math.min(best, count)
    return true
  }
  const rec = i => {
    if (i === n) { check(); return }
    for (let g = 0; g <= i; g++) { groups[i] = g; rec(i + 1) }
  }
  rec(0)
  return best
}

test('3231 random arrays match Dilworth and the exhaustive grouping', () => {
  let seed = 3231
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(12) }, () => rnd(100))
    assert.equal(solve(nums), longestNonIncreasing(nums), JSON.stringify(nums))
  }
  for (let t = 0; t < 120; t++) {
    const nums = Array.from({ length: 1 + rnd(6) }, () => rnd(5))
    assert.equal(solve(nums), bruteGroups(nums), JSON.stringify(nums))
  }
})

test('3231 frames stay inside the pseudocode and Python listings', () => {
  const pyLines = python.split('\n').length
  const run = buildTrace([4, 2, 5, 1, 3])
  for (const f of run.frames) {
    assert.ok(f.activeLine >= 1 && f.activeLine <= code.length)
    assert.ok(f.pythonLine >= 1 && f.pythonLine <= pyLines)
  }
  assert.equal(run.frames.at(-1).piles.length, run.result)
})
