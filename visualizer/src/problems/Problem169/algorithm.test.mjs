import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases } from './algorithm.js'

function majorityOracle(nums) {
  const counts = new Map()
  for (const v of nums) counts.set(v, (counts.get(v) ?? 0) + 1)
  for (const [v, c] of counts) if (c > nums.length / 2) return v
  return null
}

test('169 sample arrays return their majority values', () => {
  assert.equal(buildTrace([5, 1, 5, 5, 2, 5, 5]).result, 5)
  assert.equal(buildTrace([7, 7, 3, 3, 7]).result, 7)
  assert.equal(buildTrace([-4, -4, 9, -4]).result, -4)
})

test('169 random arrays with a guaranteed majority match the counting oracle', () => {
  let seed = 21
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  for (let t = 0; t < 200; t++) {
    const n = 1 + rnd(20)
    const major = rnd(7) - 3
    const extra = Math.floor(n / 2) + 1
    const nums = Array.from({ length: n }, (_, i) => (i < extra ? major : rnd(9) - 4))
    for (let i = nums.length - 1; i > 0; i--) { const j = rnd(i + 1); [nums[i], nums[j]] = [nums[j], nums[i]] }
    const expected = majorityOracle(nums)
    assert.notEqual(expected, null)
    assert.equal(buildTrace(nums).result, expected, JSON.stringify(nums))
  }
})

test('169 rejects arrays without a majority and malformed input', () => {
  assert.throws(() => parseInput('[1,2,3,4]'), /more than half/)
  assert.throws(() => parseInput('[]'), /1 to 30/)
  assert.throws(() => parseInput('[1.5]'), /1 to 30/)
})

test('169 frames use declared phases and carry line numbers', () => {
  const ids = new Set(phases.map(p => p.id))
  for (const frame of buildTrace([3, 3, 1, 3]).frames) {
    assert.ok(ids.has(frame.phase))
    assert.ok(frame.activeLine >= 1 && frame.pythonLine >= 1)
  }
})
