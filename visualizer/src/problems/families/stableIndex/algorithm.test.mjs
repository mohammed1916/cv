import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, valueAtStep } from './algorithm.js'

test('3903/3904 official examples and threshold equality', () => {
  for (const [nums, k, expected] of [[[5, 0, 1, 4], 3, 3], [[3, 2, 1], 1, -1], [[0], 0, 0], [[3, 1, 2], 2, 0]]) {
    const run = buildTrace({ nums, k })
    assert.equal(run.result, expected)
    if (expected >= 0) assert.equal(run.frames.filter(f => f.phase === 'check').length, expected + 1)
  }
})

test('3903/3904 exhaustive direct-range oracle, witness indices and frame visibility', () => {
  for (let n = 1; n <= 6; n++) for (let encoded = 0; encoded < 3 ** n; encoded++) {
    const nums = Array.from({ length: n }, (_, i) => Math.floor(encoded / 3 ** i) % 3)
    const scores = nums.map((_, i) => Math.max(...nums.slice(0, i + 1)) - Math.min(...nums.slice(i)))
    for (let k = 0; k <= 2; k++) {
      const run = buildTrace({ nums, k })
      assert.equal(run.result, scores.findIndex(v => v <= k))
      for (const frame of run.frames) {
        if (frame.phase === 'check') {
          assert.equal(frame.score, scores[frame.index])
          assert.equal(nums[frame.maxIndex], Math.max(...nums.slice(0, frame.index + 1)))
          assert.equal(nums[frame.minIndex], Math.min(...nums.slice(frame.index)))
          assert.ok(frame.maxIndex <= frame.index && frame.minIndex >= frame.index)
        }
        for (let i = 0; i < n; i++) {
          assert.equal(valueAtStep(run, frame, i, 'scores'), i <= frame.checked ? scores[i] : '?')
          assert.equal(valueAtStep(run, frame, i, 'suffix'), frame.phase === 'start' || frame.phase === 'suffix' && i < frame.index ? '?' : Math.min(...nums.slice(i)))
        }
      }
    }
  }
})

test('3903/3904 variant bounds and full-length late success', () => {
  const nums = Array(100000).fill(0)
  nums[0] = nums[99999] = 1000000000
  const text = JSON.stringify({ nums, k: 0 })
  assert.throws(() => parseInput(text, 100))
  const run = buildTrace(parseInput(text))
  assert.equal(run.result, 99999)
  assert.equal(run.frames.length, 200002)
  assert.equal(run.scores[99998], 1000000000)
  assert.equal(run.scores[99999], 0)
  assert.equal(parseInput(JSON.stringify({ nums: Array(100).fill(0), k: 0 }), 100).nums.length, 100)
  assert.throws(() => parseInput(JSON.stringify({ nums: Array(101).fill(0), k: 0 }), 100))
  for (const data of [null, {}, { nums: [], k: 0 }, { nums: [0], k: -1 }, { nums: [-1], k: 0 }, { nums: [1.5], k: 0 }, { nums: [0], k: 1.5 }, { nums: [1000000001], k: 0 }, { nums: [0], k: 1000000001 }]) assert.throws(() => parseInput(JSON.stringify(data)))
})
