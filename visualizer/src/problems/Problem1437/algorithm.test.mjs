import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

// Independent oracle: compare every pair of consecutive 1s directly.
function oracle(nums, k) {
  const ones = nums.flatMap((x, i) => (x === 1 ? [i] : []))
  return ones.every((p, j) => j === 0 || p - ones[j - 1] - 1 >= k)
}

test('sample with wide gaps is true', () => {
  assert.equal(buildTrace({ nums: [1, 0, 0, 0, 1, 0, 0, 1], k: 2 }).result, true)
})

test('two 1s separated by a single zero is false for k = 2', () => {
  assert.equal(buildTrace({ nums: [1, 0, 1], k: 2 }).result, false)
})

test('adjacent 1s fail whenever k is positive', () => {
  assert.equal(buildTrace({ nums: [0, 1, 1, 0], k: 1 }).result, false)
})

test('k = 0 accepts any arrangement', () => {
  assert.equal(buildTrace({ nums: [1, 1, 1], k: 0 }).result, true)
})

test('no 1s or a single 1 is always true', () => {
  assert.equal(buildTrace({ nums: [0, 0, 0], k: 5 }).result, true)
  assert.equal(buildTrace({ nums: [0, 1, 0], k: 5 }).result, true)
})

test('exhaustive check of short arrays against the oracle', () => {
  for (let len = 1; len <= 8; len++) {
    for (let mask = 0; mask < 1 << len; mask++) {
      const nums = Array.from({ length: len }, (_, i) => (mask >> i) & 1)
      for (let k = 0; k <= 4; k++) {
        assert.equal(buildTrace({ nums, k }).result, oracle(nums, k), `${nums} k=${k}`)
      }
    }
  }
})

test('frames use declared phases and existing code lines', () => {
  const ids = new Set(phases.map(p => p.id))
  for (const frame of buildTrace({ nums: [1, 0, 1, 0, 0, 1], k: 2 }).frames) {
    assert.ok(ids.has(frame.phase))
    assert.ok(code.some(l => l.line === frame.activeLine))
  }
  assert.equal(code.length, python.split('\n').length)
})

test('parseInput validates the object shape and values', () => {
  assert.deepEqual(parseInput('{"nums":[1,0,1],"k":2}'), { nums: [1, 0, 1], k: 2 })
  assert.throws(() => parseInput('[1,0,1]'), /object/)
  assert.throws(() => parseInput('{"nums":[1,2],"k":1}'), /0 or 1/)
})
