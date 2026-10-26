import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

const brute = nums => {
  const n = nums.length; let best = -1, bk = 0
  for (let k = 0; k < n; k++) {
    const rotated = [...nums.slice(k), ...nums.slice(0, k)]
    const sc = rotated.filter((v, i) => v <= i).length
    if (sc > best) { best = sc; bk = k }
  }
  return bk
}
test('official examples', () => {
  assert.equal(buildTrace([2, 3, 1, 4, 0]).result, 3)
  assert.equal(buildTrace([1, 3, 0, 2, 4]).result, 0)
})
test('matches brute-force rotation scoring', () => {
  for (let t = 0; t < 500; t++) {
    const n = 1 + Math.floor(Math.random() * 12)
    const nums = Array.from({ length: n }, () => Math.floor(Math.random() * n))
    const run = buildTrace(parseInput(JSON.stringify(nums)))
    assert.equal(run.result, brute(nums), JSON.stringify(nums))
    assert.equal(run.frames.at(-1).phase, 'done')
  }
})
test('invalid input rejected', () => {
  assert.throws(() => parseInput('[3,0,1]'))
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput('[-1]'))
})
