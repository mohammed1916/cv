import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (nums, costs) => buildTrace({ nums, costs }).result

// Brute force straight from the two jump rules, O(n^2) relaxation over all pairs i < j.
function oracle(nums, costs) {
  const n = nums.length
  const dp = Array(n).fill(Infinity)
  dp[0] = 0
  for (let j = 1; j < n; j++) {
    for (let i = 0; i < j; i++) {
      let ok = false
      if (nums[i] <= nums[j]) {
        ok = true
        for (let k = i + 1; k < j; k++) if (!(nums[k] < nums[i])) { ok = false; break }
      } else {
        ok = true
        for (let k = i + 1; k < j; k++) if (!(nums[k] >= nums[i])) { ok = false; break }
      }
      if (ok && dp[i] + costs[j] < dp[j]) dp[j] = dp[i] + costs[j]
    }
  }
  return dp[n - 1]
}

test('2297 hand-checked small arrays', () => {
  assert.equal(solve([3, 1, 4, 1, 5], [2, 9, 1, 4, 6]), 7)
  assert.equal(solve([5, 9], [4, 2]), 2)
  assert.equal(solve([5, 1], [4, 2]), 2)
})

test('2297 the starting cost is not paid and a single jump costs the last cost', () => {
  assert.equal(solve([1, 2], [100, 7]), 7)
  assert.equal(solve([2, 2], [100, 0]), 0)
})

test('2297 equal values block a skip, so each step must be taken', () => {
  assert.equal(solve([4, 4, 4], [0, 5, 6]), 11)
})

test('2297 random arrays match the O(n^2) rule oracle', () => {
  let seed = 2297
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 400; t++) {
    const n = 2 + rnd(9)
    const nums = Array.from({ length: n }, () => rnd(6))
    const costs = Array.from({ length: n }, () => rnd(10))
    assert.equal(solve(nums, costs), oracle(nums, costs), JSON.stringify({ nums, costs }))
  }
})

test('2297 parse rejects mismatched or out-of-range lists', () => {
  assert.throws(() => parseInput('{"nums":[1,2],"costs":[1]}'))
  assert.throws(() => parseInput('{"nums":[1],"costs":[1]}'))
  assert.throws(() => parseInput('{"nums":[1,-2],"costs":[1,1]}'))
  assert.throws(() => parseInput('[1,2]'))
})

test('2297 frame invariants', () => {
  const run = buildTrace({ nums: [2, 7, 1, 8], costs: [3, 1, 4, 0] })
  const pyLines = python.split('\n').length
  assert.equal(run.frames[0].phase, 'start')
  assert.equal(run.frames.at(-1).phase, 'done')
  for (const frame of run.frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length, `activeLine ${frame.activeLine}`)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyLines, `pythonLine ${frame.pythonLine}`)
    assert.equal(frame.dp.length, 4)
  }
  assert.equal(run.frames.at(-1).dp.at(-1), run.result)
})
