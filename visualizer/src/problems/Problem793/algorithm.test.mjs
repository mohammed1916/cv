import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

// Oracle: cumulative count of factors of 5 over each integer (no closed-form zero-count formula).
const brute = k => {
  let total = 0, count = 0
  for (let x = 0; x <= 5 * (k + 2); x++) {
    if (x > 0) { let m = x; while (m % 5 === 0) { total++; m /= 5 } }
    if (total === k) count++
  }
  return count
}
test('official examples', () => {
  assert.equal(buildTrace(0).result, 5)
  assert.equal(buildTrace(5).result, 0)
  assert.equal(buildTrace(3).result, 5)
})
test('matches cumulative factor counting for k up to 400', () => {
  for (let k = 0; k <= 400; k++) assert.equal(buildTrace(k).result, brute(k), `k=${k}`)
})
test('large k terminates with done frame; invalid rejected', () => {
  const run = buildTrace(1000000000)
  assert.equal(run.frames.at(-1).phase, 'done')
  assert.ok(run.frames.length < 200)
  assert.throws(() => parseInput('-1'))
  assert.throws(() => parseInput('1.5'))
  assert.throws(() => parseInput('2000000000'))
})
