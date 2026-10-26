import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

function brute(nums) {
  const n = nums.length, total = nums.reduce((a, b) => a + b, 0)
  for (let m = 1; m < (1 << n) - 1; m++) {
    let k = 0, s = 0
    for (let i = 0; i < n; i++) if (m >> i & 1) { k++; s += nums[i] }
    if (s * (n - k) === (total - s) * k) return true
  }
  return false
}
test('official examples', () => {
  assert.equal(buildTrace(parseInput('[1,2,3,4,5,6,7,8]')).result, true)
  assert.equal(buildTrace(parseInput('[3,1]')).result, false)
})
test('random arrays match subset brute force', () => {
  let seed = 11
  const rnd = m => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) % m
  for (let t = 0; t < 500; t++) {
    const n = 1 + rnd(11)
    const a = Array.from({ length: n }, () => rnd(12))
    const r = buildTrace(a)
    assert.equal(r.result, brute(a), JSON.stringify(a))
    assert.equal(r.frames[0].phase, 'start')
    assert.equal(r.frames.at(-1).phase, 'done')
  }
})
test('rejects bad input', () => {
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput('[1,-2]'))
  assert.throws(() => parseInput('{}'))
})
