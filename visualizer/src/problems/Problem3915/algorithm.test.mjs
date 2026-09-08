import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code } from './algorithm.js'

function brute(nums, k) {
  let best = 0
  for (let mask = 1; mask < 2 ** nums.length; mask++) {
    let previous = -1, direction = 0, sum = 0, valid = true
    for (let i = 0; i < nums.length; i++) if (mask & (1 << i)) {
      if (previous >= 0) {
        const nextDirection = Math.sign(nums[i] - nums[previous])
        if (i - previous < k || !nextDirection || nextDirection === direction) { valid = false; break }
        direction = nextDirection
      }
      previous = i
      sum += nums[i]
    }
    if (valid) best = Math.max(best, sum)
  }
  return best
}

function checkWitness(run) {
  let sum = 0, direction = 0
  run.path.forEach((index, position) => {
    sum += run.input[index]
    if (position) {
      const previous = run.path[position - 1]
      assert.ok(index - previous >= run.k)
      const nextDirection = Math.sign(run.input[index] - run.input[previous])
      assert.notEqual(nextDirection, 0)
      assert.notEqual(nextDirection, direction)
      direction = nextDirection
    }
  })
  assert.equal(sum, run.result)
}

test('3915 official examples, equal values and distance boundaries', () => {
  for (const [nums, k, expected] of [[[5, 4, 2], 2, 7], [[3, 5, 4, 2, 4], 1, 14], [[5], 1, 5], [[5, 5, 5], 1, 5], [[2, 8, 1], 3, 8]]) {
    const run = buildTrace({ nums, k })
    assert.equal(run.result, expected)
    checkWitness(run)
  }
})

test('3915 exhaustive small inputs match enumeration of every subsequence', () => {
  for (let n = 1; n <= 6; n++) for (let encoded = 0; encoded < 3 ** n; encoded++) {
    const nums = Array.from({ length: n }, (_, i) => 1 + Math.floor(encoded / 3 ** i) % 3)
    for (let k = 1; k <= n; k++) {
      const run = buildTrace({ nums, k })
      assert.equal(run.result, brute(nums, k), `nums=${nums}, k=${k}`)
      checkWitness(run)
      for (const frame of run.frames) {
        assert.ok(code.some(line => line.line === frame.activeLine))
        if (['rise', 'fall'].includes(frame.phase)) {
          const dp = frame.phase === 'rise' ? run.down : run.up
          let best = 0
          for (let j = 0; j <= frame.eligible; j++) {
            if (frame.phase === 'rise' ? nums[j] < nums[frame.index] : nums[j] > nums[frame.index]) best = Math.max(best, dp[j])
          }
          assert.equal(frame.candidateScore, best)
          assert.equal(frame.score, nums[frame.index] + best)
          if (frame.candidate >= 0) assert.ok(frame.candidate <= frame.index - k)
        }
      }
    }
  }
})

test('3915 full constraint trace and sums beyond 32-bit range', () => {
  const nums = Array.from({ length: 100000 }, (_, i) => i % 2 ? 100000 : 99999)
  const run = buildTrace(parseInput(JSON.stringify({ nums, k: 1 })))
  assert.equal(run.result, 9999950000)
  assert.equal(run.path.length, nums.length)
  assert.equal(run.frames.length, 3 * nums.length + 2)
  checkWitness(run)
  const distant = buildTrace({ nums, k: nums.length })
  assert.equal(distant.result, 100000)
  assert.equal(distant.path.length, 1)
})

test('3915 validates all input bounds', () => {
  for (const input of [null, {}, { nums: [], k: 1 }, { nums: [1], k: 0 }, { nums: [1], k: 2 }, { nums: [1.5], k: 1 },
    { nums: [0], k: 1 }, { nums: [100001], k: 1 }, { nums: [1], k: 1.5 }, { nums: Array(100001).fill(1), k: 1 }]) {
    assert.throws(() => parseInput(JSON.stringify(input)))
  }
})
